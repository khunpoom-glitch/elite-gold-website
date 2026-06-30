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

  select admins.id, admins.email
  into current_admin
  from public.admin_users as admins
  where admins.user_id = current_user_id
    and admins.is_active = true
  order by
    case admins.role
      when 'super_admin' then 0
      else 1
    end
  limit 1;

  if not found then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  update private.admin_verification_challenges as challenges
  set used_at = now()
  where challenges.user_id = current_user_id
    and challenges.used_at is null
    and challenges.expires_at <= now();

  select challenges.*
  into active_challenge
  from private.admin_verification_challenges as challenges
  where challenges.user_id = current_user_id
    and challenges.used_at is null
    and challenges.expires_at > now()
  order by challenges.created_at desc
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

  update private.admin_verification_challenges as challenges
  set used_at = now()
  where challenges.user_id = current_user_id
    and challenges.used_at is null;

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
    update private.admin_verification_challenges as challenges
    set used_at = review_time
    where challenges.id = challenge.id;

    return query select 'expired'::text, 0, challenge.locked_until, challenge.expires_at;
    return;
  end if;

  if challenge.code_hash = input_code_hash then
    update private.admin_verification_challenges as challenges
    set used_at = review_time
    where challenges.id = challenge.id;

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

    update private.admin_verification_challenges as challenges
    set
      attempt_count = next_attempt_count,
      locked_until = temporary_lock_until
    where challenges.id = challenge.id;

    return query
      select
        'locked'::text,
        0,
        temporary_lock_until,
        challenge.expires_at;
    return;
  end if;

  update private.admin_verification_challenges as challenges
  set attempt_count = next_attempt_count
  where challenges.id = challenge.id;

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
