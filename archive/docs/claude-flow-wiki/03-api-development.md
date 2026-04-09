# CLAUDE.md Template: API Development

**Project Type**: RESTful & GraphQL APIs
**Architecture**: {{ARCHITECTURE}} (Microservices/Monolithic)
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**API development requires specialized agents:**

1. **API Architect**: OpenAPI/GraphQL schema design
2. **Backend Engineer**: Endpoint implementation
3. **Database Engineer**: Schema and optimization
4. **Security Auditor**: Authentication and authorization
5. **DevOps Engineer**: Deployment and scaling

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn API-specialized agents
npx @claude-flow/cli@latest agent spawn -t coder --name api-architect --capabilities "openapi,graphql,api-design"
npx @claude-flow/cli@latest agent spawn -t coder --name backend-engineer --capabilities "node,python,java,database"
npx @claude-flow/cli@latest agent spawn -t coder --name security-auditor --capabilities "oauth,jwt,security-audit"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **API Type**: {{API_TYPE}} (REST/GraphQL/gRPC)
- **Primary Language**: {{LANGUAGE}}
- **Framework**: {{FRAMEWORK}}
- **Database**: {{DATABASE}}
- **Version**: {{API_VERSION}}

## 🔧 Development Patterns & Standards

### OpenAPI/REST Structure
```
api/
├── src/
│   ├── routes/
│   │   ├── users.ts
│   │   ├── products.ts
│   │   └── orders.ts
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   ├── types/
│   └── app.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   ├── openapi.yaml
│   └── api-guide.md
└── package.json
```

### GraphQL Structure
```
api/
├── src/
│   ├── schema/
│   │   ├── typeDefs.ts
│   │   ├── resolvers/
│   │   │   ├── users.ts
│   │   │   ├── products.ts
│   │   │   └── orders.ts
│   │   └── directives/
│   ├── middleware/
│   ├── services/
│   ├── models/
│   ├── utils/
│   └── server.ts
├── tests/
├── docs/
└── package.json
```

## 🐝 Swarm Orchestration

### Phase 1: API Design
- **Duration**: 2-3 days
- **Agents**: API Architect, Backend Lead
- **Output**: OpenAPI spec, data models, error handling strategy

### Phase 2: Core Endpoints
- **Duration**: 5-10 days
- **Agents**: Backend Engineers (parallel)
- **Focus**: CRUD operations, business logic, validation

### Phase 3: Advanced Features
- **Duration**: 5-10 days
- **Agents**: Backend Engineers, Database Engineer
- **Focus**: Filtering, pagination, sorting, search, relationships

### Phase 4: Security & Auth
- **Duration**: 3-5 days
- **Agents**: Security Auditor, Backend Engineers
- **Focus**: OAuth2, JWT, rate limiting, CORS

### Phase 5: Testing & Documentation
- **Duration**: 3-5 days
- **Agents**: QA Engineer, Technical Writer
- **Focus**: Test coverage, Swagger UI, client examples

## 🧠 Memory Management

### Store API Patterns
```bash
npx @claude-flow/cli@latest memory store --key "api-patterns-{{PROJECT_NAME}}" \
  --value "Authentication patterns, error handling, pagination strategy" \
  --namespace api --tags "api,patterns"
```

### Store Schema Decisions
```bash
npx @claude-flow/cli@latest memory store --key "schema-design-{{PROJECT_NAME}}" \
  --value "Database schema, relationships, indexes" \
  --namespace database --tags "schema,design"
```

## 🚀 Deployment & CI/CD

### API Testing Pipeline
```yaml
name: API CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:integration
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - name: Deploy to {{DEPLOYMENT_PLATFORM}}
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
        run: npm run deploy
```

## 📊 Monitoring & Analytics

### API Metrics
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Request volume
- Endpoint performance

### Logging Strategy
```bash
# Request/response logging
[timestamp] [level] [endpoint] [method] [status] [duration]ms

# Error logging with context
[timestamp] [ERROR] [endpoint] [error_code] [message] [stack_trace]

# Performance logging
[timestamp] [PERF] [endpoint] [query_duration]ms [db_queries]
```

### Health Checks
```bash
GET /health              # Overall service health
GET /health/db          # Database connectivity
GET /health/cache       # Cache connectivity
GET /health/external    # External service connectivity
```

## 🔒 Security & Compliance

### Authentication & Authorization
- OAuth2 / OIDC implementation
- JWT token management
- API key rotation
- Scope-based authorization

### Request Validation
- Input sanitization
- Rate limiting per endpoint
- Request size limits
- IP whitelist/blacklist

### Data Protection
- Encryption at rest
- TLS/SSL for transit
- PII data masking in logs
- Audit trails for sensitive operations

## ✅ Testing Strategy

### Test Coverage
```
tests/
├── unit/               # Service logic tests (80%+)
├── integration/        # API endpoint tests (70%+)
├── fixtures/           # Test data
└── performance/        # Load testing
```

### API Testing Tools
- Jest/Mocha: Unit tests
- Supertest/Postman: Integration tests
- K6/JMeter: Load testing
- OWASP ZAP: Security testing

## 🎯 Performance Targets

- P50 response time: <100ms
- P95 response time: <300ms
- P99 response time: <1000ms
- Error rate: <0.1%
- Availability: 99.9%

## 📋 Development Checklist

- [ ] API design and documentation complete
- [ ] Database schema created and migrated
- [ ] Authentication and authorization implemented
- [ ] Core endpoints implemented
- [ ] Input validation and error handling configured
- [ ] Rate limiting and throttling configured
- [ ] Logging and monitoring configured
- [ ] Test coverage 80%+
- [ ] API documentation (Swagger/GraphQL) complete
- [ ] Security audit completed
- [ ] Performance testing completed
- [ ] Deployment pipeline configured
- [ ] Monitoring and alerting set up

---

**Generated from**: claude-flow CLAUDE.md API Development Template
