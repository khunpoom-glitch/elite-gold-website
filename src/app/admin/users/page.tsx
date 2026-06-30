import { redirect } from "next/navigation";
import { adminDashboardPath } from "@/lib/admin/verification";

export default function LegacyAdminUsersRedirectPage() {
  redirect(`${adminDashboardPath}/users`);
}
