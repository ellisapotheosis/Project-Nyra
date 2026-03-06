# Project Nyra - RateHunter.net

AI-powered mortgage rate comparison and lead generation platform.

## Overview

Project Nyra consists of two primary applications:

### 1. RateHunter.net (Priority 1 - IMPLEMENTED)
Mortgage rate comparison landing page with lead capture and calculators.

**Features:**
- Hero section with live mortgage rates
- Lead capture form with validation
- Mortgage payment calculator
- Affordability calculator
- Customer testimonials
- Contact form
- Responsive design with Tailwind CSS

### 2. LenderBridge.ai (Future Phase)
AI-powered loan management system for lenders.

## Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State**: TanStack Query (React Query)
- **Animation**: Framer Motion

### Backend (NestJS)
- **Framework**: NestJS 10
- **Database**: PostgreSQL 16 + TypeORM
- **Cache**: Redis 7
- **Authentication**: JWT + Passport
- **Rate Limiting**: @nestjs/throttler
- **Security**: Helmet middleware

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monorepo**: Turborepo

## Project Structure

\`\`\`
project-nyra/
├── apps/
│   ├── ratehunter-web/          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/             # Next.js app directory
│   │   │   ├── components/      # React components
│   │   │   │   ├── ui/          # shadcn/ui components
│   │   │   │   ├── forms/       # Form components
│   │   │   │   └── sections/    # Page sections
│   │   │   ├── lib/             # Utilities and API clients
│   │   │   └── types/           # TypeScript types
│   │   └── package.json
│   │
│   └── ratehunter-api/          # NestJS backend
│       ├── src/
│       │   ├── modules/         # Feature modules
│       │   │   ├── leads/       # Lead management
│       │   │   ├── rates/       # Rate data
│       │   │   ├── calculator/  # Mortgage calculators
│       │   │   ├── contact/     # Contact form
│       │   │   └── auth/        # Authentication
│       │   ├── database/        # Database layer
│       │   │   ├── entities/    # TypeORM entities
│       │   │   ├── migrations/  # Database migrations
│       │   │   └── seeds/       # Seed data
│       │   ├── common/          # Shared resources
│       │   ├── config/          # Configuration
│       │   └── main.ts          # Application entry
│       └── package.json
│
├── packages/
│   ├── shared/                  # Shared utilities
│   └── ui/                      # Shared UI components
│
├── docker/                      # Docker configurations
├── docs/                        # Documentation
├── .github/workflows/           # CI/CD workflows
├── docker-compose.yml
├── turbo.json
└── package.json
\`\`\`

## Getting Started

### Prerequisites
- Node.js 18+
- Docker Desktop
- npm 9+

### Development Setup

1. **Clone and install dependencies:**
\`\`\`bash
git clone <repository-url>
cd project-nyra
npm install
\`\`\`

2. **Start infrastructure services:**
\`\`\`bash
docker-compose up -d postgres redis
\`\`\`

3. **Setup environment variables:**
\`\`\`bash
# Frontend
cp apps/ratehunter-web/.env.example apps/ratehunter-web/.env.local

# Backend
cp apps/ratehunter-api/.env.example apps/ratehunter-api/.env
\`\`\`

4. **Run database migrations:**
\`\`\`bash
npm run db:migrate
npm run db:seed
\`\`\`

5. **Start development servers:**
\`\`\`bash
npm run dev
\`\`\`

The applications will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

### Using Docker

Run entire stack with Docker:
\`\`\`bash
docker-compose up
\`\`\`

## API Endpoints

### Leads
- \`POST /api/leads\` - Create new lead
- \`GET /api/leads/:id\` - Get lead by ID
- \`GET /api/leads\` - List all leads

### Rates
- \`GET /api/rates\` - Get current mortgage rates
- \`GET /api/rates/:id\` - Get rate by ID

### Calculator
- \`POST /api/calculator/payment\` - Calculate monthly payment
- \`POST /api/calculator/affordability\` - Calculate affordability

### Contact
- \`POST /api/contact\` - Submit contact form

## Testing

### Unit Tests
\`\`\`bash
npm test
\`\`\`

### E2E Tests
\`\`\`bash
npm run test:e2e
\`\`\`

### Coverage
\`\`\`bash
npm run test:cov
\`\`\`

## Deployment

### Build for Production
\`\`\`bash
npm run build
\`\`\`

### Environment Variables

**Required for Production:**
- \`DATABASE_HOST\` - PostgreSQL host
- \`DATABASE_PASSWORD\` - PostgreSQL password
- \`JWT_SECRET\` - JWT secret key
- \`REDIS_HOST\` - Redis host
- \`CORS_ORIGIN\` - Frontend URL
- \`SMTP_HOST\` - Email SMTP host
- \`SMTP_USER\` - Email credentials
- \`SMTP_PASSWORD\` - Email password

## Features Implemented

### Frontend
- ✅ Hero section with rate display
- ✅ Lead capture form with validation
- ✅ Mortgage payment calculator
- ✅ Affordability calculator
- ✅ Testimonials section
- ✅ Contact form
- ✅ Responsive design
- ✅ Form state management
- ✅ API integration
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications

### Backend
- ✅ RESTful API
- ✅ Database models (Lead, Rate, Contact)
- ✅ CRUD operations
- ✅ Input validation
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet security
- ✅ Error handling
- ✅ Database migrations
- ✅ Seed data

### DevOps
- ✅ Docker configuration
- ✅ Docker Compose setup
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Automated testing
- ✅ Build optimization

## Next Steps

### Phase 2: Enhanced Features
- [ ] User authentication
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced lead scoring
- [ ] CRM integration
- [ ] Analytics dashboard

### Phase 3: LenderBridge.ai
- [ ] Lender portal
- [ ] AI-powered rate matching
- [ ] Document processing
- [ ] Automated underwriting
- [ ] Real-time rate updates

## Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Submit pull request

## License

Proprietary - All rights reserved

## Support

For support, email: support@ratehunter.net
