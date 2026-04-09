# CLAUDE.md Template: TDD Methodology

**Development Approach**: Test-Driven Development (Red-Green-Refactor)
**Testing Framework**: {{TESTING_FRAMEWORK}} (Jest/Mocha/Vitest)
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**TDD requires tight coordination between coders and testers:**

1. **TDD Coordinator**: Oversee test/code cycle
2. **Test-First Developer**: Write tests first
3. **Implementation Developer**: Implement code
4. **Refactoring Specialist**: Code quality focus

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized

# Spawn TDD-focused agents
npx @claude-flow/cli@latest agent spawn -t coder --name test-first-dev --capabilities "testing,jest,unit-tests"
npx @claude-flow/cli@latest agent spawn -t coder --name impl-dev --capabilities "implementation,code-quality"
npx @claude-flow/cli@latest agent spawn -t coder --name refactor-specialist --capabilities "refactoring,optimization"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Primary Language**: {{LANGUAGE}}
- **Testing Framework**: {{TESTING_FRAMEWORK}}
- **Coverage Target**: {{COVERAGE_TARGET}}% (typically 85%+)
- **Development Cycle**: Red → Green → Refactor

## 🔧 TDD Cycle & Workflow

### Directory Structure for TDD
```
project/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   └── register.ts
│   │   ├── users/
│   │   │   ├── createUser.ts
│   │   │   ├── updateUser.ts
│   │   │   └── deleteUser.ts
│   │   └── products/
│   ├── utils/
│   ├── types/
│   └── index.ts
├── tests/
│   ├── unit/
│   │   ├── auth/
│   │   │   ├── login.test.ts
│   │   │   ├── logout.test.ts
│   │   │   └── register.test.ts
│   │   └── users/
│   │       ├── createUser.test.ts
│   │       ├── updateUser.test.ts
│   │       └── deleteUser.test.ts
│   ├── integration/
│   ├── fixtures/
│   └── setup.ts
├── jest.config.js
└── package.json
```

## 🐝 TDD Swarm Orchestration

### Red Phase (Test First)
- **Duration**: 1-2 days per feature
- **Agents**: Test-First Developer
- **Task**: Write failing tests that describe desired behavior
- **Output**: Test suite defining requirements

### Green Phase (Make It Pass)
- **Duration**: 1-3 days per feature
- **Agents**: Implementation Developer
- **Task**: Write minimal code to pass tests
- **Output**: Working implementation

### Refactor Phase (Code Quality)
- **Duration**: 1-2 days per feature
- **Agents**: Refactoring Specialist, Test-First Developer
- **Task**: Improve code without changing behavior
- **Output**: Clean, maintainable code

## 🧠 Memory Management

### Store Test Patterns
```bash
npx @claude-flow/cli@latest memory store --key "test-patterns-{{PROJECT_NAME}}" \
  --value "Mock strategies, fixture patterns, assertion helpers" \
  --namespace testing --tags "tdd,patterns"
```

### Store Refactoring Decisions
```bash
npx @claude-flow/cli@latest memory store --key "refactoring-guides-{{PROJECT_NAME}}" \
  --value "Code smell patterns, refactoring techniques, best practices" \
  --namespace refactoring --tags "code-quality"
```

## 🚀 TDD Workflow

### 1. Red Phase - Write Tests First

```typescript
// tests/unit/features/users/createUser.test.ts
import { createUser } from '../../../src/features/users/createUser';

describe('createUser', () => {
  it('should create a new user with valid input', async () => {
    const input = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecurePass123!',
    };

    const result = await createUser(input);

    expect(result.id).toBeDefined();
    expect(result.email).toBe(input.email);
    expect(result.name).toBe(input.name);
  });

  it('should throw error if email already exists', async () => {
    const input = {
      email: 'existing@example.com',
      name: 'New User',
      password: 'SecurePass123!',
    };

    await expect(createUser(input)).rejects.toThrow('Email already registered');
  });

  it('should hash password before storing', async () => {
    const input = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecurePass123!',
    };

    const result = await createUser(input);
    const user = await getUserById(result.id);

    expect(user.password).not.toBe(input.password);
    expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash
  });

  it('should validate email format', async () => {
    const input = {
      email: 'invalid-email',
      name: 'Test User',
      password: 'SecurePass123!',
    };

    await expect(createUser(input)).rejects.toThrow('Invalid email format');
  });
});
```

### 2. Green Phase - Implement Code

```typescript
// src/features/users/createUser.ts
import bcrypt from 'bcrypt';
import { User } from '../../types';

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<User> {
  // Validate email format
  if (!isValidEmail(input.email)) {
    throw new Error('Invalid email format');
  }

  // Check if email exists
  const existing = await getUserByEmail(input.email);
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(input.password, 10);

  // Create user
  const user = {
    id: generateId(),
    email: input.email,
    name: input.name,
    password: hashedPassword,
  };

  await saveUser(user);
  return user;
}
```

### 3. Refactor Phase - Improve Code Quality

```typescript
// Refactored with better separation of concerns
export async function createUser(input: UserInput): Promise<User> {
  validateUserInput(input);
  await checkEmailUniqueness(input.email);

  const hashedPassword = await hashPassword(input.password);
  const user = buildUser(input, hashedPassword);

  return await persistUser(user);
}

// Extract validation
function validateUserInput(input: UserInput): void {
  if (!isValidEmail(input.email)) {
    throw new UserError('Invalid email format', 'INVALID_EMAIL');
  }
}

// Extract email uniqueness check
async function checkEmailUniqueness(email: string): Promise<void> {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new UserError('Email already registered', 'EMAIL_EXISTS');
  }
}
```

## 📊 Test Coverage & Metrics

### Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
```

### Generate Coverage Reports
```bash
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

## 🔒 Testing Security

### Security Test Examples
```typescript
describe('Security Tests', () => {
  it('should not expose password in user object', async () => {
    const user = await createUser({...});
    expect(user).not.toHaveProperty('password');
  });

  it('should prevent SQL injection', async () => {
    const input = {
      email: "test'; DROP TABLE users; --",
      name: 'Attacker',
      password: 'pass123',
    };

    await expect(createUser(input)).rejects.toThrow('Invalid email format');
  });

  it('should sanitize input data', async () => {
    const input = {
      email: 'test@example.com',
      name: '<script>alert("xss")</script>',
      password: 'SecurePass123!',
    };

    const user = await createUser(input);
    expect(user.name).not.toContain('<script>');
  });
});
```

## ✅ Test Types & Strategy

### Unit Tests (85%+ coverage)
```
- Pure functions
- Utilities
- Validators
- Transformers
```

### Integration Tests (50%+ coverage)
```
- Database operations
- External service calls
- Middleware chain
- API endpoints
```

### Contract Tests
```
- API response shapes
- Event schemas
- Service boundaries
```

## 🎯 TDD Performance Targets

- Test execution: <5 seconds full suite
- Coverage: 85%+ overall
- Passing tests: 100%
- Test stability: 100% (no flaky tests)

## 📋 TDD Checklist

- [ ] Testing framework configured
- [ ] Test setup and fixtures established
- [ ] Mock and stub strategies defined
- [ ] Test naming conventions established
- [ ] Coverage targets set
- [ ] Pre-commit hooks configured
- [ ] CI/CD test gate configured
- [ ] Coverage reporting set up
- [ ] Code review focuses on tests
- [ ] Team trained on TDD principles
- [ ] Refactoring schedule planned
- [ ] Technical debt tracked

---

**Generated from**: claude-flow CLAUDE.md TDD Methodology Template
