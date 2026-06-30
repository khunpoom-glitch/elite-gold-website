import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { sendAdminVerificationCodeEmail } from "@/lib/email/resend";
import type { AdminRole, AdminUser } from "./roles";

export const adminDashboardPath = "/dashboard/admin";
export const adminVerificationPath = "/dashboard/admin/verify";
export const adminVerificationCookieName = "elite_gold_admin_verified";

const adminVerificationTtlSeconds = 60 * 60;
const adminCodeTtlMinutes = 10;

type AdminVerificationPayload = {
  adminUserId: string;
  expiresAt: number;
  nonce: string;
  role: AdminRole;
  userId: string;
  verifiedAt: number;
  version: 1;
};

type ChallengeRpcRow = {
  challenge_id: string | null;
  code_salt: string | null;
  expires_at: string | null;
  locked_until: string | null;
  next_allowed_at: string | null;
  result: string | null;
};

type VerifyRpcRow = {
  attempts_remaining: number | null;
  expires_at: string | null;
  locked_until: string | null;
  result: string | null;
};

type AdminChallengeView = {
  challengeId: string;
  codeSalt: string;
  expiresAt: string;
  lockedUntil: string | null;
  nextAllowedAt: string | null;
};

type IssueChallengeResult =
  | {
      challenge: AdminChallengeView;
      emailSent: boolean;
      ok: true;
      state: "active" | "cooldown" | "sent";
    }
  | {
      challenge?: AdminChallengeView;
      lockedUntil?: string | null;
      ok: false;
      reason: "config_error" | "email_error" | "locked" | "verification_error";
    };

type VerifyChallengeResult =
  | { ok: true }
  | {
      attemptsRemaining?: number;
      lockedUntil?: string | null;
      ok: false;
      reason: "expired" | "invalid" | "locked" | "verification_error";
    };

function getAdminVerificationSecret() {
  return (
    process.env.ADMIN_VERIFICATION_SECRET?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    ""
  );
}

function getFirstRpcRow<T>(data: T[] | T | null): T | null {
  return Array.isArray(data) ? data[0] ?? null : data;
}

function getChallengeView(row: ChallengeRpcRow | null): AdminChallengeView | null {
  if (!row?.challenge_id || !row.code_salt || !row.expires_at) {
    return null;
  }

  return {
    challengeId: row.challenge_id,
    codeSalt: row.code_salt,
    expiresAt: row.expires_at,
    lockedUntil: row.locked_until,
    nextAllowedAt: row.next_allowed_at,
  };
}

function signValue(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]{64}$/.test(left) || !/^[a-f0-9]{64}$/.test(right)) {
    return false;
  }

  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function encodePayload(payload: AdminVerificationPayload, secret: string) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signValue(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

function decodePayload(value: string, secret: string): AdminVerificationPayload | null {
  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature || !safeEqualHex(signValue(encodedPayload, secret), signature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<AdminVerificationPayload>;

    if (
      parsed.version !== 1 ||
      typeof parsed.adminUserId !== "string" ||
      typeof parsed.userId !== "string" ||
      typeof parsed.role !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.verifiedAt !== "number" ||
      typeof parsed.nonce !== "string"
    ) {
      return null;
    }

    return parsed as AdminVerificationPayload;
  } catch {
    return null;
  }
}

export function getSafeAdminNextPath(value: string | null | undefined) {
  const fallbackPath = adminDashboardPath;

  if (!value) {
    return fallbackPath;
  }

  try {
    const url = new URL(value, "https://elitegold.local");
    const path = `${url.pathname}${url.search}`;

    if (!path.startsWith(adminDashboardPath) || path.startsWith(adminVerificationPath)) {
      return fallbackPath;
    }

    return path;
  } catch {
    return fallbackPath;
  }
}

export function getAdminVerificationGatePath(nextPath = adminDashboardPath) {
  const searchParams = new URLSearchParams({
    next: getSafeAdminNextPath(nextPath),
  });

  return `${adminVerificationPath}?${searchParams.toString()}`;
}

export function createAdminVerificationCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function normalizeAdminVerificationCode(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, "") : "";
}

export function createAdminVerificationSalt() {
  return randomBytes(24).toString("hex");
}

export function hashAdminVerificationCode(code: string, salt: string) {
  const secret = getAdminVerificationSecret();

  if (!/^\d{6}$/.test(code) || !/^[a-f0-9]{32,128}$/.test(salt) || !secret) {
    return "";
  }

  return createHash("sha256").update(`${secret}:${salt}:${code}`).digest("hex");
}

export async function hasValidAdminVerificationCookie({
  admin,
  userId,
}: {
  admin: AdminUser;
  userId: string;
}) {
  const secret = getAdminVerificationSecret();

  if (!secret) {
    return false;
  }

  const cookieStore = await cookies();
  const payload = decodePayload(cookieStore.get(adminVerificationCookieName)?.value ?? "", secret);

  if (!payload || payload.expiresAt <= Date.now()) {
    return false;
  }

  return (
    payload.adminUserId === admin.id &&
    payload.userId === userId &&
    payload.role === admin.role
  );
}

export async function setAdminVerificationCookie({
  admin,
  userId,
}: {
  admin: AdminUser;
  userId: string;
}) {
  const secret = getAdminVerificationSecret();

  if (!secret) {
    return false;
  }

  const now = Date.now();
  const payload: AdminVerificationPayload = {
    adminUserId: admin.id,
    expiresAt: now + adminVerificationTtlSeconds * 1000,
    nonce: randomBytes(16).toString("hex"),
    role: admin.role,
    userId,
    verifiedAt: now,
    version: 1,
  };

  const cookieStore = await cookies();
  cookieStore.set({
    httpOnly: true,
    maxAge: adminVerificationTtlSeconds,
    name: adminVerificationCookieName,
    path: adminDashboardPath,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: encodePayload(payload, secret),
  });

  return true;
}

export async function issueAdminVerificationChallenge({
  admin,
  forceNew = false,
  supabase,
  user,
}: {
  admin: AdminUser;
  forceNew?: boolean;
  supabase: SupabaseClient;
  user: User;
}): Promise<IssueChallengeResult> {
  const code = createAdminVerificationCode();
  const codeSalt = createAdminVerificationSalt();
  const codeHash = hashAdminVerificationCode(code, codeSalt);

  if (!codeHash) {
    return { ok: false, reason: "config_error" };
  }

  const expiresAt = new Date(Date.now() + adminCodeTtlMinutes * 60 * 1000).toISOString();
  const { data, error } = await supabase.rpc("create_elite_admin_verification_challenge", {
    input_challenge_id: randomUUID(),
    input_code_hash: codeHash,
    input_code_salt: codeSalt,
    input_expires_at: expiresAt,
    input_force_new: forceNew,
  });

  if (error) {
    console.error("[admin] Failed to create admin verification challenge.", error);

    return { ok: false, reason: "verification_error" };
  }

  const row = getFirstRpcRow(data as ChallengeRpcRow[] | ChallengeRpcRow | null);
  const challenge = getChallengeView(row);

  if (!challenge) {
    return { ok: false, reason: "verification_error" };
  }

  if (row?.result === "locked") {
    return {
      challenge,
      lockedUntil: challenge.lockedUntil,
      ok: false,
      reason: "locked",
    };
  }

  if (row?.result === "sent") {
    const email = await sendAdminVerificationCodeEmail({
      code,
      expiresInMinutes: adminCodeTtlMinutes,
      name: user.user_metadata?.full_name || user.email || admin.email,
      to: admin.email,
    });

    if (!email.ok) {
      return {
        challenge,
        ok: false,
        reason: "email_error",
      };
    }

    return {
      challenge,
      emailSent: true,
      ok: true,
      state: "sent",
    };
  }

  if (row?.result === "active" || row?.result === "cooldown") {
    return {
      challenge,
      emailSent: false,
      ok: true,
      state: row.result,
    };
  }

  return { ok: false, reason: "verification_error" };
}

export async function verifyAdminVerificationChallenge({
  admin,
  challengeId,
  code,
  codeSalt,
  supabase,
  user,
}: {
  admin: AdminUser;
  challengeId: string;
  code: string;
  codeSalt: string;
  supabase: SupabaseClient;
  user: User;
}): Promise<VerifyChallengeResult> {
  const codeHash = hashAdminVerificationCode(code, codeSalt);

  if (!challengeId || !codeHash) {
    return { ok: false, reason: "invalid" };
  }

  const { data, error } = await supabase.rpc("verify_elite_admin_verification_challenge", {
    input_challenge_id: challengeId,
    input_code_hash: codeHash,
  });

  if (error) {
    console.error("[admin] Failed to verify admin challenge.", error);

    return { ok: false, reason: "verification_error" };
  }

  const row = getFirstRpcRow(data as VerifyRpcRow[] | VerifyRpcRow | null);

  if (!row?.result) {
    return { ok: false, reason: "verification_error" };
  }

  if (row.result === "verified") {
    const cookieSet = await setAdminVerificationCookie({
      admin,
      userId: user.id,
    });

    if (!cookieSet) {
      return { ok: false, reason: "verification_error" };
    }

    await supabase.from("course_purchase_admin_events").insert({
      actor_id: user.id,
      event_type: "admin_verified",
      metadata: {
        adminUserId: admin.id,
        role: admin.role,
      },
      target_user_id: user.id,
    });

    return { ok: true };
  }

  if (row.result === "expired") {
    return { ok: false, reason: "expired" };
  }

  if (row.result === "locked") {
    return {
      attemptsRemaining: row.attempts_remaining ?? undefined,
      lockedUntil: row.locked_until,
      ok: false,
      reason: "locked",
    };
  }

  return {
    attemptsRemaining: row.attempts_remaining ?? undefined,
    ok: false,
    reason: "invalid",
  };
}
