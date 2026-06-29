import type * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-lg border border-white/10 bg-[#171717]/86 px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-white/28 focus:ring-2 focus:ring-white/10",
        className,
      )}
      {...props}
    />
  );
}
