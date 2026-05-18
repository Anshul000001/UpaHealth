export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * GET /api/mailbox/files/[id] — Download a file (returns base64 data)
 */
export const GET = apiHandler(async (_req, ctx) => {
  await requireAuth("read");
  const { id } = await ctx.params;

  const file = await prisma.sharedFile.findUnique({ where: { id } });

  if (!file) {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }

  // Increment download count
  await prisma.sharedFile.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: file.id,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      data: file.data,
      category: file.category,
      description: file.description,
    },
  });
});

/**
 * PATCH /api/mailbox/files/[id] — Update file metadata (share with customers, update description)
 */
const updateSchema = z.object({
  description: z.string().optional(),
  category: z.enum(["general", "pdf", "catalog", "quotation", "brochure", "certificate"]).optional(),
  sharedWith: z.array(z.string().email()).optional(),
  relatedType: z.string().optional(),
  relatedId: z.string().optional(),
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

  const file = await prisma.sharedFile.update({
    where: { id },
    data: parsed.data,
    select: {
      id: true,
      filename: true,
      mimeType: true,
      size: true,
      description: true,
      category: true,
      sharedWith: true,
      downloadCount: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, data: file });
});

/**
 * DELETE /api/mailbox/files/[id] — Delete a shared file
 */
export const DELETE = apiHandler(async (_req, ctx) => {
  await requireAuth("delete");
  const { id } = await ctx.params;

  await prisma.sharedFile.delete({ where: { id } });

  return NextResponse.json({ success: true });
});
