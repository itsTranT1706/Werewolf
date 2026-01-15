#!/bin/sh
set -e

echo "🔄 Checking database connection (pg_isready)..."

# Wait for Postgres to accept connections (REAL readiness)
until pg_isready -h database -p 5432 -U postgres > /dev/null 2>&1
do
  echo "⏳ Waiting for Postgres to accept connections..."
  sleep 2
done

echo "✅ Postgres is accepting connections"

echo "🔄 Verifying Prisma connectivity..."

# Extra safety: wait until Prisma can open a real connection
until npx prisma db execute --stdin <<EOF > /dev/null 2>&1
SELECT 1;
EOF
do
  echo "⏳ Waiting for Prisma to connect..."
  sleep 2
done

echo "✅ Prisma connection verified"

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
