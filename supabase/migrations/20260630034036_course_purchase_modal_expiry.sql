alter table public.course_purchase_requests
  add column if not exists expires_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists archived_reason text;

update public.course_purchase_requests
set expires_at =
  case status
    when 'payment_started' then created_at + interval '2 days'
    when 'rejected' then coalesce(reviewed_at, updated_at) + interval '14 days'
    when 'approved' then coalesce(reviewed_at, updated_at) + interval '90 days'
    else null
  end
where expires_at is null
  and archived_at is null;

alter table public.course_purchase_requests
  drop constraint if exists course_purchase_requests_member_course_unique;

drop index if exists course_purchase_requests_member_course_active_unique_idx;
create unique index course_purchase_requests_member_course_active_unique_idx
  on public.course_purchase_requests (member_id, course_slug)
  where archived_at is null;

create index if not exists course_purchase_requests_active_expiry_idx
  on public.course_purchase_requests (expires_at, status)
  where archived_at is null
    and expires_at is not null;

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
    archived_reason = coalesce(
      archived_reason,
      case status
        when 'approved' then 'approved_history_expired'
        when 'rejected' then 'rejected_resubmission_window_expired'
        else 'payment_window_expired'
      end
    ),
    updated_at = now()
  where archived_at is null
    and expires_at is not null
    and expires_at <= now()
    and status in ('payment_started', 'rejected', 'approved');

  get diagnostics archived_count = row_count;
  return archived_count;
end;
$$;

revoke all on function public.cleanup_expired_course_purchase_requests() from public;
grant execute on function public.cleanup_expired_course_purchase_requests() to authenticated;

comment on column public.course_purchase_requests.expires_at is
  'Time when a non-pending course purchase request can be archived from active user/admin flows.';

comment on column public.course_purchase_requests.archived_at is
  'Set when the request is removed from active purchase review/status surfaces. Entitlements remain separate.';

comment on function public.cleanup_expired_course_purchase_requests() is
  'Archives expired Master Class purchase request statuses. Pending review rows are intentionally excluded.';
