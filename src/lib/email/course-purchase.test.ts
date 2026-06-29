import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCoursePurchaseApprovedEmail,
  buildCoursePurchaseRejectedEmail,
} from "./course-purchase.ts";

describe("course purchase decision emails", () => {
  it("builds an approved email with course, reference, and dashboard link", () => {
    const email = buildCoursePurchaseApprovedEmail({
      courseTitle: "Master Class",
      dashboardUrl: "https://elitegoldcommunity.com/dashboard/education",
      name: "Poom",
      referenceCode: "EG-MC-000123",
    });

    assert.equal(email.subject, "Master Class access approved");
    assert.match(email.text, /Hi Poom/);
    assert.match(email.text, /Master Class has been approved/);
    assert.match(email.text, /EG-MC-000123/);
    assert.match(email.text, /https:\/\/elitegoldcommunity\.com\/dashboard\/education/);
  });

  it("builds a rejected email with the review reason and resubmission link", () => {
    const email = buildCoursePurchaseRejectedEmail({
      courseTitle: "Master Class",
      dashboardUrl: "https://elitegoldcommunity.com/dashboard/education",
      name: "Poom",
      reason: "ยอดโอนไม่ตรงกับคำสั่งซื้อ",
      referenceCode: "EG-MC-000124",
    });

    assert.equal(email.subject, "Master Class transfer slip needs review");
    assert.match(email.text, /EG-MC-000124/);
    assert.match(email.text, /ยอดโอนไม่ตรงกับคำสั่งซื้อ/);
    assert.match(email.text, /upload a new slip/);
  });
});
