# {{PROJECT_NAME}} Application - Claude Code Configuration

> {{DESCRIPTION}}
>
> **Tech Stack**: {{TECH_STACK}}
> **Type**: Frontend Application
> **Namespace**: {{NAMESPACE}}

## 🎯 Application Overview

{{PROJECT_NAME}} is a {{TECH_STACK}} frontend application providing {{DESCRIPTION}}. It delivers responsive, performant user experiences with comprehensive state management and real-time data synchronization.

### Application Characteristics
- Interactive user interface
- Client-side state management
- Real-time data updates
- Responsive design (mobile-first)
- Progressive enhancement
- Client-side routing

## 🚨 AUTOMATIC SWARM ORCHESTRATION

For application development, Claude Code MUST:

1. **Initialize swarm** for multi-agent coordination
2. **Spawn specialized agents** (architect → coder → tester → reviewer)
3. **Coordinate through memory** and hooks

### Feature Implementation Routing
```bash
# Get optimal routing for feature development
npx @claude-flow/cli@latest hooks pre-task --description "Add new feature to {{PROJECT_NAME}}"
```

## 🏗️ Application Architecture

### Directory Structure
```
{{PROJECT_NAME}}/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── [slug]/          # Dynamic routes
│   ├── components/          # Reusable components
│   │   ├── common/          # Shared components
│   │   ├── sections/        # Page sections
│   │   └── ui/              # UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   ├── store/               # State management
│   ├── types/               # TypeScript types
│   ├── styles/              # Tailwind CSS
│   └── public/              # Static assets
├── tests/
│   ├── unit/               # Component tests
│   ├── integration/        # Feature tests
│   ├── e2e/               # End-to-end tests
│   └── __fixtures__/      # Test data
├── docs/
│   ├── components.md      # Component library
│   ├── patterns.md        # Design patterns
│   └── deployment.md      # Deployment guide
└── config/
    ├── tsconfig.json      # TypeScript config
    ├── next.config.js     # Next.js config
    └── tailwind.config.ts # Tailwind config
```

### Tech Stack Components ({{TECH_STACK}})
- **Framework**: Next.js 15+
- **UI Library**: React 19+
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **State**: Zustand or Context API
- **Data Fetching**: tRPC + React Query
- **Testing**: Vitest + React Testing Library
- **Build**: Turbopack

## 🎨 Component Architecture

### Component Types

**Page Components** (Next.js Page)
```typescript
// app/page.tsx
export default function HomePage() {
  return <div>Content</div>
}
```

**Layout Components**
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <html>{children}</html>
}
```

**Feature Components**
```typescript
// components/features/UserProfile.tsx
export function UserProfile({ userId }: Props) {
  // Feature implementation
}
```

**UI Components** (Shadcn/UI)
```typescript
// components/ui/Button.tsx
import { Button } from "@/components/ui/button"

export { Button }
```

### Component Patterns

**Server Components** (by default in Next.js 15)
```typescript
// Fetch data at build/request time
export default async function BlogList() {
  const posts = await getPosts();
  return <div>{/* render posts */}</div>
}
```

**Client Components** (interactive elements)
```typescript
'use client'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## 🧠 State Management

### Zustand Store Pattern
```typescript
// lib/store/authStore.ts
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  login: async (email, password) => {
    const user = await api.login(email, password)
    set({ user })
  },
  logout: () => set({ user: null }),
}))
```

### Usage in Components
```typescript
'use client'

export function UserMenu() {
  const { user, logout } = useAuthStore()
  return (
    <div>
      {user && <button onClick={logout}>Logout</button>}
    </div>
  )
}
```

## 📊 Data Fetching

### tRPC Integration
```typescript
// lib/trpc.ts
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'

export const trpc = createTRPCReact<AppRouter>()
```

### Using tRPC in Components
```typescript
'use client'

export function UsersList() {
  const { data: users } = trpc.users.list.useQuery()
  return <div>{users?.map(u => <div key={u.id}>{u.name}</div>)}</div>
}
```

## 🎯 Routing

### Next.js App Router
```
app/
├── page.tsx                    → /
├── dashboard/
│   └── page.tsx               → /dashboard
├── dashboard/
│   └── [id]/
│       └── page.tsx           → /dashboard/:id
├── api/
│   └── route.ts               → API routes
└── [...slug]/
    └── page.tsx               → Catch-all routes
```

## 🧪 Testing Strategy

### Unit Tests (Component)
```bash
npm test -- components.test.tsx

// Test component behavior
describe('Button', () => {
  it('calls onClick handler', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Integration Tests (Features)
```bash
npm test -- features.test.tsx

// Test feature workflows
describe('User Login', () => {
  it('shows login form and handles submission', async () => {
    render(<LoginPage />)
    // Simulate user interaction
    // Verify API call
    // Check navigation
  })
})
```

### E2E Tests (Playwright)
```bash
npm run test:e2e

// Test complete user workflows
test('user can login and access dashboard', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[name=email]', 'user@example.com')
  // ... continue user interactions
  await expect(page).toHaveURL('/dashboard')
})
```

### Coverage Targets
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## 🎨 Styling & Design

### Tailwind CSS
```typescript
// Utility-first CSS approach
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
  <div className="text-lg font-semibold">Title</div>
</div>
```

### Design System (Shadcn/UI)
```typescript
// Pre-built components
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export function Example() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

### Dark Mode
```typescript
// Automatic dark mode support
<div className="bg-white dark:bg-slate-950 text-black dark:text-white">
  Content
</div>
```

## 📱 Responsive Design

### Mobile-First Approach
```typescript
// Base styles for mobile, breakpoints for larger screens
<div className="text-sm md:text-base lg:text-lg">
  Responsive text size
</div>
```

### Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## 📁 File Organization

**CRITICAL**: Never save working files to root folder

**Proper locations:**
- `/src` - Application source code
- `/tests` - Test files
- `/docs` - Documentation
- `/public` - Static assets
- `/config` - Configuration files

## 🚀 Build & Deployment

### Development
```bash
npm run dev
# Starts at http://localhost:3000 with hot reload
```

### Production Build
```bash
npm run build
npm start
```

### Static Export (if applicable)
```bash
npm run build:static
# Creates optimized static output in out/
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Performance Optimization

### Image Optimization
```typescript
import Image from 'next/image'

export function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width={200}
      height={50}
      priority
    />
  )
}
```

### Code Splitting
```typescript
// Automatic with Next.js
// Manual if needed:
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
})
```

### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | <1.8s |
| Largest Contentful Paint (LCP) | <2.5s |
| Cumulative Layout Shift (CLS) | <0.1 |
| Time to Interactive (TTI) | <3.8s |
| Bundle Size (JS) | <200KB |

## 🔄 Swarm Coordination

For major features:

```bash
# Initialize swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 5

# Architecture phase
Task({
  prompt: "Design {{PROJECT_NAME}} feature architecture",
  subagent_type: "system-architect",
  run_in_background: true
})

# Implementation phase
Task({
  prompt: "Implement feature components and pages",
  subagent_type: "coder",
  run_in_background: true
})

# Testing phase
Task({
  prompt: "Write unit and E2E tests",
  subagent_type: "tester",
  run_in_background: true
})

# Review phase
Task({
  prompt: "Code review and performance optimization",
  subagent_type: "reviewer",
  run_in_background: true
})
```

## 🧠 Memory Integration

Store application patterns:

```bash
# Store component pattern
npx @claude-flow/cli@latest memory store \
  --key "{{PROJECT_NAME}}-component-pattern" \
  --value "Component architecture approach" \
  --namespace app-patterns

# Search for UI patterns
npx @claude-flow/cli@latest memory search \
  --query "form handling patterns"
```

## Accessibility (a11y)

### WCAG 2.1 Level AA Compliance
```typescript
// Semantic HTML
<button aria-label="Close menu">X</button>
<a href="/page" title="Page title">Link</a>

// ARIA attributes
<div role="navigation" aria-label="Main navigation">
  <ul>...</ul>
</div>

// Focus management
const ref = useRef<HTMLDivElement>(null)
```

## SEO Optimization

### Next.js SEO
```typescript
// Metadata
export const metadata: Metadata = {
  title: '{{PROJECT_NAME}}',
  description: '{{DESCRIPTION}}',
  openGraph: {
    title: '{{PROJECT_NAME}}',
    description: '{{DESCRIPTION}}',
  },
}
```

## Quick Reference

```bash
# Development
npm install
npm run dev

# Testing
npm test                    # Unit tests
npm run test:coverage       # With coverage
npm run test:e2e           # E2E tests

# Building
npm run build
npm start

# Code quality
npm run lint
npm run format
npm run type-check

# Deployment
npm run build:docker
docker run -p 3000:3000 {{PROJECT_NAME}}
```

## Documentation References

- **Project Root**: `CLAUDE.md` - Overall architecture
- **Claude Flow**: `.claude-flow/CAPABILITIES.md` - V3 reference
- **Components**: `docs/components.md` - Component library
- **Next.js**: https://nextjs.org/docs - Official docs

## Version

Created: {{DATE}}
Application: {{PROJECT_NAME}}
Type: Frontend Application
Namespace: {{NAMESPACE}}
Tech Stack: {{TECH_STACK}}
Architecture: Claude Flow V3
Last Updated: {{TIMESTAMP}}
