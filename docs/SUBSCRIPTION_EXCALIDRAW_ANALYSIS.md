# Subscription Management System – Excalidraw Analysis & Spec Mapping

## Overview

This document maps the **Subscription Management System 24 hours.excalidraw** design to your specified **Recurring Plan Engine (Core)** and **Subscription Management System (Enterprise)** requirements.

---

## 1. Recurring Plan Engine (Core)

### Plan fields (spec vs Excalidraw)

| Spec field      | Excalidraw / diagram                                      | Status |
|-----------------|-----------------------------------------------------------|--------|
| **Name**        | "Recurring Name" on Recurring Plan form                   | ✅     |
| **Price**       | "Price" on product form; "Recurring Prices" (Monthly, 6M, Yearly) | ✅     |
| **Billing Period** | "Billing Period" – number + dropdown (year/month), e.g. 1 year, 1 month | ✅     |
| **Min Quantity**  | "Min qty" / "Min Qty." on product & plan                  | ✅     |
| **Start/End Date** | "Start date", "End date" on product; "Start Date", "End Date" on plan | ✅     |

### Plan options (spec vs Excalidraw)

| Spec option   | Excalidraw / diagram                                                                 | Status |
|---------------|---------------------------------------------------------------------------------------|--------|
| **Auto close**| "if this option is selected and with validity days subscription is not confirm then that subscription will auto close" | ✅     |
| **Pausable**  | "Closable / pausable / Renew" – plan-level flags; "Pausable" field on Recurring Plan   | ✅     |
| **Renewable** | "Closable/pausable/Renew" – same group; "Renew" means subscription can be renewed    | ✅     |

**Diagram note:** Plan has **Closable**, **Pausable**, and **Renew** as separate options. If the plan has e.g. closable = true, subscriptions using that plan show the Close action on the portal.

**Billing period (diagram):**  
"Billing Period first number and after that dropdown (year/month), like 1 year or 1 month and it same applies to automatic close."

**Recurring Prices (diagram):**  
Product form has "Recurring Prices" with examples: Monthly, 6 Months, Yearly and price per period (e.g. 1200/month, 960/month, 840/month). Plan is linked to product recurring pricing.

---

## 2. Subscription Management (from Excalidraw)

### Subscription entity

- **Subscription number:** Auto-generated (e.g. SOxxx or Subxxx).
- **Customer:** Type-ahead; existing in dropdown or create new (redirect to Users/contacts).
- **Quotation template:** For document layout.
- **Expiration:** Quotation expiry; after that user cannot sign or pay.
- **Recurring Plan:** FK to plan; drives price and billing.
- **State:** quotation sent → confirmed (and later Renew/Close/Upsell actions).
- **Order lines:** Product, Quantity, Unit Price, Discount, Taxes, Amount.
- **Other info:** Salesperson (default = logged-in user; only admin can change), Order Date / Start Date (default = confirmation date, editable), Payment Method, Payment Term, Next Invoice.

### Subscription states (diagram)

- **Quotation** / **Quotation sent**
- **Confirmed**
- **In progress** / **Churned** (list view)
- **Draft** (before confirm)

### Subscription actions (diagram)

- **Send** – send quotation.
- **Confirm** – confirm subscription; then: Create Invoice, Preview, Send, Pay, Print; Subscription, Renew, Cancel, Upsell, Close.
- **Renew:** "On click of Renew should create new subscription order with same order line and other details, just order date and next invoice computed."
- **Upsell:** "Create new order and change or upgrade subscription with other product."
- **Close:** Only if plan is closable; shown on portal when true.

### Payment & terms

- **Payment term:** Due "After" X days; "Early discount" (percent/fixed) Y days after invoice.
- **Next Invoice:** Computed from billing period and start date.
- **Invoice:** After confirm → Create Invoice; states Draft → confirmed → send / Pay / Print.

### Portal (customer-facing)

- **Your Subscription:** Plan name, Start Date, End Date, State of subscription.
- **Last Invoices:** Invoice number, payment status, products.
- **Actions:** Renew, Close (when plan allows).

### Contacts

- **Active subscription count** per contact; click → list of that contact’s subscriptions.

---

## 3. Enterprise features (spec vs Excalidraw)

| Enterprise feature       | In Excalidraw? | Notes |
|--------------------------|----------------|-------|
| **Tiered pricing**       | Partial        | Recurring Prices (Monthly / 6M / Yearly) and "Limit usage" on discounts; no explicit tier bands in diagram. |
| **Usage-based billing**  | Partial        | "Limit usage" (bool + count) for discounts; no full usage metering in diagram. |
| **Proration engine**     | ❌             | Not drawn; to be added in backend/API. |
| **Mid-cycle upgrades**   | Partial        | "Upsell" = new order + upgrade subscription with other product. |
| **Plan migration**       | ❌             | Not drawn; to be added (e.g. change plan on existing subscription). |
| **Grace periods**        | ❌             | Not drawn; to be added. |
| **Trial handling**       | ❌             | Not drawn; to be added. |
| **Billing calendars**    | Partial        | Next Invoice and billing period; no explicit calendar UI. |
| **Regional pricing**     | ❌             | Not drawn; to be added (e.g. plan/price by region/currency). |

---

## 4. Implementation priorities (from Excalidraw + spec)

### Phase 1 – Core (from diagram)

1. **RecurringPlan:** name, price(s), billing period (value + unit), min quantity, start/end date, auto close (flag + validity days), closable, pausable, renewable.
2. **Recurring prices:** Multiple prices per plan (e.g. monthly, 6 months, yearly).
3. **Subscription:** number, customer, plan, state, expiration, order/start date, next invoice date, payment term, quotation template.
4. **Subscription lines:** product, quantity, unit price, discount, taxes, amount.
5. **Subscription actions:** Send, Confirm, Create Invoice, Renew, Upsell, Close, Cancel.
6. **Invoice:** Linked to subscription/sales order; Draft → confirmed → paid.
7. **Contact:** Active subscription count and list.

### Phase 2 – Enterprise (from spec)

1. Proration engine (mid-cycle price/plan change).
2. Plan migration workflow (change plan, keep subscription).
3. Grace periods (e.g. after payment failure).
4. Trial handling (trial end → first charge).
5. Billing calendar (anchor day, alignment).
6. Regional pricing (currency/region on plan or price).

---

## 5. Naming and UX from diagram

- **Recurring Plan** (not "Recuring Plan") – use "Recurring" in code and UI.
- **Billing period:** Store as numeric value + unit (e.g. `1`, `MONTH` or `12`, `MONTH` for yearly).
- **Auto close:** Boolean + "validity days"; if not confirmed within validity days, auto-close subscription.
- **Quotation validity:** Same concept as expiration; can align with "validity days" for consistency.

This analysis drives the backend models and APIs implemented for the Recurring Plan Engine and Subscription Management System.
