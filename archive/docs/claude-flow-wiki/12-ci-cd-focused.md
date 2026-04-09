# CLAUDE.md Template: CI/CD Focused Development

**Development Approach**: Continuous Integration & Continuous Deployment
**Platform**: {{CI_CD_PLATFORM}} (GitHub Actions/GitLab CI/Jenkins)
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**CI/CD requires devops and development coordination:**

1. **DevOps Lead**: Pipeline architecture
2. **CI/CD Engineer**: Workflow configuration
3. **Development Team**: Test and build optimization
4. **Release Manager**: Deployment orchestration

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn CI/CD-focused agents
npx @claude-flow/cli@latest agent spawn -t coder --name devops-lead --capabilities "ci-cd,github-actions,deployment"
npx @claude-flow/cli@latest agent spawn -t coder --name dev-team --capabilities "testing,build,quality-gates"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **VCS**: {{VERSION_CONTROL}} (GitHub/GitLab/Bitbucket)
- **CI/CD Platform**: {{CI_CD_PLATFORM}}
- **Deployment Target**: {{DEPLOYMENT_TARGET}}
- **Release Strategy**: {{RELEASE_STRATEGY}} (continuous/weekly)

## 🔧 CI/CD Pipeline Architecture

### Pipeline Stages
```
Code Push
    ↓
1. Lint & Format Check
    ↓
2. Unit Tests
    ↓
3. Build Artifact
    ↓
4. Security Scan
    ↓
5. Integration Tests
    ↓
6. Deploy to Staging
    ↓
7. Smoke Tests
    ↓
8. Manual Approval (for Production)
    ↓
9. Deploy to Production
    ↓
10. Post-deployment Tests
    ↓
Monitoring & Alerts
```

### GitHub Actions Workflow Structure
```
.github/
├── workflows/
│   ├── ci.yaml              # Main CI pipeline
│   ├── cd.yaml              # Deployment pipeline
│   ├── security.yaml        # Security scans
│   ├── performance.yaml     # Performance tests
│   ├── release.yaml         # Release automation
│   └── scheduled/
│       ├── nightly-tests.yaml
│       └── dependency-scan.yaml
├── scripts/
│   ├── build.sh
│   ├── test.sh
│   ├── deploy.sh
│   └── rollback.sh
└── renovate.json            # Dependency updates
```

## 🧠 Memory Management

### Store Pipeline Configuration
```bash
npx @claude-flow/cli@latest memory store --key "ci-cd-pipeline-{{PROJECT_NAME}}" \
  --value "Pipeline stages, quality gates, deployment steps" \
  --namespace cicd --tags "pipeline,deployment"
```

### Store Deployment Strategy
```bash
npx @claude-flow/cli@latest memory store --key "deployment-strategy-{{PROJECT_NAME}}" \
  --value "Deployment approaches, rollback procedures, canary strategy" \
  --namespace cicd --tags "deployment,strategy"
```

## 🚀 CI/CD Workflow Implementation

### GitHub Actions CI Pipeline
```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

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
      - run: npm run test
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v4
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      - uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### CD Pipeline (Deploy to Production)
```yaml
name: CD Pipeline

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Staging
        run: |
          ./scripts/deploy.sh staging ${{ github.sha }}
      - name: Run Smoke Tests
        run: npm run test:smoke -- --env staging

  deploy-production:
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    environment:
      name: production
      url: https://{{PROJECT_NAME}}.com
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        run: |
          ./scripts/deploy.sh production ${{ github.sha }}
      - name: Verify Deployment
        run: |
          ./scripts/verify-deployment.sh production
      - name: Post-deployment Tests
        run: npm run test:e2e -- --env production
```

## 📊 Pipeline Metrics & Monitoring

### Build Metrics
```bash
# Track in memory
npx @claude-flow/cli@latest memory store --key "build-metrics-{{DATE}}" \
  --value "Build time: 5min, Tests: 120/120 passed, Coverage: 85%" \
  --namespace metrics
```

### Quality Gates
```
✓ Code Coverage: 80%+
✓ Linting: 0 errors, 0 warnings
✓ Security: 0 critical/high vulnerabilities
✓ Performance: LCP < 3s
✓ Build Time: < 10 minutes
✓ Test Pass Rate: 100%
```

### Deployment Strategy
```
Blue-Green Deployment:
- Blue environment: Current production
- Green environment: New version
- Switch traffic after smoke tests
- Quick rollback if issues detected

Canary Deployment:
- Deploy to 5% of traffic
- Monitor metrics for 1 hour
- Increase to 25%, 50%, 100% over 4 hours
- Auto-rollback if error rate > 1%
```

## 🔒 Security in CI/CD

### Branch Protection Rules
```yaml
Require status checks:
  - CI pipeline passing
  - Security scan passing
  - Code coverage 80%+
  - No direct pushes to main
  - Require 2 approvals for PRs
  - Require up-to-date branches
```

### Secrets Management
```bash
# GitHub Secrets
DEPLOYMENT_KEY
DATABASE_PASSWORD
API_KEYS
SIGNING_CERTIFICATES

# Use in workflow
- name: Deploy
  env:
    DB_PASSWORD: ${{ secrets.DATABASE_PASSWORD }}
  run: ./scripts/deploy.sh
```

### Dependency Scanning
```yaml
# Renovate configuration
{
  "extends": ["config:base"],
  "dependencyDashboard": true,
  "automerge": true,
  "automergeType": "pr",
  "automergeStrategy": "squash",
  "prConcurrentLimit": 2
}
```

## ✅ Testing in CI/CD

### Test Pyramid
```
        E2E Tests
       Integration Tests
      Unit Tests

- Unit: >70% coverage, <5s
- Integration: >50% coverage, <30s
- E2E: Critical paths, <2 min per scenario
```

### Test Thresholds (Quality Gates)
```
npm run test:ci
├── Unit Coverage: 80%+ ✓
├── Integration Pass Rate: 100% ✓
├── E2E Pass Rate: 100% ✓
├── Performance: <500ms p95 ✓
└── Security: 0 critical ✓
```

## 🎯 CI/CD Performance Targets

- Build time: <10 minutes
- Test execution: <5 minutes
- Deployment to staging: <15 minutes
- Total pipeline time: <30 minutes
- Deployment success rate: 99.5%

## 📋 CI/CD Setup Checklist

- [ ] Repository branch strategy defined
- [ ] CI/CD platform configured
- [ ] Build pipeline created
- [ ] Test automation implemented
- [ ] Security scanning enabled
- [ ] Code coverage gates set
- [ ] Artifact storage configured
- [ ] Deployment pipeline created
- [ ] Rollback strategy defined
- [ ] Monitoring and alerting set up
- [ ] Secrets management configured
- [ ] Access control configured
- [ ] Documentation completed
- [ ] Team trained on CI/CD

---

**Generated from**: claude-flow CLAUDE.md CI/CD Focused Template
