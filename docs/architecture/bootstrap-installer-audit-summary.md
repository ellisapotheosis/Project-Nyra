# Bootstrap Installer Directory Audit Summary

**Date**: 2026-01-15
**Purpose**: Clarify what belongs in bootstrap/installer/ for actual PC setup vs repository-wide deployment

---

## Executive Summary

The `bootstrap/installer/` directory serves as a **PC-level setup toolkit** for configuring individual machines in the 4-PC Windows 11 cluster. It should contain ONLY materials needed to prepare a fresh PC for the Nyra environment, NOT repository-wide deployment configurations.

**Current State**: Mixed PC setup and repository deployment materials
**Recommended Action**: Separate PC setup utilities from repository infrastructure

---

## ✅ Materials to KEEP (PC Setup Focused)

### 1. GUI Installer Application

**Location**: `bootstrap/installer/src/`

**Keep**:
- React + Electron GUI application (`src/renderer/`, `src/main/`)
- Installation wizard components:
  - `PCSelector.tsx` - Hardware detection and role assignment
  - `ComponentSelector.tsx` - Enable/disable components per PC
  - `EnvironmentSelector.tsx` - Dev vs production mode
  - `InstallationProgress.tsx` - Real-time installation status
  - `HealthDashboard.tsx` - Service health monitoring
  - `MCPServerManager.tsx` - MCP server configuration
  - `ShimGenerator.tsx` - Cross-platform compatibility shims
  - `DockerSetup.tsx` - Docker Desktop installation
  - `ConfigurationEditor.tsx` - Config file editing

**Purpose**: User-friendly interface for PC setup automation

**Why Keep**: Core PC setup functionality - installing software, configuring network, deploying archon-os configs TO individual machines.

---

### 2. PC Bootstrap Scripts

**Location**: `bootstrap/installer/scripts/`

**Keep**:
```
├── bootstrap-orchestrator.ps1/.sh    # Setup orchestrator (PC1)
├── bootstrap-worker.ps1/.sh          # Setup worker nodes (PC2-4)
├── configure-static-ip.ps1/.sh       # Network configuration (10.0.0.1-4)
├── health-check-all.ps1/.sh          # Check PC services health
├── backup-daily.ps1/.sh              # Backup archon-os configs
```

**Purpose**: Automated scripts for individual PC configuration

**Why Keep**: These configure PC-level settings (static IPs, WSL, Docker Desktop, archon-os installation) that are specific to each physical machine.

---

### 3. Config Templates (Deploy TO PCs)

**Location**: `bootstrap/installer/configs/`

**Keep**:
```
├── claude-code/
│   └── settings.json                  # Claude Code CLI settings
├── claude-desktop/
│   └── .mcp.json                      # MCP server config for Claude Desktop
├── archon-os/
│   ├── archon-os.config.json        # Claude Flow V3 configuration
│   └── .env.template                  # API keys template
├── wsl/
│   └── .wslconfig                     # WSL2 kernel settings
├── docker/
│   └── daemon.json                    # Docker Desktop configuration
├── nvidia/
│   └── cuda-toolkit.conf              # NVIDIA GPU settings (workers only)
├── infisical/
│   └── config.json                    # Secrets management
├── orchestrator/                       # PC1-specific configs
├── worker-1/                           # PC2-specific configs
├── worker-2/                           # PC3-specific configs
├── worker-3/                           # PC4-specific configs
```

**Purpose**: Configuration files deployed TO each PC's local system

**Why Keep**: These are PC-level configs installed at:
- `%APPDATA%\Claude\` (Claude Code/Desktop)
- `%USERPROFILE%\.archon-os\` (Claude Flow)
- `%USERPROFILE%\.wslconfig` (WSL)
- `%APPDATA%\Docker\` (Docker daemon)

**Key Distinction**: These configure the **local environment** on each PC, not repository services.

---

### 4. PC-Specific Installation Utilities

**Location**: `bootstrap/installer/src/services/`

**Keep**:
```
├── installOrchestrator.ts             # PC installation orchestration
├── fileDeployer.ts                    # Deploy configs to correct paths
├── validator.ts                       # Validate PC configuration
├── scriptRunner.ts                    # Execute PowerShell/bash scripts
├── logger.ts                          # Installation logging
```

**Purpose**: Core installation logic for setting up individual PCs

**Why Keep**: Essential for automated PC setup workflow.

---

### 5. PC Hardware & Network Setup

**Location**: `bootstrap/installer/scripts/distributed-setup/`

**Keep**:
```
├── 01-gitea-setup.sh                  # Self-hosted git (optional)
├── 02-cloudflared-setup.sh            # Tunnel setup
├── 03-tailscale-setup.sh              # VPN mesh networking
├── 04-archon-os-distributed.sh     # Distributed archon-os setup
```

**Purpose**: Configure networking between the 4 PCs

**Why Keep**: These set up PC-to-PC communication and distributed coordination.

---

### 6. Shims & Cross-Platform Compatibility

**Location**: `bootstrap/installer/scripts/shims/`

**Keep**:
```
├── archon.sh                          # Archon OS shim
├── archon-os-dev.sh                 # Claude Flow development shim
├── [other platform shims]
```

**Purpose**: Cross-platform command execution (Windows/WSL/Linux)

**Why Keep**: Enables consistent command usage across different PC environments.

---

## ❌ Materials to REMOVE/MOVE (Repository-Level)

### 1. Docker Compose Files for Services

**Current Location**: `bootstrap/installer/docker/`

**Move To**: `/infra/docker-compose/` or `/docker-compose.yml` (root)

**Files**:
```
❌ docker-compose.yml                   # Main services
❌ docker-compose.dev.yml               # Development overrides
❌ docker-compose.prod.yml              # Production overrides
❌ Makefile                             # Docker operations
```

**Why Remove**: These deploy **repository services** (PostgreSQL, Redis, Claude Flow MCP, Archon OS, letta, Mem0, Gitea, n8n) that run IN containers. They are NOT PC setup scripts.

**Current Issue**: Confusion between:
- Installing Docker Desktop on a PC (PC setup - KEEP)
- Running docker-compose to start services (Repository deployment - MOVE)

**Correct Location**: Repository root or `/infra/` where ALL docker services are managed.

---

### 2. MCP Server Deployment Configs

**Current Location**: `bootstrap/installer/configs/environments/`

**Move To**: `/mcp-servers/` or `/config/mcp/`

**Files**:
```
❌ development.env                      # Dev environment MCP configs
❌ production.env                       # Prod environment MCP configs
❌ pc1.env, pc2.env, pc3.env, pc4.env   # Per-PC MCP settings (if service-level)
```

**Why Remove**: MCP server **deployment** is repository-wide, not PC-specific.

**Exception**: MCP **client** configuration for Claude Desktop (`.mcp.json`) STAYS because it configures the local Claude Desktop app.

---

### 3. Service Health Check Tests

**Current Location**: `bootstrap/installer/docker/tests/`

**Move To**: `/tests/integration/` or `/infra/tests/`

**Files**:
```
❌ health-check-tests.sh                # Test docker services
❌ integration-tests.sh                 # Test service integration
❌ security-tests.sh                    # Security scanning
```

**Why Remove**: These test **repository services** running in containers, not PC health.

**Correct Location**: Repository-level test suite.

**Keep Alternative**: `scripts/health-check-all.ps1` which checks PC-level services (Docker daemon, WSL, Claude Flow CLI installed correctly, etc.)

---

### 4. Application Configuration Files

**Current Location**: `bootstrap/installer/configs/`

**Move To**: `/config/` (root) or service-specific directories

**Files**:
```
❌ gitea/app.ini                        # Gitea service config (if running in Docker)
❌ infisical/docker.env                 # Infisical service config
❌ n8n/config.env                       # n8n workflow service config
```

**Why Remove**: These configure **services**, not the PC environment.

**Exception**: If Infisical CLI config (for accessing secrets from PC), then KEEP.

---

### 5. Repository Build/Deployment Scripts

**Current Location**: `bootstrap/installer/docker/`

**Move To**: `/scripts/deployment/` or `/infra/scripts/`

**Files**:
```
❌ docker/Makefile                      # Build and deploy services
❌ docker/.env.example                  # Service environment variables
```

**Why Remove**: These manage repository infrastructure, not PC setup.

---

## 📋 Revised Structure for bootstrap/installer/

### Recommended Final Structure

```
bootstrap/installer/
├── README.md                           # Purpose: PC setup toolkit
├── package.json                        # GUI installer dependencies
├── LAUNCHER.sh                         # Entry point for installer
│
├── src/                                # GUI Installer Application
│   ├── main/                           # Electron main process
│   ├── renderer/                       # React UI
│   ├── components/                     # Setup wizard screens
│   ├── services/                       # Installation orchestration
│   ├── store/                          # Installation state
│   ├── types/                          # TypeScript types
│   └── data/
│       └── manifest.json               # PC roles and components
│
├── configs/                            # Templates deployed TO PCs
│   ├── claude-code/
│   │   └── settings.json
│   ├── claude-desktop/
│   │   └── .mcp.json                   # Local MCP client config
│   ├── archon-os/
│   │   ├── archon-os.config.json
│   │   └── .env.template
│   ├── wsl/
│   │   └── .wslconfig
│   ├── docker/
│   │   └── daemon.json                 # Docker Desktop daemon config
│   ├── nvidia/
│   │   └── cuda-toolkit.conf
│   ├── orchestrator/                   # PC1-specific
│   ├── worker-1/                       # PC2-specific
│   ├── worker-2/                       # PC3-specific
│   └── worker-3/                       # PC4-specific
│
└── scripts/                            # PC Setup Scripts
    ├── bootstrap-orchestrator.ps1/.sh
    ├── bootstrap-worker.ps1/.sh
    ├── configure-static-ip.ps1/.sh
    ├── health-check-all.ps1/.sh        # Check PC health (not services)
    ├── backup-daily.ps1/.sh            # Backup PC configs
    ├── distributed-setup/              # Multi-PC networking
    │   ├── 01-gitea-setup.sh
    │   ├── 02-cloudflared-setup.sh
    │   ├── 03-tailscale-setup.sh
    │   └── 04-archon-os-distributed.sh
    └── shims/                          # Cross-platform shims
        ├── archon.sh
        └── archon-os-dev.sh
```

---

## 🚀 What bootstrap/installer/ Should Do

### Primary Purpose: Individual PC Setup

1. **Install Software**
   - Docker Desktop (on Windows)
   - Node.js, Python, Git
   - WSL2 + Ubuntu (on Windows)
   - NVIDIA drivers and CUDA toolkit (workers only)
   - Claude Code CLI
   - Claude Desktop app

2. **Configure PC Network**
   - Set static IP (10.0.0.1-4)
   - Configure Tailscale VPN
   - Set up mesh networking between PCs
   - Configure firewall rules

3. **Deploy Configuration Files**
   - Claude Code settings → `%APPDATA%\Claude\`
   - Claude Desktop MCP config → `%APPDATA%\Claude\`
   - Claude Flow config → `%USERPROFILE%\.archon-os\`
   - WSL kernel config → `%USERPROFILE%\.wslconfig`
   - Docker daemon config → `%APPDATA%\Docker\`

4. **Configure PC Role**
   - Orchestrator (PC1): Coordination node, no GPU
   - Worker-2 (PC2): RTX 3060, model inference
   - Worker-3 (PC3): RTX 5090, primary compute
   - Worker-4 (PC4): RTX 3090 Ti, secondary compute

5. **Validate PC Setup**
   - Docker daemon running
   - WSL accessible
   - Static IP configured correctly
   - Tailscale connected
   - Claude Flow CLI functional
   - GPU detected (workers only)

---

## 🛠️ What bootstrap/installer/ Should NOT Do

### NOT PC Setup (Move Elsewhere)

1. **Deploy Repository Services**
   - PostgreSQL, Redis, MongoDB containers
   - Claude Flow MCP server
   - Archon OS service
   - letta/Mem0 MCP servers
   - Gitea, n8n, Infisical

   **Correct Location**: `/infra/docker-compose/` or root `docker-compose.yml`

2. **Manage Repository Code**
   - Build applications
   - Deploy apps to containers
   - Manage service dependencies

   **Correct Location**: CI/CD workflows, deployment scripts

3. **Test Repository Services**
   - Integration tests
   - Service health checks
   - Security scans

   **Correct Location**: `/tests/` or `/infra/tests/`

---

## 🎯 Key Distinction

### PC Setup vs Repository Deployment

| Aspect | PC Setup (KEEP) | Repository Deployment (MOVE) |
|--------|-----------------|------------------------------|
| **Target** | Individual physical machine | Containerized services |
| **Scope** | OS, network, software installation | Application services, databases |
| **Location** | `%APPDATA%`, `%USERPROFILE%`, system settings | Docker volumes, containers |
| **Purpose** | Prepare PC for work | Run the actual workload |
| **Examples** | Install Docker Desktop | Run PostgreSQL in Docker |
| | Configure static IP | Deploy Gitea service |
| | Set up WSL | Run Claude Flow MCP server |
| | Install Claude Code | Deploy Archon OS API |
| | Configure GPU drivers | Run Ollama container |

---

## 📦 Recommended Moves

### From bootstrap/installer/ → Root or /infra/

```bash
# Move docker service deployment
bootstrap/installer/docker/docker-compose.yml → /docker-compose.yml
bootstrap/installer/docker/docker-compose.dev.yml → /docker-compose.dev.yml
bootstrap/installer/docker/docker-compose.prod.yml → /docker-compose.prod.yml
bootstrap/installer/docker/Makefile → /Makefile

# Move service configs
bootstrap/installer/configs/environments/*.env → /config/environments/

# Move service tests
bootstrap/installer/docker/tests/ → /tests/integration/docker/
```

### Merge with Existing Infrastructure

If `/infra/docker-compose/` already exists:

```bash
# Merge into existing structure
bootstrap/installer/docker/* → /infra/docker-compose/
```

---

## ✅ Success Criteria

After reorganization, `bootstrap/installer/` should:

1. **Be PC-Centric**
   - All materials relate to setting up a single PC
   - No repository-wide service deployment
   - Clear separation of concerns

2. **Be Portable**
   - Can be run on a fresh Windows 11 PC
   - Doesn't depend on repository being cloned
   - Standalone installer package

3. **Be Role-Aware**
   - Detect PC hardware
   - Suggest role (orchestrator vs worker)
   - Install appropriate components

4. **Validate Completion**
   - All software installed
   - Network configured correctly
   - Services can reach each other
   - Ready to clone repository and deploy services

---

## 🔄 Migration Plan

### Phase 1: Audit (Complete)
- [x] Identify all materials in bootstrap/installer/
- [x] Categorize as PC setup vs repository deployment
- [x] Document recommended structure

### Phase 2: Reorganize (Next Steps)

1. **Create new structure**
   ```bash
   mkdir -p /infra/docker-compose
   mkdir -p /config/environments
   mkdir -p /tests/integration/docker
   ```

2. **Move service deployment files**
   ```bash
   mv bootstrap/installer/docker/docker-compose*.yml /infra/docker-compose/
   mv bootstrap/installer/docker/Makefile /infra/docker-compose/
   mv bootstrap/installer/docker/.env.example /infra/docker-compose/
   ```

3. **Move service tests**
   ```bash
   mv bootstrap/installer/docker/tests/* /tests/integration/docker/
   ```

4. **Update documentation**
   - Update README files
   - Fix references in bootstrap scripts
   - Update CLAUDE.md configs

5. **Clean up bootstrap/installer/**
   ```bash
   rm -rf bootstrap/installer/docker/
   # Keep only PC setup materials
   ```

### Phase 3: Validation

1. **Test PC Setup**
   - Run bootstrap/installer/ on fresh PC
   - Verify all PC-level configs deployed
   - Confirm no broken references

2. **Test Service Deployment**
   - Run docker-compose from new location
   - Verify all services start correctly
   - Confirm health checks pass

---

## 📊 Summary Table

| Category | Keep in bootstrap/installer/ | Move Out |
|----------|----------------------------|----------|
| **GUI App** | ✅ React installer | |
| **Scripts** | ✅ bootstrap-*.ps1, configure-static-ip.ps1 | ❌ service deployment |
| **Configs** | ✅ Claude Code/Desktop, archon-os, WSL, Docker daemon | ❌ Service .env files |
| **Docker** | ✅ Docker Desktop installation script | ❌ docker-compose.yml |
| **Tests** | ✅ PC health checks | ❌ Service integration tests |
| **Networking** | ✅ Static IP, Tailscale setup | |
| **Services** | | ❌ PostgreSQL, Redis, MCP servers |

---

## 🎓 Conclusion

The `bootstrap/installer/` directory should be a **PC setup toolkit**, not a service deployment system. It prepares individual machines to participate in the cluster by:

1. Installing necessary software (Docker, WSL, Claude tools)
2. Configuring network (static IPs, VPN)
3. Deploying PC-level configs (Claude Code, archon-os settings)
4. Validating readiness (health checks)

**After PC setup is complete**, the user can then:
1. Clone the Project Nyra repository
2. Run `docker-compose up` from `/infra/` or root
3. Start the actual application services

This separation makes the codebase clearer, the installer more focused, and the architecture easier to understand.

---

**Audit Completed**: 2026-01-15
**Status**: Ready for reorganization
**Next Step**: Execute Phase 2 migration plan
