# CLAUDE.md Template: Microservices Architecture

**Architecture Pattern**: Large-Scale Distributed Systems
**Coordination**: Service mesh or event-driven
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**Microservices require careful coordination:**

1. **Architecture Lead**: Service design and boundaries
2. **Service Teams**: Parallel service development
3. **DevOps Team**: Deployment and networking
4. **QA Team**: Integration and E2E testing

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 15 --strategy specialized

# Spawn service-specific teams
npx @claude-flow/cli@latest agent spawn -t coder --name auth-service-team --capabilities "authentication,security,oauth"
npx @claude-flow/cli@latest agent spawn -t coder --name api-gateway-team --capabilities "routing,gateway,rate-limiting"
npx @claude-flow/cli@latest agent spawn -t coder --name data-service-team --capabilities "database,queries,caching"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Services**: {{NUMBER_OF_SERVICES}} services
- **Communication**: {{COMMUNICATION_PATTERN}} (REST/gRPC/message-driven)
- **Message Broker**: {{MESSAGE_BROKER}}
- **Service Registry**: {{SERVICE_REGISTRY}}

## 🔧 Development Patterns & Standards

### Microservices Structure
```
services/
├── api-gateway/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── auth-service/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── user-service/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── order-service/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── payment-service/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── shared/
│   ├── proto/         # Protocol buffers or shared types
│   └── common/        # Shared utilities
├── infra/
│   ├── docker-compose.yml
│   ├── kubernetes/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── configmap.yaml
│   └── helm/
├── docs/
│   ├── architecture.md
│   ├── service-contracts.md
│   └── deployment.md
└── README.md
```

## 🐝 Swarm Orchestration

### Phase 1: Architecture & Design
- **Duration**: 3-5 days
- **Agents**: Architecture Lead, Service Lead
- **Output**: Service boundaries, API contracts, deployment strategy

### Phase 2: Service Development
- **Duration**: 10-20 days
- **Agents**: Service teams (parallel)
- **Focus**: Individual service implementation, testing

### Phase 3: Service Integration
- **Duration**: 5-10 days
- **Agents**: Integration team, QA
- **Focus**: Service communication, distributed tracing, error handling

### Phase 4: Resilience & Observability
- **Duration**: 5-10 days
- **Agents**: DevOps, Infrastructure team
- **Focus**: Circuit breakers, retries, logging, monitoring

### Phase 5: Deployment & Scaling
- **Duration**: 5-10 days
- **Agents**: DevOps, Release Management
- **Focus**: Container orchestration, autoscaling, canary deployments

## 🧠 Memory Management

### Store Service Contracts
```bash
npx @claude-flow/cli@latest memory store --key "service-contracts-{{PROJECT_NAME}}" \
  --value "API contracts, event schemas, communication patterns" \
  --namespace architecture --tags "microservices,contracts"
```

### Store Deployment Topology
```bash
npx @claude-flow/cli@latest memory store --key "deployment-topology-{{PROJECT_NAME}}" \
  --value "Service placement, networking, scaling policies" \
  --namespace deployment --tags "microservices,kubernetes"
```

## 🚀 Deployment Architecture

### Docker Compose (Development)
```yaml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - AUTH_SERVICE_URL=http://auth-service:3001
      - USER_SERVICE_URL=http://user-service:3002
    depends_on:
      - auth-service
      - user-service

  auth-service:
    build: ./auth-service
    ports:
      - "3001:3001"
    environment:
      - DB_HOST=postgres
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  user-service:
    build: ./user-service
    ports:
      - "3002:3002"
    environment:
      - DB_HOST=postgres
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=postgres

  redis:
    image: redis:7-alpine
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: {{REGISTRY}}/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: db-host
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 3
```

## 📊 Monitoring & Service Mesh

### Distributed Tracing
```bash
# Using Jaeger
docker run -d --name jaeger \
  -p 6831:6831/udp \
  -p 16686:16686 \
  jaegertracing/all-in-one

# Instrument services with OpenTelemetry
import { NodeTracerProvider } from '@opentelemetry/node';
const provider = new NodeTracerProvider();
provider.register();
```

### Metrics Collection
```bash
# Prometheus scraping
scrape_configs:
  - job_name: 'auth-service'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'user-service'
    static_configs:
      - targets: ['localhost:9091']
```

### Health Checks
```
GET /health         # Service alive
GET /ready          # Ready to receive traffic
GET /metrics        # Prometheus metrics
GET /logs           # Recent logs
```

## 🔒 Security & Compliance

### Service-to-Service Communication
- mTLS certificate validation
- Service mesh policies (Istio/Linkerd)
- API key/token validation
- Rate limiting per service

### API Gateway Security
- Request validation
- Input sanitization
- DDoS protection
- CORS configuration

### Data Protection
- Encryption in transit (mTLS)
- Encryption at rest
- PII data handling
- Audit logging

## ✅ Testing Strategy

### Unit Tests (Per Service)
```
tests/
├── unit/           # Service logic tests
├── integration/    # Service dependencies
└── contract/       # Contract testing
```

### Service Integration Tests
```bash
# Test service-to-service communication
npm run test:integration

# Contract tests
npm run test:contracts
```

### End-to-End Tests
```bash
# Full system testing with all services running
npm run test:e2e
```

## 🎯 Performance Targets

- P99 service latency: <500ms
- Service availability: 99.95%
- Deployment time: <10 minutes
- Rollback time: <2 minutes

## 📋 Development Checklist

- [ ] Service boundaries defined
- [ ] API contracts documented
- [ ] Service templates created
- [ ] Inter-service communication configured
- [ ] Database per service strategy implemented
- [ ] Service discovery configured
- [ ] API Gateway implemented
- [ ] Authentication/authorization configured
- [ ] Logging and tracing configured
- [ ] Health checks implemented
- [ ] Circuit breakers and retries configured
- [ ] Deployment pipeline created
- [ ] Monitoring and alerting set up
- [ ] Documentation completed

---

**Generated from**: claude-flow CLAUDE.md Microservices Architecture Template
