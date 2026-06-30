"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { masterClassCourse } from "@/config/education";
import { CheckoutModalFrame } from "./checkout-modal-frame";

type BuyMasterClassButtonProps = {
  children: ReactNode;
};

export function BuyMasterClassButton({ children }: BuyMasterClassButtonProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  function openCheckout() {
    setIsCheckoutOpen(true);
  }

  return (
    <>
      <button
        className="member-shimmer-action inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:border-white/24 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/32"
        onClick={openCheckout}
        type="button"
      >
        Buy Master Class
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>

      {isCheckoutOpen ? (
        <CheckoutModalFrame
          closeHref="/dashboard/education"
          labelledBy="master-class-checkout-instant-title"
          onClose={() => setIsCheckoutOpen(false)}
          title={masterClassCourse.title}
        >
          {children}
        </CheckoutModalFrame>
      ) : null}
    </>
  );
}
