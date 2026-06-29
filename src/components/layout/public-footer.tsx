import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/ui/container";

const footerGroups = [
  {
    title: "PLATFORM",
    links: [
      { label: "Home", href: "/" },
      { label: "About Community", href: "/about" },
      { label: "Trading Education", href: "/education" },
      { label: "Membership", href: "/membership" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "MEMBER PORTAL",
    links: [
      { label: "Dashboard", href: "/login" },
      { label: "Education", href: "/education" },
      { label: "Journal", href: "/membership" },
      { label: "My Account", href: "/login" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Risk Disclosure", href: "/risk-disclosure" },
    ],
  },
];

type PublicFooterProps = {
  logo?: ReactNode;
};

export function PublicFooter({ logo }: PublicFooterProps = {}) {
  return (
    <footer className="elite-public-footer backdrop-blur-xl">
      <Container className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.85fr_0.85fr_0.85fr]">
        <div>
          {logo ?? <Logo />}
          <p className="mt-4 max-w-md text-sm leading-7 text-text-secondary">
            Elite Gold is a trading community and educational platform designed to
            help traders build discipline, consistency, and long-term growth.
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-medium uppercase text-white/64">
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
            {group.title === "LEGAL" ? (
              <p className="mt-5 max-w-xs text-xs leading-6 text-text-muted">
                Trading involves risk. Past performance does not guarantee future
                results.
              </p>
            ) : null}
          </div>
        ))}
      </Container>
      <Container className="border-t border-white/8 py-5">
        <div className="flex flex-col gap-2 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Elite Gold Community. All rights reserved.</p>
          <p>Education. Journal. Community. Membership.</p>
        </div>
      </Container>
    </footer>
  );
}
