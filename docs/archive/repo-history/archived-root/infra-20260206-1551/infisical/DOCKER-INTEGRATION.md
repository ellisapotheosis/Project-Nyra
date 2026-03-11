# Docker Compose Integration with Infisical - Project Nyra

> **Secure secret injection for containerized services**

## 🎯 Overview

This guide shows three methods to integrate Infisical secrets with Docker Compose services in Project Nyra.

## 🔄 Method 1: Infisical Agent (Recommended for Production)

The Infisical Agent runs as a sidecar container, automatically syncing secrets to `.env.rendered` files that Docker Compose can consume.

### Setup

1. **Start Infisical Agent**:
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\infra\infisical
docker-compose -f docker-compose.infisical.yml up -d
```

2. **Wait for secrets to sync** (agent runs every 60 seconds):
```bash
# Check agent logs
docker logs infisical-agent -f

# Verify rendered files exist
ls -la ../docker/.env.rendered
ls -la ../docker/.env.shared.rendered
```

3. **Use rendered secrets in main stack**:
```bash
cd ../docker

# Option A: Use master .env file
docker-compose --env-file .env.rendered up -d

# Option B: Use path-specific files
docker-compose --env-file .env.shared.rendered up -d postgres redis

# Option C: Include in docker-compose.yml
# (See example below)
```

### Docker Compose Configuration

Update `infra/docker/docker-compose.yml`:

```yaml
# Use rendered secrets from Infisical Agent
services:
  postgres:
    image: pgvector/pgvector:pg16
    env_file:
      - .env.rendered  # Auto-synced by Infisical Agent
    environment:
      # These will be populated from .env.rendered
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}

  redis:
    image: redis:7-alpine
    env_file:
      - .env.rendered
    command: redis-server --requirepass ${REDIS_PASSWORD}

  nexus-router:
    build: ./services/nexus-router
    env_file:
      - .env.rendered
    environment:
      NEXUS_JWT_SECRET: ${NEXUS_JWT_SECRET}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
```

### Benefits

✅ **Automatic rotation**: Secrets update without restarting services
✅ **Real-time sync**: 60-second refresh interval
✅ **Zero configuration**: Works with existing Docker Compose files
✅ **Audit trail**: All secret access logged in Infisical
✅ **Rollback support**: Revert to previous secret versions

## ⚡ Method 2: Infisical Run Command (Recommended for Development)

Inject secrets directly when starting services using the `infisical run` wrapper.

### Setup

1. **Ensure Infisical CLI is authenticated**:
```powershell
# Check authentication
infisical whoami

# Login if needed
infisical login
```

2. **Run services with secret injection**:
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker

# Full stack with shared secrets
infisical run \
  --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef \
  --env=dev \
  --path=/shared \
  -- docker-compose up -d

# Specific services only
infisical run --path=/shared -- docker-compose up postgres redis qdrant

# With multiple paths (shared + worker)
infisical run --path=/shared --path=/worker-3060 -- docker-compose up -d
```

### Docker Compose Configuration

No changes needed! Just reference environment variables normally:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
```

Infisical will inject all secrets from the specified path(s) as environment variables.

### Benefits

✅ **No agent needed**: Direct injection at runtime
✅ **Development friendly**: Quick iterations without managing .env files
✅ **Multi-path support**: Combine shared + machine-specific secrets
✅ **CI/CD ready**: Works in automated pipelines

## 🔐 Method 3: Manual Export to .env File (Development Only)

Export secrets once to a local `.env` file for offline development.

### Setup

1. **Export secrets from Infisical**:
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker

# Export shared secrets
infisical secrets export \
  --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef \
  --env=dev \
  --path=/shared \
  --format=dotenv > .env.local

# For workers, combine shared + worker-specific
infisical secrets export --path=/shared > .env.local
infisical secrets export --path=/worker-3060 >> .env.local
```

2. **Use in Docker Compose**:
```bash
docker-compose --env-file .env.local up -d
```

### ⚠️ Security Warning

This method stores secrets in plain text `.env.local` files. **Only use for local development.**

- ✅ Add `.env.local` to `.gitignore`
- ✅ Rotate secrets after exposure
- ✅ Never commit to version control
- ❌ Never use in production
- ❌ Never share .env files

## 📊 Comparison

| Feature | Agent | Run Command | Manual Export |
|---------|-------|-------------|---------------|
| **Auto-sync** | ✅ Every 60s | ❌ Manual | ❌ Manual |
| **Secret rotation** | ✅ Automatic | ⚠️ On restart | ❌ None |
| **Offline work** | ⚠️ After first sync | ❌ Needs internet | ✅ Yes |
| **Production ready** | ✅ Yes | ⚠️ Maybe | ❌ No |
| **CI/CD** | ✅ Yes | ✅ Yes | ⚠️ Not recommended |
| **Security** | ✅ High | ✅ High | ⚠️ Medium |
| **Complexity** | Medium | Low | Low |

## 🏆 Recommended Setup by Environment

### Local Development (Laptop/Desktop)

**Method 2: Infisical Run Command**

```bash
infisical run --path=/shared -- docker-compose up -d
```

Why?
- Fast iterations
- No agent overhead
- Easy to understand

### Orchestrator PC (Production)

**Method 1: Infisical Agent**

```bash
# Start agent
docker-compose -f infra/infisical/docker-compose.infisical.yml up -d

# Start services
docker-compose --env-file .env.rendered up -d
```

Why?
- Automatic secret rotation
- Resilient to network issues
- Audit logging

### Worker PCs (Production)

**Method 1: Infisical Agent** (with worker-specific paths)

Update `infra/infisical/infisical-config.yaml` on each worker to only pull their specific path:

```yaml
# Worker 3060 example
sinks:
  - type: file
    config:
      path: /app/rendered/.env
      template: |
        # Shared secrets
        {{- with secret "8374cea9-e5e8-4050-bda4-b91f25ab30ef" "dev" "/shared" }}
        {{- range . }}
        {{ .Key }}={{ .Value }}
        {{- end }}
        {{- end }}

        # Worker 3060 specific
        {{- with secret "8374cea9-e5e8-4050-bda4-b91f25ab30ef" "dev" "/worker-3060" }}
        {{- range . }}
        {{ .Key }}={{ .Value }}
        {{- end }}
        {{- end }}
      interval: 60
```

### CI/CD Pipelines

**Method 2: Infisical Run Command** (with service account)

```yaml
# GitHub Actions example
- name: Deploy with Infisical
  env:
    INFISICAL_CLIENT_ID: ${{ secrets.INFISICAL_CLIENT_ID }}
    INFISICAL_CLIENT_SECRET: ${{ secrets.INFISICAL_CLIENT_SECRET }}
  run: |
    infisical run \
      --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef \
      --env=prod \
      --path=/shared \
      -- docker-compose up -d
```

## 🔄 Migration from .env Files

If you're currently using `.env` files and want to migrate to Infisical:

### Step 1: Upload Existing Secrets

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\infisical

# Dry run first
.\sync-secrets.ps1 -DryRun

# Upload all secrets
.\sync-secrets.ps1
```

### Step 2: Validate

```powershell
.\validate-secrets.ps1
```

### Step 3: Test with Infisical

```bash
cd ../docker

# Test with infisical run
infisical run --path=/shared -- docker-compose up postgres redis
```

### Step 4: Deploy Agent (Production)

```bash
cd ../infisical
docker-compose -f docker-compose.infisical.yml up -d
```

### Step 5: Update Docker Compose

```yaml
# Change from:
env_file:
  - .env

# To:
env_file:
  - .env.rendered  # Auto-synced by Infisical Agent
```

### Step 6: Clean Up Old .env Files

```bash
# Backup first!
cp .env .env.backup

# Remove from active use (keep backup for emergency)
rm .env
```

## 🛡️ Security Best Practices

### For All Methods

1. **Never commit secrets to git**:
   ```bash
   # .gitignore
   .env
   .env.*
   !.env.example
   .env.rendered
   .env.local
   infra/infisical/secrets/
   ```

2. **Use separate Machine Identities per environment**:
   - `dev` → Read access to `/shared` only
   - `staging` → Read access to `/shared` only
   - `prod` → Read access to all paths

3. **Rotate secrets regularly**:
   - API keys: Every 90 days
   - Database passwords: Every 180 days
   - JWT secrets: Every 365 days

4. **Monitor secret access**:
   - Check Infisical audit logs weekly
   - Alert on unauthorized access attempts

### For Infisical Agent

1. **Protect credential files**:
   ```bash
   chmod 700 infra/infisical/secrets/
   chmod 600 infra/infisical/secrets/infisical-client-*
   ```

2. **Clear rendered secrets on exit** (optional, high-security):
   ```yaml
   # infisical-config.yaml
   exit:
     mode: file
     clear-outputs: true  # Delete .env.rendered on agent stop
   ```

3. **Monitor agent health**:
   ```bash
   docker logs infisical-agent -f
   ```

## 🔧 Troubleshooting

### Secrets Not Loading

**Problem**: Services start but secrets are empty or default values.

**Solutions**:

1. **Check agent is running**:
   ```bash
   docker ps | grep infisical-agent
   ```

2. **Verify rendered files exist**:
   ```bash
   ls -la infra/docker/.env.rendered
   cat infra/docker/.env.rendered | grep POSTGRES_PASSWORD
   ```

3. **Check agent logs**:
   ```bash
   docker logs infisical-agent -f
   ```

4. **Validate secrets in Infisical**:
   ```powershell
   cd infra/infisical
   .\validate-secrets.ps1
   ```

### Permission Denied

**Problem**: Agent can't write to `.env.rendered` files.

**Solutions**:

1. **Fix file permissions**:
   ```bash
   chmod 644 infra/docker/.env.rendered
   ```

2. **Check Docker volume mounts**:
   ```yaml
   # docker-compose.infisical.yml
   volumes:
     - ../docker/.env.rendered:/app/rendered/.env  # Must be writable
   ```

### Authentication Failed

**Problem**: Agent fails to authenticate with Infisical.

**Solutions**:

1. **Check credentials exist**:
   ```bash
   ls -la infra/infisical/secrets/
   ```

2. **Verify Machine Identity permissions** in Infisical Dashboard

3. **Test authentication manually**:
   ```bash
   infisical secrets list \
     --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef \
     --env=dev \
     --path=/shared
   ```

### Secrets Not Updating

**Problem**: Changed secrets in Infisical but services still use old values.

**Solutions**:

1. **Restart Infisical Agent** (forces immediate sync):
   ```bash
   docker restart infisical-agent
   ```

2. **Restart services** to pick up new environment:
   ```bash
   docker-compose restart postgres redis
   ```

3. **Check sync interval** (default: 60 seconds):
   ```yaml
   # infisical-config.yaml
   interval: 60  # Sync every 60 seconds
   ```

## 📚 Additional Resources

- **Infisical Docker Integration**: https://infisical.com/docs/integrations/platforms/docker-compose
- **Infisical Agent Docs**: https://infisical.com/docs/cli/agent
- **Machine Identity Setup**: https://infisical.com/docs/documentation/platform/identities/universal-auth
- **Secret Rotation**: https://infisical.com/docs/documentation/platform/secret-rotation

---

**Project Nyra** | Docker + Infisical Integration Guide
