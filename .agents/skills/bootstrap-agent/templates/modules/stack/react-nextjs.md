# ⚛️ React + Next.js Stack Module

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+
- **State Management**: Zustand / React Context
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Testing**: Vitest + React Testing Library

## Project Structure
```
{{appName}}/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Reusable UI components
│   ├── forms/             # Form components
│   └── layouts/           # Layout components
├── lib/
│   ├── utils.ts           # Utility functions
│   ├── api.ts             # API client
│   └── hooks/             # Custom hooks
├── types/                  # TypeScript definitions
├── public/                 # Static assets
└── tests/                  # Test files
```

## Development Commands
```bash
# Development
{{devCommand}}

# Build
{{buildCommand}}

# Test
{{testCommand}}

# Lint
{{lintCommand}}

# Type check
npm run typecheck
```

## Code Conventions

### Component Structure
```typescript
// Use functional components with TypeScript
interface {{ComponentName}}Props {
  title: string;
  onAction?: () => void;
}

export function {{ComponentName}}({ title, onAction }: {{ComponentName}}Props) {
  // Hooks first
  const [state, setState] = useState<string>('');

  // Event handlers
  const handleClick = () => {
    onAction?.();
  };

  // Render
  return (
    <div className="container">
      <h1>{title}</h1>
    </div>
  );
}
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Hooks: `use*.ts` (e.g., `useAuth.ts`)
- Types: `*.types.ts` (e.g., `user.types.ts`)

### Import Order
1. React imports
2. Third-party libraries
3. Internal components
4. Types
5. Utilities
6. Styles

```typescript
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import type { User } from '@/types/user.types';
import { formatDate } from '@/lib/utils';
```

### State Management
- **Local State**: `useState` for component-specific state
- **Shared State**: Zustand stores for app-wide state
- **Server State**: TanStack Query for server data
- **Form State**: React Hook Form for forms

### API Integration
```typescript
// Use TanStack Query for data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});
```

### Error Handling
```typescript
// Error boundaries for component errors
// try/catch for async operations
// Display user-friendly error messages
```

### Styling Best Practices
- Use Tailwind utility classes
- Create reusable component classes
- Follow mobile-first approach
- Use design system tokens

### Performance Optimization
- Use `React.memo` for expensive components
- Implement code splitting with `next/dynamic`
- Optimize images with `next/image`
- Use Server Components where possible
- Implement proper caching strategies

### Testing Strategy
```typescript
// Unit tests for utilities and hooks
// Component tests for UI components
// Integration tests for page flows
// E2E tests for critical paths

describe('UserProfile', () => {
  it('renders user information', () => {
    render(<UserProfile user={mockUser} />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });
});
```

### Accessibility
- Use semantic HTML
- Include ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Maintain color contrast ratios

---
