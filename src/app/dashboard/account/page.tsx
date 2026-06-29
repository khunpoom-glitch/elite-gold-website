import type { Metadata } from "next";
import { BadgeCheck, KeyRound, Link2, MailCheck, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { AccessCodeCopyButton } from "@/components/dashboard/access-code-copy-button";
import { EmailVerificationBanner } from "@/components/dashboard/email-verification-banner";
import { MemberProfileForm } from "@/components/dashboard/member-profile-form";
import { siteConfig } from "@/config/site";
import { getPendingEmailChangeRequest } from "@/lib/member/profile";
import { getAuthenticatedMember } from "@/lib/member/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

function getAccessSignupLink(accessCode: string) {
  const signupUrl = new URL("/signup", siteConfig.url);
  signupUrl.searchParams.set("accessCode", accessCode);

  return signupUrl.toString();
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

  if (notice === "email_change_verified") {
    return {
      message: "Email changed successfully. Your member profile is now synced with the verified email.",
      tone: "success" as const,
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
    description: "Controls access to the member workspace.",
    icon: ShieldCheck,
    label: "Verification",
  },
  {
    description: "Use the reset flow for password changes.",
    icon: KeyRound,
    label: "Security",
  },
];

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const accountNotice = getAccountNotice(
    getFirstSearchParam(params.verified),
    getFirstSearchParam(params.notice),
  );
  const { isMemberActive, memberStatus, profile } = await getAuthenticatedMember("/dashboard/account");
  const supabase = await createSupabaseServerClient();
  const pendingEmailChange = supabase
    ? await getPendingEmailChangeRequest(supabase, profile.id)
    : null;
  const statusValues = [
    formatEmailStatus(profile.emailConfirmedAt),
    memberStatus,
    "Password actions ready",
  ];
  const accessSignupLink = getAccessSignupLink(profile.memberAccessCode);
  const accountSummary = [
    ["Name", profile.fullName],
    ["Nickname", profile.nickname],
    ["Nationality", profile.nationality],
    ["Phone", `${profile.phoneCountry} ${profile.phone}`],
  ];

  return (
    <section className="grid gap-5">
      <header className="member-surface overflow-hidden p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.36fr)] lg:items-end">
          <div className="max-w-3xl">
            <span className="member-kicker">
              <UserRound aria-hidden="true" className="size-3.5" />
              My Account
            </span>
            <h1 className="mt-4 text-balance text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Profile, access, and security settings
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/54">
              Keep your profile accurate and manage the verified access details tied to this member account.
            </p>
          </div>

          <div className="member-inset-panel grid gap-3 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.68rem] font-bold uppercase text-white/36">Readiness</p>
              <BadgeCheck aria-hidden="true" className={isMemberActive ? "size-4 text-emerald-200" : "size-4 text-white/70"} />
            </div>
            <div>
              <p className={isMemberActive ? "text-lg font-semibold text-emerald-200" : "text-lg font-semibold text-white/70"}>
                {memberStatus}
              </p>
              <p className="mt-2 break-all text-xs leading-5 text-white/46">{profile.email}</p>
            </div>
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

      <section className="grid gap-4 md:grid-cols-3" aria-label="Account status overview">
        {statusCards.map((item, index) => {
          const Icon = item.icon;
          const value = statusValues[index];

          return (
            <article className="member-surface-soft p-4" key={item.label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase text-white/36">{item.label}</p>
                  <h2 className="mt-2 text-base font-semibold text-white">{value}</h2>
                </div>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/8 bg-white/[0.035] text-white/46">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/50">
                {index === 0 ? profile.email : item.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
        <article className="member-surface p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase text-white/38">Profile Snapshot</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Member identity</h2>
            <p className="mt-3 text-sm leading-7 text-white/52">
              This snapshot mirrors the editable profile fields below.
            </p>
          </div>
          <dl className="mt-5 grid gap-3">
            {accountSummary.map(([label, value]) => (
              <div className="rounded-2xl border border-white/8 bg-[#171717]/62 px-3 py-3" key={label}>
                <dt className="text-[0.66rem] font-bold uppercase text-white/34">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-white/82">{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="member-surface p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-white/38">Access Identity</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Access Code & Link</h2>
            </div>
            <span className={isMemberActive ? "member-shimmer-action inline-flex size-11 items-center justify-center rounded-2xl border" : "inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-white/42"}>
              <Sparkles aria-hidden="true" className="size-4" />
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/52">
            This is your member Access Code. It identifies your account and powers your signup Access Link.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <div className="rounded-2xl border border-white/8 bg-[#171717]/62 p-4">
              <p className="text-[0.68rem] font-bold uppercase text-white/36">My Access Code</p>
              <p className="mt-2 text-3xl font-bold text-white">{profile.memberAccessCode}</p>
              <p className="mt-3 text-[0.68rem] font-bold uppercase text-white/36">Signup Source</p>
              <p className="mt-1 text-sm font-semibold text-white/78">{profile.signupAccessCode}</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#171717]/62 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-white/38">
                <Link2 aria-hidden="true" className="size-3.5" />
                Access Link
              </div>
              <p className="mt-3 break-all text-xs leading-5 text-white/54">{accessSignupLink}</p>
              <AccessCodeCopyButton
                className="mt-4 h-10 px-4"
                label="Copy Access Link"
                value={accessSignupLink}
              />
            </div>
          </div>
        </article>
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

        <MemberProfileForm
          isMemberActive={isMemberActive}
          pendingEmailChange={pendingEmailChange}
          profile={profile}
        />
      </section>
    </section>
  );
}
