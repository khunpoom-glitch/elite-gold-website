import { headers } from "next/headers";
import { siteConfig } from "@/config/site";

export function normalizeLocalOrigin(origin: string) {
  try {
    const url = new URL(origin);

    if (url.hostname === "0.0.0.0" || url.hostname === "::") {
      url.hostname = "localhost";
    }

    return url.origin;
  } catch {
    return origin;
  }
}

export async function getRequestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    return siteConfig.url;
  }

  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0")
      ? "http"
      : "https");

  return normalizeLocalOrigin(`${protocol}://${host}`);
}
