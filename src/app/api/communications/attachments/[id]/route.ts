export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/communications/attachments/:id
 * Download an attachment as a file.
 */
export const GET = apiHandler(async (_req, { params }) => {
  await requireAuth("read");
  const { id } = await params;

  const attachment = await prisma.emailAttachment.findUnique({ where: { id } });
  if (!attachment) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Attachment not found" } }, { status: 404 });
  }

  // Return the base64 data with proper content type
  const buffer = Buffer.from(attachment.data, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `attachment; filename="${attachment.filename}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
});

/**
 * DELETE /api/communications/attachments/:id
 */
export const DELETE = apiHandler(async (_req, { params }) => {
  await requireAuth("write");
  const { id } = await params;
  await prisma.emailAttachment.delete({ where: { id } });
  return NextResponse.json({ success: true, data: { deleted: true } });
});
