# {{PROJECT_NAME}} - Claude Code Configuration

> {{DESCRIPTION}}
>
> **Tech Stack**: {{TECH_STACK}}
> **Port**: {{PORT}}
> **API Version**: v1

## 🎯 Service Overview

{{PROJECT_NAME}} is a REST API service providing {{DESCRIPTION}}. Built with {{TECH_STACK}} for high performance and scalability.

### Service Goals
- Fast request processing (target: <200ms p95)
- 99.9% uptime
- Complete audit logging
- Comprehensive error handling

## 🚨 AUTOMATIC SWARM ORCHESTRATION

When starting work on API changes, Claude Code MUST automatically:

1. **Initialize the swarm** using CLI tools via Bash
2. **Spawn concurrent agents** (architect, coder, tester, reviewer)
3. **Coordinate via hooks** and memory

### 🚨 CRITICAL: CLI + Task Tool in SAME Message

**When user requests API changes:**
1. Call CLI tools via Bash to initialize coordination
2. **IMMEDIATELY** call Task tool to spawn REAL working agents
3. Both CLI and Task calls must be in the SAME response

## 📊 API Endpoints

### Core Endpoints

```
GET    /health                 # Health check
POST   /{{REPO_PATH}}/create    # Create resource
GET    /{{REPO_PATH}}/:id       # Retrieve resource
PUT    /{{REPO_PATH}}/:id       # Update resource
DELETE /{{REPO_PATH}}/:id       # Delete resource
GET    /{{REPO_PATH}}           # List resources
```

### Response Format

```json
{
  "status": "success",
  "data": {},
  "meta": {
    "timestamp": "2026-01-22T14:45:30Z",
    "request_id": "req-123456"
  },
  "errors": []
}
```

## 🏗️ Architecture

### Service Structure
```
{{PROJECT_NAME}}/
├── src/
│   ├── main.py              # Entry point (FastAPI/NestJS)
│   ├── routes/              # API route handlers
│   ├── models/              # Data models
│   ├── services/            # Business logic
│   ├── middleware/          # Request middleware
│   ├── utils/               # Utilities
│   └── config/              # Configuration
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── e2e/               # End-to-end tests
│   └── fixtures/          # Test data
├── docs/
│   ├── api.md             # API documentation
│   ├── examples/          # API examples
│   └── schemas/           # OpenAPI schemas
└── docker/
    └── Dockerfile         # Container configuration
```

### Dependencies ({{TECH_STACK}})
- Framework: FastAPI/NestJS
- Async: asyncio/RxJS
- Validation: Pydantic/class-validator
- Testing: pytest/Jest
- Logging: structlog/Winston

## 🔄 Swarm Pattern for API Changes

### For API Feature Implementation
```bash
# 1. Initialize swarm
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 6

# 2. Spawn agents (architect → coder → tester → reviewer)
# - Architect: Design API endpoint structure
# - Coder: Implement endpoint handlers
# - Tester: Write integration tests
# - Reviewer: Code quality and security checks
```

### For Bug Fixes
```bash
# Route to correct team
npx @archon-os/cli@latest hooks pre-task --description "API endpoint bug"
# Likely response: Use Haiku model, coder + tester agents
```

## 🧠 Memory Integration

Store and retrieve API patterns:

```bash
# Store API pattern
npx @archon-os/cli@latest memory store \
  --key "{{PROJECT_NAME}}-endpoint-pattern" \
  --value "Endpoint implementation approach" \
  --namespace api-patterns

# Search for similar patterns
npx @archon-os/cli@latest memory search \
  --query "error handling in API endpoints"
```

## 📁 File Organization Rules

**CRITICAL**: Never save working files to root folder

**Proper locations:**
- `/src` - Source code files
- `/tests` - Test files
- `/docs` - API documentation
- `/config` - Configuration files
- `/scripts` - Utility scripts
- `/docker` - Container files

## Error Handling

### Response Status Codes
```
200 OK              - Successful request
201 Created         - Resource created
204 No Content      - Successful, no response body
400 Bad Request     - Invalid input
401 Unauthorized    - Authentication failed
403 Forbidden       - Permission denied
404 Not Found       - Resource not found
409 Conflict        - Resource conflict
422 Unprocessable   - Validation failed
429 Too Many        - Rate limit exceeded
500 Internal Error  - Server error
503 Service Down    - Service unavailable
```

### Error Response Format
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "request_id": "req-123456"
}
```

## 🔐 Security Considerations

- Input validation (all endpoints)
- Rate limiting (prevent abuse)
- Authentication/Authorization
- CORS configuration
- HTTPS enforcement
- Request ID tracking
- Audit logging

### For Mortgage APIs
- TILA/RESPA disclosure validation
- Anti-steering enforcement
- Fair lending law compliance
- State-specific regulations
- PII encryption (SSN, account numbers)
- Complete audit trail

## 📊 Performance Targets

| Metric | Target | Monitoring |
|--------|--------|------------|
| Response time (p95) | <200ms | Prometheus |
| Throughput | >1000 req/s | Metrics |
| Error rate | <0.1% | Alerting |
| Availability | 99.9% | Uptime monitor |
| Memory per process | <500MB | Resource monitor |

## 🧪 Testing Strategy

### Test Types
```bash
# Unit tests (isolated components)
npm test -- unit

# Integration tests (API endpoints)
npm test -- integration

# End-to-end tests (full workflows)
npm test -- e2e

# All with coverage
npm run test:coverage
```

### Coverage Targets
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## 📈 Monitoring & Logging

### Key Metrics
- Request rate (req/s)
- Response time (p50, p95, p99)
- Error rate (errors/req)
- Queue depth
- Memory usage
- CPU usage

### Logging Strategy
```python
# Structured logging with context
logger.info("api_request", {
  "method": "POST",
  "path": "/quotes",
  "status": 201,
  "duration_ms": 145,
  "request_id": "req-123"
})
```

## 🔄 Development Workflow

### 1. Before Implementation
```bash
# Search for similar patterns
npx @archon-os/cli@latest memory search --query "API endpoint implementation"

# Get routing recommendation
npx @archon-os/cli@latest hooks pre-task --description "Add new API endpoint"
```

### 2. Implementation
- Design endpoint structure
- Define request/response schemas
- Implement route handler
- Add error handling
- Write tests

### 3. After Implementation
```bash
# Store pattern in memory
npx @archon-os/cli@latest memory store \
  --key "{{PROJECT_NAME}}-endpoint-{{METHOD}}" \
  --value "Implementation details" \
  --namespace api-patterns

# Record task completion
npx @archon-os/cli@latest hooks post-task --task-id "[id]" --success true
```

## 📝 API Documentation

### OpenAPI/Swagger
Auto-generated documentation at: `GET /docs` or `GET /swagger`

### Example Request
```bash
curl -X POST http://localhost:{{PORT}}/{{REPO_PATH}} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "field": "value"
  }'
```

### Example Response
```json
{
  "status": "success",
  "data": {
    "id": "123",
    "created_at": "2026-01-22T14:45:30Z"
  }
}
```

## 🚀 Deployment

### Docker Build
```bash
docker build -t {{PROJECT_NAME}}:latest .
docker run -p {{PORT}}:{{PORT}} {{PROJECT_NAME}}:latest
```

### Health Check
```bash
curl http://localhost:{{PORT}}/health
```

## 🧠 Multi-Agent Coordination

For complex API changes:

```bash
# Initialize swarm for feature
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 6

# Architecture phase (architect agent)
Task({
  prompt: "Design endpoint structure with error handling",
  subagent_type: "system-architect",
  run_in_background: true
})

# Implementation phase (coder agent)
Task({
  prompt: "Implement endpoints following design",
  subagent_type: "coder",
  run_in_background: true
})

# Testing phase (tester agent)
Task({
  prompt: "Write integration and e2e tests",
  subagent_type: "tester",
  run_in_background: true
})

# Review phase (reviewer agent)
Task({
  prompt: "Code review, security, performance check",
  subagent_type: "reviewer",
  run_in_background: true
})
```

## Troubleshooting

### Endpoint Returns 500
1. Check logs: `docker logs {{PROJECT_NAME}}`
2. Verify database connection
3. Check external service dependencies
4. Review request payload

### Performance Degradation
1. Check memory usage: `docker stats`
2. Review slow query logs
3. Check rate limiting configuration
4. Analyze request patterns

### Auth/Permission Issues
1. Verify token validity
2. Check user permissions
3. Review CORS configuration
4. Validate request headers

## Quick Reference

```bash
# Start service
npm start

# Run tests
npm test

# Build Docker image
docker build -t {{PROJECT_NAME}} .

# Deploy to production
docker push registry/{{PROJECT_NAME}}:latest

# View logs
docker logs {{PROJECT_NAME}} -f

# Health check
curl http://localhost:{{PORT}}/health
```

## Supporting Documentation

- **Project Root**: `CLAUDE.md` - Overall architecture
- **Claude Flow**: `.archon-os/CAPABILITIES.md` - V3 reference
- **API Schema**: `docs/api.md` - Complete API documentation
- **Performance**: `.archon-os/metrics/` - Performance dashboards

## Version

Created: {{DATE}}
Service: {{PROJECT_NAME}}
Port: {{PORT}}
Architecture: Claude Flow V3
Last Updated: {{TIMESTAMP}}
