import nodemailer from "nodemailer";

// Gmail transporter using App Password
// To set up: Google Account → Security → 2-Step Verification → App Passwords
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // adminupahealthsupplies@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // 16-char app password from Google
  },
});

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
    encoding?: string;
  }>;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, text, html, cc, bcc, replyTo, attachments } = options;

  const mailOptions = {
    from: `"UpaHealth Supplies" <${process.env.GMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    text,
    html,
    cc: cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : undefined,
    bcc: bcc ? (Array.isArray(bcc) ? bcc.join(", ") : bcc) : undefined,
    replyTo: replyTo || process.env.GMAIL_USER,
    attachments,
  };

  const info = await transporter.sendMail(mailOptions);
  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
}

// Pre-built email templates for CRM use cases
export function buildQuotationEmail(params: {
  buyerName: string;
  quotationId: string;
  grandTotal: number;
  currency: string;
  validityDays: number;
}) {
  const { buyerName, quotationId, grandTotal, currency, validityDays } = params;

  return {
    subject: `Quotation ${quotationId} from UpaHealth Supplies`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f766e; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">UpaHealth Supplies</h1>
          <p style="color: #ccfbf1; margin: 5px 0 0;">Your Path to Wellness</p>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear <strong>${buyerName}</strong>,</p>
          <p>Thank you for your interest. Please find your quotation details below:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f0fdfa;">
              <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Quotation ID</strong></td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${quotationId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Total Amount</strong></td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${currency} ${grandTotal.toLocaleString()}</td>
            </tr>
            <tr style="background: #f0fdfa;">
              <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Valid For</strong></td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${validityDays} days</td>
            </tr>
          </table>
          <p>The detailed quotation PDF is attached to this email.</p>
          <p>If you have any questions, feel free to reply to this email.</p>
          <p style="margin-top: 30px;">
            Best regards,<br/>
            <strong>UpaHealth Supplies Team</strong><br/>
            <a href="https://www.upahealthsupplies.com">www.upahealthsupplies.com</a>
          </p>
        </div>
        <div style="background: #1f2937; padding: 15px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} UpaHealth Supplies. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };
}

export function buildFollowUpEmail(params: {
  contactName: string;
  leadName: string;
  message?: string;
}) {
  const { contactName, leadName, message } = params;

  return {
    subject: `Following up — UpaHealth Supplies`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0f766e; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">UpaHealth Supplies</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear <strong>${contactName}</strong>,</p>
          ${message ? `<p>${message}</p>` : `<p>I wanted to follow up regarding our previous conversation about ${leadName}. We'd love to assist you with your medical supply requirements.</p>`}
          <p>Please let us know if you'd like to discuss further or need an updated quotation.</p>
          <p style="margin-top: 30px;">
            Best regards,<br/>
            <strong>UpaHealth Supplies Team</strong><br/>
            <a href="https://www.upahealthsupplies.com">www.upahealthsupplies.com</a>
          </p>
        </div>
      </div>
    `,
  };
}

// Verify Gmail connection (useful for health checks)
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}
