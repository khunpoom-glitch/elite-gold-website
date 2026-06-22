import "server-only";

import type { User } from "@supabase/supabase-js";
import {
  getMemberProfileByUserId,
  getReadableMemberStatus,
  isActiveMemberStatus,
} from "@/lib/member/profile";
import { getServerAuthSessionPolicyStatus } from "@/lib/auth/session-policy-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicSessionState = {
  isAuthenticated: boolean;
  memberName: string;
  memberNickname: string;
  memberEmail: string;
  memberAccessCode: string | null;
  memberAvatarUrl: string | null;
  memberStatus: string;
  primaryActionHref: string;
  primaryActionLabel: string;
  secondaryActionHref: string | null;
  secondaryActionLabel: string | null;
};

export const guestPublicSession: PublicSessionState = {
  isAuthenticated: false,
  memberName: "",
  memberNickname: "",
  memberEmail: "",
  memberAccessCode: null,
  memberAvatarUrl: null,
  memberStatus: "Guest",
  primaryActionHref: "/signup",
  primaryActionLabel: "Sign Up",
  secondaryActionHref: "/login",
  secondaryActionLabel: "Login",
};

function getUserDisplayName(email?: string) {
  return email?.trim() || "Elite Gold Member";
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

function getUserAvatarUrl(user: User) {
  return getUserMetadataString(user, ["avatar_url", "picture"]) || null;
}

export async function getPublicSessionState(): Promise<PublicSessionState> {
  const sessionPolicy = await getServerAuthSessionPolicyStatus();

  if (sessionPolicy.state !== "active") {
    return guestPublicSession;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return guestPublicSession;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return guestPublicSession;
  }

  try {
    const profile = await getMemberProfileByUserId(supabase, user.id);

    if (!profile) {
      return {
        isAuthenticated: true,
        memberName: getUserDisplayName(user.email),
        memberNickname: "",
        memberEmail: user.email ?? "",
        memberAccessCode: null,
        memberAvatarUrl: getUserAvatarUrl(user),
        memberStatus: "Complete Sign Up",
        primaryActionHref: "/signup?auth=google&next=%2Fdashboard",
        primaryActionLabel: "Complete Sign Up",
        secondaryActionHref: null,
        secondaryActionLabel: null,
      };
    }

    const isMemberActive = isActiveMemberStatus(profile.status);

    return {
      isAuthenticated: true,
      memberName:
        profile.fullName ||
        profile.firstName ||
        profile.nickname ||
        getUserDisplayName(user.email),
      memberNickname: profile.nickname,
      memberEmail: profile.email || user.email || "",
      memberAccessCode: profile.memberAccessCode,
      memberAvatarUrl: profile.avatarUrl || getUserAvatarUrl(user),
      memberStatus: getReadableMemberStatus(profile.status),
      primaryActionHref: isMemberActive
        ? "/dashboard"
        : "/dashboard/account?notice=verify_required",
      primaryActionLabel: isMemberActive ? "Dashboard" : "Verify Email",
      secondaryActionHref: "/dashboard/account",
      secondaryActionLabel: "My Profile",
    };
  } catch (profileError) {
    console.warn("[member] Failed to load public session profile.", profileError);

    return {
      isAuthenticated: true,
      memberName: getUserDisplayName(user.email),
      memberNickname: "",
      memberEmail: user.email ?? "",
      memberAccessCode: null,
      memberAvatarUrl: getUserAvatarUrl(user),
      memberStatus: "Signed In",
      primaryActionHref: "/dashboard",
      primaryActionLabel: "Dashboard",
      secondaryActionHref: "/dashboard/account",
      secondaryActionLabel: "My Profile",
    };
  }
}
