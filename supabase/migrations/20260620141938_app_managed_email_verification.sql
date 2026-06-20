create schema if not exists private;

create table if not exists private.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint email_verification_tokens_hash_format
    check (token_hash ~ '^[a-f0-9]{64}$'),
  constraint email_verification_tokens_expiry_after_create
    check (expires_at > created_at)
);

create index if not exists email_verification_tokens_user_active_idx
  on private.email_verification_tokens (user_id, created_at desc)
  where used_at is null;

create index if not exists email_verification_tokens_active_expiry_idx
  on private.email_verification_tokens (expires_at)
  where used_at is null;

revoke all on table private.email_verification_tokens from anon, authenticated;

create or replace function private.is_current_user_google_confirmed()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as users
    where users.id = auth.uid()
      and users.email_confirmed_at is not null
      and exists (
        select 1
        from auth.identities as identities
        where identities.user_id = users.id
          and identities.provider = 'google'
      )
  );
$$;

create or replace function private.handle_elite_profile_from_auth_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'elite_signup_complete', '') <> 'true' then
    return new;
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
    'pending_email_confirmation',
    null
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_elite_auth_user_email_confirmed on auth.users;

create or replace function private.activate_elite_profile_after_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  return new;
end;
$$;

drop policy if exists "Members can create own confirmed profile" on public.profiles;
create policy "Members can create own confirmed profile"
  on public.profiles
  for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and (
      status = 'pending_email_confirmation'
      or (
        status = 'active'
        and signup_provider = 'google'
        and private.is_current_user_google_confirmed()
      )
    )
  );

create or replace function public.create_elite_email_verification_token(
  input_token_hash text,
  input_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if input_token_hash is null or input_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid token hash' using errcode = '22023';
  end if;

  if input_expires_at is null or input_expires_at <= now() then
    raise exception 'Invalid token expiry' using errcode = '22023';
  end if;

  update private.email_verification_tokens
  set used_at = now()
  where user_id = current_user_id
    and used_at is null;

  insert into private.email_verification_tokens (
    user_id,
    token_hash,
    expires_at
  )
  values (
    current_user_id,
    input_token_hash,
    input_expires_at
  );
end;
$$;

create or replace function public.verify_elite_email_token(input_token_hash text)
returns table(result text, member_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  token_record record;
  current_status text;
  verified_at timestamptz := now();
begin
  if input_token_hash is null or input_token_hash !~ '^[a-f0-9]{64}$' then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  select *
  into token_record
  from private.email_verification_tokens
  where token_hash = input_token_hash
  limit 1
  for update;

  if not found then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  select status
  into current_status
  from public.profiles
  where id = token_record.user_id;

  if current_status = 'active' then
    return query select 'already_verified'::text, 'active'::text;
    return;
  end if;

  if token_record.used_at is not null then
    return query select 'invalid'::text, current_status;
    return;
  end if;

  if token_record.expires_at <= verified_at then
    return query select 'expired'::text, current_status;
    return;
  end if;

  update private.email_verification_tokens
  set used_at = verified_at
  where id = token_record.id;

  update public.profiles
  set
    status = 'active',
    email_confirmed_at = verified_at,
    updated_at = verified_at
  where id = token_record.user_id
    and status = 'pending_email_confirmation';

  return query select 'verified'::text, 'active'::text;
end;
$$;

revoke all on function public.create_elite_email_verification_token(text, timestamptz) from public;
revoke all on function public.verify_elite_email_token(text) from public;

grant execute on function public.create_elite_email_verification_token(text, timestamptz) to authenticated;
grant execute on function public.verify_elite_email_token(text) to anon, authenticated;
