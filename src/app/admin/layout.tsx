import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, UsersRound } from "lucide-react";
import { getAuthenticatedAdmin } from "@/lib/admin/session";

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
  const { admin, isSuperAdmin } = await getAuthenticatedAdmin("/admin");

  return (
    <main className="min-h-dvh bg-[#101010] text-white">
      <div className="border-b border-white/8 bg-[#151515]/96 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link className="group flex min-w-0 items-center gap-3" href="/admin">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/36 text-[#F6E3A3]/76">
              <ShieldCheck aria-hidden="true" className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-white group-hover:text-[#F6E3A3]">Elite Gold Admin</span>
              <span className="block truncate text-xs text-white/34">{admin.email}</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2" aria-label="Admin navigation">
            <Link className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/[0.07]" href="/admin">
              Purchases
            </Link>
            {isSuperAdmin ? (
              <Link className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/[0.07]" href="/admin/users">
                <UsersRound aria-hidden="true" className="size-3.5" />
                Admin Users
              </Link>
            ) : null}
          </nav>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6">
        {children}
      </div>
    </main>
  );
}
