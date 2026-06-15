import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const socialImageAlt =
  "Elite Gold Community black and gold logo banner";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageContentType = "image/png";

async function getBannerDataUrl() {
  const banner = await readFile(
    join(process.cwd(), "public/brand/elite-gold-social-banner.png"),
  );

  return `data:image/png;base64,${banner.toString("base64")}`;
}

export async function createEliteGoldSocialImage() {
  const bannerDataUrl = await getBannerDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          display: "flex",
          height: "100%",
          width: "100%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={socialImageAlt}
          height="630"
          src={bannerDataUrl}
          style={{
            height: "100%",
            objectFit: "cover",
            width: "100%",
          }}
          width="1200"
        />
      </div>
    ),
    socialImageSize,
  );
}
