type CoursePurchaseEmailInput = {
  courseTitle: string;
  dashboardUrl: string;
  name: string;
  referenceCode: string;
};

type CoursePurchaseRejectedEmailInput = CoursePurchaseEmailInput & {
  reason: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildDecisionHtml({
  body,
  buttonLabel,
  dashboardUrl,
  title,
}: {
  body: string;
  buttonLabel: string;
  dashboardUrl: string;
  title: string;
}) {
  const safeDashboardUrl = escapeHtml(dashboardUrl);

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#111;color:#f7f7f7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#111;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:#171717;">
            <tr>
              <td style="padding:26px 26px 10px;">
                <h1 style="margin:0;color:#fff;font-size:22px;line-height:1.25;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 26px 24px;color:#cfcfcf;font-size:14px;line-height:1.7;">
                ${body}
                <p style="margin:22px 0 0;text-align:center;">
                  <a href="${safeDashboardUrl}" style="display:inline-block;border-radius:999px;background:#fff;color:#111;font-size:13px;font-weight:800;text-decoration:none;padding:12px 20px;">${escapeHtml(buttonLabel)}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildCoursePurchaseApprovedEmail({
  courseTitle,
  dashboardUrl,
  name,
  referenceCode,
}: CoursePurchaseEmailInput) {
  const displayName = name.trim() || "Elite Gold Member";
  const title = `${courseTitle} access approved`;
  const text = `Hi ${displayName},

Your ${courseTitle} has been approved.

Reference: ${referenceCode}

You can now open your Education page and start learning:
${dashboardUrl}`;

  return {
    headers: {
      "X-Entity-Ref-ID": `elite-course-approved-${referenceCode}`,
    },
    html: buildDecisionHtml({
      body: `<p style="margin:0 0 14px;">Hi ${escapeHtml(displayName)},</p>
        <p style="margin:0 0 14px;">Your <strong style="color:#fff;">${escapeHtml(courseTitle)}</strong> purchase has been approved.</p>
        <p style="margin:0;">Reference: <strong style="color:#fff;">${escapeHtml(referenceCode)}</strong></p>`,
      buttonLabel: "Open Education",
      dashboardUrl,
      title,
    }),
    subject: title,
    text,
  };
}

export function buildCoursePurchaseRejectedEmail({
  courseTitle,
  dashboardUrl,
  name,
  reason,
  referenceCode,
}: CoursePurchaseRejectedEmailInput) {
  const displayName = name.trim() || "Elite Gold Member";
  const title = `${courseTitle} transfer slip needs review`;
  const reviewReason = reason.trim() || "The submitted transfer slip could not be verified.";
  const text = `Hi ${displayName},

Your ${courseTitle} transfer slip needs review.

Reference: ${referenceCode}
Reason: ${reviewReason}

Please open your Education page and upload a new slip:
${dashboardUrl}`;

  return {
    headers: {
      "X-Entity-Ref-ID": `elite-course-rejected-${referenceCode}`,
    },
    html: buildDecisionHtml({
      body: `<p style="margin:0 0 14px;">Hi ${escapeHtml(displayName)},</p>
        <p style="margin:0 0 14px;">Your <strong style="color:#fff;">${escapeHtml(courseTitle)}</strong> transfer slip needs review.</p>
        <p style="margin:0 0 14px;">Reference: <strong style="color:#fff;">${escapeHtml(referenceCode)}</strong></p>
        <p style="margin:0;">Reason: ${escapeHtml(reviewReason)}</p>`,
      buttonLabel: "Upload New Slip",
      dashboardUrl,
      title,
    }),
    subject: title,
    text,
  };
}
