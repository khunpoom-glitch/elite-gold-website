import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  authBotProtectionFieldNames,
  getAuthBotProtectionError,
  getAuthRedirectUrl,
  getEmailOtpType,
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
      });
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
