# Entity Relationship Diagram

```mermaid
erDiagram
    TENANTS ||--o{ USERS : employs
    TENANTS ||--o{ CUSTOMERS : owns
    TENANTS ||--o{ ORDERS : owns
    TENANTS ||--o{ AUDIT_LOGS : logs
    TENANTS ||--|| SUBSCRIPTIONS : has
    TENANTS ||--o{ NOTIFICATIONS : sends

    CUSTOMERS ||--o{ MEASUREMENTS : has
    CUSTOMERS ||--o{ ORDERS : places

    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o| MEASUREMENTS : "snapshot of"
    ORDERS ||--o{ PAYMENTS : receives
    ORDERS ||--o| TAILOR_ASSIGNMENTS : "assigned via"
    ORDERS ||--o{ NOTIFICATIONS : triggers

    USERS ||--o{ TAILOR_ASSIGNMENTS : "assigned (as tailor)"
    USERS ||--o{ ORDERS : creates
    USERS ||--o{ AUDIT_LOGS : performs
    USERS ||--o{ MEASUREMENTS : "recorded by"

    TENANTS {
        bigint id PK
        string name
        string slug UK
        string email
        string phone
        string address
        string logo_path
        string subscription_plan
        string subscription_status
        timestamp trial_ends_at
        timestamps created_at_updated_at
    }

    USERS {
        bigint id PK
        bigint tenant_id FK "nullable for super_admin"
        string name
        string email UK
        string password
        enum role "super_admin|shop_owner|manager|tailor|receptionist"
        string phone
        boolean is_active
        timestamp email_verified_at
    }

    CUSTOMERS {
        bigint id PK
        bigint tenant_id FK
        string full_name
        string phone
        text address
        enum gender "male|female|other"
        text notes
        timestamp deleted_at "soft delete"
    }

    MEASUREMENTS {
        bigint id PK
        bigint tenant_id FK
        bigint customer_id FK
        enum type "shirt|pant|suit"
        int version
        json data "flexible field set per type"
        bigint recorded_by FK "users.id"
        timestamps created_at_updated_at
    }

    ORDERS {
        bigint id PK
        bigint tenant_id FK
        string order_number UK
        bigint customer_id FK
        bigint measurement_id FK "nullable"
        enum status "pending|assigned|in_progress|ready|delivered|cancelled"
        decimal total_price
        decimal advance_payment
        decimal remaining_payment
        date delivery_date
        text notes
        bigint created_by FK "users.id"
    }

    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        string item_name
        int quantity
        decimal unit_price
        decimal subtotal
    }

    TAILOR_ASSIGNMENTS {
        bigint id PK
        bigint order_id FK UK "one active assignment per order"
        bigint tailor_id FK "users.id"
        enum status "assigned|in_progress|completed"
        timestamp assigned_at
        timestamp started_at
        timestamp completed_at
        text notes
    }

    PAYMENTS {
        bigint id PK
        bigint order_id FK
        decimal amount
        enum type "advance|partial|final|refund"
        enum method "cash|card|bank_transfer|mobile_wallet"
        timestamp paid_at
        bigint received_by FK "users.id"
    }

    AUDIT_LOGS {
        bigint id PK
        bigint tenant_id FK "nullable for super-admin actions"
        bigint user_id FK
        string action
        string model_type
        bigint model_id
        json old_values
        json new_values
        string ip_address
        timestamp created_at
    }

    SUBSCRIPTIONS {
        bigint id PK
        bigint tenant_id FK
        string plan "trial|basic|pro|enterprise"
        decimal price
        enum status "active|past_due|cancelled|expired"
        timestamp starts_at
        timestamp ends_at
    }

    NOTIFICATIONS {
        bigint id PK
        bigint tenant_id FK
        bigint customer_id FK "nullable"
        bigint order_id FK "nullable"
        enum type "order_ready|delivery_reminder|payment_reminder"
        enum channel "email|sms"
        enum status "pending|sent|failed"
        timestamp sent_at
    }
```

## Key Relationship Notes

- **tenant_id propagation**: Every tenant-owned table carries `tenant_id` directly (denormalized from `customers`/`orders`) rather than only inferring it via joins. This keeps the global scope a single indexed `WHERE` clause and avoids N-join queries — critical for performance at scale.
- **Measurements versioning**: `measurements` are never updated in place. A new row with `version = previous + 1` is inserted for the same `customer_id + type`. The "current" measurement is the highest version. `orders.measurement_id` stores a snapshot reference so historical orders always show the measurement *as it was* at order time, even if the customer is re-measured later.
- **One active assignment per order**: enforced via unique constraint on `tailor_assignments.order_id` (re-assignment updates the row rather than creating duplicates, with history captured in `audit_logs`).
