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
      description="Trading Journal route นี้เป็น preview shell สำหรับ Phase 3 เท่านั้น ส่วน Add Trade, History, Statistics และ Screenshots จะถูกทำเป็น feature เต็มใน Phase 4."
      eyebrow="Journal Preview"
      icon={FileClock}
      items={["Add Trade", "Trade History", "Journal Statistics"]}
      primaryLabel="Open Dashboard"
      primaryHref="/dashboard"
      title="Trading Journal workflow is staged"
    />
  );
}
