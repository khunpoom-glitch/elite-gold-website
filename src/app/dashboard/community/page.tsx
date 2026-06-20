import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";
import { getActiveMemberOrRedirect } from "@/lib/member/session";

export const metadata: Metadata = {
  title: "Community",
};

export default async function DashboardCommunityPage() {
  await getActiveMemberOrRedirect("/dashboard/community");

  return (
    <ModulePlaceholder
      description="Community route นี้เปิดพื้นที่นำทางและ preview สำหรับประกาศ กิจกรรม และ support ก่อนทำ feed/events/support เต็มระบบใน Phase 4."
      eyebrow="Community Preview"
      icon={MessagesSquare}
      items={["Community Feed", "Announcements", "Events"]}
      primaryLabel="Open Dashboard"
      primaryHref="/dashboard"
      title="Community updates have a home"
    />
  );
}
