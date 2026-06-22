insert into public.profile_audit_logs (
  profile_id,
  actor_id,
  action,
  source,
  changed_fields,
  new_data,
  created_at
)
select
  profiles.id,
  null,
  'profile_created',
  'profile_audit_backfill',
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
  private.profile_audit_snapshot(profiles),
  profiles.created_at
from public.profiles as profiles
where not exists (
  select 1
  from public.profile_audit_logs as audit_logs
  where audit_logs.profile_id = profiles.id
    and audit_logs.action = 'profile_created'
);
