# Project Nyra - Complete Setup Guide Index

**Last Updated**: 2026-01-18
**Status**: Comprehensive - All Setup Documentation Consolidated
**Scope**: Complete infrastructure, databases, memory, MCP servers, applications

---

## 🎯 Quick Navigation

### 🚀 Start Here (First-Time Setup)
- **[Master Setup Guide](./00-MASTER-SETUP-GUIDE.md)** - Complete setup orchestration guide
- **[Prerequisites Checklist](./01-PREREQUISITES-CHECKLIST.md)** - System requirements and tools

### 📚 Setup Categories

1. **[Core Infrastructure](#1-core-infrastructure-setup)** - Docker, networking, secrets
2. **[Backend Databases](#2-backend-databases)** - PostgreSQL, Redis, FalkorDB, Qdrant
3. **[Memory Systems](#3-memory-systems)** - Letta, Mem0, Graphiti, AgentDB
4. **[MCP Servers](#4-mcp-servers)** - All MCP server setup guides
5. **[Applications](#5-applications)** - Open WebUI, LobeChat, n8n
6. **[4-PC Distributed Architecture](#6-4-pc-distributed-architecture)** - Multi-PC deployment
7. **[Cloud Services](#7-cloud-services)** - Cloudflare, tunnels, access control

---

## 📖 Complete Documentation Map

### 1. Core Infrastructure Setup

#### Essential Infrastructure
- **[Manual Setup Guide](../operations/MANUAL-SETUP-GUIDE.md)** ⭐ (38KB, comprehensive)
  - Complete backend systems configuration
  - Memory services setup
  - MCP infrastructure
  - Network configuration
  - Verification steps
  - Troubleshooting

- **[Docker Infrastructure Setup](../deployment/DOCKER-MCP-SETUP.md)** (26KB)
  - Docker Compose configuration
  - Container orchestration
  - Network setup
  - Volume management

- **[Containerization Guide](../CONTAINERIZATION-GUIDE.md)**
  - Multi-stage builds
  - Image optimization
  - Security best practices

#### Secrets Management
- **[Infisical Deployment](../deployment/INFISICAL-MCP-SETUP.md)** (16KB)
  - Secret management setup
  - Environment configuration
  - Token authentication

- **[Bitwarden MCP Setup](../deployment/BITWARDEN-MCP-SETUP.md)** (9KB)
  - Password management
  - BWS CLI integration
  - Secret retrieval

- **[Environment Variables Guide](../operations/ENV-VARIABLE-GUIDE.md)**
  - Required secrets
  - Configuration templates
  - Best practices

#### Networking & Access
- **[Cloudflare Tunnel Quick Start](../deployment/CLOUDFLARE-TUNNEL-QUICK-START.md)** (17KB)
  - Tunnel setup
  - DNS routing
  - Access policies

- **[Cloudflare Tunnel Architecture](../architecture/cloudflare-tunnel-architecture.md)**
  - Security architecture
  - Multi-PC tunnel design
  - Best practices

---

### 2. Backend Databases

#### PostgreSQL
**Location**: `docs/operations/MANUAL-SETUP-GUIDE.md` (Section 3)
- Installation steps
- Database creation
- User management
- Connection strings
- Performance tuning

**Quick Start**:
```bash
# Docker deployment
docker run -d \
  --name nyra-postgres \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=nyra \
  -p 5432:5432 \
  postgres:16-alpine

# Create application databases
psql -U postgres -c "CREATE DATABASE openwebui;"
psql -U postgres -c "CREATE DATABASE letta;"
psql -U postgres -c "CREATE DATABASE nexus;"
```

#### Redis
**Location**: `docs/operations/MANUAL-SETUP-GUIDE.md` (Section 3)
- Redis deployment
- Configuration
- Persistence setup
- Memory management

**Quick Start**:
```bash
docker run -d \
  --name nyra-redis \
  -p 6379:6379 \
  redis:7-alpine redis-server --appendonly yes
```

#### FalkorDB (Graph Database)
**Location**: `docs/operations/MANUAL-SETUP-GUIDE.md` (Section 3)
- FalkorDB setup
- Graph queries
- Integration patterns

**Quick Start**:
```bash
docker run -d \
  --name nyra-falkordb \
  -p 6380:6379 \
  falkordb/falkordb:latest
```

#### Qdrant (Vector Database)
**Location**: `docs/operations/MANUAL-SETUP-GUIDE.md` (Section 3)
- Qdrant deployment
- Collection creation
- Vector search configuration

**Quick Start**:
```bash
docker run -d \
  --name nyra-qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  qdrant/qdrant:latest
```

#### Neo4j (Optional)
**Location**: `docs/operations/MANUAL-SETUP-GUIDE.md` (Section 3)
- Neo4j setup
- Cypher queries
- Graph data modeling

---

### 3. Memory Systems

#### Letta (Primary Memory System)
**Location**: `docs/operations/MANUAL-SETUP-GUIDE.md` (Section 4)
- Letta installation
- PostgreSQL integration
- Agent memory configuration
- API setup

**Status**: ✅ Active (Port 8283)

**Quick Start**:
```bash
pip install letta
letta server --port 8283
```

#### Mem0 MCP Server
**Location**: `docs/deployment/MEM0-MCP-DEPLOYMENT-PLAN.md` (24KB)
- MCP integration
- Memory persistence
- Agent coordination

**Status**: ⏳ Pending Activation

#### Graphiti MCP Server
**Location**: `docs/deployment/GRAPHITI-MCP-DEPLOYMENT-PLAN.md` (20KB)
- Knowledge graph integration
- FalkorDB backend
- Multi-agent memory

**Status**: ⚠️ Needs Configuration

#### AgentDB
**Location**: `docs/integration/AGENTDB-INTEGRATION-GUIDE.md` (15KB)
- Vector database integration
- HNSW indexing (150x-12,500x faster)
- Pattern storage
- Neural memory

**Status**: ✅ Integrated in Claude Flow

---

### 4. MCP Servers

#### MCP Server Overview
- **[MCP Server Setup](../deployment/MCP-SERVER-SETUP.md)** ⭐ (22KB)
  - Architecture overview
  - Quick start guide
  - Server management
  - Troubleshooting

- **[MCP Status Report](../deployment/MCP-STATUS-REPORT.md)** (12KB)
  - Current deployment status
  - Health checks
  - Performance metrics

#### Individual MCP Servers

##### Claude Flow MCP
**Location**: `docs/deployment/MCP-SERVER-SETUP.md` (Section 4.1)
- Swarm orchestration
- Multi-agent coordination
- Task management

**Status**: ✅ Active (Port 3100)

**Quick Start**:
```bash
npx @claude-flow/cli@latest mcp start
```

##### Archon OS MCP
**Location**: `docs/deployment/MCP-SERVER-SETUP.md` (Section 4.2)
- System automation
- Workflow orchestration
- Tool integration

**Status**: ✅ Active (Port 3200)

##### Infisical MCP
**Location**: `docs/deployment/INFISICAL-MCP-SETUP.md` (16KB)
- Secret retrieval
- Environment variable injection
- Access control

**Status**: ✅ Active (Port 8006)

##### Bitwarden MCP
**Location**: `docs/deployment/BITWARDEN-MCP-SETUP.md` (9KB)
- Password management
- Credential storage
- BWS CLI integration

**Status**: ✅ Active (Port 8007)

##### Git MCP
**Location**: `infra/git-mcp/README.md` (7KB)
- Git operations automation
- Repository management
- Version control

**Status**: ✅ Active (stdio)

##### Docker MCP
**Location**: `docs/deployment/DOCKER-MCP-SETUP.md` (26KB)
- Container management
- Image operations
- Compose orchestration

**Status**: ✅ Active (stdio)

##### DockerHub MCP
**Location**: `docs/deployment/DOCKERHUB-MCP-SETUP.md` (11KB)
- Image registry access
- Tag management
- Pull/push operations

**Status**: ✅ Active (stdio)

##### Sequential Thinking MCP
**Location**: `docs/deployment/SEQUENTIAL-THINKING-MCP-SETUP.md` (14KB)
- Chain-of-thought reasoning
- Multi-step planning
- Context management

**Status**: ✅ Active (Port 8008)

---

### 5. Applications

#### Open WebUI
- **[Open WebUI Deployment Plan](../deployment/OPEN-WEBUI-DEPLOYMENT-PLAN.md)** (78KB)
  - Complete deployment guide
  - Docker Compose configuration
  - Nexus Router integration

- **[Open WebUI Cloudflare Tunnel Setup](../deployment/OPEN-WEBUI-CLOUDFLARE-TUNNEL-SETUP.md)** ⭐ (47KB)
  - Cloudflare tunnel configuration
  - DNS routing
  - Access policies
  - Security best practices

- **[Open WebUI Deployment Complete](../deployment/OPEN-WEBUI-DEPLOYMENT-COMPLETE.md)** (11KB)
  - Deployment summary
  - Verification checklist
  - Troubleshooting

**Status**: ✅ Ready for Deployment
**URL**: https://chat.ratehunter.net (after deployment)
**Port**: 3333 (local)

#### LobeChat
**Location**: `docs/deployment/LOBECHAT-DEPLOYMENT.md` (14KB)
- Alternative chat interface
- Multi-model support
- Database integration

**Status**: ⏳ Optional

#### n8n Workflows
**Location**: `docs/architecture/n8n-mortgage-drip-workflow-spec.md` (32KB)
- Workflow automation
- Mortgage lead drip campaigns
- API integrations

**Status**: ⏳ Planned

---

### 6. 4-PC Distributed Architecture

#### Deployment Guides
- **[4-PC Deployment Guide](../deployment/4PC-DEPLOYMENT-GUIDE.md)** (48KB)
  - Complete 4-PC setup
  - Network architecture
  - GPU worker configuration

- **[4-PC Docker Deployment](../deployment/4PC-DOCKER-DEPLOYMENT-GUIDE.md)** (31KB)
  - Docker Compose per PC
  - Service distribution
  - Load balancing

- **[Physical PC Setup](../architecture/physical-pc-setup-implementation-guide.md)** (19KB)
  - Hardware configuration
  - Network setup
  - GPU configuration

#### PC-Specific Configuration
- **PC1 (Orchestrator)**: Nexus Router, Open WebUI, PostgreSQL, Redis
- **PC2 (RTX 5090)**: GPU compute, Claude Flow
- **PC3 (RTX 3090 Ti)**: GPU compute, Archon OS
- **PC4 (RTX 3060)**: GPU compute, backup services

**Network**: 10GbE interconnect
**Architecture**: Hierarchical mesh with GPU affinity

---

### 7. Cloud Services

#### Cloudflare Setup
- **[Cloudflare Tunnel Quick Start](../deployment/CLOUDFLARE-TUNNEL-QUICK-START.md)** (17KB)
  - Tunnel creation
  - DNS routing
  - Access policies

- **[Cloudflare Pages Setup](../guides/CLOUDFLARE-PAGES-SETUP.md)** (11KB)
  - Static site deployment
  - CI/CD integration

#### Email Services
- **[Email Setup Guide](../guides/EMAIL-SETUP-GUIDE.md)** (6KB)
  - SMTP configuration
  - Email automation
  - Templates

#### Google Workspace
- **[Google Workspace Integration](../guides/google-workspace-integration.md)** (15KB)
  - API setup
  - OAuth configuration
  - Service accounts

---

## 🎯 Recommended Setup Order

### Phase 1: Core Infrastructure (Day 1)
1. **[Prerequisites](./01-PREREQUISITES-CHECKLIST.md)** - Install required tools
2. **[Docker Setup](../deployment/DOCKER-MCP-SETUP.md)** - Container environment
3. **[Infisical](../deployment/INFISICAL-MCP-SETUP.md)** - Secret management
4. **[PostgreSQL](../operations/MANUAL-SETUP-GUIDE.md#backend-database-setup)** - Primary database
5. **[Redis](../operations/MANUAL-SETUP-GUIDE.md#backend-database-setup)** - Caching layer

**Estimated Time**: 2-4 hours

---

### Phase 2: Memory & MCP Servers (Day 2)
1. **[Letta](../operations/MANUAL-SETUP-GUIDE.md#memory-systems-configuration)** - Memory system
2. **[AgentDB](../integration/AGENTDB-INTEGRATION-GUIDE.md)** - Vector database
3. **[Claude Flow MCP](../deployment/MCP-SERVER-SETUP.md)** - Orchestration
4. **[Bitwarden MCP](../deployment/BITWARDEN-MCP-SETUP.md)** - Credentials
5. **[Git MCP](infra/git-mcp/README.md)** - Version control
6. **[Docker MCP](../deployment/DOCKER-MCP-SETUP.md)** - Container management

**Estimated Time**: 3-5 hours

---

### Phase 3: Applications (Day 3)
1. **[Nexus Router](../deployment/NEXUS-ROUTER-DEPLOYMENT-PLAN.md)** - LLM routing
2. **[Open WebUI](../deployment/OPEN-WEBUI-CLOUDFLARE-TUNNEL-SETUP.md)** - Chat interface
3. **[Cloudflare Tunnel](../deployment/CLOUDFLARE-TUNNEL-QUICK-START.md)** - External access
4. **[LobeChat](../deployment/LOBECHAT-DEPLOYMENT.md)** (Optional) - Alternative UI

**Estimated Time**: 2-4 hours

---

### Phase 4: Advanced Features (Week 2)
1. **[4-PC Architecture](../deployment/4PC-DEPLOYMENT-GUIDE.md)** - Distributed setup
2. **[Graphiti MCP](../deployment/GRAPHITI-MCP-DEPLOYMENT-PLAN.md)** - Knowledge graphs
3. **[Mem0 MCP](../deployment/MEM0-MCP-DEPLOYMENT-PLAN.md)** - Advanced memory
4. **[n8n Workflows](../architecture/n8n-mortgage-drip-workflow-spec.md)** - Automation

**Estimated Time**: 1-2 weeks

---

## 🔍 Quick Reference by Use Case

### "I want to deploy Open WebUI on my domain"
1. **[Open WebUI Cloudflare Tunnel Setup](../deployment/OPEN-WEBUI-CLOUDFLARE-TUNNEL-SETUP.md)** ⭐
2. **[Open WebUI Deployment Complete](../deployment/OPEN-WEBUI-DEPLOYMENT-COMPLETE.md)**
3. **[Cloudflare Tunnel Quick Start](../deployment/CLOUDFLARE-TUNNEL-QUICK-START.md)**

---

### "I need to set up all databases"
1. **[Manual Setup Guide - Backend Databases](../operations/MANUAL-SETUP-GUIDE.md#backend-database-setup)** ⭐
2. **[Database README](infra/database/README.md)**

---

### "I want to configure MCP servers"
1. **[MCP Server Setup](../deployment/MCP-SERVER-SETUP.md)** ⭐
2. **[MCP Status Report](../deployment/MCP-STATUS-REPORT.md)**
3. Individual MCP setup guides (see [Section 4](#4-mcp-servers))

---

### "I need memory system setup"
1. **[Manual Setup Guide - Memory Systems](../operations/MANUAL-SETUP-GUIDE.md#memory-systems-configuration)** ⭐
2. **[Graphiti MCP Deployment](../deployment/GRAPHITI-MCP-DEPLOYMENT-PLAN.md)**
3. **[Mem0 MCP Deployment](../deployment/MEM0-MCP-DEPLOYMENT-PLAN.md)**
4. **[AgentDB Integration](../integration/AGENTDB-INTEGRATION-GUIDE.md)**

---

### "I want to deploy on 4 PCs"
1. **[4-PC Deployment Guide](../deployment/4PC-DEPLOYMENT-GUIDE.md)** ⭐
2. **[4-PC Docker Deployment](../deployment/4PC-DOCKER-DEPLOYMENT-GUIDE.md)**
3. **[Physical PC Setup](../architecture/physical-pc-setup-implementation-guide.md)**

---

## 📊 Documentation Status

### ✅ Complete Documentation
- Core Infrastructure Setup
- Backend Databases (PostgreSQL, Redis, FalkorDB, Qdrant)
- Memory Systems (Letta, AgentDB)
- MCP Servers (Claude Flow, Archon, Infisical, Bitwarden, Git, Docker)
- Open WebUI Deployment
- Cloudflare Tunnel Setup
- 4-PC Distributed Architecture

### ⚠️ Needs Updates
- Mem0 MCP (deployment plan ready, needs activation)
- Graphiti MCP (deployment plan ready, needs configuration)
- Neo4j (optional, documentation minimal)

### ⏳ Planned
- n8n Workflows (specification complete, deployment pending)
- Advanced monitoring dashboards
- Backup and disaster recovery automation

---

## 🛠️ Essential Tools & Commands

### Docker Management
```bash
# Start all services
cd infra/docker
docker-compose up -d

# Check service health
docker ps
docker compose ps

# View logs
docker compose logs -f [service-name]

# Restart service
docker compose restart [service-name]
```

### MCP Server Management
```bash
# Start Claude Flow MCP
npx @claude-flow/cli@latest mcp start

# Check MCP status
curl http://localhost:3000/mcp/health

# Test specific MCP server
curl http://localhost:3100/health  # Claude Flow
curl http://localhost:8006/health  # Infisical
```

### Database Management
```bash
# PostgreSQL
docker exec -it nyra-postgres psql -U postgres

# Redis
docker exec -it nyra-redis redis-cli

# Qdrant
curl http://localhost:6333/collections
```

---

## 🔧 Troubleshooting Resources

### General Troubleshooting
- **[Manual Setup Guide - Troubleshooting](../operations/MANUAL-SETUP-GUIDE.md#troubleshooting)** ⭐
- **[Disaster Recovery Guide](../operations/DISASTER-RECOVERY-GUIDE.md)**

### Specific Issues
- **[Open WebUI Troubleshooting](../deployment/OPEN-WEBUI-CLOUDFLARE-TUNNEL-SETUP.md#troubleshooting)**
- **[MCP Server Troubleshooting](../deployment/MCP-SERVER-SETUP.md#troubleshooting)**
- **[Docker Troubleshooting](../deployment/DOCKER-MCP-SETUP.md#troubleshooting)**

### Common Issues
1. **Port conflicts**: Check `docker ps` and `netstat -ano | findstr :[PORT]`
2. **Container startup failures**: Check logs with `docker logs [container-name]`
3. **Network issues**: Verify `nyra-network` exists with `docker network ls`
4. **MCP connection failures**: Check MCP proxy health endpoint

---

## 📚 Additional Resources

### Architecture Documentation
- **[System Architecture](../architecture/system-architecture.md)**
- **[Memory Architecture](../architecture/README-DISTRIBUTED-MEMORY.md)**
- **[Infrastructure Consolidation](../architecture/INFRASTRUCTURE-CONSOLIDATION-PLAN.md)**

### Development Guides
- **[Development Setup](../guides/QUICK-START-DEVELOPMENT.md)**
- **[Claude Flow V3 Setup](../guides/CLAUDE-FLOW-V3-SETUP.md)**
- **[Testing Quickstart](../guides/TESTING-QUICKSTART.md)**

### Operations
- **[Cleanup Quick Reference](../operations/CLEANUP-QUICK-REFERENCE.md)**
- **[Wake-on-LAN Guide](../operations/WAKE-ON-LAN-GUIDE.md)**

---

## 🎓 Learning Path

### Beginner (Week 1)
1. Core infrastructure setup
2. Single database (PostgreSQL)
3. One MCP server (Claude Flow)
4. Basic Open WebUI deployment

### Intermediate (Week 2-3)
1. All databases configured
2. Multiple MCP servers
3. Memory systems operational
4. Cloudflare tunnel configured

### Advanced (Week 4+)
1. 4-PC distributed architecture
2. Advanced memory systems (Graphiti, Mem0)
3. Custom workflow automation
4. Performance optimization

---

## 🔗 External Documentation

- **[Docker Documentation](https://docs.docker.com/)**
- **[PostgreSQL Docs](https://www.postgresql.org/docs/)**
- **[Redis Documentation](https://redis.io/docs/)**
- **[Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)**
- **[Open WebUI Docs](https://docs.openwebui.com/)**
- **[Model Context Protocol](https://modelcontextprotocol.io/)**

---

## ✅ Deployment Readiness Checklist

Use this checklist to track your setup progress:

### Core Infrastructure
- ☐ Docker installed and running
- ☐ Docker Compose configured
- ☐ `nyra-network` Docker network created
- ☐ Infisical secrets configured
- ☐ Environment variables set

### Databases
- ☐ PostgreSQL running (port 5432)
- ☐ Redis running (port 6379)
- ☐ FalkorDB running (port 6380) [optional]
- ☐ Qdrant running (port 6333) [optional]

### Memory Systems
- ☐ Letta installed and configured (port 8283)
- ☐ AgentDB integrated in Claude Flow
- ☐ Memory persistence verified

### MCP Servers
- ☐ Claude Flow MCP running (port 3100)
- ☐ Infisical MCP running (port 8006)
- ☐ Bitwarden MCP running (port 8007)
- ☐ Git MCP configured (stdio)
- ☐ Docker MCP configured (stdio)

### Applications
- ☐ Nexus Router running (port 6000)
- ☐ Open WebUI configured (port 3333)
- ☐ Cloudflare tunnel operational

### Access & Security
- ☐ Cloudflare Access policies configured
- ☐ DNS routing verified
- ☐ SSL/TLS certificates valid
- ☐ Firewall rules configured

---

## 📝 Documentation Updates

**Last Major Update**: 2026-01-18

**Recent Additions**:
- Open WebUI Cloudflare Tunnel Setup (47KB guide)
- Open WebUI Deployment Complete (11KB summary)
- Automated deployment scripts
- Master setup guide consolidation

**Next Updates**:
- Advanced monitoring configuration
- Backup automation procedures
- Performance tuning guides

---

## 💬 Support & Feedback

For issues or questions:
1. Check troubleshooting sections in relevant guides
2. Review Docker/MCP logs
3. Consult the [Manual Setup Guide](../operations/MANUAL-SETUP-GUIDE.md)

---

**Navigation**: This is the master index for all setup documentation. Use the links above to access specific guides.

**Tip**: Bookmark this page for quick reference during setup!
