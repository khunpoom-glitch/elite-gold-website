"use client";

import { useActionState, useEffect, useState, type CSSProperties, type FormEvent, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, Eye, EyeClosed, LoaderCircle, Lock, Mail, X } from "lucide-react";
import { loginWithPasswordAction } from "@/app/auth/actions";
import { AuthBotProtectionFields } from "@/components/auth/bot-protection-fields";
import { GoogleLogo } from "@/components/ui/google-logo";
import { ShinyButton } from "@/components/ui/shiny-button";
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

type LoginNotice = {
  key: string;
  title: string;
  message: string;
};

function getReadableLoginNotice(message: string, fieldErrors?: Record<string, string>): LoginNotice | null {
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    const fields = Object.keys(fieldErrors).map((field) =>
      field === "email" ? "Email" : field === "password" ? "Password" : field,
    );

    return {
      key: `missing-${fields.join("-")}`,
      title: "Complete required fields",
      message: `Please enter ${fields.join(", ")} to continue.`,
    };
  }

  if (!message) {
    return null;
  }

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("อีเมลหรือรหัสผ่าน") || lowerMessage.includes("invalid login")) {
    return {
      key: "invalid-credentials",
      title: "Login failed",
      message: "The email or password you entered is incorrect.",
    };
  }

  if (lowerMessage.includes("ยืนยันอีเมล") || lowerMessage.includes("email not confirmed")) {
    return {
      key: "email-not-confirmed",
      title: "Email verification required",
      message: "Please verify your email before logging in.",
    };
  }

  if (lowerMessage.includes("กรอกอีเมลให้ถูกต้อง")) {
    return {
      key: "invalid-email",
      title: "Invalid email",
      message: "Please enter a valid email address.",
    };
  }

  return {
    key: `login-error-${message}`,
    title: "Unable to login",
    message: "Please check your details and try again.",
  };
}

function LoginValidationPopup({
  notice,
  onClose,
}: {
  notice: LoginNotice;
  onClose: () => void;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="absolute bottom-[calc(100%+0.7rem)] left-0 right-0 z-30 mx-auto w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-[#D4AF37]/32 bg-[#080808]/96 px-4 py-3 text-left shadow-[0_20px_58px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.04] backdrop-blur-xl"
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      role="alert"
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="flex min-h-[3.5rem] items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#F6E3A3]">
          <AlertTriangle aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-5 text-[#F6E3A3]">{notice.title}</span>
          <span className="mt-0.5 block text-xs leading-5 text-white/64">{notice.message}</span>
        </span>
        <button
          aria-label="Close login notice"
          className="-mr-1 grid size-7 shrink-0 place-items-center rounded-full text-white/42 transition hover:bg-white/[0.06] hover:text-white"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </motion.div>
  );
}

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginNotice, setLoginNotice] = useState<LoginNotice | null>(null);
  const [dismissedNoticeKey, setDismissedNoticeKey] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(null);
  const [nextPath] = useState(getInitialNextPath);
  const serverLoginNotice =
    state.status === "error" ? getReadableLoginNotice(state.message, state.fieldErrors) : null;
  const visibleLoginNotice =
    loginNotice ?? (serverLoginNotice?.key === dismissedNoticeKey ? null : serverLoginNotice);
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
    if (isGoogleLoading) {
      return;
    }

    setIsGoogleLoading(true);
    const searchParams = new URLSearchParams({
      intent: "login",
      next: nextPath,
    });

    window.setTimeout(() => {
      window.location.assign(`/auth/google?${searchParams.toString()}`);
    }, 350);
  }

  function validateLoginFormElement(form: HTMLFormElement) {
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const missingFields = [
      !email ? "Email" : null,
      !password ? "Password" : null,
    ].filter(Boolean) as string[];

    if (missingFields.length > 0) {
      setLoginNotice({
        key: `client-missing-${missingFields.join("-")}`,
        title: "Complete required fields",
        message: `Please enter ${missingFields.join(", ")} to continue.`,
      });
      setDismissedNoticeKey(null);
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoginNotice({
        key: "client-invalid-email",
        title: "Invalid email",
        message: "Please enter a valid email address.",
      });
      setDismissedNoticeKey(null);
      return false;
    }

    setLoginNotice(null);
    setDismissedNoticeKey(null);
    return true;
  }

  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    if (!validateLoginFormElement(event.currentTarget)) {
      event.preventDefault();
    }
  }

  function handleLoginButtonClick(event: MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;

    if (form && !validateLoginFormElement(form)) {
      event.preventDefault();
    }
  }

  return (
    <motion.div
      className={cn("relative w-full max-w-[26rem]", className)}
      initial={{ scale: 0.96, y: 18 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1400 }}
    >
      <AnimatePresence>
        {visibleLoginNotice ? (
          <LoginValidationPopup
            key={visibleLoginNotice.key}
            notice={visibleLoginNotice}
            onClose={() => {
              setLoginNotice(null);
              setDismissedNoticeKey(visibleLoginNotice.key);
            }}
          />
        ) : null}
      </AnimatePresence>
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

            <form action={formAction} className="grid gap-3" noValidate onSubmitCapture={handleLoginSubmit}>
              <input name="next" type="hidden" value={nextPath} />
              <AuthBotProtectionFields />
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
                  <span className="relative grid size-4 shrink-0 place-items-center">
                    <input
                      checked={rememberMe}
                      className="peer size-4 appearance-none rounded border border-[#D4AF37]/45 bg-white/[0.04] transition checked:border-[#F6E3A3] checked:bg-[#D4AF37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/60"
                      name="remember"
                      onChange={() => setRememberMe((current) => !current)}
                      type="checkbox"
                    />
                    <Check
                      aria-hidden="true"
                      className="pointer-events-none absolute size-3 text-black opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
                      strokeWidth={3}
                    />
                  </span>
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

              <ShinyButton
                className="group/button mt-2 h-11 w-full gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white/90 transition disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
                style={{
                  "--shiny-button-border": "rgba(255, 255, 255, 0.18)",
                  "--shiny-button-border-highlight": "rgba(255, 255, 255, 0.42)",
                  "--shiny-button-border-muted": "rgba(255, 255, 255, 0.08)",
                  "--shiny-button-foreground": "rgba(255, 255, 255, 0.92)",
                  background: "#181818",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  fontSize: "0.875rem",
                  fontWeight: 650,
                  letterSpacing: 0,
                } as CSSProperties}
                onClickCapture={handleLoginButtonClick}
                type="submit"
                whileHover={{ scale: 1.018 }}
                whileTap={{ scale: 0.985 }}
              >
                <AnimatePresence mode="wait">
                  {isPending ? (
	                    <motion.span
	                      key="loading"
	                      initial={{ opacity: 0 }}
	                      animate={{ opacity: 1 }}
	                      className="relative flex h-full items-center justify-center gap-2"
                      exit={{ opacity: 0 }}
                    >
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                      Login
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
              </ShinyButton>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-white/8" />
                <span className="text-xs text-white/38">or</span>
                <span className="h-px flex-1 bg-white/8" />
              </div>

              <motion.button
                className="flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] text-[0.78rem] font-normal leading-none text-white/82 transition hover:border-[#D4AF37]/35 hover:bg-white/[0.07] hover:text-white disabled:cursor-wait disabled:opacity-75"
                disabled={isGoogleLoading || isPending}
                onClick={handleGoogleLogin}
                style={{ fontSize: "0.78rem", lineHeight: 1 }}
                type="button"
                whileHover={isGoogleLoading || isPending ? undefined : { scale: 1.018 }}
                whileTap={isGoogleLoading || isPending ? undefined : { scale: 0.985 }}
              >
                {isGoogleLoading ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-[#F6E3A3]" />
                ) : (
                  <GoogleLogo />
                )}
                {isGoogleLoading ? "Connecting to Google..." : "Login with Google"}
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
