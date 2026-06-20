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

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  body: JSON.stringify({
    external_email_enabled: true,
    mailer_autoconfirm: false,
    mailer_notifications_email_changed_enabled: true,
    mailer_notifications_password_changed_enabled: true,
    mailer_secure_email_change_enabled: true,
    mailer_subjects_email_changed_notification: "Your Elite Gold email address was changed",
    mailer_subjects_password_changed_notification: "Your Elite Gold password was changed",
    mailer_templates_email_changed_notification_content:
      "<h2>Your Elite Gold email address was changed</h2><p>The email address for your account was changed from {{ .OldEmail }} to {{ .Email }}.</p><p>If you did not make this change, contact support immediately.</p>",
    mailer_templates_password_changed_notification_content:
      "<h2>Your Elite Gold password was changed</h2><p>The password for your Elite Gold account was changed successfully.</p><p>If you did not make this change, contact support immediately.</p>",
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
