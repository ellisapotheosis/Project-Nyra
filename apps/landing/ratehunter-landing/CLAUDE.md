# RateHunter Landing Page - Claude Flow V3 Configuration

> **Public-facing mortgage rates landing and lead capture engine**
>
> **Inherits from**: `apps/landing/CLAUDE.md`
> **Stack**: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui
> **Port**: 3001
> **Type**: SSG/SSR Landing Page (public facing)
> **Users**: Prospective borrowers, rate shoppers, marketing leads

---

## APPLICATION CONTEXT

### Purpose
RateHunter Landing is the public-facing entry point for the mortgage platform. It showcases competitive rates, educates borrowers, and captures high-quality leads through optimized conversion funnels.

### Key Metrics
- **Lighthouse Score**: 95+ (SEO, Performance, Accessibility)
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Conversion Rate**: 2-5% lead capture
- **Monthly Traffic**: 5K-10K unique visitors

### Routes
```
/ - Hero with rate showcase and lead capture
/rates - Live rate tables (updates from Quote Engine)
/calculator - Mortgage calculator with scenario builder
/how-it-works - Educational funnel explaining process
/about - Company info and trust signals
/contact - Contact form
/blog - Rate tips and mortgage education
/faq - Common questions
/terms - Terms of service
/privacy - Privacy policy
```

---

## TECH STACK SPECIFICS

### Next.js 15 Features
- **App Router** (not Pages Router)
- **Server Components** for static content (better SEO)
- **Dynamic Routes** for blog posts (`/blog/[slug]`)
- **Image Optimization** with `next/image`
- **Font Optimization** with `next/font`
- **Metadata API** for SEO tags

### Database Integration
- **PostgreSQL**: Rate history, lead tracking
- **Redis**: Rate caching (1-hour TTL)
- **Prisma**: ORM for database queries

### Real-Time Features
- **WebSocket Connection**: Live rate updates from Quote Engine
- **Server-Sent Events**: Alternative fallback for rate updates
- **React Query**: Client-side caching and synchronization

### TypeScript Strictness
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## COMPONENT ARCHITECTURE

### Atomic Design Pattern
```
components/
├── atoms/
│   ├── RateCard.tsx - Single rate display
│   ├── CTAButton.tsx - Call-to-action button
│   ├── Badge.tsx - Rate badges (New, Hot, etc.)
│   └── Icon.tsx - Reusable icon wrapper
├── molecules/
│   ├── RateFilter.tsx - Filter rates by loan type
│   ├── LoanTypeSelector.tsx - 30-year, 15-year toggle
│   ├── SearchInput.tsx - Rate search field
│   └── LeadForm.tsx - Email capture form
├── organisms/
│   ├── RateTable.tsx - Full rate comparison table
│   ├── MortgageCalculator.tsx - Interactive calculator
│   ├── HeroSection.tsx - Hero with CTA
│   ├── FAQAccordion.tsx - Collapsible FAQs
│   ├── BlogCard.tsx - Blog post preview
│   └── ComparisonChart.tsx - Rate trends chart
└── templates/
    ├── LandingLayout.tsx - Main layout
    ├── BlogLayout.tsx - Blog post layout
    └── FormLayout.tsx - Form-focused layout
```

### Server vs Client Components

**Server Components** (SSR/SSG):
```typescript
// app/rates/page.tsx - Server Component
async function RatesPage() {
  // Fetch from database at build time or request time
  const rates = await db.rates.findMany({
    orderBy: { interestRate: 'asc' },
    take: 20,
  });

  return <RateTable initialRates={rates} />;
}
```

**Client Components** (interactive):
```typescript
// components/MortgageCalculator.tsx - Client Component
'use client';

import { useState } from 'react';

export function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState(300000);
  // Interactive state...
  return (
    <div>
      <input
        type="number"
        value={loanAmount}
        onChange={(e) => setLoanAmount(Number(e.target.value))}
      />
    </div>
  );
}
```

---

## DATA FETCHING PATTERNS

### Static Generation (SSG)
```typescript
// Pre-render pages at build time for best performance
export const revalidate = 3600; // Revalidate every hour (ISR)

// app/rates/page.tsx
async function RatesPage() {
  const rates = await fetchRatesFromQuoteEngine();
  return <RateTable rates={rates} />;
}
```

### Dynamic Routes with SSG
```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await db.blogPosts.findMany();
  return posts.map((post) => ({ slug: post.slug }));
}

async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await db.blogPosts.findUnique({
    where: { slug: params.slug },
  });
  return <BlogPost post={post} />;
}
```

### Real-Time Updates (WebSocket)
```typescript
// lib/rates.ts - WebSocket client
import { useEffect, useState } from 'react';

export function useRates() {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8001/rates');

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setRates(update.rates);
    };

    return () => ws.close();
  }, []);

  return rates;
}
```

---

## SEO OPTIMIZATION

### Meta Tags & Head
```typescript
// app/layout.tsx - Root layout
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RateHunter - Find Best Mortgage Rates',
  description: 'Compare live mortgage rates from top lenders. Get pre-approved in minutes.',
  openGraph: {
    title: 'RateHunter - Find Best Mortgage Rates',
    description: 'Compare live mortgage rates from top lenders.',
    url: 'https://ratehunter.nyra.com',
    image: 'https://ratehunter.nyra.com/og-image.jpg',
  },
  keywords: [
    'mortgage rates',
    'refinance',
    'home loans',
    'mortgage calculator',
  ],
};
```

### Structured Data (JSON-LD)
```typescript
// lib/schema.ts
export function generateRateSchema(rates: Rate[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rates.map((rate) => ({
      '@type': 'Question',
      name: `${rate.loanType} - ${rate.term} year`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Current rate: ${rate.interestRate}%`,
      },
    })),
  };
}
```

### Sitemap & Robots
```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.blogPosts.findMany();

  return [
    {
      url: 'https://ratehunter.nyra.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `https://ratehunter.nyra.com/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
```

---

## FORM HANDLING & VALIDATION

### Lead Capture Form
```typescript
// components/LeadForm.tsx - Client Component
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const LeadSchema = z.object({
  email: z.string().email('Valid email required'),
  loanAmount: z.number().positive('Loan amount required'),
  zipCode: z.string().regex(/^\d{5}$/, 'Valid ZIP code required'),
});

type LeadFormData = z.infer<typeof LeadSchema>;

export function LeadForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(LeadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    const response = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Success handling
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="your@email.com" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('loanAmount', { valueAsNumber: true })} />
      {errors.loanAmount && <span>{errors.loanAmount.message}</span>}

      <button type="submit">Get Rates</button>
    </form>
  );
}
```

### API Route
```typescript
// app/api/leads/route.ts
import { z } from 'zod';
import { db } from '@/lib/db';

const LeadSchema = z.object({
  email: z.string().email(),
  loanAmount: z.number().positive(),
  zipCode: z.string().regex(/^\d{5}$/),
});

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const data = LeadSchema.parse(body);

    // Save to database
    const lead = await db.lead.create({
      data: {
        email: data.email,
        loanAmount: data.loanAmount,
        zipCode: data.zipCode,
        source: 'ratehunter-landing',
        createdAt: new Date(),
      },
    });

    // Trigger compliance check
    await validateLeadCompliance(lead);

    return Response.json({ success: true, leadId: lead.id });
  } catch (error) {
    return Response.json({ error: 'Invalid data' }, { status: 400 });
  }
}
```

---

## PERFORMANCE OPTIMIZATION

### Image Optimization
```typescript
// components/RateCard.tsx
import Image from 'next/image';

export function RateCard() {
  return (
    <Image
      src="/rates-banner.webp"
      alt="Compare mortgage rates"
      width={800}
      height={400}
      priority // Load immediately (above fold)
      quality={85}
      placeholder="blur" // Blur placeholder while loading
    />
  );
}
```

### Code Splitting
```typescript
// components/MortgageCalculator.tsx - Lazy load heavy component
import dynamic from 'next/dynamic';

const Calculator = dynamic(() => import('./Calculator'), {
  loading: () => <div>Loading calculator...</div>,
  ssr: false, // Only on client
});

export function Page() {
  return <Calculator />;
}
```

### Core Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Tailwind CSS Purging
```typescript
// tailwind.config.ts
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
};
```

---

## TESTING STRATEGY (TDD)

### Unit Tests
```typescript
// __tests__/components/LeadForm.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { LeadForm } from '@/components/LeadForm';

describe('LeadForm', () => {
  it('validates email format', async () => {
    render(<LeadForm />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    expect(screen.getByText(/valid email required/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<LeadForm />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/loan/i), '300000');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Verify submission
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/lead-capture.test.tsx
describe('Lead Capture Flow', () => {
  it('captures lead and redirects to pre-approval', async () => {
    // Full flow: form submission → API → database
  });
});
```

### E2E Tests
```typescript
// e2e/lead-capture.spec.ts
import { test, expect } from '@playwright/test';

test.describe('RateHunter Landing', () => {
  test('captures lead and shows confirmation', async ({ page }) => {
    await page.goto('http://localhost:3001');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="loanAmount"]', '300000');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Rates sent to your email')).toBeVisible();
  });
});
```

### Coverage Requirements
- **Unit Tests**: 85%+ coverage
- **Statements**: 85%+
- **Branches**: 80%+
- **Functions**: 85%+
- **Lines**: 85%+

---

## DEPLOYMENT

### Environment Variables
```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_WS_URL=ws://localhost:8001
DATABASE_URL=postgresql://user:pass@localhost:5432/nyra_rates
REDIS_URL=redis://localhost:6379

# .env.production
NEXT_PUBLIC_API_URL=https://api.nyra.com
DATABASE_URL=postgresql://prod_user:prod_pass@prod.db:5432/nyra
```

### Docker Build
```dockerfile
FROM node:20-alpine AS base
FROM base AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/node_modules node_modules
COPY package.json ./

EXPOSE 3001
CMD ["npm", "start"]
```

### Cloudflare Pages
```toml
# wrangler.toml
name = "ratehunter-landing"
type = "javascript"
account_id = "..."
workers_dev = true
route = "*.ratehunter.nyra.com"
zone_id = "..."

[build]
command = "pnpm build"
cwd = "./apps/landing/ratehunter-landing"
```

---

## DEVELOPMENT COMMANDS

```bash
# Development
pnpm dev

# Build
pnpm build

# Production start
pnpm start

# Type check
pnpm type-check

# Lint
pnpm lint

# Format
pnpm format

# Test
pnpm test
pnpm test:watch
pnpm test:coverage

# E2E tests
pnpm e2e
pnpm e2e:debug
```

---

## INTEGRATION POINTS

### Quote Engine API
- **Endpoint**: `http://localhost:8001/rates`
- **Updates**: Real-time via WebSocket
- **Fallback**: 5-minute polling if WebSocket unavailable

### Compliance API
- **Lead Validation**: TILA/RESPA disclosure requirements
- **State Verification**: Loan product availability by state
- **Anti-Steering**: Rate offer fairness validation

### Memory System
- **Borrower Preferences**: Mem0 stores shopping history
- **Rate Trends**: RuVector for rate history search
- **Lead Scoring**: Letta for lead quality assessment

---

## RELATED DOCUMENTATION

- **Parent CLAUDE.md**: `apps/landing/CLAUDE.md`
- **Apps CLAUDE.md**: `apps/CLAUDE.md`
- **Web Apps CLAUDE.md**: `apps/web/CLAUDE.md`
- **Quote Engine**: `services/quote-api/CLAUDE.md`
- **Root CLAUDE.md**: `/CLAUDE.md` (V3 orchestration)

---

## QUICK REFERENCE

### Key Agents for This App
- **frontend-specialist**: Next.js page and component development
- **performance-optimizer**: Core Web Vitals optimization
- **accessibility-specialist**: WCAG 2.1 AA compliance
- **seo-specialist**: Meta tags, structured data, sitemap
- **tdd-specialist**: Unit and integration test coverage

### Recommended Swarm Configuration
```bash
# Multi-feature development
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 6 --strategy balanced

# Performance-critical work
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 5 --strategy specialized
```

### Memory Commands
```bash
# Store landing page patterns
npx @claude-flow/cli@latest memory store \
  --namespace landing-patterns \
  --key "lead-form-validation" \
  --value "Zod schema with email, loan amount, ZIP validation"

# Search for SEO patterns
npx @claude-flow/cli@latest memory search \
  --query "meta tags structured data sitemap" \
  --namespace patterns
```

---

**Profile**: ratehunter-landing
**Generated**: 2026-01-26
**Target Users**: Prospective borrowers, rate shoppers, marketing audiences
**Audience**: 5K-10K monthly visitors
**Conversion Target**: 2-5% lead capture rate
