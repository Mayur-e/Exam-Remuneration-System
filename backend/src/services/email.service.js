const { Resend } = require("resend");

// Resend uses HTTPS (port 443) — works even on college LANs that block SMTP ports
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the external examiner Google Form invitation email via Resend.
 * @param {Object} opts
 * @param {string} opts.toEmail     - Examiner's email address
 * @param {string} opts.toName      - Examiner's name (optional)
 * @param {string} opts.formUrl     - Pre-filled Google Form URL (with token embedded)
 * @param {string} opts.token       - The raw token (for display)
 * @param {string} opts.examInfo    - Short exam description (optional)
 */
async function sendExaminerInvite({ toEmail, toName, formUrl, token, examInfo }) {
  const displayName = toName || "Examiner";
  const examLine = examInfo
    ? `<p style="margin:0 0 8px;color:#475569;"><strong>Exam:</strong> ${examInfo}</p>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#ffffff;padding:30px 40px;text-align:center;border-bottom:4px solid #4f46e5;">
            <img src="http://www.pccoepune.com/images/pccoe-logo-new.webp" alt="PCCOE Logo" style="height:80px;width:auto;margin-bottom:15px;" />
            <h1 style="margin:0;color:#1e293b;font-size:20px;font-weight:700;letter-spacing:-0.3px;">
              External Examiner Remuneration Claim
            </h1>
            <p style="margin:6px 0 0;color:#64748b;font-size:14px;">Pimpri Chinchwad College of Engineering</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;color:#1e293b;font-size:16px;">Dear <strong>${displayName}</strong>,</p>
            <p style="margin:0 0 20px;color:#475569;line-height:1.6;">
              We request you to kindly submit your remuneration details for the recent examination duty conducted at PCCOE. 
              You can complete this process through our official portal.
            </p>

            ${examLine}

            <!-- Token box -->
            <div style="background:#f8fafc;border-left:4px solid #4f46e5;padding:16px 20px;margin:20px 0;">
              <p style="margin:0 0 4px;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Exam Reference Number</p>
              <p style="margin:0;color:#1e293b;font-size:16px;font-weight:700;font-family:monospace;letter-spacing:1px;">${token}</p>
            </div>

            <!-- CTA Button -->
            <div style="text-align:center;margin:30px 0;">
              <a href="${formUrl}"
                style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:6px;">
                Proceed to Claim Form
              </a>
            </div>

            <p style="margin:0 0 8px;color:#64748b;font-size:13px;">Or copy this secure link to your browser:</p>
            <p style="margin:0 0 24px;word-break:break-all;">
              <a href="${formUrl}" style="color:#4f46e5;font-size:12px;text-decoration:underline;">${formUrl}</a>
            </p>

            <!-- Instructions -->
            <div style="background:#f8fafc;border-left:4px solid #4f46e5;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
              <p style="margin:0 0 8px;color:#1e293b;font-weight:700;font-size:14px;">What to fill in the form:</p>
              <ul style="margin:0;padding-left:20px;color:#475569;font-size:13px;line-height:1.8;">
                <li>Personal details (Name, Email, Mobile)</li>
                <li>Parent Institute Name</li>
                <li>PAN Card Number</li>
                <li>Bank Account Details (Bank, Branch, Account No., IFSC)</li>
                <li>Upload: PAN Card document &amp; Cancelled Cheque</li>
              </ul>
            </div>

            <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;">
              If you have any questions, please contact the examination department.<br>
              This is an automated email — please do not reply to this address.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              © PCCOE Exam Remuneration Management System &nbsp;|&nbsp; Pimpri Chinchwad College of Engineering
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM || "PCCOE Exam Department <onboarding@resend.dev>",
    to: [toEmail],
    subject: "📋 Action Required: Fill Your Exam Remuneration Claim — PCCOE",
    html,
    text: `Dear ${displayName},\n\nYou are invited to submit your exam remuneration claim.\n\nPlease fill this form (your token is pre-filled):\n${formUrl}\n\nExam Reference Token: ${token}\n\nThank you,\nPCCOE Exam Department`,
  });

  if (error) throw new Error(error.message || JSON.stringify(error));
  return data;
}

module.exports = { sendExaminerInvite };
