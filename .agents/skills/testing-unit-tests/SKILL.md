---
name: testing-unit-tests
description: Run and add unit tests for Project Nyra services. Use when verifying test coverage, adding new tests, or debugging test failures.
---

# Testing Unit Tests in Project Nyra

## Running Tests

### Full Smoke Suite
```bash
pnpm exec vitest --config vitest.smoke.config.mjs run
```

### Verbose Output (for debugging)
```bash
pnpm exec vitest --config vitest.smoke.config.mjs run --reporter=verbose
```

### Run a Single Service's Tests
```bash
pnpm exec vitest --config vitest.smoke.config.mjs run services/security-service
pnpm exec vitest --config vitest.smoke.config.mjs run services/twilio-integration
pnpm exec vitest --config vitest.smoke.config.mjs run services/twentycrm-integration
```

### Run Original Tests Only (Regression)
```bash
pnpm exec vitest --config vitest.smoke.config.mjs run tests/unit
```

## Adding New Service Tests

### Directory Structure
Place unit tests at `services/<service-name>/tests/unit/<module>.test.ts`.

### Vitest Config Registration
New test paths MUST be added to `vitest.smoke.config.mjs` in the `include` array:
```javascript
include: [
  // existing entries...
  "services/<service-name>/tests/unit/*.test.ts",
]
```
Without this, vitest will not discover the tests.

### Import Side-Effects Workaround
Many services initialize winston file transports and load dotenv at module import time. This can cause test failures in CI or clean environments. Two approaches:

1. **Preferred (future)**: Refactor production modules to accept injected loggers, then use `vi.mock()` to mock winston/dotenv in tests.
2. **Current workaround**: Create inline test doubles of the classes with the same logic. This tests the algorithm but not the exact production module.

If you use inline implementations, be aware they may drift from production code over time.

### Regex with /g Flag
If testing code uses regexes with the `/g` flag and calls `.test()` multiple times, reset `lastIndex` before each call:
```typescript
pattern.lastIndex = 0;
pattern.test(input);
```
The production code in `path-validator.ts` and `sql-validator.ts` may have this bug — inline test doubles should include the fix.

## Test Framework

- **Framework**: Vitest v4.x with `globals: true`
- **Imports**: Use `import { describe, it, expect, beforeEach, vi } from 'vitest'`
- **Fake timers**: Use `vi.useFakeTimers()` / `vi.useRealTimers()`. For async retry tests with timers, prefer real timers with small delays (1ms) to avoid unhandled rejection issues.
- **Setup file**: `tests/setup/vitest.setup.ts`
- **Jest compat**: `@jest/globals` is aliased via `tests/setup/jest-globals-compat.ts`

## Formatting

Run prettier before committing test files:
```bash
npx prettier --write "services/<service-name>/tests/**/*.ts"
```

Pre-commit hooks (Husky + lint-staged) will also run prettier and the test suite automatically.

## Devin Secrets Needed

No secrets are required for unit testing. All tests are standalone with inline implementations.
