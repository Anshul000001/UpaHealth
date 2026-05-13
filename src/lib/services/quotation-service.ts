import { prisma } from "@/lib/prisma";
import { generateQuotationId } from "@/lib/utils";
import type { QuotationCreateInput, QuotationUpdateInput } from "@/lib/validators/quotation";

function calcLineItem(item: {
  quantity: number;
  unitPrice: number;
  costPrice: number;
  gstRate: number;
  discount: number;
}) {
  const subtotal = item.quantity * item.unitPrice;
  const discountAmt = subtotal * (item.discount / 100);
  const taxable = subtotal - discountAmt;
  const gstAmt = taxable * (item.gstRate / 100);
  const lineTotal = taxable + gstAmt;
  const marginPercent = item.unitPrice > 0
    ? ((item.unitPrice - item.costPrice) / item.unitPrice) * 100
    : 0;
  return { lineTotal, marginPercent };
}

export async function getQuotations(opts: {
  status?: string;
  cursor?: string;
  pageSize?: number;
  userId?: string;
}) {
  const { status, cursor, pageSize = 20, userId } = opts;
  const where = {
    ...(status ? { status: status as never } : {}),
    ...(userId ? { createdById: userId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      take: pageSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        lineItems: true,
        createdBy: { select: { name: true, email: true } },
        lead: { select: { name: true } },
      },
    }),
    prisma.quotation.count({ where }),
  ]);

  const hasMore = items.length > pageSize;
  const data = hasMore ? items.slice(0, pageSize) : items;
  return { data, total, nextCursor: hasMore ? data[data.length - 1].id : undefined };
}

export async function getQuotationById(id: string) {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      lineItems: { include: { product: true } },
      createdBy: { select: { name: true, email: true } },
      lead: true,
    },
  });
}

export async function createQuotation(input: QuotationCreateInput, createdById: string) {
  const quotationId = generateQuotationId();

  let subtotal = 0;
  let totalDiscount = 0;
  let totalGST = 0;

  const lineItemsData = input.lineItems.map((item) => {
    const s = item.quantity * item.unitPrice;
    const d = s * (item.discount / 100);
    const taxable = s - d;
    const gst = taxable * (item.gstRate / 100);
    const { lineTotal, marginPercent } = calcLineItem(item);
    subtotal += s;
    totalDiscount += d;
    totalGST += gst;
    return {
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      costPrice: item.costPrice,
      gstRate: item.gstRate,
      discount: item.discount,
      lineTotal,
      marginPercent,
    };
  });

  const grandTotal = subtotal - totalDiscount + totalGST + (input.freight ?? 0);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + input.validityDays);

  const quotation = await prisma.quotation.create({
    data: {
      quotationId,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail || null,
      buyerAddress: input.buyerAddress || null,
      buyerCountry: input.buyerCountry || null,
      currency: input.currency,
      validityDays: input.validityDays,
      freight: input.freight ?? 0,
      notes: input.notes || null,
      leadId: input.leadId || null,
      createdById,
      subtotal,
      totalDiscount,
      totalGST,
      grandTotal,
      expiresAt,
      lineItems: { create: lineItemsData },
    },
    include: { lineItems: true },
  });

  // Auto-advance lead stage if linked
  if (input.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: input.leadId } });
    if (lead && lead.stage !== "Quotation Sent" && lead.stage !== "Negotiation" &&
        lead.stage !== "Order Confirmed" && lead.stage !== "Closed Won") {
      await prisma.$transaction([
        prisma.lead.update({ where: { id: input.leadId }, data: { stage: "Quotation Sent" } }),
        prisma.leadStageTransition.create({
          data: { leadId: input.leadId, fromStage: lead.stage, toStage: "Quotation Sent" },
        }),
      ]);
    }
  }

  return quotation;
}

export async function updateQuotation(id: string, input: QuotationUpdateInput) {
  return prisma.quotation.update({ where: { id }, data: input });
}

export async function expireOverdueQuotations() {
  return prisma.quotation.updateMany({
    where: {
      status: "SENT",
      expiresAt: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });
}
