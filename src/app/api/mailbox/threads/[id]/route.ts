export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/mailbox/threads/[id] — Get all messages in a thread
 */
export const GET = apiHandler(async (_req, ctx) => {
  await requireAuth("read");
  const { id } = await ctx.params;

  const thread = await prisma.mailThread.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { sentAt: "asc" },
        include: {
          attachments: {
            select: { id: true, filename: true, mimeType: true, size: true, category: true },
          },
        },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ success: false, error: "Thread not found" }, { status: 404 });
  }

  // Mark all unread messages in thread as read
  await prisma.mailboxMessage.updateMany({
    where: { threadId: id, status: "unread" },
    data: { status: "read", readAt: new Date() },
  });

  await prisma.mailThread.update({
    where: { id },
    data: { unreadCount: 0 },
  });

  return NextResponse.json({ success: true, data: thread });
});
