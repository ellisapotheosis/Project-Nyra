# PROJECT NYRA — QUICK START CHECKLIST
## Execute These Commands In Order

---

## 🚀 IMMEDIATE ACTIONS (Do Now)

### Step 1: Health Check (5 min)
```bash
cd ~/projects/project-nyra

# Create scripts directory if needed
mkdir -p infra/scripts

# Copy health check script
# (Already created - just run it)
chmod +x infra/scripts/health-check-all.sh
./infra/scripts/health-check-all.sh
```

### Step 2: Gitea Sync (2 min)
```bash
cd ~/projects/project-nyra

# Add GitHub remote
git remote add github https://github.com/YOUR_USERNAME/project-nyra.git 2>/dev/null || true

# Fetch and merge
git fetch --all
git merge github/main --no-edit

# Push to Gitea
git push origin main
```

### Step 3: Infra Cleanup (3 min)
```bash
chmod +x infra/scripts/infra-cleanup.sh
./infra/scripts/infra-cleanup.sh
```

### Step 4: Twenty MCP Setup (10 min)
```bash
cd ~/projects/twenty-mcp-jezweb

# Install and build
bun install || npm install
bun run build || npm run build

# Create .env
cat > .env << 'EOF'
TWENTY_API_KEY=your-key-here
TWENTY_API_URL=http://localhost:3020
TWENTY_GRAPHQL_URL=http://localhost:3020/graphql
PORT=8400
EOF

# Test
bun run start || npm start
```

### Step 5: Verify Services
```bash
# Core services
curl http://localhost:3020/healthz       # Twenty CRM
curl http://localhost:6000/health        # Nexus Router
curl http://localhost:8100/health        # Graphiti
curl http://localhost:8200/health        # RuVector
curl http://localhost:5678/healthz       # n8n

# Memory systems
redis-cli -p 6379 ping                   # Redis
redis-cli -p 6380 ping                   # FalkorDB
```

---

## 📋 SERVICE STATUS QUICK CHECK

| Service | Command | Expected |
|---------|---------|----------|
| Twenty CRM | `curl -s localhost:3020/healthz` | 200 |
| Nexus Router | `curl -s localhost:6000/health` | 200 |
| Graphiti | `curl -s localhost:8100/health` | 200 |
| RuVector | `curl -s localhost:8200/health` | 200 |
| AgentDB | `curl -s localhost:8300/health` | 200 |
| LiteLLM | `curl -s localhost:8500/health` | 200 |
| n8n | `curl -s localhost:5678/healthz` | 200 |
| Gitea | `curl -s localhost:3000/api/healthz` | 200 |
| Redis | `redis-cli ping` | PONG |
| FalkorDB | `redis-cli -p 6380 ping` | PONG |

---

## 🎯 PRIORITY ORDER

1. **CRITICAL:** Health checks pass
2. **CRITICAL:** Gitea synced
3. **CRITICAL:** Twenty MCP running
4. **HIGH:** Memory systems verified
5. **HIGH:** n8n workflows imported
6. **MEDIUM:** Worker PCs setup
7. **MEDIUM:** Admin UI scaffold

---

## 🔑 ENVIRONMENT VARIABLES NEEDED

```bash
# Copy to .env in project root
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
TWENTY_API_KEY=xxx
TWENTY_DB_PASSWORD=xxx
POSTGRES_PASSWORD=xxx
TAILSCALE_API_KEY=tskey-api-xxx
HF_TOKEN=hf_xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
SENDGRID_API_KEY=xxx
INFISICAL_TOKEN=xxx
```

---

## ✅ SUCCESS = All Green

When health check shows all ✅, proceed to:
1. Import n8n workflows
2. Test lead ingestion
3. Setup workers
4. Build UI

**Questions? Check PROJECT-NYRA-ULTIMATE-PROMPT-V4.md for full details.**
