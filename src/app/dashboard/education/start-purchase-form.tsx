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
    <form action={startMasterClassPurchaseAction} onSubmit={() => setIsSubmitting(true)}>
      <button
        aria-busy={isSubmitting}
        className="member-shimmer-action inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:border-white/24 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/32 disabled:cursor-wait disabled:opacity-78"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Creating reference..." : label}
        {isSubmitting ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <ArrowRight aria-hidden="true" className="size-4" />
        )}
      </button>
      <span aria-live="polite" className="sr-only" role="status">
        {isSubmitting ? "Creating your Master Class payment reference." : ""}
      </span>
    </form>
  );
}
