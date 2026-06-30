"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ReceiptText, X } from "lucide-react";

type CheckoutModalFrameProps = {
  children: ReactNode;
  closeHref: string;
  labelledBy: string;
  onClose?: () => void;
  title: string;
};

export function CheckoutModalFrame({
  children,
  closeHref,
  labelledBy,
  onClose,
  title,
}: CheckoutModalFrameProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const portalRoot = typeof document === "undefined" ? null : document.body;

  const closeCheckout = useCallback(() => {
    setIsVisible(false);

    if (onClose) {
      onClose();
      return;
    }

    router.push(closeHref, { scroll: false });
  }, [closeHref, onClose, router]);

  useEffect(() => {
    if (!portalRoot || !isVisible) {
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
  }, [isVisible, portalRoot]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      closeCheckout();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeCheckout, isVisible]);

  if (!portalRoot || !isVisible) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex min-h-dvh items-center justify-center overflow-y-auto bg-black/62 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-6">
      <button
        aria-label="Close checkout"
        className="absolute inset-0 cursor-default"
        onClick={closeCheckout}
        type="button"
      />
      <section
        aria-labelledby={labelledBy}
        aria-modal="true"
        className="relative z-10 my-auto max-h-[calc(100dvh-2rem)] w-full max-w-[30rem] overflow-y-auto rounded-2xl border border-white/10 bg-[#171717] p-4 shadow-2xl shadow-black/50 sm:max-h-[calc(100dvh-3rem)] sm:p-5"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="member-kicker">
              <ReceiptText aria-hidden="true" className="size-3.5" />
              Master Class Checkout
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-white" id={labelledBy}>
              {title}
            </h2>
          </div>
          <button
            aria-label="Close checkout"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/58 transition hover:border-white/18 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/32"
            onClick={closeCheckout}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        {children}
      </section>
    </div>,
    portalRoot,
  );
}
