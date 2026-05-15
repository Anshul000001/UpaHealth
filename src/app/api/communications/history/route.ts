import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (req) => {
  await requireAuth("read");

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 20), 50);
  const search = searchParams.get("search") ?? undefined;

  const where = search
    ? {
        OR: [
          { to: { contains: search, mode: "insensitive" as const } },
          { subject: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [emails, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { sentAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        to: true,
        subject: true,
        template: true,
        status: true,
        messageId: true,
        relatedType: true,
        relatedId: true,
        sentAt: true,
        errorMsg: true,
      },
    }),
    prisma.emailLog.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: emails,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
});
