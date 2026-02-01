# Project Nyra Testing Guide

## TDD London School (Mockist) Approach

### Philosophy

The London School of TDD emphasizes:
- **Behavior over implementation**: Test what code does, not how it does it
- **Outside-in development**: Start with high-level acceptance tests, work inward
- **Heavy mocking**: Isolate units under test by mocking all dependencies
- **Interaction testing**: Verify collaborations between objects

### Key Principles

1. **Mock All Dependencies**: Every external dependency (database, API, file system) is mocked
2. **Test Interactions**: Verify method calls, not state changes
3. **Rapid Feedback**: Tests run in milliseconds, not seconds
4. **Isolated Units**: Each test is completely independent

## Test Framework Setup

### Vitest Configuration

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/unit/agents/agent-coordination.test.ts

# Watch mode
pnpm test --watch

# Coverage report
pnpm test --coverage

# UI mode
pnpm test --ui
```

### Coverage Thresholds

- **Lines**: 90%
- **Functions**: 90%
- **Branches**: 85%
- **Statements**: 90%

## Test Structure

### Unit Tests (`tests/unit/`)

Fast, isolated tests for individual functions:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FeatureName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Integration Tests (`tests/integration/`)

Test interactions between components:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Service Integration', () => {
  let service: ServiceType;

  beforeAll(async () => {
    service = await setupTestService();
  });

  afterAll(async () => {
    await teardownTestService();
  });

  it('should coordinate between components', async () => {
    const result = await service.processRequest();
    expect(result).toBeDefined();
  });
});
```

### E2E Tests (`tests/e2e/`)

Complete user workflows using Playwright:

```typescript
import { test, expect } from '@playwright/test';

test('complete mortgage application', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('[name="loanAmount"]', '350000');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*\/success/);
});
```

## Mock Utilities

### Agent Mocks

```typescript
import { createCoderAgent, createTesterAgent, createMockSwarm } from '@utils/agents';

// Single agent
const agent = createCoderAgent();
await agent.spawn();

// Swarm
const swarm = createMockSwarm('mesh', ['coder', 'tester']);
await swarm.init();
```

### Memory Mocks

```typescript
import { setupTestMemory } from '@utils/memory';

const memory = await setupTestMemory();

// RuVector
await memory.ruvector.store('key', { data: 'value' });
const results = await memory.ruvector.search('query', 5);

// Letta
await memory.letta.store('agent-id', { message: 'content' });

// Graphiti
await memory.graphiti.addNode({ id: 'node-1', type: 'Borrower' });
await memory.graphiti.addEdge({ from: 'node-1', to: 'node-2', type: 'KNOWS' });

// Mem0
await memory.mem0.store('user-id', { preferences: {} });
```

### Database Mocks

```typescript
import { setupTestDatabase } from '@utils/database';

const db = await setupTestDatabase();
await db.seed({ users: [...], loans: [...] });
await db.clear();
```

### MCP Mocks

```typescript
import { setupTestMCP } from '@utils/mcp';

const mcpServers = await setupTestMCP();
const result = await mcpServers['claude-flow'].executeTool('agent_spawn', {
  type: 'coder'
});
```

## TDD Workflow

### Red-Green-Refactor Cycle

#### 1. Red Phase: Write Failing Test

```typescript
describe('MortgageCalculator', () => {
  it('should calculate monthly payment', () => {
    const calculator = new MortgageCalculator();

    // This will fail because MortgageCalculator doesn't exist yet
    const payment = calculator.calculatePayment({
      principal: 350000,
      rate: 0.0625,
      years: 30
    });

    expect(payment).toBeCloseTo(2154.24, 2);
  });
});
```

**Run test**: `pnpm test` → ❌ FAIL

#### 2. Green Phase: Minimal Implementation

```typescript
class MortgageCalculator {
  calculatePayment({ principal, rate, years }) {
    const monthlyRate = rate / 12;
    const payments = years * 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) /
                    (Math.pow(1 + monthlyRate, payments) - 1);
    return payment;
  }
}
```

**Run test**: `pnpm test` → ✅ PASS

#### 3. Refactor Phase: Improve Code

```typescript
class MortgageCalculator {
  calculatePayment({ principal, rate, years }: PaymentParams): number {
    const monthlyRate = this.getMonthlyRate(rate);
    const totalPayments = this.getTotalPayments(years);

    return this.computePayment(principal, monthlyRate, totalPayments);
  }

  private getMonthlyRate(annualRate: number): number {
    return annualRate / 12;
  }

  private getTotalPayments(years: number): number {
    return years * 12;
  }

  private computePayment(principal: number, rate: number, payments: number): number {
    const power = Math.pow(1 + rate, payments);
    return principal * (rate * power) / (power - 1);
  }
}
```

**Run test**: `pnpm test` → ✅ PASS (still passing after refactor)

## Testing Mortgage Domain

### DTI Calculation Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('DTI Calculation', () => {
  it('should qualify borrower with DTI at 43%', () => {
    const calculator = new DTICalculator();
    const result = calculator.calculate(3440, 8000);

    expect(result.dti).toBe(43);
    expect(result.isQualified).toBe(true);
  });

  it('should not qualify borrower with DTI above 43%', () => {
    const calculator = new DTICalculator();
    const result = calculator.calculate(3500, 8000);

    expect(result.isQualified).toBe(false);
  });
});
```

### LTV Calculation Tests

```typescript
describe('LTV Calculation', () => {
  it('should require PMI for conventional loan with LTV > 80%', () => {
    const calculator = new LTVCalculator();
    const result = calculator.calculate(380000, 400000, 'conventional');

    expect(result.ltv).toBe(95);
    expect(result.requiresPMI).toBe(true);
  });
});
```

### Compliance Tests

```typescript
describe('TRID Compliance', () => {
  it('should validate 3-day waiting period before closing', () => {
    const validator = new TRIDValidator();

    const closingDisclosureDate = new Date('2026-01-26');
    const closingDate = new Date('2026-01-29');

    const isCompliant = validator.validateWaitingPeriod(
      closingDisclosureDate,
      closingDate
    );

    expect(isCompliant).toBe(true);
  });
});
```

## Regression Testing

### Creating Regression Tests

When a bug is found:

1. **Reproduce the bug in a test**:
```typescript
it('REGRESSION-XXX: Description of the bug', () => {
  // Setup that reproduces the bug
  const input = buggyInput;

  // Verify the bug is fixed
  const result = functionUnderTest(input);
  expect(result).toBe(expectedCorrectResult);
});
```

2. **Fix the implementation**
3. **Verify test passes**
4. **Keep test for future protection**

### Example Regression Suite

See `tests/unit/swarm/regression-suite.test.ts` for comprehensive examples:
- Agent coordination failures
- Memory leaks
- Race conditions
- Stale data issues
- Performance regressions

## Best Practices

### 1. Test Naming

```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should calculate DTI correctly for typical scenario', () => { ... });
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should do something', () => {
  // Arrange: Setup test data
  const input = createTestInput();

  // Act: Execute the function
  const result = functionUnderTest(input);

  // Assert: Verify the result
  expect(result).toBe(expected);
});
```

### 3. Mock Verification

```typescript
it('should call dependency with correct parameters', () => {
  const mockDependency = vi.fn();
  const service = new Service(mockDependency);

  service.doSomething('param');

  expect(mockDependency).toHaveBeenCalledWith('param');
  expect(mockDependency).toHaveBeenCalledTimes(1);
});
```

### 4. Async Testing

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();

  expect(result).toBeDefined();
});
```

### 5. Error Testing

```typescript
it('should throw error for invalid input', () => {
  expect(() => {
    functionThatThrows();
  }).toThrow('Expected error message');
});
```

## Running Tests

### Local Development

```bash
# Watch mode for TDD
pnpm test --watch

# Run specific test file
pnpm test dti-calculation.test.ts

# Run tests matching pattern
pnpm test --grep "DTI"

# Coverage report
pnpm test --coverage

# UI mode for debugging
pnpm test --ui
```

### CI/CD Pipeline

Tests run automatically on:
- Pull requests
- Push to main branch
- Release tags

See `.github/workflows/test.yml` for configuration.

## Troubleshooting

### Tests Timing Out

Increase timeout in test:
```typescript
it('slow test', async () => {
  // ...
}, 30000); // 30 second timeout
```

### Flaky Tests

Use `vi.useFakeTimers()` for time-dependent tests:
```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('should handle timeout', () => {
  const callback = vi.fn();
  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();
});
```

### Mock Not Working

Ensure mocks are cleared:
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [TDD London School](https://github.com/testdouble/contributing-tests/wiki/London-school-TDD)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Playwright Documentation](https://playwright.dev/)

## Next Steps

1. ✅ Test framework initialized with Vitest
2. ✅ Mock utilities created (agents, memory, MCP, database)
3. ✅ Example tests written for each domain
4. ✅ Regression suite template created
5. ✅ Testing guide documented

**Ready to start TDD development!**

Run `pnpm test --watch` to begin the Red-Green-Refactor cycle.
