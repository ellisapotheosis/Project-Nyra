# CLAUDE.md Template: Domain-Driven Design (DDD)

**Development Approach**: Domain-Driven Design with Bounded Contexts
**Architecture**: {{ARCHITECTURE}} (typically Microservices or Modular Monolith)
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**DDD requires deep domain expertise:**

1. **Domain Expert**: Business logic understanding
2. **Architect**: Bounded context design
3. **Development Teams**: Domain-specific implementation
4. **Integration Team**: Context boundaries

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 10 --strategy specialized

# Spawn domain-focused agents
npx @claude-flow/cli@latest agent spawn -t system-architect --name domain-architect --capabilities "ddd,bounded-contexts"
npx @claude-flow/cli@latest agent spawn -t coder --name order-domain --capabilities "order-context,domain-logic"
npx @claude-flow/cli@latest agent spawn -t coder --name user-domain --capabilities "user-context,identity"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Core Domains**: {{CORE_DOMAINS}}
- **Supporting Domains**: {{SUPPORTING_DOMAINS}}
- **Generic Domains**: {{GENERIC_DOMAINS}}
- **Language**: {{UBIQUITOUS_LANGUAGE}}

## 🔧 DDD Structure & Concepts

### Project Organization by Bounded Contexts
```
project/
├── docs/
│   ├── domain/
│   │   ├── ubiquitous-language.md
│   │   ├── event-storming-notes.md
│   │   ├── core-domain-map.md
│   │   └── bounded-contexts.md
│   ├── architectures/
│   └── integration-patterns.md
├── src/
│   ├── order-context/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── Order.ts
│   │   │   │   └── OrderItem.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── Money.ts
│   │   │   │   ├── OrderStatus.ts
│   │   │   │   └── OrderId.ts
│   │   │   ├── aggregates/
│   │   │   │   └── OrderAggregate.ts
│   │   │   ├── repositories/
│   │   │   │   └── OrderRepository.ts
│   │   │   ├── domain-events/
│   │   │   │   ├── OrderCreated.ts
│   │   │   │   ├── OrderShipped.ts
│   │   │   │   └── PaymentProcessed.ts
│   │   │   ├── specifications/
│   │   │   │   └── ConfirmedOrderSpecification.ts
│   │   │   └── services/
│   │   │       └── OrderService.ts
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   ├── CreateOrderCommand.ts
│   │   │   │   └── ShipOrderCommand.ts
│   │   │   ├── queries/
│   │   │   │   ├── GetOrderQuery.ts
│   │   │   │   └── ListOrdersQuery.ts
│   │   │   ├── dto/
│   │   │   └── services/
│   │   │       └── OrderApplicationService.ts
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   │   └── OrderRepositoryImpl.ts
│   │   │   ├── persistence/
│   │   │   └── event-publishers/
│   │   └── interfaces/
│   │       ├── api/
│   │       │   └── OrderController.ts
│   │       └── events/
│   │           └── OrderEventHandler.ts
│   │
│   ├── user-context/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interfaces/
│   │
│   ├── shared/
│   │   ├── domain/
│   │   │   ├── AggregateRoot.ts
│   │   │   ├── ValueObject.ts
│   │   │   ├── Entity.ts
│   │   │   ├── DomainEvent.ts
│   │   │   └── Repository.ts
│   │   ├── application/
│   │   │   ├── Command.ts
│   │   │   ├── Query.ts
│   │   │   └── CommandBus.ts
│   │   └── infrastructure/
│   │       ├── EventBus.ts
│   │       └── UnitOfWork.ts
│   │
│   └── integration/
│       ├── external-services/
│       └── anti-corruption-layer/
│
├── tests/
│   ├── unit/
│   │   ├── order-context/
│   │   └── user-context/
│   ├── integration/
│   └── acceptance/
└── package.json
```

## 🐝 DDD Swarm Orchestration

### Phase 1: Domain Analysis & Modeling
- **Duration**: 3-5 days
- **Agents**: Domain Expert, Architect
- **Output**: Ubiquitous Language, Event Storming results, Bounded Context map

### Phase 2: Architecture & Bounded Contexts
- **Duration**: 2-3 days
- **Agents**: Architect
- **Output**: Context boundaries, integration patterns

### Phase 3: Domain Implementation
- **Duration**: 10-20 days
- **Agents**: Domain teams (parallel)
- **Focus**: Aggregates, entities, domain events

### Phase 4: Integration
- **Duration**: 5-10 days
- **Agents**: Integration team, Domain teams
- **Focus**: Context communication, anti-corruption layers

### Phase 5: Application Services & API
- **Duration**: 5-10 days
- **Agents**: All teams
- **Focus**: Use cases, external interfaces

## 🧠 Memory Management

### Store Ubiquitous Language
```bash
npx @claude-flow/cli@latest memory store --key "ubiquitous-language-{{PROJECT_NAME}}" \
  --value "Key business terms, definitions, relationships" \
  --namespace ddd --tags "domain,language"
```

### Store Bounded Context Map
```bash
npx @claude-flow/cli@latest memory store --key "bounded-context-map-{{PROJECT_NAME}}" \
  --value "Contexts, responsibilities, integration points" \
  --namespace ddd --tags "architecture,contexts"
```

## 🚀 Core DDD Patterns

### Aggregate Pattern
```typescript
// Order Aggregate Root
export class Order extends AggregateRoot {
  private orderId: OrderId;
  private customerId: CustomerId;
  private items: OrderItem[] = [];
  private status: OrderStatus = OrderStatus.Pending;
  private total: Money;

  static create(
    orderId: OrderId,
    customerId: CustomerId,
    items: OrderItem[]
  ): Order {
    const order = new Order();
    order.orderId = orderId;
    order.customerId = customerId;
    order.items = items;
    order.total = this.calculateTotal(items);

    order.addDomainEvent(new OrderCreated(orderId, customerId));
    return order;
  }

  ship(shipmentId: ShipmentId): void {
    if (this.status !== OrderStatus.Confirmed) {
      throw new Error('Cannot ship unconfirmed order');
    }
    this.status = OrderStatus.Shipped;
    this.addDomainEvent(new OrderShipped(this.orderId, shipmentId));
  }

  private static calculateTotal(items: OrderItem[]): Money {
    return items.reduce((sum, item) => sum.add(item.total), Money.zero());
  }
}
```

### Value Object Pattern
```typescript
// OrderId Value Object
export class OrderId extends ValueObject {
  readonly value: string;

  constructor(value: string) {
    super();
    if (!value || value.length === 0) {
      throw new Error('OrderId cannot be empty');
    }
    this.value = value;
  }

  equals(other: OrderId): boolean {
    return this.value === other.value;
  }

  static generate(): OrderId {
    return new OrderId(generateUUID());
  }
}

// Money Value Object
export class Money extends ValueObject {
  readonly amount: number;
  readonly currency: string;

  constructor(amount: number, currency: string = 'USD') {
    super();
    this.amount = amount;
    this.currency = currency;
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount, this.currency);
  }

  static zero(): Money {
    return new Money(0);
  }
}
```

### Domain Event Pattern
```typescript
// Domain Event
export class OrderCreated extends DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId
  ) {
    super();
  }
}

// Domain Event Handler
export class OrderCreatedHandler implements EventHandler {
  async handle(event: OrderCreated): Promise<void> {
    // Create invoice for order
    const invoice = Invoice.createFor(event.orderId, event.customerId);
    await this.invoiceRepository.save(invoice);

    // Send confirmation email
    await this.emailService.sendOrderConfirmation(event.customerId);
  }
}
```

### Repository Pattern
```typescript
export interface OrderRepository extends Repository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByCustomerId(customerId: CustomerId): Promise<Order[]>;
}

// Implementation
export class OrderRepositoryImpl implements OrderRepository {
  async save(order: Order): Promise<void> {
    const data = order.toPersistence();
    await this.db.orders.upsert(data);
    // Publish domain events
    await this.eventBus.publishAll(order.domainEvents);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const data = await this.db.orders.findOne({ id: id.value });
    return data ? Order.fromPersistence(data) : null;
  }
}
```

## ✅ Bounded Context Communication

### Synchronous (Anticorruption Layer)
```typescript
// Anticorruption Layer for external service
export class PaymentServiceAnticorruptionLayer {
  async processPayment(order: Order): Promise<PaymentResult> {
    // Translate domain model to external API
    const externalRequest = this.translateToExternal(order);
    const externalResponse = await this.paymentServiceClient.process(externalRequest);
    // Translate response back to domain model
    return this.translateFromExternal(externalResponse);
  }
}
```

### Asynchronous (Event-Driven)
```typescript
// Publishing events across contexts
export class OrderService {
  async createOrder(command: CreateOrderCommand): Promise<Order> {
    const order = Order.create(...);
    await this.orderRepository.save(order);

    // Events published to message bus for other contexts
    // UserContext listens to OrderCreated events
    // NotificationContext listens to OrderShipped events
  }
}
```

## 🎯 DDD Benefits & Metrics

- **Domain Clarity**: Everyone speaks ubiquitous language
- **Modularity**: Clear bounded contexts
- **Testability**: Isolated domain logic
- **Evolvability**: Easy to evolve individual domains

## 📋 DDD Checklist

- [ ] Ubiquitous language defined
- [ ] Event storming completed
- [ ] Bounded contexts identified
- [ ] Aggregate roots designed
- [ ] Value objects defined
- [ ] Domain services identified
- [ ] Repository interfaces created
- [ ] Domain events planned
- [ ] Anti-corruption layers designed
- [ ] Integration patterns defined
- [ ] Application services structured
- [ ] Tests cover domain logic
- [ ] Documentation completed

---

**Generated from**: claude-flow CLAUDE.md Domain-Driven Design Template
