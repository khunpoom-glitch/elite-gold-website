export type AuthValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export type LoginCredentials = {
  email: string;
  password: string;
  remember: boolean;
};

export type SignupProfileFields = {
  nationality: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phoneCountry: string;
  phone: string;
  email: string;
  signupAccessCode: string;
};

export type SignupCredentials = SignupProfileFields & {
  password: string;
};

export type ForgotPasswordCredentials = {
  email: string;
};

export type UpdatePasswordCredentials = {
  password: string;
};

export type EmailChangeFields = {
  email: string;
};

export type UpdateProfileFields = {
  nationality: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phoneCountry: string;
  phone: string;
};

export const rootAccessCode = "EG000";
export const authBotProtectionFieldNames = {
  startedAt: "authFormStartedAt",
  website: "companyWebsite",
} as const;
export const authMinimumSubmitMs = 900;
const defaultRedirectPath = "/dashboard";
const supportedEmailOtpTypes = new Set([
  "email",
  "recovery",
  "invite",
  "magiclink",
  "signup",
  "email_change",
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

export function getAuthBotProtectionError(formData: FormData, now = Date.now()) {
  const website = getStringField(formData, authBotProtectionFieldNames.website);

  if (website) {
    return "We could not verify this request. Please try again.";
  }

  const startedAtValue = getStringField(formData, authBotProtectionFieldNames.startedAt);

  if (!startedAtValue) {
    return null;
  }

  const startedAt = Number.parseInt(startedAtValue, 10);

  if (!Number.isFinite(startedAt)) {
    return "We could not verify this request. Please try again.";
  }

  if (now - startedAt < authMinimumSubmitMs) {
    return "Please wait a moment and try again.";
  }

  return null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeAccessCode(code?: string | null) {
  if (!code) {
    return "";
  }

  return code.trim().toUpperCase();
}

function invalid(
  message: string,
  fieldErrors?: Record<string, string>,
): AuthValidationResult<never> {
  return { ok: false, message, fieldErrors };
}

function getMissingFieldErrors(fields: Array<[string, string, string]>) {
  const missingFields = fields
    .filter(([, , value]) => !value)
    .map(([name, label]) => [name, `กรุณากรอก ${label}`] as const);

  return Object.fromEntries(missingFields);
}

function requireFields(fields: Array<[string, string, string]>) {
  const fieldErrors = getMissingFieldErrors(fields);
  const missingLabels = fields
    .filter(([name]) => fieldErrors[name])
    .map(([, label]) => label);

  return missingLabels.length > 0
    ? {
        fieldErrors,
        message: `กรุณากรอกข้อมูลให้ครบ: ${missingLabels.join(", ")}`,
      }
    : null;
}

function validateEmail(email: string) {
  return emailPattern.test(email);
}

function validatePassword(password: string, label = "Password") {
  if (!password) {
    return `กรุณากรอก ${label}`;
  }

  if (password.length < 8) {
    return `${label} ต้องมีอย่างน้อย 8 ตัวอักษร`;
  }

  return null;
}

export function validateLoginForm(
  formData: FormData,
): AuthValidationResult<LoginCredentials> {
  const botProtectionError = getAuthBotProtectionError(formData);

  if (botProtectionError) {
    return invalid(botProtectionError);
  }

  const email = normalizeEmail(getStringField(formData, "email"));
  const password = getStringField(formData, "password");
  const missingMessage = requireFields([
    ["email", "Email", email],
    ["password", "Password", password],
  ]);

  if (missingMessage) {
    return invalid(missingMessage.message, missingMessage.fieldErrors);
  }

  if (!validateEmail(email)) {
    return invalid("กรุณากรอกอีเมลให้ถูกต้อง", {
      email: "กรุณากรอกอีเมลให้ถูกต้อง",
    });
  }

  return {
    ok: true,
    data: {
      email,
      password,
      remember: formData.get("remember") === "on",
    },
  };
}

export function validateSignupProfileForm(
  formData: FormData,
): AuthValidationResult<SignupProfileFields> {
  const botProtectionError = getAuthBotProtectionError(formData);

  if (botProtectionError) {
    return invalid(botProtectionError);
  }

  const nationality = getStringField(formData, "nationality");
  const firstName = getStringField(formData, "firstName");
  const lastName = getStringField(formData, "lastName");
  const nickname = getStringField(formData, "nickname");
  const phoneCountry = getStringField(formData, "phoneCountry");
  const phone = getStringField(formData, "phone");
  const email = normalizeEmail(getStringField(formData, "email"));
  const signupAccessCode = normalizeAccessCode(
    getStringField(formData, "signupAccessCode") ||
      getStringField(formData, "signupReferralCode") ||
      getStringField(formData, "accessCode") ||
      getStringField(formData, "referralCode"),
  );
  const missingMessage = requireFields([
    ["nationality", "Nationality", nationality],
    ["firstName", "First Name", firstName],
    ["lastName", "Last Name", lastName],
    ["nickname", "Nickname", nickname],
    ["phoneCountry", "Phone Country", phoneCountry],
    ["phone", "Phone Number", phone],
    ["email", "Email", email],
    ["signupAccessCode", "Access Code", signupAccessCode],
  ]);

  if (missingMessage) {
    return invalid(missingMessage.message, missingMessage.fieldErrors);
  }

  if (!validateEmail(email)) {
    return invalid("กรุณากรอกอีเมลให้ถูกต้อง", {
      email: "กรุณากรอกอีเมลให้ถูกต้อง",
    });
  }

  return {
    ok: true,
    data: {
      nationality,
      firstName,
      lastName,
      nickname,
      phoneCountry,
      phone,
      email,
      signupAccessCode,
    },
  };
}

export function validateSignupForm(
  formData: FormData,
): AuthValidationResult<SignupCredentials> {
  const password = getStringField(formData, "password");
  const confirmPassword = getStringField(formData, "confirmPassword");
  const profileValidation = validateSignupProfileForm(formData);

  if (!profileValidation.ok) {
    const passwordMissingMessage = requireFields([
      ["password", "Password", password],
      ["confirmPassword", "Confirm Password", confirmPassword],
    ]);

    if (profileValidation.fieldErrors && passwordMissingMessage) {
      return invalid(profileValidation.message, {
        ...profileValidation.fieldErrors,
        ...passwordMissingMessage.fieldErrors,
      });
    }

    return profileValidation;
  }

  const missingMessage = requireFields([
    ["password", "Password", password],
    ["confirmPassword", "Confirm Password", confirmPassword],
  ]);

  if (missingMessage) {
    return invalid(missingMessage.message, missingMessage.fieldErrors);
  }

  const passwordMessage = validatePassword(password);

  if (passwordMessage) {
    return invalid(passwordMessage, {
      password: passwordMessage,
    });
  }

  if (password !== confirmPassword) {
    return invalid("Password และ Confirm Password ต้องตรงกัน", {
      confirmPassword: "Confirm Password ต้องตรงกับ Password",
    });
  }

  return {
    ok: true,
    data: {
      ...profileValidation.data,
      password,
    },
  };
}

export function validateForgotPasswordForm(
  formData: FormData,
): AuthValidationResult<ForgotPasswordCredentials> {
  const botProtectionError = getAuthBotProtectionError(formData);

  if (botProtectionError) {
    return invalid(botProtectionError);
  }

  const email = normalizeEmail(getStringField(formData, "email"));

  if (!email) {
    return invalid("Please enter your member email to continue.", {
      email: "Please enter your member email.",
    });
  }

  if (!validateEmail(email)) {
    return invalid("Please enter a valid member email to continue.", {
      email: "Please enter a valid member email.",
    });
  }

  return {
    ok: true,
    data: {
      email,
    },
  };
}

export function validateUpdatePasswordForm(
  formData: FormData,
): AuthValidationResult<UpdatePasswordCredentials> {
  const password = getStringField(formData, "password");
  const confirmPassword = getStringField(formData, "confirmPassword");

  if (!password) {
    return invalid("Please enter your new password.", {
      password: "Please enter your new password.",
    });
  }

  if (password.length < 8) {
    return invalid("Use at least 8 characters for your new password.", {
      password: "Use at least 8 characters.",
    });
  }

  if (!confirmPassword) {
    return invalid("Please confirm your new password.", {
      confirmPassword: "Please confirm your new password.",
    });
  }

  if (password !== confirmPassword) {
    return invalid("Passwords do not match.", {
      confirmPassword: "Passwords do not match.",
    });
  }

  return {
    ok: true,
    data: {
      password,
    },
  };
}

export function validateEmailChangeForm(
  formData: FormData,
): AuthValidationResult<EmailChangeFields> {
  const email = normalizeEmail(getStringField(formData, "email"));

  if (!email) {
    return invalid("กรุณากรอกอีเมลใหม่", {
      email: "กรุณากรอกอีเมลใหม่",
    });
  }

  if (!validateEmail(email)) {
    return invalid("กรุณากรอกอีเมลใหม่ให้ถูกต้อง", {
      email: "กรุณากรอกอีเมลใหม่ให้ถูกต้อง",
    });
  }

  return {
    ok: true,
    data: {
      email,
    },
  };
}

export function validateUpdateProfileForm(
  formData: FormData,
): AuthValidationResult<UpdateProfileFields> {
  const nationality = getStringField(formData, "nationality");
  const firstName = getStringField(formData, "firstName");
  const lastName = getStringField(formData, "lastName");
  const nickname = getStringField(formData, "nickname");
  const phoneCountry = getStringField(formData, "phoneCountry");
  const phone = getStringField(formData, "phone");
  const missingMessage = requireFields([
    ["nationality", "Nationality", nationality],
    ["firstName", "First Name", firstName],
    ["lastName", "Last Name", lastName],
    ["nickname", "Nickname", nickname],
    ["phoneCountry", "Phone Country", phoneCountry],
    ["phone", "Phone Number", phone],
  ]);

  if (missingMessage) {
    return invalid(missingMessage.message, missingMessage.fieldErrors);
  }

  return {
    ok: true,
    data: {
      nationality,
      firstName,
      lastName,
      nickname,
      phoneCountry,
      phone,
    },
  };
}

export function getAuthRedirectUrl(baseUrl: string, nextPath?: string | null) {
  const base = new URL(baseUrl);
  const fallbackUrl = new URL(defaultRedirectPath, base);

  if (!nextPath?.startsWith("/")) {
    return fallbackUrl.toString();
  }

  try {
    const nextUrl = new URL(nextPath, base);

    if (nextUrl.origin !== base.origin) {
      return fallbackUrl.toString();
    }

    return nextUrl.toString();
  } catch {
    return fallbackUrl.toString();
  }
}

export function getSafeRedirectPath(nextPath?: string | null) {
  const redirectUrl = getAuthRedirectUrl("https://elitegold.local", nextPath);
  const parsedUrl = new URL(redirectUrl);

  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}

export function getEmailOtpType(type?: string | null) {
  return type && supportedEmailOtpTypes.has(type) ? type : null;
}
