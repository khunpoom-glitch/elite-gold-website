import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  CheckCircle2,
  FileClock,
  GraduationCap,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
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

const quickActions = [
  {
    description: "Update profile, verification, and member record",
    href: "/dashboard/account",
    icon: UserRound,
    label: "My Account",
    status: "Live",
  },
  {
    description: "Preview the learning library foundation",
    href: "/dashboard/education",
    icon: GraduationCap,
    label: "Education",
    status: "Preview",
  },
  {
    description: "Open the staged trade review workflow",
    href: "/dashboard/journal",
    icon: FileClock,
    label: "Journal",
    status: "Preview",
  },
  {
    description: "Check the community updates shell",
    href: "/dashboard/community",
    icon: MessagesSquare,
    label: "Community",
    status: "Preview",
  },
];

const activityCards = [
  {
    description: "Member updates, class notes, and platform notices will appear here.",
    icon: Bell,
    label: "Announcements",
    state: "No active announcements",
  },
  {
    description: "Course progress stays staged until the Phase 4 education library is built.",
    icon: BookOpenCheck,
    label: "Learning Progress",
    state: "Foundation ready",
  },
  {
    description: "Journal activity preview is staged before the full Trading Journal backend.",
    icon: FileClock,
    label: "Journal Snapshot",
    state: "No entries in Phase 3",
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

  return (
    <section className="grid gap-5">
      <header className="member-surface overflow-hidden p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <div>
              <span className="member-kicker">
                <ShieldCheck aria-hidden="true" className="size-3.5" />
                Phase 3 Member Command Center
              </span>
              <h1 className="elite-display-type mt-5 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                Welcome back, {memberName}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                Your dashboard now focuses on account readiness, access attribution, and member entry points while the full education and journal systems stay staged for later phases.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border-t border-white/10 pt-3">
                <p className="text-[0.68rem] font-bold uppercase text-white/36">Member Status</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <CheckCircle2 aria-hidden="true" className="size-4" />
                  {memberStatus}
                </p>
              </div>
              <div className="border-t border-white/10 pt-3">
                <p className="text-[0.68rem] font-bold uppercase text-white/36">Access Code</p>
                <p className="mt-1 text-sm font-semibold text-[#F6E3A3]">{profile.memberAccessCode}</p>
              </div>
              <div className="border-t border-white/10 pt-3">
                <p className="text-[0.68rem] font-bold uppercase text-white/36">Signed In</p>
                <p className="mt-1 truncate text-sm font-semibold text-white/78">{email}</p>
              </div>
            </div>
          </div>

          <MemberMarketVisual className="min-h-[18rem]" />
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <article className="member-surface p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-white/38">Member Summary</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Profile foundation</h2>
            </div>
            <UserRound aria-hidden="true" className="size-6 shrink-0 text-white/42" />
          </div>

          <dl className="mt-6 grid gap-x-5 gap-y-4 sm:grid-cols-2">
            {[
              ["Name", profile.fullName],
              ["Nickname", profile.nickname],
              ["Nationality", profile.nationality],
              ["Phone", `${profile.phoneCountry} ${profile.phone}`],
            ].map(([label, value]) => (
              <div className="border-t border-white/10 pt-3" key={label}>
                <dt className="text-[0.68rem] font-bold uppercase text-white/36">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-white/82">{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="member-surface p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-white/38">Access</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Invite-ready link</h2>
            </div>
            <Sparkles aria-hidden="true" className="size-6 shrink-0 text-[#F6E3A3]/70" />
          </div>
          <p className="mt-4 text-sm leading-7 text-white/56">
            Access tracking stays in Phase 5, but Phase 3 shows the code and signup link so the member workflow is ready.
          </p>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-[0.68rem] font-bold uppercase text-white/36">My Access Code</p>
            <p className="mt-2 text-3xl font-bold text-white">{profile.memberAccessCode}</p>
            <p className="mt-3 break-all text-xs leading-5 text-white/46">{accessSignupLink}</p>
            <AccessCodeCopyButton className="mt-4 h-10 px-4" label="Copy Access Link" value={accessSignupLink} />
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {activityCards.map((item) => {
          const Icon = item.icon;

          return (
            <article className="member-surface-soft p-5" key={item.label}>
              <Icon aria-hidden="true" className="size-5 text-white/46" />
              <h2 className="mt-5 text-base font-semibold text-white">{item.label}</h2>
              <p className="mt-2 text-sm leading-7 text-white/52">{item.description}</p>
              <p className="mt-4 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2 text-xs font-medium text-white/46">
                {item.state}
              </p>
            </article>
          );
        })}
      </section>

      <section className="member-surface p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-white/38">Quick Actions</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Move through the member workflow</h2>
          </div>
          <p className="text-sm text-white/42">Phase 3 navigation shell</p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {quickActions.map((item, index) => {
            const Icon = item.icon;
            const isPrimary = index === 0;

            return (
              <Link
                className={isPrimary
                  ? "member-shimmer-action group rounded-2xl border p-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/50"
                  : "group rounded-2xl border border-white/8 bg-white/[0.025] p-4 transition hover:border-white/14 hover:bg-white/[0.055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"}
                href={item.href}
                key={item.label}
              >
                <div className="flex items-center justify-between gap-3">
                  <Icon aria-hidden="true" className={isPrimary ? "size-5 text-[#F6E3A3]" : "size-5 text-white/46"} />
                  <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[0.62rem] font-bold uppercase text-white/42">
                    {item.status}
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
      </section>
    </section>
  );
}
