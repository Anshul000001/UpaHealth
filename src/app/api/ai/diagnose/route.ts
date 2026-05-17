export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { nvidiaAI, NVIDIA_MODEL } from "@/lib/nvidia-ai";

/**
 * GET /api/ai/diagnose
 * Runs a full system health check — DB, AI, counts.
 */
export const GET = apiHandler(async () => {
  await requireAuth("read");

  const checks: { name: string; status: "ok" | "error"; detail: string }[] = [];

  // 1. Database connection
  try {
    const count = await prisma.product.count();
    checks.push({ name: "Supabase DB", status: "ok", detail: `Connected — ${count} products` });
  } catch (e) {
    checks.push({ name: "Supabase DB", status: "error", detail: (e as Error).message });
  }

  // 2. Products
  try {
    const count = await prisma.product.count();
    checks.push({ name: "Products", status: count > 0 ? "ok" : "error", detail: `${count} products in catalogue` });
  } catch {
    checks.push({ name: "Products", status: "error", detail: "Query failed" });
  }

  // 3. Suppliers
  try {
    const count = await prisma.supplier.count();
    checks.push({ name: "Suppliers", status: count > 0 ? "ok" : "error", detail: `${count} suppliers` });
  } catch {
    checks.push({ name: "Suppliers", status: "error", detail: "Query failed" });
  }

  // 4. Leads
  try {
    const count = await prisma.lead.count();
    checks.push({ name: "Leads/CRM", status: "ok", detail: `${count} leads in pipeline` });
  } catch {
    checks.push({ name: "Leads/CRM", status: "error", detail: "Query failed" });
  }

  // 5. AI Agents
  try {
    const count = await prisma.aIAgent.count();
    checks.push({ name: "AI Agents", status: count > 0 ? "ok" : "error", detail: `${count} agents registered` });
  } catch {
    checks.push({ name: "AI Agents", status: "error", detail: "Query failed" });
  }

  // 6. Tenders
  try {
    const count = await prisma.tender.count();
    checks.push({ name: "Tenders", status: "ok", detail: `${count} tenders scanned` });
  } catch {
    checks.push({ name: "Tenders", status: "error", detail: "Query failed" });
  }

  // 7. NVIDIA AI
  try {
    const completion = await nvidiaAI.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
      max_tokens: 5,
      temperature: 0,
    });
    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    checks.push({ name: "NVIDIA AI (Llama 3.1)", status: reply.includes("OK") ? "ok" : "error", detail: reply ? `Response: "${reply}"` : "No response" });
  } catch (e) {
    checks.push({ name: "NVIDIA AI (Llama 3.1)", status: "error", detail: (e as Error).message.slice(0, 100) });
  }

  // 8. Settings table
  try {
    const count = await prisma.appSetting.count();
    checks.push({ name: "Settings Storage", status: "ok", detail: `${count} settings saved` });
  } catch {
    checks.push({ name: "Settings Storage", status: "error", detail: "Table missing" });
  }

  const allOk = checks.every((c) => c.status === "ok");

  return NextResponse.json({
    success: true,
    data: {
      healthy: allOk,
      checks,
      timestamp: new Date().toISOString(),
    },
  });
});
