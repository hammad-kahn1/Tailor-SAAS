# API Documentation — Tailor Shop Management SaaS

Base URL: `https://api.yourdomain.com/api/v1` (local: `http://localhost:8000/api/v1`)

All responses are JSON. All authenticated endpoints require:
```
Authorization: Bearer <sanctum_token>
Accept: application/json
```

Standard success envelope: `{ "message": "...", "data": ... }`
Standard error envelope: `{ "message": "...", "errors": { "field": ["..."] } }` (422), or `{ "message": "..." }` (401/403/404).
Paginated endpoints return Laravel's default paginator shape: `{ "data": [...], "links": {...}, "meta": { "current_page", "last_page", "total", ... } }`.

---

## 1. Authentication Flow

1. `POST /auth/register-tenant` (public) — self-service shop signup. Creates a `Tenant` + first `Shop Owner` user, returns a token immediately.
2. `POST /auth/login` (public) — returns `{ user, token }`. Store the token client-side (e.g. `localStorage`) and send as `Authorization: Bearer <token>` on every subsequent request.
3. `GET /auth/me` — returns the authenticated user + their tenant.
4. `POST /auth/logout` — revokes the current token.
5. `POST /auth/forgot-password` / `POST /auth/reset-password` — standard Laravel password reset flow (emails a signed link/token).
6. `POST /auth/change-password` — requires `current_password` + new `password`.

### Example: Login
**Request**
```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "owner@royalstitches.test", "password": "password" }
```
**Response — 200**
```json
{
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 2, "tenant_id": 1, "name": "Ahmed Khan",
      "email": "owner@royalstitches.test", "role": "shop_owner",
      "tenant": { "id": 1, "name": "Royal Stitches Tailoring", "slug": "royal-stitches" }
    },
    "token": "1|aBcD1234...redacted"
  }
}
```

---

## 2. Customers

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/customers?search=&gender=&page=` | Owner, Manager, Receptionist | Paginated, searchable list |
| POST | `/customers` | Owner, Manager, Receptionist | Create customer |
| GET | `/customers/{id}` | Owner, Manager, Receptionist | Single customer + measurements |
| PUT | `/customers/{id}` | Owner, Manager, Receptionist | Update customer |
| DELETE | `/customers/{id}` | Owner, Manager | Soft-delete customer |
| GET | `/customers/{id}/history` | Owner, Manager, Receptionist | Orders + measurement timeline |

**Validation (`POST /customers`)**: `full_name` required string, `phone` required string, `email` nullable email, `address` nullable string, `gender` nullable in `male,female,other`, `notes` nullable string.

**Example response (`GET /customers/5`)**
```json
{
  "message": "OK",
  "data": {
    "id": 5, "full_name": "Hassan Raza", "phone": "0301-1111111",
    "email": null, "address": "Bat Khela, KP", "gender": "male",
    "notes": null, "created_by": "Sana Tariq", "created_at": "2026-05-01T10:00:00Z"
  }
}
```

---

## 3. Measurements

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/measurements` | Owner, Manager, Receptionist, Tailor | Record a **new version** (never overwrites) |
| GET | `/customers/{customerId}/measurements?type=` | same | Full version history, newest first |
| GET | `/customers/{customerId}/measurements/latest/{type}` | same | Latest version of a type — used for "Quick Reuse" |

**`POST /measurements` body (type=shirt)**
```json
{
  "customer_id": 5,
  "type": "shirt",
  "data": { "chest": 41, "waist": 37, "shoulder": 18, "sleeve": 24.5, "neck": 16, "length": 29 },
  "notes": "Re-measured, slight weight gain"
}
```
For `type=pant`: `data` accepts `waist, hip, length, bottom`.
For `type=suit`: `data` accepts nested `coat: {chest, waist, shoulder, sleeve, neck, length}` and `trouser: {waist, hip, length, bottom}`.

Each save auto-increments `version` for that `customer_id + type` pair — the previous version is preserved untouched.

---

## 4. Orders

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/orders?status=&search=&from_date=&to_date=&customer_id=&page=` | Owner, Manager, Receptionist | Paginated list with filters |
| POST | `/orders` | Owner, Manager, Receptionist | Create order (+ items, optional advance payment) |
| GET | `/orders/{id}` | Owner, Manager, Receptionist, Tailor* | Order detail |
| PATCH | `/orders/{id}/status` | Owner, Manager, Receptionist, Tailor | Transition status |
| POST | `/orders/{order}/payments` | Owner, Manager, Receptionist | Record a payment |

\* Tailors may only view/act on orders assigned to them (enforced by `OrderPolicy`).

**`POST /orders` body**
```json
{
  "customer_id": 5,
  "measurement_id": 12,
  "delivery_date": "2026-06-30",
  "advance_payment": 2000,
  "notes": "Slim fit preferred",
  "items": [
    { "item_name": "Shirt", "quantity": 2, "unit_price": 1500 },
    { "item_name": "Pant", "quantity": 1, "unit_price": 1500 }
  ]
}
```
`total_price`, `advance_payment` (snapshot), and `remaining_payment` are computed server-side — never trust client-submitted totals.

**Order statuses** (in typical lifecycle order): `pending` → `assigned` → `in_progress` → `ready` → `delivered`. `cancelled` is reachable from any non-terminal state.

`PATCH /orders/{id}/status` body: `{ "status": "ready", "notes": "optional" }`. Transitioning to `ready` automatically triggers the "Order Ready" email notification.

---

## 5. Tailor Assignment

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/orders/{order}/assign` | Owner, Manager | Assign/reassign order to a tailor |
| PATCH | `/assignments/{id}/status` | Owner, Manager, Tailor (own only) | `assigned` → `in_progress` → `completed` |
| GET | `/assignments/workload` | Owner, Manager | Counts per tailor by status (dashboard) |
| GET | `/assignments/my?status=` | Tailor | The tailor's own queue |

`POST /orders/{order}/assign` body: `{ "tailor_id": 7, "notes": "optional" }`. Sets the order's status to `assigned` and creates/updates the `tailor_assignments` row (one active assignment per order — unique constraint).

---

## 6. Receipts

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/orders/{order}/receipt` | Owner, Manager, Receptionist | JSON payload for in-app preview |
| GET | `/orders/{order}/receipt/pdf` | Owner, Manager, Receptionist | Downloads an 80mm thermal-formatted PDF, includes a QR code linking to a public order-verification page |

---

## 7. Dashboard

`GET /dashboard` (any authenticated tenant user) returns:
```json
{
  "data": {
    "todays_orders": 4, "pending_orders": 11, "completed_orders": 87,
    "revenue_today": 12500.0, "monthly_revenue": 184300.0,
    "upcoming_deliveries": [ { "id": 1, "order_number": "...", "delivery_date": "2026-06-22", "status": "in_progress", "customer": {...} } ],
    "status_breakdown": { "pending": 5, "assigned": 3, "in_progress": 3, "ready": 2, "delivered": 87, "cancelled": 1 }
  }
}
```

---

## 8. Reports

All report endpoints accept `?format=json|pdf|excel` (default `json`). PDF/Excel responses are file downloads.

| Endpoint | Roles | Params |
|---|---|---|
| `GET /reports/daily-sales` | Owner, Manager | `date` (default today) |
| `GET /reports/monthly-revenue` | Owner, Manager | `year`, `month` |
| `GET /reports/pending-orders` | Owner, Manager | — |
| `GET /reports/tailor-performance` | Owner, Manager | — |
| `GET /reports/delivery-schedule` | Owner, Manager | `from`, `to` |

---

## 9. Tenant / Subscription / Staff Management

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/tenants` | Super Admin | List all tenants |
| GET | `/tenants/{id}` | Super Admin | Tenant detail |
| PATCH | `/tenants/{id}/subscription` | Super Admin | Update plan/status/billing |
| PUT | `/shop/profile` | Shop Owner | Update own shop's profile/settings |
| GET / POST | `/users` | Shop Owner | List / create staff (Manager, Tailor, Receptionist) |
| PUT | `/users/{id}` | Shop Owner | Update staff role / active status |
| GET | `/users/tailors` | any tenant user | Lightweight list for assignment dropdowns |

---

## 10. Audit Log

`GET /audit-logs?model_type=&user_id=&from_date=&to_date=&page=` — Shop Owner only. Every `created`/`updated`/`deleted` event on tenant-owned models is captured automatically via the `Auditable` trait, plus domain events like order status changes.

---

## 11. Error Codes

| Code | Meaning |
|---|---|
| 401 | Missing/invalid/expired token |
| 403 | Authenticated, but role/policy denies the action |
| 404 | Not found **or** belongs to another tenant (intentionally indistinguishable) |
| 422 | Validation failed — see `errors` object |
| 429 | Rate limited |
| 500 | Unhandled server error (logged; generic message returned in production) |

## 12. Versioning

The entire API is namespaced under `/api/v1`. Breaking changes ship as `/api/v2` with the previous version kept alive for a deprecation window — never break `v1` in place.

## 13. Pagination & Filtering Conventions

- All list endpoints accept `page` and `per_page` (default 15, capped server-side).
- Search params are *contains* (SQL `LIKE %term%`) on the relevant text columns.
- Date filters are inclusive, `YYYY-MM-DD`.
