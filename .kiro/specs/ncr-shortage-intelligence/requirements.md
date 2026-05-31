# Requirements: NCR Surgical Shortage Market Intelligence

## Overview
Integrate NCR (Delhi/NCR) surgical shortage market intelligence into the UpaHealth platform. This adds high-demand product tracking, NCR supplier onboarding, and a lead capture system for hospitals/clinics seeking shortage items. The data comes from verified sources (GTB Hospital reports, AIIMS tenders, Times of India, Reuters).

## Requirement 1: Seed NCR Shortage Products into Database
### User Story
As a platform admin, I want the 10 high-demand NCR shortage products (forceps, scissors, sutures, gloves, IV cannulas, PICC lines, drapes, scalpels, kidney trays) pre-loaded into the product database so they appear in my catalogue and quotation system alongside Romsons products.

### Acceptance Criteria
- [ ] 10 NCR shortage products are seeded with correct attributes: name, category, shortage_severity, estimated demand range, price range (INR), lead time, priority_score (1-5)
- [ ] Each product is linked to one or more NCR suppliers
- [ ] Products use the existing Product model (no schema changes) with costPrice/sellingPrice derived from the avg_price_range_inr mid-point
- [ ] Products appear in `/dashboard/products` and `/dashboard/catalogue`
- [ ] Seed script is idempotent (can run multiple times without duplicates)

## Requirement 2: Seed NCR Suppliers into Database
### User Story
As a platform admin, I want 5 NCR-based surgical suppliers (Garg Surgicals, Lars Medicare, Safoze, CITCO International, Zenersis Medical) added to the suppliers database so I can source shortage items from them.

### Acceptance Criteria
- [ ] 5 suppliers seeded with: name, location, phone, email, website, capacity_estimate, certifications, product categories
- [ ] Suppliers are linked to their respective shortage products
- [ ] Suppliers appear in `/dashboard/suppliers`
- [ ] Seed script uses upsert (no duplicates on re-run)

## Requirement 3: Market Intelligence Dashboard Card
### User Story
As a platform admin, I want to see a "Shortage Alerts" card on my dashboard showing high-severity items, their demand, and which suppliers can fulfill them — so I can prioritize outreach to hospitals needing these products.

### Acceptance Criteria
- [ ] Dashboard shows a card titled "NCR Shortage Alerts" with products sorted by priority_score (highest first)
- [ ] Each item shows: name, severity badge (High/Medium), estimated monthly demand, price range
- [ ] Card includes a link to the full shortage product list
- [ ] Only products with shortage_severity = "High" or "Medium" are shown

## Requirement 4: Lead Capture Form for Shortage Products
### User Story
As a hospital procurement officer visiting UpaHealth, I want to fill a form expressing interest in shortage items so UpaHealth can connect me with suppliers.

### Acceptance Criteria
- [ ] A new page or section at `/dashboard/lead-gen` (or public page) with a lead capture form
- [ ] Form fields: Hospital/Clinic Name, Contact Name, Email, Phone, Product of Interest (select from shortage items)
- [ ] Validation: all fields required, email format check, phone 8-15 digits
- [ ] On submit: creates a Lead in the CRM with type=HOSPITAL, stage="Lead", products=[selected item]
- [ ] Shows success message after submission
- [ ] Form data is stored using existing Lead model (no schema changes needed)

## Requirement 5: AI Chat Awareness of Shortage Data
### User Story
As a platform user, when I ask the AI assistant about shortages, demand, or NCR market conditions, it should know about the shortage products and suppliers and give actionable recommendations.

### Acceptance Criteria
- [ ] The AI chat system prompt is updated to include shortage product context (severity, demand, suppliers)
- [ ] AI can answer questions like "What's in shortage in NCR?" or "Who can supply forceps?"
- [ ] AI uses live data from DB (not hardcoded) — shortage products are fetched alongside regular products

## Data Sources (from PDFs)

### Products to Seed:
| Product | Category | Severity | Demand/Month | Price Range (₹) | Lead Time (days) | Priority |
|---------|----------|----------|--------------|-----------------|------------------|----------|
| Surgical Forceps/Clamps | Surgical Instruments | High | 5,000-10,000 | 200-300 | 28-42 | 5 |
| Surgical Scissors | Surgical Instruments | High | 5,000-8,000 | 100-200 | 28-42 | 4 |
| Non-absorbable Sutures | Surgical Sutures | Medium | 30,000-50,000 | 30-50 | 14-28 | 4 |
| Absorbable Sutures (Vicryl) | Surgical Sutures | Medium | 10,000-20,000 | 50-100 | 14-28 | 4 |
| Nitrile Surgical Gloves | Disposable Gloves | High | 500,000-1,000,000 | 300-400/100 | 42-90 | 5 |
| IV Cannulas/Infusion Sets | IV Catheters / Cannulas | Medium | 100,000-150,000 | 50-80 | 21-42 | 4 |
| Central Venous Catheter (PICC) | IV Catheters / Cannulas | Medium | 2,000-5,000 | 500-1,000 | 42-70 | 3 |
| Sterile Surgical Drapes | Surgical Drapes & Procedure Kits | Medium | 10,000-20,000 | 200-500 | 28-56 | 3 |
| Scalpels & Surgical Blades | Surgical Instruments | Medium | 10,000-20,000 | 10-20 | 28-56 | 3 |
| Kidney Trays | Surgical Instruments | High | 3,000-5,000 | 150-250 | 28-42 | 4 |

### Suppliers to Seed:
| Supplier | Location | Phone | Email | Capacity | Products |
|----------|----------|-------|-------|----------|----------|
| Garg Surgicals | Delhi | +918368024454 | sales@gargsurgicals.com | High | Instruments, IV, Disposables |
| Lars Medicare | Delhi | +911145733068 | sales@larsmedicare.com | High | IV Cannulas, Infusion Sets, Needles |
| Safoze (Noida) | Noida | +919990910506 | care@safoze.com | High | Gloves, Masks |
| CITCO International | Noida | unspecified | unspecified | Medium | Central Venous Catheters, Instruments |
| Zenersis Medical | Gurgaon | unspecified | unspecified | Low | Scalpels, Blades, Ophthalmic |
