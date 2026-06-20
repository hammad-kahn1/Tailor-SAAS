#!/bin/sh
set -e

echo "─────────────────────────────────────────────────────"
echo "  TailorSaaS Backend — Container Startup"
echo "─────────────────────────────────────────────────────"

cd /var/www/html

# ── 1. Wait for MySQL to be ready ────────────────────────
echo "⏳ Waiting for database..."
until php artisan db:monitor --max=10 2>/dev/null; do
  echo "   Database not ready, retrying in 3s..."
  sleep 3
done
echo "✅ Database is up."

# ── 2. Generate app key if missing ───────────────────────
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
  echo "🔑 Generating APP_KEY..."
  php artisan key:generate --force
fi

# ── 3. Run migrations ────────────────────────────────────
echo "🔄 Running migrations..."
php artisan migrate --force

# ── 4. Seed demo data if flag is set ─────────────────────
if [ "${SEED_DEMO_DATA}" = "true" ]; then
  echo "🌱 Seeding demo data..."
  php artisan db:seed --force
fi

# ── 5. Cache config for performance ──────────────────────
if [ "${APP_ENV}" = "production" ]; then
  echo "⚡ Caching for production..."
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
fi

# ── 6. Storage link ──────────────────────────────────────
php artisan storage:link --force 2>/dev/null || true

echo "─────────────────────────────────────────────────────"
echo "  ✅ Startup complete. Starting PHP-FPM..."
echo "─────────────────────────────────────────────────────"

exec "$@"
