import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatMasterClassReference,
  getCoursePurchaseExpiry,
  getMasterClassCheckoutHref,
  getMasterClassCheckoutStage,
  getMasterClassPurchaseCta,
  getPurchaseStatusView,
  isCoursePurchaseStatus,
  parseMasterClassBuyerAttribution,
  parseMasterClassPurchase,
} from "./purchase.ts";

describe("master class purchase helpers", () => {
  it("formats Master Class reference codes with a stable prefix and padding", () => {
    assert.equal(formatMasterClassReference(1), "EG-MC-000001");
    assert.equal(formatMasterClassReference(123), "EG-MC-000123");
  });

  it("recognizes only supported manual purchase statuses", () => {
    assert.equal(isCoursePurchaseStatus("payment_started"), false);
    assert.equal(isCoursePurchaseStatus("pending_review"), true);
    assert.equal(isCoursePurchaseStatus("approved"), true);
    assert.equal(isCoursePurchaseStatus("rejected"), true);
    assert.equal(isCoursePurchaseStatus("cancelled"), false);
    assert.equal(isCoursePurchaseStatus(""), false);
  });

  it("maps empty purchase state to locked buy CTA", () => {
    const view = getPurchaseStatusView(null);
    const cta = getMasterClassPurchaseCta(null);

    assert.equal(view.label, "Locked");
    assert.equal(view.tone, "neutral");
    assert.deepEqual(cta, {
      action: "start_purchase",
      disabled: false,
      label: "Buy Master Class",
    });
  });

  it("builds a direct checkout modal href for the Master Class buy action", () => {
    assert.equal(getMasterClassCheckoutHref(), "/dashboard/education?checkout=1");
  });

  it("maps pending review state to a disabled review CTA", () => {
    const view = getPurchaseStatusView("pending_review");
    const cta = getMasterClassPurchaseCta("pending_review");

    assert.equal(view.label, "Pending Review");
    assert.equal(view.tone, "warning");
    assert.deepEqual(cta, {
      action: "wait_for_review",
      disabled: true,
      label: "Waiting for approval",
    });
  });

  it("maps approved state to learning access", () => {
    const view = getPurchaseStatusView("approved");
    const cta = getMasterClassPurchaseCta("approved");

    assert.equal(view.label, "Unlocked");
    assert.equal(view.tone, "success");
    assert.deepEqual(cta, {
      action: "start_learning",
      disabled: false,
      label: "Start Learning",
    });
  });

  it("maps purchase statuses to checkout modal stages", () => {
    assert.equal(getMasterClassCheckoutStage(null), "start_purchase");
    assert.equal(getMasterClassCheckoutStage("pending_review"), "receipt_received");
    assert.equal(getMasterClassCheckoutStage("rejected"), "resubmission");
    assert.equal(getMasterClassCheckoutStage("approved"), "learning");
  });

  it("sets the rejected resubmission expiry without expiring review or approved history", () => {
    const now = new Date("2026-06-30T00:00:00.000Z");

    assert.equal(getCoursePurchaseExpiry("rejected", now)?.toISOString(), "2026-07-14T00:00:00.000Z");
    assert.equal(getCoursePurchaseExpiry("approved", now), null);
    assert.equal(getCoursePurchaseExpiry("pending_review", now), null);
  });

  it("parses Master Class purchase rows from Supabase", () => {
    const parsed = parseMasterClassPurchase({
      amount_thb: 12900,
      archived_at: null,
      created_at: "2026-06-29T00:00:00Z",
      expires_at: "2026-07-01T00:00:00Z",
      id: "purchase-id",
      reference_code: "EG-MC-000123",
      review_reason: null,
      slip_file_name: "slip.png",
      slip_storage_path: "member-id/slip.png",
      status: "pending_review",
      submitted_at: "2026-06-29T01:00:00Z",
      updated_at: "2026-06-29T02:00:00Z",
    });

    assert.deepEqual(parsed, {
      amountThb: 12900,
      archivedAt: null,
      createdAt: "2026-06-29T00:00:00Z",
      expiresAt: "2026-07-01T00:00:00Z",
      id: "purchase-id",
      referenceCode: "EG-MC-000123",
      reviewReason: null,
      slipFileName: "slip.png",
      slipStoragePath: "member-id/slip.png",
      status: "pending_review",
      submittedAt: "2026-06-29T01:00:00Z",
      updatedAt: "2026-06-29T02:00:00Z",
    });
  });

  it("parses buyer and sponsor access codes for admin commission review", () => {
    assert.deepEqual(
      parseMasterClassBuyerAttribution({
        member_access_code: "EG002",
        signup_access_code: "EG001",
        signup_access_owner_code: "EG001",
      }),
      {
        buyerAccessCode: "EG002",
        commissionOwnerAccessCode: "EG001",
        sponsorAccessCode: "EG001",
      },
    );

    assert.deepEqual(
      parseMasterClassBuyerAttribution({
        member_access_code: "EG002",
        signup_access_code: "EG000",
        signup_access_owner_code: null,
      }),
      {
        buyerAccessCode: "EG002",
        commissionOwnerAccessCode: null,
        sponsorAccessCode: "EG000",
      },
    );
  });
});
