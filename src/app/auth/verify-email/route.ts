import { NextResponse, type NextRequest } from "next/server";
import { hashEmailVerificationToken } from "@/lib/auth/email-verification";
import { normalizeLocalOrigin } from "@/lib/auth/origin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getDashboardRedirectUrl(origin: string, key: "verified" | "notice", value: string) {
  const redirectUrl = new URL("/dashboard", origin);
  redirectUrl.searchParams.set(key, value);

  return redirectUrl;
}

function getVerificationResult(row: unknown) {
  if (typeof row !== "object" || row === null || !("result" in row)) {
    return "invalid";
  }

  const result = row.result;

  return typeof result === "string" ? result : "invalid";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = normalizeLocalOrigin(requestUrl.origin);
  const token = requestUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(getDashboardRedirectUrl(origin, "notice", "verification_invalid"));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/login", origin));
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

    return NextResponse.redirect(getDashboardRedirectUrl(origin, "notice", "verification_invalid"));
  }

  const result = getVerificationResult(data);

  if (result === "verified" || result === "already_verified") {
    return NextResponse.redirect(getDashboardRedirectUrl(origin, "verified", "email"));
  }

  if (result === "expired") {
    return NextResponse.redirect(getDashboardRedirectUrl(origin, "notice", "verification_expired"));
  }

  return NextResponse.redirect(getDashboardRedirectUrl(origin, "notice", "verification_invalid"));
}
