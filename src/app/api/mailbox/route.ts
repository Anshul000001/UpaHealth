export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * GET /api/mailbox — List mailbox messages (inbox, sent, starred, archived, trash)
 */
export const GET = apiHandler(async (req) => {
  await requireAuth("read");

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") ?? "inbox"; // inbox, sent, starred, archived, trash, all
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 20), 50);
  const search = searchParams.get("search") ?? undefined;

  let where: Record<string, unknown> = {};

  switch (folder) {
    case "inbox":
      where = { direction: "inbound", status: { not: "trash" } };
      break;
    case "sent":
      where = { direction: "outbound", status: { not: "trash" } };
      break;
    case "starred":
      where = { starred: true, status: { not: "trash" } };
      break;
    case "archived":
      where = { status: "archived" };
      break;
    case "trash":
      where = { status: "trash" };
      break;
    default:
      where = { status: { not: "trash" } };
  }

  if (search) {
    where = {
      ...where,
      OR: [
        { from: { contains: search, mode: "insensitive" } },
        { to: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { fromName: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [messages, total] = await Promise.all([
    prisma.mailboxMessage.findMany({
      where,
      orderBy: { sentAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        threadId: true,
        direction: true,
        from: true,
        fromName: true,
        to: true,
        toName: true,
        subject: true,
        snippet: true,
        status: true,
        starred: true,
        labels: true,
        relatedType: true,
        relatedId: true,
        sentAt: true,
        readAt: true,
        attachments: {
          select: { id: true, filename: true, size: true, mimeType: true },
        },
      },
    }),
    prisma.mailboxMessage.count({ where }),
  ]);

  // Get counts for sidebar badges
  const [unreadCount, starredCount, sentCount] = await Promise.all([
    prisma.mailboxMessage.count({ where: { direction: "inbound", status: "unread" } }),
    prisma.mailboxMessage.count({ where: { starred: true, status: { not: "trash" } } }),
    prisma.mailboxMessage.count({ where: { direction: "outbound", status: { not: "trash" } } }),
  ]);

  return NextResponse.json({
    success: true,
    data: messages,
    counts: { unread: unreadCount, starred: starredCount, sent: sentCount },
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
});

/**
 * POST /api/mailbox — Create a new message (log inbound or compose outbound)
 */
const createMessageSchema = z.object({
  direction: z.enum(["inbound", "outbound"]),
  from: z.string().email(),
  fromName: z.string().optional(),
  to: z.string().email(),
  toName: z.string().optional(),
  cc: z.string().optional(),
  subject: z.string().min(1),
  bodyText: z.string().optional(),
  bodyHtml: z.string().optional(),
  labels: z.array(z.string()).optional(),
  relatedType: z.string().optional(),
  relatedId: z.string().optional(),
  threadId: z.string().optional(),
});

export const POST = apiHandler(async (req) => {
  await requireAuth("write");

  const body = await req.json();
  const parsed = createMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const snippet = (data.bodyText || "").slice(0, 120);

  // Find or create thread
  let threadId = data.threadId;
  if (!threadId) {
    const thread = await prisma.mailThread.create({
      data: {
        subject: data.subject,
        participants: [data.from, data.to],
        lastMessageAt: new Date(),
        messageCount: 1,
        unreadCount: data.direction === "inbound" ? 1 : 0,
        labels: data.labels || [],
        relatedType: data.relatedType,
        relatedId: data.relatedId,
      },
    });
    threadId = thread.id;
  } else {
    await prisma.mailThread.update({
      where: { id: threadId },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
        unreadCount: data.direction === "inbound" ? { increment: 1 } : undefined,
      },
    });
  }

  const message = await prisma.mailboxMessage.create({
    data: {
      threadId,
      direction: data.direction,
      from: data.from,
      fromName: data.fromName,
      to: data.to,
      toName: data.toName,
      cc: data.cc,
      subject: data.subject,
      bodyText: data.bodyText,
      bodyHtml: data.bodyHtml,
      snippet,
      status: data.direction === "inbound" ? "unread" : "read",
      labels: data.labels || [],
      relatedType: data.relatedType,
      relatedId: data.relatedId,
    },
  });

  return NextResponse.json({ success: true, data: message }, { status: 201 });
});
