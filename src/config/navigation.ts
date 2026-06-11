import type { NavItem } from "@/types";

export const publicNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Community", href: "/about" },
  { label: "Trading Education", href: "/education" },
  { label: "Membership", href: "/membership" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const futureMemberNavigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Education", href: "/dashboard/education" },
  { label: "Journal", href: "/dashboard/journal" },
  { label: "Community", href: "/dashboard/community" },
  { label: "My Account", href: "/dashboard/account" },
];
