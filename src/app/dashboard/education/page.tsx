import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";
import { getActiveMemberOrRedirect } from "@/lib/member/session";

export const metadata: Metadata = {
  title: "Education",
};

export default async function DashboardEducationPage() {
  await getActiveMemberOrRedirect("/dashboard/education");

  return (
    <ModulePlaceholder
      description="Education route นี้เปิด navigation และ preview shell สำหรับ Phase 3 ก่อนต่อ Course Library, Lessons, Progress Tracking และ Documents ใน Phase 4."
      eyebrow="Education Preview"
      icon={GraduationCap}
      items={["Course Library", "Video Lessons", "Learning Progress"]}
      primaryLabel="Open My Account"
      primaryHref="/dashboard/account"
      title="Trading Education shell is ready"
    />
  );
}
