"use client";

import { useState, type FormEvent, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Eye, EyeClosed, Lock, Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SignInCardProps = {
  className?: string;
  onClose?: () => void;
  onSignupClick?: () => void;
  titleId?: string;
};

const requiredFields = [
  { name: "email", label: "Email" },
  { name: "password", label: "Password" },
];

function getMissingFields(form: HTMLFormElement) {
  const formData = new FormData(form);

  return requiredFields
    .filter(({ name }) => {
      const value = formData.get(name);
      return typeof value !== "string" || !value.trim();
    })
    .map(({ label }) => label);
}

function GoogleLogo() {
  return (
    <svg aria-hidden="true" className="size-3.5" focusable="false" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285f4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z"
        fill="#34a853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
        fill="#fbbc05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
        fill="#ea4335"
      />
    </svg>
  );
}

export function Component({ className, onClose, onSignupClick, titleId }: SignInCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(null);
  const [message, setMessage] = useState("");
  const [formAlert, setFormAlert] = useState("");
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-260, 260], [8, -8]);
  const rotateY = useTransform(mouseX, [-260, 260], [-8, 8]);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left - rect.width / 2);
    mouseY.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const missingFields = getMissingFields(event.currentTarget);

    if (missingFields.length > 0) {
      setMessage("");
      setFormAlert(`กรุณากรอกข้อมูลให้ครบ: ${missingFields.join(", ")}`);
      return;
    }

    setFormAlert("");
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      setMessage("ระบบ Login กำลังเตรียมเชื่อมต่อกับบัญชีสมาชิก");
    }, 900);
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

            <form className="grid gap-3" noValidate onSubmit={handleSubmit}>
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
                <Link className="text-xs font-semibold text-[#F6E3A3] transition hover:text-white" href="/login">
                  Forgot password?
                </Link>
              </div>

              {formAlert ? (
                <div className="rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#F6E3A3]" role="alert">
                  {formAlert}
                </div>
              ) : null}

              <motion.button
                className="group/button relative mt-2 h-11 overflow-hidden rounded-lg bg-white font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
                type="submit"
                whileHover={{ scale: 1.018 }}
                whileTap={{ scale: 0.985 }}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
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

              {message ? (
                <p className="rounded-lg border border-[#D4AF37]/28 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#F6E3A3]">
                  {message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
