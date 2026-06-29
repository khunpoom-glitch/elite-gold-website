# Master Class Manual Purchase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the Master Class Education purchase MVP with manual bank transfer, admin approval, and admin role management.

**Architecture:** Keep course copy/config in `src/config`, business parsing/state helpers in `src/lib/education`, server authorization helpers in `src/lib/admin`, and route-specific Server Actions under the related `app` routes. Supabase stores purchase requests, admin roles, entitlements, audit events, and slip uploads.

**Tech Stack:** Next.js App Router, React Server Components, Server Actions, TypeScript, Tailwind CSS, Supabase Auth/Postgres/Storage, Resend.

---

### Task 1: Domain Config And Tests

**Files:**
- Create: `src/config/education.ts`
- Create: `src/lib/education/purchase.ts`
- Create: `src/lib/education/purchase.test.ts`
- Modify: `package.json`

- [x] Add Master Class course config, bank-transfer sample data, purchase status labels, and helper functions for reference code and status display.
- [x] Add Node test coverage for status parsing, reference formatting, and CTA state.
- [x] Update `npm test` to run all `*.test.ts` files under `src/lib`.

### Task 2: Database Migration

**Files:**
- Create: `supabase/migrations/20260629090000_master_class_manual_purchase.sql`

- [x] Create `admin_users`, `course_purchase_requests`, `course_entitlements`, and `course_purchase_admin_events`.
- [x] Create indexes and RLS policies for member-owned reads/writes and admin-owned reads/writes.
- [x] Create storage bucket `course-payment-slips` and policies for member upload/admin read.
- [x] Seed `komsupanat.poom@gmail.com` as `super_admin` when an auth user with that email exists.

### Task 3: Admin Helpers And Email Builders

**Files:**
- Create: `src/lib/admin/roles.ts`
- Modify: `src/lib/email/resend.ts`
- Create: `src/lib/email/course-purchase.test.ts`

- [x] Add helpers for reading active admin role and requiring admin/super-admin server-side.
- [x] Add approve/reject email builders and send functions using the existing email shell.
- [x] Test email subjects/text include the course, decision, rejection reason, and dashboard URL.

### Task 4: Education Server Actions And Page

**Files:**
- Create: `src/app/dashboard/education/actions.ts`
- Replace: `src/app/dashboard/education/page.tsx`

- [x] Add member actions to start purchase and upload/replace slip.
- [x] Render Master Class overview, syllabus, resources, purchase status, bank-transfer instruction, and upload form.
- [x] Use server-side member guard and ownership checks.

### Task 5: Admin Area

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/actions.ts`
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/users/actions.ts`

- [x] Add separate `/admin` shell guarded by active admin role.
- [x] Add purchase review list/detail sections with approve/reject forms.
- [x] Add `/admin/users` guarded by `super_admin`, with add/deactivate admin forms.
- [x] Send approve/reject email after state update.

### Task 6: Sidebar And Dashboard Integration

**Files:**
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/components/ui/sidebar.tsx`
- Modify: `src/config/member-area.ts`
- Modify: `src/app/dashboard/page.tsx`

- [x] Pass `isAdmin` into the sidebar and show Admin Panel only to admin users.
- [x] Update Education preview/status language to Master Class.
- [x] Add a compact dashboard summary for Master Class access state without crowding the dashboard.

### Task 7: Verification

**Commands:**
- `npm test`
- `npm run lint`
- `npm run build`

- [x] Verify member education UI at desktop and mobile.
- [x] Verify non-admin cannot see Admin Panel and cannot open `/admin`.
- [x] Verify admin can open `/admin`; `super_admin` can open `/admin/users`.
- [x] Verify approve/reject updates in-app state and attempts email notification.
