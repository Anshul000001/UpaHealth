import { PrismaClient, UserRole, LeadType } from "@prisma/client";
import bcrypt from "bcryptjs";
// Seed v2 — full product catalog

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding UpaHealth database...");

  // ============================================
  // 1. Create Admin User
  // ============================================
  const passwordHash = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@upahealthsupplies.com" },
    update: {},
    create: {
      name: "UpaHealth Admin",
      email: "admin@upahealthsupplies.com",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
  console.log("✅ Admin user created:", adminUser.email);

  // Sales user
  const salesUser = await prisma.user.upsert({
    where: { email: "sales@upahealthsupplies.com" },
    update: {},
    create: {
      name: "Sales Team",
      email: "sales@upahealthsupplies.com",
      passwordHash: await bcrypt.hash("sales123", 10),
      role: UserRole.SALES_USER,
    },
  });
  console.log("✅ Sales user created:", salesUser.email);

  // ============================================
  // 2. Create Suppliers
  // ============================================
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { id: "sup-gujarat-medpack" },
      update: {},
      create: {
        id: "sup-gujarat-medpack",
        name: "Gujarat MedPack Pvt Ltd",
        location: "Ahmedabad, Gujarat",
        contactPhone: "+91 79 2345 6789",
        email: "sales@gujaratmedpack.com",
        certifications: ["ISO 13485", "CE Mark", "WHO GMP"],
        productCategories: ["Surgical Drapes & Procedure Kits", "Anesthesia Accessories", "PPE Kits"],
        reliabilityScore: 92, trustScore: 88, totalOrders: 45, onTimeDelivery: 94, qualityRejectionRate: 1.2,
      },
    }),
    prisma.supplier.upsert({
      where: { id: "sup-sutures-india" },
      update: {},
      create: {
        id: "sup-sutures-india",
        name: "Sutures India Pvt Ltd",
        location: "Bangalore, Karnataka",
        contactPhone: "+91 80 4567 8901",
        email: "export@suturesindia.com",
        certifications: ["ISO 13485", "CE Mark", "WHO GMP", "CDSCO Registered"],
        productCategories: ["Surgical Sutures"],
        reliabilityScore: 96, trustScore: 94, totalOrders: 28, onTimeDelivery: 97, qualityRejectionRate: 0.5,
      },
    }),
    prisma.supplier.upsert({
      where: { id: "sup-romsons" },
      update: {},
      create: {
        id: "sup-romsons",
        name: "Romsons Group",
        location: "Agra, Uttar Pradesh",
        contactPhone: "+91 562 234 5678",
        email: "exports@romsons.com",
        certifications: ["ISO 13485", "CE Mark", "FDA 510(k)"],
        productCategories: ["IV Infusion Sets", "Urology Catheters", "Blood Bags", "Wound Care / Bandages"],
        reliabilityScore: 89, trustScore: 85, totalOrders: 62, onTimeDelivery: 88, qualityRejectionRate: 2.1,
      },
    }),
    prisma.supplier.upsert({
      where: { id: "sup-poly-medicure" },
      update: {},
      create: {
        id: "sup-poly-medicure",
        name: "Poly Medicure Ltd",
        location: "Faridabad, Haryana",
        contactPhone: "+91 129 456 7890",
        email: "info@polymedicure.com",
        certifications: ["ISO 13485", "CE Mark", "WHO GMP", "CDSCO Registered"],
        productCategories: ["IV Catheters / Cannulas", "Blood Bags", "Surgical Instruments"],
        reliabilityScore: 95, trustScore: 93, totalOrders: 35, onTimeDelivery: 96, qualityRejectionRate: 0.8,
      },
    }),
    prisma.supplier.upsert({
      where: { id: "sup-kanam-latex" },
      update: {},
      create: {
        id: "sup-kanam-latex",
        name: "Kanam Latex Industries",
        location: "Kottayam, Kerala",
        contactPhone: "+91 481 234 5678",
        email: "export@kanamlatex.com",
        certifications: ["ISO 13485", "CE Mark", "FDA 510(k)"],
        productCategories: ["Disposable Gloves"],
        reliabilityScore: 90, trustScore: 87, totalOrders: 20, onTimeDelivery: 91, qualityRejectionRate: 1.5,
      },
    }),
    // New suppliers for expanded catalog
    prisma.supplier.upsert({
      where: { id: "sup-nephro-care" },
      update: {},
      create: {
        id: "sup-nephro-care",
        name: "NephroCare Medical Pvt Ltd",
        location: "Surat, Gujarat",
        contactPhone: "+91 261 234 5678",
        email: "sales@nephrocare.in",
        certifications: ["ISO 13485", "CE Mark", "WHO GMP", "CDSCO Registered"],
        productCategories: ["Urology Catheters"],
        reliabilityScore: 91, trustScore: 89, totalOrders: 30, onTimeDelivery: 93, qualityRejectionRate: 1.0,
      },
    }),
    prisma.supplier.upsert({
      where: { id: "sup-surgi-india" },
      update: {},
      create: {
        id: "sup-surgi-india",
        name: "SurgiIndia Exports Pvt Ltd",
        location: "Chennai, Tamil Nadu",
        contactPhone: "+91 44 2345 6789",
        email: "exports@surgiindia.com",
        certifications: ["ISO 13485", "CE Mark", "WHO GMP"],
        productCategories: ["Surgical Instruments", "Surgical Drapes & Procedure Kits"],
        reliabilityScore: 88, trustScore: 86, totalOrders: 40, onTimeDelivery: 90, qualityRejectionRate: 1.8,
      },
    }),
    prisma.supplier.upsert({
      where: { id: "sup-diagnostics-hub" },
      update: {},
      create: {
        id: "sup-diagnostics-hub",
        name: "DiagnosticsHub India Pvt Ltd",
        location: "Pune, Maharashtra",
        contactPhone: "+91 20 2345 6789",
        email: "sales@diagnosticshub.in",
        certifications: ["ISO 13485", "CE Mark", "CDSCO Registered"],
        productCategories: ["Rapid Test & Diagnostics"],
        reliabilityScore: 87, trustScore: 85, totalOrders: 25, onTimeDelivery: 89, qualityRejectionRate: 1.3,
      },
    }),
    prisma.supplier.upsert({
      where: { id: "sup-respiro-med" },
      update: {},
      create: {
        id: "sup-respiro-med",
        name: "RespiroMed Technologies",
        location: "Hyderabad, Telangana",
        contactPhone: "+91 40 2345 6789",
        email: "info@respiromed.in",
        certifications: ["ISO 13485", "CE Mark", "BIS Certified"],
        productCategories: ["Respiratory Care"],
        reliabilityScore: 86, trustScore: 84, totalOrders: 18, onTimeDelivery: 88, qualityRejectionRate: 1.5,
      },
    }),
    prisma.supplier.upsert({
      where: { id: "sup-hospital-equip" },
      update: {},
      create: {
        id: "sup-hospital-equip",
        name: "HospEquip India Ltd",
        location: "Delhi, NCR",
        contactPhone: "+91 11 2345 6789",
        email: "sales@hospequip.in",
        certifications: ["ISO 13485", "BIS Certified"],
        productCategories: ["Hospital Furniture"],
        reliabilityScore: 85, trustScore: 83, totalOrders: 22, onTimeDelivery: 87, qualityRejectionRate: 2.0,
      },
    }),
  ]);
  console.log(`✅ ${suppliers.length} suppliers created`);
