import { redirect } from "next/navigation";
import { adminDashboardPath } from "@/lib/admin/verification";

export default function LegacyAdminRedirectPage() {
  redirect(adminDashboardPath);
}
