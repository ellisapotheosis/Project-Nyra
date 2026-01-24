# {{APP_NAME}} - CLAUDE.md

**Inherits from**: `apps/CLAUDE.md`
**Stack**: {{TECH_STACK}}
**Port**: {{PORT}}
**Type**: {{APP_TYPE}} (dashboard/landing/public/admin)

## Overview

{{APP_NAME}} is a {{APP_TYPE}} application built with {{TECH_STACK}}. This document provides app-specific configuration and development guidelines.

## App-Specific Configuration

### Routes

{{ROUTE_LIST}}

### Features

{{FEATURE_LIST}}

### Dependencies

**Shared Packages** (from monorepo):
- `@nyra/ui` - Shared UI component library
- `@nyra/utils` - Shared utilities and helpers

**App-Specific Dependencies**:
{{SPECIFIC_DEPS}}

### Environment Variables

```bash
# Required environment variables for this app
{{ENV_VARS}}
```

### Container Configuration

- **Base Image**: node:18-alpine
- **Port**: {{PORT}}
- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`
- **Dockerfile**: `Dockerfile` in app root
- **Docker Compose**: Defined in `infra/docker/docker-compose.yml`

### Development Stack

- **Frontend Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Testing**: Vitest + React Testing Library (TDD)
- **Linting**: ESLint + Prettier
- **State Management**: React Query (for server state)
- **Styling**: Tailwind CSS

## Testing (TDD)

### Test Structure

- **Test Files**: `src/**/*.test.tsx`, `src/**/*.test.ts`
- **Test Utilities**: `tests/utils` (shared test helpers)
- **Coverage Requirement**: 80%+ for all source files

### Running Tests

```bash
# Run all tests in this app
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run specific test file
pnpm test -- calendar.test.tsx
```

### TDD Best Practices

1. **Write test first** - Define expected behavior before implementation
2. **Test-driven development** - Red → Green → Refactor
3. **Unit tests** - Test individual functions and components
4. **Integration tests** - Test component interactions
5. **Mock external APIs** - Use MSW (Mock Service Worker) for API mocking
6. **Accessibility tests** - Test ARIA attributes and keyboard navigation

## API Integration

- **Backend URL**: `{{API_URL}}`
- **Authentication**: JWT tokens in Authorization header
- **Error Handling**: React Query error boundaries
- **HTTP Client**: Axios (configured in shared utils)
- **API Mocking**: MSW (Mock Service Worker) for development

### API Integration Pattern

```typescript
// Example: Using React Query for API calls
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@nyra/utils';

export function useGetData() {
  return useQuery({
    queryKey: ['data'],
    queryFn: () => apiClient.get('/api/endpoint')
  });
}
```

## Development Commands

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server (port {{PORT}})
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format
```

### Testing & Quality

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Lint and format all files
pnpm lint && pnpm format

# Type check
pnpm type-check
```

### Docker & Deployment

```bash
# Build Docker image
docker build -t {{APP_NAME}}-app:latest .

# Run Docker container locally
docker run -p {{PORT}}:{{PORT}} {{APP_NAME}}-app:latest

# Docker Compose (from project root)
docker-compose -f infra/docker/docker-compose.yml up {{APP_NAME}}
```

## File Structure

```
apps/{{APP_SLUG}}/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   ├── api/                # API integration
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── tests/
│   ├── utils/              # Test utilities and fixtures
│   └── setup.ts            # Test setup
├── public/                 # Static assets
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose config (if needed)
├── vite.config.ts          # Vite configuration
├── vitest.config.ts        # Vitest configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
├── pnpm-lock.yaml          # Lock file
└── .env.local              # Local environment variables
```

## Development Workflow

### 1. Feature Development (TDD)

```bash
# 1. Start with a failing test
pnpm test:watch

# 2. Implement the feature
# - Follow SOLID principles
# - Keep components small and focused
# - Use TypeScript for type safety

# 3. Refactor and optimize
# - Remove duplication
# - Improve readability
# - Maintain test coverage

# 4. Commit changes
git add .
git commit -m "feat: Add new feature"
```

### 2. Bug Fixing

```bash
# 1. Create test that reproduces bug
# 2. Implement fix
# 3. Verify test passes
# 4. Check no regressions
pnpm test

# 5. Commit
git add .
git commit -m "fix: Resolve issue #123"
```

### 3. Code Review Checklist

- [ ] Tests pass: `pnpm test`
- [ ] Linting passes: `pnpm lint`
- [ ] Types correct: `pnpm type-check`
- [ ] Coverage maintained: >80%
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Accessibility tested

## Debugging

### Development Tools

- **React DevTools**: Browser extension for React component inspection
- **Redux DevTools**: For state management debugging (if applicable)
- **Network Tab**: Check API calls and responses
- **Console**: Check for errors and warnings

### Debug Mode

```bash
# Start with debug logging
DEBUG=* pnpm dev

# Filter specific modules
DEBUG=api:* pnpm dev
```

### Common Issues

1. **Port already in use**: Kill process on port {{PORT}} or change port in vite.config.ts
2. **Dependencies not installed**: Run `pnpm install`
3. **Type errors**: Run `pnpm type-check` and fix TS errors
4. **Stale cache**: Clear `.next`, `dist`, `node_modules` and reinstall

## Deployment

### Production Build

```bash
# Build optimized production bundle
pnpm build

# Test production build locally
pnpm preview
```

### Environment Setup for Deployment

```bash
# Set production environment variables
VITE_API_URL=https://api.production.com
VITE_ENV=production
```

### Docker Deployment

```bash
# Build and push to registry
docker build -t registry.example.com/{{APP_NAME}}:latest .
docker push registry.example.com/{{APP_NAME}}:latest

# Deploy with Docker Compose
docker-compose -f infra/docker/docker-compose.yml up -d {{APP_NAME}}
```

## Troubleshooting

### App won't start

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### Build errors

```bash
# Clean build
pnpm clean
pnpm build
```

### Test failures

```bash
# Run tests with verbose output
pnpm test -- --reporter=verbose

# Run specific test file
pnpm test -- calendar.test.tsx
```

## Claude Flow Integration

### Memory-Based Development

```bash
# Store patterns learned in development
npx @claude-flow/cli@latest memory store \
  --key "{{APP_NAME}}-patterns" \
  --value "Component patterns, API integration approach" \
  --namespace app-specific

# Search for similar patterns
npx @claude-flow/cli@latest memory search \
  --query "component composition patterns"
```

### Task Coordination

When working on this app with Claude Flow swarms:

```bash
# Pre-task: Get routing recommendation
npx @claude-flow/cli@latest hooks pre-task \
  --description "Implement {{APP_NAME}} feature: {{FEATURE_DESC}}"

# Post-task: Store results and learnings
npx @claude-flow/cli@latest hooks post-task \
  --task-id "task-123" \
  --success true \
  --store-results true
```

## References

- **Project CLAUDE.md**: `CLAUDE.md` (root)
- **Apps CLAUDE.md**: `apps/CLAUDE.md`
- **Shared UI Library**: `apps/shared/ui/`
- **Shared Utils**: `apps/shared/utils/`
- **Docker Config**: `infra/docker/`
- **CI/CD Workflows**: `.github/workflows/`

## Support & Questions

For app-specific questions:
1. Check this CLAUDE.md
2. Review `apps/CLAUDE.md` for shared patterns
3. Check root `CLAUDE.md` for project-wide configuration
4. Open an issue in the repository

---

**Last Updated**: {{DATE}}
**Maintained By**: Development Team
