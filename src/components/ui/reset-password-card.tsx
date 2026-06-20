"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeClosed, Lock } from "lucide-react";
import { updatePasswordAction } from "@/app/auth/actions";
import { initialAuthActionState } from "@/lib/auth/action-state";

export function ResetPasswordCard() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialAuthActionState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state]);

  return (
    <motion.div
      animate={{ scale: 1, y: 0 }}
      className="relative w-full max-w-[26rem]"
      initial={{ scale: 0.96, y: 18 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div aria-hidden="true" className="elite-login-card-border-light" />
      <div className="relative z-10 overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#030303] p-6 text-white shadow-[inset_0_1px_0_rgba(248,250,252,0.12),0_34px_90px_rgba(0,0,0,0.58)]">
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
          <h1 className="elite-display-type mt-4 text-xl font-extrabold uppercase tracking-[0.08em] text-white">
            New Password
          </h1>
          <p className="mt-2 text-xs font-light text-text-secondary">
            ตั้งรหัสผ่านใหม่สำหรับบัญชี Elite Gold Community
          </p>
        </div>

        <form action={formAction} className="grid gap-3" noValidate>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
            New Password
            <span className="relative">
              <Lock
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#D4AF37]/70"
              />
              <input
                autoComplete="new-password"
                className="elite-login-card-input h-11 w-full rounded-lg border border-white/10 bg-[#050505] pl-10 pr-11 text-sm text-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/28 focus:border-[#D4AF37]/60 focus:bg-[#050505] focus:ring-2 focus:ring-[#D4AF37]/18"
                name="password"
                placeholder="New password"
                required
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 cursor-pointer text-white/40 transition-colors duration-300 hover:text-white"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <Eye aria-hidden="true" className="size-4" /> : <EyeClosed aria-hidden="true" className="size-4" />}
              </button>
            </span>
          </label>

          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
            Confirm Password
            <span className="relative">
              <Lock
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#D4AF37]/70"
              />
              <input
                autoComplete="new-password"
                className="elite-login-card-input h-11 w-full rounded-lg border border-white/10 bg-[#050505] pl-10 pr-11 text-sm text-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/28 focus:border-[#D4AF37]/60 focus:bg-[#050505] focus:ring-2 focus:ring-[#D4AF37]/18"
                name="confirmPassword"
                placeholder="Confirm password"
                required
                type={showConfirmPassword ? "text" : "password"}
              />
              <button
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 cursor-pointer text-white/40 transition-colors duration-300 hover:text-white"
                onClick={() => setShowConfirmPassword((current) => !current)}
                type="button"
              >
                {showConfirmPassword ? <Eye aria-hidden="true" className="size-4" /> : <EyeClosed aria-hidden="true" className="size-4" />}
              </button>
            </span>
          </label>

          {state.status === "error" ? (
            <div className="rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#F6E3A3]" role="alert">
              {state.message}
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
                  Update Password
                  <ArrowRight aria-hidden="true" className="size-4 transition group-hover/button:translate-x-1" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <p className="pt-1 text-center text-xs text-white/58">
            กลับไปหน้า{" "}
            <Link className="font-semibold text-[#F6E3A3] transition hover:text-white" href="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </motion.div>
  );
}
