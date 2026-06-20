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
const transactionalFooter = "This is a transactional email from Elite Gold Community.";

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
  return `<table role="presentation" cellspacing="0" cellpadding="0" align="center" style="border-collapse:separate;margin:0 auto;">
    <tr>
      <td align="center" bgcolor="#d8b83d" style="border-radius:999px;background:#d8b83d;">
        <a href="${url}" style="display:inline-block;border-radius:999px;background:#d8b83d;color:#050505;font-size:15px;font-weight:800;line-height:1.2;text-decoration:none;padding:14px 28px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function getEmailShell(title: string, body: string) {
  const logoUrl = escapeHtml(getPublicAssetUrl("/brand/elite-gold-logo.png"));
  const safeTitle = escapeHtml(title);

  return `<!doctype html>
<html lang="en" style="margin:0;padding:0;background-color:#000000;">
  <head>
    <meta charset="utf-8">
    <meta name="color-scheme" content="dark only">
    <meta name="supported-color-schemes" content="dark">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      :root { color-scheme: dark; supported-color-schemes: dark; }
      html, body { margin: 0 !important; padding: 0 !important; min-width: 100% !important; width: 100% !important; background-color: #000000 !important; }
      body, table, td, p, a { font-family: Arial, Helvetica, sans-serif; }
      .elite-bg, .elite-bg td { background-color: #000000 !important; }
      .elite-card, .elite-card td { background-color: #070707 !important; }
      a { color: #050505; }
      @media (prefers-color-scheme: light) {
        html, body, .elite-bg, .elite-bg td { background-color: #000000 !important; }
        .elite-card, .elite-card td { background-color: #070707 !important; }
      }
      @media screen and (max-width: 600px) {
        .elite-email-wrap { padding: 28px 14px !important; }
        .elite-card-header { padding: 28px 22px 20px !important; }
        .elite-card-body { padding: 26px 22px !important; }
        .elite-title { font-size: 25px !important; }
      }
    </style>
  </head>
  <body bgcolor="#000000" style="margin:0;padding:0;background-color:#000000 !important;color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <table class="elite-bg" role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#000000" style="min-width:100%;width:100%;background-color:#000000 !important;">
      <tr>
        <td class="elite-bg elite-email-wrap" align="center" bgcolor="#000000" style="background-color:#000000 !important;padding:44px 16px;">
          <table class="elite-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#070707" style="border-collapse:separate;width:100%;max-width:600px;border:1px solid #4a3a0c;border-radius:22px;background-color:#070707 !important;overflow:hidden;">
            <tr>
              <td class="elite-card-header" align="center" bgcolor="#070707" style="padding:34px 28px 24px;border-bottom:1px solid #1f1f1f;background-color:#070707 !important;text-align:center;">
                <img alt="Elite Gold" src="${logoUrl}" width="96" style="display:block;width:96px;max-width:96px;height:auto;margin:0 auto 18px;border:0;outline:none;text-decoration:none;">
                <p style="margin:0 0 10px;color:#d4af37;font-size:12px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;">Elite Gold Community</p>
                <h1 class="elite-title" style="margin:0;color:#ffffff;font-size:28px;line-height:1.25;font-weight:800;">${safeTitle}</h1>
              </td>
            </tr>
            <tr>
              <td class="elite-card-body" bgcolor="#070707" style="padding:32px 32px 34px;color:#d7d7df;font-size:15px;line-height:1.7;background-color:#070707 !important;">
                ${body}
              </td>
            </tr>
            <tr>
              <td bgcolor="#070707" style="padding:20px 28px;border-top:1px solid #1f1f1f;color:#8f8f99;font-size:12px;line-height:1.6;background-color:#070707 !important;text-align:center;">
                ${transactionalFooter}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildGoogleSignupWelcomeEmail({
  dashboardUrl,
  memberAccessCode,
  name,
}: {
  dashboardUrl: string;
  memberAccessCode: string;
  name: string;
}) {
  const safeName = escapeHtml(name || "Elite Gold Member");
  const safeAccessCode = escapeHtml(memberAccessCode || "Pending");
  const safeDashboardUrl = escapeHtml(dashboardUrl);
  const html = getEmailShell(
    "Welcome to Elite Gold",
    `<p style="margin:0 0 16px;">Hi ${safeName},</p>
     <p style="margin:0 0 16px;">Your Elite Gold member profile has been created successfully.</p>
     <p style="margin:0 0 24px;">Your access code: <strong style="color:#f6e3a3;">${safeAccessCode}</strong></p>
     ${getButtonHtml(safeDashboardUrl, "Verify Email")}`,
  );
  const text = `Hi ${name || "Elite Gold Member"},\n\nYour Elite Gold member profile has been created successfully.\nYour access code: ${memberAccessCode || "Pending"}\n\nVerify Email: ${dashboardUrl}`;

  return {
    headers: {
      "X-Entity-Ref-ID": `elite-google-welcome-${safeAccessCode}`,
    },
    html,
    subject: "Welcome to Elite Gold",
    text,
  };
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
  const email = buildGoogleSignupWelcomeEmail({
    dashboardUrl,
    memberAccessCode,
    name,
  });

  return sendTransactionalEmail({
    headers: email.headers,
    html: email.html,
    subject: email.subject,
    text: email.text,
    to,
  });
}
