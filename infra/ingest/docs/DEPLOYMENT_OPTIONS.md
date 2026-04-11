# Project Nyra - Deployment Options

**Version**: 3.1.1 (Extended with Cloud & AI Stacks)
**Date**: March 5, 2026

This document covers the **three deployment stacks** available in Project Nyra, each optimized for different use cases.

---

## 🏠 **Local Development Stack** (Default)

**File**: `infra/compose/docker-compose.main.yml`
**Target**: 4-PC local cluster development

### **Architecture**
- **Orchestrator Mini PC**: Claude Flow, Archon OS, Nexus Router
- **GPU Worker 1**: Ollama, Neo4j, FalkorDB
- **GPU Worker 2**: TwentyCRM, n8n, Dify, Redis
- **GPU Worker 3**: Prometheus, Grafana, Loki

### **Services** (15+ containers)
```yaml
Core Infrastructure:
  - Nexus Router (6000) - LLM Gateway
  - TwentyCRM (3000) - Customer relationship management
  - Letta (8283) - Conversation memory
  - Mem0 (4321) - Universal knowledge store
  - n8n (5678) - Workflow automation
  - Dify (3001) - Borrower chat interface

Business Services:
  - Quote Engine (8001) - Mortgage calculations
  - Campaign Engine (8002) - Drip automation
  - Nyra Orchestrator (8010) - Master coordination
  - RateHunter API (8003) - REST API gateway

Frontend Applications:
  - RateHunter Web (3100) - Customer portal
  - Nyra Admin (3101) - Operations dashboard

Data & Observability:
  - PostgreSQL (5432) - Primary database
  - Redis (6379) - Caching and sessions
  - Prometheus (9090) - Metrics collection
  - Grafana (3005) - Monitoring dashboards
  - Loki (3100) - Log aggregation
```

### **Deployment Commands**
```bash
# Initialize and start
make init
make up

# Health check
make health

# View logs
make logs

# Stop services
make down
```

### **Resource Requirements**
- **Total RAM**: 16-32GB across 4 PCs
- **Storage**: 2TB+ distributed storage
- **Network**: Tailscale VPN mesh
- **GPU**: RTX 3060+ on workers (optional but recommended)

---

## ☁️ **Oracle Cloud Stack** (Production)

**File**: `infra/compose/docker-compose.oracle-cloud.yml`
**Target**: Oracle Cloud Always Free Tier

### **Architecture**
- **Single VM**: VM.Standard.A1.Flex (4 OCPU / 24GB RAM)
- **Cost**: Always Free (no charges if used 24/7 within limits)
- **Access**: Cloudflare Tunnel for secure external access

### **Services** (Memory Optimized)
```yaml
Core Infrastructure:
  - PostgreSQL (16) - Primary database (2GB limit)
  - Redis (7) - Cache and sessions (512MB limit)

Graph Database Options (Choose one):
  - FalkorDB - Redis-based graph (1GB limit)
  - Neo4j - Full graph features (2GB limit)

Mortgage Platform:
  - Nexus Router - LLM gateway (1GB limit)
  - Quote Engine - Rate calculations (512MB limit)
  - RateHunter Web - Customer interface (512MB limit)

Optional:
  - Cloudflare Tunnel - External access (128MB limit)
```

### **Deployment Commands**
```bash
# Deploy with FalkorDB (lighter)
make oracle-up
# Choose option 1

# Deploy with Neo4j (full features)
make oracle-up
# Choose option 2

# Add Cloudflare Tunnel
export CLOUDFLARE_TUNNEL_TOKEN=your_token
make oracle-tunnel

# Stop deployment
make oracle-down
```

### **Profile Options**
- **graph_falkordb**: Redis-based graph database (recommended for Always Free)
- **graph_neo4j**: Full Neo4j graph features (requires more RAM)
- **cloudflared**: Secure tunnel for external access

### **Resource Limits**
```yaml
Service Resource Allocation:
  - PostgreSQL: 2GB RAM, 1.0 CPU
  - Redis: 512MB RAM, 0.5 CPU
  - FalkorDB: 1GB RAM, 0.5 CPU
  - Neo4j: 2GB RAM, 1.0 CPU
  - Nexus Router: 1GB RAM, 1.0 CPU
  - Quote Engine: 512MB RAM, 0.5 CPU
  - RateHunter Web: 512MB RAM, 0.5 CPU
  - Cloudflare Tunnel: 128MB RAM, 0.2 CPU

Total: ~7-8GB RAM, ~4 CPU cores (within Always Free limits)
```

### **Oracle Cloud Setup**
```bash
# 1. Create Oracle Cloud Always Free account
# 2. Create VM.Standard.A1.Flex instance
# 3. Install Docker and Docker Compose
# 4. Clone Project Nyra repository
# 5. Configure environment variables
# 6. Deploy with Oracle profile
```

---

## 🚀 **Apotheosis AI Stack** (Development)

**File**: `infra/compose/docker-compose.apotheosis.yml`
**Target**: AI-powered development environment

### **Architecture**
- **Git Service**: Self-hosted Gitea for code management
- **Vector Database**: Qdrant for AI embeddings and search
- **AI Code Review**: Qodo Merge for automated code analysis
- **Flow Orchestration**: AI agent coordination system

### **Services** (AI Development Focus)
```yaml
Development Infrastructure:
  - PostgreSQL Dev (5432) - Development database
  - Gitea (3000) - Git service with web UI
  - Qdrant (6333) - Vector database for embeddings
  - Qdrant Dashboard (6336) - Vector search interface

AI Development Tools:
  - Qodo Merge (5600) - AI-powered code review
  - Flow Orchestrator (8500) - Agent coordination
  - SonarQube (9000) - Code quality analysis [quality profile]

Optional AI Models [ai-models profile]:
  - Ollama (11434) - Local LLM serving
  - Open WebUI (8080) - Chat interface for models
```

### **Deployment Commands**
```bash
# Basic AI stack (Gitea + Qdrant + Flow)
make apotheosis-up
# Choose option 1

# With code quality tools
make apotheosis-up
# Choose option 2

# Full AI development environment
make apotheosis-up
# Choose option 3

# Stop AI stack
make apotheosis-down
```

### **Profile Options**
- **Basic**: Gitea, Qdrant, Flow Orchestrator, Qodo Merge
- **Quality**: Basic + SonarQube code analysis
- **AI Models**: Quality + Ollama + Open WebUI

### **Use Cases**
```yaml
AI Development Workflows:
  - Vector search for code similarity
  - Automated AI code review with Qodo
  - Local LLM development and testing
  - Agent flow development and coordination
  - Code quality monitoring with SonarQube

Integration Capabilities:
  - GitHub integration via Gitea mirroring
  - CI/CD pipeline automation
  - AI-assisted documentation generation
  - Semantic code search and analysis
  - Multi-agent development coordination
```

### **GPU Requirements**
- **Optional** for basic profile
- **Recommended** for ai-models profile (Ollama)
- **RTX 3060+** for local LLM inference

---

## 🔄 **Hybrid Deployment Patterns**

### **Development + Production**
```bash
# Local development environment
make up

# Oracle Cloud production deployment
make oracle-up

# AI development tools
make apotheosis-up
```
**Use case**: Develop locally, deploy to Oracle Cloud, use AI tools for enhancement

### **AI-Enhanced Local Development**
```bash
# Full local stack + AI tools
make up
make apotheosis-up
```
**Use case**: Maximum development capability with AI assistance

### **Cloud Development Environment**
```bash
# Oracle Cloud + AI tools on cloud VM
make oracle-up
make apotheosis-up
```
**Use case**: Cloud-based development with cost optimization

---

## 📊 **Comparison Matrix**

| Feature | Local Development | Oracle Cloud | Apotheosis AI |
|---------|------------------|---------------|---------------|
| **Target** | Full platform development | Production deployment | AI development |
| **Cost** | Hardware investment | Always Free | Development tools |
| **Performance** | High (dedicated hardware) | Medium (shared cloud) | High (local/cloud) |
| **Scalability** | 4-PC cluster | Single VM | Horizontal scaling |
| **AI Features** | Basic LLM integration | Cost-optimized LLM | Advanced AI tools |
| **Compliance** | Full TILA/RESPA | Production ready | Development/testing |
| **External Access** | Tailscale/Cloudflare | Cloudflare Tunnel | Local/VPN only |

---

## 🛠 **Configuration Guidelines**

### **Environment Variables by Stack**

#### **All Stacks (Required)**
```bash
# Core database
POSTGRES_PASSWORD=your_secure_password

# LLM providers
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key

# External services
TWILIO_ACCOUNT_SID=your_twilio_sid
SENDGRID_API_KEY=your_sendgrid_key
```

#### **Oracle Cloud (Additional)**
```bash
# Graph database
NEO4J_PASSWORD=your_neo4j_password

# External access
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token
```

#### **Apotheosis AI (Additional)**
```bash
# Development database
DEV_POSTGRES_PASSWORD=your_dev_password

# AI integrations
GITHUB_TOKEN=your_github_token
OPENAI_API_KEY=your_openai_key
```

### **Port Allocation by Stack**

#### **Local Development Ports**
- **3000-3101**: Frontend applications (CRM, RateHunter, Admin)
- **5000-6000**: Infrastructure (n8n, Nexus Router)
- **8000-8010**: Business services (Quote, Campaign, Orchestrator)
- **9000-9100**: Monitoring (Prometheus, Grafana)

#### **Oracle Cloud Ports**
- **3100**: RateHunter Web (public)
- **6000**: Nexus Router (internal)
- **6333**: FalkorDB/Neo4j (internal)
- **8001**: Quote Engine (internal)

#### **Apotheosis AI Ports**
- **3000**: Gitea (Git service)
- **5600**: Qodo Merge (AI review)
- **6333**: Qdrant (Vector DB)
- **8080**: Open WebUI (Chat)
- **8500**: Flow Orchestrator
- **9000**: SonarQube (Quality)
- **11434**: Ollama (LLM serving)

---

## 🚀 **Migration Strategies**

### **Local → Oracle Cloud**
```bash
# 1. Export data from local deployment
make backup

# 2. Deploy to Oracle Cloud
make oracle-up

# 3. Import data to cloud deployment
make restore-to-oracle
```

### **Development → Production**
```bash
# 1. Test locally with production config
make up ENVIRONMENT=production

# 2. Deploy to Oracle Cloud
make oracle-up

# 3. Validate production deployment
make oracle-health
```

### **Add AI Development Tools**
```bash
# To existing deployment
make apotheosis-up

# Integrate with main platform
docker network connect nyra-network nyra-flow-orchestrator
```

---

## 📚 **Additional Resources**

- **Local Development**: [docs/development/local-setup.md](development/local-setup.md)
- **Oracle Cloud Guide**: [docs/deployment/oracle-cloud.md](deployment/oracle-cloud.md)
- **AI Stack Documentation**: [docs/development/ai-stack.md](development/ai-stack.md)
- **Hybrid Deployments**: [docs/deployment/hybrid-patterns.md](deployment/hybrid-patterns.md)
- **Troubleshooting**: [docs/troubleshooting/deployment-issues.md](troubleshooting/deployment-issues.md)

---

**Last Updated**: March 5, 2026
**Next Review**: June 5, 2026