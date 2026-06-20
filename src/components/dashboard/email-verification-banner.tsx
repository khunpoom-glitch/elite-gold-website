"use client";

import { useActionState } from "react";
import { AlertTriangle, CheckCircle2, MailCheck, Send } from "lucide-react";
import { resendEmailVerificationAction } from "@/app/auth/actions";
import { initialAuthActionState } from "@/lib/auth/action-state";

type EmailVerificationBannerProps = {
  email: string;
};

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [state, formAction, isPending] = useActionState(
    resendEmailVerificationAction,
    initialAuthActionState,
  );

  return (
    <section className="rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4 shadow-[inset_0_1px_0_rgba(246,227,163,0.08),0_18px_54px_rgba(0,0,0,0.28)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-[#D4AF37]/30 bg-black/30 text-[#F6E3A3]">
            <MailCheck aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-[#F6E3A3]">Verify your email to activate your account</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/68">
              Your profile is saved, but member features stay locked until you verify {email}.
            </p>
          </div>
        </div>

        <form action={formAction}>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#D4AF37]/35 bg-[#D4AF37]/14 px-4 text-sm font-bold text-[#F6E3A3] transition hover:border-[#F6E3A3] hover:bg-[#D4AF37]/20 hover:text-white disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6E3A3]/50"
            disabled={isPending}
            type="submit"
          >
            <Send aria-hidden="true" className="size-4" />
            {isPending ? "Sending" : "Resend Verification Email"}
          </button>
        </form>
      </div>

      {state.status === "success" ? (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100" role="status">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-[#D4AF37]/30 bg-black/24 px-3 py-2 text-sm text-[#F6E3A3]" role="alert">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      ) : null}
    </section>
  );
}
