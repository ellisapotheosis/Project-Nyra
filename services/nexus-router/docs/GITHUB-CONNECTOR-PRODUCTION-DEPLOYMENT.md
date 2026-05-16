# GitHub Connector Production Deployment Guide

## Overview

This guide covers deploying the GitHub MCP connector for ChatGPT Developer Mode to production. The connector routes GitHub operations through the Nexus Router infrastructure with comprehensive audit logging and security controls.

## Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All tests pass: `npm run test:all`
- [ ] ChatGPT integration tests pass: `npm run test:chatgpt`
- [ ] Audit logging is enabled in configuration
- [ ] CORS headers are properly configured
- [ ] GitHub token has appropriate permissions
- [ ] SSL/TLS certificates are valid
- [ ] Rate limiting is configured
- [ ] Audit log retention policy is defined
- [ ] Backup strategy for audit logs is in place
- [ ] Monitoring and alerting are configured

## Deployment Strategy

### 1. Environment Configuration

#### Required Environment Variables

```bash
# GitHub MCP Configuration
GITHUB_MCP_ENABLED=true
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx    # Personal Access Token
GITHUB_MCP_URL=https://github-mcp.example.com     # GitHub MCP server endpoint
GITHUB_MCP_TIMEOUT=30000                          # Request timeout (ms)
GITHUB_MCP_RETRIES=3                              # Retry attempts

# Audit Logging
MCP_AUDIT_LOGGING_ENABLED=true
MCP_AUDIT_LOG_PATH=/var/log/nexus-router/mcp-audit
MCP_AUDIT_REDACT_SECRETS=true

# MCP Server Configuration
MCP_HOST=0.0.0.0
MCP_PORT=7000
NEXUS_ENV=production

# Cloudflare Tunnel (for ChatGPT integration)
ORCHESTRATOR_TUNNEL_TOKEN=xxxxx                   # Cloudflare tunnel token
CLOUDFLARE_TUNNEL_URL=https://nexus.projectnyra.com

# Service Configuration
LITELLM_BASE_URL=http://litellm:4000
RUVECTOR_SEARCH_URL=http://ruvector-search:3700
REDIS_URL=redis://redis:6379
```

#### Sensitive Configuration

Store sensitive values in a secure configuration management system:
- GitHub Personal Access Token
- Cloudflare tunnel token
- TLS certificates and keys
- Redis authentication credentials

**Never commit these to version control.**

### 2. Docker Deployment

#### Build the Production Image

```bash
# Build from the Nexus Router service
docker build \
  -t nexus-router:github-connector-v1.0 \
  -f services/nexus-router/Dockerfile \
  services/nexus-router/
```

#### Deploy with Docker Compose

```yaml
version: '3.8'

services:
  nexus-router:
    image: nexus-router:github-connector-v1.0
    container_name: nexus-router-mcp
    ports:
      - "7000:7000"
    environment:
      # Core configuration
      NEXUS_ENV: production
      NEXUS_HOST: 0.0.0.0
      NEXUS_PORT: 7000

      # GitHub MCP
      GITHUB_MCP_ENABLED: "true"
      GITHUB_TOKEN: ${GITHUB_TOKEN}
      GITHUB_MCP_URL: ${GITHUB_MCP_URL}
      GITHUB_MCP_TIMEOUT: "30000"
      GITHUB_MCP_RETRIES: "3"

      # Audit Logging
      MCP_AUDIT_LOGGING_ENABLED: "true"
      MCP_AUDIT_LOG_PATH: /var/log/nexus-router/mcp-audit
      MCP_AUDIT_REDACT_SECRETS: "true"

      # Service endpoints
      LITELLM_BASE_URL: http://litellm:4000
      RUVECTOR_SEARCH_URL: http://ruvector-search:3700
      REDIS_URL: redis://redis:6379

      # Cloudflare integration
      ORCHESTRATOR_TUNNEL_TOKEN: ${ORCHESTRATOR_TUNNEL_TOKEN}
      CLOUDFLARE_TUNNEL_URL: ${CLOUDFLARE_TUNNEL_URL}

    volumes:
      - /var/log/nexus-router:/var/log/nexus-router
      - /etc/ssl/certs:/etc/ssl/certs:ro

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    networks:
      - nyra-mcp

    restart: unless-stopped

    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    image: redis:7-alpine
    container_name: nexus-router-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - nyra-mcp
    restart: unless-stopped

networks:
  nyra-mcp:
    driver: bridge

volumes:
  redis-data:
```

#### Deploy to Kubernetes

For Kubernetes deployments, create the following resources:

**ConfigMap for non-sensitive configuration:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nexus-router-config
  namespace: nyra
data:
  NEXUS_ENV: production
  NEXUS_HOST: "0.0.0.0"
  NEXUS_PORT: "7000"
  GITHUB_MCP_TIMEOUT: "30000"
  GITHUB_MCP_RETRIES: "3"
  MCP_AUDIT_LOGGING_ENABLED: "true"
  MCP_AUDIT_LOG_PATH: "/var/log/nexus-router/mcp-audit"
  MCP_AUDIT_REDACT_SECRETS: "true"
  LITELLM_BASE_URL: "http://litellm:4000"
  RUVECTOR_SEARCH_URL: "http://ruvector-search:3700"
  REDIS_URL: "redis://redis:6379"
```

**Secret for sensitive configuration:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nexus-router-secrets
  namespace: nyra
type: Opaque
stringData:
  GITHUB_TOKEN: "${GITHUB_TOKEN}"
  ORCHESTRATOR_TUNNEL_TOKEN: "${ORCHESTRATOR_TUNNEL_TOKEN}"
  CLOUDFLARE_TUNNEL_URL: "${CLOUDFLARE_TUNNEL_URL}"
```

**Deployment:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexus-router
  namespace: nyra
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexus-router
  template:
    metadata:
      labels:
        app: nexus-router
    spec:
      containers:
      - name: nexus-router
        image: nexus-router:github-connector-v1.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 7000
          name: mcp
        envFrom:
        - configMapRef:
            name: nexus-router-config
        - secretRef:
            name: nexus-router-secrets

        volumeMounts:
        - name: audit-logs
          mountPath: /var/log/nexus-router
        - name: ssl-certs
          mountPath: /etc/ssl/certs
          readOnly: true

        livenessProbe:
          httpGet:
            path: /health
            port: 7000
          initialDelaySeconds: 40
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3

        readinessProbe:
          httpGet:
            path: /health
            port: 7000
          initialDelaySeconds: 20
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3

        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

      volumes:
      - name: audit-logs
        emptyDir:
          sizeLimit: 5Gi
      - name: ssl-certs
        secret:
          secretName: ssl-certificates

      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - nexus-router
              topologyKey: kubernetes.io/hostname

---
apiVersion: v1
kind: Service
metadata:
  name: nexus-router
  namespace: nyra
spec:
  type: LoadBalancer
  ports:
  - port: 7000
    targetPort: 7000
    name: mcp
  selector:
    app: nexus-router
```

### 3. Security Considerations

#### GitHub Token Permissions

The GitHub Personal Access Token should have the minimum required permissions:

```
repo
  - repo:status
  - repo_deployment
  - public_repo
  - repo:invite
  - security_events
```

**Never grant:**
- `admin:repo_hook` (without explicit need)
- `admin:org` or `admin:org_hook`
- `user:email` (unless needed)
- `workflow` or `admin:public_key`

#### Network Security

1. **TLS/SSL Enforcement**
   - All external connections must use HTTPS
   - Use valid certificates (not self-signed in production)
   - Enforce TLS 1.2 minimum

2. **CORS Configuration**
   - Restrict to ChatGPT Developer Mode domains only
   - Validate Origin headers
   - Set strict Content Security Policy headers

3. **Rate Limiting**
   - Implement per-client rate limiting (50 requests/minute)
   - Implement per-endpoint rate limiting (GitHub API limits)
   - Track and alert on suspicious patterns

#### Audit Logging Security

1. **Log Storage**
   - Store audit logs on encrypted volumes
   - Use separate storage from application data
   - Implement log rotation (daily, retain 90 days)

2. **Log Access Control**
   - Restrict access to audit logs to security team
   - Implement read-only access after 24 hours
   - Encrypt audit logs in transit and at rest

3. **Sensitive Data Handling**
   - All tokens, keys, and credentials are redacted in logs
   - Personal information (names, emails) is flagged but not redacted
   - Command output is truncated at 5000 characters

### 4. Performance Tuning

#### Resource Allocation

- **CPU**: 250m minimum, 500m recommended
- **Memory**: 256Mi minimum, 512Mi recommended
- **Connection Pool**: 10-20 concurrent connections
- **Request Timeout**: 30 seconds default, configurable per operation

#### Caching Strategy

1. **Redis Caching**
   - Cache tool list responses (1 hour TTL)
   - Cache GitHub API rate limit status (5 minute TTL)
   - Cache authentication tokens (session-based)

2. **HTTP Caching**
   - Set Cache-Control headers for non-write operations
   - Use ETag for tool list responses
   - Implement 304 Not Modified responses

#### Monitoring

Monitor these key metrics:

- **Response Time**: 50th, 95th, 99th percentile latencies
- **Request Rate**: Requests per minute by endpoint
- **Error Rate**: 4xx and 5xx responses by endpoint
- **Tool Usage**: Most/least used GitHub operations
- **Audit Events**: GitHub write operations per day
- **System Health**: Memory usage, CPU usage, disk I/O

### 5. Disaster Recovery

#### Backup Strategy

1. **Audit Logs**
   - Daily backup to S3 or equivalent
   - Retention: 1 year
   - Encryption at rest

2. **Configuration**
   - Version control all configuration files
   - Track environment variable changes
   - Maintain documented rollback procedures

#### Failover

- Deploy multiple replicas for high availability
- Use load balancing to distribute traffic
- Implement health checks with auto-recovery
- Maintain warm standby instances

#### Rollback Procedure

1. Identify issue (via monitoring/alerts)
2. Revert to previous container image
3. Restart affected services
4. Verify health checks pass
5. Monitor for 5-10 minutes
6. Document incident and root cause

### 6. Monitoring and Alerting

#### Key Alerts

Set up alerts for:

- **High Error Rate**: > 5% of requests failing
- **Response Time**: p95 latency > 10 seconds
- **GitHub API Rate Limits**: < 100 requests remaining
- **Disk Space**: Audit logs consuming > 80% of allocated space
- **Authentication Failures**: > 10 failures in 5 minutes
- **Service Unavailability**: Health check failures

#### Logging

- **Application Logs**: info/error/warn levels
- **Access Logs**: all HTTP requests with status codes
- **Audit Logs**: all GitHub write operations
- **Security Logs**: authentication failures, permission denials

### 7. Deployment Checklist

Before going live:

- [ ] All code reviewed and tested
- [ ] Configuration validated in staging
- [ ] TLS certificates installed
- [ ] Audit logging enabled and tested
- [ ] Rate limiting configured
- [ ] Backups configured and tested
- [ ] Monitoring and alerting configured
- [ ] Team trained on operations
- [ ] Runbook created for common issues
- [ ] Incident response plan reviewed

### 8. Post-Deployment Validation

After deployment:

```bash
# Verify service health
curl https://nexus.projectnyra.com/health

# Test MCP initialization
curl -X POST https://nexus.projectnyra.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'

# Check audit logs
tail -f /var/log/nexus-router/mcp-audit/github-operations.jsonl

# Monitor metrics
curl https://nexus.projectnyra.com/metrics | grep nexus
```

### 9. Maintenance Schedule

- **Daily**: Review audit logs for anomalies
- **Weekly**: Check GitHub API rate limit usage
- **Monthly**: Review performance metrics and optimize if needed
- **Quarterly**: Security audit and penetration testing
- **Annually**: Compliance audit and certification renewal

## Troubleshooting

### Common Issues

**Issue**: GitHub token expired
- Solution: Rotate token and update configuration
- Prevention: Set calendar reminder 7 days before expiration

**Issue**: Rate limit exceeded
- Solution: Check for excessive requests, increase rate limits if legitimate
- Prevention: Monitor GitHub API usage, implement backoff strategy

**Issue**: Audit logs growing too large
- Solution: Implement log rotation, archive old logs
- Prevention: Configure log retention policy upfront

**Issue**: Service latency increasing
- Solution: Check memory/CPU usage, increase resources
- Prevention: Monitor trends, scale proactively

## Support and Escalation

For production issues:

1. Check `/health` endpoint
2. Review recent error logs
3. Verify GitHub API status
4. Check network connectivity to dependencies
5. Escalate to infrastructure team if unresolved

## References

- [GitHub MCP Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Nexus Router Configuration Guide](./docs/README.md)
- [Audit Logging Overview](./docs/SECURITY-API.md)
