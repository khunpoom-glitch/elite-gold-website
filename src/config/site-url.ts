export const productionApexHost = "elitegoldcommunity.com";
export const productionCanonicalHost = "www.elitegoldcommunity.com";
export const productionCanonicalSiteUrl = `https://${productionCanonicalHost}`;

const localFallbackSiteUrl = "http://localhost:3000";

export function canonicalizeProductionSiteUrl(siteUrl: string) {
  try {
    const url = new URL(siteUrl);

    if (url.hostname === productionApexHost) {
      url.hostname = productionCanonicalHost;
      url.protocol = "https:";
      url.port = "";
    }

    return url.origin;
  } catch {
    return siteUrl;
  }
}

export function getConfiguredSiteUrl() {
  return canonicalizeProductionSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || localFallbackSiteUrl,
  );
}
