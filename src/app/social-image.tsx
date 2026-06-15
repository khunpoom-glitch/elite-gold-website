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
  const logo = await readFile(join(process.cwd(), "public/brand/elite-gold-mark.png"));

  return `data:image/png;base64,${logo.toString("base64")}`;
}

export async function createEliteGoldSocialImage() {
  const logoDataUrl = await getLogoDataUrl();

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
              "0 0 80px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            height: 510,
            justifyContent: "space-between",
            padding: 58,
            width: 1040,
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              height="112"
              src={logoDataUrl}
              style={{
                filter: "drop-shadow(0 18px 34px rgba(212,175,55,0.22))",
                height: 112,
                objectFit: "contain",
                width: 112,
              }}
              width="112"
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  color: "#ffffff",
                  fontSize: 42,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                Elite Gold
              </div>
              <div
                style={{
                  color: "#e6c766",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 3,
                  marginTop: 10,
                  textTransform: "uppercase",
                }}
              >
                Community
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                color: "#ffffff",
                display: "flex",
                flexDirection: "column",
                fontSize: 76,
                fontWeight: 800,
                letterSpacing: -1,
                lineHeight: 0.98,
                maxWidth: 820,
              }}
            >
              <span>Discipline.</span>
              <span>Strategy.</span>
              <span>Consistency.</span>
            </div>
            <div
              style={{
                color: "#d4d4d8",
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.35,
                maxWidth: 860,
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
