"use server";

import type { User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendGoogleSignupWelcomeEmail } from "@/lib/email/resend";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/auth/action-state";
import { getRequestOrigin } from "@/lib/auth/origin";
import {
  getSafeRedirectPath,
  validateForgotPasswordForm,
  validateLoginForm,
  validateSignupProfileForm,
  validateSignupForm,
  validateUpdatePasswordForm,
  validateUpdateProfileForm,
} from "@/lib/auth/validation";

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

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
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

function getUserEmailConfirmedAt(user: User) {
  return user.email_confirmed_at ?? user.confirmed_at ?? null;
}

function getMemberDisplayName(fields: { firstName?: string; fullName?: string; nickname?: string }) {
  return fields.nickname || fields.firstName || fields.fullName || "Elite Gold Member";
}

function getMemberAccessCode(row: unknown) {
  if (typeof row !== "object" || row === null) {
    return "";
  }

  const code =
    "member_access_code" in row
      ? row.member_access_code
      : "member_referral_code" in row
        ? row.member_referral_code
        : "";

  return typeof code === "string" ? code : "";
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
      ? "ไม่พบ Access Code สำหรับการสมัคร กรุณาตรวจสอบลิงก์สมัครอีกครั้ง"
      : "Access Code นี้ไม่ถูกต้องหรือยังไม่เปิดใช้งาน กรุณาตรวจสอบอีกครั้ง";

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
  const { data, error } = await supabase
    .rpc("resolve_elite_access_code", {
      input_code: accessCode,
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

  if (lowerMessage.includes("password")) {
    return "รหัสผ่านไม่ตรงตามเงื่อนไขของระบบ";
  }

  return "ระบบสมาชิกยังไม่สามารถดำเนินการได้ในตอนนี้ กรุณาลองใหม่อีกครั้ง";
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

  const client = await getConfiguredSupabaseClient();

  if (!client.ok) {
    return client.state;
  }

  const { error } = await client.supabase.auth.signInWithPassword(validation.data);

  if (error) {
    return errorState(getReadableAuthError(error.message));
  }

  revalidatePath("/", "layout");

  return successState(
    "เข้าสู่ระบบสำเร็จ กำลังพาไปยัง Member Dashboard",
    getSafeRedirectPath(getStringField(formData, "next")),
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

  const client = await getConfiguredSupabaseClient();

  if (!client.ok) {
    return client.state;
  }

  const nextPath = getSafeRedirectPath(getStringField(formData, "next"));
  const { password, ...profile } = validation.data;
  const accessCode = await resolveSignupAccessCode(client.supabase, profile.signupAccessCode);

  if (!accessCode.ok) {
    return accessCode.state;
  }

  const { error, data } = await client.supabase.auth.signUp({
    email: profile.email,
    password,
    options: {
      emailRedirectTo: await getAuthCallbackUrl(nextPath),
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

  revalidatePath("/", "layout");

  if (data.session) {
    return successState("สมัครสมาชิกสำเร็จ กำลังพาไปยัง Member Dashboard", nextPath);
  }

  return successState("สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี");
}

export async function completeGoogleSignupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateSignupProfileForm(formData);

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
    return errorState("กรุณา Sign Up with Google อีกครั้งก่อนบันทึกข้อมูลสมาชิก");
  }

  const userEmail = user.email?.toLowerCase();

  if (!userEmail || userEmail !== validation.data.email) {
    return errorState("อีเมลจาก Google ไม่ตรงกับฟอร์มสมัคร กรุณาเริ่ม Sign Up with Google ใหม่", {
      email: "อีเมลต้องตรงกับบัญชี Google ที่เชื่อมต่อ",
    });
  }

  const emailConfirmedAt = getUserEmailConfirmedAt(user);
  const fullName = `${validation.data.firstName} ${validation.data.lastName}`.trim();
  const accessCode = await resolveSignupAccessCode(client.supabase, validation.data.signupAccessCode);

  if (!accessCode.ok) {
    return accessCode.state;
  }

  const { data: insertedProfile, error } = await client.supabase
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
      status: emailConfirmedAt ? "active" : "pending_email_confirmation",
      email_confirmed_at: emailConfirmedAt,
    })
    .select("member_access_code, member_referral_code")
    .single();

  if (error) {
    if (error.code === "23505") {
      return successState("บัญชีนี้สมัครสมาชิกไว้แล้ว กำลังพาไปยัง Member Dashboard", "/dashboard");
    }

    return errorState("ยังไม่สามารถบันทึกข้อมูลสมาชิกได้ กรุณาตรวจสอบข้อมูลแล้วลองใหม่");
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");

  const dashboardUrl = new URL("/dashboard", await getRequestOrigin()).toString();
  await sendGoogleSignupWelcomeEmail({
    dashboardUrl,
    name: getMemberDisplayName({
      firstName: validation.data.firstName,
      fullName,
      nickname: validation.data.nickname,
    }),
    memberAccessCode: getMemberAccessCode(insertedProfile),
    to: userEmail,
  });

  return successState("บันทึกข้อมูลสมัครสำเร็จ กำลังพาไปยัง Member Dashboard", "/dashboard");
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateForgotPasswordForm(formData);

  if (!validation.ok) {
    return errorState(validation.message, validation.fieldErrors);
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

  return successState("ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบอีเมลของคุณ");
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

  const { error } = await client.supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    return errorState(getReadableAuthError(error.message));
  }

  revalidatePath("/", "layout");

  return successState("ตั้งรหัสผ่านใหม่เรียบร้อย", "/dashboard");
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
  const supabase = await createSupabaseServerClient();

  await supabase?.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
