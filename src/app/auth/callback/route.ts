import { NextResponse, type NextRequest } from "next/server";
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

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = normalizeLocalOrigin(requestUrl.origin);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const intent = requestUrl.searchParams.get("intent") === "signup" ? "signup" : "login";
  const accessCode = normalizeAccessCode(requestUrl.searchParams.get("ref"));

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
    return NextResponse.redirect(getGoogleSignupUrl(origin, nextPath, accessCode));
  }

  const profile = await getMemberProfileByUserId(supabase, user.id);

  if (!profile) {
    return NextResponse.redirect(
      getGoogleSignupUrl(origin, nextPath, accessCode, "google_profile_required"),
    );
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}
