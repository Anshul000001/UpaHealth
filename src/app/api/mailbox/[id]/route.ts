export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * GET /api/mailbox/[id] — Get single message with full body
 */
export const GET = apiHandler(async (_req, ctx) => {
  await requireAuth("read");
  const { id } = await ctx.params;

  const message = await prisma.mailboxMessage.findUnique({
    where: { id },
    include: {
      attachments: {
        select: { id: true, filename: true, mimeType: true, size: true, category: true, createdAt: true },
      },
    },
  });

  if (!message) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  // Mark as read
  if (message.status === "unread") {
    await prisma.mailboxMessage.update({
      where: { id },
      data: { status: "read", readAt: new Date() },
    });
    if (message.threadId) {
      await prisma.mailThread.update({
        where: { id: message.threadId },
        data: { unreadCount: { decrement: 1 } },
      });
    }
  }

  return NextResponse.json({ success: true, data: message });
});

/**
 * PATCH /api/mailbox/[id] — Update message (star, archive, trash, labels)
 */
const updateSchema = z.object({
  status: z.enum(["unread", "read", "archived", "starred", "trash"]).optional(),
  starred: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
});

export const PATCH = apiHandler(async (req, ctx) => {
  await requireAuth("write");
  const { id } = await ctx.params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const message = await prisma.mailboxMessage.update({
    where: { id },
    data: {
      ...parsed.data,
      readAt: parsed.data.status === "read" ? new Date() : undefined,
    },
  });

  return NextResponse.json({ success: true, data: message });
});

/**
 * DELETE /api/mailbox/[id] — Permanently delete message
 */
export const DELETE = apiHandler(async (_req, ctx) => {
  await requireAuth("delete");
  const { id } = await ctx.params;

  await prisma.mailboxMessage.delete({ where: { id } });

  return NextResponse.json({ success: true });
});
