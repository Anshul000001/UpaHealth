# UpaHealth — AI Procurement Intelligence Platform

🌐 **Live:** [upahealth.vercel.app](https://upahealth.vercel.app)
📦 **Repo:** [github.com/Anshul000001/UpaHealth](https://github.com/Anshul000001/UpaHealth)

AI-enabled healthcare sourcing, quotation, procurement, and export intelligence platform for surgical consumables. Targets Indian hospitals and East Africa / GCC export markets.

## Tech Stack

| Layer        | Choice                                       |
|--------------|----------------------------------------------|
| Framework    | Next.js 16 (App Router)                      |
| UI           | React 19, Tailwind CSS v4, Radix primitives  |
| Icons        | lucide-react                                 |
| Database     | **PostgreSQL** (via Prisma 7 ORM)            |
| Auth         | NextAuth.js (email + bcryptjs, planned)      |
| Charts       | Recharts                                     |
| PDF Export   | jsPDF + jspdf-autotable                      |
| Excel Export | xlsx                                         |
| Validation   | Zod                                          |

## Why PostgreSQL

The Prisma schema relies on Postgres-only features:

- `String[]` array columns for certifications, product categories, etc.
- Native enums (`UserRole`, `QuotationStatus`, `LeadType`)
- `cuid()` IDs and rich relational integrity

For hosted dev: **Supabase** or **Neon** (free tier, serverless, zero-config with Prisma).
For local dev: PostgreSQL 14+ via Docker or native installer.

## Getting Started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
# edit DATABASE_URL and NEXTAUTH_SECRET

# 3. Generate Prisma client + push schema
npm run db:push
npm run db:seed

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Default seeded credentials (created by `npm run db:seed`):

- Admin: `admin@upahealthsupplies.com` / `admin123`
- Sales: `sales@upahealthsupplies.com` / `sales123`

## Scripts

| Command              | Action                                |
|----------------------|---------------------------------------|
| `npm run dev`        | Start dev server                      |
| `npm run build`      | Production build                      |
| `npm run start`      | Start production server               |
| `npm run lint`       | Run ESLint                            |
| `npm run db:generate`| Regenerate Prisma client              |
| `npm run db:migrate` | Create + apply a Prisma migration     |
| `npm run db:push`    | Push schema to DB without a migration |
| `npm run db:seed`    | Seed initial users, suppliers, etc.   |
| `npm run db:studio`  | Open Prisma Studio                    |

## Project Structure

```
upahealth-platform/
├─ prisma/
│  ├─ schema.prisma           # DB models (Postgres)
│  └─ seed.ts                 # Seed users, suppliers, products, leads
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx           # Root layout (dark theme)
│  │  ├─ page.tsx             # Marketing landing page
│  │  ├─ globals.css          # Tailwind + design tokens
│  │  └─ dashboard/           # Authenticated app
│  │     ├─ layout.tsx        # Sidebar + Header shell
│  │     ├─ page.tsx          # Overview dashboard
│  │     ├─ quotations/       # AI Quotation Generator + PDF export
│  │     ├─ rfq/              # RFQ parser (AI)
│  │     ├─ products/         # Product catalogue
│  │     ├─ suppliers/        # Supplier intelligence
│  │     ├─ crm/              # Pipeline / leads
│  │     ├─ export/           # Tenders + export markets
│  │     ├─ analytics/        # Charts + KPIs
│  │     ├─ ai/               # AI assistant chat
│  │     └─ settings/         # Company + integrations
│  ├─ components/
│  │  ├─ layout/              # Sidebar, Header
│  │  └─ ui/                  # Button, Card, Input, Badge, StatCard
│  ├─ lib/
│  │  ├─ prisma.ts            # Prisma client singleton
│  │  ├─ constants.ts         # Categories, currencies, GST rates, nav
│  │  ├─ generate-pdf.ts      # jsPDF quotation generator
│  │  ├─ mock-data.ts         # In-memory fixtures (UI-only, see note)
│  │  └─ utils.ts             # cn(), formatters, ID generators
│  └─ types/
│     └─ index.ts             # API DTOs and shared interfaces
├─ next.config.ts
├─ prisma.config.ts
├─ tsconfig.json
└─ eslint.config.mjs
```

## Status

The UI is complete and reads from `src/lib/mock-data.ts`. The Prisma schema, seed,
and config are wired and ready. Next milestones:

1. NextAuth credential provider + role guards
2. API routes under `/app/api/*` replacing mock data
3. AI engine module (template-based pricing, RFQ parser)
4. Excel export via `xlsx`

See `.kiro/specs/upahealth-procurement-system/` for full requirements, design,
and task breakdown.
