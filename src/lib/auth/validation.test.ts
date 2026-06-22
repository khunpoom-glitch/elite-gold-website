import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createAuthSessionPolicyValue,
  getAuthSessionDurationSeconds,
  getAuthSessionPolicyStatus,
  rememberedSessionDurationSeconds,
  standardSessionDurationSeconds,
} from "./session-policy.ts";
import { addAuthNoticeToRedirectPath } from "./redirect-notice.ts";
import {
  authBotProtectionFieldNames,
  getAuthBotProtectionError,
  getAuthRedirectUrl,
  getEmailOtpType,
  validateEmailChangeForm,
  validateForgotPasswordForm,
  validateLoginForm,
  validateSignupForm,
  validateUpdatePasswordForm,
  validateUpdateProfileForm,
} from "./validation.ts";

function formDataFromEntries(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("auth form validation", () => {
  it("rejects bot-trap submissions", () => {
    const formData = formDataFromEntries({
      email: "member@elitegold.com",
      password: "secret-password",
      [authBotProtectionFieldNames.website]: "https://spam.example",
    });

    const result = validateLoginForm(formData);

    assert.equal(result.ok, false);
  });

  it("rejects submissions that arrive too quickly", () => {
    const formData = formDataFromEntries({
      [authBotProtectionFieldNames.startedAt]: "1000",
    });

    assert.equal(getAuthBotProtectionError(formData, 1200), "Please wait a moment and try again.");
  });

  it("normalizes valid login credentials", () => {
    const result = validateLoginForm(
      formDataFromEntries({
        email: "  Member@EliteGold.com  ",
        password: "secret-password",
      }),
    );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.deepEqual(result.data, {
        email: "member@elitegold.com",
        password: "secret-password",
        remember: false,
      });
    }
  });

  it("normalizes remembered login credentials", () => {
    const result = validateLoginForm(
      formDataFromEntries({
        email: "member@elitegold.com",
        password: "secret-password",
        remember: "on",
      }),
    );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(result.data.remember, true);
    }
  });

  it("rejects signup when passwords do not match", () => {
    const result = validateSignupForm(
      formDataFromEntries({
        nationality: "TH",
        firstName: "Poom",
        lastName: "Elite",
        nickname: "Poom",
        phoneCountry: "TH",
        phone: "0812345678",
        email: "member@elitegold.com",
        password: "secret-password",
        confirmPassword: "different-password",
        signupAccessCode: "eg123",
      }),
    );

    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.match(result.message, /ต้องตรงกัน/);
    }
  });

  it("normalizes signup data and signup access code", () => {
    const result = validateSignupForm(
      formDataFromEntries({
        nationality: "TH",
        firstName: "  Poom  ",
        lastName: " Elite ",
        nickname: " P ",
        phoneCountry: "TH",
        phone: " 0812345678 ",
        email: " Member@EliteGold.com ",
        password: "secret-password",
        confirmPassword: "secret-password",
        signupAccessCode: " eg123 ",
      }),
    );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.deepEqual(result.data, {
        nationality: "TH",
        firstName: "Poom",
        lastName: "Elite",
        nickname: "P",
        phoneCountry: "TH",
        phone: "0812345678",
        email: "member@elitegold.com",
        password: "secret-password",
        signupAccessCode: "EG123",
      });
    }
  });

  it("leaves blank signup access code for server-side bootstrap resolution", () => {
    const result = validateSignupForm(
      formDataFromEntries({
        nationality: "TH",
        firstName: "Poom",
        lastName: "Elite",
        nickname: "P",
        phoneCountry: "TH",
        phone: "0812345678",
        email: "member@elitegold.com",
        password: "secret-password",
        confirmPassword: "secret-password",
      }),
    );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(result.data.signupAccessCode, "");
    }
  });

  it("requires a valid forgot-password email", () => {
    const result = validateForgotPasswordForm(
      formDataFromEntries({
        email: "not-an-email",
      }),
    );

    assert.equal(result.ok, false);
  });

  it("accepts a matching replacement password", () => {
    const result = validateUpdatePasswordForm(
      formDataFromEntries({
        password: "new-secret-password",
        confirmPassword: "new-secret-password",
      }),
    );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.deepEqual(result.data, {
        password: "new-secret-password",
      });
    }
  });

  it("normalizes email change requests", () => {
    const result = validateEmailChangeForm(
      formDataFromEntries({
        email: " New.Member@EliteGold.com ",
      }),
    );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.deepEqual(result.data, {
        email: "new.member@elitegold.com",
      });
    }
  });

  it("rejects invalid email change requests", () => {
    const result = validateEmailChangeForm(
      formDataFromEntries({
        email: "not-an-email",
      }),
    );

    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(result.fieldErrors?.email, "กรุณากรอกอีเมลใหม่ให้ถูกต้อง");
    }
  });

  it("normalizes editable member profile data", () => {
    const result = validateUpdateProfileForm(
      formDataFromEntries({
        nationality: " TH ",
        firstName: " Poom ",
        lastName: " Elite ",
        nickname: " Gold ",
        phoneCountry: " TH ",
        phone: " 0812345678 ",
      }),
    );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.deepEqual(result.data, {
        nationality: "TH",
        firstName: "Poom",
        lastName: "Elite",
        nickname: "Gold",
        phoneCountry: "TH",
        phone: "0812345678",
      });
    }
  });

  it("rejects incomplete member profile updates", () => {
    const result = validateUpdateProfileForm(
      formDataFromEntries({
        nationality: "TH",
        firstName: "",
        lastName: "Elite",
        nickname: "Gold",
        phoneCountry: "TH",
        phone: "0812345678",
      }),
    );

    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(result.fieldErrors?.firstName, "กรุณากรอก First Name");
    }
  });
});

describe("auth session policy", () => {
  it("uses 4 hours for standard sessions and 30 days for remembered sessions", () => {
    assert.equal(getAuthSessionDurationSeconds("standard"), standardSessionDurationSeconds);
    assert.equal(getAuthSessionDurationSeconds("remembered"), rememberedSessionDurationSeconds);
    assert.equal(standardSessionDurationSeconds, 4 * 60 * 60);
    assert.equal(rememberedSessionDurationSeconds, 30 * 24 * 60 * 60);
  });

  it("expires standard session policies after their deadline", () => {
    const now = 1_000;
    const value = createAuthSessionPolicyValue("standard", now);
    const active = getAuthSessionPolicyStatus(value, now + standardSessionDurationSeconds * 1000 - 1);
    const expired = getAuthSessionPolicyStatus(value, now + standardSessionDurationSeconds * 1000);

    assert.equal(active.state, "active");
    assert.equal(expired.state, "expired");
  });
});

describe("auth redirect URLs", () => {
  it("keeps same-origin relative redirect paths", () => {
    assert.equal(
      getAuthRedirectUrl("https://elitegold.example", "/dashboard?tab=journal"),
      "https://elitegold.example/dashboard?tab=journal",
    );
  });

  it("falls back to dashboard for unsafe redirect paths", () => {
    assert.equal(
      getAuthRedirectUrl("https://elitegold.example", "https://evil.example"),
      "https://elitegold.example/dashboard",
    );
  });

  it("adds auth notices to safe redirect paths without losing query values", () => {
    assert.equal(
      addAuthNoticeToRedirectPath("/dashboard/account?notice=verify_required#profile", "logged-in"),
      "/dashboard/account?notice=verify_required&auth=logged-in#profile",
    );
  });
});

describe("email OTP callback helpers", () => {
  it("keeps supported Supabase email OTP types", () => {
    assert.equal(getEmailOtpType("email"), "email");
    assert.equal(getEmailOtpType("recovery"), "recovery");
  });

  it("rejects unknown email OTP types", () => {
    assert.equal(getEmailOtpType("not-real"), null);
    assert.equal(getEmailOtpType(null), null);
  });
});
