import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { getServerAuthSessionPolicyStatus } from "@/lib/auth/session-policy-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  canManageAdmins,
  parseAdminUser,
  type AdminRole,
  type AdminUser,
} from "./roles";

function getLoginRedirectPath(nextPath: string, sessionExpired = false) {
  const searchParams = new URLSearchParams({
    next: nextPath,
  });

  if (sessionExpired) {
    searchParams.set("session", "expired");
  }

  return `/login?${searchParams.toString()}`;
}

export async function getAdminRoleByUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id,user_id,email,role,is_active,created_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return parseAdminUser(data);
}

export const getAuthenticatedAdmin = cache(async (nextPath = "/admin") => {
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

  const admin = await getAdminRoleByUserId(supabase, user.id);

  if (!admin) {
    notFound();
  }

  return {
    admin,
    isSuperAdmin: canManageAdmins(admin.role),
    role: admin.role as AdminRole,
    supabase,
    user: user as User,
  };
});

export async function getAuthenticatedSuperAdmin(nextPath = "/admin/users") {
  const adminSession = await getAuthenticatedAdmin(nextPath);

  if (!adminSession.isSuperAdmin) {
    notFound();
  }

  return adminSession;
}
