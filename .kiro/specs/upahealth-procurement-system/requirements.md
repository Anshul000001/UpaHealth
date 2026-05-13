# Requirements Document

## Introduction

UpaHealth Procurement System transforms the existing static Next.js prototype into a fully functional AI-enabled healthcare procurement platform. The system introduces a PostgreSQL database layer via Prisma ORM, NextAuth.js authentication with role-based access control, and a core-first build strategy focusing on Supplier Database → Product Catalog → Quotation System with PDF → CRM Pipeline. AI features use simulated template-based logic (no LLM dependency) to provide pricing suggestions, RFQ parsing, and market intelligence. The platform targets Indian domestic hospitals and East Africa/GCC export markets for medical disposables, with IV sets as the primary product focus.

## Glossary

- **Platform**: The UpaHealth Procurement System web application built with Next.js 16, React 19, and TypeScript
- **Database_Layer**: PostgreSQL database accessed through Prisma ORM, hosted on Supabase or Neon
- **Auth_System**: NextAuth.js-based authentication and authorization module
- **Supplier_Module**: The subsystem managing supplier records, certifications, reliability scores, and contact information
- **Product_Catalog**: The subsystem managing product records including pricing, categories, stock levels, and export availability
- **Quotation_Engine**: The subsystem for creating, calculating, and exporting professional quotations as PDF documents
- **CRM_Module**: The customer relationship management subsystem tracking leads, pipeline stages, and follow-ups
- **AI_Engine**: Template-based rule logic that simulates AI capabilities for pricing suggestions, RFQ parsing, and market recommendations
- **Admin**: A user role with full read/write access to all platform features and settings
- **Sales_User**: A user role with access to quotations, CRM, products, and suppliers but restricted from system settings
- **Viewer**: A user role with read-only access to dashboards, analytics, and reports
- **RFQ**: Request for Quotation — a buyer's formal request for product pricing and availability
- **MOQ**: Minimum Order Quantity — the smallest quantity a supplier will sell

## Requirements

### Requirement 1: Database Schema and Prisma Integration

**User Story:** As a developer, I want a relational database with type-safe ORM access, so that the platform persists data reliably and supports migrations.

#### Acceptance Criteria

1. THE Database_Layer SHALL provide a Prisma schema defining models for Supplier, Product, Quotation, QuotationLineItem, Lead, User, and Session entities.
2. THE Database_Layer SHALL store all entity relationships using foreign keys with referential integrity constraints.
3. THE Database_Layer SHALL support database migrations through Prisma Migrate for schema evolution.
4. WHEN the Platform starts, THE Database_Layer SHALL establish a connection pool to the PostgreSQL instance.
5. IF the database connection fails, THEN THE Platform SHALL log the connection error and return a 503 Service Unavailable response to API requests.

### Requirement 2: Authentication and Role-Based Access Control

**User Story:** As a platform administrator, I want secure login with role-based permissions, so that sensitive procurement data is protected and users see only what they need.

#### Acceptance Criteria

1. THE Auth_System SHALL authenticate users via email and password credentials using NextAuth.js.
2. THE Auth_System SHALL assign each user exactly one role: Admin, Sales_User, or Viewer.
3. WHEN an unauthenticated user accesses a protected route, THE Auth_System SHALL redirect the user to the login page.
4. WHILE a user session is active, THE Auth_System SHALL maintain the session using secure HTTP-only cookies.
5. WHEN a user with Viewer role attempts a write operation, THE Auth_System SHALL deny the request and return a 403 Forbidden response.
6. THE Auth_System SHALL hash all passwords using bcrypt with a minimum cost factor of 10 before storing them in the Database_Layer.
7. WHEN a user submits invalid credentials three consecutive times, THE Auth_System SHALL display an error message indicating invalid email or password.
8. THE Auth_System SHALL provide a protected API route that returns the current user session including role information.

### Requirement 3: Supplier Database Management

**User Story:** As a sales user, I want to manage a database of verified medical device suppliers, so that I can quickly source products with confidence in quality and delivery.

#### Acceptance Criteria

1. THE Supplier_Module SHALL store supplier records with fields: name, location, contact phone, email, certifications, product categories, reliability score, trust score, total orders, on-time delivery percentage, and quality rejection rate.
2. WHEN a user with Admin or Sales_User role submits a new supplier form, THE Supplier_Module SHALL validate required fields and create the supplier record in the Database_Layer.
3. WHEN a user searches suppliers by name or certification, THE Supplier_Module SHALL return matching results within 500ms for datasets up to 1000 supplier records.
4. THE Supplier_Module SHALL display supplier certifications from the defined set: ISO 13485, CE Mark, WHO GMP, CDSCO Registered, FDA 510(k), and BIS Certified.
5. WHEN a user with Admin role deletes a supplier, THE Supplier_Module SHALL soft-delete the record by setting an archived flag rather than removing data permanently.
6. THE Supplier_Module SHALL calculate and display a composite reliability score based on on-time delivery percentage and quality rejection rate.

### Requirement 4: Product Catalog Management

**User Story:** As a sales user, I want a comprehensive product catalog with domestic and export pricing, so that I can quickly build accurate quotations for any market.

#### Acceptance Criteria

1. THE Product_Catalog SHALL store product records with fields: name, category, SKU, cost price, selling price (INR), export price (USD), MOQ, unit, supplier reference, lead time, certifications, export availability flag, and current stock level.
2. THE Product_Catalog SHALL categorize products into the defined categories: Surgical Drapes & Procedure Kits, Anesthesia Accessories, Surgical Sutures, IV Catheters/Cannulas, IV Infusion Sets, Wound Care/Bandages, Disposable Gloves, Safety Syringes, Blood Bags, Urology Catheters, PPE Kits, and Surgical Instruments.
3. WHEN a user with Admin or Sales_User role creates a product, THE Product_Catalog SHALL validate that cost price is less than selling price.
4. WHEN a user filters products by category, THE Product_Catalog SHALL display only products matching the selected category.
5. THE Product_Catalog SHALL link each product to exactly one supplier record in the Supplier_Module.
6. WHEN a product stock level reaches zero, THE Product_Catalog SHALL display an out-of-stock indicator on the product listing.

### Requirement 5: Quotation System with PDF Generation

**User Story:** As a sales user, I want to create professional quotations with automatic calculations and PDF export, so that I can respond to buyer inquiries quickly and accurately.

#### Acceptance Criteria

1. THE Quotation_Engine SHALL generate a unique quotation ID in the format UH-Q-YYYYMMDD-NNN for each new quotation.
2. WHEN a user adds a line item, THE Quotation_Engine SHALL calculate the line total as: (quantity × unit price) − discount + applicable GST.
3. THE Quotation_Engine SHALL support GST rates of 0%, 5%, 12%, 18%, and 28% per line item.
4. THE Quotation_Engine SHALL support currency selection from INR, USD, EUR, GBP, AED, and KES.
5. WHEN a user selects a product for a line item, THE Quotation_Engine SHALL auto-populate the unit price based on the selected currency (selling price for INR, export price for foreign currencies).
6. WHEN a user clicks Export PDF, THE Quotation_Engine SHALL generate a PDF document containing company header, buyer details, line items table, totals summary, and terms/notes.
7. THE Quotation_Engine SHALL persist each quotation to the Database_Layer with status tracking: Draft, Sent, Accepted, Rejected, or Expired.
8. WHEN a quotation validity period expires, THE Quotation_Engine SHALL update the quotation status to Expired.
9. THE Quotation_Engine SHALL calculate and display profit margin percentage for each line item as: ((unit price − cost price) ÷ unit price) × 100.

### Requirement 6: CRM Pipeline Management

**User Story:** As a sales user, I want to track buyer leads through a sales pipeline, so that I can manage follow-ups and convert inquiries into orders.

#### Acceptance Criteria

1. THE CRM_Module SHALL store lead records with fields: name, type (Hospital, Government, Distributor, Hospital Chain), contact person, email, phone, pipeline stage, estimated value, associated products, last contact date, and next follow-up date.
2. THE CRM_Module SHALL support pipeline stages in order: Lead, RFQ Received, Quotation Sent, Negotiation, Order Confirmed, Shipped, Delivered, Closed Won, and Closed Lost.
3. WHEN a user with Admin or Sales_User role moves a lead to a new pipeline stage, THE CRM_Module SHALL record the stage transition with a timestamp.
4. WHEN a lead's next follow-up date is today or past due, THE CRM_Module SHALL highlight the lead in the pipeline view with a visual indicator.
5. THE CRM_Module SHALL display total pipeline value grouped by stage on the dashboard.
6. WHEN a user creates a quotation for a lead, THE CRM_Module SHALL automatically advance the lead stage to Quotation Sent.

### Requirement 7: Simulated AI Features

**User Story:** As a sales user, I want AI-assisted pricing suggestions and RFQ parsing, so that I can work faster without manual research for every quotation.

#### Acceptance Criteria

1. WHEN a user requests AI pricing suggestions for a product, THE AI_Engine SHALL calculate a recommended price based on cost price, target margin percentage (configurable per category), and competitor price range stored in the Product_Catalog.
2. WHEN a user pastes RFQ text into the RFQ Parser, THE AI_Engine SHALL extract product names, quantities, and delivery requirements using keyword matching and template patterns.
3. THE AI_Engine SHALL provide market intelligence recommendations by matching lead country to export market data and suggesting relevant products based on category demand patterns.
4. WHEN the AI_Engine cannot parse an RFQ field with confidence, THE AI_Engine SHALL mark the field as requiring manual review and highlight the unparsed text.
5. THE AI_Engine SHALL generate quotation notes templates based on the selected currency and buyer country, including standard payment terms and Incoterms suggestions.

### Requirement 8: API Layer and Data Migration

**User Story:** As a developer, I want RESTful API routes that replace mock data with database queries, so that the platform operates on real persistent data.

#### Acceptance Criteria

1. THE Platform SHALL provide API routes under /api/ for CRUD operations on suppliers, products, quotations, and leads.
2. WHEN an API route receives a request, THE Platform SHALL validate the user session and role before processing the request.
3. THE Platform SHALL migrate existing mock data structures to the Prisma schema without losing field definitions or relationships.
4. WHEN an API route receives invalid input, THE Platform SHALL return a 400 Bad Request response with field-level validation error messages.
5. THE Platform SHALL implement pagination for list endpoints with a default page size of 20 records and support for cursor-based navigation.
6. WHILE the Platform processes a database write operation, THE Platform SHALL use Prisma transactions for operations involving multiple related records.

### Requirement 9: Dashboard and Analytics

**User Story:** As an admin, I want a real-time dashboard showing key business metrics, so that I can monitor procurement performance and make data-driven decisions.

#### Acceptance Criteria

1. THE Platform SHALL display a dashboard with metrics: total revenue, monthly growth percentage, active quotations count, conversion rate, total products, active suppliers, export orders count, and pending RFQs count.
2. WHEN the dashboard loads, THE Platform SHALL query aggregated data from the Database_Layer and render metrics within 2 seconds.
3. THE Platform SHALL display revenue-by-month chart data sourced from quotation records with Closed Won status.
4. THE Platform SHALL display top products ranked by total revenue generated from accepted quotations.
5. WHEN a user with Viewer role accesses the dashboard, THE Platform SHALL display all metrics in read-only mode without edit or create actions.

### Requirement 10: Data Export Capabilities

**User Story:** As a sales user, I want to export supplier lists, product catalogs, and quotation histories to Excel, so that I can share data with stakeholders who prefer spreadsheet formats.

#### Acceptance Criteria

1. WHEN a user clicks export on the suppliers list, THE Platform SHALL generate an XLSX file containing all visible supplier records with column headers matching the displayed fields.
2. WHEN a user clicks export on the products list, THE Platform SHALL generate an XLSX file containing all visible product records including pricing in the selected currency.
3. THE Platform SHALL include metadata (export date, exported by, filter criteria) in a summary sheet within each exported XLSX file.
4. WHEN the export dataset exceeds 5000 records, THE Platform SHALL process the export asynchronously and notify the user upon completion.
