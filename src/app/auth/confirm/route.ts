import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeLocalOrigin } from "@/lib/auth/origin";
import { getEmailOtpType, getSafeRedirectPath } from "@/lib/auth/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = normalizeLocalOrigin(requestUrl.origin);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const otpType = getEmailOtpType(requestUrl.searchParams.get("type"));
  const nextPath = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const fallbackUrl = new URL("/login", origin);

  if (!tokenHash || !otpType) {
    return NextResponse.redirect(fallbackUrl);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(fallbackUrl);
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: otpType as EmailOtpType,
  });

  if (error) {
    return NextResponse.redirect(fallbackUrl);
  }

  if (otpType === "email_change") {
    const { error: syncEmailError } = await supabase.rpc(
      "sync_elite_profile_email_after_auth_change",
    );

    if (syncEmailError) {
      console.warn("[auth] Failed to sync profile email after email change confirmation.", {
        code: syncEmailError.code,
        message: syncEmailError.message,
      });
    }
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}
