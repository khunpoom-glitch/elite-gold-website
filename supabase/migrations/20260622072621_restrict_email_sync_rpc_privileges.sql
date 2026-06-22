revoke execute on function public.sync_elite_profile_email_after_auth_change() from anon;
revoke execute on function public.sync_elite_profile_email_after_auth_change() from public;
grant execute on function public.sync_elite_profile_email_after_auth_change() to authenticated;
