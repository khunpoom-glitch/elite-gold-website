create or replace function private.discard_elite_google_signup_draft()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  deleted_count integer := 0;
begin
  if current_user_id is null then
    return false;
  end if;

  if exists (
    select 1
    from public.profiles
    where id = current_user_id
  ) then
    return false;
  end if;

  if not exists (
    select 1
    from auth.identities
    where user_id = current_user_id
      and provider = 'google'
  ) then
    return false;
  end if;

  delete from auth.refresh_tokens
  where user_id = current_user_id::text
    or session_id in (
      select id
      from auth.sessions
      where user_id = current_user_id
    );

  delete from auth.sessions
  where user_id = current_user_id;

  delete from auth.identities
  where user_id = current_user_id;

  delete from auth.users
  where id = current_user_id;

  get diagnostics deleted_count = row_count;

  return deleted_count > 0;
end;
$$;

create or replace function public.discard_elite_google_signup_draft()
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.discard_elite_google_signup_draft();
$$;

revoke all on function private.discard_elite_google_signup_draft() from public;
revoke all on function private.discard_elite_google_signup_draft() from anon;
revoke all on function public.discard_elite_google_signup_draft() from public;
revoke all on function public.discard_elite_google_signup_draft() from anon;

grant execute on function private.discard_elite_google_signup_draft() to authenticated;
grant execute on function public.discard_elite_google_signup_draft() to authenticated;

comment on function public.discard_elite_google_signup_draft() is
  'Deletes the current Google OAuth signup draft only when no Elite Gold member profile exists yet.';
