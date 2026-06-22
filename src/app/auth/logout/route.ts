import { NextResponse, type NextRequest } from "next/server";
import { clearLogoutCookiesOnResponse } from "@/lib/auth/logout";

export async function POST(request: NextRequest) {
  const isFetchLogout = request.headers.get("x-elite-logout") === "fetch";
  const response = isFetchLogout
    ? NextResponse.json(
        { signedOut: true },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      )
    : getLogoutRedirectResponse(request);

  clearLogoutCookiesOnResponse(response, request);

  return response;
}

function getLogoutRedirectResponse(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();

  redirectUrl.pathname = "/";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("auth", "signed-out");

  return NextResponse.redirect(redirectUrl, 303);
}
