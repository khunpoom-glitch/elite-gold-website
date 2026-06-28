import type * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-champagne/55 bg-[linear-gradient(180deg,#fffaf0,#e7c76c_52%,#af8026)] text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_18px_46px_rgba(0,0,0,0.34),0_0_28px_rgba(230,199,102,0.18)] hover:border-champagne/75 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_20px_52px_rgba(0,0,0,0.38),0_0_38px_rgba(230,199,102,0.24)] focus-visible:outline-soft-gold",
  secondary:
    "border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_38px_rgba(0,0,0,0.28)] hover:border-gold/32 hover:bg-white/[0.055] hover:text-champagne focus-visible:outline-white",
  outline:
    "border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_32px_rgba(0,0,0,0.22)] hover:border-soft-gold/36 hover:bg-gold/8 hover:text-white focus-visible:outline-soft-gold",
  ghost:
    "border border-transparent bg-transparent text-text-secondary hover:bg-white/[0.045] hover:text-white focus-visible:outline-white",
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
    "elite-action-button inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background,border-color,box-shadow,color,transform] duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50",
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
