create table if not exists private.admin_verification_challenges (
  id uuid primary key,
  admin_user_id uuid not null references public.admin_users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  code_hash text not null,
  code_salt text not null,
  expires_at timestamptz not null,
  attempt_count integer not null default 0,
  max_attempts integer not null default 5,
  locked_until timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint admin_verification_code_hash_format
    check (code_hash ~ '^[a-f0-9]{64}$'),
  constraint admin_verification_code_salt_format
    check (code_salt ~ '^[a-f0-9]{32,128}$'),
  constraint admin_verification_expiry_after_create
    check (expires_at > created_at),
  constraint admin_verification_attempts_range
    check (attempt_count >= 0 and max_attempts between 1 and 10)
);

create index if not exists admin_verification_challenges_user_active_idx
  on private.admin_verification_challenges (user_id, created_at desc)
  where used_at is null;

create index if not exists admin_verification_challenges_expiry_idx
  on private.admin_verification_challenges (expires_at)
  where used_at is null;

revoke all on table private.admin_verification_challenges from public;
revoke all on table private.admin_verification_challenges from anon, authenticated;

alter table public.course_purchase_admin_events
  drop constraint if exists course_purchase_admin_events_type_check;

alter table public.course_purchase_admin_events
  add constraint course_purchase_admin_events_type_check
    check (
      event_type in (
        'purchase_started',
        'slip_submitted',
        'purchase_approved',
        'purchase_rejected',
        'admin_added',
        'admin_deactivated',
        'admin_verified'
      )
    );

create or replace function public.create_elite_admin_verification_challenge(
  input_challenge_id uuid,
  input_code_hash text,
  input_code_salt text,
  input_expires_at timestamptz,
  input_force_new boolean default false
)
returns table(
  result text,
  challenge_id uuid,
  code_salt text,
  expires_at timestamptz,
  next_allowed_at timestamptz,
  locked_until timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_challenge record;
  cooldown_interval interval := interval '60 seconds';
  current_admin record;
  current_user_id uuid := auth.uid();
  resend_allowed_at timestamptz;
begin
  if current_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if input_challenge_id is null then
    raise exception 'Invalid challenge id' using errcode = '22023';
  end if;

  if input_code_hash is null or input_code_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid code hash' using errcode = '22023';
  end if;

  if input_code_salt is null or input_code_salt !~ '^[a-f0-9]{32,128}$' then
    raise exception 'Invalid code salt' using errcode = '22023';
  end if;

  if input_expires_at is null
    or input_expires_at <= now()
    or input_expires_at > now() + interval '30 minutes'
  then
    raise exception 'Invalid code expiry' using errcode = '22023';
  end if;

  select id, email
  into current_admin
  from public.admin_users
  where user_id = current_user_id
    and is_active = true
  order by
    case role
      when 'super_admin' then 0
      else 1
    end
  limit 1;

  if not found then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  update private.admin_verification_challenges
  set used_at = now()
  where user_id = current_user_id
    and used_at is null
    and expires_at <= now();

  select *
  into active_challenge
  from private.admin_verification_challenges
  where user_id = current_user_id
    and used_at is null
    and expires_at > now()
  order by created_at desc
  limit 1
  for update;

  if found then
    if active_challenge.locked_until is not null
      and active_challenge.locked_until > now()
    then
      return query
        select
          'locked'::text,
          active_challenge.id,
          active_challenge.code_salt,
          active_challenge.expires_at,
          active_challenge.created_at + cooldown_interval,
          active_challenge.locked_until;
      return;
    end if;

    resend_allowed_at := active_challenge.created_at + cooldown_interval;

    if not input_force_new then
      return query
        select
          'active'::text,
          active_challenge.id,
          active_challenge.code_salt,
          active_challenge.expires_at,
          resend_allowed_at,
          active_challenge.locked_until;
      return;
    end if;

    if resend_allowed_at > now() then
      return query
        select
          'cooldown'::text,
          active_challenge.id,
          active_challenge.code_salt,
          active_challenge.expires_at,
          resend_allowed_at,
          active_challenge.locked_until;
      return;
    end if;
  end if;

  update private.admin_verification_challenges
  set used_at = now()
  where user_id = current_user_id
    and used_at is null;

  insert into private.admin_verification_challenges (
    id,
    admin_user_id,
    user_id,
    email,
    code_hash,
    code_salt,
    expires_at
  )
  values (
    input_challenge_id,
    current_admin.id,
    current_user_id,
    current_admin.email,
    input_code_hash,
    input_code_salt,
    input_expires_at
  );

  return query
    select
      'sent'::text,
      input_challenge_id,
      input_code_salt,
      input_expires_at,
      now() + cooldown_interval,
      null::timestamptz;
end;
$$;

create or replace function public.verify_elite_admin_verification_challenge(
  input_challenge_id uuid,
  input_code_hash text
)
returns table(
  result text,
  attempts_remaining integer,
  locked_until timestamptz,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  challenge record;
  current_user_id uuid := auth.uid();
  next_attempt_count integer;
  review_time timestamptz := now();
  temporary_lock_until timestamptz;
begin
  if current_user_id is null
    or input_challenge_id is null
    or input_code_hash is null
    or input_code_hash !~ '^[a-f0-9]{64}$'
  then
    return query select 'invalid'::text, 0, null::timestamptz, null::timestamptz;
    return;
  end if;

  select challenges.*
  into challenge
  from private.admin_verification_challenges as challenges
  join public.admin_users as admins
    on admins.id = challenges.admin_user_id
   and admins.user_id = current_user_id
   and admins.is_active = true
  where challenges.id = input_challenge_id
    and challenges.user_id = current_user_id
  limit 1
  for update of challenges;

  if not found then
    return query select 'invalid'::text, 0, null::timestamptz, null::timestamptz;
    return;
  end if;

  if challenge.used_at is not null then
    return query select 'invalid'::text, 0, challenge.locked_until, challenge.expires_at;
    return;
  end if;

  if challenge.locked_until is not null
    and challenge.locked_until > review_time
  then
    return query select 'locked'::text, 0, challenge.locked_until, challenge.expires_at;
    return;
  end if;

  if challenge.expires_at <= review_time then
    update private.admin_verification_challenges
    set used_at = review_time
    where id = challenge.id;

    return query select 'expired'::text, 0, challenge.locked_until, challenge.expires_at;
    return;
  end if;

  if challenge.code_hash = input_code_hash then
    update private.admin_verification_challenges
    set used_at = review_time
    where id = challenge.id;

    return query
      select
        'verified'::text,
        greatest(challenge.max_attempts - challenge.attempt_count, 0),
        null::timestamptz,
        challenge.expires_at;
    return;
  end if;

  next_attempt_count := challenge.attempt_count + 1;

  if next_attempt_count >= challenge.max_attempts then
    temporary_lock_until := review_time + interval '15 minutes';

    update private.admin_verification_challenges
    set
      attempt_count = next_attempt_count,
      locked_until = temporary_lock_until
    where id = challenge.id;

    return query
      select
        'locked'::text,
        0,
        temporary_lock_until,
        challenge.expires_at;
    return;
  end if;

  update private.admin_verification_challenges
  set attempt_count = next_attempt_count
  where id = challenge.id;

  return query
    select
      'invalid'::text,
      greatest(challenge.max_attempts - next_attempt_count, 0),
      null::timestamptz,
      challenge.expires_at;
end;
$$;

revoke all on function public.create_elite_admin_verification_challenge(uuid, text, text, timestamptz, boolean) from public;
revoke all on function public.create_elite_admin_verification_challenge(uuid, text, text, timestamptz, boolean) from anon;
grant execute on function public.create_elite_admin_verification_challenge(uuid, text, text, timestamptz, boolean) to authenticated;

revoke all on function public.verify_elite_admin_verification_challenge(uuid, text) from public;
revoke all on function public.verify_elite_admin_verification_challenge(uuid, text) from anon;
grant execute on function public.verify_elite_admin_verification_challenge(uuid, text) to authenticated;

comment on table private.admin_verification_challenges is
  'Short-lived one-time admin verification codes for dashboard step-up access.';

comment on function public.create_elite_admin_verification_challenge(uuid, text, text, timestamptz, boolean) is
  'Creates or returns a short-lived admin verification challenge for the current active admin.';

comment on function public.verify_elite_admin_verification_challenge(uuid, text) is
  'Verifies the current active admin against a short-lived step-up challenge and tracks failed attempts.';
