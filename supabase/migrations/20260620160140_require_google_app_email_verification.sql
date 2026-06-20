drop policy if exists "Members can create own confirmed profile" on public.profiles;
create policy "Members can create own confirmed profile"
  on public.profiles
  for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and status = 'pending_email_confirmation'
  );
