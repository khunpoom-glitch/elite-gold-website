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
    <section className="-m-4 min-h-[calc(100svh-4rem)] overflow-hidden sm:-m-6">
      <div className="relative grid min-h-[calc(100svh-4rem)] place-items-center px-4 py-5 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(246,227,163,0.10),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_42%)]" />

        <div aria-hidden="true" className="absolute inset-0 overflow-hidden opacity-70 blur-[2.5px]">
          <div className="mx-auto grid max-w-6xl gap-4 p-4 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="member-surface h-56 p-5">
                <div className="h-3 w-28 rounded-full bg-white/10" />
                <div className="mt-8 h-7 w-72 max-w-full rounded-full bg-white/12" />
                <div className="mt-5 h-3 w-4/5 rounded-full bg-white/7" />
                <div className="mt-3 h-3 w-2/3 rounded-full bg-white/7" />
                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="h-16 rounded-2xl bg-white/7" />
                  <div className="h-16 rounded-2xl bg-white/7" />
                  <div className="h-16 rounded-2xl bg-white/7" />
                </div>
              </div>
              <div className="member-surface-soft hidden h-56 p-5 lg:block">
                <div className="h-3 w-24 rounded-full bg-white/10" />
                <div className="mt-8 grid gap-3">
                  <div className="h-12 rounded-xl bg-white/7" />
                  <div className="h-12 rounded-xl bg-white/7" />
                  <div className="h-12 rounded-xl bg-white/7" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="member-surface-soft h-40 p-5">
                <div className="h-3 w-20 rounded-full bg-white/10" />
                <div className="mt-7 h-6 w-28 rounded-full bg-white/12" />
                <div className="mt-5 h-3 w-full rounded-full bg-white/7" />
              </div>
              <div className="member-surface-soft h-40 p-5">
                <div className="h-3 w-24 rounded-full bg-white/10" />
                <div className="mt-7 h-6 w-32 rounded-full bg-white/12" />
                <div className="mt-5 h-3 w-4/5 rounded-full bg-white/7" />
              </div>
              <div className="member-surface-soft h-40 p-5">
                <div className="h-3 w-20 rounded-full bg-white/10" />
                <div className="mt-7 h-6 w-24 rounded-full bg-white/12" />
                <div className="mt-5 h-3 w-5/6 rounded-full bg-white/7" />
              </div>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="absolute inset-0 bg-[#1D1D1D]/58 backdrop-blur-[7px]" />

        <div className="admin-verification-overlay pointer-events-none fixed bottom-16 right-0 top-16 z-30 grid place-items-center px-4 py-5 sm:px-6 lg:bottom-0 lg:px-8">
          <div className="pointer-events-auto w-full max-w-[26rem] rounded-[1.35rem] border border-white/10 bg-[#171717]/92 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.58)] backdrop-blur-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#F6E3A3]/18 bg-[#F6E3A3]/7 px-3 py-1 text-[0.68rem] font-bold uppercase text-[#F6E3A3]/82">
                  <ShieldCheck aria-hidden="true" className="size-3.5" />
                  Admin Verification
                </span>
                <h1 className="mt-4 text-2xl font-semibold text-white">Enter the 6-digit code</h1>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/30 text-[#F6E3A3]/72">
                {challenge.ok && challenge.state === "sent" ? (
                  <MailCheck aria-hidden="true" className="size-4" />
                ) : (
                  <LockKeyhole aria-hidden="true" className="size-4" />
                )}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/52">
              Code sent to {admin.email}. Verification stays active for 60 minutes on this device.
            </p>

            <div className="mt-5 grid gap-3">
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

              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <h2 className="text-sm font-semibold text-white">
                  {challenge.ok && challenge.state === "sent" ? "Code sent" : "Secure admin access"}
                </h2>
                <p className="mt-1 text-xs leading-5 text-white/42">
                  Expires in 10 minutes and locks after repeated failed attempts.
                </p>
              </div>
            </div>

            {activeChallenge && canEnterCode ? (
              <form action={verifyAdminCodeAction} className="mt-5 grid gap-4">
                <input name="next" type="hidden" value={nextPath} />
                <input name="challengeId" type="hidden" value={activeChallenge.challengeId} />
                <input name="codeSalt" type="hidden" value={activeChallenge.codeSalt} />
                <label className="grid gap-2 text-sm font-semibold text-white/72">
                  6-digit code
                  <input
                    autoComplete="one-time-code"
                    className="h-12 rounded-xl border border-white/10 bg-black/36 px-4 text-center font-mono text-xl font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-[#F6E3A3]/44 focus:bg-black/48"
                    inputMode="numeric"
                    maxLength={6}
                    name="code"
                    pattern="[0-9]{6}"
                    placeholder="000000"
                    required
                    type="text"
                  />
                </label>
                <button className="member-shimmer-action inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50" type="submit">
                  <KeyRound aria-hidden="true" className="size-4" />
                  Verify Admin Access
                </button>
              </form>
            ) : null}

            <form action={resendAdminVerificationCodeAction} className="mt-3">
              <input name="next" type="hidden" value={nextPath} />
              <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm font-bold text-white/68 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35" type="submit">
                <RefreshCw aria-hidden="true" className="size-4" />
                Resend Code
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
