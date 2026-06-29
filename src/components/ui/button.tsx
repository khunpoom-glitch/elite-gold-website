import type * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-white/28 bg-[linear-gradient(180deg,#ffffff_0%,#e7e8ec_100%)] !text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_16px_42px_rgba(0,0,0,0.32)] hover:bg-[linear-gradient(180deg,#ffffff_0%,#f0f1f4_100%)] hover:!text-[#000000] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_52px_rgba(0,0,0,0.4)] focus-visible:outline-white/70",
  secondary:
    "border border-white/12 bg-[#171717]/88 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_14px_36px_rgba(0,0,0,0.24)] hover:border-white/22 hover:bg-[#202020] hover:text-white focus-visible:outline-white/60",
  outline:
    "border border-white/14 bg-transparent text-white/82 hover:border-white/24 hover:bg-white/[0.06] hover:text-white focus-visible:outline-white/60",
  ghost:
    "border border-transparent bg-transparent text-text-secondary hover:bg-white/[0.06] hover:text-white focus-visible:outline-white/60",
  link: "border border-transparent bg-transparent px-0 text-white/74 underline-offset-4 hover:text-white hover:underline focus-visible:outline-white/60",
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
    "elite-action-button inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
