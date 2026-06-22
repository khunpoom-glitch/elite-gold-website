create schema if not exists private;

create table if not exists public.profile_audit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  source text not null default 'profiles_trigger',
  changed_fields text[] not null default array[]::text[],
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now(),
  constraint profile_audit_logs_action_check
    check (
      action in (
        'profile_created',
        'profile_updated',
        'status_changed',
        'email_changed',
        'email_change_requested',
        'email_change_request_cancelled',
        'email_change_request_failed',
        'email_change_confirmed'
      )
    )
);

create index if not exists profile_audit_logs_profile_created_idx
  on public.profile_audit_logs (profile_id, created_at desc);

create index if not exists profile_audit_logs_action_created_idx
  on public.profile_audit_logs (action, created_at desc);

create table if not exists public.profile_email_change_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  old_email text not null,
  new_email text not null,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  confirmed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint profile_email_change_requests_status_check
    check (status in ('pending', 'confirmed', 'cancelled', 'failed')),
  constraint profile_email_change_requests_old_email_not_blank
    check (length(btrim(old_email)) > 0),
  constraint profile_email_change_requests_new_email_not_blank
    check (length(btrim(new_email)) > 0),
  constraint profile_email_change_requests_email_changed
    check (lower(btrim(old_email)) <> lower(btrim(new_email)))
);

create index if not exists profile_email_change_requests_profile_requested_idx
  on public.profile_email_change_requests (profile_id, requested_at desc);

create unique index if not exists profile_email_change_requests_one_pending_idx
  on public.profile_email_change_requests (profile_id)
  where status = 'pending';

create or replace function private.touch_profile_email_change_request_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profile_email_change_requests_touch_updated_at
  on public.profile_email_change_requests;
create trigger profile_email_change_requests_touch_updated_at
  before update on public.profile_email_change_requests
  for each row
  execute function private.touch_profile_email_change_request_updated_at();

create or replace function private.profile_audit_snapshot(profile_row public.profiles)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'id', profile_row.id,
    'email', profile_row.email,
    'first_name', profile_row.first_name,
    'last_name', profile_row.last_name,
    'full_name', profile_row.full_name,
    'nickname', profile_row.nickname,
    'nationality', profile_row.nationality,
    'phone_country', profile_row.phone_country,
    'phone', profile_row.phone,
    'signup_access_code', profile_row.signup_access_code,
    'member_access_code', profile_row.member_access_code,
    'avatar_url', profile_row.avatar_url,
    'signup_provider', profile_row.signup_provider,
    'status', profile_row.status,
    'email_confirmed_at', profile_row.email_confirmed_at,
    'created_at', profile_row.created_at,
    'updated_at', profile_row.updated_at
  );
$$;

create or replace function private.audit_elite_profile_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_fields text[] := array[]::text[];
  audit_action text := 'profile_updated';
begin
  if tg_op = 'INSERT' then
    insert into public.profile_audit_logs (
      profile_id,
      actor_id,
      action,
      source,
      changed_fields,
      new_data
    )
    values (
      new.id,
      auth.uid(),
      'profile_created',
      'profiles_trigger',
      array[
        'email',
        'first_name',
        'last_name',
        'full_name',
        'nickname',
        'nationality',
        'phone_country',
        'phone',
        'signup_access_code',
        'member_access_code',
        'avatar_url',
        'signup_provider',
        'status',
        'email_confirmed_at'
      ],
      private.profile_audit_snapshot(new)
    );

    return new;
  end if;

  if old.email is distinct from new.email then
    changed_fields := changed_fields || 'email';
  end if;

  if old.first_name is distinct from new.first_name then
    changed_fields := changed_fields || 'first_name';
  end if;

  if old.last_name is distinct from new.last_name then
    changed_fields := changed_fields || 'last_name';
  end if;

  if old.full_name is distinct from new.full_name then
    changed_fields := changed_fields || 'full_name';
  end if;

  if old.nickname is distinct from new.nickname then
    changed_fields := changed_fields || 'nickname';
  end if;

  if old.nationality is distinct from new.nationality then
    changed_fields := changed_fields || 'nationality';
  end if;

  if old.phone_country is distinct from new.phone_country then
    changed_fields := changed_fields || 'phone_country';
  end if;

  if old.phone is distinct from new.phone then
    changed_fields := changed_fields || 'phone';
  end if;

  if old.signup_access_code is distinct from new.signup_access_code then
    changed_fields := changed_fields || 'signup_access_code';
  end if;

  if old.member_access_code is distinct from new.member_access_code then
    changed_fields := changed_fields || 'member_access_code';
  end if;

  if old.avatar_url is distinct from new.avatar_url then
    changed_fields := changed_fields || 'avatar_url';
  end if;

  if old.signup_provider is distinct from new.signup_provider then
    changed_fields := changed_fields || 'signup_provider';
  end if;

  if old.status is distinct from new.status then
    changed_fields := changed_fields || 'status';
  end if;

  if old.email_confirmed_at is distinct from new.email_confirmed_at then
    changed_fields := changed_fields || 'email_confirmed_at';
  end if;

  if array_length(changed_fields, 1) is null then
    return new;
  end if;

  if old.email is distinct from new.email then
    audit_action := 'email_changed';
  elsif old.status is distinct from new.status then
    audit_action := 'status_changed';
  end if;

  insert into public.profile_audit_logs (
    profile_id,
    actor_id,
    action,
    source,
    changed_fields,
    old_data,
    new_data
  )
  values (
    new.id,
    auth.uid(),
    audit_action,
    'profiles_trigger',
    changed_fields,
    private.profile_audit_snapshot(old),
    private.profile_audit_snapshot(new)
  );

  return new;
end;
$$;

drop trigger if exists on_elite_profile_audit_change on public.profiles;
create trigger on_elite_profile_audit_change
  after insert or update on public.profiles
  for each row
  execute function private.audit_elite_profile_change();

create or replace function private.audit_elite_profile_email_change_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  audit_action text;
begin
  if tg_op = 'INSERT' then
    audit_action := 'email_change_requested';
  elsif old.status = new.status then
    return new;
  elsif new.status = 'cancelled' then
    audit_action := 'email_change_request_cancelled';
  elsif new.status = 'failed' then
    audit_action := 'email_change_request_failed';
  elsif new.status = 'confirmed' then
    audit_action := 'email_change_confirmed';
  else
    return new;
  end if;

  insert into public.profile_audit_logs (
    profile_id,
    actor_id,
    action,
    source,
    changed_fields,
    old_data,
    new_data
  )
  values (
    new.profile_id,
    auth.uid(),
    audit_action,
    'email_change_request',
    case
      when tg_op = 'INSERT' then array['email']
      else array['status']
    end,
    case
      when tg_op = 'INSERT' then null
      else jsonb_build_object(
        'old_email', old.old_email,
        'new_email', old.new_email,
        'status', old.status,
        'requested_at', old.requested_at,
        'confirmed_at', old.confirmed_at,
        'updated_at', old.updated_at
      )
    end,
    jsonb_build_object(
      'old_email', new.old_email,
      'new_email', new.new_email,
      'status', new.status,
      'requested_at', new.requested_at,
      'confirmed_at', new.confirmed_at,
      'updated_at', new.updated_at
    )
  );

  return new;
end;
$$;

drop trigger if exists on_elite_profile_email_change_request_audit
  on public.profile_email_change_requests;
create trigger on_elite_profile_email_change_request_audit
  after insert or update on public.profile_email_change_requests
  for each row
  execute function private.audit_elite_profile_email_change_request();

create or replace function public.sync_elite_profile_email_after_auth_change()
returns table(synced_email text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_auth_email text;
  current_profile_email text;
begin
  if current_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select lower(btrim(users.email))
  into current_auth_email
  from auth.users as users
  where users.id = current_user_id;

  if current_auth_email is null or current_auth_email = '' then
    raise exception 'Authenticated user email was not found' using errcode = '22023';
  end if;

  select profiles.email
  into current_profile_email
  from public.profiles as profiles
  where profiles.id = current_user_id
  for update;

  if not found then
    return query select current_auth_email;
    return;
  end if;

  if lower(btrim(current_profile_email)) is distinct from current_auth_email then
    update public.profiles
    set
      email = current_auth_email,
      updated_at = now()
    where id = current_user_id;

    update public.profile_email_change_requests
    set
      status = 'confirmed',
      confirmed_at = coalesce(confirmed_at, now()),
      updated_at = now()
    where profile_id = current_user_id
      and status = 'pending'
      and lower(btrim(new_email)) = current_auth_email;
  end if;

  return query select current_auth_email;
end;
$$;

revoke all on function public.sync_elite_profile_email_after_auth_change() from public;
grant execute on function public.sync_elite_profile_email_after_auth_change() to authenticated;

create or replace view public.customer_profile_directory
with (security_invoker = true)
as
select
  profiles.id as profile_id,
  regexp_replace(profiles.member_access_code, '^EG', '') as member_id,
  profiles.member_access_code,
  profiles.signup_access_code,
  referrer.id as signup_access_owner_profile_id,
  referrer.member_access_code as signup_access_owner_code,
  profiles.email,
  pending_requests.new_email as pending_email_change_to,
  profiles.first_name,
  profiles.last_name,
  profiles.full_name,
  profiles.nickname,
  profiles.nationality,
  profiles.phone_country,
  profiles.phone,
  profiles.signup_provider,
  profiles.status,
  profiles.email_confirmed_at,
  profiles.avatar_url,
  profiles.created_at,
  profiles.updated_at
from public.profiles as profiles
left join public.profiles as referrer
  on referrer.member_access_code = profiles.signup_access_code
  and referrer.id <> profiles.id
left join lateral (
  select requests.new_email
  from public.profile_email_change_requests as requests
  where requests.profile_id = profiles.id
    and requests.status = 'pending'
  order by requests.requested_at desc
  limit 1
) as pending_requests on true;

create or replace view public.customer_profile_audit_history
with (security_invoker = true)
as
select
  audit_logs.id as audit_id,
  audit_logs.profile_id,
  regexp_replace(profiles.member_access_code, '^EG', '') as member_id,
  profiles.member_access_code,
  profiles.email as current_email,
  audit_logs.actor_id,
  audit_logs.action,
  audit_logs.source,
  audit_logs.changed_fields,
  audit_logs.old_data,
  audit_logs.new_data,
  audit_logs.created_at
from public.profile_audit_logs as audit_logs
left join public.profiles as profiles
  on profiles.id = audit_logs.profile_id;

alter table public.profile_audit_logs enable row level security;
alter table public.profile_email_change_requests enable row level security;

drop policy if exists "Members can read own profile audit logs" on public.profile_audit_logs;
create policy "Members can read own profile audit logs"
  on public.profile_audit_logs
  for select
  to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists "Members can read own email change requests" on public.profile_email_change_requests;
create policy "Members can read own email change requests"
  on public.profile_email_change_requests
  for select
  to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists "Members can request own email change" on public.profile_email_change_requests;
create policy "Members can request own email change"
  on public.profile_email_change_requests
  for insert
  to authenticated
  with check (
    profile_id = (select auth.uid())
    and status = 'pending'
  );

drop policy if exists "Members can cancel own pending email change" on public.profile_email_change_requests;
create policy "Members can cancel own pending email change"
  on public.profile_email_change_requests
  for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (
    profile_id = (select auth.uid())
    and status in ('cancelled', 'failed')
  );

revoke all on table public.profile_audit_logs from anon, authenticated;
revoke all on table public.profile_email_change_requests from anon, authenticated;
revoke all on table public.customer_profile_directory from anon, authenticated;
revoke all on table public.customer_profile_audit_history from anon, authenticated;

grant select on table public.profile_audit_logs to authenticated;
grant select, insert on table public.profile_email_change_requests to authenticated;
grant update (status, updated_at) on table public.profile_email_change_requests to authenticated;
grant select on table public.customer_profile_directory to authenticated;
grant select on table public.customer_profile_audit_history to authenticated;

comment on table public.profile_audit_logs is
  'Append-only audit history for Elite Gold member profile changes and email-change lifecycle events.';

comment on table public.profile_email_change_requests is
  'Tracks secure email change requests. profiles.email is updated only after Supabase Auth verifies the new email.';

comment on view public.customer_profile_directory is
  'Admin-friendly current customer profile directory. Query from Supabase SQL/Table Editor to view all member fields.';

comment on view public.customer_profile_audit_history is
  'Admin-friendly profile change history including changed fields and before/after JSON snapshots.';
