type SendEmailInput = {
  headers?: Record<string, string>;
  html: string;
  subject: string;
  text: string;
  to: string;
};

type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; reason: "missing-config" | "resend-error" | "network-error" };

const resendApiUrl = "https://api.resend.com/emails";

function getEnvValue(name: string) {
  return process.env[name]?.trim() ?? "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getResendFromAddress() {
  const fromEmail = getEnvValue("RESEND_FROM_EMAIL");

  if (!fromEmail) {
    return "";
  }

  const fromName = getEnvValue("RESEND_FROM_NAME") || "Elite Gold";

  return `${fromName} <${fromEmail}>`;
}

function getReplyToAddress() {
  return getEnvValue("RESEND_REPLY_TO") || undefined;
}

function getEmailShell(title: string, body: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#050505;color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border:1px solid rgba(212,175,55,0.28);border-radius:18px;background:#090909;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;border-bottom:1px solid rgba(255,255,255,0.08);">
                <p style="margin:0 0 8px;color:#d4af37;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;">Elite Gold Community</p>
                <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px;color:#d7d7df;font-size:15px;line-height:1.7;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid rgba(255,255,255,0.08);color:#8f8f99;font-size:12px;line-height:1.6;">
                This is a transactional email from Elite Gold Community.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendTransactionalEmail({
  headers,
  html,
  subject,
  text,
  to,
}: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = getEnvValue("RESEND_API_KEY");
  const from = getResendFromAddress();

  if (!apiKey || !from) {
    console.warn("[email] Resend email skipped: RESEND_API_KEY or RESEND_FROM_EMAIL is missing.");

    return { ok: false, reason: "missing-config" };
  }

  try {
    const response = await fetch(resendApiUrl, {
      body: JSON.stringify({
        from,
        headers,
        html,
        reply_to: getReplyToAddress(),
        subject,
        text,
        to: [to],
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;

    if (!response.ok) {
      console.error("[email] Resend send failed.", {
        message: data?.message,
        status: response.status,
      });

      return { ok: false, reason: "resend-error" };
    }

    return { ok: true, id: data?.id };
  } catch (error) {
    console.error("[email] Resend network error.", error);

    return { ok: false, reason: "network-error" };
  }
}

export async function sendGoogleSignupWelcomeEmail({
  dashboardUrl,
  name,
  referralCode,
  to,
}: {
  dashboardUrl: string;
  name: string;
  referralCode: string;
  to: string;
}) {
  const safeName = escapeHtml(name || "Elite Gold Member");
  const safeReferralCode = escapeHtml(referralCode);
  const safeDashboardUrl = escapeHtml(dashboardUrl);
  const html = getEmailShell(
    "Welcome to Elite Gold",
    `<p style="margin:0 0 16px;">Hi ${safeName},</p>
     <p style="margin:0 0 16px;">Your Elite Gold member profile has been created successfully.</p>
     <p style="margin:0 0 20px;">Referral code: <strong style="color:#f6e3a3;">${safeReferralCode}</strong></p>
     <p style="margin:0;"><a href="${safeDashboardUrl}" style="display:inline-block;border-radius:999px;background:#d4af37;color:#050505;font-weight:700;text-decoration:none;padding:12px 18px;">Open Dashboard</a></p>`,
  );
  const text = `Hi ${name || "Elite Gold Member"},\n\nYour Elite Gold member profile has been created successfully.\nReferral code: ${referralCode}\n\nOpen Dashboard: ${dashboardUrl}`;

  return sendTransactionalEmail({
    headers: {
      "X-Entity-Ref-ID": `elite-google-welcome-${safeReferralCode}`,
    },
    html,
    subject: "Welcome to Elite Gold",
    text,
    to,
  });
}
