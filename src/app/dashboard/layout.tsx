import type { Metadata } from "next";
import { HomeAuthNotice } from "@/components/sections/home-auth-notice";
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
      <HomeAuthNotice />
      <SessionNavBar
        memberEmail={email}
        memberName={memberName}
        memberStatus={memberStatus}
        isMemberActive={isMemberActive}
      />

      <div aria-hidden="true" className="member-background-grid member-background-enter pointer-events-none fixed inset-0" />

      <div className="relative z-10 min-h-dvh px-3 pb-24 pt-3 sm:px-5 md:pb-8 lg:pl-[19rem]">
        <div className="member-page-enter mx-auto grid w-full max-w-7xl gap-5">
          {children}
        </div>
      </div>
    </main>
  );
}
