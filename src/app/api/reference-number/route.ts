export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { formatCompanyRef, getFinancialYear } from "@/lib/utils";

const VALID_TYPES = ["QT", "CAT", "PRJ", "RFQ", "REQ", "PO"] as const;
type DocType = (typeof VALID_TYPES)[number];

async function getPrefix(): Promise<string> {
  const setting = await prisma.appSetting.findUnique({
    where: { key: "companyRefPrefix" },
  });
  return setting?.value || "UH";
}

async function getNextNumber(type: DocType): Promise<number> {
  const fy = getFinancialYear();
  const counterKey = `counter_${type}_${fy}`;

  // Use a transaction to ensure atomicity
  const nextNumber = await prisma.$transaction(async (tx) => {
    const existing = await tx.appSetting.findUnique({
      where: { key: counterKey },
    });

    if (existing) {
      const current = parseInt(existing.value, 10) || 0;
      const next = current + 1;
      await tx.appSetting.update({
        where: { key: counterKey },
        data: { value: String(next) },
      });
      return next;
    } else {
      await tx.appSetting.create({
        data: { key: counterKey, value: "1" },
      });
      return 1;
    }
  });

  return nextNumber;
}

async function peekNextNumber(type: DocType): Promise<number> {
  const fy = getFinancialYear();
  const counterKey = `counter_${type}_${fy}`;

  const existing = await prisma.appSetting.findUnique({
    where: { key: counterKey },
  });

  return (parseInt(existing?.value || "0", 10)) + 1;
}

/**
 * GET /api/reference-number?type=QT&action=generate
 * Generates and reserves the next sequential reference number.
 * 
 * GET /api/reference-number?type=QT&action=preview (default)
 * Previews the next number without reserving it.
 * 
 * Types: QT (Quotation), CAT (Catalog), PRJ (Project), RFQ, REQ, PO
 * Format: {companyPrefix}/{FY}/{type}/{0001}
 * e.g., UH/2025-26/QT/0001
 */
export const GET = apiHandler(async (req) => {
  await requireAuth("read");

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "QT").toUpperCase() as DocType;
  const action = searchParams.get("action") || "preview";

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_TYPE", message: `Type must be one of: ${VALID_TYPES.join(", ")}` } },
      { status: 400 }
    );
  }

  const prefix = await getPrefix();
  const fy = getFinancialYear();

  let sequentialNumber: number;
  if (action === "generate") {
    sequentialNumber = await getNextNumber(type);
  } else {
    sequentialNumber = await peekNextNumber(type);
  }

  const referenceNumber = formatCompanyRef(prefix, type, sequentialNumber);

  return NextResponse.json({
    success: true,
    data: {
      referenceNumber,
      prefix,
      type,
      financialYear: fy,
      sequentialNumber,
      isPreview: action !== "generate",
    },
  });
});

/**
 * POST /api/reference-number
 * Generate (reserve) the next reference number.
 * Body: { type: "QT" }
 */
export const POST = apiHandler(async (req) => {
  await requireAuth("write");

  const body = await req.json();
  const type = (body.type || "QT").toUpperCase() as DocType;

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_TYPE", message: `Type must be one of: ${VALID_TYPES.join(", ")}` } },
      { status: 400 }
    );
  }

  const prefix = await getPrefix();
  const fy = getFinancialYear();
  const sequentialNumber = await getNextNumber(type);
  const referenceNumber = formatCompanyRef(prefix, type, sequentialNumber);

  return NextResponse.json({
    success: true,
    data: {
      referenceNumber,
      prefix,
      type,
      financialYear: fy,
      sequentialNumber,
    },
  });
});
