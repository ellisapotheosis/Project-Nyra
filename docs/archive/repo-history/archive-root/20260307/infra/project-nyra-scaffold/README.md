# Project Nyra

**A hybrid mortgage CRM platform combining cloud-based system-of-record with edge-based AI inference, powered by Claude AI orchestration.**

## What It Is

Project Nyra is a complete end-to-end mortgage origination assistant system that:

- **Ingests mortgage leads** from email, APIs, and webhooks
- **Normalizes & deduplicates** data into TwentyCRM (system of record)
- **Runs multi-channel drip campaigns** (SMS, email, voicemail) with STOP compliance
- **Generates loan quote comparisons** via a Quote Engine API
- **Remembers borrower context** (income, FICO, goals) via Mem0
- **Orchestrates with Claude AI** for reasoning, compliance, and agent coordination
- **Routes inference** to local GPUs or cloud models based on cost/latency

## Architecture at a Glance

```
Borrower SMS/Email
        ↓
   Oracle VPS (Always-On, 24/7)
   ├─ Postgres (System of Record)
   ├─ TwentyCRM (Lead Management)
   ├─ Activepieces (Workflows)
   └─ Mem0 (Borrower Memory)
        ↓ (Tailscale VPN)
   Home Orchestrator (Minisforum)
   ├─ Nexus Router (MCP Aggregator)
   ├─ LiteLLM (Model Router)
   ├─ Claude-Flow (Dev Agent)
   ├─ OpenClaw (Mortgage Agent)
   └─ Archon OS (Knowledge Base)
        ↓ (Tailscale Mesh)
   GPU Workers (Distributed Inference)
   ├─ RTX 5090 (Heavy Reasoning)
   ├─ RTX 3090Ti (Code Generation)
   └─ RTX 3060 (Fast Utility)
```

## Quick Start

### Prerequisites

- Docker Desktop (with WSL2 or Hyper-V)
- Make
- ~100GB free disk (Oracle VM + models)
- Anthropic API key
- Tailscale account (free)

### 1. Clone & Setup

```bash
git clone <repo-url> project-nyra
cd project-nyra

# Copy and edit environment
cp .env.example .env
# Edit .env with your API keys, passwords, etc.
```

### 2. One-Click Deploy

```bash
# Interactive setup (validates prereqs, builds images)
bash infra/scripts/bootstrap.sh

# OR: Use Makefile directly
make init
make bootstrap
```

### 3. Verify Deployment

```bash
# Health checks
make health

# View logs
make logs

# Check running services
make status
```

### 4. Access Services

- **Nexus Router**: http://localhost:6000 (MCP aggregator)
- **LiteLLM**: http://localhost:4000 (Model routing)
- **Claude-Flow**: http://localhost:8080 (Dev orchestrator)
- **OpenClaw**: http://localhost:9000 (Mortgage assistant)
- **TwentyCRM**: https://crm.ratehunter.net (Cloudflared tunnel)

## Key Stacks

### Oracle Cloud (System of Record, Always-On)

**Deployed on**: Oracle Cloud ARM A1 (free tier)

- **Postgres 16** w/ pgvector (TwentyCRM, Mem0, Quote history)
- **TwentyCRM** (CRM core + custom mortgage objects)
- **Activepieces** (Workflow automation, drip campaigns, SMS/email)
- **Quote Engine** (Mortgage pricing microservice)
- **Mem0** (Borrower context memory)
- **Gitea** (Source control + CI/CD)

**Persist via**: Cloudflared tunnels at `*.ratehunter.net`

### Orchestrator (Control Plane, Local)

**Deployed on**: Minisforum (Ryzen 6800H, 16GB)

- **Nexus Router** (Grafbase: MCP aggregator + fuzzy tool selection)
- **LiteLLM** (Model router: local GPU → cloud fallback)
- **Claude-Flow** (Dev orchestrator: repo edits, PR creation)
- **OpenClaw** (Mortgage assistant agent: talks to borrowers)
- **Archon OS** (Knowledge base: stores patterns, decisions)
- **Docker MCP Toolkit** (Host filesystem + GitHub access)

**Exposed via**: localhost ports + Tailscale VPN

### Workers (GPU Compute, Optional)

**Deployed on**: 3x GPU PCs on Tailscale mesh

| PC | GPU | Engine | Model | Use Case |
|---|---|---|---|---|
| Area-51 | RTX 5090 | vLLM | Mistral-7B (FP16) | Heavy reasoning |
| Desktop | RTX 3090Ti | vLLM | Mistral-7B (FP16) | Code generation |
| m15r7 | RTX 3060 | Ollama | Mistral-7B (Q4) | Fast utility |

**Inference**: vLLM + LMCache for prefix caching + cost control

## Core Features

### 1. Lead Ingestion

```
Email → ParseMail API → Normalize → TwentyCRM
Webhook → Activepieces → Custom Objects → TwentyCRM
CSV Import → n8n Workflow → Deduplicate → TwentyCRM
```

### 2. Multi-Channel Campaigns

- SMS via Twilio (STOP-compliant)
- Email via SendGrid
- Voicemail via Freshcaller
- Smart pauses for responses
- Stop immediately on engagement

### 3. Loan Quotes

```bash
# API call from OpenClaw
POST /api/v1/quote
{
  "propertyValue": 500000,
  "downPayment": 100000,
  "baseInterestRate": 6.5
}

# Response: 3-option comparison (Par, Buy-Down, Lender Credit)
# Borrower sees in SMS: "Your payment: $2,864/mo | Rates 6.0%-7.0%"
```

### 4. Memory & Context

**Mem0** stores:

- Borrower FICO, income, down payment
- Previous rate quotes
- Engagement history
- Next best action

**Retrieved by**: OpenClaw to personalize responses

### 5. Compliance & Auditing

- All PII access logged (who, when, why)
- STOP words trigger immediate opt-out
- Rate advice requires human approval before sending
- Regulatory decision audit trail in Postgres

## Makefile Commands

```bash
# Quick Help
make help

# Setup & Deployment
make init                 # Create directory structure
make bootstrap           # One-click: init + deploy all
make oracle-up           # Start Oracle stack only
make orchestrator-up     # Start Orchestrator only
make workers-up          # Start all GPU workers

# Monitoring
make logs                # Tail all logs
make status              # Show running containers
make health              # Full system diagnostics

# Cleanup
make down                # Stop all services
make clean               # Remove containers + volumes
make prune               # Aggressive cleanup
```

## Configuration

### Environment Variables (`.env`)

**Critical** (must set):

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx
TAILSCALE_AUTHKEY=tskey-auth-xxxxx
ORACLE_DATABASE_PASSWORD=change_me
```

**Optional** (defaults provided):

```bash
OPENROUTER_API_KEY=sk-or-xxxxx  # Fallback models
CLOUDFLARE_TUNNEL_TOKEN=xxxxx   # Public ingress
INFISICAL_TOKEN=sk_infisical-xxxxx  # Secrets vault
```

See `.env.example` for complete list.

### Nexus Router (`infra/config/nexus.toml`)

Controls:

- MCP server registration (Docker, TwentyCRM, Gitea, etc.)
- Model routing rules (heavy → 5090, code → 3090Ti, fast → 3060)
- Tool filtering (hide filesystem tools from OpenClaw)
- Rate limiting & budget alerts

### LiteLLM (`infra/config/litellm-config.yaml`)

Configures:

- Model list (local + cloud)
- Router strategy (cost-optimized)
- Fallback chain
- Token counting & spend tracking

## Development Workflow

### 1. Edit Quote Engine (Example)

```bash
# Edit source
nano services/quote-engine/src/utils/mortgageMath.ts

# Rebuild
cd services/quote-engine && npm run build

# Test locally (or via OpenClaw)
curl -X POST http://localhost:8089/api/v1/quote \
  -H "Content-Type: application/json" \
  -d '{"propertyValue":500000,"downPayment":100000,"baseInterestRate":6.5}'
```

### 2. Claude-Flow Integration

Claude-Flow can:

- Clone your repo
- Read/write files
- Create PRs
- Run tests
- Push to Gitea

```python
# In Claude-Flow or OpenClaw
tools:
  - docker-toolkit (file operations)
  - gitea (repo access)
  - twenty-crm (lead data)
  - quote-engine (mortgage math)
```

### 3. Test Full Pipeline

```bash
# 1. Send SMS to Twilio number
# 2. Activepieces webhook receives it
# 3. Creates lead in TwentyCRM
# 4. OpenClaw answers in SMS
# 5. Mem0 remembers borrower facts

# Monitor:
make logs
# Filter for 'openclaw', 'twilio', 'activepieces'
```

## Project Structure

See [STRUCTURE.md](./STRUCTURE.md) for detailed directory tree.

**Key paths**:

- `infra/docker-compose.*.yml` — Stack definitions
- `services/quote-engine/` — Mortgage math microservice
- `apps/openclaw/` — Borrower-facing agent
- `apps/claude-flow/` — Dev orchestrator
- `docs/` — Detailed documentation

## Troubleshooting

### Docker daemon won't start after daemon.json edit

```bash
# Use minimal daemon.json (no nvidia runtime reference)
# Let VS Code Claude validate JSON
# Restart Docker from tray
```

### "Cannot connect to Docker daemon"

```bash
# Ensure Docker Desktop is running
# WSL2: wsl --shutdown && restart Docker Desktop
# Network: Check Tailscale connectivity
```

### Tailscale IPs not in LiteLLM config

```bash
# Get your worker IPs
tailscale status | grep worker

# Update litellm-config.yaml with actual IPs
# Replace 100.x.x.1/2/3
```

### Models not found in vLLM

```bash
# Download models first
docker exec vllm-worker-area51 python -m vllm.entrypoints.openai.api_server \
  --model mistral-7b --dtype float16
```

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes in `services/`, `apps/`, or `src/`
4. Test locally: `make up && make health`
5. Submit PR with test results

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## License

MIT — Use, modify, distribute freely.

## Support

- **Issues**: GitHub Issues
- **Docs**: `/docs` folder
- **Community**: Tailscale + Claude community

---

**Made with ❤️ for mortgage originators** 🏠
