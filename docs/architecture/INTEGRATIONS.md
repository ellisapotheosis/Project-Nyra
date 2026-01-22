# Project Nyra - Integration Architecture

**Version**: 2.0.0
**Date**: 2026-01-21
**Status**: Production Ready
**Integration Pattern**: MCP Protocol + REST APIs

---

## Table of Contents

1. [MCP Server Ecosystem](#mcp-server-ecosystem)
2. [External Service Integrations](#external-service-integrations)
3. [API Contracts & Specifications](#api-contracts--specifications)
4. [Communication Patterns](#communication-patterns)
5. [Authentication & Authorization](#authentication--authorization)
6. [Integration Testing](#integration-testing)
7. [Error Handling & Retry Logic](#error-handling--retry-logic)
8. [Rate Limiting & Quotas](#rate-limiting--quotas)

---

## MCP Server Ecosystem

### Overview

Model Context Protocol (MCP) servers provide tool interfaces for AI agents. Nexus Router aggregates all MCP servers into a single unified gateway at **port 6000**.

```mermaid
graph TD
    CLIENT[Claude / AI Agents] --> NEXUS[Nexus Router :6000]

    NEXUS --> CF[Claude Flow MCP :3010]
    NEXUS --> ARCHON[Archon OS MCP :9001]
    NEXUS --> SERENA[Serena MCP :8086]
    NEXUS --> GEMINI[Gemini Assistant :8085]
    NEXUS --> MEM0[Mem0 MCP :4321]
    NEXUS --> GRAPHITI[Graphiti MCP]
    NEXUS --> AGENTDB[AgentDB :8080]
    NEXUS --> RUV[RuVector :8888]
    NEXUS --> COMPOSIO[Composio MCP]
    NEXUS --> GITHUB[GitHub MCP]
    NEXUS --> FS[Filesystem MCP]
    NEXUS --> INFISICAL[Infisical MCP :8082]

    CF --> POSTGRES[(PostgreSQL)]
    CF --> REDIS[(Redis)]
    MEM0 --> REDIS
    GRAPHITI --> NEO4J[(Neo4j)]
    AGENTDB --> QDRANT[(Qdrant)]
```

---

### Core MCP Servers

#### 1. Claude Flow MCP (Port 3010)

**Purpose**: Multi-agent swarm orchestration, SPARC methodology

**Capabilities**:
- Swarm initialization (mesh, hierarchical, ring, star)
- Agent spawning and lifecycle management
- Task routing and coordination
- Neural pattern training
- Session persistence and restoration
- GitHub integration
- Hooks system automation

**MCP Tools**:
```json
{
  "tools": [
    {
      "name": "swarm_init",
      "description": "Initialize agent swarm with topology",
      "parameters": {
        "topology": ["mesh", "hierarchical", "ring", "star"],
        "max_agents": "number",
        "strategy": ["balanced", "specialized", "adaptive"]
      }
    },
    {
      "name": "agent_spawn",
      "description": "Spawn specialized agent in swarm",
      "parameters": {
        "type": ["researcher", "coder", "analyst", "optimizer", "coordinator"],
        "capabilities": "array"
      }
    },
    {
      "name": "task_orchestrate",
      "description": "Orchestrate complex task across agents",
      "parameters": {
        "task": "string",
        "strategy": ["parallel", "sequential", "adaptive"],
        "max_agents": "number"
      }
    },
    {
      "name": "session_save",
      "description": "Save current session state"
    },
    {
      "name": "session_restore",
      "description": "Restore previous session",
      "parameters": {
        "session_id": "string"
      }
    }
  ]
}
```

**Integration Example**:
```bash
# Via Nexus Router
curl -X POST http://localhost:6000/mcp/claude-flow/swarm_init \
  -H "Content-Type: application/json" \
  -d '{
    "topology": "hierarchical",
    "max_agents": 8,
    "strategy": "specialized"
  }'
```

---

#### 2. Archon OS MCP (Port 9001)

**Purpose**: Task queue management, workflow execution, integration hub

**Capabilities**:
- Task queue with priority scheduling
- Workflow template execution
- Event-driven automation
- Integration with external services (Twilio, n8n, CRM)
- Long-running task coordination
- Cross-orchestrator agent sharing

**MCP Tools**:
```json
{
  "tools": [
    {
      "name": "task_create",
      "description": "Create task in queue",
      "parameters": {
        "title": "string",
        "description": "string",
        "priority": ["low", "medium", "high", "critical"],
        "assigned_to": "string"
      }
    },
    {
      "name": "workflow_execute",
      "description": "Execute workflow template",
      "parameters": {
        "template_id": "string",
        "input_data": "object"
      }
    },
    {
      "name": "integration_call",
      "description": "Call external integration",
      "parameters": {
        "service": "string",
        "endpoint": "string",
        "method": "string",
        "data": "object"
      }
    }
  ]
}
```

---

#### 3. Serena MCP (Port 8086)

**Purpose**: Codebase analysis, semantic code search, security scanning

**Capabilities**:
- AST parsing and dependency graphs
- Vector-based code search (Qdrant integration)
- Security vulnerability scanning
- Code complexity analysis
- Refactoring suggestions
- Documentation generation

**MCP Tools**:
```json
{
  "tools": [
    {
      "name": "code_analyze",
      "description": "Analyze codebase structure",
      "parameters": {
        "path": "string",
        "language": "string"
      }
    },
    {
      "name": "code_search",
      "description": "Semantic code search",
      "parameters": {
        "query": "string",
        "filters": "object"
      }
    },
    {
      "name": "security_scan",
      "description": "Scan for vulnerabilities",
      "parameters": {
        "path": "string",
        "severity": ["low", "medium", "high", "critical"]
      }
    }
  ]
}
```

---

#### 4. Gemini Assistant MCP (Port 8085)

**Purpose**: Cost-efficient LLM inference via Google Gemini API

**Capabilities**:
- Gemini Pro & Vision models
- Multimodal analysis (text + images)
- Code generation assistance
- Document classification
- Lead scoring
- Status updates

**MCP Tools**:
```json
{
  "tools": [
    {
      "name": "gemini_generate",
      "description": "Generate text with Gemini",
      "parameters": {
        "prompt": "string",
        "model": ["gemini-2.0-flash", "gemini-2.0-pro"],
        "max_tokens": "number"
      }
    },
    {
      "name": "gemini_vision",
      "description": "Analyze image with Gemini Vision",
      "parameters": {
        "image_url": "string",
        "prompt": "string"
      }
    }
  ]
}
```

---

#### 5. Mem0 MCP (Port 4321)

**Purpose**: Universal episodic memory for personalization and context

**Capabilities**:
- User personalization and preferences
- Long-term conversation memory
- Pattern recognition and learning
- Preference management
- Context summaries
- Memory search and retrieval

**MCP Tools**:
```json
{
  "tools": [
    {
      "name": "memory_store",
      "description": "Store memory entry",
      "parameters": {
        "user_id": "string",
        "content": "string",
        "metadata": "object"
      }
    },
    {
      "name": "memory_search",
      "description": "Search user memories",
      "parameters": {
        "user_id": "string",
        "query": "string",
        "limit": "number"
      }
    },
    {
      "name": "memory_delete",
      "description": "Delete user memory",
      "parameters": {
        "user_id": "string",
        "memory_id": "string"
      }
    }
  ]
}
```

---

#### 6. Graphiti MCP

**Purpose**: Temporal knowledge graphs for relationship tracking

**Capabilities**:
- Entity extraction and relationship mapping
- Time-based queries
- Graph analytics
- Knowledge graph construction
- Temporal reasoning
- Graph visualization

**MCP Tools**:
```json
{
  "tools": [
    {
      "name": "graph_add_entity",
      "description": "Add entity to knowledge graph",
      "parameters": {
        "entity_type": "string",
        "properties": "object"
      }
    },
    {
      "name": "graph_add_relationship",
      "description": "Add relationship between entities",
      "parameters": {
        "from_entity": "string",
        "to_entity": "string",
        "relationship_type": "string",
        "properties": "object"
      }
    },
    {
      "name": "graph_query",
      "description": "Query knowledge graph",
      "parameters": {
        "query": "string",
        "filters": "object"
      }
    }
  ]
}
```

---

#### 7. AgentDB MCP (Port 8080)

**Purpose**: Vector storage for agent memory and embeddings

**Capabilities**:
- High-performance vector storage
- Similarity search
- Batch embedding operations
- Collection management
- Hybrid search (vector + filters)
- Backup and snapshots

**MCP Tools**:
```json
{
  "tools": [
    {
      "name": "vector_store",
      "description": "Store vector embedding",
      "parameters": {
        "collection": "string",
        "vector": "array",
        "metadata": "object"
      }
    },
    {
      "name": "vector_search",
      "description": "Search similar vectors",
      "parameters": {
        "collection": "string",
        "query_vector": "array",
        "limit": "number"
      }
    }
  ]
}
```

---

#### 8. RuVector MCP (Port 8888)

**Purpose**: Search optimization and performance tuning

**Capabilities**:
- Query optimization
- Index management
- Cache warming
- Performance analytics
- Search result ranking
- A/B testing for search algorithms

---

#### 9. Composio MCP

**Purpose**: 80+ third-party integrations (Slack, GitHub, Gmail, etc.)

**Capabilities**:
- Pre-built connectors for popular services
- OAuth handling
- Webhook management
- Event streaming
- Rate limit handling
- Error retry logic

---

#### 10. GitHub MCP

**Purpose**: Repository automation and code management

**Capabilities**:
- Repository CRUD operations
- Issue and PR management
- Code review automation
- Workflow triggers
- Branch protection rules
- Commit signing

---

#### 11. Filesystem MCP (Development Only)

**Purpose**: File operations for local development

**Capabilities**:
- Read/write files
- Directory traversal
- File search
- Permissions management
- **Security**: Restricted to development environment only

---

#### 12. Infisical MCP (Port 8082)

**Purpose**: Secure secrets management

**Capabilities**:
- Secret storage and retrieval
- Automatic rotation
- Version control for secrets
- Audit trail
- Access control
- API key management

---

## External Service Integrations

### Communication Services

#### Twilio (SMS, Voice, Email)

**Purpose**: Multi-channel borrower communication

**Configuration**:
```bash
TWILIO_ACCOUNT_SID=<secret>
TWILIO_AUTH_TOKEN=<secret>
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_SENDGRID_API_KEY=<secret>
```

**Integration Points**:
- n8n workflows for drip campaigns
- Real-time SMS notifications
- Voice calls for urgent updates
- SendGrid for HTML emails
- Voicemail drop campaigns

**API Examples**:
```javascript
// Send SMS
POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
{
  "To": "+15551234567",
  "From": "+15559876543",
  "Body": "Your loan status has been updated."
}

// Send Email (via SendGrid)
POST https://api.sendgrid.com/v3/mail/send
{
  "personalizations": [{
    "to": [{"email": "borrower@example.com"}]
  }],
  "from": {"email": "noreply@ratehunter.net"},
  "subject": "Loan Status Update",
  "content": [{
    "type": "text/html",
    "value": "<h1>Status Update</h1>"
  }]
}
```

**Rate Limits**:
- SMS: 100 messages/second
- Voice: 50 calls/second
- Email: 10,000 emails/hour

---

### AI Model Providers

#### Anthropic (Claude API)

**Purpose**: Primary LLM for complex reasoning

**Models**:
- Claude Opus 4: $15 input / $75 output per 1M tokens
- Claude Sonnet 4: $3 input / $15 output per 1M tokens

**Configuration**:
```bash
ANTHROPIC_API_KEY=sk-ant-<secret>
ANTHROPIC_BASE_URL=https://api.anthropic.com
```

**Integration**:
- Routed through Nexus Router
- Intelligent fallback for complex tasks
- Streaming support for long responses
- Function calling for tool use

**API Example**:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-opus-4",
    "max_tokens": 1024,
    "messages": [{
      "role": "user",
      "content": "Analyze this loan scenario..."
    }]
  }'
```

**Rate Limits**:
- Tier 1: 50 requests/minute
- Tier 2: 100 requests/minute
- Tier 3: 1000 requests/minute

---

#### Google (Gemini API)

**Purpose**: Cost-efficient LLM for routine tasks

**Models**:
- Gemini 2.0 Flash: $0.075 input / $0.30 output per 1M tokens (DEFAULT)
- Gemini 2.0 Pro: $1.25 input / $5.00 output per 1M tokens

**Configuration**:
```bash
GOOGLE_GEMINI_API_KEY=<secret>
GOOGLE_API_ENDPOINT=https://generativelanguage.googleapis.com
```

**Integration**:
- Default model for routine tasks
- Multimodal support (text + images)
- Fast response times
- 10-50x cost savings vs Claude

**API Example**:
```bash
curl https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=$GOOGLE_GEMINI_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Classify this lead as A-F grade..."
      }]
    }]
  }'
```

**Rate Limits**:
- Free tier: 60 requests/minute
- Paid tier: 1000 requests/minute

---

#### OpenRouter

**Purpose**: Multi-model routing and fallback

**Configuration**:
```bash
OPENROUTER_API_KEY=<secret>
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

**Supported Models**:
- DeepSeek R1
- Llama 3.1 70B
- Qwen 2.5 72B
- Mixtral 8x22B
- And 100+ more models

**Integration**:
- Automatic model fallback
- Cost optimization
- Rate limit management
- Response streaming

---

### Database Services

#### PostgreSQL (Relational Database)

**Purpose**: Primary data storage for all applications

**Databases**:
- `nyra`: Main application database
- `letta`: Conversation memory
- `twenty`: CRM data
- `n8n`: Workflow definitions
- `dify`: Chat history

**Connection Strings**:
```bash
# Main database
DATABASE_URL=postgresql://nyra:<password>@postgres:5432/nyra

# Letta
LETTA_POSTGRES_URI=postgresql://letta:<password>@postgres:5432/letta

# TwentyCRM
TWENTY_DATABASE_URL=postgresql://twenty:<password>@postgres:5432/twenty
```

**Extensions Enabled**:
- `pgvector`: Vector similarity search
- `pg_trgm`: Fuzzy text search
- `uuid-ossp`: UUID generation
- `hstore`: Key-value storage

---

#### Redis (Cache & Queue)

**Purpose**: Session cache, task queue, pub/sub

**Use Cases**:
- User session storage (24 hour TTL)
- API response caching (1 hour TTL)
- Model embedding cache (7 day TTL)
- Task queue for workers
- Real-time metrics

**Configuration**:
```bash
REDIS_URL=redis://:<password>@redis:6379/0
REDIS_MAXMEMORY=2gb
REDIS_MAXMEMORY_POLICY=allkeys-lru
```

---

#### Qdrant (Vector Database)

**Purpose**: High-performance vector storage

**Collections**:
- `conversations`: Chat embeddings
- `documents`: Document embeddings
- `code`: Code snippet embeddings
- `leads`: Lead profile embeddings

**Configuration**:
```bash
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=<secret>
```

**API Example**:
```bash
# Create collection
curl -X PUT http://localhost:6333/collections/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 1536,
      "distance": "Cosine"
    }
  }'

# Search similar vectors
curl -X POST http://localhost:6333/collections/conversations/points/search \
  -H "Content-Type: application/json" \
  -d '{
    "vector": [0.1, 0.2, ...],
    "limit": 10
  }'
```

---

#### Neo4j (Knowledge Graph)

**Purpose**: Relationship mapping and temporal queries

**Use Cases**:
- Borrower relationships (co-borrowers, referrals)
- Document dependencies
- Workflow state machines
- Temporal event tracking

**Configuration**:
```bash
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=<secret>
```

**Cypher Query Example**:
```cypher
// Find all leads referred by a borrower
MATCH (borrower:Person {id: $borrowerId})-[:REFERRED]->(lead:Lead)
RETURN lead
ORDER BY lead.created_at DESC
```

---

### Business Applications

#### TwentyCRM (System of Record)

**Purpose**: Customer relationship management

**API Endpoints**:
```bash
# Base URL
TWENTY_API_URL=http://twenty:3000/graphql

# Authentication
TWENTY_API_KEY=<secret>
```

**GraphQL Schema**:
```graphql
# Create lead
mutation CreateLead($data: LeadCreateInput!) {
  createLead(data: $data) {
    id
    firstName
    lastName
    email
    phone
    status
  }
}

# Query leads
query GetLeads($filter: LeadFilterInput) {
  leads(filter: $filter) {
    edges {
      node {
        id
        firstName
        lastName
        status
      }
    }
  }
}
```

---

#### n8n (Workflow Automation)

**Purpose**: Campaign orchestration and automation

**API Endpoints**:
```bash
# Base URL
N8N_API_URL=http://n8n:5678/api/v1

# Authentication
N8N_API_KEY=<secret>
```

**Workflow Triggers**:
- **Webhook**: HTTP POST from external sources
- **Schedule**: Cron-based scheduling
- **Database**: PostgreSQL trigger events
- **File**: File upload/change detection
- **Email**: IMAP/POP3 email monitoring

**Example Workflow**:
```json
{
  "name": "Lead Drip Campaign",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "name": "Lead Scoring",
      "type": "n8n-nodes-base.function",
      "position": [450, 300]
    },
    {
      "name": "Send SMS",
      "type": "n8n-nodes-base.twilio",
      "position": [650, 300]
    }
  ]
}
```

---

#### Dify (Chat Interface)

**Purpose**: Borrower-facing conversational UI

**API Endpoints**:
```bash
# Base URL
DIFY_API_URL=http://dify-api:5001/v1

# Authentication
DIFY_API_KEY=<secret>
```

**Chat API**:
```bash
# Send message
POST /v1/chat-messages
{
  "inputs": {},
  "query": "What's the status of my application?",
  "response_mode": "streaming",
  "conversation_id": null,
  "user": "borrower-123"
}

# Get conversation history
GET /v1/conversations/{conversation_id}
```

---

## API Contracts & Specifications

### Nyra Orchestrator API

**Base URL**: `http://nyra-orchestrator:8010/api/v1`

#### Endpoints

**1. Lead Processing**
```bash
POST /leads
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+15551234567",
  "loanType": "conventional",
  "estimatedLoanAmount": 500000
}

Response:
{
  "leadId": "lead_abc123",
  "status": "created",
  "assignedCampaign": "first-time-buyer-drip",
  "nextAction": "send-welcome-email",
  "scheduledAt": "2026-01-21T10:00:00Z"
}
```

**2. Campaign Management**
```bash
GET /campaigns/{campaignId}

Response:
{
  "campaignId": "campaign_xyz",
  "name": "First Time Buyer Drip",
  "steps": [
    {
      "step": 1,
      "type": "email",
      "delay": "0 hours",
      "template": "welcome-email"
    },
    {
      "step": 2,
      "type": "sms",
      "delay": "24 hours",
      "template": "reminder-sms"
    }
  ],
  "activeLeads": 45,
  "completionRate": 0.68
}
```

**3. Document Tracking**
```bash
POST /documents/required
{
  "leadId": "lead_abc123",
  "loanType": "conventional"
}

Response:
{
  "documents": [
    {
      "name": "Pay Stub (2 most recent)",
      "required": true,
      "status": "pending",
      "uploadUrl": "https://ratehunter.net/upload/abc123"
    },
    {
      "name": "W-2 (2 years)",
      "required": true,
      "status": "received",
      "verifiedAt": "2026-01-20T14:30:00Z"
    }
  ]
}
```

---

### Quote Engine API

**Base URL**: `http://quote-engine:8001/api/v1`

**Calculate Quote**:
```bash
POST /quote
{
  "loanAmount": 500000,
  "loanType": "conventional",
  "creditScore": 750,
  "downPayment": 100000,
  "zipCode": "90210"
}

Response:
{
  "quoteId": "quote_xyz789",
  "monthlyPayment": 2847.15,
  "interestRate": 6.25,
  "apr": 6.48,
  "loanTerm": 360,
  "closingCosts": 7500,
  "expiresAt": "2026-01-28T23:59:59Z"
}
```

---

### Campaign Engine API

**Base URL**: `http://campaign-engine:8002/api/v1`

**Enroll Lead in Campaign**:
```bash
POST /enroll
{
  "leadId": "lead_abc123",
  "campaignId": "campaign_xyz",
  "startImmediately": true
}

Response:
{
  "enrollmentId": "enroll_def456",
  "status": "active",
  "nextStep": {
    "step": 1,
    "type": "email",
    "scheduledAt": "2026-01-21T10:00:00Z"
  }
}
```

---

## Communication Patterns

### Synchronous (Request-Response)

```mermaid
sequenceDiagram
    participant Client
    participant NexusRouter
    participant Service

    Client->>NexusRouter: POST /api/v1/chat
    NexusRouter->>Service: Forward request
    Service-->>NexusRouter: Response
    NexusRouter-->>Client: 200 OK
```

**Use Cases**:
- Real-time chat responses
- Lead lookups
- Quote calculations
- Status checks

---

### Asynchronous (Queue-Based)

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Queue
    participant Worker

    Client->>API: POST /api/v1/process
    API->>Queue: Enqueue task
    API-->>Client: 202 Accepted (task_id)
    Queue->>Worker: Consume task
    Worker->>Worker: Process
    Worker->>API: Update status
```

**Use Cases**:
- Document OCR (long-running)
- Campaign execution
- Batch processing
- Model fine-tuning

---

### Event-Driven (Pub/Sub)

```mermaid
sequenceDiagram
    participant Publisher
    participant PubSub
    participant Subscriber1
    participant Subscriber2

    Publisher->>PubSub: Publish event
    PubSub->>Subscriber1: Notify
    PubSub->>Subscriber2: Notify
    Subscriber1->>Subscriber1: Handle event
    Subscriber2->>Subscriber2: Handle event
```

**Use Cases**:
- Lead status changes
- Document uploads
- Campaign step completions
- Model inference completion

---

## Authentication & Authorization

### MCP Server Authentication

**Method**: JWT + API Key

```bash
# Nexus Router requires JWT
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# MCP servers require API key
X-API-Key: nyra_<secret>
```

### External API Authentication

| Service | Auth Method | Credential |
|---------|-------------|------------|
| Anthropic | API Key | `x-api-key: sk-ant-<secret>` |
| Google Gemini | API Key | URL parameter `?key=<secret>` |
| OpenRouter | API Key | `Authorization: Bearer sk-or-<secret>` |
| Twilio | Basic Auth | `Basic <base64(SID:Token)>` |
| TwentyCRM | GraphQL Token | `Authorization: Bearer <token>` |
| n8n | API Key | `X-N8N-API-KEY: <secret>` |
| Dify | Bearer Token | `Authorization: Bearer <token>` |

### Role-Based Access Control (RBAC)

```yaml
roles:
  admin:
    - all_permissions

  orchestrator:
    - manage_agents
    - manage_gpu_cluster
    - view_logs

  worker:
    - execute_tasks
    - report_metrics

  mortgage_admin:
    - manage_workflows
    - manage_leads
    - view_reports

  borrower:
    - view_own_data
    - upload_documents
    - chat_with_agent
```

---

## Integration Testing

### Health Check Endpoints

**All Services**:
```bash
GET /health

Response:
{
  "status": "healthy" | "degraded" | "unhealthy",
  "version": "2.0.0",
  "timestamp": "2026-01-21T10:00:00Z",
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "llm": "healthy"
  }
}
```

### End-to-End Test Suite

```bash
# Run all integration tests
.\scripts\integration-testing.ps1 -TestSuite all -Verbose

# Test specific integration
.\scripts\integration-testing.ps1 -TestSuite twilio
```

### Contract Testing

```yaml
# contracts/twenty-crm-lead-create.yaml
request:
  method: POST
  path: /graphql
  body:
    query: |
      mutation {
        createLead(data: $data) {
          id
          email
        }
      }
    variables:
      data:
        firstName: "Test"
        lastName: "User"
        email: "test@example.com"

response:
  status: 200
  body:
    data:
      createLead:
        id: string
        email: "test@example.com"
```

---

## Error Handling & Retry Logic

### Exponential Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Circuit Breaker

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failures = 0;
    this.state = 'CLOSED';
    this.nextAttempt = Date.now();
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
```

---

## Rate Limiting & Quotas

### Service Limits

| Service | Requests/Minute | Burst | Cool-down |
|---------|-----------------|-------|-----------|
| Nexus Router | 1000 | 100 | 1s |
| Claude Opus | 50 | 5 | 60s |
| Claude Sonnet | 100 | 10 | 30s |
| Gemini Flash | 1000 | 100 | 1s |
| Twilio SMS | 100 | 10 | 10s |
| TwentyCRM | 500 | 50 | 1s |
| n8n Webhooks | unlimited | - | - |

### Rate Limit Headers

```bash
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1705838400
Retry-After: 60
```

### Handling 429 Errors

```javascript
async function callWithRateLimit(fn) {
  try {
    return await fn();
  } catch (error) {
    if (error.status === 429) {
      const retryAfter = error.headers['retry-after'] || 60;
      console.log(`Rate limited. Retrying after ${retryAfter}s`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return await fn();
    }
    throw error;
  }
}
```

---

## References

- [Architecture Overview](./ARCHITECTURE-OVERVIEW.md)
- [Architecture Decisions](./ARCHITECTURE-DECISIONS.md)
- [Infrastructure Details](./INFRASTRUCTURE.md)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Twilio API Documentation](https://www.twilio.com/docs/api)
- [Anthropic API Documentation](https://docs.anthropic.com/)

---

**Last Updated**: 2026-01-21
**Maintained By**: Integration Team
**Review Cycle**: Monthly
**Next Review**: 2026-02-21
