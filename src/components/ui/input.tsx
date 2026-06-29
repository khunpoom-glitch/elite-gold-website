import type * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-white/10 bg-[#171717]/86 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-white/28 focus:ring-2 focus:ring-white/10 read-only:text-white/58",
        className,
      )}
      {...props}
    />
  );
}
