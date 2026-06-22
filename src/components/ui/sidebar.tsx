"use client";

import {
  FileClock,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Settings,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

type SessionNavBarProps = {
  isMemberActive: boolean;
  memberEmail: string;
  memberName: string;
  memberStatus: string;
};

type NavItem = {
  href?: string;
  icon: LucideIcon;
  label: string;
  status?: string;
};

const navigationItems: NavItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/dashboard/education",
    label: "Education",
    icon: GraduationCap,
    status: "Preview",
  },
  {
    href: "/dashboard/journal",
    label: "Trading Journal",
    icon: FileClock,
    status: "Preview",
  },
  {
    href: "/dashboard/community",
    label: "Community",
    icon: MessagesSquare,
    status: "Preview",
  },
  {
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

function RailItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = isActivePath(pathname, item.href);
  const label = item.status ? `${item.label} (${item.status})` : item.label;
  const className = cn(
    "group relative grid size-11 place-items-center rounded-2xl border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/50",
    isActive
      ? "member-shimmer-action border-[#E6C766]/28 text-[#F6E3A3]"
      : "border-white/8 bg-white/[0.025] text-white/54 hover:border-white/14 hover:bg-white/[0.055] hover:text-white",
    !item.href && "cursor-default opacity-50 hover:border-white/8 hover:bg-white/[0.025] hover:text-white/54",
  );
  const content = (
    <>
      <Icon aria-hidden="true" className="relative z-10 size-4" />
      {isActive ? (
        <span aria-hidden="true" className="absolute -right-1 top-1/2 h-5 w-px -translate-y-1/2 rounded-full bg-[#F6E3A3] shadow-[0_0_14px_rgba(230,199,102,0.56)]" />
      ) : null}
      <span className="pointer-events-none absolute left-[calc(100%+0.65rem)] top-1/2 z-50 hidden min-w-max -translate-y-1/2 rounded-xl border border-white/10 bg-[#080808]/96 px-3 py-2 text-xs font-semibold text-white/82 opacity-0 shadow-[0_18px_42px_rgba(0,0,0,0.45)] backdrop-blur-xl transition group-hover:block group-hover:opacity-100 group-focus-visible:block group-focus-visible:opacity-100">
        {label}
      </span>
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

  return (
    <>
      <aside
        aria-label="Member navigation"
        className="fixed inset-y-0 left-0 z-40 hidden w-20 border-r border-white/8 bg-black/92 shadow-[22px_0_70px_rgba(0,0,0,0.32)] backdrop-blur-xl md:flex"
      >
        <div className="flex h-dvh w-full flex-col items-center px-3 py-4">
          <Link
            aria-label="Elite Gold dashboard"
            className="relative grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] transition hover:border-[#E6C766]/24"
            href="/dashboard"
          >
            <Image
              alt=""
              aria-hidden="true"
              className="object-contain p-2"
              fill
              sizes="48px"
              src="/brand/elite-gold-mark.png"
            />
          </Link>

          <nav className="mt-6 grid gap-2" aria-label="Dashboard sections">
            {visibleNavigationItems.map((item) => (
              <RailItem item={item} key={item.label} pathname={pathname} />
            ))}
          </nav>

          <div className="mt-auto grid gap-2">
            <button
              aria-disabled="true"
              aria-label="Settings (Phase 5)"
              className="grid size-11 place-items-center rounded-2xl border border-white/8 bg-white/[0.025] text-white/34"
              title="Settings (Phase 5)"
              type="button"
            >
              <Settings aria-hidden="true" className="size-4" />
            </button>

            <div
              aria-label={`${memberName}, ${memberStatus}`}
              className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] text-xs font-extrabold text-[#F6E3A3]"
              title={`${memberName} - ${memberEmail} - ${memberStatus}`}
            >
              {memberInitial}
            </div>

            <form action={logoutAction}>
              <button
                aria-label="Logout"
                className="grid size-11 place-items-center rounded-2xl border border-white/8 bg-white/[0.025] text-white/54 transition hover:border-[#E6C766]/24 hover:bg-white/[0.055] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/50"
                title="Logout"
                type="submit"
              >
                <LogOut aria-hidden="true" className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <nav
        aria-label="Member navigation"
        className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 gap-1 rounded-full border border-white/10 bg-black/88 p-1 shadow-[0_22px_70px_rgba(0,0,0,0.46)] backdrop-blur-xl md:hidden"
      >
        {visibleNavigationItems.map((item) => (
          <MobileNavItem item={item} key={item.label} pathname={pathname} />
        ))}
      </nav>
    </>
  );
}
