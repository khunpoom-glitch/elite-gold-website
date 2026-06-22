import "server-only";

import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/auth/origin";
import {
  authSessionPolicyCookieName,
  getClearAuthSessionCookieOptions,
} from "@/lib/auth/session-policy";

function isSupabaseAuthCookie(name: string) {
  return name.startsWith("sb-") && name.includes("auth-token");
}

function getSupabaseAuthCookieClearOptions(secure: boolean) {
  return {
    maxAge: 0,
    path: "/",
    sameSite: "lax" as const,
    secure,
  };
}

export function clearLogoutCookiesOnResponse(
  response: NextResponse,
  request: NextRequest,
) {
  const secure = request.nextUrl.protocol === "https:";

  response.cookies.set(
    authSessionPolicyCookieName,
    "",
    getClearAuthSessionCookieOptions(secure),
  );

  request.cookies.getAll().forEach(({ name }) => {
    if (isSupabaseAuthCookie(name)) {
      response.cookies.set(name, "", getSupabaseAuthCookieClearOptions(secure));
    }
  });
}

export async function clearLogoutCookiesOnServerAction() {
  const cookieStore = await cookies();
  const secure = (await getRequestOrigin()).startsWith("https://");

  cookieStore.set(
    authSessionPolicyCookieName,
    "",
    getClearAuthSessionCookieOptions(secure),
  );

  cookieStore.getAll().forEach(({ name }) => {
    if (isSupabaseAuthCookie(name)) {
      cookieStore.set(name, "", getSupabaseAuthCookieClearOptions(secure));
    }
  });
}
