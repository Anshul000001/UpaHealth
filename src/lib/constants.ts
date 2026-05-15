export const COMPANY_INFO = {
  name: "UpaHealth Supplies",
  tagline: "Your Path to Wellness",
  email: "adminupahealthsupplies@gmail.com",
  website: "www.upahealthsupplies.com",
  address: "India",
  gst: "PENDING",
  iec: "PENDING",
};

export const PRODUCT_CATEGORIES = [
  "Surgical Drapes & Procedure Kits",
  "Anesthesia Accessories",
  "Surgical Sutures",
  "IV Catheters / Cannulas",
  "IV Infusion Sets",
  "Wound Care / Bandages",
  "Disposable Gloves",
  "Safety Syringes",
  "Blood Bags",
  "Urology Catheters",
  "PPE Kits",
  "Surgical Instruments",
] as const;

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
