# Nyra CRM - CLAUDE.md

**Profile**: nextjs-typescript
**Generated**: 2026-01-09

## 🎯 Project Overview

Customer Relationship Management system for mortgage leads

## 🏗️ Architecture

**Tech Stack**: Next.js 14, React 18, TypeScript, Prisma, PostgreSQL
**Port**: 3003
**Type**: Next.js Application

## 📋 Development Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint
```

## 🧠 Claude Flow V3 Integration

### 3-Tier Model Routing (ADR-026)

```bash
# Get routing recommendation before work
npx @claude-flow/cli@latest hooks pre-task \
  --description "CRM lead management feature development"
```

### Available Agents

- **coder**: CRM feature implementation
- **backend-dev**: API and database operations
- **reviewer**: Code quality and security review
- **tester**: Unit and integration testing
- **compliance-architect**: Mortgage compliance validation

### Recommended Workflows

**1. Lead Management Feature**
```bash
# Initialize swarm for CRM work
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 5 --strategy specialized

# Store CRM context
npx @claude-flow/cli@latest memory store \
  --namespace crm \
  --key "leads/workflow" \
  --value "Lead capture, assignment, tracking, conversion"
```

**2. TwentyCRM Integration**
```bash
# Search for integration patterns
npx @claude-flow/cli@latest memory search \
  --query "twentycrm integration api patterns" \
  --namespace patterns

# Store successful integration
npx @claude-flow/cli@latest hooks post-task \
  --task-id "crm-integration-001" \
  --success true \
  --store-results true
```

**3. Database Migration**
```bash
# Pre-migration safety check
npx @claude-flow/cli@latest hooks pre-command \
  --command "prisma migrate dev" \
  --validate-safety true

# Post-migration record
npx @claude-flow/cli@latest hooks post-command \
  --command "prisma migrate dev" \
  --track-metrics true
```

### Auto-Learning Protocol

**Before Development**:
```bash
# Search memory for CRM patterns
npx @claude-flow/cli@latest memory search \
  --query "crm lead management mortgage" \
  --namespace patterns
```

**After Successful Implementation**:
```bash
# Store successful pattern
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "crm-success-$(date +%Y%m%d)" \
  --value "Successfully implemented [feature] in CRM"

# Train neural patterns
npx @claude-flow/cli@latest neural train \
  --pattern-type crm-workflows \
  --epochs 10
```

---

## 🛠️ Tech Stack Specific Guidelines

## Next.js + TypeScript Development Guidelines

### Code Organization
- Use App Router (`app/` directory) for new features
- Organize by feature, not by file type
- Co-locate components with their pages
- Use barrel exports (`index.ts`) for clean imports

### Component Patterns
```typescript
// Server Components (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data.content}</div>;
}

// Client Components (when needed)
'use client';
export function InteractiveComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}
```

### Data Fetching
- Prefer Server Components for data fetching
- Use React Server Components for better performance
- Cache API responses with `fetch()` options
- Use Server Actions for mutations

### Styling
- Tailwind CSS utility-first approach
- Use `cn()` utility for conditional classes
- Shadcn/UI components for consistency
- CSS Modules for component-specific styles

### Type Safety
- Strict TypeScript configuration
- Define props interfaces explicitly
- Use Zod for runtime validation
- Type API responses with generated types

### Performance
- Use `next/image` for optimized images
- Implement proper loading states
- Use dynamic imports for code splitting
- Optimize bundle size with tree shaking

### Testing
- Jest + React Testing Library
- E2E tests with Playwright
- Test Server Components with async utilities
- Mock API calls appropriately

### Best Practices
- Follow Next.js 14 conventions
- Use TypeScript strict mode
- Implement proper error boundaries
- Use Server Actions instead of API routes when possible
- Optimize for Web Vitals (LCP, FID, CLS)


---

## 🔒 CRM-Specific Security & Compliance

### Data Protection
- Encrypt all PII (names, contact info, financial data)
- Role-based access control (RBAC)
- Audit logging for all lead access and modifications
- Session timeout after 30 minutes

### Mortgage Compliance
- Fair lending practices (no discriminatory data)
- Equal Housing Opportunity compliance
- TCPA compliance for communication consent
- Data retention (3+ years for mortgage records)

## 🔄 Integration Points

### TwentyCRM (Port 3000)
- Lead CRUD operations
- Pipeline management
- Activity tracking
- Contact management

### Quote Engine (Port 8001)
- Rate calculations for leads
- Loan product recommendations

### Campaign Engine (Port 8002)
- Automated drip campaigns
- Lead nurturing workflows

### Mem0 (Port 4321)
- Conversation history
- Lead interaction tracking

## 📚 Related Documentation

- **Root CLAUDE.md**: V3 orchestration patterns
- **apps/web/CLAUDE.md**: Web application ecosystem
- **TwentyCRM API**: CRM backend documentation

## 📝 Notes

- Integrated with TwentyCRM for data persistence
- Real-time updates via WebSocket
- Comprehensive lead lifecycle management
- Claude Flow V3 hooks and memory integration
- Mortgage-specific compliance features
