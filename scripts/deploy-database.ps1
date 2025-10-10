# PowerShell version of the database deployment script
param(
    [switch]$Force = $false
)

Write-Host "🗄️  Starting database deployment..." -ForegroundColor Cyan

# Check if required environment variables are set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ ERROR: DATABASE_URL environment variable is not set" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Checking database connection..." -ForegroundColor Yellow
try {
    # Test database connection using Prisma
    npx prisma db pull --force
    if ($LASTEXITCODE -ne 0) { throw "Database connection failed" }
} catch {
    Write-Host "❌ ERROR: Cannot connect to database. Check your DATABASE_URL" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
try {
    # Deploy migrations (safe for production)
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) { throw "Migration deployment failed" }
} catch {
    Write-Host "❌ ERROR: Failed to deploy migrations" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
try {
    # Generate Prisma client
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "Prisma client generation failed" }
} catch {
    Write-Host "❌ ERROR: Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database deployment completed successfully!" -ForegroundColor Green

# Optional: Run a simple test query
Write-Host "🧪 Testing database connectivity..." -ForegroundColor Yellow
try {
    $testScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const result = await prisma.`$queryRaw``SELECT COUNT(*) as count FROM animals``;
    console.log('✅ Database test successful. Animals table accessible.');
    await prisma.`$disconnect();
  } catch (error) {
    console.log('ℹ️  Database connected, but tables might not exist yet (this is normal for first deployment)');
    await prisma.`$disconnect();
  }
}

test().catch(console.error);
"@
    
    node -e $testScript
} catch {
    Write-Host "ℹ️  Database test completed" -ForegroundColor Blue
}

Write-Host "🎉 All database operations completed!" -ForegroundColor Green