# Test Framework Setup - Project Nyra

## Overview

Project Nyra's test framework is built on **Vitest** following **TDD London School (Mockist)** principles. This setup provides comprehensive testing for mortgage automation workflows, multi-agent coordination, and compliance validation.

## Test Framework Architecture

### Technology Stack

- **Test Runner**: Vitest (modern, fast alternative to Jest)
- **E2E Testing**: Playwright
- **Coverage Tool**: @vitest/coverage-v8
- **Mocking Strategy**: London School TDD (heavy mocking, interaction testing)

### Coverage Thresholds

```typescript
{
  lines: 90%,
  functions: 90%,
  branches: 85%,
  statements: 90%
}
```

## Directory Structure

```
tests/
├── setup/
│   └── vitest.setup.ts          # Global test configuration
├── utils/
│   ├── agents.ts                # Agent mock utilities
│   ├── memory.ts                # Memory system mocks (RuVector, Letta, Graphiti, Mem0)
│   ├── mcp.ts                   # MCP server mocks
│   └── database.ts              # Database mock utilities
├── fixtures/
│   ├── agents.json              # Agent test data
│   ├── swarms.json              # Swarm configurations
│   ├── memory-patterns.json     # Memory pattern fixtures
│   ├── leads.json               # Lead test data
│   ├── rates.json               # Mortgage rate data
│   └── users.json               # User test data
├── unit/
│   ├── agents/
│   │   └── agent-coordination.test.ts    # Agent lifecycle and communication
│   ├── memory/
│   │   └── memory-coordination.test.ts   # Memory system integration
│   ├── mortgage/
│   │   ├── dti-calculation.test.ts       # DTI (Debt-to-Income) tests
│   │   └── ltv-calculation.test.ts       # LTV (Loan-to-Value) tests
│   └── swarm/
│       └── regression-suite.test.ts      # Regression test collection
├── integration/                 # Service integration tests
├── e2e/                         # End-to-end Playwright tests
├── performance/                 # Performance benchmarks
├── mocks/                       # Mock implementations
│   ├── factories.ts             # Test data factories
│   └── services.ts              # Service mocks
└── TESTING_GUIDE.md            # Comprehensive testing documentation
```

## Key Features

### 1. Mock Utilities

#### Agent Mocks
```typescript
import { createCoderAgent, createTesterAgent, createMockSwarm } from '@utils/agents';

// Single agent
const agent = createCoderAgent();
await agent.spawn();
await agent.execute({ description: 'Write unit test' });

// Swarm coordination
const swarm = createMockSwarm('mesh', ['coder', 'tester', 'reviewer']);
await swarm.init();
await swarm.coordinateTask({ description: 'Implement feature with TDD' });
```

#### Memory System Mocks
```typescript
import { setupTestMemory } from '@utils/memory';

const memory = await setupTestMemory();

// RuVector (vector search)
await memory.ruvector.store('pattern-001', { type: 'mortgage-pattern' });
const results = await memory.ruvector.search('DTI calculation', 5);

// Letta (conversational memory)
await memory.letta.store('agent-id', { message: 'Task complete' });

// Graphiti (knowledge graph)
await memory.graphiti.addNode({ id: 'borrower-001', type: 'Borrower' });
await memory.graphiti.addEdge({ from: 'borrower-001', to: 'quote-001', type: 'RECEIVED' });

// Mem0 (user preferences)
await memory.mem0.store('user-id', { preferredLoanType: 'conventional' });
```

#### MCP Server Mocks
```typescript
import { setupTestMCP } from '@utils/mcp';

const mcpServers = await setupTestMCP();
const result = await mcpServers['claude-flow'].executeTool('agent_spawn', {
  type: 'coder'
});
```

### 2. Test Fixtures

Pre-configured test data for common scenarios:

- **Agents**: 6 agent types (coder, tester, reviewer, architect, compliance, quote)
- **Swarms**: 3 swarm configurations (TDD mesh, mortgage mesh, compliance hierarchical)
- **Memory Patterns**: 5 common patterns (DTI, TRID, microservices, TDD, LTV)
- **Leads**: 3 borrower profiles with varying qualifications
- **Rates**: 3 mortgage rate quotes from different lenders

### 3. Example Test Suites

#### Agent Coordination Tests
- Single agent lifecycle (spawn, execute, stop)
- Peer-to-peer communication in mesh topology
- Swarm initialization and task coordination
- Dynamic agent spawning
- TDD Red-Green-Refactor workflow

#### Memory Coordination Tests
- RuVector vector search and retrieval
- Letta conversational history management
- Graphiti knowledge graph operations
- Mem0 user preference storage
- Multi-system coordination patterns

#### Mortgage Domain Tests
- DTI calculation with CFPB compliance (43% threshold)
- LTV calculation with PMI requirements
- Edge cases and boundary conditions
- Rounding and precision handling

#### Regression Test Suite
- Agent coordination failures
- Memory leaks and race conditions
- Stale data issues
- TDD workflow gaps
- Compliance validation errors
- Performance regressions

## TDD Workflow

### Red-Green-Refactor Cycle

#### 1. Red Phase: Write Failing Test
```typescript
describe('MortgageCalculator', () => {
  it('should calculate monthly payment', () => {
    const calculator = new MortgageCalculator();
    const payment = calculator.calculatePayment({
      principal: 350000,
      rate: 0.0625,
      years: 30
    });
    expect(payment).toBeCloseTo(2154.24, 2);
  });
});
```

#### 2. Green Phase: Minimal Implementation
```typescript
class MortgageCalculator {
  calculatePayment({ principal, rate, years }) {
    const monthlyRate = rate / 12;
    const payments = years * 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) /
           (Math.pow(1 + monthlyRate, payments) - 1);
  }
}
```

#### 3. Refactor Phase: Improve Code Quality
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

## Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Watch mode (TDD development)
pnpm test:watch

# Run specific test suite
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:performance

# Coverage report
pnpm test:coverage

# Interactive UI mode
pnpm test:ui

# Verbose output
pnpm test:coverage:detailed
```

### Filtering Tests

```bash
# Run specific file
pnpm test dti-calculation.test.ts

# Run tests matching pattern
pnpm test --grep "DTI"

# Run only changed files
pnpm test --changed
```

## Configuration

### Vitest Config (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90
      }
    },
    testTimeout: 10000,
    mockReset: true,
    restoreMocks: true,
    clearMocks: true
  }
});
```

### Path Aliases

```typescript
{
  '@': './src',
  '@tests': './tests',
  '@fixtures': './tests/fixtures',
  '@mocks': './tests/mocks',
  '@utils': './tests/utils'
}
```

## Best Practices

### 1. London School TDD Principles

- **Mock all dependencies**: Database, APIs, file system, external services
- **Test interactions**: Verify method calls, not just state changes
- **Outside-in development**: Start with high-level tests, work inward
- **Rapid feedback**: Tests run in milliseconds

### 2. Test Structure (Arrange-Act-Assert)

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

### 3. Naming Conventions

```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should calculate DTI correctly for typical scenario', () => { ... });
it('REGRESSION-XXX: Description of the bug', () => { ... });
```

### 4. Mock Verification

```typescript
it('should call dependency with correct parameters', () => {
  const mockDependency = vi.fn();
  const service = new Service(mockDependency);

  service.doSomething('param');

  expect(mockDependency).toHaveBeenCalledWith('param');
  expect(mockDependency).toHaveBeenCalledTimes(1);
});
```

## Mortgage Domain Testing

### DTI (Debt-to-Income) Tests

```typescript
describe('DTI Calculation', () => {
  it('should qualify borrower with DTI at 43%', () => {
    const calculator = new DTICalculator();
    const result = calculator.calculate(3440, 8000);

    expect(result.dti).toBe(43);
    expect(result.isQualified).toBe(true); // CFPB threshold
  });

  it('should not qualify borrower with DTI above 43%', () => {
    const calculator = new DTICalculator();
    const result = calculator.calculate(3500, 8000);

    expect(result.isQualified).toBe(false);
  });
});
```

### LTV (Loan-to-Value) Tests

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

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Push to main branch
- Release tags

See `.github/workflows/test.yml` for configuration.

## Troubleshooting

### Tests Timing Out

Increase timeout:
```typescript
it('slow test', async () => {
  // ...
}, 30000); // 30 second timeout
```

### Flaky Tests

Use fake timers:
```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Mock Not Working

Clear mocks before each test:
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
```

## Next Steps

1. ✅ Test framework initialized with Vitest
2. ✅ Mock utilities created for all systems
3. ✅ Example tests written for each domain
4. ✅ Regression suite template created
5. ✅ Comprehensive testing guide documented
6. ✅ Coverage thresholds configured (90% target)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [TDD London School](https://github.com/testdouble/contributing-tests/wiki/London-school-TDD)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Playwright Documentation](https://playwright.dev/)
- [Project Testing Guide](../tests/TESTING_GUIDE.md)

## Quick Start

```bash
# Start TDD development with watch mode
pnpm test:watch

# Open UI for interactive testing
pnpm test:ui

# Run all tests with coverage
pnpm test:coverage
```

**Ready for TDD development!** The framework supports the complete Red-Green-Refactor cycle with comprehensive mocking for all dependencies.
