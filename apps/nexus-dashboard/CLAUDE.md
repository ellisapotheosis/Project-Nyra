# Nexus Router Dashboard - CLAUDE.md

**Profile**: nexus-dashboard
**Generated**: 2026-01-10

## 🎯 Project Overview

Nexus Router Dashboard - AI Orchestration Platform Monitoring and Management Interface

## 🏗️ Architecture

**Tech Stack**: Next.js 15, TypeScript, Tailwind v4 (OKLCH), shadcn/ui, Recharts
**Port**: 3005
**Type**: Frontend Application

## 📋 Development Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Type check
pnpm type-check

# Lint
pnpm lint
```

## 🧠 Claude Flow Integration

### Available Agents

- coder
- reviewer
- tester

### Recommended Workflows

- Component development
- UI/UX improvements
- Performance optimization
- Feature additions

---

## 🛠️ Tech Stack Specific Guidelines

## Next.js 15 App Router Guidelines

### File Structure
- Use App Router (app directory)
- Server Components by default
- Client Components with 'use client' directive
- Collocate components with routes when possible

### Data Fetching
```typescript
// Server Component
async function Page() {
  const data = await fetch('...')
  return <Component data={data} />
}

// Client Component with hooks
'use client'
import { useEffect, useState } from 'react'
```

### API Routes
- Create in `app/api/` directory
- Use Route Handlers (not API routes)
- Return Response objects

### Performance
- Leverage React Server Components
- Use dynamic imports for heavy components
- Implement proper loading states
- Optimize images with next/image

## Tailwind CSS v4 with OKLCH

### Color System
- Use OKLCH color space for perceptual uniformity
- Define colors in `globals.css`
- Use CSS variables for theming

```css
:root {
  --primary: 0.5834 0.2305 277.0676;
  --background: 1.0000 0 0;
}

.dark {
  --primary: 0.5834 0.2305 277.0676;
  --background: 0.1448 0 0;
}
```

### Usage in Components
```tsx
<div className="bg-primary text-primary-foreground">
```

## shadcn/ui Components

### Installation
- Components are in `src/components/ui/`
- Fully customizable and own-able
- Built on Radix UI primitives

### Common Patterns
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

<Button variant="default" size="lg">
  Click me
</Button>

<Card>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

## State Management with Zustand

### Store Pattern
```typescript
// src/lib/store.ts
import { create } from 'zustand'

interface Store {
  data: any[]
  setData: (data: any[]) => void
}

export const useStore = create<Store>((set) => ({
  data: [],
  setData: (data) => set({ data }),
}))
```

### Usage
```tsx
'use client'
import { useStore } from '@/lib/store'

function Component() {
  const { data, setData } = useStore()
  // ...
}
```

## API Integration

### REST API Client
```typescript
// src/lib/api.ts
export class API {
  private static async fetch(endpoint: string) {
    const response = await fetch(`${BASE_URL}${endpoint}`)
    return response.json()
  }
}
```

### WebSocket Connection
```typescript
const ws = new WebSocket('ws://localhost:8000/ws')
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // Handle update
}
```

## Component Patterns

### Metric Card
```tsx
<MetricCard
  title="Total Requests"
  value={1234}
  icon={Activity}
  trend={{ value: 12.5, isPositive: true }}
/>
```

### Server Card
```tsx
<ServerCard
  server={serverData}
  onTest={() => testConnection()}
/>
```

### Performance Chart
```tsx
<PerformanceChart
  data={chartData}
/>
```

## Real-time Updates

### WebSocket Integration
```typescript
useEffect(() => {
  const ws = connectWebSocket((data) => {
    if (data.type === 'metrics') {
      setMetrics(data.payload)
    }
  })

  return () => ws.close()
}, [])
```

## Best Practices

### Performance
- Use Server Components when possible
- Implement proper loading states
- Debounce search inputs
- Lazy load heavy components

### Type Safety
- Define interfaces for all data structures
- Use TypeScript strict mode
- Avoid `any` types

### Styling
- Use Tailwind utility classes
- Follow OKLCH color system
- Maintain consistent spacing
- Use shadcn/ui components for consistency

### Code Organization
- Collocate related components
- Keep components small and focused
- Extract reusable logic to hooks
- Use barrel exports for cleaner imports

---

## 📝 Notes

- Dashboard connects to Nexus Router on port 8000
- Real-time updates via WebSocket
- OKLCH color space for better perceptual uniformity
- Fully responsive design
- Production-ready with error handling
