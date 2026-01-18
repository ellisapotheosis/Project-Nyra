# Bootstrap Scripts

All bootstrap-related scripts for Project Nyra's 4-PC Windows 11 cluster setup and management.

## 📁 Directory Structure

```
scripts/
├── setup/              # Initial setup and configuration scripts
├── deployment/         # Deployment automation scripts
├── validation/         # Health checks and verification scripts
└── utilities/          # Helper scripts and tools
    └── shims/         # MCP server shims and integration
```

---

## 🚀 Setup Scripts (`setup/`)

Scripts for initial PC bootstrap and configuration.

### Main Bootstrap Scripts

| Script | Platform | Purpose |
|--------|----------|---------|
| `bootstrap-orchestrator.ps1` | Windows | Set up orchestrator PC (Minisforum UH680) |
| `bootstrap-orchestrator.sh` | Linux/WSL | Set up orchestrator PC (Minisforum UH680) |
| `bootstrap-worker.ps1` | Windows | Set up GPU worker PCs |
| `bootstrap-worker.sh` | Linux/WSL | Set up GPU worker PCs |

### Network Configuration

| Script | Platform | Purpose |
|--------|----------|---------|
| `configure-static-ip.ps1` | Windows | Configure static IP addresses (10.0.0.1-4) |
| `configure-static-ip.sh` | Linux/WSL | Configure static IP addresses (10.0.0.1-4) |

### Launchers

| Script | Platform | Purpose |
|--------|----------|---------|
| `LAUNCHER.bat` | Windows | Quick launch GUI installer |
| `LAUNCHER.sh` | Linux/Mac | Quick launch GUI installer |

**Usage:**
```bash
# Bootstrap orchestrator PC
cd bootstrap/scripts/setup
./bootstrap-orchestrator.sh

# Bootstrap worker PC
./bootstrap-worker.ps1

# Configure static IP
./configure-static-ip.sh --ip 10.0.0.2 --pc-role worker
```

---

## 🚢 Deployment Scripts (`deployment/`)

Scripts for distributed setup and service deployment.

### Distributed Setup (`deployment/distributed-setup/`)

Sequential setup scripts for distributed components:

| Script | Purpose | Dependencies |
|--------|---------|--------------|
| `01-gitea-setup.sh` | Deploy Gitea Git server | Docker, Docker Compose |
| `02-cloudflared-setup.sh` | Set up Cloudflare tunnels | Cloudflare account, domain |
| `03-tailscale-setup.sh` | Configure Tailscale VPN | Tailscale account |
| `04-claude-flow-distributed.sh` | Deploy Claude Flow cluster | Docker, static IPs |

**Usage:**
```bash
cd bootstrap/scripts/deployment/distributed-setup

# Run in sequence
./01-gitea-setup.sh
./02-cloudflared-setup.sh
./03-tailscale-setup.sh
./04-claude-flow-distributed.sh
```

---

## ✅ Validation Scripts (`validation/`)

Scripts for health checks and system verification.

| Script | Platform | Purpose |
|--------|----------|---------|
| `health-check-all.ps1` | Windows | Check all PC health metrics |
| `health-check-all.sh` | Linux/WSL | Check all PC health metrics |
| `verify-structure.ps1` | Windows | Verify bootstrap directory structure |
| `test-cloudflare-tunnels.ps1` | Windows | Test Cloudflare tunnel connectivity |
| `test-cloudflare-tunnels.sh` | Linux/WSL | Test Cloudflare tunnel connectivity |

**Usage:**
```bash
cd bootstrap/scripts/validation

# Run comprehensive health check
./health-check-all.sh

# Verify directory structure
powershell -ExecutionPolicy Bypass -File verify-structure.ps1
```

---

## 🛠️ Utilities (`utilities/`)

Helper scripts and tools for ongoing maintenance.

### Main Utilities

| Script | Platform | Purpose |
|--------|----------|---------|
| `backup-daily.ps1` | Windows | Daily backup of configurations |
| `backup-daily.sh` | Linux/WSL | Daily backup of configurations |

### Shims (`utilities/shims/`)

MCP server integration shims for easy command access. See `utilities/shims/README.md` for detailed documentation.

---

## 🚦 Quick Reference

### First-Time Setup
```bash
# 1. Bootstrap your PC
cd bootstrap/scripts/setup
./bootstrap-orchestrator.sh  # or bootstrap-worker.sh

# 2. Configure network
./configure-static-ip.sh --ip 10.0.0.1

# 3. Deploy distributed components
cd ../deployment/distributed-setup
for script in *.sh; do ./"$script"; done

# 4. Verify everything works
cd ../../validation
./health-check-all.sh
```

---

## 📦 Consolidated Scripts from nyra-scripts

The following scripts were consolidated from `nyra-scripts/` on 2026-01-16:

### Additional Setup Scripts

| Script | Platform | Purpose | Source |
|--------|----------|---------|--------|
| `codex-env-setup.ps1` | Windows | Codex-friendly environment bootstrap | nyra-scripts/ |
| `codex-env-setup.sh` | Linux/macOS | Codex-friendly environment bootstrap | nyra-scripts/ |
| `Setup-NYRAOrchestrator.ps1` | Windows | NYRA orchestrator setup | nyra-scripts/Consolidating-Configs-Workflow/ |
| `install-nyra-mcp.ps1` | Windows | MCP installation | nyra-scripts/docs/ |
| `setup-env.ps1` | Windows | Environment configuration | nyra-scripts/docs/ |
| `setup-mcp-servers.ps1` | Windows | MCP server setup | nyra-scripts/docs/ |
| `Start-NYRA-All.ps1` | Windows | All-in-one bootstrapping | nyra-scripts/Consolidating-Configs-Workflow/ |
| `start-nyra-all.sh` | Linux/macOS | All-in-one bootstrapping | nyra-scripts/Consolidating-Configs-Workflow/ |
| `bootstrap-mcp-ecosystem.ps1` | Windows | MCP ecosystem bootstrap | nyra-scripts/docs/ |

### Helper Scripts (`helpers/`)

| Script | Purpose | Source |
|--------|---------|--------|
| `quick-start.sh` | Quick start helper | nyra-scripts/.claude/helpers/ |
| `setup-mcp.sh` | MCP setup helper | nyra-scripts/.claude/helpers/ |
| `github-setup.sh` | GitHub configuration | nyra-scripts/.claude/helpers/ |
| `github-safe.js` | GitHub safe operations | nyra-scripts/.claude/helpers/ |
| `checkpoint-manager.sh` | Checkpoint management | nyra-scripts/.claude/helpers/ |
| `standard-checkpoint-hooks.sh` | Checkpoint hooks | nyra-scripts/.claude/helpers/ |

### Orchestration Scripts (`orchestration/`)

| Script | Platform | Purpose | Source |
|--------|----------|---------|--------|
| `nyra-mode.sh` | Linux/macOS | NYRA mode switcher | nyra-scripts/scripts/ |
| `run-all.ps1` | Windows | Run all services | nyra-scripts/scripts/ |
| `run-all.sh` | Linux/macOS | Run all services | nyra-scripts/scripts/ |
| `verify.sh` | Linux/macOS | Verification | nyra-scripts/scripts/ |
| `booster-codemod.sh` | Linux/macOS | Code modification | nyra-scripts/scripts/ |

**For full consolidation details, see**: `scripts/CONSOLIDATION-LOG.md`

---

**Last Updated**: January 16, 2026
**Version**: 4.1.0
