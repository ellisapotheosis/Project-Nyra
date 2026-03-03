---
description: Frontend application development standards
applyTo:
  - "apps/**/*.{tsx,ts,jsx,js,css}"
  - "apps/**/components/**/*"
  - "apps/**/app/**/*"
stack: Next.js 14, React 18, TypeScript, Tailwind CSS
---

# Frontend Applications - Development Instructions

## Scope

This file applies to all frontend applications in the `apps/` directory:
- `apps/ratehunter-landing/` - Marketing landing page
- `apps/nyra-admin/` - Admin dashboard
- `apps/mortgage-assistant/` - Loan officer dashboard
- `apps/nexus-dashboard/` - System monitoring
- `apps/crm/` - CRM application
- `apps/crm-dashboard/` - Analytics dashboard

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **UI Library:** React 18
- **Language:** TypeScript 5.7+
- **Styling:** Tailwind CSS
- **State Management:** Zustand (preferred), Redux (legacy)
- **Forms:** React Hook Form + Zod validation
- **UI Components:** Custom + Shadcn/ui

## Project Structure

```
apps/[app-name]/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── api/               # API routes
│   └── [route]/           # Other pages
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                   # Utilities and helpers
│   ├── utils.ts          # General utilities
│   ├── api.ts            # API client
│   └── validation.ts     # Zod schemas
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
├── styles/                # Global styles
│   └── globals.css       # Tailwind imports
├── public/                # Static assets
└── types/                 # TypeScript types
```

## Next.js App Router Patterns

### Page Component
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardContent } from '@/components/features/DashboardContent';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';

export const metadata = {
  title: 'Dashboard | Nyra',
  description: 'Mortgage management dashboard',
};

export default async function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
```

### Layout Component
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### API Route
```typescript
// app/api/quotes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const quoteSchema = z.object({
  loanAmount: z.number().positive(),
  interestRate: z.number().positive(),
  termYears: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = quoteSchema.parse(body);
    
    // Calculate quote
    const monthlyPayment = calculatePayment(validated);
    
    return NextResponse.json(
      { monthlyPayment, ...validated },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
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

## React Component Patterns

### Server Component (Default)
```typescript
// components/features/UserList.tsx
import { db } from '@/lib/db';

interface UserListProps {
  limit?: number;
}

export async function UserList({ limit = 10 }: UserListProps) {
  const users = await db.user.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <ul className="space-y-2">
      {users.map((user) => (
        <li key={user.id} className="p-4 border rounded">
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

### Client Component
```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof formSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        reset();
        // Show success message
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          {...register('message')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

## State Management (Zustand)

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

## Tailwind CSS Patterns

### Responsive Design
```tsx
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4 
  p-4
">
  {/* Cards */}
</div>
```

### Dark Mode Support
```tsx
<div className="
  bg-white 
  dark:bg-gray-800 
  text-gray-900 
  dark:text-white
">
  {/* Content */}
</div>
```

### Custom Components
```tsx
// Use @layer in globals.css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors;
  }
}
```

## Performance Optimization

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur" // For local images with import
/>
```

### Code Splitting
```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Disable server-side rendering if needed
});
```

### Memoization
```tsx
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(
    () => expensiveCalculation(data),
    [data]
  );
  
  const handleClick = useCallback(() => {
    // Handle click
  }, []);
  
  return <div>{processedData}</div>;
});
```

## Testing

### Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  it('should render form fields', () => {
    render(<ContactForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
  
  it('should show validation errors', async () => {
    render(<ContactForm />);
    
    const submitButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

## Accessibility

### ARIA Labels
```tsx
<button
  aria-label="Close modal"
  onClick={onClose}
>
  <XIcon className="w-4 h-4" />
</button>
```

### Semantic HTML
```tsx
// Good
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// Avoid
<div className="nav">
  <div><a href="/">Home</a></div>
</div>
```

### Keyboard Navigation
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

## Environment Variables

```env
# .env.local (never commit this file)
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://...
API_SECRET_KEY=...

# .env.example (commit this)
NEXT_PUBLIC_API_URL=
DATABASE_URL=
API_SECRET_KEY=
```

Access in code:
```typescript
// Client-side (must start with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-side only
const dbUrl = process.env.DATABASE_URL;
```

## Development Commands

```bash
# Development server
pnpm --filter [app-name] dev

# Production build
pnpm --filter [app-name] build

# Start production server
pnpm --filter [app-name] start

# Run tests
pnpm --filter [app-name] test

# Type checking
pnpm --filter [app-name] type-check

# Linting
pnpm --filter [app-name] lint
```

## Common Patterns to Avoid

❌ **Don't use pages router:**
```typescript
// Bad - pages/index.tsx
export default function Home() { }
```

✅ **Use App Router instead:**
```typescript
// Good - app/page.tsx
export default function Home() { }
```

❌ **Don't use client components unnecessarily:**
```typescript
// Bad
'use client';
export function StaticContent() { }
```

✅ **Use server components by default:**
```typescript
// Good
export function StaticContent() { }
```

❌ **Don't skip error boundaries:**
```typescript
// Bad - no error handling
export default function Page() {
  const data = await fetchData(); // Can throw
  return <div>{data}</div>;
}
```

✅ **Implement error handling:**
```typescript
// Good - app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Key Reminders

1. **Always use `'use client'` directive** only when needed (hooks, events, browser APIs)
2. **Prefer server components** for data fetching and static content
3. **Use Tailwind classes** instead of inline styles or CSS modules
4. **Validate all form inputs** with Zod schemas
5. **Optimize images** with next/image component
6. **Implement proper error handling** with error.tsx boundaries
7. **Write tests** for all components with user interaction
8. **Follow accessibility** guidelines (ARIA, semantic HTML, keyboard nav)
9. **Use TypeScript strictly** - no `any` types
10. **Keep components small** and focused on single responsibility

---

**Last Updated:** 2026-01-18
