import { NextResponse, type NextRequest } from "next/server";
import { normalizeLocalOrigin } from "@/lib/auth/origin";
import { getSafeRedirectPath, normalizeReferralCode } from "@/lib/auth/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = normalizeLocalOrigin(requestUrl.origin);
  const nextPath = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const intent = requestUrl.searchParams.get("intent") === "signup" ? "signup" : "login";
  const referralCode = normalizeReferralCode(
    requestUrl.searchParams.get("ref") ??
      requestUrl.searchParams.get("refCode") ??
      requestUrl.searchParams.get("referral") ??
      requestUrl.searchParams.get("referralCode"),
  );
  const callbackUrl = new URL("/auth/callback", origin);

  callbackUrl.searchParams.set("next", nextPath);
  callbackUrl.searchParams.set("intent", intent);
  callbackUrl.searchParams.set("ref", referralCode);

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  return NextResponse.redirect(data.url);
}
