"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type ReferralCopyButtonProps = {
  className?: string;
  label?: string;
  value: string;
};

export function ReferralCopyButton({
  className,
  label = "Copy",
  value,
}: ReferralCopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const isCopied = status === "copied";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 2200);
    }
  }

  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-gold/30 bg-gold/10 px-3 text-xs font-bold text-soft-gold transition hover:border-soft-gold hover:bg-gold/16 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-gold/50",
        className,
      )}
      onClick={handleCopy}
      type="button"
    >
      {isCopied ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
      {status === "error" ? "Copy failed" : isCopied ? "Copied" : label}
    </button>
  );
}
