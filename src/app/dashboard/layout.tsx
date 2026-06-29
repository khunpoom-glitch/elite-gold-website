import type { Metadata } from "next";
import { HomeAuthNotice } from "@/components/sections/home-auth-notice";
import { SessionNavBar } from "@/components/ui/sidebar";
import { getAdminRoleByUserId } from "@/lib/admin/session";
import { getAuthenticatedMember } from "@/lib/member/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const { email, isMemberActive, memberName, memberStatus, profile, user } = await getAuthenticatedMember();
  const supabase = await createSupabaseServerClient();
  const adminRole = supabase ? await getAdminRoleByUserId(supabase, user.id) : null;

  return (
    <main className="member-shell airova-reference-page dark h-dvh overflow-hidden bg-[#1D1D1D] text-foreground">
      <HomeAuthNotice />
      <SessionNavBar
        isAdmin={Boolean(adminRole)}
        memberEmail={email}
        memberAvatarUrl={profile.avatarUrl}
        memberName={memberName}
        memberStatus={memberStatus}
        isMemberActive={isMemberActive}
      />

      <div aria-hidden="true" className="member-background-enter member-workspace-backdrop pointer-events-none fixed inset-0 z-0 bg-[#1D1D1D]" />

      <div className="member-workspace-scroll relative z-10 h-dvh overflow-y-auto overscroll-contain">
        <div className="member-page-enter grid min-h-dvh w-full gap-5">
          {children}
        </div>
      </div>
    </main>
  );
}
