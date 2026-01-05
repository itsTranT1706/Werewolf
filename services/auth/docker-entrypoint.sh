#!/bin/sh
set -e

echo "🔄 Waiting for database..."

# Wait for database to be ready using netcat
until nc -z database 5432; do
  echo "⏳ Waiting for PostgreSQL..."
  sleep 2
done

echo "✅ Database is ready"

# Push schema to database (creates tables if not exist)
echo "🔨 Pushing Prisma schema to database..."
npx prisma db push --skip-generate --accept-data-loss

echo "✅ Database schema synchronized"

echo "🚀 Starting Auth Service..."
exec node src/index.js

