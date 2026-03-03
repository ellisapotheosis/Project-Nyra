---
description: Infrastructure and DevOps development standards
applyTo:
  - "infra/**/*"
  - "**/Dockerfile*"
  - "docker-compose*.yml"
  - ".github/workflows/**/*"
stack: Docker, Docker Compose, GitHub Actions, Bash, PowerShell
---

# Infrastructure & DevOps - Development Instructions

## Scope

This file applies to:
- Docker configuration (`infra/docker/`, `Dockerfile*`, `docker-compose*.yml`)
- CI/CD workflows (`.github/workflows/`)
- Deployment scripts (`scripts/deployment/`)
- Infrastructure as Code (`infra/terraform/`, `infra/kubernetes/`)

## Tech Stack

- **Containers:** Docker, Docker Compose
- **Orchestration:** Kubernetes (planned), Docker Swarm (legacy)
- **CI/CD:** GitHub Actions
- **Scripts:** Bash (Linux), PowerShell (Windows)
- **IaC:** Terraform (planned)

## Docker Best Practices

### Multi-Stage Dockerfile (Node.js)

```dockerfile
# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Prune dev dependencies
RUN pnpm prune --prod

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy built artifacts and production dependencies
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
```

### Multi-Stage Dockerfile (Python)

```dockerfile
# syntax=docker/dockerfile:1

# Build stage
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --user --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim AS runner

WORKDIR /app

# Create non-root user
RUN groupadd --gid 1001 appuser && \
    useradd --uid 1001 --gid appuser --shell /bin/bash --create-home appuser

# Copy Python packages from builder
COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local

# Copy application code
COPY --chown=appuser:appuser . .

# Update PATH
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### .dockerignore

```dockerignore
# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/

# Build artifacts
dist/
build/
*.egg-info/
.next/
coverage/

# Development files
.env
.env.local
*.log
.git/
.github/
.vscode/
.idea/

# Documentation
*.md
!README.md
docs/

# Tests
tests/
*.test.ts
*.spec.ts
jest.config.js
pytest.ini

# CI/CD
.circleci/
.gitlab-ci.yml
azure-pipelines.yml
```

## Docker Compose Patterns

### Development Stack

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: nyra-postgres-dev
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-nyra}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-dev_password}
      POSTGRES_DB: ${POSTGRES_DB:-nyra_dev}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-nyra}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: nyra-redis-dev
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped

  # API Service
  api:
    build:
      context: ../../services/api
      dockerfile: Dockerfile
      target: development
    container_name: nyra-api-dev
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://${POSTGRES_USER:-nyra}:${POSTGRES_PASSWORD:-dev_password}@postgres:5432/${POSTGRES_DB:-nyra_dev}
      REDIS_URL: redis://redis:6379
    ports:
      - "3000:3000"
    volumes:
      - ../../services/api:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  app-network:
    driver: bridge
```

### Production Stack

```yaml
version: '3.8'

services:
  api:
    image: ghcr.io/project-nyra/api:${VERSION:-latest}
    container_name: nyra-api-prod
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - prod-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  prod-network:
    driver: overlay
```

## GitHub Actions Workflows

### CI/CD Pipeline

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  PYTHON_VERSION: '3.11'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Code quality checks
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          
      - name: Install pnpm
        run: corepack enable pnpm
        
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run ESLint
        run: pnpm lint
        
      - name: Run Prettier check
        run: pnpm format:check

  # Unit tests
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          
      - name: Install pnpm
        run: corepack enable pnpm
        
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run database migrations
        run: pnpm db:migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
        
      - name: Run tests
        run: pnpm test:coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  # Build Docker images
  build:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: github.event_name == 'push'
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
        
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha
        
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache
          cache-to: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache,mode=max

  # Deploy to staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    
    environment:
      name: staging
      url: https://staging.nyra.example.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Deploy to staging
        run: |
          # Add deployment script here
          echo "Deploying to staging..."

  # Deploy to production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: production
      url: https://nyra.example.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Deploy to production
        run: |
          # Add deployment script here
          echo "Deploying to production..."
```

### Security Scanning

```yaml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  dependency-check:
    name: Dependency Security Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Run npm audit
        run: |
          corepack enable pnpm
          pnpm audit --audit-level=moderate
        continue-on-error: true
        
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
        continue-on-error: true

  container-scan:
    name: Container Image Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Build Docker image
        run: docker build -t test-image .
        
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'test-image'
          format: 'sarif'
          output: 'trivy-results.sarif'
        
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

## Deployment Scripts

### Bash Deployment Script

```bash
#!/bin/bash
# scripts/deployment/deploy-staging.sh

set -e  # Exit on error

# Configuration
ENVIRONMENT="staging"
DOCKER_REGISTRY="ghcr.io/project-nyra"
VERSION="${1:-latest}"

echo "🚀 Deploying to ${ENVIRONMENT}..."
echo "📦 Version: ${VERSION}"

# Pull latest images
echo "📥 Pulling Docker images..."
docker-compose -f infra/docker-compose.${ENVIRONMENT}.yml pull

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f infra/docker-compose.${ENVIRONMENT}.yml down

# Start new containers
echo "▶️  Starting new containers..."
docker-compose -f infra/docker-compose.${ENVIRONMENT}.yml up -d

# Wait for health checks
echo "🏥 Waiting for health checks..."
sleep 10

# Verify deployment
echo "✅ Verifying deployment..."
HEALTH_URL="http://localhost:3000/health"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" ${HEALTH_URL})

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed! HTTP ${HTTP_CODE}"
    echo "📋 Logs:"
    docker-compose -f infra/docker-compose.${ENVIRONMENT}.yml logs --tail=50
    exit 1
fi

# Cleanup old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Deployment complete!"
```

### PowerShell Deployment Script

```powershell
# scripts/deployment/deploy-orchestrator.ps1

param(
    [string]$Environment = "development",
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying orchestrator to $Environment..." -ForegroundColor Cyan
Write-Host "📦 Version: $Version" -ForegroundColor Cyan

# Pull latest images
Write-Host "📥 Pulling Docker images..." -ForegroundColor Yellow
docker-compose -f "infra/docker-compose.orchestrator.yml" pull

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f "infra/docker-compose.orchestrator.yml" down

# Start new containers
Write-Host "▶️  Starting new containers..." -ForegroundColor Yellow
docker-compose -f "infra/docker-compose.orchestrator.yml" up -d

# Wait for health checks
Write-Host "🏥 Waiting for health checks..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verify deployment
Write-Host "✅ Verifying deployment..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
    } else {
        throw "Health check failed! HTTP $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    Write-Host "📋 Logs:" -ForegroundColor Yellow
    docker-compose -f "infra/docker-compose.orchestrator.yml" logs --tail=50
    exit 1
}

# Cleanup old images
Write-Host "🧹 Cleaning up old images..." -ForegroundColor Yellow
docker image prune -f

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
```

## Key Reminders

1. **Always use multi-stage builds** to minimize image size
2. **Run containers as non-root user** for security
3. **Implement health checks** for all services
4. **Use .dockerignore** to exclude unnecessary files
5. **Tag images with semantic versions** (not just `latest`)
6. **Set resource limits** in production (CPU, memory)
7. **Enable logging** with rotation (avoid disk fill)
8. **Use secrets management** (never hardcode credentials)
9. **Implement graceful shutdown** (SIGTERM handling)
10. **Test deployments** in staging before production

---

**Last Updated:** 2026-01-18
