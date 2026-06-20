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
const fallbackSiteUrl = "https://elitegoldcommunity.com";

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

function getPublicAssetUrl(path: string) {
  const siteUrl = getEnvValue("NEXT_PUBLIC_SITE_URL") || fallbackSiteUrl;

  try {
    return new URL(path, siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`).toString();
  } catch {
    return new URL(path, fallbackSiteUrl).toString();
  }
}

function getButtonHtml(url: string, label: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto;">
    <tr>
      <td align="center" bgcolor="#d4af37" style="border-radius:999px;background:#d4af37;">
        <a href="${url}" style="display:inline-block;border-radius:999px;background:#d4af37;color:#050505;font-size:15px;font-weight:800;line-height:1.2;text-decoration:none;padding:14px 24px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function getEmailShell(title: string, body: string) {
  const logoUrl = escapeHtml(getPublicAssetUrl("/brand/elite-gold-logo.png"));

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      :root { color-scheme: dark; supported-color-schemes: dark; }
      body { background-color: #050505 !important; }
      .elite-card, .elite-card td { background-color: #090909 !important; }
      .elite-bg { background-color: #050505 !important; }
      a { color: #050505; }
    </style>
  </head>
  <body bgcolor="#050505" style="margin:0;background:#050505 !important;color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <table class="elite-bg" role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#050505" style="background:#050505 !important;padding:32px 16px;">
      <tr>
        <td class="elite-bg" align="center" bgcolor="#050505" style="background:#050505 !important;">
          <table class="elite-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#090909" style="max-width:560px;border:1px solid #4a3a0c;border-radius:18px;background:#090909 !important;overflow:hidden;">
            <tr>
              <td align="center" bgcolor="#090909" style="padding:30px 28px 20px;border-bottom:1px solid #1f1f1f;background:#090909 !important;text-align:center;">
                <img alt="Elite Gold" src="${logoUrl}" width="72" style="display:block;width:72px;max-width:72px;height:auto;margin:0 auto 16px;">
                <p style="margin:0 0 8px;color:#d4af37;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">Elite Gold Community</p>
                <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td bgcolor="#090909" style="padding:28px;color:#d7d7df;font-size:15px;line-height:1.7;background:#090909 !important;">
                ${body}
              </td>
            </tr>
            <tr>
              <td bgcolor="#090909" style="padding:18px 28px;border-top:1px solid #1f1f1f;color:#8f8f99;font-size:12px;line-height:1.6;background:#090909 !important;text-align:center;">
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
  memberAccessCode,
  name,
  to,
}: {
  dashboardUrl: string;
  memberAccessCode: string;
  name: string;
  to: string;
}) {
  const safeName = escapeHtml(name || "Elite Gold Member");
  const safeAccessCode = escapeHtml(memberAccessCode || "Pending");
  const safeDashboardUrl = escapeHtml(dashboardUrl);
  const html = getEmailShell(
    "Welcome to Elite Gold",
    `<p style="margin:0 0 16px;">Hi ${safeName},</p>
     <p style="margin:0 0 16px;">Your Elite Gold member profile has been created successfully.</p>
     <p style="margin:0 0 20px;">Your access code: <strong style="color:#f6e3a3;">${safeAccessCode}</strong></p>
     ${getButtonHtml(safeDashboardUrl, "Open Dashboard")}`,
  );
  const text = `Hi ${name || "Elite Gold Member"},\n\nYour Elite Gold member profile has been created successfully.\nYour access code: ${memberAccessCode || "Pending"}\n\nOpen Dashboard: ${dashboardUrl}`;

  return sendTransactionalEmail({
    headers: {
      "X-Entity-Ref-ID": `elite-google-welcome-${safeAccessCode}`,
    },
    html,
    subject: "Welcome to Elite Gold",
    text,
    to,
  });
}
