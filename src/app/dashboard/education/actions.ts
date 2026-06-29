"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { masterClassCourse } from "@/config/education";
import { parseMasterClassPurchase } from "@/lib/education/purchase";
import { getActiveMemberOrRedirect } from "@/lib/member/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const educationPath = "/dashboard/education";
const slipBucket = "course-payment-slips";
const maxSlipSizeBytes = 5 * 1024 * 1024;
const allowedSlipMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function redirectWithNotice(notice: string): never {
  redirect(`${educationPath}?notice=${encodeURIComponent(notice)}`);
}

function getMemberName(profile: Awaited<ReturnType<typeof getActiveMemberOrRedirect>>["profile"]) {
  return profile.nickname || profile.firstName || profile.fullName || "Elite Gold Member";
}

function getSafeFileName(name: string) {
  const safeName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeName || "transfer-slip";
}

export async function startMasterClassPurchaseAction() {
  const { profile } = await getActiveMemberOrRedirect(educationPath);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWithNotice("purchase_error");
  }

  const { data: existingPurchase, error: existingError } = await supabase
    .from("course_purchase_requests")
    .select("id,status")
    .eq("member_id", profile.id)
    .eq("course_slug", masterClassCourse.slug)
    .maybeSingle();

  if (existingError) {
    console.error("[education] Failed to read existing Master Class purchase.", existingError);
    redirectWithNotice("purchase_error");
  }

  if (existingPurchase) {
    redirectWithNotice("purchase_existing");
  }

  const { error } = await supabase
    .from("course_purchase_requests")
    .insert({
      amount_thb: masterClassCourse.priceThb,
      course_slug: masterClassCourse.slug,
      member_email: profile.email,
      member_id: profile.id,
      member_name: getMemberName(profile),
      status: "payment_started",
    });

  if (error) {
    console.error("[education] Failed to start Master Class purchase.", error);
    redirectWithNotice("purchase_error");
  }

  revalidatePath(educationPath);
  redirectWithNotice("purchase_started");
}

export async function uploadMasterClassSlipAction(formData: FormData) {
  const { profile } = await getActiveMemberOrRedirect(educationPath);
  const supabase = await createSupabaseServerClient();
  const purchaseId = getStringField(formData, "purchaseId");
  const transferNote = getStringField(formData, "transferNote");
  const slip = formData.get("slip");

  if (!supabase) {
    redirectWithNotice("slip_error");
  }

  if (!purchaseId) {
    redirectWithNotice("purchase_error");
  }

  if (!(slip instanceof File) || slip.size === 0) {
    redirectWithNotice("slip_required");
  }

  if (!allowedSlipMimeTypes.has(slip.type)) {
    redirectWithNotice("slip_invalid_type");
  }

  if (slip.size > maxSlipSizeBytes) {
    redirectWithNotice("slip_too_large");
  }

  const { data, error: purchaseError } = await supabase
    .from("course_purchase_requests")
    .select("id,status")
    .eq("id", purchaseId)
    .eq("member_id", profile.id)
    .eq("course_slug", masterClassCourse.slug)
    .maybeSingle();

  if (purchaseError) {
    console.error("[education] Failed to read Master Class purchase before slip upload.", purchaseError);
    redirectWithNotice("slip_error");
  }

  const purchase = parseMasterClassPurchase(data);

  if (!purchase || !["payment_started", "rejected"].includes(purchase.status)) {
    redirectWithNotice("purchase_locked");
  }

  const safeFileName = getSafeFileName(slip.name);
  const storagePath = `${profile.id}/${purchase.id}-${Date.now()}-${safeFileName}`;
  const { error: uploadError } = await supabase.storage
    .from(slipBucket)
    .upload(storagePath, slip, {
      contentType: slip.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[education] Failed to upload Master Class transfer slip.", uploadError);
    redirectWithNotice("slip_error");
  }

  const { error: updateError } = await supabase
    .from("course_purchase_requests")
    .update({
      review_reason: null,
      reviewed_at: null,
      reviewed_by: null,
      slip_file_name: slip.name.slice(0, 160),
      slip_storage_path: storagePath,
      status: "pending_review",
      submitted_at: new Date().toISOString(),
      transfer_note: transferNote || null,
    })
    .eq("id", purchase.id)
    .eq("member_id", profile.id);

  if (updateError) {
    console.error("[education] Failed to submit Master Class transfer slip.", updateError);
    redirectWithNotice("slip_error");
  }

  revalidatePath(educationPath);
  redirectWithNotice("slip_submitted");
}
