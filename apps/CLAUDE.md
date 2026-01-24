# Applications - Claude Flow V3 Shared Standards

> **Shared configuration for all React/TypeScript applications in Project Nyra**
>
> **Stack**: React 18+, TypeScript 5+, Next.js 14, TailwindCSS, Zustand
> **Testing**: Jest, React Testing Library, Playwright (E2E)
> **Deployment**: Cloudflare Pages, Docker containers
> **Package Manager**: pnpm

---

## 1. APPS FOLDER OVERVIEW

### Monorepo Structure

```
apps/
├── landing/                        # Landing pages & marketing sites
│   ├── ratehunter-landing/        # RateHunter public landing (SSG)
│   └── CLAUDE.md                  # Landing-specific standards
├── web/                           # Web applications & dashboards
│   ├── webapp/                    # Main RateHunter web app
│   ├── ratehunter/                # Full RateHunter with backend
│   ├── crm/                       # NestJS backend (loan processing)
│   ├── crm-dashboard/             # CRM admin dashboard
│   ├── mortgage-assistant/        # Mortgage assistant UI
│   ├── nyra-admin/                # Nyra admin panel
│   └── CLAUDE.md                  # Web app standards
├── ingestion/                     # Document ingestion apps
│   └── CLAUDE.md                  # Ingestion-specific standards
├── nexus-dashboard/               # LLM monitoring dashboard
│   └── CLAUDE.md                  # Dashboard-specific standards
├── shared/                        # Shared components & utilities
│   ├── components/                # @nyra/components package
│   ├── utils/                     # @nyra/utils package
│   ├── types/                     # @nyra/types package
│   └── CLAUDE.md                  # Shared packages standards
├── utilities/                     # CLI tools and utilities
│   └── CLAUDE.md                  # Utilities standards
├── CLAUDE.md                      # This file - shared standards
└── package.json                   # Workspace root (pnpm-workspace.yaml)
```

### App Categories

| Category | Apps | Purpose | Type |
|----------|------|---------|------|
| **Landing** | ratehunter-landing | Public marketing, lead capture | Static/SSG |
| **Web Apps** | webapp, ratehunter, crm-dashboard, mortgage-assistant, nyra-admin | User-facing applications | React/Next.js |
| **Backend** | crm | API and business logic | NestJS |
| **Ingestion** | ingestion apps | Document processing, OCR | Python/TypeScript |
| **Tools** | nexus-dashboard | Monitoring, admin tools | React |
| **Shared** | @nyra/components, @nyra/utils, @nyra/types | Reusable code | TypeScript |

### Inter-App Dependencies

```
Landing Pages
    ↓
Web Apps (React)
    ↓
Backend (CRM API)
    ↓
Shared Libraries (@nyra/*)
```

**Dependency Rules**:
- Never import from `web/` into `landing/`
- Always import shared code from `shared/`
- Backend services in separate `/services` directory (not in `/apps`)
- Async data loading only, no tight coupling

---

## 2. TECH STACK STANDARDS

### Frontend: React 18+

```typescript
// ✅ RECOMMENDED PATTERNS

// Functional components with hooks
const MyComponent: React.FC<Props> = ({ children }) => {
  const [state, setState] = useState<StateType>(initialValue);

  useEffect(() => {
    // Effect logic
  }, [dependency]);

  return <div>{children}</div>;
};

// TypeScript strict mode
interface ComponentProps {
  title: string;
  onClick: (value: string) => void;
  optional?: boolean;
}

// Error boundaries
const MyPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
};
```

### TypeScript 5+

```typescript
// Strict configuration (tsconfig.json)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}

// Type safety examples
type Borrower = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

// Discriminated unions for API responses
type ApiResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Generic utilities
function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  // Implementation
}
```

### Next.js 14

```typescript
// App Router (not Pages Router)
// app/
//   ├── layout.tsx          # Root layout
//   ├── page.tsx            # Homepage
//   ├── api/               # API routes
//   │   └── route.ts
//   └── dashboard/
//       ├── layout.tsx      # Dashboard layout
//       └── page.tsx        # Dashboard page

// Server Components (default)
export default async function DashboardPage() {
  const data = await fetchData(); // No 'use client' needed
  return <Dashboard data={data} />;
}

// Client Components (when needed)
'use client';

import { useState } from 'react';

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Dynamic imports
const HeavyComponent = dynamic(
  () => import('./heavy-component'),
  { loading: () => <Skeleton /> }
);
```

### State Management: Zustand

```typescript
// Store definition
import { create } from 'zustand';

interface BorrowerStore {
  borrower: Borrower | null;
  setBorrower: (borrower: Borrower) => void;
  clearBorrower: () => void;
}

export const useBorrowerStore = create<BorrowerStore>((set) => ({
  borrower: null,
  setBorrower: (borrower) => set({ borrower }),
  clearBorrower: () => set({ borrower: null }),
}));

// Usage in components
'use client';

const BorrowerProfile = () => {
  const { borrower, clearBorrower } = useBorrowerStore();

  if (!borrower) return <div>No borrower selected</div>;

  return (
    <div>
      <h1>{borrower.name}</h1>
      <button onClick={clearBorrower}>Clear</button>
    </div>
  );
};
```

### Data Fetching: React Query (TanStack Query)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Query hooks
const useBorrower = (id: string) => {
  return useQuery({
    queryKey: ['borrower', id],
    queryFn: () => fetchBorrower(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hooks
const useUpdateBorrower = () => {
  return useMutation({
    mutationFn: (borrower: Borrower) => updateBorrower(borrower),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['borrower'] });
    },
  });
};

// Component usage
const BorrowerEditor = ({ id }: { id: string }) => {
  const { data, isLoading } = useBorrower(id);
  const { mutate } = useUpdateBorrower();

  if (isLoading) return <Loading />;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutate(data);
    }}>
      {/* Form fields */}
    </form>
  );
};
```

### Styling: Tailwind CSS + CSS Modules

```tsx
// app/components/card.tsx
import styles from './card.module.css';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className={`${styles.card} bg-white rounded-lg shadow`}>
      <h2 className="font-bold text-lg">{title}</h2>
      {children}
    </div>
  );
};
```

```css
/* app/components/card.module.css */
.card {
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

### Build: Vite or Webpack

```javascript
// vite.config.ts (for non-Next.js apps)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'ES2020',
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
```

### Package Manager: pnpm

```bash
# Workspace operations
pnpm install              # Install all deps
pnpm add -w @nyra/types   # Add to workspace root
pnpm add --filter=@nyra/web package-name  # Add to specific app

# Run scripts across workspace
pnpm --filter='./apps/**' run build

# Filtering
pnpm --filter=ratehunter-landing run deploy
pnpm --filter='@nyra/*' run test
```

---

## 3. DEVELOPMENT PATTERNS

### Component Architecture: Atomic Design

```
components/
├── atoms/                 # Basic building blocks
│   ├── button.tsx        # <Button />
│   ├── input.tsx         # <Input />
│   └── badge.tsx         # <Badge />
├── molecules/            # Simple component groups
│   ├── form-field.tsx    # <FormField label input />
│   ├── card-header.tsx   # <CardHeader title icon />
│   └── search-bar.tsx    # <SearchBar onSearch />
├── organisms/            # Complex components
│   ├── form-borrower.tsx # <BorrowerForm />
│   ├── table-loans.tsx   # <LoansTable />
│   └── modal-quote.tsx   # <QuoteModal />
└── layouts/              # Page layouts
    ├── sidebar-layout.tsx   # <SidebarLayout />
    └── dashboard-layout.tsx # <DashboardLayout />
```

### Type Safety

```typescript
// shared/types/borrower.ts
export interface Borrower {
  id: string;
  name: string;
  email: string;
  ssn: string;  // Encrypted in database
  income: number;
  creditScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// shared/types/quote.ts
export interface MortgageQuote {
  id: string;
  borrowerId: string;
  loanAmount: number;
  interestRate: number;
  term: 15 | 30;
  monthlyPayment: number;
  apr: number;
  createdAt: Date;
  expiresAt: Date;
}

// Zod validation
import { z } from 'zod';

export const BorrowerSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
  income: z.number().positive('Income must be positive'),
});

export type BorrowerForm = z.infer<typeof BorrowerSchema>;
```

### Code Splitting & Lazy Loading

```typescript
// app/dashboard/page.tsx
'use client';

import dynamic from 'next/dynamic';

const LoansList = dynamic(() => import('./loans-list'), {
  loading: () => <Skeleton />,
  ssr: false,
});

const QuoteGenerator = dynamic(() => import('./quote-generator'), {
  loading: () => <Skeleton />,
});

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h1>Dashboard</h1>
      <LoansList />
      <QuoteGenerator />
    </div>
  );
}
```

### Error Boundaries

```typescript
// components/error-boundary.tsx
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

### Accessibility (WCAG 2.1 AA)

```typescript
// ✅ REQUIRED: All interactive elements must be keyboard accessible

// Proper ARIA labels
<button
  aria-label="Close modal"
  onClick={() => setOpen(false)}
>
  ✕
</button>

// Semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/loans">Loans</a></li>
  </ul>
</nav>

// Form accessibility
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-help"
/>
<small id="email-help">We'll never share your email</small>

// Color contrast
// Minimum 4.5:1 for normal text, 3:1 for large text
```

### Environment Variables

```bash
# .env.local (Git ignored)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
DATABASE_URL=postgresql://...
API_SECRET_KEY=sk_test_...

# .env.production (in Cloudflare)
NEXT_PUBLIC_API_URL=https://api.nyra.mortgage
```

---

## 4. TESTING STRATEGY (TDD)

### Testing Pyramid

```
      Unit Tests (70%)        - Fast, isolated
    Integration Tests (20%)   - Component interactions
  End-to-End Tests (10%)      - Full workflows
```

### Unit Tests: Jest + React Testing Library

```typescript
// components/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Tests: Component Interactions

```typescript
// app/dashboard/__tests__/dashboard.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from '../page';
import { queryClient } from '@/lib/query-client';

describe('Dashboard Integration', () => {
  it('loads and displays loans', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    );

    // Should show loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Should show loans after loading
    await waitFor(() => {
      expect(screen.getByText('Loan #1')).toBeInTheDocument();
    });
  });

  it('filters loans by status', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    );

    const filterButton = await screen.findByRole('button', { name: /active/i });
    await userEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.queryByText('Closed Loan')).not.toBeInTheDocument();
    });
  });
});
```

### E2E Tests: Playwright

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('displays loans list', async ({ page }) => {
    await expect(page.locator('text=Your Loans')).toBeVisible();
    const loans = await page.locator('[data-testid="loan-item"]').count();
    expect(loans).toBeGreaterThan(0);
  });

  test('can create new quote', async ({ page }) => {
    await page.click('button:has-text("New Quote")');
    await page.fill('input[name="loanAmount"]', '300000');
    await page.click('button:has-text("Generate Quote")');

    const quote = await page.locator('[data-testid="generated-quote"]');
    await expect(quote).toBeVisible();
    await expect(quote.locator('text=$')).toBeVisible();
  });
});
```

### Test Configuration: jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Mock Strategy: MSW (Mock Service Worker)

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/borrower/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com',
      income: 100000,
    });
  }),

  http.post('/api/quotes', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'quote-123',
      loanAmount: body.loanAmount,
      monthlyPayment: 1500,
    }, { status: 201 });
  }),
];

// mocks/setup.ts
import { setupServer } from 'msw/node';

export const server = setupServer(...handlers);

// jest.setup.js
import { server } from './mocks/setup';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Coverage Requirements

```
Minimum Coverage: 80%
├── Statements: 80%
├── Branches: 80%
├── Functions: 80%
└── Lines: 80%

Landing Pages: 70% (marketing focus)
Web Apps: 85% (business logic critical)
Shared Libraries: 90% (reused code critical)
```

---

## 5. CONTAINER STANDARDS

### Dockerfile: Multi-Stage Build

```dockerfile
# Dockerfile for Next.js apps
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache dumb-init

COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/public public
COPY package.json next.config.js ./

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "-e", "require('next/dist/bin/next').nextStart()"]
```

### Docker Compose Integration

```yaml
version: '3.8'

services:
  ratehunter-web:
    build:
      context: ./apps/web/ratehunter
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      DATABASE_URL: postgresql://postgres:password@db:5432/nyra
    depends_on:
      - db
      - api

  ratehunter-landing:
    build:
      context: ./apps/landing/ratehunter-landing
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000

  db:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: nyra
      POSTGRES_PASSWORD: password

volumes:
  postgres_data:
```

### Environment Configuration

```bash
# Production Dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
# ... build commands

# Stage 2: Production
FROM node:20-alpine
RUN apk add --no-cache dumb-init
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["dumb-init", "--", "node", "server.js"]
```

---

## 6. SHARED DEPENDENCIES

### @nyra/types - Shared Type Definitions

```typescript
// shared/types/borrower.ts
export interface Borrower {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// shared/types/quote.ts
export interface MortgageQuote {
  id: string;
  borrowerId: string;
  loanAmount: number;
  interestRate: number;
  createdAt: Date;
}

// shared/types/index.ts
export * from './borrower';
export * from './quote';
```

Usage:
```typescript
import type { Borrower, MortgageQuote } from '@nyra/types';
```

### @nyra/utils - Shared Utilities

```typescript
// shared/utils/format.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

// shared/utils/validators.ts
import { z } from 'zod';

export const EmailSchema = z.string().email();
export const PhoneSchema = z.string().regex(/^\d{10}$/);
export const SSNSchema = z.string().regex(/^\d{3}-\d{2}-\d{4}$/);

export const validateEmail = (email: string): boolean => {
  return EmailSchema.safeParse(email).success;
};
```

Usage:
```typescript
import { formatCurrency, validateEmail } from '@nyra/utils';
```

### @nyra/components - Shared Components

```typescript
// shared/components/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  // Implementation
};

// shared/components/form-field.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  children,
}) => {
  // Implementation
};

// shared/components/index.ts
export * from './button';
export * from './form-field';
```

Usage:
```typescript
import { Button, FormField } from '@nyra/components';
```

### pnpm Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/**'
  - 'services/**'
  - 'packages/**'

shared-workspace-lockfile: true
```

```json
// apps/package.json
{
  "name": "nyra-apps",
  "private": true,
  "workspaces": [
    "landing/ratehunter-landing",
    "web/webapp",
    "web/ratehunter",
    "web/crm-dashboard",
    "ingestion/*",
    "shared/*"
  ]
}
```

---

## 7. APP-SPECIFIC CLAUDE.MD GUIDELINES

Each application should have its own `CLAUDE.md` file that **inherits** from this shared standard and adds app-specific configuration.

### Template Structure

```markdown
# [App Name] - Claude Flow V3 Configuration

> Brief description of the app

## Inherits from `apps/CLAUDE.md`

All standards from the parent apply here. This file adds app-specific details.

## Application Context

**Purpose**: What does this app do?
**Users**: Who uses it?
**Deployment**: Where is it deployed?
**Key Routes**: What are the main pages/routes?

## App-Specific Architecture

Describe unique components, services, or integrations.

## App-Specific Agents

Which agents specialize in this app?

## API Integration

Which backend services does this app call?

## Database Integration

Which databases does this app use?

## Related Documentation

Links to other CLAUDE.md files and documentation.
```

### Examples

- **apps/landing/CLAUDE.md** - Landing page specific (SEO, performance, Cloudflare)
- **apps/web/CLAUDE.md** - Web app specific (CRM integration, user auth, dashboards)
- **apps/ingestion/CLAUDE.md** - Ingestion specific (document processing, OCR)
- **apps/shared/CLAUDE.md** - Shared packages (component library, type definitions)

---

## 8. AVAILABLE APP AGENTS

Agents specialized for application development within the apps folder:

```yaml
frontend_developer:
  focus: React/Next.js component development
  specialties:
    - Component architecture (atomic design)
    - TypeScript strict typing
    - Zustand state management
    - React Query data fetching
  use_for: "Building UI components and pages"

component_architect:
  focus: Design systems and component libraries
  specialties:
    - Component APIs and props
    - Accessibility (WCAG 2.1 AA)
    - Storybook documentation
    - Component testing patterns
  use_for: "Designing reusable component systems"

accessibility_specialist:
  focus: WCAG 2.1 compliance and usability
  specialties:
    - Semantic HTML
    - ARIA attributes
    - Keyboard navigation
    - Screen reader testing
  use_for: "Ensuring accessibility compliance"

performance_optimizer:
  focus: Core Web Vitals and bundle optimization
  specialties:
    - Code splitting and lazy loading
    - Image optimization
    - CSS-in-JS optimization
    - Network waterfall analysis
  use_for: "Optimizing LCP, FID, CLS metrics"

cloudflare_specialist:
  focus: Cloudflare Pages deployment and edge optimization
  specialties:
    - Edge functions
    - Security headers
    - CDN caching strategies
    - Workers scripts
  use_for: "Deploying to Cloudflare Pages"

tdd_specialist:
  focus: Test-driven development
  specialties:
    - Jest configuration
    - React Testing Library patterns
    - Playwright E2E testing
    - Mock Service Worker setup
  use_for: "Writing comprehensive test coverage"

mobile_specialist:
  focus: Mobile-first responsive design
  specialties:
    - Responsive breakpoints (Tailwind)
    - Touch interactions
    - Mobile performance
    - PWA capabilities
  use_for: "Building mobile-responsive UIs"
```

### Agent Routing

When spawning agents for app development:

```bash
# Single feature/component
npx @claude-flow/cli@latest swarm init --topology star --max-agents 2 --strategy specialized
# → frontend_developer, component_architect

# Full page with accessibility
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 3 --strategy specialized
# → frontend_developer, accessibility_specialist, component_architect

# Performance-critical section
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 4 --strategy specialized
# → frontend_developer, performance_optimizer, tdd_specialist, reviewer

# Production deployment
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 3 --strategy specialized
# → cloudflare_specialist, performance_optimizer, reviewer
```

---

## 9. INTEGRATION WITH ROOT CLAUDE.MD

### Reference Architecture

```
root CLAUDE.md (Project Nyra overall)
    ↓
apps/CLAUDE.md (Shared app standards) ← YOU ARE HERE
    ↓
    ├─→ apps/landing/CLAUDE.md (Landing specific)
    ├─→ apps/web/CLAUDE.md (Web apps specific)
    ├─→ apps/ingestion/CLAUDE.md (Ingestion specific)
    ├─→ apps/shared/CLAUDE.md (Shared packages specific)
    └─→ services/CLAUDE.md (Backend services)
```

### Inheritance Rules

1. **Child inherits from parent**: apps/web/CLAUDE.md inherits from apps/CLAUDE.md
2. **Override when specific**: If child needs different pattern, explicitly override
3. **Link to parent**: Always reference parent CLAUDE.md for base standards
4. **Compose complexity**: Complex features → multiple CLAUDE.md files in hierarchy

### Memory Coordination

When working on app development, store learnings:

```bash
# Store successful app pattern
npx @claude-flow/cli@latest memory store \
  --namespace app-patterns \
  --key "react-form-validation" \
  --value "Zod schema + React Hook Form + error messages"

# Search for previous patterns
npx @claude-flow/cli@latest memory search \
  --query "form validation patterns" \
  --namespace app-patterns

# Store deployment learnings
npx @claude-flow/cli@latest memory store \
  --namespace deployment \
  --key "cloudflare-optimization" \
  --value "Enable auto-minify, Brotli, HTTP/3 for 40% faster delivery"
```

---

## 10. QUICK REFERENCE: COMMON APP WORKFLOWS

### Starting a New App

```bash
# 1. Initialize memory search
npx @claude-flow/cli@latest memory search --query "app setup patterns" --namespace patterns

# 2. Initialize swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 5 --strategy specialized

# 3. Spawn agents (in ONE message)
# → frontend_developer (create pages)
# → component_architect (design components)
# → tdd_specialist (write tests)
# → accessibility_specialist (ensure a11y)
# → reviewer (code review)

# 4. Store successful pattern
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "new-app-setup-$(date +%Y%m%d)" \
  --value "Setup process, stack choices, decisions made"
```

### Adding a Feature

```bash
# 1. Search for similar features
npx @claude-flow/cli@latest memory search \
  --query "[feature type]" \
  --namespace patterns \
  --limit 5

# 2. Spawn feature team
# → frontend_developer (UI/UX)
# → component_architect (component design)
# → tdd_specialist (tests first)

# 3. After completion
npx @claude-flow/cli@latest hooks post-task \
  --task-id "feature-$(date +%s)" \
  --success true \
  --store-results true
```

### Performance Optimization

```bash
# 1. Run benchmarks
npx @claude-flow/cli@latest performance benchmark --suite all

# 2. Profile bottlenecks
npx @claude-flow/cli@latest performance profile --target "app-name"

# 3. Spawn optimization team
# → performance_optimizer (bundle analysis)
# → frontend_developer (code splitting)
# → cloudflare_specialist (edge optimization)

# 4. Store optimization learnings
npx @claude-flow/cli@latest memory store \
  --namespace optimizations \
  --key "perf-opt-$(date +%Y%m%d)" \
  --value "Improvements: LCP -500ms, FID -50ms, CLS -0.05"
```

### Pre-Production Deployment

```bash
# 1. Run full validation suite
npx @claude-flow/cli@latest performance benchmark --suite all
npx @claude-flow/cli@latest security scan --depth full

# 2. Spawn deployment team
# → cloudflare_specialist (Pages config)
# → performance_optimizer (optimization review)
# → reviewer (final code review)

# 3. Post-deployment validation
# Check Lighthouse: 95+
# Check Core Web Vitals
# Check security headers
# Check error rates
```

---

## QUICK START CHECKLIST

For creating a new application in the apps folder:

- [ ] Create app directory under appropriate category (landing/, web/, etc.)
- [ ] Create `package.json` with project metadata
- [ ] Create `CLAUDE.md` inheriting from this file
- [ ] Create `tsconfig.json` with strict TypeScript settings
- [ ] Set up ESLint and Prettier configuration
- [ ] Create component structure (components/, lib/, utils/)
- [ ] Set up testing infrastructure (jest.config.js, jest.setup.js)
- [ ] Create README.md for app-specific documentation
- [ ] Add to pnpm-workspace.yaml
- [ ] Document API integrations and external dependencies
- [ ] Configure environment variables (.env.example)
- [ ] Set up GitHub Actions for CI/CD
- [ ] Create deployment configuration (Dockerfile, docker-compose)

---

## REFERENCE & RESOURCES

### Root CLAUDE.md
Comprehensive project configuration, swarm orchestration, memory systems.

### Apps-Specific CLAUDE.md Files
- `apps/landing/CLAUDE.md` - Landing page standards
- `apps/web/CLAUDE.md` - Web application standards
- `apps/shared/CLAUDE.md` - Shared packages standards

### External Documentation
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zustand**: https://github.com/pmndrs/zustand
- **Jest**: https://jestjs.io/docs/getting-started
- **Playwright**: https://playwright.dev/docs/intro

### Tools & Services
- **Cloudflare Pages**: https://pages.cloudflare.com
- **OpenNext.js**: https://github.com/sst/open-next
- **Docker**: https://docs.docker.com
- **pnpm**: https://pnpm.io/workspaces

---

**All applications in the apps/ folder follow these shared standards. Override only when app-specific needs require it. When in doubt, follow the hierarchy and refer to the root CLAUDE.md.**

**Remember**: Quality, accessibility, performance, and type safety are non-negotiable. Every app should feel like part of one cohesive platform.
