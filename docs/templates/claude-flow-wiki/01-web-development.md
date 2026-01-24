# CLAUDE.md Template: Web Development

**Project Type**: Full-Stack Web Applications
**Framework**: {{FRAMEWORK}} (React/Vue/Angular)
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**When starting work on complex web tasks, Claude Code MUST automatically:**

1. **Initialize the swarm** using CLI tools via Bash
2. **Spawn concurrent agents** using Claude Code's Task tool
3. **Coordinate via hooks** and memory

### 🚨 CRITICAL: CLI + Task Tool in SAME Message

**When user says "spawn swarm" or requests complex work, Claude Code MUST in ONE message:**
1. Call CLI tools via Bash to initialize coordination
2. **IMMEDIATELY** call Task tool to spawn REAL working agents
3. Both CLI and Task calls must be in the SAME response

### Frontend/Backend Coordination

For full-stack development, initialize agents for:
- **Frontend Agent**: React/Vue/Angular component development
- **Backend Agent**: API endpoint and database design
- **DevOps Agent**: Build configuration and deployment
- **QA Agent**: Integration testing and E2E tests

```bash
# Initialize specialized swarm for web development
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn frontend specialist
npx @claude-flow/cli@latest agent spawn -t coder --name frontend-specialist --capabilities "react,vue,angular,ui-design"

# Spawn backend specialist
npx @claude-flow/cli@latest agent spawn -t coder --name backend-specialist --capabilities "nodejs,python,database,api"

# Spawn devops specialist
npx @claude-flow/cli@latest agent spawn -t coder --name devops-specialist --capabilities "docker,ci-cd,kubernetes"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Repository**: {{GIT_REPO_URL}}
- **Stack**: Frontend: {{FRONTEND_FRAMEWORK}}, Backend: {{BACKEND_FRAMEWORK}}
- **Database**: {{DATABASE_TYPE}}
- **Deployment**: {{DEPLOYMENT_PLATFORM}}

## 🔧 Development Patterns & Standards

### Component Architecture
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── features/       # Feature-specific components
│   └── layouts/        # Layout components
├── pages/              # Page components
├── services/           # API communication layer
├── hooks/              # Custom React/Vue hooks
├── utils/              # Utility functions
├── types/              # TypeScript types (if using TS)
├── styles/             # Global styles
└── constants/          # Application constants
```

### API Design Patterns
```
backend/
├── routes/             # API route handlers
├── controllers/        # Business logic
├── models/             # Data models
├── services/           # Business services
├── middleware/         # Express/framework middleware
├── utils/              # Utility functions
└── tests/              # API tests
```

## 🐝 Swarm Orchestration

### Phase 1: Design & Architecture
- **Agents**: Architect, Frontend Specialist, Backend Specialist
- **Duration**: 1-2 days
- **Output**: Architecture document, API spec, component hierarchy

### Phase 2: Frontend Development
- **Agents**: Frontend Specialist, Component Designer, Tester
- **Duration**: 5-10 days
- **Focus**: Component library, state management, responsive design

### Phase 3: Backend Development
- **Agents**: Backend Specialist, Database Engineer, Security Auditor
- **Duration**: 5-10 days
- **Focus**: API endpoints, database schema, authentication

### Phase 4: Integration & Testing
- **Agents**: QA Specialist, DevOps Engineer, Performance Engineer
- **Duration**: 3-5 days
- **Focus**: E2E tests, API integration, performance optimization

### Phase 5: Deployment
- **Agents**: DevOps Engineer, Release Manager
- **Duration**: 1-2 days
- **Focus**: CI/CD setup, monitoring, production readiness

## 🧠 Memory Management

### Store Architecture Decisions
```bash
npx @claude-flow/cli@latest memory store --key "web-architecture-{{PROJECT_NAME}}" \
  --value "Component hierarchy, API design patterns, state management approach" \
  --namespace architecture --tags "web,{{PROJECT_NAME}}"
```

### Store Component Patterns
```bash
npx @claude-flow/cli@latest memory store --key "component-patterns-{{FRONTEND_FRAMEWORK}}" \
  --value "Reusable component templates and patterns for {{FRONTEND_FRAMEWORK}}" \
  --namespace patterns --tags "frontend,components"
```

### Search for Similar Projects
```bash
npx @claude-flow/cli@latest memory search --query "{{FRAMEWORK}} full-stack development patterns"
```

## 🚀 Deployment & CI/CD

### GitHub Actions Workflow
```yaml
name: Web App CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
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
      - run: npm run build:backend
      - name: Deploy to {{DEPLOYMENT_PLATFORM}}
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
        run: npm run deploy
```

## 📊 Monitoring & Analytics

### Frontend Monitoring
- Web Vitals: LCP, FID, CLS
- Error tracking with Sentry
- Performance monitoring with DataDog
- User analytics with Mixpanel

### Backend Monitoring
- API response times and error rates
- Database query performance
- Server resource usage
- Log aggregation with ELK stack

### Health Checks
```bash
# Frontend build size
npm run analyze

# Backend performance
npm run benchmark:api

# E2E test results
npm run test:e2e:report
```

## 🔒 Security & Compliance

### OWASP Top 10 Mitigation
- Input validation on frontend and backend
- CSRF protection with token validation
- XSS prevention with content security policies
- SQL injection prevention with parameterized queries
- Authentication and authorization checks
- Sensitive data encryption in transit and at rest

### API Security
- Rate limiting and DDoS protection
- API key management
- JWT token expiration and refresh
- CORS configuration
- Request validation with schemas

### Frontend Security
- Dependency scanning with Dependabot
- Secrets scanning in code
- Content Security Policy headers
- HTTPS enforcement

## ✅ Testing Strategy

### Frontend Testing
```
tests/
├── unit/               # Component unit tests
├── integration/        # Component integration tests
├── e2e/               # End-to-end tests
└── visual/            # Visual regression tests
```

### Backend Testing
```
tests/
├── unit/              # Service unit tests
├── integration/       # API integration tests
├── fixtures/          # Test data and fixtures
└── performance/       # Performance and load tests
```

### Test Coverage Targets
- Frontend: 80%+ component coverage
- Backend: 85%+ API coverage
- E2E: Critical user journeys (100%)

## 🎯 Performance Targets

- Frontend: Lighthouse score 90+
- Backend: API response time <200ms (p95)
- Page load time: <3s on 4G
- Database queries: <100ms

## 📋 Development Checklist

- [ ] Project structure initialized
- [ ] Development environment configured
- [ ] Git repository and CI/CD set up
- [ ] Database schema designed
- [ ] Authentication system implemented
- [ ] API endpoints documented
- [ ] Component library established
- [ ] Testing framework configured
- [ ] Deployment pipeline configured
- [ ] Monitoring and alerting set up
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Documentation completed

---

**Generated from**: claude-flow CLAUDE.md Web Development Template
