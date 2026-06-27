"use client";

import {
  BadgeCheck,
  FileClock,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  MessagesSquare,
  Settings,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearClientAuthSession, waitForLogoutFeedback } from "@/lib/auth/client-logout";
import { cn } from "@/lib/utils";

type SessionNavBarProps = {
  isMemberActive: boolean;
  memberAvatarUrl: string | null;
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

function DashboardLogoutButton({ collapsed, pending }: { collapsed: boolean; pending: boolean }) {
  return (
    <button
      aria-disabled={pending}
      aria-label={pending ? "Signing out" : "Logout"}
      className={cn(
        "group flex h-10 w-full items-center rounded-xl text-left text-white/42 transition hover:bg-white/7 hover:text-white/72 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/28 disabled:cursor-wait disabled:opacity-75",
        collapsed ? "justify-center px-0" : "gap-3 px-3",
      )}
      disabled={pending}
      title={pending ? "Signing out..." : "Logout"}
      type="submit"
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <LogOut aria-hidden="true" className="size-4" />
      )}
      <span className={cn("text-sm font-semibold", collapsed && "sr-only")}>
        {pending ? "Signing out..." : "Logout"}
      </span>
    </button>
  );
}

function DashboardLogoutForm({ collapsed }: { collapsed: boolean }) {
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
      <DashboardLogoutButton collapsed={collapsed} pending={pending} />
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

function DesktopNavItem({ collapsed, item, pathname }: { collapsed: boolean; item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = isActivePath(pathname, item.href);
  const label = item.status ? `${item.label} (${item.status})` : item.label;
  const className = cn(
    "group flex h-10 items-center rounded-xl text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/28",
    collapsed ? "justify-center px-0" : "gap-3 px-3",
    isActive
      ? "bg-white/10 text-white"
      : "text-white/42 hover:bg-white/7 hover:text-white/72",
    !item.href && "cursor-default opacity-[0.48] hover:bg-transparent hover:text-white/42",
  );
  const content = (
    <>
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className={cn("min-w-0 flex-1 truncate text-sm font-semibold", collapsed && "sr-only")}>{item.label}</span>
      {item.status && item.status !== "Live" && !collapsed ? (
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
  memberAvatarUrl,
  memberEmail,
  memberName,
  memberStatus,
}: SessionNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const memberInitial = getInitial(memberName || memberEmail);
  const visibleNavigationItems = getNavigationItems(isMemberActive);
  const statusCopy = isMemberActive ? "Verified workspace" : "Verification required";
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  useEffect(() => {
    const storedState = window.localStorage.getItem("elite-gold-sidebar-collapsed");

    if (storedState === "true") {
      window.requestAnimationFrame(() => setCollapsed(true));
    }
  }, []);

  useEffect(() => {
    const sidebarWidth = collapsed ? "4.75rem" : "18rem";

    document.documentElement.style.setProperty("--member-sidebar-width", sidebarWidth);
    window.localStorage.setItem("elite-gold-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <>
      <aside
        aria-label="Member navigation"
        className="member-sidebar-enter fixed inset-y-0 left-0 z-40 hidden w-[var(--member-sidebar-width,18rem)] border-r border-white/8 bg-[#171716] transition-[width] duration-200 ease-out lg:flex"
      >
        <div className="flex h-dvh w-full flex-col">
          <div className={cn("relative flex h-16 items-center px-4", collapsed && "justify-center px-0")}>
            <Link
              aria-label="Elite Gold Community home"
              className={cn(
                "group flex min-w-0 items-center gap-1.5 py-1.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F6E3A3]/45",
                collapsed ? "justify-center" : "mr-12",
              )}
              href="/"
            >
                <span className="relative grid h-12 w-9 shrink-0 place-items-center overflow-hidden">
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="object-contain p-0.5"
                    fill
                    sizes="48px"
                    src="/brand/elite-gold-logo.png"
                  />
                </span>
              {!collapsed ? (
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-white transition group-hover:text-[#F6E3A3]">
                    Elite Gold Community
                  </span>
                  <span className="sr-only">Home</span>
                </span>
              ) : null}
            </Link>
            <button
              aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
              aria-pressed={collapsed}
              className={cn(
                "grid size-9 place-items-center rounded-lg text-white/46 transition hover:bg-white/7 hover:text-white/82 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/28",
                collapsed ? "absolute top-[4.25rem]" : "absolute right-3",
              )}
              onClick={() => setCollapsed((value) => !value)}
              title={collapsed ? "Show sidebar" : "Hide sidebar"}
              type="button"
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>
          </div>

          <nav className={cn("grid gap-1", collapsed ? "mx-3 mt-24" : "mx-4 mt-7")} aria-label="Dashboard sections">
            <p className={cn("px-3 py-2 text-[0.68rem] font-bold uppercase text-white/24", collapsed && "sr-only")}>
              Workspace
            </p>
            {visibleNavigationItems.map((item) => (
              <DesktopNavItem collapsed={collapsed} item={item} key={item.label} pathname={pathname} />
            ))}
          </nav>

          <div className={cn("mt-auto border-t border-white/8 pb-3 pt-4", collapsed ? "mx-2" : "mx-4")}>
            <div className={cn("mb-2 flex items-center", collapsed ? "justify-center px-0" : "gap-3 px-3")}>
              {memberAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`${memberName} profile`}
                  className="size-8 shrink-0 rounded-full border border-white/10 bg-[#242423] object-cover"
                  referrerPolicy="no-referrer"
                  src={memberAvatarUrl}
                />
              ) : (
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-[#242423] text-xs font-bold text-white/62"
                  title={`${memberName} - ${memberStatus}`}
                >
                  {memberInitial}
                </span>
              )}
              <div className={cn("min-w-0 flex-1", collapsed && "sr-only")}>
                <p className="truncate text-sm font-semibold text-white/68">{memberName}</p>
                <p className="truncate text-xs text-white/30">{memberEmail}</p>
              </div>
              <BadgeCheck
                aria-label={statusCopy}
                className={cn("size-4 shrink-0", collapsed && "sr-only", isMemberActive ? "text-emerald-200/60" : "text-white/30")}
              />
            </div>
            <button
              aria-disabled="true"
              aria-label="Settings (Phase 5)"
              className={cn("flex h-10 w-full cursor-default items-center rounded-xl text-left text-white/42", collapsed ? "justify-center px-0" : "gap-3 px-3")}
              title="Settings (Phase 5)"
              type="button"
            >
              <Settings aria-hidden="true" className="size-4" />
              <span className={cn("text-sm font-semibold", collapsed && "sr-only")}>Settings</span>
            </button>

            <DashboardLogoutForm collapsed={collapsed} />
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
