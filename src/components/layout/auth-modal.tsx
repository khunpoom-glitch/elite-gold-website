"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock3 } from "lucide-react";
import { Component as ForgotPasswordCard3D } from "@/components/ui/forgot-password-card";
import { Component as SignInCard3D } from "@/components/ui/sign-in-card-2";
import { Component as SignUpCard3D } from "@/components/ui/sign-up-card-2";
import type { AuthModalMode } from "@/config/auth-modal";
import type { GoogleSignupProfile } from "@/lib/member/profile";

export type AuthMode = AuthModalMode;

type AuthModalProps = {
  accessCode?: string;
  googleSignupProfile?: GoogleSignupProfile;
  mode: AuthMode | null;
  notice?: string;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
};

function SessionExpiredPopup() {
  return (
    <div
      className="flex min-h-[4.25rem] items-center gap-3 rounded-2xl border border-white/12 bg-[#171717]/96 px-4 py-3 text-left shadow-[0_18px_54px_rgba(0,0,0,0.46),0_0_22px_rgba(255,255,255,0.05)] ring-1 ring-white/[0.035]"
      role="status"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.05] text-white/78">
        <Clock3 aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5 text-white/78">
          Session expired
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-white/62">
          Please login again to continue securely.
        </span>
      </span>
    </div>
  );
}

function PasswordUpdatedPopup() {
  return (
    <motion.div
      animate={{ filter: "blur(0px)", opacity: 1, y: 0, scale: 1 }}
      className="pointer-events-auto flex min-h-[4.25rem] items-center gap-3 rounded-2xl border border-emerald-300/22 bg-[#171717]/96 px-4 py-3 text-left shadow-[0_18px_54px_rgba(0,0,0,0.46),0_0_22px_rgba(16,185,129,0.07)] ring-1 ring-white/[0.035]"
      exit={{
        filter: "blur(5px)",
        opacity: 0,
        y: -8,
        scale: 0.985,
        transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
      }}
      initial={{ filter: "blur(5px)", opacity: 0, y: -8, scale: 0.985 }}
      role="status"
      transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-emerald-300/38 bg-emerald-400/[0.085] text-emerald-200">
        <CheckCircle2 aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5 text-white">
          Password updated
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-white/62">
          Please login with your new password.
        </span>
      </span>
    </motion.div>
  );
}

export function AuthModal({
  accessCode,
  googleSignupProfile,
  mode,
  notice,
  onClose,
  onModeChange,
}: AuthModalProps) {
  const [dismissedNotice, setDismissedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (notice !== "password_updated") {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setDismissedNotice(null);
    }, 0);
    const dismissTimer = window.setTimeout(() => {
      setDismissedNotice("password_updated");
    }, 6800);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [notice]);

  useEffect(() => {
    if (notice !== "password_updated") {
      return;
    }

    const url = new URL(window.location.href);

    if (url.searchParams.get("notice") !== "password-updated") {
      return;
    }

    url.searchParams.delete("notice");
    const cleanedSearch = url.searchParams.toString();
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${cleanedSearch ? `?${cleanedSearch}` : ""}${url.hash}`,
    );
  }, [notice]);

  useEffect(() => {
    if (!mode) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode, onClose]);

  if (!mode) {
    return null;
  }

  if (mode === "login") {
    return (
      <div
        aria-labelledby="auth-modal-title"
        aria-modal="true"
        className="auth-modal-backdrop fixed inset-0 z-[80] grid place-items-center overflow-y-auto px-4 py-6 sm:px-6"
        data-auth-mode="login"
        role="dialog"
      >
        <button
          aria-label="Close authentication modal"
          className="absolute inset-0 cursor-default"
          onClick={onClose}
          type="button"
        />
        <div className="relative z-10 w-full max-w-[26rem]">
          <div className="pointer-events-none absolute inset-x-0 bottom-[calc(100%+0.75rem)] z-30">
            {notice === "session_expired" ? (
              <div className="pointer-events-auto">
                <SessionExpiredPopup />
              </div>
            ) : null}
            <AnimatePresence initial={false}>
              {notice === "password_updated" && dismissedNotice !== "password_updated" ? (
                <PasswordUpdatedPopup key="password-updated" />
              ) : null}
            </AnimatePresence>
          </div>
          <SignInCard3D
            onClose={onClose}
            onForgotPasswordClick={() => onModeChange("forgotPassword")}
            onSignupClick={() => onModeChange("signup")}
            titleId="auth-modal-title"
          />
        </div>
      </div>
    );
  }

  if (mode === "forgotPassword") {
    return (
      <div
        aria-labelledby="auth-modal-title"
        aria-modal="true"
        className="auth-modal-backdrop fixed inset-0 z-[80] grid place-items-center overflow-y-auto px-4 py-6 sm:px-6"
        data-auth-mode="forgot-password"
        role="dialog"
      >
        <button
          aria-label="Close authentication modal"
          className="absolute inset-0 cursor-default"
          onClick={onClose}
          type="button"
        />
        <div className="relative z-10 w-full max-w-[26rem]">
          <ForgotPasswordCard3D
            onClose={onClose}
            onLoginClick={() => onModeChange("login")}
            titleId="auth-modal-title"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-labelledby="auth-modal-title"
      aria-modal="true"
      className="auth-modal-backdrop fixed inset-0 z-[80] grid place-items-center overflow-y-auto px-4 py-6 sm:px-6"
      data-auth-mode="signup"
      role="dialog"
    >
      <button
        aria-label="Close authentication modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div className="relative z-10 w-full max-w-[35rem]">
        <SignUpCard3D
          googleSignupProfile={googleSignupProfile}
          notice={notice}
          onClose={onClose}
          onLoginClick={() => onModeChange("login")}
          accessCode={accessCode}
          titleId="auth-modal-title"
        />
      </div>
    </div>
  );
}
