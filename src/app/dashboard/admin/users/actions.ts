"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getVerifiedSuperAdmin } from "@/lib/admin/session";
import { isAdminRole } from "@/lib/admin/roles";
import { adminDashboardPath } from "@/lib/admin/verification";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const adminUsersPath = `${adminDashboardPath}/users`;

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function redirectWithNotice(notice: string): never {
  redirect(`${adminUsersPath}?notice=${encodeURIComponent(notice)}`);
}

async function findAuthUserByEmail(email: string) {
  const supabaseAdmin = createSupabaseAdminClient();

  if (!supabaseAdmin) {
    return {
      error: "config" as const,
      user: null,
    };
  }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    console.error("[admin] Failed to list users for admin role assignment.", error);

    return {
      error: "lookup" as const,
      user: null,
    };
  }

  const user = data.users.find((item) => item.email?.trim().toLowerCase() === email);

  return {
    error: null,
    user: user ?? null,
  };
}

export async function addAdminUserAction(formData: FormData) {
  const { supabase, user } = await getVerifiedSuperAdmin(adminUsersPath);
  const email = getStringField(formData, "email").toLowerCase();
  const role = getStringField(formData, "role");

  if (!email || !email.includes("@")) {
    redirectWithNotice("invalid_email");
  }

  if (!isAdminRole(role)) {
    redirectWithNotice("invalid_role");
  }

  const lookup = await findAuthUserByEmail(email);

  if (lookup.error === "config") {
    redirectWithNotice("admin_config_error");
  }

  if (lookup.error || !lookup.user?.id || !lookup.user.email) {
    redirectWithNotice("user_not_found");
  }

  const { error } = await supabase
    .from("admin_users")
    .upsert({
      created_by: user.id,
      deactivated_at: null,
      deactivated_by: null,
      email: lookup.user.email.toLowerCase(),
      is_active: true,
      role,
      user_id: lookup.user.id,
    }, {
      onConflict: "user_id",
    });

  if (error) {
    console.error("[admin] Failed to add admin user.", error);
    redirectWithNotice("save_error");
  }

  await supabase
    .from("course_purchase_admin_events")
    .insert({
      actor_id: user.id,
      event_type: "admin_added",
      metadata: {
        email: lookup.user.email.toLowerCase(),
        role,
      },
      target_user_id: lookup.user.id,
    });

  revalidatePath(adminUsersPath);
  redirectWithNotice("admin_added");
}

export async function deactivateAdminUserAction(formData: FormData) {
  const { supabase, user } = await getVerifiedSuperAdmin(adminUsersPath);
  const adminUserId = getStringField(formData, "adminUserId");
  const targetUserId = getStringField(formData, "targetUserId");

  if (!adminUserId || !targetUserId) {
    redirectWithNotice("missing_admin_user");
  }

  if (targetUserId === user.id) {
    redirectWithNotice("cannot_deactivate_self");
  }

  const { data: target, error: readError } = await supabase
    .from("admin_users")
    .select("id,user_id,email,role")
    .eq("id", adminUserId)
    .eq("is_active", true)
    .maybeSingle();

  if (readError) {
    console.error("[admin] Failed to read admin user before deactivation.", readError);
    redirectWithNotice("save_error");
  }

  if (!target || target.user_id !== targetUserId) {
    redirectWithNotice("missing_admin_user");
  }

  const { error } = await supabase
    .from("admin_users")
    .update({
      deactivated_at: new Date().toISOString(),
      deactivated_by: user.id,
      is_active: false,
    })
    .eq("id", adminUserId);

  if (error) {
    console.error("[admin] Failed to deactivate admin user.", error);
    redirectWithNotice("save_error");
  }

  await supabase
    .from("course_purchase_admin_events")
    .insert({
      actor_id: user.id,
      event_type: "admin_deactivated",
      metadata: {
        email: target.email,
        role: target.role,
      },
      target_user_id: targetUserId,
    });

  revalidatePath(adminUsersPath);
  redirectWithNotice("admin_deactivated");
}
