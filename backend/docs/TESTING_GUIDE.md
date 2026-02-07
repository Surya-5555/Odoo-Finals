# How to Test Each Feature

Base URL: **http://localhost:3000**  
Start the server: `npm run start:dev`

All protected routes need a JWT. Get it once, then use it in every request.

---

## 1. Get a JWT (do this first)

```bash
# Signup (use a new email each time or reuse for login)
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@1234","confirmPassword":"Test@1234"}'

# Login – copy the accessToken from the response
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

Set your token (replace with the real token):

```bash
export TOKEN="<paste_accessToken_here>"
export AUTH="Authorization: Bearer $TOKEN"
```

---

## 2. Test Contacts

| What | Method | Endpoint | Body (if POST/PATCH) |
|------|--------|----------|------------------------|
| Create contact | POST | `/contacts` | `{"name":"...","email":"...","phone":"...","companyName":"..."}` |
| List contacts | GET | `/contacts` | - |
| Get one contact | GET | `/contacts/:id` | - |
| Update contact | PATCH | `/contacts/:id` | `{"name":"..."}` (any fields) |
| Delete contact | DELETE | `/contacts/:id` | - |

**Examples:**

```bash
# Create
curl -X POST http://localhost:3000/contacts -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"name":"Acme Corp","email":"acme@example.com","phone":"1234567890","companyName":"Acme"}'

# List (check activeSubscriptionsCount in each item)
curl -X GET "http://localhost:3000/contacts" -H "$AUTH"

# Get one (replace 1 with contact id)
curl -X GET "http://localhost:3000/contacts/1" -H "$AUTH"

# Update
curl -X PATCH http://localhost:3000/contacts/1 -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"phone":"9999999999"}'

# Delete
curl -X DELETE http://localhost:3000/contacts/1 -H "$AUTH"
```

---

## 3. Test Products

| What | Method | Endpoint | Body (if POST/PATCH) |
|------|--------|----------|------------------------|
| Create product | POST | `/products` | `{"name":"...","salesPrice":100,"costPrice":50,"productType":"SERVICE"}` |
| List products | GET | `/products` | - |
| Get one product | GET | `/products/:id` | - |
| Update product | PATCH | `/products/:id` | `{"salesPrice":150}` |
| Delete product | DELETE | `/products/:id` | - |

**Examples:**

```bash
# Create
curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"name":"Cloud Storage","productType":"SERVICE","salesPrice":1000,"costPrice":500"}'

# List
curl -X GET "http://localhost:3000/products" -H "$AUTH"

# Get one (replace 1 with product id)
curl -X GET "http://localhost:3000/products/1" -H "$AUTH"
```

---

## 4. Test Recurring Plans

| What | Method | Endpoint | Body (if POST/PATCH) |
|------|--------|----------|------------------------|
| Create plan | POST | `/recurring-plans` | name, minQuantity, startDate, endDate, autoClose, autoCloseValidityDays, pausable, renewable, closable, **prices[]** |
| List plans | GET | `/recurring-plans` | - |
| Get one plan | GET | `/recurring-plans/:id` | - |
| Update plan | PATCH | `/recurring-plans/:id` | Same shape (partial) |
| Delete plan | DELETE | `/recurring-plans/:id` | - |

**Price object:** `{"price":2000,"billingPeriodValue":1,"billingPeriodUnit":"MONTH","isDefault":true}`  
`billingPeriodUnit`: `DAY` | `MONTH` | `YEAR`

**Examples:**

```bash
# Create plan with one price (monthly)
curl -X POST http://localhost:3000/recurring-plans -H "Content-Type: application/json" -H "$AUTH" \
  -d '{
    "name":"Pro Monthly",
    "minQuantity":1,
    "pausable":true,
    "renewable":true,
    "closable":true,
    "autoClose":true,
    "autoCloseValidityDays":15,
    "prices":[{"price":2000,"billingPeriodValue":1,"billingPeriodUnit":"MONTH","isDefault":true}]
  }'

# Create plan with multiple prices (monthly + yearly)
curl -X POST http://localhost:3000/recurring-plans -H "Content-Type: application/json" -H "$AUTH" \
  -d '{
    "name":"Pro Annual",
    "minQuantity":1,
    "pausable":true,
    "renewable":true,
    "closable":true,
    "prices":[
      {"price":2000,"billingPeriodValue":1,"billingPeriodUnit":"MONTH","isDefault":false},
      {"price":20000,"billingPeriodValue":1,"billingPeriodUnit":"YEAR","isDefault":true}
    ]
  }'

# List plans
curl -X GET "http://localhost:3000/recurring-plans" -H "$AUTH"

# Get one plan (replace 1 with plan id)
curl -X GET "http://localhost:3000/recurring-plans/1" -H "$AUTH"
```

---

## 5. Test Subscriptions

Replace `CONTACT_ID`, `PLAN_ID`, `PRODUCT_1_ID`, `PRODUCT_2_ID` with real ids from the steps above.

| What | Method | Endpoint | Body / Notes |
|------|--------|----------|---------------|
| Create (draft) | POST | `/subscriptions` | contactId, recurringPlanId, **lines**: [{ productId, quantity, unitPrice }] |
| List | GET | `/subscriptions` | Optional: `?contactId=1` or `?state=CONFIRMED` |
| Get by id | GET | `/subscriptions/:id` | - |
| Get by number | GET | `/subscriptions/by-number/Sub001` | - |
| Update (draft only) | PATCH | `/subscriptions/:id` | contactId, recurringPlanId, lines, etc. |
| Send quotation | POST | `/subscriptions/:id/send` | DRAFT → QUOTATION_SENT |
| Confirm | POST | `/subscriptions/:id/confirm` | DRAFT/QUOTATION_SENT → CONFIRMED, sets startDate, nextInvoiceDate |
| Pause | POST | `/subscriptions/:id/pause` | CONFIRMED → PAUSED (plan must be pausable) |
| Resume | POST | `/subscriptions/:id/resume` | PAUSED → CONFIRMED |
| Renew | POST | `/subscriptions/:id/renew` | Creates new subscription, same lines (plan must be renewable) |
| Close | POST | `/subscriptions/:id/close` | CONFIRMED/PAUSED → CLOSED (plan must be closable) |
| Delete | DELETE | `/subscriptions/:id` | Only DRAFT or QUOTATION_SENT, no invoices |

**Examples:**

```bash
# Create subscription (draft) – use your contact id, plan id, product ids
curl -X POST http://localhost:3000/subscriptions -H "Content-Type: application/json" -H "$AUTH" \
  -d '{
    "contactId":1,
    "recurringPlanId":1,
    "lines":[
      {"productId":1,"quantity":2,"unitPrice":1000},
      {"productId":2,"quantity":1,"unitPrice":500}
    ]
  }'

# List all
curl -X GET "http://localhost:3000/subscriptions" -H "$AUTH"

# List by contact
curl -X GET "http://localhost:3000/subscriptions?contactId=1" -H "$AUTH"

# List by state
curl -X GET "http://localhost:3000/subscriptions?state=CONFIRMED" -H "$AUTH"

# Get one (replace 1 with subscription id)
curl -X GET "http://localhost:3000/subscriptions/1" -H "$AUTH"

# Get by number
curl -X GET "http://localhost:3000/subscriptions/by-number/Sub001" -H "$AUTH"

# Send (id = subscription id)
curl -X POST "http://localhost:3000/subscriptions/1/send" -H "$AUTH"

# Confirm
curl -X POST "http://localhost:3000/subscriptions/1/confirm" -H "$AUTH"

# Pause
curl -X POST "http://localhost:3000/subscriptions/1/pause" -H "$AUTH"

# Resume
curl -X POST "http://localhost:3000/subscriptions/1/resume" -H "$AUTH"

# Renew (creates new subscription)
curl -X POST "http://localhost:3000/subscriptions/1/renew" -H "$AUTH"

# Close
curl -X POST "http://localhost:3000/subscriptions/1/close" -H "$AUTH"

# Create invoice from subscription (confirmed/paused only)
curl -X POST "http://localhost:3000/subscriptions/1/invoices" -H "$AUTH"

# Upsell (new subscription with new/upgrade products; optional new plan)
curl -X POST "http://localhost:3000/subscriptions/1/upsell" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"lines":[{"productId":2,"quantity":1,"unitPrice":500}],"recurringPlanId":1}'

# Delete (only draft/quotation-sent, no invoices)
curl -X DELETE "http://localhost:3000/subscriptions/1" -H "$AUTH"
```

---

## 5b. Test Invoices

| What | Method | Endpoint |
|------|--------|----------|
| Create from subscription | POST | `/subscriptions/:id/invoices` |
| List invoices | GET | `/invoices` (optional: `?subscriptionId=1` or `?contactId=1` or `?state=DRAFT`) |
| Get one invoice | GET | `/invoices/:id` |
| Confirm invoice | POST | `/invoices/:id/confirm` |
| Mark paid | POST | `/invoices/:id/pay` |

**Examples:**

```bash
# Create invoice from subscription (subscription must be CONFIRMED or PAUSED)
curl -X POST "http://localhost:3000/subscriptions/1/invoices" -H "$AUTH"

# List
curl -X GET "http://localhost:3000/invoices" -H "$AUTH"
curl -X GET "http://localhost:3000/invoices?subscriptionId=1" -H "$AUTH"

# Confirm then pay
curl -X POST "http://localhost:3000/invoices/1/confirm" -H "$AUTH"
curl -X POST "http://localhost:3000/invoices/1/pay" -H "$AUTH"
```

---

## 5c. Test Payment Terms

| What | Method | Endpoint |
|------|--------|----------|
| Create | POST | `/payment-terms` |
| List | GET | `/payment-terms` |
| Get one | GET | `/payment-terms/:id` |
| Update | PATCH | `/payment-terms/:id` |
| Delete | DELETE | `/payment-terms/:id` |

**Body for create:** `{"name":"Net 30","dueAfterDays":30,"earlyDiscountPercent":2,"earlyDiscountDays":10}`

---

## 5d. Test Quotation Templates

| What | Method | Endpoint |
|------|--------|----------|
| Create | POST | `/quotation-templates` |
| List | GET | `/quotation-templates` |
| Get one | GET | `/quotation-templates/:id` |
| Update | PATCH | `/quotation-templates/:id` |
| Delete | DELETE | `/quotation-templates/:id` |

**Body for create:** `{"name":"Standard Quotation","content":"..."}`

---

## 6. Quick test order (by hand)

1. **Auth** – signup or login, set `TOKEN` and `AUTH`.
2. **Contact** – POST one contact, note `id` → `CONTACT_ID`.
3. **Products** – POST two products, note `id`s → `PRODUCT_1_ID`, `PRODUCT_2_ID`.
4. **Recurring plan** – POST one plan with `prices`, note `id` → `PLAN_ID`.
5. **Subscription** – POST subscription with `CONTACT_ID`, `PLAN_ID`, and product lines (with `unitPrice`).
6. **Workflow** – on that subscription id: **send** → **confirm** → **pause** → **resume** → **renew** (new sub) → **close** (on original).

---

## 7. Run the full E2E script

Runs all steps above in one go and checks responses:

```bash
cd backend
./run-e2e-tests.sh
```

Optional: `BASE_URL=http://localhost:3000 ./run-e2e-tests.sh`

---

## 8. What to check when testing

- **Contacts:** After confirm, GET contact by id and check `activeSubscriptionsCount` (CONFIRMED + PAUSED).
- **Plans:** Delete fails if there are active (CONFIRMED/PAUSED) subscriptions on that plan.
- **Subscriptions:**  
  - After **confirm**: `state=CONFIRMED`, `startDate` and `nextInvoiceDate` set; nextInvoiceDate = startDate + billing period.  
  - **Pause/Resume**: only if plan is pausable.  
  - **Renew**: new subscription, new number, same lines, new nextInvoiceDate.  
  - **Close**: only if plan is closable; after close, pause and renew return 400.
