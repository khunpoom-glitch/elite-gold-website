import type * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-lg border border-white/10 bg-[#0a0a0b] px-3 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] outline-none transition-[background,border-color,box-shadow,color] placeholder:text-text-muted focus:border-soft-gold/55 focus:bg-[#0d0d0e] focus:ring-2 focus:ring-gold/15",
        className,
      )}
      {...props}
    />
  );
}
