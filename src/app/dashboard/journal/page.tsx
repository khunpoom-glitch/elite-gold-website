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
      items={["Add Trade", "Trade History", "Journal Statistics"]}
      primaryLabel="Open Dashboard"
      primaryHref="/dashboard"
      title="Trading Journal is being prepared"
    />
  );
}
