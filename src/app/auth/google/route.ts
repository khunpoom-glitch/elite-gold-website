import { NextResponse, type NextRequest } from "next/server";
import { oauthStateCookieName, serializeOAuthState } from "@/lib/auth/oauth-state";
import { normalizeLocalOrigin } from "@/lib/auth/origin";
import { getSafeRedirectPath, normalizeAccessCode } from "@/lib/auth/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = normalizeLocalOrigin(requestUrl.origin);
  const nextPath = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const intent = requestUrl.searchParams.get("intent") === "signup" ? "signup" : "login";
  const accessCode = normalizeAccessCode(
    requestUrl.searchParams.get("ref") ??
      requestUrl.searchParams.get("refCode") ??
      requestUrl.searchParams.get("referral") ??
      requestUrl.searchParams.get("referralCode"),
  );
  const callbackUrl = new URL("/auth/callback", origin);

  callbackUrl.searchParams.set("next", nextPath);
  callbackUrl.searchParams.set("intent", intent);

  if (accessCode) {
    callbackUrl.searchParams.set("ref", accessCode);
  }

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

  const response = NextResponse.redirect(data.url);

  response.cookies.set(
    oauthStateCookieName,
    serializeOAuthState({ accessCode, intent, nextPath }),
    {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/",
      sameSite: "lax",
      secure: origin.startsWith("https://"),
    },
  );

  return response;
}
