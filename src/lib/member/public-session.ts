import "server-only";

import {
  getMemberProfileByUserId,
  getReadableMemberStatus,
  isActiveMemberStatus,
} from "@/lib/member/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicSessionState = {
  isAuthenticated: boolean;
  memberName: string;
  memberStatus: string;
  primaryActionHref: string;
  primaryActionLabel: string;
  secondaryActionHref: string | null;
  secondaryActionLabel: string | null;
};

export const guestPublicSession: PublicSessionState = {
  isAuthenticated: false,
  memberName: "",
  memberStatus: "Guest",
  primaryActionHref: "/signup",
  primaryActionLabel: "Sign Up",
  secondaryActionHref: "/login",
  secondaryActionLabel: "Login",
};

function getUserDisplayName(email?: string) {
  return email?.trim() || "Elite Gold Member";
}

export async function getPublicSessionState(): Promise<PublicSessionState> {
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
        profile.nickname ||
        profile.firstName ||
        profile.fullName ||
        getUserDisplayName(user.email),
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
      memberStatus: "Signed In",
      primaryActionHref: "/dashboard",
      primaryActionLabel: "Dashboard",
      secondaryActionHref: "/dashboard/account",
      secondaryActionLabel: "My Profile",
    };
  }
}
