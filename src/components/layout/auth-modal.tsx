"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";
import { SignupForm } from "@/components/forms/signup-form";

export type AuthMode = "login" | "signup";

type AuthModalProps = {
  mode: AuthMode | null;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthModal({ mode, onClose, onModeChange }: AuthModalProps) {
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

  const isLogin = mode === "login";

  return (
    <div
      aria-labelledby="auth-modal-title"
      aria-modal="true"
      className="auth-modal-backdrop fixed inset-0 z-[80] grid place-items-center overflow-y-auto px-3 py-5 sm:px-6 lg:py-8"
      role="dialog"
    >
      <button
        aria-label="Close authentication modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        className="auth-modal-panel relative w-full max-w-none overflow-hidden rounded-[2.75rem] border border-gold/28 shadow-2xl"
        data-auth-mode={mode}
      >
        <div aria-hidden="true" className="auth-modal-sweep absolute" />
        <div aria-hidden="true" className="auth-modal-grid absolute inset-0" />
        <div className="auth-modal-scroll relative z-10 max-h-[calc(100svh-2rem)] overflow-y-auto overflow-x-hidden p-5 sm:p-6">
          <div className="auth-modal-head flex items-start justify-between gap-4">
            <div className="auth-modal-brand flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <span className="auth-modal-logo elite-nav-logo-mark relative grid h-20 w-20 shrink-0 place-items-center sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="relative h-20 w-20 object-contain sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                  height={1875}
                  src="/brand/elite-gold-mark.png"
                  width={1875}
                />
              </span>
              <div className="auth-modal-brand-copy min-w-0">
                <p className="auth-modal-brand-title elite-brand-type text-xl leading-none text-white sm:text-2xl lg:text-3xl">
                  ELITE GOLD MEMBERSHIP
                </p>
              </div>
            </div>
            <button
              aria-label="Close"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-gold/30 hover:bg-gold/10"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="auth-modal-intro mt-7 sm:mt-9">
            <h2
              className="elite-display-type text-balance text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-[2.35rem]"
              id="auth-modal-title"
            >
              {isLogin ? "CONTINUE YOUR JOURNEY" : "START YOUR JOURNEY"}
            </h2>
          </div>

          <div className="auth-modal-form-area mt-6 sm:mt-7">
            {isLogin ? (
              <LoginForm
                onSignupClick={() => onModeChange("signup")}
                variant="modal"
              />
            ) : (
              <SignupForm
                onLoginClick={() => onModeChange("login")}
                variant="modal"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
