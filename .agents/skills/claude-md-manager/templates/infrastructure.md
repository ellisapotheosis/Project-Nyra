# {{PROJECT_NAME}} Infrastructure - Claude Code Configuration

> {{DESCRIPTION}}
>
> **Type**: Infrastructure as Code
> **Namespace**: {{NAMESPACE}}

## 🎯 Infrastructure Overview

{{PROJECT_NAME}} provides infrastructure orchestration and deployment configuration for Project Nyra services. Manages containerization, networking, storage, monitoring, and disaster recovery.

### Infrastructure Characteristics
- Service orchestration (Docker Compose, Kubernetes)
- Network configuration and security
- Storage provisioning and management
- Monitoring and observability
- Automated backups and recovery
- Infrastructure as Code (IaC) principles

## 🚨 AUTOMATIC SWARM ORCHESTRATION

For infrastructure changes, Claude Code MUST:

1. **Initialize swarm** for coordination
2. **Spawn specialized agents** (DevOps architect, infrastructure coder)
3. **Use memory** to track infrastructure patterns

### Infrastructure Changes Routing
```bash
# Get optimal routing for infrastructure modifications
npx @archon-os/cli@latest hooks pre-task --description "{{PROJECT_NAME}} infrastructure change"
```

## 🏗️ Infrastructure Architecture

### File Structure
```
{{PROJECT_NAME}}/
├── docker/
│   ├── Dockerfile                 # Service Dockerfile
│   ├── docker-compose.yml         # Local development
│   ├── docker-compose.prod.yml    # Production
│   └── .dockerignore             # Ignore patterns
├── kubernetes/
│   ├── base/                      # Base configurations
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── secret.yaml
│   ├── overlays/
│   │   ├── dev/                   # Development overlay
│   │   ├── staging/               # Staging overlay
│   │   └── prod/                  # Production overlay
│   └── kustomization.yaml
├── terraform/
│   ├── main.tf                    # Main infrastructure
│   ├── variables.tf               # Variables
│   ├── outputs.tf                 # Outputs
│   ├── vpc.tf                     # Networking
│   ├── databases.tf               # Data stores
│   ├── monitoring.tf              # Observability
│   └── terraform.tfvars           # Configuration
├── ansible/
│   ├── playbooks/
│   │   ├── deploy.yml
│   │   ├── configure.yml
│   │   └── backup.yml
│   ├── roles/
│   │   ├── docker/
│   │   ├── monitoring/
│   │   └── security/
│   └── inventory.yml
├── monitoring/
│   ├── prometheus.yml             # Prometheus config
│   ├── alertmanager.yml           # Alert rules
│   ├── grafana-dashboards.json   # Grafana config
│   └── loki-config.yml           # Log aggregation
├── scripts/
│   ├── deploy.sh                  # Deployment script
│   ├── backup.sh                  # Backup script
│   ├── restore.sh                 # Restore script
│   ├── health-check.sh            # Health checks
│   └── scale.sh                   # Scaling script
└── docs/
    ├── architecture.md            # Architecture docs
    ├── deployment.md              # Deployment guide
    ├── troubleshooting.md        # Troubleshooting
    └── runbooks/                  # Operational runbooks
```

## 🐳 Docker & Containerization

### Dockerfile Best Practices
```dockerfile
# Multi-stage build for smaller image
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Docker Compose (Development)
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_URL: postgres://postgres:password@db:5432/app
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Docker Compose (Production)
```yaml
version: '3.8'

services:
  app:
    image: registry.example.com/{{PROJECT_NAME}}:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_URL: ${DB_URL}
      REDIS_URL: ${REDIS_URL}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ... other services
```

## ☸️ Kubernetes Configuration

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{PROJECT_NAME}}
  namespace: {{NAMESPACE}}
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: {{PROJECT_NAME}}
  template:
    metadata:
      labels:
        app: {{PROJECT_NAME}}
    spec:
      containers:
      - name: {{PROJECT_NAME}}
        image: registry.example.com/{{PROJECT_NAME}}:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
        env:
        - name: DB_URL
          valueFrom:
            secretKeyRef:
              name: {{PROJECT_NAME}}-secrets
              key: db_url
        resources:
          requests:
            cpu: 250m
            memory: 512Mi
          limits:
            cpu: 500m
            memory: 1Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{PROJECT_NAME}}
  namespace: {{NAMESPACE}}
spec:
  type: ClusterIP
  selector:
    app: {{PROJECT_NAME}}
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

### ConfigMap & Secrets
```yaml
# ConfigMap for configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{PROJECT_NAME}}-config
  namespace: {{NAMESPACE}}
data:
  LOG_LEVEL: info
  NODE_ENV: production

---
# Secret for sensitive data
apiVersion: v1
kind: Secret
metadata:
  name: {{PROJECT_NAME}}-secrets
  namespace: {{NAMESPACE}}
type: Opaque
stringData:
  db_url: postgres://user:pass@host:5432/db
  api_key: secret-key-here
```

## 🌍 Networking

### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{PROJECT_NAME}}-network-policy
  namespace: {{NAMESPACE}}
spec:
  podSelector:
    matchLabels:
      app: {{PROJECT_NAME}}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: {{NAMESPACE}}
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: {{NAMESPACE}}
  - ports:
    - protocol: TCP
      port: 53  # DNS
```

### Ingress Configuration
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{PROJECT_NAME}}-ingress
  namespace: {{NAMESPACE}}
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.example.com
    secretName: tls-secret
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: {{PROJECT_NAME}}
            port:
              number: 80
```

## 📊 Monitoring & Observability

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: '{{PROJECT_NAME}}'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

### Alert Rules
```yaml
# alerts.yml
groups:
  - name: {{PROJECT_NAME}}-alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: HighMemoryUsage
        expr: memory_usage_percent > 80
        for: 10m
        annotations:
          summary: "High memory usage on {{PROJECT_NAME}}"

      - alert: ServiceDown
        expr: up{job="{{PROJECT_NAME}}"} == 0
        for: 1m
        annotations:
          summary: "{{PROJECT_NAME}} service is down"
```

### Grafana Dashboards
```json
{
  "dashboard": {
    "title": "{{PROJECT_NAME}} Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(errors_total[5m])"
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security & Compliance

### Network Security
```yaml
# Firewall rules
ingress:
  - protocol: tcp
    from_port: 443
    to_port: 443
    cidr_blocks: ["0.0.0.0/0"]
  - protocol: tcp
    from_port: 80
    to_port: 80
    cidr_blocks: ["0.0.0.0/0"]

egress:
  - protocol: -1
    from_port: 0
    to_port: 0
    cidr_blocks: ["0.0.0.0/0"]
```

### Data Encryption
- TLS 1.3 for all communications
- AES-256 for data at rest
- Key rotation every 90 days
- Encrypted database backups

### Secrets Management
```bash
# Kubernetes secrets
kubectl create secret generic {{PROJECT_NAME}}-secrets \
  --from-literal=db_url=postgres://... \
  --from-literal=api_key=...

# Terraform secrets
terraform apply -var 'db_password=secret'
```

## 📈 Scaling & Load Balancing

### Horizontal Pod Autoscaling
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{PROJECT_NAME}}-hpa
  namespace: {{NAMESPACE}}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{PROJECT_NAME}}
  minReplicas: 3
  maxReplicas: 10
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
```

### Load Balancing
```yaml
# Round-robin with health checks
apiVersion: v1
kind: Service
metadata:
  name: {{PROJECT_NAME}}-lb
spec:
  type: LoadBalancer
  sessionAffinity: ClientIP
  selector:
    app: {{PROJECT_NAME}}
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

## 💾 Backup & Disaster Recovery

### Backup Strategy
```bash
#!/bin/bash
# Backup databases and important data

# Database backup
pg_dump $DB_URL | gzip > backups/db-$(date +%Y%m%d).sql.gz

# Upload to S3
aws s3 cp backups/db-*.sql.gz s3://backup-bucket/{{PROJECT_NAME}}/

# Retention: Keep 30 days
find backups -name "*.sql.gz" -mtime +30 -delete
```

### Restore Procedure
```bash
#!/bin/bash
# Restore from backup

# List available backups
aws s3 ls s3://backup-bucket/{{PROJECT_NAME}}/

# Download latest backup
aws s3 cp s3://backup-bucket/{{PROJECT_NAME}}/db-latest.sql.gz .

# Restore to database
gunzip -c db-latest.sql.gz | psql $DB_URL
```

### Disaster Recovery Plan
1. **RTO** (Recovery Time Objective): < 1 hour
2. **RPO** (Recovery Point Objective): < 15 minutes
3. **Backup Frequency**: Every 4 hours
4. **Backup Location**: Multi-region S3
5. **Testing**: Monthly DR drills

## 🧠 Memory & Infrastructure Patterns

Store infrastructure patterns:

```bash
# Store deployment pattern
npx @archon-os/cli@latest memory store \
  --key "{{PROJECT_NAME}}-deployment" \
  --value "Deployment configuration and gotchas" \
  --namespace infrastructure-patterns

# Search for scaling patterns
npx @archon-os/cli@latest memory search \
  --query "Kubernetes scaling best practices"
```

## 📋 Deployment Checklist

- [ ] Docker image built and pushed to registry
- [ ] Kubernetes manifests validated (kubeval)
- [ ] Secrets configured securely
- [ ] Network policies in place
- [ ] Monitoring and alerting configured
- [ ] Backup procedures tested
- [ ] Load balancing configured
- [ ] Health checks defined
- [ ] Resource limits set
- [ ] Documentation updated

## 🔄 Swarm Coordination

For infrastructure changes:

```bash
# Initialize swarm
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 4

# Architecture phase
Task({
  prompt: "Design {{PROJECT_NAME}} infrastructure changes",
  subagent_type: "system-architect",
  run_in_background: true
})

# Implementation phase
Task({
  prompt: "Implement infrastructure changes (Docker, K8s, Terraform)",
  subagent_type: "cicd-engineer",
  run_in_background: true
})

# Testing phase
Task({
  prompt: "Test deployment and infrastructure",
  subagent_type: "tester",
  run_in_background: true
})

# Review phase
Task({
  prompt: "Review infrastructure for security and optimization",
  subagent_type: "security-architect",
  run_in_background: true
})
```

## Quick Reference

```bash
# Docker operations
docker build -t {{PROJECT_NAME}} .
docker run -d {{PROJECT_NAME}}
docker-compose up -d
docker-compose logs -f

# Kubernetes operations
kubectl apply -f k8s/
kubectl get deployments
kubectl logs deployment/{{PROJECT_NAME}}
kubectl scale deployment {{PROJECT_NAME}} --replicas=5

# Terraform operations
terraform init
terraform plan
terraform apply
terraform destroy

# Backup operations
./scripts/backup.sh
./scripts/restore.sh
```

## Documentation References

- **Project Root**: `CLAUDE.md` - Overall architecture
- **Docker Docs**: https://docs.docker.com
- **Kubernetes Docs**: https://kubernetes.io/docs
- **Terraform Docs**: https://www.terraform.io/docs

## Version

Created: {{DATE}}
Infrastructure: {{PROJECT_NAME}}
Type: Infrastructure as Code
Namespace: {{NAMESPACE}}
Architecture: Claude Flow V3
Last Updated: {{TIMESTAMP}}
