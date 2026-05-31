export const COMPANY_INFO = {
  name: "UpaHealth Supplies",
  tagline: "Your Path to Wellness",
  email: "adminupahealthsupplies@gmail.com",
  phone: "+91 92748 42737",
  website: "www.upahealthsupplies.com",
  address: "India",
  gst: "PENDING",
  iec: "PENDING",
};

export const PRODUCT_CATEGORIES = [
  // INFUCARE RANGE
  "IV Infusion Sets",
  // FLOWLINE RANGE
  "IV Catheters / Cannulas",
  // NEPHRO-URO RANGE
  "Urology Catheters",
  // SURGIBASE RANGE
  "Surgical Drapes & Procedure Kits",
  "Surgical Instruments",
  "Anesthesia Accessories",
  "Surgical Sutures",
  // WOUND CARE
  "Wound Care / Bandages",
  // DISPOSABLES
  "Disposable Gloves",
  "Safety Syringes",
  "PPE Kits",
  // DIAGNOSTICS
  "Rapid Test & Diagnostics",
  // RESPIRATORY
  "Respiratory Care",
  // HOSPITAL FURNITURE
  "Hospital Furniture",
  // BLOOD
  "Blood Bags",
] as const;

export const PRODUCT_RANGES = [
  {
    id: "infucare",
    name: "INFUCARE RANGE",
    subtitle: "IV & Infusion Products",
    category: "IV Infusion Sets",
    color: "cyan",
    products: [
      "IV Infusion Set", "Vented IV Set", "Non-Vented IV Set", "Premium IV Set",
      "Micro Infusion Set", "Pediatric Infusion Set", "Measured Volume Set",
      "Blood Transfusion Set", "Flow Regulator Set", "Burette Set",
      "Extension Line", "Scalp Vein Set",
    ],
    features: ["Sterile", "Disposable", "EO Sterilized", "Kink Resistant Tube", "Precision Flow Control"],
  },
  {
    id: "flowline",
    name: "FLOWLINE RANGE",
    subtitle: "IV Access & Connectivity",
    category: "IV Catheters / Cannulas",
    color: "blue",
    products: [
      "IV Cannula", "Safety IV Cannula", "3-Way Stopcock", "Extension Tube",
      "Connector Tubing", "Needle Free Connector", "Umbilical Catheter",
    ],
    sizes: ["14G", "16G", "18G", "20G", "22G", "24G", "26G"],
    features: ["Leak Proof", "Smooth Insertion", "Flexible Wings", "Color Coded"],
  },
  {
    id: "nephro-uro",
    name: "NEPHRO-URO RANGE",
    subtitle: "Urology & Dialysis Products",
    category: "Urology Catheters",
    color: "teal",
    products: [
      "Foley Catheter (2-Way)", "Foley Catheter (3-Way)", "Silicone Foley Catheter",
      "Nelaton Catheter", "Urine Collection Bag", "Pediatric Urine Bag",
      "Urine Meter / Urometer", "Hemodialysis Blood Tubing Set",
      "AV Fistula Needle", "Suction Catheter",
    ],
    features: ["Medical Grade PVC/Silicone", "Sterile Packed", "Smooth Surface Finish"],
  },
  {
    id: "surgibase",
    name: "SURGIBASE RANGE",
    subtitle: "Surgical & OT Products",
    category: "Surgical Instruments",
    color: "indigo",
    products: [
      "Yankauer Suction Set", "Thoracic Drainage Catheter", "Abdominal Drainage Kit",
      "Surgical Drainage Tube", "Feeding Tube", "Ryle's Tube",
    ],
    features: ["High Flexibility", "Surgical Grade", "Easy Drainage"],
  },
  {
    id: "wound-care",
    name: "WOUND CARE & DRESSING",
    subtitle: "Wound Management",
    category: "Wound Care / Bandages",
    color: "emerald",
    products: [
      "Surgical Gauze", "Cotton Roll", "Cotton Wool", "Crepe Bandage",
      "Adhesive Tape", "Microporous Tape", "Dressing Pad", "Sterile Dressing Kit",
    ],
    features: ["High Absorbency", "Skin Friendly", "Soft Material"],
  },
  {
    id: "disposables",
    name: "DISPOSABLE PRODUCTS",
    subtitle: "Single-Use Medical Supplies",
    category: "Disposable Gloves",
    color: "violet",
    products: [
      "Disposable Syringe", "Disposable Gloves", "Surgical Gloves",
      "Examination Gloves", "Face Mask", "Surgical Mask",
      "Disposable Apron", "Disposable Cap", "Shoe Cover",
    ],
    sizes: ["2ml", "5ml", "10ml", "20ml", "50ml"],
    features: ["Sterile", "Single Use", "Latex/Nitrile Options"],
  },
  {
    id: "diagnostics",
    name: "RAPID TEST & DIAGNOSTICS",
    subtitle: "Point-of-Care Testing",
    category: "Rapid Test & Diagnostics",
    color: "orange",
    products: [
      "COVID Rapid Test Kit", "Malaria Test Kit", "HIV Test Kit",
      "Dengue Test Kit", "Pregnancy Test Kit", "Blood Glucose Test Strip",
    ],
    features: ["Fast Results", "High Sensitivity", "Easy to Use"],
  },
  {
    id: "respiratory",
    name: "RESPIRATORY CARE",
    subtitle: "Breathing & Oxygen Support",
    category: "Respiratory Care",
    color: "sky",
    products: [
      "Oxygen Concentrator", "CPAP Machine", "BiPAP Machine",
      "Nebulizer Kit", "Oxygen Mask", "Nasal Oxygen Cannula",
    ],
    features: ["Medical Grade", "Certified", "Reliable Performance"],
  },
  {
    id: "furniture",
    name: "HOSPITAL FURNITURE",
    subtitle: "Patient Care Equipment",
    category: "Hospital Furniture",
    color: "slate",
    products: [
      "Hospital Bed", "ICU Bed", "Examination Table", "Wheelchair",
      "Bedside Locker", "IV Stand", "Overbed Table", "Patient Trolley",
    ],
    features: ["Durable", "Easy to Clean", "Adjustable"],
  },
] as const;

export const HIGH_MARGIN_PRODUCTS = [
  "IV Infusion Sets",
  "IV Catheters / Cannulas",
  "Surgical Drapes & Procedure Kits",
  "Surgical Sutures",
  "Disposable Gloves",
  "Urology Catheters",
] as const;

export const SEO_KEYWORDS = [
  "Medical Consumables Supplier India",
  "Surgical Disposable Exporter",
  "IV Set Manufacturer India",
  "Hospital Consumables Supplier",
  "Surgical Products Export",
  "Healthcare Procurement India",
  "Medical Device Supplier Gujarat",
] as const;

export const POSITIONING_LINE = "India's AI-Enabled Healthcare Sourcing & Surgical Consumables Partner";

export const EXPORT_MARKETS = [
  { region: "East Africa", countries: ["Kenya", "Tanzania", "Ethiopia", "Uganda", "Rwanda"], priority: "P1" },
  { region: "Middle East / GCC", countries: ["UAE", "Saudi Arabia", "Kuwait", "Qatar"], priority: "P1" },
  { region: "Southeast Asia", countries: ["Philippines", "Vietnam", "Myanmar", "Cambodia"], priority: "P2" },
  { region: "SAARC", countries: ["Bangladesh", "Sri Lanka", "Nepal"], priority: "P2" },
  { region: "UK & Europe", countries: ["United Kingdom", "Germany", "France"], priority: "P3" },
] as const;

export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
] as const;

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export const PIPELINE_STAGES = [
  "Lead",
  "RFQ Received",
  "Quotation Sent",
  "Negotiation",
  "Order Confirmed",
  "Shipped",
  "Delivered",
  "Closed Won",
  "Closed Lost",
] as const;

export const SUPPLIER_CERTIFICATIONS = [
  "ISO 13485",
  "CE Mark",
  "WHO GMP",
  "CDSCO Registered",
  "FDA 510(k)",
  "BIS Certified",
] as const;

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Catalogue", href: "/dashboard/catalogue", icon: "ShoppingCart" },
  { label: "Quotations", href: "/dashboard/quotations", icon: "FileText" },
  { label: "RFQ Parser", href: "/dashboard/rfq", icon: "Upload" },
  { label: "Products", href: "/dashboard/products", icon: "Package" },
  { label: "Suppliers", href: "/dashboard/suppliers", icon: "Factory" },
  { label: "CRM", href: "/dashboard/crm", icon: "Users" },
  { label: "Export Intel", href: "/dashboard/export", icon: "Globe" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
  { label: "AI Assistant", href: "/dashboard/ai", icon: "Bot" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
] as const;
