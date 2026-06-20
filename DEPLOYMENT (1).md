# Deployment Guide

## 1. Prerequisites

- Docker Engine 24+ and Docker Compose v2
- A domain (or subdomain) pointed at your server, e.g. `app.yourtailorshop.com` and `api.yourtailorshop.com`
- (Production) a TLS terminator in front of the stack — e.g. Caddy, Traefik, or a managed load balancer — since the bundled `nginx` services serve plain HTTP internally

## 2. Local / Development Setup

```bash
git clone <your-repo-url> tailor-saas && cd tailor-saas

# Root-level compose variables
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env: set a strong DB_PASSWORD, mail credentials, CORS_ALLOWED_ORIGINS, etc.

# First boot — seed demo data so you can log in immediately
SEED_DEMO_DATA=true docker compose up --build
```

This brings up: `mysql`, `redis`, `mailhog`, `backend` (PHP-FPM), `queue-worker`, `scheduler`, `nginx-api`, `frontend`.

- Frontend (SPA): **http://localhost:5173**
- API: **http://localhost:8000/api/v1**
- MailHog (view sent emails in dev): **http://localhost:8025**

On first boot, `backend/docker/entrypoint.sh` automatically: waits for MySQL, copies `.env` if missing, generates `APP_KEY`, runs migrations, links storage, and (if `SEED_DEMO_DATA=true`) seeds the demo tenant. Demo logins are printed in the `backend` container logs:

```bash
docker compose logs backend | grep -A 10 "Demo tenant seeded"
```

For subsequent boots, **omit** `SEED_DEMO_DATA=true` (or set it to `false`) — re-seeding is not idempotent for IDs and is meant for first-run/demo environments only.

## 3. Production Checklist

1. **Secrets**: never commit `.env` files. Use your platform's secret manager (Docker Swarm secrets, Kubernetes Secrets, AWS Secrets Manager, etc.) to inject `DB_PASSWORD`, `APP_KEY`, mail/SMS credentials.
2. **APP_DEBUG=false** and **APP_ENV=production** always in production.
3. **HTTPS**: terminate TLS in front of `nginx-api` and `frontend` (e.g. via a reverse proxy/load balancer with Let's Encrypt). Set `APP_FORCE_HTTPS=true` and `SESSION_SECURE_COOKIE=true`.
4. **CORS_ALLOWED_ORIGINS**: restrict to your real frontend domain(s) — never `*` in production.
5. **Database backups**: schedule `mysqldump` (or your cloud provider's managed MySQL backups) at least daily; this is a financial system (payments/orders) — test restore procedures, not just backup creation.
6. **Horizontal scaling**: `backend` (PHP-FPM) and `queue-worker` are stateless and can be scaled to multiple replicas behind a load balancer; `mysql` and `redis` should be managed/clustered services in production rather than the single containers in this compose file.
7. **Queue worker supervision**: in production, prefer `supervisord` or your orchestrator's restart policy (`restart: unless-stopped` is already set) over the simple long-running container shown here, and consider Laravel Horizon for queue observability at scale.
8. **Scheduler**: the `scheduler` service polls `php artisan schedule:run` every 60s — equivalent to a cron entry. In Kubernetes, prefer a `CronJob` instead of a long-running pod.
9. **File storage**: `storage/app/public` is a local Docker volume here (`backend_storage`). For multi-replica deployments, switch `FILESYSTEM_DISK` to S3-compatible storage (Laravel's `s3` driver) so all replicas share the same files (shop logos, etc.).
10. **Monitoring**: ship `storage/logs/laravel.log` to a log aggregator (or switch `LOG_CHANNEL` to a Monolog handler that pushes to one), and add uptime checks on `/up` (Laravel 11's built-in health endpoint, wired in `bootstrap/app.php`).
11. **Rate limiting**: the API ships with Laravel's default API throttle; tighten the `login` endpoint specifically (e.g. `throttle:6,1`) to slow credential-stuffing attempts.
12. **Migrations on deploy**: run `php artisan migrate --force` as a release step (the `entrypoint.sh` does this automatically on container start, which is fine for single-instance deploys; for multi-replica rolling deploys, run migrations as a separate one-off job *before* rolling out new backend replicas, to avoid two versions racing on schema changes).

## 4. Updating / Re-deploying

```bash
git pull
docker compose build backend frontend
docker compose up -d
docker compose exec backend php artisan migrate --force
```

## 5. Useful Commands

```bash
# Tail backend logs
docker compose logs -f backend

# Open a shell in the backend container
docker compose exec backend sh

# Run artisan commands
docker compose exec backend php artisan tinker
docker compose exec backend php artisan queue:work --once

# Re-seed demo data into a fresh database (destructive)
docker compose exec backend php artisan migrate:fresh --seed
```

## 6. Scaling to "real" multi-region / high-tenant-count SaaS

This deliverable's `tenant_id` row-isolation model comfortably handles hundreds to low-thousands of tenants on a single MySQL instance. If you outgrow that:

- Move large/heavy tenants to dedicated database connections (Laravel supports multiple DB connections; you'd extend `ResolveTenant` to also pick a connection, not just a `tenant_id` filter) — a hybrid model, without rewriting the application layer.
- Read replicas for reporting queries (`ReportService`) so heavy report generation doesn't compete with transactional order-taking traffic.
- Consider a managed queue (SQS, Cloud Tasks) in place of Redis-backed queues once notification volume grows.
