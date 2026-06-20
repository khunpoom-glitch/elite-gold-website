drop policy if exists "Members can update own editable profile" on public.profiles;
create policy "Members can update own editable profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

grant update (
  first_name,
  last_name,
  full_name,
  nickname,
  nationality,
  phone_country,
  phone
) on table public.profiles to authenticated;
