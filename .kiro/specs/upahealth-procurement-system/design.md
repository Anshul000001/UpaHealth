# Design Document: UpaHealth Procurement System

## Architecture Overview

The UpaHealth Procurement System follows a layered architecture built on Next.js 16 App Router with server-side rendering and API routes. The system is organized into five core modules: Authentication, Supplier Management, Product Catalog, Quotation Engine, and CRM Pipeline, with cross-cutting concerns handled by shared services (database, AI engine, export).

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  React 19 Components (Server + Client)              │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │ Dashboard │ │Quotation │ │   CRM    │  ...      │    │
│  │  └──────────┘ └──────────┘ └──────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                 Next.js 16 App Router                        │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │  Middleware       │  │  API Routes (/api/*)           │  │
│  │  (Auth Guard)     │  │  ┌────────┐ ┌────────┐       │  │
│  │                   │  │  │Supplier│ │Product │  ...   │  │
│  └──────────────────┘  │  └────────┘ └────────┘       │  │
│                         └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Auth Svc  │ │Supplier  │ │Quotation │ │AI Engine │      │
│  │          │ │Service   │ │Service   │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              Prisma ORM + PostgreSQL (Supabase/Neon)         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| UI Components | Radix UI primitives, Lucide icons, Recharts, Framer Motion |
| Authentication | NextAuth.js v5 (Auth.js) with Credentials provider |
| ORM | Prisma with PostgreSQL |
| Database | PostgreSQL (Supabase or Neon) |
| PDF Generation | jsPDF + jspdf-autotable |
| Excel Export | xlsx (SheetJS) |
| AI Features | Template-based rule engine (no LLM) |

---

## Database Schema (Prisma Models)

### Entity Relationship Diagram

```
User 1──* Session
User 1──* Quotation (createdBy)
Supplier 1──* Product
Product 1──* QuotationLineItem
Quotation 1──* QuotationLineItem
Lead 1──* LeadStageTransition
Lead 1──* Quotation
```


### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  SALES_USER
  VIEWER
}

enum QuotationStatus {
  DRAFT
  SENT
  ACCEPTED
  REJECTED
  EXPIRED
}

enum LeadType {
  HOSPITAL
  GOVERNMENT
  DISTRIBUTOR
  HOSPITAL_CHAIN
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  passwordHash  String
  role          UserRole  @default(SALES_USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  quotations    Quotation[]

  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Supplier {
  id                  String   @id @default(cuid())
  name                String
  location            String
  contactPhone        String
  email               String
  certifications      String[] // Array of certification names
  productCategories   String[] // Array of category names
  reliabilityScore    Float    @default(0)
  trustScore          Float    @default(0)
  totalOrders         Int      @default(0)
  onTimeDelivery      Float    @default(0) // Percentage
  qualityRejectionRate Float   @default(0) // Percentage
  archived            Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  products            Product[]

  @@map("suppliers")
}

model Product {
  id                String   @id @default(cuid())
  name              String
  category          String
  sku               String   @unique
  costPrice         Float
  sellingPrice      Float    // INR
  exportPrice       Float    // USD
  moq               Int
  unit              String
  supplierId        String
  leadTime          String
  certifications    String[]
  exportAvailable   Boolean  @default(true)
  stock             Int      @default(0)
  competitorPriceMin Float?  // For AI pricing suggestions
  competitorPriceMax Float?
  targetMargin      Float?   // Category-specific target margin %
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  supplier          Supplier @relation(fields: [supplierId], references: [id])
  lineItems         QuotationLineItem[]

  @@map("products")
}

model Quotation {
  id              String          @id @default(cuid())
  quotationId     String          @unique // UH-Q-YYYYMMDD-NNN format
  buyerName       String
  buyerEmail      String?
  buyerAddress    String?
  buyerCountry    String?
  currency        String          @default("INR")
  validityDays    Int             @default(30)
  status          QuotationStatus @default(DRAFT)
  subtotal        Float           @default(0)
  totalDiscount   Float           @default(0)
  totalGST        Float           @default(0)
  freight         Float           @default(0)
  grandTotal      Float           @default(0)
  notes           String?
  createdById     String
  leadId          String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  expiresAt       DateTime?

  createdBy       User            @relation(fields: [createdById], references: [id])
  lead            Lead?           @relation(fields: [leadId], references: [id])
  lineItems       QuotationLineItem[]

  @@map("quotations")
}

model QuotationLineItem {
  id            String   @id @default(cuid())
  quotationId   String
  productId     String
  productName   String
  quantity      Int
  unitPrice     Float
  costPrice     Float
  gstRate       Float    @default(0)
  discount      Float    @default(0) // Percentage
  lineTotal     Float    @default(0)
  marginPercent Float    @default(0)

  quotation     Quotation @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  product       Product   @relation(fields: [productId], references: [id])

  @@map("quotation_line_items")
}

model Lead {
  id              String    @id @default(cuid())
  name            String
  type            LeadType
  contactPerson   String
  email           String?
  phone           String?
  stage           String    @default("Lead") // Pipeline stage
  estimatedValue  Float     @default(0)
  products        String[]  // Associated product categories
  lastContactDate DateTime?
  nextFollowUp    DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  quotations      Quotation[]
  transitions     LeadStageTransition[]

  @@map("leads")
}

model LeadStageTransition {
  id          String   @id @default(cuid())
  leadId      String
  fromStage   String
  toStage     String
  changedAt   DateTime @default(now())

  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@map("lead_stage_transitions")
}
```

---

## API Route Structure

All API routes live under `src/app/api/` using Next.js 16 Route Handlers.

### Route Map

```
/api/
├── auth/
│   ├── [...nextauth]/route.ts    # NextAuth.js handler
│   └── session/route.ts          # GET current session with role
│
├── suppliers/
│   ├── route.ts                  # GET (list + search), POST (create)
│   └── [id]/route.ts            # GET (single), PUT (update), DELETE (soft-delete)
│
├── products/
│   ├── route.ts                  # GET (list + filter), POST (create)
│   └── [id]/route.ts            # GET (single), PUT (update), DELETE
│
├── quotations/
│   ├── route.ts                  # GET (list), POST (create)
│   ├── [id]/route.ts            # GET (single), PUT (update), DELETE
│   ├── [id]/pdf/route.ts        # GET (generate PDF)
│   └── [id]/expire/route.ts     # POST (mark expired)
│
├── leads/
│   ├── route.ts                  # GET (list), POST (create)
│   ├── [id]/route.ts            # GET (single), PUT (update)
│   └── [id]/stage/route.ts      # PUT (advance stage)
│
├── analytics/
│   ├── dashboard/route.ts        # GET dashboard metrics
│   ├── revenue/route.ts          # GET revenue-by-month
│   └── top-products/route.ts     # GET top products
│
├── ai/
│   ├── pricing/route.ts          # POST (pricing suggestion)
│   ├── rfq-parse/route.ts        # POST (parse RFQ text)
│   ├── market-intel/route.ts     # POST (market recommendations)
│   └── quotation-notes/route.ts  # POST (generate notes template)
│
└── export/
    ├── suppliers/route.ts         # GET (XLSX export)
    └── products/route.ts          # GET (XLSX export)
```

### API Response Format

```typescript
// Success response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    nextCursor?: string;
  };
}

// Error response
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>; // Field-level validation errors
  };
}
```

### Pagination

List endpoints support cursor-based pagination:

```typescript
// Request: GET /api/suppliers?cursor=abc123&pageSize=20&search=medpack
// Response includes meta with nextCursor for subsequent pages
```

---

## Authentication Flow

### NextAuth.js Configuration

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

### Middleware (Route Protection)

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect all /dashboard and /api routes (except /api/auth)
  const isProtected = pathname.startsWith("/dashboard") || 
    (pathname.startsWith("/api") && !pathname.startsWith("/api/auth"));

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

### Role-Based Access Control Helper

```typescript
// src/lib/rbac.ts
import { UserRole } from "@prisma/client";

type Permission = "read" | "write" | "delete" | "admin";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: ["read", "write", "delete", "admin"],
  SALES_USER: ["read", "write"],
  VIEWER: ["read"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(`Role ${role} lacks ${permission} permission`);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}
```

---

## Component Architecture

### Directory Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx              # Sidebar + Header wrapper
│   │   ├── page.tsx                # Dashboard metrics
│   │   ├── suppliers/page.tsx
│   │   ├── products/page.tsx
│   │   ├── quotations/
│   │   │   ├── page.tsx            # List view
│   │   │   ├── new/page.tsx        # Create quotation
│   │   │   └── [id]/page.tsx       # Edit quotation
│   │   ├── crm/page.tsx
│   │   ├── rfq/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── ai/page.tsx
│   │   ├── export/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                        # Route handlers (see API section)
│   ├── layout.tsx                  # Root layout with providers
│   └── page.tsx                    # Landing/redirect
│
├── components/
│   ├── ui/                         # Existing: Card, Button, Badge, Input, StatCard
│   │   ├── select.tsx              # New: Radix Select wrapper
│   │   ├── textarea.tsx            # New: Textarea component
│   │   ├── dialog.tsx              # New: Radix Dialog wrapper
│   │   ├── table.tsx               # New: Data table component
│   │   └── pagination.tsx          # New: Cursor pagination controls
│   ├── layout/                     # Existing: Sidebar, Header
│   ├── dashboard/
│   │   ├── metrics-grid.tsx        # StatCard grid for dashboard
│   │   ├── revenue-chart.tsx       # Recharts revenue line chart
│   │   └── top-products-table.tsx  # Top products ranking
│   ├── suppliers/
│   │   ├── supplier-list.tsx       # Table with search/filter
│   │   ├── supplier-form.tsx       # Create/edit form
│   │   └── supplier-card.tsx       # Detail card with scores
│   ├── products/
│   │   ├── product-list.tsx        # Table with category filter
│   │   ├── product-form.tsx        # Create/edit form with validation
│   │   └── stock-indicator.tsx     # Stock level badge
│   ├── quotations/
│   │   ├── quotation-builder.tsx   # Main quotation form
│   │   ├── line-item-row.tsx       # Individual line item with calculations
│   │   ├── quotation-totals.tsx    # Summary calculations
│   │   ├── quotation-list.tsx      # List with status badges
│   │   └── pdf-preview.tsx         # PDF generation trigger
│   ├── crm/
│   │   ├── pipeline-board.tsx      # Kanban-style pipeline view
│   │   ├── lead-card.tsx           # Lead summary card
│   │   ├── lead-form.tsx           # Create/edit lead
│   │   └── follow-up-indicator.tsx # Overdue follow-up badge
│   ├── ai/
│   │   ├── pricing-advisor.tsx     # AI pricing suggestion panel
│   │   ├── rfq-parser.tsx          # RFQ text input + parsed output
│   │   └── market-intel.tsx        # Market recommendations display
│   └── export/
│       └── export-button.tsx       # XLSX export trigger with progress
│
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # NextAuth configuration
│   ├── rbac.ts                     # Role permission helpers
│   ├── constants.ts                # Existing constants
│   ├── utils.ts                    # Existing utilities
│   ├── generate-pdf.ts            # Existing PDF generation
│   ├── validators/
│   │   ├── supplier.ts             # Zod schemas for supplier
│   │   ├── product.ts              # Zod schemas for product
│   │   ├── quotation.ts            # Zod schemas for quotation
│   │   └── lead.ts                 # Zod schemas for lead
│   ├── services/
│   │   ├── supplier-service.ts     # Supplier CRUD + search
│   │   ├── product-service.ts      # Product CRUD + filter
│   │   ├── quotation-service.ts    # Quotation CRUD + calculations
│   │   ├── lead-service.ts         # Lead CRUD + stage transitions
│   │   ├── analytics-service.ts    # Dashboard aggregations
│   │   └── export-service.ts       # XLSX generation
│   └── ai/
│       ├── pricing-engine.ts       # Template-based pricing logic
│       ├── rfq-parser.ts           # Keyword-based RFQ extraction
│       ├── market-intel.ts         # Country-to-market matching
│       └── notes-generator.ts      # Quotation notes templates
│
└── types/
    └── index.ts                    # Shared TypeScript interfaces
```
