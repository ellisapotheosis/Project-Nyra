# CLAUDE.md Template: TypeScript Development

**Language**: TypeScript {{TYPESCRIPT_VERSION}} (5.0+)
**Runtime**: Node.js / Browser
**Compiler**: tsc / esbuild / swc
**Strict Mode**: Enabled

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **TypeScript Version**: {{TYPESCRIPT_VERSION}}
- **Runtime Environment**: {{RUNTIME}}
- **Build Tool**: {{BUILD_TOOL}}
- **Type Checking**: Strict

## 🔧 TypeScript Project Structure

```
project/
├── src/
│   ├── types/
│   │   ├── index.ts
│   │   ├── models.ts
│   │   └── api.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── database.ts
│   ├── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── tsconfig.json
├── package.json
└── README.md
```

## 🚀 TypeScript Configuration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Type Definitions Example
```typescript
// src/types/index.ts

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

// Generic response wrapper
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// API errors
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Typed Service Layer
```typescript
// src/services/userService.ts
import { User, CreateUserInput, ApiError } from '@/types';

export class UserService {
  async createUser(input: CreateUserInput): Promise<User> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new ApiError(
          'CREATE_USER_FAILED',
          response.status,
          'Failed to create user'
        );
      }

      return response.json() as Promise<User>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        'UNKNOWN_ERROR',
        500,
        'An unexpected error occurred'
      );
    }
  }
}
```

## ✅ Testing Strategy

### Jest + TypeScript
```typescript
// tests/unit/services/userService.test.ts
import { UserService } from '@/services/userService';
import { CreateUserInput, ApiError } from '@/types';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('should create a user with valid input', async () => {
    const input: CreateUserInput = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecurePass123!',
    };

    const user = await service.createUser(input);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(input.email);
  });

  it('should throw ApiError on failure', async () => {
    const input: CreateUserInput = {
      email: 'duplicate@example.com',
      name: 'Duplicate User',
      password: 'SecurePass123!',
    };

    await expect(service.createUser(input)).rejects.toThrow(ApiError);
  });
});
```

## 🧠 Memory Management

```bash
npx @claude-flow/cli@latest memory store --key "typescript-patterns-{{PROJECT_NAME}}" \
  --value "Type definitions, generic patterns, strict mode practices" \
  --namespace typescript --tags "types,patterns"
```

## 🎯 Performance Targets

- Build time: <5s
- Type checking: <3s
- Runtime: Matches native JS

## 📋 TypeScript Checklist

- [ ] TypeScript configured with strict mode
- [ ] Type definitions for all modules
- [ ] Generic types for reusable code
- [ ] Error handling with typed exceptions
- [ ] API response types defined
- [ ] Database model types created
- [ ] Testing configured with types
- [ ] Build process configured
- [ ] Type checking in CI/CD
- [ ] Documentation with JSDoc comments

---

**Generated from**: claude-flow CLAUDE.md TypeScript Template
