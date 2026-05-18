export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/mailbox/files/upload — Upload a file via FormData (supports large files up to 10MB)
 * This endpoint uses FormData instead of JSON to bypass Next.js body size limits.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth("write");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const description = formData.get("description") as string | null;
    const category = formData.get("category") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Check size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File must be under 10MB" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // Auto-detect category
    let fileCategory = category || "general";
    if (!category) {
      if (file.type.includes("pdf")) fileCategory = "pdf";
      else if (file.name.toLowerCase().includes("catalog")) fileCategory = "catalog";
      else if (file.name.toLowerCase().includes("brochure")) fileCategory = "brochure";
      else if (file.name.toLowerCase().includes("certificate") || file.name.toLowerCase().includes("cert")) fileCategory = "certificate";
    }

    const savedFile = await prisma.sharedFile.create({
      data: {
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        data: base64Data,
        description: description || null,
        category: fileCategory,
        sharedWith: [],
        uploadedById: session.user?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: savedFile.id,
        filename: savedFile.filename,
        mimeType: savedFile.mimeType,
        size: savedFile.size,
        category: savedFile.category,
        createdAt: savedFile.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[File Upload Error]", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Upload failed" },
      { status: 500 }
    );
  }
}
