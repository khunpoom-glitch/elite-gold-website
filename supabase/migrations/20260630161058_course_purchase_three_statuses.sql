update public.course_purchase_requests
set
  archived_at = coalesce(archived_at, now()),
  archived_reason = coalesce(archived_reason, 'legacy_payment_started_removed'),
  expires_at = null,
  review_reason = coalesce(review_reason, 'Legacy checkout reference archived before transfer slip submission.'),
  status = 'rejected',
  updated_at = now()
where status = 'payment_started';

update public.course_purchase_requests
set
  expires_at = null,
  updated_at = now()
where status = 'approved'
  and expires_at is not null;

alter table public.course_purchase_requests
  alter column status drop default;

alter table public.course_purchase_requests
  drop constraint if exists course_purchase_requests_status_check;

alter table public.course_purchase_requests
  add constraint course_purchase_requests_status_check
    check (status in ('pending_review', 'approved', 'rejected'));

drop policy if exists "Members can start own course purchase" on public.course_purchase_requests;
create policy "Members can create own submitted course purchase"
  on public.course_purchase_requests
  for insert
  to authenticated
  with check (
    member_id = (select auth.uid())
    and course_slug = 'master-class'
    and status = 'pending_review'
    and expires_at is null
    and slip_storage_path is not null
    and slip_storage_path like ((select auth.uid())::text || '/%')
    and slip_file_name is not null
    and submitted_at is not null
    and reviewed_at is null
    and reviewed_by is null
    and review_reason is null
    and archived_at is null
    and archived_reason is null
  );

drop policy if exists "Members can submit own course purchase slip" on public.course_purchase_requests;
create policy "Members can resubmit rejected course purchase slip"
  on public.course_purchase_requests
  for update
  to authenticated
  using (
    member_id = (select auth.uid())
    and status = 'rejected'
    and archived_at is null
  )
  with check (
    member_id = (select auth.uid())
    and course_slug = 'master-class'
    and status = 'pending_review'
    and expires_at is null
    and slip_storage_path is not null
    and slip_storage_path like ((select auth.uid())::text || '/%')
    and slip_file_name is not null
    and submitted_at is not null
    and reviewed_at is null
    and reviewed_by is null
    and review_reason is null
    and archived_at is null
    and archived_reason is null
  );

create or replace function public.cleanup_expired_course_purchase_requests()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  archived_count integer;
begin
  update public.course_purchase_requests
  set
    archived_at = now(),
    archived_reason = coalesce(archived_reason, 'rejected_resubmission_window_expired'),
    updated_at = now()
  where archived_at is null
    and expires_at is not null
    and expires_at <= now()
    and status = 'rejected';

  get diagnostics archived_count = row_count;
  return archived_count;
end;
$$;

revoke all on function public.cleanup_expired_course_purchase_requests() from public;
grant execute on function public.cleanup_expired_course_purchase_requests() to authenticated;

comment on constraint course_purchase_requests_status_check on public.course_purchase_requests is
  'Master Class manual purchase requests use only submitted/review statuses: pending_review, approved, rejected.';

comment on column public.course_purchase_requests.expires_at is
  'Time when rejected resubmission windows can be archived from active user/admin flows. Approved purchases do not expire.';

comment on function public.cleanup_expired_course_purchase_requests() is
  'Archives expired rejected Master Class purchase requests. Pending reviews and approved purchase evidence are intentionally retained.';
