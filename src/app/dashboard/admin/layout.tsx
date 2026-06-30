import type { Metadata } from "next";
import Link from "next/link";
import { History, ReceiptText, ShieldCheck, UsersRound } from "lucide-react";
import { getAuthenticatedAdmin } from "@/lib/admin/session";
import { adminDashboardPath } from "@/lib/admin/verification";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Elite Gold Admin",
  },
  robots: {
    follow: false,
    index: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, isSuperAdmin } = await getAuthenticatedAdmin(adminDashboardPath);

  return (
    <section className="min-h-dvh w-full text-white">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#1D1D1D]/96 backdrop-blur-xl">
        <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <Link className="group flex min-w-0 items-center gap-3" href={adminDashboardPath}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/36 text-[#F6E3A3]/76">
              <ShieldCheck aria-hidden="true" className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-white group-hover:text-[#F6E3A3]">Elite Gold Admin</span>
              <span className="block truncate text-xs text-white/34">{admin.email}</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2" aria-label="Admin navigation">
            <Link className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/[0.07]" href={adminDashboardPath}>
              <ReceiptText aria-hidden="true" className="size-3.5" />
              Purchases
            </Link>
            {isSuperAdmin ? (
              <>
                <Link className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/[0.07]" href={`${adminDashboardPath}/users`}>
                  <UsersRound aria-hidden="true" className="size-3.5" />
                  Admin Users
                </Link>
                <Link className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/[0.07]" href={`${adminDashboardPath}/activity`}>
                  <History aria-hidden="true" className="size-3.5" />
                  Activity
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <div className="grid gap-5 p-4 sm:p-6">
        {children}
      </div>
    </section>
  );
}
