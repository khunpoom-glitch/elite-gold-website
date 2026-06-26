"use server";

import type { User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendEmailVerificationEmail, sendPasswordChangedEmail } from "@/lib/email/resend";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/auth/action-state";
import {
  createEmailVerificationToken,
  getEmailVerificationExpiresAt,
} from "@/lib/auth/email-verification";
import { getRequestOrigin } from "@/lib/auth/origin";
import { clearLogoutCookiesOnServerAction } from "@/lib/auth/logout";
import { addAuthNoticeToRedirectPath, loggedInAuthNoticeValue } from "@/lib/auth/redirect-notice";
import { setServerAuthSessionPolicy } from "@/lib/auth/session-policy-server";
import { verifyTurnstileToken } from "@/lib/auth/turnstile";
import {
  getSafeRedirectPath,
  normalizeAccessCode,
  rootAccessCode,
  validateEmailChangeForm,
  validateForgotPasswordForm,
  validateLoginForm,
  validateSignupProfileForm,
  validateSignupForm,
  validateUpdatePasswordForm,
  validateUpdateProfileForm,
} from "@/lib/auth/validation";
import { getMemberProfileByUserId, type MemberProfile } from "@/lib/member/profile";

type AccessCodeStatus = "bootstrap" | "valid" | "missing" | "invalid";

function errorState(
  message: string,
  fieldErrors?: Record<string, string>,
): AuthActionState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function successState(message: string, redirectTo?: string): AuthActionState {
  return {
    status: "success",
    message,
    redirectTo,
  };
}

const signupSuccessMessage =
  "Sign up completed. Please check your email and click Verify Email to activate your account.";
const emailVerificationCooldownMessage =
  "Please wait 90 seconds before requesting another verification email.";

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function getForwardedIp(headerStore: Awaited<ReturnType<typeof headers>>) {
  return (
    headerStore.get("cf-connecting-ip") ||
    headerStore.get("x-real-ip") ||
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    ""
  );
}

async function getTurnstileErrorState(formData: FormData) {
  const headerStore = await headers();
  const verification = await verifyTurnstileToken(formData, getForwardedIp(headerStore));

  return verification.ok ? null : errorState(verification.message);
}

function getUserMetadataString(user: User, keys: string[]) {
  for (const key of keys) {
    const value = user.user_metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getMemberDisplayName(fields: { firstName?: string; fullName?: string; nickname?: string }) {
  return fields.nickname || fields.firstName || fields.fullName || "Elite Gold Member";
}

function getRegionName(countryCode: string) {
  const normalizedCountryCode = countryCode.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalizedCountryCode)) {
    return "";
  }

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(normalizedCountryCode) ?? "";
  } catch {
    return "";
  }
}

function getBrowserName(userAgent: string) {
  if (/edg\//i.test(userAgent)) {
    return "Edge";
  }

  if (/opr\//i.test(userAgent)) {
    return "Opera";
  }

  if (/crios/i.test(userAgent)) {
    return "Chrome";
  }

  if (/chrome|chromium/i.test(userAgent)) {
    return "Chrome";
  }

  if (/firefox/i.test(userAgent)) {
    return "Firefox";
  }

  if (/safari/i.test(userAgent)) {
    return "Safari";
  }

  return "Browser";
}

function getOperatingSystemName(userAgent: string) {
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return "iOS";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  if (/macintosh|mac os x/i.test(userAgent)) {
    return "macOS";
  }

  if (/windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Unknown device";
}

function formatBangkokTimestamp(date = new Date()) {
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "short",
    timeZone: "Asia/Bangkok",
    year: "numeric",
  }).format(date);

  return `${formattedDate} (GMT+7)`;
}

function decodeHeaderValue(value: string | null) {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

async function getPasswordChangedSecurityDetails(resetUrl: string) {
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? "";
  const city =
    decodeHeaderValue(headerStore.get("x-vercel-ip-city")) ||
    decodeHeaderValue(headerStore.get("cf-ipcity"));
  const countryName =
    getRegionName(headerStore.get("x-vercel-ip-country") ?? "") ||
    getRegionName(headerStore.get("cf-ipcountry") ?? "");
  const location =
    city && countryName ? `${city}, ${countryName}` : city || countryName || "Unavailable";
  const browser = userAgent ? getBrowserName(userAgent) : "Browser";
  const os = userAgent ? getOperatingSystemName(userAgent) : "Unknown device";
  const device = os === "Unknown device" ? browser : `${browser} on ${os}`;

  return {
    changedAt: formatBangkokTimestamp(),
    device,
    location,
    resetUrl,
  };
}

async function issueEmailVerificationEmail(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  profile: MemberProfile,
) {
  const { token, tokenHash } = createEmailVerificationToken();
  const expiresAt = getEmailVerificationExpiresAt();
  const { error } = await supabase.rpc("create_elite_email_verification_token", {
    input_expires_at: expiresAt.toISOString(),
    input_token_hash: tokenHash,
  });

  if (error) {
    const isCooldownError = error.message.includes("email_verification_cooldown");

    console.error("[auth] Failed to create email verification token.", {
      code: error.code,
      message: error.message,
    });

    return {
      ok: false as const,
      reason: isCooldownError ? "cooldown" : "token-error",
    };
  }

  const verificationUrl = new URL("/auth/verify-email", await getRequestOrigin());
  verificationUrl.searchParams.set("token", token);

  const emailResult = await sendEmailVerificationEmail({
    memberAccessCode: profile.memberAccessCode,
    name: getMemberDisplayName(profile),
    to: profile.email,
    verificationUrl: verificationUrl.toString(),
  });

  return emailResult.ok
    ? { ok: true as const }
    : { ok: false as const, reason: "email-error" as const };
}

function getAccessCodeResolution(row: unknown) {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const status = "status" in row ? row.status : null;
  const resolvedAccessCode = "resolved_access_code" in row ? row.resolved_access_code : null;

  if (
    status !== "bootstrap" &&
    status !== "valid" &&
    status !== "missing" &&
    status !== "invalid"
  ) {
    return null;
  }

  return {
    resolvedAccessCode: typeof resolvedAccessCode === "string" ? resolvedAccessCode : "",
    status: status as AccessCodeStatus,
  };
}

function accessCodeErrorState(status: "missing" | "invalid") {
  const message =
    status === "missing"
      ? "Access Code is required. Please use a valid signup link before continuing."
      : "Access Code is invalid or not active. Please check the signup link and try again.";

  return errorState(message, {
    signupAccessCode: message,
  });
}

async function resolveSignupAccessCode(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  accessCode: string,
): Promise<
  | { ok: true; accessCode: string }
  | { ok: false; state: AuthActionState }
> {
  const normalizedAccessCode = normalizeAccessCode(accessCode);

  if (!normalizedAccessCode) {
    return {
      ok: false,
      state: accessCodeErrorState("missing"),
    };
  }

  const { data, error } = await supabase
    .rpc("resolve_elite_access_code", {
      input_code: normalizedAccessCode,
    })
    .single();

  if (error) {
    return {
      ok: false,
      state: errorState("ยังไม่สามารถตรวจสอบ Access Code ได้ กรุณาลองใหม่อีกครั้ง"),
    };
  }

  const resolution = getAccessCodeResolution(data);

  if (!resolution) {
    return {
      ok: false,
      state: errorState("ยังไม่สามารถตรวจสอบ Access Code ได้ กรุณาลองใหม่อีกครั้ง"),
    };
  }

  if (resolution.status === "missing" || resolution.status === "invalid") {
    return {
      ok: false,
      state: accessCodeErrorState(resolution.status),
    };
  }

  if (
    resolution.status === "bootstrap" &&
    normalizedAccessCode !== rootAccessCode &&
    normalizedAccessCode !== resolution.resolvedAccessCode
  ) {
    return {
      ok: false,
      state: accessCodeErrorState("invalid"),
    };
  }

  return {
    ok: true,
    accessCode: resolution.resolvedAccessCode,
  };
}

async function getAuthCallbackUrl(nextPath: string) {
  const callbackUrl = new URL("/auth/callback", await getRequestOrigin());

  callbackUrl.searchParams.set("next", getSafeRedirectPath(nextPath));

  return callbackUrl.toString();
}

function getReadableAuthError(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("invalid login credentials")) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }

  if (lowerMessage.includes("email not confirmed")) {
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  }

  if (lowerMessage.includes("user already registered")) {
    return "อีเมลนี้ถูกสมัครไว้แล้ว กรุณา Login หรือใช้ Forgot Password";
  }

  if (
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("over_email_send_rate_limit") ||
    lowerMessage.includes("security purposes") ||
    lowerMessage.includes("request this after")
  ) {
    return "Too many reset requests. Please wait a minute before trying again.";
  }

  if (lowerMessage.includes("password")) {
    return "รหัสผ่านไม่ตรงตามเงื่อนไขของระบบ";
  }

  return "ระบบสมาชิกยังไม่สามารถดำเนินการได้ในตอนนี้ กรุณาลองใหม่อีกครั้ง";
}

function getUpdatePasswordErrorState(message: string) {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("auth session missing") ||
    lowerMessage.includes("session missing") ||
    lowerMessage.includes("session not found") ||
    lowerMessage.includes("not authenticated") ||
    lowerMessage.includes("jwt") ||
    lowerMessage.includes("invalid refresh") ||
    lowerMessage.includes("invalid token") ||
    lowerMessage.includes("token expired")
  ) {
    return errorState(
      "Reset link expired. Please request a new reset link and use the newest email.",
    );
  }

  if (
    lowerMessage.includes("same password") ||
    lowerMessage.includes("different password") ||
    lowerMessage.includes("should be different")
  ) {
    return errorState(
      "Use a different password from your current one.",
      {
        password: "Use a different password.",
      },
    );
  }

  if (
    lowerMessage.includes("weak") ||
    lowerMessage.includes("short") ||
    lowerMessage.includes("characters") ||
    lowerMessage.includes("password")
  ) {
    return errorState(
      "Use a stronger password with at least 8 characters.",
      {
        password: "Use a stronger password.",
      },
    );
  }

  return errorState(
    "Unable to update password. Please request a new reset link and try again.",
  );
}

async function getConfiguredSupabaseClient(): Promise<
  | {
      ok: true;
      supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
    }
  | {
      ok: false;
      state: AuthActionState;
    }
> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      state: errorState("ยังไม่ได้ตั้งค่า Supabase environment สำหรับระบบสมาชิก"),
    };
  }

  return { ok: true, supabase };
}

export async function loginWithPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateLoginForm(formData);

  if (!validation.ok) {
    return errorState(validation.message, validation.fieldErrors);
  }

  const turnstileError = await getTurnstileErrorState(formData);

  if (turnstileError) {
    return turnstileError;
  }

  const client = await getConfiguredSupabaseClient();

  if (!client.ok) {
    return client.state;
  }

  const { remember, ...credentials } = validation.data;
  const { error } = await client.supabase.auth.signInWithPassword(credentials);

  if (error) {
    return errorState(getReadableAuthError(error.message));
  }

  await setServerAuthSessionPolicy(remember ? "remembered" : "standard");
  revalidatePath("/", "layout");

  return successState(
    "เข้าสู่ระบบสำเร็จ กำลังพาไปยัง Member Dashboard",
    addAuthNoticeToRedirectPath(
      getSafeRedirectPath(getStringField(formData, "next")),
      loggedInAuthNoticeValue,
    ),
  );
}

export async function signupWithPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateSignupForm(formData);

  if (!validation.ok) {
    return errorState(validation.message, validation.fieldErrors);
  }

  const turnstileError = await getTurnstileErrorState(formData);

  if (turnstileError) {
    return turnstileError;
  }

  const client = await getConfiguredSupabaseClient();

  if (!client.ok) {
    return client.state;
  }

  const { password, ...profile } = validation.data;
  const accessCode = await resolveSignupAccessCode(client.supabase, profile.signupAccessCode);

  if (!accessCode.ok) {
    return accessCode.state;
  }

  const { error, data } = await client.supabase.auth.signUp({
    email: profile.email,
    password,
    options: {
      data: {
        first_name: profile.firstName,
        last_name: profile.lastName,
        full_name: `${profile.firstName} ${profile.lastName}`,
        nickname: profile.nickname,
        nationality: profile.nationality,
        phone_country: profile.phoneCountry,
        phone: profile.phone,
        access_code: accessCode.accessCode,
        signup_access_code: accessCode.accessCode,
        referral_code: accessCode.accessCode,
        signup_referral_code: accessCode.accessCode,
        signup_provider: "email",
        elite_signup_complete: "true",
      },
    },
  });

  if (error) {
    return errorState(getReadableAuthError(error.message));
  }

  if (!data.user) {
    return errorState("Signup was created, but the member profile could not be confirmed. Please try logging in and resend the verification email from My Profile.");
  }

  const memberProfile = await getMemberProfileByUserId(client.supabase, data.user.id);

  if (!memberProfile) {
    return errorState("Signup was created, but the member profile could not be loaded. Please try logging in and resend the verification email from My Profile.");
  }

  const verification = await issueEmailVerificationEmail(client.supabase, memberProfile);

  if (!verification.ok) {
    if (verification.reason === "cooldown") {
      return errorState(emailVerificationCooldownMessage);
    }

    return errorState("Signup was created, but the verification email could not be sent. Please login and resend it from My Profile.");
  }

  await setServerAuthSessionPolicy("standard");
  revalidatePath("/", "layout");

  return successState(signupSuccessMessage);
}

export async function resendEmailVerificationAction(
  _previousState: AuthActionState,
  _formData: FormData,
): Promise<AuthActionState> {
  void _previousState;
  void _formData;

  const client = await getConfiguredSupabaseClient();

  if (!client.ok) {
    return client.state;
  }

  const {
    data: { user },
    error: userError,
  } = await client.supabase.auth.getUser();

  if (userError || !user) {
    return errorState("Please login before requesting a new verification email.");
  }

  const profile = await getMemberProfileByUserId(client.supabase, user.id);

  if (!profile) {
    return errorState("Member profile was not found. Please complete signup again.");
  }

  if (profile.status === "active") {
    return successState("Your email is already verified.");
  }

  const verification = await issueEmailVerificationEmail(client.supabase, profile);

  if (!verification.ok) {
    if (verification.reason === "cooldown") {
      return errorState(emailVerificationCooldownMessage);
    }

    return errorState("We could not send the verification email right now. Please try again.");
  }

  return successState("Verification email sent. Please check your inbox and click Verify Email.");
}

export async function getSignupVerificationStatusAction() {
  const client = await getConfiguredSupabaseClient();

  if (!client.ok) {
    return { status: "unavailable" as const };
  }

  const {
    data: { user },
    error: userError,
  } = await client.supabase.auth.getUser();

  if (userError || !user) {
    return { status: "unauthenticated" as const };
  }

  const profile = await getMemberProfileByUserId(client.supabase, user.id);

  if (!profile) {
    return { status: "missing_profile" as const };
  }

  return { status: profile.status };
}

export async function completeGoogleSignupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateSignupProfileForm(formData);

  if (!validation.ok) {
    return errorState(validation.message, validation.fieldErrors);
  }

  const turnstileError = await getTurnstileErrorState(formData);

  if (turnstileError) {
    return turnstileError;
  }

  const client = await getConfiguredSupabaseClient();

  if (!client.ok) {
    return client.state;
  }

  const {
    data: { user },
    error: userError,
  } = await client.supabase.auth.getUser();

  if (userError || !user) {
    return errorState("กรุณา Sign Up with Google อีกครั้งก่อนบันทึกข้อมูลสมาชิก");
  }

  const userEmail = user.email?.toLowerCase();

  if (!userEmail || userEmail !== validation.data.email) {
    return errorState("อีเมลจาก Google ไม่ตรงกับฟอร์มสมัคร กรุณาเริ่ม Sign Up with Google ใหม่", {
      email: "อีเมลต้องตรงกับบัญชี Google ที่เชื่อมต่อ",
    });
  }

  const fullName = `${validation.data.firstName} ${validation.data.lastName}`.trim();
  const accessCode = await resolveSignupAccessCode(client.supabase, validation.data.signupAccessCode);

  if (!accessCode.ok) {
    return accessCode.state;
  }

  const { error } = await client.supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: userEmail,
      first_name: validation.data.firstName,
      last_name: validation.data.lastName,
      full_name: fullName,
      nickname: validation.data.nickname,
      nationality: validation.data.nationality,
      phone_country: validation.data.phoneCountry,
      phone: validation.data.phone,
      signup_access_code: accessCode.accessCode,
      signup_referral_code: accessCode.accessCode,
      avatar_url: getUserMetadataString(user, ["avatar_url", "picture"]) || null,
      signup_provider: "google",
      status: "pending_email_confirmation",
      email_confirmed_at: null,
    });

  let memberProfile = await getMemberProfileByUserId(client.supabase, user.id);

  if (error) {
    if (error.code === "23505") {
      if (!memberProfile) {
        return errorState("บัญชีนี้สมัครสมาชิกไว้แล้ว แต่ยังไม่พบข้อมูลโปรไฟล์ กรุณาติดต่อทีมงาน");
      }

      if (memberProfile.status === "active") {
        return successState("This account is already registered. Please login to continue.");
      }
    } else {
      return errorState("ยังไม่สามารถบันทึกข้อมูลสมาชิกได้ กรุณาตรวจสอบข้อมูลแล้วลองใหม่");
    }
  }

  if (!memberProfile) {
    memberProfile = await getMemberProfileByUserId(client.supabase, user.id);
  }

  if (!memberProfile) {
    return errorState("Signup was created, but the member profile could not be loaded. Please try logging in and resend the verification email from My Profile.");
  }

  const verification = await issueEmailVerificationEmail(client.supabase, memberProfile);

  if (!verification.ok) {
    if (verification.reason === "cooldown") {
      return errorState(emailVerificationCooldownMessage);
    }

    return errorState("Signup was created, but the verification email could not be sent. Please login and resend it from My Profile.");
  }

  await setServerAuthSessionPolicy("standard");
  revalidatePath("/", "layout");
  revalidatePath("/dashboard");

  return successState(signupSuccessMessage);
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateForgotPasswordForm(formData);

  if (!validation.ok) {
    return errorState(validation.message, validation.fieldErrors);
  }

  const turnstileError = await getTurnstileErrorState(formData);

  if (turnstileError) {
    return turnstileError;
  }

  const client = await getConfiguredSupabaseClient();

  if (!client.ok) {
    return client.state;
  }

  const { error } = await client.supabase.auth.resetPasswordForEmail(validation.data.email, {
    redirectTo: await getAuthCallbackUrl("/reset-password"),
  });

  if (error) {
    return errorState(getReadableAuthError(error.message));
  }

  return successState("Reset link sent. Please check your inbox.");
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateUpdatePasswordForm(formData);

  if (!validation.ok) {
    return errorState(validation.message, validation.fieldErrors);
  }

  const client = await getConfiguredSupabaseClient();

  if (!client.ok) {
    return client.state;
  }

  const { data, error } = await client.supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    console.warn("[auth] Failed to update password.", {
      message: error.message,
      name: error.name,
      status: "status" in error ? error.status : undefined,
    });

    return getUpdatePasswordErrorState(error.message);
  }

  const updatedUser = data.user;
  const memberProfile = updatedUser
    ? await getMemberProfileByUserId(client.supabase, updatedUser.id)
    : null;
  const notificationEmail = memberProfile?.email || updatedUser?.email;

  if (notificationEmail) {
    const requestOrigin = await getRequestOrigin();
    const resetUrl = new URL("/forgot-password", requestOrigin).toString();
    const fallbackName = updatedUser
      ? getUserMetadataString(updatedUser, ["nickname", "first_name", "full_name", "name"])
      : "";
    const emailResult = await sendPasswordChangedEmail({
      name: getMemberDisplayName(memberProfile ?? { firstName: fallbackName }),
      securityDetails: await getPasswordChangedSecurityDetails(resetUrl),
      to: notificationEmail,
    });

    if (!emailResult.ok) {
      console.warn("[auth] Password changed notification email was not sent.", {
        reason: emailResult.reason,
      });
    }
  }

  const { error: signOutError } = await client.supabase.auth.signOut();

  if (signOutError) {
    console.warn("[auth] Password reset session was not revoked after update.", {
      message: signOutError.message,
    });
  }

  await clearLogoutCookiesOnServerAction();
  revalidatePath("/", "layout");

  return successState(
    "Password updated. Please login with your new password.",
    "/login?notice=password-updated",
  );
}

export async function requestEmailChangeAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateEmailChangeForm(formData);

  if (!validation.ok) {
    return errorState(validation.message, validation.fieldErrors);
  }

  const client = await getConfiguredSupabaseClient();

  if (!client.ok) {
    return client.state;
  }

  const {
    data: { user },
    error: userError,
  } = await client.supabase.auth.getUser();

  if (userError || !user) {
    return errorState("กรุณาเข้าสู่ระบบก่อนเปลี่ยนอีเมล");
  }

  const profile = await getMemberProfileByUserId(client.supabase, user.id);

  if (!profile) {
    return errorState("ไม่พบข้อมูลสมาชิก กรุณาติดต่อทีมงาน");
  }

  if (profile.email.toLowerCase() === validation.data.email) {
    return errorState("อีเมลใหม่นี้เป็นอีเมลปัจจุบันอยู่แล้ว", {
      email: "กรุณากรอกอีเมลใหม่ที่แตกต่างจากอีเมลปัจจุบัน",
    });
  }

  await client.supabase
    .from("profile_email_change_requests")
    .update({ status: "cancelled" })
    .eq("profile_id", user.id)
    .eq("status", "pending");

  const { data: requestRow, error: requestError } = await client.supabase
    .from("profile_email_change_requests")
    .insert({
      profile_id: user.id,
      old_email: profile.email,
      new_email: validation.data.email,
      status: "pending",
    })
    .select("id")
    .single();

  if (requestError) {
    console.error("[auth] Failed to create email change request.", {
      code: requestError.code,
      message: requestError.message,
    });

    return errorState("ยังไม่สามารถเริ่มการเปลี่ยนอีเมลได้ กรุณาลองใหม่อีกครั้ง");
  }

  const { error } = await client.supabase.auth.updateUser(
    {
      email: validation.data.email,
    },
    {
      emailRedirectTo: await getAuthCallbackUrl("/dashboard/account?notice=email_change_verified"),
    },
  );

  if (error) {
    const requestId =
      typeof requestRow === "object" && requestRow !== null && "id" in requestRow
        ? requestRow.id
        : null;

    if (typeof requestId === "string") {
      await client.supabase
        .from("profile_email_change_requests")
        .update({ status: "failed" })
        .eq("id", requestId);
    }

    return errorState(getReadableAuthError(error.message));
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/account");

  return successState("Verification email sent. Please check your new email and click the confirmation link.");
}

export async function updateMemberProfileAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateUpdateProfileForm(formData);

  if (!validation.ok) {
    return errorState(validation.message, validation.fieldErrors);
  }

  const client = await getConfiguredSupabaseClient();

  if (!client.ok) {
    return client.state;
  }

  const {
    data: { user },
    error: userError,
  } = await client.supabase.auth.getUser();

  if (userError || !user) {
    return errorState("กรุณาเข้าสู่ระบบก่อนแก้ไขข้อมูลสมาชิก");
  }

  const fullName = `${validation.data.firstName} ${validation.data.lastName}`.trim();
  const { error } = await client.supabase
    .from("profiles")
    .update({
      first_name: validation.data.firstName,
      last_name: validation.data.lastName,
      full_name: fullName,
      nickname: validation.data.nickname,
      nationality: validation.data.nationality,
      phone_country: validation.data.phoneCountry,
      phone: validation.data.phone,
    })
    .eq("id", user.id);

  if (error) {
    return errorState("ยังไม่สามารถอัปเดตโปรไฟล์ได้ กรุณาตรวจสอบสิทธิ์ฐานข้อมูลแล้วลองใหม่");
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/account");

  return successState("บันทึกข้อมูลโปรไฟล์เรียบร้อย");
}

export async function logoutAction() {
  await clearLogoutCookiesOnServerAction();
  redirect("/?auth=signed-out");
}
