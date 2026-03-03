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
