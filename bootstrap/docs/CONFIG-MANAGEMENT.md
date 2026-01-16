# Configuration Management Guide

This document explains how to manage and deploy configuration files across the Project Nyra infrastructure.

## Configuration Repository Structure

All shared (non-PC-specific) configuration files are centralized in `bootstrap/configs/`:

```
bootstrap/configs/
├── claude-flow/          # Claude Flow V3 configurations
├── mcp/                  # MCP Server configurations
├── env/                  # Environment variable templates
├── infisical/            # Infisical secrets management
├── agents/               # Agent configuration files
├── quality/              # Code quality and linting configs
├── docker/               # Docker configuration files
└── README.md             # Full documentation
```

See [bootstrap/configs/README.md](../configs/README.md) for complete directory structure and usage.

## Quick Reference

### Deploy Configs to New PC

```bash
# Claude Flow
cp bootstrap/configs/claude-flow/claude-flow.config.json ./
cp bootstrap/configs/claude-flow/config.yaml .claude-flow/

# MCP (choose development or production)
cp bootstrap/configs/mcp/mcp.development.json ./.mcp.json

# Environment
cp bootstrap/configs/env/env.example ./.env
# Edit .env to add secrets
```

### Update Shared Configs

```bash
# 1. Update config in bootstrap/configs/
nano bootstrap/configs/claude-flow/claude-flow.config.json

# 2. Commit to git
git add bootstrap/configs/
git commit -m "Update shared config"

# 3. Deploy to PCs
./bootstrap/scripts/deploy-configs.sh
```

## Configuration Types

- **Shared configs** (in `bootstrap/configs/`): Templates, defaults, standards
- **PC-specific configs** (NOT in git): `.env` with secrets, local paths

## References

- [Bootstrap Configs README](../configs/README.md) - Full documentation
- [Environment Variables Guide](../../docs/environment/ENVIRONMENT_VARIABLES.md)
- [Infisical Integration](../../docs/integration/INFISICAL_INTEGRATION_SUMMARY.md)
