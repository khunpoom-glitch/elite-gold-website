import type { SupabaseClient, User } from "@supabase/supabase-js";

export type MemberStatus = "pending_email_confirmation" | "active";
export type SignupProvider = "email" | "google";

export type MemberProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nickname: string;
  nationality: string;
  phoneCountry: string;
  phone: string;
  signupAccessCode: string;
  memberAccessCode: string;
  avatarUrl: string | null;
  signupProvider: SignupProvider;
  status: MemberStatus;
  emailConfirmedAt: string | null;
};

export type GoogleSignupProfile = {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string | null;
};

export type PendingEmailChangeRequest = {
  newEmail: string;
  requestedAt: string;
};

export const memberProfileSelect = [
  "id",
  "email",
  "first_name",
  "last_name",
  "full_name",
  "nickname",
  "nationality",
  "phone_country",
  "phone",
  "signup_access_code",
  "member_access_code",
  "signup_referral_code",
  "member_referral_code",
  "avatar_url",
  "signup_provider",
  "status",
  "email_confirmed_at",
].join(",");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNullableString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getMetadataString(metadata: User["user_metadata"] | undefined, keys: string[]) {
  if (!metadata) {
    return "";
  }

  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function parseMemberProfile(row: unknown): MemberProfile | null {
  if (!isRecord(row)) {
    return null;
  }

  const status = getString(row.status);
  const signupProvider = getString(row.signup_provider);

  if (
    status !== "pending_email_confirmation" &&
    status !== "active"
  ) {
    return null;
  }

  if (signupProvider !== "email" && signupProvider !== "google") {
    return null;
  }

  return {
    id: getString(row.id),
    email: getString(row.email),
    firstName: getString(row.first_name),
    lastName: getString(row.last_name),
    fullName: getString(row.full_name),
    nickname: getString(row.nickname),
    nationality: getString(row.nationality),
    phoneCountry: getString(row.phone_country),
    phone: getString(row.phone),
    signupAccessCode: getString(row.signup_access_code) || getString(row.signup_referral_code),
    memberAccessCode:
      getString(row.member_access_code) ||
      getString(row.member_referral_code) ||
      getString(row.signup_access_code) ||
      getString(row.signup_referral_code),
    avatarUrl: getNullableString(row.avatar_url),
    signupProvider,
    status,
    emailConfirmedAt: getNullableString(row.email_confirmed_at),
  };
}

export async function getMemberProfileByUserId(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select(memberProfileSelect)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return parseMemberProfile(data);
}

export async function getPendingEmailChangeRequest(
  supabase: SupabaseClient,
  userId: string,
): Promise<PendingEmailChangeRequest | null> {
  const { data, error } = await supabase
    .from("profile_email_change_requests")
    .select("new_email, requested_at")
    .eq("profile_id", userId)
    .eq("status", "pending")
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!isRecord(data)) {
    return null;
  }

  return {
    newEmail: getString(data.new_email),
    requestedAt: getString(data.requested_at),
  };
}

export function getGoogleSignupProfileFromUser(user: User): GoogleSignupProfile {
  const fullName = getMetadataString(user.user_metadata, [
    "full_name",
    "name",
  ]);
  const splitName = splitFullName(fullName);
  const firstName =
    getMetadataString(user.user_metadata, ["given_name", "first_name"]) ??
    splitName.firstName;
  const lastName =
    getMetadataString(user.user_metadata, ["family_name", "last_name"]) ??
    splitName.lastName;

  return {
    email: user.email ?? getMetadataString(user.user_metadata, ["email"]),
    firstName: firstName || splitName.firstName,
    lastName: lastName || splitName.lastName,
    fullName: fullName || `${firstName || splitName.firstName} ${lastName || splitName.lastName}`.trim(),
    avatarUrl: getMetadataString(user.user_metadata, [
      "avatar_url",
      "picture",
    ]) || null,
  };
}

export function getReadableMemberStatus(status: MemberStatus) {
  if (status === "active") {
    return "Active";
  }

  return "Pending Email Verification";
}

export function isActiveMemberStatus(status: MemberStatus) {
  return status === "active";
}
