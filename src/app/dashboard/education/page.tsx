import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { masterClassBankTransfer, masterClassCourse } from "@/config/education";
import {
  formatThaiBaht,
  getMasterClassPurchaseCta,
  getPurchaseStatusView,
  parseMasterClassPurchase,
  type CoursePurchaseStatus,
  type MasterClassPurchase,
} from "@/lib/education/purchase";
import { getActiveMemberOrRedirect } from "@/lib/member/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  startMasterClassPurchaseAction,
  uploadMasterClassSlipAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Education",
};

type EducationPageProps = {
  searchParams: Promise<{
    notice?: string | string[];
  }>;
};

type Entitlement = {
  grantedAt: string;
};

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getNotice(notice?: string) {
  switch (notice) {
    case "purchase_started":
      return {
        message: "Purchase request created. Use the bank-transfer details below and upload your slip after payment.",
        tone: "success" as const,
      };
    case "purchase_existing":
      return {
        message: "You already have an active Master Class purchase request.",
        tone: "warning" as const,
      };
    case "slip_submitted":
      return {
        message: "Transfer slip submitted. The Elite Gold team will review it and notify you by email.",
        tone: "success" as const,
      };
    case "slip_required":
      return {
        message: "Please choose a transfer slip before submitting.",
        tone: "warning" as const,
      };
    case "slip_invalid_type":
      return {
        message: "Transfer slip must be a JPG, PNG, WebP, or PDF file.",
        tone: "warning" as const,
      };
    case "slip_too_large":
      return {
        message: "Transfer slip must be 5MB or smaller.",
        tone: "warning" as const,
      };
    case "purchase_locked":
      return {
        message: "This purchase is currently locked for review. Please wait for the team decision.",
        tone: "warning" as const,
      };
    case "purchase_error":
    case "slip_error":
      return {
        message: "Unable to update the Master Class purchase right now. Please try again in a moment.",
        tone: "error" as const,
      };
    default:
      return null;
  }
}

async function getMasterClassPurchase(memberId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      entitlement: null,
      purchase: null,
    };
  }

  const [{ data: purchaseData, error: purchaseError }, { data: entitlementData, error: entitlementError }] =
    await Promise.all([
      supabase
        .from("course_purchase_requests")
        .select("id,reference_code,amount_thb,status,slip_storage_path,slip_file_name,submitted_at,review_reason,created_at,updated_at")
        .eq("member_id", memberId)
        .eq("course_slug", masterClassCourse.slug)
        .maybeSingle(),
      supabase
        .from("course_entitlements")
        .select("granted_at")
        .eq("member_id", memberId)
        .eq("course_slug", masterClassCourse.slug)
        .maybeSingle(),
    ]);

  if (purchaseError) {
    console.error("[education] Failed to load Master Class purchase.", purchaseError);
  }

  if (entitlementError) {
    console.error("[education] Failed to load Master Class entitlement.", entitlementError);
  }

  return {
    entitlement: entitlementData && typeof entitlementData.granted_at === "string"
      ? { grantedAt: entitlementData.granted_at } satisfies Entitlement
      : null,
    purchase: parseMasterClassPurchase(purchaseData),
  };
}

function getEffectiveStatus(
  purchase: MasterClassPurchase | null,
  entitlement: Entitlement | null,
): CoursePurchaseStatus | null {
  if (entitlement || purchase?.status === "approved") {
    return "approved";
  }

  return purchase?.status ?? null;
}

function StatusBadge({ status }: { status: CoursePurchaseStatus | null }) {
  const view = getPurchaseStatusView(status);
  const toneClass = {
    danger: "border-red-300/18 bg-red-300/8 text-red-100/82",
    neutral: "border-white/10 bg-white/[0.035] text-white/62",
    success: "border-emerald-200/20 bg-emerald-200/8 text-emerald-100/82",
    warning: "border-[#F6E3A3]/20 bg-[#F6E3A3]/8 text-[#F6E3A3]/82",
  }[view.tone];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${toneClass}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {view.label}
    </span>
  );
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

function StartPurchaseForm() {
  return (
    <form action={startMasterClassPurchaseAction}>
      <button className="member-shimmer-action inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:border-white/24 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/32" type="submit">
        Buy Master Class
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </form>
  );
}

function UploadSlipForm({ purchase }: { purchase: MasterClassPurchase }) {
  return (
    <form action={uploadMasterClassSlipAction} className="grid gap-3">
      <input name="purchaseId" type="hidden" value={purchase.id} />
      <label className="grid gap-2 text-sm font-semibold text-white/76">
        Transfer slip
        <input
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="block w-full rounded-xl border border-white/10 bg-black/32 px-3 py-2 text-sm text-white/72 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/28"
          name="slip"
          required
          type="file"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-white/76">
        Transfer note
        <textarea
          className="min-h-20 resize-y rounded-xl border border-white/10 bg-black/32 px-3 py-2 text-sm leading-6 text-white/78 outline-none transition placeholder:text-white/26 focus:border-white/24"
          maxLength={280}
          name="transferNote"
          placeholder="Optional: transfer time, sender name, or bank note"
        />
      </label>
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/14 bg-white px-4 text-sm font-bold text-black transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/32" type="submit">
        <UploadCloud aria-hidden="true" className="size-4" />
        Submit Slip
      </button>
    </form>
  );
}

function PurchasePanel({
  entitlement,
  purchase,
  status,
}: {
  entitlement: Entitlement | null;
  purchase: MasterClassPurchase | null;
  status: CoursePurchaseStatus | null;
}) {
  const cta = getMasterClassPurchaseCta(status);
  const view = getPurchaseStatusView(status);

  return (
    <aside className="member-surface-soft p-4 lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase text-white/36">Course Access</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{formatThaiBaht(masterClassCourse.priceThb)}</h2>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-white/48">{view.description}</p>

      <div className="mt-5 grid gap-2 rounded-xl border border-white/8 bg-black/26 p-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-white/42">Reference</span>
          <span className="font-mono font-semibold text-white/78">{purchase?.referenceCode ?? "Created after purchase"}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-white/42">Review</span>
          <span className="font-semibold text-white/72">{entitlement ? "Approved" : getPurchaseStatusView(status).label}</span>
        </div>
      </div>

      <div className="mt-5">
        {cta.action === "start_purchase" ? <StartPurchaseForm /> : null}
        {cta.action === "upload_slip" && purchase ? <UploadSlipForm purchase={purchase} /> : null}
        {cta.action === "wait_for_review" ? (
          <button className="inline-flex h-11 w-full cursor-default items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm font-bold text-white/48" disabled type="button">
            {cta.label}
          </button>
        ) : null}
        {cta.action === "start_learning" ? (
          <a className="member-shimmer-action inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold" href="#syllabus">
            {cta.label}
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </div>

      {purchase?.status === "rejected" && purchase.reviewReason ? (
        <div className="mt-4 rounded-xl border border-red-300/16 bg-red-300/8 px-3 py-3 text-sm leading-6 text-red-100/78">
          {purchase.reviewReason}
        </div>
      ) : null}
    </aside>
  );
}

function BankTransferPanel({ purchase }: { purchase: MasterClassPurchase | null }) {
  if (!purchase || purchase.status === "approved") {
    return null;
  }

  return (
    <section className="member-surface p-5 sm:p-6" aria-label="Bank transfer instructions">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(18rem,0.5fr)]">
        <div>
          <span className="member-kicker">
            <ReceiptText aria-hidden="true" className="size-3.5" />
            Bank Transfer
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-white">Transfer instructions</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/52">
            Transfer the exact amount, keep your receipt, and upload the slip for team review. Approval is manual and will also be sent by email.
          </p>
        </div>
        <div className="grid gap-2 rounded-2xl border border-white/8 bg-black/26 p-4">
          {[
            ["Amount", formatThaiBaht(masterClassBankTransfer.amountThb)],
            ["Bank", masterClassBankTransfer.bankName],
            ["Account Name", masterClassBankTransfer.accountName],
            ["Account No.", masterClassBankTransfer.accountNumber],
            ["Reference", purchase.referenceCode],
          ].map(([label, value]) => (
            <div className="flex items-start justify-between gap-4 border-b border-white/7 py-2 last:border-b-0" key={label}>
              <span className="text-xs font-bold uppercase text-white/34">{label}</span>
              <span className="text-right text-sm font-semibold text-white/76">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function DashboardEducationPage({ searchParams }: EducationPageProps) {
  const params = await searchParams;
  const notice = getNotice(getFirstSearchParam(params.notice));
  const { profile } = await getActiveMemberOrRedirect("/dashboard/education");
  const { entitlement, purchase } = await getMasterClassPurchase(profile.id);
  const status = getEffectiveStatus(purchase, entitlement);
  const stats = [
    ["Level", masterClassCourse.level],
    ["Duration", masterClassCourse.duration],
    ["Lessons", String(masterClassCourse.lessonCount)],
    ["Resources", String(masterClassCourse.resourceCount)],
  ];

  return (
    <section className="grid gap-5 p-4 sm:p-6">
      <header className="member-surface overflow-hidden p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] lg:items-start">
          <div className="max-w-4xl">
            <span className="member-kicker">
              <GraduationCap aria-hidden="true" className="size-3.5" />
              Trading Education
            </span>
            <div className="mt-6 flex items-start gap-4">
              <span className="relative hidden size-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 sm:grid sm:place-items-center">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="object-contain p-2"
                  fill
                  sizes="56px"
                  src="/brand/elite-gold-mark.png"
                />
              </span>
              <div className="min-w-0">
                <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  {masterClassCourse.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-white/56">
                  {masterClassCourse.description}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(([label, value]) => (
                <div className="rounded-xl border border-white/8 bg-black/24 px-4 py-3" key={label}>
                  <p className="text-[0.66rem] font-bold uppercase text-white/34">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-white/78">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <PurchasePanel entitlement={entitlement} purchase={purchase} status={status} />
        </div>
      </header>

      <NoticeBanner notice={notice} />

      <BankTransferPanel purchase={purchase} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.88fr)_minmax(18rem,0.42fr)]" aria-label="Master Class detail">
        <div className="grid gap-5">
          <article className="member-surface p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="member-kicker">
                  <ShieldCheck aria-hidden="true" className="size-3.5" />
                  Outcomes
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-white">What members learn</h2>
              </div>
              <LockKeyhole aria-hidden="true" className="mt-1 size-5 shrink-0 text-white/32" />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {masterClassCourse.outcomes.map((outcome) => (
                <div className="flex min-h-16 items-start gap-3 rounded-xl border border-white/8 bg-black/24 px-4 py-3" key={outcome}>
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-100/70" />
                  <p className="text-sm leading-6 text-white/64">{outcome}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="member-surface p-5 sm:p-6" id="syllabus">
            <span className="member-kicker">
              <BookOpen aria-hidden="true" className="size-3.5" />
              Syllabus
            </span>
            <div className="mt-5 grid gap-3">
              {masterClassCourse.modules.map((module, index) => (
                <section className="rounded-xl border border-white/8 bg-black/24 p-4" key={module.title}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.66rem] font-bold uppercase text-white/34">Module {index + 1}</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{module.title}</h3>
                    </div>
                    <FileText aria-hidden="true" className="size-4 shrink-0 text-white/32" />
                  </div>
                  <ul className="mt-4 grid gap-2 text-sm leading-6 text-white/58">
                    {module.lessons.map((lesson) => (
                      <li className="flex gap-2" key={lesson}>
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-white/38" />
                        {lesson}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 rounded-lg border border-white/8 bg-[#171717]/70 px-3 py-2 text-xs font-semibold text-white/52">
                    Resource: {module.resource}
                  </p>
                </section>
              ))}
            </div>
          </article>
        </div>

        <aside className="grid content-start gap-5">
          <section className="member-surface-soft p-4">
            <p className="text-[0.68rem] font-bold uppercase text-white/36">Member State</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-3">
                <p className="text-xs font-bold uppercase text-white/32">Access</p>
                <p className="mt-1 text-sm font-semibold text-white/74">{getPurchaseStatusView(status).label}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-3">
                <p className="text-xs font-bold uppercase text-white/32">Last Update</p>
                <p className="mt-1 text-sm font-semibold text-white/74">
                  {entitlement?.grantedAt || purchase?.updatedAt || "No purchase yet"}
                </p>
              </div>
              <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-3">
                <p className="text-xs font-bold uppercase text-white/32">Slip</p>
                <p className="mt-1 break-words text-sm font-semibold text-white/74">
                  {purchase?.slipFileName || "Not submitted"}
                </p>
              </div>
            </div>
          </section>

          <section className="member-surface-soft p-4">
            <div className="flex items-start gap-3">
              <Clock3 aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#F6E3A3]/70" />
              <div>
                <h2 className="text-base font-semibold text-white">Manual approval rhythm</h2>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  Transfer slips are reviewed by the Elite Gold team. Approval or rejection is reflected here and sent to your email.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
