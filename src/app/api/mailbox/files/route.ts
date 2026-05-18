export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * GET /api/mailbox/files — List shared files
 */
export const GET = apiHandler(async (req) => {
  await requireAuth("read");

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 20), 50);
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  let where: Record<string, unknown> = {};
  if (category && category !== "all") {
    where.category = category;
  }
  if (search) {
    where = {
      ...where,
      OR: [
        { filename: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [files, total] = await Promise.all([
    prisma.sharedFile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        description: true,
        category: true,
        sharedWith: true,
        relatedType: true,
        relatedId: true,
        downloadCount: true,
        uploadedById: true,
        createdAt: true,
      },
    }),
    prisma.sharedFile.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: files,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
});

/**
 * POST /api/mailbox/files — Upload a shared file
 */
const uploadSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().optional(),
  data: z.string().min(1), // base64
  description: z.string().optional(),
  category: z.enum(["general", "pdf", "catalog", "quotation", "brochure", "certificate"]).optional(),
  sharedWith: z.array(z.string().email()).optional(),
  relatedType: z.string().optional(),
  relatedId: z.string().optional(),
  messageId: z.string().optional(),
});

export const POST = apiHandler(async (req) => {
  const session = await requireAuth("write");

  const body = await req.json();
  const parsed = uploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { filename, mimeType, data, description, category, sharedWith, relatedType, relatedId, messageId } = parsed.data;

  // Check size (base64 is ~33% larger)
  const sizeBytes = Math.ceil((data.length * 3) / 4);
  if (sizeBytes > 10 * 1024 * 1024) {
    return NextResponse.json(
      { success: false, error: "File must be under 10MB" },
      { status: 400 }
    );
  }

  // Auto-detect category from mime type if not provided
  let fileCategory = category || "general";
  if (!category) {
    if (mimeType?.includes("pdf")) fileCategory = "pdf";
    else if (filename.toLowerCase().includes("catalog")) fileCategory = "catalog";
    else if (filename.toLowerCase().includes("brochure")) fileCategory = "brochure";
    else if (filename.toLowerCase().includes("certificate") || filename.toLowerCase().includes("cert")) fileCategory = "certificate";
  }

  const file = await prisma.sharedFile.create({
    data: {
      filename,
      mimeType: mimeType || "application/octet-stream",
      size: sizeBytes,
      data,
      description,
      category: fileCategory,
      sharedWith: sharedWith || [],
      relatedType,
      relatedId,
      messageId,
      uploadedById: session.user?.id || null,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: file.id,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      category: file.category,
      createdAt: file.createdAt,
    },
  }, { status: 201 });
});
