"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ReceiptText, X } from "lucide-react";
import { masterClassCourse } from "@/config/education";
import { CheckoutModalFrame } from "./checkout-modal-frame";
import { StartPurchaseForm } from "./start-purchase-form";

type BuyMasterClassButtonProps = {
  checkoutHref: string;
};

export function BuyMasterClassButton({ checkoutHref }: BuyMasterClassButtonProps) {
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    router.prefetch(checkoutHref);
  }, [checkoutHref, router]);

  function openCheckout() {
    setIsPreviewOpen(true);
    startTransition(() => {
      router.push(checkoutHref, { scroll: false });
    });
  }

  return (
    <>
      <button
        aria-busy={isPending}
        className="member-shimmer-action inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:border-white/24 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/32"
        onClick={openCheckout}
        type="button"
      >
        Buy Master Class
        {isPending ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <ArrowRight aria-hidden="true" className="size-4" />
        )}
      </button>

      {isPreviewOpen ? (
        <CheckoutModalFrame
          closeHref="/dashboard/education"
          labelledBy="master-class-checkout-preview-title"
          onClose={() => setIsPreviewOpen(false)}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="member-kicker">
                <ReceiptText aria-hidden="true" className="size-3.5" />
                Master Class Checkout
              </span>
              <h2 className="mt-3 text-2xl font-semibold text-white" id="master-class-checkout-preview-title">
                {masterClassCourse.title}
              </h2>
            </div>
            <button
              aria-label="Close checkout"
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/58 transition hover:border-white/18 hover:text-white"
              onClick={() => setIsPreviewOpen(false)}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            <p className="text-sm leading-7 text-white/56">
              Preparing your checkout window. If you are starting a new purchase, create a payment reference below.
            </p>
            <StartPurchaseForm label="Create Payment Reference" />
          </div>
        </CheckoutModalFrame>
      ) : null}
    </>
  );
}
