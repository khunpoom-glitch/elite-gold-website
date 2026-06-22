import { NextResponse, type NextRequest } from "next/server";
import { oauthStateCookieName, parseOAuthState } from "@/lib/auth/oauth-state";
import { normalizeLocalOrigin } from "@/lib/auth/origin";
import { addAuthNoticeToRedirectPath, loggedInAuthNoticeValue } from "@/lib/auth/redirect-notice";
import {
  authSessionPolicyCookieName,
  createAuthSessionPolicyValue,
  getAuthSessionCookieOptions,
} from "@/lib/auth/session-policy";
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
    signupUrl.searchParams.set("accessCode", accessCode);
  }

  if (reason) {
    signupUrl.searchParams.set("notice", reason);
  }

  return signupUrl;
}

function redirectAndClearOAuthState(
  url: URL,
  options?: { setStandardSession?: boolean },
) {
  const response = NextResponse.redirect(url);

  response.cookies.set(oauthStateCookieName, "", {
    maxAge: 0,
    path: "/",
  });

  if (options?.setStandardSession) {
    response.cookies.set(
      authSessionPolicyCookieName,
      createAuthSessionPolicyValue("standard"),
      getAuthSessionCookieOptions("standard", url.protocol === "https:"),
    );
  }

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
  const accessCode = normalizeAccessCode(
    requestUrl.searchParams.get("accessCode") ??
      requestUrl.searchParams.get("ref") ??
      oauthState.accessCode,
  );

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

  const { error: syncEmailError } = await supabase.rpc(
    "sync_elite_profile_email_after_auth_change",
  );

  if (syncEmailError) {
    console.warn("[auth] Failed to sync profile email after auth callback.", {
      code: syncEmailError.code,
      message: syncEmailError.message,
    });
  }

  if (intent === "signup") {
    return redirectAndClearOAuthState(
      getGoogleSignupUrl(origin, nextPath, accessCode),
      { setStandardSession: true },
    );
  }

  const profile = await getMemberProfileByUserId(supabase, user.id);

  if (!profile) {
    return redirectAndClearOAuthState(
      getGoogleSignupUrl(origin, nextPath, accessCode, "google_profile_required"),
      { setStandardSession: true },
    );
  }

  return redirectAndClearOAuthState(
    new URL(addAuthNoticeToRedirectPath(nextPath, loggedInAuthNoticeValue), origin),
    {
      setStandardSession: true,
    },
  );
}
