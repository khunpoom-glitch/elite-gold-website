import type { Metadata } from "next";
import { EmailVerificationRedirect } from "@/components/ui/email-verification-redirect";
import { hashEmailVerificationToken } from "@/lib/auth/email-verification";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: {
    index: false,
    follow: false,
  },
};

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

type VerificationResult =
  | "verified"
  | "already_verified"
  | "expired"
  | "invalid";

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getVerificationResult(row: unknown): VerificationResult {
  if (typeof row !== "object" || row === null || !("result" in row)) {
    return "invalid";
  }

  const result = row.result;

  if (
    result === "verified" ||
    result === "already_verified" ||
    result === "expired" ||
    result === "invalid"
  ) {
    return result;
  }

  return "invalid";
}

async function verifyEmailToken(token?: string) {
  if (!token) {
    return "invalid" satisfies VerificationResult;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return "invalid" satisfies VerificationResult;
  }

  const { data, error } = await supabase
    .rpc("verify_elite_email_token", {
      input_token_hash: hashEmailVerificationToken(token),
    })
    .single();

  if (error) {
    console.error("[auth] Failed to verify email token.", {
      code: error.code,
      message: error.message,
    });

    return "invalid" satisfies VerificationResult;
  }

  return getVerificationResult(data);
}

function getRedirectPath(result: VerificationResult) {
  if (result === "verified" || result === "already_verified") {
    return "/dashboard?verified=email";
  }

  if (result === "expired") {
    return "/dashboard/account?notice=verification_expired";
  }

  return "/dashboard/account?notice=verification_invalid";
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const result = await verifyEmailToken(getFirstSearchParam(params.token));

  return (
    <EmailVerificationRedirect
      redirectPath={getRedirectPath(result)}
      result={result}
    />
  );
}
