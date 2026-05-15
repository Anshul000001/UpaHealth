import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Vivan Surgical Export & Import — Surat, Gujarat
// Manufacturer of B+ve / VSurz medical consumables & surgical products

const SUPPLIER_ID = "sup-vivan-surgical";

const products = [
  // ─── INFUCARE RANGE — IV Infusion Sets ───────────────────────────────
  { name: "IV Infusion Set Regular", sku: "VS-INF-401", category: "IV Infusion Sets", costPrice: 7, sellingPrice: 13, exportPrice: 0.40, moq: 5000, unit: "piece", leadTime: "5-7 days", stock: 25000 },
  { name: "IV Set Vented", sku: "VS-INF-406", category: "IV Infusion Sets", costPrice: 8, sellingPrice: 15, exportPrice: 0.45, moq: 5000, unit: "piece", leadTime: "5-7 days", stock: 18000 },
  { name: "IV Set Vented Y Port Luer Lock", sku: "VS-INF-420", category: "IV Infusion Sets", costPrice: 12, sellingPrice: 22, exportPrice: 0.65, moq: 3000, unit: "piece", leadTime: "7-10 days", stock: 12000 },
  { name: "IV Set Premium Safety Ultra", sku: "VS-INF-419", category: "IV Infusion Sets", costPrice: 14, sellingPrice: 26, exportPrice: 0.75, moq: 3000, unit: "piece", leadTime: "7-10 days", stock: 9000 },
  { name: "Micro Infusion Set Non Vented", sku: "VS-INF-409", category: "IV Infusion Sets", costPrice: 18, sellingPrice: 32, exportPrice: 0.90, moq: 2000, unit: "piece", leadTime: "7-10 days", stock: 8000 },
  { name: "Micro Infusion Set Vented", sku: "VS-INF-405", category: "IV Infusion Sets", costPrice: 20, sellingPrice: 36, exportPrice: 1.00, moq: 2000, unit: "piece", leadTime: "7-10 days", stock: 7500 },
  { name: "IV Infusion Kit (Vented + Cannula + Swab)", sku: "VS-IVF-422", category: "IV Infusion Sets", costPrice: 28, sellingPrice: 52, exportPrice: 1.45, moq: 1000, unit: "kit", leadTime: "7-10 days", stock: 4500 },
  { name: "Flow Regulator", sku: "VS-IVF-421", category: "IV Infusion Sets", costPrice: 32, sellingPrice: 58, exportPrice: 1.65, moq: 1000, unit: "piece", leadTime: "10-14 days", stock: 3500 },
  { name: "Flow Regulator with Vented IV Set", sku: "VS-IVF-421A", category: "IV Infusion Sets", costPrice: 38, sellingPrice: 68, exportPrice: 1.95, moq: 1000, unit: "piece", leadTime: "10-14 days", stock: 3000 },
  { name: "Measured Volume Set 110ml", sku: "VS-MV-412", category: "IV Infusion Sets", costPrice: 55, sellingPrice: 95, exportPrice: 2.70, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 2200 },
  { name: "Measured Volume Set 150ml", sku: "VS-MV-421", category: "IV Infusion Sets", costPrice: 62, sellingPrice: 108, exportPrice: 3.10, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 2000 },
  { name: "Blood Transfusion Set Regular", sku: "VS-BT-410", category: "IV Infusion Sets", costPrice: 18, sellingPrice: 32, exportPrice: 0.92, moq: 2000, unit: "piece", leadTime: "7-10 days", stock: 8500 },
  { name: "Blood Transfusion Set Double Drip", sku: "VS-BT-411A", category: "IV Infusion Sets", costPrice: 22, sellingPrice: 38, exportPrice: 1.10, moq: 2000, unit: "piece", leadTime: "7-10 days", stock: 6500 },
  { name: "Blood Transfusion Set Vented", sku: "VS-BT-411B", category: "IV Infusion Sets", costPrice: 20, sellingPrice: 36, exportPrice: 1.05, moq: 2000, unit: "piece", leadTime: "7-10 days", stock: 7000 },
  { name: "Blood Transfusion Set with Luer Lock", sku: "VS-BT-411C", category: "IV Infusion Sets", costPrice: 24, sellingPrice: 42, exportPrice: 1.20, moq: 2000, unit: "piece", leadTime: "7-10 days", stock: 5500 },
  { name: "Burette Set Pediatric", sku: "VS-MV-412B", category: "IV Infusion Sets", costPrice: 58, sellingPrice: 100, exportPrice: 2.85, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 2100 },
  { name: "Scalp Vein Set (Butterfly)", sku: "VS-SV-414", category: "IV Infusion Sets", costPrice: 4, sellingPrice: 8, exportPrice: 0.22, moq: 10000, unit: "piece", leadTime: "5-7 days", stock: 80000 },
  { name: "Extension Line", sku: "VS-ET-417", category: "IV Infusion Sets", costPrice: 6, sellingPrice: 11, exportPrice: 0.32, moq: 5000, unit: "piece", leadTime: "5-7 days", stock: 22000 },

  // ─── FLOWLINE RANGE — IV Catheters / Cannulas ────────────────────────
  { name: "IV Cannula 16G (Grey)", sku: "VS-IVC-16G", category: "IV Catheters / Cannulas", costPrice: 14, sellingPrice: 26, exportPrice: 0.72, moq: 5000, unit: "piece", leadTime: "7-10 days", stock: 35000 },
  { name: "IV Cannula 18G (Green)", sku: "VS-IVC-18G", category: "IV Catheters / Cannulas", costPrice: 13, sellingPrice: 24, exportPrice: 0.68, moq: 5000, unit: "piece", leadTime: "7-10 days", stock: 60000 },
  { name: "IV Cannula 20G (Pink)", sku: "VS-IVC-20G", category: "IV Catheters / Cannulas", costPrice: 12, sellingPrice: 22, exportPrice: 0.62, moq: 5000, unit: "piece", leadTime: "7-10 days", stock: 75000 },
  { name: "IV Cannula 22G (Blue)", sku: "VS-IVC-22G", category: "IV Catheters / Cannulas", costPrice: 11, sellingPrice: 20, exportPrice: 0.58, moq: 5000, unit: "piece", leadTime: "7-10 days", stock: 65000 },
  { name: "IV Cannula 24G (Yellow)", sku: "VS-IVC-24G", category: "IV Catheters / Cannulas", costPrice: 11, sellingPrice: 20, exportPrice: 0.58, moq: 5000, unit: "piece", leadTime: "7-10 days", stock: 50000 },
  { name: "IV Cannula 26G (Violet)", sku: "VS-IVC-26G", category: "IV Catheters / Cannulas", costPrice: 12, sellingPrice: 22, exportPrice: 0.62, moq: 5000, unit: "piece", leadTime: "7-10 days", stock: 28000 },
  { name: "Safety IV Cannula", sku: "VS-IVC-418", category: "IV Catheters / Cannulas", costPrice: 22, sellingPrice: 40, exportPrice: 1.15, moq: 3000, unit: "piece", leadTime: "10-14 days", stock: 18000 },
  { name: "3-Way Stop Cock", sku: "VS-WS-414", category: "IV Catheters / Cannulas", costPrice: 9, sellingPrice: 17, exportPrice: 0.48, moq: 5000, unit: "piece", leadTime: "7-10 days", stock: 22000 },
  { name: "3-Way Stop Cock with Extension Line", sku: "VS-ENL-415", category: "IV Catheters / Cannulas", costPrice: 16, sellingPrice: 28, exportPrice: 0.82, moq: 3000, unit: "piece", leadTime: "7-10 days", stock: 12000 },
  { name: "Umbilical Catheter", sku: "VS-UC-506", category: "IV Catheters / Cannulas", costPrice: 35, sellingPrice: 62, exportPrice: 1.78, moq: 1000, unit: "piece", leadTime: "10-14 days", stock: 4500 },
  { name: "Pressure Monitoring Line", sku: "VS-HPM-416", category: "IV Catheters / Cannulas", costPrice: 28, sellingPrice: 50, exportPrice: 1.42, moq: 1000, unit: "piece", leadTime: "10-14 days", stock: 5000 },
  { name: "CT Coiled Pressure Connection Line", sku: "VS-CTPC-417", category: "IV Catheters / Cannulas", costPrice: 45, sellingPrice: 80, exportPrice: 2.30, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 2200 },
  { name: "Spiral Extension Line", sku: "VS-SHPM-419", category: "IV Catheters / Cannulas", costPrice: 32, sellingPrice: 56, exportPrice: 1.60, moq: 1000, unit: "piece", leadTime: "10-14 days", stock: 4000 },

  // ─── NEPHRO-URO RANGE — Urology Catheters ────────────────────────────
  { name: "Latex Foley Catheter 2-Way (16FR)", sku: "VS-FC-301-16", category: "Urology Catheters", costPrice: 18, sellingPrice: 32, exportPrice: 0.92, moq: 1000, unit: "piece", leadTime: "7-10 days", stock: 12000 },
  { name: "Latex Foley Catheter 3-Way (18FR)", sku: "VS-FC-302-18", category: "Urology Catheters", costPrice: 24, sellingPrice: 42, exportPrice: 1.20, moq: 1000, unit: "piece", leadTime: "7-10 days", stock: 8500 },
  { name: "100% Silicone Foley Catheter 2-Way", sku: "VS-FC-304-2W", category: "Urology Catheters", costPrice: 85, sellingPrice: 150, exportPrice: 4.30, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 3500 },
  { name: "100% Silicone Foley Catheter 3-Way", sku: "VS-FC-304-3W", category: "Urology Catheters", costPrice: 95, sellingPrice: 168, exportPrice: 4.80, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 3000 },
  { name: "Transurethral Resection Set (TUR)", sku: "VS-TUR-312", category: "Urology Catheters", costPrice: 120, sellingPrice: 215, exportPrice: 6.15, moq: 200, unit: "set", leadTime: "10-14 days", stock: 1200 },
  { name: "Nelaton / Urethral Catheter", sku: "VS-NC-303", category: "Urology Catheters", costPrice: 8, sellingPrice: 15, exportPrice: 0.42, moq: 5000, unit: "piece", leadTime: "5-7 days", stock: 28000 },
  { name: "Male External Catheter", sku: "VS-ME-306", category: "Urology Catheters", costPrice: 22, sellingPrice: 40, exportPrice: 1.15, moq: 2000, unit: "piece", leadTime: "7-10 days", stock: 8000 },
  { name: "Urine Bag Regular (2L)", sku: "VS-OU-102", category: "Urology Catheters", costPrice: 12, sellingPrice: 22, exportPrice: 0.62, moq: 2000, unit: "piece", leadTime: "5-7 days", stock: 18000 },
  { name: "Urine Bag with Hanger", sku: "VS-OU-103A", category: "Urology Catheters", costPrice: 14, sellingPrice: 25, exportPrice: 0.72, moq: 2000, unit: "piece", leadTime: "5-7 days", stock: 15000 },
  { name: "Urine Bag with Hanger and Hook", sku: "VS-OU-103B", category: "Urology Catheters", costPrice: 16, sellingPrice: 28, exportPrice: 0.82, moq: 2000, unit: "piece", leadTime: "5-7 days", stock: 13000 },
  { name: "Paediatric Urine Bag", sku: "VS-OU-104", category: "Urology Catheters", costPrice: 8, sellingPrice: 15, exportPrice: 0.42, moq: 3000, unit: "piece", leadTime: "5-7 days", stock: 18000 },
  { name: "Uro Meter (Hourly Output Bag)", sku: "VS-OU-106", category: "Urology Catheters", costPrice: 85, sellingPrice: 152, exportPrice: 4.35, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 2500 },
  { name: "Hemodialysis Blood Tubing Set", sku: "VS-BTS-950", category: "Urology Catheters", costPrice: 280, sellingPrice: 495, exportPrice: 14.20, moq: 200, unit: "set", leadTime: "14-21 days", stock: 850 },
  { name: "Hemodialysis Catheter Kit (DL/TL)", sku: "VS-HDC-1101", category: "Urology Catheters", costPrice: 850, sellingPrice: 1500, exportPrice: 43.00, moq: 100, unit: "kit", leadTime: "14-21 days", stock: 350 },
  { name: "AV Fistula Needle (16/17G)", sku: "VS-AV-1005", category: "Urology Catheters", costPrice: 32, sellingPrice: 58, exportPrice: 1.65, moq: 1000, unit: "piece", leadTime: "10-14 days", stock: 5500 },

  // ─── SURGIBASE RANGE — Surgical Instruments / Drapes ─────────────────
  { name: "Yankauer Suction Set", sku: "VS-YSC-825", category: "Surgical Instruments", costPrice: 45, sellingPrice: 80, exportPrice: 2.30, moq: 500, unit: "piece", leadTime: "7-10 days", stock: 3500 },
  { name: "Thoracic Drainage Catheter", sku: "VS-CDC-834", category: "Surgical Instruments", costPrice: 65, sellingPrice: 115, exportPrice: 3.30, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 2200 },
  { name: "Thoracic Drainage Catheter with Trocar", sku: "VS-TDC-835", category: "Surgical Instruments", costPrice: 95, sellingPrice: 168, exportPrice: 4.80, moq: 300, unit: "piece", leadTime: "10-14 days", stock: 1500 },
  { name: "Abdominal Drainage Kit", sku: "VS-ADK-836", category: "Surgical Instruments", costPrice: 145, sellingPrice: 258, exportPrice: 7.40, moq: 200, unit: "kit", leadTime: "10-14 days", stock: 1100 },
  { name: "Close Wound Suction Drain Unit (400/800ml)", sku: "VS-CWS-871", category: "Surgical Instruments", costPrice: 165, sellingPrice: 290, exportPrice: 8.30, moq: 200, unit: "unit", leadTime: "10-14 days", stock: 950 },
  { name: "Mini Close Wound Suction Drain Unit (50ml)", sku: "VS-CWS-871A", category: "Surgical Instruments", costPrice: 95, sellingPrice: 168, exportPrice: 4.80, moq: 300, unit: "unit", leadTime: "10-14 days", stock: 1400 },
  { name: "Under Water Seal Drainage Bag (ICD Bag)", sku: "VS-WDB-837", category: "Surgical Instruments", costPrice: 125, sellingPrice: 220, exportPrice: 6.30, moq: 200, unit: "piece", leadTime: "10-14 days", stock: 1300 },
  { name: "Corrugated Drainage Sheet", sku: "VS-CD-842", category: "Surgical Instruments", costPrice: 18, sellingPrice: 32, exportPrice: 0.92, moq: 2000, unit: "piece", leadTime: "7-10 days", stock: 8500 },
  { name: "Surgical Blade (Sterile)", sku: "VS-SB-871", category: "Surgical Instruments", costPrice: 1.5, sellingPrice: 3, exportPrice: 0.08, moq: 50000, unit: "piece", leadTime: "5-7 days", stock: 250000 },
  { name: "Skin Grafting Blade", sku: "VS-SGB-874", category: "Surgical Instruments", costPrice: 35, sellingPrice: 62, exportPrice: 1.78, moq: 1000, unit: "piece", leadTime: "10-14 days", stock: 4500 },
  { name: "Cautery Pencil (Electrosurgical)", sku: "VS-CP-873", category: "Surgical Instruments", costPrice: 45, sellingPrice: 80, exportPrice: 2.30, moq: 1000, unit: "piece", leadTime: "10-14 days", stock: 3500 },
  { name: "Skin Stapler", sku: "VS-ST-893", category: "Surgical Instruments", costPrice: 185, sellingPrice: 325, exportPrice: 9.30, moq: 200, unit: "piece", leadTime: "10-14 days", stock: 850 },

  // ─── GASTROCARE RANGE — Surgical & OT Products ───────────────────────
  { name: "Infant Feeding Tube", sku: "VS-IF-501", category: "Surgical Drapes & Procedure Kits", costPrice: 6, sellingPrice: 11, exportPrice: 0.32, moq: 5000, unit: "piece", leadTime: "5-7 days", stock: 35000 },
  { name: "Rectal Catheter", sku: "VS-RC-307", category: "Surgical Drapes & Procedure Kits", costPrice: 8, sellingPrice: 15, exportPrice: 0.42, moq: 3000, unit: "piece", leadTime: "5-7 days", stock: 18000 },
  { name: "Ryle's Tube (NG Tube)", sku: "VS-RT-503", category: "Surgical Drapes & Procedure Kits", costPrice: 12, sellingPrice: 22, exportPrice: 0.62, moq: 3000, unit: "piece", leadTime: "5-7 days", stock: 22000 },

  // ─── ANESTORESP CARE — Anesthesia Accessories ────────────────────────
  { name: "Suction Catheter", sku: "VS-SC-601", category: "Anesthesia Accessories", costPrice: 5, sellingPrice: 9, exportPrice: 0.26, moq: 10000, unit: "piece", leadTime: "5-7 days", stock: 65000 },
  { name: "Closed Suction Catheter", sku: "VS-CSC-1102", category: "Anesthesia Accessories", costPrice: 185, sellingPrice: 325, exportPrice: 9.30, moq: 200, unit: "piece", leadTime: "10-14 days", stock: 950 },
  { name: "Nasal Cannula (Dual-Pronged)", sku: "VS-NC-818", category: "Anesthesia Accessories", costPrice: 14, sellingPrice: 25, exportPrice: 0.72, moq: 2000, unit: "piece", leadTime: "5-7 days", stock: 18000 },
  { name: "Oxygen Mask (Adult/Pediatric)", sku: "VS-OXY-605", category: "Anesthesia Accessories", costPrice: 22, sellingPrice: 40, exportPrice: 1.15, moq: 2000, unit: "piece", leadTime: "5-7 days", stock: 12000 },
  { name: "Hi-Concentration Mask (NRBM)", sku: "VS-HCM-817", category: "Anesthesia Accessories", costPrice: 38, sellingPrice: 68, exportPrice: 1.95, moq: 1000, unit: "piece", leadTime: "7-10 days", stock: 5500 },
  { name: "Nebulizer Mask Kit", sku: "VS-NB-604", category: "Anesthesia Accessories", costPrice: 28, sellingPrice: 50, exportPrice: 1.42, moq: 1000, unit: "piece", leadTime: "7-10 days", stock: 7500 },
  { name: "Nebulizer with T-Mouth-PCS", sku: "VS-NB-606", category: "Anesthesia Accessories", costPrice: 32, sellingPrice: 56, exportPrice: 1.60, moq: 1000, unit: "piece", leadTime: "7-10 days", stock: 6500 },
  { name: "Suction Tube with Connector", sku: "VS-ST-826", category: "Anesthesia Accessories", costPrice: 18, sellingPrice: 32, exportPrice: 0.92, moq: 2000, unit: "piece", leadTime: "5-7 days", stock: 11000 },
  { name: "Venturi Oxygen Mask with 7-Dial", sku: "VS-HCM-817V", category: "Anesthesia Accessories", costPrice: 95, sellingPrice: 168, exportPrice: 4.80, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 2200 },
  { name: "Oropharyngeal / Guedel Airway", sku: "VS-GA-816", category: "Anesthesia Accessories", costPrice: 12, sellingPrice: 22, exportPrice: 0.62, moq: 2000, unit: "piece", leadTime: "7-10 days", stock: 14000 },
  { name: "Nasopharyngeal Airway", sku: "VS-NA-868", category: "Anesthesia Accessories", costPrice: 18, sellingPrice: 32, exportPrice: 0.92, moq: 2000, unit: "piece", leadTime: "7-10 days", stock: 9500 },
  { name: "Endotracheal Tube Cuffed", sku: "VS-ET-602", category: "Anesthesia Accessories", costPrice: 65, sellingPrice: 115, exportPrice: 3.30, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 3500 },
  { name: "Endotracheal Tube Uncuffed", sku: "VS-ET-603", category: "Anesthesia Accessories", costPrice: 55, sellingPrice: 95, exportPrice: 2.72, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 3800 },
  { name: "Tracheostomy Tube Cuffed", sku: "VS-TCS-607", category: "Anesthesia Accessories", costPrice: 285, sellingPrice: 500, exportPrice: 14.30, moq: 100, unit: "piece", leadTime: "14-21 days", stock: 650 },
  { name: "Spinal Needle (22G/25G)", sku: "VS-SPN-609", category: "Anesthesia Accessories", costPrice: 28, sellingPrice: 50, exportPrice: 1.42, moq: 1000, unit: "piece", leadTime: "7-10 days", stock: 8500 },
  { name: "Catheter Mount", sku: "VS-CM-819", category: "Anesthesia Accessories", costPrice: 48, sellingPrice: 85, exportPrice: 2.45, moq: 1000, unit: "piece", leadTime: "10-14 days", stock: 3500 },
  { name: "Breathing Filter (BVF/HME)", sku: "VS-BF-826", category: "Anesthesia Accessories", costPrice: 65, sellingPrice: 115, exportPrice: 3.30, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 2800 },
  { name: "T-Oxygenator with Tubing", sku: "VS-TO-820", category: "Anesthesia Accessories", costPrice: 85, sellingPrice: 152, exportPrice: 4.35, moq: 500, unit: "kit", leadTime: "10-14 days", stock: 2200 },
  { name: "Plain Ventilator Circuit", sku: "VS-VC-822", category: "Anesthesia Accessories", costPrice: 125, sellingPrice: 220, exportPrice: 6.30, moq: 200, unit: "piece", leadTime: "10-14 days", stock: 1500 },
  { name: "Single Water Trap Ventilator Circuit", sku: "VS-VC-823", category: "Anesthesia Accessories", costPrice: 165, sellingPrice: 295, exportPrice: 8.45, moq: 200, unit: "piece", leadTime: "10-14 days", stock: 1100 },
  { name: "Double Water Trap Ventilator Circuit", sku: "VS-VC-824", category: "Anesthesia Accessories", costPrice: 195, sellingPrice: 345, exportPrice: 9.85, moq: 200, unit: "piece", leadTime: "10-14 days", stock: 950 },
  { name: "Co-Axial Bain's Circuit", sku: "VS-BHV-867", category: "Anesthesia Accessories", costPrice: 285, sellingPrice: 500, exportPrice: 14.30, moq: 100, unit: "piece", leadTime: "14-21 days", stock: 550 },
  { name: "Ventilator Kit (HME + Catheter Mount)", sku: "VS-VK-870", category: "Anesthesia Accessories", costPrice: 245, sellingPrice: 432, exportPrice: 12.35, moq: 100, unit: "kit", leadTime: "14-21 days", stock: 650 },
  { name: "Non Invasive Ventilation Mask (NIV)", sku: "VS-NIV-869", category: "Anesthesia Accessories", costPrice: 385, sellingPrice: 680, exportPrice: 19.45, moq: 100, unit: "piece", leadTime: "14-21 days", stock: 450 },
  { name: "3-Ball Respiratory Exerciser", sku: "VS-BS-828", category: "Anesthesia Accessories", costPrice: 65, sellingPrice: 115, exportPrice: 3.30, moq: 500, unit: "piece", leadTime: "10-14 days", stock: 2500 },
  { name: "Silicon Resuscitator Kit (Ambu Bag) Adult", sku: "VS-AB-829", category: "Anesthesia Accessories", costPrice: 685, sellingPrice: 1200, exportPrice: 34.30, moq: 50, unit: "kit", leadTime: "14-21 days", stock: 220 },
  { name: "Silicon Resuscitator Kit Pediatric", sku: "VS-AB-830", category: "Anesthesia Accessories", costPrice: 625, sellingPrice: 1100, exportPrice: 31.45, moq: 50, unit: "kit", leadTime: "14-21 days", stock: 180 },
  { name: "Silicon Resuscitator Kit Neonatal", sku: "VS-AB-831", category: "Anesthesia Accessories", costPrice: 585, sellingPrice: 1030, exportPrice: 29.45, moq: 50, unit: "kit", leadTime: "14-21 days", stock: 160 },
  { name: "Re-Breathing Bags (0.5/1/2 Ltr)", sku: "VS-RB-840", category: "Anesthesia Accessories", costPrice: 125, sellingPrice: 220, exportPrice: 6.30, moq: 200, unit: "piece", leadTime: "10-14 days", stock: 1200 },

  // ─── WOUNDSECURE RANGE — Wound Care / Bandages ───────────────────────
  { name: "Plaster of Paris Bandage 7.5cm", sku: "VS-PPB-900", category: "Wound Care / Bandages", costPrice: 18, sellingPrice: 32, exportPrice: 0.92, moq: 2000, unit: "roll", leadTime: "5-7 days", stock: 14000 },
  { name: "Plaster of Paris Bandage 10cm", sku: "VS-PPB-901", category: "Wound Care / Bandages", costPrice: 22, sellingPrice: 38, exportPrice: 1.10, moq: 2000, unit: "roll", leadTime: "5-7 days", stock: 12000 },
  { name: "Plaster of Paris Bandage 15cm", sku: "VS-PPB-902", category: "Wound Care / Bandages", costPrice: 28, sellingPrice: 50, exportPrice: 1.42, moq: 1500, unit: "roll", leadTime: "5-7 days", stock: 9500 },
  { name: "Combine Dressing 10x10cm", sku: "VS-CD-905", category: "Wound Care / Bandages", costPrice: 8, sellingPrice: 14, exportPrice: 0.40, moq: 5000, unit: "piece", leadTime: "5-7 days", stock: 32000 },
  { name: "Combine Dressing 10x20cm", sku: "VS-CD-906", category: "Wound Care / Bandages", costPrice: 12, sellingPrice: 22, exportPrice: 0.62, moq: 3000, unit: "piece", leadTime: "5-7 days", stock: 18000 },
  { name: "Adhesive Tape (Spool Type)", sku: "VS-AT-909", category: "Wound Care / Bandages", costPrice: 15, sellingPrice: 28, exportPrice: 0.80, moq: 3000, unit: "roll", leadTime: "5-7 days", stock: 18000 },
  { name: "Adhesive Tape (Bamboo Type)", sku: "VS-AT-910", category: "Wound Care / Bandages", costPrice: 18, sellingPrice: 32, exportPrice: 0.92, moq: 3000, unit: "roll", leadTime: "5-7 days", stock: 15000 },
  { name: "Micropore Paper Tape", sku: "VS-PT-972", category: "Wound Care / Bandages", costPrice: 22, sellingPrice: 38, exportPrice: 1.10, moq: 2000, unit: "roll", leadTime: "5-7 days", stock: 14000 },
  { name: "Crepe Bandage 6cm/8cm/10cm/15cm", sku: "VS-CCB-913", category: "Wound Care / Bandages", costPrice: 25, sellingPrice: 45, exportPrice: 1.28, moq: 2000, unit: "roll", leadTime: "5-7 days", stock: 11000 },
  { name: "Gamjee Roll", sku: "VS-GR-911", category: "Wound Care / Bandages", costPrice: 35, sellingPrice: 62, exportPrice: 1.78, moq: 1500, unit: "roll", leadTime: "5-7 days", stock: 8500 },
  { name: "Soft Roll / Cotton Cast Padding", sku: "VS-SR-930", category: "Wound Care / Bandages", costPrice: 28, sellingPrice: 50, exportPrice: 1.42, moq: 2000, unit: "roll", leadTime: "5-7 days", stock: 9500 },
  { name: "Elastic Adhesive Bandage", sku: "VS-EB-919", category: "Wound Care / Bandages", costPrice: 45, sellingPrice: 80, exportPrice: 2.30, moq: 1000, unit: "roll", leadTime: "7-10 days", stock: 4800 },
  { name: "Absorbent Cotton Wool 500g", sku: "VS-ACW-957", category: "Wound Care / Bandages", costPrice: 95, sellingPrice: 168, exportPrice: 4.80, moq: 500, unit: "roll", leadTime: "5-7 days", stock: 2800 },

  // ─── MEDIESSENTIALS — Disposable Gloves ──────────────────────────────
  { name: "Examination Gloves (Latex/Nitrile)", sku: "VS-EGL-802", category: "Disposable Gloves", costPrice: 3.5, sellingPrice: 6.5, exportPrice: 0.18, moq: 50000, unit: "piece", leadTime: "5-7 days", stock: 480000 },
  { name: "Surgical Gloves (Sterile, Latex)", sku: "VS-SGL-801", category: "Disposable Gloves", costPrice: 8, sellingPrice: 14, exportPrice: 0.40, moq: 20000, unit: "pair", leadTime: "7-10 days", stock: 95000 },
  { name: "Plastic Gloves (LDPE)", sku: "VS-PEG-803", category: "Disposable Gloves", costPrice: 0.6, sellingPrice: 1.2, exportPrice: 0.03, moq: 100000, unit: "piece", leadTime: "5-7 days", stock: 800000 },

  // ─── MEDIESSENTIALS — Safety Syringes ────────────────────────────────
  { name: "Disposable Syringe 2ml/5ml/10ml", sku: "VS-DS-805", category: "Safety Syringes", costPrice: 2.2, sellingPrice: 4, exportPrice: 0.12, moq: 50000, unit: "piece", leadTime: "5-7 days", stock: 350000 },
  { name: "Blood Lancet (Sterile)", sku: "VS-BL-873", category: "Safety Syringes", costPrice: 1.2, sellingPrice: 2.5, exportPrice: 0.07, moq: 100000, unit: "piece", leadTime: "5-7 days", stock: 450000 },

  // ─── MEDIESSENTIALS — PPE Kits ───────────────────────────────────────
  { name: "Surgical Gown (Sterile SMS)", sku: "VS-AS-863", category: "PPE Kits", costPrice: 85, sellingPrice: 152, exportPrice: 4.35, moq: 500, unit: "piece", leadTime: "7-10 days", stock: 4500 },
  { name: "Surgical Apron (Disposable)", sku: "VS-SB-859", category: "PPE Kits", costPrice: 18, sellingPrice: 32, exportPrice: 0.92, moq: 2000, unit: "piece", leadTime: "5-7 days", stock: 18000 },
  { name: "Disposable Bed Sheet", sku: "VS-DK-887", category: "PPE Kits", costPrice: 12, sellingPrice: 22, exportPrice: 0.62, moq: 3000, unit: "piece", leadTime: "5-7 days", stock: 22000 },
  { name: "Shoe Covers (Anti-Skid)", sku: "VS-DSC-814", category: "PPE Kits", costPrice: 0.8, sellingPrice: 1.5, exportPrice: 0.04, moq: 50000, unit: "pair", leadTime: "5-7 days", stock: 250000 },
  { name: "Medical Caps (Bouffant)", sku: "VS-DC-805", category: "PPE Kits", costPrice: 0.5, sellingPrice: 1, exportPrice: 0.03, moq: 100000, unit: "piece", leadTime: "5-7 days", stock: 500000 },
  { name: "3-Ply Surgical Mask", sku: "VS-DFM-810", category: "PPE Kits", costPrice: 0.8, sellingPrice: 1.5, exportPrice: 0.04, moq: 100000, unit: "piece", leadTime: "5-7 days", stock: 750000 },
  { name: "Safe Delivery Kit (Complete)", sku: "VS-DK-887K", category: "PPE Kits", costPrice: 285, sellingPrice: 500, exportPrice: 14.30, moq: 200, unit: "kit", leadTime: "10-14 days", stock: 850 },
  { name: "HIV Protection Kit", sku: "VS-HK-848", category: "PPE Kits", costPrice: 165, sellingPrice: 295, exportPrice: 8.45, moq: 200, unit: "kit", leadTime: "10-14 days", stock: 1100 },
  { name: "Under Pad (60x60 / 60x90 cm)", sku: "VS-OU-107P", category: "PPE Kits", costPrice: 12, sellingPrice: 22, exportPrice: 0.62, moq: 3000, unit: "piece", leadTime: "5-7 days", stock: 18000 },

  // ─── DIAGNOSTICS — Rapid Test & Diagnostics ──────────────────────────
  { name: "COVID Rapid Test Kit", sku: "VS-DGT-COV", category: "Rapid Test & Diagnostics", costPrice: 45, sellingPrice: 80, exportPrice: 2.30, moq: 1000, unit: "kit", leadTime: "7-10 days", stock: 8500 },
  { name: "Dengue Test Kit (NS1/IgG/IgM)", sku: "VS-DGT-DEN", category: "Rapid Test & Diagnostics", costPrice: 65, sellingPrice: 115, exportPrice: 3.30, moq: 1000, unit: "kit", leadTime: "7-10 days", stock: 5500 },
  { name: "Malaria Test Kit (Pf/Pv)", sku: "VS-DGT-MAL", category: "Rapid Test & Diagnostics", costPrice: 38, sellingPrice: 68, exportPrice: 1.95, moq: 1000, unit: "kit", leadTime: "7-10 days", stock: 7500 },
  { name: "HIV Test Kit (1/2)", sku: "VS-DGT-HIV", category: "Rapid Test & Diagnostics", costPrice: 55, sellingPrice: 98, exportPrice: 2.80, moq: 1000, unit: "kit", leadTime: "7-10 days", stock: 4800 },
  { name: "Pregnancy Test Kit (hCG Strip)", sku: "VS-DGT-PRG", category: "Rapid Test & Diagnostics", costPrice: 8, sellingPrice: 15, exportPrice: 0.42, moq: 5000, unit: "kit", leadTime: "5-7 days", stock: 35000 },
  { name: "Blood Glucose Test Strips (50/box)", sku: "VS-DGT-BGS", category: "Rapid Test & Diagnostics", costPrice: 285, sellingPrice: 500, exportPrice: 14.30, moq: 200, unit: "box", leadTime: "7-10 days", stock: 1500 },

  // ─── HOSPITAL FURNITURE ──────────────────────────────────────────────
  { name: "Hospital Bed (3-Function Manual)", sku: "VS-HF-BED-3M", category: "Hospital Furniture", costPrice: 18500, sellingPrice: 32500, exportPrice: 928, moq: 5, unit: "piece", leadTime: "21-30 days", stock: 28 },
  { name: "ICU Bed (5-Function Electric)", sku: "VS-HF-BED-ICU", category: "Hospital Furniture", costPrice: 78000, sellingPrice: 138000, exportPrice: 3942, moq: 2, unit: "piece", leadTime: "30-45 days", stock: 8 },
  { name: "Examination Table (Steel)", sku: "VS-HF-EXAM", category: "Hospital Furniture", costPrice: 7800, sellingPrice: 13800, exportPrice: 395, moq: 5, unit: "piece", leadTime: "14-21 days", stock: 35 },
  { name: "Wheelchair (Folding)", sku: "VS-HF-WC", category: "Hospital Furniture", costPrice: 4200, sellingPrice: 7500, exportPrice: 215, moq: 10, unit: "piece", leadTime: "14-21 days", stock: 65 },
  { name: "IV Stand (4-Hook Mobile)", sku: "VS-HF-IVS", category: "Hospital Furniture", costPrice: 850, sellingPrice: 1500, exportPrice: 43, moq: 20, unit: "piece", leadTime: "10-14 days", stock: 180 },
  { name: "Patient Trolley (Stretcher)", sku: "VS-HF-PT", category: "Hospital Furniture", costPrice: 12500, sellingPrice: 22000, exportPrice: 628, moq: 5, unit: "piece", leadTime: "21-30 days", stock: 22 },
  { name: "Bedside Locker (Steel)", sku: "VS-HF-BSL", category: "Hospital Furniture", costPrice: 2200, sellingPrice: 3850, exportPrice: 110, moq: 10, unit: "piece", leadTime: "14-21 days", stock: 85 },
  { name: "Overbed Table (Adjustable)", sku: "VS-HF-OBT", category: "Hospital Furniture", costPrice: 1850, sellingPrice: 3250, exportPrice: 93, moq: 10, unit: "piece", leadTime: "14-21 days", stock: 95 },
];

async function main() {
  console.log("🌱 Seeding Vivan Surgical (Surat) supplier and products...\n");

  // ─── 1. Create / update Vivan Surgical supplier ─────────────────────
  const supplier = await prisma.supplier.upsert({
    where: { id: SUPPLIER_ID },
    update: {
      name: "Vivan Surgical Export & Import",
      location: "Surat, Gujarat",
      contactPhone: "+91 9104300724",
      email: "vivansurgical@gmail.com",
      certifications: ["ISO 13485", "CE Mark", "WHO GMP", "ISO 9001", "GMP Certified", "CDSCO Registered"],
      productCategories: [
        "IV Infusion Sets", "IV Catheters / Cannulas", "Urology Catheters",
        "Surgical Instruments", "Surgical Drapes & Procedure Kits",
        "Anesthesia Accessories", "Wound Care / Bandages", "Disposable Gloves",
        "Safety Syringes", "PPE Kits", "Rapid Test & Diagnostics",
        "Respiratory Care", "Hospital Furniture",
      ],
      reliabilityScore: 94,
      trustScore: 92,
      onTimeDelivery: 95,
      qualityRejectionRate: 0.8,
    },
    create: {
      id: SUPPLIER_ID,
      name: "Vivan Surgical Export & Import",
      location: "Surat, Gujarat",
      contactPhone: "+91 9104300724",
      email: "vivansurgical@gmail.com",
      certifications: ["ISO 13485", "CE Mark", "WHO GMP", "ISO 9001", "GMP Certified", "CDSCO Registered"],
      productCategories: [
        "IV Infusion Sets", "IV Catheters / Cannulas", "Urology Catheters",
        "Surgical Instruments", "Surgical Drapes & Procedure Kits",
        "Anesthesia Accessories", "Wound Care / Bandages", "Disposable Gloves",
        "Safety Syringes", "PPE Kits", "Rapid Test & Diagnostics",
        "Respiratory Care", "Hospital Furniture",
      ],
      reliabilityScore: 94,
      trustScore: 92,
      onTimeDelivery: 95,
      qualityRejectionRate: 0.8,
    },
  });
  console.log(`✅ Supplier: ${supplier.name} (${supplier.location})`);

  // ─── 2. Bulk upsert products ────────────────────────────────────────
  let created = 0;
  let updated = 0;
  for (const p of products) {
    const exists = await prisma.product.findUnique({ where: { sku: p.sku } });
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        category: p.category,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        exportPrice: p.exportPrice,
        moq: p.moq,
        unit: p.unit,
        leadTime: p.leadTime,
        stock: p.stock,
        supplierId: SUPPLIER_ID,
        certifications: ["ISO 13485", "CE Mark"],
        exportAvailable: true,
      },
      create: {
        name: p.name,
        sku: p.sku,
        category: p.category,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        exportPrice: p.exportPrice,
        moq: p.moq,
        unit: p.unit,
        leadTime: p.leadTime,
        stock: p.stock,
        supplierId: SUPPLIER_ID,
        certifications: ["ISO 13485", "CE Mark"],
        exportAvailable: true,
      },
    });
    if (exists) updated++; else created++;
  }
  console.log(`✅ Products: ${created} created, ${updated} updated (${products.length} total)\n`);
  console.log("🎉 Vivan Surgical catalogue imported successfully!");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
