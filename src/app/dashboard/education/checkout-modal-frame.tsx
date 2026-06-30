"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type CheckoutModalFrameProps = {
  children: ReactNode;
  closeHref: string;
  labelledBy: string;
  onClose?: () => void;
};

export function CheckoutModalFrame({
  children,
  closeHref,
  labelledBy,
  onClose,
}: CheckoutModalFrameProps) {
  const router = useRouter();
  const portalRoot = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!portalRoot) {
      return;
    }

    const workspaceScroll = document.querySelector<HTMLElement>(".member-workspace-scroll");
    const originalBodyOverflow = document.body.style.overflow;
    const originalWorkspaceOverflow = workspaceScroll?.style.overflow;

    document.body.style.overflow = "hidden";

    if (workspaceScroll) {
      workspaceScroll.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;

      if (workspaceScroll) {
        workspaceScroll.style.overflow = originalWorkspaceOverflow ?? "";
      }
    };
  }, [portalRoot]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (onClose) {
        onClose();
        return;
      }

      router.push(closeHref, { scroll: false });
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeHref, onClose, router]);

  function handleCloseClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!onClose) {
      return;
    }

    event.preventDefault();
    onClose();
  }

  if (!portalRoot) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex min-h-dvh items-center justify-center overflow-y-auto bg-black/62 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-6">
      <Link
        aria-label="Close checkout"
        className="absolute inset-0 cursor-default"
        href={closeHref}
        onClick={handleCloseClick}
        scroll={false}
      />
      <section
        aria-labelledby={labelledBy}
        aria-modal="true"
        className="relative z-10 my-auto max-h-[calc(100dvh-2rem)] w-full max-w-[30rem] overflow-y-auto rounded-2xl border border-white/10 bg-[#171717] p-4 shadow-2xl shadow-black/50 sm:max-h-[calc(100dvh-3rem)] sm:p-5"
        role="dialog"
      >
        {children}
      </section>
    </div>,
    portalRoot,
  );
}
