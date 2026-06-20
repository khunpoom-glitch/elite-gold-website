import { readFile } from "node:fs/promises";

const envFiles = [".env.local", ".env"];

function parseEnvLine(line) {
  const trimmedLine = line.trim();

  if (!trimmedLine || trimmedLine.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmedLine.indexOf("=");

  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmedLine.slice(0, separatorIndex).trim();
  let value = trimmedLine.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

async function loadLocalEnv() {
  for (const file of envFiles) {
    try {
      const contents = await readFile(file, "utf8");

      for (const line of contents.split(/\r?\n/)) {
        const pair = parseEnvLine(line);

        if (pair && !process.env[pair[0]]) {
          process.env[pair[0]] = pair[1];
        }
      }
    } catch {
      // Missing env files are fine. CI can provide the same values directly.
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function getProjectRef() {
  const explicitRef = process.env.SUPABASE_PROJECT_REF?.trim();

  if (explicitRef) {
    return explicitRef;
  }

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");

  return new URL(supabaseUrl).hostname.split(".")[0];
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://elitegoldcommunity.com";
}

function getPublicAssetUrl(path) {
  const siteUrl = getSiteUrl();

  try {
    return new URL(path, siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`).toString();
  } catch {
    return new URL(path, "https://elitegoldcommunity.com").toString();
  }
}

function getButtonHtml(url, label) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto;">
    <tr>
      <td align="center" bgcolor="#d4af37" style="border-radius:999px;background:#d4af37;">
        <a href="${url}" style="display:inline-block;border-radius:999px;background:#d4af37;color:#050505;font-size:15px;font-weight:800;line-height:1.2;text-decoration:none;padding:14px 24px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function getCodeBlockHtml(token) {
  return `<div style="margin:20px 0;text-align:center;">
    <span style="display:inline-block;border:1px solid #4a3a0c;border-radius:14px;background:#111111;color:#f6e3a3;font-size:28px;font-weight:800;letter-spacing:0.18em;padding:14px 20px;">${token}</span>
  </div>`;
}

function getAuthEmailShell(title, body) {
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
      .elite-bg { background-color: #050505 !important; }
      .elite-card, .elite-card td { background-color: #090909 !important; }
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
                <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;">${title}</h1>
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

await loadLocalEnv();

const projectRef = getProjectRef();
const accessToken = requireEnv("SUPABASE_ACCESS_TOKEN");
const resendApiKey = requireEnv("RESEND_API_KEY");
const fromEmail = requireEnv("RESEND_FROM_EMAIL");
const senderName = process.env.RESEND_FROM_NAME?.trim() || "Elite Gold";
const smtpHost = process.env.RESEND_SMTP_HOST?.trim() || "smtp.resend.com";
const smtpPort = process.env.RESEND_SMTP_PORT?.trim() || "587";

if (!/^\d+$/.test(smtpPort)) {
  throw new Error("RESEND_SMTP_PORT must be an integer");
}

const authEmailConfig = {
  mailer_notifications_email_changed_enabled: true,
  mailer_notifications_password_changed_enabled: true,
  mailer_secure_email_change_enabled: true,
  mailer_subjects_confirmation: "Verify your Elite Gold email",
  mailer_subjects_email_change: "Verify your new Elite Gold email",
  mailer_subjects_email_changed_notification: "Your Elite Gold email address was changed",
  mailer_subjects_invite: "You have been invited to Elite Gold",
  mailer_subjects_magic_link: "Your Elite Gold sign-in link",
  mailer_subjects_password_changed_notification: "Your Elite Gold password was changed",
  mailer_subjects_reauthentication: "{{ .Token }} is your Elite Gold verification code",
  mailer_subjects_recovery: "Reset your Elite Gold password",
  mailer_templates_confirmation_content: getAuthEmailShell(
    "Verify your email",
    `<p style="margin:0 0 16px;">Welcome to Elite Gold Community.</p>
     <p style="margin:0 0 22px;">Tap the button below to verify your email and activate your account status.</p>
     ${getButtonHtml("{{ .ConfirmationURL }}", "Verify Email")}
     <p style="margin:22px 0 0;color:#8f8f99;font-size:12px;line-height:1.6;">If the button does not work, copy and paste this link into your browser:<br>{{ .ConfirmationURL }}</p>`,
  ),
  mailer_templates_email_change_content: getAuthEmailShell(
    "Verify your new email",
    `<p style="margin:0 0 16px;">You requested to update your Elite Gold account email.</p>
     <p style="margin:0 0 22px;">Tap the button below to verify your new email address.</p>
     ${getButtonHtml("{{ .ConfirmationURL }}", "Verify New Email")}
     <p style="margin:22px 0 0;color:#8f8f99;font-size:12px;line-height:1.6;">If you did not request this change, you can safely ignore this email.</p>`,
  ),
  mailer_templates_email_changed_notification_content: getAuthEmailShell(
    "Email address changed",
    `<p style="margin:0 0 16px;">The email address for your Elite Gold account was changed from {{ .OldEmail }} to {{ .Email }}.</p>
     <p style="margin:0;">If you did not make this change, contact support immediately.</p>`,
  ),
  mailer_templates_invite_content: getAuthEmailShell(
    "You are invited",
    `<p style="margin:0 0 16px;">You have been invited to create an Elite Gold account.</p>
     <p style="margin:0 0 22px;">Tap the button below to accept the invitation.</p>
     ${getButtonHtml("{{ .ConfirmationURL }}", "Accept Invitation")}`,
  ),
  mailer_templates_magic_link_content: getAuthEmailShell(
    "Your sign-in link",
    `<p style="margin:0 0 16px;">Tap the button below to sign in to Elite Gold.</p>
     <p style="margin:0 0 22px;">This link expires shortly and can only be used once.</p>
     ${getButtonHtml("{{ .ConfirmationURL }}", "Sign In")}`,
  ),
  mailer_templates_password_changed_notification_content: getAuthEmailShell(
    "Password changed",
    `<p style="margin:0 0 16px;">The password for your Elite Gold account was changed successfully.</p>
     <p style="margin:0;">If you did not make this change, reset your password and contact support immediately.</p>`,
  ),
  mailer_templates_reauthentication_content: getAuthEmailShell(
    "Your verification code",
    `<p style="margin:0 0 16px;">Use this code to verify your identity. It expires shortly.</p>
     ${getCodeBlockHtml("{{ .Token }}")}`,
  ),
  mailer_templates_recovery_content: getAuthEmailShell(
    "Reset your password",
    `<p style="margin:0 0 16px;">We received a request to reset your Elite Gold password.</p>
     <p style="margin:0 0 22px;">Tap the button below to choose a new password.</p>
     ${getButtonHtml("{{ .ConfirmationURL }}", "Reset Password")}
     <p style="margin:22px 0 0;color:#8f8f99;font-size:12px;line-height:1.6;">If you did not request this, you can safely ignore this email.</p>`,
  ),
};

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  body: JSON.stringify({
    external_email_enabled: true,
    mailer_autoconfirm: false,
    ...authEmailConfig,
    smtp_admin_email: fromEmail,
    smtp_host: smtpHost,
    smtp_pass: resendApiKey,
    smtp_port: smtpPort,
    smtp_sender_name: senderName,
    smtp_user: "resend",
  }),
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  method: "PATCH",
});

const payload = await response.json().catch(() => null);

if (!response.ok) {
  console.error("Failed to configure Supabase Auth SMTP.", {
    message: payload?.message,
    status: response.status,
  });
  process.exit(1);
}

console.log("Supabase Auth SMTP configured for Resend.", {
  projectRef,
  smtpHost,
  smtpPort,
  smtpUser: "resend",
  fromEmail,
  senderName,
});
