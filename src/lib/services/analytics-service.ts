import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
  const [
    totalQuotations,
    activeQuotations,
    acceptedQuotations,
    totalProducts,
    activeSuppliers,
    exportOrders,
    pendingLeads,
    totalLeads,
  ] = await Promise.all([
    prisma.quotation.count(),
    prisma.quotation.count({ where: { status: { in: ["DRAFT", "SENT"] } } }),
    prisma.quotation.count({ where: { status: "ACCEPTED" } }),
    prisma.product.count(),
    prisma.supplier.count({ where: { archived: false } }),
    prisma.quotation.count({ where: { currency: { not: "INR" }, status: "ACCEPTED" } }),
    prisma.lead.count({ where: { stage: { in: ["Lead", "RFQ Received"] } } }),
    prisma.lead.count(),
  ]);

  const conversionRate = totalQuotations > 0
    ? Math.round((acceptedQuotations / totalQuotations) * 100 * 10) / 10
    : 0;

  // Revenue from accepted quotations
  const revenueResult = await prisma.quotation.aggregate({
    where: { status: "ACCEPTED" },
    _sum: { grandTotal: true },
  });
  const totalRevenue = revenueResult._sum.grandTotal ?? 0;

  return {
    totalRevenue,
    activeQuotations,
    conversionRate,
    totalProducts,
    activeSuppliers,
    exportOrders,
    pendingRFQs: pendingLeads,
    totalLeads,
    monthlyGrowth: 0, // Calculated separately
  };
}

export async function getRevenueByMonth() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const quotations = await prisma.quotation.findMany({
    where: {
      status: "ACCEPTED",
      createdAt: { gte: sixMonthsAgo },
    },
    select: { grandTotal: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const monthMap: Record<string, { revenue: number; orders: number }> = {};
  for (const q of quotations) {
    const key = q.createdAt.toLocaleString("en-US", { month: "short", year: "2-digit" });
    if (!monthMap[key]) monthMap[key] = { revenue: 0, orders: 0 };
    monthMap[key].revenue += q.grandTotal;
    monthMap[key].orders += 1;
  }

  return Object.entries(monthMap).map(([month, data]) => ({ month, ...data }));
}

export async function getTopProducts(limit = 5) {
  const lineItems = await prisma.quotationLineItem.groupBy({
    by: ["productName"],
    where: { quotation: { status: "ACCEPTED" } },
    _sum: { lineTotal: true, quantity: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: limit,
  });

  return lineItems.map((item) => ({
    name: item.productName,
    revenue: item._sum.lineTotal ?? 0,
    units: item._sum.quantity ?? 0,
  }));
}

export async function getPipelineByStage() {
  const leads = await prisma.lead.groupBy({
    by: ["stage"],
    _count: { id: true },
    _sum: { estimatedValue: true },
  });

  return leads.map((l) => ({
    stage: l.stage,
    count: l._count.id,
    value: l._sum.estimatedValue ?? 0,
  }));
}
