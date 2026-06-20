import type { Metadata } from "next";
import { KeyRound, MailCheck, ReceiptText, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { EmailVerificationBanner } from "@/components/dashboard/email-verification-banner";
import { MemberProfileForm } from "@/components/dashboard/member-profile-form";
import { getAuthenticatedMember } from "@/lib/member/session";

export const metadata: Metadata = {
  title: "My Account",
};

function formatEmailStatus(emailConfirmedAt: string | null) {
  return emailConfirmedAt ? "Email confirmed" : "Pending confirmation";
}

type AccountPageProps = {
  searchParams: Promise<{
    notice?: string | string[];
    verified?: string | string[];
  }>;
};

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getAccountNotice(verified?: string, notice?: string) {
  if (verified === "email") {
    return {
      message: "Email verified successfully. Your member status is Active.",
      tone: "success" as const,
    };
  }

  if (notice === "verify_required") {
    return {
      message: "Please verify your email before opening member features.",
      tone: "warning" as const,
    };
  }

  if (notice === "verification_expired") {
    return {
      message: "This verification link has expired. Send a new verification email below.",
      tone: "warning" as const,
    };
  }

  if (notice === "verification_invalid") {
    return {
      message: "This verification link is invalid or has already been used. Send a new verification email below.",
      tone: "warning" as const,
    };
  }

  return null;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const accountNotice = getAccountNotice(
    getFirstSearchParam(params.verified),
    getFirstSearchParam(params.notice),
  );
  const { isMemberActive, memberStatus, profile } = await getAuthenticatedMember("/dashboard/account");

  return (
    <section className="grid gap-6">
      <header className="rounded-md border border-white/10 bg-black/68 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/24 bg-gold/10 px-3 py-1 text-xs font-bold uppercase text-soft-gold">
            <UserRound aria-hidden="true" className="size-3.5" />
            My Account
          </div>
          <h1 className="elite-display-type mt-4 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Profile, security, and member record
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Manage the editable profile fields from Phase 2 signup. Payment, billing, membership upgrades, and affiliate payouts stay locked for Phase 5.
          </p>
        </div>
      </header>

      {accountNotice ? (
        <div
          className={
            accountNotice.tone === "success"
              ? "rounded-md border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100"
              : "rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-3 text-sm font-medium text-[#F6E3A3]"
          }
          role={accountNotice.tone === "success" ? "status" : "alert"}
        >
          {accountNotice.message}
        </div>
      ) : null}

      {!isMemberActive ? <EmailVerificationBanner email={profile.email} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <MailCheck aria-hidden="true" className="size-5 text-soft-gold" />
          <p className="mt-4 text-xs font-semibold uppercase text-white/42">Email</p>
          <h2 className="mt-2 text-base font-semibold text-white">{formatEmailStatus(profile.emailConfirmedAt)}</h2>
          <p className="mt-2 break-all text-sm text-muted-foreground">{profile.email}</p>
        </article>

        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <ShieldCheck aria-hidden="true" className="size-5 text-soft-gold" />
          <p className="mt-4 text-xs font-semibold uppercase text-white/42">Member Status</p>
          <h2 className="mt-2 text-base font-semibold text-white">{memberStatus}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Synced from the authenticated profile record.</p>
        </article>

        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <KeyRound aria-hidden="true" className="size-5 text-soft-gold" />
          <p className="mt-4 text-xs font-semibold uppercase text-white/42">Security</p>
          <h2 className="mt-2 text-base font-semibold text-white">Password actions ready</h2>
          <p className="mt-2 text-sm text-muted-foreground">Use forgot/reset password flow for credential changes.</p>
        </article>

        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <ReceiptText aria-hidden="true" className="size-5 text-soft-gold" />
          <p className="mt-4 text-xs font-semibold uppercase text-white/42">Membership</p>
          <h2 className="mt-2 text-base font-semibold text-white">Phase 5 placeholder</h2>
          <p className="mt-2 text-sm text-muted-foreground">Plans, billing, renewal, and payment history are not active yet.</p>
        </article>
      </section>

      <section className="rounded-md border border-white/10 bg-black/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-soft-gold">Editable Profile</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Member details</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-semibold text-soft-gold">
            <Sparkles aria-hidden="true" className="size-3.5" />
            {isMemberActive ? `My Code: ${profile.memberAccessCode}` : "Verify email to unlock member features"}
          </div>
        </div>

        <MemberProfileForm isMemberActive={isMemberActive} profile={profile} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Membership", "Current plan, expiry, renewal, and upgrade controls are reserved for Phase 5."],
          ["Access Tracking", "Invited users, access attribution, commissions, and payouts are reserved for Phase 5."],
          ["Billing History", "Receipts and payment records will be connected after the membership system is built."],
        ].map(([title, description]) => (
          <article className="rounded-md border border-white/10 bg-black/72 p-5" key={title}>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
