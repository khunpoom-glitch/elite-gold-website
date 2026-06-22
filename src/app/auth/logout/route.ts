import { NextResponse, type NextRequest } from "next/server";
import { clearLogoutCookiesOnResponse } from "@/lib/auth/logout";

export async function POST(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();

  redirectUrl.pathname = "/";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("auth", "signed-out");

  const response = NextResponse.redirect(redirectUrl, 303);

  clearLogoutCookiesOnResponse(response, request);

  return response;
}
