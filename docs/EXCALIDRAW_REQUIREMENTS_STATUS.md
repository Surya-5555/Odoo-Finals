# Excalidraw Requirements → Implementation Status

Source: `docs/Subscription Management System 24 hours.excalidraw`

This document answers:
1) **How much is done vs incomplete** (against what’s drawn in the Excalidraw file)
2) What’s implemented in the codebase today (frontend + backend)

> For exact screen element coordinates/positions, see: `docs/EXCALIDRAW_SOURCE_LAYOUT_SPEC.md`.

---

## 1) Screens in Excalidraw (what’s required)

Detected “screen containers” (large rectangles) include:
- Auth: **Login Page**, **Signup Page**, **Reset Password Page**
- Back-office / internal navigation mock: **Products** (top navigation: subscriptions, products, reporting, configuration, users/contacts, my profile)
- Subscription-related configuration blocks: “Variants / Recurring Plan / Quotation Template / Payment term / Discount / Taxes”
- Payment term rules: “Payment term / Early discount / Due term / days after invoice create”
- Invoicing: **Invoice** (payment method, amount, payment date, buttons)
- Portal / shop flow: **Shop Page**, **Search**, **Sort By: Price**, **Product List Page**, **Product form view Page**, **Checkout**, **Order Address Payment**, **Discount code apply**

---

## 2) DONE (implemented end-to-end)

### 2.1 Auth backend flows
- ✅ Signup endpoint exists (`POST /auth/signup`) and returns `{ user }`
- ✅ Login endpoint exists (`POST /auth/login`) and returns `{ accessToken, user }`
- ✅ Forgot password (`POST /auth/forgot-password`) + reset (`POST /auth/reset-password`) exist
- ✅ Admin-only internal user creation exists (`POST /auth/internal-user`) protected by roles

### 2.2 Back-office Phase-1 pages (not drawn as full screens in Excalidraw, but required by the overall system)
- ✅ App shell + navigation exists (`/app/*`)
- ✅ Recurring Plans: list + create/edit
- ✅ Products: list + create/edit
- ✅ Subscriptions: list + create/edit + detail
- ✅ Invoices: list + detail; confirm + mark paid

---

## 3) PARTIALLY DONE (exists, but not matching Excalidraw requirements 100%)

### 3.1 Login screen requirements
Excalidraw says:
- “Account not exist” error when email not found
- “Invalid password” when password mismatch
- Links: “forget password ? | sign up”

Current status:
- ✅ UI exists for login + navigation to signup/forgot password
- ✅ Backend returns `401 Unauthorized` with message; UI messaging may not match Excalidraw exact strings yet

### 3.2 Reset password screen requirements
Excalidraw “Reset Password Page” shows: enter email -> verify email exists -> show “reset link sent” message.

Current status:
- ✅ Forgot password page exists (email input + success message)
- ✅ Reset page exists (token + new password)
- ⚠️ Flow differs slightly: Excalidraw shows a single page; current UI uses **two-step** (request token/link → reset with token)

### 3.3 Back-office navigation layout
Excalidraw “Products” screen uses **top navigation** items: subscriptions/products/reporting/config/users/contacts/profile.

Current status:
- ✅ Navigation exists but implemented as **sidebar** (Overview/Recurring Plans/Products/Contacts/Subscriptions/Invoices/Payment Terms/Quotation Templates)
- ✅ Reporting, Configuration, and My Profile routes/pages exist (currently lightweight/placeholder content)

### 3.4 Payment Terms (configuration)
Excalidraw includes early discount + due term UI.

Current status:
- ✅ Payment Terms CRUD UI implemented (due after days + early discount percent/fixed + optional days)
- ✅ Subscription form uses a selector (no manual id typing)

### 3.5 Invoice “after confirm” screen
Excalidraw includes payment method (online/cash), amount, payment date, payment/discard buttons.

Current status:
- ✅ Invoice detail exists with state + confirm/pay actions
- ✅ Payment method + payment date + discard UI added on the invoice detail page
- ⚠️ Backend currently stores only invoice state (CONFIRMED/PAID); method/date are UI-only for now

---

## 4) NOT DONE (missing / not started)

### 4.1 Portal / shop / checkout flow
✅ Implemented (frontend): Shop (search/sort), Product detail, Checkout (address + payment method UI), Discount apply UI, Order success, Portal profile.

Remaining gaps:
- ⚠️ “Order Address Payment” can be split into a dedicated step/screen if you want 1:1 parity with Excalidraw

### 4.2 Variants screen (“Recurring Plan / Quotation Template / Payment term / Discount / Taxes”)
Only Recurring Plan is implemented as a back-office CRUD; the combined “variants” UX is not implemented.

### 4.3 Quotation Template UI
✅ Quotation Templates CRUD UI implemented; subscription form supports selecting a template.

### 4.4 Taxes UI
✅ Taxes master UI implemented (list + create/edit) and backend CRUD endpoints added.

### 4.5 Discounts UI
✅ Discounts master UI implemented (list + create/edit) and backend CRUD + validation endpoint added.

### 4.6 Reporting module
✅ Reporting route/page exists (placeholder). No reports/graphs yet.

### 4.7 Users/Contacts admin module + profile
- ✅ Contacts CRUD UI implemented in `/app/*`
- ✅ My Profile screen implemented (basic user info)

---

## 5) What to build next (recommended order)

1) **Portal checkout parity** (optional stepper: Checkout → Order/Address/Payment)
2) **Reporting** (real tables/charts)
3) **Invoice payment persistence** (store payment method/date in backend)
4) **Variants combined UX** (Recurring Plan / Quotation Template / Payment Term / Discount / Taxes)

