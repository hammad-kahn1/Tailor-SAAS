# System Architecture — Tailor Shop Management SaaS

## 1. High-Level Architecture

```
                                   ┌─────────────────────────┐
                                   │        Browser           │
                                   │  React + Vite SPA (PWA)  │
                                   └────────────┬─────────────┘
                                                │ HTTPS (JSON/REST)
                                   ┌────────────▼─────────────┐
                                   │      Nginx (Reverse Proxy)│
                                   │  - TLS termination         │
                                   │  - Routes /api -> Laravel  │
                                   │  - Routes /   -> React     │
                                   └──────┬──────────────┬─────┘
                                          │              │
                          ┌───────────────▼───┐   ┌──────▼────────────┐
                          │  Laravel 11 API     │   │  Static Frontend   │
                          │  (PHP-FPM)          │   │  build (Vite dist) │
                          │  - Sanctum Auth      │   └────────────────────┘
                          │  - RBAC Middleware   │
                          │  - Tenant Middleware │
                          │  - Repository/Service│
                          │    Layer             │
                          └─────┬─────────┬──────┘
                                │         │
                  ┌─────────────▼─┐   ┌───▼─────────────┐
                  │   MySQL 8       │   │  Queue Worker    │
                  │  (shared DB,    │   │  (Notifications, │
                  │   tenant_id     │   │   PDF/Excel gen) │
                  │   row isolation)│   └──────────────────┘
                  └─────────────────┘
                                │
                  ┌─────────────▼─────────────┐
                  │  Redis (cache, queue, rate │
                  │  limiting, session store)  │
                  └─────────────────────────────┘
```

## 2. Multi-Tenancy Strategy

**Approach chosen: Single Database, Shared Schema, Row-Level Isolation (`tenant_id`)**

Rationale vs. alternatives:
| Strategy | Isolation | Ops Complexity | Cost | Chosen? |
|---|---|---|---|---|
| Database-per-tenant | Highest | High (migrations x N tenants) | High | No |
| Schema-per-tenant | High | Medium | Medium | No |
| Shared DB + `tenant_id` column | Logical (enforced in code+DB) | Low | Low | **Yes** |

This is the standard approach for SMB SaaS (low/medium tenant data volume, fast onboarding, simple backups). It is implemented with **defense in depth**:

1. **Global Eloquent Scope** (`BelongsToTenant` trait) — every tenant-owned model automatically adds `WHERE tenant_id = ?` to all queries.
2. **Middleware** (`ResolveTenant`) — resolves the authenticated user's `tenant_id` from the JWT/Sanctum token and binds it into the service container as the *only* source of truth (never trusts a tenant_id passed in the request body/query).
3. **Database foreign keys** — every tenant-owned table has `tenant_id` with `ON DELETE CASCADE`, indexed.
4. **Policy layer** — Laravel Policies double-check `model->tenant_id === auth()->user()->tenant_id` before any read/write, so even a raw query that forgets the scope fails closed.
5. **Super Admin bypass** — only the `super_admin` role (no `tenant_id`) may query across tenants, via an explicit `withoutTenantScope()` call gated by role middleware — never by default.

This means a developer would have to *deliberately* opt out of three independent layers to leak data across tenants.

## 3. Clean Architecture / Layering

```
HTTP Layer       -> Controllers (thin, only orchestrate)
Validation Layer  -> Form Requests (rules + authorization)
Service Layer     -> Business logic, transactions, events
Repository Layer  -> Eloquent query encapsulation, interfaces bound in a ServiceProvider
Domain/Model Layer -> Eloquent Models, Traits, Observers
```

Controllers never talk to Eloquent directly — they call a `Service`, which calls a `Repository` (bound via interface, so it's swappable/testable). This satisfies SOLID (Dependency Inversion in particular) and keeps controllers under ~30 lines.

## 4. Role-Based Access Control (RBAC)

| Role | Scope | Key Permissions |
|---|---|---|
| Super Admin | Cross-tenant | Manage tenants, subscriptions, global settings |
| Shop Owner | Single tenant | Full access within their shop |
| Manager | Single tenant | Orders, customers, assignments, reports (no billing/user mgmt) |
| Tailor | Single tenant | View assigned orders, update work status only |
| Receptionist | Single tenant | Customers, orders intake, receipts (no reports/financials edit) |

Implemented via a `role` enum column on `users` + a `permission:*` Gate/Middleware (`role:shop_owner,manager`) on routes, plus fine-grained Policies per model (e.g., a Tailor can only `update` an assignment's status, not the order price).

## 5. Authentication Flow (Sanctum, SPA token-based)

1. `POST /api/v1/auth/login` → validates credentials, issues a Sanctum personal access token scoped with abilities matching the user's role.
2. Token returned to SPA, stored in memory + httpOnly-secured refresh strategy (see API docs).
3. Every subsequent request: `Authorization: Bearer <token>`.
4. `ResolveTenant` middleware reads `tenant_id` off the authenticated user and shares it app-wide.
5. `Role` middleware checks the route's required role(s) against `auth()->user()->role`.
6. `POST /api/v1/auth/logout` revokes the current token.

## 6. Deployment Topology (Docker Compose)

Services: `nginx`, `backend` (php-fpm), `frontend` (node build → static), `mysql`, `redis`, `queue-worker`, `scheduler` (cron for reminders).
See `docker-compose.yml` and `docs/DEPLOYMENT.md`.

## 7. Folder Structure

See `docs/FOLDER_STRUCTURE.md` for the full annotated tree.
