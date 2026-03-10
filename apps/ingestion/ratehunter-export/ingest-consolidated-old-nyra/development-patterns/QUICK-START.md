# Development Patterns - Quick Start Guide

**5-Minute Setup** | Get productive with Project Nyra patterns immediately

## 🚀 Installation

### 1. Install VS Code Snippets

The snippets are already installed in the `.vscode` folder. Just reload VS Code:

```bash
# Reload VS Code to activate snippets
Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)
Type: "Reload Window"
```

### 2. Verify Installation

Create a new `.ts` file and type:
- `nyra-repository` - Should show snippet autocomplete
- `nyra-service` - Should show snippet autocomplete

## ⚡ Quick Patterns

### Create a New Service in 3 Steps

#### Step 1: Create Directory Structure

```bash
cd services/my-service
mkdir -p src/{services,repositories,controllers,dto,events,__tests__}
```

#### Step 2: Use Snippets

1. **Create Repository** (`src/repositories/user.repository.ts`)
   ```typescript
   // Type: nyra-repository
   // Fill in: Entity name (e.g., "User")
   ```

2. **Create Service** (`src/services/user.service.ts`)
   ```typescript
   // Type: nyra-service
   // Fill in: Entity name, fields
   ```

3. **Create Controller** (`src/controllers/user.controller.ts`)
   ```typescript
   // Type: nyra-api-controller
   // Fill in: Entity name, endpoints
   ```

4. **Create Tests** (`src/services/__tests__/user.service.test.ts`)
   ```typescript
   // Type: nyra-test-service
   // Fill in: Entity name, test cases
   ```

#### Step 3: Wire Up Dependencies

```typescript
// src/index.ts
import { PrismaClient } from '@prisma/client';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { EventBus } from '@nyra/shared/events';
import { Logger } from '@nyra/shared/logger';

// Initialize dependencies
const prisma = new PrismaClient();
const eventBus = new EventBus();
const logger = new Logger();

// Create instances
const userRepository = new UserRepository(prisma, logger);
const userService = new UserService(userRepository, eventBus, logger);
const userController = new UserController(userService, logger);

// Register routes
app.use('/api/users', userController.getRouter());
```

## 📝 Common Patterns

### 1. Repository Pattern

**When**: You need data access abstraction

**Snippet**: `nyra-repository`

**Example**:
```typescript
class UserRepository extends BaseRepository<User> {
  protected get model() {
    return this.prisma.user;
  }

  async findByEmail(email: string) {
    return this.model.findUnique({ where: { email } });
  }
}
```

---

### 2. Service Layer Pattern

**When**: You need business logic coordination

**Snippet**: `nyra-service`

**Example**:
```typescript
class UserService extends BaseService<User> {
  protected async afterCreate(user: User) {
    await this.eventBus.publish(new UserCreatedEvent(user));
  }
}
```

---

### 3. Circuit Breaker Pattern

**When**: Calling external APIs or unreliable services

**Snippet**: `nyra-circuit-breaker`

**Example**:
```typescript
const apiBreaker = CircuitBreakerFactory.createForAPI('payment-gateway');

async function processPayment(amount: number) {
  return apiBreaker.execute(async () => {
    return await paymentGateway.charge(amount);
  });
}
```

---

### 4. Event-Driven Pattern

**When**: Services need to communicate without tight coupling

**Snippet**: `nyra-event-bus` or `nyra-domain-event`

**Example**:
```typescript
// Define event
class UserCreatedEvent implements IEvent {
  type = 'user.created';
  constructor(public data: { userId: string }) {}
}

// Subscribe
eventBus.subscribe('user.created', async (event) => {
  await emailService.sendWelcome(event.data.userId);
});

// Publish
await eventBus.publish(new UserCreatedEvent({ userId: user.id }));
```

---

### 5. Caching Pattern

**When**: You need to optimize performance

**Snippet**: `nyra-cache`

**Example**:
```typescript
const cacheManager = new CacheManager(redisUrl);

async function getUser(id: string) {
  return cacheManager.getOrSet(
    id,
    async () => await database.users.findUnique({ where: { id } }),
    { prefix: 'user', ttl: 300 }
  );
}
```

## 🎯 Pattern Decision Tree

```
Need to...
├─ Access database?
│  └─ Use: Repository Pattern (nyra-repository)
│
├─ Implement business logic?
│  └─ Use: Service Layer Pattern (nyra-service)
│
├─ Call external API?
│  └─ Use: Circuit Breaker Pattern (nyra-circuit-breaker)
│
├─ Decouple services?
│  └─ Use: Event-Driven Pattern (nyra-event-bus)
│
├─ Optimize performance?
│  └─ Use: Caching Pattern (nyra-cache)
│
└─ Create API endpoint?
   └─ Use: API Controller Pattern (nyra-api-controller)
```

## 🔧 Template Files

If snippets aren't working, copy templates manually:

```bash
# Repository
cp bootstrap/templates/development-patterns/base.repository.template.ts \
   services/my-service/src/repositories/base.repository.ts

# Service
cp bootstrap/templates/development-patterns/base.service.template.ts \
   services/my-service/src/services/base.service.ts

# Circuit Breaker
cp bootstrap/templates/development-patterns/circuit-breaker.template.ts \
   packages/shared/src/resilience/circuit-breaker.ts

# Unit of Work
cp bootstrap/templates/development-patterns/unit-of-work.template.ts \
   services/my-service/src/repositories/unit-of-work.ts

# Tests
cp bootstrap/templates/development-patterns/service.test.template.ts \
   services/my-service/src/services/__tests__/entity.service.test.ts
```

Then replace placeholders:
- `{{ServiceName}}` → Your service name (e.g., `User`)
- `{{serviceName}}` → Camel case (e.g., `user`)
- `{{field}}` → Field name (e.g., `email`)
- `{{value}}` → Field value (e.g., `test@example.com`)

## 📚 Full Examples

### Complete User Service Example

```typescript
// 1. Repository
class UserRepository extends BaseRepository<User> {
  protected get model() {
    return this.prisma.user;
  }

  protected get entityName() {
    return 'User';
  }

  async findByEmail(email: string) {
    return this.model.findUnique({ where: { email } });
  }
}

// 2. Service
class UserService extends BaseService<User> {
  protected get entityName() {
    return 'User';
  }

  async findByEmail(email: string) {
    return this.repository.findByEmail(email);
  }

  protected async validateCreate(data: Partial<User>) {
    if (!data.email) {
      throw new ValidationError('Email is required');
    }

    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }
  }

  protected async afterCreate(user: User) {
    await this.eventBus.publish(new UserCreatedEvent({
      userId: user.id,
      email: user.email
    }));
  }
}

// 3. Controller
class UserController {
  async create(req: Request, res: Response) {
    try {
      const user = await this.userService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}

// 4. Event Handler
eventBus.subscribe('user.created', async (event) => {
  await emailService.sendWelcomeEmail(event.data.email);
});
```

### Complete API with Circuit Breaker

```typescript
// 1. Create circuit breaker
const paymentBreaker = CircuitBreakerFactory.createForAPI('stripe');

// 2. Wrap external call
async function processPayment(amount: number) {
  const result = await paymentBreaker.executeWithFallback(async () => {
    return await stripe.charges.create({ amount });
  });

  if (result.success) {
    return result.data;
  } else {
    // Use fallback logic
    await queuePaymentForRetry(amount);
    throw new Error('Payment service unavailable');
  }
}

// 3. Monitor circuit breaker
paymentBreaker.on('open', () => {
  logger.error('Payment service circuit opened');
  alertOps('Payment service is down');
});
```

## 🐛 Troubleshooting

### Snippets Not Showing

1. **Reload VS Code**
   ```
   Ctrl+Shift+P → "Reload Window"
   ```

2. **Check file extension**
   - Snippets only work in `.ts` files
   - Not in `.js` or `.txt` files

3. **Manual activation**
   ```
   Ctrl+Space to trigger IntelliSense
   ```

### Import Errors

```typescript
// Make sure packages are installed
pnpm install @nyra/shared

// Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@nyra/shared/*": ["../../packages/shared/src/*"]
    }
  }
}
```

### Type Errors

```typescript
// Install Prisma types
pnpm prisma generate

// Rebuild packages
pnpm build
```

## 📖 Next Steps

1. **Read Full Guide**: `docs/development/DEVELOPMENT-PATTERNS-IMPL.md`
2. **Browse Templates**: `bootstrap/templates/development-patterns/`
3. **Study Examples**: Check existing services in `services/*/src/`
4. **Run Tests**: `pnpm test` to see patterns in action

## 💡 Pro Tips

1. **Use Tab Completion**: Type prefix and press Tab to expand snippet
2. **Chain Patterns**: Use multiple patterns together for robust services
3. **Test First**: Use `nyra-test-service` before implementing
4. **Read Comments**: Templates include inline documentation
5. **Customize**: Extend base classes with your own methods

## 🤝 Getting Help

- **Documentation**: `docs/development/`
- **Examples**: `services/*/src/`
- **Issues**: Create ticket with label `pattern-help`
- **Team Chat**: Ask in #development channel

---

**Ready to Code?** Start with `nyra-service` and build from there! 🚀
