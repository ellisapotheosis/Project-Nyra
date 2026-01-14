# CI/CD Pipeline Documentation

Complete documentation for the CI/CD infrastructure using GitHub Actions and Gitea Actions.

## Overview

This project uses a comprehensive CI/CD pipeline with:

- **Continuous Integration**: Automated testing, linting, and building
- **Continuous Deployment**: Automated deployments to staging and production
- **Security Scanning**: Automated vulnerability detection and compliance checks
- **Multi-Platform Support**: Builds for both amd64 and arm64 architectures
- **Blue-Green Deployments**: Zero-downtime production deployments

## Table of Contents

1. [Workflows](#workflows)
2. [Environment Setup](#environment-setup)
3. [Secrets Management](#secrets-management)
4. [Deployment Process](#deployment-process)
5. [Troubleshooting](#troubleshooting)
6. [Performance Optimization](#performance-optimization)

## Workflows

### GitHub Actions Workflows

#### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers**: Push to any branch, PRs to main/develop

**Jobs**:
- **Lint**: Code quality checks with ESLint
- **Type Check**: TypeScript type validation
- **Test**: Unit and integration tests (matrix: OS × Node versions)
- **Build**: Application build verification

**Matrix Configuration**:
```yaml
os: [ubuntu-latest, windows-latest]
node: ['18', '20']
```

**Status Badges**:
```markdown
![CI Status](https://github.com/{owner}/{repo}/workflows/Continuous%20Integration/badge.svg)
```

#### 2. Staging Deployment (`.github/workflows/cd-staging.yml`)

**Triggers**: Push to develop branch

**Jobs**:
1. **Build and Push**: Docker image creation and registry push
2. **Deploy Orchestrator**: Deploy to orchestrator-mini staging
3. **Smoke Tests**: Quick validation tests
4. **Health Checks**: Service health verification

**Environment**: `staging`
**URL**: https://staging.example.com

#### 3. Production Deployment (`.github/workflows/cd-production.yml`)

**Triggers**: Push to main branch, version tags

**Deployment Strategy**: Blue-Green

**Jobs**:
1. **Pre-Deployment Checks**: Verify staging and current production health
2. **Build and Push**: Production image creation
3. **Deploy Blue**: Deploy to blue environment
4. **Test Blue**: Run comprehensive tests
5. **Switch Traffic**: Update load balancer
6. **Deploy Workers**: Parallel worker node deployment
7. **Post-Deployment**: Health checks and verification
8. **Rollback**: Automatic rollback on failure

**Environment**: `production`
**URL**: https://production.example.com

#### 4. E2E Tests (`.github/workflows/test-e2e.yml`)

**Triggers**: Nightly schedule, manual dispatch, E2E file changes

**Test Types**:
- **E2E Tests**: Full user journey testing (Playwright)
- **Visual Regression**: Screenshot comparison tests
- **Accessibility**: WCAG compliance testing
- **Performance**: Lighthouse CI benchmarks

**Browser Matrix**:
- Chromium
- Firefox
- WebKit

**Test Sharding**: 4 parallel shards per browser

#### 5. Docker Build (`.github/workflows/docker-build.yml`)

**Triggers**: Push to main/develop, version tags

**Features**:
- Multi-architecture builds (amd64, arm64)
- Manifest merging for unified images
- Vulnerability scanning (Trivy, Grype)
- SBOM generation (Syft, CycloneDX)
- Image signing (Cosign)

**Registry**: GitHub Container Registry (ghcr.io)

#### 6. Security Scan (`.github/workflows/security-scan.yml`)

**Triggers**: Push, PRs, weekly schedule

**Scan Types**:
- **Dependency Scan**: npm audit, Snyk
- **SAST**: CodeQL, Semgrep, ESLint security rules
- **Secret Detection**: Gitleaks, TruffleHog
- **Container Scan**: Trivy, Grype, Dockle
- **IaC Scan**: Checkov, Terrascan
- **License Compliance**: License checker

### Gitea Actions Workflows

#### 1. Local CI (`.gitea/workflows/ci-local.yml`)

**Purpose**: Fast feedback loop for local development

**Jobs**:
- Quick lint check
- Type checking
- Unit tests (optimized for speed)
- Build verification

**Optimization**: Uses `--prefer-offline` and reduced parallelism

#### 2. GitHub Sync Monitor (`.gitea/workflows/sync-github.yml`)

**Purpose**: Monitor Gitea-GitHub synchronization

**Schedule**: Every 30 minutes

**Checks**:
- Commit synchronization
- GitHub Actions availability
- Workflow execution status

## Environment Setup

### Prerequisites

1. **Node.js**: 18.x or 20.x
2. **Docker**: Latest stable version
3. **Git**: 2.x or higher

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd <project>

# Install dependencies
npm ci

# Run tests
npm test

# Build project
npm run build
```

### Docker Setup

```bash
# Build image
docker build -t project:dev .

# Run container
docker run -p 3000:3000 project:dev

# Run with docker-compose
docker compose up -d
```

## Secrets Management

### Required Secrets

Configure these secrets in your repository settings:

#### GitHub Secrets

| Secret | Description | Required For |
|--------|-------------|--------------|
| `CODECOV_TOKEN` | Codecov upload token | CI workflow |
| `INFISICAL_TOKEN` | Infisical secrets manager | Staging/Production deployment |
| `STAGING_API_KEY` | Staging API key | Smoke tests |
| `PRODUCTION_API_KEY` | Production API key | E2E tests |
| `SNYK_TOKEN` | Snyk security scanning | Security workflow |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI integration | E2E workflow |
| `GITHUB_TOKEN` | Automatic (provided by GitHub) | All workflows |

#### Environment Secrets (via Infisical)

**Staging Environment**:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `API_KEYS`

**Production Environment**:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `API_KEYS`

### Setting Up Infisical

```bash
# Install Infisical CLI
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical

# Login
infisical login

# Export secrets for environment
infisical export --env=staging --format=dotenv > .env.staging
```

### Secret Rotation

1. Update secrets in Infisical dashboard
2. Secrets are automatically pulled during deployment
3. No workflow changes needed

## Deployment Process

### Staging Deployment

**Trigger**: Push to `develop` branch

**Process**:
1. Code is pushed to develop
2. CI workflow runs and passes
3. Docker image is built and pushed
4. Image is deployed to orchestrator-mini
5. Database migrations run
6. Smoke tests execute
7. Health checks verify deployment

**Manual Deployment**:
```bash
# Trigger via GitHub CLI
gh workflow run cd-staging.yml
```

### Production Deployment

**Trigger**: Push to `main` branch or version tag

**Blue-Green Process**:

1. **Pre-Checks**:
   - Verify staging deployment success
   - Check current production health
   - Verify database backup exists

2. **Blue Deployment**:
   - Deploy new version to blue environment
   - Run database migrations
   - Warm up application

3. **Testing**:
   - Run smoke tests against blue
   - Execute load tests
   - Verify metrics

4. **Traffic Switch**:
   - Update load balancer configuration
   - Gradually shift traffic to blue
   - Monitor error rates

5. **Worker Deployment**:
   - Deploy to all worker nodes in parallel
   - Health check each worker

6. **Verification**:
   - Comprehensive health checks
   - Data integrity verification
   - Performance monitoring

7. **Cleanup**:
   - Remove old green environment
   - Update deployment records

**Rollback Process**:
- Automatic on failure
- Reverts load balancer to green
- Stops blue containers
- Creates incident issue

**Manual Rollback**:
```bash
# Trigger rollback workflow
gh workflow run cd-production.yml -f rollback_version=v1.2.3
```

## Troubleshooting

### Common Issues

#### 1. CI Tests Failing

**Symptoms**: Tests pass locally but fail in CI

**Solutions**:
- Check environment variables
- Verify Node.js version matches
- Check for timing issues (increase timeouts)
- Review test logs in artifacts

```bash
# Download test artifacts
gh run download <run-id>
```

#### 2. Docker Build Failures

**Symptoms**: Docker build times out or fails

**Solutions**:
- Check Dockerfile syntax
- Verify base image availability
- Review build cache usage
- Increase timeout in workflow

```yaml
timeout-minutes: 60  # Increase timeout
```

#### 3. Deployment Hangs

**Symptoms**: Deployment stuck on health checks

**Solutions**:
- Check container logs
- Verify service dependencies (DB, Redis)
- Review health check endpoint
- Check resource limits

```bash
# Check container status
docker ps
docker logs <container-id>

# Check health
curl http://localhost:3000/health
```

#### 4. E2E Tests Flaky

**Symptoms**: Tests intermittently fail

**Solutions**:
- Add explicit waits
- Increase timeouts
- Use test retries
- Check for race conditions

```javascript
// Add retry logic
test.describe.configure({ retries: 2 });
```

#### 5. Secret Access Denied

**Symptoms**: Cannot access secrets in workflow

**Solutions**:
- Verify secret is configured
- Check environment protection rules
- Verify branch protection settings
- Review token permissions

### Debug Mode

Enable debug logging:

```bash
# Set repository secret
ACTIONS_RUNNER_DEBUG=true
ACTIONS_STEP_DEBUG=true
```

### Workflow Logs

Access logs:
```bash
# List recent runs
gh run list --workflow=ci.yml

# View specific run
gh run view <run-id> --log

# Download logs
gh run download <run-id>
```

## Performance Optimization

### Build Optimization

#### 1. Dependency Caching

**npm cache**:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

**Docker layer cache**:
```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

#### 2. Parallel Execution

**Matrix strategy**:
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: ['18', '20']
  fail-fast: false
```

**Job parallelization**:
- Independent jobs run in parallel
- Use `needs` to define dependencies
- Minimize sequential dependencies

#### 3. Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Test Optimization

#### 1. Test Sharding

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
```

#### 2. Selective Testing

Run only affected tests:
```bash
# Test changed files only
npm test -- --changedSince=origin/main
```

#### 3. Test Caching

Cache test results and snapshots

### Docker Optimization

#### 1. Multi-Stage Builds

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
COPY --from=builder /app/node_modules ./node_modules
```

#### 2. Layer Optimization

- Copy package.json before source code
- Combine RUN commands
- Use .dockerignore

#### 3. Image Size Reduction

- Use alpine base images
- Remove development dependencies
- Minimize layers

### Workflow Optimization

#### 1. Conditional Jobs

```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

#### 2. Timeout Configuration

```yaml
timeout-minutes: 15  # Prevent hanging jobs
```

#### 3. Artifact Retention

```yaml
retention-days: 7  # Reduce storage costs
```

## Monitoring and Metrics

### Key Metrics

- **Build Time**: Track CI/CD duration
- **Test Pass Rate**: Monitor test reliability
- **Deployment Frequency**: Measure velocity
- **Change Failure Rate**: Track deployment quality
- **Mean Time to Recovery**: Measure rollback speed

### Status Checks

Add status badges to README:

```markdown
[![CI](https://github.com/{owner}/{repo}/workflows/CI/badge.svg)](https://github.com/{owner}/{repo}/actions)
[![Security](https://github.com/{owner}/{repo}/workflows/Security%20Scanning/badge.svg)](https://github.com/{owner}/{repo}/actions)
[![Docker](https://github.com/{owner}/{repo}/workflows/Docker%20Build/badge.svg)](https://github.com/{owner}/{repo}/actions)
```

## Best Practices

### 1. Workflow Design

- Keep workflows focused and modular
- Use reusable workflows for common tasks
- Implement proper error handling
- Add timeout configurations
- Use appropriate concurrency settings

### 2. Security

- Never hardcode secrets
- Use environment protection rules
- Implement branch protection
- Regular security scanning
- Minimize token permissions

### 3. Testing

- Test workflows in feature branches
- Use test environments
- Implement smoke tests
- Monitor test flakiness
- Regular test review and maintenance

### 4. Deployment

- Always test in staging first
- Implement health checks
- Use blue-green or canary deployments
- Have rollback procedures
- Monitor after deployment

### 5. Maintenance

- Regular dependency updates
- Action version updates
- Workflow optimization reviews
- Documentation updates
- Metrics analysis

## Support and Resources

- **GitHub Actions Docs**: https://docs.github.com/actions
- **Gitea Actions Docs**: https://docs.gitea.io/en-us/actions/
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Infisical Docs**: https://infisical.com/docs

## Contributing

When modifying workflows:

1. Test changes in feature branch
2. Document changes in this README
3. Update related documentation
4. Request review from DevOps team
5. Monitor first production run

---

**Last Updated**: 2025-12-31
**Maintainer**: DevOps Team
