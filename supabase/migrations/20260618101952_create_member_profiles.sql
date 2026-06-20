create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  nickname text not null,
  nationality text not null,
  phone_country text not null,
  phone text not null,
  referral_code text not null,
  avatar_url text,
  signup_provider text not null default 'email',
  status text not null default 'pending_email_confirmation',
  email_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_signup_provider_check
    check (signup_provider in ('email', 'google')),
  constraint profiles_status_check
    check (status in ('pending_email_confirmation', 'active')),
  constraint profiles_referral_code_not_blank
    check (length(btrim(referral_code)) > 0)
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referred_user_id uuid not null unique references public.profiles(id) on delete cascade,
  referral_code text not null,
  created_at timestamptz not null default now(),
  constraint referrals_referral_code_not_blank
    check (length(btrim(referral_code)) > 0)
);

create or replace function private.is_current_user_email_confirmed()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users
    where id = auth.uid()
      and email_confirmed_at is not null
  );
$$;

create or replace function private.touch_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row
  execute function private.touch_profile_updated_at();

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
    referral_code,
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
    coalesce(new.raw_user_meta_data ->> 'referral_code', 'EG000'),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    'email',
    profile_status,
    new.email_confirmed_at
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_elite_auth_user_created on auth.users;
create trigger on_elite_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_elite_profile_from_auth_metadata();

create or replace function private.activate_elite_profile_after_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null
    and (old.email_confirmed_at is null or old.email_confirmed_at <> new.email_confirmed_at)
  then
    update public.profiles
    set
      status = 'active',
      email_confirmed_at = new.email_confirmed_at,
      updated_at = now()
    where id = new.id
      and status = 'pending_email_confirmation';
  end if;

  return new;
end;
$$;

drop trigger if exists on_elite_auth_user_email_confirmed on auth.users;
create trigger on_elite_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row
  execute function private.activate_elite_profile_after_email_confirmation();

create or replace function private.handle_elite_profile_referral()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.referrals (referred_user_id, referral_code)
  values (new.id, new.referral_code)
  on conflict (referred_user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_elite_profile_created_referral on public.profiles;
create trigger on_elite_profile_created_referral
  after insert on public.profiles
  for each row
  execute function private.handle_elite_profile_referral();

alter table public.profiles enable row level security;
alter table public.referrals enable row level security;

drop policy if exists "Members can read own profile" on public.profiles;
create policy "Members can read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Members can create own confirmed profile" on public.profiles;
create policy "Members can create own confirmed profile"
  on public.profiles
  for insert
  to authenticated
  with check (
    id = auth.uid()
    and (
      status = 'pending_email_confirmation'
      or (
        status = 'active'
        and private.is_current_user_email_confirmed()
      )
    )
  );

drop policy if exists "Members can read own referral" on public.referrals;
create policy "Members can read own referral"
  on public.referrals
  for select
  to authenticated
  using (referred_user_id = auth.uid());

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.referrals from anon, authenticated;

grant usage on schema public to authenticated;
grant select, insert on table public.profiles to authenticated;
grant select on table public.referrals to authenticated;
