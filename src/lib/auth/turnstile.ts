import { turnstileResponseFieldName } from "@/lib/auth/turnstile-fields";

const turnstileSiteverifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const turnstileVerificationError =
  "Security check failed. Please refresh and try again.";

type TurnstileSiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

export function isTurnstileConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()) &&
    Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export async function verifyTurnstileToken(formData: FormData, remoteIp?: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  if (!secretKey || !siteKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[auth] Turnstile is not fully configured; skipping verification.");
    }

    return { ok: true as const, skipped: true as const };
  }

  const token = getStringField(formData, turnstileResponseFieldName);

  if (!token) {
    return { ok: false as const, message: turnstileVerificationError };
  }

  const requestBody = new URLSearchParams({
    response: token,
    secret: secretKey,
  });

  if (remoteIp) {
    requestBody.set("remoteip", remoteIp);
  }

  let response: Response;

  try {
    response = await fetch(turnstileSiteverifyUrl, {
      body: requestBody,
      cache: "no-store",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });
  } catch (error) {
    console.warn("[auth] Turnstile verification request failed.", error);

    return { ok: false as const, message: turnstileVerificationError };
  }

  if (!response.ok) {
    console.warn("[auth] Turnstile verification returned an HTTP error.", {
      status: response.status,
    });

    return { ok: false as const, message: turnstileVerificationError };
  }

  const payload = (await response.json()) as TurnstileSiteverifyResponse;

  if (!payload.success) {
    console.warn("[auth] Turnstile verification failed.", {
      errorCodes: payload["error-codes"] ?? [],
      hostname: payload.hostname,
    });

    return { ok: false as const, message: turnstileVerificationError };
  }

  return { ok: true as const, skipped: false as const };
}
