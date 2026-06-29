"use client";

import { useActionState, useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, EyeClosed, LoaderCircle, Lock } from "lucide-react";
import { updatePasswordAction } from "@/app/auth/actions";
import { ShinyButton } from "@/components/ui/shiny-button";
import { initialAuthActionState, type AuthActionState } from "@/lib/auth/action-state";

type ResetPasswordCardProps = {
  usesGoogleSignIn?: boolean;
};

const PASSWORD_UPDATED_LOGIN_PATH = "/login?notice=password-updated";
const PASSWORD_REDIRECT_DELAY_MS = 520;

function getResetPasswordNoticeCopy(state: AuthActionState) {
  if (state.status !== "error") {
    return null;
  }

  if (state.message.toLowerCase().includes("reset link expired")) {
    return {
      actionHref: "/forgot-password",
      actionLabel: "Request a new reset link",
      message: "Use the newest reset email, then set your password again.",
      title: "Reset link expired",
    };
  }

  const fieldNames = Object.keys(state.fieldErrors ?? {});

  if (fieldNames.includes("password") || fieldNames.includes("confirmPassword")) {
    return {
      actionHref: null,
      actionLabel: null,
      title: "Check your new password",
      message: state.message || "Please complete both password fields and make sure they match.",
    };
  }

  return {
    actionHref: "/forgot-password",
    actionLabel: "Request a new reset link",
    title: "Unable to update password",
    message: state.message || "Please request a new reset link and try again.",
  };
}

function getSafeClientRedirectPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export function ResetPasswordCard({ usesGoogleSignIn = false }: ResetPasswordCardProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialAuthActionState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const noticeCopy = getResetPasswordNoticeCopy(state);
  const redirectPath = getSafeClientRedirectPath(state.redirectTo);
  const isRedirecting = state.status === "success" && Boolean(redirectPath);

  useEffect(() => {
    router.prefetch(PASSWORD_UPDATED_LOGIN_PATH);
  }, [router]);

  useEffect(() => {
    if (state.status !== "success" || !redirectPath) {
      return;
    }

    router.prefetch(redirectPath);
    const leaveFrame = window.requestAnimationFrame(() => {
      setIsLeaving(true);
    });
    const redirectTimer = window.setTimeout(() => {
      router.replace(redirectPath, { scroll: false });
    }, PASSWORD_REDIRECT_DELAY_MS);

    return () => {
      window.cancelAnimationFrame(leaveFrame);
      window.clearTimeout(redirectTimer);
    };
  }, [redirectPath, router, state.status]);

  return (
    <>
      {isRedirecting ? (
        <motion.div
          aria-live="polite"
          animate={{ opacity: isLeaving ? 1 : 0 }}
          className="fixed inset-0 z-[95] grid place-items-center bg-[#1D1D1D]/96 px-6 text-center backdrop-blur-sm"
          initial={{ opacity: 0 }}
          role="status"
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ opacity: isLeaving ? 1 : 0, y: isLeaving ? 0 : 6, scale: isLeaving ? 1 : 0.985 }}
            className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-[#171717]/92 px-4 py-3 text-sm font-semibold text-white/86 shadow-[0_18px_55px_rgba(0,0,0,0.48)]"
            initial={{ opacity: 0, y: 6, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-white/78" />
            <span>Opening login...</span>
          </motion.div>
        </motion.div>
      ) : null}
      <motion.div
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        className="relative mx-auto w-full max-w-[26rem]"
        initial={{ opacity: 0, scale: 0.975, y: 10 }}
        transition={{ duration: isLeaving ? 0.2 : 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <div aria-hidden="true" className="elite-login-card-border-light" />
        <div className="relative z-10 overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#171717] p-6 text-white shadow-[inset_0_1px_0_rgba(248,250,252,0.12),0_34px_90px_rgba(0,0,0,0.58)]">
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
            Create a new password for your Elite Gold account.
          </p>
          {usesGoogleSignIn ? (
            <p className="mx-auto mt-3 max-w-[17rem] rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2 text-xs leading-5 text-white/56">
              <span className="block">Google sign-in account.</span>
              <span className="block">This password is only for Elite Gold login.</span>
            </p>
          ) : null}
        </div>

        <form action={formAction} aria-busy={isPending || isRedirecting} className="grid gap-3" noValidate>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
            New Password
            <span className="relative">
              <Lock
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/48"
              />
              <input
                autoComplete="new-password"
                className="elite-login-card-input h-11 w-full rounded-lg border border-white/10 bg-[#171717] pl-10 pr-11 text-sm text-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/28 focus:border-white/12 focus:bg-[#171717] focus:ring-2 focus:ring-white/10"
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
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/48"
              />
              <input
                autoComplete="new-password"
                className="elite-login-card-input h-11 w-full rounded-lg border border-white/10 bg-[#171717] pl-10 pr-11 text-sm text-white outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/28 focus:border-white/12 focus:bg-[#171717] focus:ring-2 focus:ring-white/10"
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

          {noticeCopy ? (
            <div
              className="flex items-start gap-2 rounded-xl border border-white/12 bg-white/[0.055] px-3 py-2.5 text-left text-white/78"
              role="alert"
            >
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0">
                <span className="block text-xs font-semibold leading-4">{noticeCopy.title}</span>
                <span className="mt-0.5 block text-xs leading-5 text-white/62">{noticeCopy.message}</span>
                {noticeCopy.actionHref && noticeCopy.actionLabel ? (
                  <Link
                    className="mt-1.5 inline-flex text-xs font-semibold text-white/78 transition hover:text-white"
                    href={noticeCopy.actionHref}
                  >
                    {noticeCopy.actionLabel}
                  </Link>
                ) : null}
              </span>
            </div>
          ) : null}

          <ShinyButton
            className="group/button mt-2 h-11 w-full gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white/90 transition disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isPending || isRedirecting}
            style={{
              "--shiny-button-border": "rgba(255, 255, 255, 0.18)",
              "--shiny-button-border-highlight": "rgba(255, 255, 255, 0.42)",
              "--shiny-button-border-muted": "rgba(255, 255, 255, 0.08)",
              "--shiny-button-foreground": "rgba(255, 255, 255, 0.92)",
              background: "#171717",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
              fontSize: "0.875rem",
              fontWeight: 650,
              letterSpacing: 0,
            } as CSSProperties}
            type="submit"
            whileHover={{ scale: 1.018 }}
          >
            {isPending ? (
              <span className="relative flex h-full items-center justify-center gap-2">
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                Updating...
              </span>
            ) : (
              <span className="relative flex h-full items-center justify-center gap-2 text-sm">
                Update Password
              </span>
            )}
          </ShinyButton>

          <p className="pt-1 text-center text-xs text-white/58">
            Back to{" "}
            <Link className="font-semibold text-white/78 transition hover:text-white" href="/login">
              Login
            </Link>
          </p>
        </form>
        </div>
      </motion.div>
    </>
  );
}
