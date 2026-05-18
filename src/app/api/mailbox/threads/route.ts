export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/mailbox/threads — List conversation threads
 */
export const GET = apiHandler(async (req) => {
  await requireAuth("read");

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 20), 50);
  const status = searchParams.get("status") ?? "active";
  const search = searchParams.get("search") ?? undefined;

  let where: Record<string, unknown> = { status };

  if (search) {
    where = {
      ...where,
      OR: [
        { subject: { contains: search, mode: "insensitive" } },
        { participants: { has: search } },
      ],
    };
  }

  const [threads, total] = await Promise.all([
    prisma.mailThread.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1,
          select: {
            id: true,
            from: true,
            fromName: true,
            snippet: true,
            direction: true,
            sentAt: true,
          },
        },
      },
    }),
    prisma.mailThread.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: threads,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
});
