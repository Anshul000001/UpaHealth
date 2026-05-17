export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * PATCH /api/auth/profile
 * Update current user's name and/or password.
 */
export const PATCH = apiHandler(async (req) => {
  const session = await requireAuth("read");
  const body = await req.json();
  const { name, currentPassword, newPassword } = body;

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
  }

  const updates: { name?: string; passwordHash?: string } = {};

  // Update name
  if (name && name.trim() !== user.name) {
    updates.name = name.trim();
  }

  // Update password
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Current password is required" } }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Current password is incorrect" } }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "New password must be at least 6 characters" } }, { status: 400 });
    }
    updates.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: true, data: { message: "No changes" } });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updates,
  });

  return NextResponse.json({ success: true, data: { message: "Profile updated successfully", updated: Object.keys(updates) } });
});
