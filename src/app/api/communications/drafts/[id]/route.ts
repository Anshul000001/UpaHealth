export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/communications/drafts/:id
 * Soft-deletes an email draft.
 */
export const DELETE = apiHandler(async (_req, { params }) => {
  await requireAuth("write");
  const { id } = await params;

  const draft = await prisma.outreachEmail.findUnique({ where: { id } });
  if (!draft) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Draft not found" } }, { status: 404 });
  }

  await prisma.outreachEmail.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true, data: { deleted: true } });
});

/**
 * PATCH /api/communications/drafts/:id
 * Update a draft (subject, body, toEmail).
 */
export const PATCH = apiHandler(async (req, { params }) => {
  await requireAuth("write");
  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.outreachEmail.update({
    where: { id },
    data: {
      ...(body.subject ? { subject: body.subject } : {}),
      ...(body.body ? { body: body.body } : {}),
      ...(body.toEmail !== undefined ? { toEmail: body.toEmail } : {}),
    },
  });

  return NextResponse.json({ success: true, data: updated });
});
