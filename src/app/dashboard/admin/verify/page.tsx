import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, KeyRound, LockKeyhole, MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { getAuthenticatedAdmin } from "@/lib/admin/session";
import {
  adminVerificationPath,
  getSafeAdminNextPath,
  hasValidAdminVerificationCookie,
  issueAdminVerificationChallenge,
} from "@/lib/admin/verification";
import {
  resendAdminVerificationCodeAction,
  verifyAdminCodeAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Admin Verification",
};

type AdminVerifyPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    notice?: string | string[];
  }>;
};

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getNotice(notice?: string) {
  switch (notice) {
    case "sent":
      return { message: "A new 6-digit code was sent to your admin email.", tone: "success" as const };
    case "active":
    case "cooldown":
      return { message: "Use the latest code that was already sent to your admin email.", tone: "warning" as const };
    case "expired":
      return { message: "That code has expired. Request a new admin code.", tone: "warning" as const };
    case "invalid":
      return { message: "The code is not correct. Check your email and try again.", tone: "warning" as const };
    case "locked":
      return { message: "Too many attempts. Admin verification is temporarily locked.", tone: "error" as const };
    case "email_error":
      return { message: "The code could not be emailed right now. Try resending in a moment.", tone: "error" as const };
    case "config_error":
    case "verification_error":
      return { message: "Admin verification is unavailable right now.", tone: "error" as const };
    default:
      return null;
  }
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

export default async function AdminVerifyPage({ searchParams }: AdminVerifyPageProps) {
  const params = await searchParams;
  const nextPath = getSafeAdminNextPath(getFirstSearchParam(params.next));
  const notice = getNotice(getFirstSearchParam(params.notice));
  const { admin, supabase, user } = await getAuthenticatedAdmin(adminVerificationPath);
  const isVerified = await hasValidAdminVerificationCookie({
    admin,
    userId: user.id,
  });

  if (isVerified) {
    redirect(nextPath);
  }

  const challenge = await issueAdminVerificationChallenge({
    admin,
    supabase,
    user,
  });
  const activeChallenge = challenge.challenge;
  const canEnterCode = challenge.ok || Boolean(activeChallenge);

  return (
    <section className="mx-auto grid w-full max-w-2xl gap-4">
      <div className="member-surface overflow-hidden p-5 sm:p-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-bold uppercase text-[#F6E3A3]/78">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          Admin Verification
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-white">Enter the 6-digit code</h1>
        <p className="mt-3 text-sm leading-7 text-white/52">
          We sent a one-time admin code to {admin.email}. Verification stays active for 60 minutes on this device.
        </p>
      </div>

      <NoticeBanner notice={notice} />

      {!challenge.ok ? (
        <div className="rounded-2xl border border-red-300/18 bg-red-300/8 px-4 py-3 text-sm font-medium text-red-100/84" role="alert">
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              {challenge.reason === "locked"
                ? "Admin verification is temporarily locked. Try again after the lock window."
                : "We could not prepare admin verification right now."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="member-surface-soft grid gap-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/28 text-[#F6E3A3]/72">
            {challenge.ok && challenge.state === "sent" ? (
              <MailCheck aria-hidden="true" className="size-4" />
            ) : (
              <LockKeyhole aria-hidden="true" className="size-4" />
            )}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {challenge.ok && challenge.state === "sent" ? "Code sent" : "Secure admin access"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-white/44">
              The code expires in 10 minutes and locks after repeated failed attempts.
            </p>
          </div>
        </div>

        {activeChallenge && canEnterCode ? (
          <form action={verifyAdminCodeAction} className="grid gap-4">
            <input name="next" type="hidden" value={nextPath} />
            <input name="challengeId" type="hidden" value={activeChallenge.challengeId} />
            <input name="codeSalt" type="hidden" value={activeChallenge.codeSalt} />
            <label className="grid gap-2 text-sm font-semibold text-white/72">
              6-digit code
              <input
                autoComplete="one-time-code"
                className="h-12 rounded-xl border border-white/10 bg-black/32 px-4 text-center font-mono text-xl font-semibold tracking-[0.28em] text-white outline-none transition placeholder:tracking-normal placeholder:text-white/20 focus:border-[#F6E3A3]/34"
                inputMode="numeric"
                maxLength={6}
                name="code"
                pattern="[0-9]{6}"
                placeholder="000000"
                required
                type="text"
              />
            </label>
            <button className="member-shimmer-action inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold" type="submit">
              <KeyRound aria-hidden="true" className="size-4" />
              Verify Admin Access
            </button>
          </form>
        ) : null}

        <form action={resendAdminVerificationCodeAction}>
          <input name="next" type="hidden" value={nextPath} />
          <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm font-bold text-white/68 transition hover:bg-white/[0.07] hover:text-white" type="submit">
            <RefreshCw aria-hidden="true" className="size-4" />
            Resend Code
          </button>
        </form>
      </div>
    </section>
  );
}
