# Config Backup & Restore System

> **Automated configuration management scripts for Project Nyra**

## Quick Start

```bash
# Backup configs
./bootstrap/scripts/backup-configs.sh

# Restore latest
./bootstrap/scripts/restore-configs.sh latest

# Restore interactively
./bootstrap/scripts/restore-configs.sh
```

## Features

✅ **Automated backups** via Git pre-commit hook
✅ **Dual storage** - `docs/configs/backup` AND `config/backup`
✅ **Version control** - Timestamped backups (keeps last 10)
✅ **Safety** - Existing configs backed up with `.bak` suffix
✅ **Comprehensive** - Backs up all PC configs, Docker, MCP, root configs

## What Gets Backed Up

- **PC-Specific**: `bootstrap/orchestrator-mini/`, `bootstrap/worker-*/`
- **Docker**: `docker-compose*.yml`, Docker configs
- **MCP**: `.mcp.json`, `.claude-flow/mcp.json`
- **Claude**: Claude Desktop configs, custom instructions
- **Services**: n8n, databases, Koyeb, Tailscale, Cloudflared, Gitea, Infisical

## Documentation

Full documentation: [bootstrap/docs/CONFIG-MANAGEMENT.md](../docs/CONFIG-MANAGEMENT.md)

---

**Last Updated**: 2026-01-15
