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
    changed_fields := array_append(changed_fields, 'email');
  end if;

  if old.first_name is distinct from new.first_name then
    changed_fields := array_append(changed_fields, 'first_name');
  end if;

  if old.last_name is distinct from new.last_name then
    changed_fields := array_append(changed_fields, 'last_name');
  end if;

  if old.full_name is distinct from new.full_name then
    changed_fields := array_append(changed_fields, 'full_name');
  end if;

  if old.nickname is distinct from new.nickname then
    changed_fields := array_append(changed_fields, 'nickname');
  end if;

  if old.nationality is distinct from new.nationality then
    changed_fields := array_append(changed_fields, 'nationality');
  end if;

  if old.phone_country is distinct from new.phone_country then
    changed_fields := array_append(changed_fields, 'phone_country');
  end if;

  if old.phone is distinct from new.phone then
    changed_fields := array_append(changed_fields, 'phone');
  end if;

  if old.signup_access_code is distinct from new.signup_access_code then
    changed_fields := array_append(changed_fields, 'signup_access_code');
  end if;

  if old.member_access_code is distinct from new.member_access_code then
    changed_fields := array_append(changed_fields, 'member_access_code');
  end if;

  if old.avatar_url is distinct from new.avatar_url then
    changed_fields := array_append(changed_fields, 'avatar_url');
  end if;

  if old.signup_provider is distinct from new.signup_provider then
    changed_fields := array_append(changed_fields, 'signup_provider');
  end if;

  if old.status is distinct from new.status then
    changed_fields := array_append(changed_fields, 'status');
  end if;

  if old.email_confirmed_at is distinct from new.email_confirmed_at then
    changed_fields := array_append(changed_fields, 'email_confirmed_at');
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

comment on function private.audit_elite_profile_change() is
  'Audits Elite Gold profile changes and records changed columns without malformed array literal errors.';
