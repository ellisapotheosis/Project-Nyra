# Backend Services

> 14 microservices powering Project Nyra's intelligent mortgage platform

## Overview

Project Nyra uses a microservices architecture with specialized services for authentication, document processing, mortgage operations, integrations, and more. Each service is independently deployable and communicates via REST APIs and message queues.

## Services List

### Authentication & Security

#### auth-service
- **Port:** 3100
- **Package:** `@nyra/auth-service`
- **Tech:** Express.js, JWT, Passport, Redis
- **Purpose:** Comprehensive authentication and authorization service
- **Features:**
  - JWT authentication with refresh tokens
  - Multi-factor authentication (MFA)
  - OAuth 2.0 (Google, Microsoft)
  - Session management with Redis
  - Rate limiting and security headers
  - Email verification and password reset
  - Role-based access control (RBAC)

**Quick Start:**
```bash
cd services/auth-service
pnpm install
pnpm dev
```

**API Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `POST /auth/mfa/enable` - Enable 2FA
- `POST /auth/password/reset` - Password reset

---

### Document Management

#### doc-management-api
- **Port:** 3200
- **Package:** `@nyra/doc-management-api`
- **Tech:** Express.js, PostgreSQL, S3, OCR
- **Purpose:** Document processing, storage, and classification
- **Features:**
  - Document upload and storage
  - OCR text extraction
  - Document classification (AI-powered)
  - Metadata extraction
  - Version control
  - Access control and sharing
  - Thumbnail generation

**Quick Start:**
```bash
cd services/doc-management-api
pnpm install
pnpm dev
```

**API Endpoints:**
- `POST /documents/upload` - Upload document
- `GET /documents/:id` - Get document
- `PUT /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document
- `POST /documents/:id/analyze` - Run OCR analysis

---

### Lead Management

#### lead-capture-api
- **Port:** 3300
- **Package:** `lead-capture-api`
- **Tech:** Express.js, PostgreSQL, Redis, Bull
- **Purpose:** Lead capture, qualification, and management
- **Features:**
  - Multi-channel lead capture (web, API, webhooks)
  - Lead scoring and qualification
  - Duplicate detection
  - TwentyCRM integration
  - Lead enrichment
  - Email validation
  - Queue-based processing

**Quick Start:**
```bash
cd services/lead-capture-api
pnpm install
pnpm dev
```

**API Endpoints:**
- `POST /leads` - Create lead
- `GET /leads` - List leads
- `GET /leads/:id` - Get lead details
- `PUT /leads/:id` - Update lead
- `POST /leads/:id/qualify` - Run qualification
- `POST /leads/:id/enrich` - Enrich lead data

---

### Mortgage Operations

#### mortgage-assistant-api
- **Port:** 3400
- **Package:** `@nyra/mortgage-assistant-api`
- **Tech:** Express.js, PostgreSQL, Redis
- **Purpose:** Core mortgage processing and calculations
- **Features:**
  - Mortgage application processing
  - Rate calculations
  - Affordability analysis
  - Pre-qualification
  - Document requirements checking
  - Application workflow management
  - Compliance validation

**Quick Start:**
```bash
cd services/mortgage-assistant-api
pnpm install
pnpm dev
```

**API Endpoints:**
- `POST /applications` - Create application
- `GET /applications/:id` - Get application
- `PUT /applications/:id` - Update application
- `POST /applications/:id/calculate` - Calculate rates
- `POST /applications/:id/qualify` - Pre-qualification check

---

### Rate Comparison

#### rate-comparison-engine
- **Port:** 3500
- **Package:** `@nyra/rate-comparison-engine`
- **Tech:** Express.js, PostgreSQL, Redis, Bull
- **Purpose:** Real-time mortgage rate tracking and comparison
- **Features:**
  - Multi-lender rate aggregation
  - Rate change detection
  - Alert notifications
  - Historical rate tracking
  - Rate trend analysis
  - Automated rate updates
  - API integrations with lenders

**Quick Start:**
```bash
cd services/rate-comparison-engine
pnpm install
pnpm dev
```

**API Endpoints:**
- `GET /rates` - Get current rates
- `GET /rates/history` - Historical rates
- `POST /rates/compare` - Compare rates
- `POST /alerts` - Create rate alert
- `GET /alerts/:userId` - Get user alerts

#### ratehunter-api
- **Port:** 3600
- **Package:** `@nyra/ratehunter-api`
- **Tech:** Express.js, PostgreSQL, Redis
- **Purpose:** Public-facing rate comparison API for RateHunter.net
- **Features:**
  - Public rate comparison endpoints
  - Rate search and filtering
  - Lender information
  - Rate calculator
  - Lead generation integration
  - Analytics tracking

**Quick Start:**
```bash
cd services/ratehunter-api
pnpm install
pnpm dev
```

---

### Search & Knowledge

#### ruvector-search
- **Port:** 3700
- **Package:** `@nyra/ruvector-search`
- **Tech:** TypeScript, Qdrant, Embeddings
- **Purpose:** Semantic vector search for documents and knowledge
- **Features:**
  - Vector embeddings generation
  - Semantic similarity search
  - Batch document processing
  - HNSW indexing
  - Hybrid search (vector + keyword)
  - Multi-collection support
  - Real-time indexing

**Quick Start:**
```bash
cd services/ruvector-search
pnpm install
pnpm dev
```

**API Endpoints:**
- `POST /search` - Semantic search
- `POST /index` - Index documents
- `POST /embed` - Generate embeddings
- `DELETE /index/:id` - Remove from index

---

### Integrations

#### twentycrm-integration
- **Port:** 3900
- **Package:** `@nyra/twentycrm-integration`
- **Tech:** TypeScript, PostgreSQL, GraphQL
- **Purpose:** TwentyCRM integration and synchronization
- **Features:**
  - Bidirectional sync
  - Contact management
  - Deal pipeline sync
  - Activity tracking
  - Custom field mapping
  - Webhook handling
  - Conflict resolution

**Quick Start:**
```bash
cd services/twentycrm-integration
pnpm install
pnpm dev
```

#### twilio-integration
- **Port:** 4000
- **Package:** `@nyra/twilio-integration`
- **Tech:** TypeScript, Express.js, Twilio SDK
- **Purpose:** SMS and voice communications
- **Features:**
  - SMS sending and receiving
  - Voice calls
  - Message templates
  - Webhook handlers
  - Status tracking
  - Phone number management
  - Call recording

**Quick Start:**
```bash
cd services/twilio-integration
pnpm install
pnpm dev
```

#### letta-integration
- **Port:** 4100
- **Package:** `@nyra/letta-integration`
- **Tech:** TypeScript, Letta API
- **Purpose:** Agent memory management and persistence
- **Features:**
  - Agent memory storage
  - Long-term memory management
  - Memory search and retrieval
  - Context management
  - Learning trajectory tracking
  - Memory distillation
  - Experience replay

**Quick Start:**
```bash
cd services/letta-integration
pnpm install
pnpm dev
```

---

### Workflow & Automation

#### campaign-engine
- **Port:** 4200
- **Package:** `@nyra/campaign-engine`
- **Tech:** Express.js, PostgreSQL, Bull
- **Purpose:** Marketing campaign automation and execution
- **Features:**
  - Campaign creation and management
  - Email campaigns
  - SMS campaigns
  - Drip campaigns
  - A/B testing
  - Analytics and reporting
  - Trigger-based automation

**Quick Start:**
```bash
cd services/campaign-engine
pnpm install
pnpm dev
```

#### n8n-workflows
- **Port:** 4300
- **Package:** `@nyra/n8n-workflows`
- **Tech:** TypeScript, n8n API
- **Purpose:** Complex workflow automation and integration
- **Features:**
  - Visual workflow builder integration
  - Custom workflow templates
  - External API integrations
  - Scheduled workflows
  - Conditional logic
  - Error handling

**Quick Start:**
```bash
cd services/n8n-workflows
pnpm install
pnpm dev
```

---

### Infrastructure Services

#### nexus-router
- **Port:** 4400
- **MCP Port:** 4401
- **Package:** `@project-nyra/nexus-router`
- **Tech:** Express.js, Redis, Axios
- **Purpose:** Intelligent LLM request routing (Local GPU → Cloud fallback)
- **Features:**
  - Multi-model routing
  - Local GPU worker management
  - Cloud API fallback (Anthropic, OpenRouter)
  - Cost optimization
  - Load balancing
  - Request caching
  - Performance monitoring
  - Model capability matching

**Quick Start:**
```bash
cd services/nexus-router
pnpm install
pnpm dev
```

**API Endpoints:**
- `POST /v1/chat/completions` - OpenAI-compatible chat endpoint
- `POST /v1/completions` - OpenAI-compatible completion endpoint
- `GET /v1/models` - List available models
- `GET /health` - Health check
- `GET /metrics` - Performance metrics

**Configuration:**
```env
NEXUS_ROUTER_PORT=4400
NEXUS_ROUTER_MCP_PORT=4401

# Local GPU Workers
WORKER_5090_URL=http://192.168.1.100:5000
WORKER_5090_MODELS=llama-3.1-70b,mistral-nemo-12b

# Cloud Fallbacks
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

# Routing Strategy
MODEL_ROUTING_STRATEGY=cost-optimized
MODEL_ROUTING_PREFER_LOCAL=true
MODEL_ROUTING_FALLBACK_CLOUD=true
```

#### websocket-hub
- **Port:** 4500
- **Package:** `@nyra/websocket-hub`
- **Tech:** Socket.io, Redis
- **Purpose:** Real-time WebSocket connections and events
- **Features:**
  - Real-time notifications
  - Live updates
  - Chat functionality
  - Presence tracking
  - Room management
  - Message broadcasting
  - Redis pub/sub integration

**Quick Start:**
```bash
cd services/websocket-hub
pnpm install
pnpm dev
```

---

## Port Allocation Table

| Service | HTTP Port | Additional Ports | Package Name |
|---------|-----------|------------------|--------------|
| auth-service | 3100 | - | @nyra/auth-service |
| doc-management-api | 3200 | - | @nyra/doc-management-api |
| lead-capture-api | 3300 | - | lead-capture-api |
| mortgage-assistant-api | 3400 | - | @nyra/mortgage-assistant-api |
| rate-comparison-engine | 3500 | - | @nyra/rate-comparison-engine |
| ratehunter-api | 3600 | - | @nyra/ratehunter-api |
| ruvector-search | 3700 | - | @nyra/ruvector-search |
| graphiti-knowledge | 3800 | - | @nyra/graphiti-knowledge |
| twentycrm-integration | 3900 | - | @nyra/twentycrm-integration |
| twilio-integration | 4000 | - | @nyra/twilio-integration |
| letta-integration | 4100 | - | @nyra/letta-integration |
| campaign-engine | 4200 | - | @nyra/campaign-engine |
| n8n-workflows | 4300 | - | @nyra/n8n-workflows |
| nexus-router | 4400 | 4401 (MCP) | @project-nyra/nexus-router |
| websocket-hub | 4500 | - | @nyra/websocket-hub |

## Infrastructure Dependencies

### Required Services

**Database:**
- PostgreSQL 16 (Port: 5432)
- Redis 7 (Port: 6379)
- FalkorDB (Port: 6380)
- Qdrant (Port: 6333)

**Orchestration:**
- Archon OS (Dynamic port)
- Letta (Ports: 8283, 8284)

## Development Workflow

### Starting All Services

```bash
# Install all dependencies
pnpm install

# Start all services in development mode
pnpm dev

# Start specific service
pnpm --filter @nyra/auth-service dev
```

### Testing Services

```bash
# Run all service tests
pnpm test

# Test specific service
pnpm --filter @nyra/lead-capture-api test

# Run integration tests
pnpm --filter @nyra/lead-capture-api test:integration
```

### Building Services

```bash
# Build all services
pnpm build

# Build specific service
pnpm --filter @nyra/mortgage-assistant-api build
```

## Service Communication

### REST APIs
Services expose RESTful APIs for synchronous communication.

**Example Request:**
```bash
curl -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Message Queues
Services use Redis/RabbitMQ for asynchronous communication.

**Example Queue:**
```typescript
// Producer
await queue.add('process-document', {
  documentId: '123',
  userId: 'abc'
});

// Consumer
queue.process('process-document', async (job) => {
  const { documentId, userId } = job.data;
  // Process document
});
```

### WebSocket Events
Real-time events via websocket-hub.

**Example Event:**
```typescript
// Emit event
io.to(userId).emit('notification', {
  type: 'document-processed',
  documentId: '123'
});

// Listen for event
socket.on('notification', (data) => {
  console.log('Received:', data);
});
```

## Service Dependencies

### Internal Dependencies
```
lead-capture-api
  → twentycrm-integration
  → campaign-engine

mortgage-assistant-api
  → doc-management-api
  → rate-comparison-engine

doc-management-api
  → ruvector-search

All services
  → auth-service (authentication)
  → nexus-router (LLM routing)
  → websocket-hub (real-time updates)
```

### External Dependencies
- **TwentyCRM** - CRM system
- **Twilio** - SMS/Voice
- **Anthropic** - AI Provider
- **OpenRouter** - LLM routing
- **n8n** - Workflow automation
- **Letta** - Agent memory

## Environment Configuration

Each service requires environment variables. Copy `.env.example` to `.env`:

```bash
cd services/auth-service
cp .env.example .env
```

**Common Variables:**
```env
NODE_ENV=development
PORT=3100
DATABASE_URL=postgresql://user:password@localhost:5432/nyra
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

## Monitoring & Logging

### Health Checks
All services expose health check endpoints:
```bash
curl http://localhost:3100/health
```

### Logs
Services use structured logging (Winston/Pino):
```bash
# View logs for specific service
docker logs nyra-auth-service

# Follow logs
docker logs -f nyra-auth-service
```

### Metrics
Prometheus metrics available at `/metrics`:
```bash
curl http://localhost:3100/metrics
```

## Troubleshooting

### Service Won't Start

**Check port conflicts:**
```bash
# Windows
netstat -ano | findstr :3100

# Linux/Mac
lsof -i :3100
```

**Check dependencies:**
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Verify Redis is running
docker ps | grep redis
```

### Database Connection Issues

**Test connection:**
```bash
# Using psql
psql postgresql://user:password@localhost:5432/nyra

# Using redis-cli
redis-cli -h localhost -p 6379 ping
```

### API Request Failures

**Check service logs:**
```bash
cd services/auth-service
pnpm dev
```

**Test with curl:**
```bash
curl -v http://localhost:3100/health
```

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Use Joi, Zod, or similar
3. **Rate limit APIs** - Prevent abuse
4. **Use HTTPS in production** - Encrypt all traffic
5. **Implement CORS properly** - Whitelist allowed origins
6. **Keep dependencies updated** - Regular security patches
7. **Use JWT securely** - Short expiry, refresh tokens
8. **Sanitize database queries** - Prevent SQL injection

## Next Steps

- [Apps Documentation](../apps/README.md) - Frontend applications
- [Deployment Guide](../docs/deployment/README.md) - Production deployment
- [API Documentation](../docs/api/rest-api.md) - Complete API reference
- [Architecture](../docs/architecture/system-architecture.md) - System design

---

**Last Updated:** January 21, 2026

**References:**
- [Architecture Overview](../docs/architecture/ARCHITECTURE-OVERVIEW.md) - Complete system design
- [API Contracts](../docs/architecture/api-contracts.md) - Service interface specifications
- [4-PC Distributed Architecture](../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md) - Deployment architecture
- [Project Whitepaper](../docs/WHITEPAPER.md) - Business case and technical details
