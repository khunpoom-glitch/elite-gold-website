"use client";

import {
  BadgeCheck,
  FileClock,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MessagesSquare,
  Search,
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
      className="group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-white/42 transition hover:bg-white/7 hover:text-white/72 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/28 disabled:cursor-wait disabled:opacity-75"
      disabled={pending}
      title={pending ? "Signing out..." : "Logout"}
      type="submit"
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <LogOut aria-hidden="true" className="size-4" />
      )}
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
    "group flex h-10 items-center gap-3 rounded-xl px-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/28",
    isActive
      ? "bg-white/10 text-white"
      : "text-white/42 hover:bg-white/7 hover:text-white/72",
    !item.href && "cursor-default opacity-[0.48] hover:bg-transparent hover:text-white/42",
  );
  const content = (
    <>
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.label}</span>
      {item.status && item.status !== "Live" ? (
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.62rem] font-bold text-white/46">
          {item.status}
        </span>
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
        className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/8 bg-[#171716] shadow-[22px_0_70px_rgba(0,0,0,0.28)] lg:flex"
      >
        <div className="flex h-dvh w-full flex-col px-4 py-5">
          <Link
            aria-label="Elite Gold Community home"
            className="group flex items-center gap-3 rounded-xl px-1 py-1.5 transition hover:bg-white/7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/28"
            href="/"
          >
            <span className="relative grid h-12 w-10 shrink-0 place-items-center overflow-hidden">
              <Image
                alt=""
                aria-hidden="true"
                className="object-contain p-1"
                fill
                sizes="48px"
                src="/brand/elite-gold-logo.png"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-white transition group-hover:text-[#F6E3A3]">
                Elite Gold Community
              </span>
              <span className="sr-only">Home</span>
            </span>
          </Link>

          <div className="mt-8 flex h-10 items-center gap-3 rounded-xl px-3 text-white/36">
            <Search aria-hidden="true" className="size-4" />
            <span className="text-sm font-semibold">Search</span>
          </div>

          <nav className="mt-2 grid gap-1" aria-label="Dashboard sections">
            <p className="px-3 py-2 text-[0.68rem] font-bold uppercase text-white/24">
              Workspace
            </p>
            {visibleNavigationItems.map((item) => (
              <DesktopNavItem item={item} key={item.label} pathname={pathname} />
            ))}
          </nav>

          <div className="mt-auto border-t border-white/8 pt-5">
            <div className="mb-3 flex items-center gap-3 px-3">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-[#242423] text-xs font-bold text-white/62"
                title={`${memberName} - ${memberStatus}`}
              >
                {memberInitial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white/68">{memberName}</p>
                <p className="truncate text-xs text-white/30">{memberEmail}</p>
              </div>
              <BadgeCheck
                aria-label={statusCopy}
                className={cn("size-4 shrink-0", isMemberActive ? "text-emerald-200/60" : "text-white/30")}
              />
            </div>
            <button
              aria-disabled="true"
              aria-label="Settings (Phase 5)"
              className="mb-1 flex h-10 w-full cursor-default items-center gap-3 rounded-xl px-3 text-left text-white/42"
              title="Settings (Phase 5)"
              type="button"
            >
              <Settings aria-hidden="true" className="size-4" />
              <span className="text-sm font-semibold">Settings</span>
            </button>

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
