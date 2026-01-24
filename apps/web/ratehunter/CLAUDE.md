# RateHunter - CLAUDE.md

**Inherits from**: `apps/CLAUDE.md`
**Stack**: React 18, TypeScript, Node.js, Vite
**Port**: 3001
**Type**: public (Rate comparison and mortgage application platform)

## Overview

RateHunter is a public-facing application that allows users to compare mortgage rates, search for lenders, and apply for mortgage products. This document provides RateHunter-specific configuration and development guidelines.

## App-Specific Configuration

### Routes

- `/` - Home page with rate overview
- `/rates` - Rate comparison and filtering
- `/compare` - Side-by-side rate comparison tool
- `/apply` - Mortgage application flow
- `/lenders` - Broker/lender directory
- `/rates/:id` - Detailed rate information
- `/application/:id` - Application status tracking

### Features

- Real-time mortgage rate comparison
- Lender and broker search and filtering
- Mortgage calculator
- Application form with validation
- Application status tracking
- Rate alerts and notifications
- User profile management
- Saved preferences and searches

### Dependencies

**Shared Packages**:
- `@nyra/ui` - Shared UI component library
- `@nyra/utils` - Shared utilities and helpers

**App-Specific Dependencies**:
- `@tanstack/react-query` - Server state management
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `axios` - HTTP client
- `date-fns` - Date utilities
- `recharts` - Charts and graphs
- `lucide-react` - Icon library

### Environment Variables

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_FEATURE_RATE_ALERTS=true
VITE_FEATURE_SAVED_COMPARISONS=true
VITE_FEATURE_APPLICATION_TRACKING=true

# Analytics
VITE_ANALYTICS_ID=ratehunter-app
VITE_ENVIRONMENT=development

# Application Configuration
VITE_MAX_LENDERS_COMPARE=5
VITE_MIN_LOAN_AMOUNT=50000
VITE_MAX_LOAN_AMOUNT=2000000
```

### Container Configuration

- **Base Image**: node:18-alpine
- **Port**: 3001
- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`
- **Dockerfile**: `Dockerfile` in app root

## Testing (TDD)

### Test Structure

- **Test Files**: `src/**/*.test.tsx`, `src/**/*.test.ts`
- **Test Utilities**: `tests/utils` (shared test helpers)
- **Mock Data**: `tests/fixtures/` (rate data, lender data, etc.)
- **Coverage Requirement**: 80%+ for all source files

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test -- RateComparison.test.tsx

# Run tests matching pattern
pnpm test -- --grep "calculator"
```

### Key Test Scenarios

1. **Rate Comparison**
   - Filter rates by term, loan type, lender
   - Sort rates by APR, monthly payment
   - Compare up to 5 rates side-by-side

2. **Mortgage Calculator**
   - Calculate monthly payment from loan amount
   - Calculate loan amount from monthly payment
   - Handle edge cases (very high/low amounts)

3. **Application Flow**
   - Form validation with Zod schemas
   - Progress through multi-step form
   - Save and resume applications
   - Submit application data

4. **Lender Search**
   - Search by name, location, specialty
   - Filter by ratings, experience
   - Load more results pagination

## API Integration

- **Backend URL**: `http://localhost:3000/api` (development)
- **Authentication**: JWT tokens in Authorization header
- **Error Handling**: React Query error boundaries + user-friendly messages
- **HTTP Client**: Axios (configured in shared utils)
- **API Mocking**: MSW (Mock Service Worker) for development/testing

### API Endpoints Used

```
GET  /api/rates              - Get all available rates
GET  /api/rates/:id          - Get specific rate details
GET  /api/lenders            - Get all lenders
GET  /api/lenders/:id        - Get lender details
GET  /api/applications       - Get user applications
POST /api/applications       - Create new application
GET  /api/applications/:id   - Get application details
PUT  /api/applications/:id   - Update application
```

## Development Commands

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server (port 3001)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### Testing & Quality

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Lint and format
pnpm lint && pnpm format

# Type check
pnpm type-check
```

### Docker Development

```bash
# Build Docker image
docker build -t ratehunter-app:latest .

# Run container locally
docker run -p 3001:3001 ratehunter-app:latest

# Docker Compose (from project root)
docker-compose -f infra/docker/docker-compose.yml up ratehunter
```

## File Structure

```
apps/web/ratehunter/
├── src/
│   ├── components/
│   │   ├── RateComparison.tsx
│   │   ├── RateCard.tsx
│   │   ├── RateFilter.tsx
│   │   ├── MortgageCalculator.tsx
│   │   ├── LenderCard.tsx
│   │   ├── ApplicationForm.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Rates.tsx
│   │   ├── Compare.tsx
│   │   ├── Apply.tsx
│   │   ├── Lenders.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useRates.ts
│   │   ├── useLenders.ts
│   │   ├── useApplications.ts
│   │   └── ...
│   ├── api/
│   │   ├── rates.ts
│   │   ├── lenders.ts
│   │   ├── applications.ts
│   │   └── ...
│   ├── types/
│   │   ├── rate.ts
│   │   ├── lender.ts
│   │   ├── application.ts
│   │   └── ...
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── formatting.ts
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── utils/
│   │   ├── testHelpers.ts
│   │   └── mockData.ts
│   ├── fixtures/
│   │   ├── rates.json
│   │   ├── lenders.json
│   │   └── applications.json
│   └── setup.ts
├── public/
│   ├── images/
│   └── ...
├── Dockerfile
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

## Key Components

### RateComparison
Displays and filters available mortgage rates with sorting and comparison features.

### MortgageCalculator
Calculates monthly payments, total interest, and amortization schedules.

### ApplicationForm
Multi-step form for mortgage application with validation and progress tracking.

### LenderDirectory
Search and filter lenders/brokers with ratings and specialties.

## Development Workflow

### Feature Development (TDD)

```bash
# 1. Start tests in watch mode
pnpm test:watch

# 2. Write failing test for new feature
# Example: Test for rate filtering

# 3. Implement feature
# Example: Add RateFilter component with filtering logic

# 4. Run tests - should pass
# 5. Refactor for code quality
# 6. Commit changes
```

### Example: Adding Rate Alert Feature

```bash
# 1. Write test for rate alert hook
# tests/useRateAlerts.test.ts

# 2. Create hook implementation
# src/hooks/useRateAlerts.ts

# 3. Create UI component
# src/components/RateAlertBell.tsx

# 4. Integrate into pages
# src/pages/Rates.tsx

# 5. Run full test suite
pnpm test

# 6. Commit
git add .
git commit -m "feat: Add rate alert functionality"
```

## Code Review Checklist

- [ ] Tests pass: `pnpm test`
- [ ] Coverage maintained: >80%
- [ ] Linting passes: `pnpm lint`
- [ ] Types correct: `pnpm type-check`
- [ ] No console.log or debugger statements
- [ ] Accessibility tested (keyboard nav, screen reader)
- [ ] Mobile responsive design
- [ ] API error handling implemented
- [ ] Loading and error states implemented
- [ ] Documentation updated

## Debugging

### Development Tools

- **React DevTools**: Component inspection and state tracking
- **Network Tab**: Monitor API calls and responses
- **Browser Console**: Check for errors and warnings
- **VS Code Debugger**: Set breakpoints and step through code

### Debug Mode

```bash
# Start with debug logging
DEBUG=* pnpm dev

# Filter to API calls only
DEBUG=api:* pnpm dev
```

## Deployment

### Production Build

```bash
pnpm build
pnpm preview
```

### Environment Setup

```bash
# Production environment variables
VITE_API_URL=https://api.ratehunter.com/api
VITE_ENVIRONMENT=production
```

## Claude Flow Integration

### Memory-Based Development

```bash
# Store RateHunter patterns
npx @claude-flow/cli@latest memory store \
  --key "ratehunter-rate-calc-pattern" \
  --value "Mortgage rate calculation with amortization" \
  --namespace app-specific

# Search for rate comparison patterns
npx @claude-flow/cli@latest memory search \
  --query "rate filtering and comparison patterns"
```

### Task Coordination

```bash
# Pre-task: Get routing for new feature
npx @claude-flow/cli@latest hooks pre-task \
  --description "Implement rate alert notifications in RateHunter"

# Post-task: Store results
npx @claude-flow/cli@latest hooks post-task \
  --task-id "task-ratehunter-alerts" \
  --success true \
  --store-results true
```

## References

- **Project CLAUDE.md**: `CLAUDE.md` (root)
- **Apps CLAUDE.md**: `apps/CLAUDE.md`
- **Shared UI**: `apps/shared/ui/`
- **Docker Config**: `infra/docker/`

---

**Last Updated**: 2026-01-22
**Maintained By**: Development Team
