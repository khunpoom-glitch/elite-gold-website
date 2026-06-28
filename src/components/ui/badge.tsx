import type * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 font-mono text-[0.68rem] font-medium uppercase text-soft-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        className,
      )}
      {...props}
    />
  );
}
