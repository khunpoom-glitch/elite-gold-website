import { createHash, randomBytes } from "node:crypto";

export const emailVerificationTokenLifetimeHours = 24;

export function createEmailVerificationToken() {
  const token = randomBytes(32).toString("base64url");

  return {
    token,
    tokenHash: hashEmailVerificationToken(token),
  };
}

export function getEmailVerificationExpiresAt(now = new Date()) {
  return new Date(now.getTime() + emailVerificationTokenLifetimeHours * 60 * 60 * 1000);
}

export function hashEmailVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
