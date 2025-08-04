# Farm Animal Tracker

A Next.js web application for tracking farm animal weights and data, designed for cost-effective deployment on Azure using free and low-cost tiers.

## 🐑 Features

- **Animal Management**: Register animals with tag numbers, types, and lineage tracking
- **Weight Tracking**: Record and monitor animal weights over time
- **Feed Management**: Track feed types, amounts, and feeding schedules
- **Relationship Mapping**: Mother-offspring relationships for breeding records
- **Dark Mode**: Full light/dark theme support with user preference persistence
- **Secure Authentication**: NextAuth.js with admin credentials
- **Mobile Responsive**: Optimized for both desktop and mobile use

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.4.4** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS v4** with dark mode support
- **shadcn/ui** components
- **React Context** for theme management

### Backend & Database
- **Azure SQL Database** (Free Tier - 32GB, 5 DTU)
- **Prisma ORM** for database operations
- **Next.js API routes** for backend logic
- **NextAuth.js** for authentication

### Infrastructure & Deployment
- **Azure App Service** (F1 Free Tier)
- **Azure Storage Account** for file storage
- **Azure Key Vault** for secrets management
- **Terraform** for Infrastructure as Code
- **Docker** containerization
- **GitHub Actions** for CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Azure subscription
- SQL Server tools (sqlcmd) for database operations

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd farm-animal-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local` file:
   ```env
   # Database
   DATABASE_URL="sqlserver://your-server.database.windows.net:1433;database=your-db;user=your-user;password=your-password;encrypt=true;trustServerCertificate=false;connectionTimeout=30;"
   
   # NextAuth
   NEXTAUTH_SECRET="your-random-secret-32-chars-plus"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Admin Credentials
   ADMIN_EMAIL="your-admin@email.com"
   ADMIN_PASSWORD="your-secure-password"
   
   # Azure Storage
   AZURE_STORAGE_CONNECTION_STRING="your-storage-connection-string"
   AZURE_STORAGE_CONTAINER_NAME="animal-files"
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📊 Database Schema

The application uses the following main entities:

- **Animals**: Core animal data with tag numbers and lineage
- **Weight Records**: Time-series weight measurements
- **Feed Records**: Feed tracking with types and amounts

See `prisma/schema.prisma` for complete schema definition.

## 🏗️ Infrastructure Deployment

### Automated Database Setup
The project includes multiple database deployment strategies:

1. **Terraform Integration** (Primary)
   - Automatic table creation during `terraform apply`
   - Location: `infrastructure/sql/init_schema.sql`

2. **Post-Deployment Scripts** (Backup)
   ```bash
   # Linux/macOS
   ./scripts/deploy-database.sh
   
   # Windows
   ./scripts/deploy-database.ps1
   ```

3. **Manual Setup** (Emergency)
   ```bash
   sqlcmd -S your-server.database.windows.net -d your-database -U sqladmin -P password -i scripts/manual-db-setup.sql
   ```

### Infrastructure Components

```bash
# Deploy infrastructure
cd infrastructure/env/dev
terraform init
terraform plan
terraform apply
```

This creates:
- Azure SQL Database with automated schema deployment
- App Service with container deployment
- Key Vault with all secrets
- Storage Account for file uploads
- Proper networking and security configurations

## 🔒 Security Features

- **Secure Authentication**: NextAuth.js with credential validation
- **Environment Variables**: All secrets stored in Azure Key Vault
- **Database Security**: Encrypted connections, parameterized queries
- **CORS Configuration**: Properly configured for Azure deployment
- **Input Validation**: Server-side validation for all API endpoints

## 📱 User Interface

### Key Pages
- **Home**: Animal registration and weight recording forms
- **Dashboard**: (Planned) Animal overview and statistics
- **Authentication**: Secure admin login

### Theme Support
- Light and dark mode toggle
- Automatic theme persistence
- System preference detection
- Smooth theme transitions

## 🧪 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format with Prettier
npm run typecheck       # TypeScript validation
npm run checks          # Run all quality checks

# Database
npx prisma studio       # Open database browser
npx prisma migrate dev  # Create and apply migration
npx prisma generate     # Generate Prisma client
```

## 🌐 Deployment Pipeline

The CI/CD pipeline includes:

1. **Code Quality**: ESLint, Prettier, TypeScript checks
2. **Security Scanning**: Dependency and code analysis
3. **Docker Build**: Container image creation
4. **Infrastructure**: Terraform deployment with auto-database setup
5. **Database Migration**: Prisma sync and validation
6. **App Deployment**: Azure App Service container deployment

## 💰 Cost Optimization

Designed for Azure free tiers to minimize costs:

- **App Service**: F1 (Free) - 1GB RAM, 1GB storage
- **Azure SQL Database**: Free Tier - 32GB database, 5 DTU
- **Storage Account**: Pay-per-use (minimal cost for small files)
- **Key Vault**: ~$0.03 per 10K operations

Estimated monthly cost: **$0-5** for development, **$15-30** for production scaling.

## 📈 Future Enhancements

### Phase 2 Features
- [ ] Advanced reporting and analytics
- [ ] Weight trend visualization
- [ ] Feed efficiency calculations
- [ ] Data export functionality (CSV/PDF)

### Phase 3 Features
- [ ] Animal photo uploads
- [ ] Bulk data import
- [ ] Multi-user support
- [ ] Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical issues:
- Check the [CLAUDE.md](CLAUDE.md) file for detailed technical documentation
- Review the troubleshooting section in the documentation
- Create an issue in the GitHub repository

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database management with [Prisma](https://www.prisma.io/)
- Infrastructure managed with [Terraform](https://www.terraform.io/)
- Deployed on [Microsoft Azure](https://azure.microsoft.com/)