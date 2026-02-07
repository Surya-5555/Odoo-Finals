# Postman / Thunder Client – Copy-Paste Guide

**Base URL:** `http://localhost:3000`  
**Start server:** `npm run start:dev`

---

## Option A – Import collection (easiest)

**File:** `backend/docs/Odoo-Subscription-API.postman_collection.json`

### Postman

1. Open Postman → **Import** → **Upload Files** → select `Odoo-Subscription-API.postman_collection.json`.
2. Run **1. Auth → Login**. From the response, copy the value of `accessToken`.
3. Click the collection **Odoo Subscription API** → **Variables** tab → set `token` = (paste the accessToken). Save.
4. All requests in the collection use `Bearer {{token}}`. Replace `1` in URLs with your real ids (contact, subscription, invoice) as you get them.

### Thunder Client (VS Code)

1. Open Thunder Client sidebar → **Collections** → **Import** → choose **Postman** → select `Odoo-Subscription-API.postman_collection.json`.
2. Run **1. Auth → Login**. Copy `accessToken` from the response.
3. Click the collection name → **Variables** → set `token` to the pasted token. Save.
4. Use the requests; replace `1` in URLs with your actual ids.

---

## Option B – Manual copy-paste

Use **Step 1** below to get a token, then add this header to every other request:

| Header Key       | Header Value        |
|------------------|---------------------|
| `Authorization`  | `Bearer YOUR_TOKEN` |

Replace `YOUR_TOKEN` with the `accessToken` from the login response.

---

## Step 1 – Get token (do this first)

### 1a – Signup

- **Method:** `POST`
- **URL:** `http://localhost:3000/auth/signup`
- **Headers:**  
  `Content-Type` = `application/json`
- **Body (raw JSON):**

```json
{
  "name": "Test User",
  "email": "postman@test.com",
  "password": "Test@1234",
  "confirmPassword": "Test@1234"
}
```

### 1b – Login (copy `accessToken` from response)

- **Method:** `POST`
- **URL:** `http://localhost:3000/auth/login`
- **Headers:**  
  `Content-Type` = `application/json`
- **Body (raw JSON):**

```json
{
  "email": "postman@test.com",
  "password": "Test@1234"
}
```

From the response, copy the value of `accessToken`.  
For all requests below, add header: **Authorization** = **Bearer** `<paste accessToken here>`

---

## Step 2 – Contacts

### Create contact

- **Method:** `POST`
- **URL:** `http://localhost:3000/contacts`
- **Headers:**  
  `Content-Type` = `application/json`  
  `Authorization` = `Bearer YOUR_TOKEN`
- **Body (raw JSON):**

```json
{
  "name": "Test Customer",
  "email": "customer@test.com",
  "phone": "9999999999",
  "companyName": "Test Corp"
}
```

Save the returned `id` as **CONTACT_ID** (e.g. 1).

### List contacts

- **Method:** `GET`
- **URL:** `http://localhost:3000/contacts`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

### Get one contact

- **Method:** `GET`
- **URL:** `http://localhost:3000/contacts/1`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`  
(Replace `1` with your CONTACT_ID.)

---

## Step 3 – Products

### Create product 1

- **Method:** `POST`
- **URL:** `http://localhost:3000/products`
- **Headers:**  
  `Content-Type` = `application/json`  
  `Authorization` = `Bearer YOUR_TOKEN`
- **Body (raw JSON):**

```json
{
  "name": "Cloud Storage",
  "productType": "SERVICE",
  "salesPrice": 1000,
  "costPrice": 500
}
```

Save the returned `id` as **PRODUCT_1_ID**.

### Create product 2

- **Method:** `POST`
- **URL:** `http://localhost:3000/products`
- **Headers:**  
  `Content-Type` = `application/json`  
  `Authorization` = `Bearer YOUR_TOKEN`
- **Body (raw JSON):**

```json
{
  "name": "Email Hosting",
  "productType": "SERVICE",
  "salesPrice": 500,
  "costPrice": 200
}
```

Save the returned `id` as **PRODUCT_2_ID**.

### List products

- **Method:** `GET`
- **URL:** `http://localhost:3000/products`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

---

## Step 4 – Payment term (optional, for subscriptions)

### Create payment term

- **Method:** `POST`
- **URL:** `http://localhost:3000/payment-terms`
- **Headers:**  
  `Content-Type` = `application/json`  
  `Authorization` = `Bearer YOUR_TOKEN`
- **Body (raw JSON):**

```json
{
  "name": "Net 30",
  "dueAfterDays": 30,
  "earlyDiscountPercent": 2,
  "earlyDiscountDays": 10
}
```

Save the returned `id` as **PAYMENT_TERM_ID** (optional).

---

## Step 5 – Quotation template (optional)

### Create quotation template

- **Method:** `POST`
- **URL:** `http://localhost:3000/quotation-templates`
- **Headers:**  
  `Content-Type` = `application/json`  
  `Authorization` = `Bearer YOUR_TOKEN`
- **Body (raw JSON):**

```json
{
  "name": "Standard Quotation",
  "content": "Thank you for your business."
}
```

---

## Step 6 – Recurring plans

### Create recurring plan

- **Method:** `POST`
- **URL:** `http://localhost:3000/recurring-plans`
- **Headers:**  
  `Content-Type` = `application/json`  
  `Authorization` = `Bearer YOUR_TOKEN`
- **Body (raw JSON):**

```json
{
  "name": "Pro Monthly Plan",
  "minQuantity": 1,
  "pausable": true,
  "renewable": true,
  "closable": true,
  "autoClose": true,
  "autoCloseValidityDays": 15,
  "prices": [
    {
      "price": 2000,
      "billingPeriodValue": 1,
      "billingPeriodUnit": "MONTH",
      "isDefault": true
    }
  ]
}
```

Save the returned `id` as **PLAN_ID**.

### List recurring plans

- **Method:** `GET`
- **URL:** `http://localhost:3000/recurring-plans`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

---

## Step 7 – Subscriptions

Replace `1` in URLs with your CONTACT_ID, PLAN_ID, PRODUCT_1_ID, PRODUCT_2_ID where noted.

### Create subscription (draft)

- **Method:** `POST`
- **URL:** `http://localhost:3000/subscriptions`
- **Headers:**  
  `Content-Type` = `application/json`  
  `Authorization` = `Bearer YOUR_TOKEN`
- **Body (raw JSON)** – replace the ids with yours:

```json
{
  "contactId": 1,
  "recurringPlanId": 1,
  "lines": [
    { "productId": 1, "quantity": 2, "unitPrice": 1000 },
    { "productId": 2, "quantity": 1, "unitPrice": 500 }
  ]
}
```

Save the returned `id` as **SUB_ID** and `number` (e.g. Sub001).

### List subscriptions

- **Method:** `GET`
- **URL:** `http://localhost:3000/subscriptions`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

### Get subscription by number

- **Method:** `GET`
- **URL:** `http://localhost:3000/subscriptions/by-number/Sub001`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

### Send quotation

- **Method:** `POST`
- **URL:** `http://localhost:3000/subscriptions/1/send`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`  
(Replace `1` with SUB_ID.)

### Confirm subscription

- **Method:** `POST`
- **URL:** `http://localhost:3000/subscriptions/1/confirm`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

### Create invoice from subscription

- **Method:** `POST`
- **URL:** `http://localhost:3000/subscriptions/1/invoices`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

### Pause subscription

- **Method:** `POST`
- **URL:** `http://localhost:3000/subscriptions/1/pause`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

### Resume subscription

- **Method:** `POST`
- **URL:** `http://localhost:3000/subscriptions/1/resume`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

### Upsell (new subscription with new products)

- **Method:** `POST`
- **URL:** `http://localhost:3000/subscriptions/1/upsell`
- **Headers:**  
  `Content-Type` = `application/json`  
  `Authorization` = `Bearer YOUR_TOKEN`
- **Body (raw JSON)** – replace productId with yours:

```json
{
  "lines": [
    { "productId": 2, "quantity": 1, "unitPrice": 500 }
  ]
}
```

### Renew subscription

- **Method:** `POST`
- **URL:** `http://localhost:3000/subscriptions/1/renew`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

### Close subscription

- **Method:** `POST`
- **URL:** `http://localhost:3000/subscriptions/1/close`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

---

## Step 8 – Invoices

### List invoices

- **Method:** `GET`
- **URL:** `http://localhost:3000/invoices`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

Optional query: `?subscriptionId=1` or `?state=DRAFT`

### Get one invoice

- **Method:** `GET`
- **URL:** `http://localhost:3000/invoices/1`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

### Confirm invoice

- **Method:** `POST`
- **URL:** `http://localhost:3000/invoices/1/confirm`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

### Mark invoice paid

- **Method:** `POST`
- **URL:** `http://localhost:3000/invoices/1/pay`
- **Headers:**  
  `Authorization` = `Bearer YOUR_TOKEN`

---

## Quick checklist

1. **Login** → copy `accessToken`.
2. Set **Authorization** = `Bearer <accessToken>` on all other requests.
3. Create **Contact** → note id.
4. Create **Products** (2) → note ids.
5. Create **Recurring plan** → note id.
6. Create **Subscription** (use contact, plan, product ids).
7. **Send** → **Confirm** → **Create invoice** → **Confirm invoice** → **Pay**.
8. Optionally **Pause** → **Resume** → **Upsell** → **Renew** → **Close**.

---

## Thunder Client tip

1. New Request → set Method and URL.
2. **Auth** tab → Type: Bearer → paste token.
3. **Body** tab → raw → JSON → paste the body from above.
4. Save to a collection and duplicate the request, then change URL/Body as needed.

## Postman tip

1. Create an **Environment** with variable `token` = (paste accessToken after login).
2. In each request: **Authorization** tab → Type: Bearer Token → Token: `{{token}}`.
3. Or set **Authorization** = `Bearer` and in Value use the variable `{{token}}`.
