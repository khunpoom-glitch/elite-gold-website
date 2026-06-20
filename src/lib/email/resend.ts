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
const automatedFooterHtml =
  "This is an automated email from Elite Gold Community.<br>If you did not create this account, you can safely ignore this email.";

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

function getMemberIdFromAccessCode(accessCode: string) {
  const normalizedAccessCode = accessCode.trim().toUpperCase();
  const memberId = normalizedAccessCode.match(/^EG(\d+)$/)?.[1];

  return memberId || normalizedAccessCode || "Pending";
}

function getWelcomeTitle(name: string) {
  const trimmedName = name.trim();

  return trimmedName
    ? `Welcome to Elite Gold, ${trimmedName}`
    : "Welcome to Elite Gold Community";
}

function getButtonHtml(url: string, label: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" align="center" style="border-collapse:separate;margin:0 auto;">
    <tr>
      <td align="center" bgcolor="#D4AF37" style="border:1px solid #E6C85C;border-radius:999px;background:#D4AF37;box-shadow:0 10px 24px rgba(212,175,55,0.18);">
        <a class="elite-button" href="${url}" style="display:inline-block;min-width:180px;border-radius:999px;background:#D4AF37;color:#050505;font-size:15px;font-weight:800;line-height:1.2;text-align:center;text-decoration:none;padding:15px 30px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function getEmailShell(title: string, body: string) {
  const logoUrl = escapeHtml(getPublicAssetUrl("/brand/elite-gold-logo.png"));
  const safeTitle = escapeHtml(title);

  return `<!doctype html>
<html lang="en" style="margin:0;padding:0;background-color:#050505;">
  <head>
    <meta charset="utf-8">
    <meta name="color-scheme" content="dark only">
    <meta name="supported-color-schemes" content="dark">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      :root { color-scheme: dark; supported-color-schemes: dark; }
      html, body { margin: 0 !important; padding: 0 !important; min-width: 100% !important; width: 100% !important; background-color: #050505 !important; }
      body, table, td, p, a { font-family: Arial, Helvetica, sans-serif; }
      .elite-bg, .elite-bg td { background-color: #050505 !important; }
      .elite-card, .elite-card td { background-color: #080808 !important; }
      .elite-button:hover { background-color: #E6C85C !important; }
      a { color: #050505; }
      @media (prefers-color-scheme: light) {
        html, body, .elite-bg, .elite-bg td { background-color: #050505 !important; }
        .elite-card, .elite-card td { background-color: #080808 !important; }
      }
      @media screen and (max-width: 600px) {
        .elite-email-wrap { padding: 24px 12px !important; }
        .elite-card-header { padding: 30px 22px 22px !important; }
        .elite-card-body { padding: 28px 22px 30px !important; }
        .elite-title { font-size: 25px !important; line-height: 1.25 !important; }
        .elite-button { box-sizing: border-box !important; min-width: 200px !important; padding: 16px 28px !important; }
      }
    </style>
  </head>
  <body bgcolor="#050505" style="margin:0;padding:0;background-color:#050505 !important;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;">
    <table class="elite-bg" role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#050505" style="min-width:100%;width:100%;background-color:#050505 !important;">
      <tr>
        <td class="elite-bg elite-email-wrap" align="center" bgcolor="#050505" style="background-color:#050505 !important;padding:46px 16px;">
          <table class="elite-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#080808" style="border-collapse:separate;width:100%;max-width:600px;border:1px solid rgba(212,175,55,0.35);border-radius:24px;background-color:#080808 !important;box-shadow:0 24px 70px rgba(212,175,55,0.10),0 30px 90px rgba(0,0,0,0.55);overflow:hidden;">
            <tr>
              <td class="elite-card-header" align="center" bgcolor="#080808" style="padding:34px 30px 24px;border-bottom:1px solid rgba(255,255,255,0.08);background-color:#080808 !important;text-align:center;">
                <img alt="Elite Gold" src="${logoUrl}" width="96" style="display:block;width:96px;max-width:96px;height:auto;margin:0 auto 18px;border:0;outline:none;text-decoration:none;">
                <p style="margin:0 0 12px;color:#D4AF37;font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;">Elite Gold Community</p>
                <h1 class="elite-title" style="margin:0;color:#FFFFFF;font-size:28px;line-height:1.25;font-weight:800;">${safeTitle}</h1>
              </td>
            </tr>
            <tr>
              <td class="elite-card-body" bgcolor="#080808" style="padding:32px 34px 36px;color:#CFCFCF;font-size:15px;line-height:1.75;background-color:#080808 !important;">
                ${body}
              </td>
            </tr>
            <tr>
              <td bgcolor="#080808" style="padding:20px 30px;border-top:1px solid rgba(255,255,255,0.08);color:#8A8A8A;font-size:12px;line-height:1.65;background-color:#080808 !important;text-align:center;">
                ${automatedFooterHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildEmailVerificationEmail({
  memberAccessCode,
  name,
  verificationUrl,
}: {
  memberAccessCode: string;
  name: string;
  verificationUrl: string;
}) {
  const safeName = escapeHtml(name || "Elite Gold Member");
  const safeMemberId = escapeHtml(getMemberIdFromAccessCode(memberAccessCode));
  const safeVerificationUrl = escapeHtml(verificationUrl);
  const html = getEmailShell(
    getWelcomeTitle(name),
    `<p style="margin:0 0 16px;">Hi ${safeName},</p>
     <p style="margin:0 0 16px;color:#CFCFCF;">Your Elite Gold account has been successfully created.</p>
     <p style="margin:0 0 24px;color:#CFCFCF;">Please verify your email address to activate your account and unlock member features.</p>
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 26px;border-collapse:collapse;">
       <tr>
         <td align="center" style="border:1px solid rgba(212,175,55,0.25);border-radius:16px;background:#0B0B0B;padding:16px 18px;color:#8A8A8A;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">
           Member ID<br>
           <strong style="display:inline-block;margin-top:6px;color:#E6C85C;font-size:22px;letter-spacing:0.08em;">${safeMemberId}</strong>
         </td>
       </tr>
     </table>
     ${getButtonHtml(safeVerificationUrl, "Verify Email")}
     <p style="margin:22px 0 0;color:#8f8f99;font-size:12px;line-height:1.6;">If the button does not work, copy and paste this link into your browser:<br>${safeVerificationUrl}</p>`,
  );
  const text = `Hi ${name || "Elite Gold Member"},\n\nYour Elite Gold account has been successfully created.\nPlease verify your email address to activate your account and unlock member features.\n\nMember ID: ${getMemberIdFromAccessCode(memberAccessCode)}\n\nVerify Email: ${verificationUrl}`;

  return {
    headers: {
      "X-Entity-Ref-ID": `elite-email-verification-${safeMemberId}`,
    },
    html,
    subject: "Verify your Elite Gold email",
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

export async function sendEmailVerificationEmail({
  memberAccessCode,
  name,
  to,
  verificationUrl,
}: {
  memberAccessCode: string;
  name: string;
  to: string;
  verificationUrl: string;
}) {
  const email = buildEmailVerificationEmail({
    memberAccessCode,
    name,
    verificationUrl,
  });

  return sendTransactionalEmail({
    headers: email.headers,
    html: email.html,
    subject: email.subject,
    text: email.text,
    to,
  });
}
