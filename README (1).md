# Tailor Shop Management System — SaaS

A production-ready, multi-tenant SaaS for tailoring businesses: customers, body measurements (with version history), stitching orders, tailor assignment, thermal receipts with QR codes, dashboards, and exportable reports.

**Stack:** React 18 + Vite + Tailwind (frontend) · Laravel 11 + Sanctum (API) · MySQL 8 · Redis · Docker Compose.

## Quick Start

```bash
cp .env.example .env
cp backend/.env.example backend/.env
SEED_DEMO_DATA=true docker compose up --build
```

- App: http://localhost:5173
- API: http://localhost:8000/api/v1
- Sent emails (dev): http://localhost:8025

**Demo login:** `owner@royalstitches.test` / `password` (Shop Owner). See `docs/DEPLOYMENT.md` for all seeded role logins.

## Documentation

| Doc | Contents |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System diagram, multi-tenancy strategy, RBAC, clean-architecture layering, auth flow |
| [`docs/ERD.md`](docs/ERD.md) | Entity-relationship diagram (Mermaid) + relationship rationale |
| [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | Full table-by-table column reference |
| [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) | Every endpoint, roles, request/response examples |
| [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md) | Annotated repo layout |
| [`docs/TESTING_PLAN.md`](docs/TESTING_PLAN.md) | Test inventory, how to run, manual QA checklist |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Local setup, production checklist, scaling notes |

## What's fully implemented vs. scaffolded

**Fully implemented, end-to-end (API + UI + tests where noted):**
Multi-tenant row isolation (defense-in-depth: global scope + middleware + policies), Auth (login/logout/forgot-reset/change password, self-service shop signup), RBAC for 5 roles, Customer CRUD + search + history, Measurement versioning (shirt/pant/suit) with Quick Reuse, Order intake + items + payments + status lifecycle, Tailor assignment + workload dashboard + tailor's own queue, Thermal receipt PDF with QR code, Main dashboard, Audit log (automatic via model events).

**Implemented with working endpoints, lighter UI/extension points:**
Reports (all 5 types, PDF + Excel export) — uses a generic exporter; swap in dedicated `...Export` classes per report for custom column formatting. Notifications (Email is fully wired with a scheduler for delivery/payment reminders; SMS is stubbed behind the same `NotificationService` interface — plug in a Twilio/Vonage channel). Subscription/billing — schema + Super Admin endpoints exist; no payment gateway integration (Stripe/PayPal) is wired, by design, since that requires your merchant account credentials.

## Repository Layout

```
tailor-saas/
├── backend/        # Laravel 11 API
├── frontend/        # React + Vite SPA
├── nginx/            # API reverse proxy config
├── docker-compose.yml
└── docs/             # all documentation listed above
```

## License

MIT — adapt freely for your own tailoring SaaS.
