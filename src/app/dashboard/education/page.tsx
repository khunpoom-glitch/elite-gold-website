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
      description="A calm preview of the learning workspace. Phase 3 keeps the navigation ready while the full course library, lessons, and progress tracking are prepared for the next rollout."
      eyebrow="Education"
      icon={GraduationCap}
      items={["Course Library", "Video Lessons", "Learning Progress"]}
      primaryLabel="Open My Account"
      primaryHref="/dashboard/account"
      title="Trading Education is being prepared"
    />
  );
}
