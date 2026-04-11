# Bootstrap Orchestration Prompt

> **Purpose**: Complete prompt for AI agent/orchestrator to build the Project Nyra bootstrap system from scratch.

---

## Mission Overview

Create a comprehensive bootstrap system for a 4-PC distributed AI mortgage automation cluster. The bootstrap folder contains ONLY materials for setting up individual physical PCs (not repository-wide infrastructure).

---

## Hardware Architecture

### Orchestrator PC (PC1)
- **Hardware**: Minisforum UH680 - Ryzen 7 6800H, 16GB DDR5, No GPU
- **IP**: 10.0.0.1 (static)
- **Role**: Primary controller, runs ALL services by default
- **Always On**: Yes (24/7 operation)

### GPU Worker PCs (Sleep Mode - Wake on Demand)
- **PC2**: RTX 3060 12GB @ 10.0.0.2
- **PC3**: RTX 5090 32GB @ 10.0.0.3
- **PC4**: RTX 3090 Ti 24GB @ 10.0.0.4
- **Always On**: No (wake via magic packet when compute needed)

---

## What Bootstrap IS

**Bootstrap = Physical PC Setup Only**

Tasks that require logging into each individual PC:
- Installing Docker Desktop on THIS PC
- Setting static IP (10.0.0.1-4) on THIS PC's network adapter
- Copying Claude settings to THIS PC's `%APPDATA%` folder
- Installing WSL on THIS PC
- Setting up Tailscale VPN on THIS PC
- Setting up Cloudflared tunnels on THIS PC
- Installing NVIDIA drivers on GPU worker PCs
- Deploying services TO THIS PC
- ANY task that requires "log into PC → do something"

---

## What Bootstrap IS NOT

**NOT Bootstrap = Repository Infrastructure**

These belong in repo root folders, not bootstrap:
- Docker compose files (already in `/docker/`)
- Service configs (already in `/configs/`)
- Application code (in `/apps/`, `/services/`)
- Repository-wide infrastructure (in `/infra/`)

**Simple Rule**: If it can be committed/deployed to repo structure NOW without logging into a PC, it's NOT bootstrap material.

---

## Required Components

### 1. GUI Installer (React + Electron)

**Purpose**: Interactive wizard for automated PC setup

**Must Include**:
- Welcome screen with architecture overview
- PC role selection (Orchestrator vs Worker 1/2/3)
- Hardware detection (see Hardware Detection section)
- Network configuration wizard
  - Static IP assignment (10.0.0.1-4)
  - Subnet mask: 255.255.255.0
  - Gateway: 10.0.0.1
  - DNS: 8.8.8.8, 8.8.4.4
- Software installation orchestration
  - Docker Desktop
  - WSL (Ubuntu 22.04)
  - Node.js 20 LTS
  - Git
  - Python 3.11
  - CUDA toolkit (GPU workers only)
- Tailscale VPN setup
- Cloudflared tunnel setup
- Component selection (what services to install)
- Service deployment progress
- Health check validation
- Completion summary with access URLs

**Tech Stack**:
- React 18 + TypeScript
- Electron (for native system access)
- Tailwind CSS
- Vite build system

### 2. Hardware Detection System

**Must Detect** (using ONLY simple built-in commands, NO special apps):
- ✅ PC name (`hostname`)
- ✅ IP address (`ipconfig` / `ip addr`)
- ✅ MAC address (`getmac` / `ip link`) - CRITICAL for Wake-on-LAN
- ✅ CPU info (`wmic cpu get name` / `lscpu`)
- ✅ RAM details (`wmic memorychip get capacity,speed` / `dmidecode`)
- ✅ GPU info (`nvidia-smi` if available, else `wmic path win32_videocontroller`)
- ✅ GPU VRAM (especially important for compute allocation)
- ✅ Network adapter details (for Tailscale/Cloudflared)

**Implementation**:
- PowerShell scripts for Windows
- Bash scripts for Linux/WSL
- Cross-platform Node.js wrapper
- JSON output format for GUI consumption

### 3. Orchestrator PC Full Stack Setup

**WSL Configuration**:
- Ubuntu 22.04 LTS
- Docker integration enabled
- Systemd enabled
- `.wslconfig` template with optimal settings
- Claude Code installation in WSL

**Gitea Setup**:
- Local git server on orchestrator
- Docker container deployment
- SSH key generation and setup
- Repository initialization
- Webhook configuration

**Database Setup**:
- PostgreSQL (TwentyCRM, n8n, Dify)
- Redis (caching, sessions)
- AgentDB (vector embeddings)
- Neo4j (knowledge graphs)
- FalkorDB (alternative graph DB)

**MCP Servers** (ALL on orchestrator):
- Claude Flow MCP
- Archon MCP
- ArchGW MCP
- Infisical MCP (secrets management)
- Bitwarden MCP (password management)
- Custom MCP servers

**n8n Workflows**:
- Mortgage lead drip campaigns
- Automated follow-ups
- Email/SMS/call automation
- CRM integration workflows
- Document generation

**Claude Configuration**:
- Claude Code settings → `%APPDATA%\Claude\settings.json`
- Claude Desktop MCP config → `%APPDATA%\Claude\.mcp.json`
- Claude Flow config → `%USERPROFILE%\.claude-flow\`
- API keys and authentication

**Wake-on-LAN System**:
- Magic packet sender service
- PC2/3/4 MAC address registry
- Compute demand detection
- Automatic worker wake/sleep scheduling

**Koyeb VPS Integration**:
- Webapp backend hosting (reduce need for 24/7 GPU workers)
- n8n workflow offloading
- API gateway configuration
- Free tier optimization

### 4. GPU Worker PC Setup

**Minimal Setup** (Sleep mode by default):
- Wake-on-LAN enabled in BIOS
- Static IP configuration
- NVIDIA drivers + CUDA toolkit
- Docker with GPU support
- Ollama (for local LLM inference)
- Health monitoring agent
- Auto-sleep after idle period

**Services** (only when awake):
- Ollama inference server
- GPU-accelerated compute tasks
- Temporary workloads from orchestrator

### 5. Bootstrap Scripts (PowerShell + Bash)

**bootstrap-orchestrator.ps1/.sh**:
- Detect hardware
- Configure static IP 10.0.0.1
- Install Docker Desktop
- Install WSL + Ubuntu
- **Setup agentic-jujutsu** (self-learning VCS with ReasoningBank)
  - Linux binary available (26MB - `agentic-jujutsu.linux-x64-gnu.node`)
  - Initialize with `npx jj init --git-colocate`
  - Run setup script: `node scripts/setup-agentic-jujutsu.js`
  - Enables lock-free commits (23x faster), quantum-resistant security
- Setup Gitea
- Deploy all databases
- Start all MCP servers
- Configure n8n
- Setup Claude (Code + Desktop)
- Configure Wake-on-LAN
- Setup Koyeb integration
- Run health checks
- Generate summary report

**bootstrap-worker.ps1/.sh**:
- Detect hardware (especially GPU)
- Configure static IP (10.0.0.2/3/4)
- Install Docker Desktop
- Install NVIDIA drivers
- Configure GPU passthrough
- Enable Wake-on-LAN
- Install monitoring agent
- Configure auto-sleep
- Run health checks

**configure-static-ip.ps1/.sh**:
- Auto-detect network adapter
- Set static IP based on PC role
- Configure subnet, gateway, DNS
- Test connectivity
- Update hosts file

**health-check-all.ps1/.sh**:
- Test network connectivity (ping all PCs)
- Check Docker status
- Verify service health (all 22+ services)
- Test database connections
- Validate MCP server responses
- Check GPU availability (workers)
- Test Wake-on-LAN (send test packet)
- Generate health report (JSON + pretty output)

**backup-daily.ps1/.sh**:
- Backup claude-flow configs
- Backup Gitea repositories
- Backup PostgreSQL databases
- Backup Redis data
- Backup AgentDB vectors
- Backup n8n workflows
- 7-day rotation
- Compression + checksums

### 6. Tailscale VPN Setup

**Purpose**: Secure mesh network for 4-PC cluster + external access

**Setup Wizard**:
- Tailscale installation (download + install)
- Auth key input (user provides)
- Device registration
- Subnet routing configuration
- Exit node setup (orchestrator)
- ACL configuration
- MagicDNS setup

**Config Templates**:
- Tailscale service file
- ACL rules for cluster
- Subnet routes

### 7. Cloudflared Tunnel Setup

**Purpose**: Secure external access without port forwarding

**Setup Wizard**:
- Cloudflared installation
- Tunnel creation (orchestrator only)
- DNS record setup
- Service routing configuration
- SSL/TLS certificates
- Health checks

**Services to Expose**:
- n8n workflows (for external triggers)
- RateHunter landing page (public)
- Admin dashboard (authenticated)
- API endpoints

### 8. Config Management System

**Directory Structure**:
```
bootstrap/installer/
├── configs/
│   ├── templates/           # Template configs for deployment
│   │   ├── claude-code/
│   │   ├── claude-desktop/
│   │   ├── claude-flow/
│   │   ├── wsl/
│   │   ├── docker/
│   │   ├── tailscale/
│   │   └── cloudflared/
│   └── profiles/            # PC-specific config profiles
│       ├── orchestrator/
│       ├── worker-1/
│       ├── worker-2/
│       └── worker-3/
```

**Config Deployment**:
- Read template
- Replace variables (PC name, IP, MAC, etc.)
- Copy to PC-specific location
- Set permissions
- Validate syntax
- Test configuration

**Backup Strategy**:
- PC configs in `bootstrap/installer/configs/`
- Backup copies in `/docs/backup-configs/` at repo root
- Version tracking (config changes recorded)

### 9. Launcher Scripts

**LAUNCHER.bat** (Windows):
- Interactive menu system
- Options:
  1. Launch GUI Installer
  2. Bootstrap Orchestrator (PC1)
  3. Bootstrap Worker 2 (PC2)
  4. Bootstrap Worker 3 (PC3)
  5. Bootstrap Worker 4 (PC4)
  6. Run Health Check
  7. Run Backup
  8. Configure Network
  9. View Documentation
  0. Exit
- Administrator privilege check
- Error handling
- Pretty output with colors

**LAUNCHER.sh** (Linux/Mac):
- Same menu as .bat
- Root privilege check
- ANSI color support
- Cross-platform compatibility

### 10. Documentation

**README.md** (bootstrap folder):
- Clear purpose statement (PC setup, NOT repo setup)
- Quick start (5 minutes)
- Architecture overview
- Step-by-step guide for each PC
- Troubleshooting section
- Hardware requirements
- Network configuration
- Service architecture

**SETUP-GUIDE.md**:
- Comprehensive 10-section guide
- Prerequisites
- Installation steps
- Configuration details
- Service deployment
- Testing and validation
- Common issues
- Advanced topics

---

## Success Criteria

### Functional Requirements
✅ GUI installer successfully deploys on Windows/Linux
✅ Hardware detection works without special apps
✅ Orchestrator PC can run all 22+ services
✅ GPU workers wake via magic packet
✅ Tailscale mesh network established
✅ Cloudflared tunnels expose services securely
✅ Health checks validate all services (>90% success)
✅ Claude Code + Desktop fully configured
✅ n8n workflows operational
✅ Backup system creates daily snapshots

### Performance Requirements
✅ Bootstrap time: <20 minutes (orchestrator)
✅ Bootstrap time: <10 minutes (workers)
✅ Service startup: <2 minutes
✅ Health check: <30 seconds
✅ Magic packet wake: <60 seconds
✅ Network latency: <5ms (LAN)

### User Experience
✅ Single entry point (GUI or launcher)
✅ Clear progress indicators
✅ Helpful error messages
✅ Automatic rollback on failure
✅ Comprehensive logs
✅ Success summary with URLs

---

## Implementation Strategy

### Phase 1: Core Infrastructure (Week 1)
1. Create React + Electron GUI scaffold
2. Implement hardware detection scripts
3. Build network configuration wizard
4. Create bootstrap scripts (orchestrator + worker)
5. Setup launcher scripts

### Phase 2: Service Deployment (Week 2)
1. Docker compose orchestration
2. Database setup automation
3. MCP server deployment
4. Claude configuration automation
5. Health check system

### Phase 3: Advanced Features (Week 3)
1. Wake-on-LAN system
2. Tailscale VPN integration
3. Cloudflared tunnel setup
4. n8n workflow deployment
5. Koyeb VPS integration

### Phase 4: Testing & Documentation (Week 4)
1. End-to-end testing on all 4 PCs
2. Performance benchmarking
3. Documentation completion
4. Troubleshooting guide
5. Video tutorials

---

## Technical Constraints

### Must Use
- ✅ Simple built-in commands for hardware detection
- ✅ Cross-platform scripts (PowerShell + Bash)
- ✅ React + Electron for GUI
- ✅ Docker for containerization
- ✅ Static IPs (10.0.0.1-4)
- ✅ Tailscale for VPN
- ✅ Cloudflared for tunnels

### Must NOT Use
- ❌ Special hardware detection apps
- ❌ Paid services (beyond free tiers)
- ❌ Port forwarding (use tunnels instead)
- ❌ Dynamic IPs
- ❌ Manual configuration (automate everything)

---

## Validation Steps

### Test on Each PC Type
1. **Fresh Windows Install**:
   - Run GUI installer
   - Verify all services start
   - Check health status
   - Test network connectivity

2. **Fresh Linux Install**:
   - Run bash scripts
   - Verify compatibility
   - Test WSL integration

3. **GPU Worker**:
   - Test Wake-on-LAN
   - Verify GPU detection
   - Test CUDA availability
   - Validate auto-sleep

4. **Full Cluster**:
   - Deploy on all 4 PCs
   - Test cross-PC communication
   - Validate service mesh
   - Run integration tests
   - Verify backup system

---

## Deliverables

### Code
- [ ] GUI installer (React + Electron)
- [ ] Hardware detection scripts
- [ ] Bootstrap scripts (orchestrator + worker)
- [ ] Launcher scripts (.bat + .sh)
- [ ] Health check scripts
- [ ] Backup scripts
- [ ] Config templates

### Documentation
- [ ] README.md (bootstrap purpose)
- [ ] SETUP-GUIDE.md (comprehensive)
- [ ] TROUBLESHOOTING.md
- [ ] API-REFERENCE.md (hardware detection)
- [ ] ARCHITECTURE.md (system design)

### Testing
- [ ] Unit tests (hardware detection)
- [ ] Integration tests (full bootstrap)
- [ ] End-to-end tests (4-PC cluster)
- [ ] Performance benchmarks
- [ ] Security audit

---

## Questions for Clarification

If you're implementing this, ask:

1. **Koyeb VPS**: What should be hosted? (webapp backend? n8n? API gateway?)
2. **n8n Workflows**: Specific campaign templates needed?
3. **Cloudflared**: Which services should be publicly accessible?
4. **Wake-on-LAN**: Trigger conditions? (CPU threshold? Manual? Scheduled?)
5. **Backup Strategy**: Local only? Cloud storage? Retention period?
6. **GPU Allocation**: How to decide which worker to wake?
7. **Security**: Certificate management? Secret storage? Access control?

---

## Notes

- **Personal Use**: This is for ONE person with 4 PCs, not a distributed product
- **Static IPs**: 10.0.0.1-4 on LAN (not internet-routable)
- **Always On**: Only orchestrator PC1 runs 24/7
- **Compute on Demand**: GPU workers wake when needed, sleep otherwise
- **Cost Optimization**: Koyeb free tier + minimal always-on usage

---

**Status**: Ready for Implementation
**Priority**: High
**Complexity**: Medium-High
**Timeline**: 3-4 weeks for complete system
