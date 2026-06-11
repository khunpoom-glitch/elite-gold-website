"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Menu, X } from "lucide-react";
import { publicNavigation } from "@/config/navigation";
import { AuthModal, type AuthMode } from "@/components/layout/auth-modal";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const closeAuthModal = useCallback(() => setAuthMode(null), []);

  function openAuthModal(mode: AuthMode) {
    setIsOpen(false);
    setAuthMode(mode);
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-black/72 px-3 py-3 backdrop-blur-xl sm:px-4">
        <Container className="elite-capsule-nav flex min-h-[4.25rem] items-center justify-between rounded-[1.35rem] border border-gold/24 px-4 sm:rounded-full sm:px-5">
          <Logo priority />
          <nav aria-label="Main navigation" className="elite-hero-nav-menu hidden lg:flex">
            {publicNavigation.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  className={cn(
                    "elite-hero-nav-link elite-display-type",
                    isActive && "elite-hero-nav-link-active",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="elite-hero-actions hidden lg:flex">
            <button
              className="elite-hero-login elite-display-type"
              onClick={() => openAuthModal("login")}
              type="button"
            >
              Login
            </button>
            <button
              className="elite-hero-signup elite-display-type"
              onClick={() => openAuthModal("signup")}
              type="button"
            >
              Signup
            </button>
          </div>
          <button
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-white transition-colors hover:bg-white/8 lg:hidden"
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            {isOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>
        </Container>
        {isOpen ? (
          <div className="mx-3 mt-2 rounded-2xl border border-gold/20 bg-black/92 shadow-2xl backdrop-blur-xl lg:hidden">
            <Container className="py-4">
              <nav aria-label="Mobile navigation" className="grid gap-1">
                {publicNavigation.map((item) => (
                  <Link
                    className="elite-hero-nav-link elite-display-type rounded-xl px-3 py-3"
                    href={item.href}
                    key={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  className={buttonVariants({
                    variant: "secondary",
                    size: "md",
                    className: "elite-display-type uppercase",
                  })}
                  onClick={() => openAuthModal("login")}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={buttonVariants({
                    variant: "primary",
                    size: "md",
                    className: "elite-display-type uppercase",
                  })}
                  onClick={() => openAuthModal("signup")}
                  type="button"
                >
                  Sign Up
                </button>
              </div>
            </Container>
          </div>
        ) : null}
      </header>
      <AuthModal mode={authMode} onClose={closeAuthModal} onModeChange={setAuthMode} />
    </>
  );
}
