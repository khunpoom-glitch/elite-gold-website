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

const statusCards = [
  {
    description: "This is the email tied to your member record.",
    icon: MailCheck,
    label: "Email",
  },
  {
    description: "Synced from the authenticated profile record.",
    icon: ShieldCheck,
    label: "Member Status",
  },
  {
    description: "Use forgot/reset password flow for credential changes.",
    icon: KeyRound,
    label: "Security",
  },
  {
    description: "Plans, billing, renewal, and payment history are Phase 5.",
    icon: ReceiptText,
    label: "Membership",
  },
];

const reservedCards = [
  ["Membership", "Current plan, expiry, renewal, and upgrade controls are reserved for Phase 5."],
  ["Access Tracking", "Invited users, access attribution, commissions, and payouts are reserved for Phase 5."],
  ["Billing History", "Receipts and payment records will be connected after the membership system is built."],
];

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const accountNotice = getAccountNotice(
    getFirstSearchParam(params.verified),
    getFirstSearchParam(params.notice),
  );
  const { isMemberActive, memberStatus, profile } = await getAuthenticatedMember("/dashboard/account");
  const statusValues = [
    formatEmailStatus(profile.emailConfirmedAt),
    memberStatus,
    "Password actions ready",
    "Phase 5 placeholder",
  ];

  return (
    <section className="grid gap-5">
      <header className="member-surface overflow-hidden p-5 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] lg:items-end">
          <div className="max-w-3xl">
            <span className="member-kicker">
              <UserRound aria-hidden="true" className="size-3.5" />
              My Account
            </span>
            <h1 className="elite-display-type mt-5 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Profile, security, and member record
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
              Manage the editable profile fields from signup. Payment, billing, membership upgrades, and affiliate payouts stay locked for later phases.
            </p>
          </div>

          <div className="member-inset-panel px-4 py-4">
            <p className="text-[0.68rem] font-bold uppercase text-white/36">Account Readiness</p>
            <p className={isMemberActive ? "mt-2 text-lg font-semibold text-emerald-200" : "mt-2 text-lg font-semibold text-[#F6E3A3]"}>
              {memberStatus}
            </p>
            <p className="mt-2 break-all text-xs leading-5 text-white/46">{profile.email}</p>
          </div>
        </div>
      </header>

      {accountNotice ? (
        <div
          className={
            accountNotice.tone === "success"
              ? "member-status-success rounded-2xl border px-4 py-3 text-sm font-medium"
              : "member-status-warning rounded-2xl border px-4 py-3 text-sm font-medium"
          }
          role={accountNotice.tone === "success" ? "status" : "alert"}
        >
          {accountNotice.message}
        </div>
      ) : null}

      {!isMemberActive ? <EmailVerificationBanner email={profile.email} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((item, index) => {
          const Icon = item.icon;
          const value = statusValues[index];

          return (
            <article className="member-surface-soft p-5" key={item.label}>
              <Icon aria-hidden="true" className="size-5 text-white/46" />
              <p className="mt-4 text-[0.68rem] font-bold uppercase text-white/36">{item.label}</p>
              <h2 className="mt-2 text-base font-semibold text-white">{value}</h2>
              <p className="mt-2 text-sm leading-6 text-white/50">
                {index === 0 ? profile.email : item.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="member-surface p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-white/38">Editable Profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Member details</h2>
          </div>
          <div className={isMemberActive ? "member-shimmer-action inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold" : "inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-white/52"}>
            <Sparkles aria-hidden="true" className="size-3.5" />
            {isMemberActive ? `My Code: ${profile.memberAccessCode}` : "Verify email to unlock member features"}
          </div>
        </div>

        <MemberProfileForm isMemberActive={isMemberActive} profile={profile} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {reservedCards.map(([title, description]) => (
          <article className="member-surface-soft p-5" key={title}>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-white/50">{description}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
