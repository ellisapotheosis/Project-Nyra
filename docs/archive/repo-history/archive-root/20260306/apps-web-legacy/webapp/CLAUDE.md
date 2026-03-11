# Borrower Portal - Claude Flow V3 Configuration

> **Self-service borrower application and document portal**
>
> **Inherits from**: `apps/web/CLAUDE.md`
> **Stack**: React 19, Vite, TypeScript 5, Tailwind CSS 4, TanStack Query
> **Port**: 3002
> **Type**: SPA (Single-Page Application)
> **Users**: Active borrowers, applicants

---

## APPLICATION CONTEXT

### Purpose
The Borrower Portal provides active borrowers with secure self-service access to application status, document management, messaging with loan officers, and rate lock management.

### Key Features
- Application status tracking with timeline
- Secure document upload and management
- e-Signature integration
- Real-time messaging with loan officers
- Rate lock management
- Profile and settings management
- Secure data access with encryption
- Mobile-responsive design

### Architecture
```
React SPA (Vite)
    ├── Dashboard
    ├── Applications
    ├── Documents
    ├── Messages
    └── Settings
         ↓
Backend APIs (8000)
    ├── Authentication
    ├── Application data
    ├── Documents
    └── Messages
```

---

## TECH STACK SPECIFICS

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  build: {
    target: 'ES2020',
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
  },
});
```

### State Management (Zustand + React Query)
```typescript
// stores/authStore.ts
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (credentials) => {
    // Login logic
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### Component Structure
```
components/
├── Layout
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
├── Dashboard
│   ├── Dashboard.tsx
│   ├── StatusCard.tsx
│   └── QuickLinks.tsx
├── Applications
│   ├── ApplicationList.tsx
│   ├── ApplicationDetail.tsx
│   └── Timeline.tsx
├── Documents
│   ├── DocumentUpload.tsx
│   ├── DocumentList.tsx
│   └── DocumentViewer.tsx
├── Messages
│   ├── MessageThread.tsx
│   ├── MessageList.tsx
│   └── MessageComposer.tsx
└── Auth
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    └── PasswordReset.tsx
```

---

## AUTHENTICATION

### JWT Token Handling
```typescript
// lib/auth.ts
export class AuthService {
  static async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const { accessToken, refreshToken } = await response.json();

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return { accessToken, refreshToken };
  }

  static async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    const { accessToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);

    return accessToken;
  }

  static logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
```

### API Client with Auth
```typescript
// lib/apiClient.ts
import axios, { AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const newToken = await AuthService.refreshToken();
      if (newToken) {
        // Retry request with new token
      }
    }
    return Promise.reject(error);
  }
);
```

---

## DATA FETCHING (React Query)

### Application Queries
```typescript
// hooks/useApplications.ts
import { useQuery } from '@tanstack/react-query';

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await apiClient.get('/applications');
      return response.data;
    },
  });
}

export function useApplicationDetail(applicationId: string) {
  return useQuery({
    queryKey: ['applications', applicationId],
    queryFn: async () => {
      const response = await apiClient.get(`/applications/${applicationId}`);
      return response.data;
    },
  });
}
```

### Document Mutations
```typescript
// hooks/useUploadDocument.ts
import { useMutation } from '@tanstack/react-query';

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File, applicationId: string) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(
        `/applications/${applicationId}/documents`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['documents', variables],
      });
    },
  });
}
```

---

## TESTING STRATEGY (TDD)

### Unit Tests
```typescript
// __tests__/utils/calculation.test.ts
describe('Mortgage calculations', () => {
  it('calculates monthly payment correctly', () => {
    const payment = calculateMonthlyPayment({
      principal: 300000,
      annualRate: 0.065,
      years: 30,
    });

    expect(payment).toBeCloseTo(1896.2, 1);
  });
});
```

### Component Tests
```typescript
// __tests__/components/ApplicationCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ApplicationCard } from '@/components/ApplicationCard';

describe('ApplicationCard', () => {
  it('displays application status', () => {
    const app = {
      id: '1',
      status: 'IN_REVIEW',
      loanAmount: 300000,
    };

    render(<ApplicationCard application={app} />);

    expect(screen.getByText('In Review')).toBeInTheDocument();
    expect(screen.getByText('$300,000')).toBeInTheDocument();
  });
});
```

### E2E Tests
```typescript
// e2e/borrower-flow.spec.ts
import { test, expect } from '@playwright/test';

test('Borrower views application status', async ({ page }) => {
  await page.goto('http://localhost:3002/login');

  await page.fill('input[name="email"]', 'borrower@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Login")');

  await expect(page).toHaveURL('http://localhost:3002/dashboard');

  await page.click('button:has-text("View Application")');
  await expect(page.locator('text=Application Status')).toBeVisible();
});
```

---

## DEVELOPMENT COMMANDS

```bash
# Development
pnpm dev

# Build
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm type-check

# Lint and format
pnpm lint
pnpm format

# Testing
pnpm test
pnpm test:watch
pnpm test:coverage

# E2E tests
pnpm e2e
pnpm e2e:debug
```

---

## DEPLOYMENT

### Environment Variables
```bash
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development

# Production
VITE_API_URL=https://api.nyra.com
VITE_ENVIRONMENT=production
```

### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist dist
RUN npm install -g serve
EXPOSE 3002
CMD ["serve", "-s", "dist", "-l", "3002"]
```

---

**Profile**: webapp
**Generated**: 2026-01-26
**Port**: 3002
