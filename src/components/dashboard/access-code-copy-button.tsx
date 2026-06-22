"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type AccessCodeCopyButtonProps = {
  className?: string;
  label?: string;
  value: string;
};

export function AccessCodeCopyButton({
  className,
  label = "Copy",
  value,
}: AccessCodeCopyButtonProps) {
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
        "member-shimmer-action inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/50",
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
