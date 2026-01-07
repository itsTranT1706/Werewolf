#!/bin/sh
set -e

echo "🔄 Checking database connection..."

# Wait for PostgreSQL to be ready
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo "⏳ Waiting for database to be ready..."
  sleep 2
done

echo "✅ Database is ready"

# Check if user_profile table exists
TABLE_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME" -tAc \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profile';")

if [ "$TABLE_EXISTS" = "0" ]; then
  echo "🔨 Tables not found. Initializing database schema..."
  
  # Check if schema.sql exists in the image
  if [ -f "/app/db/schema.sql" ]; then
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME" -f /app/db/schema.sql
    echo "✅ Database schema initialized"
  else
    echo "⚠️  Warning: schema.sql not found at /app/db/schema.sql"
  fi
else
  echo "✅ Database schema already exists"
fi

echo "🚀 Starting Profile Service..."
exec java $JAVA_OPTS -jar app.jar

