import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

export const socialImageAlt =
  "Elite Gold Community black and gold social preview banner";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageContentType = "image/png";

async function getLogoDataUrl() {
  const logo = await readFile(
    join(process.cwd(), "public/brand/elite-gold-mark-social.png"),
  );

  return `data:image/png;base64,${logo.toString("base64")}`;
}

export async function createEliteGoldSocialImage() {
  const logoDataUrl = await getLogoDataUrl();
  const displayFont =
    '"Sora", "Avenir Next", "Helvetica Neue", Arial, sans-serif';

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 50% 0%, rgba(212,175,55,0.28), transparent 38%), linear-gradient(135deg, #000000 0%, #030303 46%, #0a0700 100%)",
          color: "#f8fafc",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(212,175,55,0.28)",
            borderRadius: 34,
            boxShadow:
              "0 0 90px rgba(212,175,55,0.16), inset 0 1px 0 rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            height: 510,
            justifyContent: "space-between",
            paddingBottom: 64,
            paddingLeft: 64,
            paddingRight: 64,
            paddingTop: 48,
            width: 1040,
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                height: 154,
                justifyContent: "center",
                width: 140,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                height="154"
                src={logoDataUrl}
                style={{
                  height: 154,
                  objectFit: "contain",
                  width: 154,
                }}
                width="154"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  color: "#ffffff",
                  fontFamily: displayFont,
                  fontSize: 54,
                  fontWeight: 780,
                  lineHeight: 0.96,
                }}
              >
                Elite Gold
              </div>
              <div
                style={{
                  color: "#e6c766",
                  fontFamily: displayFont,
                  fontSize: 19,
                  fontWeight: 700,
                  letterSpacing: 4.2,
                  marginTop: 12,
                  textTransform: "uppercase",
                }}
              >
                Community
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                color: "#ffffff",
                display: "flex",
                flexDirection: "column",
                fontFamily: displayFont,
                fontSize: 38,
                fontWeight: 700,
                letterSpacing: -0.35,
                lineHeight: 1.12,
                maxWidth: 700,
              }}
            >
              <span>Discipline.</span>
              <span>Strategy.</span>
              <span>Consistency.</span>
            </div>
            <div
              style={{
                color: "#d4d4d8",
                fontFamily: displayFont,
                fontSize: 26,
                fontWeight: 400,
                lineHeight: 1.38,
                maxWidth: 820,
              }}
            >
              {siteConfig.shortDescription}
            </div>
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  );
}
