import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Copy,
  LayoutDashboard,
  Link2,
  Search,
  UserRound,
} from "lucide-react";
import { AccessCodeCopyButton } from "@/components/dashboard/access-code-copy-button";
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

const nextSteps = [
  {
    description: "Profile, verification, Access Code, and account security",
    href: "/dashboard/account",
    label: "Review My Account",
    state: "Live",
  },
  {
    description: "Structured learning area prepared for the next phase",
    href: "/dashboard/education",
    label: "Education",
    state: "Preview",
  },
  {
    description: "Trading review and discipline workspace",
    href: "/dashboard/journal",
    label: "Trading Journal",
    state: "Preview",
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
    <section className="min-h-dvh w-full overflow-hidden bg-[#1d1d1c]">
      <header className="grid min-h-16 gap-3 border-b border-white/8 bg-[#181817] px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(15rem,0.45fr)_auto] sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white/54">
            <LayoutDashboard aria-hidden="true" className="size-4" />
          </span>
          <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white/78">
            <span className="truncate">Elite Gold</span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-white/28" />
            <span className="truncate text-white">Home</span>
          </div>
        </div>

        <div className="hidden h-10 items-center gap-2 rounded-xl border border-white/7 bg-[#242423] px-3 text-sm text-white/28 sm:flex">
          <Search aria-hidden="true" className="size-4" />
          <span>Search workspace</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-xl border border-white/7 bg-[#242423] px-3 py-2 text-xs font-semibold text-white/50 sm:inline-flex">
            {memberStatus}
          </span>
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/12 bg-[#2a2a29] text-sm font-bold text-white/72">
            {memberName.trim().charAt(0).toUpperCase() || "E"}
          </span>
        </div>
      </header>

      <div className="grid gap-5 p-4 sm:p-6">
        <div className="h-10 w-full max-w-[14rem] rounded-xl border border-white/6 bg-[#292928]" />

        <section className="grid gap-5 lg:grid-cols-2" aria-label="Dashboard summary">
          <article className="min-h-40 rounded-2xl border border-white/7 bg-[#171716] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-bold uppercase text-white/34">Member Status</p>
                <h1 className="mt-2 text-2xl font-semibold text-white">Welcome back, {memberName}</h1>
              </div>
              <BadgeCheck aria-hidden="true" className="size-5 shrink-0 text-emerald-200/75" />
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/46">
              Your member workspace is ready. Keep this screen calm and use each section only when needed.
            </p>
            <p className="mt-5 truncate text-xs text-white/34">{email}</p>
          </article>

          <article className="min-h-40 rounded-2xl border border-white/7 bg-[#171716] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-bold uppercase text-white/34">Access Code</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{profile.memberAccessCode}</h2>
              </div>
              <Link2 aria-hidden="true" className="size-5 shrink-0 text-[#F6E3A3]/48" />
            </div>
            <p className="mt-4 break-all text-xs leading-5 text-white/38">{accessSignupLink}</p>
            <AccessCodeCopyButton
              className="mt-5 h-10 rounded-xl px-4"
              label="Copy Access Link"
              value={accessSignupLink}
            />
          </article>
        </section>

        <section className="rounded-2xl border border-white/7 bg-[#171716] p-5" aria-label="Next actions">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-bold uppercase text-white/34">Focus</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Next actions</h2>
            </div>
            <Copy aria-hidden="true" className="size-4 text-white/24" />
          </div>

          <div className="grid gap-3">
            {nextSteps.map((step) => (
              <Link
                className="group flex min-h-14 items-center gap-3 rounded-xl border border-white/6 bg-[#242423] px-4 py-3 transition hover:border-white/12 hover:bg-[#2a2a29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/28"
                href={step.href}
                key={step.label}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/7 bg-[#171716] text-white/42">
                  <UserRound aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white/78">{step.label}</span>
                  <span className="block truncate text-xs text-white/35">{step.description}</span>
                </span>
                <span className="hidden rounded-full border border-white/7 bg-[#171716] px-2 py-1 text-[0.62rem] font-bold uppercase text-white/34 sm:inline-flex">
                  {step.state}
                </span>
                <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-white/22 transition group-hover:translate-x-0.5 group-hover:text-white/54" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
