import type * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-champagne/60 bg-[linear-gradient(135deg,#fff8d7,#e6c766_44%,#9f741c)] text-black shadow-[0_0_34px_rgba(230,199,102,0.28)] hover:shadow-[0_0_48px_rgba(230,199,102,0.42)] focus-visible:outline-soft-gold",
  secondary:
    "border border-white/12 bg-white/[0.055] text-white hover:border-gold/44 hover:bg-gold/10 hover:text-champagne focus-visible:outline-white",
  outline:
    "border border-gold/35 bg-transparent text-soft-gold hover:border-soft-gold hover:bg-gold/10 focus-visible:outline-soft-gold",
  ghost:
    "border border-transparent bg-transparent text-text-secondary hover:bg-white/8 hover:text-white focus-visible:outline-white",
  link: "border border-transparent bg-transparent px-0 text-soft-gold underline-offset-4 hover:text-white hover:underline focus-visible:outline-soft-gold",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "elite-action-button inline-flex items-center justify-center gap-2 rounded-full font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      type={type}
      {...props}
    />
  );
}
