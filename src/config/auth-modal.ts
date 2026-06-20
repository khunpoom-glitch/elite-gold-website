export const AUTH_MODAL_EVENT_NAME = "elite-gold-auth-modal";
export const AUTH_MODAL_SKIP_SCROLL_EVENT_NAME = "elite-gold-auth-modal-skip-scroll";

export const AUTH_MODAL_ROUTES = {
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
} as const;

export type AuthModalMode = keyof typeof AUTH_MODAL_ROUTES;

export type AuthModalEventDetail = {
  mode: AuthModalMode;
  referralCode?: string;
  returnHref?: string;
};
