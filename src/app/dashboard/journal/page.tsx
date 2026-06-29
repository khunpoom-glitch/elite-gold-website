import type { Metadata } from "next";
import { FileClock } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";
import { getActiveMemberOrRedirect } from "@/lib/member/session";

export const metadata: Metadata = {
  title: "Trading Journal",
};

export default async function DashboardJournalPage() {
  await getActiveMemberOrRedirect("/dashboard/journal");

  return (
    <ModulePlaceholder
      description="A focused preview of the future review workspace. Phase 3 keeps the entry point in place while trade entry, history, statistics, and screenshots are prepared."
      eyebrow="Trading Journal"
      icon={FileClock}
      items={[
        {
          description: "A clean trade-entry flow will be prepared after the member foundation is stable.",
          label: "Add Trade",
          status: "Planned",
        },
        {
          description: "History, filters, and evidence screenshots are reserved for the journal rollout.",
          label: "Trade History",
          status: "Planned",
        },
        {
          description: "Stats will focus on discipline and review patterns, not guaranteed performance claims.",
          label: "Journal Statistics",
          status: "Planned",
        },
      ]}
      primaryLabel="Open Dashboard"
      primaryHref="/dashboard"
      title="Trading Journal is being prepared"
    />
  );
}
