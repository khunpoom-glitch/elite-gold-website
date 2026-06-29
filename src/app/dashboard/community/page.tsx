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
      items={[
        {
          description: "A member-only update feed can be connected after moderation rules are ready.",
          label: "Community Feed",
          status: "Planned",
        },
        {
          description: "Official updates will keep members aligned without turning the area into a sales feed.",
          label: "Announcements",
          status: "Preview",
        },
        {
          description: "Live sessions and community events can be surfaced here in a future rollout.",
          label: "Events",
          status: "Planned",
        },
      ]}
      primaryLabel="Open Dashboard"
      primaryHref="/dashboard"
      title="Community space is being prepared"
    />
  );
}
