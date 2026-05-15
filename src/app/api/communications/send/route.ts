import { NextRequest, NextResponse } from "next/server";
import { sendEmail, buildQuotationEmail, buildFollowUpEmail } from "@/lib/email";
import { z } from "zod";

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  replyTo: z.string().email().optional(),
  // Template-based sending
  template: z.enum(["quotation", "follow-up", "custom"]).optional(),
  templateData: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = sendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { to, subject, text, html, cc, bcc, replyTo, template, templateData } = parsed.data;

    let emailSubject = subject;
    let emailHtml = html;

    // Use templates if specified
    if (template === "quotation" && templateData) {
      const built = buildQuotationEmail({
        buyerName: templateData.buyerName as string,
        quotationId: templateData.quotationId as string,
        grandTotal: templateData.grandTotal as number,
        currency: (templateData.currency as string) || "INR",
        validityDays: (templateData.validityDays as number) || 30,
      });
      emailSubject = built.subject;
      emailHtml = built.html;
    } else if (template === "follow-up" && templateData) {
      const built = buildFollowUpEmail({
        contactName: templateData.contactName as string,
        leadName: templateData.leadName as string,
        message: templateData.message as string | undefined,
      });
      emailSubject = built.subject;
      emailHtml = built.html;
    }

    const result = await sendEmail({
      to,
      subject: emailSubject,
      text,
      html: emailHtml,
      cc,
      bcc,
      replyTo,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
    });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email", message: (error as Error).message },
      { status: 500 }
    );
  }
}
