import type { Metadata } from "next";
import { ShieldCheck, UserPlus, UsersRound, XCircle } from "lucide-react";
import { canManageAdmins, parseAdminUser, type AdminUser } from "@/lib/admin/roles";
import { getVerifiedSuperAdmin } from "@/lib/admin/session";
import { adminDashboardPath } from "@/lib/admin/verification";
import {
  addAdminUserAction,
  deactivateAdminUserAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Admin Users",
};

type AdminUsersPageProps = {
  searchParams: Promise<{
    notice?: string | string[];
  }>;
};

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getNotice(notice?: string) {
  switch (notice) {
    case "admin_added":
      return { message: "Admin user added or reactivated.", tone: "success" as const };
    case "admin_deactivated":
      return { message: "Admin user deactivated.", tone: "success" as const };
    case "user_not_found":
      return { message: "No Supabase Auth user was found for that email. Ask them to sign up first.", tone: "warning" as const };
    case "cannot_deactivate_self":
      return { message: "You cannot deactivate your own super admin access.", tone: "warning" as const };
    case "invalid_email":
    case "invalid_role":
    case "missing_admin_user":
      return { message: "Please check the admin user form and try again.", tone: "warning" as const };
    case "admin_config_error":
      return { message: "Service role configuration is required to look up Supabase Auth users.", tone: "error" as const };
    case "save_error":
      return { message: "Unable to update admin users right now.", tone: "error" as const };
    default:
      return null;
  }
}

async function getAdminUsers() {
  const { supabase } = await getVerifiedSuperAdmin(`${adminDashboardPath}/users`);
  const { data, error } = await supabase
    .from("admin_users")
    .select("id,user_id,email,role,is_active,created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin] Failed to load admin users.", error);
    return [];
  }

  return (data ?? [])
    .map(parseAdminUser)
    .filter((admin): admin is AdminUser => Boolean(admin));
}

function NoticeBanner({ notice }: { notice: ReturnType<typeof getNotice> }) {
  if (!notice) {
    return null;
  }

  const className = {
    error: "border-red-300/18 bg-red-300/8 text-red-100/84",
    success: "border-emerald-200/18 bg-emerald-200/8 text-emerald-100/84",
    warning: "border-[#F6E3A3]/18 bg-[#F6E3A3]/8 text-[#F6E3A3]/84",
  }[notice.tone];

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${className}`} role={notice.tone === "success" ? "status" : "alert"}>
      {notice.message}
    </div>
  );
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const notice = getNotice(getFirstSearchParam(params.notice));
  const adminUsers = await getAdminUsers();

  return (
    <>
      <section className="rounded-2xl border border-white/8 bg-[#171717] p-5 sm:p-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-bold uppercase text-[#F6E3A3]/78">
          <UsersRound aria-hidden="true" className="size-3.5" />
          Super Admin
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-white">Admin users</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/52">
          Add trusted admins from existing Supabase Auth users, or deactivate admin access without touching member profiles.
        </p>
      </section>

      <NoticeBanner notice={notice} />

      <section className="grid gap-5 lg:grid-cols-[minmax(18rem,0.42fr)_minmax(0,1fr)]">
        <form action={addAdminUserAction} className="rounded-2xl border border-white/8 bg-[#171717] p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-black/28 text-white/54">
              <UserPlus aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">Add admin</h2>
              <p className="mt-1 text-xs text-white/38">User must already have an account.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <label className="grid gap-2 text-sm font-semibold text-white/72">
              Email
              <input className="h-11 rounded-xl border border-white/10 bg-black/28 px-3 text-sm text-white outline-none focus:border-white/24" name="email" placeholder="admin@example.com" required type="email" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-white/72">
              Role
              <select className="h-11 rounded-xl border border-white/10 bg-black/28 px-3 text-sm text-white outline-none focus:border-white/24" name="role" required>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </label>
            <button className="inline-flex h-11 items-center justify-center rounded-xl border border-white/14 bg-white px-4 text-sm font-bold text-black transition hover:bg-white/90" type="submit">
              Add Admin
            </button>
          </div>
        </form>

        <section className="grid gap-3" aria-label="Active admin users">
          {adminUsers.map((admin) => (
            <article className="rounded-2xl border border-white/8 bg-[#171717] p-4" key={admin.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-white">{admin.email}</h2>
                    <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 text-[0.62rem] font-bold uppercase text-white/48">
                      {admin.role}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/36">Created {admin.createdAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  {canManageAdmins(admin.role) ? (
                    <span className="inline-flex items-center gap-2 rounded-xl border border-[#F6E3A3]/18 bg-[#F6E3A3]/8 px-3 py-2 text-xs font-bold text-[#F6E3A3]/78">
                      <ShieldCheck aria-hidden="true" className="size-3.5" />
                      Can manage admins
                    </span>
                  ) : null}
                  <form action={deactivateAdminUserAction}>
                    <input name="adminUserId" type="hidden" value={admin.id} />
                    <input name="targetUserId" type="hidden" value={admin.userId} />
                    <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-300/16 bg-red-300/8 px-3 text-xs font-bold text-red-100/78 transition hover:bg-red-300/12" type="submit">
                      <XCircle aria-hidden="true" className="size-3.5" />
                      Deactivate
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </section>
      </section>
    </>
  );
}
