import { NextResponse, type NextRequest } from "next/server";
import { oauthStateCookieName, parseOAuthState } from "@/lib/auth/oauth-state";
import { normalizeLocalOrigin } from "@/lib/auth/origin";
import { getSafeRedirectPath, normalizeAccessCode } from "@/lib/auth/validation";
import { getMemberProfileByUserId } from "@/lib/member/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getGoogleSignupUrl(
  origin: string,
  nextPath: string,
  accessCode: string,
  reason?: string,
) {
  const signupUrl = new URL("/signup", origin);

  signupUrl.searchParams.set("auth", "google");
  signupUrl.searchParams.set("next", nextPath);

  if (accessCode) {
    signupUrl.searchParams.set("ref", accessCode);
  }

  if (reason) {
    signupUrl.searchParams.set("notice", reason);
  }

  return signupUrl;
}

function redirectAndClearOAuthState(url: URL) {
  const response = NextResponse.redirect(url);

  response.cookies.set(oauthStateCookieName, "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = normalizeLocalOrigin(requestUrl.origin);
  const oauthState = parseOAuthState(request.cookies.get(oauthStateCookieName)?.value);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(requestUrl.searchParams.get("next") ?? oauthState.nextPath);
  const intent =
    requestUrl.searchParams.get("intent") === "signup" || oauthState.intent === "signup"
      ? "signup"
      : "login";
  const accessCode = normalizeAccessCode(requestUrl.searchParams.get("ref") ?? oauthState.accessCode);

  if (!code) {
    return redirectAndClearOAuthState(new URL("/login", origin));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return redirectAndClearOAuthState(new URL("/login", origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectAndClearOAuthState(new URL("/login", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectAndClearOAuthState(new URL("/login", origin));
  }

  if (intent === "signup") {
    return redirectAndClearOAuthState(getGoogleSignupUrl(origin, nextPath, accessCode));
  }

  const profile = await getMemberProfileByUserId(supabase, user.id);

  if (!profile) {
    return redirectAndClearOAuthState(
      getGoogleSignupUrl(origin, nextPath, accessCode, "google_profile_required"),
    );
  }

  return redirectAndClearOAuthState(new URL(nextPath, origin));
}
