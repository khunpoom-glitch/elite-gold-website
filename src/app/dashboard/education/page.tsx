import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { masterClassBankTransfer, masterClassCourse } from "@/config/education";
import {
  formatThaiBaht,
  getMasterClassCheckoutHref,
  getMasterClassCheckoutStage,
  parseMasterClassPurchase,
  type CoursePurchaseStatus,
  type MasterClassCheckoutStage,
  type MasterClassPurchase,
} from "@/lib/education/purchase";
import { getActiveMemberOrRedirect } from "@/lib/member/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  uploadMasterClassSlipAction,
} from "./actions";
import { BuyMasterClassButton } from "./buy-master-class-button";
import { CheckoutModalFrame } from "./checkout-modal-frame";
import { StartPurchaseForm } from "./start-purchase-form";

export const metadata: Metadata = {
  title: "Education",
};

type EducationPageProps = {
  searchParams: Promise<{
    checkout?: string | string[];
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
    case "course_unlocked":
      return {
        message: "Your Master Class access is ready.",
        tone: "success" as const,
      };
    case "purchase_started":
      return {
        message: "Your payment reference is ready. Transfer by bank and upload the slip in this checkout window.",
        tone: "success" as const,
      };
    case "purchase_existing":
      return {
        message: "Continue from the checkout step below.",
        tone: "success" as const,
      };
    case "slip_submitted":
      return {
        message: "We received your transfer slip. The Elite Gold team will email you after review.",
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
        message: "We already received your slip. The team will follow up by email after review.",
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
        .select("id,reference_code,amount_thb,status,slip_storage_path,slip_file_name,submitted_at,review_reason,created_at,updated_at,expires_at,archived_at")
        .eq("member_id", memberId)
        .eq("course_slug", masterClassCourse.slug)
        .is("archived_at", null)
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

function CourseActionCard({
  checkoutHref,
  entitlement,
}: {
  checkoutHref: string;
  entitlement: Entitlement | null;
}) {
  return (
    <aside className="member-surface-soft p-4 lg:sticky lg:top-24">
      <p className="text-[0.68rem] font-bold uppercase text-white/36">Course Access</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{formatThaiBaht(masterClassCourse.priceThb)}</h2>
      <p className="mt-3 text-sm leading-6 text-white/48">
        Full Master Class access, lesson resources, and member-only learning materials.
      </p>
      <div className="mt-5">
        {entitlement ? (
          <Link className="member-shimmer-action inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold" href="#syllabus" scroll={false}>
            Start Learning
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : (
          <BuyMasterClassButton checkoutHref={checkoutHref} />
        )}
      </div>
    </aside>
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
          className="min-h-16 resize-y rounded-xl border border-white/10 bg-black/32 px-3 py-2 text-sm leading-6 text-white/78 outline-none transition placeholder:text-white/26 focus:border-white/24"
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

function TransferDetails({ purchase }: { purchase: MasterClassPurchase }) {
  return (
    <div className="grid gap-1 rounded-xl border border-white/8 bg-black/26 p-3">
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
  );
}

function CheckoutBody({
  entitlement,
  purchase,
  stage,
}: {
  entitlement: Entitlement | null;
  purchase: MasterClassPurchase | null;
  stage: MasterClassCheckoutStage;
}) {
  if (stage === "learning" || entitlement) {
    return (
      <div className="grid gap-4">
        <p className="text-sm leading-7 text-white/58">
          Master Class access is ready for this account.
        </p>
        <Link className="member-shimmer-action inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold" href="/dashboard/education#syllabus" scroll={false}>
          Start Learning
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    );
  }

  if (stage === "receipt_received") {
    return (
      <div className="grid gap-4">
        <div className="rounded-2xl border border-emerald-200/16 bg-emerald-200/8 p-4">
          <CheckCircle2 aria-hidden="true" className="size-5 text-emerald-100/76" />
          <h3 className="mt-3 text-lg font-semibold text-white">Slip received</h3>
          <p className="mt-2 text-sm leading-7 text-white/56">
            The team will review your transfer and email you after the decision. You can close this window and continue browsing the course details.
          </p>
        </div>
        <Link className="inline-flex h-11 items-center justify-center rounded-xl border border-white/12 bg-white px-4 text-sm font-bold text-black transition hover:bg-white/90" href="/dashboard/education" scroll={false}>
          Close Checkout
        </Link>
      </div>
    );
  }

  if ((stage === "payment_upload" || stage === "resubmission") && purchase) {
    return (
      <div className="grid gap-4">
        <div>
          <p className="text-sm leading-7 text-white/56">
            Transfer the exact amount, keep your receipt, and upload the slip in this checkout window.
            {stage === "resubmission" ? " If the team requested a correction, submit the corrected slip here." : ""}
          </p>
        </div>
        <TransferDetails purchase={purchase} />
        <UploadSlipForm purchase={purchase} />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-7 text-white/56">
        Open a secure manual checkout reference for Master Class. Bank-transfer details will appear here after the reference is created.
      </p>
      <StartPurchaseForm label="Create Payment Reference" />
    </div>
  );
}

function CheckoutModal({
  entitlement,
  notice,
  open,
  purchase,
  stage,
}: {
  entitlement: Entitlement | null;
  notice: ReturnType<typeof getNotice>;
  open: boolean;
  purchase: MasterClassPurchase | null;
  stage: MasterClassCheckoutStage;
}) {
  if (!open) {
    return null;
  }

  return (
    <CheckoutModalFrame closeHref="/dashboard/education" labelledBy="master-class-checkout-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="member-kicker">
            <ReceiptText aria-hidden="true" className="size-3.5" />
            Master Class Checkout
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-white" id="master-class-checkout-title">
            {masterClassCourse.title}
          </h2>
        </div>
        <Link
          aria-label="Close checkout"
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/58 transition hover:border-white/18 hover:text-white"
          href="/dashboard/education"
          scroll={false}
        >
          <X aria-hidden="true" className="size-4" />
        </Link>
      </div>
      {notice ? (
        <div className="mt-4">
          <NoticeBanner notice={notice} />
        </div>
      ) : null}
      <div className="mt-4">
        <CheckoutBody entitlement={entitlement} purchase={purchase} stage={stage} />
      </div>
    </CheckoutModalFrame>
  );
}

export default async function DashboardEducationPage({ searchParams }: EducationPageProps) {
  const params = await searchParams;
  const notice = getNotice(getFirstSearchParam(params.notice));
  const { profile } = await getActiveMemberOrRedirect("/dashboard/education");
  const { entitlement, purchase } = await getMasterClassPurchase(profile.id);
  const status = getEffectiveStatus(purchase, entitlement);
  const checkoutStage = getMasterClassCheckoutStage(status);
  const checkoutHref = getMasterClassCheckoutHref();
  const isCheckoutOpen = getFirstSearchParam(params.checkout) === "1" || Boolean(notice);
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
          <CourseActionCard checkoutHref={checkoutHref} entitlement={entitlement} />
        </div>
      </header>

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
            <p className="text-[0.68rem] font-bold uppercase text-white/36">Course Format</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-3">
                <p className="text-xs font-bold uppercase text-white/32">Lessons</p>
                <p className="mt-1 text-sm font-semibold text-white/74">{masterClassCourse.lessonCount} guided sessions</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-3">
                <p className="text-xs font-bold uppercase text-white/32">Resources</p>
                <p className="mt-1 text-sm font-semibold text-white/74">{masterClassCourse.resourceCount} templates and checklists</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-black/24 px-3 py-3">
                <p className="text-xs font-bold uppercase text-white/32">Rhythm</p>
                <p className="mt-1 text-sm font-semibold text-white/74">{masterClassCourse.duration}</p>
              </div>
            </div>
          </section>

          <section className="member-surface-soft p-4">
            <div className="flex items-start gap-3">
              <BookOpen aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#F6E3A3]/70" />
              <div>
                <h2 className="text-base font-semibold text-white">Built for review</h2>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  Lessons are designed to connect with journal habits, weekly review, and disciplined decision-making.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>
      <CheckoutModal
        entitlement={entitlement}
        notice={notice}
        open={isCheckoutOpen}
        purchase={purchase}
        stage={checkoutStage}
      />
    </section>
  );
}
