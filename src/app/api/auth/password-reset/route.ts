import { NextResponse } from "next/server";
import type { AuthActionState } from "@/lib/auth/action-state";
import { getRequestOrigin } from "@/lib/auth/origin";
import { verifyTurnstileToken } from "@/lib/auth/turnstile";
import { getSafeRedirectPath, validateForgotPasswordForm } from "@/lib/auth/validation";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function errorState(
  message: string,
  fieldErrors?: Record<string, string>,
  retryAfterSeconds?: number,
): AuthActionState {
  return {
    status: "error",
    message,
    fieldErrors,
    retryAfterSeconds,
  };
}

function successState(message: string): AuthActionState {
  return {
    status: "success",
    message,
  };
}

function getRequestIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    ""
  );
}

async function getAuthCallbackUrl(nextPath: string) {
  const callbackUrl = new URL("/auth/callback", await getRequestOrigin());

  callbackUrl.searchParams.set("next", getSafeRedirectPath(nextPath));

  return callbackUrl.toString();
}

async function getPasswordResetVerificationUrl(tokenHash: string) {
  const confirmUrl = new URL("/auth/confirm", await getRequestOrigin());

  confirmUrl.searchParams.set("token_hash", tokenHash);
  confirmUrl.searchParams.set("type", "recovery");
  confirmUrl.searchParams.set("next", "/reset-password");

  return confirmUrl.toString();
}

const passwordResetRetryAfterSeconds = 60;
const passwordResetSuccessMessage =
  "If this email is registered, reset instructions have been sent. Please check your inbox.";

function getPasswordResetError(message: string) {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("over_email_send_rate_limit") ||
    lowerMessage.includes("security purposes") ||
    lowerMessage.includes("request this after")
  ) {
    return {
      message: passwordResetSuccessMessage,
      retryAfterSeconds: passwordResetRetryAfterSeconds,
      status: 429,
    };
  }

  return {
    message: "Unable to send reset link. Please try again in a moment.",
    status: 500,
  };
}

function isMissingUserError(message: string) {
  const lowerMessage = message.toLowerCase();

  return (
    lowerMessage.includes("user not found") ||
    lowerMessage.includes("not found") ||
    lowerMessage.includes("no user")
  );
}

async function sendPasswordResetWithCustomMailer(email: string, redirectTo: string) {
  const supabaseAdmin = createSupabaseAdminClient();

  if (!supabaseAdmin) {
    return { ok: false as const, shouldFallback: true as const };
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    email,
    options: {
      redirectTo,
    },
    type: "recovery",
  });

  if (error) {
    if (isMissingUserError(error.message)) {
      return { ok: true as const };
    }

    const resetError = getPasswordResetError(error.message);

    if (resetError.retryAfterSeconds) {
      return {
        ok: false as const,
        error: resetError,
      };
    }

    console.error("[auth] Unable to generate password reset link.", {
      message: error.message,
      status: error.status,
    });

    return {
      ok: false as const,
      error: resetError,
    };
  }

  const tokenHash = data.properties?.hashed_token;

  if (!tokenHash) {
    console.error("[auth] Supabase generated a password reset response without a token hash.");

    return {
      ok: false as const,
      error: getPasswordResetError("missing token hash"),
    };
  }

  const resetUrl = await getPasswordResetVerificationUrl(tokenHash);
  const emailResult = await sendPasswordResetEmail({
    resetUrl,
    to: email,
  });

  if (!emailResult.ok) {
    if (emailResult.reason === "missing-config") {
      return { ok: false as const, shouldFallback: true as const };
    }

    return {
      ok: false as const,
      error: getPasswordResetError("custom resend password reset failed"),
    };
  }

  return { ok: true as const };
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      errorState("Unable to read the reset request. Please try again in a moment."),
      { status: 400 },
    );
  }

  const validation = validateForgotPasswordForm(formData);

  if (!validation.ok) {
    return NextResponse.json(errorState(validation.message, validation.fieldErrors), {
      status: 400,
    });
  }

  const turnstileVerification = await verifyTurnstileToken(formData, getRequestIp(request));

  if (!turnstileVerification.ok) {
    return NextResponse.json(errorState(turnstileVerification.message), {
      status: 400,
    });
  }

  const redirectTo = await getAuthCallbackUrl("/reset-password");
  const customMailerResult = await sendPasswordResetWithCustomMailer(
    validation.data.email,
    redirectTo,
  );

  if (customMailerResult.ok) {
    return NextResponse.json(successState(passwordResetSuccessMessage));
  }

  if (customMailerResult.error) {
    return NextResponse.json(
      customMailerResult.error.retryAfterSeconds
        ? successState(passwordResetSuccessMessage)
        : errorState(customMailerResult.error.message),
      {
        headers: customMailerResult.error.retryAfterSeconds
          ? { "Retry-After": String(customMailerResult.error.retryAfterSeconds) }
          : undefined,
        status: customMailerResult.error.retryAfterSeconds
          ? 200
          : customMailerResult.error.status,
      },
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      errorState("Member authentication is not configured yet. Please try again later."),
      { status: 503 },
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(validation.data.email, {
    redirectTo,
  });

  if (error) {
    const resetError = getPasswordResetError(error.message);

    return NextResponse.json(
      errorState(resetError.message, undefined, resetError.retryAfterSeconds),
      {
        headers: resetError.retryAfterSeconds
          ? { "Retry-After": String(resetError.retryAfterSeconds) }
          : undefined,
        status: resetError.status,
      },
    );
  }

  return NextResponse.json(successState(passwordResetSuccessMessage));
}
