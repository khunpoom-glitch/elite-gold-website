export type AuthSessionPolicyMode = "standard" | "remembered";

export type AuthSessionPolicyStatus =
  | {
      expiresAt: number;
      mode: AuthSessionPolicyMode;
      state: "active";
    }
  | {
      state: "expired" | "invalid" | "missing";
    };

export const authSessionPolicyCookieName = "elite-gold-session";
export const standardSessionDurationSeconds = 8 * 60 * 60;
export const rememberedSessionDurationSeconds = 30 * 24 * 60 * 60;

export function getAuthSessionDurationSeconds(mode: AuthSessionPolicyMode) {
  return mode === "remembered"
    ? rememberedSessionDurationSeconds
    : standardSessionDurationSeconds;
}

export function createAuthSessionPolicyValue(
  mode: AuthSessionPolicyMode,
  now = Date.now(),
) {
  const expiresAt = now + getAuthSessionDurationSeconds(mode) * 1000;

  return `${mode}:${expiresAt}`;
}

export function getAuthSessionPolicyStatus(
  value: string | null | undefined,
  now = Date.now(),
): AuthSessionPolicyStatus {
  if (!value) {
    return { state: "missing" };
  }

  const [mode, expiresAtValue] = value.split(":");
  const expiresAt = Number.parseInt(expiresAtValue ?? "", 10);

  if (
    (mode !== "standard" && mode !== "remembered") ||
    !Number.isFinite(expiresAt)
  ) {
    return { state: "invalid" };
  }

  if (expiresAt <= now) {
    return { state: "expired" };
  }

  return {
    expiresAt,
    mode,
    state: "active",
  };
}

export function getAuthSessionCookieOptions(
  mode: AuthSessionPolicyMode,
  secure: boolean,
) {
  return {
    httpOnly: true,
    maxAge: getAuthSessionDurationSeconds(mode),
    path: "/",
    sameSite: "lax" as const,
    secure,
  };
}

export function getClearAuthSessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax" as const,
    secure,
  };
}
