# Installation Guide - Project Nyra

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Docker Desktop**: Latest version (recommended)
- **Git**: For version control

Verify installations:
\`\`\`bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
docker --version
\`\`\`

## Installation Steps

### Step 1: Navigate to Project Directory

\`\`\`bash
cd C:\\Users\\edane\\project-nyra
\`\`\`

### Step 2: Install Dependencies

Install all packages for the monorepo:

\`\`\`bash
npm install
\`\`\`

This will install dependencies for:
- Root workspace
- Frontend (ratehunter-web)
- Backend (ratehunter-api)
- Shared packages

### Step 3: Configure Environment Variables

#### Frontend Configuration

\`\`\`bash
# Copy example file
copy apps\\ratehunter-web\\.env.example apps\\ratehunter-web\\.env.local

# Edit the file and set:
# NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

#### Backend Configuration

\`\`\`bash
# Copy example file
copy apps\\ratehunter-api\\.env.example apps\\ratehunter-api\\.env

# Edit and configure:
# Database settings
# Redis settings
# JWT secret
# CORS origin
\`\`\`

**Important Environment Variables:**

\`\`\`env
# apps/ratehunter-api/.env

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=ratehunter_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=3001
CORS_ORIGIN=http://localhost:3000
\`\`\`

### Step 4: Choose Development Method

#### Option A: Docker (Recommended for Full Stack)

Start all services with Docker:

\`\`\`bash
docker-compose up
\`\`\`

This starts:
- PostgreSQL database on port 5432
- Redis on port 6379
- Backend API on port 3001
- Frontend web on port 3000

**First time setup with Docker:**
\`\`\`bash
# Start services
docker-compose up -d

# Run migrations (in separate terminal)
docker-compose exec api npm run migration:run

# Seed database
docker-compose exec api npm run seed
\`\`\`

#### Option B: Local Development (Separate Services)

**1. Start Database Services:**
\`\`\`bash
docker-compose up -d postgres redis
\`\`\`

**2. Run Database Setup:**
\`\`\`bash
cd apps/ratehunter-api
npm run migration:run
npm run seed
cd ../..
\`\`\`

**3. Start Development Servers:**

In one terminal (Backend):
\`\`\`bash
cd apps/ratehunter-api
npm run dev
\`\`\`

In another terminal (Frontend):
\`\`\`bash
cd apps/ratehunter-web
npm run dev
\`\`\`

Or from root with Turbo:
\`\`\`bash
npm run dev
\`\`\`

### Step 5: Verify Installation

#### Check Services

1. **Frontend**: http://localhost:3000
   - Should show RateHunter.net landing page
   - Test lead capture form
   - Try mortgage calculators

2. **Backend API**: http://localhost:3001/api
   - Test endpoint: http://localhost:3001/api/rates

3. **Database**:
   \`\`\`bash
   docker-compose exec postgres psql -U postgres -d ratehunter_dev -c "\\dt"
   \`\`\`
   Should show tables: leads, rates, contacts

#### Test API Endpoints

\`\`\`bash
# Test rates endpoint
curl http://localhost:3001/api/rates

# Test lead creation
curl -X POST http://localhost:3001/api/leads \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"firstName\\": \\"Test\\",
    \\"lastName\\": \\"User\\",
    \\"email\\": \\"test@example.com\\",
    \\"phone\\": \\"5555551234\\",
    \\"loanType\\": \\"purchase\\",
    \\"propertyValue\\": \\"500000\\",
    \\"creditScore\\": \\"excellent\\"
  }"
\`\`\`

## Development Workflow

### Available Commands

#### Root Level
\`\`\`bash
npm run dev           # Start all dev servers
npm run build         # Build all apps
npm run test          # Run all tests
npm run lint          # Lint all code
npm run typecheck     # Type check all apps
npm run clean         # Clean build artifacts
\`\`\`

#### Docker Commands
\`\`\`bash
docker-compose up              # Start all services
docker-compose up -d           # Start in background
docker-compose down            # Stop services
docker-compose logs -f         # View logs
docker-compose ps              # Check status
docker-compose restart api     # Restart specific service
\`\`\`

#### Database Commands
\`\`\`bash
npm run db:migrate             # Run migrations
npm run db:seed                # Seed data
\`\`\`

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Changes to React components reload automatically
- Backend: Changes to NestJS code restart the server automatically

### Debugging

#### Frontend (Next.js)
- Use browser DevTools
- React DevTools extension
- Check console for errors

#### Backend (NestJS)
- Check terminal output
- API returns detailed error messages
- Check database connection

\`\`\`bash
# View backend logs
docker-compose logs -f api

# View database logs
docker-compose logs -f postgres
\`\`\`

## Testing

### Run Tests

\`\`\`bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests (requires Playwright)
npm run test:e2e
\`\`\`

### Install Playwright (for E2E tests)

\`\`\`bash
cd apps/ratehunter-web
npx playwright install
\`\`\`

## Building for Production

### Build All Applications

\`\`\`bash
npm run build
\`\`\`

### Test Production Build

\`\`\`bash
# Frontend
cd apps/ratehunter-web
npm run build
npm run start

# Backend
cd apps/ratehunter-api
npm run build
npm run start:prod
\`\`\`

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

\`\`\`bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use kill-port
npx kill-port 3000 3001
\`\`\`

#### 2. Database Connection Failed

- Verify PostgreSQL is running: \`docker-compose ps\`
- Check connection string in \`.env\`
- Test connection:
  \`\`\`bash
  docker-compose exec postgres psql -U postgres
  \`\`\`

#### 3. Redis Connection Failed

- Verify Redis is running: \`docker-compose ps\`
- Test connection:
  \`\`\`bash
  docker-compose exec redis redis-cli ping
  \`\`\`

#### 4. Module Not Found

\`\`\`bash
# Clear and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf apps/*/.next
rm -rf apps/*/dist
npm install
\`\`\`

#### 5. Database Migrations Failed

\`\`\`bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
npm run db:migrate
npm run db:seed
\`\`\`

#### 6. TypeScript Errors

\`\`\`bash
# Clean TypeScript cache
npx tsc --build --clean
npm run typecheck
\`\`\`

### Getting Help

If you encounter issues:

1. Check logs: \`docker-compose logs -f\`
2. Verify environment variables
3. Ensure all services are running: \`docker-compose ps\`
4. Check Node.js version: \`node --version\`
5. Clear cache and reinstall dependencies

## Next Steps

After installation:

1. Review the code structure in \`docs/README.md\`
2. Read API documentation for endpoint details
3. Test all features manually
4. Configure production environment
5. Set up deployment pipeline

## Maintenance

### Update Dependencies

\`\`\`bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm update <package-name>
\`\`\`

### Database Backup

\`\`\`bash
# Backup
docker-compose exec postgres pg_dump -U postgres ratehunter_dev > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres ratehunter_dev < backup.sql
\`\`\`

### Clean Docker

\`\`\`bash
# Remove volumes (WARNING: Deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Full cleanup
docker system prune -a
\`\`\`

## Success Indicators

Installation is successful when:
- ✅ Frontend loads at http://localhost:3000
- ✅ API responds at http://localhost:3001/api/rates
- ✅ Lead form submission works
- ✅ Calculators perform calculations
- ✅ No console errors
- ✅ Database tables exist
- ✅ Tests pass: \`npm test\`

---

**Installation Complete!** The application is ready for development and testing.
