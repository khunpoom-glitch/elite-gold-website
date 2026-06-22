export const authNoticeParamName = "auth";
export const loggedInAuthNoticeValue = "logged-in";
export const signedOutAuthNoticeValue = "signed-out";

type AuthNoticeValue = typeof loggedInAuthNoticeValue | typeof signedOutAuthNoticeValue;

export function addAuthNoticeToRedirectPath(path: string, notice: AuthNoticeValue) {
  const redirectUrl = new URL(path, "https://elitegold.local");

  redirectUrl.searchParams.set(authNoticeParamName, notice);

  return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
}
