"use client";

import { useActionState, useEffect, useState, type CSSProperties } from "react";
import { AlertTriangle, CheckCircle2, MailCheck, Send } from "lucide-react";
import { resendEmailVerificationAction } from "@/app/auth/actions";
import { initialAuthActionState } from "@/lib/auth/action-state";
import { ShinyButton } from "@/components/ui/shiny-button";

type EmailVerificationBannerProps = {
  email: string;
};

const resendCooldownMs = 90_000;

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [state, formAction, isPending] = useActionState(
    resendEmailVerificationAction,
    initialAuthActionState,
  );
  const [cooldownEndsAt, setCooldownEndsAt] = useState(0);
  const [now, setNow] = useState(0);
  const remainingSeconds = Math.max(0, Math.ceil((cooldownEndsAt - now) / 1000));
  const isCoolingDown = remainingSeconds > 0;

  useEffect(() => {
    if (state.status === "success") {
      const timer = window.setTimeout(() => {
        const nextCooldownEndsAt = Date.now() + resendCooldownMs;

        setCooldownEndsAt(nextCooldownEndsAt);
        setNow(Date.now());
      }, 0);

      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [state]);

  useEffect(() => {
    if (!cooldownEndsAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [cooldownEndsAt]);

  return (
    <section className="member-surface overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-[#F6E3A3]">
            <MailCheck aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">Verify your email to activate your account</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/58">
              Your profile is saved, but member features stay locked until you verify {email}.
            </p>
          </div>
        </div>

        <form action={formAction}>
          <ShinyButton
            className="h-10 gap-2 rounded-xl px-4 py-2 text-sm font-bold disabled:cursor-wait disabled:opacity-70"
            disabled={isPending || isCoolingDown}
            style={{
              "--shiny-button-border": "rgba(230, 199, 102, 0.50)",
              "--shiny-button-border-highlight": "rgba(255, 248, 215, 0.90)",
              "--shiny-button-border-muted": "rgba(230, 199, 102, 0.10)",
              "--shiny-button-foreground": "rgba(246, 227, 163, 0.94)",
              background: "#000000",
              fontSize: "0.875rem",
              fontWeight: 700,
              letterSpacing: 0,
            } as CSSProperties}
            type="submit"
          >
            <Send aria-hidden="true" className="size-4" />
            {isPending
              ? "Sending"
              : isCoolingDown
                ? `Resend in ${remainingSeconds}s`
                : "Resend Verification Email"}
          </ShinyButton>
        </form>
      </div>

      {state.status === "success" ? (
        <div className="member-status-success mt-4 flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm" role="status">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="member-status-warning mt-4 flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm" role="alert">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      ) : null}
    </section>
  );
}
