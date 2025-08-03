# Farm Animal Tracker - Claude Code Requirements

## Project Overview
A Next.js web application for tracking farm animal weights and data, designed for minimal Azure hosting costs using free/low-cost tiers.

## Core Functionality
- Input animal tag number and weight
- Auto-capture current date/time
- Store data with relationships for future reporting
- Support for animal lineage tracking (mother-lamb relationships)
- Feed tracking and weight correlation analysis

## Technology Stack

### Frontend
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (recommended for forms and data display)
- **Authentication**: NextAuth.js (not Azure AD)

### Backend & Database
- **Database**: Azure SQL Database (Free Tier - 32GB, 5 DTU)
- **ORM**: Prisma
- **API**: Next.js API routes
- **File Storage**: Azure Storage Account (Blob storage for future file uploads)

### Deployment & Infrastructure
- **Hosting**: Azure App Service (F1 Free Tier)
- **Containerization**: Docker (see existing Dockerfile)
- **IaC**: Terraform (existing modules need modification)
- **CI/CD**: GitHub Actions (existing workflows)

## Code Quality & Standards

### ESLint Configuration
Use existing `eslint.config.mjs` with:
- TypeScript ESLint rules
- React/React Hooks rules
- Next.js specific rules
- Import ordering enforcement
- Accessibility rules (jsx-a11y)

### Prettier Configuration
Use existing `.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "jsxSingleQuote": true,
  "trailingComma": "none",
  "endOfLine": "lf"
}
```

### Additional Code Quality
- **SonarQube IDE**: Free VSCode extension for code analysis
- **Husky**: Pre-commit hooks for linting and formatting (already configured)
- **TypeScript**: Strict type checking enabled

## Database Schema Requirements

### Core Entities
```prisma
model Animal {
  id          Int      @id @default(autoincrement())
  tagNumber   String   @unique
  type        AnimalType
  motherId    Int?     // Self-referential for lineage
  birthDate   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  mother      Animal?  @relation("AnimalLineage", fields: [motherId], references: [id])
  offspring   Animal[] @relation("AnimalLineage")
  weights     WeightRecord[]
  feedRecords FeedRecord[]
}

model WeightRecord {
  id          Int      @id @default(autoincrement())
  animalId    Int
  weight      Decimal  @db.Decimal(5,2)
  recordedAt  DateTime @default(now())
  notes       String?
  
  animal      Animal   @relation(fields: [animalId], references: [id])
}

model FeedRecord {
  id          Int      @id @default(autoincrement())
  animalId    Int
  feedType    String
  amount      Decimal  @db.Decimal(5,2)
  feedDate    DateTime
  
  animal      Animal   @relation(fields: [animalId], references: [id])
}

enum AnimalType {
  SHEEP
  LAMB
  GOAT
  CATTLE
  PIG
}
```

## Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL="Server=your-server.database.windows.net;Database=your-db;User Id=your-user;Password=your-password;Encrypt=true"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-32-chars-plus"
NEXTAUTH_URL="http://localhost:3000" # Update for production

# Azure Storage (for future file uploads)
AZURE_STORAGE_CONNECTION_STRING="your-storage-connection-string"
AZURE_STORAGE_CONTAINER_NAME="animal-files"
```

## Infrastructure Requirements

### Terraform Modifications Needed
1. **Remove Azure AD components** - use NextAuth instead
2. **Add Azure SQL Database** (Free Tier configuration)
3. **Keep Azure Storage Account** for file storage
4. **Update App Service** configuration for container deployment
5. **Modify Key Vault** to store database credentials and NextAuth secrets

### Azure Resources (Cost Optimization)
- **App Service**: F1 (Free) - 1GB RAM, 1GB storage
- **Azure SQL Database**: Free Tier - 32GB database
- **Storage Account**: Pay-per-use (minimal cost for small files)
- **Key Vault**: $0.03 per 10K operations (minimal usage cost)

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

### Code Quality Checks
```bash
# Run all checks (already configured in package.json)
npm run checks

# Individual commands
npm run lint
npm run format:check
npx tsc --noEmit
```

### Docker Development
```bash
# Build and run locally
docker build -t farm-tracker .
docker run -p 3000:8080 farm-tracker
```

## Key Features to Implement

### Phase 1 (MVP)
- [ ] Animal registration form (tag number, type, initial weight)
- [ ] Weight recording form
- [ ] Basic animal listing/search
- [ ] Simple weight history view
- [ ] NextAuth authentication setup
- [ ] Mobile-responsive design optimization

### Phase 2 (Relationships & Reporting)
- [ ] Mother-offspring relationship management
- [ ] Feed tracking forms
- [ ] Weight trend charts
- [ ] Feed efficiency reports
- [ ] Export functionality (CSV)

### Phase 3 (Advanced Features)
- [ ] File upload for animal photos
- [ ] Bulk data import (CSV)
- [ ] Advanced reporting dashboard

## Performance Considerations

### Free Tier Limitations
- **App Service F1**: Shared compute, 60 CPU minutes/day limit
- **SQL Database Free**: 5 DTU shared performance
- **Optimization**: Implement efficient queries, proper indexing, caching where possible

### Scaling Path
- App Service: F1 → B1 ($13/month) for dedicated compute
- SQL Database: Free → Basic ($5/month) → Standard ($15+/month)
- Monitor usage and scale components individually as needed

## Security Requirements

- **Authentication**: NextAuth with secure session management
- **Database**: Encrypted connections, stored credentials in Key Vault
- **API**: Input validation and sanitization
- **CORS**: Properly configured for Azure hosting
- **Environment**: Separate dev/prod configurations

## Deployment Pipeline

Use existing GitHub Actions with modifications:
1. **Lint & Test**: ESLint, Prettier, TypeScript checks
2. **Security Scan**: Dependency scanning, CodeQL
3. **Build**: Docker image creation
4. **Deploy**: Azure App Service deployment
5. **Infrastructure**: Terraform apply for infrastructure changes

## Success Criteria

- [ ] Application runs on Azure free tiers
- [ ] Database supports animal relationships and reporting
- [ ] Code meets all ESLint/Prettier/SonarQube standards
- [ ] Terraform infrastructure is maintainable and documented
- [ ] CI/CD pipeline deploys successfully
- [ ] Application is responsive and user-friendly
