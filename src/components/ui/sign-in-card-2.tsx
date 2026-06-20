"use client";

import { useActionState, useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Eye, EyeClosed, Lock, Mail, X } from "lucide-react";
import { loginWithPasswordAction } from "@/app/auth/actions";
import { GoogleLogo } from "@/components/ui/google-logo";
import { initialAuthActionState } from "@/lib/auth/action-state";
import { cn } from "@/lib/utils";

type SignInCardProps = {
  className?: string;
  onClose?: () => void;
  onForgotPasswordClick?: () => void;
  onSignupClick?: () => void;
  titleId?: string;
};

const forgotPasswordLinkClassName =
  "text-xs font-normal text-[#F6E3A3] transition hover:text-white";
const forgotPasswordLinkStyle = {
  fontSize: "0.75rem",
  fontWeight: 400,
  lineHeight: "1rem",
};

function getInitialNextPath() {
  if (typeof window === "undefined") {
    return "/dashboard";
  }

  const searchParams = new URLSearchParams(window.location.search);

  return searchParams.get("next") ?? "/dashboard";
}

export function Component({
  className,
  onClose,
  onForgotPasswordClick,
  onSignupClick,
  titleId,
}: SignInCardProps) {
  const [state, formAction, isPending] = useActionState(
    loginWithPasswordAction,
    initialAuthActionState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(null);
  const [nextPath] = useState(getInitialNextPath);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-260, 260], [8, -8]);
  const rotateY = useTransform(mouseX, [-260, 260], [-8, 8]);

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state]);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left - rect.width / 2);
    mouseY.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function handleGoogleLogin() {
    const searchParams = new URLSearchParams({
      intent: "login",
      next: nextPath,
    });

    window.location.assign(`/auth/google?${searchParams.toString()}`);
  }

  return (
    <motion.div
      className={cn("relative w-full max-w-[26rem]", className)}
      initial={{ scale: 0.96, y: 18 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1400 }}
    >
      <motion.div
        className="group relative"
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
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
                Welcome Back
              </h2>
              <p className="mt-2 text-xs font-light text-text-secondary">
                Continue your journey with the Elite Gold Community.
              </p>
            </div>

            <form action={formAction} className="grid gap-3" noValidate>
              <input name="next" type="hidden" value={nextPath} />
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
                Email
                <span className="relative">
                  <Mail
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors",
                      focusedInput === "email" ? "text-[#F6E3A3]" : "text-[#D4AF37]/70",
                    )}
                  />
                  <input
                    autoComplete="email"
                    className="elite-login-card-input h-11 w-full rounded-lg border border-white/10 bg-[#050505] pl-10 pr-3 text-sm text-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/28 focus:border-[#D4AF37]/60 focus:bg-[#050505] focus:ring-2 focus:ring-[#D4AF37]/18"
                    name="email"
                    onBlur={() => setFocusedInput(null)}
                    onFocus={() => setFocusedInput("email")}
                    placeholder="member@elitegold.com"
                    required
                    type="email"
                  />
                </span>
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
                Password
                <span className="relative">
                  <Lock
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors",
                      focusedInput === "password" ? "text-[#F6E3A3]" : "text-[#D4AF37]/70",
                    )}
                  />
                  <input
                    autoComplete="current-password"
                    className="elite-login-card-input h-11 w-full rounded-lg border border-white/10 bg-[#050505] pl-10 pr-11 text-sm text-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/28 focus:border-[#D4AF37]/60 focus:bg-[#050505] focus:ring-2 focus:ring-[#D4AF37]/18"
                    name="password"
                    onBlur={() => setFocusedInput(null)}
                    onFocus={() => setFocusedInput("password")}
                    placeholder="Password"
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

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-white/68 transition hover:text-white">
                  <input
                    checked={rememberMe}
                    className="size-4 appearance-none rounded border border-[#D4AF37]/45 bg-white/[0.04] transition checked:border-[#F6E3A3] checked:bg-[#D4AF37]"
                    name="remember"
                    onChange={() => setRememberMe((current) => !current)}
                    type="checkbox"
                  />
                  Remember me
                </label>
                {onForgotPasswordClick ? (
                  <button
                    className={forgotPasswordLinkClassName}
                    onClick={onForgotPasswordClick}
                    style={forgotPasswordLinkStyle}
                    type="button"
                  >
                    Forgot password?
                  </button>
                ) : (
                  <Link
                    className={forgotPasswordLinkClassName}
                    href="/forgot-password"
                    style={forgotPasswordLinkStyle}
                  >
                    Forgot password?
                  </Link>
                )}
              </div>

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
                      key="loading"
                      className="relative flex h-full items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="size-4 rounded-full border-2 border-black/70 border-t-transparent animate-spin" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="text"
                      className="relative flex h-full items-center justify-center gap-2 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Login
                      <ArrowRight aria-hidden="true" className="size-4 transition group-hover/button:translate-x-1" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-white/8" />
                <span className="text-xs text-white/38">or</span>
                <span className="h-px flex-1 bg-white/8" />
              </div>

              <motion.button
                className="flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] text-[0.78rem] font-normal leading-none text-white/82 transition hover:border-[#D4AF37]/35 hover:bg-white/[0.07] hover:text-white"
                onClick={handleGoogleLogin}
                style={{ fontSize: "0.78rem", lineHeight: 1 }}
                type="button"
                whileHover={{ scale: 1.018 }}
                whileTap={{ scale: 0.985 }}
              >
                <GoogleLogo />
                Login with Google
              </motion.button>

              <p className="pt-1 text-center text-xs text-white/58">
                Don&apos;t have an account?{" "}
                {onSignupClick ? (
                  <button
                    className="font-semibold text-[#F6E3A3] transition hover:text-white"
                    onClick={onSignupClick}
                    type="button"
                  >
                    Sign up
                  </button>
                ) : (
                  <Link className="font-semibold text-[#F6E3A3] transition hover:text-white" href="/signup">
                    Sign up
                  </Link>
                )}
              </p>

              {state.status === "success" && !state.redirectTo ? (
                <p className="rounded-lg border border-[#D4AF37]/28 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#F6E3A3]">
                  {state.message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
