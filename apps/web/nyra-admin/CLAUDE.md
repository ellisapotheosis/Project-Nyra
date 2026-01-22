# Nyra Admin Panel - CLAUDE.md

**Profile**: nextjs-typescript
**Generated**: 2026-01-09

## 🎯 Project Overview

Administrative dashboard for mortgage operations, lead management, and campaign orchestration

## 🏗️ Architecture

**Tech Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS, Shadcn/UI
**Port**: 3008
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

### 3-Tier Model Routing

```bash
npx @claude-flow/cli@latest hooks pre-task \
  --description "Admin dashboard feature development"
```

### Available Agents

- **coder**: Admin feature implementation
- **reviewer**: Security and code review
- **tester**: Comprehensive testing
- **frontend-specialist**: React/Vite optimization
- **security-architect**: Admin security features

### Recommended Workflows

**1. Admin Feature Development (SPARC)**
```bash
# Initialize SPARC workflow
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized

# Store admin context
npx @claude-flow/cli@latest memory store \
  --namespace admin \
  --key "features/[name]" \
  --value "Admin feature requirements and access controls"
```

**2. User Management**
```bash
# Search for RBAC patterns
npx @claude-flow/cli@latest memory search \
  --query "role-based access control admin" \
  --namespace patterns
```

**3. System Configuration**
```bash
# Pre-config change safety
npx @claude-flow/cli@latest hooks pre-task \
  --description "System configuration change" \
  --coordinate-swarm true
```

### Auto-Learning Protocol

**Before Development**:
```bash
npx @claude-flow/cli@latest memory search \
  --query "admin dashboard security patterns" \
  --namespace patterns
```

**After Successful Implementation**:
```bash
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "admin-success-$(date +%Y%m%d)" \
  --value "Implemented secure [feature] in admin panel"

npx @claude-flow/cli@latest neural train \
  --pattern-type admin-security \
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

## 🔒 Admin-Specific Security

### Access Control
- Role-based permissions (Super Admin, Admin, Manager, Viewer)
- Multi-factor authentication required
- IP whitelisting support
- Session management with strict timeouts

### Audit Logging
- Log all admin actions
- Track configuration changes
- Monitor user management operations
- Retain logs for compliance (3+ years)

### Security Features
- CSRF protection
- XSS prevention
- Input sanitization
- Secure session handling

## 🎯 Admin Features

### User Management
- Create/edit/deactivate users
- Assign roles and permissions
- Password reset workflows
- Activity monitoring

### System Configuration
- Environment variable management
- Feature flags
- API key rotation
- Integration settings

### Monitoring & Observability
- System health dashboards
- Error tracking and alerts
- Performance metrics
- Audit trail viewer

### Operations
- Backup and restore
- Database maintenance
- Cache management
- Log viewing and export

## 🔄 Integration Points

- **All Services**: Admin can configure and monitor all system components
- **TwentyCRM**: User and data management
- **Nexus Router**: LLM provider configuration
- **Quote/Campaign Engines**: Service configuration

## 📚 Related Documentation

- **Root CLAUDE.md**: V3 orchestration patterns
- **apps/web/CLAUDE.md**: Web ecosystem overview
- **Security documentation**: Admin security best practices

## 📝 Notes

- Critical operations dashboard for Project Nyra
- React 19 + Vite for fast performance
- TanStack Query for data management
- Enhanced security for administrative access
- Claude Flow V3 integrated development
- Comprehensive audit logging
