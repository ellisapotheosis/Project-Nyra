# Deployment Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-09

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Docker Deployment](#docker-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Post-Deployment](#post-deployment)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

## Overview

This guide covers deploying Project-Nyra to various environments including local Docker, Kubernetes clusters, and cloud providers (AWS, Azure, GCP).

### Deployment Strategy

Project-Nyra uses a **blue-green deployment** strategy with:

- Zero-downtime deployments
- Automated health checks
- Quick rollback capabilities
- Canary releases for gradual rollouts

### Supported Environments

- **Development:** Docker Compose (local)
- **Staging:** Kubernetes (cloud or on-premises)
- **Production:** Kubernetes with auto-scaling

## Prerequisites

### System Requirements

**Minimum:**

- CPU: 4 cores
- RAM: 8 GB
- Disk: 50 GB SSD
- Network: 100 Mbps

**Recommended:**

- CPU: 8+ cores
- RAM: 16+ GB
- Disk: 200 GB SSD
- Network: 1 Gbps

### Required Software

- **Node.js:** 20.0.0 or higher
- **pnpm:** 10.0.0 or higher
- **Docker:** 24.0.0 or higher
- **Docker Compose:** 2.20.0 or higher
- **Kubernetes:** 1.28.0 or higher (for K8s deployment)
- **kubectl:** 1.28.0 or higher
- **Helm:** 3.12.0 or higher (optional)

### Access Requirements

- Git repository access
- Container registry credentials
- Cloud provider credentials (if deploying to cloud)
- Database credentials
- SSL certificates
- Secret management access (Vault/AWS Secrets Manager)

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/project-nyra.git
cd project-nyra
```

### 2. Configure Environment Variables

Create environment-specific `.env` files:

**Development (`.env.development`):**

```bash
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nyra_dev
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-development-jwt-secret
JWT_EXPIRY=3600

# MCP Servers
CLAUDE_FLOW_ENABLED=true
RUV_SWARM_ENABLED=true
FLOW_NEXUS_ENABLED=true

# API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Storage
S3_BUCKET=nyra-dev-storage
S3_REGION=us-east-1

# Monitoring
ENABLE_METRICS=true
SENTRY_DSN=https://...
```

**Production (`.env.production`):**

```bash
# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database (use secrets manager)
DATABASE_URL=${SECRETS_MANAGER_DB_URL}
REDIS_URL=${SECRETS_MANAGER_REDIS_URL}

# Authentication
JWT_SECRET=${SECRETS_MANAGER_JWT_SECRET}
JWT_EXPIRY=1800

# Enable all features
CLAUDE_FLOW_ENABLED=true
RUV_SWARM_ENABLED=true
FLOW_NEXUS_ENABLED=true

# API Keys (from secrets)
ANTHROPIC_API_KEY=${SECRETS_MANAGER_ANTHROPIC_KEY}

# Storage
S3_BUCKET=nyra-prod-storage
S3_REGION=us-east-1

# Monitoring
ENABLE_METRICS=true
ENABLE_TRACING=true
SENTRY_DSN=${SECRETS_MANAGER_SENTRY_DSN}
```

### 3. Install Dependencies

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run database migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate
```

## Docker Deployment

### Development Environment

**1. Start Development Stack:**

```bash
# Start all services
docker-compose -f bootstrap/infrastructure/docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

**Services Started:**

- Application server (port 3000)
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- RabbitMQ (port 5672, management UI: 15672)
- Grafana (port 3001)
- Prometheus (port 9090)

**2. Verify Deployment:**

```bash
# Check application health
curl http://localhost:3000/health

# Check database connection
curl http://localhost:3000/health/db

# Check Redis connection
curl http://localhost:3000/health/cache
```

### Production Docker Setup

**1. Build Production Images:**

```bash
# Build application image
docker build -t nyra-app:latest -f Dockerfile.prod .

# Tag for registry
docker tag nyra-app:latest registry.example.com/nyra-app:1.0.0

# Push to registry
docker push registry.example.com/nyra-app:1.0.0
```

**2. Production Docker Compose:**

```yaml
version: "3.9"

services:
  app:
    image: registry.example.com/nyra-app:1.0.0
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    env_file:
      - .env.production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: always
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: "2"
          memory: 4G
        reservations:
          cpus: "1"
          memory: 2G

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: always
```

## Kubernetes Deployment

### Cluster Setup

**1. Create Namespace:**

```bash
kubectl create namespace nyra-prod
kubectl config set-context --current --namespace=nyra-prod
```

**2. Create Secrets:**

```bash
# Database credentials
kubectl create secret generic db-credentials \
  --from-literal=url="postgresql://user:pass@host:5432/nyra"

# API keys
kubectl create secret generic api-keys \
  --from-literal=anthropic-key="sk-ant-..." \
  --from-literal=openai-key="sk-..."

# JWT secret
kubectl create secret generic jwt-secret \
  --from-literal=secret="your-secure-jwt-secret"
```

### Application Deployment

**1. Create ConfigMap:**

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: nyra-prod
data:
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "info"
  ENABLE_METRICS: "true"
  CLAUDE_FLOW_ENABLED: "true"
  RUV_SWARM_ENABLED: "true"
  FLOW_NEXUS_ENABLED: "true"
```

```bash
kubectl apply -f configmap.yaml
```

**2. Create Deployment:**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nyra-app
  namespace: nyra-prod
  labels:
    app: nyra
    component: application
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nyra
      component: application
  template:
    metadata:
      labels:
        app: nyra
        component: application
    spec:
      containers:
        - name: app
          image: registry.example.com/nyra-app:1.0.0
          ports:
            - containerPort: 3000
              name: http
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: secret
            - name: ANTHROPIC_API_KEY
              valueFrom:
                secretKeyRef:
                  name: api-keys
                  key: anthropic-key
          envFrom:
            - configMapRef:
                name: app-config
          resources:
            requests:
              cpu: "1"
              memory: "2Gi"
            limits:
              cpu: "2"
              memory: "4Gi"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
```

```bash
kubectl apply -f deployment.yaml
```

**3. Create Service:**

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: nyra-app
  namespace: nyra-prod
  labels:
    app: nyra
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
      name: http
    - port: 443
      targetPort: 3000
      protocol: TCP
      name: https
  selector:
    app: nyra
    component: application
```

```bash
kubectl apply -f service.yaml
```

**4. Create Ingress:**

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nyra-ingress
  namespace: nyra-prod
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.project-nyra.io
      secretName: nyra-tls
  rules:
    - host: api.project-nyra.io
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nyra-app
                port:
                  number: 80
```

```bash
kubectl apply -f ingress.yaml
```

### Auto-Scaling Configuration

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nyra-app-hpa
  namespace: nyra-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nyra-app
  minReplicas: 3
  maxReplicas: 100
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 25
          periodSeconds: 120
```

```bash
kubectl apply -f hpa.yaml
```

## Cloud Deployment

### AWS Deployment

**1. Setup EKS Cluster:**

```bash
# Install eksctl
brew install eksctl

# Create EKS cluster
eksctl create cluster \
  --name nyra-prod \
  --region us-east-1 \
  --node-type t3.xlarge \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10 \
  --managed
```

**2. Configure RDS Database:**

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier nyra-prod-db \
  --db-instance-class db.r5.large \
  --engine postgres \
  --engine-version 16.1 \
  --master-username admin \
  --master-user-password <secure-password> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name nyra-db-subnet \
  --backup-retention-period 30 \
  --multi-az \
  --storage-encrypted
```

**3. Setup ElastiCache Redis:**

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id nyra-prod-redis \
  --cache-node-type cache.r5.large \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --security-group-ids sg-xxxxx
```

**4. Configure S3 Storage:**

```bash
# Create S3 bucket
aws s3 mb s3://nyra-prod-storage --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket nyra-prod-storage \
  --versioning-configuration Status=Enabled

# Configure lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket nyra-prod-storage \
  --lifecycle-configuration file://s3-lifecycle.json
```

### Azure Deployment

**1. Create AKS Cluster:**

```bash
# Create resource group
az group create --name nyra-prod --location eastus

# Create AKS cluster
az aks create \
  --resource-group nyra-prod \
  --name nyra-prod-aks \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-addons monitoring \
  --generate-ssh-keys
```

**2. Configure Azure Database for PostgreSQL:**

```bash
az postgres flexible-server create \
  --resource-group nyra-prod \
  --name nyra-prod-db \
  --location eastus \
  --admin-user admin \
  --admin-password <secure-password> \
  --sku-name Standard_D4s_v3 \
  --tier GeneralPurpose \
  --version 16 \
  --storage-size 128 \
  --high-availability Enabled
```

### GCP Deployment

**1. Create GKE Cluster:**

```bash
gcloud container clusters create nyra-prod \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-4 \
  --enable-autoscaling \
  --min-nodes 3 \
  --max-nodes 10
```

**2. Configure Cloud SQL:**

```bash
gcloud sql instances create nyra-prod-db \
  --database-version=POSTGRES_16 \
  --tier=db-custom-4-16384 \
  --region=us-central1 \
  --availability-type=REGIONAL \
  --backup-start-time=03:00
```

## Post-Deployment

### Verification Steps

**1. Health Checks:**

```bash
# Application health
curl https://api.project-nyra.io/health

# Database connectivity
curl https://api.project-nyra.io/health/db

# Cache connectivity
curl https://api.project-nyra.io/health/cache

# MCP servers
curl https://api.project-nyra.io/health/mcp
```

**2. Smoke Tests:**

```bash
# Run automated smoke tests
npm run test:smoke

# Test critical user flows
npm run test:e2e:critical
```

**3. Monitoring Setup:**

```bash
# Verify metrics collection
curl https://api.project-nyra.io/metrics

# Check Grafana dashboards
open https://grafana.project-nyra.io

# Verify alerting
curl https://alertmanager.project-nyra.io/api/v1/alerts
```

### Post-Deployment Checklist

- [ ] All pods running and healthy
- [ ] Database migrations completed
- [ ] All health checks passing
- [ ] Smoke tests passing
- [ ] Monitoring dashboards showing data
- [ ] Alerts configured and tested
- [ ] SSL certificates valid
- [ ] DNS records updated
- [ ] Load balancer configured
- [ ] Auto-scaling tested
- [ ] Backup jobs scheduled
- [ ] Log aggregation working
- [ ] Documentation updated

## Rollback Procedures

### Quick Rollback

**Kubernetes:**

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/nyra-app -n nyra-prod

# Rollback to specific revision
kubectl rollout undo deployment/nyra-app --to-revision=2 -n nyra-prod

# Check rollout status
kubectl rollout status deployment/nyra-app -n nyra-prod
```

**Docker:**

```bash
# Stop current version
docker-compose down

# Start previous version
docker-compose -f docker-compose.v1.0.0.yml up -d
```

### Database Rollback

```bash
# Restore from backup
pg_restore -h localhost -U admin -d nyra_prod backup_file.dump

# Or use Prisma migrate
cd packages/database
npx prisma migrate resolve --rolled-back 20260109_migration_name
```

## Troubleshooting

### Common Issues

**1. Pods Not Starting:**

```bash
# Check pod status
kubectl get pods -n nyra-prod

# View pod logs
kubectl logs <pod-name> -n nyra-prod

# Describe pod for events
kubectl describe pod <pod-name> -n nyra-prod
```

**2. Database Connection Issues:**

```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:16 --restart=Never -- \
  psql -h <db-host> -U admin -d nyra_prod

# Check database credentials
kubectl get secret db-credentials -n nyra-prod -o yaml
```

**3. High Memory Usage:**

```bash
# Check resource usage
kubectl top pods -n nyra-prod

# Scale up if needed
kubectl scale deployment nyra-app --replicas=5 -n nyra-prod
```

**4. SSL Certificate Issues:**

```bash
# Check certificate status
kubectl get certificate -n nyra-prod

# Describe certificate for issues
kubectl describe certificate nyra-tls -n nyra-prod

# Manually trigger renewal
kubectl delete certificate nyra-tls -n nyra-prod
kubectl apply -f ingress.yaml
```

### Support Resources

- [Troubleshooting Guide](../troubleshooting/common-issues.md)
- [Operations Runbook](../operations/runbook.md)
- [Monitoring Guide](../operations/monitoring.md)
- GitHub Issues: https://github.com/your-org/project-nyra/issues

---

**Version:** 1.0.0
**Last Updated:** 2026-01-09
**Next Review:** 2026-04-09
