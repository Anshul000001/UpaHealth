export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const sendSchema = z.object({
  to: z.string().email(),
  toName: z.string().optional(),
  subject: z.string().min(1),
  bodyText: z.string().optional(),
  bodyHtml: z.string().optional(),
  cc: z.string().optional(),
  replyTo: z.string().email().optional(),
  threadId: z.string().optional(),
  attachmentIds: z.array(z.string()).optional(),
  relatedType: z.string().optional(),
  relatedId: z.string().optional(),
});

/**
 * POST /api/mailbox/send — Send email and log to mailbox + thread
 */
export const POST = apiHandler(async (req) => {
  const session = await requireAuth("write");

  const userId = session.user?.id || "anonymous";
  const { allowed } = checkRateLimit(`mailbox:${userId}`, {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000,
  });

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded. Max 20 emails per hour." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = sendSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { to, toName, subject, bodyText, bodyHtml, cc, replyTo, threadId, attachmentIds, relatedType, relatedId } = parsed.data;

  // Get attachments if any
  let attachments: Array<{ filename: string; content: string; encoding: string; contentType: string }> = [];
  if (attachmentIds && attachmentIds.length > 0) {
    const files = await prisma.sharedFile.findMany({
      where: { id: { in: attachmentIds } },
      select: { filename: true, mimeType: true, data: true },
    });
    attachments = files.map((f) => ({
      filename: f.filename,
      content: f.data, // already base64
      encoding: "base64",
      contentType: f.mimeType || "application/octet-stream",
    }));
    console.log(`[Mailbox Send] Attaching ${attachments.length} files:`, attachments.map(a => `${a.filename} (${a.content.length} base64 chars)`));
  }

  const fromEmail = process.env.GMAIL_USER || "noreply@upahealthsupplies.com";
  const html = bodyHtml || `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#0f766e;padding:20px;text-align:center"><h1 style="color:white;margin:0">UpaHealth Supplies</h1><p style="color:#ccfbf1;margin:5px 0 0">Your Path to Wellness</p></div><div style="padding:30px;background:#f9fafb"><p>${(bodyText || "").replace(/\n/g, "<br/>")}</p><p style="margin-top:30px;color:#6b7280;font-size:14px">Sent from UpaHealth<br/><a href="https://www.upahealthsupplies.com">www.upahealthsupplies.com</a></p></div></div>`;

  try {
    const result = await sendEmail({
      to,
      subject,
      text: bodyText,
      html,
      cc: cc || undefined,
      replyTo: replyTo || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    // Find or create thread
    let msgThreadId = threadId;
    if (!msgThreadId) {
      const thread = await prisma.mailThread.create({
        data: {
          subject,
          participants: [fromEmail, to],
          lastMessageAt: new Date(),
          messageCount: 1,
          unreadCount: 0,
          labels: [],
          relatedType,
          relatedId,
        },
      });
      msgThreadId = thread.id;
    } else {
      await prisma.mailThread.update({
        where: { id: msgThreadId },
        data: {
          lastMessageAt: new Date(),
          messageCount: { increment: 1 },
        },
      });
    }

    // Log to mailbox
    const message = await prisma.mailboxMessage.create({
      data: {
        threadId: msgThreadId,
        direction: "outbound",
        from: fromEmail,
        fromName: "UpaHealth Supplies",
        to,
        toName: toName || null,
        cc: cc || null,
        subject,
        bodyText,
        bodyHtml: html,
        snippet: (bodyText || "").slice(0, 120),
        status: "read",
        messageId: result.messageId,
        labels: [],
        relatedType,
        relatedId,
      },
    });

    // Link attachments to message
    if (attachmentIds && attachmentIds.length > 0) {
      await prisma.sharedFile.updateMany({
        where: { id: { in: attachmentIds } },
        data: { messageId: message.id },
      });
    }

    // Also log to EmailLog for backwards compatibility
    await prisma.emailLog.create({
      data: {
        to,
        cc: cc || null,
        subject,
        body: html,
        template: "custom",
        status: "sent",
        messageId: result.messageId,
        relatedType,
        relatedId,
        sentById: session.user?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        messageId: result.messageId,
        threadId: msgThreadId,
        mailboxMessageId: message.id,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
});
