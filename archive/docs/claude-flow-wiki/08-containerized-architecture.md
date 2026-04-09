# CLAUDE.md Template: Containerized Architecture

**Architecture Pattern**: Container Orchestration & Deployment
**Orchestration**: {{ORCHESTRATION}} (Docker Compose/Kubernetes)
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**Containerized systems require infrastructure coordination:**

1. **Container Architect**: Container design and strategy
2. **Application Developer**: Service development
3. **Infrastructure Engineer**: Orchestration setup
4. **DevOps Engineer**: Deployment and scaling

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn container-focused agents
npx @claude-flow/cli@latest agent spawn -t coder --name container-architect --capabilities "docker,containerization"
npx @claude-flow/cli@latest agent spawn -t coder --name kubernetes-engineer --capabilities "kubernetes,helm,k8s"
npx @claude-flow/cli@latest agent spawn -t coder --name infra-engineer --capabilities "orchestration,networking"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Container Registry**: {{REGISTRY}} (Docker Hub/ECR/GCR)
- **Orchestration**: {{ORCHESTRATION}}
- **Services**: {{NUMBER_OF_SERVICES}}
- **Environment**: {{ENVIRONMENT}}

## 🔧 Development Patterns & Standards

### Container Project Structure
```
containers/
├── services/
│   ├── api/
│   │   ├── Dockerfile
│   │   ├── src/
│   │   ├── tests/
│   │   ├── .dockerignore
│   │   └── package.json
│   ├── web/
│   │   ├── Dockerfile
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   ├── worker/
│   │   ├── Dockerfile
│   │   ├── src/
│   │   └── package.json
│   └── postgres/
│       ├── Dockerfile
│       └── init.sql
├── docker-compose.yml       # Development
├── docker-compose.prod.yml  # Production
├── kubernetes/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── kustomization.yaml
├── helm/
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-prod.yaml
│   ├── templates/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   └── README.md
├── scripts/
│   ├── build.sh
│   ├── deploy.sh
│   └── cleanup.sh
└── README.md
```

## 🐝 Swarm Orchestration

### Phase 1: Container Strategy & Design
- **Duration**: 2-3 days
- **Agents**: Container Architect, Infrastructure Engineer
- **Output**: Container design, orchestration strategy

### Phase 2: Service Containerization
- **Duration**: 5-10 days
- **Agents**: Application Developers
- **Focus**: Dockerfile creation, image optimization

### Phase 3: Orchestration Configuration
- **Duration**: 5-10 days
- **Agents**: Kubernetes Engineer, Infrastructure Engineer
- **Focus**: K8s/Compose configuration, networking

### Phase 4: Testing & Optimization
- **Duration**: 5-10 days
- **Agents**: QA Engineer, DevOps Engineer
- **Focus**: Container testing, image optimization

### Phase 5: Production Deployment
- **Duration**: 3-5 days
- **Agents**: DevOps Engineer, Infrastructure Engineer
- **Focus**: Registry setup, production deployment

## 🧠 Memory Management

### Store Container Strategy
```bash
npx @claude-flow/cli@latest memory store --key "container-strategy-{{PROJECT_NAME}}" \
  --value "Image layering, optimization techniques, registry strategy" \
  --namespace containers --tags "docker,strategy"
```

### Store Orchestration Configuration
```bash
npx @claude-flow/cli@latest memory store --key "k8s-config-{{PROJECT_NAME}}" \
  --value "Resource requests, scaling policies, networking setup" \
  --namespace orchestration --tags "kubernetes,configuration"
```

## 🚀 Container Configuration

### Multi-Stage Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Docker Compose Configuration
```yaml
version: '3.8'

services:
  api:
    build:
      context: ./services/api
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build:
      context: ./services/web
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    depends_on:
      - api
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: {{PROJECT_NAME}}
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./services/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{PROJECT_NAME}}-api
  labels:
    app: {{PROJECT_NAME}}-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: {{PROJECT_NAME}}-api
  template:
    metadata:
      labels:
        app: {{PROJECT_NAME}}-api
    spec:
      containers:
      - name: api
        image: {{REGISTRY}}/{{PROJECT_NAME}}-api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: db-host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db-password
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: {{PROJECT_NAME}}-api
spec:
  selector:
    app: {{PROJECT_NAME}}-api
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{PROJECT_NAME}}-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: api.{{DOMAIN}}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: {{PROJECT_NAME}}-api
            port:
              number: 80
  tls:
  - hosts:
    - api.{{DOMAIN}}
    secretName: api-tls
```

## 📊 Monitoring & Logging

### Container Metrics
```bash
# Docker stats
docker stats --no-stream

# Kubernetes metrics
kubectl top nodes
kubectl top pods --all-namespaces

# Prometheus scraping
kubectl apply -f prometheus-config.yaml
```

### Centralized Logging
```yaml
# ELK Stack deployment
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebeat-config
data:
  filebeat.yml: |
    filebeat.inputs:
    - type: container
      enabled: true
      paths:
        - /var/lib/docker/containers/*/*.log

    output.elasticsearch:
      hosts: ["elasticsearch:9200"]
```

## 🔒 Security & Compliance

### Image Security
- Base image scanning
- Vulnerability detection
- Non-root user in containers
- Read-only filesystems

### Registry Security
- Image signing
- Access control
- Registry authentication
- Network policies

### Runtime Security
- Pod security policies
- Network policies
- RBAC configuration
- Secret management

## ✅ Testing Strategy

### Container Testing
```bash
# Build testing
docker build --target builder -t {{PROJECT_NAME}}:test .

# Run container tests
docker run --rm {{PROJECT_NAME}}:test npm test

# Scan for vulnerabilities
trivy image {{REGISTRY}}/{{PROJECT_NAME}}:latest
```

### Orchestration Testing
```bash
# Test Kubernetes manifests
kubeval kubernetes/deployment.yaml

# Dry-run deployment
kubectl apply -f kubernetes/ --dry-run=client
```

## 🎯 Performance Targets

- Container startup time: <10s
- Image size: <500MB (optimized)
- Pod density: 50-100 per node
- Memory overhead: <10%

## 📋 Development Checklist

- [ ] Services identified and containerized
- [ ] Dockerfiles optimized
- [ ] Docker Compose working locally
- [ ] Registry account configured
- [ ] Kubernetes cluster set up
- [ ] Manifests created and validated
- [ ] Persistent storage configured
- [ ] Networking policies defined
- [ ] Logging and monitoring configured
- [ ] Security scanning enabled
- [ ] Deployment pipeline created
- [ ] Auto-scaling configured
- [ ] Disaster recovery plan
- [ ] Documentation completed

---

**Generated from**: claude-flow CLAUDE.md Containerized Architecture Template
