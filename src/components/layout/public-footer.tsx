import type { ReactNode } from "react";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { publicNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/ui/container";

const footerGroups = [
  {
    title: "Platform",
    links: publicNavigation,
  },
  {
    title: "Future Member Area",
    links: [
      { label: "Dashboard", href: "/login" },
      { label: "Education", href: "/education" },
      { label: "Journal", href: "/membership" },
      { label: "My Account", href: "/login" },
    ],
  },
];

type PublicFooterProps = {
  logo?: ReactNode;
};

export function PublicFooter({ logo }: PublicFooterProps = {}) {
  return (
    <footer className="border-t border-white/8 bg-black backdrop-blur-xl">
      <Container className="grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          {logo ?? <Logo />}
          <p className="mt-4 max-w-md text-sm leading-7 text-text-secondary">
            {siteConfig.description}
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm text-text-secondary sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-2">
              <Mail aria-hidden="true" className="h-4 w-4 text-soft-gold" />
              {siteConfig.contactEmail}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span className="inline-flex items-center gap-2">
              <MessageCircle aria-hidden="true" className="h-4 w-4 text-soft-gold" />
              {siteConfig.supportLine}
            </span>
          </div>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold uppercase text-soft-gold">
              {group.title}
            </h2>
            <ul className="mt-4 grid gap-3">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.href}-${link.label}`}>
                  <Link
                    className="text-sm text-text-secondary transition-colors hover:text-white"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="border-t border-white/8 py-5">
        <div className="flex flex-col gap-2 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Elite Gold Community. All rights reserved.</p>
          <p>Education, Journal, Community, Membership foundation.</p>
        </div>
      </Container>
    </footer>
  );
}
