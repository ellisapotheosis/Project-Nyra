# Development Patterns Templates

This directory contains production-ready code templates implementing proven development patterns for Project Nyra.

## Available Templates

| Template | File | Description |
|----------|------|-------------|
| Repository | `base.repository.template.ts` | Data access abstraction layer |
| Unit of Work | `unit-of-work.template.ts` | Transaction management |
| Service Layer | `base.service.template.ts` | Business logic orchestration |
| API Controller | `api.controller.template.ts` | REST API endpoint handler |
| Circuit Breaker | `circuit-breaker.template.ts` | Fault tolerance pattern |
| Event Bus | `event-bus.template.ts` | Event-driven communication |
| Cache Manager | `cache-manager.template.ts` | Multi-level caching |
| Token Manager | `token-manager.template.ts` | JWT authentication |
| Test Suite | `service.test.template.ts` | Unit test structure |

## Usage

### Option 1: VS Code Snippets

Install the snippets file at `.vscode/nyra-patterns.code-snippets` and use shortcuts:

- `nyra-repository` - Repository pattern
- `nyra-service` - Service layer
- `nyra-api` - API controller
- `nyra-circuit-breaker` - Circuit breaker
- `nyra-event-bus` - Event bus
- `nyra-cache` - Cache manager
- `nyra-test` - Test suite

### Option 2: Copy Templates

```bash
# Copy repository template
cp bootstrap/templates/development-patterns/base.repository.template.ts \
   services/your-service/src/repositories/base.repository.ts

# Copy service template
cp bootstrap/templates/development-patterns/base.service.template.ts \
   services/your-service/src/services/base.service.ts
```

### Option 3: CLI Script

```bash
# Generate from template (coming soon)
pnpm nyra generate:service user-service --with-tests
pnpm nyra generate:repository user --entity User
```

## Template Variables

Replace these placeholders when using templates:

- `{{ServiceName}}` - Your service name (e.g., `User`, `Lead`, `Mortgage`)
- `{{serviceName}}` - Camel case version (e.g., `user`, `lead`, `mortgage`)
- `{{ENTITY_NAME}}` - Upper case (e.g., `USER`, `LEAD`, `MORTGAGE`)
- `{{description}}` - Service description
- `{{author}}` - Your name
- `{{date}}` - Current date

## Quick Start Guide

### Creating a New Service

1. **Create directory structure**:
```bash
mkdir -p services/my-service/src/{services,repositories,controllers,dto,events,__tests__}
```

2. **Copy base templates**:
```bash
cp bootstrap/templates/development-patterns/base.repository.template.ts \
   services/my-service/src/repositories/base.repository.ts

cp bootstrap/templates/development-patterns/base.service.template.ts \
   services/my-service/src/services/base.service.ts

cp bootstrap/templates/development-patterns/api.controller.template.ts \
   services/my-service/src/controllers/api.controller.ts
```

3. **Replace placeholders**:
```bash
# Use VS Code find/replace or sed
sed -i 's/{{ServiceName}}/MyService/g' services/my-service/src/services/*.ts
```

4. **Install dependencies**:
```bash
cd services/my-service
pnpm install
```

5. **Run tests**:
```bash
pnpm test
```

## Pattern Guidelines

### Repository Pattern

**When to use**:
- Need to abstract data access
- Multiple data sources
- Want testable data layer
- Complex queries

**Structure**:
```
repositories/
├── base.repository.ts       # Abstract base class
├── user.repository.ts       # Concrete implementation
├── lead.repository.ts
└── index.ts                 # Exports
```

### Service Layer Pattern

**When to use**:
- Business logic coordination
- Multiple repository operations
- Event publishing
- Transaction management

**Structure**:
```
services/
├── base.service.ts         # Abstract base class
├── user.service.ts         # Concrete implementation
├── lead.service.ts
└── index.ts                # Exports
```

### Event-Driven Pattern

**When to use**:
- Loose coupling between services
- Asynchronous workflows
- Audit trails
- Real-time updates

**Structure**:
```
events/
├── event-bus.ts           # Event bus implementation
├── user.events.ts         # Domain events
├── lead.events.ts
└── index.ts               # Exports
```

## Best Practices

### 1. Naming Conventions

```typescript
// Repositories: {Entity}Repository
class UserRepository extends BaseRepository<User> {}

// Services: {Entity}Service
class UserService extends BaseService<User> {}

// Controllers: {Entity}Controller
class UserController extends BaseController {}

// Events: {Entity}{Action}Event
class UserCreatedEvent implements IEvent {}
```

### 2. Dependency Injection

```typescript
// Constructor injection
class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private eventBus: EventBus,
    private logger: Logger
  ) {}
}
```

### 3. Error Handling

```typescript
// Always handle errors
try {
  const user = await this.userService.create(data);
  return { success: true, data: user };
} catch (error) {
  this.logger.error('Failed to create user', error);
  throw new ServiceError('Unable to create user', error);
}
```

### 4. Testing

```typescript
// Test behavior, not implementation
describe('UserService', () => {
  it('should send welcome email after creating user', async () => {
    const user = await service.create(userData);
    expect(emailService.sendWelcome).toHaveBeenCalledWith(user.email);
  });
});
```

## Common Pitfalls

### ❌ Don't

```typescript
// Don't put business logic in controllers
app.post('/users', async (req, res) => {
  const user = await db.users.create(req.body);
  await sendEmail(user.email);
  await updateAnalytics(user);
  res.json(user);
});

// Don't use repositories directly in controllers
class UserController {
  async create(req, res) {
    const user = await userRepository.create(req.body);
    res.json(user);
  }
}

// Don't ignore errors
const user = await service.create(data); // No try-catch
```

### ✅ Do

```typescript
// Use service layer
app.post('/users', async (req, res) => {
  const user = await userService.create(req.body);
  res.json(user);
});

// Services coordinate operations
class UserService {
  async create(data: CreateUserDto) {
    const user = await this.repository.create(data);
    await this.emailService.sendWelcome(user.email);
    await this.eventBus.publish(new UserCreatedEvent(user));
    return user;
  }
}

// Handle errors properly
try {
  const user = await service.create(data);
  res.json(user);
} catch (error) {
  next(error);
}
```

## Template Customization

### Adding Custom Methods

```typescript
// Extend base repository
class UserRepository extends BaseRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({ where: { email } });
  }

  async findActive(): Promise<User[]> {
    return this.model.findMany({ where: { active: true } });
  }
}
```

### Adding Validation

```typescript
// Override validation in service
class UserService extends BaseService<User> {
  protected async validateCreate(data: Partial<User>): Promise<void> {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email');
    }

    const existing = await this.repository.findByEmail(data.email);
    if (existing) {
      throw new ValidationError('Email already exists');
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

### Adding Events

```typescript
// Publish events in service hooks
class UserService extends BaseService<User> {
  protected async afterCreate(user: User): Promise<void> {
    await this.eventBus.publish(new UserCreatedEvent({
      userId: user.id,
      email: user.email,
      timestamp: new Date()
    }));
  }

  protected async afterUpdate(user: User): Promise<void> {
    await this.eventBus.publish(new UserUpdatedEvent({
      userId: user.id,
      changes: this.getChanges(user),
      timestamp: new Date()
    }));
  }
}
```

## Integration Examples

### Complete Service Setup

```typescript
// 1. Define entity
interface User {
  id: string;
  email: string;
  name: string;
  active: boolean;
}

// 2. Create repository
class UserRepository extends BaseRepository<User> {
  get model() {
    return this.prisma.user;
  }

  async findByEmail(email: string) {
    return this.model.findUnique({ where: { email } });
  }
}

// 3. Create service
class UserService extends BaseService<User> {
  protected get entityName() {
    return 'User';
  }

  protected async validateCreate(data: Partial<User>) {
    // Validation logic
  }

  protected async afterCreate(user: User) {
    await this.eventBus.publish(new UserCreatedEvent(user));
  }
}

// 4. Create controller
class UserController extends BaseController {
  constructor(private userService: UserService) {
    super();
  }

  async create(req: Request, res: Response) {
    const user = await this.userService.create(req.body);
    res.status(201).json(user);
  }
}

// 5. Register routes
app.post('/api/users', (req, res) => userController.create(req, res));
```

## Testing Templates

See `service.test.template.ts` for complete testing examples.

## Support

- Documentation: `docs/development/DEVELOPMENT-PATTERNS-IMPL.md`
- Examples: `services/*/src/`
- Issues: Create ticket with label `template-issue`

## Contributing

To add new templates:

1. Create template file with `.template.ts` extension
2. Use `{{placeholders}}` for dynamic content
3. Add documentation to this README
4. Create corresponding VS Code snippet
5. Add tests demonstrating usage

---

**Last Updated**: 2026-01-10
