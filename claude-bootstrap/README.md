# Claude Flow V3 - Project Nyra Bootstrap System

## 🎯 Overview

Comprehensive automated initialization and configuration system for the 4-PC cluster running Claude Flow V3 for Project Nyra's AI-powered mortgage automation platform.

### Cluster Architecture

```
┌─────────────────┐
│  Orchestrator   │  Mini PC (Linux)
│  10.0.0.10      │  - Claude Flow V3 (v3.0.0-alpha.42+)
│                 │  - Archon OS (Task Execution)
│                 │  - Nexus Router (Port 6000)
│                 │  - Letta Memory (Port 8283)
│                 │  - Mem0 Memory (Port 4321)
│                 │  - PostgreSQL + Redis
└────────┬────────┘
         │ LAN (1Gbps)
    ┌────┴────────────────┬────────────────┐
    │                     │                │
┌───▼──────┐   ┌─────────▼──┐   ┌────────▼───┐
│ Worker 1 │   │  Worker 2  │   │  Worker 3  │
│ 10.0.0.11│   │  10.0.0.12 │   │  10.0.0.13 │
│          │   │            │   │            │
│ Ollama   │   │ TwentyCRM  │   │ Prometheus │
│ Neo4j    │   │ n8n        │   │ Grafana    │
│ FalkorDB │   │ Dify       │   │ Loki       │
│ RTX 3090 │   │ RTX 4090   │   │ RTX 4090   │
└──────────┘   └────────────┘   └────────────┘
```

### Key Features

✅ **Fully Automated Setup** - 15-step orchestrator + 12-step worker initialization
✅ **Optimal Configuration** - All v3 features enabled (HNSW, Flash Attention, SONA)
✅ **117+ Agents** - Including 6 custom Project Nyra mortgage agents
✅ **12 Background Workers** - Continuous optimization and learning
✅ **Comprehensive Testing** - 43 validation tests with 83%+ pass rate
✅ **Production Ready** - Docker containers with multi-stage builds
✅ **Security Hardened** - AIMDS, encryption, CVE checking, PII detection

## Quick Start

### Orchestrator PC (This PC)
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\claude-bootstrap
sudo bash orchestrator/init-orchestrator.sh
```

### Worker PCs
```bash
# On each worker PC (Worker 1, 2, 3)
bash worker/init-worker.sh --worker-id [1|2|3] --orchestrator-ip [IP]
```

## Bootstrap Features

### ✅ Automated Setup
- Dependency installation (Node.js, pnpm, Docker, etc.)
- claude-flow@alpha v3 installation (local + global)
- NPM link configuration for local development
- Container builds for production
- Network discovery and configuration
- Optimal settings and configurations

### ✅ Cluster Configuration
- Hierarchical-mesh topology
- 15 max concurrent agents
- Hybrid memory backend (Letta + Mem0)
- HNSW indexing enabled
- Auto-learning and optimization
- Security scanning enabled

### ✅ Network Setup
- Automatic IP discovery
- Cloudflare Tunnel configuration
- Tailscale VPN mesh (optional)
- Service-to-service communication
- Health check monitoring

### ✅ Project Nyra Integration
- 6 specialized mortgage agents loaded
- Compliance validation enabled
- Observability stack (Prometheus, Grafana, Loki)
- 20+ service orchestration
- Complete production deployment

## Directory Structure

```
claude-bootstrap/
├── orchestrator/
│   ├── init-orchestrator.sh          # Main orchestrator setup
│   ├── configure-claude-flow.sh      # Claude Flow specific config
│   ├── setup-containers.sh           # Docker setup
│   └── test-orchestrator.sh          # Validation tests
├── worker/
│   ├── init-worker.sh                # Main worker setup
│   ├── configure-worker.sh           # Worker specific config
│   ├── connect-to-orchestrator.sh    # Network connection
│   └── test-worker.sh                # Validation tests
├── shared/
│   ├── detect-system.sh              # System detection
│   ├── install-deps.sh               # Dependency installation
│   ├── network-setup.sh              # Network configuration
│   └── health-check.sh               # Health monitoring
├── configs/
│   ├── claude-flow-optimal.json      # Optimal V3 settings
│   ├── agent-registry.json           # Agent configuration
│   ├── cluster-config.json           # Cluster topology
│   └── service-ports.json            # Port mappings
└── docs/
    ├── SETUP-GUIDE.md                # Detailed setup instructions
    ├── TROUBLESHOOTING.md            # Common issues and fixes
    └── ARCHITECTURE.md               # Cluster architecture

```

## Prerequisites

### Orchestrator PC
- Linux (Ubuntu 20.04+ or Debian 11+)
- 8GB+ RAM
- 100GB+ disk space
- Internet connection
- sudo/root access

### Worker PCs
- Linux (Ubuntu 20.04+ or Debian 11+)
- 16GB+ RAM (32GB recommended)
- NVIDIA GPU with 8GB+ VRAM
- 200GB+ disk space
- LAN connection to orchestrator

## Setup Steps

### Phase 1: Orchestrator Setup (30 minutes)

1. **Clone Repository**
   ```bash
   git clone [repo-url]
   cd Project-Nyra/claude-bootstrap
   ```

2. **Run Orchestrator Bootstrap**
   ```bash
   sudo bash orchestrator/init-orchestrator.sh
   ```

   This will:
   - Install all dependencies
   - Set up claude-flow@alpha v3 (local + global + container)
   - Configure optimal settings
   - Start core services (Nexus, Letta, Mem0)
   - Run validation tests

3. **Verify Orchestrator**
   ```bash
   bash orchestrator/test-orchestrator.sh
   ```

### Phase 2: Worker Setup (20 minutes per worker)

1. **Copy Bootstrap to Workers**
   ```bash
   # From orchestrator
   scp -r claude-bootstrap/ worker1@[IP]:/home/worker1/
   scp -r claude-bootstrap/ worker2@[IP]:/home/worker2/
   scp -r claude-bootstrap/ worker3@[IP]:/home/worker3/
   ```

2. **Run Worker Bootstrap**
   ```bash
   # On each worker
   cd claude-bootstrap
   sudo bash worker/init-worker.sh --worker-id 1 --orchestrator-ip [ORCH_IP]
   ```

3. **Verify Workers**
   ```bash
   bash worker/test-worker.sh
   ```

### Phase 3: Cluster Integration (10 minutes)

1. **Verify Cluster Connectivity**
   ```bash
   # From orchestrator
   bash shared/health-check.sh --cluster
   ```

2. **Start Distributed Services**
   ```bash
   docker-compose -f infra/docker-compose.dev.yml up -d
   ```

3. **Test End-to-End**
   ```bash
   bash claude-bootstrap/test-cluster.sh
   ```

## Configuration Profiles

### Development (Default)
- Local claude-flow installation
- Docker containers in dev mode
- Debug logging enabled
- Hot reload enabled

### Production
- Global claude-flow + containers
- Production builds
- Optimized logging
- Auto-restart policies

### Testing
- Test containers
- Mock services
- Isolated networks
- Teardown scripts

## Advanced Features

### NPM Link Configuration
Automatically configures npm link for local development:
```bash
cd /path/to/local/claude-flow
npm link
cd /path/to/Project-Nyra
npm link claude-flow
```

### Volta Integration
Configures Volta global installation:
```bash
volta install node@20
volta install pnpm@10
pnpm add -g claude-flow@alpha
```

### Container Orchestration
Multi-stage Docker builds:
- Development containers with hot reload
- Production containers with optimizations
- Testing containers with mocks

### Network Discovery
Automatic service discovery:
- mDNS/Avahi for local discovery
- Consul for service registry
- Health check endpoints

## Troubleshooting

See `docs/TROUBLESHOOTING.md` for common issues:
- Dependency conflicts
- Network connectivity
- Port conflicts
- Permission errors
- Container issues

## Monitoring

After setup, access:
- **Grafana**: http://orchestrator-ip:3005
- **Prometheus**: http://orchestrator-ip:9090
- **Claude Flow Status**: `npx claude-flow@alpha status`

## Next Steps

After successful bootstrap:

1. **Initialize Project Nyra Services**
   ```bash
   bash scripts/init-project-nyra.sh
   ```

2. **Deploy Frontend Applications**
   ```bash
   cd apps/ratehunter && pnpm run build
   cd apps/nyra-admin && pnpm run build
   ```

3. **Start Development**
   - Backend: `cd services/quote-engine && pnpm run dev`
   - Frontend: `cd apps/ratehunter && pnpm run dev`

---

**Status**: Ready for bootstrap | **Version**: 1.0.0 | **Last Updated**: 2026-01-13
