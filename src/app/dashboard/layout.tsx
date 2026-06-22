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
  const { email, isMemberActive, memberName, memberStatus } = await getAuthenticatedMember();

  return (
    <main className="member-shell airova-reference-page dark min-h-dvh bg-black text-foreground">
      <SessionNavBar
        memberEmail={email}
        memberName={memberName}
        memberStatus={memberStatus}
        isMemberActive={isMemberActive}
      />

      <div aria-hidden="true" className="member-background-grid pointer-events-none fixed inset-0" />

      <div className="relative z-10 min-h-dvh px-4 pb-28 pt-5 sm:px-6 md:pb-10 md:pl-24 md:pr-8 md:pt-7">
        <div className="mx-auto grid w-full max-w-7xl gap-5">
          <header className="member-surface-soft flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="elite-brand-type text-[0.7rem] font-semibold uppercase text-white/70">
                Elite Gold Member Area
              </p>
              <p className="mt-1 text-xs text-white/42">
                Phase 3 workspace for account status, access, and member navigation
              </p>
            </div>

            <div className="member-inset-panel flex min-w-0 items-center gap-3 px-3 py-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-xs font-extrabold text-[#F6E3A3]">
                {memberName.charAt(0).toUpperCase() || "E"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{memberName}</p>
                <p className="truncate text-xs text-white/44">{email}</p>
              </div>
              <span className={isMemberActive ? "member-status-success rounded-full border px-2.5 py-1 text-[0.65rem] font-bold uppercase" : "member-status-warning rounded-full border px-2.5 py-1 text-[0.65rem] font-bold uppercase"}>
                {memberStatus}
              </span>
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
