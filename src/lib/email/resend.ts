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
      <td align="center" bgcolor="#D4AF37" style="border:1px solid #E6C85C;border-radius:999px;background:#D4AF37;box-shadow:0 7px 18px rgba(212,175,55,0.15);">
        <a class="elite-button" href="${url}" style="display:inline-block;min-width:154px;border-radius:999px;background:#D4AF37;color:#050505;font-size:13.5px;font-weight:800;line-height:1.2;text-align:center;text-decoration:none;padding:12px 24px;">${escapeHtml(label)}</a>
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
        .elite-email-wrap { padding: 20px 12px !important; }
        .elite-card-header { padding: 24px 20px 18px !important; }
        .elite-card-body { padding: 22px 20px 24px !important; }
        .elite-logo { width: 38px !important; max-width: 38px !important; }
        .elite-title { font-size: 20px !important; line-height: 1.28 !important; }
        .elite-button { box-sizing: border-box !important; min-width: 168px !important; padding: 13px 24px !important; }
        .elite-member-box { width: 100% !important; }
      }
    </style>
  </head>
  <body bgcolor="#050505" style="margin:0;padding:0;background-color:#050505 !important;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;">
    <table class="elite-bg" role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#050505" style="min-width:100%;width:100%;background-color:#050505 !important;">
      <tr>
        <td class="elite-bg elite-email-wrap" align="center" bgcolor="#050505" style="background-color:#050505 !important;padding:34px 14px;">
          <table class="elite-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#080808" style="border-collapse:separate;width:100%;max-width:460px;border:1px solid rgba(212,175,55,0.30);border-radius:22px;background-color:#080808 !important;box-shadow:0 14px 42px rgba(212,175,55,0.08),0 22px 64px rgba(0,0,0,0.52);overflow:hidden;">
            <tr>
              <td class="elite-card-header" align="center" bgcolor="#080808" style="padding:24px 24px 18px;border-bottom:1px solid rgba(255,255,255,0.08);background-color:#080808 !important;text-align:center;">
                <img class="elite-logo" alt="Elite Gold" src="${logoUrl}" width="40" style="display:block;width:40px;max-width:40px;height:auto;margin:0 auto 13px;border:0;outline:none;text-decoration:none;">
                <h1 class="elite-title" style="margin:0;color:#FFFFFF;font-size:22px;line-height:1.28;font-weight:800;">${safeTitle}</h1>
              </td>
            </tr>
            <tr>
              <td class="elite-card-body" bgcolor="#080808" style="padding:24px 28px 26px;color:#CFCFCF;font-size:13.5px;line-height:1.68;background-color:#080808 !important;">
                ${body}
              </td>
            </tr>
            <tr>
              <td bgcolor="#080808" style="padding:15px 22px;border-top:1px solid rgba(255,255,255,0.08);color:#8A8A8A;font-size:11px;line-height:1.6;background-color:#080808 !important;text-align:center;">
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
    `<p style="margin:0 0 14px;">Hi ${safeName},</p>
     <p style="margin:0 0 13px;color:#CFCFCF;">Your Elite Gold account has been successfully created.</p>
     <p style="margin:0 0 20px;color:#CFCFCF;">Please verify your email address to activate your account and unlock member features.</p>
     <table class="elite-member-box" role="presentation" width="260" align="center" cellspacing="0" cellpadding="0" style="width:260px;max-width:100%;margin:0 auto 22px;border-collapse:separate;">
       <tr>
         <td align="center" style="border:1px solid rgba(212,175,55,0.24);border-radius:18px;background:#0B0B0B;padding:12px 16px;color:#8A8A8A;font-size:10.5px;letter-spacing:0.13em;text-transform:uppercase;">
           Member ID<br>
           <strong style="display:inline-block;margin-top:4px;color:#E6C85C;font-size:18px;letter-spacing:0.08em;">${safeMemberId}</strong>
         </td>
       </tr>
     </table>
     ${getButtonHtml(safeVerificationUrl, "Verify Email")}
     <p style="margin:18px 0 0;color:#8f8f99;font-size:11px;line-height:1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="${safeVerificationUrl}" style="color:#8BA7FF;text-decoration:underline;word-break:break-all;">${safeVerificationUrl}</a></p>`,
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
