"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, LoaderCircle, Mail, X } from "lucide-react";
import { AuthBotProtectionFields } from "@/components/auth/bot-protection-fields";
import { AuthNoticePopup } from "@/components/ui/auth-notice-popup";
import { ShinyButton } from "@/components/ui/shiny-button";
import { initialAuthActionState, type AuthActionState } from "@/lib/auth/action-state";
import { cn } from "@/lib/utils";

type ForgotPasswordCardProps = {
  className?: string;
  onClose?: () => void;
  onLoginClick?: () => void;
  titleId?: string;
};

const passwordResetCooldownMs = 60_000;
const passwordResetCooldownStoragePrefix = "elite-gold-password-reset-cooldown:";

function normalizePasswordResetEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getPasswordResetCooldownStorageKey(email: string) {
  return `${passwordResetCooldownStoragePrefix}${email}`;
}

function readPasswordResetCooldown(email: string) {
  if (!email || typeof window === "undefined") {
    return 0;
  }

  const storageKey = getPasswordResetCooldownStorageKey(email);

  try {
    const value = window.localStorage.getItem(storageKey);
    const cooldownEndsAt = value ? Number(value) : 0;

    if (!Number.isFinite(cooldownEndsAt) || cooldownEndsAt <= Date.now()) {
      window.localStorage.removeItem(storageKey);
      return 0;
    }

    return cooldownEndsAt;
  } catch {
    return 0;
  }
}

function writePasswordResetCooldown(email: string, cooldownEndsAt: number) {
  if (!email || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getPasswordResetCooldownStorageKey(email),
      String(cooldownEndsAt),
    );
  } catch {
    // localStorage can be unavailable in private browsing; the server-side rate limit still protects the endpoint.
  }
}

function getRemainingCooldownSeconds(cooldownEndsAt: number) {
  return Math.max(0, Math.ceil((cooldownEndsAt - Date.now()) / 1000));
}

function getCooldownMessage(remainingSeconds: number) {
  return `If this email is registered, reset instructions are already on the way. Please check your inbox or request another link in ${remainingSeconds}s.`;
}

function getForgotPasswordNoticeCopy(state: AuthActionState) {
  if (state.status === "success") {
    return {
      icon: CheckCircle2,
      tone: "success" as const,
      title: "Reset link sent",
      message: "If this email is registered, reset instructions have been sent.",
    };
  }

  if (state.status === "error") {
    const hasEmailError = Boolean(state.fieldErrors?.email);
    const isRateLimited =
      Boolean(state.retryAfterSeconds) ||
      state.message.toLowerCase().includes("too many reset requests") ||
      state.message.toLowerCase().includes("recently requested");

    return {
      icon: isRateLimited ? CheckCircle2 : AlertTriangle,
      tone: isRateLimited ? "success" as const : "warning" as const,
      title: hasEmailError
        ? "Email required"
        : isRateLimited
          ? "Reset link sent"
          : "Unable to send reset link",
      message: hasEmailError
        ? "Please enter your member email to receive reset instructions."
        : isRateLimited
          ? "If this email is registered, reset instructions are already on the way."
        : "Please try again in a moment.",
    };
  }

  return null;
}

function getForgotPasswordNoticeKey(state: AuthActionState) {
  if (state.status === "success") {
    return `success-${state.message}`;
  }

  if (state.status === "error") {
    const fields = state.fieldErrors ? Object.keys(state.fieldErrors).sort().join("|") : "";

    return `error-${state.message}-${fields}`;
  }

  return null;
}

function isAuthActionState(value: unknown): value is AuthActionState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuthActionState>;

  return (
    (candidate.status === "idle" ||
      candidate.status === "error" ||
      candidate.status === "success") &&
    typeof candidate.message === "string"
  );
}

export function Component({
  className,
  onClose,
  onLoginClick,
  titleId,
}: ForgotPasswordCardProps) {
  const [state, setState] = useState<AuthActionState>(initialAuthActionState);
  const [isPending, setIsPending] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [cooldownEndsAt, setCooldownEndsAt] = useState(0);
  const [now, setNow] = useState(0);
  const [dismissedNoticeKey, setDismissedNoticeKey] = useState<string | null>(null);
  const submitInFlightRef = useRef(false);
  const noticeCopy = getForgotPasswordNoticeCopy(state);
  const noticeKey = getForgotPasswordNoticeKey(state);
  const normalizedEmailValue = normalizePasswordResetEmail(emailValue);
  const remainingSeconds = Math.max(0, Math.ceil((cooldownEndsAt - now) / 1000));
  const isCoolingDown = remainingSeconds > 0;
  const isNoticeVisible = Boolean(
    state.status === "error" &&
      !isPending &&
      noticeCopy &&
      noticeKey &&
      dismissedNoticeKey !== noticeKey,
  );
  const isSuccess = state.status === "success";
  const hasEmailError = Boolean(state.fieldErrors?.email);
  const noticePortalTarget = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!cooldownEndsAt) {
      return;
    }

    const updateNow = () => {
      const currentTime = Date.now();

      setNow(currentTime);

      if (cooldownEndsAt <= currentTime && normalizedEmailValue) {
        try {
          window.localStorage.removeItem(getPasswordResetCooldownStorageKey(normalizedEmailValue));
        } catch {
          // localStorage can be unavailable in private browsing.
        }
      }
    };

    const timer = window.setInterval(updateNow, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownEndsAt, normalizedEmailValue]);

  useEffect(() => {
    if (!isNoticeVisible || !noticeKey) {
      return;
    }

    const timer = window.setTimeout(() => {
      setDismissedNoticeKey(noticeKey);
    }, state.status === "success" ? 6200 : 5400);

    return () => window.clearTimeout(timer);
  }, [isNoticeVisible, noticeKey, state.status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitInFlightRef.current) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const submittedEmail = normalizePasswordResetEmail(formData.get("email"));

    if (!submittedEmail) {
      setDismissedNoticeKey(null);
      setState({
        status: "error",
        message: "Email is required.",
        fieldErrors: {
          email: "Email is required.",
        },
      });
      return;
    }

    const activeCooldownEndsAt = readPasswordResetCooldown(submittedEmail);
    const activeRemainingSeconds = getRemainingCooldownSeconds(activeCooldownEndsAt);

    if (activeRemainingSeconds > 0) {
      setCooldownEndsAt(activeCooldownEndsAt);
      setNow(Date.now());
      setDismissedNoticeKey(null);
      setState({
        status: "success",
        message: getCooldownMessage(activeRemainingSeconds),
        retryAfterSeconds: activeRemainingSeconds,
      });
      return;
    }

    submitInFlightRef.current = true;
    setDismissedNoticeKey(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/password-reset", {
        body: formData,
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
        method: "POST",
      });
      const payload: unknown = await response.json();

      if (!isAuthActionState(payload)) {
        throw new Error("Invalid password reset response");
      }

      if (payload.status === "success" || payload.retryAfterSeconds) {
        const retryAfterMs = (payload.retryAfterSeconds ?? passwordResetCooldownMs / 1000) * 1000;
        const nextCooldownEndsAt = Date.now() + retryAfterMs;

        writePasswordResetCooldown(submittedEmail, nextCooldownEndsAt);
        setCooldownEndsAt(nextCooldownEndsAt);
        setNow(Date.now());
      }

      setState(
        payload.status === "error" && payload.retryAfterSeconds
          ? {
              status: "success",
              message: "Reset link sent. Please check your inbox.",
              retryAfterSeconds: payload.retryAfterSeconds,
            }
          : payload,
      );
    } catch {
      setState({
        status: "error",
        message: "Unable to send reset link. Please try again in a moment.",
      });
    } finally {
      submitInFlightRef.current = false;
      setIsPending(false);
    }
  }

  return (
    <motion.div
      animate={{ scale: 1, y: 0 }}
      className={cn("elite-auth-card relative w-full", isSuccess ? "max-w-[24rem]" : "max-w-[26rem]", className)}
      initial={{ scale: 0.96, y: 18 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {noticePortalTarget
        ? createPortal(
            <AnimatePresence>
              {isNoticeVisible && noticeCopy && noticeKey ? (
                <AuthNoticePopup
                  key={noticeKey}
                  icon={noticeCopy.icon}
                  message={noticeCopy.message}
                  onClose={() => setDismissedNoticeKey(noticeKey)}
                  role={noticeCopy.tone === "success" ? "status" : "alert"}
                  title={noticeCopy.title}
                  tone={noticeCopy.tone}
                />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
      <div aria-hidden="true" className="elite-login-card-border-light" />
      <div
        className={cn(
          "elite-auth-card-surface relative z-10 overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#030303] text-white shadow-[inset_0_1px_0_rgba(248,250,252,0.12),0_34px_90px_rgba(0,0,0,0.58)]",
          isSuccess ? "p-5" : "p-6",
        )}
      >
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
          <div className={cn("text-center", isSuccess ? "mb-4" : "mb-5")}>
            <span
              className="elite-login-card-logo relative mx-auto grid place-items-center"
              style={
                isSuccess
                  ? ({
                      "--login-card-logo-box-size": "4rem",
                      "--login-card-logo-image-size": "3.55rem",
                    } as CSSProperties)
                  : undefined
              }
            >
              <Image
                alt=""
                aria-hidden="true"
                className="elite-login-card-logo-image object-contain"
                height={1875}
                src="/brand/elite-gold-mark.png"
                width={1875}
              />
            </span>
            <h2
              className={cn(
                "elite-display-type font-extrabold uppercase tracking-[0.08em] text-white",
                isSuccess ? "mt-3 text-lg sm:text-xl" : "mt-4 text-xl",
              )}
              id={titleId}
            >
              {isSuccess ? "Reset Link Sent" : "Reset Password"}
            </h2>
            <p className={cn("text-xs font-light text-text-secondary", isSuccess ? "mt-1.5" : "mt-2")}>
              {isSuccess
                ? "Please check your inbox to continue."
                : "Enter your member email and we will send a secure reset link."}
            </p>
          </div>

          {isSuccess ? (
            <div aria-live="polite" className="grid gap-4">
              <motion.div
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="rounded-[1.15rem] border border-emerald-300/22 bg-[#080808]/96 px-4 py-4 text-center shadow-[0_18px_60px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.05)]"
                initial={{ opacity: 0, scale: 0.965, y: 8 }}
                role="status"
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="mx-auto inline-flex size-9 items-center justify-center rounded-full border border-emerald-300/38 bg-emerald-400/[0.085] text-emerald-200">
                  <CheckCircle2 aria-hidden="true" className="size-[1.125rem]" />
                </span>
                <span className="mt-2.5 block text-sm font-semibold leading-5 text-white">
                  Reset link sent
                </span>
                <span className="mx-auto mt-1 block max-w-[17.5rem] text-xs leading-5 text-white/72">
                  Check your inbox and follow the reset link to continue.
                </span>
              </motion.div>
              {onLoginClick ? (
                <ShinyButton
                  className="auth-submit-button group/button h-10 w-full gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white/90"
                  onClick={onLoginClick}
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
                  type="button"
                  whileHover={{ scale: 1.018 }}
                  whileTap={{ scale: 0.985 }}
                >
                  Back to Login
                </ShinyButton>
              ) : (
                <Link
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#181818] px-6 py-2 text-sm font-semibold text-white/90 transition hover:border-white/28 hover:bg-[#202020] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35"
                  href="/login"
                >
                  Back to Login
                </Link>
              )}
            </div>
          ) : (
            <form className="grid gap-3" noValidate onSubmit={handleSubmit}>
              <AuthBotProtectionFields />
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
                Email
                <span className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#D4AF37]/70"
                  />
                  <input
                    aria-invalid={hasEmailError}
                    autoComplete="email"
                    className={cn(
                      "elite-login-card-input h-11 w-full rounded-lg border bg-[#050505] pl-10 pr-3 text-sm text-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/28 focus:bg-[#050505]",
                      hasEmailError
                        ? "border-[#E6C85C]/70 shadow-[0_0_0_3px_rgba(212,175,55,0.14)] focus:border-[#E6C85C]/80 focus:ring-2 focus:ring-[#D4AF37]/18"
                        : "border-white/10 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/18",
                    )}
                    name="email"
                    onChange={(event) => {
                      const nextEmailValue = event.target.value;
                      const storedCooldownEndsAt = readPasswordResetCooldown(
                        normalizePasswordResetEmail(nextEmailValue),
                      );

                      setEmailValue(nextEmailValue);
                      setCooldownEndsAt(storedCooldownEndsAt);
                      setNow(Date.now());
                    }}
                    placeholder="member@elitegold.com"
                    required
                    type="email"
                    value={emailValue}
                  />
                </span>
              </label>

              <ShinyButton
                className="auth-submit-button group/button mt-2 h-11 w-full gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white/90 transition disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending || isCoolingDown}
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
                type="submit"
                whileHover={{ scale: 1.018 }}
                whileTap={{ scale: 0.985 }}
              >
                <AnimatePresence mode="wait">
                  {isPending ? (
                    <motion.span
                      animate={{ opacity: 1 }}
                      className="relative flex h-full items-center justify-center gap-2"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      key="loading"
                    >
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                      Sending...
                    </motion.span>
                  ) : isCoolingDown ? (
                    <motion.span
                      animate={{ opacity: 1 }}
                      className="relative flex h-full items-center justify-center gap-2 text-sm"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      key="cooldown"
                    >
                      Try again in {remainingSeconds}s
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
                    </motion.span>
                  )}
                </AnimatePresence>
              </ShinyButton>

              <p className="pt-1 text-center text-xs text-white/52">
                Remember your password?{" "}
                {onLoginClick ? (
                  <button
                    className="font-semibold text-[#F6E3A3] transition hover:text-white"
                    onClick={onLoginClick}
                    type="button"
                  >
                    Login
                  </button>
                ) : (
                  <Link className="font-semibold text-[#F6E3A3] transition hover:text-white" href="/login">
                    Login
                  </Link>
                )}
              </p>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
