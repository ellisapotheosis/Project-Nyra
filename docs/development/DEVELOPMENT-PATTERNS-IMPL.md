# Development Patterns Implementation Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-10
**Project**: Project Nyra Monorepo

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Core Development Patterns](#core-development-patterns)
3. [Architecture Patterns](#architecture-patterns)
4. [Testing Patterns](#testing-patterns)
5. [Error Handling Patterns](#error-handling-patterns)
6. [Performance Patterns](#performance-patterns)
7. [Security Patterns](#security-patterns)
8. [Quick Reference](#quick-reference)

## Introduction

This guide provides production-ready implementations of proven development patterns adapted for Project Nyra's architecture. All patterns are tested, documented, and ready for use in the monorepo.

### Available Resources

- **Templates**: `bootstrap/templates/development-patterns/`
- **VS Code Snippets**: `.vscode/nyra-patterns.code-snippets`
- **Test Examples**: `bootstrap/templates/development-patterns/__tests__/`

### Pattern Categories

| Category | Patterns | Use Cases |
|----------|----------|-----------|
| Architecture | Repository, UoW, Event-Driven | Data access, service design |
| Testing | TDD, Mock Strategies | Test automation, coverage |
| Error Handling | Circuit Breaker, Graceful Degradation | Resilience, fault tolerance |
| Performance | Caching, Query Optimization | Speed, scalability |
| Security | Defense in Depth, Token Management | Authentication, authorization |

## Core Development Patterns

### 1. Repository Pattern with Unit of Work

**Purpose**: Abstract data access and manage transactions consistently.

**When to Use**:
- Complex data operations requiring transactions
- Multiple database operations that must succeed/fail together
- Need to mock data access for testing

**Implementation**:

```typescript
// Location: services/{service-name}/src/repositories/base.repository.ts
import { PrismaClient } from '@prisma/client';

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export abstract class BaseRepository<T> implements IRepository<T> {
  constructor(protected prisma: PrismaClient) {}

  abstract get model(): any;

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findAll(filters?: any): Promise<T[]> {
    return this.model.findMany(filters);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }
}
```

**Unit of Work**:

```typescript
// Location: services/{service-name}/src/repositories/unit-of-work.ts
import { PrismaClient } from '@prisma/client';
import { UserRepository } from './user.repository';
import { LeadRepository } from './lead.repository';

export interface IUnitOfWork {
  users: UserRepository;
  leads: LeadRepository;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export class UnitOfWork implements IUnitOfWork {
  private _users?: UserRepository;
  private _leads?: LeadRepository;
  private transactionClient?: PrismaClient;

  constructor(private prisma: PrismaClient) {}

  get users(): UserRepository {
    return this._users ??= new UserRepository(this.getClient());
  }

  get leads(): LeadRepository {
    return this._leads ??= new LeadRepository(this.getClient());
  }

  private getClient(): PrismaClient {
    return this.transactionClient || this.prisma;
  }

  async commit(): Promise<void> {
    if (this.transactionClient) {
      await this.transactionClient.$commit();
    }
  }

  async rollback(): Promise<void> {
    if (this.transactionClient) {
      await this.transactionClient.$rollback();
    }
  }

  async executeTransaction<T>(
    work: (uow: UnitOfWork) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const txUow = new UnitOfWork(tx as PrismaClient);
      txUow.transactionClient = tx as PrismaClient;
      return work(txUow);
    });
  }
}
```

**Usage Example**:

```typescript
// In your service
async createLeadWithUser(leadData: any, userData: any) {
  const uow = new UnitOfWork(this.prisma);

  return uow.executeTransaction(async (txUow) => {
    const user = await txUow.users.create(userData);
    const lead = await txUow.leads.create({
      ...leadData,
      userId: user.id
    });

    return { user, lead };
  });
}
```

**VS Code Snippet**: Type `nyra-repository` or `nyra-uow`

---

### 2. Circuit Breaker Pattern

**Purpose**: Prevent cascading failures in distributed systems.

**When to Use**:
- External API calls
- Database connections
- Microservice communication
- Any operation prone to transient failures

**Implementation**:

```typescript
// Location: packages/shared/src/resilience/circuit-breaker.ts
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Successes needed in HALF_OPEN to close
  timeout: number; // Time in ms to wait before trying HALF_OPEN
  onStateChange?: (state: CircuitState) => void;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt: number = Date.now();

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.transitionTo(CircuitState.HALF_OPEN);
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.options.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
      this.nextAttempt = Date.now() + this.options.timeout;
    }
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.options.onStateChange?.(newState);
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }
}
```

**Usage Example**:

```typescript
// Protect external API calls
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
  onStateChange: (state) => {
    logger.warn(`Circuit breaker state changed to ${state}`);
  }
});

async function callExternalAPI(data: any) {
  return breaker.execute(async () => {
    const response = await fetch('https://external-api.com/endpoint', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  });
}
```

**VS Code Snippet**: Type `nyra-circuit-breaker`

---

### 3. Event-Driven Architecture Pattern

**Purpose**: Decouple services through asynchronous event communication.

**When to Use**:
- Microservices communication
- Asynchronous workflows
- System-wide notifications
- Audit logging

**Implementation**:

```typescript
// Location: packages/shared/src/events/event-bus.ts
export interface IEvent {
  id: string;
  type: string;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

export type EventHandler<T = any> = (event: IEvent<T>) => Promise<void> | void;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private wildcardHandlers: Set<EventHandler> = new Set();

  subscribe(eventType: string, handler: EventHandler): () => void {
    if (eventType === '*') {
      this.wildcardHandlers.add(handler);
      return () => this.wildcardHandlers.delete(handler);
    }

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(eventType);
        }
      }
    };
  }

  async publish(event: IEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || new Set();
    const allHandlers = [...handlers, ...this.wildcardHandlers];

    await Promise.allSettled(
      allHandlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      })
    );
  }

  clear(): void {
    this.handlers.clear();
    this.wildcardHandlers.clear();
  }
}

// Global instance
export const eventBus = new EventBus();
```

**Domain Events**:

```typescript
// Location: services/{service-name}/src/events/lead.events.ts
import { IEvent } from '@nyra/shared/events';

export class LeadCreatedEvent implements IEvent {
  id: string;
  type = 'lead.created';
  timestamp: Date;

  constructor(
    public data: {
      leadId: string;
      email: string;
      source: string;
    }
  ) {
    this.id = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class LeadAssignedEvent implements IEvent {
  id: string;
  type = 'lead.assigned';
  timestamp: Date;

  constructor(
    public data: {
      leadId: string;
      agentId: string;
      assignedBy: string;
    }
  ) {
    this.id = crypto.randomUUID();
    this.timestamp = new Date();
  }
}
```

**Usage Example**:

```typescript
// Subscribe to events
eventBus.subscribe('lead.created', async (event) => {
  const { leadId, email } = event.data;
  await emailService.sendWelcomeEmail(email);
});

eventBus.subscribe('lead.created', async (event) => {
  const { leadId, source } = event.data;
  await analyticsService.trackLeadSource(source);
});

// Publish events
async createLead(data: CreateLeadDto) {
  const lead = await this.leadRepository.create(data);

  await eventBus.publish(new LeadCreatedEvent({
    leadId: lead.id,
    email: lead.email,
    source: lead.source
  }));

  return lead;
}
```

**VS Code Snippet**: Type `nyra-event-bus` or `nyra-domain-event`

---

## Architecture Patterns

### Service Layer Pattern

**Purpose**: Centralize business logic and coordinate operations.

**Template Location**: `bootstrap/templates/development-patterns/service-layer/`

**Structure**:

```
services/{service-name}/src/
├── services/
│   ├── base.service.ts
│   ├── user.service.ts
│   └── lead.service.ts
├── repositories/
│   ├── base.repository.ts
│   ├── user.repository.ts
│   └── lead.repository.ts
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
└── events/
    └── user.events.ts
```

**Implementation**:

```typescript
// Location: services/{service-name}/src/services/base.service.ts
import { IRepository } from '../repositories/base.repository';
import { IUnitOfWork } from '../repositories/unit-of-work';
import { Logger } from '@nyra/shared/logger';

export abstract class BaseService<T> {
  constructor(
    protected repository: IRepository<T>,
    protected uow: IUnitOfWork,
    protected logger: Logger
  ) {}

  async findById(id: string): Promise<T | null> {
    this.logger.debug(`Finding ${this.entityName} by id: ${id}`);
    return this.repository.findById(id);
  }

  async findAll(filters?: any): Promise<T[]> {
    this.logger.debug(`Finding all ${this.entityName}s`, filters);
    return this.repository.findAll(filters);
  }

  async create(data: Partial<T>): Promise<T> {
    this.logger.info(`Creating ${this.entityName}`, data);

    await this.validateCreate(data);

    return this.uow.executeTransaction(async (txUow) => {
      const entity = await this.repository.create(data);
      await this.afterCreate(entity);
      return entity;
    });
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    this.logger.info(`Updating ${this.entityName}: ${id}`, data);

    await this.validateUpdate(id, data);

    return this.uow.executeTransaction(async (txUow) => {
      const entity = await this.repository.update(id, data);
      await this.afterUpdate(entity);
      return entity;
    });
  }

  async delete(id: string): Promise<void> {
    this.logger.info(`Deleting ${this.entityName}: ${id}`);

    await this.validateDelete(id);

    return this.uow.executeTransaction(async (txUow) => {
      await this.beforeDelete(id);
      await this.repository.delete(id);
      await this.afterDelete(id);
    });
  }

  protected abstract get entityName(): string;
  protected async validateCreate(data: Partial<T>): Promise<void> {}
  protected async validateUpdate(id: string, data: Partial<T>): Promise<void> {}
  protected async validateDelete(id: string): Promise<void> {}
  protected async afterCreate(entity: T): Promise<void> {}
  protected async afterUpdate(entity: T): Promise<void> {}
  protected async beforeDelete(id: string): Promise<void> {}
  protected async afterDelete(id: string): Promise<void> {}
}
```

**VS Code Snippet**: Type `nyra-service-layer`

---

## Testing Patterns

### Test-Driven Development Setup

**Template Location**: `bootstrap/templates/development-patterns/testing/`

**Jest Configuration**:

```typescript
// Location: services/{service-name}/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};
```

**Test Structure**:

```typescript
// Location: services/{service-name}/src/services/__tests__/user.service.test.ts
import { UserService } from '../user.service';
import { UserRepository } from '../../repositories/user.repository';
import { UnitOfWork } from '../../repositories/unit-of-work';
import { createMockLogger } from '@nyra/shared/test-utils';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;
  let mockUow: jest.Mocked<UnitOfWork>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    mockUow = createMockUnitOfWork();
    mockLogger = createMockLogger();

    service = new UserService(mockRepository, mockUow, mockLogger);
  });

  describe('create', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User'
      };

      const expectedUser = {
        id: '123',
        ...userData,
        createdAt: new Date()
      };

      mockRepository.create.mockResolvedValue(expectedUser);
      mockUow.executeTransaction.mockImplementation((fn) => fn(mockUow));

      // Act
      const result = await service.create(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockRepository.create).toHaveBeenCalledWith(userData);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Creating'),
        userData
      );
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      const userData = { email: 'duplicate@example.com' };
      mockRepository.create.mockRejectedValue(
        new Error('Unique constraint violation')
      );

      // Act & Assert
      await expect(service.create(userData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = '123';
      const expectedUser = { id: userId, email: 'test@example.com' };
      mockRepository.findById.mockResolvedValue(expectedUser);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
    });

    it('should return null when not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });
});

// Test helpers
function createMockRepository(): jest.Mocked<UserRepository> {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  } as any;
}

function createMockUnitOfWork(): jest.Mocked<UnitOfWork> {
  return {
    executeTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
  } as any;
}
```

**VS Code Snippet**: Type `nyra-test-service` or `nyra-test-mock`

---

## Performance Patterns

### Multi-Level Caching Strategy

**Implementation**:

```typescript
// Location: packages/shared/src/cache/cache-manager.ts
import NodeCache from 'node-cache';
import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export class CacheManager {
  private l1Cache: NodeCache; // Memory cache
  private l2Cache: Redis; // Redis cache

  constructor(redisUrl: string) {
    this.l1Cache = new NodeCache({
      stdTTL: 60,
      checkperiod: 120,
      useClones: false
    });

    this.l2Cache = new Redis(redisUrl);
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const fullKey = this.getKey(key, options?.prefix);

    // Try L1 (memory) first
    const l1Value = this.l1Cache.get<T>(fullKey);
    if (l1Value !== undefined) {
      return l1Value;
    }

    // Try L2 (Redis)
    const l2Value = await this.l2Cache.get(fullKey);
    if (l2Value) {
      const parsed = JSON.parse(l2Value) as T;
      // Promote to L1
      this.l1Cache.set(fullKey, parsed, options?.ttl || 60);
      return parsed;
    }

    return null;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.getKey(key, options?.prefix);
    const ttl = options?.ttl || 3600;

    // Set in L1
    this.l1Cache.set(fullKey, value, ttl);

    // Set in L2
    await this.l2Cache.setex(fullKey, ttl, JSON.stringify(value));
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, options);
    return value;
  }

  async delete(key: string, prefix?: string): Promise<void> {
    const fullKey = this.getKey(key, prefix);
    this.l1Cache.del(fullKey);
    await this.l2Cache.del(fullKey);
  }

  async clear(prefix?: string): Promise<void> {
    if (prefix) {
      const pattern = `${prefix}:*`;
      const keys = await this.l2Cache.keys(pattern);
      if (keys.length > 0) {
        await this.l2Cache.del(...keys);
      }
    } else {
      this.l1Cache.flushAll();
      await this.l2Cache.flushall();
    }
  }

  private getKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }
}
```

**Usage Example**:

```typescript
const cacheManager = new CacheManager(process.env.REDIS_URL!);

// Cache user data
async function getUserProfile(userId: string) {
  return cacheManager.getOrSet(
    userId,
    async () => {
      const user = await database.users.findUnique({
        where: { id: userId },
        include: { profile: true }
      });
      return user;
    },
    {
      prefix: 'user:profile',
      ttl: 300 // 5 minutes
    }
  );
}
```

**VS Code Snippet**: Type `nyra-cache-manager`

---

## Security Patterns

### JWT Token Management

**Implementation**:

```typescript
// Location: services/auth-service/src/utils/token-manager.ts
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';

export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export class TokenManager {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET!;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;

    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT secrets not configured');
    }
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'nyra-auth',
      audience: 'nyra-api'
    });
  }

  generateRefreshToken(userId: string): string {
    const jti = randomBytes(16).toString('hex');

    return jwt.sign(
      { userId, jti },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'nyra-auth'
      }
    );
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: 'nyra-auth',
        audience: 'nyra-api'
      }) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): { userId: string; jti: string } {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'nyra-auth'
      }) as { userId: string; jti: string };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async storeRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    const tokenHash = this.hashToken(token);

    await database.refreshTokens.create({
      data: {
        userId,
        tokenHash,
        expiresAt
      }
    });
  }

  async validateRefreshToken(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);

    const stored = await database.refreshTokens.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
        revoked: false
      }
    });

    return !!stored;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);

    await database.refreshTokens.updateMany({
      where: { tokenHash },
      data: { revoked: true }
    });
  }
}
```

**VS Code Snippet**: Type `nyra-token-manager`

---

## Quick Reference

### Pattern Decision Matrix

| Need | Pattern | Template Snippet |
|------|---------|------------------|
| Data access abstraction | Repository + UoW | `nyra-repository` |
| Service orchestration | Service Layer | `nyra-service-layer` |
| API resilience | Circuit Breaker | `nyra-circuit-breaker` |
| Decoupled communication | Event Bus | `nyra-event-bus` |
| Performance optimization | Cache Manager | `nyra-cache-manager` |
| Authentication | Token Manager | `nyra-token-manager` |
| Unit testing | Test Suite | `nyra-test-service` |

### Common Anti-Patterns to Avoid

1. **God Objects**: Services doing too much
   - ❌ `UserService` handling auth, emails, payments
   - ✅ Separate `AuthService`, `EmailService`, `PaymentService`

2. **Anemic Domain Models**: Models with no behavior
   - ❌ Models as data containers only
   - ✅ Models with business logic and validation

3. **Transaction Script**: Logic in controllers
   - ❌ Business logic in API routes
   - ✅ Logic in service layer

4. **Circular Dependencies**: Services depending on each other
   - ❌ `UserService` → `OrderService` → `UserService`
   - ✅ Use events or shared interfaces

5. **Missing Error Handling**: No try-catch blocks
   - ❌ Unhandled promise rejections
   - ✅ Proper error boundaries

### Best Practices Checklist

- [ ] Use TypeScript strict mode
- [ ] Implement proper error handling
- [ ] Write tests for all services
- [ ] Use dependency injection
- [ ] Log important operations
- [ ] Validate inputs with DTOs
- [ ] Use environment variables for config
- [ ] Implement proper caching strategy
- [ ] Use transactions for multi-step operations
- [ ] Document complex business logic

### Next Steps

1. Review templates in `bootstrap/templates/development-patterns/`
2. Install VS Code snippets
3. Implement patterns in your service
4. Write tests using test templates
5. Share learnings with the team

### Additional Resources

- [Architecture Decision Records](../architecture/adr/)
- [API Guidelines](../api/rest-api.md)
- [Testing Strategy](./testing-strategy.md)
- [Security Guidelines](../security/security-guidelines.md)

---

**Need Help?** Contact the architecture team or create an issue in the repo.
