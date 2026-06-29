# Master Class Manual Purchase Design

## Goal

Build the first real Education feature around one course, Master Class, with manual bank-transfer purchase, slip upload, admin approval, email notification, and admin role management.

## Scope

- Replace the `/dashboard/education` preview with a real Master Class course sales and access page.
- Add manual bank-transfer purchase states: `locked`, `payment_started`, `pending_review`, `approved`, `rejected`.
- Add `/admin` as a separate admin area for purchase approval.
- Add `/admin/users` for `super_admin` role management.
- Add `admin_users` as a separate security boundary from editable member profiles.
- Bootstrap `komsupanat.poom@gmail.com` as the first `super_admin`.
- Send email and show in-app state after approve/reject.

## Out Of Scope

- Payment gateway checkout, webhooks, subscriptions, renewal, payout, commission, or full billing history.
- Full member management, user deletion, password reset by admin, analytics, website settings, or course content management UI.
- Multiple paid courses. The MVP has one course: Master Class.

## Data Model

- `admin_users`: admin identity, role, active state, audit columns, and bootstrap seed for `komsupanat.poom@gmail.com`.
- `course_purchase_requests`: one purchase request per member/course lifecycle, with amount, reference code, transfer notes, slip path, review status, reviewer, reason, and timestamps.
- `course_entitlements`: access grant created after approval.
- `course_purchase_admin_events`: append-only audit events for purchase approval/rejection and admin user changes.
- Supabase Storage bucket `course-payment-slips` stores member-uploaded slip files.

## Member UX

- `/dashboard/education` uses the current member shell but removes the Phase 3 placeholder.
- The page uses a Resend-inspired dark system: black canvas, hairline borders, restrained cards, code-like reference panels, and white primary CTA while preserving Elite Gold gold accents and existing member surface classes.
- The page shows Master Class overview, outcomes, syllabus, resources, price, bank-transfer instructions, upload slip form, and current access state.
- Approved members see a start-learning state and course content preview. Rejected members see the rejection reason and can upload again.

## Admin UX

- Admin-only members see an Admin Panel link in the member sidebar.
- `/admin` lists pending purchase reviews and provides approve/reject actions.
- `/admin/users` is visible to `super_admin` only and supports adding/deactivating admins by email.
- Direct URL access is protected server-side, not only hidden in the UI.

## Email UX

- Approve email: tells the member Master Class has been unlocked and links to `/dashboard/education`.
- Reject email: tells the member the submitted slip could not be approved, includes the reason, and links back to `/dashboard/education`.
- If Resend is not configured, the approval/rejection still updates in-app state and logs the skipped email through existing email behavior.

## Security Notes

- Server Actions verify authentication and authorization every time.
- Member actions verify ownership of the purchase request.
- Admin actions verify active `admin` or `super_admin` role.
- `super_admin` is required for `/admin/users`.
- Admin roles live outside `profiles` so member profile edits cannot alter privilege.
