create sequence if not exists private.member_access_code_sequence
  as bigint
  increment by 1
  minvalue 0
  start with 0
  no cycle;

create or replace function private.format_elite_access_code(code_number bigint)
returns text
language sql
immutable
set search_path = ''
as $$
  select 'EG' || lpad(greatest(code_number, 0)::text, 3, '0');
$$;

alter table public.profiles
  add column if not exists signup_access_code text,
  add column if not exists member_access_code text;

update public.profiles
set signup_access_code = coalesce(
  nullif(upper(btrim(signup_access_code)), ''),
  nullif(upper(btrim(signup_referral_code)), ''),
  'EG000'
);

with ordered_profiles as (
  select
    id,
    row_number() over (order by created_at, id) - 1 as code_number
  from public.profiles
)
update public.profiles as profiles
set
  member_access_code = private.format_elite_access_code(ordered_profiles.code_number),
  member_referral_code = private.format_elite_access_code(ordered_profiles.code_number)
from ordered_profiles
where profiles.id = ordered_profiles.id;

alter table public.profiles
  alter column signup_access_code set not null,
  alter column member_access_code set not null;

alter table public.profiles
  drop constraint if exists profiles_signup_access_code_not_blank,
  drop constraint if exists profiles_member_access_code_not_blank;

alter table public.profiles
  add constraint profiles_signup_access_code_not_blank
    check (length(btrim(signup_access_code)) > 0),
  add constraint profiles_member_access_code_not_blank
    check (length(btrim(member_access_code)) > 0);

create unique index if not exists profiles_member_access_code_key
  on public.profiles (member_access_code);

comment on column public.profiles.signup_access_code is
  'Access Code used when this member signed up. The first/root member is bootstrapped with EG000.';

comment on column public.profiles.member_access_code is
  'Unique member Access Code generated sequentially as EG000, EG001, EG002, and onward.';

select setval(
  'private.member_access_code_sequence'::regclass,
  (select count(*) from public.profiles),
  false
);

create or replace function private.next_elite_member_access_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate text;
begin
  loop
    candidate := private.format_elite_access_code(nextval('private.member_access_code_sequence'::regclass));

    exit when not exists (
      select 1
      from public.profiles
      where member_access_code = candidate
    );
  end loop;

  return candidate;
end;
$$;

create or replace function private.resolve_elite_access_code(input_code text)
returns table(status text, resolved_access_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_code text := upper(btrim(coalesce(input_code, '')));
  profile_count bigint;
begin
  select count(*) into profile_count
  from public.profiles;

  if profile_count = 0 then
    return query select 'bootstrap'::text, 'EG000'::text;
    return;
  end if;

  if normalized_code = '' then
    return query select 'missing'::text, null::text;
    return;
  end if;

  if exists (
    select 1
    from public.profiles
    where member_access_code = normalized_code
  ) then
    return query select 'valid'::text, normalized_code;
    return;
  end if;

  return query select 'invalid'::text, null::text;
end;
$$;

create or replace function public.resolve_elite_access_code(input_code text)
returns table(status text, resolved_access_code text)
language sql
set search_path = ''
as $$
  select *
  from private.resolve_elite_access_code(input_code);
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.resolve_elite_access_code(text) to anon, authenticated;
grant execute on function public.resolve_elite_access_code(text) to anon, authenticated;

create or replace function private.set_elite_member_access_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_count bigint;
begin
  perform pg_advisory_xact_lock(hashtext('elite_member_access_code'));

  new.signup_access_code := upper(btrim(coalesce(
    new.signup_access_code,
    new.signup_referral_code,
    ''
  )));

  select count(*) into profile_count
  from public.profiles;

  if profile_count = 0 then
    new.signup_access_code := 'EG000';
  elsif new.signup_access_code = '' then
    raise exception 'missing_access_code'
      using errcode = '23514';
  elsif not exists (
    select 1
    from public.profiles
    where member_access_code = new.signup_access_code
  ) then
    raise exception 'invalid_access_code'
      using errcode = '23514';
  end if;

  new.member_access_code := coalesce(
    nullif(upper(btrim(new.member_access_code)), ''),
    private.next_elite_member_access_code()
  );

  new.signup_referral_code := new.signup_access_code;
  new.member_referral_code := new.member_access_code;

  return new;
end;
$$;

drop trigger if exists profiles_set_member_referral_code on public.profiles;
drop trigger if exists profiles_set_member_access_code on public.profiles;
create trigger profiles_set_member_access_code
  before insert on public.profiles
  for each row
  execute function private.set_elite_member_access_code();

create or replace function private.handle_elite_profile_from_auth_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_status text := 'pending_email_confirmation';
begin
  if coalesce(new.raw_user_meta_data ->> 'elite_signup_complete', '') <> 'true' then
    return new;
  end if;

  if new.email_confirmed_at is not null then
    profile_status := 'active';
  end if;

  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    nickname,
    nationality,
    phone_country,
    phone,
    signup_access_code,
    signup_referral_code,
    avatar_url,
    signup_provider,
    status,
    email_confirmed_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'nickname', ''),
    coalesce(new.raw_user_meta_data ->> 'nationality', ''),
    coalesce(new.raw_user_meta_data ->> 'phone_country', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'signup_access_code'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'access_code'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'signup_referral_code'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'referral_code'), '')
    ),
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'signup_access_code'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'access_code'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'signup_referral_code'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'referral_code'), '')
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    'email',
    profile_status,
    new.email_confirmed_at
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

do $$
begin
  if to_regclass('public.referrals') is not null
    and to_regclass('public.access_attributions') is null
  then
    alter table public.referrals
      rename to access_attributions;
  end if;
end $$;

create table if not exists public.access_attributions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.profiles(id) on delete cascade,
  signup_access_code text not null,
  created_at timestamptz not null default now(),
  constraint access_attributions_signup_access_code_not_blank
    check (length(btrim(signup_access_code)) > 0)
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'access_attributions'
      and column_name = 'referred_user_id'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'access_attributions'
      and column_name = 'member_id'
  )
  then
    alter table public.access_attributions
      rename column referred_user_id to member_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'access_attributions'
      and column_name = 'signup_referral_code'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'access_attributions'
      and column_name = 'signup_access_code'
  )
  then
    alter table public.access_attributions
      rename column signup_referral_code to signup_access_code;
  end if;
end $$;

update public.access_attributions
set signup_access_code = coalesce(
  nullif(upper(btrim(signup_access_code)), ''),
  'EG000'
);

alter table public.access_attributions
  alter column signup_access_code set not null;

alter table public.access_attributions
  drop constraint if exists referrals_signup_referral_code_not_blank,
  drop constraint if exists referrals_signup_access_code_not_blank,
  drop constraint if exists access_attributions_signup_access_code_not_blank;

alter table public.access_attributions
  add constraint access_attributions_signup_access_code_not_blank
    check (length(btrim(signup_access_code)) > 0);

insert into public.access_attributions (member_id, signup_access_code)
select id, signup_access_code
from public.profiles
on conflict (member_id) do nothing;

alter table public.access_attributions enable row level security;

drop policy if exists "Members can read own referral" on public.access_attributions;
drop policy if exists "Members can read own access attribution" on public.access_attributions;
create policy "Members can read own access attribution"
  on public.access_attributions
  for select
  to authenticated
  using (member_id = (select auth.uid()));

grant select on table public.access_attributions to authenticated;

comment on table public.access_attributions is
  'Tracks which Access Code was used when each member account was created.';

comment on column public.access_attributions.signup_access_code is
  'Access Code used by the member at signup time.';

create or replace function private.handle_elite_profile_access_attribution()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.access_attributions (
    member_id,
    signup_access_code
  )
  values (
    new.id,
    new.signup_access_code
  )
  on conflict (member_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_elite_profile_created_referral on public.profiles;
drop trigger if exists on_elite_profile_created_access_attribution on public.profiles;
create trigger on_elite_profile_created_access_attribution
  after insert on public.profiles
  for each row
  execute function private.handle_elite_profile_access_attribution();
