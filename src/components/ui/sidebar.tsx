"use client";

import { useState, type FocusEvent } from "react";
import { motion } from "framer-motion";
import {
  ChevronsUpDown,
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

const sidebarVariants = {
  open: {
    width: "16rem",
  },
  closed: {
    width: "4rem",
  },
};

const textVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.18 },
  },
  closed: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.12 },
  },
};

const transitionProps = {
  duration: 0.22,
  ease: "easeOut",
  type: "tween",
} as const;

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

function getInitial(email: string) {
  return email.trim().charAt(0).toUpperCase() || "E";
}

function SidebarNavItem({
  isCollapsed,
  item,
  pathname,
}: {
  isCollapsed: boolean;
  item: NavItem;
  pathname: string;
}) {
  const Icon = item.icon;
  const isActive = item.href === "/dashboard" ? pathname === item.href : Boolean(item.href && pathname.startsWith(item.href));
  const itemClassName = cn(
    "group flex h-9 w-full items-center gap-3 rounded-md px-2 text-sm font-semibold transition",
    isActive
      ? "border border-gold/30 bg-gold/12 text-champagne shadow-[inset_0_1px_0_rgba(246,227,163,0.12)]"
      : "border border-transparent text-white/58 hover:border-white/10 hover:bg-white/[0.045] hover:text-white",
    !item.href && "cursor-default opacity-80",
  );
  const content = (
    <>
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <motion.span
        animate={isCollapsed ? "closed" : "open"}
        className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap"
        variants={textVariants}
      >
        <span className="truncate">{item.label}</span>
        {item.status ? (
          <span className="ml-auto rounded border border-gold/20 bg-gold/10 px-1.5 py-0.5 text-[0.62rem] font-bold uppercase text-soft-gold">
            {item.status}
          </span>
        ) : null}
      </motion.span>
    </>
  );

  if (item.href) {
    return (
      <Link aria-current={isActive ? "page" : undefined} className={itemClassName} href={item.href}>
        {content}
      </Link>
    );
  }

  return (
    <button aria-disabled="true" className={itemClassName} title={`${item.label} (${item.status})`} type="button">
      {content}
    </button>
  );
}

function MobileNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = item.href ? pathname === item.href : false;
  const className = cn(
    "grid h-12 place-items-center rounded-full border text-white/58 transition",
    isActive
      ? "border-gold/30 bg-gold/12 text-champagne"
      : "border-transparent hover:border-white/10 hover:bg-white/[0.045] hover:text-white",
    !item.href && "opacity-60",
  );

  if (item.href) {
    return (
      <Link aria-label={item.label} aria-current={isActive ? "page" : undefined} className={className} href={item.href}>
        <Icon aria-hidden="true" className="size-4" />
      </Link>
    );
  }

  return (
    <button aria-disabled="true" aria-label={`${item.label} (${item.status})`} className={className} type="button">
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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const memberInitial = getInitial(memberName || memberEmail);
  const visibleNavigationItems = getNavigationItems(isMemberActive);

  function handleBlur(event: FocusEvent<HTMLElement>) {
    const nextTarget = event.relatedTarget as Node | null;

    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      setIsCollapsed(true);
    }
  }

  return (
    <>
      <motion.aside
        animate={isCollapsed ? "closed" : "open"}
        aria-label="Member navigation"
        className="fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-white/10 bg-black/94 shadow-[22px_0_70px_rgba(0,0,0,0.38)] backdrop-blur-xl md:block"
        initial="closed"
        onBlur={handleBlur}
        onFocus={() => setIsCollapsed(false)}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        transition={transitionProps}
        variants={sidebarVariants}
      >
        <div className="flex h-dvh flex-col px-2 py-3">
          <div className="mb-5 flex h-11 items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] px-2">
            <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-md border border-gold/25 bg-black">
              <Image
                alt=""
                aria-hidden="true"
                className="object-contain p-1"
                fill
                sizes="28px"
                src="/brand/elite-gold-mark.png"
              />
            </span>
            <motion.div
              animate={isCollapsed ? "closed" : "open"}
              className="min-w-0 overflow-hidden"
              variants={textVariants}
            >
              <p className="elite-brand-type truncate text-xs text-white">Elite Gold</p>
              <p className="truncate text-[0.68rem] font-semibold uppercase text-soft-gold">Member Area</p>
            </motion.div>
            <motion.span animate={isCollapsed ? "closed" : "open"} className="ml-auto" variants={textVariants}>
              <ChevronsUpDown aria-hidden="true" className="size-4 text-white/34" />
            </motion.span>
          </div>

          <nav className="grid gap-1" aria-label="Dashboard sections">
            {visibleNavigationItems.map((item) => (
              <SidebarNavItem
                isCollapsed={isCollapsed}
                item={item}
                key={item.label}
                pathname={pathname}
              />
            ))}
          </nav>

          <div className="mt-auto grid gap-2">
            <button
              aria-disabled="true"
              className="group flex h-9 w-full cursor-default items-center gap-3 rounded-md border border-transparent px-2 text-sm font-semibold text-white/48"
              title="Settings (Phase 5)"
              type="button"
            >
              <Settings aria-hidden="true" className="size-4 shrink-0" />
              <motion.span
                animate={isCollapsed ? "closed" : "open"}
                className="overflow-hidden whitespace-nowrap"
                variants={textVariants}
              >
                Settings
              </motion.span>
            </button>

            <div className="rounded-md border border-white/10 bg-white/[0.035] p-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-md border border-gold/24 bg-gold/10 text-xs font-extrabold text-champagne">
                  {memberInitial}
                </span>
                <motion.div
                  animate={isCollapsed ? "closed" : "open"}
                  className="min-w-0 flex-1 overflow-hidden"
                  variants={textVariants}
                >
                  <p className="truncate text-xs font-semibold text-white">{memberName}</p>
                  <p className="truncate text-[0.68rem] text-white/48">{memberEmail}</p>
                  <p className="truncate text-[0.62rem] font-semibold uppercase text-soft-gold/80">{memberStatus}</p>
                </motion.div>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                className="flex h-9 w-full items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] px-2 text-sm font-semibold text-white/64 transition hover:border-gold/30 hover:bg-gold/10 hover:text-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-gold/50"
                type="submit"
              >
                <LogOut aria-hidden="true" className="size-4 shrink-0" />
                <motion.span
                  animate={isCollapsed ? "closed" : "open"}
                  className="overflow-hidden whitespace-nowrap"
                  variants={textVariants}
                >
                  Logout
                </motion.span>
              </button>
            </form>
          </div>
        </div>
      </motion.aside>

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
