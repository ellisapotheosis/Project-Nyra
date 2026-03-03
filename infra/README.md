# Project Nyra Infra (Stand-up Ready)

This `/infra` package is the canonical bootstrap layer for:
- Orchestrator control plane
- Oracle host service profiles
- 3 worker lanes (3060 / 3090ti / 5090)
- Nexus + LiteLLM as shared routing spine
- Workflow/CRM/observability stack
# Project Nyra: AI-Powered Mortgage Lead Orchestration Platform

**Status**: MVP Build-Out (Orchestrator + Worker GPU Stack + Oracle Cloud Hub)

## 🎯 What is Project Nyra?

A **distributed, privacy-first mortgage automation platform** that:
- Ingests mortgage leads from email, webhooks, and LeadMailbox
- Normalizes & deduplicates leads → TwentyCRM (system of record)
- Executes 45–60 day multi-channel drip campaigns (SMS, email, call voicemails)
- Generates loan quotes via scriptable Quote API (parity with Excel workflow)
- Uses Graphiti + Mem0 for memory/knowledge without PII exposure
- Runs on a 4-PC Tailscale mesh: 1 orchestrator + 3 GPU workers
- Always-on cloud sync via Oracle Cloud (24GB RAM, 200GB storage)

## 🏛️ Architecture at a Glance

```
┌─ ORACLE CLOUD (Always-On Hub) ────────────────────┐
│  TwentyCRM (CRM) | Postgres | Redis | Activepieces │
│  Quote Engine | Mem0 | FalkorDB | Infisical Vault │
└────────────────────────────────────────────────────┘
                         ↑↓ (Tailscale VPN)
┌─ ORCHESTRATOR (Minisforum 16GB) ─────────────────┐
│  Nexus Router (MCP Hub)                           │
│  LiteLLM (Model Router)                           │
│  Claude-Flow | OpenClaw | Archon-OS              │
│  Docker MCP Toolkit | Infisical Sidecar          │
└────────────────────────────────────────────────────┘
      ↓
┌─ GPU WORKERS (Tailscale Mesh) ────────────────────┐
│  RTX 5090 (32GB)  → vLLM: DeepSeek-R1 32B         │
│  RTX 3090Ti (24GB) → vLLM: DeepSeek-Coder         │
│  RTX 3060 (12GB)   → Ollama: Qwen 2.5 7B          │
└────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- 5 PCs (1 orchestrator + 3 GPU workers + optional oracle)
- Docker Desktop on Windows (all 5 PCs)
- Tailscale installed (for mesh VPN)
- WSL2 + Ubuntu 24.04 (all 5 PCs)

### 1. Clone & Setup
```bash
git clone <your-repo>
cd ProjectNyra
cp config/env.orchestrator .env
```

### 2. Start Orchestrator (Minisforum)
```bash
cd infra
make orchestrator-up
```

This brings up:
- Nexus Router (port 6000)
- LiteLLM (port 4000)
- Claude-Flow (port 8000)
- OpenClaw (port 8001)

```bash
cp infra/env/nyra.env.example infra/env/nyra.env
# edit OPENROUTER_API_KEY at minimum
bash infra/scripts/bootstrap.sh
```

## Operator interface

Use root `Makefile` targets and infra scripts:
- `make bootstrap-ultimate`
- `make health`
- `./infra/scripts/ultimate-bootstrap.sh <role> <action>`

## Browser upload flow

1. Upload files into `bootstrap/incoming/` (GitHub UI/Codespaces).
2. Dry-run map:
   ```bash
   ./infra/scripts/bootstrap-import.sh bootstrap/incoming dry-run
   ```
3. Apply map:
   ```bash
   ./infra/scripts/bootstrap-import.sh bootstrap/incoming apply
   ```
```bash
cp infra/env/nyra.env.example infra/env/nyra.env
# edit OPENROUTER_API_KEY at minimum
bash infra/scripts/bootstrap.sh
```

## Operator interface

Use root `Makefile` targets and infra scripts:
- `make bootstrap-ultimate`
- `make health`
- `./infra/scripts/ultimate-bootstrap.sh <role> <action>`

## Browser upload flow

1. Upload files into `bootstrap/incoming/` (GitHub UI/Codespaces).
2. Dry-run map:
   ```bash
   ./infra/scripts/bootstrap-import.sh bootstrap/incoming dry-run
   ```
3. Apply map:
   ```bash
   ./infra/scripts/bootstrap-import.sh bootstrap/incoming apply
   ```
### 3. Start Workers (RTX PCs)
On each worker PC:
```bash
cd infra
make workers-up WORKER=rtx-5090  # or rtx-3090ti, rtx-3060
```

### 4. Start Oracle Cloud (Optional, for always-on)
```bash
ssh oracle-vm
cd ProjectNyra/infra
make oracle-up
```

### 5. Verify Health
```bash
cd infra
bash scripts/health-check.sh
```

## 📦 Project Structure

```
ProjectNyra/
├── infra/                      # Deployment & infrastructure
│   ├── docker-compose.*.yml    # Service stacks
│   ├── nexus/                  # MCP Router (Grafbase Nexus)
│   ├── litellm/                # Model routing layer
│   └── scripts/                # Bootstrap, health checks
├── src/                        # Application code
│   ├── claude-flow/            # Dev orchestrator
│   ├── openclaw/               # Borrower-facing agent
│   └── archon-os/              # Knowledge backbone
├── services/                   # Microservices
│   ├── quote-engine/           # Mortgage math API
│   ├── lead-ingestion/         # Email/webhook handlers
│   └── drip-campaign/          # Campaign scheduler
├── packages/                   # Shared libraries
├── apps/                       # Full UIs
├── workers/                    # GPU worker configs
├── docs/                       # Documentation
└── Makefile                    # Master orchestration

```

## 🔧 Configuration

### Environment Variables (Per Node)
- `config/env.orchestrator` → Orchestrator
- `config/env.oracle` → Oracle Cloud
- `config/env.worker-5090` → RTX 5090
- `config/env.worker-3090ti` → RTX 3090Ti
- `config/env.worker-3060` → RTX 3060

See `.env.example` for full template.

## 📚 Documentation

- **ARCHITECTURE.md** — Complete system design, data flows, compliance
- **docs/SETUP.md** — Detailed setup instructions per node
- **docs/API.md** — Quote Engine, Lead Ingestion, Memory APIs
- **docs/DEPLOYMENT.md** — Production checklist, scaling
- **docs/TROUBLESHOOTING.md** — Common issues & fixes

## 🛠️ Development

### Using Makefile
```bash
make help                 # See all targets
make orchestrator-up      # Start orchestrator stack
make workers-up WORKER=rtx-5090  # Start specific worker
make oracle-up            # Start oracle stack
make logs SERVICE=nexus   # Tail logs
make health-check         # Verify all services
make clean                # Stop all services
```

### Running Claude-Flow
```bash
cd src/claude-flow
npm install
npm run dev
```

### Running OpenClaw
```bash
cd src/openclaw
npm install
npm run dev
```

## 🔐 Secrets Management

All secrets injected via **Infisical**:
- API keys, database passwords, encryption keys
- No `.env` files in git
- Sidecar pattern (automatic injection)

Bootstrap secrets:
```bash
cd infra/secrets
bash bootstrap-secrets.sh
```

## 🧪 Testing

### Quote Engine
```bash
curl -X POST http://localhost:8089/api/v1/quote \
  -H "Content-Type: application/json" \
  -d '{
    "propertyValue": 500000,
    "downPayment": 100000,
    "baseInterestRate": 6.5,
    "termYears": 30,
    "annualTaxes": 6000,
    "annualInsurance": 1200
  }'
```

### Lead Ingestion
```bash
curl -X POST http://localhost:8090/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "email": "borrower@example.com",
    "propertyValue": 400000,
    "loanPurpose": "purchase"
  }'
```

## 🚢 Deployment to Production

See `docs/DEPLOYMENT.md` for:
- Oracle Cloud provisioning
- Cloudflare Tunnel setup
- Database migrations
- Backup & recovery

## 📊 Monitoring & Debugging

```bash
# Health check all services
bash infra/scripts/health-check.sh

# View logs
docker-compose logs -f nexus
docker-compose logs -f litellm
docker-compose logs -f claude-flow

# Access Nexus dashboard
# http://orchestrator:6000

# Access LiteLLM dashboard
# http://orchestrator:4000
```

## 🤝 Contributing

1. Create a feature branch
2. Make changes in `src/`, `services/`, or `packages/`
3. Run `npm run lint` and `npm run test`
4. Push to Gitea (self-hosted)
5. CI/CD via Gitea Actions

## 📜 License

Proprietary — Apotheosis AI & Partners

## 🆘 Support

- **Docs**: See `docs/` folder
- **Issues**: Create issue in Gitea
- **Questions**: DM on Tailscale

---

**Last Updated**: Feb 28, 2026
**Status**: MVP (Orchestrator + Workers ready, Oracle integration in progress)
