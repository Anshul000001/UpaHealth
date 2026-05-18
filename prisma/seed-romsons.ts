/**
 * Seed: Romsons Scientific & Surgical Rate List (May 2026) — REPLACE MODE
 *
 * Source: UpaHealth-RateList-May2026.docx
 * Important: Prices in the rate list ALREADY include UpaHealth's margin
 * (procurement + logistics + sales markup). We use them AS-IS.
 *
 * What this script does:
 *   1. Deletes ALL existing QuotationLineItems  (FK cleanup)
 *   2. Deletes ALL existing Quotations         (line-items are gone, so empty)
 *   3. Deletes ALL existing Products            (clean slate)
 *   4. Upserts Romsons supplier
 *   5. Inserts 107 Romsons products using rate-list prices as selling price
 *
 * Pricing model (no markup added):
 *   - sellingPrice = rate-list price (INR, what you charge B2B buyers)
 *   - costPrice    = sellingPrice × 0.80 (20% baked-in margin estimate)
 *   - exportPrice  = sellingPrice / 83 (USD conversion at ~₹83)
 *   - moq = box size from rate list
 *   - unit = "piece" (matches the rate list's "Price / Pc")
 *
 * Run: npx tsx prisma/seed-romsons.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// USD conversion rate (INR → USD)
const USD_RATE = 83;
// Cost = 80% of selling price (i.e. 20% margin already baked into rate-list prices)
const COST_RATIO = 0.80;

interface RateListItem {
  sku: string;
  description: string;
  category: string;
  boxSize: number;
  pricePerPc: number;
}

// Full rate list — Romsons May 2026
const ITEMS: RateListItem[] = [
  // ===== IV Cannulas (Intra Cath / Veneport / Pediatric) =====
  { sku: "ORNIC14100", description: "Intra Cath IV Cannula, 14 G", category: "IV Catheters / Cannulas", boxSize: 2400, pricePerPc: 16.68 },
  { sku: "ORNIC16100", description: "Intra Cath IV Cannula, 16 G", category: "IV Catheters / Cannulas", boxSize: 2400, pricePerPc: 16.68 },
  { sku: "ORNIC18100", description: "Intra Cath IV Cannula, 18 G", category: "IV Catheters / Cannulas", boxSize: 2400, pricePerPc: 11.21 },
  { sku: "ORNIC20100", description: "Intra Cath IV Cannula, 20 G", category: "IV Catheters / Cannulas", boxSize: 2400, pricePerPc: 11.21 },
  { sku: "ORNIC22100", description: "Intra Cath IV Cannula, 22 G", category: "IV Catheters / Cannulas", boxSize: 2400, pricePerPc: 11.21 },
  { sku: "ORNIC24100", description: "Intra Cath IV Cannula, 24 G", category: "IV Catheters / Cannulas", boxSize: 2400, pricePerPc: 18.67 },
  { sku: "ORMICR100", description: "Micron Paediatric IV Cannula, 26 G", category: "IV Catheters / Cannulas", boxSize: 2400, pricePerPc: 26.67 },
  { sku: "ORNEOCR100", description: "Neo Care Paediatric IV Cannula, 24 G", category: "IV Catheters / Cannulas", boxSize: 1000, pricePerPc: 20.01 },
  { sku: "ORVP1850", description: "Veneport IV Cannula, 18 G", category: "IV Catheters / Cannulas", boxSize: 500, pricePerPc: 27.35 },
  { sku: "ORVP2050", description: "Veneport IV Cannula, 20 G", category: "IV Catheters / Cannulas", boxSize: 500, pricePerPc: 27.35 },
  { sku: "ORVP2250", description: "Veneport IV Cannula, 22 G", category: "IV Catheters / Cannulas", boxSize: 500, pricePerPc: 27.35 },

  // ===== IV Accessories — fixators, stopcocks, extension lines =====
  { sku: "ORBIV-B50X2", description: "Bi-Valve Three Way Stop Cock", category: "IV Catheters / Cannulas", boxSize: 1000, pricePerPc: 10.01 },
  { sku: "ORSFL50X3", description: "Soflene IV Cannula Fixator", category: "IV Catheters / Cannulas", boxSize: 1000, pricePerPc: 6.67 },
  { sku: "ORVLS01050", description: "Vein-O-Line Extension Sets, 10 cm", category: "IV Catheters / Cannulas", boxSize: 1000, pricePerPc: 35.35 },
  { sku: "ORVLS02520", description: "Vein-O-Line Extension Sets, 25 cm", category: "IV Catheters / Cannulas", boxSize: 400, pricePerPc: 38.68 },
  { sku: "ORVLS05020", description: "Vein-O-Line Extension Sets, 50 cm", category: "IV Catheters / Cannulas", boxSize: 400, pricePerPc: 38.68 },
  { sku: "ORVLS10020", description: "Vein-O-Line Extension Sets, 100 cm", category: "IV Catheters / Cannulas", boxSize: 400, pricePerPc: 49.34 },
  { sku: "ORVLS15020", description: "Vein-O-Line Extension Sets, 150 cm", category: "IV Catheters / Cannulas", boxSize: 400, pricePerPc: 49.34 },
  { sku: "ORVLS20020", description: "Vein-O-Line Extension Sets, 200 cm", category: "IV Catheters / Cannulas", boxSize: 400, pricePerPc: 49.34 },

  // ===== Infusion Sets =====
  { sku: "ORRMS25X2", description: "RMS Infusion Set", category: "IV Infusion Sets", boxSize: 500, pricePerPc: 17.75 },
  { sku: "ORPDP10", description: "Pedia Drip Plus Infusion Set", category: "IV Infusion Sets", boxSize: 120, pricePerPc: 74.68 },
  { sku: "ORRMSVLL25X2", description: "RMS Vented Infusion Set With Luer Lock", category: "IV Infusion Sets", boxSize: 500, pricePerPc: 19.88 },
  { sku: "ORSTRP25", description: "Steri Flo Infusion Set", category: "IV Infusion Sets", boxSize: 400, pricePerPc: 28.01 },

  // ===== Syringes =====
  { sku: "ORRJS102115X50X3", description: "Romo Jet Syringe With Needle, 10ML (21Gx1.5)", category: "Safety Syringes", boxSize: 1000, pricePerPc: 5.75 },
  { sku: "ORRJS102215X50X3", description: "Romo Jet Syringe With Needle, 10ML (22Gx1.5)", category: "Safety Syringes", boxSize: 1000, pricePerPc: 5.75 },
  { sku: "ORRJS12310X100X3", description: "Romo Jet Syringe With Needle, 1ML (23Gx1)", category: "Safety Syringes", boxSize: 2000, pricePerPc: 4.41 },
  { sku: "ORRJS12605X100X3", description: "Romo Jet Syringe With Needle, 1ML (26Gx0.5)", category: "Safety Syringes", boxSize: 2000, pricePerPc: 4.41 },
  { sku: "ORRJS202115X25X3", description: "Romo Jet Syringe With Needle, 20ML (21Gx1.5)", category: "Safety Syringes", boxSize: 500, pricePerPc: 13.34 },
  { sku: "ORRJS202215X25X3", description: "Romo Jet Syringe With Needle, 20ML (22Gx1.5)", category: "Safety Syringes", boxSize: 500, pricePerPc: 13.34 },
  { sku: "ORRJS22310X100X3", description: "Romo Jet Syringe With Needle, 2ML (23Gx1)", category: "Safety Syringes", boxSize: 2000, pricePerPc: 2.81 },
  { sku: "ORRJS22410X100X3", description: "Romo Jet Syringe With Needle, 2ML (24Gx1)", category: "Safety Syringes", boxSize: 2000, pricePerPc: 2.81 },
  { sku: "ORRJS32310X100X3", description: "Romo Jet Syringe With Needle, 3ML (23Gx1)", category: "Safety Syringes", boxSize: 2000, pricePerPc: 3.08 },
  { sku: "ORRJS32410X100X3", description: "Romo Jet Syringe With Needle, 3ML (24Gx1)", category: "Safety Syringes", boxSize: 2000, pricePerPc: 3.08 },
  { sku: "ORRJS52210X100X3", description: "Romo Jet Syringe With Needle, 5ML (22Gx1)", category: "Safety Syringes", boxSize: 2000, pricePerPc: 3.61 },
  { sku: "ORRJS52310X100X3", description: "Romo Jet Syringe With Needle, 5ML (23Gx1)", category: "Safety Syringes", boxSize: 2000, pricePerPc: 3.61 },
  { sku: "ORRJS52410X100X3", description: "Romo Jet Syringe With Needle, 5ML (24Gx1)", category: "Safety Syringes", boxSize: 2000, pricePerPc: 3.61 },

  // ===== Feeding & Ryles tubes =====
  { sku: "ORFB10", description: "Feeding Bag", category: "Surgical Drapes & Procedure Kits", boxSize: 100, pricePerPc: 189.36 },
  { sku: "ORRL1850", description: "Romolene Ryles Tube, 18 FG", category: "Surgical Instruments", boxSize: 600, pricePerPc: 22.67 },
  { sku: "ORRL2050", description: "Romolene Ryles Tube, 20 FG", category: "Surgical Instruments", boxSize: 600, pricePerPc: 22.67 },

  // ===== Suction Catheters & Surgical pencil =====
  { sku: "ORECTA10", description: "Electraa Electro-Surgical Pencil With Tip Cleaner", category: "Surgical Instruments", boxSize: 100, pricePerPc: 173.36 },
  { sku: "ORCTT08100", description: "Cee Tee Suction Catheter, 08 FG", category: "Respiratory Care", boxSize: 1200, pricePerPc: 14.14 },
  { sku: "ORCTT10100", description: "Cee Tee Suction Catheter, 10 FG", category: "Respiratory Care", boxSize: 1200, pricePerPc: 14.14 },
  { sku: "ORCTT12100", description: "Cee Tee Suction Catheter, 12 FG", category: "Respiratory Care", boxSize: 1200, pricePerPc: 14.14 },
  { sku: "ORCTT14100", description: "Cee Tee Suction Catheter, 14 FG", category: "Respiratory Care", boxSize: 1200, pricePerPc: 14.14 },
  { sku: "ORSCP06100", description: "Suction Catheter Plain, 06 FG", category: "Respiratory Care", boxSize: 1200, pricePerPc: 13.34 },
  { sku: "ORSCP08100", description: "Suction Catheter Plain, 08 FG", category: "Respiratory Care", boxSize: 1200, pricePerPc: 13.34 },
  { sku: "ORSCP10100", description: "Suction Catheter Plain, 10 FG", category: "Respiratory Care", boxSize: 1200, pricePerPc: 13.34 },
  { sku: "ORSCP12100", description: "Suction Catheter Plain, 12 FG", category: "Respiratory Care", boxSize: 1200, pricePerPc: 13.34 },
  { sku: "ORSCP14100", description: "Suction Catheter Plain, 14 FG", category: "Respiratory Care", boxSize: 1200, pricePerPc: 13.34 },
  { sku: "ORSCP16100", description: "Suction Catheter Plain, 16 FG", category: "Respiratory Care", boxSize: 1200, pricePerPc: 13.34 },

  // ===== Oxygen Masks =====
  { sku: "ORFXMA2X20", description: "Flexi Mask (Adult) 2 Mtr", category: "Respiratory Care", boxSize: 160, pricePerPc: 52.01 },
  { sku: "ORFXMC2X20", description: "Flexi Mask (Child) 2 Mtr", category: "Respiratory Care", boxSize: 160, pricePerPc: 52.01 },
  { sku: "ORFXMNX20", description: "Flexi Mask (Neonate)", category: "Respiratory Care", boxSize: 160, pricePerPc: 52.01 },
  { sku: "ORHIMA10", description: "Hi-Mask (Adult)", category: "Respiratory Care", boxSize: 60, pricePerPc: 162.69 },
  { sku: "ORHIMC10", description: "Hi-Mask (Child)", category: "Respiratory Care", boxSize: 60, pricePerPc: 162.69 },

  // ===== Nebulizer Sets =====
  { sku: "ORAMA", description: "Aero Mist Nebulizer Cup & Mask Set (Adult)", category: "Respiratory Care", boxSize: 200, pricePerPc: 73.35 },
  { sku: "ORAMC", description: "Aero Mist Nebulizer Mask for Child", category: "Respiratory Care", boxSize: 200, pricePerPc: 73.35 },

  // ===== Mucus / Suction sets =====
  { sku: "ORIME25X2", description: "Mucus Extractor, Infant (Without Filter), 10 FG", category: "Respiratory Care", boxSize: 500, pricePerPc: 26.67 },
  { sku: "ORVSSC10", description: "Vaccu Suck Suction Set, Crown", category: "Surgical Instruments", boxSize: 80, pricePerPc: 160.03 },
  { sku: "ORVSSS10", description: "Vaccu Suck Suction Set, Standard", category: "Surgical Instruments", boxSize: 80, pricePerPc: 141.36 },

  // ===== Wound Drainage =====
  { sku: "ORRVS105", description: "Romo Vac Set Closed Wound Drainage, 10FG", category: "Wound Care / Bandages", boxSize: 30, pricePerPc: 274.71 },
  { sku: "ORRVS125", description: "Romo Vac Set Closed Wound Drainage, 12FG", category: "Wound Care / Bandages", boxSize: 30, pricePerPc: 274.71 },
  { sku: "ORRVS145", description: "Romo Vac Set Closed Wound Drainage, 14FG", category: "Wound Care / Bandages", boxSize: 30, pricePerPc: 309.38 },
  { sku: "ORRVS165", description: "Romo Vac Set Closed Wound Drainage, 16FG", category: "Wound Care / Bandages", boxSize: 30, pricePerPc: 309.38 },

  // ===== Urology =====
  { sku: "ORTUR10", description: "Tur Set - Y Shaped Irrigation Set", category: "Urology Catheters", boxSize: 100, pricePerPc: 146.69 },

  // ===== Resuscitator Bags =====
  { sku: "ORRSQBA", description: "RESQ Manual Resuscitator Bag, Adult", category: "Respiratory Care", boxSize: 8, pricePerPc: 4333.88 },
  { sku: "ORRSQBC", description: "RESQ Manual Resuscitator Bag, Child", category: "Respiratory Care", boxSize: 8, pricePerPc: 3880.49 },
  { sku: "ORRSQBI", description: "RESQ Manual Resuscitator Bag, Infant", category: "Respiratory Care", boxSize: 8, pricePerPc: 3880.49 },

  // ===== Skin prep / Markers =====
  { sku: "ORTPLUS50", description: "Trimmer Plus Disposable Skin Prep Razor", category: "Surgical Drapes & Procedure Kits", boxSize: 1200, pricePerPc: 16.81 },
  { sku: "ORDMARK60", description: "Dermark Surgical Skin Marker", category: "Surgical Instruments", boxSize: 600, pricePerPc: 100.02 },

  // ===== Abdominal Drainage Kits =====
  { sku: "ORADK1610", description: "Romo ADK Abdominal Drainage Kit, 16FG", category: "Surgical Drapes & Procedure Kits", boxSize: 100, pricePerPc: 157.36 },
  { sku: "ORADK2010", description: "Romo ADK Abdominal Drainage Kit, 20FG", category: "Surgical Drapes & Procedure Kits", boxSize: 100, pricePerPc: 157.36 },
  { sku: "ORADK2410", description: "Romo ADK Abdominal Drainage Kit, 24FG", category: "Surgical Drapes & Procedure Kits", boxSize: 100, pricePerPc: 157.36 },
  { sku: "ORADK2810", description: "Romo ADK Abdominal Drainage Kit, 28FG", category: "Surgical Drapes & Procedure Kits", boxSize: 100, pricePerPc: 157.36 },
  { sku: "ORADK3210", description: "Romo ADK Abdominal Drainage Kit, 32FG", category: "Surgical Drapes & Procedure Kits", boxSize: 100, pricePerPc: 157.36 },

  // ===== Anesthesia / Airways =====
  { sku: "ORGA0X50", description: "Guedel Airways, 0", category: "Anesthesia Accessories", boxSize: 400, pricePerPc: 44.81 },

  // ===== Surgical Tape =====
  { sku: "ORKP50125X4", description: "Kenpore Surgical Tape - 12.5mm x 5.0mtr", category: "Wound Care / Bandages", boxSize: 40, pricePerPc: 253.37 },
  { sku: "ORKP5025X4", description: "Kenpore Surgical Tape - 25mm x 5.0mtr", category: "Wound Care / Bandages", boxSize: 40, pricePerPc: 253.37 },
  { sku: "ORKP5050X4", description: "Kenpore Surgical Tape - 50mm x 5.0mtr", category: "Wound Care / Bandages", boxSize: 40, pricePerPc: 253.37 },
  { sku: "ORKP5075X4", description: "Kenpore Surgical Tape - 75mm x 5.0mtr", category: "Wound Care / Bandages", boxSize: 40, pricePerPc: 253.37 },
  { sku: "ORKP92125X4", description: "Kenpore Surgical Tape - 12.5mm x 9.0mtr", category: "Wound Care / Bandages", boxSize: 40, pricePerPc: 385.39 },
  { sku: "ORKP9225X4", description: "Kenpore Surgical Tape - 25mm x 9.0mtr", category: "Wound Care / Bandages", boxSize: 40, pricePerPc: 385.39 },
  { sku: "ORKP9250X4", description: "Kenpore Surgical Tape - 50mm x 9.0mtr", category: "Wound Care / Bandages", boxSize: 40, pricePerPc: 385.39 },
  { sku: "ORKP9275X4", description: "Kenpore Surgical Tape - 75mm x 9.0mtr", category: "Wound Care / Bandages", boxSize: 40, pricePerPc: 385.39 },

  // ===== Urine Collection =====
  { sku: "ORR10", description: "Romsons ROMO 10 Urine Collection Bag", category: "Urology Catheters", boxSize: 200, pricePerPc: 46.82 },
  { sku: "ORR30", description: "Romsons ROMO 30 Urine Collection Bag", category: "Urology Catheters", boxSize: 200, pricePerPc: 54.68 },

  // ===== Nelaton Catheters =====
  { sku: "ORNC06100", description: "Nel Cath Nelaton Catheter FG6", category: "Urology Catheters", boxSize: 1200, pricePerPc: 17.75 },
  { sku: "ORNC08100", description: "Nel Cath Nelaton Catheter FG8", category: "Urology Catheters", boxSize: 1200, pricePerPc: 17.75 },
  { sku: "ORNC10100", description: "Nel Cath Nelaton Catheter FG10", category: "Urology Catheters", boxSize: 1200, pricePerPc: 17.75 },
  { sku: "ORNC12100", description: "Nel Cath Nelaton Catheter FG12", category: "Urology Catheters", boxSize: 1200, pricePerPc: 17.75 },
  { sku: "ORNC14100", description: "Nel Cath Nelaton Catheter FG14", category: "Urology Catheters", boxSize: 1200, pricePerPc: 17.75 },
  { sku: "ORNC16100", description: "Nel Cath Nelaton Catheter FG16", category: "Urology Catheters", boxSize: 1200, pricePerPc: 17.75 },

  // ===== External Male Catheters =====
  { sku: "ORMC2050", description: "Male Cath External Male Catheter, 20mm", category: "Urology Catheters", boxSize: 1000, pricePerPc: 30.82 },
  { sku: "ORMC2550", description: "Male Cath External Male Catheter, 25mm", category: "Urology Catheters", boxSize: 1000, pricePerPc: 30.82 },
  { sku: "ORMC3050", description: "Male Cath External Male Catheter, 30mm", category: "Urology Catheters", boxSize: 1000, pricePerPc: 30.82 },
  { sku: "ORMC3550", description: "Male Cath External Male Catheter, 35mm", category: "Urology Catheters", boxSize: 1000, pricePerPc: 30.82 },
  { sku: "ORSCATH2025", description: "Sil Cath Silicon External Catheter 20mm, Small", category: "Urology Catheters", boxSize: 400, pricePerPc: 52.01 },
  { sku: "ORSCATH2525", description: "Sil Cath Silicon External Catheter 25mm, Medium", category: "Urology Catheters", boxSize: 400, pricePerPc: 52.01 },
  { sku: "ORSCATH3025", description: "Sil Cath Silicon External Catheter 30mm, Large", category: "Urology Catheters", boxSize: 400, pricePerPc: 52.01 },
  { sku: "ORSCATH3525", description: "Sil Cath Silicon External Catheter 35mm, XL", category: "Urology Catheters", boxSize: 400, pricePerPc: 52.01 },

  // ===== Examination Gloves =====
  { sku: "ORBNEGL100TG", description: "Blue Nitrile Examination Gloves, Large (100 Pcs/Box)", category: "Disposable Gloves", boxSize: 10, pricePerPc: 426.72 },
  { sku: "ORBNEGM100TG", description: "Blue Nitrile Examination Gloves, Medium (100 Pcs/Box)", category: "Disposable Gloves", boxSize: 10, pricePerPc: 426.72 },
  { sku: "ORBNEGS100TG", description: "Blue Nitrile Examination Gloves, Small (100 Pcs/Box)", category: "Disposable Gloves", boxSize: 10, pricePerPc: 426.72 },
  { sku: "ORLEGL100", description: "Latex Medical Examination Gloves, Large, 100 Pcs/Pack", category: "Disposable Gloves", boxSize: 10, pricePerPc: 426.72 },
  { sku: "ORLEGM100", description: "Latex Medical Examination Gloves, Medium, 100 Pcs/Pack", category: "Disposable Gloves", boxSize: 10, pricePerPc: 426.72 },
  { sku: "ORLEGS100", description: "Latex Medical Examination Gloves, Small, 100 Pcs/Pack", category: "Disposable Gloves", boxSize: 30, pricePerPc: 426.72 },

  // ===== Colostomy =====
  { sku: "ORCB20", description: "Colobag for Closed System Colostomy Management", category: "Surgical Drapes & Procedure Kits", boxSize: 1000, pricePerPc: 45.34 },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function main() {
  console.log("🌱 Romsons Rate List — CLEAN IMPORT (May 2026)\n");
  console.log("⚠️  Removing all existing products & quotation data...");

  // ============================================
  // 1. Delete ALL existing data (clean slate)
  // ============================================
  const deletedLines = await prisma.quotationLineItem.deleteMany({});
  console.log(`   Deleted ${deletedLines.count} quotation line items`);

  const deletedQuotes = await prisma.quotation.deleteMany({});
  console.log(`   Deleted ${deletedQuotes.count} quotations`);

  const deletedProducts = await prisma.product.deleteMany({});
  console.log(`   Deleted ${deletedProducts.count} old products`);

  // Also clean up old suppliers (except Romsons which we'll upsert)
  // Keep suppliers for now in case other data references them

  console.log("   ✅ All old product data cleared\n");

  // ============================================
  // 2. Upsert Romsons supplier
  // ============================================
  const supplier = await prisma.supplier.upsert({
    where: { id: "sup-romsons-scientific" },
    update: {
      name: "Romsons Scientific & Surgical Pvt Ltd",
      location: "Agra, Uttar Pradesh",
      contactPhone: "+91 562 4006400",
      email: "info@romsons.in",
      certifications: ["ISO 13485", "CE Mark", "WHO GMP", "CDSCO Registered"],
      productCategories: [
        "IV Catheters / Cannulas",
        "IV Infusion Sets",
        "Safety Syringes",
        "Respiratory Care",
        "Urology Catheters",
        "Wound Care / Bandages",
        "Surgical Drapes & Procedure Kits",
        "Disposable Gloves",
      ],
      reliabilityScore: 95,
      trustScore: 93,
      onTimeDelivery: 96,
      qualityRejectionRate: 0.6,
    },
    create: {
      id: "sup-romsons-scientific",
      name: "Romsons Scientific & Surgical Pvt Ltd",
      location: "Agra, Uttar Pradesh",
      contactPhone: "+91 562 4006400",
      email: "info@romsons.in",
      certifications: ["ISO 13485", "CE Mark", "WHO GMP", "CDSCO Registered"],
      productCategories: [
        "IV Catheters / Cannulas",
        "IV Infusion Sets",
        "Safety Syringes",
        "Respiratory Care",
        "Urology Catheters",
        "Wound Care / Bandages",
        "Surgical Drapes & Procedure Kits",
        "Disposable Gloves",
      ],
      reliabilityScore: 95,
      trustScore: 93,
      totalOrders: 0,
      onTimeDelivery: 96,
      qualityRejectionRate: 0.6,
    },
  });
  console.log(`✅ Supplier: ${supplier.name}\n`);

  // ============================================
  // 3. Import all products — rate-list price = YOUR B2B selling price
  // ============================================
  console.log(`📦 Importing ${ITEMS.length} products (rate-list prices = your B2B selling price)...`);

  for (const item of ITEMS) {
    // Rate list price IS your selling price (margin already included by you)
    const sellingPrice = item.pricePerPc;
    // Estimate cost at 80% of selling (20% margin baked in)
    const costPrice = round2(sellingPrice * COST_RATIO);
    // Export price = selling price converted to USD
    const exportPrice = round2(sellingPrice / USD_RATE);
    // Lead time based on box size
    const leadTime = item.boxSize >= 1000 ? "10-15 days" : "7-10 days";
    // Target margin = 20% (what you've baked into the rate list)
    const targetMargin = 20;

    await prisma.product.create({
      data: {
        name: item.description,
        category: item.category,
        sku: item.sku,
        costPrice,
        sellingPrice,
        exportPrice,
        moq: item.boxSize,
        unit: "piece",
        supplierId: supplier.id,
        leadTime,
        certifications: ["ISO 13485", "CE Mark", "CDSCO Registered"],
        exportAvailable: true,
        stock: item.boxSize * 5, // 5 boxes default stock
        targetMargin,
      },
    });
  }

  // Final stats
  const totalProducts = await prisma.product.count();
  console.log(`\n✅ Import complete!`);
  console.log(`   Total products in DB: ${totalProducts} (all from Romsons rate list)`);
  console.log(`   Source: Romsons Scientific & Surgical | May 2026`);
  console.log(`   Pricing: Rate-list prices used as B2B selling price (margin already included)`);
  console.log(`\n   Ready to send catalogs & quotations to buyers! 🚀`);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
