import { PrismaClient, UserRole, LeadType } from "@prisma/client";
import bcrypt from "bcryptjs";

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
        reliabilityScore: 92,
        trustScore: 88,
        totalOrders: 45,
        onTimeDelivery: 94,
        qualityRejectionRate: 1.2,
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
        reliabilityScore: 96,
        trustScore: 94,
        totalOrders: 28,
        onTimeDelivery: 97,
        qualityRejectionRate: 0.5,
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
        reliabilityScore: 89,
        trustScore: 85,
        totalOrders: 62,
        onTimeDelivery: 88,
        qualityRejectionRate: 2.1,
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
        reliabilityScore: 95,
        trustScore: 93,
        totalOrders: 35,
        onTimeDelivery: 96,
        qualityRejectionRate: 0.8,
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
        reliabilityScore: 90,
        trustScore: 87,
        totalOrders: 20,
        onTimeDelivery: 91,
        qualityRejectionRate: 1.5,
      },
    }),
  ]);
  console.log(`✅ ${suppliers.length} suppliers created`);

  // ============================================
  // 3. Create Products
  // ============================================
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: "UH-SDK-GS-001" },
      update: {},
      create: {
        name: "Surgical Drape Kit - General Surgery",
        category: "Surgical Drapes & Procedure Kits",
        sku: "UH-SDK-GS-001",
        costPrice: 180,
        sellingPrice: 320,
        exportPrice: 8.5,
        moq: 500,
        unit: "kit",
        supplierId: "sup-gujarat-medpack",
        leadTime: "7-10 days",
        certifications: ["ISO 13485", "CE Mark"],
        exportAvailable: true,
        stock: 2500,
        targetMargin: 45,
      },
    }),
    prisma.product.upsert({
      where: { sku: "UH-IVS-STD-001" },
      update: {},
      create: {
        name: "IV Infusion Set - Standard",
        category: "IV Infusion Sets",
        sku: "UH-IVS-STD-001",
        costPrice: 8,
        sellingPrice: 14,
        exportPrice: 0.42,
        moq: 5000,
        unit: "piece",
        supplierId: "sup-romsons",
        leadTime: "5-7 days",
        certifications: ["ISO 13485", "CE Mark", "WHO GMP"],
        exportAvailable: true,
        stock: 50000,
        targetMargin: 35,
      },
    }),
    prisma.product.upsert({
      where: { sku: "UH-IVS-BUR-001" },
      update: {},
      create: {
        name: "IV Infusion Set - Burette (Pediatric)",
        category: "IV Infusion Sets",
        sku: "UH-IVS-BUR-001",
        costPrice: 22,
        sellingPrice: 38,
        exportPrice: 0.95,
        moq: 2000,
        unit: "piece",
        supplierId: "sup-romsons",
        leadTime: "7-10 days",
        certifications: ["ISO 13485", "CE Mark"],
        exportAvailable: true,
        stock: 15000,
        targetMargin: 38,
      },
    }),
    prisma.product.upsert({
      where: { sku: "UH-SUT-PG910-001" },
      update: {},
      create: {
        name: "Surgical Sutures - Polyglactin 910 (2-0)",
        category: "Surgical Sutures",
        sku: "UH-SUT-PG910-001",
        costPrice: 45,
        sellingPrice: 78,
        exportPrice: 1.8,
        moq: 1000,
        unit: "piece",
        supplierId: "sup-sutures-india",
        leadTime: "10-14 days",
        certifications: ["ISO 13485", "CE Mark", "WHO GMP"],
        exportAvailable: true,
        stock: 15000,
        targetMargin: 40,
      },
    }),
    prisma.product.upsert({
      where: { sku: "UH-IVC-20G-001" },
      update: {},
      create: {
        name: "IV Cannula - 20G (Pink)",
        category: "IV Catheters / Cannulas",
        sku: "UH-IVC-20G-001",
        costPrice: 12,
        sellingPrice: 22,
        exportPrice: 0.55,
        moq: 5000,
        unit: "piece",
        supplierId: "sup-poly-medicure",
        leadTime: "7-10 days",
        certifications: ["ISO 13485", "CE Mark", "CDSCO Registered"],
        exportAvailable: true,
        stock: 80000,
        targetMargin: 38,
      },
    }),
    prisma.product.upsert({
      where: { sku: "UH-ANS-BC-001" },
      update: {},
      create: {
        name: "Anesthesia Breathing Circuit - Adult",
        category: "Anesthesia Accessories",
        sku: "UH-ANS-BC-001",
        costPrice: 250,
        sellingPrice: 450,
        exportPrice: 12.0,
        moq: 200,
        unit: "piece",
        supplierId: "sup-gujarat-medpack",
        leadTime: "10-14 days",
        certifications: ["ISO 13485", "CE Mark"],
        exportAvailable: true,
        stock: 3000,
        targetMargin: 42,
      },
    }),
    prisma.product.upsert({
      where: { sku: "UH-GLV-NIT-M-001" },
      update: {},
      create: {
        name: "Nitrile Examination Gloves - Medium",
        category: "Disposable Gloves",
        sku: "UH-GLV-NIT-M-001",
        costPrice: 3.5,
        sellingPrice: 6,
        exportPrice: 0.12,
        moq: 50000,
        unit: "piece",
        supplierId: "sup-kanam-latex",
        leadTime: "5-7 days",
        certifications: ["ISO 13485", "CE Mark", "FDA 510(k)"],
        exportAvailable: true,
        stock: 500000,
        targetMargin: 20,
      },
    }),
    prisma.product.upsert({
      where: { sku: "UH-SDK-ORT-001" },
      update: {},
      create: {
        name: "Surgical Drape Kit - Orthopaedic",
        category: "Surgical Drapes & Procedure Kits",
        sku: "UH-SDK-ORT-001",
        costPrice: 280,
        sellingPrice: 520,
        exportPrice: 14.5,
        moq: 300,
        unit: "kit",
        supplierId: "sup-gujarat-medpack",
        leadTime: "10-14 days",
        certifications: ["ISO 13485", "CE Mark"],
        exportAvailable: true,
        stock: 1200,
        targetMargin: 48,
      },
    }),
  ]);
  console.log(`✅ ${products.length} products created`);

  // ============================================
  // 4. Create Leads
  // ============================================
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        name: "City Hospital Jaipur",
        type: LeadType.HOSPITAL,
        contactPerson: "Dr. Rajesh Sharma",
        email: "procurement@cityhospital.in",
        phone: "+91 98765 43210",
        stage: "Quotation Sent",
        estimatedValue: 450000,
        products: ["IV Infusion Sets", "Surgical Drapes & Procedure Kits", "Disposable Gloves"],
        lastContactDate: new Date("2025-05-08"),
        nextFollowUp: new Date("2025-05-15"),
      },
    }),
    prisma.lead.create({
      data: {
        name: "KEMSA - Kenya",
        type: LeadType.GOVERNMENT,
        contactPerson: "James Ochieng",
        email: "procurement@kemsa.go.ke",
        phone: "+254 700 123456",
        stage: "RFQ Received",
        estimatedValue: 2500000,
        products: ["Surgical Drapes & Procedure Kits", "IV Infusion Sets", "Surgical Sutures"],
        lastContactDate: new Date("2025-05-10"),
        nextFollowUp: new Date("2025-05-12"),
      },
    }),
    prisma.lead.create({
      data: {
        name: "Al Noor Hospital Group",
        type: LeadType.HOSPITAL_CHAIN,
        contactPerson: "Ahmed Al-Rashid",
        email: "supply@alnoor.ae",
        phone: "+971 50 123 4567",
        stage: "Negotiation",
        estimatedValue: 1800000,
        products: ["Anesthesia Accessories", "IV Catheters / Cannulas", "Surgical Sutures"],
        lastContactDate: new Date("2025-05-09"),
        nextFollowUp: new Date("2025-05-13"),
      },
    }),
    prisma.lead.create({
      data: {
        name: "Apex Multispeciality Hospital",
        type: LeadType.HOSPITAL,
        contactPerson: "Priya Mehta",
        email: "purchase@apexhospital.in",
        phone: "+91 97654 32109",
        stage: "Lead",
        estimatedValue: 280000,
        products: ["IV Infusion Sets", "Disposable Gloves", "Wound Care / Bandages"],
        lastContactDate: new Date("2025-05-11"),
        nextFollowUp: new Date("2025-05-14"),
      },
    }),
    prisma.lead.create({
      data: {
        name: "Tanzania MSD",
        type: LeadType.GOVERNMENT,
        contactPerson: "Dr. Amina Mwangi",
        email: "procurement@msd.go.tz",
        phone: "+255 22 123 4567",
        stage: "Lead",
        estimatedValue: 1200000,
        products: ["IV Infusion Sets", "Safety Syringes", "Surgical Drapes & Procedure Kits"],
        lastContactDate: new Date("2025-05-06"),
        nextFollowUp: new Date("2025-05-16"),
      },
    }),
  ]);
  console.log(`✅ ${leads.length} leads created`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("   Admin login: admin@upahealthsupplies.com / admin123");
  console.log("   Sales login: sales@upahealthsupplies.com / sales123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
