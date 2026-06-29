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
      description="A preview space for member updates and community rhythm. Phase 3 keeps the route ready while feed, events, and support workflows are prepared."
      eyebrow="Community"
      icon={MessagesSquare}
      items={["Community Feed", "Announcements", "Events"]}
      primaryLabel="Open Dashboard"
      primaryHref="/dashboard"
      title="Community space is being prepared"
    />
  );
}
