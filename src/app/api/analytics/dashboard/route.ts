export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { getDashboardMetrics, getRevenueByMonth, getTopProducts, getPipelineByStage } from "@/lib/services/analytics-service";

export const GET = apiHandler(async () => {
  await requireAuth("read");
  const [metrics, revenueByMonth, topProducts, pipeline] = await Promise.all([
    getDashboardMetrics(),
    getRevenueByMonth(),
    getTopProducts(5),
    getPipelineByStage(),
  ]);
  return NextResponse.json({ success: true, data: { metrics, revenueByMonth, topProducts, pipeline } });
});
