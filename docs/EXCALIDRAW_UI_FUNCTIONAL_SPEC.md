# Excalidraw → UI + Functional Specification (Build Blueprint)

> **Important note / dependency:** The actual `.excalidraw` file referenced in the repo docs ("Subscription Management System 24 hours.excalidraw") is **not present in this workspace**. This spec is derived from the written mapping in [docs/SUBSCRIPTION_EXCALIDRAW_ANALYSIS.md](SUBSCRIPTION_EXCALIDRAW_ANALYSIS.md).  
> If you attach or commit the real `.excalidraw` file, I can tighten this into a pixel/section-perfect screen-by-screen reconstruction.

## 1) Goal and scope

Build an Odoo-like Subscription Management System with:
- **Recurring Plan Engine (Core)**: recurring plans, recurring prices, billing periods, plan flags (closable/pausable/renewable), auto-close validity.
- **Subscription Management**: quotation → confirmation, subscription actions (send/confirm/renew/upsell/close/cancel), invoice creation and lifecycle.
- **Customer Portal**: view subscriptions + invoices, do allowed actions.

This document focuses on **pages, layout, and user-facing behavior** (what the Excalidraw analysis implies).

## 2) Information architecture (pages)

### 2.1 Back-office (admin/staff)
1. **Contacts**
   - Contacts list
   - Contact detail (with Active Subscription Count + subscriptions list)
2. **Products**
   - Product list
   - Product detail (Recurring Prices, Min Qty, Start/End dates)
3. **Recurring Plans**
   - Plans list
   - Plan detail / create/edit (billing period, validity/auto-close, flags)
4. **Subscriptions (Sales Orders)**
   - Subscriptions list (states: draft/quotation sent/confirmed/in progress/churned)
   - Subscription detail (quotation form + order lines + actions)
5. **Invoices**
   - Invoice list
   - Invoice detail (draft → confirmed → sent/paid/printed)
6. **Settings / Masters (as needed)**
   - Payment Terms
   - Quotation Templates
   - Taxes (if supported)

### 2.2 Customer portal
1. **Your Subscriptions** (list)
2. **Subscription Detail** (summary + invoices + actions)
3. **Invoices** (list/detail if needed)

## 3) Global layout conventions

### 3.1 Back-office layout
- **Top bar**: app name, global search (optional), user menu.
- **Left sidebar**: module navigation (Contacts, Products, Recurring Plans, Subscriptions, Invoices, Settings).
- **Main content** pattern:
  - Page title row
  - Primary actions (top-right)
  - Search/filter row (for lists)
  - Table (lists) OR Form sections (detail pages)

### 3.2 List view conventions
- **Toolbar**: Search, Filters (State, Customer, Plan), Sort, Export (optional).
- **Table**: row click opens detail; checkbox for bulk actions (optional).
- **Status badge** for states (Draft / Quotation Sent / Confirmed / In Progress / Churned / Closed).

### 3.3 Form view conventions
- **Header strip**: record identifier (e.g., Subscription number), state badge, main actions.
- **Tabbed body** (optional): “Order Lines”, “Other Info”, “Invoices”, “Notes”.
- **Right-side summary card** (optional): totals, next invoice, payment term.

## 4) Core entities and fields (as implied)

### 4.1 Product (recurring product)
**Purpose:** Carries recurring pricing options and constraints.

Fields (from analysis):
- Name
- Recurring Prices (multiple entries)
  - Example labels: Monthly, 6 Months, Yearly
  - Each with a price (the analysis implies price per period)
- Min Quantity (Min Qty)
- Start Date, End Date (availability)

Behavior:
- Recurring Plan selection later should reference or align with product recurring prices.

### 4.2 Recurring Plan
Fields:
- Name ("Recurring Name")
- Billing Period: number + unit dropdown (month/year)
- Min Quantity
- Start Date, End Date
- Auto Close: boolean
- Validity Days (used with auto-close logic)
- Flags (booleans):
  - Closable
  - Pausable
  - Renewable

Behavior:
- **Auto-close rule**: If Auto Close enabled and subscription is not confirmed within Validity Days, the subscription auto-closes.
- Flags control whether the **portal** and/or back-office shows actions.

### 4.3 Subscription
Fields (from analysis):
- Subscription Number: auto-generated (e.g., SOxxx/Subxxx)
- Customer (type-ahead; can create new contact)
- Quotation Template
- Expiration (quotation expiry; after that user cannot sign/pay)
- Recurring Plan (drives billing/price)
- State: Draft → Quotation/Quotation Sent → Confirmed → (In Progress / Churned / Closed)
- Order Lines
- Salesperson (defaults to logged-in user; only admin can change)
- Order Date / Start Date
  - Default = confirmation date
  - Editable
- Payment Method (if implemented)
- Payment Term
- Next Invoice (computed)

Order Lines columns:
- Product
- Quantity
- Unit Price
- Discount
- Taxes
- Amount

Derived behavior:
- Next Invoice computed from Start Date + Billing Period (plan)

### 4.4 Invoice
- Linked to subscription/sales order
- State flow: Draft → Confirmed → Sent → Paid
- Post-confirm subscription actions include: Create Invoice, Preview, Send, Pay, Print

### 4.5 Contact
- Active subscription count
- Click count → list of that contact’s subscriptions

## 5) Page-by-page UI + actions

### 5.1 Recurring Plans — List
Layout:
- Title: “Recurring Plans”
- CTA: “New”
- Table columns (recommended, inferred): Name, Billing Period, Auto Close, Closable, Pausable, Renewable, Start, End, Status

Actions:
- Click row → Plan detail

### 5.2 Recurring Plans — Create/Edit
Sections:
1. **Plan Info**: Name
2. **Billing**: Billing Period (number + unit)
3. **Dates & constraints**: Start Date, End Date, Min Qty
4. **Options**:
   - Auto Close (toggle)
   - Validity Days (enabled/required when Auto Close = true)
   - Closable, Pausable, Renewable (toggles)

Save behavior:
- Validate Billing Period number > 0
- If Auto Close = true → Validity Days must be > 0

### 5.3 Products — Detail (Recurring pricing)
Sections:
1. Product basics (name, etc.)
2. Recurring setup:
   - Min Qty
   - Start/End date
   - Recurring Prices table:
     - Period label (Monthly / 6 Months / Yearly)
     - Price

### 5.4 Subscriptions — List
Layout:
- Title: “Subscriptions”
- Filters:
  - State (Draft, Quotation Sent, Confirmed, In Progress, Churned, Closed)
  - Customer
  - Plan
  - Salesperson
- Table columns (recommended): Number, Customer, Plan, State, Start Date, Next Invoice, Total, Salesperson

### 5.5 Subscription — Create/Edit/Detail (primary screen)
Header:
- Subscription number (or “New”)
- State badge
- Primary actions (vary by state):
  - Draft/Quotation: Save, Send
  - Quotation Sent: Confirm, Cancel
  - Confirmed: Create Invoice, Preview, Send, Pay, Print, Renew, Upsell, Close (conditional)

Body sections:
1. **Customer & Commercial**
   - Customer (type-ahead)
   - Salesperson (admin-editable)
   - Payment Term
   - Payment Method (if applicable)
2. **Quotation/Template**
   - Quotation Template
   - Expiration
3. **Plan & Dates**
   - Recurring Plan
   - Order Date / Start Date (default to confirmation date)
   - Next Invoice (computed, read-only)
4. **Order Lines**
   - Editable table with product/qty/price/discount/tax/amount

State transitions (implied):
- **Send**: Draft/Quotation → Quotation Sent
- **Confirm**: Quotation Sent → Confirmed
- **Cancel**: moves to a cancelled/closed-like terminal state (implementation-defined)

Computed rules:
- Next Invoice = Start Date + Billing Period
- If Expiration passed, portal should prevent signing/paying (and back-office should show warning)

### 5.6 Renew flow (from analysis)
Trigger:
- Action “Renew” available when plan has Renewable flag (recommended) and subscription is in a renewable-eligible state.

Behavior:
- Create a **new subscription order** with:
  - Same customer
  - Same recurring plan
  - Same order lines
  - Same “other details” (quotation template, payment term, salesperson, etc.)
  - **Order date** set to “now”
  - **Next invoice** recomputed

UI:
- Show confirmation dialog: “Create renewal subscription?”
- After success: navigate to new subscription detail

### 5.7 Upsell flow (from analysis)
Trigger:
- Action “Upsell” on confirmed subscriptions.

Behavior:
- Create a **new order** for upgrade:
  - Pre-fill existing details
  - Allow changing products/quantities/plan as needed

UI:
- Either open a new “Upsell Order” draft screen or clone subscription into editable draft.

### 5.8 Close flow (from analysis)
Trigger:
- Action “Close” visible only if plan is **Closable = true** (and also visible on portal).

Behavior:
- Close subscription (state → Closed/Churned; implementation-defined)

UI:
- Confirmation modal, optional close reason.

### 5.9 Invoice creation and lifecycle
From a Confirmed subscription:
- “Create Invoice” generates invoice in **Draft**
- Then allow: Preview, Send, Pay, Print

Invoice screen:
- Header: Invoice #, state badge
- Body: lines + totals

## 6) Payment terms (master data)
Fields (from analysis):
- Due “After” X days
- Early discount:
  - Type: percent or fixed
  - Value
  - Y days after invoice

Where used:
- Selected on Subscription; applied to invoices.

## 7) Customer portal pages

### 7.1 Your Subscriptions (portal list)
Cards/table display:
- Plan name
- Start Date
- End Date
- State

Click opens Subscription Detail.

### 7.2 Subscription Detail (portal)
Sections:
1. Summary: plan, start/end, state
2. Last Invoices:
   - Invoice number
   - Payment status
   - Products
3. Actions:
   - Renew (if allowed)
   - Close (if plan closable)

Access rules:
- Customer sees only their own subscriptions/invoices.

## 8) Role/permission rules (implied)
- Salesperson defaults to logged-in user.
- Only admin can change salesperson on a subscription.
- Portal user can only do actions permitted by plan flags (Close/Renew) and subscription state.

## 9) Gaps vs “Enterprise” requirements (explicitly not in Excalidraw)
These are called out in the analysis as missing/partial and would require additional screens/logic:
- Proration engine
- Plan migration (change plan on existing subscription)
- Grace periods
- Trials
- Billing calendars (anchor day)
- Regional pricing

## 10) Implementation notes (to build exactly from this)
- Use consistent naming: **Recurring Plan** (not “Recuring”).
- Persist billing period as `(value, unit)` where unit ∈ {MONTH, YEAR}.
- Make computed fields read-only in UI (Next Invoice).
- Ensure state-based action visibility (Send/Confirm/Create Invoice/Renew/Upsell/Close).

---

## Appendix A — Suggested acceptance checklist
- Create plan with billing period + flags + auto-close validity
- Create product with multiple recurring prices
- Create subscription draft with lines
- Send quotation → confirm
- Create invoice from confirmed subscription
- Renew creates a new subscription with same details
- Portal shows subscription + invoices; actions hidden unless allowed
