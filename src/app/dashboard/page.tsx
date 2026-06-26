import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Copy,
  FileClock,
  GraduationCap,
  Link2,
  MessagesSquare,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { AccessCodeCopyButton } from "@/components/dashboard/access-code-copy-button";
import { MemberMarketVisual } from "@/components/dashboard/member-market-visual";
import { siteConfig } from "@/config/site";
import { addAuthNoticeToRedirectPath, loggedInAuthNoticeValue } from "@/lib/auth/redirect-notice";
import { getAuthenticatedMember } from "@/lib/member/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

type DashboardPageProps = {
  searchParams: Promise<{
    auth?: string | string[];
    notice?: string | string[];
    verified?: string | string[];
  }>;
};

const workspaceMetrics = [
  {
    description: "Verified access to the member workspace",
    icon: ShieldCheck,
    label: "Readiness",
    value: "Active",
  },
  {
    description: "Personal signup route with Access Code",
    icon: Link2,
    label: "Access Link",
    value: "Ready",
  },
  {
    description: "Course area prepared for the next content phase",
    icon: GraduationCap,
    label: "Education",
    value: "Prepared",
  },
  {
    description: "Review rhythm reserved for journal activity",
    icon: FileClock,
    label: "Journal",
    value: "Queued",
  },
];

const workspaceModules = [
  {
    description: "Review profile, email verification, Access Code, and security state.",
    href: "/dashboard/account",
    icon: UserRound,
    label: "My Account",
    state: "Live",
  },
  {
    description: "Structured lessons, course roadmap, and education modules.",
    href: "/dashboard/education",
    icon: BookOpenCheck,
    label: "Education",
    state: "Preview",
  },
  {
    description: "Trading review, notes, and discipline tracking workspace.",
    href: "/dashboard/journal",
    icon: FileClock,
    label: "Trading Journal",
    state: "Preview",
  },
  {
    description: "Member updates, announcements, and community entry points.",
    href: "/dashboard/community",
    icon: MessagesSquare,
    label: "Community",
    state: "Preview",
  },
];

const activityRows = [
  {
    detail: "Profile details and Access Code are available from My Account.",
    icon: BadgeCheck,
    label: "Account identity synced",
  },
  {
    detail: "Education, Journal, and Community modules are staged for rollout.",
    icon: Clock3,
    label: "Member modules prepared",
  },
  {
    detail: "Platform notices will appear here as the member area opens.",
    icon: Bell,
    label: "Announcements channel ready",
  },
];

function getAccessSignupLink(accessCode: string) {
  const signupUrl = new URL("/signup", siteConfig.url);
  signupUrl.searchParams.set("accessCode", accessCode);

  return signupUrl.toString();
}

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getMemberId(accessCode: string) {
  return accessCode.replace(/^EG/i, "") || accessCode;
}

function getAccountRedirectFromNotice(verified?: string, notice?: string, auth?: string) {
  const redirectUrl = new URL("/dashboard/account", siteConfig.url);

  if (verified === "email") {
    redirectUrl.searchParams.set("verified", "email");

    const redirectPath = `${redirectUrl.pathname}${redirectUrl.search}`;

    return auth === loggedInAuthNoticeValue
      ? addAuthNoticeToRedirectPath(redirectPath, loggedInAuthNoticeValue)
      : redirectPath;
  }

  if (
    notice === "verification_expired" ||
    notice === "verification_invalid" ||
    notice === "verify_required" ||
    notice === "email_change_verified"
  ) {
    redirectUrl.searchParams.set("notice", notice);

    const redirectPath = `${redirectUrl.pathname}${redirectUrl.search}`;

    return auth === loggedInAuthNoticeValue
      ? addAuthNoticeToRedirectPath(redirectPath, loggedInAuthNoticeValue)
      : redirectPath;
  }

  return null;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const authNotice = getFirstSearchParam(params.auth);
  const noticeRedirect = getAccountRedirectFromNotice(
    getFirstSearchParam(params.verified),
    getFirstSearchParam(params.notice),
    authNotice,
  );

  if (noticeRedirect) {
    redirect(noticeRedirect);
  }

  const { email, isMemberActive, memberName, memberStatus, profile } = await getAuthenticatedMember("/dashboard");

  if (!isMemberActive) {
    const verifyRequiredPath = "/dashboard/account?notice=verify_required";

    redirect(
      authNotice === loggedInAuthNoticeValue
        ? addAuthNoticeToRedirectPath(verifyRequiredPath, loggedInAuthNoticeValue)
        : verifyRequiredPath,
    );
  }

  const accessSignupLink = getAccessSignupLink(profile.memberAccessCode);
  const memberId = getMemberId(profile.memberAccessCode);
  const profileSnapshot = [
    ["Member", profile.fullName],
    ["Nickname", profile.nickname],
    ["Nationality", profile.nationality],
    ["Contact", `${profile.phoneCountry} ${profile.phone}`],
  ];

  return (
    <section className="grid gap-5">
      <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <span className="member-kicker">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            Member Workspace
          </span>
          <h1 className="elite-display-type mt-4 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Welcome back, {memberName}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
            A focused command area for account readiness, access identity, education, journal, and community entry points.
          </p>
        </div>

        <div className="member-inset-panel flex min-w-0 items-center gap-3 px-4 py-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-emerald-300/14 bg-emerald-300/7 text-emerald-100">
            <CheckCircle2 aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.68rem] font-bold uppercase text-white/34">Member Status</p>
            <p className="truncate text-sm font-semibold text-emerald-100">{memberStatus}</p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.06fr)_minmax(22rem,0.94fr)]">
        <article className="member-surface overflow-hidden p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(18rem,0.74fr)] lg:items-stretch">
            <div className="flex min-w-0 flex-col justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase text-white/38">Overview</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Your member area is ready.</h2>
                <p className="mt-3 text-sm leading-7 text-white/54">
                  Start with your account details, then move into the prepared modules as each member feature opens.
                </p>
              </div>

              <dl className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Member ID", memberId],
                  ["Access Code", profile.memberAccessCode],
                  ["Signed In", email],
                ].map(([label, value]) => (
                  <div className="rounded-2xl border border-white/8 bg-black/24 px-3 py-3" key={label}>
                    <dt className="text-[0.66rem] font-bold uppercase text-white/34">{label}</dt>
                    <dd className="mt-1 truncate text-sm font-semibold text-white/82">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <MemberMarketVisual className="min-h-[19rem]" />
          </div>
        </article>

        <article className="member-surface p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-white/38">Access Hub</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Access identity</h2>
            </div>
            <span className="member-shimmer-action grid size-11 shrink-0 place-items-center rounded-2xl border">
              <Link2 aria-hidden="true" className="size-5" />
            </span>
          </div>

          <div className="mt-6 rounded-3xl border border-white/8 bg-black/24 p-4">
            <p className="text-[0.68rem] font-bold uppercase text-white/36">My Access Code</p>
            <p className="mt-2 text-4xl font-bold text-white">{profile.memberAccessCode}</p>
            <p className="mt-3 break-all text-xs leading-5 text-white/44">{accessSignupLink}</p>
            <AccessCodeCopyButton className="mt-4 h-10 px-4" label="Copy Access Link" value={accessSignupLink} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              className="group rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 transition hover:border-white/14 hover:bg-white/[0.055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
              href="/dashboard/account"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                Review Account
                <ArrowRight aria-hidden="true" className="size-4 text-white/28 transition group-hover:translate-x-0.5 group-hover:text-[#F6E3A3]" />
              </span>
              <span className="mt-1 block text-xs text-white/40">Profile and security</span>
            </Link>
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <Copy aria-hidden="true" className="size-4 text-[#F6E3A3]/70" />
                Link ready
              </span>
              <span className="mt-1 block text-xs text-white/40">Code attached to signup</span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Member workspace status">
        {workspaceMetrics.map((item) => {
          const Icon = item.icon;

          return (
            <article className="member-surface-soft p-4" key={item.label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.66rem] font-bold uppercase text-white/34">{item.label}</p>
                  <h2 className="mt-2 text-base font-semibold text-white">{item.value}</h2>
                </div>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/8 bg-white/[0.035] text-white/48">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/48">{item.description}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="member-surface p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-white/38">Profile Snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Member identity</h2>
            </div>
            <UserRound aria-hidden="true" className="size-6 text-white/42" />
          </div>

          <dl className="mt-6 grid gap-3">
            {profileSnapshot.map(([label, value]) => (
              <div className="rounded-2xl border border-white/8 bg-black/24 px-3 py-3" key={label}>
                <dt className="text-[0.66rem] font-bold uppercase text-white/34">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-white/82">{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="member-surface p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-white/38">Workspace Modules</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Continue where it matters</h2>
            </div>
            <p className="inline-flex items-center gap-2 text-sm text-white/42">
              <Clock3 aria-hidden="true" className="size-4" />
              Modules open in sequence
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {workspaceModules.map((item, index) => {
              const Icon = item.icon;
              const isPrimary = index === 0;

              return (
                <Link
                  className={
                    isPrimary
                      ? "member-shimmer-action group min-h-36 rounded-2xl border p-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/50"
                      : "group min-h-36 rounded-2xl border border-white/8 bg-white/[0.025] p-4 transition hover:border-white/14 hover:bg-white/[0.055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
                  }
                  href={item.href}
                  key={item.label}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={isPrimary ? "grid size-10 place-items-center rounded-xl border border-[#E6C766]/20 bg-[#D4AF37]/10 text-[#F6E3A3]" : "grid size-10 place-items-center rounded-xl border border-white/8 bg-white/[0.035] text-white/46"}>
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[0.62rem] font-bold uppercase text-white/42">
                      {item.state}
                    </span>
                  </div>
                  <h3 className="mt-4 flex items-center justify-between gap-3 text-sm font-semibold text-white">
                    {item.label}
                    <ArrowRight aria-hidden="true" className="size-4 text-white/28 transition group-hover:translate-x-0.5 group-hover:text-[#F6E3A3]" />
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.58fr)]">
        <article className="member-surface-soft p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-white/38">
            <TrendingUp aria-hidden="true" className="size-3.5" />
            Member Rhythm
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Keep the workspace clean, verified, and ready.</h2>
          <p className="mt-2 text-sm leading-7 text-white/52">
            Start with accurate account information, then use education, journal, and community areas as each module becomes available.
          </p>
          <Link
            className="member-shimmer-action mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/50"
            href="/dashboard/account"
          >
            Review My Account
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </article>

        <article className="member-surface-soft p-5 sm:p-6">
          <p className="text-xs font-bold uppercase text-white/38">Recent Activity</p>
          <div className="mt-5 grid gap-3">
            {activityRows.map((item) => {
              const Icon = item.icon;

              return (
                <div className="flex gap-3 rounded-2xl border border-white/8 bg-black/24 px-3 py-3" key={item.label}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/8 bg-white/[0.035] text-white/46">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.label}</h3>
                    <p className="mt-1 text-xs leading-5 text-white/44">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </section>
  );
}
