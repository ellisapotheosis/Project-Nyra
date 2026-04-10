# Environment Setup Guide - 4-PC Distributed Architecture

**Project Nyra - Claude Flow V3 Alpha**
**Last Updated**: 2026-01-18

---

## 📋 Quick Reference

| Environment | File | Use Case | PC |
|-------------|------|----------|-----|
| **Orchestrator** | `.env.orchestrator` | Main coordinator | PC1 (Mini PC) |
| **Worker 5090** | `.env.worker-5090` | Large models | PC3 (RTX 5090) |
| **Worker 3090Ti** | `.env.worker-3090ti` | Analysis | PC4 (RTX 3090 Ti) |
| **Worker 3060** | `.env.worker-3060` | Coding | PC2 (RTX 3060) |
| **Development** | `.env.development` | Local dev/testing | Any PC |
| **Production** | `.env.production` | Live deployment | PC1 (orchestrator) |
| **CI/CD** | `.env.ci` | GitHub Actions | CI server |

---

## 🎯 Which File to Use Where

### PC1: Orchestrator (Mini PC)
```bash
# Production deployment
cp .env.orchestrator .env

# Or for development
cp .env.development .env
```

**Role**: Central coordinator, hosts databases and memory systems

### PC2: Worker (RTX 3060)
```bash
cp .env.worker-3060 .env
```

**Role**: Code generation, smaller models (CodeLlama, Qwen2.5-32B)

### PC3: Worker (RTX 5090)
```bash
cp .env.worker-5090 .env
```

**Role**: Large model inference (DeepSeek-R1-236B, Qwen2.5-72B)

### PC4: Worker (RTX 3090 Ti)
```bash
cp .env.worker-3090ti .env
```

**Role**: Analysis, mid-size models (Llama3.1-70B, Mistral-Large)

---

## 🔄 Environment Comparison

### Development vs Production vs CI

| Setting | Development | Production | CI/CD |
|---------|-------------|------------|-------|
| **Max Agents** | 10 | 35 | 5 |
| **Debug Logging** | ✅ Yes | ❌ No | ❌ No |
| **Auto Commit** | ❌ No | ✅ Yes | ❌ No |
| **Security** | Relaxed | Strict | Minimal |
| **Database** | SQLite | PostgreSQL | In-memory |
| **Monitoring** | None | Full Stack | None |
| **GPU Workers** | Optional | Required | Disabled |
| **API Tier** | Dev/Free | Production | Mock |
| **Secrets** | Plain text | Infisical | Mock |
| **CORS** | `*` | Strict | `*` |

---

## 🚀 Setup Instructions

### 1. Orchestrator PC (PC1)

#### Production Setup
```bash
# Navigate to repo
cd C:\Dev\Projects\Repos\Project-Nyra

# Copy orchestrator config
cp .env.orchestrator .env

# Set secrets (use Infisical in production)
# Edit .env and replace ${VARIABLE} placeholders:
nano .env

# Required secrets:
# - ANTHROPIC_API_KEY
# - GOOGLE_API_KEY
# - POSTGRES_PASSWORD
# - REDIS_PASSWORD
# - JWT_SECRET (generate with: openssl rand -hex 32)
# - ENCRYPTION_KEY (generate with: openssl rand -hex 32)

# Start services
docker-compose up -d postgres redis letta qdrant

# Start daemon
npx @archon-os/cli@latest daemon start

# Initialize swarm
npx @archon-os/cli@latest swarm init --topology hierarchical-mesh --max-agents 35
```

#### Development Setup
```bash
# Use development config
cp .env.development .env

# No secrets needed - uses defaults
# Start minimal services
docker-compose up -d redis

# Start daemon
npx @archon-os/cli@latest daemon start
```

### 2. Worker PCs (PC2, PC3, PC4)

#### For each worker:
```bash
# On PC2 (RTX 3060)
cp .env.worker-3060 .env

# On PC3 (RTX 5090)
cp .env.worker-5090 .env

# On PC4 (RTX 3090 Ti)
cp .env.worker-3090ti .env

# Edit .env and set minimal secrets
nano .env

# Required:
# - ANTHROPIC_API_KEY (for fallback)
# - GOOGLE_API_KEY (for fallback)

# Start Ollama (for local models)
ollama serve

# Pull models (based on worker type)
# PC2: ollama pull codellama:34b-q8
# PC3: ollama pull deepseek-r1:236b-q4
# PC4: ollama pull llama3.1:70b-q4

# Start worker daemon
npx @archon-os/cli@latest daemon start

# Connect to orchestrator
npx @archon-os/cli@latest swarm join --coordinator http://orchestrator.tail-net.ts.net:7000
```

### 3. CI/CD Setup (GitHub Actions)

#### Add secrets to GitHub:
```yaml
# .github/workflows/test.yml
env:
  CI: true
  NODE_ENV: test
```

#### Local CI testing:
```bash
cp .env.ci .env
npm test
```

---

## 🔐 Secrets Management

### Development (Local)
```bash
# Store in .env file
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

### Production (Infisical)
```bash
# Install Infisical CLI
npm install -g @infisical/cli

# Login
infisical login

# Fetch and run
infisical run -- npx @archon-os/cli@latest daemon start
```

### Generate Secrets
```bash
# Generate 32-byte hex secrets
openssl rand -hex 32

# Generate for all required secrets:
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -hex 32)
```

---

## 📊 Environment-Specific Variables

### Variables that MUST differ per environment:

| Variable | Development | Production | CI |
|----------|-------------|------------|-----|
| `NODE_ENV` | development | production | test |
| `CLAUDE_FLOW_DEBUG` | true | false | false |
| `DATABASE_URL` | sqlite | postgresql | :memory: |
| `REDIS_URL` | localhost:6379/1 | redis.host/0 | localhost/15 |
| `LOG_LEVEL` | debug | warn | info |
| `RATE_LIMITING_ENABLED` | false | true | false |
| `AIDEFENCE_ENABLED` | false | true | false |
| `CORS_ORIGIN` | * | strict | * |
| `SENTRY_ENABLED` | false | true | false |

### Variables that MUST differ per PC:

| Variable | Orchestrator | Worker 5090 | Worker 3090Ti | Worker 3060 |
|----------|--------------|-------------|----------------|-------------|
| `CLAUDE_FLOW_MODE` | orchestrator | worker | worker | worker |
| `SWARM_ROLE` | coordinator | worker | worker | worker |
| `SWARM_WORKER_ID` | N/A | worker-5090 | worker-3090ti | worker-3060 |
| `GPU_ENABLED` | false | true | true | true |
| `GPU_MODEL` | N/A | RTX 5090 | RTX 3090 Ti | RTX 3060 |
| `GPU_VRAM` | N/A | 48GB | 24GB | 12GB |
| `GPU_PRIORITY` | N/A | 1 | 2 | 3 |
| `WORKER_SPECIALIZATION` | N/A | large-models | analysis | coding |

---

## 🧪 Testing Your Setup

### Verify Orchestrator
```bash
# Check config loaded
npx @archon-os/cli@latest config get swarm.maxAgents
# Should return: 35

# Check memory
npx @archon-os/cli@latest memory stats

# Check daemon
npx @archon-os/cli@latest daemon status
```

### Verify Workers
```bash
# Check GPU available
nvidia-smi

# Check Ollama
ollama list

# Check worker connection
curl http://localhost:7890/health
```

### Test Full Stack
```bash
# On orchestrator, spawn test agents across workers
npx @archon-os/cli@latest agent spawn -t coder --target worker-3060
npx @archon-os/cli@latest agent spawn -t researcher --target worker-5090
npx @archon-os/cli@latest agent list
```

---

## 🐛 Troubleshooting

### Issue: Worker can't connect to orchestrator
```bash
# Check Tailscale connectivity
tailscale status
ping orchestrator.tail-net.ts.net

# Check firewall
# Allow ports: 7000, 7890, 9090
```

### Issue: Config not loading
```bash
# Check .env exists
ls -la .env

# Validate syntax
cat .env | grep -v '^#' | grep -v '^$'

# Check loaded values
npx @archon-os/cli@latest config list
```

### Issue: Memory system not syncing
```bash
# On orchestrator
npx @archon-os/cli@latest memory stats

# On worker
npx @archon-os/cli@latest config get ruvector.syncFrom
# Should return: orchestrator.tail-net.ts.net:7000
```

---

## 📝 Best Practices

### 1. **Never Commit Secrets**
```bash
# Always use .env (gitignored)
# Never commit .env.orchestrator with real keys
```

### 2. **Use Infisical in Production**
```bash
# Store all secrets in Infisical
# Run with: infisical run -- command
```

### 3. **Separate Configs Per PC**
```bash
# Each PC should have its own .env
# Use appropriate worker config per PC
```

### 4. **Test Before Production**
```bash
# Always test in development first
cp .env.development .env
# ... test ...
# Then switch to production
cp .env.production .env
```

### 5. **Monitor Health**
```bash
# Set up monitoring endpoints
curl http://orchestrator:9090/metrics
curl http://orchestrator:3002  # Grafana
```

---

## 📚 Additional Resources

- **Main Config**: `archon-os.config.json` (shared across all PCs)
- **Comprehensive Env Reference**: `.env.archon-os` (all 150+ variables)
- **Setup Summary**: `docs/archon-os-V3-SETUP-SUMMARY.md`
- **Variable Reference**: `docs/environment/ENVIRONMENT_VARIABLES.md`

---

## ✅ Verification Checklist

### Orchestrator
- [ ] `.env.orchestrator` copied to `.env`
- [ ] All secrets set (API keys, passwords, JWT)
- [ ] PostgreSQL running
- [ ] Redis running
- [ ] Daemon started
- [ ] Swarm initialized
- [ ] Prometheus accessible (port 9090)

### Workers
- [ ] Appropriate worker `.env` file copied
- [ ] Minimal secrets set (API keys for fallback)
- [ ] Tailscale connected
- [ ] Ollama running
- [ ] Models pulled
- [ ] Daemon started
- [ ] Connected to orchestrator

### Development
- [ ] `.env.development` copied to `.env`
- [ ] Redis running
- [ ] Daemon started
- [ ] Tests passing

### CI/CD
- [ ] `.env.ci` used in GitHub Actions
- [ ] Mock services enabled
- [ ] Tests running
- [ ] Coverage reports generated

---

**Last Updated**: 2026-01-18
**Configuration Version**: v3.0.0-alpha.104
