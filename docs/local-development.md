# Local Development Guide

This guide explains how to set up and run the Farm Animal Tracker locally with different database options.

## Table of Contents

- [Quick Start (SQLite)](#quick-start-sqlite)
- [Connect to Azure SQL Database](#connect-to-azure-sql-database)
- [Database Mocking for Tests](#database-mocking-for-tests)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)

---

## Quick Start (SQLite)

The easiest way to run the application locally is using SQLite, which requires no external database setup.

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the local environment example:

```bash
cp .env.local.example .env.local
```

The default `.env.local` file includes:

```env
# Database - SQLite for local development
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Admin Credentials (for local testing)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

### 3. Run Development Server

Use the local development script which automatically sets up the SQLite database:

```bash
npm run dev:local
```

This command will:
- Generate Prisma client for SQLite
- Create/update the SQLite database schema
- Start the Next.js development server

Access the application at: **http://localhost:3000**

**Login credentials:**
- Email: `admin@example.com`
- Password: `admin123`

### 4. (Optional) Seed Sample Data

To populate your local database with sample animals and weight records:

```bash
npm run db:seed:local
```

This will create:
- 1 sheep with 3 weight records
- 1 lamb (offspring of the sheep) with 2 weight records
- 1 goat with 2 weight records

### 5. (Optional) View Database with Prisma Studio

Open Prisma Studio to visually browse and edit your local database:

```bash
npm run db:studio:local
```

This opens a web interface at `http://localhost:5555`

---

## Connect to Azure SQL Database

To develop against your actual Azure SQL Database:

### 1. Update Environment Variables

Edit your `.env.local` file:

```env
# Database - Azure SQL Server
DATABASE_URL="Server=your-server.database.windows.net;Database=your-db;User Id=your-user;Password=your-password;Encrypt=true"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-32-chars-plus"
NEXTAUTH_URL="http://localhost:3000"

# Admin Credentials
ADMIN_EMAIL="your-admin@email.com"
ADMIN_PASSWORD="your-secure-password"
```

### 2. Generate Prisma Client (SQL Server)

```bash
npx prisma generate
```

### 3. Run Migrations

```bash
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. View Database with Prisma Studio

```bash
npm run db:studio
```

---

## Database Mocking for Tests

For unit tests, use the provided mocking utilities to avoid hitting the actual database.

### Setup Mock in Tests

```typescript
import { prismaMock, resetPrismaMock, mockAnimal } from '@/lib/prisma-mock'

// Mock the prisma module
jest.mock('@/lib/prisma')

describe('Your Test Suite', () => {
  beforeEach(() => {
    // Reset mock state between tests
    resetPrismaMock()
  })

  it('should find an animal', async () => {
    // Setup mock response
    prismaMock.animal.findUnique.mockResolvedValue(mockAnimal)

    // Your test code here
    const animal = await prismaMock.animal.findUnique({
      where: { id: 1 }
    })

    expect(animal).toEqual(mockAnimal)
  })
})
```

### Available Mock Helpers

```typescript
// Pre-configured mock data
import {
  mockAnimal,
  mockWeightRecord,
  mockFeedRecord,
  createMockAnimalWithWeights
} from '@/lib/prisma-mock'

// Create mock animal with multiple weights
const animalWithHistory = createMockAnimalWithWeights(
  { tagNumber: 'TEST001' },
  5 // Number of weight records
)
```

### Example: Testing API Routes

```typescript
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/animals/route'
import { prismaMock, mockAnimal } from '@/lib/prisma-mock'

jest.mock('@/lib/prisma')
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => ({
    user: { id: '1', email: 'test@example.com' }
  }))
}))

describe('/api/animals POST', () => {
  it('should create a new animal', async () => {
    // Mock database create
    prismaMock.animal.create.mockResolvedValue(mockAnimal)

    // Create mock request
    const { req } = createMocks({
      method: 'POST',
      body: {
        tagNumber: 'TEST001',
        type: 'SHEEP',
        initialWeight: 45.5
      }
    })

    // Call API route
    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.animal).toEqual(mockAnimal)
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (requires Azure SQL or existing DB) |
| `npm run dev:local` | Start dev server with SQLite (auto-setup) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |

### Database Management

| Command | Description |
|---------|-------------|
| `npm run db:setup:local` | Setup SQLite database |
| `npm run db:seed:local` | Seed SQLite with sample data |
| `npm run db:studio:local` | Open Prisma Studio (SQLite) |
| `npm run db:studio` | Open Prisma Studio (SQL Server) |
| `npm run db:migrate` | Run database migrations |
| `npm run db:migrate:deploy` | Deploy migrations to production |

### Testing & Quality

| Command | Description |
|---------|-------------|
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ci` | Run tests for CI/CD |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run checks` | Run all quality checks |

---

## Troubleshooting

### SQLite Issues

**Problem:** "Database file not found"
```bash
# Solution: Re-run database setup
npm run db:setup:local
```

**Problem:** "Schema doesn't match"
```bash
# Solution: Reset database
rm prisma/dev.db
npm run db:setup:local
npm run db:seed:local
```

### Azure SQL Connection Issues

**Problem:** "Cannot connect to database"
- Verify your `DATABASE_URL` connection string
- Check firewall rules in Azure Portal
- Ensure your IP is whitelisted

**Problem:** "Authentication failed"
- Double-check username and password in connection string
- Verify the user has proper permissions

### Prisma Client Issues

**Problem:** "Prisma Client not generated"
```bash
# For SQLite
npx prisma generate --schema=prisma/schema.local.prisma

# For SQL Server
npx prisma generate
```

**Problem:** "Type errors after schema changes"
```bash
# Regenerate Prisma Client
npm run db:setup:local  # For SQLite
# or
npx prisma generate     # For SQL Server
```

### Test Mocking Issues

**Problem:** "Mock not working in tests"
- Ensure `jest.mock('@/lib/prisma')` is at the top of your test file
- Call `resetPrismaMock()` in `beforeEach()`
- Check that the mock file exists: `src/lib/__mocks__/prisma.ts`

---

## Database Schema Comparison

| Feature | SQLite (Local) | SQL Server (Azure) |
|---------|---------------|-------------------|
| Setup | Instant | Requires Azure account |
| Cost | Free | Free tier available |
| Performance | Good for dev | Production-ready |
| Migrations | Push only | Full migration support |
| Decimal Type | Float | Decimal(5,2) |
| Best For | Local development & testing | Production deployment |

---

## Next Steps

- ✅ Set up your local environment
- ✅ Create your first animal
- ✅ Record some weights
- ✅ Explore the API routes
- 📚 Check out [Phase 2 Features](../CLAUDE.md) for advanced functionality
- 🚀 Deploy to Azure (see deployment docs)

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Jest Mocking Guide](https://jestjs.io/docs/mock-functions)
