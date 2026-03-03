# GitHub Copilot Instructions - Project Nyra

This file defines repository-wide standards for GitHub Copilot coding agents working in the Project Nyra monorepo.

## Project Overview

**Project Nyra** is an AI-powered mortgage automation platform featuring:
- Multi-agent orchestration (Claude Flow V3, Archon OS)
- Microservices architecture (14 backend services)
- Modern frontend applications (5 Next.js apps)
- Distributed deployment (4-PC Windows architecture with GPU workers)

## Repository Structure

```
Project-Nyra/
├── apps/           # Frontend applications (Next.js 14, React 18)
├── services/       # Backend microservices (Node.js, Python FastAPI)
├── packages/       # Shared libraries (database, types, utils, config)
├── infra/          # Infrastructure as code (Docker, K8s)
├── bootstrap/      # Installation system (GUI installer, PowerShell scripts)
├── orchestration/  # Multi-agent orchestration (Claude Flow, Archon OS)
├── docs/           # Documentation (Markdown, Mermaid diagrams)
└── scripts/        # Automation scripts (PowerShell, Bash)
```

## Technology Stack

### Core Technologies
- **Runtime:** Node.js 20+
- **Languages:** TypeScript 5.7+, Python 3.11+
- **Package Manager:** pnpm 10+ (REQUIRED - DO NOT use npm or yarn)
- **Build System:** Turborepo 2.4+
- **Containerization:** Docker + Docker Compose

### Frontend Stack
- **Framework:** Next.js 14 with App Router
- **UI Library:** React 18
- **State Management:** Zustand, Redux (legacy)
- **Styling:** Tailwind CSS
- **UI Components:** Custom components + Shadcn/ui

### Backend Stack
- **Node.js:** Express.js, Fastify
- **Python:** FastAPI 0.109+
- **Database:** PostgreSQL 16 + Prisma ORM
- **Cache:** Redis 7
- **Message Queue:** RabbitMQ
- **Vector DB:** Qdrant

## Development Commands

### Essential Commands
```bash
# Install dependencies (MUST use pnpm)
pnpm install

# Development mode (all workspaces)
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Database operations
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio
```

### Workspace-Specific Commands
```bash
# Install to specific workspace
pnpm --filter @nyra/[workspace-name] add [package]

# Run dev for specific app
pnpm --filter [app-name] dev

# Build specific service
pnpm --filter @nyra/[service-name] build
```

## Code Style & Standards

### TypeScript
- **Strict mode:** REQUIRED - all TypeScript must use strict mode
- **Naming conventions:**
  - `PascalCase` for types, interfaces, classes, components
  - `camelCase` for variables, functions, methods
  - `SCREAMING_SNAKE_CASE` for constants
- **File naming:**
  - Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
  - Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
  - Types: `*.types.ts` or `types.ts`
  - Tests: `*.test.ts` or `*.spec.ts`

### Python
- **Type hints:** REQUIRED for all function parameters and return types
- **Naming conventions:** Follow PEP 8
  - `snake_case` for functions, variables, module names
  - `PascalCase` for classes
  - `SCREAMING_SNAKE_CASE` for constants
- **Docstrings:** REQUIRED for all public functions and classes
- **Formatting:** Use black formatter (line length: 88)

### React Components
```typescript
// Preferred: Functional components with TypeScript
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // Use hooks for state and effects
  const [user, setUser] = useState<User | null>(null);
  
  // Component logic here
  
  return (
    <div className="user-profile">
      {/* JSX here */}
    </div>
  );
}
```

### API Routes (Next.js)
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Logic here
    return NextResponse.json({ data: [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### FastAPI Services
```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

router = APIRouter()

class QuoteRequest(BaseModel):
    """Quote request model with validation."""
    loan_amount: float
    interest_rate: float
    term_years: int

@router.post("/quotes")
async def create_quote(request: QuoteRequest) -> dict:
    """
    Create a new mortgage quote.
    
    Args:
        request: Quote request with loan parameters
        
    Returns:
        Quote calculation results
        
    Raises:
        HTTPException: If calculation fails
    """
    try:
        # Logic here
        return {"quote_id": "...", "monthly_payment": 0.0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Git Workflow

### Branch Naming
- Feature: `feature/description` or `copilot/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`
- Infrastructure: `infra/description`

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```
feat(auth): add JWT token refresh mechanism

fix(quote-api): correct interest rate calculation
Fixes #123

docs(readme): update installation instructions

chore(deps): update dependencies to latest versions
```

## Testing Standards

### Test Structure
```typescript
// Component tests
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('should render user information', () => {
    render(<UserProfile userId="123" />);
    expect(screen.getByText(/user/i)).toBeInTheDocument();
  });
});
```

### Test Coverage
- **Minimum coverage:** 70% overall
- **Critical paths:** 90%+ coverage required
- **Run coverage:** `pnpm test:coverage`

### Test Locations
- Unit tests: `*.test.ts` or `*.spec.ts` next to source files
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/`

## Prohibited Actions

**NEVER do the following:**

### Package Management
- ❌ DO NOT use `npm install` or `yarn install`
- ✅ ALWAYS use `pnpm install`

### File Modifications
- ❌ DO NOT modify `pnpm-lock.yaml` manually
- ❌ DO NOT modify Prisma migration files after creation
- ❌ DO NOT modify files in `node_modules/`
- ❌ DO NOT modify `.git/` directory
- ❌ DO NOT commit secrets, API keys, or credentials

### Code Patterns
- ❌ DO NOT use `any` type in TypeScript (use `unknown` if needed)
- ❌ DO NOT skip error handling in API routes
- ❌ DO NOT use `console.log` in production code (use proper logging)
- ❌ DO NOT commit commented-out code
- ❌ DO NOT modify core infrastructure without explicit approval

### Build Artifacts
- ❌ DO NOT commit `dist/` or `build/` directories
- ❌ DO NOT commit `.next/` directories
- ❌ DO NOT commit `coverage/` directories
- ❌ DO NOT commit `.env` files (only `.env.example`)

## Project-Specific Guidelines

### Monorepo Management
- Use workspace protocol for internal dependencies: `"workspace:*"`
- Run `pnpm monorepo:check` before committing
- Keep dependencies in sync across workspaces using syncpack

### Database Changes
1. Create migration: `pnpm db:migrate dev --name migration_name`
2. Review generated SQL
3. Test migration with rollback
4. Update seed data if needed
5. Document breaking changes

### Docker Development
- Use multi-stage builds for efficiency
- Tag images with semantic versions
- Test images locally before pushing
- Document port mappings in comments

### Environment Variables
- Define all variables in `.env.example`
- Use descriptive names: `SERVICE_NAME_CONFIG_OPTION`
- Document purpose and expected values
- Never commit actual `.env` files

## AI Orchestration

This repository uses **Claude Flow V3** for multi-agent orchestration. Reference the root `CLAUDE.md` file for:
- Agent routing and anti-drift configuration
- Swarm initialization patterns
- Memory management
- Hook system usage
- Background workers

**Key principles:**
- Use CLI tools for coordination (`npx @claude-flow/cli@latest`)
- Spawn agents with clear, specific instructions
- Store successful patterns in memory
- Leverage background workers for optimization

## Documentation Standards

### Code Comments
- Document WHY, not WHAT (code should be self-explanatory)
- Use JSDoc/TSDoc for public APIs
- Keep comments up-to-date with code changes

### Markdown Documentation
- Use descriptive headings
- Include code examples where helpful
- Add Mermaid diagrams for architecture
- Keep table of contents updated

### API Documentation
- Document all endpoints with request/response examples
- Include error codes and meanings
- Specify authentication requirements
- Provide curl examples

## Performance Considerations

### Frontend
- Use `next/image` for images (automatic optimization)
- Implement code splitting for large components
- Use React.memo() for expensive renders
- Lazy load routes and components

### Backend
- Use connection pooling for database
- Implement caching strategies (Redis)
- Use pagination for large datasets
- Profile performance-critical paths

### Database
- Index foreign keys and frequently queried columns
- Use Prisma query optimization
- Avoid N+1 queries
- Monitor slow query logs

## Security Guidelines

### Input Validation
- Validate all user input on server-side
- Use Zod or Yup for schema validation
- Sanitize data before database operations
- Implement rate limiting on APIs

### Authentication & Authorization
- Use JWT tokens with refresh mechanism
- Implement role-based access control (RBAC)
- Hash passwords with bcrypt (cost factor: 12)
- Use secure session management

### Secrets Management
- Use environment variables
- Integrate with Infisical for production
- Rotate credentials regularly
- Never log sensitive data

## Additional Resources

### Internal Documentation
- [Root CLAUDE.md](../CLAUDE.md) - AI agent orchestration guide
- [README.md](../README.md) - Project overview
- [Component CLAUDE.md files](../CLAUDE.md#-component-guide-index) - Tech-stack-specific guides
- [Bootstrap Documentation](../bootstrap/README.md) - Installation guide

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Claude Flow Documentation](https://github.com/ruvnet/claude-flow)

---

**Last Updated:** 2026-01-18
**Maintainer:** Project Nyra Team
