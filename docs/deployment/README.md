# Deployment Documentation

> Complete guides for deploying Project Nyra across different environments

## Quick Start

Choose your deployment scenario:

- **[Quick Start](QUICK-START.md)** - Get up and running in 10 minutes
- **[Local Development (Windows)](LOCAL-DEV-WINDOWS.md)** - Windows development setup
- **[Linux Deployment](LINUX-ORCHESTRATOR-DEPLOY.md)** - Linux production deployment
- **[MCP Server Setup](MCP-SERVER-SETUP.md)** - Model Context Protocol configuration

## Deployment Guides

### Getting Started

| Guide | Description | Time | Difficulty |
|-------|-------------|------|------------|
| [Quick Start](QUICK-START.md) | Fastest way to run Project Nyra locally | 10 min | Easy |
| [Local Development (Windows)](LOCAL-DEV-WINDOWS.md) | Complete Windows development setup | 30 min | Easy |
| [Environment Setup](../guides/environment-setup.md) | Environment variables and configuration | 15 min | Easy |

### Production Deployment

| Guide | Description | Time | Difficulty |
|-------|-------------|------|------------|
| [Linux Orchestrator Deploy](LINUX-ORCHESTRATOR-DEPLOY.md) | Deploy orchestration stack on Linux | 45 min | Medium |
| [Deployment Guide](deployment-guide.md) | Complete production deployment | 2 hours | Advanced |
| [Kubernetes Deployment](kubernetes-deployment.md) | K8s cluster deployment | 3 hours | Advanced |

### Configuration

| Guide | Description | Time | Difficulty |
|-------|-------------|------|------------|
| [Secrets Management](INFISICAL-SECRETS-REFERENCE.md) | Infisical secrets configuration | 20 min | Medium |
| [Secrets Checklist](SECRETS-CHECKLIST.md) | Complete secrets checklist | 15 min | Easy |
| [MCP Server Setup](MCP-SERVER-SETUP.md) | Configure MCP servers | 20 min | Medium |

### Status & Monitoring

| Document | Description |
|----------|-------------|
| [Deployment Status](DEPLOYMENT-STATUS.md) | Current deployment state and health |
| [Monitoring Guide](monitoring-guide.md) | System monitoring and alerts |

## Deployment Scenarios

### 1. Local Development (Recommended for Beginners)

**Goal:** Run Project Nyra on your local machine for development

**Steps:**
1. [Quick Start](QUICK-START.md) - Basic setup
2. [Local Development (Windows)](LOCAL-DEV-WINDOWS.md) - Windows-specific
3. [Environment Setup](../guides/environment-setup.md) - Configure environment

**Requirements:**
- Windows 10/11 or macOS/Linux
- Node.js 20+
- pnpm 10+
- Docker Desktop
- 16GB RAM minimum
- 50GB free disk space

**Time:** 30-45 minutes

---

### 2. Docker Compose (Simple Production)

**Goal:** Deploy with Docker Compose for small-scale production

**Steps:**
1. Prepare Linux server (Ubuntu 22.04 recommended)
2. [Linux Orchestrator Deploy](LINUX-ORCHESTRATOR-DEPLOY.md)
3. [Secrets Management](INFISICAL-SECRETS-REFERENCE.md)
4. Configure DNS and SSL
5. Start services with Docker Compose

**Requirements:**
- Linux server (4 cores, 16GB RAM)
- Docker and Docker Compose
- Domain name
- SSL certificates

**Time:** 1-2 hours

---

### 3. Kubernetes (Enterprise Production)

**Goal:** Deploy on Kubernetes for high availability and scalability

**Steps:**
1. Set up Kubernetes cluster (EKS/AKS/GKE)
2. Configure ingress and load balancer
3. Apply Kubernetes manifests
4. Configure secrets (Sealed Secrets/Vault)
5. Set up monitoring (Prometheus + Grafana)

**Requirements:**
- Kubernetes cluster
- kubectl configured
- Helm 3
- CI/CD pipeline (GitHub Actions)

**Time:** 3-4 hours

---

## Environment Types

### Development
- **Purpose:** Local development and testing
- **Setup:** Docker Compose
- **Database:** PostgreSQL container
- **Secrets:** `.env` files
- **Monitoring:** Basic logging

### Staging
- **Purpose:** Pre-production validation
- **Setup:** Docker Compose or Kubernetes
- **Database:** Managed PostgreSQL (RDS/Cloud SQL)
- **Secrets:** Infisical or Vault
- **Monitoring:** Prometheus + Grafana

### Production
- **Purpose:** Live customer environment
- **Setup:** Kubernetes
- **Database:** Managed PostgreSQL with replicas
- **Secrets:** Vault or cloud-native secrets
- **Monitoring:** Full observability stack
- **Backup:** Automated daily backups
- **HA:** Multi-zone deployment

## Infrastructure Requirements

### Minimum Specifications

**Development:**
- 4 CPU cores
- 16GB RAM
- 50GB SSD storage
- 100 Mbps network

**Production (Small):**
- 8 CPU cores
- 32GB RAM
- 200GB SSD storage
- 1 Gbps network

**Production (Large):**
- 32+ CPU cores
- 128GB+ RAM
- 1TB+ SSD storage
- 10 Gbps network

### Services Resource Allocation

| Service | CPU | Memory | Storage |
|---------|-----|--------|---------|
| PostgreSQL | 2 cores | 4GB | 50GB |
| Redis | 1 core | 2GB | 10GB |
| Qdrant | 2 cores | 4GB | 20GB |
| Claude Flow | 2 cores | 4GB | 10GB |
| Archon OS | 2 cores | 4GB | 10GB |
| Nexus Router | 1 core | 2GB | 5GB |
| Each Backend Service | 1 core | 1GB | 5GB |
| Each Frontend App | 1 core | 512MB | 1GB |

## Port Allocation

### Infrastructure Services

| Service | Port | Protocol | Access |
|---------|------|----------|--------|
| PostgreSQL | 5432 | TCP | Internal |
| Redis | 6379 | TCP | Internal |
| FalkorDB | 6380 | TCP | Internal |
| Qdrant | 6333 | HTTP | Internal |
| Qdrant gRPC | 6334 | gRPC | Internal |
| Letta API | 8283 | HTTP | Internal |
| Letta WebSocket | 8284 | WS | Internal |

### Backend Services

| Service | Port | Access |
|---------|------|--------|
| auth-service | 3100 | Internal |
| doc-management-api | 3200 | Internal |
| lead-capture-api | 3300 | Internal |
| mortgage-assistant-api | 3400 | Internal |
| rate-comparison-engine | 3500 | Internal |
| ratehunter-api | 3600 | Public |
| ruvector-search | 3700 | Internal |
| letta-knowledge | 3800 | Internal |
| twentycrm-integration | 3900 | Internal |
| twilio-integration | 4000 | Internal |
| letta-integration | 4100 | Internal |
| campaign-engine | 4200 | Internal |
| n8n-workflows | 4300 | Internal |
| nexus-router | 4400 | Internal |
| nexus-router MCP | 4401 | Internal |
| websocket-hub | 4500 | Public |

### Frontend Apps

| App | Port | Access |
|-----|------|--------|
| mortgage-assistant | 3000 | Public |
| ratehunter-landing | 3001 | Public |
| nexus-dashboard | 3002 | Private |
| nyra-admin | 3003 | Private |
| ratehunter | 3009 | Public |

## Secrets Management

### Required Secrets

**Database:**
- `POSTGRES_USER` - PostgreSQL username
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_DB` - Database name
- `DATABASE_URL` - Full connection string

**Redis:**
- `REDIS_PASSWORD` - Redis password
- `REDIS_URL` - Full connection string

**Vector Databases:**
- `QDRANT_API_KEY` - Qdrant API key
- `FALKORDB_PASSWORD` - FalkorDB password

**AI Services:**
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENROUTER_API_KEY` - OpenRouter API key

**Authentication:**
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session encryption key

**Integrations:**
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWENTY_API_KEY` - TwentyCRM API key

**GitHub:**
- `GITHUB_TOKEN` - GitHub personal access token
- `GITHUB_REPO` - Repository name
- `GITHUB_OWNER` - Repository owner

See [Secrets Checklist](SECRETS-CHECKLIST.md) for complete list.

## Deployment Checklist

### Pre-Deployment

- [ ] Review system requirements
- [ ] Provision infrastructure (servers/cloud)
- [ ] Configure DNS records
- [ ] Obtain SSL certificates
- [ ] Set up monitoring and alerting
- [ ] Configure backup system
- [ ] Prepare secrets management
- [ ] Create deployment plan
- [ ] Set up CI/CD pipeline
- [ ] Test in staging environment

### Deployment

- [ ] Deploy infrastructure (Terraform/CloudFormation)
- [ ] Deploy databases and storage
- [ ] Configure networking and security groups
- [ ] Deploy orchestration services (Claude Flow, Archon)
- [ ] Deploy backend services
- [ ] Deploy frontend applications
- [ ] Configure load balancers
- [ ] Set up SSL/TLS
- [ ] Verify health checks
- [ ] Run smoke tests

### Post-Deployment

- [ ] Verify all services are running
- [ ] Test critical user flows
- [ ] Check monitoring dashboards
- [ ] Review logs for errors
- [ ] Verify backup jobs
- [ ] Update documentation
- [ ] Notify team of deployment
- [ ] Monitor for 24 hours

## Monitoring & Health Checks

### Health Check Endpoints

All services expose health check endpoints:

```bash
# Check service health
curl http://localhost:3100/health

# Expected response
{
  "status": "healthy",
  "service": "auth-service",
  "uptime": 3600,
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Monitoring Stack

**Metrics:**
- Prometheus - Metrics collection
- Grafana - Visualization dashboards

**Logs:**
- Loki - Log aggregation
- Grafana - Log visualization

**Traces:**
- Tempo - Distributed tracing
- Grafana - Trace visualization

**Alerts:**
- AlertManager - Alert routing
- PagerDuty - On-call notifications

### Key Metrics to Monitor

**System Metrics:**
- CPU utilization
- Memory usage
- Disk space
- Network throughput

**Application Metrics:**
- Request rate
- Error rate
- Response time (p50, p95, p99)
- Active connections

**Business Metrics:**
- User registrations
- Applications created
- Documents processed
- API usage

## Backup & Recovery

### Backup Strategy

**Database Backups:**
- Automated daily full backups
- Continuous WAL archiving
- Point-in-time recovery (PITR)
- 30-day retention

**Application State:**
- Agent memory snapshots
- Configuration backups
- Session data backups

**Backup Locations:**
- Primary: S3/Azure Blob
- Secondary: Cross-region replication

### Recovery Procedures

**Database Recovery:**
```bash
# Restore from backup
pg_restore -d nyra backup.dump

# Point-in-time recovery
pg_basebackup + WAL replay
```

**Service Recovery:**
```bash
# Restart services
docker-compose restart

# Or with Kubernetes
kubectl rollout restart deployment/auth-service
```

**RTO/RPO:**
- **RTO:** 1 hour (Recovery Time Objective)
- **RPO:** 5 minutes (Recovery Point Objective)

## Security Considerations

### Network Security
- [ ] Configure firewall rules
- [ ] Enable TLS 1.3 for all services
- [ ] Use VPC/private networks
- [ ] Implement DDoS protection
- [ ] Set up intrusion detection

### Application Security
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Implement API authentication
- [ ] Use security headers (HSTS, CSP)
- [ ] Regular security audits

### Data Security
- [ ] Encrypt data at rest
- [ ] Encrypt data in transit
- [ ] Implement key rotation
- [ ] Regular security patches
- [ ] Access logging and auditing

### Secrets Security
- [ ] Never commit secrets to git
- [ ] Use secrets management (Vault/Infisical)
- [ ] Rotate secrets regularly
- [ ] Limit secret access (least privilege)
- [ ] Audit secret access

## Troubleshooting

### Service Won't Start

**Check logs:**
```bash
# Docker logs
docker logs nyra-auth-service

# Kubernetes logs
kubectl logs deployment/auth-service
```

**Common issues:**
- Port conflicts
- Missing environment variables
- Database connection failures
- Insufficient resources

### Database Connection Issues

**Verify connectivity:**
```bash
# Test PostgreSQL connection
psql postgresql://user:password@host:5432/nyra

# Test Redis connection
redis-cli -h host -p 6379 -a password ping
```

**Common solutions:**
- Check connection strings
- Verify firewall rules
- Ensure database is running
- Check credentials

### Performance Issues

**Check resource usage:**
```bash
# Docker stats
docker stats

# Kubernetes metrics
kubectl top pods
kubectl top nodes
```

**Common causes:**
- High CPU usage
- Memory exhaustion
- Disk I/O bottlenecks
- Network saturation

See individual deployment guides for detailed troubleshooting.

## Scaling

### Horizontal Scaling

**Backend Services:**
```bash
# Docker Compose
docker-compose up --scale auth-service=3

# Kubernetes
kubectl scale deployment auth-service --replicas=3
```

**Agent Swarms:**
```javascript
// Scale swarm agents
await swarm.scale({ targetAgents: 20 });
```

### Vertical Scaling

**Increase resources:**
```yaml
# Kubernetes resource limits
resources:
  requests:
    memory: "4Gi"
    cpu: "2000m"
  limits:
    memory: "8Gi"
    cpu: "4000m"
```

### Auto-Scaling

**Configure auto-scaling:**
```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## CI/CD Pipeline

### GitHub Actions Workflow

See `.github/workflows/` for complete CI/CD pipelines:

- `auto-version.yml` - Automatic versioning
- `docker-build.yml` - Docker image builds
- `deploy-staging.yml` - Deploy to staging
- `auto-pr.yml` - Automated pull requests
- `auto-merge.yml` - Automated merging

### Deployment Process

1. **Commit code** - Push to feature branch
2. **Run tests** - Automated testing
3. **Build images** - Docker image creation
4. **Push to registry** - Docker registry
5. **Deploy staging** - Automatic staging deployment
6. **Run E2E tests** - End-to-end testing
7. **Manual approval** - Review before production
8. **Deploy production** - Production deployment
9. **Health checks** - Verify deployment
10. **Monitor** - Watch for issues

## Support & Resources

### Documentation
- [Architecture Overview](../architecture/system-architecture.md)
- [API Documentation](../api/rest-api.md)
- [Services Guide](../../services/README.md)
- [Apps Guide](../../apps/README.md)

### Community
- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and discussions
- Documentation Wiki - Community contributions

### Emergency Contacts
- **On-Call Engineer:** See PagerDuty
- **DevOps Team:** devops@nyra.com
- **Security Issues:** security@nyra.com

## Next Steps

1. Choose your deployment scenario above
2. Follow the appropriate guide step-by-step
3. Verify deployment with health checks
4. Set up monitoring and alerts
5. Configure backups
6. Document any customizations

---

**Last Updated:** January 10, 2026
**Maintained by:** DevOps Team
**Review Schedule:** Quarterly
