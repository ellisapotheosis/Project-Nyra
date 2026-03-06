# Infisical Quick Start - Project Nyra

> **Get secrets management running in 5 minutes**

## ✅ Prerequisites

- [ ] Windows PC with PowerShell 5.1+
- [ ] Docker Desktop installed and running
- [ ] Infisical account (free at https://app.infisical.com)
- [ ] Git Bash or MSYS2 (for bash scripts)

## 🚀 5-Minute Setup

### Step 1: Initial Setup (2 minutes)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\infisical

# Run setup wizard
.\setup-infisical-orchestrator.ps1
```

**What you'll need:**
1. Infisical account credentials (opens browser for login)
2. Machine Identity Client ID and Secret (instructions provided in script)

**What it does:**
- ✅ Installs Infisical CLI
- ✅ Authenticates with Infisical Cloud
- ✅ Saves Machine Identity credentials
- ✅ Tests connectivity to all secret paths

### Step 2: Upload Secrets (1 minute)

```powershell
# Preview what will be uploaded
.\sync-secrets.ps1 -DryRun

# Upload all secrets
.\sync-secrets.ps1
```

**What it uploads:**
- `/shared` - Database, Redis, API keys (40+ secrets)
- `/worker-5090` - RTX 5090 worker config
- `/worker-3090` - RTX 3090 Ti worker config
- `/worker-3060` - RTX 3060 worker config

### Step 3: Validate (30 seconds)

```powershell
# Check all secrets uploaded correctly
.\validate-secrets.ps1
```

Expected output:
```
✅ ALL SECRETS VALIDATED SUCCESSFULLY!
   Valid Secrets:  45
   Missing:        0
   Placeholders:   5  ⚠️ (these need real values)
```

### Step 4: Start Services (1 minute)

**Option A: With Infisical Agent (Recommended)**

```bash
# Start Infisical Agent
cd C:/Dev/Projects/Repos/Project-Nyra/infra/infisical
docker-compose -f docker-compose.infisical.yml up -d

# Wait 60 seconds for first sync
sleep 60

# Start services with rendered secrets
cd ../docker
docker-compose --env-file .env.rendered up -d
```

**Option B: Direct Injection (Alternative)**

```bash
cd C:/Dev/Projects/Repos/Project-Nyra/infra/docker

# Start services with Infisical injection
infisical run \
  --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef \
  --env=dev \
  --path=/shared \
  -- docker-compose up -d
```

### Step 5: Verify (30 seconds)

```bash
# Check all services are running
docker-compose ps

# Check Infisical Agent (if using Option A)
docker logs infisical-agent

# Test database connection
docker exec -it postgres psql -U nyra -d nyra_production -c "SELECT version();"
```

## 🎉 You're Done!

Your Project Nyra stack is now running with secure secrets from Infisical.

## 🔄 Next Steps

### Replace Placeholder Values

Some secrets have placeholder values (`CHANGE_ME`, `TODO`). Update these in Infisical Dashboard:

1. Go to https://app.infisical.com
2. Select Project: **Project Nyra**
3. Environment: **dev**
4. Path: **/shared**
5. Edit secrets with `CHANGE_ME` values:
   - `POSTGRES_PASSWORD`
   - `REDIS_PASSWORD`
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `NEXUS_JWT_SECRET`

If using **Infisical Agent**, secrets will auto-sync in 60 seconds.

### Set Up Worker PCs

On each GPU worker PC:

```powershell
# 1. Generate machine-specific config
cd C:\Dev\Projects\Repos\Project-Nyra\infra\machines
.\generate-machine-env.ps1

# 2. Upload to Infisical
cd ..\infisical
.\sync-secrets.ps1 -PathsOnly worker-3060  # Or worker-5090, worker-3090

# 3. Start Infisical Agent on worker
docker-compose -f docker-compose.infisical.yml up -d

# 4. Start worker services
cd ..\docker
docker-compose -f workers/docker-compose.worker-rtx3060.yml up -d
```

### Enable Auto-Sync

For automatic secret rotation:

```bash
# Ensure Infisical Agent is running
docker ps | grep infisical-agent

# Agent syncs every 60 seconds
# To change interval, edit: infra/infisical/infisical-config.yaml
```

## 📚 Learn More

| Guide | Purpose |
|-------|---------|
| [README.md](README.md) | Comprehensive documentation |
| [DOCKER-INTEGRATION.md](DOCKER-INTEGRATION.md) | Docker Compose integration methods |
| [../machines/MACHINE-ENV-STRATEGY.md](../machines/MACHINE-ENV-STRATEGY.md) | Multi-machine secret strategy |

## 🆘 Troubleshooting

### "Infisical CLI not found"

```powershell
# Install via Scoop
scoop install infisical

# Or via NPM
npm install -g @infisical/cli
```

### "Authentication failed"

```powershell
# Re-authenticate
infisical login

# Test authentication
infisical secrets list --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=dev --path=/shared
```

### "Secrets not loading"

```bash
# Check agent logs
docker logs infisical-agent -f

# Restart agent
docker restart infisical-agent

# Verify rendered file exists
cat infra/docker/.env.rendered
```

### "Missing secrets"

```powershell
# Validate what's missing
.\validate-secrets.ps1

# Upload missing secrets
.\sync-secrets.ps1
```

## 📞 Support

- **Infisical Docs**: https://infisical.com/docs
- **Project Issues**: https://github.com/yourusername/Project-Nyra/issues
- **Infisical Discord**: https://infisical.com/discord

---

**Project Nyra** | Infisical Quick Start v1.0
