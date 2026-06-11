"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  variant?: "page" | "modal";
  onSignupClick?: () => void;
};

const loginRequiredFields = [
  { name: "email", label: "Email" },
  { name: "password", label: "Password" },
];

function getMissingFields(form: HTMLFormElement, fields: typeof loginRequiredFields) {
  const formData = new FormData(form);

  return fields
    .filter(({ name }) => {
      const value = formData.get(name);
      return typeof value !== "string" || !value.trim();
    })
    .map(({ label }) => label);
}

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      className="auth-google-icon"
      focusable="false"
      viewBox="0 0 24 24"
    >
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

export function LoginForm({ variant = "page", onSignupClick }: LoginFormProps) {
  const [message, setMessage] = useState("");
  const [formAlert, setFormAlert] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isModal = variant === "modal";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const missingFields = getMissingFields(event.currentTarget, loginRequiredFields);

    if (missingFields.length > 0) {
      setMessage("");
      setFormAlert(`กรุณากรอกข้อมูลให้ครบ: ${missingFields.join(", ")}`);
      return;
    }

    setFormAlert("");
    setMessage("Login placeholder: ระบบ Authentication จะถูกต่อใน Phase ถัดไป");
  }

  return (
    <form
      className={cn(
        "mx-auto w-full max-w-lg rounded-lg border border-border bg-surface/86 p-6",
        isModal &&
          "auth-form-shell max-w-none rounded-2xl border-transparent bg-transparent p-0 shadow-none",
      )}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-white">
          Email
          <span className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-soft-gold"
            />
            <Input
              autoComplete="email"
              className="pl-11"
              name="email"
              placeholder="member@elitegold.com"
              required
              type="email"
            />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-medium text-white">
          Password
          <span className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-soft-gold"
            />
            <Input
              autoComplete="current-password"
              className="pl-11 pr-12"
              name="password"
              placeholder="••••••••"
              required
              type={showPassword ? "text" : "password"}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="auth-password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Eye aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </span>
        </label>
      </div>
      {formAlert ? (
        <div className="auth-validation-popup mt-4" role="alert">
          <p className="elite-display-type text-xs uppercase text-champagne">
            Required Fields
          </p>
          <p className="mt-1 text-sm leading-6 text-white">{formAlert}</p>
        </div>
      ) : null}
      {isModal ? (
        <div className="auth-login-options">
          <label className="auth-checkbox-row">
            <input className="auth-checkbox" name="remember" type="checkbox" />
            Remember me
          </label>
          <Link className="auth-forgot-link" href="/login">
            Forgot Password?
          </Link>
        </div>
      ) : null}
      <Button className="elite-display-type mt-5 w-full uppercase" type="submit">
        Login
      </Button>
      <Button
        className="elite-display-type mt-3 w-full uppercase"
        type="button"
        variant="secondary"
      >
        <GoogleLogo />
        Login with Google
      </Button>
      <div className="mt-5 grid gap-3 text-center text-sm">
        {!isModal ? (
          <Link className="text-text-secondary transition-colors hover:text-white" href="/login">
            Forgot Password
          </Link>
        ) : null}
        <p className="text-text-secondary">
          Don&apos;t have an account?{" "}
          {onSignupClick ? (
            <button
              className="elite-display-type font-semibold uppercase text-soft-gold transition hover:text-white"
              onClick={onSignupClick}
              type="button"
            >
              Sign Up
            </button>
          ) : (
            <Link
              className="elite-display-type font-semibold uppercase text-soft-gold hover:text-white"
              href="/signup"
            >
              Sign Up
            </Link>
          )}
        </p>
      </div>
      {message ? (
        <p className="mt-4 rounded-md border border-gold/25 bg-gold/10 px-3 py-2 text-sm text-soft-gold">
          {message}
        </p>
      ) : null}
    </form>
  );
}
