# Project Nyra - Master Setup Guide

**Last Updated**: 2026-01-18
**Difficulty**: Beginner to Advanced
**Estimated Total Time**: 3-7 days for complete setup
**Prerequisites**: See [Prerequisites Checklist](./01-PREREQUISITES-CHECKLIST.md)

---

## 🎯 Overview

This master guide orchestrates the complete setup of Project Nyra's infrastructure. It provides a structured approach to deploying all components in the correct order with proper dependencies.

### What Will Be Set Up

✅ **Core Infrastructure**: Docker, networking, secrets management
✅ **Backend Databases**: PostgreSQL, Redis, FalkorDB, Qdrant
✅ **Memory Systems**: Letta, AgentDB, Graphiti, Mem0
✅ **MCP Servers**: 8+ servers for AI agent tools
✅ **Applications**: Open WebUI, LobeChat, Nexus Router
✅ **Cloud Services**: Cloudflare tunnels, external access
✅ **4-PC Architecture**: Distributed GPU compute (optional)

---

## 📋 Setup Phases

### Phase 1: Foundation (Day 1) - **CRITICAL**
[Estimated Time: 2-4 hours]

**Goal**: Establish core infrastructure and essential services

1. **Prerequisites Verification** [30 minutes]
   - Follow: [Prerequisites Checklist](./01-PREREQUISITES-CHECKLIST.md)
   - Install Docker, Node.js, Git
   - Verify network connectivity
   - Check system resources

2. **Docker Environment Setup** [30 minutes]
   - Read: [Docker Infrastructure Setup](../deployment/DOCKER-MCP-SETUP.md)
   - Create `nyra-network` Docker network
   - Configure Docker Compose files
   - Test Docker installation

   ```bash
   # Create network
   docker network create nyra-network

   # Verify
   docker network ls | grep nyra-network
   ```

3. **Secrets Management** [45 minutes]
   - Read: [Infisical MCP Setup](../deployment/INFISICAL-MCP-SETUP.md)
   - Install Infisical CLI
   - Create Infisical project
   - Configure service tokens
   - Set up environment variables

   ```bash
   # Install Infisical
   # Windows (PowerShell)
   iwr https://app.infisical.com/api/download/cli/windows -OutFile infisical.exe

   # macOS/Linux
   curl -1sLf 'https://dl.infisical.com/scripts/install.sh' | bash

   # Login
   infisical login

   # Create project or link existing
   infisical init
   ```

4. **PostgreSQL Database** [30 minutes]
   - Read: [Manual Setup Guide - Databases](../operations/MANUAL-SETUP-GUIDE.md#backend-database-setup)
   - Deploy PostgreSQL container
   - Create application databases
   - Configure users and permissions

   ```bash
   # Start PostgreSQL
   docker run -d \
     --name nyra-postgres \
     --network nyra-network \
     -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
     -e POSTGRES_DB=nyra \
     -p 5432:5432 \
     -v postgres_data:/var/lib/postgresql/data \
     postgres:16-alpine

   # Create databases
   docker exec nyra-postgres psql -U postgres -c "CREATE DATABASE openwebui;"
   docker exec nyra-postgres psql -U postgres -c "CREATE DATABASE letta;"
   docker exec nyra-postgres psql -U postgres -c "CREATE DATABASE nexus;"
   ```

5. **Redis Cache** [15 minutes]
   - Deploy Redis container
   - Configure persistence
   - Test connectivity

   ```bash
   # Start Redis
   docker run -d \
     --name nyra-redis \
     --network nyra-network \
     -p 6379:6379 \
     -v redis_data:/data \
     redis:7-alpine redis-server --appendonly yes

   # Test
   docker exec nyra-redis redis-cli ping
   # Expected: PONG
   ```

**Phase 1 Verification Checklist**:
- ☐ Docker network `nyra-network` exists
- ☐ Infisical CLI authenticated
- ☐ PostgreSQL accepting connections
- ☐ Redis responding to PING
- ☐ Environment variables configured

---

### Phase 2: Memory & Intelligence (Day 2)
[Estimated Time: 3-5 hours]

**Goal**: Deploy memory systems and vector databases

1. **Letta Memory System** [45 minutes]
   - Read: [Manual Setup Guide - Memory Systems](../operations/MANUAL-SETUP-GUIDE.md#memory-systems-configuration)
   - Install Letta
   - Configure PostgreSQL backend
   - Start Letta server

   ```bash
   # Install Letta
   pip install letta

   # Configure
   export LETTA_PG_URI="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/letta"

   # Start server
   letta server --port 8283
   ```

2. **AgentDB Integration** [30 minutes]
   - Read: [AgentDB Integration Guide](../integration/AGENTDB-INTEGRATION-GUIDE.md)
   - Verify AgentDB is included in Claude Flow
   - Configure vector storage
   - Test pattern storage

   ```bash
   # AgentDB is integrated in Claude Flow - verify
   npx claude-flow@alpha hooks intelligence --showStatus true
   ```

3. **Qdrant Vector Database** [30 minutes] (Optional but recommended)
   - Deploy Qdrant container
   - Create collections
   - Test vector search

   ```bash
   # Start Qdrant
   docker run -d \
     --name nyra-qdrant \
     --network nyra-network \
     -p 6333:6333 \
     -p 6334:6334 \
     -v qdrant_data:/qdrant/storage \
     qdrant/qdrant:latest

   # Test
   curl http://localhost:6333/collections
   ```

4. **FalkorDB Graph Database** [30 minutes] (Optional)
   - Deploy FalkorDB
   - Configure for Graphiti MCP

   ```bash
   # Start FalkorDB
   docker run -d \
     --name nyra-falkordb \
     --network nyra-network \
     -p 6380:6379 \
     -v falkordb_data:/data \
     falkordb/falkordb:latest
   ```

5. **Graphiti MCP** [45 minutes] (Optional - Advanced)
   - Read: [Graphiti MCP Deployment](../deployment/GRAPHITI-MCP-DEPLOYMENT-PLAN.md)
   - Configure FalkorDB backend
   - Deploy Graphiti container
   - Test knowledge graph

6. **Mem0 MCP** [30 minutes] (Optional - Advanced)
   - Read: [Mem0 MCP Deployment](../deployment/MEM0-MCP-DEPLOYMENT-PLAN.md)
   - Configure Qdrant backend
   - Deploy Mem0 container

**Phase 2 Verification Checklist**:
- ☐ Letta server responding (port 8283)
- ☐ AgentDB integrated in Claude Flow
- ☐ Qdrant accepting connections (port 6333)
- ☐ FalkorDB operational (port 6380)
- ☐ Memory systems tested

---

### Phase 3: MCP Servers (Day 2-3)
[Estimated Time: 3-4 hours]

**Goal**: Deploy Model Context Protocol servers for AI agent tools

1. **Claude Flow MCP** [30 minutes]
   - Read: [MCP Server Setup](../deployment/MCP-SERVER-SETUP.md)
   - Start Claude Flow MCP server
   - Verify swarm capabilities

   ```bash
   # Start Claude Flow MCP
   npx claude-flow@alpha mcp start

   # Verify
   curl http://localhost:3100/health
   ```

2. **Infisical MCP** [30 minutes]
   - Read: [Infisical MCP Setup](../deployment/INFISICAL-MCP-SETUP.md)
   - Deploy Infisical MCP container
   - Configure service token
   - Test secret retrieval

   ```bash
   # Start Infisical MCP
   cd infra/infisical-mcp
   docker-compose up -d

   # Verify
   curl http://localhost:8006/health
   ```

3. **Bitwarden MCP** [30 minutes]
   - Read: [Bitwarden MCP Setup](../deployment/BITWARDEN-MCP-SETUP.md)
   - Deploy Bitwarden MCP container
   - Configure BWS token
   - Test credential access

   ```bash
   # Start Bitwarden MCP
   cd infra/bitwarden-mcp
   docker-compose up -d

   # Verify
   curl http://localhost:8007/health
   ```

4. **Git MCP** [20 minutes]
   - Read: [Git MCP README](../../infra/git-mcp/README.md)
   - Build Git MCP Docker image
   - Configure workspace bind mount
   - Test git operations

5. **Docker MCP** [20 minutes]
   - Read: [Docker MCP Setup](../deployment/DOCKER-MCP-SETUP.md)
   - Build Docker MCP image
   - Configure Docker socket access
   - Test container operations

6. **DockerHub MCP** [20 minutes]
   - Read: [DockerHub MCP Setup](../deployment/DOCKERHUB-MCP-SETUP.md)
   - Configure DockerHub credentials
   - Test image search and pull

7. **Sequential Thinking MCP** [20 minutes]
   - Read: [Sequential Thinking MCP Setup](../deployment/SEQUENTIAL-THINKING-MCP-SETUP.md)
   - Deploy container
   - Test chain-of-thought reasoning

**Phase 3 Verification Checklist**:
- ☐ Claude Flow MCP responding (port 3100)
- ☐ Infisical MCP operational (port 8006)
- ☐ Bitwarden MCP operational (port 8007)
- ☐ Git MCP configured (stdio)
- ☐ Docker MCP configured (stdio)
- ☐ All MCP servers registered in `.mcp.json`

---

### Phase 4: LLM Routing & Applications (Day 3)
[Estimated Time: 2-4 hours]

**Goal**: Deploy Nexus Router and user-facing applications

1. **Nexus Router** [45 minutes]
   - Read: [Nexus Router Deployment](../deployment/NEXUS-ROUTER-DEPLOYMENT-PLAN.md)
   - Deploy Nexus Router container
   - Configure LLM providers (Claude, OpenAI, etc.)
   - Connect to MCP proxy
   - Test routing

   ```bash
   # Start Nexus Router
   cd services/nexus-router
   pnpm install
   pnpm dev

   # Verify
   curl http://localhost:6000/health
   curl http://localhost:6000/mcp/health
   ```

2. **Open WebUI** [60 minutes]
   - Read: [Open WebUI Deployment Complete](../deployment/OPEN-WEBUI-DEPLOYMENT-COMPLETE.md)
   - Deploy Open WebUI container
   - Configure PostgreSQL database
   - Connect to Nexus Router
   - Test local access

   ```bash
   # Start Open WebUI
   cd infra/docker
   .\start-ui.ps1

   # Verify
   curl http://localhost:3333/health
   ```

3. **Cloudflare Tunnel** [60 minutes] (For external access)
   - Read: [Open WebUI Cloudflare Tunnel Setup](../deployment/OPEN-WEBUI-CLOUDFLARE-TUNNEL-SETUP.md)
   - Configure cloudflared
   - Set up DNS routing
   - Configure Cloudflare Access
   - Test external access

   ```bash
   # Use automated script
   cd scripts/cloudflared
   .\deploy-open-webui-tunnel.ps1

   # Or manual setup - follow guide
   ```

4. **LobeChat** [30 minutes] (Optional)
   - Read: [LobeChat Deployment](../deployment/LOBECHAT-DEPLOYMENT.md)
   - Deploy LobeChat container
   - Configure database
   - Test interface

**Phase 4 Verification Checklist**:
- ☐ Nexus Router routing requests (port 6000)
- ☐ Open WebUI accessible locally (port 3333)
- ☐ Cloudflare tunnel operational (optional)
- ☐ External access working (optional)
- ☐ LLM responses working

---

### Phase 5: Distributed Architecture (Week 2) [OPTIONAL]
[Estimated Time: 1-2 weeks]

**Goal**: Deploy across 4 PCs for distributed GPU compute

1. **4-PC Architecture Planning** [Day 1]
   - Read: [4-PC Deployment Guide](../deployment/4PC-DEPLOYMENT-GUIDE.md)
   - Read: [Physical PC Setup](../architecture/physical-pc-setup-implementation-guide.md)
   - Plan service distribution
   - Configure network
   - Prepare each PC

2. **Network Configuration** [Day 1-2]
   - Configure 10GbE network
   - Set up static IP addresses
   - Configure DNS
   - Test connectivity

3. **Per-PC Deployment** [Day 2-4]
   - Read: [4-PC Docker Deployment](../deployment/4PC-DOCKER-DEPLOYMENT-GUIDE.md)
   - Deploy services to each PC:
     - **PC1 (Orchestrator)**: Nexus Router, Open WebUI, PostgreSQL, Redis
     - **PC2 (RTX 5090)**: Claude Flow, GPU compute
     - **PC3 (RTX 3090 Ti)**: Archon OS, GPU compute
     - **PC4 (RTX 3060)**: Backup services, GPU compute

4. **Cloudflared Tunnels** [Day 4-5]
   - Configure tunnel per PC
   - Set up DNS routing
   - Configure Access policies

5. **Verification & Testing** [Day 5-7]
   - Test cross-PC communication
   - Verify GPU affinity
   - Load testing
   - Performance tuning

**Phase 5 Verification Checklist**:
- ☐ All 4 PCs networked (10GbE)
- ☐ Services distributed correctly
- ☐ GPU compute operational on workers
- ☐ Cross-PC communication working
- ☐ Cloudflare tunnels per PC
- ☐ Load balancing functional

---

## 🔧 Post-Setup Tasks

### 1. Security Hardening [1-2 hours]
- Configure firewall rules
- Set up Cloudflare Access policies
- Rotate default passwords
- Enable audit logging
- Configure backup encryption

### 2. Monitoring Setup [1-2 hours]
- Deploy Prometheus
- Deploy Grafana
- Configure dashboards
- Set up alerts
- Enable log aggregation

### 3. Backup Configuration [1 hour]
- Automated database backups
- Volume snapshots
- Configuration backups
- Test restore procedures

### 4. Documentation [30 minutes]
- Document custom configurations
- Record credentials (in vault)
- Update network diagram
- Create runbooks

---

## 📊 Success Criteria

### Minimum Viable Setup (Phase 1-3)
- ✅ Core infrastructure operational
- ✅ PostgreSQL and Redis running
- ✅ At least 3 MCP servers active
- ✅ Letta memory system functional
- ✅ Local access to all services

### Production Ready (Phase 1-4)
- ✅ All databases operational
- ✅ All 8+ MCP servers active
- ✅ Memory systems configured
- ✅ Nexus Router routing requests
- ✅ Open WebUI accessible externally
- ✅ Cloudflare tunnel configured
- ✅ Access controls in place

### Enterprise Grade (Phase 1-5)
- ✅ 4-PC distributed architecture
- ✅ GPU compute load-balanced
- ✅ High availability configured
- ✅ Monitoring and alerting active
- ✅ Automated backups running
- ✅ Disaster recovery tested

---

## 🚨 Critical Dependencies

**Phase 1 Dependencies** (MUST complete first):
- Docker installed
- Network created
- Secrets management configured

**Phase 2 Dependencies** (Requires Phase 1):
- PostgreSQL running
- Redis running

**Phase 3 Dependencies** (Requires Phase 1-2):
- Docker environment ready
- Databases operational

**Phase 4 Dependencies** (Requires Phase 1-3):
- MCP servers operational
- Memory systems configured

**Phase 5 Dependencies** (Requires Phase 1-4):
- All single-PC setup complete
- Network infrastructure ready

---

## 🔍 Troubleshooting

### Common Issues

**Docker containers won't start**:
- Check: `docker ps -a`
- Logs: `docker logs [container-name]`
- Network: `docker network inspect nyra-network`

**MCP servers not connecting**:
- Verify: MCP server health endpoints
- Check: `.mcp.json` configuration
- Test: `curl http://localhost:[PORT]/health`

**Database connection failures**:
- Verify: Container is running
- Check: Environment variables
- Test: Connection string

**Memory/Performance issues**:
- Check: `docker stats`
- Review: Resource limits in docker-compose
- Consider: Increasing Docker memory allocation

**External access not working**:
- Verify: Cloudflare tunnel running
- Check: DNS propagation (may take 5-10 minutes)
- Test: `nslookup [subdomain.domain.com]`

### Getting Help

1. Check relevant troubleshooting sections in component guides
2. Review Docker logs: `docker compose logs -f`
3. Verify prerequisites are met
4. Check [Manual Setup Guide - Troubleshooting](../operations/MANUAL-SETUP-GUIDE.md#troubleshooting)

---

## 📚 Related Documentation

### Essential Guides
- **[Prerequisites Checklist](./01-PREREQUISITES-CHECKLIST.md)** - System requirements
- **[Manual Setup Guide](../operations/MANUAL-SETUP-GUIDE.md)** - Comprehensive reference
- **[Setup Guide Index](./README.md)** - Complete documentation map

### Phase-Specific Guides
- **Phase 1**: [Docker MCP Setup](../deployment/DOCKER-MCP-SETUP.md)
- **Phase 2**: [Memory Systems Configuration](../operations/MANUAL-SETUP-GUIDE.md#memory-systems-configuration)
- **Phase 3**: [MCP Server Setup](../deployment/MCP-SERVER-SETUP.md)
- **Phase 4**: [Open WebUI Cloudflare Tunnel](../deployment/OPEN-WEBUI-CLOUDFLARE-TUNNEL-SETUP.md)
- **Phase 5**: [4-PC Deployment Guide](../deployment/4PC-DEPLOYMENT-GUIDE.md)

---

## 🎯 Quick Start Paths

### Path 1: Minimal Setup (1 day)
**Goal**: Get Open WebUI running locally
1. Phase 1: Core Infrastructure
2. Phase 3: Essential MCP servers (Claude Flow, Infisical)
3. Phase 4: Nexus Router + Open WebUI (local only)

### Path 2: Production Setup (3 days)
**Goal**: Full single-PC deployment with external access
1. Phase 1: Core Infrastructure
2. Phase 2: Memory Systems
3. Phase 3: All MCP Servers
4. Phase 4: Applications + Cloudflare

### Path 3: Enterprise Setup (2 weeks)
**Goal**: Distributed 4-PC architecture
1. Phase 1: Core Infrastructure
2. Phase 2: Memory Systems
3. Phase 3: All MCP Servers
4. Phase 4: Applications + Cloudflare
5. Phase 5: 4-PC Distributed Architecture

---

## ✅ Deployment Checklist

Track your progress:

### Phase 1: Foundation
- ☐ Prerequisites verified
- ☐ Docker environment ready
- ☐ Secrets management configured
- ☐ PostgreSQL running
- ☐ Redis running

### Phase 2: Memory & Intelligence
- ☐ Letta configured
- ☐ AgentDB integrated
- ☐ Vector databases operational
- ☐ Memory systems tested

### Phase 3: MCP Servers
- ☐ Claude Flow MCP
- ☐ Infisical MCP
- ☐ Bitwarden MCP
- ☐ Git MCP
- ☐ Docker MCP
- ☐ DockerHub MCP
- ☐ Sequential Thinking MCP
- ☐ All registered in config

### Phase 4: Applications
- ☐ Nexus Router operational
- ☐ Open WebUI deployed
- ☐ Cloudflare tunnel configured
- ☐ External access working

### Phase 5: Distributed (Optional)
- ☐ 4-PC network configured
- ☐ Services distributed
- ☐ GPU compute operational
- ☐ Cross-PC communication verified

---

**Last Updated**: 2026-01-18
**Maintainer**: Project Nyra Team
**Status**: Complete and tested

**Ready to start?** Begin with [Prerequisites Checklist](./01-PREREQUISITES-CHECKLIST.md)
