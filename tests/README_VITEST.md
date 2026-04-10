# Vitest Test Framework - Quick Start

## Status: ✅ Operational

**60 tests passing** | **TDD London School** | **90% coverage threshold**

## Quick Commands

```bash
# Start TDD development (watch mode)
pnpm test:watch

# Run all new Vitest tests
pnpm test tests/unit/agents tests/unit/memory/memory-coordination.test.ts tests/unit/mortgage tests/unit/swarm

# Run specific test suite
pnpm test tests/unit/mortgage/dti-calculation.test.ts

# Coverage report
pnpm test:coverage

# Interactive UI
pnpm test:ui
```

## Test Suites

### ✅ Agent Coordination (12 tests)
`tests/unit/agents/agent-coordination.test.ts`
- Agent lifecycle (spawn, execute, stop)
- Peer-to-peer communication
- Swarm coordination (mesh, hierarchical)
- TDD workflow integration

### ✅ Memory Coordination (10 tests)
`tests/unit/memory/memory-coordination.test.ts`
- RuVector vector search
- Letta conversational memory
- letta knowledge graphs
- Mem0 user preferences
- Multi-system coordination

### ✅ DTI Calculation (12 tests)
`tests/unit/mortgage/dti-calculation.test.ts`
- Basic DTI formula
- CFPB 43% threshold
- Edge cases and rounding
- Compliance requirements

### ✅ LTV Calculation (16 tests)
`tests/unit/mortgage/ltv-calculation.test.ts`
- LTV formula
- PMI requirements (80% threshold)
- Loan type maximums (conventional, FHA, VA, USDA)
- Edge cases

### ✅ Regression Suite (12 tests)
`tests/unit/swarm/regression-suite.test.ts`
- Agent failures and memory leaks
- Race conditions
- Stale data issues
- Performance regressions

## Mock Utilities

### Agents
```typescript
import { createCoderAgent, createMockSwarm } from '@utils/agents';

const agent = createCoderAgent();
await agent.spawn();
await agent.execute({ description: 'Write unit test' });

const swarm = createMockSwarm('mesh', ['coder', 'tester']);
await swarm.coordinateTask({ description: 'TDD workflow' });
```

### Memory Systems
```typescript
import { setupTestMemory } from '@utils/memory';

const memory = await setupTestMemory();

// RuVector
await memory.ruvector.store('key', { data: 'value' });
const results = await memory.ruvector.search('query', 5);

// Letta
await memory.letta.store('agent-id', { message: 'content' });

// letta
await memory.letta.addNode({ id: 'node-1', type: 'Borrower' });

// Mem0
await memory.mem0.store('user-id', { preferences: {} });
```

## TDD Workflow

### Red Phase: Write Failing Test
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

### Green Phase: Minimal Implementation
Implement just enough code to make the test pass.

### Refactor Phase: Improve Code
Optimize code quality while keeping tests green.

## Fixtures

### Agents
`tests/fixtures/agents.json` - 6 agent types

### Swarms
`tests/fixtures/swarms.json` - 3 swarm configurations

### Memory Patterns
`tests/fixtures/memory-patterns.json` - 5 domain patterns

### Business Data
- `leads.json` - 3 borrower profiles
- `rates.json` - 3 mortgage quotes
- `users.json` - Test users

## Documentation

- **Testing Guide**: `tests/TESTING_GUIDE.md` (comprehensive 300+ lines)
- **Framework Setup**: `docs/TEST_FRAMEWORK_SETUP.md` (architecture reference)
- **Setup Summary**: `docs/TEST_SETUP_SUMMARY.md` (executive summary)

## Coverage Thresholds

```json
{
  "lines": 90,
  "functions": 90,
  "branches": 85,
  "statements": 90
}
```

## Test Results (Latest Run)

```
Test Files  5 passed (5)
Tests       60 passed (60)
Duration    519ms
```

**Test Suites:**
- ✅ Agent Coordination: 12/12
- ✅ Memory Coordination: 10/10
- ✅ DTI Calculation: 12/12
- ✅ LTV Calculation: 16/16
- ✅ Regression Suite: 12/12

## Next Steps

1. **Start TDD development**: `pnpm test:watch`
2. **Add more tests** following examples
3. **Migrate legacy tests** from Jest to Vitest (29 files remaining)
4. **Integrate CI/CD** for automated testing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [TDD London School](https://github.com/testdouble/contributing-tests/wiki/London-school-TDD)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Framework**: Vitest 4.0.18
**Approach**: TDD London School (Mockist)
**Status**: ✅ Ready for Production
**Tests**: 60/60 passing (100%)
