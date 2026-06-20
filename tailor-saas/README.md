# 🧵 TailorSaaS — Cloud-Based Tailor Shop Management System

A production-ready, multi-tenant SaaS platform built for tailoring businesses.

## 🏗️ Architecture Overview

```
tailor-saas/
├── backend/          # Laravel 11 REST API
├── frontend/         # React 18 + Vite + Tailwind CSS SPA
├── nginx/            # Nginx reverse proxy config
└── docker-compose.yml
```

## ⚡ Tech Stack

| Layer       | Technology                               |
|-------------|------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Recharts   |
| Backend     | Laravel 11, PHP 8.3, Sanctum Auth        |
| Database    | MySQL 8.0                                |
| Cache/Queue | Redis 7                                  |
| Proxy       | Nginx Alpine                             |
| Container   | Docker + Docker Compose                  |

## 🛡️ Roles

| Role           | Permissions                                       |
|----------------|---------------------------------------------------|
| `super_admin`  | Manage all tenants, subscriptions, full access    |
| `shop_owner`   | Full shop access, staff management, reports       |
| `manager`      | Orders, customers, assignments, reports           |
| `receptionist` | Customers, orders, measurements, payments         |
| `tailor`       | View own assignments, update status               |

## 🚀 Quick Start (Docker)

### 1. Clone & configure

```bash
cd "tailor-saas"
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Start all services

```bash
docker compose up -d --build
```

> The entrypoint automatically: waits for MySQL → runs migrations → seeds demo data.

### 3. Access the app

| Service      | URL                          |
|--------------|------------------------------|
| Frontend     | http://localhost:5173         |
| API          | http://localhost:8000/api/v1  |
| MailHog UI   | http://localhost:8025         |

## 🔑 Demo Credentials

| Role        | Email                           | Password   |
|-------------|---------------------------------|------------|
| Super Admin | admin@tailorsaas.com            | `password` |
| Shop Owner  | owner@royalstitches.test        | `password` |
| Manager     | manager@royalstitches.test      | `password` |
| Tailor      | tailor1@royalstitches.test      | `password` |
| Receptionist| rec@royalstitches.test          | `password` |

## 📦 API Overview

All endpoints are prefixed `/api/v1` and require `Authorization: Bearer <token>` except auth routes.

### Auth
```
POST /auth/register-tenant
POST /auth/login
POST /auth/logout
GET  /auth/me
POST /auth/change-password
POST /auth/forgot-password
```

### Customers
```
GET    /customers               List (search, gender, paginate)
POST   /customers               Create
GET    /customers/{id}          Show
PUT    /customers/{id}          Update
DELETE /customers/{id}          Delete
GET    /customers/{id}/history  Full history (orders + measurements)
```

### Measurements
```
POST /measurements
GET  /customers/{id}/measurements
GET  /customers/{id}/measurements/latest/{type}
```

### Orders
```
GET    /orders                  List (status, search, date range)
POST   /orders                  Create with items
GET    /orders/{id}             Full detail
PATCH  /orders/{id}/status      Update status
POST   /orders/{id}/assign      Assign tailor
POST   /orders/{id}/payments    Record payment
GET    /orders/{id}/receipt     JSON receipt
GET    /orders/{id}/receipt/pdf 80mm thermal PDF
```

### Reports (`?format=json|pdf`)
```
GET /reports/daily-sales
GET /reports/monthly-revenue
GET /reports/pending-orders
GET /reports/tailor-performance
GET /reports/delivery-schedule
```

## 🗄️ Database Schema (Key Tables)

```
tenants            → Multi-tenant root
users              → All roles (tenant_id nullable for super_admin)
customers          → tenant_id, full_name, phone, gender
measurements       → tenant_id, customer_id, type, version, data (JSON)
orders             → tenant_id, order_number, status, total_price, delivery_date
order_items        → order_id, item_name, quantity, unit_price, subtotal
tailor_assignments → tenant_id, order_id, tailor_id, status, timestamps
payments           → tenant_id, order_id, amount, type, method, paid_at
audit_logs         → tenant_id, user_id, action, model_type, old/new_values
subscriptions      → tenant_id, plan, price, status
```

## 🏃 Local Development (without Docker)

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve          # → http://localhost:8000
php artisan queue:work     # (separate terminal)
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                # → http://localhost:5173
```

## 🔧 Multi-Tenancy

- Every table has `tenant_id`
- `BelongsToTenant` trait adds a **global Eloquent scope** to all tenant models
- `ResolveTenant` middleware injects the tenant from the authenticated user
- `super_admin` users bypass the global scope via `withoutGlobalScopes()`

## 📄 License

MIT — free to use and modify.
