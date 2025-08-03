#!/bin/sh

# Wait for postgres to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Run Prisma seeding (optional, remove if you don't want to seed on every startup)
echo "Running Prisma seed..."
npx prisma db seed || echo "Seeding failed or no seed data available"

# Start the Next.js application
echo "Starting Next.js application..."
exec node server.js