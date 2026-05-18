export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/communications/attachments
 * Upload a file as base64. Max 4MB.
 * Body: { filename, mimeType, data (base64 string) }
 */
export const POST = apiHandler(async (req) => {
  await requireAuth("write");
  const body = await req.json();
  const { filename, mimeType, data } = body;

  if (!filename || !data) {
    return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "filename and data required" } }, { status: 400 });
  }

  // Check size (base64 is ~33% larger than original)
  const sizeBytes = Math.ceil((data.length * 3) / 4);
  if (sizeBytes > 4 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: { code: "TOO_LARGE", message: "File must be under 4MB" } }, { status: 400 });
  }

  const attachment = await prisma.emailAttachment.create({
    data: {
      filename,
      mimeType: mimeType || "application/octet-stream",
      size: sizeBytes,
      data,
    },
  });

  return NextResponse.json({
    success: true,
    data: { id: attachment.id, filename: attachment.filename, size: attachment.size },
  }, { status: 201 });
});

/**
 * GET /api/communications/attachments
 * List recent attachments.
 */
export const GET = apiHandler(async () => {
  await requireAuth("read");
  const attachments = await prisma.emailAttachment.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, filename: true, mimeType: true, size: true, createdAt: true },
  });
  return NextResponse.json({ success: true, data: attachments });
});
