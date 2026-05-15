export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { requireAuth, apiHandler } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { nvidiaAI, NVIDIA_MODEL } from "@/lib/nvidia-ai";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

// ─── Public tender sources (no auth required) ────────────────────────────────
// GeM public search API (open, no key needed)
// CPPP eProcure RSS (public)
// We fetch both and deduplicate

interface RawTender {
  externalId: string;
  source: string;
  title: string;
  organization: string;
  category?: string;
  value?: number;
  deadline?: string;
  publishedAt?: string;
  url?: string;
}

async function fetchGeMTenders(): Promise<RawTender[]> {
  const keywords = [
    "surgical", "medical", "hospital", "IV set", "cannula",
    "gloves", "sutures", "disposable", "healthcare", "pharmaceutical",
    "PPE", "syringe", "catheter", "bandage", "wound care",
  ];

  const results: RawTender[] = [];

  for (const kw of keywords.slice(0, 5)) {
    try {
      const url = `https://bidplus.gem.gov.in/all-bids?searchedBid=${encodeURIComponent(kw)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "UpaHealth-TenderScanner/1.0" },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;
      const html = await res.text();

      // Parse bid cards from GeM HTML
      const bidMatches = html.matchAll(
        /bid_no['":\s]+([A-Z0-9\-\/]+).*?bid_title['":\s]+"([^"]+)".*?ministry['":\s]+"([^"]+)"/gs
      );

      for (const m of bidMatches) {
        results.push({
          externalId: `GEM-${m[1]}`,
          source: "GeM",
          title: m[2]?.trim() ?? "GeM Tender",
          organization: m[3]?.trim() ?? "Government of India",
          url: `https://bidplus.gem.gov.in/bidlisting/${m[1]}`,
        });
      }
    } catch {
      // Silently skip failed keyword fetches
    }
  }

  return results;
}

async function fetchCPPPTenders(): Promise<RawTender[]> {
  const results: RawTender[] = [];

  try {
    // CPPP public tender feed
    const res = await fetch(
      "https://eprocure.gov.in/cppp/latestactivetendersnew/cpppdata",
      {
        headers: { "User-Agent": "UpaHealth-TenderScanner/1.0" },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) return results;
    const data = await res.json();

    const tenders = Array.isArray(data) ? data : data?.data ?? [];
    for (const t of tenders.slice(0, 30)) {
      const title: string = t.tender_title ?? t.title ?? "";
      const medicalKeywords = [
        "medical", "surgical", "hospital", "health", "pharma",
        "drug", "equipment", "disposable", "ppe", "glove",
      ];
      const isRelevant = medicalKeywords.some((k) =>
        title.toLowerCase().includes(k)
      );
      if (!isRelevant) continue;

      results.push({
        externalId: `CPPP-${t.tender_id ?? t.id ?? Math.random().toString(36).slice(2)}`,
        source: "CPPP",
        title: title.trim(),
        organization: t.organisation_name ?? t.org ?? "Central Government",
        value: t.tender_value ? parseFloat(t.tender_value) : undefined,
        deadline: t.bid_submission_date ?? t.deadline,
        publishedAt: t.published_date ?? t.created_at,
        url: t.tender_url ?? `https://eprocure.gov.in/eprocure/app`,
      });
    }
  } catch {
    // Silently skip
  }

  return results;
}

async function fetchMOHFWTenders(): Promise<RawTender[]> {
  // Ministry of Health & Family Welfare tenders via NIC eProcure
  const results: RawTender[] = [];
  try {
    const res = await fetch(
      "https://eprocure.gov.in/cppp/latestactivetendersnew/cpppdata?ministry=Ministry+of+Health+and+Family+Welfare",
      {
        headers: { "User-Agent": "UpaHealth-TenderScanner/1.0" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return results;
    const data = await res.json();
    const tenders = Array.isArray(data) ? data : data?.data ?? [];
    for (const t of tenders.slice(0, 20)) {
      results.push({
        externalId: `MOHFW-${t.tender_id ?? t.id ?? Math.random().toString(36).slice(2)}`,
        source: "MoHFW",
        title: (t.tender_title ?? t.title ?? "Health Ministry Tender").trim(),
        organization: t.organisation_name ?? "Ministry of Health & Family Welfare",
        value: t.tender_value ? parseFloat(t.tender_value) : undefined,
        deadline: t.bid_submission_date ?? t.deadline,
        publishedAt: t.published_date,
        url: t.tender_url ?? "https://eprocure.gov.in/eprocure/app",
      });
    }
  } catch {
    // Silently skip
  }
  return results;
}

async function scoreTenderWithAI(tender: RawTender): Promise<{
  score: number;
  summary: string;
  matchedProducts: string[];
}> {
  const productList = PRODUCT_CATEGORIES.join(", ");

  const prompt = `You are a medical supplies procurement analyst for UpaHealth Supplies, an Indian exporter of surgical consumables.

Tender details:
- Title: ${tender.title}
- Organization: ${tender.organization}
- Source: ${tender.source}
- Category: ${tender.category ?? "Not specified"}

Our product catalog: ${productList}

Tasks:
1. Score this tender's relevance to our products (0-100). 100 = perfect match, 0 = completely irrelevant.
2. Write a 1-sentence summary of why this tender is or isn't relevant.
3. List which of our product categories match (comma-separated, or "none").

Respond in this exact JSON format:
{"score": <number>, "summary": "<string>", "matchedProducts": ["<cat1>", "<cat2>"]}`;

  try {
    const completion = await nvidiaAI.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.1,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { score: 0, summary: "Could not analyze", matchedProducts: [] };

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      score: Math.min(100, Math.max(0, parseInt(parsed.score) || 0)),
      summary: parsed.summary ?? "",
      matchedProducts: Array.isArray(parsed.matchedProducts) ? parsed.matchedProducts : [],
    };
  } catch {
    return { score: 0, summary: "AI analysis unavailable", matchedProducts: [] };
  }
}

export const POST = apiHandler(async () => {
  await requireAuth("write");

  // Fetch from all sources in parallel
  const [gemTenders, cpppTenders, mohfwTenders] = await Promise.all([
    fetchGeMTenders(),
    fetchCPPPTenders(),
    fetchMOHFWTenders(),
  ]);

  const allTenders = [...gemTenders, ...cpppTenders, ...mohfwTenders];

  // Deduplicate by externalId
  const seen = new Set<string>();
  const unique = allTenders.filter((t) => {
    if (seen.has(t.externalId)) return false;
    seen.add(t.externalId);
    return true;
  });

  if (unique.length === 0) {
    // Return fallback demo tenders if live sources are unreachable
    return NextResponse.json({
      success: true,
      data: { scanned: 0, saved: 0, message: "No new tenders found from live sources. Try again later." },
    });
  }

  // Score each tender with AI (batch to avoid rate limits)
  const scored = [];
  for (const tender of unique.slice(0, 20)) {
    const ai = await scoreTenderWithAI(tender);
    if (ai.score >= 30) {
      scored.push({ ...tender, ...ai });
    }
  }

  // Upsert into database
  let saved = 0;
  for (const t of scored) {
    try {
      await prisma.tender.upsert({
        where: { externalId: t.externalId },
        update: {
          aiMatchScore: t.score,
          aiSummary: t.summary,
          matchedProducts: t.matchedProducts,
          status: "open",
        },
        create: {
          externalId: t.externalId,
          source: t.source,
          title: t.title,
          organization: t.organization,
          category: t.category,
          value: t.value,
          deadline: t.deadline ? new Date(t.deadline) : null,
          publishedAt: t.publishedAt ? new Date(t.publishedAt) : null,
          url: t.url,
          aiMatchScore: t.score,
          aiSummary: t.summary,
          matchedProducts: t.matchedProducts,
          status: "open",
        },
      });
      saved++;
    } catch {
      // Skip duplicates or invalid dates
    }
  }

  return NextResponse.json({
    success: true,
    data: { scanned: unique.length, saved, message: `Scanned ${unique.length} tenders, saved ${saved} relevant matches.` },
  });
});
