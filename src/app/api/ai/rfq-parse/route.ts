export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { nvidiaAI, NVIDIA_MODEL } from "@/lib/nvidia-ai";
import { prisma } from "@/lib/prisma";

/**
 * RFQ Parser API
 *
 * Accepts RFQ content in two ways:
 *   1) multipart/form-data with a "file" field (PDF / DOCX / TXT / EML)
 *   2) JSON { text: string } for pasted RFQ text
 *
 * Pipeline:
 *   1. Extract raw text from the input
 *   2. Send to NVIDIA NIM with a strict-JSON prompt
 *   3. Parse and fuzzy-match each line item to products in the DB
 *   4. Return structured RFQ ready to convert to a quotation
 */

interface ParsedLineItem {
  raw: string;
  productName: string;
  quantity: number;
  unit: string;
  specifications: string;
  matchedProductId: string | null;
  matchedProductName: string | null;
  matchedSku: string | null;
  unitPrice: number | null;
  estimatedTotal: number | null;
  confidence: "high" | "medium" | "low";
}

interface RFQParseResult {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCountry: string;
  rfqDate: string;
  deliveryRequired: string;
  currency: "INR" | "USD";
  items: ParsedLineItem[];
  totalEstimate: number;
  matchedItemCount: number;
  totalItemCount: number;
  notes: string;
}

// ─────────────────────────────────────────────────────────────────
// Text extraction
// ─────────────────────────────────────────────────────────────────
async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = (file.name || "").toLowerCase();

  // Plain text / email
  if (name.endsWith(".txt") || name.endsWith(".eml") || file.type.startsWith("text/")) {
    return buffer.toString("utf-8");
  }

  // PDF — pdf-parse v2.4+ exports a PDFParse class
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    // Convert Buffer to Uint8Array for pdfjs-dist
    const data = new Uint8Array(buffer);
    const parser = new PDFParse({ data });
    try {
      const result = await parser.getText();
      return result.text || "";
    } finally {
      await parser.destroy().catch(() => { /* ignore */ });
    }
  }

  // DOCX
  if (
    name.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  // Fallback — try as text
  return buffer.toString("utf-8");
}

// ─────────────────────────────────────────────────────────────────
// AI parsing — strict JSON output
// ─────────────────────────────────────────────────────────────────
async function aiParseRFQ(rfqText: string, products: Array<{ id: string; name: string; sku: string; sellingPrice: number; exportPrice: number; moq: number; unit: string; category: string }>) {
  const productCatalog = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    inr: p.sellingPrice,
    usd: p.exportPrice,
    moq: p.moq,
    unit: p.unit,
    category: p.category,
  }));

  // Trim very long RFQs to keep within token budget
  const TRUNCATE_AT = 8000;
  const truncated = rfqText.length > TRUNCATE_AT
    ? rfqText.slice(0, TRUNCATE_AT) + "\n... [TRUNCATED]"
    : rfqText;

  const systemPrompt = `You are an RFQ (Request for Quotation) parser for UpaHealth Supplies, a B2B medical consumables platform.

Parse the buyer's RFQ document and extract structured order information.

## Available Products in DB (${productCatalog.length}):
${JSON.stringify(productCatalog, null, 0)}

## Response Format — STRICT JSON only, no markdown, no code blocks:
{
  "buyerName": "extracted hospital/company name or 'Unknown'",
  "buyerEmail": "email if found or empty string",
  "buyerPhone": "phone if found or empty string",
  "buyerCountry": "country if found or 'India'",
  "rfqDate": "YYYY-MM-DD if found or today",
  "deliveryRequired": "delivery date/timeline or 'ASAP'",
  "currency": "INR or USD",
  "items": [
    {
      "raw": "the line as it appears in the RFQ",
      "productName": "the product the buyer is asking for",
      "quantity": 1000,
      "unit": "piece|box|kit|set|pack",
      "specifications": "size, gauge, material, brand notes",
      "matchedProductId": "id from DB if you can match, or null",
      "confidence": "high|medium|low"
    }
  ],
  "notes": "any special requirements, payment terms, etc."
}

## Rules
- Extract EVERY line item the buyer is asking for
- For each item, try to match against the DB products by name/SKU/category
- Use "high" confidence only for clear name/SKU matches
- Use "medium" if you matched by category or close name
- Use "low" if you're guessing
- If no match, set matchedProductId to null
- Understand medical abbreviations (IV, PPE, FG, G, ML, etc.)
- Handle quantities like "10 boxes", "5000 pcs", "2 lakh units"`;

  const completion = await nvidiaAI.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Parse this RFQ:\n\n${truncated}` },
    ],
    temperature: 0.1,
    max_tokens: 3000,
  });

  const reply = completion.choices[0]?.message?.content ?? "";
  const jsonMatch = reply.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI did not return parseable JSON");
  }
  return JSON.parse(jsonMatch[0]) as Omit<RFQParseResult, "totalEstimate" | "matchedItemCount" | "totalItemCount">;
}

// ─────────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────────
export const POST = apiHandler(async (req) => {
  await requireAuth("read");

  const contentType = req.headers.get("content-type") || "";
  let rfqText = "";
  let sourceName = "pasted-text";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "file field required" } },
        { status: 400 }
      );
    }
    sourceName = file.name || "uploaded";
    rfqText = await extractText(file);
  } else {
    const body = await req.json();
    if (!body?.text || typeof body.text !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "text field required" } },
        { status: 400 }
      );
    }
    rfqText = body.text;
  }

  if (!rfqText.trim()) {
    return NextResponse.json(
      { success: false, error: { code: "EMPTY_INPUT", message: "Could not extract any text from input" } },
      { status: 400 }
    );
  }

  // Load all products for matching
  const products = await prisma.product.findMany({
    select: {
      id: true, name: true, sku: true, category: true,
      sellingPrice: true, exportPrice: true, moq: true, unit: true,
    },
    orderBy: { name: "asc" },
  });

  // AI parse
  const parsed = await aiParseRFQ(rfqText, products);

  // Enrich items with DB data + fuzzy fallback matching
  const enrichedItems: ParsedLineItem[] = (parsed.items || []).map((item) => {
    let matched = item.matchedProductId
      ? products.find((p) => p.id === item.matchedProductId)
      : undefined;

    // Fuzzy match by name if AI didn't match
    if (!matched && item.productName) {
      const lower = item.productName.toLowerCase();
      matched = products.find(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          lower.includes(p.name.toLowerCase()) ||
          p.sku.toLowerCase() === lower
      );
    }

    const unitPrice = matched
      ? parsed.currency === "USD" ? matched.exportPrice : matched.sellingPrice
      : null;
    const qty = item.quantity || 0;

    return {
      raw: item.raw || item.productName || "",
      productName: item.productName || "",
      quantity: qty,
      unit: item.unit || matched?.unit || "piece",
      specifications: item.specifications || "",
      matchedProductId: matched?.id ?? null,
      matchedProductName: matched?.name ?? null,
      matchedSku: matched?.sku ?? null,
      unitPrice,
      estimatedTotal: unitPrice ? unitPrice * qty : null,
      confidence: matched ? (item.confidence || "medium") : "low",
    };
  });

  const totalEstimate = enrichedItems.reduce((sum, it) => sum + (it.estimatedTotal ?? 0), 0);
  const matchedCount = enrichedItems.filter((it) => it.matchedProductId).length;

  const result: RFQParseResult = {
    buyerName: parsed.buyerName || "Unknown Buyer",
    buyerEmail: parsed.buyerEmail || "",
    buyerPhone: parsed.buyerPhone || "",
    buyerCountry: parsed.buyerCountry || "India",
    rfqDate: parsed.rfqDate || new Date().toISOString().split("T")[0],
    deliveryRequired: parsed.deliveryRequired || "ASAP",
    currency: parsed.currency === "USD" ? "USD" : "INR",
    items: enrichedItems,
    totalEstimate,
    matchedItemCount: matchedCount,
    totalItemCount: enrichedItems.length,
    notes: parsed.notes || "",
  };

  return NextResponse.json({
    success: true,
    data: result,
    meta: { sourceName, textLength: rfqText.length },
  });
});
