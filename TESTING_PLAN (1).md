# Testing Plan

## 1. Strategy Overview

| Layer | Tool | What it covers |
|---|---|---|
| Backend unit | PHPUnit | Services, repositories, model logic in isolation |
| Backend feature | PHPUnit + `RefreshDatabase` | Full HTTP request → response cycle against a real (SQLite in-memory) DB |
| Backend critical-path | PHPUnit | **Multi-tenant isolation** (see below) — the highest-priority suite in the whole codebase |
| Frontend component | (recommended) Vitest + React Testing Library | Form validation, conditional rendering by role |
| Frontend E2E | (recommended) Playwright/Cypress | Login → create customer → record measurement → create order → assign tailor → mark delivered |
| API contract | Postman/Newman collection (exportable from `API_DOCUMENTATION.md`) | Smoke-tests every endpoint after each deploy |

Included in this deliverable: backend Feature tests (`backend/tests/Feature/`) covering Auth, Customers, Orders, and — most importantly — **Tenant Isolation**. These are written to run against SQLite in-memory for speed; run them against the real MySQL container before any release for full fidelity (enum/JSON behavior can differ subtly between drivers).

## 2. Running the Tests

```bash
cd backend
composer install
cp .env.example .env.testing   # phpunit.xml already overrides DB to sqlite :memory:
php artisan test
# or target a single suite:
php artisan test --filter TenantIsolationTest
```

## 3. Test Inventory (delivered)

- **AuthTest**: login success/failure, inactive-account rejection, `/auth/me`, self-service tenant registration.
- **CustomerTest**: create with valid/invalid payloads, role restriction (Tailor forbidden), search filter.
- **OrderTest**: order creation computes `total_price`/`remaining_payment` correctly from items + advance; status transition to `ready` writes a `notifications_log` row.
- **TenantIsolationTest** (critical):
  - A tenant's user only ever sees their own tenant's customers in a list endpoint.
  - Requesting another tenant's customer by ID returns 404 (not 403, to avoid confirming existence).
  - Newly created records are automatically stamped with the *creator's* tenant — never a client-supplied one.
  - Super Admin (`tenant_id = null`) can see across all tenants.

## 4. Recommended Additional Coverage Before Production

1. **MeasurementVersioningTest** — saving a 2nd measurement for the same customer/type increments `version` and leaves v1 untouched; `latest()` returns the highest version.
2. **TailorAssignmentTest** — assigning sets order status to `assigned`; a Tailor can only update their *own* assignment (403 otherwise); status `completed` sets order status `ready`.
3. **PaymentTest** — recording a payment recalculates `remaining_payment` correctly across multiple partial payments; overpayment handling.
4. **ReceiptTest** — PDF generation doesn't throw for an order with/without a linked measurement.
5. **ReportExportTest** — each report's `format=pdf` and `format=excel` paths return the correct `Content-Type` and don't throw on an empty dataset (zero orders that day, etc.).
6. **RateLimitTest** — login endpoint throttles after N attempts (recommend adding `throttle:6,1` middleware to the login route in production).
7. **Frontend**: role-based nav rendering (a Tailor never sees "Customers" in the sidebar even if they manually navigate the URL — covered server-side too, but UI should match).

## 5. Manual QA Checklist (pre-release)

- [ ] Register a new shop (trial) end-to-end, confirm 14-day trial dates.
- [ ] Create Manager/Tailor/Receptionist accounts, confirm each role's sidebar and route access matches the RBAC matrix in `ARCHITECTURE.md`.
- [ ] Full order lifecycle: create → assign tailor → tailor marks in-progress → tailor marks completed → status reflects `ready` → receptionist marks `delivered`.
- [ ] Record partial payment, confirm remaining balance updates on the order detail page and printed receipt.
- [ ] Print/download a receipt on an actual 80mm thermal printer (or a printer set to that paper size) — confirm QR code scans and layout doesn't clip.
- [ ] Generate all 5 reports in both PDF and Excel; open each exported file.
- [ ] Confirm a Tailor cannot reach `/customers`, `/reports`, or another tailor's `/assignments/{id}/status` via direct URL/API call.
- [ ] Confirm two different tenants, logged in simultaneously (two browser profiles), never see each other's data anywhere in the UI.
- [ ] Trigger the delivery-reminder and payment-reminder scheduled jobs manually (`php artisan schedule:run`) and confirm emails land in MailHog during staging.

## 6. CI Recommendation

```yaml
# .github/workflows/backend-tests.yml (example)
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.3', extensions: mbstring, pdo_sqlite }
      - run: cd backend && composer install --no-interaction --prefer-dist
      - run: cd backend && php artisan test
```
Add a parallel job that runs `npm run build` in `frontend/` to catch compile-time errors on every PR.
