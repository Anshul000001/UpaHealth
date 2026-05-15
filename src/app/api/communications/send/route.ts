import { NextRequest, NextResponse } from "next/server";
import { sendEmail, buildQuotationEmail, buildFollowUpEmail } from "@/lib/email";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
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
  // For logging
  relatedType: z.string().optional(),
  relatedId: z.string().optional(),
});

export const POST = apiHandler(async (request) => {
  const session = await requireAuth("write");

  // Rate limit: 20 emails per hour per user
  const userId = session.user?.id || "anonymous";
  const { allowed, remaining } = checkRateLimit(`email:${userId}`, {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000,
  });

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded. Max 20 emails per hour." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = sendEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { to, subject, text, html, cc, bcc, replyTo, template, templateData, relatedType, relatedId } = parsed.data;

  let emailSubject = subject;
  let emailHtml = html || "";

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

  try {
    const result = await sendEmail({
      to,
      subject: emailSubject,
      text,
      html: emailHtml,
      cc,
      bcc,
      replyTo,
    });

    // Log successful email to database
    await prisma.emailLog.create({
      data: {
        to: Array.isArray(to) ? to.join(", ") : to,
        cc: cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : null,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(", ") : bcc) : null,
        subject: emailSubject,
        body: emailHtml,
        template: template || "custom",
        status: "sent",
        messageId: result.messageId,
        relatedType: relatedType || (template === "quotation" ? "quotation" : null),
        relatedId: relatedId || null,
        sentById: session.user?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
    });
  } catch (error) {
    // Log failed email attempt
    await prisma.emailLog.create({
      data: {
        to: Array.isArray(to) ? to.join(", ") : to,
        subject: emailSubject,
        body: emailHtml,
        template: template || "custom",
        status: "failed",
        errorMsg: (error as Error).message,
        relatedType: relatedType || null,
        relatedId: relatedId || null,
        sentById: session.user?.id || null,
      },
    }).catch(() => {}); // Don't fail if logging fails

    throw error;
  }
});
