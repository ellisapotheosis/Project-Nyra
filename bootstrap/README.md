# Project Nyra Bootstrap System

> **🏗️ Complete 4-PC Distributed Architecture Setup** - Automated deployment for orchestrator and 3 GPU workers

**Version**: 5.0.0
**Last Updated**: 2026-01-15
**Status**: Production Ready ✅

---

## 📋 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Hardware Requirements](#-hardware-requirements)
3. [Folder Structure](#-folder-structure)
4. [Network Topology](#-network-topology)
5. [Service Distribution](#-service-distribution)
6. [Quick Start Guide](#-quick-start-guide)
7. [Setup Decision Tree](#-setup-decision-tree)
8. [Installation Order](#-installation-order)
9. [Troubleshooting](#-troubleshooting)
10. [Documentation Links](#-documentation-links)

---

## 🏗️ Architecture Overview

Project Nyra operates as a **4-PC distributed AI mortgage platform** with centralized orchestration and distributed GPU compute:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PROJECT NYRA - 4-PC CLUSTER                          │
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    ORCHESTRATOR MINI PC                           │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │ Control Plane (10.0.0.1)                                     │ │  │
│  │  │ • Claude Flow MCP (coordination)                             │ │  │
│  │  │ • PostgreSQL (metadata)                                      │ │  │
│  │  │ • Redis (caching/queues)                                     │ │  │
│  │  │ • MongoDB (document storage)                                 │ │  │
│  │  │ • Gitea (git hosting)                                        │ │  │
│  │  │ • n8n (workflow automation)                                  │ │  │
│  │  │ • Infisical (secrets management)                             │ │  │
│  │  │ • Graphiti MCP (knowledge graph)                             │ │  │
│  │  │ • Mem0 MCP (persistent memory)                               │ │  │
│  │  │ • Archon OS (agent coordination)                             │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                      │
│              ┌────────────────────┼────────────────────┐                 │
│              │                    │                    │                 │
│  ┌───────────▼─────┐  ┌──────────▼──────┐  ┌─────────▼────────┐        │
│  │  WORKER PC 1    │  │  WORKER PC 2    │  │  WORKER PC 3     │        │
│  │  RTX 3090 Ti    │  │  RTX 5090       │  │  RTX 3060        │        │
│  │  (10.0.0.2)     │  │  (10.0.0.3)     │  │  (10.0.0.4)      │        │
│  │  ─────────────  │  │  ─────────────  │  │  ──────────────  │        │
│  │  • Always-On    │  │  • Mobile High  │  │  • Mobile Worker │        │
│  │  • GPU Compute  │  │  • GPU Compute  │  │  • GPU Compute   │        │
│  │  • AI Inference │  │  • AI Training  │  │  • AI Inference  │        │
│  │  • Redis Cache  │  │  • Redis Cache  │  │  • Redis Cache   │        │
│  │  • Claude Flow  │  │  • Claude Flow  │  │  • Claude Flow   │        │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘        │
│                                                                           │
│  Network: 10.0.0.0/24 (Local) + Tailscale VPN + Cloudflared Tunnels    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Design Philosophy

- **Centralized Control**: Orchestrator manages coordination, state, and workflows
- **Distributed Compute**: GPU workers handle AI/ML workloads in parallel
- **Fault Tolerance**: Workers can disconnect/reconnect without affecting control plane
- **Scalability**: Add more workers horizontally as compute needs grow
- **Security**: Multiple network layers (local LAN, VPN mesh, encrypted tunnels)

---

## 💻 Hardware Requirements

### Orchestrator Mini PC (PC1 - 10.0.0.1)

**Minimum Specifications:**
- **CPU**: Intel/AMD 4+ cores (8+ recommended)
- **RAM**: 16GB minimum, **32GB recommended**
- **Storage**: 256GB SSD minimum, **512GB NVMe recommended**
- **Network**: Gigabit Ethernet (required)
- **OS**: Windows 11 Pro (for WSL2 support)
- **GPU**: None required (iGPU sufficient)

**Recommended Hardware:**
- Minisforum UH680 or equivalent
- Intel Core i7-12650H or better
- 32GB DDR4/DDR5 RAM
- 512GB NVMe SSD + 1TB HDD for storage
- 2.5GbE or 10GbE network adapter

**Role**: Coordination, databases, workflow orchestration, secrets management

---

### Worker PC1 - RTX 3090 Ti (PC2 - 10.0.0.2)

**Minimum Specifications:**
- **CPU**: 6+ cores for parallel tasks
- **RAM**: 16GB minimum, **32GB recommended**
- **GPU**: NVIDIA RTX 3090 Ti (24GB VRAM)
- **Storage**: 256GB SSD minimum, **1TB NVMe recommended**
- **Network**: Gigabit Ethernet (required)
- **OS**: Windows 11 Pro

**Characteristics:**
- **Always-On**: Primary GPU worker, never disconnects
- **High VRAM**: Handles large AI models (24GB)
- **Stable**: Baseline compute availability

**Role**: Primary AI inference, large model hosting, batch processing

---

### Worker PC2 - RTX 5090 (PC3 - 10.0.0.3)

**Minimum Specifications:**
- **CPU**: 8+ cores for high-performance tasks
- **RAM**: 32GB minimum, **64GB recommended**
- **GPU**: NVIDIA RTX 5090 (32GB VRAM)
- **Storage**: 512GB NVMe minimum, **2TB recommended**
- **Network**: Gigabit Ethernet (required)
- **OS**: Windows 11 Pro

**Characteristics:**
- **Mobile**: Can be disconnected (laptop/portable)
- **Ultra High-Performance**: Fastest GPU in cluster
- **WoL Enabled**: Wake-on-LAN for remote power on
- **Peak Capacity**: Used for demanding workloads

**Role**: Model training, complex inference, high-throughput tasks

---

### Worker PC3 - RTX 3060 (PC4 - 10.0.0.4)

**Minimum Specifications:**
- **CPU**: 4+ cores
- **RAM**: 16GB minimum, **24GB recommended**
- **GPU**: NVIDIA RTX 3060 (12GB VRAM)
- **Storage**: 256GB SSD minimum, **512GB recommended**
- **Network**: Gigabit Ethernet (required)
- **OS**: Windows 11 Pro

**Characteristics:**
- **Mobile**: Can be disconnected (laptop/portable)
- **Mid-Range**: Good performance for most tasks
- **WoL Enabled**: Wake-on-LAN for remote power on
- **Flexible**: Supplementary compute capacity

**Role**: Standard AI inference, development tasks, testing

---

## 📁 Folder Structure

The bootstrap directory is organized into **8 main components**:

```
bootstrap/
├── orchestrator-mini/       # PC1 - Orchestrator setup
│   ├── configs/            # Environment configs for orchestrator
│   ├── docker/             # Orchestrator-specific Docker Compose
│   ├── scripts/            # PowerShell/Bash setup scripts
│   ├── setup/              # Installation helpers
│   └── README.md           # Orchestrator-specific guide
│
├── worker-rtx3090ti/        # PC2 - Always-on GPU worker
│   ├── configs/            # Worker-specific configs
│   ├── docker/             # Worker Docker Compose
│   ├── scripts/            # Worker setup scripts
│   ├── setup/              # Installation helpers
│   └── README.md           # Worker-specific guide
│
├── worker-rtx5090/          # PC3 - Mobile high-perf worker
│   ├── configs/            # Worker-specific configs
│   ├── docker/             # Worker Docker Compose
│   ├── scripts/            # Worker setup scripts
│   ├── setup/              # Installation helpers
│   └── README.md           # Worker-specific guide
│
├── worker-rtx3060/          # PC4 - Mobile worker
│   ├── configs/            # Worker-specific configs
│   ├── docker/             # Worker Docker Compose
│   ├── scripts/            # Worker setup scripts
│   ├── setup/              # Installation helpers
│   └── README.md           # Worker-specific guide
│
├── installer/               # React GUI installer (recommended)
│   ├── src/                # React application source
│   │   ├── components/    # UI components
│   │   ├── hooks/         # React hooks
│   │   ├── services/      # Installation logic
│   │   └── store/         # State management
│   ├── package.json       # Installer dependencies
│   └── README.md          # Installer documentation
│
├── configs/                 # Shared configuration templates
│   ├── claude-code/        # Claude Code settings
│   ├── claude-desktop/     # Claude Desktop MCP config
│   ├── docker/             # Docker daemon configs
│   └── nvidia/             # NVIDIA Container Toolkit
│
├── docs/                    # Bootstrap documentation
│   ├── STRUCTURE.md        # Detailed structure guide
│   └── _archive/           # Historical documentation
│
├── scripts/                 # Shared utility scripts
│   ├── shims/              # CLI shims for Docker containers
│   └── validation/         # Configuration validators
│
└── templates/               # Development pattern templates
    └── development-patterns/  # Production-ready code patterns
```

### Component Descriptions

#### PC-Specific Folders (orchestrator-mini, worker-*)

Each PC has its own folder containing:
- **configs/**: Environment variables, service configs, network settings
- **docker/**: Docker Compose files for PC-specific services
- **scripts/**: PowerShell (Windows) and Bash (WSL) automation scripts
- **setup/**: Installation helpers and prerequisites checkers
- **README.md**: PC-specific setup guide and troubleshooting

#### Installer (GUI Tool)

React-based graphical installer that:
- Detects hardware automatically
- Guides through PC role selection
- Installs prerequisites (Docker, Node.js, etc.)
- Deploys services with one click
- Provides real-time progress tracking
- Validates installation health

#### Configs (Shared Templates)

Configuration file templates used across all PCs:
- `.env` templates with sensible defaults
- Docker daemon configurations
- NVIDIA runtime settings
- Claude Code/Desktop MCP configs

#### Docs (Documentation)

Bootstrap-specific documentation:
- Architecture diagrams
- Network topology details
- Historical implementation reports
- Migration guides

#### Scripts (Utilities)

Shared scripts for:
- CLI shims (transparent Docker execution)
- Configuration validation
- Network setup helpers
- Health check utilities

#### Templates (Code Patterns)

Production-ready development patterns:
- Repository pattern (data access)
- Unit of Work (transactions)
- Service layer (business logic)
- Circuit breaker (fault tolerance)
- Event bus (event-driven)

---

## 🌐 Network Topology

Project Nyra uses a **3-layer network architecture** for security, reliability, and flexibility:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        NETWORK TOPOLOGY                                  │
│                                                                           │
│  Layer 1: Local LAN (10.0.0.0/24)                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │   Router/Switch (10.0.0.254)                                     │   │
│  │        │                                                          │   │
│  │   ┌────┴───────────────┬────────────────┬────────────────┐     │   │
│  │   │                    │                │                │     │   │
│  │  Orchestrator      Worker1          Worker2          Worker3   │   │
│  │  10.0.0.1          10.0.0.2         10.0.0.3         10.0.0.4  │   │
│  │                                                                   │   │
│  │  • Static IPs (manual assignment)                                │   │
│  │  • Gigabit Ethernet (1000Mbps)                                   │   │
│  │  • Low latency (<1ms local)                                      │   │
│  │  • No internet required for local ops                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  Layer 2: Tailscale VPN Mesh (100.x.x.x/10)                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │   Tailscale Control Plane (coordination.tailscale.com)          │   │
│  │        │                                                          │   │
│  │   ┌────┴───────────────┬────────────────┬────────────────┐     │   │
│  │   │                    │                │                │     │   │
│  │  Orchestrator      Worker1          Worker2          Worker3   │   │
│  │  100.x.x.1         100.x.x.2        100.x.x.3        100.x.x.4 │   │
│  │                                                                   │   │
│  │  • Encrypted P2P mesh (WireGuard)                                │   │
│  │  • NAT traversal (works everywhere)                              │   │
│  │  • Remote access enabled                                         │   │
│  │  • Auto-reconnect on network change                              │   │
│  │  • MagicDNS: nyra-orchestrator, nyra-worker1, etc.             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  Layer 3: Cloudflared Tunnels (Public Access)                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │   Internet ──► Cloudflare Edge ──► Tunnel ──► Orchestrator      │   │
│  │                                                                   │   │
│  │   Public URLs:                                                    │   │
│  │   • https://ratehunter.nyra.dev → RateHunter Landing (3000)    │   │
│  │   • https://admin.nyra.dev → Admin Dashboard (3001)            │   │
│  │   • https://api.nyra.dev → Quote API (8000)                    │   │
│  │   • https://n8n.nyra.dev → n8n Workflows (5678)                │   │
│  │   • https://git.nyra.dev → Gitea (3002)                        │   │
│  │                                                                   │   │
│  │  • TLS termination at Cloudflare                                 │   │
│  │  • DDoS protection included                                      │   │
│  │  • Zero-trust access (no open ports)                             │   │
│  │  • Automatic failover                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Layer Details

#### Layer 1: Local LAN (10.0.0.0/24)

**Purpose**: Fast, low-latency communication between PCs on the same physical network.

**Configuration**:
- Static IP assignments (prevents DHCP conflicts)
- Gigabit Ethernet required
- MTU 1500 (standard) or 9000 (jumbo frames for better performance)

**Use Cases**:
- Database queries (PostgreSQL, Redis, MongoDB)
- Docker container communication
- File transfers between PCs
- GPU compute task distribution

**Setup**:
```powershell
# Windows: Set static IP
netsh interface ip set address "Ethernet" static 10.0.0.1 255.255.255.0 10.0.0.254
```

#### Layer 2: Tailscale VPN Mesh (100.x.x.x/10)

**Purpose**: Secure remote access and mobile worker connectivity.

**Configuration**:
- Tailscale account required (free tier sufficient)
- WireGuard-based encrypted mesh
- Automatic NAT traversal
- MagicDNS for friendly names

**Use Cases**:
- Remote development (work from anywhere)
- Mobile workers (RTX 5090, RTX 3060) when disconnected from LAN
- Secure access without exposing ports
- Seamless failover if LAN fails

**Setup**:
```powershell
# Install Tailscale
winget install tailscale.tailscale

# Authenticate
tailscale login

# Enable MagicDNS
tailscale set --accept-dns=true
```

#### Layer 3: Cloudflared Tunnels (Public Access)

**Purpose**: Expose web services to the internet securely.

**Configuration**:
- Cloudflare account required
- Cloudflared daemon on orchestrator
- Zero-trust access (no port forwarding)

**Use Cases**:
- Public-facing website (RateHunter landing page)
- Customer access to quote tools
- Webhook receivers (Dialpad, external APIs)
- Team access to admin tools

**Setup**:
```powershell
# Install cloudflared
winget install cloudflare.cloudflared

# Create tunnel
cloudflared tunnel create nyra-tunnel

# Configure routes
cloudflared tunnel route dns nyra-tunnel ratehunter.nyra.dev
```

### Network Priority

Services choose networks in this order:
1. **Local LAN** (if available) - fastest, lowest latency
2. **Tailscale VPN** (if LAN unavailable) - secure remote access
3. **Cloudflared** (public-facing services only) - internet access

---

## 🔧 Service Distribution

### What Runs Where

| Service | Orchestrator | Worker1 | Worker2 | Worker3 | Port | Purpose |
|---------|:------------:|:-------:|:-------:|:-------:|------|---------|
| **Claude Flow MCP** | ✅ | ✅ | ✅ | ✅ | 3000 | Multi-agent coordination |
| **PostgreSQL** | ✅ | ❌ | ❌ | ❌ | 5432 | Metadata, quotes, leads |
| **Redis** | ✅ | ✅ | ✅ | ✅ | 6379 | Caching, queues |
| **MongoDB** | ✅ | ❌ | ❌ | ❌ | 27017 | Document storage |
| **Gitea** | ✅ | ❌ | ❌ | ❌ | 3002 | Git repository hosting |
| **n8n** | ✅ | ❌ | ❌ | ❌ | 5678 | Workflow automation |
| **Infisical** | ✅ | ❌ | ❌ | ❌ | 8080 | Secrets management |
| **Graphiti MCP** | ✅ | ❌ | ❌ | ❌ | 8001 | Knowledge graph |
| **Mem0 MCP** | ✅ | ❌ | ❌ | ❌ | 8002 | Persistent memory |
| **Archon OS** | ✅ | ✅ | ✅ | ✅ | 8000 | Agent framework |
| **NVIDIA Container Toolkit** | ❌ | ✅ | ✅ | ✅ | N/A | GPU access in Docker |
| **RateHunter Landing** | ✅ | ❌ | ❌ | ❌ | 3100 | Marketing website |
| **Admin Dashboard** | ✅ | ❌ | ❌ | ❌ | 3101 | Internal admin tools |
| **Quote API** | ✅ | ✅ | ✅ | ✅ | 8000 | Mortgage calculations |

### Service Categories

#### Control Plane Services (Orchestrator Only)

These services **must** run on the orchestrator:
- **PostgreSQL**: Central metadata database
- **MongoDB**: Document storage
- **Gitea**: Git server and CI/CD
- **n8n**: Workflow orchestration
- **Infisical**: Centralized secrets
- **Graphiti MCP**: Shared knowledge graph
- **Mem0 MCP**: Persistent agent memory

**Reason**: Single source of truth, avoid data inconsistency

#### Distributed Services (All PCs)

These services run on **multiple PCs**:
- **Claude Flow MCP**: Coordinated across cluster
- **Redis**: Local caching per PC (separate instances)
- **Archon OS**: Agent execution on each PC
- **Quote API**: Load balanced across workers

**Reason**: Performance, redundancy, parallel processing

#### GPU Services (Workers Only)

These services **require GPU**:
- **NVIDIA Container Toolkit**: GPU access in Docker
- **AI Model Inference**: CUDA-accelerated
- **Model Training**: GPU compute

**Reason**: Orchestrator has no discrete GPU

---

## 🚀 Quick Start Guide

### Choose Your Path

#### Option 1: GUI Installer (Recommended - 10 Minutes)

**Best for**: First-time setup, visual learners, quick deployment

```powershell
# 1. Navigate to installer
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer

# 2. Install dependencies
npm install

# 3. Start installer
npm run dev

# 4. Open browser to http://localhost:5173

# 5. Follow the wizard:
#    - Select PC role (Orchestrator/Worker)
#    - Choose components to install
#    - Configure settings
#    - Click "Deploy"
```

**Pros**:
- Visual interface with progress tracking
- Automatic prerequisite detection
- One-click deployment
- Built-in validation and health checks
- Real-time logs and status

**Cons**:
- Requires Node.js and npm
- Less customization than manual setup

---

#### Option 2: Manual Setup (Advanced - 30-60 Minutes)

**Best for**: Advanced users, custom configurations, learning the system

##### Step 1: Prerequisites Check

```powershell
# Check Windows version (need 11 Pro for WSL2)
winver

# Check Docker installation
docker --version
docker compose version

# Check Node.js (need 20+)
node --version

# Check Git
git --version

# For GPU workers: Check NVIDIA drivers
nvidia-smi
```

##### Step 2: Clone Repository

```powershell
cd C:\Dev\Projects\Repos
git clone https://github.com/YourOrg/Project-Nyra.git
cd Project-Nyra
```

##### Step 3: Configure Environment

```powershell
# Navigate to PC-specific folder
cd bootstrap/orchestrator-mini  # or worker-rtx3090ti, worker-rtx5090, worker-rtx3060

# Copy environment template
cp configs\.env.example configs\.env

# Edit with your values
notepad configs\.env
```

##### Step 4: Set Static IP

```powershell
# Orchestrator (PC1)
netsh interface ip set address "Ethernet" static 10.0.0.1 255.255.255.0 10.0.0.254

# Worker1 (PC2)
netsh interface ip set address "Ethernet" static 10.0.0.2 255.255.255.0 10.0.0.254

# Worker2 (PC3)
netsh interface ip set address "Ethernet" static 10.0.0.3 255.255.255.0 10.0.0.254

# Worker3 (PC4)
netsh interface ip set address "Ethernet" static 10.0.0.4 255.255.255.0 10.0.0.254
```

##### Step 5: Install Tailscale (Optional but Recommended)

```powershell
# Install
winget install tailscale.tailscale

# Login and authenticate
tailscale login

# Verify connection
tailscale status
```

##### Step 6: Start Services

```powershell
# From PC-specific folder (e.g., bootstrap/orchestrator-mini)
cd docker

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

##### Step 7: Install CLI Shims (Optional)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\scripts\shims

# Install all shims
.\install-shims.ps1 -All

# Test shims
claude-flow --version
archon --version
infisical --version
```

##### Step 8: Verify Installation

```powershell
# Check all containers running
docker ps

# Test database connections
docker exec nyra-postgres psql -U nyra -c "SELECT version();"
docker exec nyra-redis redis-cli PING

# Check web UIs
# - Claude Flow: http://localhost:3000
# - Gitea: http://localhost:3002
# - n8n: http://localhost:5678
# - Infisical: http://localhost:8080
```

**Pros**:
- Full control over every step
- Learn system architecture
- Custom configurations
- Easier troubleshooting

**Cons**:
- More time-consuming
- Requires technical knowledge
- Manual error checking

---

## 🌳 Setup Decision Tree

Use this flowchart to determine the best setup path for your situation:

```
                        START HERE
                             │
                             ▼
              ┌──────────────────────────────┐
              │ First time setting up Nyra?  │
              └──────────────┬───────────────┘
                     YES │   │ NO
                         │   └───────────────────┐
                         ▼                       ▼
              ┌─────────────────────┐   ┌───────────────────┐
              │  Use GUI Installer  │   │ Reinstalling or   │
              │  (Recommended)      │   │ upgrading?        │
              └─────────────────────┘   └────────┬──────────┘
                                             YES │ │ NO
                                                 │ └──────────┐
                                                 ▼            ▼
                                        ┌────────────┐  ┌─────────────┐
                                        │ Fresh      │  │ Want to     │
                                        │ install or │  │ learn       │
                                        │ migration? │  │ internals?  │
                                        └─────┬──────┘  └──────┬──────┘
                                      FRESH │ │ MIGRATE    YES │ │ NO
                                            │ └──────────┐     │ │
                                            ▼            ▼     ▼ ▼
                                    ┌─────────────┐  ┌──────────────┐
                                    │ GUI          │  │ Manual Setup │
                                    │ Installer    │  │ (Advanced)   │
                                    └─────────────┘  └──────────────┘
                                            │                  │
                                            ▼                  ▼
                        ┌───────────────────────────────────────────────┐
                        │                PC SELECTION                    │
                        └───────────┬───────────────────────────────────┘
                                    │
                ┌───────────────────┼──────────────────┐
                │                   │                  │
                ▼                   ▼                  ▼
    ┌───────────────────┐  ┌────────────────┐  ┌────────────────┐
    │ Setting up        │  │ Setting up     │  │ Setting up     │
    │ Orchestrator?     │  │ Always-On GPU  │  │ Mobile GPU     │
    │ (Mini PC)         │  │ (RTX 3090 Ti)  │  │ (RTX 5090/3060)│
    └─────────┬─────────┘  └────────┬───────┘  └────────┬───────┘
              │                     │                    │
              ▼                     ▼                    ▼
    ┌─────────────────┐   ┌─────────────────┐   ┌──────────────────┐
    │ ORCHESTRATOR    │   │ WORKER 1        │   │ WORKER 2/3       │
    │ SETUP PATH      │   │ SETUP PATH      │   │ SETUP PATH       │
    │                 │   │                 │   │                  │
    │ 1. Static IP    │   │ 1. Static IP    │   │ 1. Static IP     │
    │ 2. Prerequisites│   │ 2. Prerequisites│   │ 2. Prerequisites │
    │ 3. Full Stack   │   │ 3. GPU Drivers  │   │ 3. GPU Drivers   │
    │ 4. Databases    │   │ 4. Minimal Stack│   │ 4. Minimal Stack │
    │ 5. Workflows    │   │ 5. Connect to   │   │ 5. Wake-on-LAN   │
    │ 6. Configure    │   │    Orchestrator │   │ 6. Connect to    │
    │    Workers      │   │ 6. Test GPU     │   │    Orchestrator  │
    │ 7. Test System  │   │ 7. Join Swarm   │   │ 7. Test GPU      │
    │                 │   │                 │   │ 8. Join Swarm    │
    └─────────────────┘   └─────────────────┘   └──────────────────┘
              │                     │                    │
              └─────────────────────┴────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   VERIFICATION        │
                        │                       │
                        │ 1. All containers up  │
                        │ 2. Health checks pass │
                        │ 3. Network connected  │
                        │ 4. GPU accessible     │
                        │ 5. Test workload      │
                        └───────────────────────┘
                                    │
                                    ▼
                              COMPLETE! 🎉
```

### Decision Criteria

**Choose GUI Installer if**:
- First time setting up
- Want fastest setup (10 min vs 30-60 min)
- Prefer visual interface
- Want automatic validation

**Choose Manual Setup if**:
- Reinstalling/upgrading existing system
- Want to learn system internals
- Need custom configuration
- Comfortable with command line

**Orchestrator Setup if**:
- This is the first PC being set up
- Mini PC without discrete GPU
- Will host databases and control plane

**Worker Setup if**:
- Orchestrator is already running
- PC has NVIDIA GPU
- Will handle AI/ML compute workloads

---

## 📋 Installation Order

**CRITICAL**: PCs must be set up in this specific order to avoid dependency issues.

### Phase 1: Orchestrator Setup (PC1 - 10.0.0.1)

**Time**: 20-30 minutes
**Reason**: Orchestrator hosts databases and control plane needed by workers

```powershell
# 1. Set static IP
netsh interface ip set address "Ethernet" static 10.0.0.1 255.255.255.0 10.0.0.254

# 2. Configure environment
cd bootstrap\orchestrator-mini\configs
cp .env.example .env
notepad .env  # Add API keys, passwords

# 3. Start core services
cd ..\docker
docker compose -f docker-compose.yml -f docker-compose.core.yml up -d

# 4. Verify core services
docker compose ps
# Expected: postgres, redis, mongo all "running (healthy)"

# 5. Start control plane services
docker compose -f docker-compose.yml -f docker-compose.control.yml up -d

# 6. Verify control plane
docker compose ps
# Expected: claude-flow, gitea, n8n, infisical all running

# 7. Initialize databases
docker exec nyra-postgres psql -U nyra -f /docker-entrypoint-initdb.d/init.sql

# 8. Test connectivity
curl http://localhost:3000  # Claude Flow
curl http://localhost:5678  # n8n
curl http://localhost:8080  # Infisical

# ✅ Orchestrator ready for workers
```

**Checkpoint**: Before proceeding, verify:
- [ ] All orchestrator containers running
- [ ] Databases accessible (PostgreSQL, Redis, MongoDB)
- [ ] Web UIs responding
- [ ] Static IP configured (10.0.0.1)
- [ ] Firewall allows inbound on 5432, 6379, 27017

---

### Phase 2: Worker 1 Setup (PC2 - 10.0.0.2 - Always-On)

**Time**: 15-20 minutes
**Reason**: Primary GPU worker, always available

**Prerequisites**:
- Orchestrator (PC1) fully operational
- Network connectivity to 10.0.0.1
- NVIDIA GPU drivers installed
- Docker + NVIDIA Container Toolkit installed

```powershell
# 1. Set static IP
netsh interface ip set address "Ethernet" static 10.0.0.2 255.255.255.0 10.0.0.254

# 2. Test orchestrator connectivity
ping 10.0.0.1
Test-NetConnection -ComputerName 10.0.0.1 -Port 5432  # PostgreSQL
Test-NetConnection -ComputerName 10.0.0.1 -Port 6379  # Redis

# 3. Verify GPU
nvidia-smi
# Should show RTX 3090 Ti with 24GB VRAM

# 4. Test NVIDIA Container Toolkit
docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi
# Should show GPU inside container

# 5. Configure environment
cd bootstrap\worker-rtx3090ti\configs
cp .env.example .env
notepad .env  # Set ORCHESTRATOR_HOST=10.0.0.1

# 6. Start worker services
cd ..\docker
docker compose up -d

# 7. Verify worker services
docker compose ps
# Expected: claude-flow, redis, archon running with GPU access

# 8. Register with orchestrator
docker exec nyra-claude-flow claude-flow agent spawn -t gpu-worker --name worker1

# 9. Test GPU workload
docker exec nyra-archon archon test-gpu

# ✅ Worker 1 online and registered
```

**Checkpoint**: Before proceeding, verify:
- [ ] Worker containers running
- [ ] GPU accessible in Docker (`nvidia-smi` works inside container)
- [ ] Connected to orchestrator (can ping 10.0.0.1)
- [ ] Registered in orchestrator's agent list
- [ ] Test GPU task completes successfully

---

### Phase 3: Worker 2 Setup (PC3 - 10.0.0.3 - Mobile High-Perf)

**Time**: 15-20 minutes
**Reason**: Secondary GPU worker, high performance

**Prerequisites**: Same as Worker 1

```powershell
# Follow same steps as Worker 1, but:
# - Static IP: 10.0.0.3
# - Config folder: bootstrap\worker-rtx5090\configs
# - Agent name: --name worker2
# - GPU: RTX 5090 (32GB VRAM)

# Enable Wake-on-LAN for mobile use
powercfg -deviceenablewake "Intel(R) Ethernet Controller"

# Configure Tailscale for remote access
tailscale up --accept-dns=true --hostname=nyra-worker2

# ✅ Worker 2 online and registered
```

---

### Phase 4: Worker 3 Setup (PC4 - 10.0.0.4 - Mobile)

**Time**: 15-20 minutes
**Reason**: Tertiary GPU worker, flexible capacity

**Prerequisites**: Same as Worker 1

```powershell
# Follow same steps as Worker 1, but:
# - Static IP: 10.0.0.4
# - Config folder: bootstrap\worker-rtx3060\configs
# - Agent name: --name worker3
# - GPU: RTX 3060 (12GB VRAM)

# Enable Wake-on-LAN
powercfg -deviceenablewake "Intel(R) Ethernet Controller"

# Configure Tailscale
tailscale up --accept-dns=true --hostname=nyra-worker3

# ✅ Worker 3 online and registered
```

---

### Phase 5: Cluster Verification

**Time**: 5-10 minutes

```powershell
# On orchestrator (PC1)
cd C:\Dev\Projects\Repos\Project-Nyra

# 1. List all agents
docker exec nyra-claude-flow claude-flow agent list

# Expected output:
# ID       TYPE        STATUS    GPU        IP          HOSTNAME
# worker1  gpu-worker  active    RTX3090Ti  10.0.0.2   nyra-worker1
# worker2  gpu-worker  active    RTX5090    10.0.0.3   nyra-worker2
# worker3  gpu-worker  active    RTX3060    10.0.0.4   nyra-worker3

# 2. Test distributed workload
docker exec nyra-claude-flow claude-flow swarm init --topology hierarchical-mesh --max-agents 12

# 3. Spawn test agents across workers
docker exec nyra-claude-flow claude-flow agent spawn -t coder --name test-coder
docker exec nyra-claude-flow claude-flow agent spawn -t tester --name test-tester
docker exec nyra-claude-flow claude-flow agent spawn -t researcher --name test-researcher

# 4. Check swarm status
docker exec nyra-claude-flow claude-flow swarm status

# Expected: All 3 test agents running, distributed across workers

# 5. Run GPU benchmark
docker exec nyra-claude-flow claude-flow task create --type benchmark --distribute

# Expected: Benchmark runs in parallel across all 3 GPU workers

# ✅ Cluster fully operational!
```

---

## 🔧 Troubleshooting

### Quick Reference

| Symptom | Likely Cause | Quick Fix | Detailed Doc |
|---------|--------------|-----------|--------------|
| Docker won't start | Docker Desktop not running | Start Docker Desktop | [Docker Troubleshooting](https://docs.docker.com/desktop/troubleshoot/overview/) |
| Port already in use | Conflicting service | `netstat -ano \| findstr :PORT` then kill process | [Port Conflicts](#port-conflicts) |
| Container keeps restarting | Configuration error | Check logs: `docker logs CONTAINER` | [Container Issues](#container-issues) |
| Can't connect to orchestrator | Network/firewall issue | Ping 10.0.0.1, check firewall | [Network Issues](#network-issues) |
| GPU not detected | Driver/toolkit issue | Run `nvidia-smi`, reinstall toolkit | [GPU Issues](#gpu-issues) |
| Out of memory | Too many containers | `docker system prune -a` | [Memory Issues](#memory-issues) |
| Database connection failed | Service not ready | Wait 30s, check `docker compose ps` | [Database Issues](#database-issues) |
| Permission denied (WSL) | File permissions | `chmod +x script.sh` | [WSL Issues](#wsl-issues) |

---

### Container Issues

#### Container won't start

```powershell
# 1. Check container status
docker ps -a | findstr nyra

# 2. View last 100 lines of logs
docker logs --tail 100 nyra-claude-flow

# 3. Check for port conflicts
netstat -ano | findstr :3000

# 4. Verify environment variables
docker exec nyra-claude-flow env | findstr ANTHROPIC

# 5. Check Docker Compose config
cd bootstrap\orchestrator-mini\docker
docker compose config

# 6. Restart with fresh logs
docker compose down
docker compose up -d
docker compose logs -f
```

#### Container keeps restarting

```powershell
# 1. Check restart count
docker ps -a --format "{{.Names}}: {{.Status}}"

# 2. View full logs
docker logs nyra-claude-flow 2>&1 | more

# 3. Check for common errors:
# - "connection refused" → dependent service not ready
# - "permission denied" → volume mount issue
# - "file not found" → missing config file
# - "invalid value" → .env file error

# 4. Check dependencies
docker compose ps
# All dependent services should be "running (healthy)"

# 5. Check volume mounts
docker inspect nyra-claude-flow --format '{{json .Mounts}}' | jq

# 6. Recreate container
docker compose up -d --force-recreate nyra-claude-flow
```

---

### Network Issues

#### Can't ping orchestrator from worker

```powershell
# 1. Test basic connectivity
ping 10.0.0.1

# If fails:
# - Check physical cable
# - Verify static IP: ipconfig
# - Check subnet: both should be 255.255.255.0

# 2. Test specific ports
Test-NetConnection -ComputerName 10.0.0.1 -Port 5432  # PostgreSQL
Test-NetConnection -ComputerName 10.0.0.1 -Port 6379  # Redis
Test-NetConnection -ComputerName 10.0.0.1 -Port 3000  # Claude Flow

# If fails:
# - Check Windows Firewall on orchestrator
# - Check Docker network: docker network inspect nyra-network

# 3. Test from inside Docker
docker run --rm --network nyra-network alpine ping orchestrator
```

#### Port conflicts

```powershell
# 1. Find what's using the port
netstat -ano | findstr :3000

# Output shows PID (last column)

# 2. Find process name
tasklist /FI "PID eq 1234"

# 3. Kill process (if safe)
Stop-Process -Id 1234 -Force

# 4. Or change port in .env
CLAUDE_FLOW_MCP_PORT=3100

# 5. Restart containers
docker compose down
docker compose up -d
```

---

### GPU Issues

#### GPU not detected in Docker

```powershell
# 1. Verify GPU on host
nvidia-smi

# If fails: reinstall NVIDIA drivers

# 2. Verify Docker GPU access
docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi

# If fails: reinstall NVIDIA Container Toolkit
# https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html

# 3. Check Docker daemon config
notepad C:\ProgramData\Docker\config\daemon.json

# Should contain:
{
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  }
}

# 4. Restart Docker Desktop

# 5. Test again
docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi
```

#### GPU out of memory

```powershell
# 1. Check GPU memory usage
nvidia-smi

# 2. Find processes using GPU
nvidia-smi pmon

# 3. Kill GPU processes
taskkill /F /IM process.exe

# 4. Restart Docker containers
docker compose restart

# 5. If persistent, reduce batch sizes in AI workloads
# Edit worker config: .env → BATCH_SIZE=16 (from 32)
```

---

### Database Issues

#### PostgreSQL connection refused

```powershell
# 1. Check container running
docker ps | findstr postgres

# 2. Check logs
docker logs nyra-postgres --tail 50

# 3. Test connection from host
docker exec nyra-postgres psql -U nyra -c "SELECT version();"

# 4. Check network
docker network inspect nyra-network | findstr postgres

# 5. Verify password in .env matches
docker exec nyra-postgres env | findstr POSTGRES_PASSWORD
notepad bootstrap\orchestrator-mini\configs\.env  # Check POSTGRES_PASSWORD

# 6. Test from worker
docker run --rm --network nyra-network postgres:16-alpine psql -h postgres -U nyra -c "SELECT 1;"
```

#### Redis connection refused

```powershell
# Similar to PostgreSQL troubleshooting

# Test Redis
docker exec nyra-redis redis-cli PING
# Expected: PONG

# Test from worker
docker run --rm --network nyra-network redis:7-alpine redis-cli -h redis PING
```

---

### Memory Issues

#### Docker out of memory

```powershell
# 1. Check Docker memory usage
docker stats

# 2. Check system memory
wmic OS get FreePhysicalMemory

# 3. Clean up Docker
docker system prune -a --volumes
# WARNING: This removes all unused containers, images, volumes

# 4. Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory → 8GB (or more)

# 5. Reduce running containers
docker compose stop n8n gitea  # Stop non-critical services
```

#### Disk space low

```powershell
# 1. Check disk usage
docker system df

# 2. Clean up Docker
docker system prune -a --volumes

# 3. Remove old images
docker image prune -a

# 4. Remove old logs
docker compose logs --tail 0  # Truncate logs
```

---

### WSL Issues

#### WSL2 not enabled

```powershell
# 1. Enable WSL
wsl --install

# 2. Set WSL2 as default
wsl --set-default-version 2

# 3. Install Ubuntu
wsl --install -d Ubuntu-22.04

# 4. Restart computer

# 5. Verify
wsl --list --verbose
```

#### Docker can't access WSL

```powershell
# 1. Check Docker Desktop settings
# Settings → General → "Use WSL 2 based engine" (checked)

# 2. Check WSL integration
# Settings → Resources → WSL Integration → Enable for Ubuntu

# 3. Restart Docker Desktop

# 4. Test from WSL
wsl
docker ps
```

---

### Common Error Messages

#### "Error: connect ECONNREFUSED"

**Cause**: Service not ready or wrong hostname
**Fix**:
```powershell
# Wait for service to start
docker compose ps
# Check STATUS column for "running (healthy)"

# If unhealthy, check logs
docker compose logs service-name
```

#### "Error: EADDRINUSE: address already in use"

**Cause**: Port conflict
**Fix**: See [Port Conflicts](#port-conflicts) above

#### "Error: Cannot connect to Docker daemon"

**Cause**: Docker Desktop not running
**Fix**:
```powershell
# Start Docker Desktop
# Wait for "Docker Desktop is running" in system tray
```

#### "Error: permission denied"

**Cause**: WSL file permissions
**Fix**:
```bash
# In WSL
chmod +x /path/to/script.sh
```

#### "Error: container failed to initialize"

**Cause**: Missing environment variable or config file
**Fix**:
```powershell
# Check .env file exists
dir bootstrap\orchestrator-mini\configs\.env

# Validate .env format (no spaces around =)
# Correct:   KEY=value
# Incorrect: KEY = value
```

---

## 📚 Documentation Links

### Bootstrap Documentation

- **[STRUCTURE.md](docs/STRUCTURE.md)** - Detailed folder structure and naming conventions
- **[SETUP-GUIDE.md](SETUP-GUIDE.md)** - Step-by-step manual setup instructions
- **[GUI Installer README](installer/README.md)** - React installer documentation

### PC-Specific Guides

- **[Orchestrator README](orchestrator-mini/README.md)** - Mini PC setup and services
- **[Worker 1 README](worker-rtx3090ti/README.md)** - RTX 3090 Ti always-on worker
- **[Worker 2 README](worker-rtx5090/README.md)** - RTX 5090 mobile high-perf worker
- **[Worker 3 README](worker-rtx3060/README.md)** - RTX 3060 mobile worker

### Architecture Documentation

- **[System Architecture](../docs/architecture/system-architecture.md)** - Overall system design
- **[4PC Distributed Architecture](../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md)** - Multi-PC coordination
- **[Network Topology](../docs/architecture/WEBSOCKET-IMPLEMENTATION.md)** - Real-time communication

### Configuration Documentation

- **[Environment Variables](../docs/environment/ENVIRONMENT_VARIABLES.md)** - All environment variables
- **[Docker Configuration](../infra/DOCKER-IMAGE-INVENTORY.md)** - Docker image inventory
- **[MCP Configuration](../docs/ai-context/MCP-ASSISTANT-RULES.md)** - MCP server setup

### Deployment Documentation

- **[Docker Deployment](../docs/deployment/CLAUDE-FLOW-PRODUCTION-CONTAINERIZATION.md)** - Production containerization
- **[Infisical Deployment](../docs/deployment/INFISICAL-MCP-DEPLOYMENT-PLAN.md)** - Secrets management
- **[Gitea Deployment](../docs/deployment/GITEA-DEPLOYMENT.md)** - Git server setup

### Development Documentation

- **[Quick Start Development](../docs/guides/QUICK-START-DEVELOPMENT.md)** - Developer onboarding
- **[Language Template Mapping](../docs/development/LANGUAGE-TEMPLATE-MAPPING-GUIDE.md)** - Code generation patterns
- **[Testing Quick Start](../docs/guides/TESTING-QUICKSTART.md)** - Testing framework

### External Resources

- **[Claude Flow Documentation](https://github.com/ruvnet/claude-flow)** - Multi-agent orchestration
- **[Archon Documentation](https://github.com/archan-os/archon)** - Agent framework
- **[Docker Documentation](https://docs.docker.com/)** - Container platform
- **[Tailscale Documentation](https://tailscale.com/kb/)** - VPN mesh network
- **[NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/)** - GPU in Docker

---

## 🎉 Ready to Begin?

### Recommended First Steps

1. **Read this README** completely (you're doing it! ✅)
2. **Choose your setup path**: GUI Installer (recommended) or Manual Setup
3. **Prepare hardware**: Ensure all PCs meet minimum requirements
4. **Gather credentials**: Anthropic API key, Infisical account, Tailscale account
5. **Start with Orchestrator**: Set up PC1 first (critical dependency)
6. **Add workers sequentially**: PC2 → PC3 → PC4
7. **Verify cluster**: Run test workloads to confirm everything works
8. **Explore**: Try Claude Flow swarms, n8n workflows, and AI agents

### Need Help?

- **Quick questions**: Check [Troubleshooting](#-troubleshooting) section
- **Setup issues**: See PC-specific READMEs
- **Architecture questions**: Review [Documentation Links](#-documentation-links)
- **Bug reports**: Open GitHub issue with logs

---

**Bootstrap System Version**: 5.0.0
**Last Updated**: 2026-01-15
**Maintainer**: Project Nyra Team

**Status**:
- ✅ Orchestrator support
- ✅ 3x GPU worker support
- ✅ GUI installer
- ✅ Network topology (3-layer)
- ✅ Service distribution
- ✅ Comprehensive documentation

---

## 🔗 Monorepo Integration

The bootstrap installer is being integrated into the Project Nyra pnpm monorepo for better code reuse and maintainability.

### Integration Status

- **Status**: DESIGN PHASE ✅
- **Plan Document**: [BOOTSTRAP-INTEGRATION-PLAN.md](../docs/architecture/BOOTSTRAP-INTEGRATION-PLAN.md)
- **Quick Start**: [INTEGRATION-QUICKSTART.md](./INTEGRATION-QUICKSTART.md)

### Planned Package Structure

Once integrated, the bootstrap system will be split into:

- **@nyra/installer** (`apps/installer`) - Electron + React GUI installer
- **@nyra/bootstrap-types** (`packages/bootstrap-types`) - TypeScript type definitions
- **@nyra/bootstrap-ui** (`packages/bootstrap-ui`) - React component library
- **@nyra/bootstrap-config** (`packages/bootstrap-config`) - Config schemas and validators

### Benefits of Integration

✅ **Code Reuse**: Components can be used in admin dashboard and other apps
✅ **Type Safety**: Centralized TypeScript types prevent drift
✅ **Build Speed**: Turbo caching reduces build times by 70-90%
✅ **Maintainability**: Single source of truth for shared logic
✅ **Developer Experience**: Unified tooling and hot-reload across all packages

### Quick Commands After Integration

```bash
# Install dependencies
pnpm install

# Start installer in dev mode
pnpm --filter @nyra/installer run dev

# Build all bootstrap packages
pnpm turbo run build --filter='@nyra/bootstrap-*'

# Package installer for distribution
pnpm --filter @nyra/installer run package:win
```

### Using Bootstrap Components in Other Apps

```typescript
// Import types
import { PCRole, InstallState, DockerContainer } from '@nyra/bootstrap-types';

// Import UI components
import { PCSelector, HealthDashboard, InstallationProgress } from '@nyra/bootstrap-ui';

// Import validators
import { validateManifest, manifestSchema } from '@nyra/bootstrap-config';
```

### Documentation

- **Full Architecture Plan**: [BOOTSTRAP-INTEGRATION-PLAN.md](../docs/architecture/BOOTSTRAP-INTEGRATION-PLAN.md) - 50+ page comprehensive design
- **Quick Start Guide**: [INTEGRATION-QUICKSTART.md](./INTEGRATION-QUICKSTART.md) - 90-minute implementation guide
- **Migration Checklist**: See "Migration Checklist" section in architecture plan

### Timeline

- **Phase 1**: Workspace setup (2 hours)
- **Phase 2**: Package extraction (4 hours)
- **Phase 3**: Turbo configuration (1 hour)
- **Phase 4**: Testing & validation (2 hours)
- **Phase 5**: Documentation (1 hour)

**Total Estimated Time**: 10 hours

---

## 📝 Version History

- **v5.0.0** (2026-01-15): Comprehensive documentation with network topology, ASCII diagrams, decision trees
- **v4.0.0** (2026-01-15): PC setup focus - separated from repo config
- **v3.0.0** (2026-01-14): Docker-first architecture with distributed setup
- **v2.0.0** (2026-01-11): Multi-PC bootstrap kits
- **v1.0.0** (2026-01-02): Initial bootstrap system

---

**🚀 Let's build something amazing!**
