# CLAUDE.md Template: Monolithic Architecture

**Architecture Pattern**: Traditional Layered Application
**Design Pattern**: MVC/Layered Architecture
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**Monolithic development benefits from focused teams:**

1. **Backend Lead**: Core business logic
2. **Frontend Lead**: UI and user experience
3. **Database Lead**: Schema and queries
4. **DevOps Lead**: Deployment and infrastructure

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn monolith-focused agents
npx @claude-flow/cli@latest agent spawn -t coder --name backend-lead --capabilities "mvc,controllers,services"
npx @claude-flow/cli@latest agent spawn -t coder --name frontend-lead --capabilities "ui,components,templates"
npx @claude-flow/cli@latest agent spawn -t coder --name database-lead --capabilities "schema,queries,migrations"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Primary Language**: {{LANGUAGE}}
- **Web Framework**: {{FRAMEWORK}}
- **Database**: {{DATABASE}}
- **Frontend Framework**: {{FRONTEND_FRAMEWORK}}

## 🔧 Development Patterns & Standards

### Monolithic MVC Structure
```
{{PROJECT_NAME}}/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── userController.ts
│   │   ├── productController.ts
│   │   └── orderController.ts
│   ├── services/          # Business logic
│   │   ├── userService.ts
│   │   ├── productService.ts
│   │   └── orderService.ts
│   ├── models/            # Data models
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   └── Order.ts
│   ├── routes/            # Route definitions
│   │   ├── users.ts
│   │   ├── products.ts
│   │   └── orders.ts
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── views/             # Templates (if applicable)
│   ├── public/            # Static assets
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   ├── config/            # Configuration
│   ├── database/
│   │   ├── connection.ts
│   │   └── migrations/
│   └── app.ts             # Main entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── package.json
└── README.md
```

## 🐝 Swarm Orchestration

### Phase 1: Architecture & Setup
- **Duration**: 2-3 days
- **Agents**: Backend Lead, Frontend Lead
- **Output**: Project structure, database schema

### Phase 2: Core Features Development
- **Duration**: 10-15 days
- **Agents**: Backend Lead, Frontend Lead (parallel)
- **Focus**: Models, controllers, services, views

### Phase 3: Feature Expansion
- **Duration**: 10-15 days
- **Agents**: All teams
- **Focus**: Additional features, business logic refinement

### Phase 4: Testing & Optimization
- **Duration**: 5-10 days
- **Agents**: QA team, Performance team
- **Focus**: Test coverage, optimization, refactoring

### Phase 5: Deployment & Monitoring
- **Duration**: 3-5 days
- **Agents**: DevOps team
- **Focus**: Production setup, monitoring, logging

## 🧠 Memory Management

### Store Architecture Patterns
```bash
npx @claude-flow/cli@latest memory store --key "monolith-patterns-{{PROJECT_NAME}}" \
  --value "Controller patterns, service layer design, middleware strategy" \
  --namespace architecture --tags "monolith,patterns"
```

### Store Database Schema
```bash
npx @claude-flow/cli@latest memory store --key "db-schema-{{PROJECT_NAME}}" \
  --value "Tables, relationships, indexes, migration history" \
  --namespace database --tags "schema"
```

## 🚀 Deployment & CI/CD

### Development Environment Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Database migration
npm run db:migrate

# Seed initial data (if needed)
npm run db:seed

# Start development server
npm run dev
```

### Production Build & Deployment
```yaml
name: Monolith CI/CD

on:
  push:
    branches: [main]
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

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e

  build:
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
      - name: Build Docker image
        run: docker build -t {{REGISTRY}}/{{PROJECT_NAME}}:latest .
      - name: Deploy to {{DEPLOYMENT_PLATFORM}}
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
        run: npm run deploy
```

### Database Migrations
```bash
# Create migration
npm run db:create-migration -- --name add_user_email_index

# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback

# Status check
npm run db:status
```

## 📊 Monitoring & Analytics

### Application Metrics
- Request count and latency
- Error rates (4xx, 5xx)
- Database query performance
- Memory and CPU usage

### Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: checkDatabaseConnection(),
    cache: checkCacheConnection(),
  });
});
```

### Logging Strategy
```bash
# Structured logging with Winston
[timestamp] [level] [service] [request_id] message

# Example
[2025-01-22T10:30:45.123Z] [INFO] [auth] [req-123] User login successful
```

## 🔒 Security & Compliance

### Authentication
- Session management or JWT tokens
- Password hashing (bcrypt)
- Rate limiting on login attempts
- Account lockout after failed attempts

### Authorization
- Role-based access control (RBAC)
- Middleware for permission checks
- Audit logging for privileged operations

### Input Validation
- Request body validation
- Parameter sanitization
- SQL injection prevention
- XSS prevention in templates

## ✅ Testing Strategy

### Unit Tests
```
tests/unit/
├── controllers/
├── services/
├── models/
└── utils/
```

### Integration Tests
```
tests/integration/
├── api/
├── database/
└── middleware/
```

### End-to-End Tests
```
tests/e2e/
├── user-flows/
├── authentication/
└── critical-paths/
```

### Coverage Targets
- Unit: 75%+
- Integration: 60%+
- E2E: Critical paths 100%

## 🎯 Performance Targets

- Page load time: <3s
- API response time: <500ms (p95)
- Database query time: <100ms
- Memory usage: <500MB
- Uptime: 99.5%

## 📋 Development Checklist

- [ ] Project structure initialized
- [ ] Database schema created
- [ ] Authentication system implemented
- [ ] Core models and controllers created
- [ ] Service layer implemented
- [ ] Frontend templates created
- [ ] Static assets configured
- [ ] Middleware pipeline configured
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Test framework set up
- [ ] Build process configured
- [ ] Deployment pipeline configured
- [ ] Monitoring and alerting set up

---

**Generated from**: claude-flow CLAUDE.md Monolithic Architecture Template
