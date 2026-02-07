# TEST Postman Collection

Files:
- `Odoo-Finals-Backend-TEST.postman_collection.json`
- `Odoo-Finals-Backend-TEST.postman_environment.json`

## Quick use
1) Start backend (default `http://localhost:3000`).
2) Import both files into Postman.
3) Select the environment **Odoo Finals Backend - TEST**.
4) Set `baseUrl` if needed.
5) If using admin seed: start backend with `ADMIN_EMAIL` set; copy the printed bootstrap password into `adminPassword`.
6) Run: **Auth - Login (ADMIN)**, then proceed folder-by-folder.

## Notes
- Collection auth uses `Bearer {{accessToken}}`.
- Refresh/Logout are cookie-based; Postman will keep the refresh cookie automatically for the same domain.
- Payment flow: run **Invoice - Get One (sets totals)** before **Payment - Create** so `invoiceOutstanding` is populated.
