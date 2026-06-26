import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  authSessionPolicyCookieName,
  createAuthSessionPolicyValue,
  getAuthSessionCookieOptions,
  getAuthSessionPolicyStatus,
  getClearAuthSessionCookieOptions,
  type AuthSessionPolicyMode,
} from "@/lib/auth/session-policy";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "./config";

function isProtectedPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function getLoginRedirect(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();

  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  return redirectUrl;
}

function getSessionExpiredRedirect(request: NextRequest) {
  const redirectUrl = getLoginRedirect(request);

  redirectUrl.searchParams.set("session", "expired");

  return redirectUrl;
}

function isSupabaseAuthCookie(name: string) {
  return name.startsWith("sb-") && name.includes("auth-token");
}

function clearAuthCookies(response: NextResponse, request: NextRequest) {
  const secure = request.nextUrl.protocol === "https:";
  const clearOptions = getClearAuthSessionCookieOptions(secure);

  response.cookies.set(authSessionPolicyCookieName, "", clearOptions);

  request.cookies.getAll().forEach(({ name }) => {
    if (isSupabaseAuthCookie(name)) {
      response.cookies.set(name, "", {
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secure,
      });
    }
  });
}

function setAuthSessionPolicyCookie(
  response: NextResponse,
  request: NextRequest,
  mode: AuthSessionPolicyMode,
) {
  const secure = request.nextUrl.protocol === "https:";
  const value = createAuthSessionPolicyValue(mode);
  const options = getAuthSessionCookieOptions(mode, secure);

  request.cookies.set(authSessionPolicyCookieName, value);
  response.cookies.set(authSessionPolicyCookieName, value, options);
}

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured || !supabaseUrl || !supabasePublishableKey) {
    return NextResponse.next({ request });
  }

  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    const response = NextResponse.redirect(getLoginRedirect(request));

    clearAuthCookies(response, request);

    return response;
  }

  const sessionPolicy = getAuthSessionPolicyStatus(
    request.cookies.get(authSessionPolicyCookieName)?.value,
  );

  if (sessionPolicy.state === "missing") {
    setAuthSessionPolicyCookie(supabaseResponse, request, "standard");

    return supabaseResponse;
  }

  if (sessionPolicy.state !== "active") {
    const response = NextResponse.redirect(getSessionExpiredRedirect(request));

    clearAuthCookies(response, request);

    return response;
  }

  if (sessionPolicy.mode === "standard") {
    setAuthSessionPolicyCookie(supabaseResponse, request, "standard");
  }

  return supabaseResponse;
}
