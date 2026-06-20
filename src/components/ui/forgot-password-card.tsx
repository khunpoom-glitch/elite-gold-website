"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, X } from "lucide-react";
import { requestPasswordResetAction } from "@/app/auth/actions";
import { initialAuthActionState } from "@/lib/auth/action-state";
import { cn } from "@/lib/utils";

type ForgotPasswordCardProps = {
  className?: string;
  onClose?: () => void;
  onLoginClick?: () => void;
  titleId?: string;
};

export function Component({
  className,
  onClose,
  onLoginClick,
  titleId,
}: ForgotPasswordCardProps) {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialAuthActionState,
  );

  return (
    <motion.div
      animate={{ scale: 1, y: 0 }}
      className={cn("relative w-full max-w-[26rem]", className)}
      initial={{ scale: 0.96, y: 18 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div aria-hidden="true" className="elite-login-card-border-light" />
      <div className="relative z-10 overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#030303] p-6 text-white shadow-[inset_0_1px_0_rgba(248,250,252,0.12),0_34px_90px_rgba(0,0,0,0.58)]">
        {onClose ? (
          <button
            aria-label="Close"
            className="absolute right-3 top-3 z-20 inline-flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/42 transition-colors duration-200 hover:border-white/18 hover:bg-white/[0.07] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}

        <div className="relative z-10">
          <div className="mb-5 text-center">
            <span className="elite-login-card-logo relative mx-auto grid place-items-center">
              <Image
                alt=""
                aria-hidden="true"
                className="elite-login-card-logo-image object-contain"
                height={1875}
                src="/brand/elite-gold-mark.png"
                width={1875}
              />
            </span>
            <h2 className="elite-display-type mt-4 text-xl font-extrabold uppercase tracking-[0.08em] text-white" id={titleId}>
              Reset Password
            </h2>
            <p className="mt-2 text-xs font-light text-text-secondary">
              ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลสมาชิกของคุณ
            </p>
          </div>

          <form action={formAction} className="grid gap-3" noValidate>
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
              Email
              <span className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#D4AF37]/70"
                />
                <input
                  autoComplete="email"
                  className="elite-login-card-input h-11 w-full rounded-lg border border-white/10 bg-[#050505] pl-10 pr-3 text-sm text-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/28 focus:border-[#D4AF37]/60 focus:bg-[#050505] focus:ring-2 focus:ring-[#D4AF37]/18"
                  name="email"
                  placeholder="member@elitegold.com"
                  required
                  type="email"
                />
              </span>
            </label>

            {state.status === "error" ? (
              <div className="rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#F6E3A3]" role="alert">
                {state.message}
              </div>
            ) : null}

            {state.status === "success" ? (
              <p className="rounded-lg border border-[#D4AF37]/28 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#F6E3A3]">
                {state.message}
              </p>
            ) : null}

            <motion.button
              className="group/button relative mt-2 h-11 overflow-hidden rounded-lg bg-white font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isPending}
              type="submit"
              whileHover={{ scale: 1.018 }}
              whileTap={{ scale: 0.985 }}
            >
              <AnimatePresence mode="wait">
                {isPending ? (
                  <motion.span
                    animate={{ opacity: 1 }}
                    className="relative flex h-full items-center justify-center"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key="loading"
                  >
                    <span className="size-4 rounded-full border-2 border-black/70 border-t-transparent animate-spin" />
                  </motion.span>
                ) : (
                  <motion.span
                    animate={{ opacity: 1 }}
                    className="relative flex h-full items-center justify-center gap-2 text-sm"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key="text"
                  >
                    Send Reset Link
                    <ArrowRight aria-hidden="true" className="size-4 transition group-hover/button:translate-x-1" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <p className="pt-1 text-center text-xs text-white/58">
              Remember your password?{" "}
              {onLoginClick ? (
                <button
                  className="inline-flex items-center gap-1 font-semibold text-[#F6E3A3] transition hover:text-white"
                  onClick={onLoginClick}
                  type="button"
                >
                  <ArrowLeft aria-hidden="true" className="size-3" />
                  Login
                </button>
              ) : (
                <Link className="font-semibold text-[#F6E3A3] transition hover:text-white" href="/login">
                  Login
                </Link>
              )}
            </p>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
