# Implementation Tasks

## Task 1: Set Up Prisma ORM and Database Schema

- [x] Install Prisma, @prisma/client, and PostgreSQL dependencies
- [x] Create `prisma/schema.prisma` with all models: User, Session, Supplier, Product, Quotation, QuotationLineItem, Lead, LeadStageTransition
- [x] Create `src/lib/prisma.ts` singleton client with connection pooling
- [x] Add DATABASE_URL to `.env.example` and `.env.local`
- [x] Run `prisma generate` to create the Prisma client
- [x] Create seed script `prisma/seed.ts` to populate initial data from existing mock-data.ts

**Requirements:** 1 (Database Schema and Prisma Integration)

## Task 2: Set Up Authentication with NextAuth.js

- [ ] Install next-auth, @auth/prisma-adapter, bcryptjs, and @types/bcryptjs
- [ ] Create `src/lib/auth.ts` with NextAuth configuration using Credentials provider
- [ ] Create `src/app/api/auth/[...nextauth]/route.ts` handler
- [ ] Create `src/middleware.ts` for route protection (dashboard + API routes)
- [ ] Create `src/lib/rbac.ts` with role permission helpers (Admin, Sales_User, Viewer)
- [ ] Create `src/app/(auth)/login/page.tsx` login page with email/password form
- [ ] Create `src/types/next-auth.d.ts` to extend session types with role and id

**Requirements:** 2 (Authentication and Role-Based Access Control)

## Task 3: Build Supplier Database API and UI

- [ ] Create `src/lib/validators/supplier.ts` with Zod validation schemas
- [ ] Create `src/lib/services/supplier-service.ts` with CRUD + search + soft-delete
- [ ] Create `src/app/api/suppliers/route.ts` (GET list with search/pagination, POST create)
- [ ] Create `src/app/api/suppliers/[id]/route.ts` (GET single, PUT update, DELETE soft-delete)
- [ ] Refactor `src/app/dashboard/suppliers/page.tsx` to fetch from API instead of mock data
- [ ] Create `src/components/suppliers/supplier-form.tsx` modal for create/edit
- [ ] Add search, filter by certification, and pagination to supplier list

**Requirements:** 3 (Supplier Database Management)

## Task 4: Build Product Catalog API and UI

- [ ] Create `src/lib/validators/product.ts` with Zod validation schemas (cost < selling price)
- [ ] Create `src/lib/services/product-service.ts` with CRUD + category filter + stock check
- [ ] Create `src/app/api/products/route.ts` (GET list with category filter/pagination, POST create)
- [ ] Create `src/app/api/products/[id]/route.ts` (GET single, PUT update, DELETE)
- [ ] Refactor `src/app/dashboard/products/page.tsx` to fetch from API instead of mock data
- [ ] Create `src/components/products/product-form.tsx` modal for create/edit with supplier dropdown
- [ ] Add out-of-stock indicator and stock level display

**Requirements:** 4 (Product Catalog Management)

## Task 5: Build Quotation Engine API with Database Persistence

- [ ] Create `src/lib/validators/quotation.ts` with Zod schemas for quotation and line items
- [ ] Create `src/lib/services/quotation-service.ts` with create, update, status management, expiry check
- [ ] Create `src/app/api/quotations/route.ts` (GET list with status filter, POST create)
- [ ] Create `src/app/api/quotations/[id]/route.ts` (GET single, PUT update, DELETE)
- [ ] Create `src/app/api/quotations/[id]/pdf/route.ts` (GET generate PDF)
- [ ] Create `src/app/api/quotations/[id]/expire/route.ts` (POST mark expired)
- [ ] Refactor `src/app/dashboard/quotations/page.tsx` to persist quotations to database
- [ ] Add quotation list view with status badges (Draft, Sent, Accepted, Rejected, Expired)
- [ ] Wire PDF download to use persisted quotation data

**Requirements:** 5 (Quotation System with PDF Generation)

## Task 6: Build CRM Pipeline API and UI

- [ ] Create `src/lib/validators/lead.ts` with Zod validation schemas
- [ ] Create `src/lib/services/lead-service.ts` with CRUD + stage transitions + follow-up tracking
- [ ] Create `src/app/api/leads/route.ts` (GET list, POST create)
- [ ] Create `src/app/api/leads/[id]/route.ts` (GET single, PUT update)
- [ ] Create `src/app/api/leads/[id]/stage/route.ts` (PUT advance stage with transition logging)
- [ ] Refactor `src/app/dashboard/crm/page.tsx` to fetch from API instead of mock data
- [ ] Create `src/components/crm/lead-form.tsx` modal for create/edit
- [ ] Add overdue follow-up highlighting and pipeline value display
- [ ] Auto-advance lead to "Quotation Sent" when quotation is created for a lead

**Requirements:** 6 (CRM Pipeline Management)

## Task 7: Build Simulated AI Features

- [ ] Create `src/lib/ai/pricing-engine.ts` — calculate recommended price from cost + target margin + competitor range
- [ ] Create `src/lib/ai/rfq-parser.ts` — keyword matching to extract products, quantities, delivery from text
- [ ] Create `src/lib/ai/market-intel.ts` — match lead country to export market data and suggest products
- [ ] Create `src/lib/ai/notes-generator.ts` — generate quotation notes based on currency/country/Incoterms
- [ ] Create `src/app/api/ai/pricing/route.ts` (POST pricing suggestion)
- [ ] Create `src/app/api/ai/rfq-parse/route.ts` (POST parse RFQ text)
- [ ] Create `src/app/api/ai/market-intel/route.ts` (POST market recommendations)
- [ ] Create `src/app/api/ai/quotation-notes/route.ts` (POST generate notes)
- [ ] Wire AI pricing suggestions into quotation builder UI
- [ ] Wire RFQ parser into `/dashboard/rfq` page with parsed output display

**Requirements:** 7 (Simulated AI Features)

## Task 8: Build Dashboard Analytics with Real Data

- [ ] Create `src/lib/services/analytics-service.ts` with aggregation queries
- [ ] Create `src/app/api/analytics/dashboard/route.ts` (GET metrics: revenue, quotations, conversion)
- [ ] Create `src/app/api/analytics/revenue/route.ts` (GET revenue-by-month from Closed Won quotations)
- [ ] Create `src/app/api/analytics/top-products/route.ts` (GET top products by revenue)
- [ ] Refactor `src/app/dashboard/page.tsx` to fetch real metrics from API
- [ ] Refactor `src/app/dashboard/analytics/page.tsx` to use Recharts with real data
- [ ] Add role-based read-only mode for Viewer users

**Requirements:** 9 (Dashboard and Analytics)

## Task 9: Build Data Export (XLSX) Capabilities

- [ ] Install xlsx (SheetJS) dependency (already installed)
- [ ] Create `src/lib/services/export-service.ts` with XLSX generation for suppliers and products
- [ ] Create `src/app/api/export/suppliers/route.ts` (GET XLSX with metadata sheet)
- [ ] Create `src/app/api/export/products/route.ts` (GET XLSX with currency selection)
- [ ] Add export buttons to suppliers and products list pages
- [ ] Include metadata sheet (export date, user, filter criteria) in each export

**Requirements:** 10 (Data Export Capabilities)

## Task 10: Database Seed and Migration from Mock Data

- [ ] Create `prisma/seed.ts` that migrates all mock suppliers, products, and leads into database
- [ ] Add default Admin user (admin@upahealthsupplies.com) with hashed password
- [ ] Add seed script to package.json (`prisma db seed`)
- [ ] Run `prisma migrate dev` to create initial migration
- [ ] Verify all API routes return data from database instead of mock files
- [ ] Remove direct mock-data imports from page components (keep file as reference only)

**Requirements:** 8 (API Layer and Data Migration)
