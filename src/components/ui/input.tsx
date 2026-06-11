import type * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-border bg-black/35 px-3 text-sm text-white outline-none transition-colors placeholder:text-text-muted focus:border-soft-gold focus:ring-2 focus:ring-gold/20",
        className,
      )}
      {...props}
    />
  );
}
