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

**Last Updated**: January 15, 2026
**Version**: 4.0.0
