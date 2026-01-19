# Frontend Applications

> 5 modern web applications powering Project Nyra's user experience

## Overview

Project Nyra's frontend consists of 9 specialized applications and workspaces built with React and Next.js. Each app serves a specific user role and use case, from mortgage processing to rate comparison to system administration.

### Special Workspace: apps/ingestion/

In addition to the production applications, the `apps/` folder includes a dedicated **ingestion/** workspace for processing complex content that requires systematic integration. This workspace uses the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology to ensure quality-assured content transformation.

See **[apps/ingestion/README.md](ingestion/README.md)** for details on the ingestion workflow.

## Applications

### 1. Mortgage Assistant

**Loan Officer Dashboard**

- **Port:** 3000
- **Package:** `mortgage-assistant`
- **Tech:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Purpose:** Primary dashboard for loan officers to manage mortgage applications

**Features:**
- Application management dashboard
- Document upload and tracking
- Client communication interface
- Task management and reminders
- Rate calculator
- Pre-qualification tools
- Pipeline visualization
- Calendar integration
- Document checklist
- Drag-and-drop file uploads

**Quick Start:**
```bash
cd apps/mortgage-assistant
pnpm install
pnpm dev
```

**Tech Stack:**
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form
- **Charts:** Recharts
- **Drag & Drop:** React Beautiful DnD
- **Date Handling:** date-fns
- **Icons:** Lucide React
- **Animation:** Framer Motion

**Key Pages:**
- `/dashboard` - Main dashboard
- `/applications` - Application list
- `/applications/[id]` - Application details
- `/documents` - Document management
- `/calendar` - Appointments and tasks
- `/clients` - Client management
- `/rates` - Rate comparison
- `/settings` - User settings

**API Integration:**
```typescript
// Example API call
const response = await fetch('/api/applications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(applicationData)
});
```

---

### 2. RateHunter

**Mortgage Rate Comparison Tool**

- **Port:** 3009
- **Package:** `ratehunter`
- **Tech:** Next.js 14, React 18, TypeScript
- **Purpose:** Consumer-facing rate comparison and search tool

**Features:**
- Real-time rate comparison
- Lender filtering and sorting
- Rate alerts and notifications
- Mortgage calculator
- Rate trend charts
- Lender reviews and ratings
- Lead generation forms
- Email rate updates
- Save favorite rates
- Share rate comparisons

**Quick Start:**
```bash
cd apps/ratehunter
pnpm install
pnpm dev
```

**Tech Stack:**
- **Framework:** Next.js 14
- **Styling:** Tailwind CSS
- **State:** React Context
- **Charts:** Chart.js / Recharts
- **Forms:** React Hook Form

**Key Pages:**
- `/` - Rate search and comparison
- `/rates` - Detailed rate listing
- `/calculator` - Mortgage calculator
- `/lenders` - Lender directory
- `/about` - About RateHunter
- `/contact` - Contact form

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3600
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:4500
```

---

### 3. RateHunter Landing

**Marketing Website**

- **Port:** 3001
- **Package:** `ratehunter-landing`
- **Tech:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Purpose:** Marketing landing page for RateHunter.net

**Features:**
- Hero section with CTA
- Feature highlights
- Testimonials
- FAQ section
- Contact form
- SEO optimized
- Mobile responsive
- Fast page loads
- Email capture
- Analytics integration

**Quick Start:**
```bash
cd apps/ratehunter-landing
pnpm install
pnpm dev
```

**Tech Stack:**
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Analytics:** Google Analytics / Plausible
- **SEO:** Next SEO

**Key Sections:**
- Hero with value proposition
- Features showcase
- How it works
- Testimonials
- Pricing (if applicable)
- FAQ
- Footer with links

**SEO Configuration:**
```typescript
// app/layout.tsx
export const metadata = {
  title: 'RateHunter - Compare Mortgage Rates',
  description: 'Find the best mortgage rates from top lenders',
  keywords: 'mortgage, rates, comparison, loans'
};
```

---

### 4. Nexus Dashboard

**Admin & Monitoring Dashboard**

- **Port:** 3002
- **Package:** `nexus-dashboard`
- **Tech:** Next.js, React, TypeScript
- **Purpose:** System monitoring and orchestration management

**Features:**
- Agent swarm monitoring
- System metrics dashboard
- Service health checks
- Performance analytics
- Resource utilization graphs
- Error tracking
- Log viewer
- User activity monitoring
- Configuration management
- Deployment controls

**Quick Start:**
```bash
cd apps/nexus-dashboard
pnpm install
pnpm dev
```

**Tech Stack:**
- **Framework:** Next.js 14
- **State:** Redux / Zustand
- **Charts:** Recharts / D3.js
- **Real-time:** Socket.io-client
- **Tables:** TanStack Table

**Key Pages:**
- `/` - Overview dashboard
- `/agents` - Agent management
- `/services` - Service monitoring
- `/metrics` - Performance metrics
- `/logs` - System logs
- `/alerts` - Alert management
- `/config` - Configuration

**Dashboard Widgets:**
```typescript
// Example metrics display
<MetricsCard
  title="Active Agents"
  value={agentCount}
  trend={+5}
  icon={<Users />}
/>
```

---

### 5. Nyra Admin

**System Administration**

- **Port:** 3003
- **Package:** `nyra-admin`
- **Tech:** Next.js, React, TypeScript
- **Purpose:** System administration and user management

**Features:**
- User management (CRUD)
- Role and permission management
- Organization management
- System settings
- Audit log viewer
- Database management
- API key management
- Email template editor
- Backup and restore
- License management

**Quick Start:**
```bash
cd apps/nyra-admin
pnpm install
pnpm dev
```

**Tech Stack:**
- **Framework:** Next.js 14
- **UI Components:** Custom + Shadcn/ui
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table
- **State:** Zustand

**Key Pages:**
- `/users` - User management
- `/roles` - Role management
- `/organizations` - Organization management
- `/settings` - System settings
- `/audit` - Audit logs
- `/api-keys` - API key management
- `/email-templates` - Email templates

**Permission Checks:**
```typescript
// Example permission guard
if (!hasPermission(user, 'users.delete')) {
  return <Unauthorized />;
}
```

---

## Port Allocation

| Application | Port | Package | URL |
|-------------|------|---------|-----|
| Mortgage Assistant | 3000 | mortgage-assistant | http://localhost:3000 |
| RateHunter Landing | 3001 | ratehunter-landing | http://localhost:3001 |
| Nexus Dashboard | 3002 | nexus-dashboard | http://localhost:3002 |
| Nyra Admin | 3003 | nyra-admin | http://localhost:3003 |
| RateHunter | 3009 | ratehunter | http://localhost:3009 |

## Development Workflow

### Starting All Apps

```bash
# Install dependencies for all apps
pnpm install

# Start all apps in development mode
pnpm dev

# Start specific app
pnpm --filter mortgage-assistant dev
```

### Building Apps

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter ratehunter build

# Start production build
pnpm --filter ratehunter start
```

### Testing Apps

```bash
# Run tests for all apps
pnpm test

# Test specific app
pnpm --filter mortgage-assistant test

# Run tests in watch mode
pnpm --filter mortgage-assistant test:watch

# Generate coverage report
pnpm --filter mortgage-assistant test:coverage
```

## Common Development Tasks

### Adding Dependencies

```bash
# Add dependency to specific app
pnpm --filter mortgage-assistant add react-query

# Add dev dependency
pnpm --filter nexus-dashboard add -D @types/node

# Update all dependencies
pnpm update
```

### Environment Variables

Each app requires environment variables. Create `.env.local`:

**Example `.env.local`:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3100
NEXT_PUBLIC_WS_URL=ws://localhost:4500

# Authentication
NEXT_PUBLIC_AUTH_URL=http://localhost:3100/auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false

# External Services
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_GA_ID=your-ga-id
```

### Code Generation

```bash
# Generate component
pnpm --filter mortgage-assistant generate:component Button

# Generate page
pnpm --filter mortgage-assistant generate:page settings
```

## Shared Components

### Using Shared UI Components

```typescript
// Import from shared package
import { Button, Card, Input } from '@nyra/ui';

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter value" />
      <Button>Submit</Button>
    </Card>
  );
}
```

### Creating Shared Components

```bash
# Add component to shared package
cd packages/ui/src/components
mkdir Button
cd Button
touch Button.tsx index.ts
```

## Styling Guidelines

### Tailwind CSS

All apps use Tailwind CSS for styling:

```typescript
// Example component with Tailwind
function Card({ children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}
```

### CSS Modules (Optional)

For component-specific styles:

```typescript
import styles from './Button.module.css';

function Button({ children }) {
  return <button className={styles.button}>{children}</button>;
}
```

### Theme Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        }
      }
    }
  }
};
```

## API Integration

### Using API Services

```typescript
// services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getApplications() {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }

  return response.json();
}
```

### React Query Integration

```typescript
import { useQuery } from '@tanstack/react-query';

function ApplicationsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <List items={data} />;
}
```

## State Management

### Zustand Store

```typescript
// stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: async (email, password) => {
    const { user, token } = await loginAPI(email, password);
    set({ user, token });
  },
  logout: () => set({ user: null, token: null })
}));
```

### Using the Store

```typescript
function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header>
      <span>Welcome, {user?.name}</span>
      <button onClick={logout}>Logout</button>
    </header>
  );
}
```

## Authentication

### Protected Routes

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/applications/:path*']
};
```

### Auth Context

```typescript
// contexts/AuthContext.tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check authentication on mount
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image';

function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width={200}
      height={50}
      priority
    />
  );
}
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false
});
```

### React Server Components

```typescript
// app/dashboard/page.tsx (Server Component)
async function DashboardPage() {
  const data = await fetchDashboardData();

  return <Dashboard data={data} />;
}
```

## Testing

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Testing

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:3000/dashboard');
});
```

## Deployment

### Build for Production

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter mortgage-assistant build
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
CMD ["npm", "start"]
```

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.nyra.com
```

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9
```

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
pnpm install
```

**Type errors:**
```bash
# Regenerate types
pnpm run typecheck
```

## Best Practices

1. **Use TypeScript** - Type safety prevents bugs
2. **Server Components** - Use by default, client components when needed
3. **Code Splitting** - Dynamic imports for large components
4. **Image Optimization** - Use Next.js Image component
5. **SEO** - Add metadata to all pages
6. **Accessibility** - Use semantic HTML and ARIA labels
7. **Error Boundaries** - Handle errors gracefully
8. **Loading States** - Show feedback during async operations
9. **Mobile First** - Design for mobile, enhance for desktop
10. **Test Coverage** - Aim for >80% coverage

## Next Steps

- [Services Documentation](../services/README.md) - Backend APIs
- [API Documentation](../docs/api/rest-api.md) - API reference
- [Deployment Guide](../docs/deployment/README.md) - Deploy to production
- [Architecture](../docs/architecture/system-architecture.md) - System design

---

**Last Updated:** January 10, 2026
