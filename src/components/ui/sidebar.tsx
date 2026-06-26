"use client";

import {
  BadgeCheck,
  FileClock,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MessagesSquare,
  Settings,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearClientAuthSession, waitForLogoutFeedback } from "@/lib/auth/client-logout";
import { cn } from "@/lib/utils";

type SessionNavBarProps = {
  isMemberActive: boolean;
  memberEmail: string;
  memberName: string;
  memberStatus: string;
};

type NavItem = {
  href?: string;
  description: string;
  icon: LucideIcon;
  label: string;
  status?: string;
};

function DashboardLogoutButton({ pending }: { pending: boolean }) {
  return (
    <button
      aria-disabled={pending}
      aria-label={pending ? "Signing out" : "Logout"}
      className="group relative flex h-12 w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] px-3 text-left text-white/58 transition hover:border-[#E6C766]/24 hover:bg-white/[0.055] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/50 disabled:cursor-wait disabled:opacity-75"
      disabled={pending}
      title={pending ? "Signing out..." : "Logout"}
      type="submit"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/8 bg-black/24 text-white/58 transition group-hover:border-[#E6C766]/20 group-hover:text-[#F6E3A3]">
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <LogOut aria-hidden="true" className="size-4" />
        )}
      </span>
      <span className="text-sm font-semibold">
        {pending ? "Signing out..." : "Logout"}
      </span>
    </button>
  );
}

function DashboardLogoutForm() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) {
      return;
    }

    setPending(true);

    try {
      await Promise.all([clearClientAuthSession(), waitForLogoutFeedback()]);
      router.replace("/?auth=signed-out");
    } catch {
      window.location.assign("/?auth=signed-out");
    }
  }

  return (
    <form action="/auth/logout" method="post" onSubmit={handleSubmit}>
      <DashboardLogoutButton pending={pending} />
    </form>
  );
}

const navigationItems: NavItem[] = [
  {
    description: "Member status and workspace overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    description: "Structured lessons and learning path",
    href: "/dashboard/education",
    label: "Education",
    icon: GraduationCap,
    status: "Preview",
  },
  {
    description: "Review notes, discipline, and rhythm",
    href: "/dashboard/journal",
    label: "Trading Journal",
    icon: FileClock,
    status: "Preview",
  },
  {
    description: "Updates and member conversation hub",
    href: "/dashboard/community",
    label: "Community",
    icon: MessagesSquare,
    status: "Preview",
  },
  {
    description: "Profile, access link, and verification",
    href: "/dashboard/account",
    icon: UserCircle,
    label: "My Account",
    status: "Live",
  },
];

function getNavigationItems(isMemberActive: boolean) {
  if (isMemberActive) {
    return navigationItems;
  }

  return navigationItems.map((item) =>
    item.href === "/dashboard/account"
      ? item
      : {
          ...item,
          href: undefined,
          status: "Locked",
        },
  );
}

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || "E";
}

function isActivePath(pathname: string, href?: string) {
  if (!href) {
    return false;
  }

  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function DesktopNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = isActivePath(pathname, item.href);
  const label = item.status ? `${item.label} (${item.status})` : item.label;
  const className = cn(
    "group relative flex min-h-16 items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/50",
    isActive
      ? "member-shimmer-action border-[#E6C766]/24 text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
      : "border-transparent text-white/54 hover:border-white/10 hover:bg-white/[0.045] hover:text-white",
    !item.href && "cursor-default opacity-[0.48] hover:border-transparent hover:bg-transparent hover:text-white/54",
  );
  const content = (
    <>
      <span
        className={cn(
          "relative z-10 grid size-10 shrink-0 place-items-center rounded-xl border transition",
          isActive
            ? "border-[#E6C766]/24 bg-[#E6C766]/10 text-[#F6E3A3]"
            : "border-white/8 bg-white/[0.025] text-white/44 group-hover:border-white/12 group-hover:text-white/76",
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="relative z-10 min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">{item.label}</span>
          {item.status ? (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-normal",
                item.status === "Live"
                  ? "border-emerald-300/14 bg-emerald-300/7 text-emerald-100/76"
                  : item.status === "Locked"
                    ? "border-white/10 bg-white/[0.025] text-white/34"
                    : "border-[#E6C766]/14 bg-[#E6C766]/7 text-[#F6E3A3]/70",
              )}
            >
              {item.status}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 line-clamp-1 text-xs text-white/36">
          {item.description}
        </span>
      </span>
      {isActive ? (
        <span aria-hidden="true" className="absolute right-2 top-1/2 h-8 w-px -translate-y-1/2 rounded-full bg-[#F6E3A3] shadow-[0_0_14px_rgba(230,199,102,0.56)]" />
      ) : null}
    </>
  );

  if (item.href) {
    return (
      <Link aria-current={isActive ? "page" : undefined} aria-label={label} className={className} href={item.href} title={label}>
        {content}
      </Link>
    );
  }

  return (
    <button aria-disabled="true" aria-label={label} className={className} title={label} type="button">
      {content}
    </button>
  );
}

function MobileNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = isActivePath(pathname, item.href);
  const label = item.status ? `${item.label} (${item.status})` : item.label;
  const className = cn(
    "grid h-12 place-items-center rounded-full border text-white/58 transition",
    isActive
      ? "member-shimmer-action border-[#E6C766]/28 text-[#F6E3A3]"
      : "border-transparent hover:border-white/10 hover:bg-white/[0.045] hover:text-white",
    !item.href && "opacity-50",
  );

  if (item.href) {
    return (
      <Link aria-label={label} aria-current={isActive ? "page" : undefined} className={className} href={item.href}>
        <Icon aria-hidden="true" className="size-4" />
      </Link>
    );
  }

  return (
    <button aria-disabled="true" aria-label={label} className={className} type="button">
      <Icon aria-hidden="true" className="size-4" />
    </button>
  );
}

export function SessionNavBar({
  isMemberActive,
  memberEmail,
  memberName,
  memberStatus,
}: SessionNavBarProps) {
  const pathname = usePathname();
  const memberInitial = getInitial(memberName || memberEmail);
  const visibleNavigationItems = getNavigationItems(isMemberActive);
  const statusCopy = isMemberActive ? "Verified workspace" : "Verification required";

  return (
    <>
      <aside
        aria-label="Member navigation"
        className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/8 bg-[#030303]/96 shadow-[22px_0_70px_rgba(0,0,0,0.32)] backdrop-blur-xl lg:flex"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_30%_0%,rgba(230,199,102,0.13),transparent_62%)]" />
        <div className="relative flex h-dvh w-full flex-col px-4 py-4">
          <Link
            aria-label="Elite Gold dashboard"
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-3 transition hover:border-[#E6C766]/20 hover:bg-white/[0.045]"
            href="/dashboard"
          >
            <span className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-[#E6C766]/18 bg-[#E6C766]/8">
              <Image
                alt=""
                aria-hidden="true"
                className="object-contain p-1.5"
                fill
                sizes="44px"
                src="/brand/elite-gold-mark.png"
              />
            </span>
            <span className="min-w-0">
              <span className="elite-brand-type block truncate text-sm font-extrabold text-white">
                Elite Gold
              </span>
              <span className="mt-0.5 block text-xs font-medium text-white/42">
                Member Area
              </span>
            </span>
          </Link>

          <div className="mt-4 rounded-3xl border border-white/8 bg-white/[0.025] p-3 shadow-[0_18px_56px_rgba(0,0,0,0.24)]">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/28 text-sm font-extrabold text-[#F6E3A3]">
                {memberInitial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{memberName}</p>
                <p className="truncate text-xs text-white/38">{memberEmail}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-white/8 bg-black/24 px-3 py-2">
              <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-white/56">
                <BadgeCheck
                  aria-hidden="true"
                  className={cn("size-3.5 shrink-0", isMemberActive ? "text-emerald-200" : "text-[#F6E3A3]")}
                />
                <span className="truncate">{statusCopy}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[0.58rem] font-bold uppercase",
                  isMemberActive
                    ? "border-emerald-300/14 bg-emerald-300/7 text-emerald-100/76"
                    : "border-[#E6C766]/14 bg-[#E6C766]/7 text-[#F6E3A3]/78",
                )}
              >
                {memberStatus}
              </span>
            </div>
          </div>

          <nav className="mt-5 grid gap-1" aria-label="Dashboard sections">
            <p className="px-3 pb-1 text-[0.64rem] font-bold uppercase text-white/28">
              Workspace
            </p>
            {visibleNavigationItems.map((item) => (
              <DesktopNavItem item={item} key={item.label} pathname={pathname} />
            ))}
          </nav>

          <div className="mt-auto grid gap-3">
            <div className="rounded-3xl border border-white/8 bg-white/[0.025] p-3">
              <p className="text-[0.64rem] font-bold uppercase text-white/28">
                Account controls
              </p>
              <button
                aria-disabled="true"
                aria-label="Settings (Phase 5)"
                className="mt-2 flex h-12 w-full cursor-default items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 text-left text-white/34"
                title="Settings (Phase 5)"
                type="button"
              >
                <span className="grid size-9 place-items-center rounded-xl border border-white/8 bg-white/[0.025]">
                  <Settings aria-hidden="true" className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">Settings</span>
                  <span className="block text-xs text-white/30">Reserved for Phase 5</span>
                </span>
              </button>
            </div>

            <DashboardLogoutForm />
          </div>
        </div>
      </aside>

      <nav
        aria-label="Member navigation"
        className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 gap-1 rounded-full border border-white/10 bg-black/88 p-1 shadow-[0_22px_70px_rgba(0,0,0,0.46)] backdrop-blur-xl lg:hidden"
      >
        {visibleNavigationItems.map((item) => (
          <MobileNavItem item={item} key={item.label} pathname={pathname} />
        ))}
      </nav>
    </>
  );
}
