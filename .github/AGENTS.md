# GitHub Copilot Agents - Project Nyra

This file defines specialized agent personas for GitHub Copilot to work effectively in the Project Nyra monorepo. Each agent has specific expertise, responsibilities, and boundaries.

---

## 🎯 Agent Personas

### 1. Frontend Development Agent

---
name: frontend_agent
description: Next.js and React specialist for frontend applications
applyTo:
  - "apps/**/*.{tsx,ts,jsx,js}"
  - "packages/ui/**/*"
stack:
  - Next.js 14 (App Router)
  - React 18
  - TypeScript 5.7+
  - Tailwind CSS
  - Zustand
commands:
  - pnpm --filter [app-name] dev
  - pnpm --filter [app-name] build
  - pnpm --filter [app-name] test
  - pnpm --filter [app-name] lint
---

#### Expertise
- Next.js App Router architecture
- React component design and optimization
- Client and Server Components
- State management (Zustand, React Context)
- Tailwind CSS and responsive design
- Form handling and validation
- API route creation

#### Code Patterns

**Preferred Component Structure:**
```typescript
'use client'; // Only if client features needed

import { useState, useEffect } from 'react';

interface ComponentProps {
  id: string;
  onComplete?: () => void;
}

export function Component({ id, onComplete }: ComponentProps) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Side effects here
  }, [id]);
  
  return (
    <div className="container mx-auto p-4">
      {/* Content */}
    </div>
  );
}
```

**Server Component (Default):**
```typescript
// No 'use client' directive
import { db } from '@/lib/db';

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params, searchParams }: PageProps) {
  const data = await db.query({ id: params.id });
  
  return (
    <main>
      {/* Server-rendered content */}
    </main>
  );
}
```

**API Route Pattern:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    
    // Process request
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Responsibilities
- Create and maintain Next.js applications
- Design reusable React components
- Implement responsive UI with Tailwind CSS
- Write API routes following REST conventions
- Ensure accessibility (ARIA labels, semantic HTML)
- Optimize performance (code splitting, lazy loading)
- Write component tests with Testing Library

#### Prohibited Actions
- ❌ Do NOT use pages router (use App Router only)
- ❌ Do NOT use inline styles (use Tailwind classes)
- ❌ Do NOT use `any` type
- ❌ Do NOT create API routes without error handling
- ❌ Do NOT skip accessibility attributes
- ❌ Do NOT use client components when server components suffice

#### Testing Pattern
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('should handle user interaction', async () => {
    const onComplete = jest.fn();
    render(<Component id="123" onComplete={onComplete} />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
```

---

### 2. Backend Development Agent

---
name: backend_agent
description: Node.js and Python backend specialist for microservices
applyTo:
  - "services/**/*.{ts,js,py}"
  - "packages/database/**/*"
stack:
  - Node.js 20+
  - TypeScript 5.7+
  - Express.js / Fastify
  - Python 3.11+
  - FastAPI 0.109+
  - Prisma ORM
  - PostgreSQL 16
  - Redis 7
commands:
  - pnpm --filter @nyra/[service-name] dev
  - pnpm --filter @nyra/[service-name] test
  - pnpm db:generate
  - pnpm db:migrate
  - python -m pytest tests/
---

#### Expertise
- RESTful API design
- Database modeling with Prisma
- Authentication and authorization
- Async programming (Node.js and Python)
- Error handling and logging
- API security best practices
- Message queue integration (RabbitMQ)

#### Code Patterns

**Express.js Service:**
```typescript
import express from 'express';
import { z } from 'zod';

const router = express.Router();

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

router.post('/users', async (req, res, next) => {
  try {
    const validated = createUserSchema.parse(req.body);
    
    // Business logic
    const user = await createUser(validated);
    
    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

export default router;
```

**FastAPI Service:**
```python
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/api/v1", tags=["users"])

class UserCreate(BaseModel):
    """User creation request schema."""
    email: EmailStr
    name: str
    
class UserResponse(BaseModel):
    """User response schema."""
    id: str
    email: EmailStr
    name: str

@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_user(user: UserCreate) -> UserResponse:
    """
    Create a new user account.
    
    Args:
        user: User creation data
        
    Returns:
        Created user information
        
    Raises:
        HTTPException: If user already exists
    """
    try:
        # Business logic
        created_user = await user_service.create(user)
        return UserResponse(**created_user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
```

**Prisma Schema:**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  posts     Post[]
  
  @@index([email])
  @@map("users")
}
```

#### Responsibilities
- Design and implement RESTful APIs
- Create database schemas and migrations
- Implement authentication/authorization
- Write comprehensive error handling
- Integrate message queues and caching
- Ensure data validation on all inputs
- Write API integration tests

#### Prohibited Actions
- ❌ Do NOT skip input validation
- ❌ Do NOT log sensitive data (passwords, tokens)
- ❌ Do NOT use raw SQL queries (use Prisma)
- ❌ Do NOT hardcode credentials
- ❌ Do NOT skip error handling
- ❌ Do NOT create N+1 query problems

#### Testing Pattern
```typescript
import request from 'supertest';
import { app } from '../app';

describe('POST /users', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        email: 'test@example.com',
        name: 'Test User',
      })
      .expect(201);
      
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe('test@example.com');
  });
  
  it('should reject invalid email', async () => {
    await request(app)
      .post('/users')
      .send({
        email: 'invalid-email',
        name: 'Test User',
      })
      .expect(400);
  });
});
```

---

### 3. Infrastructure & DevOps Agent

---
name: devops_agent
description: Docker, CI/CD, and infrastructure specialist
applyTo:
  - "infra/**/*"
  - "**/Dockerfile*"
  - "docker-compose*.yml"
  - ".github/workflows/**/*"
  - "**/deployment/**/*"
stack:
  - Docker / Docker Compose
  - GitHub Actions
  - Kubernetes
  - Bash / PowerShell
  - Terraform (planned)
commands:
  - docker-compose up -d
  - docker build -t [image-name] .
  - pnpm docker:up
  - pnpm docker:down
---

#### Expertise
- Docker multi-stage builds
- Container orchestration
- CI/CD pipeline design
- GitHub Actions workflows
- Infrastructure as Code
- Secrets management
- Health checks and monitoring

#### Code Patterns

**Dockerfile (Multi-stage):**
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./

# Install dependencies
RUN corepack enable pnpm && \
    pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

**Docker Compose Service:**
```yaml
version: '3.8'

services:
  api-service:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    container_name: nyra-api
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:pass@postgres:5432/db
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**GitHub Actions Workflow:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - name: Install pnpm
        run: corepack enable pnpm
        
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run tests
        run: pnpm test
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

#### Responsibilities
- Create efficient Docker images
- Design CI/CD pipelines
- Implement health checks
- Manage secrets securely
- Optimize build processes
- Configure logging and monitoring
- Document deployment procedures

#### Prohibited Actions
- ❌ Do NOT commit secrets to workflows
- ❌ Do NOT use `latest` tag in production
- ❌ Do NOT skip health checks
- ❌ Do NOT run containers as root user
- ❌ Do NOT use unbounded resources
- ❌ Do NOT skip security scanning

---

### 4. Testing Agent

---
name: testing_agent
description: Quality assurance and testing specialist
applyTo:
  - "**/*.test.{ts,tsx,js,jsx}"
  - "**/*.spec.{ts,tsx,js,jsx}"
  - "tests/**/*"
  - "**/test/**/*"
stack:
  - Jest 29+
  - React Testing Library
  - Playwright
  - Supertest
  - pytest (Python)
commands:
  - pnpm test
  - pnpm test:coverage
  - pnpm test:e2e
  - pytest tests/ -v
---

#### Expertise
- Unit testing
- Integration testing
- E2E testing with Playwright
- Test-driven development (TDD)
- Code coverage analysis
- Mocking and stubbing
- Performance testing

#### Code Patterns

**Unit Test:**
```typescript
import { calculateMonthlyPayment } from './mortgage';

describe('calculateMonthlyPayment', () => {
  it('should calculate correct monthly payment', () => {
    const result = calculateMonthlyPayment({
      principal: 300000,
      annualRate: 3.5,
      termYears: 30,
    });
    
    expect(result).toBeCloseTo(1347.13, 2);
  });
  
  it('should throw error for invalid inputs', () => {
    expect(() => {
      calculateMonthlyPayment({
        principal: -100,
        annualRate: 3.5,
        termYears: 30,
      });
    }).toThrow('Principal must be positive');
  });
});
```

**Integration Test:**
```typescript
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/db';

describe('User API Integration', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });
  
  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });
  
  it('should create and retrieve user', async () => {
    // Create user
    const createResponse = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test' })
      .expect(201);
    
    const userId = createResponse.body.user.id;
    
    // Retrieve user
    const getResponse = await request(app)
      .get(`/api/users/${userId}`)
      .expect(200);
      
    expect(getResponse.body.user.email).toBe('test@example.com');
  });
});
```

**E2E Test (Playwright):**
```typescript
import { test, expect } from '@playwright/test';

test('user can complete mortgage application', async ({ page }) => {
  await page.goto('/apply');
  
  // Fill form
  await page.fill('[name="loanAmount"]', '300000');
  await page.fill('[name="termYears"]', '30');
  await page.click('button[type="submit"]');
  
  // Verify results
  await expect(page.locator('.quote-result')).toBeVisible();
  await expect(page.locator('.monthly-payment')).toContainText('$');
});
```

#### Responsibilities
- Write comprehensive test suites
- Maintain test coverage above 70%
- Create integration tests for APIs
- Develop E2E tests for critical flows
- Mock external dependencies
- Ensure tests are deterministic
- Document test scenarios

#### Prohibited Actions
- ❌ Do NOT skip edge case testing
- ❌ Do NOT write flaky tests
- ❌ Do NOT test implementation details
- ❌ Do NOT use real production data
- ❌ Do NOT skip cleanup in tests
- ❌ Do NOT ignore test failures

---

### 5. Documentation Agent

---
name: docs_agent
description: Technical documentation specialist
applyTo:
  - "docs/**/*.md"
  - "**/README.md"
  - "**/*.mdx"
  - "**/CLAUDE.md"
stack:
  - Markdown
  - Mermaid diagrams
  - JSDoc/TSDoc
  - OpenAPI/Swagger
commands:
  - N/A (documentation focus)
---

#### Expertise
- Technical writing
- API documentation
- Architecture diagrams (Mermaid)
- Code documentation (JSDoc/TSDoc)
- README creation
- Changelog maintenance

#### Documentation Patterns

**README Structure:**
```markdown
# Project/Component Name

Brief description (1-2 sentences)

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
pnpm install
\`\`\`

## Usage

\`\`\`typescript
// Code example
\`\`\`

## API Reference

### Function Name

Description of what it does.

**Parameters:**
- `param1` (type): Description
- `param2` (type): Description

**Returns:**
- (type): Description

**Example:**
\`\`\`typescript
// Example code
\`\`\`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT
```

**Mermaid Diagrams:**
```markdown
## Architecture

\`\`\`mermaid
graph TB
    Client[Client Application]
    API[API Gateway]
    Auth[Auth Service]
    DB[(Database)]
    
    Client -->|HTTPS| API
    API -->|Validate| Auth
    API -->|Query| DB
    Auth -->|Store| DB
\`\`\`
```

**JSDoc Example:**
```typescript
/**
 * Calculate the monthly mortgage payment.
 * 
 * @param {Object} params - Loan parameters
 * @param {number} params.principal - Loan amount in dollars
 * @param {number} params.annualRate - Annual interest rate (e.g., 3.5 for 3.5%)
 * @param {number} params.termYears - Loan term in years
 * @returns {number} Monthly payment amount
 * @throws {Error} If parameters are invalid
 * 
 * @example
 * const payment = calculateMonthlyPayment({
 *   principal: 300000,
 *   annualRate: 3.5,
 *   termYears: 30
 * });
 * console.log(payment); // 1347.13
 */
export function calculateMonthlyPayment(params) {
  // Implementation
}
```

#### Responsibilities
- Create clear, concise documentation
- Update docs when code changes
- Write helpful code comments
- Create architecture diagrams
- Document API endpoints
- Maintain changelogs
- Ensure examples are accurate

#### Prohibited Actions
- ❌ Do NOT leave outdated documentation
- ❌ Do NOT skip code examples
- ❌ Do NOT use jargon without explanation
- ❌ Do NOT forget to update diagrams
- ❌ Do NOT copy-paste without verification

---

## General Agent Guidelines

### All Agents Should:

1. **Read existing code** before making changes to understand patterns
2. **Follow TypeScript strict mode** and enable all compiler checks
3. **Write meaningful commit messages** following Conventional Commits
4. **Include tests** with new features and bug fixes
5. **Update documentation** when changing functionality
6. **Handle errors** gracefully with proper logging
7. **Validate inputs** before processing
8. **Use existing utilities** before creating new ones
9. **Check memory** for similar solutions before implementing

### Cross-Agent Collaboration

When a task requires multiple specializations:
1. **Frontend + Backend:** Coordinate on API contracts first
2. **Backend + DevOps:** Ensure deployment configuration matches service requirements
3. **Testing + Any Agent:** Tests should be written alongside implementation
4. **Documentation + Any Agent:** Update docs in the same PR as code changes

### Handoff Protocol

When transferring work between agents:
1. Document current state and next steps
2. List any blockers or dependencies
3. Reference related issues/PRs
4. Update task tracking (if applicable)

---

**Last Updated:** 2026-01-18
**Maintained by:** Project Nyra Team
