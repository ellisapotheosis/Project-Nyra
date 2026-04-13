# CLAUDE.md - RateHunter.net Landing Page

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files to the root folder**
3. ALWAYS organize files in appropriate subdirectories
4. **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

---

## 🎯 PROJECT CONTEXT

### Application Overview
**RateHunter.net Landing Page** is a high-converting lead generation website for mortgage rate comparisons and real-time quotes.

**Primary Purpose:**
- Capture mortgage leads through intelligent forms
- Showcase competitive mortgage rates in real-time
- Integrate Nyra AI chatbot for instant pre-qualification
- Drive conversions to loan officers via AI-powered routing

**Target Audience:**
- Homebuyers seeking mortgage rates
- Homeowners looking to refinance
- Real estate investors comparing loan products

### Technology Stack

**Frontend Framework:**
- **Next.js 14** (App Router with React Server Components)
- **TypeScript** (strict mode enabled)
- **Tailwind CSS** (utility-first styling)
- **Framer Motion** (animations and transitions)
- **React Hook Form** (form management)
- **Zod** (schema validation)

**Backend Integration:**
- **Next.js API Routes** (serverless functions)
- **PostgreSQL** (via Prisma ORM)
- **Redis** (session caching, rate limiting)
- **Nyra Assistant API** (AI chat integration)

**Infrastructure:**
- **Cloudflare Tunnel** (secure public access)
- **Docker** (containerized deployment)
- **Infisical** (secrets management)
- **Tailscale** (private networking)

**Analytics & Monitoring:**
- **Vercel Analytics** (Core Web Vitals)
- **PostHog** (product analytics, A/B testing)
- **Sentry** (error tracking)
- **LogTail** (structured logging)

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                  RateHunter.net Landing                      │
│                  (Next.js 14 + TypeScript)                   │
└────────────────────┬───────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┬─────────────────┐
     │               │               │                 │
┌────▼────┐    ┌────▼────┐    ┌────▼────┐      ┌────▼────┐
│ Hero +  │    │  Rate   │    │  Lead   │      │  Nyra   │
│CTA Form │    │Calculator│    │ Capture │      │ Chatbot │
└────┬────┘    └────┬────┘    └────┬────┘      └────┬────┘
     │               │               │                 │
     └───────────────┴───────────────┴─────────────────┘
                     │
     ┌───────────────┼───────────────────────────┐
     │               │                           │
┌────▼────┐    ┌────▼────┐              ┌──────▼──────┐
│PostgreSQL│    │  Redis  │              │Nyra Assistant│
│Database  │    │  Cache  │              │    API       │
└──────────┘    └─────────┘              └──────────────┘
```

### Project Structure

```
apps/ratehunter-landing/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (marketing)/        # Marketing pages group
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── rates/          # Rate comparison pages
│   │   │   ├── about/          # About page
│   │   │   └── contact/        # Contact page
│   │   ├── api/                # API routes
│   │   │   ├── leads/          # Lead capture endpoints
│   │   │   ├── rates/          # Rate fetching endpoints
│   │   │   └── chat/           # Nyra chatbot proxy
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── forms/              # Form components
│   │   │   ├── LeadCaptureForm.tsx
│   │   │   ├── RateQuoteForm.tsx
│   │   │   └── ContactForm.tsx
│   │   ├── calculators/        # Calculator widgets
│   │   │   ├── MortgageCalculator.tsx
│   │   │   ├── AffordabilityCalculator.tsx
│   │   │   └── RefinanceCalculator.tsx
│   │   ├── chat/               # Chatbot components
│   │   │   ├── NyraChatWidget.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── ui/                 # UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   └── sections/           # Page sections
│   │       ├── Hero.tsx
│   │       ├── RateDisplay.tsx
│   │       ├── Testimonials.tsx
│   │       └── Footer.tsx
│   ├── lib/                    # Utility libraries
│   │   ├── prisma.ts           # Prisma client
│   │   ├── redis.ts            # Redis client
│   │   ├── api-client.ts       # API utilities
│   │   └── validation.ts       # Zod schemas
│   ├── hooks/                  # Custom React hooks
│   │   ├── useLeadCapture.ts
│   │   ├── useRateQuote.ts
│   │   └── useNyraChat.ts
│   ├── types/                  # TypeScript definitions
│   │   ├── lead.ts
│   │   ├── rate.ts
│   │   └── chat.ts
│   └── styles/                 # Global styles
│       └── globals.css
├── public/                     # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
├── prisma/                     # Database schema
│   ├── schema.prisma
│   └── migrations/
├── tests/                      # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                       # Documentation
│   ├── architecture.md
│   ├── deployment.md
│   └── api.md
├── scripts/                    # Build/deploy scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── seed-db.sh
├── .env.example                # Environment template
├── docker-compose.yml          # Local development
├── Dockerfile                  # Production container
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

---

## 🔧 DEVELOPMENT PATTERNS

### Next.js 14 Best Practices

**Server Components (Default):**
```typescript
// app/(marketing)/page.tsx - Server Component
import { prisma } from '@/lib/prisma';
import { Hero } from '@/components/sections/Hero';
import { RateDisplay } from '@/components/sections/RateDisplay';

export const metadata = {
  title: 'RateHunter.net - Find the Best Mortgage Rates',
  description: 'Compare mortgage rates from top lenders instantly',
};

async function getCurrentRates() {
  const rates = await prisma.mortgageRate.findMany({
    where: { isActive: true },
    orderBy: { rate: 'asc' },
    take: 5,
  });
  return rates;
}

export default async function HomePage() {
  const rates = await getCurrentRates();

  return (
    <main>
      <Hero />
      <RateDisplay rates={rates} />
    </main>
  );
}
```

**Client Components (Interactive):**
```typescript
// components/forms/LeadCaptureForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, type LeadFormData } from '@/lib/validation';
import { useLeadCapture } from '@/hooks/useLeadCapture';

export function LeadCaptureForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const { submitLead, isSubmitting } = useLeadCapture();

  const onSubmit = async (data: LeadFormData) => {
    await submitLead(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit" disabled={isSubmitting}>
        Get Rate Quote
      </button>
    </form>
  );
}
```

### API Route Patterns

**Lead Capture Endpoint:**
```typescript
// app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { leadSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await rateLimit.check(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const validated = leadSchema.parse(body);

    // Store lead in database
    const lead = await prisma.lead.create({
      data: {
        email: validated.email,
        phone: validated.phone,
        loanAmount: validated.loanAmount,
        propertyType: validated.propertyType,
        creditScore: validated.creditScore,
        source: 'landing_page',
        ipAddress: ip,
      },
    });

    // Cache lead ID for quick lookup
    await redis.setex(`lead:${lead.id}`, 3600, JSON.stringify(lead));

    // Trigger Nyra Assistant workflow
    await fetch(process.env.NYRA_API_URL + '/api/leads/qualify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: lead.id }),
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Lead captured successfully',
    });

  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    );
  }
}
```

### Validation Schemas

**Zod Schemas:**
```typescript
// lib/validation.ts
import { z } from 'zod';

export const leadSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  loanAmount: z.number().min(50000).max(5000000),
  propertyType: z.enum(['single_family', 'condo', 'townhouse', 'multi_family']),
  propertyValue: z.number().min(50000).max(10000000),
  creditScore: z.number().min(300).max(850).optional(),
  downPayment: z.number().min(0).optional(),
  zipCode: z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
  isFirstTimeHomeBuyer: z.boolean().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

export const rateQuoteSchema = z.object({
  loanAmount: z.number().min(50000),
  propertyValue: z.number().min(50000),
  creditScore: z.number().min(300).max(850),
  loanType: z.enum(['conventional', 'fha', 'va', 'usda']),
  loanTerm: z.enum(['15', '20', '30']),
  zipCode: z.string().regex(/^\d{5}$/),
});

export type RateQuoteData = z.infer<typeof rateQuoteSchema>;
```

### Component Styling Patterns

**Tailwind CSS with TypeScript:**
```typescript
// components/ui/Button.tsx
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border border-gray-300 hover:bg-gray-100',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

---

## 🐝 SWARM ORCHESTRATION

### Agent Roles for RateHunter Landing

**1. Frontend UI Agent (React + Next.js)**
- **Responsibilities**: Build landing page components, forms, calculators
- **Coordination**: Share component APIs via memory
- **Tools**: React, TypeScript, Tailwind CSS

**2. Backend API Agent (Next.js API Routes)**
- **Responsibilities**: Create API endpoints for lead capture, rate fetching
- **Coordination**: Document API contracts in memory
- **Tools**: Next.js API Routes, Prisma, Redis

**3. Integration Agent (Nyra Assistant + External APIs)**
- **Responsibilities**: Integrate Nyra chatbot, rate providers, LOS systems
- **Coordination**: Track integration status in memory
- **Tools**: API clients, webhooks, event handlers

**4. Database Agent (PostgreSQL + Prisma)**
- **Responsibilities**: Design schema, migrations, queries
- **Coordination**: Store schema documentation in memory
- **Tools**: Prisma, PostgreSQL, migrations

**5. Testing Agent (Jest + Playwright)**
- **Responsibilities**: Unit tests, integration tests, E2E tests
- **Coordination**: Report test coverage in memory
- **Tools**: Jest, React Testing Library, Playwright

**6. DevOps Agent (Docker + Cloudflare)**
- **Responsibilities**: Containerization, deployment, CI/CD
- **Coordination**: Track deployment status in memory
- **Tools**: Docker, Cloudflare Tunnel, GitHub Actions

### Swarm Coordination Pattern

**Initialize Swarm:**
```bash
# Set up coordination topology for landing page development
npx claude-flow@alpha swarm init --topology mesh --agents 6

# Spawn specialized agents
npx claude-flow@alpha agent spawn --type frontend-dev --name "UI Builder"
npx claude-flow@alpha agent spawn --type backend-dev --name "API Developer"
npx claude-flow@alpha agent spawn --type integration --name "Integration Specialist"
npx claude-flow@alpha agent spawn --type database --name "Database Architect"
npx claude-flow@alpha agent spawn --type tester --name "QA Engineer"
npx claude-flow@alpha agent spawn --type devops --name "DevOps Engineer"
```

**Task Orchestration:**
```bash
# Parallel task execution
npx claude-flow@alpha task orchestrate --task "Build landing page" --strategy parallel --agents 6
```

### Agent Hooks Integration

**Every Agent MUST Use Hooks:**

**Pre-Task Hook:**
```bash
npx claude-flow@alpha hooks pre-task \
  --description "Building RateHunter landing page components" \
  --agent-id "ui-builder"
```

**Post-Edit Hook:**
```bash
npx claude-flow@alpha hooks post-edit \
  --file "src/components/forms/LeadCaptureForm.tsx" \
  --memory-key "ratehunter/components/lead-capture-form"
```

**Session Management:**
```bash
# Restore previous session
npx claude-flow@alpha hooks session-restore --session-id "ratehunter-landing-001"

# End session and export metrics
npx claude-flow@alpha hooks session-end --export-metrics true
```

---

## 🧠 MEMORY MANAGEMENT

### Context Storage Patterns

**Store Project Context:**
```bash
npx claude-flow@alpha memory store \
  --key "ratehunter/context" \
  --namespace "project" \
  --value '{
    "app": "RateHunter.net Landing",
    "tech_stack": ["Next.js 14", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "Redis"],
    "infrastructure": ["Docker", "Cloudflare Tunnel", "Infisical", "Tailscale"],
    "integrations": ["Nyra Assistant API", "Mortgage Rate Providers"]
  }'
```

**Store Component Architecture:**
```bash
npx claude-flow@alpha memory store \
  --key "ratehunter/components/architecture" \
  --namespace "coordination" \
  --value '{
    "layout": "App Router with Server/Client Components",
    "forms": ["LeadCaptureForm", "RateQuoteForm", "ContactForm"],
    "calculators": ["MortgageCalculator", "AffordabilityCalculator"],
    "chat": ["NyraChatWidget", "ChatMessage", "ChatInput"],
    "state_management": "React Hook Form + Zod validation"
  }'
```

**Store API Contracts:**
```bash
npx claude-flow@alpha memory store \
  --key "ratehunter/api/contracts" \
  --namespace "integration" \
  --value '{
    "POST /api/leads": "Lead capture endpoint with rate limiting",
    "GET /api/rates": "Real-time mortgage rate fetching",
    "POST /api/chat": "Nyra chatbot proxy endpoint",
    "POST /api/calculate": "Mortgage calculation endpoint"
  }'
```

### Decision Tracking

**Store Architectural Decisions:**
```bash
npx claude-flow@alpha memory store \
  --key "ratehunter/decisions/architecture" \
  --namespace "project" \
  --value '{
    "framework": {"decision": "Next.js 14 App Router", "rationale": "RSC for performance, SEO"},
    "styling": {"decision": "Tailwind CSS", "rationale": "Rapid prototyping, consistent design"},
    "forms": {"decision": "React Hook Form + Zod", "rationale": "Type-safe validation, performance"},
    "deployment": {"decision": "Cloudflare Tunnel", "rationale": "Secure public access without exposing IPs"}
  }'
```

---

## 🚀 DEPLOYMENT & CI/CD

### Docker Configuration

**Dockerfile (Multi-stage Build):**
```dockerfile
# apps/ratehunter-landing/Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**Docker Compose (Development):**
```yaml
# apps/ratehunter-landing/docker-compose.yml
version: '3.9'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ratehunter
      - REDIS_URL=redis://redis:6379
      - NYRA_API_URL=http://nyra-assistant:3001
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
      - redis
    command: npm run dev

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=ratehunter
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Cloudflare Tunnel Setup

**tunnel.yml:**
```yaml
# Cloudflare Tunnel configuration
tunnel: ratehunter-landing
credentials-file: /etc/cloudflared/ratehunter-landing.json

ingress:
  - hostname: ratehunter.net
    service: http://localhost:3000
  - hostname: www.ratehunter.net
    service: http://localhost:3000
  - service: http_status:404
```

### GitHub Actions CI/CD

**Build and Deploy Workflow:**
```yaml
# .github/workflows/deploy-ratehunter.yml
name: Deploy RateHunter Landing

on:
  push:
    branches: [main]
    paths:
      - 'apps/ratehunter-landing/**'
  pull_request:
    branches: [main]
    paths:
      - 'apps/ratehunter-landing/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        working-directory: apps/ratehunter-landing
        run: npm ci

      - name: Run linting
        working-directory: apps/ratehunter-landing
        run: npm run lint

      - name: Run type checking
        working-directory: apps/ratehunter-landing
        run: npm run type-check

      - name: Run tests
        working-directory: apps/ratehunter-landing
        run: npm test -- --coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        working-directory: apps/ratehunter-landing
        run: docker build -t ratehunter-landing:latest .

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        working-directory: apps/ratehunter-landing
        run: |
          ssh deploy@edge-01.nyra.local "cd /apps/ratehunter-landing && \
            docker-compose pull && \
            docker-compose up -d && \
            docker-compose exec web npx prisma migrate deploy"
```

---

## 📊 MONITORING & ANALYTICS

### Performance Monitoring

**Web Vitals Tracking:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**PostHog Analytics Integration:**
```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug();
      },
    });
  }
};

// Track lead capture events
export const trackLeadCapture = (leadData: Partial<LeadFormData>) => {
  posthog.capture('lead_captured', {
    loan_amount: leadData.loanAmount,
    property_type: leadData.propertyType,
    credit_score_range: leadData.creditScore ? Math.floor(leadData.creditScore / 100) * 100 : null,
  });
};
```

### Error Tracking

**Sentry Configuration:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

---

## 🔒 SECURITY & COMPLIANCE

### Security Best Practices

**Environment Variables (via Infisical):**
```bash
# Fetch secrets from Infisical
npx infisical export --env=production --format=dotenv > .env.production

# Required secrets:
# DATABASE_URL=postgresql://...
# REDIS_URL=redis://...
# NYRA_API_URL=https://...
# NYRA_API_KEY=...
# NEXT_PUBLIC_POSTHOG_KEY=...
# NEXT_PUBLIC_SENTRY_DSN=...
```

**Rate Limiting:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

export const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
});

// Per-IP rate limiting
export const checkRateLimit = async (ip: string) => {
  const { success, limit, reset, remaining } = await rateLimit.limit(ip);
  return { success, limit, reset, remaining };
};
```

**Input Sanitization:**
```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    KEEP_CONTENT: true,
  });
};

export const sanitizeLeadData = (data: LeadFormData): LeadFormData => {
  return {
    ...data,
    firstName: sanitizeInput(data.firstName),
    lastName: sanitizeInput(data.lastName),
    email: data.email.toLowerCase().trim(),
    phone: data.phone.replace(/\D/g, ''),
  };
};
```

### Compliance (TCPA, GDPR)

**Cookie Consent:**
```typescript
// components/CookieConsent.tsx
'use client';

import { useState, useEffect } from 'react';
import { setCookie, getCookie } from 'cookies-next';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = getCookie('cookie-consent');
    if (!consent) setShowBanner(true);
  }, []);

  const acceptCookies = () => {
    setCookie('cookie-consent', 'accepted', { maxAge: 365 * 24 * 60 * 60 });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p>We use cookies to improve your experience. By continuing, you agree to our cookie policy.</p>
        <button onClick={acceptCookies} className="btn-primary ml-4">Accept</button>
      </div>
    </div>
  );
}
```

---

## 🔗 DEPENDENCIES & INTEGRATIONS

### Integration with Project-Nyra Components

**1. Nyra Assistant Integration:**
```typescript
// lib/nyra-client.ts
export const nyraClient = {
  qualifyLead: async (leadId: string) => {
    const response = await fetch(`${process.env.NYRA_API_URL}/api/leads/qualify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NYRA_API_KEY}`,
      },
      body: JSON.stringify({ leadId }),
    });
    return response.json();
  },

  getRateQuote: async (quoteData: RateQuoteData) => {
    const response = await fetch(`${process.env.NYRA_API_URL}/api/rates/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NYRA_API_KEY}`,
      },
      body: JSON.stringify(quoteData),
    });
    return response.json();
  },
};
```

**2. Mortgage CRM Integration:**
```typescript
// lib/crm-client.ts
export const crmClient = {
  createLead: async (leadData: LeadFormData) => {
    const response = await fetch(`${process.env.CRM_API_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRM_API_KEY}`,
      },
      body: JSON.stringify(leadData),
    });
    return response.json();
  },
};
```

### Shared Infrastructure

**PostgreSQL Database:**
- Shared database server on `database-01.nyra.local`
- Database: `ratehunter_landing`
- Schema: Isolated from other apps

**Redis Cache:**
- Shared Redis cluster on `cache-01.nyra.local`
- Namespace: `ratehunter:`

**Infisical Secrets:**
- Organization: `project-nyra`
- Project: `ratehunter-landing`
- Environment: `production`

---

## ⚡ WORKFLOWS

### Development Workflow

**1. Local Development:**
```bash
# Start development environment
cd apps/ratehunter-landing
npm install
docker-compose up -d db redis
npx prisma migrate dev
npm run dev

# Access at http://localhost:3000
```

**2. Feature Development:**
```bash
# Create feature branch
git checkout -b feature/new-calculator

# Make changes, commit
git add .
git commit -m "feat: add refinance calculator"

# Push and create PR
git push origin feature/new-calculator
```

**3. Testing:**
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- forms
npm test -- calculators
npm test -- api

# E2E tests
npm run test:e2e
```

### Deployment Workflow

**1. Staging Deployment:**
```bash
# Deploy to staging
npm run deploy:staging

# Verify deployment
curl https://staging.ratehunter.net/api/health
```

**2. Production Deployment:**
```bash
# Merge to main triggers automatic deployment
git checkout main
git merge feature/new-calculator
git push origin main

# Monitor deployment
npm run deploy:monitor
```

### Testing Workflow

**Unit Tests:**
```bash
npm run test:unit
```

**Integration Tests:**
```bash
npm run test:integration
```

**E2E Tests:**
```bash
npm run test:e2e
```

---

## 📚 ADDITIONAL RESOURCES

### Key Documentation
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

### Project-Specific Docs
- `/docs/architecture.md` - System architecture
- `/docs/api.md` - API documentation
- `/docs/deployment.md` - Deployment guide
- `/docs/testing.md` - Testing strategy

---

**Remember**: RateHunter.net is a lead generation powerhouse. Focus on conversion optimization, fast page loads, and seamless Nyra AI integration. Always batch operations, coordinate via memory, and maintain type safety throughout.
