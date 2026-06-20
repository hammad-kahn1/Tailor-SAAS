# Annotated Folder Structure

```
tailor-saas/
├── docker-compose.yml          # orchestrates all 8 services
├── .env.example                 # docker-compose-level variables
├── nginx/
│   └── default.conf             # API reverse proxy → PHP-FPM (fastcgi)
│
├── backend/                     # Laravel 11 REST API
│   ├── app/
│   │   ├── Models/               # Eloquent models (Tenant, User, Customer, Order, ...)
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/   # thin controllers, one per resource
│   │   │   ├── Requests/             # Form Request validation + per-action authorize()
│   │   │   ├── Resources/            # API Resource response shaping
│   │   │   └── Middleware/           # ResolveTenant, EnsureRole
│   │   ├── Repositories/
│   │   │   ├── Contracts/            # interfaces (Dependency Inversion)
│   │   │   └── Eloquent/             # concrete query implementations
│   │   ├── Services/              # business logic / transactions / orchestration
│   │   ├── Policies/               # per-model authorization (CustomerPolicy, OrderPolicy)
│   │   ├── Traits/                 # BelongsToTenant, Auditable
│   │   ├── Notifications/          # OrderReady, DeliveryReminder, PaymentReminder
│   │   ├── Exports/                 # Excel export classes
│   │   └── Providers/               # RepositoryServiceProvider, AuthServiceProvider, AppServiceProvider
│   ├── bootstrap/app.php          # Laravel 11 app bootstrap (middleware, exception handling)
│   ├── config/                    # app, auth, sanctum, database, cors, cache, session, etc.
│   ├── database/
│   │   ├── migrations/            # one file per table, chronologically ordered
│   │   ├── seeders/                # SuperAdminSeeder, DemoTenantSeeder (full sample data)
│   │   └── factories/              # used by automated tests
│   ├── resources/views/
│   │   ├── receipts/thermal.blade.php   # 80mm thermal receipt layout
│   │   └── reports/*.blade.php          # PDF report layouts
│   ├── routes/
│   │   ├── api.php                # versioned REST routes, grouped by role middleware
│   │   ├── web.php                 # QR-code verification landing page only
│   │   └── console.php             # scheduled jobs (delivery/payment reminders)
│   ├── tests/Feature/              # AuthTest, CustomerTest, OrderTest, TenantIsolationTest
│   ├── docker/                     # entrypoint.sh, php.ini
│   └── Dockerfile
│
├── frontend/                     # React 18 + Vite + Tailwind SPA
│   ├── src/
│   │   ├── api/axios.js            # configured client, auth header + 401 interceptor
│   │   ├── context/AuthContext.jsx # global auth state, role helpers
│   │   ├── routes/ProtectedRoute.jsx
│   │   ├── layouts/DashboardLayout.jsx   # sidebar + responsive shell
│   │   ├── components/             # StatCard, StatusBadge, Modal, Pagination, EmptyState
│   │   └── pages/
│   │       ├── auth/                # Login, RegisterTenant, ForgotPassword
│   │       ├── customers/           # CustomerList, CustomerForm, CustomerDetail
│   │       ├── measurements/        # MeasurementForm (shirt/pant/suit)
│   │       ├── orders/              # OrderList, OrderForm, OrderDetail
│   │       ├── assignments/         # MyAssignments (tailor), WorkloadBoard (owner/mgr)
│   │       ├── reports/             # Reports.jsx (PDF/Excel export triggers)
│   │       ├── Dashboard.jsx, AuditLog.jsx, ShopSettings.jsx, NotFound.jsx
│   │   ├── App.jsx                  # route tree with role-gated nesting
│   │   └── main.jsx
│   ├── docker/nginx.conf            # serves SPA + proxies /api to nginx-api
│   └── Dockerfile                    # multi-stage: node build → nginx serve
│
└── docs/
    ├── ARCHITECTURE.md
    ├── ERD.md
    ├── DATABASE_SCHEMA.md
    ├── API_DOCUMENTATION.md
    ├── FOLDER_STRUCTURE.md (this file)
    ├── TESTING_PLAN.md
    └── DEPLOYMENT.md
```

## Why this layering?

- **Controllers stay thin.** They validate (via Form Requests), delegate to a Service, and shape the response (via API Resources). No business logic lives in a controller.
- **Services own business rules + transactions** (e.g. `OrderService` wraps order+items+payment creation; `TailorAssignmentService` keeps the order status in sync with assignment status).
- **Repositories own query construction**, bound to interfaces so they can be swapped or mocked in tests without touching Services or Controllers.
- **Traits (`BelongsToTenant`, `Auditable`) carry cross-cutting concerns** that would otherwise be repeated in every model/controller — multi-tenancy and audit logging are the two requirements most likely to cause production data leaks or compliance findings if implemented inconsistently, so they're centralized.
