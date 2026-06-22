import { cache } from "react";
import { redirect } from "next/navigation";
import {
  getMemberProfileByUserId,
  getReadableMemberStatus,
  isActiveMemberStatus,
} from "@/lib/member/profile";
import { getServerAuthSessionPolicyStatus } from "@/lib/auth/session-policy-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getLoginRedirectPath(nextPath: string, sessionExpired = false) {
  const searchParams = new URLSearchParams({
    next: nextPath,
  });

  if (sessionExpired) {
    searchParams.set("session", "expired");
  }

  return `/login?${searchParams.toString()}`;
}

export const getAuthenticatedMember = cache(async (nextPath = "/dashboard") => {
  const sessionPolicy = await getServerAuthSessionPolicyStatus();

  if (sessionPolicy.state !== "active") {
    redirect(getLoginRedirectPath(nextPath, sessionPolicy.state !== "missing"));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(getLoginRedirectPath(nextPath));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(getLoginRedirectPath(nextPath));
  }

  const profile = await getMemberProfileByUserId(supabase, user.id);

  if (!profile) {
    redirect(`/signup?auth=google&next=${encodeURIComponent(nextPath)}`);
  }

  const email = profile.email || user.email || "Elite Gold Member";
  const memberName = profile.nickname || profile.firstName || profile.fullName || "Elite Gold Member";
  const memberStatus = getReadableMemberStatus(profile.status);
  const isMemberActive = isActiveMemberStatus(profile.status);

  return {
    email,
    isMemberActive,
    memberName,
    memberStatus,
    profile,
    user,
  };
});

export async function getActiveMemberOrRedirect(nextPath = "/dashboard") {
  const member = await getAuthenticatedMember(nextPath);

  if (!member.isMemberActive) {
    redirect("/dashboard/account?notice=verify_required");
  }

  return member;
}
