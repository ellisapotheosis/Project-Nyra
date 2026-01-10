# Project Nyra Test Suite

Comprehensive testing infrastructure for the Project Nyra monorepo.

## Directory Structure

```
tests/
├── unit/               # Unit tests for individual functions and components
├── integration/        # Integration tests for service interactions
├── e2e/               # End-to-end tests for complete user flows
├── performance/       # Performance and load tests
├── fixtures/          # Test data and fixtures
├── mocks/            # Mock implementations and factories
└── utils/            # Test utilities and helpers
```

## Test Types

### Unit Tests
- Fast, isolated tests for individual functions
- Located in `tests/unit/`
- Run with: `pnpm test:unit`

### Integration Tests
- Tests for service interactions and API endpoints
- Located in `tests/integration/`
- Run with: `pnpm test:integration`

### E2E Tests
- Complete user flow tests using Playwright
- Located in `tests/e2e/`
- Run with: `pnpm test:e2e`

### Performance Tests
- Load testing and performance benchmarks
- Located in `tests/performance/`
- Run with: `pnpm test:performance`

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:performance

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run tests for specific service
pnpm test --filter @nyra/nexus-router
```

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from '@jest/globals';
import { calculateMortgagePayment } from '@nyra/utils';

describe('calculateMortgagePayment', () => {
  it('should calculate monthly payment correctly', () => {
    const payment = calculateMortgagePayment({
      principal: 300000,
      rate: 0.04,
      years: 30
    });
    expect(payment).toBeCloseTo(1432.25, 2);
  });
});
```

### Integration Test Example
```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestServer } from '../utils/test-server';

describe('Lead Capture API', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it('should create a new lead', async () => {
    const response = await request(server)
      .post('/api/leads')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phone: '555-0100'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('complete mortgage application flow', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.fill('input[name="loanAmount"]', '300000');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*\/application\/success/);
  await expect(page.locator('h1')).toContainText('Application Submitted');
});
```

## Coverage Requirements

- Minimum coverage: 80%
- Critical paths: 95%
- New code: 90%

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Release tags

See `.github/workflows/test.yml` for CI configuration.

## Test Database

Integration tests use a separate test database:
- Automatically created/destroyed for each test run
- Uses Docker containers for isolation
- Seeded with fixture data

## Mock Services

Common mock implementations available in `tests/mocks/`:
- MCP servers
- External APIs
- Database connections
- Authentication services

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up resources after tests
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Follow AAA pattern
5. **DRY**: Extract common setup to utilities
6. **Fast**: Keep unit tests fast (<100ms)
7. **Deterministic**: Tests should always produce same result

## Troubleshooting

### Tests are slow
- Check for unnecessary async operations
- Use mocks instead of real services
- Reduce test timeout values

### Flaky tests
- Check for race conditions
- Ensure proper cleanup
- Add explicit waits for async operations

### Coverage gaps
```bash
# Generate detailed coverage report
pnpm test:coverage:detailed

# Open coverage report in browser
pnpm test:coverage:view
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
