# CLAUDE.md Template - API Service with MCP Integration

Specialized template for building RESTful/GraphQL APIs with MCP tool integration.

## Template Metadata
- Type: API Service
- Complexity: Intermediate
- Team Size: Small to Medium (3-8)
- Architecture: Microservice with external integrations
- Use Case: Public API, internal service mesh API, GraphQL gateway

## Template Content

```markdown
# API Service Configuration - [API Name]

## API Overview

### Service Details
- API Name: [name]
- API Version: [1.0.0]
- Base URL: [production/development URL]
- Documentation: [Swagger/OpenAPI link]
- Support: [support email/Slack channel]

### Technology Stack
- Framework: [Express/FastAPI/etc]
- Language: [TypeScript/Python/etc]
- Database: [PostgreSQL/MongoDB/etc]
- Cache: [Redis/Memcached]
- Authentication: [JWT/OAuth2/API Keys]

## API Design

### Core Endpoints
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /api/v1/...` - Main API paths
- `POST /webhook` - Webhook receiver (if applicable)

### Request/Response Format
- Content-Type: application/json
- Request validation: Zod/Joi schemas
- Response envelope: [standard/custom]
- Error format: RFC 7807 Problem Details

### Rate Limiting
- Global rate limit: [requests/minute]
- Per-user limit: [requests/minute]
- Burst limit: [requests/second]
- Rate limit headers: X-RateLimit-*

## Authentication & Security

### Authentication Methods
- JWT: Short-lived access tokens + refresh tokens
- API Keys: For service-to-service
- OAuth2: For third-party integrations
- mTLS: For internal services

### Authorization
- Role-based access control (RBAC)
- Scope-based permissions
- Resource ownership validation
- Admin bypass: [rules for admin access]

### Security Headers
- CORS: [allowed origins]
- CSP: [content security policy]
- X-Frame-Options: DENY
- Strict-Transport-Security: max-age=31536000
- X-Content-Type-Options: nosniff

## MCP Tool Integration

### Required MCP Servers
- Tool Name: [Purpose]
  - Authentication: [method]
  - Rate limits: [limits]
  - Error handling: [strategy]
  - Retry policy: [exponential backoff]

### Example: Database MCP
```javascript
const dbMcp = await initializeMCP('database', {
  connection: process.env.DATABASE_URL,
  maxConnections: 20,
  timeout: 5000
});
```

### Example: External API MCP
```javascript
const apiMcp = await initializeMCP('github-mcp', {
  auth: process.env.GITHUB_TOKEN,
  baseUrl: 'https://api.github.com',
  timeout: 10000
});
```

## Data Management

### Database Schema
- Migration tool: [Flyway/Alembic]
- Schema versioning: Git-based
- Backup strategy: Daily + on-demand
- Recovery procedure: [documented]

### Caching Strategy
- Cache key prefix: [service-name]
- TTL values: [by data type]
- Invalidation triggers: [events]
- Cache warming: [on startup]

## API Documentation

### OpenAPI/Swagger
- Specification: [OpenAPI 3.0.0]
- Generation: Automated from code
- Hosting: [Swagger UI/ReDoc]
- Export format: [JSON/YAML]

### Example Endpoint Documentation
```yaml
/api/v1/users/{id}:
  get:
    summary: Get user by ID
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
    responses:
      200:
        description: User found
      404:
        description: User not found
      401:
        description: Unauthorized
```

## Error Handling & Status Codes

### Success Responses
- 200 OK: Successful GET/PUT
- 201 Created: Successful POST
- 204 No Content: Successful DELETE

### Client Errors
- 400 Bad Request: Validation error
- 401 Unauthorized: Missing/invalid auth
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource doesn't exist
- 409 Conflict: State conflict/duplicate
- 429 Too Many Requests: Rate limited

### Server Errors
- 500 Internal Server Error: Unhandled exception
- 502 Bad Gateway: MCP service unavailable
- 503 Service Unavailable: Maintenance/overload
- 504 Gateway Timeout: MCP timeout

## Testing Strategy

### Unit Tests
- Coverage target: 80%+
- Framework: [Jest/Pytest]
- Isolation: Mock external dependencies
- Command: `npm test`

### Integration Tests
- Test with actual MCP services
- Use test database
- Test error scenarios
- Run: `npm run test:integration`

### API Tests
- Automated endpoint testing
- Contract testing with consumers
- Load testing: [k6/Locust]
- Security testing: OWASP Top 10

### Test Examples
```javascript
describe('GET /api/v1/users/:id', () => {
  test('returns user with valid ID', async () => {
    const res = await request(app).get('/api/v1/users/123');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', '123');
  });

  test('returns 404 for missing user', async () => {
    const res = await request(app).get('/api/v1/users/nonexistent');
    expect(res.status).toBe(404);
  });
});
```

## Monitoring & Observability

### Logging
- Format: JSON structured logs
- Fields: timestamp, level, service, traceId, message
- Levels: DEBUG, INFO, WARN, ERROR
- Destination: [CloudWatch/ELK/Datadog]

### Metrics
- Request count: by method, path, status
- Request latency: p50, p95, p99
- Error rate: by type and endpoint
- Custom metrics: [business KPIs]

### Tracing
- Distributed tracing: [Jaeger/Datadog]
- Trace context propagation: W3C Trace Context
- Sampling rate: [1% in prod]
- Span naming: [service:operation]

### Alerting
- High error rate: > 1% of requests
- High latency: p99 > [threshold]ms
- Service down: health check fails
- Rate limit exhaustion: on key services

## Deployment

### Container Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### Environment Configuration
- Development: Local values, verbose logging
- Staging: Production-like, limited traffic
- Production: Optimized, monitored, auto-scaling

### Kubernetes Deployment
- Image: [registry/image:tag]
- Replicas: [min/max]
- Resource limits: CPU/Memory
- Probes: Liveness, readiness
- Ingress: [host/TLS]

## Performance Optimization

### Response Time Targets
- p50: < 50ms
- p95: < 200ms
- p99: < 1000ms

### Optimization Techniques
- Database query optimization: Use indices, limit N+1
- Connection pooling: Reuse connections
- Response compression: gzip for large payloads
- Caching: HTTP caching headers, Redis
- CDN: For static assets

## Versioning Strategy

### API Versioning
- Version in path: `/api/v1/`, `/api/v2/`
- Version deprecation: 12-month notice
- Backward compatibility: [policy]
- Breaking changes: [communication plan]

## Disaster Recovery

### Backup Strategy
- Database backups: Daily + hourly incremental
- Configuration backups: Git-based
- Backup testing: Monthly
- Recovery RTO: [recovery time]

### Failover Plan
- Active-passive setup: [details]
- Circuit breaker: Failure thresholds
- Fallback behavior: [degraded mode]

## Integration with Claude Flow V3

### Swarm Coordination
- When to spawn agents: On deployment, error surge
- Topology: Hierarchical for APIs
- Coordinator role: API gateway
- Worker roles: Service instances

### Memory & Learning
- Store API patterns: Usage statistics
- Learn from failures: Error patterns
- Optimize: Caching, indexing recommendations
- Predict: Load forecasting

### Automated Testing
- Hook on deployment: Run full suite
- Hook on errors: Trigger incident investigation
- Hook on performance: Auto-scaling decisions

---
**Template Version**: 1.0
**Last Updated**: 2026-01-22
**Maintained By**: [Your Team]
```

## When to Use This Template

- Building public REST APIs
- Creating GraphQL gateways
- Implementing service mesh APIs
- Integrating multiple MCP tools
- API-first application architecture

## Customization Examples

**For Database-Heavy APIs**: Expand data management section with specific schema, migration examples

**For Real-time APIs**: Add WebSocket/SSE configuration, message queue integration

**For AI-Powered APIs**: Add LLM integration, token counting, rate limiting by model

**For Marketplace APIs**: Add multi-tenant support, subscription handling, payment integration

