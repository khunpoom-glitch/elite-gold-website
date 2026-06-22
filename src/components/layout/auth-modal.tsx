"use client";

import { useEffect } from "react";
import { Clock3 } from "lucide-react";
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
      className="mb-3 flex items-start gap-3 rounded-2xl border border-[#D4AF37]/28 bg-[#080808]/95 px-4 py-3 text-left shadow-[0_18px_55px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.04]"
      role="status"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#F6E3A3]">
        <Clock3 aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5 text-[#F6E3A3]">
          Session expired
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-white/62">
          Please login again to continue securely.
        </span>
      </span>
    </div>
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
          {notice === "session_expired" ? <SessionExpiredPopup /> : null}
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
