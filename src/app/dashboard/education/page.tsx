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
      items={[
        {
          description: "Structured course categories and member learning paths will live here.",
          label: "Course Library",
          status: "Preview",
        },
        {
          description: "Video lesson access, progress state, and lesson notes are reserved for the next rollout.",
          label: "Video Lessons",
          status: "Planned",
        },
        {
          description: "Completion and review rhythm will be tracked after the education backend is ready.",
          label: "Learning Progress",
          status: "Planned",
        },
      ]}
      primaryLabel="Open My Account"
      primaryHref="/dashboard/account"
      title="Trading Education is being prepared"
    />
  );
}
