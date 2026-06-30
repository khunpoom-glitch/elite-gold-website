import type { Metadata } from "next";
import { History, ShieldCheck, UserRound } from "lucide-react";
import { getVerifiedSuperAdmin } from "@/lib/admin/session";
import { adminDashboardPath } from "@/lib/admin/verification";

export const metadata: Metadata = {
  title: "Admin Activity",
};

type AdminActivityEvent = {
  actorId: string;
  createdAt: string;
  eventType: string;
  id: string;
  metadata: Record<string, unknown>;
  purchaseRequestId: string;
  targetUserId: string;
};

function getStringValue(row: unknown, key: string) {
  if (typeof row !== "object" || row === null) {
    return "";
  }

  const value = (row as Record<string, unknown>)[key];

  return typeof value === "string" ? value : "";
}

function getMetadata(row: unknown) {
  if (typeof row !== "object" || row === null) {
    return {};
  }

  const value = (row as Record<string, unknown>).metadata;

  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function getMetadataLabel(metadata: Record<string, unknown>) {
  const referenceCode = typeof metadata.referenceCode === "string" ? metadata.referenceCode : "";
  const email = typeof metadata.email === "string" ? metadata.email : "";
  const role = typeof metadata.role === "string" ? metadata.role : "";

  return [referenceCode, email, role].filter(Boolean).join(" · ");
}

function formatEventType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getAdminActivityEvents() {
  const { supabase } = await getVerifiedSuperAdmin(`${adminDashboardPath}/activity`);
  const { data, error } = await supabase
    .from("course_purchase_admin_events")
    .select("id,event_type,actor_id,target_user_id,purchase_request_id,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[admin] Failed to load admin activity events.", error);
    return [];
  }

  return (data ?? []).map((row): AdminActivityEvent => ({
    actorId: getStringValue(row, "actor_id"),
    createdAt: getStringValue(row, "created_at"),
    eventType: getStringValue(row, "event_type"),
    id: getStringValue(row, "id"),
    metadata: getMetadata(row),
    purchaseRequestId: getStringValue(row, "purchase_request_id"),
    targetUserId: getStringValue(row, "target_user_id"),
  }));
}

export default async function AdminActivityPage() {
  const events = await getAdminActivityEvents();

  return (
    <>
      <section className="rounded-2xl border border-white/8 bg-[#171717] p-5 sm:p-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-bold uppercase text-[#F6E3A3]/78">
          <History aria-hidden="true" className="size-3.5" />
          Super Admin
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-white">Admin activity</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/52">
          Review recent step-up verification, purchase decisions, and admin user changes.
        </p>
      </section>

      <section className="grid gap-3" aria-label="Admin activity events">
        {events.length > 0 ? (
          events.map((event) => {
            const metadataLabel = getMetadataLabel(event.metadata);

            return (
              <article className="rounded-2xl border border-white/8 bg-[#171717] p-4" key={event.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid size-9 place-items-center rounded-xl border border-white/10 bg-black/28 text-[#F6E3A3]/70">
                        <ShieldCheck aria-hidden="true" className="size-4" />
                      </span>
                      <h2 className="text-lg font-semibold text-white">{formatEventType(event.eventType)}</h2>
                      <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 text-[0.62rem] font-bold uppercase text-white/42">
                        {event.createdAt}
                      </span>
                    </div>
                    {metadataLabel ? (
                      <p className="mt-3 text-sm font-semibold text-[#F6E3A3]/76">{metadataLabel}</p>
                    ) : null}
                  </div>
                  <div className="grid gap-2 text-xs text-white/38 sm:grid-cols-2 lg:min-w-[24rem]">
                    <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-2">
                      <p className="font-bold uppercase text-white/28">Actor</p>
                      <p className="mt-1 break-all font-mono">{event.actorId || "Unknown"}</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-2">
                      <p className="font-bold uppercase text-white/28">Target</p>
                      <p className="mt-1 break-all font-mono">{event.targetUserId || event.purchaseRequestId || "None"}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-white/8 bg-[#171717] p-8 text-center">
            <UserRound aria-hidden="true" className="mx-auto size-7 text-white/34" />
            <h2 className="mt-4 text-lg font-semibold text-white">No admin activity yet</h2>
            <p className="mt-2 text-sm text-white/42">Verification and admin actions will appear here.</p>
          </div>
        )}
      </section>
    </>
  );
}
