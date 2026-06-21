"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";

type VerificationResult =
  | "verified"
  | "already_verified"
  | "expired"
  | "invalid";

type EmailVerificationRedirectProps = {
  redirectPath: string;
  result: VerificationResult;
};

function isSuccessfulResult(result: VerificationResult) {
  return result === "verified" || result === "already_verified";
}

export function EmailVerificationRedirect({
  redirectPath,
  result,
}: EmailVerificationRedirectProps) {
  const isSuccess = isSuccessfulResult(result);
  const title = isSuccess ? "Signup Successful" : "Verification Link";
  const message = isSuccess
    ? "Your email has been verified. Preparing your member dashboard."
    : result === "expired"
      ? "This verification link has expired. Redirecting you to request a new email."
      : "This verification link could not be verified. Redirecting you to continue safely.";
  const actionLabel = isSuccess ? "Continue to Dashboard" : "Continue";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.location.assign(redirectPath);
    }, isSuccess ? 1600 : 2600);

    return () => window.clearTimeout(timeoutId);
  }, [isSuccess, redirectPath]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-black px-5 py-10 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(212,175,55,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_42%)]"
      />
      <section className="relative w-full max-w-[36rem] rounded-[1.55rem] border border-white/10 bg-[#030303] px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(248,250,252,0.12),0_34px_90px_rgba(0,0,0,0.58)] sm:px-10 sm:py-12">
        <Image
          alt=""
          aria-hidden="true"
          className="mx-auto h-24 w-24 object-contain"
          height={1875}
          priority
          src="/brand/elite-gold-mark.png"
          width={1875}
        />

        <span className="mx-auto mt-5 inline-flex size-16 items-center justify-center rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/12 text-[#F6E3A3] shadow-[0_0_34px_rgba(212,175,55,0.18)]">
          {isSuccess ? (
            <CheckCircle2 aria-hidden="true" className="size-8" />
          ) : (
            <TriangleAlert aria-hidden="true" className="size-8" />
          )}
        </span>

        <h1 className="mt-6 text-3xl font-extrabold tracking-normal text-[#F6E3A3]">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-[25rem] text-sm leading-7 text-white/72">
          {message}
        </p>

        <div className="mx-auto mt-7 h-1.5 max-w-[18rem] overflow-hidden rounded-full bg-white/10">
          <span className="block h-full w-1/2 animate-[elite-verify-slide_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-[#F6E3A3] to-transparent" />
        </div>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/24 bg-[#D4AF37]/10 px-4 py-2 text-xs font-semibold uppercase tracking-normal text-[#F6E3A3]">
          <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
          Redirecting
        </div>

        <Link
          className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#D4AF37]/35 bg-[#D4AF37]/12 text-sm font-semibold text-[#F6E3A3] transition hover:border-[#D4AF37]/55 hover:bg-[#D4AF37]/18"
          href={redirectPath}
        >
          {actionLabel}
        </Link>
      </section>
      <style jsx global>{`
        @keyframes elite-verify-slide {
          0% {
            transform: translateX(-110%);
          }
          100% {
            transform: translateX(230%);
          }
        }
      `}</style>
    </main>
  );
}
