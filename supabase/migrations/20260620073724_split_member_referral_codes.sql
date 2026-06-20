create or replace function private.generate_member_referral_code(profile_id uuid)
returns text
language sql
immutable
set search_path = ''
as $$
  select 'EG' || upper(substr(replace(profile_id::text, '-', ''), 1, 10));
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'referral_code'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'signup_referral_code'
  )
  then
    alter table public.profiles
      rename column referral_code to signup_referral_code;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'signup_referral_code'
  )
  then
    alter table public.profiles
      add column signup_referral_code text;
  end if;
end $$;

alter table public.profiles
  add column if not exists member_referral_code text;

update public.profiles
set signup_referral_code = 'EG000'
where signup_referral_code is null
   or length(btrim(signup_referral_code)) = 0;

update public.profiles
set member_referral_code = private.generate_member_referral_code(id)
where member_referral_code is null
   or length(btrim(member_referral_code)) = 0;

alter table public.profiles
  alter column signup_referral_code set default 'EG000',
  alter column signup_referral_code set not null,
  alter column member_referral_code set not null;

alter table public.profiles
  drop constraint if exists profiles_referral_code_not_blank,
  drop constraint if exists profiles_signup_referral_code_not_blank,
  drop constraint if exists profiles_member_referral_code_not_blank;

alter table public.profiles
  add constraint profiles_signup_referral_code_not_blank
    check (length(btrim(signup_referral_code)) > 0),
  add constraint profiles_member_referral_code_not_blank
    check (length(btrim(member_referral_code)) > 0);

create unique index if not exists profiles_member_referral_code_key
  on public.profiles (member_referral_code);

comment on column public.profiles.signup_referral_code is
  'Referral/source code used when this member signed up. EG000 is the root signup source.';

comment on column public.profiles.member_referral_code is
  'Unique referral code generated for this member to share with future applicants.';

create or replace function private.set_elite_member_referral_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.signup_referral_code := coalesce(
    nullif(btrim(new.signup_referral_code), ''),
    'EG000'
  );

  new.member_referral_code := coalesce(
    nullif(upper(btrim(new.member_referral_code)), ''),
    private.generate_member_referral_code(new.id)
  );

  return new;
end;
$$;

drop trigger if exists profiles_set_member_referral_code on public.profiles;
create trigger profiles_set_member_referral_code
  before insert on public.profiles
  for each row
  execute function private.set_elite_member_referral_code();

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
      nullif(btrim(new.raw_user_meta_data ->> 'signup_referral_code'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'referral_code'), ''),
      'EG000'
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
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referrals'
      and column_name = 'referral_code'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referrals'
      and column_name = 'signup_referral_code'
  )
  then
    alter table public.referrals
      rename column referral_code to signup_referral_code;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'referrals'
      and column_name = 'signup_referral_code'
  )
  then
    alter table public.referrals
      add column signup_referral_code text;
  end if;
end $$;

update public.referrals
set signup_referral_code = 'EG000'
where signup_referral_code is null
   or length(btrim(signup_referral_code)) = 0;

alter table public.referrals
  alter column signup_referral_code set not null;

alter table public.referrals
  drop constraint if exists referrals_referral_code_not_blank,
  drop constraint if exists referrals_signup_referral_code_not_blank;

alter table public.referrals
  add constraint referrals_signup_referral_code_not_blank
    check (length(btrim(signup_referral_code)) > 0);

insert into public.referrals (referred_user_id, signup_referral_code)
select id, signup_referral_code
from public.profiles
on conflict (referred_user_id) do nothing;

comment on column public.referrals.signup_referral_code is
  'Referral/source code used by the referred member at signup time.';

create or replace function private.handle_elite_profile_referral()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.referrals (referred_user_id, signup_referral_code)
  values (new.id, new.signup_referral_code)
  on conflict (referred_user_id) do nothing;

  return new;
end;
$$;
