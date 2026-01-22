# Configuration Documentation

This directory contains all configuration references, examples, and best practices for Project Nyra.

## Directory Structure

### `/env-backups/`
**Centralized backup location for all environment files**

This directory contains backup copies of all `.env` files and templates from across the project:

- **`/env-backups/root/`** - 19 .env files from project root
  - `.env`, `.env.example`, `.env.template`, `.env.master`
  - Machine-specific configs: `.env.orchestrator`, `.env.worker-3060`, `.env.worker-5090`, `.env.worker-3090ti`
  - Environment-specific: `.env.development`, `.env.production`, `.env.ci`
  - Claude-Flow configs: `.env.claude-flow`, `.env.dev.claude-flow`, `.env.prod.claude-flow`

- **`/env-backups/infra/`** - 15 .env files from infra folder (preserves directory structure)
  - `infra/.env`, `infra/.env.example`
  - MCP service templates in subdirectories (bitwarden-mcp, docker-mcp, infisical-mcp, etc.)
  - Machine configs in `machines/` subdirectory

**Total: 34 environment files backed up**

### `/infisical-secrets-management/`
**Complete Infisical secrets management integration**

Comprehensive documentation and tools for managing secrets with Infisical across the 4-PC distributed cluster:

- **`README.md`** - Main Infisical setup guide
- **`PATHS.md`** - Infisical path structure (/shared and /machines/<hostname>)
- **`machines/`** - Machine-specific .env files and deployment scripts
  - `orchestrator-mini.env`, `worker-rtx3060.env`, `worker-rtx5090.env`, `worker-rtx3090ti.env`
  - `upload-machines-to-infisical.ps1` - Upload secrets to Infisical
  - `generate-combined-env.ps1` - Download and merge secrets
- **`migration/`** - Migration tools and guides
  - Migration reports, quick start guides, PowerShell automation scripts
- **`scripts/`** - Bulk import utilities
- **`envtree/`** - Example Infisical folder structure

### `/claude/`
Claude-specific configurations and settings
- Claude Desktop config templates
- CLAUDE.md templates for different modules
- Settings and preferences

### `/examples/`
Example configuration files for various components
- Service configurations
- Environment setups
- Integration examples

### `/backup/`
Configuration backups for recovery and reference
- Latest configurations
- Timestamped backups
- Version history

## Key Files

### Primary Guides

- **ENVIRONMENT-SETUP-MASTER-GUIDE.md** - **START HERE**: Comprehensive environment setup guide
  - Local .env setup vs Infisical vs Hybrid approaches
  - Machine-specific configurations for 4-PC cluster
  - Environment variable categories (shared vs machine-specific)
  - Security best practices and rotation schedules
  - Deployment workflows and troubleshooting
  - Complete file inventory (34 backed up files)

### Additional Documentation

- **environment-variables.md** - Environment variables reference
- **overview.md** - Configuration overview
- **best-practices.md** - Configuration best practices
- **version-comparison.md** - Version comparison and compatibility

## Usage

### Quick Start

1. **Environment Setup** - Read `ENVIRONMENT-SETUP-MASTER-GUIDE.md` for complete setup instructions
2. **Choose Your Approach**:
   - **Local Development**: Copy from `/env-backups/root/.env.example`
   - **Infisical (Recommended)**: Follow `/infisical-secrets-management/README.md`
   - **Hybrid**: Mix local overrides with Infisical secrets
3. **Machine Configuration** - Select your machine role:
   - Orchestrator (PC1): `.env.orchestrator`
   - Worker RTX 3060 (PC2): `.env.worker-3060`
   - Worker RTX 5090 (PC3): `.env.worker-5090`
   - Worker RTX 3090 Ti (PC4): `.env.worker-3090ti`

### Additional Resources

1. **New Setup** - Start with `overview.md` for general configuration guidance
2. **Environment Variables** - Reference `environment-variables.md` for variable documentation
3. **Best Practices** - Review `best-practices.md` before configuring
4. **Examples** - Browse `/examples/` for specific use cases
5. **Recovery** - Check `/backup/` or `/env-backups/` for previous configurations

## Configuration Categories

### Environment & Secrets Management
- **Environment Files** - `.env` backups in `/env-backups/` (34 files total)
- **Secrets Management** - Infisical integration in `/infisical-secrets-management/`
- **Machine Configurations** - 4-PC distributed cluster configs

### System Configuration
- **Core Configuration** - Main system configuration
- **Service Configuration** - Individual service settings
- **Environment Configuration** - Environment-specific settings
- **Integration Configuration** - Third-party integrations

## Distributed Cluster Setup

Project-Nyra runs on a 4-PC distributed cluster with specialized roles:

1. **PC1 (orchestrator-mini)** - Orchestrator with PostgreSQL, Redis, n8n
2. **PC2 (worker-rtx3060)** - Worker specializing in code generation (RTX 3060)
3. **PC3 (worker-rtx5090)** - Worker specializing in reasoning (RTX 5090)
4. **PC4 (worker-rtx3090ti)** - Worker specializing in analysis (RTX 3090 Ti)

All machines connected via Tailscale mesh network. See `ENVIRONMENT-SETUP-MASTER-GUIDE.md` for complete setup instructions.

---

**Last Updated**: 2026-01-22
**Status**: Active - Central configuration reference
