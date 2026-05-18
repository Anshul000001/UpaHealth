export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { nvidiaAI, NVIDIA_MODEL } from "@/lib/nvidia-ai";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

/**
 * AI Catalog Auto-Builder
 * 
 * Handles requests like:
 * - "make full catalog" / "select all products" → returns every product
 * - "all PPE kits" / "all IV products" → category-based selection
 * - "1000 IV cannula and 500 PPE kits" → specific items with quantities
 * - "ABC hospital needs surgical drapes and gloves" → buyer + items
 */

interface ParsedItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  specifications: string;
  matchedProductId?: string;
  matchedProductName?: string;
  matchedSku?: string;
  sellingPrice?: number;
  exportPrice?: number;
  moq?: number;
  confidence: "high" | "medium" | "low";
}

interface AIParseResponse {
  intent: "select_all" | "select_category" | "select_specific" | "unclear";
  buyerName: string;
  buyerType: string;
  categories: string[];
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    specifications: string;
  }>;
  summary: string;
  suggestions: string[];
}

export const POST = apiHandler(async (req) => {
  await requireAuth("read");

  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "message string required" } },
      { status: 400 }
    );
  }

  // Fetch all products from DB for matching
  const products = await prisma.product.findMany({
    include: { supplier: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });

  if (products.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        intent: "unclear",
        buyerName: "Unknown",
        buyerType: "unknown",
        items: [],
        summary: "No products in database. Add products first via the Products page.",
        totalEstimate: { inr: 0, usd: 0 },
        suggestions: ["Go to Dashboard → Products → Add Product to populate the catalog."],
      },
    });
  }

  const productList = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    sellingPrice: p.sellingPrice,
    exportPrice: p.exportPrice,
    moq: p.moq,
    unit: p.unit,
    stock: p.stock,
  }));

  const systemPrompt = `You are an intelligent catalog parser for UpaHealth Supplies medical consumables company.

Your job: Parse the user's natural language request and identify their intent.

## Available Products in Database (${products.length} items):
${JSON.stringify(productList, null, 0)}

## Available Categories:
${PRODUCT_CATEGORIES.join(", ")}

## Intent Detection:
- "select_all" → User wants ALL products in catalog (phrases: "all products", "full catalog", "select all", "everything", "complete catalog", "make full product catalog")
- "select_category" → User wants all products of certain categories (phrases: "all IV products", "all PPE", "all surgical items", "every gloves")
- "select_specific" → User wants specific products with quantities (phrases: "1000 IV cannula", "500 PPE kits", "I need surgical drapes")
- "unclear" → Cannot understand the request

## Response Format (STRICT JSON only, NO markdown, NO code blocks):
{
  "intent": "select_all|select_category|select_specific|unclear",
  "buyerName": "extracted buyer name or 'Unknown'",
  "buyerType": "hospital|distributor|government|ngo|pharmacy|export|unknown",
  "categories": ["list of category names if intent is select_category"],
  "items": [
    {
      "name": "product name",
      "category": "category from list",
      "quantity": 100,
      "unit": "piece|box|carton|pack|kit|set|roll|pair|vial",
      "specifications": "size, color, any specific detail"
    }
  ],
  "summary": "one line summary",
  "suggestions": ["upsell or related items"]
}

## Rules:
- For "select_all" → leave items empty array, set categories to empty array
- For "select_category" → list category names in categories array, items can be empty
- For "select_specific" → fill items array with matched products
- Match medical abbreviations: IV=intravenous, PPE=personal protective equipment, OT=operation theater
- If quantity not mentioned, use 0 (will fall back to MOQ from DB)
- Be lenient with buyer names — extract any company/hospital/buyer mentioned
- Output ONLY the JSON object, nothing else`;

  const completion = await nvidiaAI.chat.completions.create({
    model: NVIDIA_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
    temperature: 0.1,
    max_tokens: 2000,
  });

  const rawReply = completion.choices[0]?.message?.content ?? "";

  // Parse AI response as JSON
  let parsed: AIParseResponse;
  try {
    const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({
      success: true,
      data: {
        intent: "unclear",
        buyerName: "Unknown",
        buyerType: "unknown",
        items: [],
        summary: "Could not understand the request. Please rephrase.",
        rawResponse: rawReply,
        totalEstimate: { inr: 0, usd: 0 },
        suggestions: [
          "Try: 'make full product catalog'",
          "Try: 'all PPE kits and IV cannula'",
          "Try: '1000 IV cannula 20G and 500 PPE kits'",
        ],
      },
    });
  }

  // Build the final selected items based on intent
  let finalItems: ParsedItem[] = [];

  if (parsed.intent === "select_all") {
    // Return ALL products
    finalItems = products.map((p) => ({
      name: p.name,
      category: p.category,
      quantity: p.moq,
      unit: p.unit,
      specifications: p.certifications.join(", "),
      matchedProductId: p.id,
      matchedProductName: p.name,
      matchedSku: p.sku,
      sellingPrice: p.sellingPrice,
      exportPrice: p.exportPrice,
      moq: p.moq,
      confidence: "high" as const,
    }));
  } else if (parsed.intent === "select_category" && parsed.categories.length > 0) {
    // Return all products in matching categories
    const normalizedCategories = parsed.categories.map((c) => c.toLowerCase());
    const matchedProducts = products.filter((p) =>
      normalizedCategories.some(
        (cat) =>
          p.category.toLowerCase().includes(cat) ||
          cat.includes(p.category.toLowerCase())
      )
    );
    finalItems = matchedProducts.map((p) => ({
      name: p.name,
      category: p.category,
      quantity: p.moq,
      unit: p.unit,
      specifications: p.certifications.join(", "),
      matchedProductId: p.id,
      matchedProductName: p.name,
      matchedSku: p.sku,
      sellingPrice: p.sellingPrice,
      exportPrice: p.exportPrice,
      moq: p.moq,
      confidence: "high" as const,
    }));
  } else if (parsed.intent === "select_specific") {
    // Match each item to a DB product
    finalItems = parsed.items.map((item) => {
      // Try exact name match first
      let match = products.find(
        (p) => p.name.toLowerCase() === item.name.toLowerCase()
      );

      // Try fuzzy name match
      if (!match) {
        match = products.find(
          (p) =>
            p.name.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(p.name.toLowerCase())
        );
      }

      // Try category match as last resort
      if (!match && item.category) {
        match = products.find(
          (p) => p.category.toLowerCase() === item.category.toLowerCase()
        );
      }

      if (match) {
        return {
          name: item.name,
          category: match.category,
          quantity: item.quantity > 0 ? item.quantity : match.moq,
          unit: match.unit,
          specifications: item.specifications || "",
          matchedProductId: match.id,
          matchedProductName: match.name,
          matchedSku: match.sku,
          sellingPrice: match.sellingPrice,
          exportPrice: match.exportPrice,
          moq: match.moq,
          confidence:
            match.name.toLowerCase() === item.name.toLowerCase()
              ? ("high" as const)
              : ("medium" as const),
        };
      }

      // No match — return as low confidence
      return {
        name: item.name,
        category: item.category || "Unknown",
        quantity: item.quantity || 0,
        unit: item.unit || "piece",
        specifications: item.specifications || "",
        confidence: "low" as const,
      };
    });
  }

  // Calculate totals
  const totalInr = finalItems.reduce((sum, item) => {
    const price = item.sellingPrice || 0;
    const qty = item.quantity || item.moq || 1;
    return sum + price * qty;
  }, 0);

  const totalUsd = finalItems.reduce((sum, item) => {
    const price = item.exportPrice || 0;
    const qty = item.quantity || item.moq || 1;
    return sum + price * qty;
  }, 0);

  // Build summary based on intent
  let summary = parsed.summary;
  if (parsed.intent === "select_all") {
    summary = `Full catalog selected — all ${finalItems.length} products from database`;
  } else if (parsed.intent === "select_category") {
    summary = `${finalItems.length} products from ${parsed.categories.length} categor${parsed.categories.length > 1 ? "ies" : "y"}`;
  } else if (parsed.intent === "select_specific") {
    const matched = finalItems.filter((i) => i.matchedProductId).length;
    summary = `${matched} of ${finalItems.length} items matched in catalog`;
  }

  return NextResponse.json({
    success: true,
    data: {
      intent: parsed.intent,
      buyerName: parsed.buyerName || "Unknown",
      buyerType: parsed.buyerType || "unknown",
      categories: parsed.categories || [],
      items: finalItems,
      summary,
      totalEstimate: { inr: totalInr, usd: totalUsd },
      suggestions: parsed.suggestions || [],
    },
  });
});
