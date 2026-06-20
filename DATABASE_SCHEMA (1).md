# Database Schema Reference

> Generated from the migration files in `backend/database/migrations/`. See `ERD.md` for the visual diagram.

## tenants
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| name | string | |
| slug | string | unique |
| email | string | unique |
| phone, address, logo_path | nullable | |
| subscription_plan | string | trial/basic/pro/enterprise |
| subscription_status | string | active/past_due/cancelled/expired |
| trial_ends_at | timestamp | nullable |
| is_active | boolean | default true |
| settings | json | currency, timezone, receipt footer, etc. |
| timestamps | | |

## users
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| tenant_id | bigint FK → tenants, **nullable** | null only for `super_admin` |
| name, email (unique), password | | |
| role | enum | super_admin / shop_owner / manager / tailor / receptionist |
| phone | nullable | |
| is_active | boolean | |
| timestamps | | |

`personal_access_tokens` (Sanctum), `password_reset_tokens`, `sessions` are also created by the auth migration.

## customers
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| tenant_id | bigint FK → tenants, cascade delete | |
| full_name, phone | required | |
| email | nullable | enables email notifications |
| address, notes | nullable text | |
| gender | enum nullable | male/female/other |
| created_by | FK → users, nullable | |
| deleted_at | soft delete | |
| timestamps | | |

Indexes: `(tenant_id, full_name)`, `(tenant_id, phone)`.

## measurements
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| tenant_id | FK → tenants | |
| customer_id | FK → customers, cascade delete | |
| type | enum | shirt / pant / suit |
| version | unsigned int | auto-incremented per (customer_id, type) |
| data | json | flexible field set, validated per type in FormRequest |
| notes | nullable | |
| recorded_by | FK → users, nullable | |
| timestamps | | |

Unique constraint: `(customer_id, type, version)` — guarantees version integrity.
Index: `(tenant_id, customer_id)`.

## orders
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| tenant_id | FK → tenants | |
| order_number | string, unique | format `ORD-YYYYMMDD-NNNN-XXX` |
| customer_id | FK → customers | |
| measurement_id | FK → measurements, nullable | snapshot reference at order time |
| status | enum | pending/assigned/in_progress/ready/delivered/cancelled |
| total_price, advance_payment, remaining_payment | decimal(12,2) | |
| delivery_date | date | |
| notes | text nullable | |
| created_by | FK → users, nullable | |
| timestamps | | |

Indexes: `(tenant_id, status)`, `(tenant_id, delivery_date)`, `(tenant_id, created_at)`.

## order_items
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| order_id | FK → orders, cascade delete | |
| item_name | string | e.g. Shirt, Pant, Suit |
| quantity | unsigned int | |
| unit_price, subtotal | decimal(12,2) | |

## tailor_assignments
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| tenant_id | FK → tenants | |
| order_id | FK → orders, **unique** | one active assignment per order |
| tailor_id | FK → users | |
| status | enum | assigned/in_progress/completed |
| assigned_at, started_at, completed_at | timestamps, nullable | |
| notes | nullable | |
| assigned_by | FK → users, nullable | |
| timestamps | | |

Index: `(tenant_id, tailor_id, status)`.

## payments
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| tenant_id | FK → tenants | |
| order_id | FK → orders, cascade delete | |
| amount | decimal(12,2) | |
| type | enum | advance/partial/final/refund |
| method | enum | cash/card/bank_transfer/mobile_wallet |
| paid_at | timestamp | |
| received_by | FK → users, nullable | |

## audit_logs
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| tenant_id | FK → tenants, nullable | null for cross-tenant Super Admin actions |
| user_id | FK → users, nullable | |
| action | string | created/updated/deleted/status_changed/... |
| model_type, model_id | polymorphic-style reference | |
| old_values, new_values | json nullable | |
| ip_address | string | |
| created_at | timestamp (no `updated_at`) | |

## subscriptions
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| tenant_id | FK → tenants | |
| plan | string | trial/basic/pro/enterprise |
| price | decimal(10,2) | |
| status | enum | active/past_due/cancelled/expired |
| starts_at, ends_at | timestamp | |

## notifications_log
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| tenant_id | FK → tenants | |
| customer_id | FK → customers, nullable | |
| order_id | FK → orders, nullable | |
| type | enum | order_ready / delivery_reminder / payment_reminder |
| channel | enum | email / sms |
| status | enum | pending / sent / failed |
| error_message | nullable | |
| sent_at | timestamp nullable | |

---

## Design Rationale Notes

- **Decimal, not float**, for all money columns — avoids floating-point rounding errors in financial reporting.
- **Soft deletes only on `customers`** — orders/measurements/payments are never soft-deleted; they're immutable financial/operational records (cancellation is modeled as a `status`, not a deletion).
- **`tenant_id` denormalized onto every child table** rather than only on `customers`/`orders` — keeps the mandatory tenant-scoping `WHERE` clause a single indexed lookup instead of a join, which matters once a tenant has tens of thousands of rows.
- **JSON `data` column for measurements** rather than 10+ nullable numeric columns — keeps the schema stable as new garment types (e.g. "Sherwani", "Waistcoat") are added; validated at the application layer per `type`.
