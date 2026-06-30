import type { Metadata } from "next";
import {
  CheckCircle2,
  Clock3,
  FileSearch,
  ReceiptText,
  XCircle,
} from "lucide-react";
import { masterClassCourse } from "@/config/education";
import {
  formatThaiBaht,
  getPurchaseStatusView,
  parseMasterClassBuyerAttribution,
  parseMasterClassPurchase,
  type MasterClassBuyerAttribution,
  type MasterClassPurchase,
} from "@/lib/education/purchase";
import { getAuthenticatedAdmin } from "@/lib/admin/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  approveMasterClassPurchaseAction,
  rejectMasterClassPurchaseAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Purchase Reviews",
};

type AdminPageProps = {
  searchParams: Promise<{
    notice?: string | string[];
  }>;
};

type AdminPurchase = MasterClassPurchase & MasterClassBuyerAttribution & {
  memberEmail: string;
  memberId: string;
  memberName: string;
  slipUrl: string | null;
};

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getNotice(notice?: string) {
  switch (notice) {
    case "approved":
      return { message: "Purchase approved and course access granted.", tone: "success" as const };
    case "rejected":
      return { message: "Purchase rejected. The member can upload a new slip.", tone: "warning" as const };
    case "reject_reason_required":
      return { message: "Please enter a rejection reason.", tone: "warning" as const };
    case "invalid_purchase_state":
      return { message: "This purchase is no longer pending review.", tone: "warning" as const };
    case "review_error":
    case "missing_purchase":
      return { message: "Unable to review this purchase right now.", tone: "error" as const };
    default:
      return null;
  }
}

function getStringValue(row: unknown, key: string) {
  if (typeof row !== "object" || row === null) {
    return "";
  }

  const value = (row as Record<string, unknown>)[key];

  return typeof value === "string" ? value : "";
}

async function getPurchaseAttributionByMemberId(
  supabase: Awaited<ReturnType<typeof getAuthenticatedAdmin>>["supabase"],
  memberIds: string[],
) {
  const uniqueMemberIds = Array.from(new Set(memberIds.filter(Boolean)));
  const attributionByMemberId = new Map<string, MasterClassBuyerAttribution>();

  if (uniqueMemberIds.length === 0) {
    return attributionByMemberId;
  }

  const profileClient = createSupabaseAdminClient() ?? supabase;
  const { data, error } = await profileClient
    .from("customer_profile_directory")
    .select("profile_id,member_access_code,signup_access_code,signup_access_owner_code")
    .in("profile_id", uniqueMemberIds);

  if (error) {
    console.error("[admin] Failed to load purchase access-code attribution.", error);
    return attributionByMemberId;
  }

  for (const row of data ?? []) {
    const profileId = getStringValue(row, "profile_id");

    if (profileId) {
      attributionByMemberId.set(profileId, parseMasterClassBuyerAttribution(row));
    }
  }

  return attributionByMemberId;
}

async function getAdminPurchases() {
  const { supabase } = await getAuthenticatedAdmin("/admin");
  const { error: cleanupError } = await supabase.rpc("cleanup_expired_course_purchase_requests");

  if (cleanupError) {
    console.error("[admin] Failed to archive expired course purchase requests.", cleanupError);
  }

  const { data, error } = await supabase
    .from("course_purchase_requests")
    .select("id,member_id,reference_code,amount_thb,status,slip_storage_path,slip_file_name,submitted_at,review_reason,created_at,updated_at,expires_at,archived_at,member_email,member_name")
    .eq("course_slug", masterClassCourse.slug)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[admin] Failed to load course purchase requests.", error);
    return [];
  }

  const rows = data ?? [];
  const attributionByMemberId = await getPurchaseAttributionByMemberId(
    supabase,
    rows.map((row) => getStringValue(row, "member_id")),
  );

  return Promise.all(rows.map(async (row): Promise<AdminPurchase | null> => {
    const purchase = parseMasterClassPurchase(row);
    const memberId = getStringValue(row, "member_id");

    if (!purchase) {
      return null;
    }

    let slipUrl: string | null = null;

    if (purchase.slipStoragePath) {
      const { data: signedUrl } = await supabase.storage
        .from("course-payment-slips")
        .createSignedUrl(purchase.slipStoragePath, 60 * 15);

      slipUrl = signedUrl?.signedUrl ?? null;
    }

    return {
      ...purchase,
      ...(attributionByMemberId.get(memberId) ?? parseMasterClassBuyerAttribution(null)),
      memberEmail: typeof row.member_email === "string" ? row.member_email : "",
      memberId,
      memberName: typeof row.member_name === "string" ? row.member_name : "",
      slipUrl,
    };
  })).then((rows) => rows.filter((row): row is AdminPurchase => Boolean(row)));
}

function NoticeBanner({ notice }: { notice: ReturnType<typeof getNotice> }) {
  if (!notice) {
    return null;
  }

  const className = {
    error: "border-red-300/18 bg-red-300/8 text-red-100/84",
    success: "border-emerald-200/18 bg-emerald-200/8 text-emerald-100/84",
    warning: "border-[#F6E3A3]/18 bg-[#F6E3A3]/8 text-[#F6E3A3]/84",
  }[notice.tone];

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${className}`} role={notice.tone === "success" ? "status" : "alert"}>
      {notice.message}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/8 bg-[#171717] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase text-white/34">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <Icon aria-hidden="true" className="size-4 text-white/38" />
      </div>
    </article>
  );
}

function PurchaseCard({ purchase }: { purchase: AdminPurchase }) {
  const statusView = getPurchaseStatusView(purchase.status);
  const isPending = purchase.status === "pending_review";
  const sponsorLabel = purchase.sponsorAccessCode
    ? purchase.sponsorAccessCode
    : "Unknown";
  const commissionLabel = purchase.commissionOwnerAccessCode
    ? purchase.commissionOwnerAccessCode
    : "No sponsor";

  return (
    <article className="rounded-2xl border border-white/8 bg-[#171717] p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.62fr)]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-bold text-white/58">
              {statusView.label}
            </span>
            <span className="font-mono text-xs font-semibold text-white/42">{purchase.referenceCode}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-white">{purchase.memberName || "Elite Gold Member"}</h2>
          <p className="mt-1 break-all text-sm text-white/42">{purchase.memberEmail}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-2">
              <p className="text-[0.62rem] font-bold uppercase text-white/30">Amount</p>
              <p className="mt-1 text-sm font-semibold text-white/72">{formatThaiBaht(purchase.amountThb)}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-2">
              <p className="text-[0.62rem] font-bold uppercase text-white/30">Submitted</p>
              <p className="mt-1 text-sm font-semibold text-white/72">{purchase.submittedAt ?? "Not submitted"}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-2">
              <p className="text-[0.62rem] font-bold uppercase text-white/30">Slip</p>
              {purchase.slipUrl ? (
                <a className="mt-1 inline-flex text-sm font-semibold text-[#F6E3A3]/80 underline-offset-4 hover:underline" href={purchase.slipUrl} rel="noreferrer" target="_blank">
                  Open slip
                </a>
              ) : (
                <p className="mt-1 text-sm font-semibold text-white/42">No slip</p>
              )}
            </div>
            <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-2">
              <p className="text-[0.62rem] font-bold uppercase text-white/30">Member Code</p>
              <p className="mt-1 font-mono text-sm font-semibold text-white/72">{purchase.buyerAccessCode ?? "Unknown"}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-2">
              <p className="text-[0.62rem] font-bold uppercase text-white/30">Sponsor Code</p>
              <p className="mt-1 font-mono text-sm font-semibold text-white/72">{sponsorLabel}</p>
            </div>
            <div className="rounded-xl border border-[#F6E3A3]/14 bg-[#F6E3A3]/8 px-3 py-2">
              <p className="text-[0.62rem] font-bold uppercase text-[#F6E3A3]/48">Commission To</p>
              <p className="mt-1 font-mono text-sm font-semibold text-[#F6E3A3]/86">{commissionLabel}</p>
            </div>
          </div>
          {purchase.reviewReason ? (
            <p className="mt-4 rounded-xl border border-red-300/16 bg-red-300/8 px-3 py-2 text-sm leading-6 text-red-100/76">
              {purchase.reviewReason}
            </p>
          ) : null}
        </div>

        <div className="grid content-start gap-3">
          {isPending ? (
            <>
              <form action={approveMasterClassPurchaseAction}>
                <input name="purchaseId" type="hidden" value={purchase.id} />
                <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200/20 bg-emerald-200/10 px-4 text-sm font-bold text-emerald-100 transition hover:bg-emerald-200/14" type="submit">
                  <CheckCircle2 aria-hidden="true" className="size-4" />
                  Approve
                </button>
              </form>
              <form action={rejectMasterClassPurchaseAction} className="grid gap-2">
                <input name="purchaseId" type="hidden" value={purchase.id} />
                <label className="grid gap-2 text-sm font-semibold text-white/72">
                  Rejection reason
                  <textarea className="min-h-20 resize-y rounded-xl border border-white/10 bg-black/28 px-3 py-2 text-sm leading-6 text-white/78 outline-none focus:border-white/24" maxLength={300} name="reason" required />
                </label>
                <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-300/18 bg-red-300/8 px-4 text-sm font-bold text-red-100 transition hover:bg-red-300/12" type="submit">
                  <XCircle aria-hidden="true" className="size-4" />
                  Reject
                </button>
              </form>
            </>
          ) : (
            <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-3 text-sm leading-6 text-white/50">
              No review action available for this status.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const notice = getNotice(getFirstSearchParam(params.notice));
  const purchases = await getAdminPurchases();
  const pendingCount = purchases.filter((purchase) => purchase.status === "pending_review").length;
  const approvedCount = purchases.filter((purchase) => purchase.status === "approved").length;
  const rejectedCount = purchases.filter((purchase) => purchase.status === "rejected").length;

  return (
    <>
      <section className="rounded-2xl border border-white/8 bg-[#171717] p-5 sm:p-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-bold uppercase text-[#F6E3A3]/78">
          <ReceiptText aria-hidden="true" className="size-3.5" />
          Master Class Reviews
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-white">Manual purchase approval</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/52">
          Review active transfer slips, approve Master Class access, or reject with an email reason. Expired checkout statuses are archived from this active queue.
        </p>
      </section>

      <NoticeBanner notice={notice} />

      <section className="grid gap-3 md:grid-cols-3" aria-label="Purchase review summary">
        <StatCard icon={Clock3} label="Pending" value={String(pendingCount)} />
        <StatCard icon={CheckCircle2} label="Approved" value={String(approvedCount)} />
        <StatCard icon={XCircle} label="Rejected" value={String(rejectedCount)} />
      </section>

      <section className="grid gap-3" aria-label="Purchase requests">
        {purchases.length > 0 ? (
          purchases.map((purchase) => <PurchaseCard key={purchase.id} purchase={purchase} />)
        ) : (
          <div className="rounded-2xl border border-white/8 bg-[#171717] p-8 text-center">
            <FileSearch aria-hidden="true" className="mx-auto size-7 text-white/34" />
            <h2 className="mt-4 text-lg font-semibold text-white">No purchase requests yet</h2>
            <p className="mt-2 text-sm text-white/42">Master Class transfer requests will appear here after members upload slips.</p>
          </div>
        )}
      </section>
    </>
  );
}
