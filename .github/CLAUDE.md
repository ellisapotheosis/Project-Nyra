# GitHub Actions CI/CD Configuration - Claude Flow

**Stack**: React, TypeScript, Node.js, PostgreSQL
**Methodology**: Agile with TDD (Test-Driven Development)
**Deployment**: Containerized (Docker)

---

## 1. CI/CD Overview

This project uses GitHub Actions to automate testing, building, and deployment workflows following Test-Driven Development (TDD) principles.

### Core Principles

- Tests First: All workflows run tests before building or deploying
- Containerized: Every deployment uses Docker images for consistency
- Automated Gating: PRs cannot merge without passing all checks
- Progressive Deployment: dev → staging → production with appropriate approvals

---

## 2. Workflow Patterns

### 2.1 Test Workflow

Runs on every commit and PR. TDD-first approach - tests execute before any build steps.

Test workflow includes:
- PostgreSQL service setup with health checks
- Unit tests with coverage reporting
- Integration tests against real database
- E2E tests with Playwright
- Coverage upload to Codecov

### 2.2 Build Workflow

Builds Docker image only after tests pass. Creates and pushes to registry.

Build workflow includes:
- Docker buildx setup
- GHCR registry login
- Metadata extraction (tags, labels)
- Multi-stage build with layer caching

### 2.3 Deploy Dev Workflow

Auto-deploys to development when main branch is updated.

Deploy workflow includes:
- Docker image pull from registry
- Docker-compose deployment
- Health check verification

### 2.4 Deploy Staging Workflow

Manual trigger with approval for staging environment.

Staging workflow includes:
- Manual workflow dispatch
- Version parameter input
- Docker-compose deployment
- Smoke test execution

### 2.5 Deploy Production Workflow

Triggered by release tags. Includes rollback capability.

Production workflow includes:
- Release tag detection
- Production deployment
- Smoke tests
- Rollback tag creation on failure

### 2.6 PR Validation Workflow

Linting, type checking, and quality gates for pull requests.

PR validation includes:
- ESLint checks
- TypeScript type checking
- Test coverage verification
- PR comment with coverage summary

---

## 3. Testing Strategy

### 3.1 Unit Tests (Jest)

File Pattern: src/**/*.test.ts and src/**/*.spec.ts
Framework: Jest + TypeScript
Coverage Target: 80%+

npm run test:unit
npm run test:unit -- --coverage
npm run test:unit -- --watch

### 3.2 Integration Tests

File Pattern: tests/integration/**/*.test.ts
Framework: Jest + Supertest (API testing)
Database: PostgreSQL (via Docker service)

npm run test:integration
npm run test:integration:setup

### 3.3 E2E Tests (Playwright)

File Pattern: tests/e2e/**/*.spec.ts
Framework: Playwright
Scope: Full user workflows

npm run test:e2e
npm run test:e2e -- auth.spec.ts
npx playwright test --debug

### 3.4 Coverage Requirements

- Overall: 80%+ line coverage
- Critical Paths: 90%+ coverage (auth, payments, data)
- UI Components: 70%+ coverage (React Testing Library)
- API Endpoints: 85%+ coverage

npm run test:coverage-check
npm run test:coverage-report

---

## 4. Container Builds

### 4.1 Dockerfile Best Practices

Multi-Stage Build approach:
- Stage 1: Dependencies & Build
- Stage 2: Runtime (optimized)

Features:
- Alpine Linux base image
- Non-root user execution
- Health checks
- Multi-stage separation

### 4.2 Layer Caching Strategy

Order matters for cache efficiency:
- Cold layers first: System dependencies (rarely change)
- Warm layers middle: Project dependencies
- Hot layers last: Application code (changes frequently)

### 4.3 Image Optimization

Target Size: <250MB

Techniques:
- Alpine Linux (slim base image)
- Multi-stage builds (no build tools in runtime)
- .dockerignore for unnecessary files

### 4.4 Environment Configuration

Development: NODE_ENV=development, Full npm dependencies, Watch mode enabled
Staging/Production: NODE_ENV=production, Production dependencies only, Optimized build

---

## 5. Deployment Targets

### 5.1 Development Environment

Auto-Deploy: Yes (every push to main)
Approval Required: No
Database: PostgreSQL (shared dev instance)
Updates: Immediate
Rollback: Automatic (previous stable image)

### 5.2 Staging Environment

Auto-Deploy: No (manual trigger)
Approval Required: Yes (code review team)
Database: PostgreSQL (isolated staging DB)
Updates: Controlled releases
Duration: Minimum 24 hours before production

### 5.3 Production Environment

Auto-Deploy: No (release tags only)
Approval Required: Yes (release manager + team lead)
Database: PostgreSQL (production DB with backups)
Updates: Scheduled maintenance windows

Safety Measures:
- Blue-green deployment
- Automatic health checks (5 min)
- Rollback within 2 minutes if unhealthy
- Database backups before each deploy

---

## 6. Available CI/CD Agents

### 6.1 CICD Engineer Agent

Purpose: Orchestrates workflows, manages deployments
Capabilities:
- Write/update workflow YAML files
- Manage secrets and environment variables
- Troubleshoot failed deployments
- Optimize build performance

### 6.2 Tester Agent

Purpose: Test strategy design, coverage analysis
Capabilities:
- Design test suites (unit/integration/E2E)
- Analyze coverage gaps
- Write comprehensive tests
- Fix flaky tests

### 6.3 Reviewer Agent

Purpose: Code quality and deployment validation
Capabilities:
- Review CI/CD configurations
- Validate security practices
- Check test coverage compliance
- Audit deployment procedures

### 6.4 Deployment Manager Agent

Purpose: Manage deployment workflows and rollbacks
Capabilities:
- Coordinate multi-environment deployments
- Handle rollback procedures
- Monitor deployment health
- Manage blue-green deployments

---

## 7. Integration with Root

### 7.1 Mesh Topology Inheritance

This CI/CD configuration inherits the root project mesh topology for agent coordination.

### 7.2 Claude-Flow CLI Integration

Pre-deployment checks and post-deployment recording via CLI.

### 7.3 Memory Integration

Store and search CI/CD patterns with AgentDB HNSW indexing.

### 7.4 Background Worker Integration

Trigger optimization, audits, and coverage analysis after major changes.

### 7.5 Monitoring and Metrics

Track deployment metrics and performance benchmarking.

---

## 8. Quick Reference

### Common Commands

npm run test:all
docker build -t my-app:latest .
docker-compose -f infra/docker/docker-compose.dev.yml up
gh run list --workflow=test.yml
gh run view <run-id> --log
gh workflow run deploy-staging.yml -f version=main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

### Secrets Configuration

gh secret set DEV_DATABASE_URL --body "postgres://user:pass@host/db"
gh secret set STAGING_DATABASE_URL --body "postgres://user:pass@host/db"
gh secret set PROD_DATABASE_URL --body "postgres://user:pass@host/db"
gh secret set GHCR_TOKEN --body "github_pat_..."
gh secret set SENTRY_DSN --body "https://..."

---

## 9. Troubleshooting

### Test Failures

Issue: Tests pass locally but fail in CI
Solution: Check database connection, verify environment variables, run with same Node version

### Deployment Failures

Issue: Docker build fails in CI
Solution: Check Docker layer caching, verify required files, review GitHub Actions logs

### Slow Tests

Issue: Test suite takes >10 minutes
Solution: Split tests across parallel jobs, use database transactions, cache dependencies

---

## 10. Resources

- GitHub Actions Documentation
- Jest Testing Framework
- Playwright E2E Testing
- Docker Best Practices
- Claude Flow CI/CD Integration

---

Last Updated: 2026-01-22
Maintained By: CI/CD Engineering Team
Version: 1.0.0
