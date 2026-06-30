"use server";

import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/admin/session";
import {
  adminVerificationPath,
  getSafeAdminNextPath,
  issueAdminVerificationChallenge,
  normalizeAdminVerificationCode,
  verifyAdminVerificationChallenge,
} from "@/lib/admin/verification";

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function redirectToVerify(nextPath: string, notice: string): never {
  const searchParams = new URLSearchParams({
    next: getSafeAdminNextPath(nextPath),
    notice,
  });

  redirect(`${adminVerificationPath}?${searchParams.toString()}`);
}

export async function verifyAdminCodeAction(formData: FormData) {
  const nextPath = getSafeAdminNextPath(getStringField(formData, "next"));
  const { admin, supabase, user } = await getAuthenticatedAdmin(adminVerificationPath);
  const code = normalizeAdminVerificationCode(formData.get("code"));
  const challengeId = getStringField(formData, "challengeId");
  const codeSalt = getStringField(formData, "codeSalt");
  const result = await verifyAdminVerificationChallenge({
    admin,
    challengeId,
    code,
    codeSalt,
    supabase,
    user,
  });

  if (result.ok) {
    redirect(nextPath);
  }

  redirectToVerify(nextPath, result.reason);
}

export async function resendAdminVerificationCodeAction(formData: FormData) {
  const nextPath = getSafeAdminNextPath(getStringField(formData, "next"));
  const { admin, supabase, user } = await getAuthenticatedAdmin(adminVerificationPath);
  const result = await issueAdminVerificationChallenge({
    admin,
    forceNew: true,
    supabase,
    user,
  });

  if (result.ok) {
    redirectToVerify(nextPath, result.state === "sent" ? "sent" : result.state);
  }

  redirectToVerify(nextPath, result.reason);
}
