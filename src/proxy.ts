import { NextResponse, type NextRequest } from "next/server";
import { productionApexHost, productionCanonicalHost } from "@/config/site-url";
import { updateSession } from "@/lib/supabase/proxy";

function getCanonicalHostRedirect(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host") ?? request.nextUrl.host;
  const hostname = host.split(":")[0]?.toLowerCase();

  if (hostname !== productionApexHost) {
    return null;
  }

  const redirectUrl = request.nextUrl.clone();

  redirectUrl.protocol = "https:";
  redirectUrl.hostname = productionCanonicalHost;
  redirectUrl.port = "";

  return NextResponse.redirect(redirectUrl, 308);
}

export async function proxy(request: NextRequest) {
  const canonicalRedirect = getCanonicalHostRedirect(request);

  if (canonicalRedirect) {
    return canonicalRedirect;
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
