# {{PROJECT_NAME}} Service - Claude Code Configuration

> {{DESCRIPTION}}
>
> **Tech Stack**: {{TECH_STACK}}
> **Type**: Background Service
> **Namespace**: {{NAMESPACE}}

## 🎯 Service Overview

{{PROJECT_NAME}} is a long-running background service responsible for {{DESCRIPTION}}. It operates continuously, processing tasks asynchronously and maintaining system health through monitoring and logging.

### Service Characteristics
- Runs continuously in background
- Processes asynchronous tasks/jobs
- Monitors system health
- Handles graceful shutdown
- Maintains persistent state
- Recovers from failures automatically

## 🚨 AUTOMATIC SWARM ORCHESTRATION

For service modifications, Claude Code MUST:

1. **Initialize swarm** for coordination
2. **Spawn specialized agents** (architect for design, coder for implementation)
3. **Use memory** to track service patterns

### Service Changes Routing
```bash
# Get optimal routing for service changes
npx @claude-flow/cli@latest hooks pre-task --description "{{PROJECT_NAME}} service modification"
```

## 🏗️ Service Architecture

### Directory Structure
```
{{PROJECT_NAME}}/
├── src/
│   ├── main.ts              # Entry point
│   ├── config/              # Configuration
│   ├── services/            # Business logic
│   ├── workers/             # Job workers
│   ├── middleware/          # Middleware
│   ├── utils/               # Utilities
│   ├── database/            # DB operations
│   └── types/               # Type definitions
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Service tests
│   └── e2e/               # Full workflow tests
├── docker/
│   ├── Dockerfile         # Container config
│   └── docker-compose.yml # Compose config
├── scripts/
│   ├── migrate.js         # Database migrations
│   ├── seed.js            # Data seeding
│   └── health-check.js    # Health verification
└── monitoring/
    ├── metrics.json       # Prometheus metrics
    └── alerts.json        # Alert rules
```

### Core Dependencies ({{TECH_STACK}})
- Runtime: Node.js/Python runtime
- Task Queue: Bull/Celery
- Database: PostgreSQL/MongoDB
- Caching: Redis
- Logging: Winston/structlog
- Monitoring: Prometheus

## 🔄 Service Lifecycle

### 1. Initialization
```typescript
// Initialize service connections
- Connect to database
- Connect to message queue
- Load configuration
- Initialize caches
- Start monitoring
```

### 2. Running
```typescript
// Main service loop
- Listen for incoming jobs/events
- Process tasks concurrently
- Update state in database
- Emit events
- Track metrics
```

### 3. Graceful Shutdown
```typescript
// Clean shutdown on SIGTERM
- Stop accepting new jobs
- Wait for in-flight jobs to complete (timeout: 30s)
- Close database connections
- Flush logs
- Exit with code 0
```

## 📊 Job Processing

### Job Types
```typescript
interface Job {
  id: string;
  type: "process_data" | "send_notification" | "cleanup" | string;
  priority: "low" | "normal" | "high" | "critical";
  payload: Record<string, any>;
  retries: number;
  max_retries: number;
  scheduled_at?: Date;
  completed_at?: Date;
}
```

### Processing Pattern
```
1. Receive job from queue
2. Validate payload
3. Acquire lock (prevent duplicate processing)
4. Execute job handler
5. Update job status
6. Release lock
7. Emit completion event
8. Handle errors and retries
```

## 🛡️ Error Handling & Retries

### Retry Strategy
```javascript
{
  max_retries: 5,
  backoff_type: "exponential",
  initial_delay: 1000,      // 1 second
  max_delay: 60000,         // 60 seconds
  backoff_multiplier: 2
}
```

### Error Categories
- **Transient**: Retry immediately
- **Permanent**: Log and skip
- **Unknown**: Retry with backoff
- **Rate Limit**: Exponential backoff

### Dead Letter Queue (DLQ)
```javascript
{
  condition: "max_retries_exceeded || failed_permanently",
  destination: "{{PROJECT_NAME}}-dlq",
  retention: "30 days",
  processing: "manual_review_required"
}
```

## 📈 Monitoring & Health

### Health Check Endpoint
```bash
GET http://localhost:3000/health

Response:
{
  "status": "healthy",
  "uptime": 3600,
  "jobs_processed": 1250,
  "queue_depth": 45,
  "memory_mb": 256,
  "db_connected": true,
  "last_check": "2026-01-22T14:45:30Z"
}
```

### Key Metrics
```prometheus
# Queue metrics
{{PROJECT_NAME}}_job_queue_depth
{{PROJECT_NAME}}_job_processing_duration_ms
{{PROJECT_NAME}}_job_success_rate

# System metrics
{{PROJECT_NAME}}_memory_bytes
{{PROJECT_NAME}}_cpu_percent
{{PROJECT_NAME}}_uptime_seconds

# Business metrics
{{PROJECT_NAME}}_jobs_processed_total
{{PROJECT_NAME}}_jobs_failed_total
{{PROJECT_NAME}}_processing_backlog
```

### Alerting Rules
```yaml
alerts:
  - name: HighQueueDepth
    condition: queue_depth > 1000
    severity: warning

  - name: ServiceDown
    condition: health_check_fails > 3
    severity: critical

  - name: HighErrorRate
    condition: error_rate > 5%
    severity: warning

  - name: MemoryLeak
    condition: memory_trend_increase > 50MB/hour
    severity: critical
```

## 🔄 Memory & State Management

### Persistent State
```bash
# Store service state in memory system
npx @claude-flow/cli@latest memory store \
  --key "{{PROJECT_NAME}}-state" \
  --value "Current service metrics" \
  --namespace {{NAMESPACE}}-services

# Retrieve state for recovery
npx @claude-flow/cli@latest memory retrieve \
  --key "{{PROJECT_NAME}}-state" \
  --namespace {{NAMESPACE}}-services
```

### Session Recovery
```typescript
// On startup, recover incomplete jobs
const incompleteJobs = await db.query(
  "SELECT * FROM jobs WHERE status = 'processing' AND updated_at < NOW() - INTERVAL 5 minutes"
);

// Re-queue for processing
for (const job of incompleteJobs) {
  await queue.add(job, { priority: "high" });
}
```

## 🧪 Testing Strategy

### Test Levels

**Unit Tests** (individual functions)
```bash
npm test -- unit --coverage
```

**Integration Tests** (service components)
```bash
npm test -- integration
# Tests: job processing, queue operations, DB operations
```

**End-to-End Tests** (full workflows)
```bash
npm test -- e2e
# Tests: complete job lifecycle, error recovery, scaling
```

### Coverage Targets
- Statements: >85%
- Branches: >80%
- Functions: >85%
- Lines: >85%

## 📁 File Organization

**CRITICAL**: Never save working files to root folder

**Proper locations:**
- `/src` - Source code
- `/tests` - Test files
- `/docker` - Container files
- `/scripts` - Utility scripts
- `/monitoring` - Metrics and alerts
- `/docs` - Documentation

## 🚀 Deployment

### Docker Build
```bash
# Build image
docker build -t {{PROJECT_NAME}}:latest -f docker/Dockerfile .

# Run locally
docker run -d \
  --name {{PROJECT_NAME}} \
  -e LOG_LEVEL=info \
  -e DB_URL=postgres://... \
  -e REDIS_URL=redis://... \
  {{PROJECT_NAME}}:latest

# View logs
docker logs {{PROJECT_NAME}} -f
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{PROJECT_NAME}}
  namespace: {{NAMESPACE}}
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: {{PROJECT_NAME}}
        image: {{PROJECT_NAME}}:latest
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

## 🔄 Swarm Coordination

For complex service changes:

```bash
# Initialize swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 5

# Architect designs service changes
Task({
  prompt: "Design {{PROJECT_NAME}} service modifications",
  subagent_type: "system-architect",
  run_in_background: true
})

# Coder implements changes
Task({
  prompt: "Implement service changes following design",
  subagent_type: "coder",
  run_in_background: true
})

# Tester writes tests
Task({
  prompt: "Write integration tests for service",
  subagent_type: "tester",
  run_in_background: true
})

# Reviewer checks quality
Task({
  prompt: "Review code and performance impact",
  subagent_type: "reviewer",
  run_in_background: true
})
```

## 🧠 Memory Integration

Store service patterns and learnings:

```bash
# Store deployment pattern
npx @claude-flow/cli@latest memory store \
  --key "{{PROJECT_NAME}}-deployment" \
  --value "Deployment procedure and gotchas" \
  --namespace {{NAMESPACE}}-services

# Search for troubleshooting patterns
npx @claude-flow/cli@latest memory search \
  --query "service stuck in processing loop"
```

## Configuration Management

### Environment Variables
```bash
# Required
DB_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
LOG_LEVEL=info

# Optional
QUEUE_CONCURRENCY=10
JOB_TIMEOUT_MS=30000
HEALTH_CHECK_INTERVAL=5000
```

### Configuration File
```yaml
# config/default.yml
service:
  name: {{PROJECT_NAME}}
  port: 3000

queue:
  concurrency: 10
  max_retries: 5

database:
  pool_size: 20

logging:
  level: info
  format: json
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Job processing latency (p95) | <5s |
| Queue depth during normal load | <100 jobs |
| Memory usage | <500MB |
| CPU usage | <50% |
| Success rate | >99.5% |
| MTTR (recovery time) | <5 minutes |

## Troubleshooting

### Queue Backed Up
1. Check job complexity
2. Increase concurrency
3. Add more worker instances
4. Review slow job logs

### Memory Leak
1. Check job handler memory usage
2. Review database connection pooling
3. Look for unclosed resources
4. Profile with Node inspector

### Jobs Stuck Processing
1. Check logs for errors
2. Verify database connectivity
3. Review timeout settings
4. Clear stuck jobs from database

### High Error Rate
1. Check external service dependencies
2. Review error logs for patterns
3. Check rate limiting
4. Verify configuration

## Quick Reference

```bash
# Start service
npm start

# Development with auto-reload
npm run dev

# Run tests
npm test

# Check health
curl http://localhost:3000/health

# View queue status
npm run queue:status

# Clear stuck jobs
npm run queue:clear-stuck

# View logs
docker logs {{PROJECT_NAME}} -f --tail 100
```

## Documentation References

- **Project Root**: `CLAUDE.md` - Overall system architecture
- **Claude Flow**: `.claude-flow/CAPABILITIES.md` - V3 reference
- **Monitoring**: `monitoring/README.md` - Metrics and alerts
- **Database**: `scripts/migrations/` - Schema documentation

## Version

Created: {{DATE}}
Service: {{PROJECT_NAME}}
Type: Background Service
Namespace: {{NAMESPACE}}
Architecture: Claude Flow V3
Last Updated: {{TIMESTAMP}}
