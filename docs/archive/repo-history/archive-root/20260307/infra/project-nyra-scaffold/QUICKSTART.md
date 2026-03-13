# Project Nyra: Quick Start Guide

## 30-Second Setup

```bash
# 1. Copy environment
cp .env.example .env

# 2. Edit .env with your actual API keys
nano .env
# Required: ANTHROPIC_API_KEY, TAILSCALE_AUTHKEY

# 3. Run bootstrap
bash infra/scripts/bootstrap.sh
# Interactive: detects your machine type, builds images, deploys

# 4. Verify
make health
# Shows all green = ready to go
```

## What Gets Deployed

**Oracle (Cloud)**:
- Postgres: System of Record
- TwentyCRM: Lead Management
- Activepieces: Workflow Automation
- Quote Engine: Mortgage Pricing
- Mem0: Borrower Memory

**Orchestrator** (Your PC):
- Nexus Router: MCP Aggregator (port 6000)
- LiteLLM: Model Router (port 4000)
- Claude-Flow: Dev Agent (port 8080)
- OpenClaw: Mortgage Agent (port 9000)
- Archon OS: Knowledge Base (port 4001)

**Workers** (GPU PCs, optional):
- vLLM on RTX 5090/3090Ti
- Ollama on RTX 3060

## First Test

### 1. Check Nexus Router

```bash
curl http://localhost:6000/health
# Should return: {"status":"ok"}
```

### 2. Generate a Mortgage Quote

```bash
curl -X POST http://oracle-vm-ip:8089/api/v1/quote \
  -H "Content-Type: application/json" \
  -d '{
    "propertyValue": 500000,
    "downPayment": 100000,
    "baseInterestRate": 6.5,
    "termYears": 30
  }'

# Returns 3-option comparison with monthly payments
```

### 3. Send a Test SMS

```bash
# Via Activepieces webhook
curl -X POST https://workflows.ratehunter.net/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "message": "What'\''s my payment on a 500k house?"
  }'

# OpenClaw responds in SMS within 5 seconds
```

### 4. Check Logs

```bash
make logs

# Filter by app:
# For OpenClaw: | grep -i openclaw
# For Quote Engine: | grep -i quote-engine
# For Nexus: | grep -i nexus
```

## Common Commands

| Command | What It Does |
|---------|--------------|
| `make help` | Show all available commands |
| `make up` | Start everything (oracle + orch + workers) |
| `make down` | Stop everything |
| `make logs` | View all logs (Ctrl+C to exit) |
| `make status` | Show running containers |
| `make health` | Run diagnostics |
| `make oracle-up` | Start just Oracle cloud |
| `make orchestrator-up` | Start just Orchestrator |

## Accessing Services Locally

**Development** (port access on your machine):
- Nexus Router: http://localhost:6000
- LiteLLM: http://localhost:4000
- Claude-Flow: http://localhost:8080
- OpenClaw: http://localhost:9000

**Production** (via Cloudflared):
- TwentyCRM: https://crm.ratehunter.net
- Activepieces: https://workflows.ratehunter.net
- Quote Engine: https://quotes.ratehunter.net

## Troubleshooting

### "Docker daemon not responding"

```bash
# Docker Desktop not running
# Open Docker Desktop application

# Or restart it:
docker ps  # Should work if running
```

### "Cannot connect to Tailscale"

```bash
# Ensure Tailscale is installed and running
tailscale status

# If not installed:
# macOS: brew install tailscale
# Ubuntu: curl -fsSL https://tailscale.com/install.sh | sh

# Authenticate:
tailscale up --hostname=orchestrator
```

### "API key invalid"

```bash
# Check .env is loaded
cat .env | grep ANTHROPIC_API_KEY

# Ensure key is in format: sk-ant-...
# Get it from: https://console.anthropic.com/

# Restart services after editing .env:
make down && make up
```

### Models not found in vLLM

```bash
# Models auto-download on first start
# Takes ~10 minutes for Mistral-7B

# Check download status:
docker logs vllm-worker-area51 | grep -i download

# Once done, test:
curl http://100.x.x.1:8000/v1/models
# Should list available models
```

## Environment Variables to Edit

**Critical** (must set):

```bash
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
TAILSCALE_AUTHKEY=tskey-auth-YOUR_AUTH_KEY
ORACLE_DATABASE_PASSWORD=change_to_secure_password
```

**Optional** (has defaults):

```bash
OPENROUTER_API_KEY=sk-or-YOUR_KEY  # Fallback models
CLOUDFLARE_TUNNEL_TOKEN=xxxxx       # Public ingress
INFISICAL_TOKEN=sk_infisical-xxxxx  # Secrets vault
```

See `.env.example` for full list.

## Architecture Diagram

```
Borrower SMS
    ↓
Oracle (Always-On)
├─ Postgres (Data)
├─ TwentyCRM (CRM)
├─ Activepieces (Workflows)
└─ Mem0 (Memory)
    ↓ (Tailscale VPN)
Orchestrator (Your PC)
├─ Nexus (MCP Hub)
├─ LiteLLM (Router)
├─ Claude-Flow (Dev)
└─ OpenClaw (Agent)
    ↓ (Tailscale Mesh)
Workers (GPU PCs)
├─ RTX 5090 (Heavy)
├─ RTX 3090Ti (Code)
└─ RTX 3060 (Fast)
```

## File Structure

```
project-nyra/
├── Makefile                    # Commands: make help
├── .env.example               # Template (copy to .env)
├── infra/
│   ├── docker-compose.*.yml   # Stack definitions
│   ├── config/                # Nexus, LiteLLM config
│   └── scripts/               # Bootstrap, health-check
├── services/quote-engine/     # Mortgage API
├── apps/
│   ├── claude-flow/           # Dev agent
│   ├── openclaw/              # Mortgage agent
│   └── archon-os/             # Knowledge base
├── docs/ARCHITECTURE.md       # Full design doc
└── README.md                  # This project
```

## Next Steps

1. ✅ Run `bash infra/scripts/bootstrap.sh`
2. ✅ Verify with `make health`
3. Test Quote Engine API
4. Send test SMS via Activepieces
5. Check logs with `make logs`
6. Read `/docs/ARCHITECTURE.md` for deep dive

## Getting Help

- **Logs**: `make logs | grep -i your-app`
- **Health**: `bash infra/scripts/health-check.sh`
- **Docs**: See `/docs` folder
- **Issues**: GitHub Issues (if public repo)

---

**Happy mortgaging! 🏠**
