export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/settings
 * Returns all app settings from Supabase.
 */
export const GET = apiHandler(async () => {
  await requireAuth("read");
  const settings = await prisma.appSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json({ success: true, data: map });
});

/**
 * POST /api/settings
 * Saves settings to Supabase. Body: { key: value, key2: value2, ... }
 */
export const POST = apiHandler(async (req) => {
  await requireAuth("write");
  const body = await req.json();

  const entries = Object.entries(body).filter(
    ([, v]) => typeof v === "string" || typeof v === "boolean" || typeof v === "number"
  );

  for (const [key, value] of entries) {
    await prisma.appSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }

  return NextResponse.json({ success: true, data: { saved: entries.length } });
});
