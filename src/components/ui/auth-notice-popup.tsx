"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthNoticeTone = "warning" | "success" | "neutral";
type AuthNoticePlacement = "card" | "fixed";

type AuthNoticePopupProps = {
  className?: string;
  icon: LucideIcon;
  message: string;
  onClose: () => void;
  placement?: AuthNoticePlacement;
  role?: "alert" | "status";
  title: string;
  tone?: AuthNoticeTone;
};

const toneStyles = {
  neutral: {
    icon: "border-white/16 bg-white/[0.035] text-white/72",
    panel: "border-white/12 shadow-[0_18px_54px_rgba(0,0,0,0.46)]",
    title: "text-white/90",
  },
  success: {
    icon: "border-emerald-300/38 bg-emerald-400/[0.085] text-emerald-200",
    panel: "border-emerald-300/22 shadow-[0_18px_54px_rgba(0,0,0,0.46),0_0_22px_rgba(16,185,129,0.07)]",
    title: "text-white/92",
  },
  warning: {
    icon: "border-[#D4AF37]/24 bg-[#D4AF37]/[0.075] text-[#F6E3A3]",
    panel: "border-[#D4AF37]/22 shadow-[0_18px_54px_rgba(0,0,0,0.46),0_0_22px_rgba(212,175,55,0.06)]",
    title: "text-[#F6E3A3]",
  },
};

export function AuthNoticePopup({
  className,
  icon: Icon,
  message,
  onClose,
  placement = "fixed",
  role,
  title,
  tone = "warning",
}: AuthNoticePopupProps) {
  const styles = toneStyles[tone];
  const isFixed = placement === "fixed";

  return (
    <motion.div
      animate={{ filter: "blur(0px)", opacity: 1, y: 0, scale: 1 }}
      className={cn(
        isFixed
          ? "pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4.75rem)] z-[120] flex justify-center px-4 sm:top-[5.5rem] lg:top-[5.75rem]"
          : "absolute bottom-[calc(100%+0.7rem)] left-0 right-0 z-30 mx-auto w-[min(24rem,calc(100vw-2rem))]",
        className,
      )}
      exit={{
        filter: "blur(3px)",
        opacity: 0,
        y: isFixed ? -10 : -6,
        scale: 0.982,
        transition: { duration: 0.46, ease: [0.22, 1, 0.36, 1] },
      }}
      initial={{
        filter: "blur(3px)",
        opacity: 0,
        y: isFixed ? 10 : -6,
        scale: 0.982,
      }}
      role={role ?? (tone === "success" ? "status" : "alert")}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          "pointer-events-auto relative w-full rounded-2xl border bg-[#070707]/96 px-3.5 py-3 pr-11 text-left text-white ring-1 ring-white/[0.035] backdrop-blur-xl",
          isFixed ? "max-w-[22.5rem]" : "max-w-full",
          styles.panel,
        )}
      >
        <div className="flex min-h-[3.5rem] items-center gap-2.5">
          <span className={cn("inline-flex size-7 shrink-0 items-center justify-center rounded-full border", styles.icon)}>
            <Icon aria-hidden="true" className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block text-[0.82rem] font-semibold leading-5", styles.title)}>
              {title}
            </span>
            <span className="mt-0.5 block text-[0.72rem] leading-5 text-white/70">{message}</span>
          </span>
        </div>
        <button
          aria-label="Dismiss notice"
          className="absolute right-2.5 top-2.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-white/46 transition hover:bg-white/8 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
