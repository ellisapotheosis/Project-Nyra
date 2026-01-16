# Docker Shims - Quick Start Guide

> **TL;DR:** Production-ready CLI shims for Docker-based tools with automatic Infisical secret injection.

## ⚡ 30-Second Setup

### Windows
```cmd
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\scripts\shims
powershell -ExecutionPolicy Bypass -File install-shims.ps1 -All
```
Restart terminal, then: `claude-flow --help`

### Linux/WSL
```bash
cd /mnt/c/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/shims
./install-shims.sh --all
source ~/.bashrc
./claude-flow.sh --help
```

## 🎯 What You Get

| Shim | Purpose | Container |
|------|---------|-----------|
| `claude-flow` | AI agent orchestration (prod) | `nyra-claude-flow-mcp` |
| `claude-flow-dev` | AI agent orchestration (dev) | `nyra-claude-flow-mcp` |
| `archon` | Archon OS agent system | `nyra-archon-mcp` |
| `infisical` | Secret management CLI | `nyra-infisical-mcp` |

## 🔐 Required Environment Variables

```bash
INFISICAL_PROJECT_ID=<your-project-id>
INFISICAL_TOKEN=<your-token>
```

**Windows:** Use `setx` command
**Linux/WSL:** Add to `~/.bashrc` or `~/.zshrc`

## 📦 Prerequisites

```bash
# 1. Start Docker
# Windows: Docker Desktop
# Linux: sudo systemctl start docker

# 2. Start containers
cd C:\Dev\Projects\Repos\Project-Nyra
docker-compose -f docker-compose.infisical.yml up -d

# 3. Verify
docker ps | grep nyra
```

## 🚀 Common Commands

### Claude Flow
```bash
# Initialize project
claude-flow init --wizard

# Spawn agent
claude-flow agent spawn -t coder --name my-coder

# Initialize swarm
claude-flow swarm init --topology hierarchical --max-agents 8

# Search memory
claude-flow memory search --query "authentication"

# System diagnostics
claude-flow doctor --fix

# Development mode (with dev secrets)
claude-flow-dev hooks session-start --session-id dev-001
```

### Archon OS
```bash
# List agents
archon agent list

# Create coordinator
archon agent create --type coordinator --name main

# Run task
archon task run --file task.yaml
```

### Infisical
```bash
# List secrets
infisical secrets list --env=development

# Get secret
infisical secrets get API_KEY --env=production

# Export to .env
infisical export --env=development > .env.local

# Run command with secrets
infisical run --env=development -- npm start
```

## 🔧 Troubleshooting

### Shim not found
```bash
# Windows
echo %PATH%
# Should include: C:\Dev\Projects\Repos\Project-Nyra\bootstrap\scripts\shims

# Linux/WSL
echo $PATH
# Should include: /mnt/c/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/shims
```

### Docker not running
```bash
# Check Docker
docker info

# Windows: Start Docker Desktop
# Linux: sudo systemctl start docker
```

### Container not found
```bash
# Check containers
docker ps -a | grep nyra

# Start containers
cd C:\Dev\Projects\Repos\Project-Nyra
docker-compose -f docker-compose.infisical.yml up -d
```

### Infisical auth failed
```bash
# Check environment variables
# Windows
echo %INFISICAL_PROJECT_ID%
echo %INFISICAL_TOKEN%

# Linux/WSL
echo $INFISICAL_PROJECT_ID
echo $INFISICAL_TOKEN

# Test Infisical directly
docker exec nyra-infisical-mcp infisical secrets list --env=development
```

## 🎓 How It Works

```
Your Command
    ↓
Shim Script
    ↓
1. Check Docker running
2. Check container exists
3. Auto-start if stopped
4. Inject Infisical secrets
    ↓
docker exec [container] sh -c "infisical run -- [command]"
    ↓
Tool executes with secrets
    ↓
Output returned to you
```

## 📖 Full Documentation

- **Comprehensive Guide:** [`README.md`](./README.md)
- **Implementation Summary:** [`SHIMS-SUMMARY.md`](./SHIMS-SUMMARY.md)
- **Architecture:** `../../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md`
- **Docker Compose:** `../../docker-compose.infisical.yml`

## 🆘 Quick Help

```bash
# Test shims
# Windows
powershell -ExecutionPolicy Bypass -File install-shims.ps1 -TestShims

# Linux/WSL
./install-shims.sh --test

# View logs
docker logs nyra-claude-flow-mcp
docker logs nyra-archon-mcp
docker logs nyra-infisical-mcp

# Restart container
docker restart nyra-claude-flow-mcp

# Get help
claude-flow --help
archon --help
infisical --help
```

## ✅ Verification

Run these to verify everything works:

```bash
# 1. Check Docker
docker info

# 2. Check containers
docker ps | grep nyra

# 3. Test shims
claude-flow --version
archon --version
infisical --version

# 4. Test with real command
claude-flow doctor
```

All working? You're ready to go! 🎉

---

**Need help?** See [`README.md`](./README.md) for detailed troubleshooting and advanced usage.
