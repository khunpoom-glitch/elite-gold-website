import "server-only";

import { cookies } from "next/headers";
import {
  authSessionPolicyCookieName,
  createAuthSessionPolicyValue,
  getAuthSessionCookieOptions,
  getAuthSessionPolicyStatus,
  getClearAuthSessionCookieOptions,
  type AuthSessionPolicyMode,
} from "@/lib/auth/session-policy";
import { getRequestOrigin } from "@/lib/auth/origin";

async function getIsSecureRequest() {
  return (await getRequestOrigin()).startsWith("https://");
}

export async function getServerAuthSessionPolicyStatus() {
  const cookieStore = await cookies();

  return getAuthSessionPolicyStatus(
    cookieStore.get(authSessionPolicyCookieName)?.value,
  );
}

export async function setServerAuthSessionPolicy(
  mode: AuthSessionPolicyMode = "standard",
) {
  const cookieStore = await cookies();
  const secure = await getIsSecureRequest();

  cookieStore.set(
    authSessionPolicyCookieName,
    createAuthSessionPolicyValue(mode),
    getAuthSessionCookieOptions(mode, secure),
  );
}

export async function clearServerAuthSessionPolicy() {
  const cookieStore = await cookies();
  const secure = await getIsSecureRequest();

  cookieStore.set(
    authSessionPolicyCookieName,
    "",
    getClearAuthSessionCookieOptions(secure),
  );
}
