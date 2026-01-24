# CRM Dashboard - CLAUDE.md

**Inherits from**: `apps/CLAUDE.md`
**Stack**: React 18, TypeScript, Node.js, Vite
**Port**: 3002
**Type**: admin (Internal CRM dashboard for lead management and analytics)

## Overview

CRM Dashboard is an internal admin application for managing leads, clients, and analytics. This document provides CRM Dashboard-specific configuration and development guidelines.

## App-Specific Configuration

### Routes

- `/dashboard` - Main dashboard with KPIs and overview
- `/leads` - Lead list, filtering, and bulk operations
- `/leads/:id` - Detailed lead view and management
- `/clients` - Client management and customer view
- `/clients/:id` - Client details and interaction history
- `/analytics` - Advanced analytics and reporting
- `/analytics/sales` - Sales performance dashboard
- `/analytics/pipeline` - Deal pipeline and forecast
- `/settings` - Admin settings and configuration

### Features

- Lead tracking and management
- Client profile management
- Sales pipeline visualization
- Deal tracking and forecasting
- Activity timeline and history
- Analytics and reporting dashboards
- Bulk lead operations
- Export to CSV/PDF
- Role-based access control
- Team performance metrics

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
- `react-table` - Advanced data tables
- `papaparse` - CSV parsing and generation
- `lucide-react` - Icon library

### Environment Variables

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Authentication
VITE_AUTH_URL=http://localhost:3000/auth
VITE_SESSION_TIMEOUT=3600000

# Feature Flags
VITE_FEATURE_BULK_OPERATIONS=true
VITE_FEATURE_EXPORT_CSV=true
VITE_FEATURE_EXPORT_PDF=true
VITE_FEATURE_ADVANCED_FILTERING=true
VITE_FEATURE_ANALYTICS=true

# Analytics
VITE_ANALYTICS_ID=crm-dashboard
VITE_ENVIRONMENT=development

# Pagination
VITE_DEFAULT_PAGE_SIZE=50
VITE_MAX_PAGE_SIZE=500
```

### Container Configuration

- **Base Image**: node:18-alpine
- **Port**: 3002
- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`
- **Dockerfile**: `Dockerfile` in app root
- **Authentication**: Requires JWT token in session

## Testing (TDD)

### Test Structure

- **Test Files**: `src/**/*.test.tsx`, `src/**/*.test.ts`
- **Test Utilities**: `tests/utils` (shared test helpers)
- **Mock Data**: `tests/fixtures/` (leads, clients, analytics data)
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
pnpm test -- LeadTable.test.tsx

# Run tests matching pattern
pnpm test -- --grep "analytics"
```

### Key Test Scenarios

1. **Lead Management**
   - Create new leads
   - Edit lead information
   - Delete leads with confirmation
   - Bulk operations on multiple leads
   - Lead status transitions

2. **Client Management**
   - View client profiles
   - Update client details
   - Track client interactions
   - View interaction history
   - Link leads to clients

3. **Analytics**
   - Calculate KPIs (conversion rate, avg deal size)
   - Generate sales pipeline data
   - Filter analytics by date range
   - Export analytics data

4. **Data Tables**
   - Sort by multiple columns
   - Filter with advanced filters
   - Paginate large datasets
   - Export table to CSV
   - Select and bulk operation on rows

## API Integration

- **Backend URL**: `http://localhost:3000/api` (development)
- **Authentication**: JWT tokens in Authorization header
- **Error Handling**: React Query error boundaries + admin notifications
- **HTTP Client**: Axios (configured in shared utils)
- **API Mocking**: MSW (Mock Service Worker) for development/testing

### API Endpoints Used

```
GET    /api/leads                  - Get all leads
POST   /api/leads                  - Create new lead
GET    /api/leads/:id              - Get lead details
PUT    /api/leads/:id              - Update lead
DELETE /api/leads/:id              - Delete lead
PUT    /api/leads/bulk/status      - Update multiple leads

GET    /api/clients                - Get all clients
POST   /api/clients                - Create new client
GET    /api/clients/:id            - Get client details
PUT    /api/clients/:id            - Update client
GET    /api/clients/:id/activity   - Get activity history

GET    /api/analytics/kpi          - Get KPI metrics
GET    /api/analytics/pipeline     - Get pipeline data
GET    /api/analytics/sales        - Get sales metrics
GET    /api/analytics/forecast     - Get forecast data

POST   /api/export                 - Export data (CSV/PDF)
```

## Development Commands

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server (port 3002)
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
docker build -t crm-dashboard:latest .

# Run container locally
docker run -p 3002:3002 crm-dashboard:latest

# Docker Compose (from project root)
docker-compose -f infra/docker/docker-compose.yml up crm-dashboard
```

## File Structure

```
apps/web/crm-dashboard/
├── src/
│   ├── components/
│   │   ├── LeadTable.tsx
│   │   ├── LeadForm.tsx
│   │   ├── ClientCard.tsx
│   │   ├── ClientProfile.tsx
│   │   ├── ActivityTimeline.tsx
│   │   ├── SalesPipeline.tsx
│   │   ├── KPICard.tsx
│   │   ├── AnalyticsChart.tsx
│   │   ├── BulkOperations.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Leads.tsx
│   │   ├── LeadDetail.tsx
│   │   ├── Clients.tsx
│   │   ├── ClientDetail.tsx
│   │   ├── Analytics.tsx
│   │   ├── SalesAnalytics.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useLeads.ts
│   │   ├── useClients.ts
│   │   ├── useAnalytics.ts
│   │   ├── useBulkOperations.ts
│   │   └── ...
│   ├── api/
│   │   ├── leads.ts
│   │   ├── clients.ts
│   │   ├── analytics.ts
│   │   ├── export.ts
│   │   └── ...
│   ├── types/
│   │   ├── lead.ts
│   │   ├── client.ts
│   │   ├── analytics.ts
│   │   └── ...
│   ├── utils/
│   │   ├── dataFormatting.ts
│   │   ├── csvExport.ts
│   │   ├── dateUtils.ts
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── utils/
│   │   ├── testHelpers.ts
│   │   └── mockData.ts
│   ├── fixtures/
│   │   ├── leads.json
│   │   ├── clients.json
│   │   └── analytics.json
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

### LeadTable
Displays leads with sorting, filtering, and bulk operations. Features multi-select and inline editing.

### ClientProfile
Shows detailed client information including interaction history, related leads, and contact information.

### SalesPipeline
Visualizes deals moving through different pipeline stages with drag-and-drop support.

### AnalyticsCharts
Displays various metrics including KPIs, trends, and forecasts with interactive charts.

### BulkOperations
Enables bulk updates to multiple leads/clients such as status changes or assignment.

## Development Workflow

### Feature Development (TDD)

```bash
# 1. Start tests in watch mode
pnpm test:watch

# 2. Write failing test for new feature

# 3. Implement feature
# 4. Run tests - should pass
# 5. Refactor for code quality
# 6. Commit changes
```

### Example: Adding Lead Status Filter

```bash
# 1. Write test for status filter
# tests/LeadStatusFilter.test.ts

# 2. Create filter component
# src/components/LeadStatusFilter.tsx

# 3. Integrate into LeadTable
# src/components/LeadTable.tsx

# 4. Test integration
pnpm test

# 5. Commit
git add .
git commit -m "feat: Add lead status filtering"
```

## Code Review Checklist

- [ ] Tests pass: `pnpm test`
- [ ] Coverage maintained: >80%
- [ ] Linting passes: `pnpm lint`
- [ ] Types correct: `pnpm type-check`
- [ ] No console.log or debugger statements
- [ ] Accessibility tested
- [ ] Responsive on smaller screens
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Documentation updated
- [ ] Performance optimized (no unnecessary re-renders)

## Debugging

### Development Tools

- **React DevTools**: Component inspection and state tracking
- **Network Tab**: Monitor API calls and responses
- **Browser Console**: Check for errors and warnings
- **React Query DevTools**: Inspect query cache and requests

### Debug Mode

```bash
# Start with debug logging
DEBUG=* pnpm dev

# Filter to specific modules
DEBUG=leads:*,clients:* pnpm dev
```

## Performance Optimization

### Key Optimizations

1. **Virtual Scrolling**: Use virtualization for large tables
2. **Query Caching**: React Query caching for lead/client data
3. **Memoization**: Memoize expensive components
4. **Code Splitting**: Lazy load analytics pages
5. **Image Optimization**: Use optimized avatars and icons

## Deployment

### Production Build

```bash
pnpm build
pnpm preview
```

### Environment Setup

```bash
# Production environment variables
VITE_API_URL=https://api.nyra.com/api
VITE_ENVIRONMENT=production
VITE_SESSION_TIMEOUT=3600000
```

## Claude Flow Integration

### Memory-Based Development

```bash
# Store CRM patterns
npx @claude-flow/cli@latest memory store \
  --key "crm-lead-table-pattern" \
  --value "Lead table with sorting, filtering, and bulk operations" \
  --namespace app-specific

# Search for data table patterns
npx @claude-flow/cli@latest memory search \
  --query "data table sorting filtering patterns"
```

### Task Coordination

```bash
# Pre-task: Get routing for new CRM feature
npx @claude-flow/cli@latest hooks pre-task \
  --description "Implement CRM lead assignment workflow"

# Post-task: Store results
npx @claude-flow/cli@latest hooks post-task \
  --task-id "task-crm-assignment" \
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
