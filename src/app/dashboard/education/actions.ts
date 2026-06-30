"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { masterClassCourse } from "@/config/education";
import { parseMasterClassPurchase } from "@/lib/education/purchase";
import { getActiveMemberOrRedirect } from "@/lib/member/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const educationPath = "/dashboard/education";
const slipBucket = "course-payment-slips";
const maxSlipSizeBytes = 5 * 1024 * 1024;
const maxTransferNoteLength = 280;
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
  redirect(`${educationPath}?checkout=1&notice=${encodeURIComponent(notice)}`);
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

async function cleanupExpiredCoursePurchases(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
) {
  const { error } = await supabase.rpc("cleanup_expired_course_purchase_requests");

  if (error) {
    console.error("[education] Failed to archive expired Master Class purchases.", error);
  }
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

  if (!(slip instanceof File) || slip.size === 0) {
    redirectWithNotice("slip_required");
  }

  if (!allowedSlipMimeTypes.has(slip.type)) {
    redirectWithNotice("slip_invalid_type");
  }

  if (slip.size > maxSlipSizeBytes) {
    redirectWithNotice("slip_too_large");
  }

  await cleanupExpiredCoursePurchases(supabase);

  const safeFileName = getSafeFileName(slip.name);
  const submittedAt = new Date().toISOString();
  const boundedTransferNote = transferNote.slice(0, maxTransferNoteLength);

  if (!purchaseId) {
    const [{ data: existingPurchase, error: existingError }, { data: entitlement, error: entitlementError }] =
      await Promise.all([
        supabase
          .from("course_purchase_requests")
          .select("id,status")
          .eq("member_id", profile.id)
          .eq("course_slug", masterClassCourse.slug)
          .is("archived_at", null)
          .maybeSingle(),
        supabase
          .from("course_entitlements")
          .select("id")
          .eq("member_id", profile.id)
          .eq("course_slug", masterClassCourse.slug)
          .maybeSingle(),
      ]);

    if (existingError) {
      console.error("[education] Failed to read existing Master Class purchase before slip submission.", existingError);
      redirectWithNotice("slip_error");
    }

    if (entitlementError) {
      console.error("[education] Failed to read Master Class entitlement before slip submission.", entitlementError);
      redirectWithNotice("slip_error");
    }

    if (entitlement) {
      redirectWithNotice("course_unlocked");
    }

    if (existingPurchase) {
      redirectWithNotice("purchase_existing");
    }

    const requestId = randomUUID();
    const storagePath = `${profile.id}/${requestId}-${Date.now()}-${safeFileName}`;
    const { error: uploadError } = await supabase.storage
      .from(slipBucket)
      .upload(storagePath, slip, {
        contentType: slip.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[education] Failed to upload new Master Class transfer slip.", uploadError);
      redirectWithNotice("slip_error");
    }

    const { error: insertError } = await supabase
      .from("course_purchase_requests")
      .insert({
        amount_thb: masterClassCourse.priceThb,
        course_slug: masterClassCourse.slug,
        id: requestId,
        member_email: profile.email,
        member_id: profile.id,
        member_name: getMemberName(profile),
        review_reason: null,
        reviewed_at: null,
        reviewed_by: null,
        slip_file_name: slip.name.slice(0, 160),
        slip_storage_path: storagePath,
        status: "pending_review",
        submitted_at: submittedAt,
        transfer_note: boundedTransferNote || null,
      });

    if (insertError) {
      await supabase.storage.from(slipBucket).remove([storagePath]);
      console.error("[education] Failed to create Master Class purchase request after slip upload.", insertError);
      redirectWithNotice("slip_error");
    }

    revalidatePath(educationPath);
    redirectWithNotice("slip_submitted");
  }

  const { data, error: purchaseError } = await supabase
    .from("course_purchase_requests")
    .select("id,reference_code,amount_thb,status,slip_storage_path,slip_file_name,submitted_at,review_reason,created_at,updated_at,expires_at,archived_at")
    .eq("id", purchaseId)
    .eq("member_id", profile.id)
    .eq("course_slug", masterClassCourse.slug)
    .is("archived_at", null)
    .maybeSingle();

  if (purchaseError) {
    console.error("[education] Failed to read Master Class purchase before slip upload.", purchaseError);
    redirectWithNotice("slip_error");
  }

  const purchase = parseMasterClassPurchase(data);

  if (!purchase || purchase.status !== "rejected") {
    redirectWithNotice("purchase_locked");
  }

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
      expires_at: null,
      review_reason: null,
      reviewed_at: null,
      reviewed_by: null,
      slip_file_name: slip.name.slice(0, 160),
      slip_storage_path: storagePath,
      status: "pending_review",
      submitted_at: submittedAt,
      transfer_note: boundedTransferNote || null,
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
