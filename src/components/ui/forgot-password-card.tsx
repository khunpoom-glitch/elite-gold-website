"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Mail, X } from "lucide-react";
import { requestPasswordResetAction } from "@/app/auth/actions";
import { AuthBotProtectionFields } from "@/components/auth/bot-protection-fields";
import { initialAuthActionState, type AuthActionState } from "@/lib/auth/action-state";
import { cn } from "@/lib/utils";

type ForgotPasswordCardProps = {
  className?: string;
  onClose?: () => void;
  onLoginClick?: () => void;
  titleId?: string;
};

function getForgotPasswordNoticeCopy(state: AuthActionState) {
  if (state.status === "success") {
    return {
      icon: CheckCircle2,
      title: "Reset link sent",
      message: "Please check your inbox for the secure password reset link.",
    };
  }

  if (state.status === "error") {
    const hasEmailError = Boolean(state.fieldErrors?.email);

    return {
      icon: AlertTriangle,
      title: hasEmailError ? "Check your email" : "Unable to send reset link",
      message: hasEmailError
        ? "Please enter a valid member email to continue."
        : "Please try again in a moment.",
    };
  }

  return null;
}

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
  const noticeCopy = getForgotPasswordNoticeCopy(state);
  const NoticeIcon = noticeCopy?.icon;

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
              Enter your member email and we will send a secure reset link.
            </p>
          </div>

          <form action={formAction} className="grid gap-3" noValidate>
            <AuthBotProtectionFields />
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

            {noticeCopy && NoticeIcon ? (
              <div
                className={cn(
                  "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left",
                  state.status === "success"
                    ? "border-emerald-400/24 bg-emerald-400/8 text-emerald-100"
                    : "border-[#D4AF37]/28 bg-[#D4AF37]/10 text-[#F6E3A3]",
                )}
                role={state.status === "error" ? "alert" : "status"}
              >
                <NoticeIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold leading-4">{noticeCopy.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-white/62">{noticeCopy.message}</span>
                </span>
              </div>
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
