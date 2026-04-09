# CLAUDE.md Template: Event-Driven Architecture

**Architecture Pattern**: Event-Driven Systems
**Communication**: Asynchronous Events
**Message Broker**: {{MESSAGE_BROKER}} (RabbitMQ/Kafka/AWS SNS/SQS)
**Scalability**: Highly Decoupled

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 10 --strategy specialized
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Message Broker**: {{MESSAGE_BROKER}}
- **Event Volume**: {{EVENTS_PER_SECOND}} events/sec
- **Latency Tolerance**: {{LATENCY_TOLERANCE}}ms

## 🔧 Event-Driven Architecture

### Event Flow
```
Event Producers
    ↓
Message Broker (Kafka/RabbitMQ)
    ↓
Event Consumers
    ↓
Actions/State Changes
```

### Event Types
```
Domain Events (Business):
  - OrderCreated
  - PaymentProcessed
  - UserRegistered

System Events (Technical):
  - DatabaseUpdated
  - CacheInvalidated
  - ServiceDeployed
```

## 🚀 Implementation

### Kafka Producer
```javascript
// Publish event
async function publishOrderCreated(order) {
  const event = {
    eventType: 'OrderCreated',
    aggregateId: order.id,
    timestamp: Date.now(),
    data: order,
  };

  await kafka.send({
    topic: 'order-events',
    messages: [{
      key: order.id,
      value: JSON.stringify(event),
    }],
  });
}
```

### Kafka Consumer
```javascript
// Subscribe to events
const consumer = kafka.consumer({ groupId: 'order-service' });
await consumer.subscribe({ topic: 'order-events' });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value);

    switch (event.eventType) {
      case 'OrderCreated':
        await handleOrderCreated(event.data);
        break;
      case 'PaymentProcessed':
        await handlePaymentProcessed(event.data);
        break;
    }
  },
});
```

## 📊 Event Metrics

- Event throughput: {{THROUGHPUT}} events/sec
- Message latency: {{LATENCY}}ms (p99)
- Consumer lag: {{LAG}}ms
- Delivery guarantee: {{GUARANTEE}} (at-most-once/at-least-once/exactly-once)

## 📋 Event-Driven Checklist

- [ ] Message broker selected
- [ ] Event schema defined
- [ ] Producers implemented
- [ ] Consumers implemented
- [ ] Event ordering strategy
- [ ] Dead letter queue configured
- [ ] Monitoring set up
- [ ] Recovery procedures

---

**Generated from**: claude-flow CLAUDE.md Event-Driven Architecture Template
