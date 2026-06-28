import type * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-gold/25 bg-gold/10 px-2.5 py-1 text-xs font-semibold text-soft-gold",
        className,
      )}
      {...props}
    />
  );
}
