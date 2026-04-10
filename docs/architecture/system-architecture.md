# System Architecture Overview

**Version:** 1.0.0
**Last Updated:** 2026-01-09

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architectural Principles](#architectural-principles)
3. [System Overview](#system-overview)
4. [Technology Stack](#technology-stack)
5. [Core Components](#core-components)
6. [Multi-Agent Orchestration](#multi-agent-orchestration)
7. [Data Architecture](#data-architecture)
8. [Security Architecture](#security-architecture)
9. [Scalability & Performance](#scalability--performance)
10. [Deployment Architecture](#deployment-architecture)

## Executive Summary

Project-Nyra is an AI-powered mortgage automation platform built on a modern, distributed architecture utilizing:

- **Monorepo Structure:** pnpm workspaces + Turborepo for efficient multi-package management
- **Multi-Agent Orchestration:** Claude Flow, Ruv-Swarm, Flow-Nexus for intelligent task coordination
- **Microservices Architecture:** Containerized services with Docker and Kubernetes
- **Event-Driven Design:** Asynchronous communication via message queues
- **Real-Time Processing:** WebSocket connections for live updates
- **AI Integration:** Advanced LLM capabilities via MCP (Model Context Protocol)

## Architectural Principles

### 1. Modularity
- **Separation of Concerns:** Each component has a single, well-defined responsibility
- **Loose Coupling:** Components interact through well-defined interfaces
- **High Cohesion:** Related functionality is grouped together

### 2. Scalability
- **Horizontal Scaling:** Add more instances to handle increased load
- **Vertical Scaling:** Increase resources for existing instances
- **Auto-Scaling:** Automatic adjustment based on metrics

### 3. Reliability
- **Fault Tolerance:** System continues operating despite component failures
- **Circuit Breakers:** Prevent cascading failures
- **Graceful Degradation:** Reduced functionality rather than complete failure

### 4. Security
- **Defense in Depth:** Multiple layers of security controls
- **Zero Trust:** Never trust, always verify
- **Least Privilege:** Minimal permissions required for operation

### 5. Observability
- **Logging:** Comprehensive structured logging
- **Metrics:** Real-time performance metrics
- **Tracing:** Distributed request tracing

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Web App  │  │ Mobile   │  │   CLI    │  │   API    │           │
│  │          │  │   App    │  │  Client  │  │ Clients  │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                               │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Load Balancer │ Rate Limiter │ Auth │ Request Routing    │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Multi-Agent Orchestration Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Claude Flow  │  │  Ruv-Swarm   │  │ Flow-Nexus   │             │
│  │   (Alpha)    │  │   (Latest)   │  │   (Latest)   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│         MCP Protocol Integration                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Application Services Layer                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ Codanna  │ │Kilo-Code │ │  Serena  │ │  Admin   │              │
│  │  Core    │ │  Editor  │ │   AI     │ │ Service  │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Integration Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Message    │  │    Event     │  │   Webhook    │             │
│  │    Queue     │  │   Streaming  │  │   Manager    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Data Layer                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  PostgreSQL  │  │     Redis    │  │    S3/Blob   │             │
│  │   (Primary)  │  │    (Cache)   │  │   Storage    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Kubernetes  │  │    Docker    │  │   Terraform  │             │
│  │  (Orchestr)  │  │ (Containers) │  │    (IaC)     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Technologies
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 20+ | JavaScript runtime |
| **Package Manager** | pnpm | 10+ | Fast, efficient package management |
| **Build Tool** | Turborepo | 2.4+ | Monorepo build orchestration |
| **Language** | TypeScript | 5.7+ | Type-safe JavaScript |

### Backend Services
| Service | Technology | Purpose |
|---------|-----------|---------|
| **Web Framework** | Express.js / Fastify | REST API services |
| **Database** | PostgreSQL + Prisma | Data persistence |
| **Cache** | Redis | High-speed caching |
| **Message Queue** | RabbitMQ / Redis Pub/Sub | Async communication |
| **Storage** | S3 / Azure Blob | File storage |

### AI & Orchestration
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Agent Framework** | Claude Flow (Alpha) | Multi-agent coordination |
| **Swarm Intelligence** | Ruv-Swarm (Latest) | Distributed agent swarms |
| **Cloud Orchestration** | Flow-Nexus (Latest) | Cloud-based workflows |
| **MCP Protocol** | Model Context Protocol | LLM integration standard |

### Frontend Technologies
| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React / Next.js | User interfaces |
| **State Management** | Redux / Zustand | Client state |
| **UI Components** | Custom + Shadcn/ui | Component library |
| **Styling** | Tailwind CSS | Utility-first CSS |

### DevOps & Infrastructure
| Tool | Purpose |
|------|---------|
| **Containerization** | Docker + Docker Compose |
| **Orchestration** | Kubernetes (K8s) |
| **CI/CD** | GitHub Actions |
| **Infrastructure as Code** | Terraform / Pulumi |
| **Monitoring** | Prometheus + Grafana |
| **Logging** | ELK Stack / Loki |
| **Tracing** | Jaeger / Zipkin |

## Core Components

### 1. Codanna Core
**Purpose:** Core mortgage processing engine

**Responsibilities:**
- Mortgage application processing
- Document management and OCR
- Compliance validation
- Risk assessment
- Loan origination workflow

**Technology:**
- TypeScript backend
- React frontend
- Prisma ORM
- Redis caching

**Key Features:**
- Real-time document processing
- AI-powered data extraction
- Automated compliance checking
- Multi-tenant architecture

### 2. Kilo-Code Editor
**Purpose:** Code editing and template management

**Responsibilities:**
- Template editing interface
- Code generation
- Syntax highlighting
- Version control integration

**Technology:**
- Monaco Editor
- CodeMirror
- WebSocket for collaboration
- Git integration

### 3. Serena AI Assistant
**Purpose:** Intelligent conversational AI assistant

**Responsibilities:**
- Natural language processing
- User query handling
- Task automation
- Contextual assistance

**Technology:**
- Claude API integration
- RAG (Retrieval Augmented Generation)
- Vector database (Pinecone/Weaviate)
- WebSocket for real-time chat

### 4. Admin Service
**Purpose:** System administration and configuration

**Responsibilities:**
- User management
- Role-based access control (RBAC)
- System configuration
- Audit logging
- Analytics dashboard

**Technology:**
- Express.js API
- PostgreSQL database
- Redis sessions
- React admin dashboard

## Multi-Agent Orchestration

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Hive Mind Coordination                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Queen Agent (Strategic Coordinator)               │    │
│  │  - Task Decomposition                              │    │
│  │  - Resource Allocation                             │    │
│  │  - Consensus Building                              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               Worker Agent Pool (8 max)                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │Architect│ │Research│ │ Coder  │ │ Tester │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │Reviewer│ │Analyzer│ │Optimizer│ │Planner │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ archon-os  │  │  ruv-swarm   │  │ flow-nexus   │     │
│  │    @alpha    │  │   @latest    │  │   @latest    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Agent Types

#### 1. Core Development Agents
- **coder:** Implementation and code generation
- **reviewer:** Code review and quality assurance
- **tester:** Test creation and execution
- **planner:** Task planning and breakdown
- **researcher:** Information gathering and analysis

#### 2. Swarm Coordination Agents
- **hierarchical-coordinator:** Tree-based coordination
- **mesh-coordinator:** Peer-to-peer coordination
- **adaptive-coordinator:** Dynamic topology adjustment
- **collective-intelligence-coordinator:** Consensus building
- **swarm-memory-manager:** Shared memory management

#### 3. Specialized Agents
- **backend-dev:** Backend development specialist
- **mobile-dev:** Mobile development specialist
- **ml-developer:** Machine learning specialist
- **cicd-engineer:** DevOps and CI/CD
- **system-architect:** Architecture design

### Consensus Mechanisms

**Algorithm:** Weighted Majority Voting

**Configuration:**
- Minimum Participants: 3
- Required Consensus: 67%
- Timeout: 30 seconds
- Voting Methods: Majority, Weighted, Unanimous, Quorum

### Memory Management

**Shared Memory Namespace:** `hive-collective`

**Features:**
- Persistent database storage
- 30-day retention policy
- Compression enabled
- 100 MB memory pool
- Cross-agent knowledge sharing

**Memory Channels:**
- Task coordination
- Knowledge sharing
- Consensus voting
- Error reporting
- Performance metrics

## Data Architecture

### Database Schema

**Primary Database:** PostgreSQL 16+

**Schema Overview:**
```
Users
├── id: uuid (PK)
├── email: string (unique)
├── name: string
├── role: enum
├── created_at: timestamp
└── updated_at: timestamp

Applications
├── id: uuid (PK)
├── user_id: uuid (FK → Users)
├── status: enum
├── data: jsonb
├── created_at: timestamp
└── updated_at: timestamp

Documents
├── id: uuid (PK)
├── application_id: uuid (FK → Applications)
├── type: string
├── storage_url: string
├── metadata: jsonb
└── processed_at: timestamp

Tasks
├── id: uuid (PK)
├── type: enum
├── agent_id: string
├── status: enum
├── input: jsonb
├── output: jsonb
├── created_at: timestamp
└── completed_at: timestamp

AuditLogs
├── id: uuid (PK)
├── user_id: uuid (FK → Users)
├── action: string
├── resource: string
├── details: jsonb
└── timestamp: timestamp
```

### Caching Strategy

**Redis Configuration:**
- Cache Size: 512 MB
- TTL: 1800 seconds (30 minutes)
- Eviction Policy: LRU (Least Recently Used)

**Cached Data:**
- User sessions
- Agent results
- API responses
- Configuration data
- Frequently accessed documents

### Data Flow

```
User Request
    ↓
API Gateway (Rate Limiting, Auth)
    ↓
Application Service
    ↓
Cache Check (Redis)
    ├─ Hit → Return cached data
    └─ Miss ↓
Database Query (PostgreSQL)
    ↓
Cache Update (Redis)
    ↓
Response to User
```

## Security Architecture

### Authentication & Authorization

**Authentication Methods:**
- JWT (JSON Web Tokens)
- OAuth 2.0 / OpenID Connect
- API Keys
- Multi-Factor Authentication (MFA)

**Authorization:**
- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)
- Resource-level permissions
- API rate limiting per user/role

### Security Layers

1. **Network Security**
   - TLS 1.3 for all communications
   - VPC isolation
   - Security groups and firewalls
   - DDoS protection

2. **Application Security**
   - Input validation and sanitization
   - SQL injection prevention (Prisma ORM)
   - XSS protection
   - CSRF tokens
   - Content Security Policy (CSP)

3. **Data Security**
   - Encryption at rest (AES-256)
   - Encryption in transit (TLS)
   - Secrets management (Vault/AWS Secrets Manager)
   - Personal data anonymization
   - GDPR compliance

4. **API Security**
   - Rate limiting (per IP, per user)
   - Request signing
   - CORS policies
   - API versioning
   - Input validation schemas

### Compliance

- **GDPR:** Data privacy and user rights
- **SOC 2:** Security and availability controls
- **PCI DSS:** Payment card data security
- **HIPAA:** Healthcare data protection (if applicable)

## Scalability & Performance

### Horizontal Scaling

**Auto-Scaling Configuration:**
```yaml
swarm:
  autoScaling: true
  minAgents: 5
  maxAgents: 100
  scaleThreshold: 0.8

orchestrator:
  maxConcurrentAgents: 50
  agentPoolSize: 20
```

**Load Balancing:**
- Application Load Balancer (ALB)
- Round-robin distribution
- Health check endpoints
- Session affinity (sticky sessions)

### Vertical Scaling

**Resource Allocation:**
- CPU: 2-8 cores per service
- Memory: 2-16 GB per service
- Disk: SSD-backed storage
- Network: 1-10 Gbps

### Performance Optimization

**Caching Strategy:**
- Aggressive caching enabled
- CDN for static assets
- Browser caching headers
- API response caching

**Connection Pooling:**
- Database connection pooling
- Network connection pooling
- Terminal/process pooling (30 max)

**Compression:**
- Gzip/Brotli compression
- Response compression
- Network compression enabled

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time (p95) | < 200ms | 150ms |
| Database Query Time (p95) | < 100ms | 75ms |
| Page Load Time | < 2s | 1.5s |
| Throughput | > 1000 req/s | 1200 req/s |
| Availability | 99.9% | 99.95% |

## Deployment Architecture

### Environment Strategy

**Environments:**
1. **Development:** Feature development and testing
2. **Staging:** Pre-production validation
3. **Production:** Live customer environment

### Container Orchestration

**Docker Compose (Development):**
```yaml
services:
  - app: Application services
  - postgres: Primary database
  - redis: Cache layer
  - rabbitmq: Message queue
  - monitoring: Observability stack
```

**Kubernetes (Production):**
```yaml
Namespaces:
  - nyra-prod: Production workloads
  - nyra-staging: Staging workloads
  - monitoring: Observability tools

Deployments:
  - api-deployment: (3-10 replicas)
  - worker-deployment: (5-20 replicas)
  - agent-deployment: (5-100 replicas)

Services:
  - LoadBalancer: External access
  - ClusterIP: Internal communication

Storage:
  - PersistentVolumes: Database data
  - PersistentVolumeClaims: Application data
```

### 4-PC Windows Distributed Architecture

**Current Production Setup**: Distributed deployment across 4 Windows PCs with hybrid Windows/WSL2 environment.

See detailed configuration: [4PC-DISTRIBUTED-ARCHITECTURE.md](./4PC-DISTRIBUTED-ARCHITECTURE.md)

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Windows Orchestrator PC (Mini PC)                          │
│  ├── Docker Desktop + WSL2 (Ubuntu 24.04)                  │
│  ├── Orchestration Services (Claude Flow, Archon OS)       │
│  ├── MCP Servers (archon-os, ruv-swarm, ruvector, etc.)  │
│  ├── Message Queue (RabbitMQ)                              │
│  ├── Databases (PostgreSQL, Redis, Qdrant, FalkorDB)      │
│  └── Magic Packet Wake-on-LAN for worker management        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ├── Cloudflared Tunnels (Secure Communication)
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
┌───▼────┐           ┌────▼───┐           ┌────▼───┐
│Worker 1│           │Worker 2│           │Worker 3│
│GPU PC  │           │GPU PC  │           │GPU PC  │
│RTX 4090│           │RTX 4090│           │RTX 4090│
│24GB    │           │24GB    │           │24GB    │
└────────┘           └────────┘           └────────┘
```

#### Key Features

- **Orchestrator PC** (Windows 11 Pro + WSL2):
  - Runs Docker Desktop with WSL2 backend for Linux container compatibility
  - Hosts all orchestration services (Claude Flow, Archon OS)
  - Manages MCP server integration
  - Coordinates distributed GPU compute via Cloudflared tunnels
  - Wake-on-LAN support for power-efficient worker management

- **Worker PCs** (3x RTX 4090 24GB):
  - Distributed GPU compute for AI inference and training
  - Runs local LLM models via Ollama/vLLM
  - Task-specific workload distribution
  - On-demand activation via Wake-on-LAN

- **Network Architecture**:
  - Cloudflared tunnels for secure orchestrator ↔ worker communication
  - Docker overlay networks for service mesh
  - Windows host ↔ WSL2 communication via localhost forwarding

- **Bootstrap System**:
  - GUI installer for component deployment
  - PowerShell scripts for Windows-specific installation
  - Bash scripts for WSL2 environment setup
  - Configuration templates for Claude Code, Docker, WSL2, Infisical, Gitea

#### Configuration Management

**Orchestrator PC** (`~/.wslconfig`):
```ini
[wsl2]
memory=8GB           # Adjust based on available RAM
processors=4         # Adjust based on available cores
swap=4GB
localhostForwarding=true
nestedVirtualization=true
```

**Docker Desktop** (`%APPDATA%\Docker\daemon.json`):
```json
{
  "builder": { "gc": { "enabled": true } },
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-address-pools": [
    { "base": "172.20.0.0/16", "size": 24 }
  ]
}
```

**Bootstrap Installation**:
```powershell
# GUI installer (recommended)
cd bootstrap
pnpm install
pnpm start

# Follow GUI to:
# 1. Select PC type (orchestrator/worker/standalone)
# 2. Choose components (Docker, WSL, Claude Flow, etc.)
# 3. Deploy configuration templates
# 4. Initialize services
```

#### Service Distribution

**Orchestrator PC Services**:
- PostgreSQL (pgvector) - Primary database
- Redis - Cache layer
- Qdrant - Vector database
- FalkorDB - Graph database
- Letta - Agent memory system
- Claude Flow - Multi-agent orchestration
- Nexus Router - LLM request routing
- MCP Servers - Model Context Protocol integration
- Monitoring stack (Prometheus, Grafana, Loki)

**Worker PC Services**:
- Ollama - Local LLM inference
- vLLM - Fast inference engine
- Text Generation WebUI - Model management

#### Deployment Workflow

1. **Orchestrator Setup**:
   - Run bootstrap GUI installer
   - Deploy Docker Desktop + WSL2
   - Install Claude Flow and MCP servers
   - Configure Cloudflared tunnels
   - Deploy infrastructure services

2. **Worker Setup**:
   - Run bootstrap GUI installer (worker mode)
   - Configure Cloudflared client
   - Install Ollama/vLLM
   - Register with orchestrator

3. **Service Coordination**:
   - Orchestrator receives user requests via MCP
   - Claude Flow distributes tasks across workers
   - Results aggregated and returned to user

### Infrastructure as Code

**Terraform Modules:**
- VPC and networking
- EKS/AKS/GKE cluster
- RDS/Cloud SQL instances
- S3/Blob Storage buckets
- Security groups and IAM roles
- DNS and SSL certificates

### Monitoring & Observability

**Stack:**
- **Metrics:** Prometheus + Grafana
- **Logs:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing:** Jaeger / Zipkin
- **Alerting:** AlertManager / PagerDuty

**Health Checks:**
- Liveness probes every 10s
- Readiness probes every 5s
- Startup probes for initialization
- HTTP endpoints: `/health`, `/ready`, `/live`

## Disaster Recovery

### Backup Strategy

**Database Backups:**
- Automated daily backups
- Point-in-time recovery (7 days)
- Cross-region replication
- Backup retention: 30 days

**Application State:**
- Configuration backups
- Agent memory snapshots
- Session data backups

### Recovery Procedures

**RTO (Recovery Time Objective):** 1 hour
**RPO (Recovery Point Objective):** 5 minutes

**Failover Process:**
1. Detect failure via health checks
2. Route traffic to standby region
3. Restore database from latest backup
4. Restore application state
5. Verify system functionality
6. Monitor for issues

## Next Steps

- [Component Architecture](./components.md) - Detailed component breakdown
- [Data Flow Diagrams](./data-flow.md) - Visual data flow
- [Security Architecture](./security.md) - In-depth security design
- [Scalability Design](./scalability.md) - Scaling strategies

---

**Document Owner:** System Architecture Team
**Last Review:** 2026-01-09
**Next Review:** 2026-04-09
