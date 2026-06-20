import type { Metadata } from "next";
import { SessionNavBar } from "@/components/ui/sidebar";
import { getAuthenticatedMember } from "@/lib/member/session";

export const metadata: Metadata = {
  title: {
    default: "Member Area",
    template: "%s | Elite Gold Member Area",
  },
  description: "พื้นที่สมาชิก Elite Gold Community",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, memberName, memberStatus } = await getAuthenticatedMember();

  return (
    <main className="airova-reference-page dark min-h-dvh bg-background text-foreground">
      <SessionNavBar
        memberEmail={email}
        memberName={memberName}
        memberStatus={memberStatus}
      />

      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(212,175,55,0.16),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(246,227,163,0.08),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.05),#000_74%)]" />

      <div className="relative z-10 min-h-dvh px-4 pb-28 pt-5 sm:px-6 md:pb-8 md:pl-[5.5rem] md:pr-8 md:pt-8">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <header className="flex flex-col gap-3 rounded-md border border-white/10 bg-black/56 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="elite-brand-type text-xs font-semibold uppercase text-soft-gold">
                Elite Gold Member Area
              </p>
              <p className="mt-1 text-sm text-white/48">
                Dashboard, profile, and Phase 3 member navigation
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-md border border-gold/24 bg-gold/10 text-xs font-extrabold text-champagne">
                {memberName.charAt(0).toUpperCase() || "E"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{memberName}</p>
                <p className="truncate text-xs text-white/44">{memberStatus}</p>
              </div>
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
