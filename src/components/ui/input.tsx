import type * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-white/10 bg-[#0a0a0b] px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] outline-none transition-[background,border-color,box-shadow,color] placeholder:text-white/28 focus:border-[#E6C766]/45 focus:bg-[#0d0d0e] focus:ring-2 focus:ring-[#D4AF37]/14 read-only:text-white/58",
        className,
      )}
      {...props}
    />
  );
}
