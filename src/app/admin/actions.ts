"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { masterClassCourse } from "@/config/education";
import { siteConfig } from "@/config/site";
import { getAuthenticatedAdmin } from "@/lib/admin/session";
import { getCoursePurchaseExpiry, parseMasterClassPurchase } from "@/lib/education/purchase";
import {
  sendCoursePurchaseApprovedEmail,
  sendCoursePurchaseRejectedEmail,
} from "@/lib/email/resend";

const adminPath = "/admin";
const educationPath = "/dashboard/education";

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function redirectWithNotice(notice: string): never {
  redirect(`${adminPath}?notice=${encodeURIComponent(notice)}`);
}

function getEducationUrl() {
  return new URL(educationPath, siteConfig.url).toString();
}

export async function approveMasterClassPurchaseAction(formData: FormData) {
  const { supabase, user } = await getAuthenticatedAdmin(adminPath);
  const purchaseId = getStringField(formData, "purchaseId");

  if (!purchaseId) {
    redirectWithNotice("missing_purchase");
  }

  const { data, error: readError } = await supabase
    .from("course_purchase_requests")
    .select("id,reference_code,amount_thb,status,slip_storage_path,slip_file_name,submitted_at,review_reason,created_at,updated_at,member_id,member_email,member_name")
    .eq("id", purchaseId)
    .eq("course_slug", masterClassCourse.slug)
    .maybeSingle();

  if (readError) {
    console.error("[admin] Failed to read purchase before approval.", readError);
    redirectWithNotice("review_error");
  }

  const purchase = parseMasterClassPurchase(data);
  const memberId = data && typeof data.member_id === "string" ? data.member_id : "";
  const memberEmail = data && typeof data.member_email === "string" ? data.member_email : "";
  const memberName = data && typeof data.member_name === "string" ? data.member_name : "";

  if (!purchase || purchase.status !== "pending_review" || !memberId) {
    redirectWithNotice("invalid_purchase_state");
  }

  const reviewedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("course_purchase_requests")
    .update({
      expires_at: null,
      review_reason: null,
      reviewed_at: reviewedAt,
      reviewed_by: user.id,
      status: "approved",
    })
    .eq("id", purchase.id);

  if (updateError) {
    console.error("[admin] Failed to approve purchase.", updateError);
    redirectWithNotice("review_error");
  }

  const { error: entitlementError } = await supabase
    .from("course_entitlements")
    .upsert({
      course_slug: masterClassCourse.slug,
      granted_at: reviewedAt,
      granted_by: user.id,
      member_id: memberId,
      purchase_request_id: purchase.id,
    }, {
      onConflict: "member_id,course_slug",
    });

  if (entitlementError) {
    console.error("[admin] Failed to grant Master Class entitlement.", entitlementError);
    redirectWithNotice("review_error");
  }

  await supabase
    .from("course_purchase_admin_events")
    .insert({
      actor_id: user.id,
      event_type: "purchase_approved",
      metadata: {
        referenceCode: purchase.referenceCode,
      },
      purchase_request_id: purchase.id,
      target_user_id: memberId,
    });

  if (memberEmail) {
    await sendCoursePurchaseApprovedEmail({
      courseTitle: masterClassCourse.title,
      dashboardUrl: getEducationUrl(),
      name: memberName,
      referenceCode: purchase.referenceCode,
      to: memberEmail,
    });
  }

  revalidatePath(adminPath);
  revalidatePath(educationPath);
  redirectWithNotice("approved");
}

export async function rejectMasterClassPurchaseAction(formData: FormData) {
  const { supabase, user } = await getAuthenticatedAdmin(adminPath);
  const purchaseId = getStringField(formData, "purchaseId");
  const reason = getStringField(formData, "reason");

  if (!purchaseId) {
    redirectWithNotice("missing_purchase");
  }

  if (!reason) {
    redirectWithNotice("reject_reason_required");
  }

  const { data, error: readError } = await supabase
    .from("course_purchase_requests")
    .select("id,reference_code,amount_thb,status,slip_storage_path,slip_file_name,submitted_at,review_reason,created_at,updated_at,member_id,member_email,member_name")
    .eq("id", purchaseId)
    .eq("course_slug", masterClassCourse.slug)
    .maybeSingle();

  if (readError) {
    console.error("[admin] Failed to read purchase before rejection.", readError);
    redirectWithNotice("review_error");
  }

  const purchase = parseMasterClassPurchase(data);
  const memberId = data && typeof data.member_id === "string" ? data.member_id : "";
  const memberEmail = data && typeof data.member_email === "string" ? data.member_email : "";
  const memberName = data && typeof data.member_name === "string" ? data.member_name : "";

  if (!purchase || purchase.status !== "pending_review" || !memberId) {
    redirectWithNotice("invalid_purchase_state");
  }

  const reviewedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("course_purchase_requests")
    .update({
      expires_at: getCoursePurchaseExpiry("rejected", new Date(reviewedAt))?.toISOString() ?? null,
      review_reason: reason,
      reviewed_at: reviewedAt,
      reviewed_by: user.id,
      status: "rejected",
    })
    .eq("id", purchase.id);

  if (updateError) {
    console.error("[admin] Failed to reject purchase.", updateError);
    redirectWithNotice("review_error");
  }

  await supabase
    .from("course_purchase_admin_events")
    .insert({
      actor_id: user.id,
      event_type: "purchase_rejected",
      metadata: {
        reason,
        referenceCode: purchase.referenceCode,
      },
      purchase_request_id: purchase.id,
      target_user_id: memberId,
    });

  if (memberEmail) {
    await sendCoursePurchaseRejectedEmail({
      courseTitle: masterClassCourse.title,
      dashboardUrl: getEducationUrl(),
      name: memberName,
      reason,
      referenceCode: purchase.referenceCode,
      to: memberEmail,
    });
  }

  revalidatePath(adminPath);
  revalidatePath(educationPath);
  redirectWithNotice("rejected");
}
