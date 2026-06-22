import type * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-[#050505] px-3 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-[#E6C766]/45 focus:ring-2 focus:ring-[#D4AF37]/14 read-only:text-white/58",
        className,
      )}
      {...props}
    />
  );
}
