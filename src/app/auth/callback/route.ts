import { NextResponse, type NextRequest } from "next/server";
import { normalizeLocalOrigin } from "@/lib/auth/origin";
import { getSafeRedirectPath, normalizeReferralCode } from "@/lib/auth/validation";
import { getMemberProfileByUserId } from "@/lib/member/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getGoogleSignupUrl(
  origin: string,
  nextPath: string,
  referralCode: string,
  reason?: string,
) {
  const signupUrl = new URL("/signup", origin);

  signupUrl.searchParams.set("auth", "google");
  signupUrl.searchParams.set("next", nextPath);
  signupUrl.searchParams.set("ref", referralCode);

  if (reason) {
    signupUrl.searchParams.set("notice", reason);
  }

  return signupUrl;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = normalizeLocalOrigin(requestUrl.origin);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const intent = requestUrl.searchParams.get("intent") === "signup" ? "signup" : "login";
  const referralCode = normalizeReferralCode(requestUrl.searchParams.get("ref"));

  if (!code) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  if (intent === "signup") {
    return NextResponse.redirect(getGoogleSignupUrl(origin, nextPath, referralCode));
  }

  const profile = await getMemberProfileByUserId(supabase, user.id);

  if (!profile) {
    return NextResponse.redirect(
      getGoogleSignupUrl(origin, nextPath, referralCode, "google_profile_required"),
    );
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}
