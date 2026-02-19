# Infisical Integration Guide - Project Nyra

## 🔐 Overview

This guide explains how to use Infisical for secret management across all Project Nyra services.

---

## 📋 Infisical Configuration

### Project Details
- **Project ID**: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`
- **Environment**: `dev` (or `prod`, `staging`)
- **Base Path**: `/shared`

### Secret Paths Structure

```
/shared/
├── orchestrator/          # Orchestrator-specific secrets
│   ├── POSTGRES_PASSWORD
│   ├── REDIS_PASSWORD
│   ├── LITELLM_MASTER_KEY
│   ├── GITEA_ADMIN_PASSWORD
│   └── CF_TUNNEL_TOKEN
├── workers/
│   ├── worker-rtx3060/   # RTX3060-specific secrets
│   ├── worker-rtx3090ti/ # RTX3090Ti-specific secrets
│   └── worker-rtx5090/   # RTX5090-specific secrets
├── api-keys/
│   ├── OPENAI_API_KEY
│   ├── ANTHROPIC_API_KEY
│   └── GOOGLE_API_KEY
└── services/
    ├── archon/
    ├── nexus/
    └── claude-flow/
```

---

## 🚀 Usage

### Method 1: Using Wrapper Scripts (Recommended)

#### PowerShell (Windows)
```powershell
# Start Archon with Infisical secrets
.\scripts\infisical-compose.ps1 -Command "up -d" -ComposeFile "infra/docker-compose/docker-compose.archon.yml"

# Start LiteLLM with Infisical secrets
.\scripts\infisical-compose.ps1 -Command "up -d" -ComposeFile "infra/docker-compose/docker-compose.litellm.yml"

# Stop services
.\scripts\infisical-compose.ps1 -Command "down" -ComposeFile "infra/docker-compose/docker-compose.archon.yml"
```

#### Bash (WSL/Linux)
```bash
# Make script executable
chmod +x scripts/infisical-compose.sh

# Start services
./scripts/infisical-compose.sh -f infra/docker-compose/docker-compose.archon.yml up -d
./scripts/infisical-compose.sh -f infra/docker-compose/docker-compose.litellm.yml up -d
```

### Method 2: Direct Infisical Command

```bash
# General pattern
infisical run \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared" \
  -- docker-compose -f <compose-file> <command>

# Examples
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared" -- docker-compose -f infra/docker-compose/docker-compose.archon.yml up -d

infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared" -- docker-compose -f infra/docker-compose/docker-compose.litellm.yml up -d
```

### Method 3: Using Makefile (Updated)

The Makefile has been updated to support Infisical:

```bash
# Set environment variable to enable Infisical
export USE_INFISICAL=true

# Or on Windows PowerShell
$env:USE_INFISICAL="true"

# Then run make commands as usual
make archon-up
make litellm-up
make infra-up
```

---

## 🔧 Setting Up Secrets in Infisical

### 1. Install Infisical CLI

```bash
# Windows (PowerShell)
winget install Infisical.Infisical

# macOS
brew install infisical/get-cli/infisical

# Linux
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical
```

### 2. Login to Infisical

```bash
infisical login
```

### 3. Set Secrets

#### Using CLI
```bash
# Set orchestrator secrets
infisical secrets set POSTGRES_PASSWORD="your-secure-password" \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared/orchestrator"

infisical secrets set LITELLM_MASTER_KEY="your-litellm-key" \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared/orchestrator"

infisical secrets set GITEA_ADMIN_PASSWORD="your-gitea-password" \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared/orchestrator"

# Set API keys
infisical secrets set OPENAI_API_KEY="sk-..." \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared/api-keys"

infisical secrets set ANTHROPIC_API_KEY="sk-ant-..." \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared/api-keys"
```

#### Using Web UI
1. Navigate to https://app.infisical.com
2. Select project: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`
3. Select environment: `dev`
4. Navigate to path: `/shared/orchestrator`
5. Click "Add Secret"
6. Enter key-value pairs

---

## 📝 Required Secrets Checklist

### Orchestrator Services
- [ ] `POSTGRES_PASSWORD` - PostgreSQL database password
- [ ] `POSTGRES_USER` - PostgreSQL username (default: postgres)
- [ ] `REDIS_PASSWORD` - Redis password
- [ ] `LITELLM_MASTER_KEY` - LiteLLM API master key
- [ ] `GITEA_ADMIN_PASSWORD` - Gitea admin password
- [ ] `GITEA_DB_PASSWORD` - Gitea database password
- [ ] `CF_TUNNEL_TOKEN` - Cloudflare tunnel token
- [ ] `INFISICAL_ENCRYPTION_KEY` - Infisical encryption key
- [ ] `INFISICAL_JWT_SECRET` - Infisical JWT secret

### API Keys
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `ANTHROPIC_API_KEY` - Anthropic API key
- [ ] `GOOGLE_API_KEY` - Google API key

### Worker Secrets
- [ ] `ORCHESTRATOR_API_KEY` - API key for workers to authenticate with orchestrator

---

## 🔄 Migration from .env to Infisical

### 1. Export Existing Secrets
```bash
# Create a backup of your .env
cp .env .env.backup

# View current secrets
cat .env
```

### 2. Import to Infisical
```bash
# Bulk import from .env file
infisical secrets import \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared/orchestrator" \
  --file=".env"
```

### 3. Verify Import
```bash
# List all secrets
infisical secrets list \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared/orchestrator"
```

### 4. Test Services
```bash
# Test with Infisical
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared" -- docker-compose -f infra/docker-compose/docker-compose.archon.yml up -d

# Verify services started
docker ps | grep archon
```

---

## 🐳 Docker Compose Integration

### Using Infisical in docker-compose.yml

You don't need to modify docker-compose files. Infisical injects secrets as environment variables when you run:

```bash
infisical run --projectId="..." --env="dev" --path="/shared" -- docker-compose up -d
```

All `${VARIABLE}` references in docker-compose.yml will be automatically populated from Infisical.

### Example: Archon Stack
```bash
# Start Archon with Infisical secrets
infisical run \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared" \
  -- docker-compose -f infra/docker-compose/docker-compose.archon.yml up -d
```

---

## 🔐 Best Practices

### 1. Never Commit Secrets
- Add `.env` to `.gitignore`
- Use Infisical for all sensitive values
- Use `.env.example` for documentation only

### 2. Use Different Environments
```bash
# Development
infisical run --env="dev" -- docker-compose up -d

# Production
infisical run --env="prod" -- docker-compose up -d
```

### 3. Rotate Secrets Regularly
```bash
# Update a secret
infisical secrets set POSTGRES_PASSWORD="new-secure-password" \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared/orchestrator"

# Restart services to pick up new secret
docker-compose restart
```

### 4. Use Path-Based Organization
```bash
# Orchestrator secrets
--path="/shared/orchestrator"

# Worker-specific secrets
--path="/shared/workers/worker-rtx3060"

# Service-specific secrets
--path="/shared/services/archon"
```

---

## 🛠️ Troubleshooting

### Secret Not Found
```bash
# Verify secret exists
infisical secrets get POSTGRES_PASSWORD \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared/orchestrator"

# List all secrets in path
infisical secrets list \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared/orchestrator"
```

### Authentication Issues
```bash
# Re-login
infisical login

# Verify authentication
infisical user
```

### Service Not Starting
```bash
# Run with debug output
infisical run --debug \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" \
  --path="/shared" \
  -- docker-compose up -d

# Check docker logs
docker logs <container-name>
```

---

## 📚 Additional Resources

- [Infisical Documentation](https://infisical.com/docs)
- [Infisical CLI Reference](https://infisical.com/docs/cli/overview)
- [Docker Compose Integration](https://infisical.com/docs/integrations/platforms/docker-compose)

---

## 🎯 Quick Reference

### Common Commands

```bash
# Start all services with Infisical
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared" -- make infra-up

# Start specific service
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared" -- make archon-up

# View secrets
infisical secrets list --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared/orchestrator"

# Set secret
infisical secrets set KEY="value" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared/orchestrator"

# Delete secret
infisical secrets delete KEY --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared/orchestrator"
```

---

**Last Updated**: 2026-02-15
**Project ID**: 8374cea9-e5e8-4050-bda4-b91f25ab30ef
**Default Environment**: dev
