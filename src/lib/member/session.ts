import { cache } from "react";
import { redirect } from "next/navigation";
import { getMemberProfileByUserId, getReadableMemberStatus } from "@/lib/member/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getLoginRedirectPath(nextPath: string) {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export const getAuthenticatedMember = cache(async (nextPath = "/dashboard") => {
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

  return {
    email,
    memberName,
    memberStatus,
    profile,
    user,
  };
});
