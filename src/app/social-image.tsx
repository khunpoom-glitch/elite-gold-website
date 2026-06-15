import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const socialImageAlt =
  "Elite Gold Community black and gold logo banner";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageContentType = "image/png";

const socialImageHeaders = {
  "cache-control": "public, max-age=31536000, immutable",
  "content-type": socialImageContentType,
};

export function createEliteGoldSocialImageHeadResponse() {
  return new Response(null, {
    headers: socialImageHeaders,
  });
}

export async function createEliteGoldSocialImageResponse() {
  const banner = await readFile(
    join(process.cwd(), "public/brand/elite-gold-social-banner.png"),
  );

  return new Response(new Uint8Array(banner), {
    headers: socialImageHeaders,
  });
}
