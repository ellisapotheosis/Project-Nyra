# Local Development on Windows PC (RTX 3060)

**Status**: ✅ Ready for immediate development
**Last Updated**: 2026-01-09
**Environment**: Windows PC with RTX 3060

## 🎯 What You Can Do NOW

You can develop and test services locally on your Windows PC without waiting for the orchestrator PC deployment:

### ✅ What Works Locally
- **Nexus Router** - Build, test, and develop the intelligent routing service
- **Service Development** - Write and test TypeScript/Node.js services
- **Local GPU Models** - Your RTX 3060 runs Ollama models
- **Code Testing** - Run unit tests, integration tests
- **Documentation** - Write and update documentation

### ❌ What Requires Orchestrator PC
- **Full Docker Stack** - PostgreSQL, Redis, FalkorDB, etc.
- **Claude Flow** - Orchestration layer
- **Archon OS** - Agent system
- **Production Services** - Full infrastructure deployment

---

## 🚀 Quick Start - Local Development

### Step 1: Secrets Are Already Set! ✅

Your 7 critical secrets are stored in Infisical cloud:
```bash
# Verify secrets (from Windows)
MSYS_NO_PATHCONV=1 infisical secrets get POSTGRES_PASSWORD --env=dev --path="/shared" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
```

### Step 2: Build Nexus Router ✅ (Already Done!)

```bash
cd services/nexus-router
pnpm install    # ✅ Already done
pnpm build      # ✅ Already done
```

### Step 3: Test Locally (Development Mode)

```bash
# Use local .env file (no Infisical needed for dev)
cd services/nexus-router

# Start in development mode
pnpm dev

# Or run the built version
node dist/index.js
```

The service will start on **http://localhost:8000**

---

## 🧪 Testing Fuzzy Tool Search

Once Nexus Router is running locally, you can test the fuzzy search:

```bash
# List all MCP servers
curl http://localhost:8000/mcp/servers

# Get all tools
curl http://localhost:8000/mcp/tools

# Fuzzy search for tools
curl "http://localhost:8000/mcp/tools/search?q=database&limit=5"
curl "http://localhost:8000/mcp/tools/search?q=file%20read&limit=10"
curl "http://localhost:8000/mcp/tools/search?q=git%20commit&limit=5"

# Health check
curl http://localhost:8000/health

# Service info
curl http://localhost:8000/
```

---

## 📦 Local Environment Variables

The `.env.local` file was created for you with safe defaults:

```bash
# Location: services/nexus-router/.env.local
NODE_ENV=development
NEXUS_ROUTER_PORT=8000
REDIS_ENABLED=false  # No Redis needed for local dev
MODEL_ROUTING_STRATEGY=local-only
WORKER_3060_URL=http://localhost:11434  # Your RTX 3060
```

---

## 🖥️ Your RTX 3060 GPU Setup

### Check Ollama is Running

```bash
# Check if Ollama is accessible
curl http://localhost:11434/api/tags

# List installed models
ollama list
```

### Recommended Models for RTX 3060 (12GB VRAM)

```bash
# Good models for 12GB VRAM
ollama pull codellama:34b-instruct-q8_0     # 34B quantized
ollama pull qwen2.5:32b-instruct-q8_0        # 32B quantized
ollama pull llama3.1:8b-instruct-q8_0        # 8B full precision
ollama pull deepseek-coder:6.7b              # Code specialist
```

---

## 🛠️ Development Workflow

### Build and Test Services

```bash
# From project root
cd services/nexus-router

# Development mode (hot reload)
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build for production
pnpm build
```

### Work on Other Services

All services can be developed locally:

```bash
# Example: Auth service
cd services/auth-service
pnpm install
pnpm dev

# Example: Document management
cd services/doc-management-api
pnpm install
pnpm dev
```

---

## 🐳 When You're Ready: Linux Orchestrator Deployment

### On Your Linux Orchestrator PC (Later)

1. **SSH into orchestrator PC**
2. **Clone the repo** (if not already there)
3. **Secrets are already in Infisical!** ✅ No need to re-enter
4. **Start services**:

```bash
cd infra/docker
./start-all.sh  # Or use docker-compose directly
```

The orchestrator will automatically read secrets from Infisical cloud that you set from Windows!

---

## 📊 What's Working vs What's Not

| Component | Status | Where |
|-----------|--------|-------|
| **Secrets in Infisical** | ✅ Ready | Cloud (set from Windows) |
| **Nexus Router Build** | ✅ Built | Windows PC |
| **Local Development** | ✅ Ready | Windows PC |
| **Service Code** | ✅ Ready | Windows PC |
| **RTX 3060 Ollama** | ✅ Should work | Windows PC |
| **Docker Stack** | ⏸️ Waiting | Linux Orchestrator |
| **PostgreSQL** | ⏸️ Waiting | Linux Orchestrator |
| **Redis** | ⏸️ Waiting | Linux Orchestrator |
| **Claude Flow** | ⏸️ Waiting | Linux Orchestrator |
| **Archon OS** | ⏸️ Waiting | Linux Orchestrator |

---

## 🎓 Next Steps

### Today (Windows PC)
1. ✅ **Secrets set in Infisical**
2. ✅ **Nexus Router built**
3. **Test Nexus Router locally** (optional)
4. **Develop services** (your choice)
5. **Write tests** (if needed)
6. **Update documentation** (if needed)

### Later (Linux Orchestrator)
1. **SSH into orchestrator PC**
2. **Pull latest code from git**
3. **Start Docker services** (`./start-all.sh`)
4. **Verify health checks**
5. **Full system operational!**

---

## 🆘 Troubleshooting

### "Cannot connect to Ollama"
```bash
# Make sure Ollama is running
ollama serve

# Check it's accessible
curl http://localhost:11434/api/version
```

### "Port 8000 already in use"
```bash
# Change port in .env.local
NEXUS_ROUTER_PORT=8001

# Or kill existing process
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### "TypeScript compilation errors"
```bash
# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm build
```

---

## ✨ Summary

**You're ready to start development NOW!**

- ✅ Secrets stored in Infisical cloud (accessible from orchestrator)
- ✅ Nexus Router built and ready to run
- ✅ Local development environment configured
- ✅ RTX 3060 can run local models via Ollama
- ⏸️ Full infrastructure deployment waits for orchestrator PC

**Start coding and testing services on your Windows PC right now!**

---

**Need Help?**
- Secrets: `docs/deployment/SECRETS-CHECKLIST.md`
- Full Deployment: `docs/deployment/QUICK-START.md`
- Architecture: `docs/architecture/system-architecture.md`
