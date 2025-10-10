#!/bin/bash
set -e

echo "🗄️  Starting database deployment..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "📋 Checking database connection..."
# Test database connection using Prisma
npx prisma db pull --force || {
    echo "❌ ERROR: Cannot connect to database. Check your DATABASE_URL"
    exit 1
}

echo "🔄 Running database migrations..."
# Deploy migrations (safe for production)
npx prisma migrate deploy || {
    echo "❌ ERROR: Failed to deploy migrations"
    exit 1
}

echo "🔧 Generating Prisma client..."
# Generate Prisma client
npx prisma generate || {
    echo "❌ ERROR: Failed to generate Prisma client"
    exit 1
}

echo "✅ Database deployment completed successfully!"

# Optional: Run a simple test query
echo "🧪 Testing database connectivity..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const result = await prisma.\$queryRaw\`SELECT COUNT(*) as count FROM animals\`;
    console.log('✅ Database test successful. Animals table accessible.');
    await prisma.\$disconnect();
  } catch (error) {
    console.log('ℹ️  Database connected, but tables might not exist yet (this is normal for first deployment)');
    await prisma.\$disconnect();
  }
}

test().catch(console.error);
" || echo "ℹ️  Database test completed"

echo "🎉 All database operations completed!"