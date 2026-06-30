import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Link2,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AccessCodeCopyButton } from "@/components/dashboard/access-code-copy-button";
import { memberPackage, memberReadinessItems, memberToolsPreview } from "@/config/member-area";
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
    description: "Profile, verification, and access details",
    href: "/dashboard/account",
    label: "My Account",
    state: "Live",
  },
  {
    description: "Structured learning area",
    href: "/dashboard/education",
    label: "Education",
    state: "Preview",
  },
  {
    description: "Trading review workspace",
    href: "/dashboard/journal",
    label: "Trading Journal",
    state: "Preview",
  },
  {
    description: "Updates and member conversation hub",
    href: "/dashboard/community",
    label: "Community",
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

  const { isMemberActive, memberName, memberStatus, profile } = await getAuthenticatedMember();

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
    <section className="min-h-dvh w-full">
      <header className="sticky top-0 z-20 flex min-h-16 items-center border-b border-white/8 bg-[#1D1D1D]/96 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-white">Dashboard</h1>
          <p className="mt-1 hidden text-xs text-white/36 sm:block">Member home, access status, and next workspace actions</p>
        </div>
      </header>

      <div className="grid gap-5 p-4 sm:p-6">
        <section className="grid gap-5 lg:grid-cols-2" aria-label="Dashboard summary">
          <article className="min-h-40 rounded-2xl border border-white/7 bg-[#171717] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-bold uppercase text-white/34">Member Status</p>
                <h1 className="mt-2 text-2xl font-semibold text-white">Welcome back, {memberName}</h1>
              </div>
              <BadgeCheck aria-hidden="true" className="size-5 shrink-0 text-emerald-200/75" />
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/46">{memberStatus}</p>
            <p className="mt-5 break-all text-xs text-white/34">{profile.email}</p>
          </article>

          <article className="min-h-40 rounded-2xl border border-white/7 bg-[#171717] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-bold uppercase text-white/34">Access Code</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{profile.memberAccessCode}</h2>
              </div>
              <Link2 aria-hidden="true" className="size-5 shrink-0 text-white/48" />
            </div>
            <AccessCodeCopyButton
              className="mt-5 h-10 rounded-xl px-4"
              label="Copy Access Link"
              value={accessSignupLink}
            />
            <div className="mt-4 grid gap-2 rounded-xl border border-white/7 bg-[#1D1D1D]/70 px-3 py-3 sm:grid-cols-2">
              <div>
                <p className="text-[0.62rem] font-bold uppercase text-white/28">Signup Source</p>
                <p className="mt-1 text-sm font-semibold text-white/68">{profile.signupAccessCode}</p>
              </div>
              <div>
                <p className="text-[0.62rem] font-bold uppercase text-white/28">Access Status</p>
                <p className="mt-1 text-sm font-semibold text-emerald-200/68">Ready</p>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.86fr)_minmax(20rem,0.54fr)]" aria-label="Membership overview">
          <article className="rounded-2xl border border-white/7 bg-[#171717] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase text-white/34">Membership Package</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{memberPackage.name}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">{memberPackage.description}</p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/8 bg-white/[0.035] text-[#F6E3A3]/75">
                <CircleDollarSign aria-hidden="true" className="size-4" />
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/7 bg-[#1D1D1D]/70 px-3 py-3">
                <p className="text-[0.62rem] font-bold uppercase text-white/28">Package Status</p>
                <p className="mt-1 text-sm font-semibold text-white/72">{memberPackage.statusLabel}</p>
              </div>
              <div className="rounded-xl border border-white/7 bg-[#1D1D1D]/70 px-3 py-3">
                <p className="text-[0.62rem] font-bold uppercase text-white/28">Billing</p>
                <p className="mt-1 text-sm font-semibold text-white/72">{memberPackage.billingLabel}</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/7 bg-[#171717] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-bold uppercase text-white/34">Account Readiness</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Ready for member access</h2>
              </div>
              <ShieldCheck aria-hidden="true" className="size-5 shrink-0 text-emerald-200/70" />
            </div>

            <div className="mt-5 grid gap-3">
              {memberReadinessItems.map((item) => (
                <div className="flex items-center gap-3 rounded-xl border border-white/7 bg-[#1D1D1D]/70 px-3 py-3" key={item}>
                  <BadgeCheck aria-hidden="true" className="size-4 shrink-0 text-emerald-200/70" />
                  <p className="text-sm font-semibold text-white/72">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-white/7 bg-[#171717] p-5" aria-label="Workspace modules">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Workspace modules</h2>
              <p className="mt-2 text-sm leading-6 text-white/42">A light map of what is live now and what is being prepared next.</p>
            </div>
            <Sparkles aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#F6E3A3]/58" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {memberToolsPreview.map((tool) => (
              <article className="rounded-xl border border-white/8 bg-[#1D1D1D] px-4 py-4" key={tool.label}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate text-sm font-semibold text-white/80">{tool.label}</h3>
                  <span className="rounded-full border border-white/8 bg-[#171717] px-2 py-1 text-[0.6rem] font-bold uppercase text-white/34">
                    {tool.status}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-6 text-white/38">
                  {tool.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/7 bg-[#171717] p-5" aria-label="Next actions">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Quick actions</h2>
            </div>
          </div>

          <div className="grid gap-3">
            {nextSteps.map((step) => (
              <Link
                className="group flex min-h-14 items-center gap-3 rounded-xl border border-white/8 bg-[#1D1D1D] px-4 py-3 transition hover:border-white/16 hover:bg-[#232323] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/28"
                href={step.href}
                key={step.label}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/8 bg-[#171717] text-white/42">
                  {step.label === "Community" ? (
                    <MessagesSquare aria-hidden="true" className="size-4" />
                  ) : (
                    <UserRound aria-hidden="true" className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white/78">{step.label}</span>
                  <span className="block truncate text-xs text-white/35">{step.description}</span>
                </span>
                <span className="hidden rounded-full border border-white/8 bg-[#171717] px-2 py-1 text-[0.62rem] font-bold uppercase text-white/34 sm:inline-flex">
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
