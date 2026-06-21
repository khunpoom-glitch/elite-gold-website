import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  FileClock,
  GraduationCap,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AccessCodeCopyButton } from "@/components/dashboard/access-code-copy-button";
import { siteConfig } from "@/config/site";
import { getActiveMemberOrRedirect } from "@/lib/member/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

const quickActions = [
  {
    description: "Review and update profile details",
    href: "/dashboard/account",
    icon: UserRound,
    label: "Profile",
  },
  {
    description: "Preview learning progress shell",
    href: "/dashboard/education",
    icon: GraduationCap,
    label: "Education",
  },
  {
    description: "Preview journal activity shell",
    href: "/dashboard/journal",
    icon: FileClock,
    label: "Journal",
  },
  {
    description: "Preview community updates shell",
    href: "/dashboard/community",
    icon: MessagesSquare,
    label: "Community",
  },
];

function getStatusTone(status: string) {
  return status === "active"
    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
    : "border-[#D4AF37]/28 bg-[#D4AF37]/10 text-[#F6E3A3]";
}

function getAccessSignupLink(accessCode: string) {
  const signupUrl = new URL("/signup", siteConfig.url);
  signupUrl.searchParams.set("accessCode", accessCode);

  return signupUrl.toString();
}

export default async function DashboardPage() {
  const { email, memberName, memberStatus, profile } = await getActiveMemberOrRedirect("/dashboard");
  const accessSignupLink = getAccessSignupLink(profile.memberAccessCode);
  const statusTone = getStatusTone(profile.status);

  return (
    <section className="grid gap-6">
      <header className="rounded-md border border-white/10 bg-black/68 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/24 bg-gold/10 px-3 py-1 text-xs font-bold uppercase text-soft-gold">
              <ShieldCheck aria-hidden="true" className="size-3.5" />
              Phase 3 Member Area
            </div>
            <h1 className="elite-display-type mt-4 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              Welcome back, {memberName}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Dashboard นี้เป็น command center สำหรับ profile, membership status, access entry point และ preview ของ Education, Journal, Community ก่อนเข้าสู่ feature เต็มใน Phase 4.
            </p>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.035] p-4 text-sm">
            <p className="text-xs font-semibold uppercase text-white/42">Signed in as</p>
            <p className="mt-2 max-w-[18rem] break-words font-semibold text-white">{email}</p>
            <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone}`}>
              {memberStatus}
            </span>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-soft-gold">Member Summary</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Profile foundation is live</h2>
            </div>
            <UserRound aria-hidden="true" className="size-6 shrink-0 text-soft-gold" />
          </div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs font-semibold uppercase text-white/42">Name</dt>
              <dd className="mt-2 text-sm font-semibold text-white">{profile.fullName}</dd>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs font-semibold uppercase text-white/42">Nickname</dt>
              <dd className="mt-2 text-sm font-semibold text-white">{profile.nickname}</dd>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs font-semibold uppercase text-white/42">Nationality</dt>
              <dd className="mt-2 text-sm font-semibold text-white">{profile.nationality}</dd>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs font-semibold uppercase text-white/42">Phone</dt>
              <dd className="mt-2 text-sm font-semibold text-white">{profile.phoneCountry} {profile.phone}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-soft-gold">Access</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Invite-ready link</h2>
            </div>
            <Sparkles aria-hidden="true" className="size-6 shrink-0 text-soft-gold" />
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Access tracking เต็มระบบจะอยู่ใน Phase 5 แต่ Phase 3 จะแสดง code และ signup link เพื่อเตรียม flow ให้พร้อม.
          </p>
          <div className="mt-5 rounded-md border border-gold/20 bg-gold/10 p-4">
            <p className="text-xs font-semibold uppercase text-soft-gold">My Access Code</p>
            <p className="mt-2 text-2xl font-bold text-white">{profile.memberAccessCode}</p>
            <p className="mt-3 break-all text-xs leading-5 text-white/52">{accessSignupLink}</p>
            <AccessCodeCopyButton className="mt-4" label="Copy Link" value={accessSignupLink} />
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <Bell aria-hidden="true" className="size-6 text-soft-gold" />
          <h2 className="mt-5 text-base font-semibold text-white">Announcements</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Preview area for member updates, class notes, and platform notices.
          </p>
          <p className="mt-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/48">
            No active announcements yet.
          </p>
        </article>
        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <BookOpenCheck aria-hidden="true" className="size-6 text-soft-gold" />
          <h2 className="mt-5 text-base font-semibold text-white">Education Progress</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Learning progress is reserved for the Phase 4 course library.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/5 rounded-full bg-soft-gold" />
          </div>
        </article>
        <article className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
          <FileClock aria-hidden="true" className="size-6 text-soft-gold" />
          <h2 className="mt-5 text-base font-semibold text-white">Journal Activity</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Journal activity preview is staged here before the full Trading Journal build.
          </p>
          <p className="mt-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/48">
            No journal entries in Phase 3.
          </p>
        </article>
      </section>

      <section className="rounded-md border border-white/10 bg-black/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-soft-gold">Quick Actions</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Move through the member workflow</h2>
          </div>
          <p className="text-sm text-white/46">Phase 3 navigation shell</p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="group rounded-md border border-white/10 bg-white/[0.03] p-4 transition hover:border-gold/28 hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-gold/50"
                href={item.href}
                key={item.label}
              >
                <Icon aria-hidden="true" className="size-5 text-soft-gold" />
                <h3 className="mt-4 flex items-center justify-between gap-3 text-sm font-semibold text-white">
                  {item.label}
                  <ArrowRight aria-hidden="true" className="size-4 text-white/28 transition group-hover:translate-x-0.5 group-hover:text-soft-gold" />
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </section>
  );
}
