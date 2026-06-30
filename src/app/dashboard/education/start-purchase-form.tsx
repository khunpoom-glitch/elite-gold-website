"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { startMasterClassPurchaseAction } from "./actions";

type StartPurchaseFormProps = {
  label?: string;
};

export function StartPurchaseForm({ label = "Buy Master Class" }: StartPurchaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <form action={startMasterClassPurchaseAction} onSubmit={() => setIsSubmitting(true)}>
        <button
          aria-busy={isSubmitting}
          className="member-shimmer-action inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:border-white/24 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/32 disabled:cursor-wait disabled:opacity-78"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Opening checkout..." : label}
          {isSubmitting ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ArrowRight aria-hidden="true" className="size-4" />
          )}
        </button>
      </form>
      {isSubmitting ? (
        <div
          aria-live="polite"
          className="fixed inset-0 z-[60] flex min-h-dvh items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-md"
          role="status"
        >
          <section className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#171717] p-5 text-center shadow-2xl shadow-black/50">
            <Loader2 aria-hidden="true" className="mx-auto size-5 animate-spin text-[#F6E3A3]" />
            <h2 className="mt-4 text-lg font-semibold text-white">Opening checkout</h2>
            <p className="mt-2 text-sm leading-6 text-white/52">
              Creating your Master Class payment reference.
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}
