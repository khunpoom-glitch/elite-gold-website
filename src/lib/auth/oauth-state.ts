import { getSafeRedirectPath, normalizeAccessCode } from "./validation";

export const oauthStateCookieName = "elite-gold-oauth-state";

export type OAuthIntent = "login" | "signup";

export type OAuthState = {
  accessCode: string;
  intent: OAuthIntent;
  nextPath: string;
};

export function serializeOAuthState({
  accessCode,
  intent,
  nextPath,
}: OAuthState) {
  const state = new URLSearchParams({
    intent,
    next: nextPath,
  });

  if (accessCode) {
    state.set("ref", accessCode);
  }

  return state.toString();
}

export function parseOAuthState(value?: string): OAuthState {
  const state = new URLSearchParams(value ?? "");
  const intent = state.get("intent") === "signup" ? "signup" : "login";

  return {
    accessCode: normalizeAccessCode(state.get("ref")),
    intent,
    nextPath: getSafeRedirectPath(state.get("next")),
  };
}
