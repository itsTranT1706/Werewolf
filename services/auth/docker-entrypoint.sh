#!/bin/sh
set -e

echo "🔄 Checking database connection..."

# Wait for database to be ready
until npx prisma db execute --stdin <<EOF 2>/dev/null
SELECT 1;
EOF
do
  echo "⏳ Waiting for database to be ready..."
  sleep 2
done

echo "✅ Database is ready"

# Check if the users table exists
TABLE_EXISTS=$(npx prisma db execute --stdin <<EOF | grep -c "users" || true
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users';
EOF
)

if [ "$TABLE_EXISTS" -eq "0" ]; then
  echo "🔨 Users table not found. Initializing database schema..."
  npx prisma db push --skip-generate --accept-data-loss
  echo "✅ Database schema initialized"
else
  echo "✅ Database schema already exists"
fi

# Run migrations if any exist
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
  echo "🔄 Running migrations..."
  npx prisma migrate deploy
  echo "✅ Migrations completed"
fi

echo "🚀 Starting Auth Service..."
exec node src/index.js

