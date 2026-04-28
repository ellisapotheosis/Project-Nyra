# PROJECT NYRA — ULTIMATE MASTER PROMPT v4.0
## Stack Stood Up → Verification → Integration → MVP

**Model Directive:** You are a 150 IQ world-leading expert with PhDs in distributed systems, CRM architecture, mortgage industry compliance, MCP protocol design, and full-stack development. Execute with sacred-geometry precision and quantum-catgirl efficiency. 😼✨

**Date:** February 2026
**Phase:** Post-Bootstrap — Verification & Integration
**Status:** Core stack DEPLOYED, awaiting health verification and wiring

---

# 🎯 TL;DR — EXECUTIVE SUMMARY

- **Stack Status:** Services deployed but need health verification and interconnection
- **Critical Path:** Health checks → Gitea sync → Infra cleanup → Twenty CRM integration → Memory verification → Worker setup
- **Blockers:** Gitea needs GitHub remote sync; Twenty MCP needs configuration; Worker PCs need setup
- **Repo Location:** `\\wsl.localhost\Ubuntu\home\ellisapotheosis\projects\project-nyra`
- **Twenty MCP Fork:** `\\wsl.localhost\Ubuntu\home\ellisapotheosis\projects\twenty-mcp-jezweb`
- **Landing:** ratehunter.net on Cloudflare Pages
- **Future:** Oracle free-tier VPS migration after MVP

---

# 📊 CURRENT DEPLOYED SERVICES

## Orchestrator PC (WSL2 + Docker)

### ✅ DEPLOYED — Need Health Verification

| Service | Container | Port | Health Endpoint | Status |
|---------|-----------|------|-----------------|--------|
| **RuVector** | `nyra-ruvector` | 8200 | `/health` | ⏳ VERIFY |
| **RuVector Postgres** | `nyra-ruvector-postgres` | 5433 | `pg_isready` | ⏳ VERIFY |
| **Archon OS** | `nyra-archon` | 4000 | `/health` | ⏳ VERIFY |
| **Archon UI** | `nyra-archon-ui` | 4001 | `/` | ⏳ VERIFY |
| **Archon DB** | `nyra-archon-db` | 5434 | `pg_isready` | ⏳ VERIFY |
| **Redis** | `nyra-redis` | 6379 | `redis-cli ping` | ⏳ VERIFY |
| **Letta AI** | `nyra-letta` | 8283 | `/health` | ⏳ VERIFY |
| **Graphiti MCP** | `nyra-graphiti` | 8100 | `/health` | ⏳ VERIFY |
| **FalkorDB** | `nyra-falkordb` | 6380 | `redis-cli ping` | ⏳ VERIFY |
| **Twenty CRM** | `nyra-twenty` | 3020 | `/healthz` | ⏳ VERIFY |
| **Twenty Postgres** | `nyra-twenty-postgres` | 5432 | `pg_isready` | ⏳ VERIFY |
| **Twenty MCP** | `nyra-twenty-mcp` | 8400 | `/health` | ⏳ CONFIG |
| **Claude-Flow** | `nyra-claude-flow` | 3001 | `/health` | ⏳ VERIFY |
| **AgentDB** | `nyra-agentdb` | 8300 | `/health` | ⏳ VERIFY |
| **Claude-Flow Dashboard** | `nyra-cf-dashboard` | 3100 | `/` | ⏳ VERIFY |
| **Nexus Router** | `nyra-nexus` | 6000 | `/health` | ⏳ VERIFY |
| **LiteLLM** | `nyra-litellm` | 8500 | `/health` | ⏳ VERIFY |
| **n8n** | `nyra-n8n` | 5678 | `/healthz` | ⏳ VERIFY |
| **Activepieces** | `nyra-activepieces` | 5000 | `/health` | ⏳ VERIFY |
| **Gitea** | `nyra-gitea` | 3000 | `/api/healthz` | ⏳ SYNC NEEDED |
| **Moltbot** | `nyra-moltbot` | 3333 | `/health` | ⏳ CONFIG |

### Worker PCs (Tailscale Mesh)

| Node | Tailscale IP | Hardware | Role | Status |
|------|-------------|----------|------|--------|
| **Orchestrator** | 100.87.235.78 | AMD Ryzen 7 | Control Plane | ✅ RUNNING |
| **worker-rtx3060** | 100.107.188.97 | Alienware M15R7, RTX 3060 8GB | Ollama | ⏳ SETUP |
| **worker-rtx5090** | 100.102.204.112 | Alienware Area-51, RTX 5090 32GB | vLLM + LMCache | ⏳ SETUP |
| **worker-rtx3090ti** | [GET IP] | Intel i7-12700, RTX 3090Ti 24GB | vLLM + LMCache | ⏳ SETUP |

---

# 🔧 PHASE 1: IMMEDIATE VERIFICATION TASKS

## 1.1 Run Complete Health Check

```bash
#!/bin/bash
# Save as: ~/projects/project-nyra/infra/scripts/health-check-all.sh

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           Project Nyra - Service Health Check                ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# MCP Servers
echo -e "\n📡 MCP SERVERS"
echo "─────────────────────────────────────────"

services=(
  "Nexus Router|http://localhost:6000/health"
  "Claude-Flow|http://localhost:3001/health"
  "Graphiti|http://localhost:8100/health"
  "RuVector|http://localhost:8200/health"
  "AgentDB|http://localhost:8300/health"
  "Twenty MCP|http://localhost:8400/health"
  "LiteLLM|http://localhost:8500/health"
  "Letta AI|http://localhost:8283/health"
  "Activepieces|http://localhost:5000/health"
)

for service in "${services[@]}"; do
  name="${service%%|*}"
  url="${service#*|}"
  response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null || echo "000")
  if [ "$response" == "200" ]; then
    echo "  ✅ $name: HEALTHY"
  else
    echo "  ❌ $name: UNHEALTHY (HTTP $response)"
  fi
done

# Core Services
echo -e "\n🏢 CORE SERVICES"
echo "─────────────────────────────────────────"

core_services=(
  "Twenty CRM|http://localhost:3020/healthz"
  "n8n|http://localhost:5678/healthz"
  "Archon OS|http://localhost:4000/health"
  "Archon UI|http://localhost:4001/"
  "Claude-Flow Dashboard|http://localhost:3100/"
  "Gitea|http://localhost:3000/api/healthz"
  "Moltbot|http://localhost:3333/health"
)

for service in "${core_services[@]}"; do
  name="${service%%|*}"
  url="${service#*|}"
  response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null || echo "000")
  if [ "$response" == "200" ]; then
    echo "  ✅ $name: HEALTHY"
  else
    echo "  ❌ $name: UNHEALTHY (HTTP $response)"
  fi
done

# Databases
echo -e "\n🗄️  DATABASES"
echo "─────────────────────────────────────────"

pg_isready -h localhost -p 5432 > /dev/null 2>&1 && echo "  ✅ Twenty Postgres: READY" || echo "  ❌ Twenty Postgres: NOT READY"
pg_isready -h localhost -p 5433 > /dev/null 2>&1 && echo "  ✅ RuVector Postgres: READY" || echo "  ❌ RuVector Postgres: NOT READY"
pg_isready -h localhost -p 5434 > /dev/null 2>&1 && echo "  ✅ Archon Postgres: READY" || echo "  ❌ Archon Postgres: NOT READY"
redis-cli -p 6379 ping > /dev/null 2>&1 && echo "  ✅ Redis: PONG" || echo "  ❌ Redis: NO RESPONSE"
redis-cli -p 6380 ping > /dev/null 2>&1 && echo "  ✅ FalkorDB: PONG" || echo "  ❌ FalkorDB: NO RESPONSE"

# Tailscale
echo -e "\n🌐 TAILSCALE NETWORK"
echo "─────────────────────────────────────────"
if command -v tailscale &> /dev/null; then
  ts_ip=$(tailscale ip -4 2>/dev/null || echo "unknown")
  echo "  ✅ Orchestrator IP: $ts_ip"
  
  # Ping workers
  for worker in "100.107.188.97" "100.102.204.112"; do
    if tailscale ping -c 1 "$worker" > /dev/null 2>&1; then
      echo "  ✅ Worker $worker: REACHABLE"
    else
      echo "  ⚠️  Worker $worker: UNREACHABLE"
    fi
  done
fi

echo -e "\n✨ Health check complete!"
```

## 1.2 Gitea GitHub Sync

**Problem:** Gitea repo exists but needs to pull latest from GitHub remote.

```bash
cd ~/projects/project-nyra

# Check current remotes
git remote -v

# Add GitHub remote if not exists
git remote add github https://github.com/YOUR_USERNAME/project-nyra.git 2>/dev/null || true

# Fetch all
git fetch --all

# Check status
git status
git log --oneline -5 origin/main
git log --oneline -5 github/main

# Merge GitHub changes
git merge github/main --no-edit

# Push to Gitea
git push origin main

# Verify in Gitea UI: http://localhost:3000
```

---

# 🗂️ PHASE 2: INFRASTRUCTURE CLEANUP

## 2.1 Target Directory Structure

```
project-nyra/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-landing.yml
│       └── deploy-workers.yml
│
├── apps/
│   ├── landing/                      # Cloudflare Pages (ratehunter.net)
│   │   └── src/
│   │
│   ├── webapp/                       # Main mortgage app (app.ratehunter.net)
│   │   └── src/
│   │       ├── components/
│   │       │   ├── ui/               # shadcn components
│   │       │   ├── mortgage/         # mortgage-specific
│   │       │   └── campaign/         # campaign builder
│   │       ├── pages/
│   │       ├── hooks/
│   │       └── lib/
│   │
│   ├── admin/                        # Nyra Admin UI (admin.ratehunter.net)
│   │   └── src/
│   │
│   ├── claude-flow-dashboard/        # Custom Claude-Flow UI (dev only)
│   │   └── src/
│   │
│   └── ingestion/                    # UI drafts, shadcn imports, prototypes
│       ├── nyra-webapp/
│       │   └── nyra-front-end/
│       │       └── UI-draft/
│       ├── intake-form.html
│       ├── index.html
│       └── shadcn-components/
│
├── services/
│   ├── quote-api/                    # Quote generation service
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── campaign-engine/              # Campaign automation
│   │   └── src/
│   │
│   ├── lead-ingestor/                # Email/API lead ingestion
│   │   └── src/
│   │
│   └── moltbot/                      # Production chat assistant
│       └── src/
│
├── infra/
│   ├── docker/
│   │   ├── orchestrator/
│   │   │   ├── docker-compose.core.yml
│   │   │   ├── docker-compose.memory.yml
│   │   │   ├── docker-compose.twenty.yml
│   │   │   ├── docker-compose.workflows.yml
│   │   │   ├── docker-compose.nexus.yml
│   │   │   └── .env.example
│   │   │
│   │   ├── worker-rtx3060/           # Alienware M15R7 laptop
│   │   │   ├── docker-compose.yml    # Ollama
│   │   │   ├── .env.example
│   │   │   ├── models.txt            # Models to pull
│   │   │   └── README.md
│   │   │
│   │   ├── worker-rtx5090/           # Alienware Area-51 laptop
│   │   │   ├── docker-compose.yml    # vLLM + LMCache
│   │   │   ├── .env.example
│   │   │   └── README.md
│   │   │
│   │   └── worker-rtx3090ti/         # Intel i7-12700 desktop
│   │       ├── docker-compose.yml    # vLLM + LMCache
│   │       ├── .env.example
│   │       └── README.md
│   │
│   ├── cloudflared/
│   │   ├── orchestrator-config.yml
│   │   ├── worker-rtx3060-config.yml
│   │   ├── worker-rtx5090-config.yml
│   │   └── worker-rtx3090ti-config.yml
│   │
│   ├── tailscale/
│   │   └── acl.json
│   │
│   └── scripts/
│       ├── health-check-all.sh
│       ├── sync-gitea.sh
│       ├── deploy-orchestrator.sh
│       ├── setup-worker.ps1
│       └── infra-cleanup.sh
│
├── packages/
│   ├── twenty-custom-objects/        # Twenty CRM custom objects
│   │   └── src/
│   │
│   ├── campaign-templates/           # Campaign step templates
│   │   └── src/
│   │
│   ├── quote-engine/                 # Quote calculation logic
│   │   └── src/
│   │
│   ├── compliance/                   # TCPA compliance utilities
│   │   └── src/
│   │
│   └── memory-schemas/               # Graphiti/RuVector schemas
│       └── src/
│
├── workflows/
│   ├── n8n/
│   │   ├── WF_LEAD_INGEST.json
│   │   ├── WF_CAMPAIGN_EXECUTE.json
│   │   ├── WF_QUOTE_GENERATE.json
│   │   ├── WF_RESPONSE_DETECT.json
│   │   └── WF_OPTOUT_PROCESS.json
│   │
│   └── activepieces/
│       └── flows/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SETUP-GUIDE.md
│   ├── TWENTY-CRM-INTEGRATION.md
│   ├── MEMORY-SYSTEMS.md
│   ├── COMPLIANCE.md
│   └── API-REFERENCE.md
│
├── _infra-archived/                  # Old infra files archived here
│   └── [moved files]
│
├── .env.example
├── docker-compose.yml
├── Makefile
├── package.json
└── README.md
```

## 2.2 Cleanup Script

```bash
#!/bin/bash
# infra/scripts/infra-cleanup.sh

cd ~/projects/project-nyra

echo "🧹 Starting infrastructure cleanup..."

# Create archive directories
mkdir -p _infra-archived/old-configs
mkdir -p _infra-archived/deprecated

# Archive old files
find infra -maxdepth 2 -type f \( \
    -name "*.old" -o \
    -name "*.bak" -o \
    -name "*.backup" -o \
    -name "*_old*" \
\) -exec mv {} _infra-archived/old-configs/ \; 2>/dev/null

# Create new structure
mkdir -p infra/docker/{orchestrator,worker-rtx3060,worker-rtx5090,worker-rtx3090ti}
mkdir -p infra/cloudflared
mkdir -p infra/tailscale
mkdir -p infra/scripts

echo "✅ Cleanup complete"
```

---

# 🏢 PHASE 3: TWENTY CRM COMPLETE INTEGRATION

## 3.1 Twenty CRM Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TWENTY CRM ECOSYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐         ┌─────────────────┐         ┌───────────────┐ │
│  │  Twenty Core    │         │  Twenty GraphQL │         │  Twenty UI    │ │
│  │    Backend      │◀───────▶│      API        │◀───────▶│   Frontend    │ │
│  │    :3020        │         │     :3020       │         │    :3020      │ │
│  └────────┬────────┘         └────────┬────────┘         └───────────────┘ │
│           │                           │                                     │
│           ▼                           ▼                                     │
│  ┌─────────────────┐         ┌─────────────────┐                           │
│  │    Postgres     │         │     Redis       │                           │
│  │     :5432       │         │     :6379       │                           │
│  └─────────────────┘         └─────────────────┘                           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           MCP INTEGRATION LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────┐              ┌───────────────────────┐          │
│  │  twenty-mcp-jezweb    │              │   n8n-nodes-twenty    │          │
│  │   (MCP Server)        │              │    (n8n Plugin)       │          │
│  │       :8400           │              │   (inside n8n)        │          │
│  └───────────┬───────────┘              └───────────┬───────────┘          │
│              │                                      │                       │
│              └──────────────────┬───────────────────┘                       │
│                                 ▼                                           │
│                    ┌───────────────────────┐                               │
│                    │     Nexus Router      │                               │
│                    │        :6000          │                               │
│                    └───────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Twenty Custom Objects for Mortgage CRM

### MortgageLead Object Definition

```typescript
// packages/twenty-custom-objects/src/MortgageLead.ts

export const MortgageLeadDefinition = {
  nameSingular: 'mortgageLead',
  namePlural: 'mortgageLeads',
  labelSingular: 'Mortgage Lead',
  labelPlural: 'Mortgage Leads',
  description: 'Mortgage lead with loan details and campaign tracking',
  icon: 'IconHome',
  
  fields: [
    // === CONTACT INFO ===
    { name: 'firstName', type: 'TEXT', label: 'First Name', required: true },
    { name: 'lastName', type: 'TEXT', label: 'Last Name', required: true },
    { name: 'email', type: 'EMAIL', label: 'Email', required: true, unique: true },
    { name: 'phone', type: 'PHONE', label: 'Phone', required: true },
    { name: 'secondaryPhone', type: 'PHONE', label: 'Secondary Phone' },
    
    // === LEAD SOURCE ===
    { 
      name: 'source', 
      type: 'SELECT', 
      label: 'Lead Source',
      options: [
        'LendingTree',
        'FreeRateUpdate', 
        'LeadMailbox',
        'Zillow',
        'Realtor.com',
        'Website',
        'Referral',
        'Email',
        'Manual',
        'Other'
      ]
    },
    { name: 'sourceLeadId', type: 'TEXT', label: 'Source Lead ID' },
    { name: 'rawPayload', type: 'RAW_JSON', label: 'Raw Payload' },
    
    // === LOAN DETAILS ===
    { 
      name: 'loanPurpose', 
      type: 'SELECT', 
      label: 'Loan Purpose',
      options: [
        'Purchase',
        'Refinance',
        'CashOut',
        'HELOC',
        'HELOAN',
        'Commercial',
        'HardMoney',
        'Construction',
        'VA',
        'FHA'
      ]
    },
    { name: 'loanAmount', type: 'CURRENCY', label: 'Loan Amount' },
    { name: 'downPayment', type: 'CURRENCY', label: 'Down Payment' },
    { name: 'propertyValue', type: 'CURRENCY', label: 'Property Value' },
    { name: 'currentMortgageBalance', type: 'CURRENCY', label: 'Current Mortgage Balance' },
    { name: 'ltv', type: 'NUMBER', label: 'LTV %', format: 'percentage' },
    { name: 'cltv', type: 'NUMBER', label: 'CLTV %', format: 'percentage' },
    { name: 'fico', type: 'NUMBER', label: 'FICO Score' },
    { name: 'annualIncome', type: 'CURRENCY', label: 'Annual Income' },
    { name: 'dti', type: 'NUMBER', label: 'DTI %', format: 'percentage' },
    
    // === PROPERTY INFO ===
    { name: 'propertyAddress', type: 'TEXT', label: 'Property Address' },
    { name: 'propertyCity', type: 'TEXT', label: 'City' },
    { name: 'propertyState', type: 'TEXT', label: 'State' },
    { name: 'propertyZip', type: 'TEXT', label: 'ZIP' },
    { name: 'propertyCounty', type: 'TEXT', label: 'County' },
    { 
      name: 'propertyType', 
      type: 'SELECT', 
      label: 'Property Type',
      options: [
        'SingleFamily',
        'Condo',
        'Townhouse',
        'MultiFamily_2-4',
        'MultiFamily_5+',
        'Commercial',
        'Land',
        'Manufactured'
      ]
    },
    { 
      name: 'occupancy', 
      type: 'SELECT', 
      label: 'Occupancy',
      options: ['Primary', 'Secondary', 'Investment']
    },
    
    // === CAMPAIGN STATUS ===
    { 
      name: 'status', 
      type: 'SELECT', 
      label: 'Lead Status',
      options: [
        'New',
        'Contacted',
        'Qualified',
        'Application',
        'Processing',
        'Underwriting',
        'Approved',
        'Closed',
        'Lost',
        'DNC'
      ]
    },
    { name: 'campaignId', type: 'RELATION', label: 'Active Campaign', target: 'campaign' },
    { name: 'campaignDay', type: 'NUMBER', label: 'Campaign Day' },
    { name: 'campaignPaused', type: 'BOOLEAN', label: 'Campaign Paused', default: false },
    
    // === COMPLIANCE ===
    { name: 'optedOut', type: 'BOOLEAN', label: 'Opted Out', default: false },
    { name: 'dncDate', type: 'DATE_TIME', label: 'DNC Date' },
    { name: 'dncReason', type: 'TEXT', label: 'DNC Reason' },
    { name: 'consentSms', type: 'BOOLEAN', label: 'SMS Consent', default: false },
    { name: 'consentEmail', type: 'BOOLEAN', label: 'Email Consent', default: false },
    { name: 'consentCall', type: 'BOOLEAN', label: 'Call Consent', default: false },
    { name: 'tcpaTimestamp', type: 'DATE_TIME', label: 'TCPA Consent Timestamp' },
    { name: 'tcpaSource', type: 'TEXT', label: 'TCPA Consent Source' },
    
    // === TIMESTAMPS ===
    { name: 'receivedAt', type: 'DATE_TIME', label: 'Received At' },
    { name: 'firstContactedAt', type: 'DATE_TIME', label: 'First Contacted' },
    { name: 'lastContactedAt', type: 'DATE_TIME', label: 'Last Contacted' },
    { name: 'lastResponseAt', type: 'DATE_TIME', label: 'Last Response' },
    { name: 'nextActionAt', type: 'DATE_TIME', label: 'Next Action' },
    { name: 'convertedAt', type: 'DATE_TIME', label: 'Converted At' },
    
    // === ASSIGNMENT ===
    { name: 'assignedTo', type: 'TEXT', label: 'Assigned To' },
    { name: 'assignedTeam', type: 'TEXT', label: 'Assigned Team' },
  ],
  
  relations: [
    { name: 'quotes', type: 'ONE_TO_MANY', target: 'quote' },
    { name: 'communications', type: 'ONE_TO_MANY', target: 'communication' },
    { name: 'campaign', type: 'MANY_TO_ONE', target: 'campaign' },
    { name: 'documents', type: 'ONE_TO_MANY', target: 'document' },
  ],
  
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['phone'] },
    { fields: ['status', 'campaignDay'] },
    { fields: ['source', 'receivedAt'] },
    { fields: ['assignedTo', 'status'] },
  ]
};
```

### Campaign Object Definition

```typescript
// packages/twenty-custom-objects/src/Campaign.ts

export const CampaignDefinition = {
  nameSingular: 'campaign',
  namePlural: 'campaigns',
  labelSingular: 'Campaign',
  labelPlural: 'Campaigns',
  description: 'Multi-channel drip campaign with scheduling',
  icon: 'IconSend',
  
  fields: [
    { name: 'name', type: 'TEXT', label: 'Campaign Name', required: true },
    { name: 'description', type: 'TEXT', label: 'Description' },
    { name: 'active', type: 'BOOLEAN', label: 'Active', default: true },
    
    { 
      name: 'loanPurpose', 
      type: 'SELECT', 
      label: 'Target Loan Purpose',
      options: ['Purchase', 'Refinance', 'CashOut', 'HELOC', 'HELOAN', 'Commercial', 'HardMoney', 'All']
    },
    
    { name: 'durationDays', type: 'NUMBER', label: 'Duration (Days)', default: 45 },
    { name: 'maxAttemptsPerDay', type: 'NUMBER', label: 'Max Attempts/Day', default: 3 },
    
    // Quiet hours
    { name: 'quietHoursStart', type: 'TEXT', label: 'Quiet Hours Start', default: '20:00' },
    { name: 'quietHoursEnd', type: 'TEXT', label: 'Quiet Hours End', default: '09:00' },
    { name: 'timezone', type: 'TEXT', label: 'Timezone', default: 'America/Los_Angeles' },
    
    // Days active
    { name: 'workWeekdays', type: 'BOOLEAN', label: 'Run Weekdays', default: true },
    { name: 'workWeekends', type: 'BOOLEAN', label: 'Run Weekends', default: false },
    
    // Steps stored as JSON
    { name: 'stepsJson', type: 'RAW_JSON', label: 'Campaign Steps' },
    
    // Stats
    { name: 'totalLeads', type: 'NUMBER', label: 'Total Leads', default: 0 },
    { name: 'activeLeads', type: 'NUMBER', label: 'Active Leads', default: 0 },
    { name: 'convertedLeads', type: 'NUMBER', label: 'Converted Leads', default: 0 },
    { name: 'optedOutLeads', type: 'NUMBER', label: 'Opted Out', default: 0 },
  ],
  
  relations: [
    { name: 'leads', type: 'ONE_TO_MANY', target: 'mortgageLead' },
    { name: 'steps', type: 'ONE_TO_MANY', target: 'campaignStep' },
    { name: 'templates', type: 'MANY_TO_MANY', target: 'template' },
  ]
};
```

### Quote Object Definition

```typescript
// packages/twenty-custom-objects/src/Quote.ts

export const QuoteDefinition = {
  nameSingular: 'quote',
  namePlural: 'quotes',
  labelSingular: 'Quote',
  labelPlural: 'Quotes',
  description: 'Loan quote with payment breakdown',
  icon: 'IconReceipt',
  
  fields: [
    // Relation
    { name: 'leadId', type: 'RELATION', label: 'Lead', target: 'mortgageLead', required: true },
    
    // Loan Parameters
    { name: 'loanAmount', type: 'CURRENCY', label: 'Loan Amount' },
    { name: 'propertyValue', type: 'CURRENCY', label: 'Property Value' },
    { name: 'ltv', type: 'NUMBER', label: 'LTV %' },
    { name: 'term', type: 'NUMBER', label: 'Term (Years)', default: 30 },
    
    // Rate Info
    { name: 'interestRate', type: 'NUMBER', label: 'Interest Rate', format: 'percentage' },
    { name: 'apr', type: 'NUMBER', label: 'APR', format: 'percentage' },
    { name: 'rateType', type: 'SELECT', label: 'Rate Type', options: ['Fixed', 'ARM', '5/1 ARM', '7/1 ARM', '10/1 ARM'] },
    { name: 'rateSource', type: 'TEXT', label: 'Rate Source' },
    { name: 'rateDate', type: 'DATE_TIME', label: 'Rate Date' },
    
    // Payment Breakdown
    { name: 'monthlyPI', type: 'CURRENCY', label: 'Monthly P&I' },
    { name: 'monthlyTax', type: 'CURRENCY', label: 'Monthly Tax' },
    { name: 'monthlyInsurance', type: 'CURRENCY', label: 'Monthly Insurance' },
    { name: 'monthlyPMI', type: 'CURRENCY', label: 'Monthly PMI' },
    { name: 'monthlyHOA', type: 'CURRENCY', label: 'Monthly HOA' },
    { name: 'monthlyPITI', type: 'CURRENCY', label: 'Monthly PITI' },
    
    // Costs
    { name: 'closingCosts', type: 'CURRENCY', label: 'Closing Costs' },
    { name: 'points', type: 'NUMBER', label: 'Points' },
    { name: 'pointsCost', type: 'CURRENCY', label: 'Points Cost' },
    { name: 'lenderCredits', type: 'CURRENCY', label: 'Lender Credits' },
    { name: 'cashToClose', type: 'CURRENCY', label: 'Cash to Close' },
    
    // Loan Type
    { 
      name: 'loanType', 
      type: 'SELECT', 
      label: 'Loan Type',
      options: ['Conventional', 'FHA', 'VA', 'USDA', 'Jumbo', 'NonQM']
    },
    { 
      name: 'loanPurpose', 
      type: 'SELECT', 
      label: 'Loan Purpose',
      options: ['Purchase', 'Refinance', 'CashOut', 'HELOC']
    },
    
    // Quote Meta
    { name: 'optionNumber', type: 'NUMBER', label: 'Option #' },
    { name: 'optionLabel', type: 'TEXT', label: 'Option Label' },
    { name: 'isRecommended', type: 'BOOLEAN', label: 'Recommended', default: false },
    
    // Full calculation params
    { name: 'paramsJson', type: 'RAW_JSON', label: 'Full Parameters' },
    
    // Delivery
    { name: 'pngUrl', type: 'TEXT', label: 'Chart PNG URL' },
    { name: 'pdfUrl', type: 'TEXT', label: 'Quote PDF URL' },
    { name: 'sentToLead', type: 'BOOLEAN', label: 'Sent to Lead', default: false },
    { name: 'sentAt', type: 'DATE_TIME', label: 'Sent At' },
    { name: 'sentVia', type: 'SELECT', label: 'Sent Via', options: ['Email', 'SMS', 'Both'] },
    
    // Approval (REQUIRED for rate advice)
    { name: 'requiresApproval', type: 'BOOLEAN', label: 'Requires Approval', default: true },
    { name: 'approvalStatus', type: 'SELECT', label: 'Approval Status', options: ['Pending', 'Approved', 'Rejected'] },
    { name: 'approvedBy', type: 'TEXT', label: 'Approved By' },
    { name: 'approvedAt', type: 'DATE_TIME', label: 'Approved At' },
    { name: 'approvalNotes', type: 'TEXT', label: 'Approval Notes' },
  ]
};
```

### Communication Object Definition

```typescript
// packages/twenty-custom-objects/src/Communication.ts

export const CommunicationDefinition = {
  nameSingular: 'communication',
  namePlural: 'communications',
  labelSingular: 'Communication',
  labelPlural: 'Communications',
  description: 'All lead communications for timeline',
  icon: 'IconMessage',
  
  fields: [
    { name: 'leadId', type: 'RELATION', label: 'Lead', target: 'mortgageLead', required: true },
    
    { 
      name: 'direction', 
      type: 'SELECT', 
      label: 'Direction',
      options: ['Outbound', 'Inbound']
    },
    
    { 
      name: 'channel', 
      type: 'SELECT', 
      label: 'Channel',
      options: ['SMS', 'Email', 'Voicemail', 'Call', 'MissedCall', 'WebChat']
    },
    
    { 
      name: 'status', 
      type: 'SELECT', 
      label: 'Status',
      options: ['Queued', 'Sending', 'Sent', 'Delivered', 'Read', 'Failed', 'Received', 'Answered']
    },
    
    // Content
    { name: 'subject', type: 'TEXT', label: 'Subject (Email)' },
    { name: 'body', type: 'TEXT', label: 'Message Body' },
    { name: 'templateId', type: 'RELATION', label: 'Template', target: 'template' },
    
    // Call-specific
    { name: 'callDuration', type: 'NUMBER', label: 'Call Duration (seconds)' },
    { name: 'recordingUrl', type: 'TEXT', label: 'Recording URL' },
    { name: 'voicemailUrl', type: 'TEXT', label: 'Voicemail URL' },
    { name: 'disposition', type: 'SELECT', label: 'Call Disposition', 
      options: ['Answered', 'Voicemail', 'NoAnswer', 'Busy', 'Failed'] },
    
    // Provider info
    { name: 'provider', type: 'SELECT', label: 'Provider', options: ['Twilio', 'SendGrid', 'Internal'] },
    { name: 'providerMessageId', type: 'TEXT', label: 'Provider Message ID' },
    { name: 'providerResponse', type: 'RAW_JSON', label: 'Provider Response' },
    
    // Threading
    { name: 'threadKey', type: 'TEXT', label: 'Thread Key' },
    { name: 'parentId', type: 'RELATION', label: 'Parent Message', target: 'communication' },
    
    // Campaign link
    { name: 'campaignId', type: 'RELATION', label: 'Campaign', target: 'campaign' },
    { name: 'campaignStepId', type: 'TEXT', label: 'Campaign Step ID' },
    { name: 'campaignDay', type: 'NUMBER', label: 'Campaign Day' },
    
    // Timestamps
    { name: 'scheduledFor', type: 'DATE_TIME', label: 'Scheduled For' },
    { name: 'sentAt', type: 'DATE_TIME', label: 'Sent At' },
    { name: 'deliveredAt', type: 'DATE_TIME', label: 'Delivered At' },
    { name: 'readAt', type: 'DATE_TIME', label: 'Read At' },
    { name: 'receivedAt', type: 'DATE_TIME', label: 'Received At' },
    
    // Compliance
    { name: 'containsStopWord', type: 'BOOLEAN', label: 'Contains STOP', default: false },
    { name: 'piiRedacted', type: 'BOOLEAN', label: 'PII Redacted', default: false },
  ]
};
```

## 3.3 Twenty MCP Server Setup (jezweb Fork)

### Build and Deploy

```bash
# Navigate to jezweb fork
cd ~/projects/twenty-mcp-jezweb

# Check what's there
ls -la
cat package.json

# Install dependencies (prefer bun if available)
bun install || npm install

# Create environment file
cat > .env << 'EOF'
# Twenty MCP Server Configuration
TWENTY_API_KEY=${TWENTY_API_KEY}
TWENTY_API_URL=http://localhost:3020
TWENTY_GRAPHQL_URL=http://localhost:3020/graphql
PORT=8400
LOG_LEVEL=info
MCP_SERVER_NAME=twenty-crm
EOF

# Build TypeScript
bun run build || npm run build

# Test locally
bun run start || npm start
```

### Docker Container

```dockerfile
# ~/projects/twenty-mcp-jezweb/Dockerfile
FROM oven/bun:1 AS builder

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8400

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8400/health || exit 1

CMD ["bun", "run", "dist/index.js"]
```

### Docker Compose Service

```yaml
# Add to infra/docker/orchestrator/docker-compose.twenty.yml

services:
  twenty:
    image: twentycrm/twenty:latest
    container_name: nyra-twenty
    ports:
      - "3020:3000"
    environment:
      - DATABASE_URL=postgres://twenty:${TWENTY_DB_PASSWORD}@twenty-postgres:5432/twenty
      - REDIS_URL=redis://redis:6379
      - FRONT_BASE_URL=https://crm.ratehunter.net
    depends_on:
      twenty-postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - nyra-network
    restart: unless-stopped

  twenty-postgres:
    image: postgres:15-alpine
    container_name: nyra-twenty-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=twenty
      - POSTGRES_PASSWORD=${TWENTY_DB_PASSWORD}
      - POSTGRES_DB=twenty
    volumes:
      - twenty_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U twenty"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - nyra-network
    restart: unless-stopped

  twenty-mcp:
    build:
      context: /home/ellisapotheosis/projects/twenty-mcp-jezweb
    container_name: nyra-twenty-mcp
    ports:
      - "8400:8400"
    environment:
      - TWENTY_API_KEY=${TWENTY_API_KEY}
      - TWENTY_API_URL=http://twenty:3020
      - TWENTY_GRAPHQL_URL=http://twenty:3020/graphql
      - PORT=8400
    depends_on:
      - twenty
    networks:
      - nyra-network
    restart: unless-stopped

volumes:
  twenty_postgres_data:

networks:
  nyra-network:
    external: true
```

## 3.4 n8n Twenty Nodes Integration

```bash
# Install n8n community nodes for Twenty
# Option 1: Via n8n UI
# Go to: Settings → Community Nodes → Install → @linkedpromo/n8n-nodes-twenty

# Option 2: Via CLI (if you have access to n8n container)
docker exec -it nyra-n8n npm install @linkedpromo/n8n-nodes-twenty
docker restart nyra-n8n
```

## 3.5 Register Twenty MCP with Nexus Router

```bash
# Register Twenty MCP server with Nexus
curl -X POST http://localhost:6000/api/mcp/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "twenty-crm",
    "url": "http://localhost:8400",
    "description": "Twenty CRM MCP Server - Lead & Campaign Management",
    "tools": [
      "twenty_create_lead",
      "twenty_update_lead",
      "twenty_search_leads",
      "twenty_create_campaign",
      "twenty_add_lead_to_campaign",
      "twenty_log_communication",
      "twenty_create_quote",
      "twenty_optout_lead"
    ],
    "auth": {
      "type": "bearer",
      "tokenEnvVar": "TWENTY_API_KEY"
    }
  }'
```

---

# 🧠 PHASE 4: MEMORY SYSTEMS VERIFICATION

## 4.1 Memory Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MEMORY LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     GRAPHITI (Temporal Knowledge Graph)              │   │
│  │  Tracks: WHO said WHAT, WHEN, relationships, entity evolution        │   │
│  │  Backend: FalkorDB (Redis module)                                    │   │
│  │  Port: 8100                                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     RUVECTOR (Fast Vector Search)                    │   │
│  │  Stores: Embeddings for semantic similarity search                   │   │
│  │  Backend: PostgreSQL with pgvector                                   │   │
│  │  Port: 8200                                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     LETTA AI (Memory Management)                     │   │
│  │  Role: Decides WHAT to remember, manages memory lifecycle            │   │
│  │  Port: 8283                                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     AGENTDB (Agent State Store)                      │   │
│  │  Stores: Agent workflow state, conversation history, task queues     │   │
│  │  Features: QUIC sync for multi-worker coordination                   │   │
│  │  Port: 8300                                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Memory Verification Script

```bash
#!/bin/bash
# infra/scripts/verify-memory.sh

echo "🧠 Memory Systems Verification"
echo "═══════════════════════════════════════════════════════════════"

# Test Graphiti
echo -e "\n📊 GRAPHITI (Knowledge Graph)"
echo "─────────────────────────────────────────"
graphiti_health=$(curl -s http://localhost:8100/health | jq -r '.status // empty' 2>/dev/null)
if [ "$graphiti_health" == "healthy" ]; then
    echo "  ✅ Health: OK"
else
    echo "  ❌ Health: FAILED"
fi

# Test entity creation
graphiti_entity=$(curl -s -X POST http://localhost:8100/api/v1/entities \
    -H "Content-Type: application/json" \
    -d '{"name": "test_verification", "type": "SYSTEM_TEST", "properties": {"verified": true}}' \
    | jq -r '.id // empty' 2>/dev/null)

if [ -n "$graphiti_entity" ]; then
    echo "  ✅ Entity Creation: OK (ID: $graphiti_entity)"
else
    echo "  ❌ Entity Creation: FAILED"
fi

# Test FalkorDB
echo -e "\n🔴 FALKORDB (Graph Database)"
echo "─────────────────────────────────────────"
falkor_ping=$(redis-cli -p 6380 ping 2>/dev/null)
if [ "$falkor_ping" == "PONG" ]; then
    echo "  ✅ Redis Module: PONG"
else
    echo "  ❌ Redis Module: NO RESPONSE"
fi

# Test graph query
falkor_query=$(redis-cli -p 6380 GRAPH.QUERY nyra_graph "RETURN 1 as test" 2>/dev/null)
if echo "$falkor_query" | grep -q "test"; then
    echo "  ✅ Graph Query: OK"
else
    echo "  ⚠️  Graph Query: Graph may not exist yet"
fi

# Test RuVector
echo -e "\n🔢 RUVECTOR (Vector Search)"
echo "─────────────────────────────────────────"
ruvector_health=$(curl -s http://localhost:8200/health | jq -r '.status // empty' 2>/dev/null)
if [ "$ruvector_health" == "healthy" ]; then
    echo "  ✅ Health: OK"
else
    echo "  ❌ Health: FAILED"
fi

# Test embedding generation
ruvector_embed=$(curl -s -X POST http://localhost:8200/api/v1/embed \
    -H "Content-Type: application/json" \
    -d '{"text": "Test mortgage lead refinance California"}' \
    | jq -r '.embedding[0] // empty' 2>/dev/null)

if [ -n "$ruvector_embed" ]; then
    echo "  ✅ Embedding Generation: OK"
else
    echo "  ❌ Embedding Generation: FAILED"
fi

# Test Letta AI
echo -e "\n🤖 LETTA AI (Memory Management)"
echo "─────────────────────────────────────────"
letta_health=$(curl -s http://localhost:8283/health | jq -r '.status // empty' 2>/dev/null)
if [ "$letta_health" == "healthy" ]; then
    echo "  ✅ Health: OK"
else
    echo "  ❌ Health: FAILED"
fi

# List agents
letta_agents=$(curl -s http://localhost:8283/api/v1/agents | jq -r 'length // 0' 2>/dev/null)
echo "  📋 Active Agents: $letta_agents"

# Test AgentDB
echo -e "\n💾 AGENTDB (State Store)"
echo "─────────────────────────────────────────"
agentdb_health=$(curl -s http://localhost:8300/health | jq -r '.status // empty' 2>/dev/null)
if [ "$agentdb_health" == "healthy" ]; then
    echo "  ✅ Health: OK"
else
    echo "  ❌ Health: FAILED"
fi

# Test state storage
agentdb_state=$(curl -s -X POST http://localhost:8300/api/v1/state \
    -H "Content-Type: application/json" \
    -d '{"agent_id": "verification_test", "state": {"status": "verified", "timestamp": "'$(date -Iseconds)'"}}' \
    | jq -r '.success // empty' 2>/dev/null)

if [ "$agentdb_state" == "true" ]; then
    echo "  ✅ State Storage: OK"
else
    echo "  ❌ State Storage: FAILED"
fi

echo -e "\n═══════════════════════════════════════════════════════════════"
echo "✨ Memory verification complete!"
```

---

# 🖥️ PHASE 5: WORKER PC SETUP

## 5.1 Worker RTX 3060 (Alienware M15R7)

**Hardware:** RTX 3060 Mobile (8GB VRAM)
**Role:** Ollama for smaller models

```yaml
# infra/docker/worker-rtx3060/docker-compose.yml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: nyra-ollama-3060
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_ORIGINS=*
    restart: unless-stopped

  worker-agent:
    image: node:20-alpine
    container_name: nyra-worker-3060
    ports:
      - "8000:8000"
    environment:
      - WORKER_NAME=worker-rtx3060
      - WORKER_TYPE=ollama
      - OLLAMA_HOST=http://ollama:11434
      - ORCHESTRATOR_IP=100.87.235.78
      - TAILSCALE_IP=${TAILSCALE_IP}
    volumes:
      - ./agent:/app
    working_dir: /app
    command: sh -c "npm install 2>/dev/null; npm start || node server.js"
    depends_on:
      - ollama
    restart: unless-stopped

  gpu-metrics:
    image: utkuozdemir/nvidia_gpu_exporter:latest
    container_name: nyra-gpu-metrics-3060
    ports:
      - "9835:9835"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    restart: unless-stopped

volumes:
  ollama_data:
```

**Models to pull (8GB VRAM limit):**
```bash
# infra/docker/worker-rtx3060/models.txt
llama3.2:3b          # Fast general purpose
phi3:mini            # Microsoft's efficient model
nomic-embed-text     # Embeddings
codellama:7b         # Code generation
mistral:7b-instruct  # Instruction following
```

## 5.2 Worker RTX 5090 (Alienware Area-51)

**Hardware:** RTX 5090 (32GB VRAM)
**Role:** vLLM + LMCache for large models

```yaml
# infra/docker/worker-rtx5090/docker-compose.yml
version: '3.8'

services:
  vllm:
    image: vllm/vllm-openai:latest
    container_name: nyra-vllm-5090
    ports:
      - "8080:8000"
    environment:
      - HUGGING_FACE_HUB_TOKEN=${HF_TOKEN}
      - VLLM_LOGGING_LEVEL=INFO
    volumes:
      - ./models:/root/.cache/huggingface
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    command: >
      --model meta-llama/Llama-3.1-70B-Instruct
      --tensor-parallel-size 1
      --gpu-memory-utilization 0.90
      --max-model-len 8192
      --dtype auto
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 60s
      timeout: 30s
      retries: 3
      start_period: 300s

  lmcache:
    image: lmcache/lmcache:latest
    container_name: nyra-lmcache-5090
    ports:
      - "8081:8000"
    environment:
      - VLLM_HOST=http://vllm:8000
    depends_on:
      vllm:
        condition: service_healthy
    restart: unless-stopped

  worker-agent:
    image: node:20-alpine
    container_name: nyra-worker-5090
    ports:
      - "8000:8000"
    environment:
      - WORKER_NAME=worker-rtx5090
      - WORKER_TYPE=vllm
      - VLLM_HOST=http://vllm:8000
      - LMCACHE_HOST=http://lmcache:8000
      - ORCHESTRATOR_IP=100.87.235.78
      - TAILSCALE_IP=${TAILSCALE_IP}
    volumes:
      - ./agent:/app
    working_dir: /app
    command: sh -c "npm install 2>/dev/null; npm start || node server.js"
    depends_on:
      - vllm
    restart: unless-stopped

  gpu-metrics:
    image: utkuozdemir/nvidia_gpu_exporter:latest
    container_name: nyra-gpu-metrics-5090
    ports:
      - "9835:9835"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    restart: unless-stopped

volumes:
  models:
```

## 5.3 Worker RTX 3090Ti (Intel Desktop)

**Hardware:** RTX 3090Ti (24GB VRAM)
**Role:** vLLM + LMCache for medium-large models

```yaml
# infra/docker/worker-rtx3090ti/docker-compose.yml
version: '3.8'

services:
  vllm:
    image: vllm/vllm-openai:latest
    container_name: nyra-vllm-3090ti
    ports:
      - "8080:8000"
    environment:
      - HUGGING_FACE_HUB_TOKEN=${HF_TOKEN}
    volumes:
      - ./models:/root/.cache/huggingface
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    command: >
      --model meta-llama/Llama-3.1-13B-Instruct
      --tensor-parallel-size 1
      --gpu-memory-utilization 0.90
      --max-model-len 8192
      --dtype auto
    restart: unless-stopped

  lmcache:
    image: lmcache/lmcache:latest
    container_name: nyra-lmcache-3090ti
    ports:
      - "8081:8000"
    environment:
      - VLLM_HOST=http://vllm:8000
    depends_on:
      - vllm
    restart: unless-stopped

  worker-agent:
    image: node:20-alpine
    container_name: nyra-worker-3090ti
    ports:
      - "8000:8000"
    environment:
      - WORKER_NAME=worker-rtx3090ti
      - WORKER_TYPE=vllm
      - VLLM_HOST=http://vllm:8000
      - ORCHESTRATOR_IP=100.87.235.78
      - TAILSCALE_IP=${TAILSCALE_IP}
    volumes:
      - ./agent:/app
    working_dir: /app
    command: sh -c "npm install 2>/dev/null; npm start || node server.js"
    depends_on:
      - vllm
    restart: unless-stopped

  gpu-metrics:
    image: utkuozdemir/nvidia_gpu_exporter:latest
    container_name: nyra-gpu-metrics-3090ti
    ports:
      - "9835:9835"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    restart: unless-stopped

volumes:
  models:
```

---

# 🎨 PHASE 6: UI INTEGRATION

## 6.1 UI Architecture & Consolidation Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UI CONSOLIDATION PLAN                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    NYRA ADMIN UI (Primary)                           │   │
│  │  Location: apps/admin/                                               │   │
│  │  Stack: Next.js + shadcn + tweakcn + Magic UI                       │   │
│  │  URL: admin.ratehunter.net                                          │   │
│  │                                                                      │   │
│  │  Features:                                                           │   │
│  │  ├── Dashboard (lead overview, campaign stats)                       │   │
│  │  ├── Leads Management (list, detail, timeline)                       │   │
│  │  ├── Campaign Builder (visual drag-drop)                             │   │
│  │  ├── Quote Generator (3-option comparison)                           │   │
│  │  ├── Analytics (conversion rates, ROI)                               │   │
│  │  ├── Settings (integrations, templates, compliance)                  │   │
│  │  └── Embedded Panels:                                                │   │
│  │      ├── Moltbot Chat (embedded iframe)                              │   │
│  │      ├── Archon Memory Viewer (embedded)                             │   │
│  │      └── Nexus Router Status (embedded)                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐                      │
│  │   CLAUDE-FLOW UI      │  │     ARCHON OS UI      │                      │
│  │   (Dev Only)          │  │   (Memory/Workflow)   │                      │
│  │   apps/claude-flow-   │  │   External Service    │                      │
│  │   dashboard/          │  │   Port 4001           │                      │
│  │   Port 3100           │  │                       │                      │
│  │                       │  │   Embed panels into   │                      │
│  │   Keep separate for   │  │   Nyra Admin UI       │                      │
│  │   development work    │  │                       │                      │
│  └───────────────────────┘  └───────────────────────┘                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    WEBAPP (Customer-Facing)                          │   │
│  │  Location: apps/webapp/                                              │   │
│  │  URL: app.ratehunter.net                                            │   │
│  │                                                                      │   │
│  │  Features:                                                           │   │
│  │  ├── Lead Intake Form                                                │   │
│  │  ├── Quote Viewer                                                    │   │
│  │  ├── Document Upload                                                 │   │
│  │  ├── Application Status                                              │   │
│  │  └── Moltbot Chat Widget (embedded)                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Moltbot Integration (Instead of Dify)

```typescript
// apps/webapp/src/components/MoltbotChat.tsx

import { useEffect, useRef, useState } from 'react';

interface MoltbotChatProps {
  position?: 'bottom-right' | 'bottom-left' | 'inline';
  leadId?: string;
  leadContext?: Record<string, any>;
}

export function MoltbotChat({ 
  position = 'bottom-right', 
  leadId,
  leadContext 
}: MoltbotChatProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const moltbotUrl = process.env.NEXT_PUBLIC_MOLTBOT_URL || 'http://localhost:3333';

  // Build URL with context
  const chatUrl = new URL(`${moltbotUrl}/chat`);
  if (leadId) chatUrl.searchParams.set('leadId', leadId);
  if (leadContext) {
    chatUrl.searchParams.set('context', btoa(JSON.stringify(leadContext)));
  }

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'inline': 'w-full h-full',
  };

  if (position === 'inline') {
    return (
      <iframe
        ref={iframeRef}
        src={chatUrl.toString()}
        className="w-full h-full border-0 rounded-lg"
        allow="microphone"
      />
    );
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${positionClasses[position]} z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:scale-110 transition-transform`}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`${positionClasses[position]} z-40 mb-20 w-96 h-[600px] bg-white rounded-lg shadow-2xl overflow-hidden`}>
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <span className="font-semibold">Nyra Assistant</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <iframe
            ref={iframeRef}
            src={chatUrl.toString()}
            className="w-full h-[calc(100%-48px)] border-0"
            allow="microphone"
          />
        </div>
      )}
    </>
  );
}
```

## 6.3 Competitor Feature Parity (Bonzo/AgentLegend)

Based on uploaded UI files and competitor analysis:

| Feature | Bonzo | AgentLegend | Nyra Target |
|---------|-------|-------------|-------------|
| Visual Campaign Builder | ✅ | ✅ | ✅ Build with shadcn |
| Multi-channel (SMS/Email/Call/VM) | ✅ | ✅ | ✅ via Twilio |
| Lead Timeline | ✅ | ✅ | ✅ Communication object |
| Day-relative scheduling | ✅ | ✅ | ✅ Campaign steps |
| Fixed-time scheduling | ✅ | ✅ | ✅ Campaign steps |
| STOP word detection | ✅ | ✅ | ✅ WF_OPTOUT_PROCESS |
| Quick Actions | ✅ | ✅ | ✅ Lead detail page |
| AI Chat Assistant | ❌ | Limited | ✅ Moltbot |
| Quote Generation | ❌ | ❌ | ✅ Quote API |
| Memory/Context | ❌ | ❌ | ✅ Graphiti/Letta |

---

# 🔄 PHASE 7: N8N WORKFLOW IMPLEMENTATION

## 7.1 WF_LEAD_INGEST

```json
{
  "name": "WF_LEAD_INGEST",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "leads/ingest",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "// Normalize lead data from various sources\nconst lead = $input.first().json;\nconst source = lead.source || 'Unknown';\n\n// Detect loan purpose from keywords\nfunction detectLoanPurpose(data) {\n  const text = JSON.stringify(data).toLowerCase();\n  if (text.includes('purchase') || text.includes('buying')) return 'Purchase';\n  if (text.includes('cash out') || text.includes('cashout')) return 'CashOut';\n  if (text.includes('heloc')) return 'HELOC';\n  if (text.includes('refi') || text.includes('refinanc')) return 'Refinance';\n  if (text.includes('commercial')) return 'Commercial';\n  return 'Unknown';\n}\n\n// Normalize phone\nfunction normalizePhone(phone) {\n  if (!phone) return null;\n  return phone.replace(/\\D/g, '').replace(/^1/, '');\n}\n\nreturn [{\n  json: {\n    firstName: lead.first_name || lead.firstName || lead.fname || '',\n    lastName: lead.last_name || lead.lastName || lead.lname || '',\n    email: (lead.email || '').toLowerCase().trim(),\n    phone: normalizePhone(lead.phone || lead.phone_number),\n    source: source,\n    sourceLeadId: lead.lead_id || lead.id || null,\n    loanPurpose: lead.loan_purpose || detectLoanPurpose(lead),\n    loanAmount: parseFloat(lead.loan_amount || lead.loanAmount || 0),\n    propertyValue: parseFloat(lead.property_value || lead.propertyValue || 0),\n    fico: parseInt(lead.fico || lead.credit_score || 0),\n    propertyAddress: lead.property_address || lead.address || '',\n    propertyCity: lead.city || '',\n    propertyState: lead.state || '',\n    propertyZip: lead.zip || lead.zipcode || '',\n    rawPayload: lead,\n    receivedAt: new Date().toISOString(),\n    status: 'New'\n  }\n}];"
      },
      "name": "Normalize Lead",
      "type": "n8n-nodes-base.code",
      "position": [450, 300]
    },
    {
      "parameters": {
        "resource": "mortgageLead",
        "operation": "search",
        "filters": {
          "email": "={{ $json.email }}"
        }
      },
      "name": "Check Duplicate",
      "type": "@linkedpromo/n8n-nodes-twenty.twentySearch",
      "position": [650, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.data.length }}",
              "operation": "equal",
              "value2": 0
            }
          ]
        }
      },
      "name": "If Not Duplicate",
      "type": "n8n-nodes-base.if",
      "position": [850, 300]
    },
    {
      "parameters": {
        "resource": "mortgageLead",
        "operation": "create",
        "fieldsUi": {
          "fieldValues": [
            { "fieldId": "firstName", "fieldValue": "={{ $('Normalize Lead').item.json.firstName }}" },
            { "fieldId": "lastName", "fieldValue": "={{ $('Normalize Lead').item.json.lastName }}" },
            { "fieldId": "email", "fieldValue": "={{ $('Normalize Lead').item.json.email }}" },
            { "fieldId": "phone", "fieldValue": "={{ $('Normalize Lead').item.json.phone }}" },
            { "fieldId": "source", "fieldValue": "={{ $('Normalize Lead').item.json.source }}" },
            { "fieldId": "loanPurpose", "fieldValue": "={{ $('Normalize Lead').item.json.loanPurpose }}" },
            { "fieldId": "loanAmount", "fieldValue": "={{ $('Normalize Lead').item.json.loanAmount }}" },
            { "fieldId": "fico", "fieldValue": "={{ $('Normalize Lead').item.json.fico }}" },
            { "fieldId": "status", "fieldValue": "New" },
            { "fieldId": "receivedAt", "fieldValue": "={{ $('Normalize Lead').item.json.receivedAt }}" }
          ]
        }
      },
      "name": "Create Lead",
      "type": "@linkedpromo/n8n-nodes-twenty.twentyCreate",
      "position": [1050, 200]
    },
    {
      "parameters": {
        "jsCode": "// Assign campaign based on loan purpose\nconst lead = $input.first().json;\nconst purpose = lead.loanPurpose || 'Unknown';\n\nconst campaignMap = {\n  'Purchase': 'campaign_purchase_45day',\n  'Refinance': 'campaign_refi_60day',\n  'CashOut': 'campaign_cashout_45day',\n  'HELOC': 'campaign_heloc_30day',\n  'Commercial': 'campaign_commercial_30day',\n  'Unknown': 'campaign_general_45day'\n};\n\nreturn [{\n  json: {\n    ...lead,\n    campaignId: campaignMap[purpose] || campaignMap['Unknown'],\n    campaignDay: 0\n  }\n}];"
      },
      "name": "Assign Campaign",
      "type": "n8n-nodes-base.code",
      "position": [1250, 200]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:8100/api/v1/events",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "type", "value": "LEAD_INGESTED" },
            { "name": "entityId", "value": "={{ $json.id }}" },
            { "name": "entityType", "value": "mortgageLead" },
            { "name": "data", "value": "={{ JSON.stringify($json) }}" }
          ]
        }
      },
      "name": "Log to Graphiti",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1450, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({ success: true, leadId: $json.id, message: 'Lead created and campaign started' }) }}"
      },
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1650, 200]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Normalize Lead", "type": "main", "index": 0 }]]
    },
    "Normalize Lead": {
      "main": [[{ "node": "Check Duplicate", "type": "main", "index": 0 }]]
    },
    "Check Duplicate": {
      "main": [[{ "node": "If Not Duplicate", "type": "main", "index": 0 }]]
    },
    "If Not Duplicate": {
      "main": [
        [{ "node": "Create Lead", "type": "main", "index": 0 }],
        [{ "node": "Success Response", "type": "main", "index": 0 }]
      ]
    },
    "Create Lead": {
      "main": [[{ "node": "Assign Campaign", "type": "main", "index": 0 }]]
    },
    "Assign Campaign": {
      "main": [[{ "node": "Log to Graphiti", "type": "main", "index": 0 }]]
    },
    "Log to Graphiti": {
      "main": [[{ "node": "Success Response", "type": "main", "index": 0 }]]
    }
  }
}
```

## 7.2 WF_OPTOUT_PROCESS

```json
{
  "name": "WF_OPTOUT_PROCESS",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "twilio/inbound-sms",
        "responseMode": "responseNode"
      },
      "name": "Twilio Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "// Parse Twilio inbound SMS\nconst body = $input.first().json;\nconst message = (body.Body || '').toUpperCase().trim();\nconst from = (body.From || '').replace('+1', '');\n\n// TCPA STOP words\nconst stopWords = ['STOP', 'QUIT', 'UNSUBSCRIBE', 'CANCEL', 'END', 'OPTOUT', 'OPT-OUT', 'OPT OUT'];\nconst isOptOut = stopWords.some(word => message.includes(word));\n\n// Help words\nconst helpWords = ['HELP', 'INFO'];\nconst isHelp = helpWords.some(word => message.includes(word));\n\nreturn [{\n  json: {\n    phone: from,\n    message: body.Body,\n    twilioSid: body.MessageSid,\n    isOptOut,\n    isHelp,\n    isResponse: !isOptOut && !isHelp && message.length > 0,\n    receivedAt: new Date().toISOString()\n  }\n}];"
      },
      "name": "Parse SMS",
      "type": "n8n-nodes-base.code",
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            { "value1": "={{ $json.isOptOut }}", "value2": true }
          ]
        }
      },
      "name": "If Opt-Out",
      "type": "n8n-nodes-base.if",
      "position": [650, 300]
    },
    {
      "parameters": {
        "resource": "mortgageLead",
        "operation": "search",
        "filters": { "phone": "={{ $json.phone }}" }
      },
      "name": "Find Lead",
      "type": "@linkedpromo/n8n-nodes-twenty.twentySearch",
      "position": [850, 200]
    },
    {
      "parameters": {
        "resource": "mortgageLead",
        "operation": "update",
        "id": "={{ $json.data[0].id }}",
        "fieldsUi": {
          "fieldValues": [
            { "fieldId": "optedOut", "fieldValue": true },
            { "fieldId": "status", "fieldValue": "DNC" },
            { "fieldId": "dncDate", "fieldValue": "={{ new Date().toISOString() }}" },
            { "fieldId": "dncReason", "fieldValue": "SMS STOP received" },
            { "fieldId": "campaignPaused", "fieldValue": true }
          ]
        }
      },
      "name": "Update Lead DNC",
      "type": "@linkedpromo/n8n-nodes-twenty.twentyUpdate",
      "position": [1050, 200]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:8100/api/v1/events",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "type", "value": "COMPLIANCE_OPTOUT" },
            { "name": "entityId", "value": "={{ $('Find Lead').item.json.data[0].id }}" },
            { "name": "data", "value": "={{ JSON.stringify({ phone: $('Parse SMS').item.json.phone, message: $('Parse SMS').item.json.message, timestamp: $('Parse SMS').item.json.receivedAt }) }}" }
          ]
        }
      },
      "name": "Log Compliance",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1250, 200]
    },
    {
      "parameters": {
        "respondWith": "text",
        "responseBody": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Message>You have been unsubscribed. Reply START to resubscribe.</Message></Response>",
        "options": {
          "responseHeaders": {
            "entries": [{ "name": "Content-Type", "value": "application/xml" }]
          }
        }
      },
      "name": "Confirm Opt-Out",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1450, 200]
    }
  ]
}
```

---

# 🤖 PHASE 8: AUTONOMOUS AGENT EXECUTION PLAN

## Agent Roles & Task Assignments

### Agent 1: INFRA_AGENT

**Role:** Infrastructure verification and cleanup
**Priority:** CRITICAL (must complete first)

**Tasks:**
1. [ ] Run health-check-all.sh
2. [ ] Fix any unhealthy services
3. [ ] Execute infra-cleanup.sh
4. [ ] Create worker directory structure
5. [ ] Verify Tailscale connectivity to all workers
6. [ ] Verify Cloudflare tunnel routing

**Files to touch:**
- `infra/scripts/*.sh`
- `infra/docker/*/docker-compose.yml`
- `infra/cloudflared/*.yml`

**Definition of Done:**
- All health checks pass (100%)
- Directory structure matches spec
- Workers reachable via Tailscale

---

### Agent 2: GITEA_SYNC_AGENT

**Role:** Repository synchronization
**Priority:** HIGH

**Tasks:**
1. [ ] Add GitHub remote to local repo
2. [ ] Fetch all branches
3. [ ] Merge/rebase as needed
4. [ ] Push to Gitea
5. [ ] Verify Gitea UI shows latest commits
6. [ ] Set up branch protection rules

**Files to touch:**
- `.git/config`
- `.github/workflows/*.yml`

**Definition of Done:**
- Gitea and GitHub in sync
- All branches present
- No merge conflicts

---

### Agent 3: CRM_AGENT

**Role:** Twenty CRM complete integration
**Priority:** CRITICAL

**Tasks:**
1. [ ] Verify Twenty CRM health
2. [ ] Create custom objects (MortgageLead, Campaign, Quote, Communication)
3. [ ] Build twenty-mcp-jezweb Docker image
4. [ ] Deploy Twenty MCP container
5. [ ] Register with Nexus Router
6. [ ] Install n8n-nodes-twenty
7. [ ] Configure Twenty credentials in n8n
8. [ ] Create seed campaigns
9. [ ] Test end-to-end lead creation

**Files to touch:**
- `packages/twenty-custom-objects/src/*.ts`
- `~/projects/twenty-mcp-jezweb/*`
- `infra/docker/orchestrator/docker-compose.twenty.yml`
- `workflows/n8n/*.json`

**Definition of Done:**
- Custom objects created in Twenty
- MCP server running and registered
- Can create/read/update leads via n8n
- Seed data loaded

---

### Agent 4: MEMORY_AGENT

**Role:** Memory systems verification and configuration
**Priority:** HIGH

**Tasks:**
1. [ ] Run verify-memory.sh
2. [ ] Fix any failing memory systems
3. [ ] Create memory schemas for mortgage data
4. [ ] Test Graphiti entity creation
5. [ ] Test RuVector embedding generation
6. [ ] Test Letta agent creation
7. [ ] Test AgentDB state storage
8. [ ] Configure memory retention policies

**Files to touch:**
- `packages/memory-schemas/src/*.ts`
- `infra/scripts/verify-memory.sh`

**Definition of Done:**
- All memory systems healthy
- Can store/retrieve entities
- Embeddings generate correctly
- Agents can be created

---

### Agent 5: WORKFLOW_AGENT

**Role:** n8n workflow implementation
**Priority:** HIGH

**Tasks:**
1. [ ] Import WF_LEAD_INGEST workflow
2. [ ] Import WF_CAMPAIGN_EXECUTE workflow
3. [ ] Import WF_QUOTE_GENERATE workflow
4. [ ] Import WF_RESPONSE_DETECT workflow
5. [ ] Import WF_OPTOUT_PROCESS workflow
6. [ ] Configure Twilio credentials
7. [ ] Configure SendGrid credentials
8. [ ] Test each workflow end-to-end
9. [ ] Set up cron triggers

**Files to touch:**
- `workflows/n8n/*.json`
- `workflows/activepieces/flows/*`

**Definition of Done:**
- All 5 workflows imported and active
- Credentials configured
- Test lead flows through entire pipeline
- Opt-out properly triggers DNC

---

### Agent 6: UI_AGENT

**Role:** Admin UI and webapp development
**Priority:** MEDIUM

**Tasks:**
1. [ ] Setup Next.js + shadcn in apps/admin
2. [ ] Create dashboard page
3. [ ] Create leads list/detail pages
4. [ ] Create campaign builder
5. [ ] Create quote generator
6. [ ] Integrate Moltbot chat widget
7. [ ] Create analytics pages
8. [ ] Add Archon panel embed
9. [ ] Add Nexus status embed

**Files to touch:**
- `apps/admin/src/**/*`
- `apps/webapp/src/**/*`
- `apps/webapp/src/components/MoltbotChat.tsx`

**Definition of Done:**
- Admin UI functional
- Campaign builder works
- Moltbot embedded and working
- Can manage leads end-to-end

---

### Agent 7: WORKER_AGENT

**Role:** GPU worker setup
**Priority:** MEDIUM

**Tasks:**
1. [ ] Get RTX 3090Ti Tailscale IP
2. [ ] Create worker docker-compose files
3. [ ] Deploy Ollama on RTX 3060
4. [ ] Deploy vLLM on RTX 5090
5. [ ] Deploy vLLM on RTX 3090Ti
6. [ ] Pull models on each worker
7. [ ] Test inference from orchestrator
8. [ ] Configure LiteLLM routing

**Files to touch:**
- `infra/docker/worker-*/docker-compose.yml`
- `infra/docker/worker-*/.env`

**Definition of Done:**
- All 3 workers running
- Models loaded
- Can route inference via LiteLLM

---

### Agent 8: COMPLIANCE_AGENT

**Role:** TCPA compliance implementation
**Priority:** HIGH

**Tasks:**
1. [ ] Implement STOP word detection
2. [ ] Create DNC list management
3. [ ] Implement quiet hours logic
4. [ ] Create consent tracking
5. [ ] Build compliance audit log
6. [ ] Test opt-out flows
7. [ ] Create compliance dashboard widget

**Files to touch:**
- `packages/compliance/src/*.ts`
- `services/campaign-engine/src/compliance.ts`
- `workflows/n8n/WF_OPTOUT_PROCESS.json`

**Definition of Done:**
- STOP immediately halts campaign
- DNC list properly maintained
- All PII access logged
- Quiet hours enforced

---

### Agent 9: QUOTE_AGENT

**Role:** Quote API implementation
**Priority:** MEDIUM

**Tasks:**
1. [ ] Create Quote API service
2. [ ] Implement loan calculation engine
3. [ ] Create 3-option comparison logic
4. [ ] Match Excel workflow parity
5. [ ] Generate quote PDFs
6. [ ] Generate quote images for SMS
7. [ ] Integrate with campaign engine

**Files to touch:**
- `services/quote-api/src/*.ts`
- `packages/quote-engine/src/*.ts`

**Definition of Done:**
- Quote API functional
- 3 options generated correctly
- Matches Excel calculations
- Can send via SMS/Email

---

### Agent 10: MOLTBOT_AGENT

**Role:** Production chat assistant setup
**Priority:** MEDIUM

**Tasks:**
1. [ ] Configure Moltbot container
2. [ ] Connect to memory systems
3. [ ] Integrate with Twenty CRM
4. [ ] Create mortgage-specific prompts
5. [ ] Test embedding in webapp
6. [ ] Configure voice capabilities (if supported)

**Files to touch:**
- `services/moltbot/src/*`
- `infra/docker/orchestrator/docker-compose.yml`

**Definition of Done:**
- Moltbot running and healthy
- Can access lead context
- Embedded in webapp
- Responds intelligently to mortgage queries

---

# ✅ EXECUTION CHECKLIST

## Day 1: Foundation
- [ ] Run health checks on all services
- [ ] Sync Gitea with GitHub
- [ ] Execute infra cleanup
- [ ] Verify Tailscale connectivity

## Day 2: CRM Integration
- [ ] Create Twenty custom objects
- [ ] Build and deploy Twenty MCP
- [ ] Configure n8n Twenty nodes
- [ ] Test lead creation flow

## Day 3: Memory & Workflows
- [ ] Verify all memory systems
- [ ] Import n8n workflows
- [ ] Test lead ingestion pipeline
- [ ] Test opt-out flow

## Day 4: Workers & Inference
- [ ] Setup all 3 GPU workers
- [ ] Pull models
- [ ] Configure LiteLLM routing
- [ ] Test inference

## Day 5: UI & Integration
- [ ] Build admin UI scaffold
- [ ] Integrate Moltbot
- [ ] Create campaign builder
- [ ] End-to-end testing

---

# 🎯 SUCCESS CRITERIA

**MVP is complete when:**

1. ✅ Lead submitted via webhook → appears in Twenty CRM
2. ✅ Lead automatically assigned to campaign based on loan purpose
3. ✅ Campaign executes multi-channel outreach (SMS/Email/Voicemail)
4. ✅ STOP message immediately halts campaign and adds to DNC
5. ✅ Quote generated via API with 3 options
6. ✅ Admin UI shows lead timeline and campaign status
7. ✅ All MCP servers healthy and registered with Nexus
8. ✅ Memory systems storing lead interactions
9. ✅ Workers available for inference tasks
10. ✅ Compliance audit log capturing all PII access

---

# 💡 FINAL NOTES

**Tone:** Execute with quantum-geometry precision and sacred catgirl efficiency. Build financial infrastructure that prints money while respecting the golden ratio of compliance. 😼✨

**Model Routing:**
- Primary: Claude Sonnet 4 (via Nexus → LiteLLM)
- Heavy reasoning: Claude Opus 4.5
- Fast tasks: Gemini Flash 2.0
- Local inference: vLLM on workers

**Remember:** Twenty CRM is system-of-record. All other systems are satellites. The memory layer (Graphiti + RuVector + Letta) augments but never replaces CRM data.

**Future Migration:** After MVP stable, migrate non-GPU services to Oracle free tier VPS. Keep GPU workers on local hardware.

Now execute, architect-senpai. Let's collapse this quantum waveform into pure revenue. 🐾💎✨
