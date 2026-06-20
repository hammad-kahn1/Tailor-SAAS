# Tailor Shop Management System — SaaS

A production-ready, multi-tenant SaaS for tailoring businesses: customers, body measurements (with version history), stitching orders, tailor assignment, thermal receipts with QR codes, dashboards, and exportable reports.

**Stack:** React 18 + Vite + Tailwind (frontend) · Laravel 11 + Sanctum (API) · MySQL 8 · Redis · Docker Compose.

---

## 🚀 Quick Start

To run the application locally using Docker:

```bash
# 1. Copy environment files
cp tailor-saas/.env.example tailor-saas/.env
cp tailor-saas/backend/.env.example tailor-saas/backend/.env

# 2. Spin up containers and seed demo data
SEED_DEMO_DATA=true docker compose up --build
```

- **App URL:** [http://localhost:5173](http://localhost:5173)
- **API URL:** [http://localhost:8000/api/v1](http://localhost:8000/api/v1)
- **Sent emails (Mailpit dev server):** [http://localhost:8025](http://localhost:8025)

**Demo Login:**
- **Email:** `owner@royalstitches.test`
- **Password:** `password` (Shop Owner role)
- *See `docs/DEPLOYMENT.md` for other pre-seeded roles & credentials.*

---

## 📁 Repository Structure

```
.
├── docs/                 # System architectural and design documentation
├── tailor-saas/          # Main codebase directory
│   ├── backend/          # Laravel 11 API Server
│   ├── frontend/         # React + Vite Client (Tailwind CSS)
│   ├── nginx/            # Reverse proxy configurations
│   ├── mock-api/         # Node mock API for testing
│   └── docker-compose.yml
└── .gitignore
```

---

## 📖 System Documentation

Detailed documentations are located in the `docs/` folder:

| Documentation | Description |
|---|---|
| 📑 [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Multi-tenancy strategy, RBAC, clean-architecture layering, and auth flow. |
| 📊 [ERD.md](docs/ERD.md) | Entity-relationship diagram (Mermaid) + relationship details. |
| 🗄️ [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Full column details and index references for MySQL. |
| 🔌 [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | Endpoint references, request/response payloads, and security requirements. |
| 📁 [FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | In-depth directory layout with role mapping. |
| 🧪 [TESTING_PLAN.md](docs/TESTING_PLAN.md) | Automated testing suites and manual QA checklist. |
| 🚢 [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Dev setup, production deployment guidelines, and environment parameters. |

---

## ⚡ Implemented Features

### Fully Implemented End-to-End
- **Multi-Tenant Row Isolation:** Defense-in-depth security using global scope filters, middleware, and Laravel Policies.
- **RBAC (5 Roles):** Super Admin, Shop Owner, Shop Manager, Tailor, Customer.
- **Customer Directory:** Directory with search and body measurement version history.
- **Measurement Versioning:** Separate templates for shirts, pants, and suits with Quick Reuse capability.
- **Order Lifecycle Management:** Order intake, item detail specification, partial/full payments tracking, and stage updates.
- **Tailor Assignment Board:** Drag-and-drop/interactive tailor assignment board with live tailor workload visibility.
- **Thermal Receipts:** Generation of thermal printer-friendly receipts with a dynamic payment/order QR code.
- **Audit Logs:** Automated tracking of database state mutations using model observers.

### Implemented API Endpoints (Integration/Extension Ready)
- **Reports Exporting:** Ready-made API exports for sales, pending orders, and performance reports (supports PDF and Excel).
- **Scheduled Notifications:** Automatic background jobs for delivery dates and payment dues.
- **Subscription Engine:** Database design and billing rules prepared for subscription payments.

---

## 📄 License

This project is licensed under the MIT License. Adapt and build upon it freely.
