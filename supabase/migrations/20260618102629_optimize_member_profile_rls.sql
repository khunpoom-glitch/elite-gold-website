drop policy if exists "Members can read own profile" on public.profiles;
create policy "Members can read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

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
        and private.is_current_user_email_confirmed()
      )
    )
  );

drop policy if exists "Members can read own referral" on public.referrals;
create policy "Members can read own referral"
  on public.referrals
  for select
  to authenticated
  using (referred_user_id = (select auth.uid()));
