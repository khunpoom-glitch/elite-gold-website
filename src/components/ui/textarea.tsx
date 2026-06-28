import type * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-md border border-border bg-black px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-text-muted focus:border-soft-gold focus:ring-2 focus:ring-gold/20",
        className,
      )}
      {...props}
    />
  );
}
