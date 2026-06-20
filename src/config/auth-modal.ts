export const AUTH_MODAL_EVENT_NAME = "elite-gold-auth-modal";
export const AUTH_MODAL_SKIP_SCROLL_EVENT_NAME = "elite-gold-auth-modal-skip-scroll";

export const AUTH_MODAL_ROUTES = {
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
} as const;

export type AuthModalMode = keyof typeof AUTH_MODAL_ROUTES;

export type AuthModalEventDetail = {
  accessCode?: string;
  mode: AuthModalMode;
  returnHref?: string;
};

export function getAuthModalRouteHref(mode: AuthModalMode, accessCode?: string) {
  const route = AUTH_MODAL_ROUTES[mode];
  const normalizedAccessCode = accessCode?.trim();

  if (mode !== "signup" || !normalizedAccessCode) {
    return route;
  }

  const searchParams = new URLSearchParams({
    ref: normalizedAccessCode.toUpperCase(),
  });

  return `${route}?${searchParams.toString()}`;
}
