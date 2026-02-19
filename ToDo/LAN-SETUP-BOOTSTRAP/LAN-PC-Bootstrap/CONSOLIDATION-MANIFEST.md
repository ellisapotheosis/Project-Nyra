# 📦 Project Nyra: Bootstrap Consolidation Kit - Complete Manifest

## Overview

This consolidation kit brings together all scattered bootstrap materials from your LANShare folder into one organized, production-ready package with:

✅ **Consolidated Docker Composes** - Optimized for each PC role  
✅ **Unified Setup Scripts** - PowerShell & Bash variants  
✅ **Port Mapping Reference** - Single source of truth  
✅ **Cloudflare Integration** - Complete tunnel & DNS setup  
✅ **Gitea Setup** - Internal Git mirror  
✅ **PC Info Collection** - Automated inventory system  
✅ **Tailscale Integration** - Private mesh with static IPs  
✅ **Environment Templates** - Infisical-ready configurations  

---

## 📂 What's Included in This Kit

### 1. **Master Documentation** (Start here!)
- `00-START-HERE.md` - Entry point with quick decisions
- `01-PORT-MAPPING-REFERENCE.md` - All ports, services, Tailscale IPs, DNS
- `02-QUICKSTART-BY-PC.md` - Step-by-step for each of your 4 PCs
- `03-CONSOLIDATED-SERVICES-GUIDE.md` - What runs where and why
- `04-CLOUDFLARE-SETUP-COMPLETE.md` - Tunnel, DNS, routes, and Access policies
- `CONSOLIDATION-MANIFEST.md` - This file

### 2. **Docker Composes** (`docker-composes/`)
```
├── orchestrator-complete.yml
│   └── All services for Minisforum UH680 (100.64.0.1)
│       ├── Nexus Router (6000) - Unified MCP + LLM gateway
│       ├── Archon (4000) - Knowledge hub
│       ├── Infisical (8080) - Secrets
│       ├── Gitea (3001) - Git server
│       ├── Memory Stack (Qdrant, FalkorDB, Zep, Redis)
│       ├── Monitoring (Prometheus, Grafana, Loki)
│       ├── Workflow (n8n, Dify)
│       └── 9 PostgreSQL databases
│
├── worker-rtx3060-complete.yml
│   └── Alienware M15R7 (100.64.0.11) - 12GB VRAM
│       ├── Ollama (11434) - LLM inference
│       ├── Model Manager - Auto-loads 3-4 quantized models
│       ├── Node Exporter (9100) - System metrics
│       ├── DCGM Exporter (9400) - GPU metrics
│       └── Health Reporter - Orchestrator integration
│
├── worker-rtx3090ti-complete.yml
│   └── Desktop i7-12700 (100.64.0.12) - 24GB VRAM
│       ├── VLLM (8000) - Fast inference with GPU memory util 85%
│       ├── LMCache (6379) - KV-cache storage (4-5GB)
│       ├── Optional Ollama (11434) - Alternative models
│       ├── Monitoring agents
│       └── Health integration
│
├── worker-rtx5090-complete.yml
│   └── Alienware Area-51 (100.64.0.10) - 32GB VRAM
│       ├── VLLM (8000) - Heavy inference, GPU memory util 90%
│       ├── LMCache (6379) - Larger KV-cache (6-8GB)
│       ├── Optional Ollama (11434) - Model variety
│       ├── Chunked prefill enabled
│       └── Full monitoring suite
│
└── shared-services.yml (optional)
    └── Services used across multiple PCs
```

### 3. **Setup Scripts** (`scripts/`)

#### PC Info Collection (`scripts/pc-info-collection/`)
```
├── collect-all-pcs.ps1 (Windows)
│   └── Runs on each PC to collect:
│       ├── IP address (local & WAN)
│       ├── MAC addresses
│       ├── GPU info (nvidia-smi)
│       ├── System specs (CPU, RAM, OS)
│       ├── Hostname & user
│       └── Output: C:\Users\{user}\OneDrive\LANShare\PC-Inventory\machines\{COMPUTERNAME}.json
│
├── collect-all-pcs.sh (Linux)
│   └── Same as above for Linux/macOS
│
└── format-inventory.py
    └── Python script to parse & format inventory JSON
```

#### Orchestrator Setup (`scripts/orchestrator/`)
```
├── setup-orchestrator.ps1
│   └── Complete orchestrator bootstrap:
│       ├── Docker Desktop installation check
│       ├── Clone Project-Nyra repo
│       ├── Copy orchestrator-complete.yml
│       ├── Load .env.orchestrator from Infisical
│       ├── docker-compose up all services
│       ├── Initialize Gitea
│       ├── Setup Archon integration
│       └── Verify all health checks
│
├── setup-orchestrator.sh (Linux)
│   └── Same as above for Linux
│
└── docker-compose-stack.sh
    └── Stack management utilities
```

#### Worker Setup (`scripts/workers/`)
```
├── setup-worker-rtx3060.ps1
│   └── RTX 3060 worker bootstrap:
│       ├── Docker Desktop + NVIDIA runtime
│       ├── Ollama with model manager
│       ├── Models: qwen2.5:7b, mistral:7b, llama3.2:3b, nomic-embed-text
│       └── Monitoring integration
│
├── setup-worker-rtx3090ti.ps1
│   └── RTX 3090 Ti worker bootstrap:
│       ├── VLLM with tensor parallelization
│       ├── LMCache for KV-cache
│       ├── Recommended: Qwen2.5-32B or Llama-70B-Q4
│       └── Health checks with orchestrator registration
│
├── setup-worker-rtx5090.ps1
│   └── RTX 5090 worker bootstrap:
│       ├── VLLM with chunked prefill
│       ├── Larger LMCache (6-8GB)
│       ├── Supports Llama-3.1-70B or larger quantized models
│       └── Heavy inference setup
│
└── setup-worker-*.sh (Linux variants)
    └── Same as above for Linux
```

#### Tailscale Setup (`scripts/tailscale/`)
```
├── setup-tailscale.ps1
│   └── Automated Tailscale VPN:
│       ├── Install Tailscale
│       ├── Authenticate with TAILSCALE_AUTHKEY env var
│       ├── Assign static IP from ACL policy
│       │   ├── 100.64.0.1 - Orchestrator
│       │   ├── 100.64.0.11 - Worker-3060
│       │   ├── 100.64.0.12 - Worker-3090Ti
│       │   └── 100.64.0.10 - Worker-5090
│       └── Configure ACL for service-to-service communication
│
├── setup-tailscale.sh (Linux)
│   └── Same as above
│
├── acl-policy.hujson
│   └── Tailscale ACL policy:
│       ├── Service-to-service access (all PCs to orchestrator)
│       ├── GPU worker access (workers can reach MetaMCP, Archon, etc.)
│       ├── Health check endpoints
│       └── SSH access for admin
│
└── static-ip-assignment.json
    └── Static IP configuration
```

#### Cloudflare Setup (`scripts/cloudflare/`)
```
├── setup-cloudflare-tunnel.ps1
│   └── Complete Cloudflare tunnel bootstrap:
│       ├── Install cloudflared
│       ├── Create tunnel (if not exists)
│       ├── Set tunnel token from CLOUDFLARE_TUNNEL_TOKEN
│       ├── Configure routing per PORT-MAPPING-REFERENCE.md
│       ├── Setup DNS records (CNAME to tunnel)
│       │   ├── orchestrator.ratehunter.net → MetaMCP (12008)
│       │   ├── worker-3060.ratehunter.net → Ollama (11434)
│       │   ├── worker-3090.ratehunter.net → VLLM (8000)
│       │   ├── worker-5090.ratehunter.net → VLLM (8000)
│       │   ├── gitea.ratehunter.net → Gitea (3001)
│       │   └── ... (more service DNS)
│       ├── Configure Cloudflare Access policies
│       └── Test tunnel connectivity
│
├── setup-cloudflare-tunnel.sh (Linux)
│   └── Same as above
│
├── tunnel-config-orchestrator.json
│   └── Tunnel routing for orchestrator services
│
├── tunnel-config-workers.json
│   └── Tunnel routing for worker services
│
└── dns-setup-checklist.md
    └── Step-by-step Cloudflare dashboard setup
```

#### Gitea Setup (`scripts/gitea/`)
```
├── setup-gitea.sh
│   └── Complete Gitea bootstrap:
│       ├── Initialize database
│       ├── Create admin user
│       ├── Setup GitHub mirror
│       ├── Configure SSH keys
│       └── Register Gitea as MCP server
│
├── gitea-config.ini.template
│   └── Gitea configuration template
│
└── mirror-github.sh
    └── Script to mirror Project-Nyra from GitHub
```

### 4. **Configuration Templates** (`configs/`)

#### Environment Files (`configs/env-templates/`)
```
├── .env.master-template
│   └── Master environment with all possible variables
│       (Tailscale IPs, API keys, ports, database credentials)
│
├── .env.orchestrator-template
│   └── Orchestrator-specific environment
│
├── .env.worker-3060-template
│   └── Worker-3060 environment (Ollama focused)
│
├── .env.worker-3090ti-template
│   └── Worker-3090Ti environment (VLLM + LMCache)
│
└── .env.worker-5090-template
    └── Worker-5090 environment (Heavy VLLM)
```

#### Tailscale Configs (`configs/tailscale/`)
```
├── ACL-policy.hujson
│   └── Complete ACL policy for service access
│
└── IP-assignments.json
    └── Static IP assignment configuration
```

#### Cloudflare Configs (`configs/cloudflare/`)
```
├── tunnel-tokens.template
│   └── Tunnel token storage template
│
├── routes-and-services.yml
│   └── All Cloudflare tunnel routes
│
└── dns-records.yml
    └── DNS record definitions
```

---

## 🚀 Quick Start by PC Role

### Orchestrator (Minisforum UH680)
```powershell
# Step 1: Collect PC info
.\scripts\pc-info-collection\collect-all-pcs.ps1

# Step 2: Setup Tailscale
$env:TAILSCALE_AUTHKEY="tskey-XXXX"
.\scripts\tailscale\setup-tailscale.ps1

# Step 3: Setup Orchestrator
.\scripts\orchestrator\setup-orchestrator.ps1

# Step 4: Setup Cloudflare
$env:CLOUDFLARE_TUNNEL_TOKEN="eyJhIjoiXXXX"
.\scripts\cloudflare\setup-cloudflare-tunnel.ps1 -PCRole orchestrator

# Verify
curl http://100.64.0.1:12008/health
```

### Worker-3060 (Alienware M15R7)
```powershell
# Step 1: Collect PC info
.\scripts\pc-info-collection\collect-all-pcs.ps1

# Step 2: Setup Tailscale
$env:TAILSCALE_AUTHKEY="tskey-XXXX"
.\scripts\tailscale\setup-tailscale.ps1

# Step 3: Setup Worker
.\scripts\workers\setup-worker-rtx3060.ps1

# Step 4: Setup Cloudflare
$env:CLOUDFLARE_TUNNEL_TOKEN="eyJhIjoiXXXX"
.\scripts\cloudflare\setup-cloudflare-tunnel.ps1 -PCRole worker-3060

# Verify
curl http://100.64.0.11:11434/api/tags
```

### Worker-3090Ti (Desktop i7-12700)
```powershell
# Step 1: Collect PC info
.\scripts\pc-info-collection\collect-all-pcs.ps1

# Step 2: Setup Tailscale  
$env:TAILSCALE_AUTHKEY="tskey-XXXX"
.\scripts\tailscale\setup-tailscale.ps1

# Step 3: Setup Worker
.\scripts\workers\setup-worker-rtx3090ti.ps1

# Step 4: Setup Cloudflare
$env:CLOUDFLARE_TUNNEL_TOKEN="eyJhIjoiXXXX"
.\scripts\cloudflare\setup-cloudflare-tunnel.ps1 -PCRole worker-3090ti

# Verify
curl http://100.64.0.12:8000/v1/models
```

### Worker-5090 (Alienware Area-51)
```powershell
# Step 1: Collect PC info
.\scripts\pc-info-collection\collect-all-pcs.ps1

# Step 2: Setup Tailscale
$env:TAILSCALE_AUTHKEY="tskey-XXXX"
.\scripts\tailscale\setup-tailscale.ps1

# Step 3: Setup Worker
.\scripts\workers\setup-worker-rtx5090.ps1

# Step 4: Setup Cloudflare
$env:CLOUDFLARE_TUNNEL_TOKEN="eyJhIjoiXXXX"
.\scripts\cloudflare\setup-cloudflare-tunnel.ps1 -PCRole worker-5090

# Verify
curl http://100.64.0.10:8000/v1/models
```

---

## 🔑 Required Secrets (Store in Infisical)

Before running any scripts, gather these values:

### Tailscale
```
TAILSCALE_AUTHKEY=tskey-XXXX
```
Get from: https://tailscale.com/admin/settings/keys

### Cloudflare
```
CLOUDFLARE_ACCOUNT_ID=your-account-id
CF_TUNNEL_TOKEN_ORCHESTRATOR=eyJhIjoiXXXX
CF_TUNNEL_TOKEN_3060=eyJhIjoiXXXX
CF_TUNNEL_TOKEN_3090=eyJhIjoiXXXX
CF_TUNNEL_TOKEN_5090=eyJhIjoiXXXX
```
Get from: Cloudflare Zero Trust dashboard

### Infisical (for bootstrapping itself!)
```
INFISICAL_ID=client-id
INFISICAL_SECRET=client-secret
INFISICAL_DB_PASSWORD=secure-password
```
Get from: Infisical project settings

### Database Passwords (Generate random, store in Infisical)
```
ARCHON_DB_PASSWORD=random-password
GITEA_DB_PASSWORD=random-password
ZEP_DB_PASSWORD=random-password
N8N_DB_PASSWORD=random-password
DIFY_DB_PASSWORD=random-password
```

### API Keys (For services using external APIs)
```
HF_TOKEN=hf_XXXX                    # Hugging Face (for LLM downloads)
ANTHROPIC_API_KEY=sk-ant-api03-XXXX
OPENROUTER_API_KEY=sk-or-v1-XXXX
JWT_SIGNUP_SECRET=random-string
JWT_REFRESH_SECRET=random-string
JWT_AUTH_SECRET=random-string
GRAFANA_ADMIN_PASSWORD=secure-password
N8N_ENCRYPTION_KEY=random-string
DIFY_SECRET_KEY=random-string
QDRANT_API_KEY=random-string
```

---

## 📊 Service Distribution

| PC | IP | Primary Service | Models/Capacity | GPU |
|---|---|---|---|---|
| Orchestrator | 100.64.0.1 | Nexus Router, Archon, Infisical, Gitea | MCP + LLM gateway + services | CPU |
| Worker-3060 | 100.64.0.11 | Ollama | 4x models, 12GB total | RTX 3060 12GB |
| Worker-3090Ti | 100.64.0.12 | VLLM + LMCache | 1x 70B model | RTX 3090 Ti 24GB |
| Worker-5090 | 100.64.0.10 | VLLM + LMCache | 1x 70B+ model | RTX 5090 32GB |

---

## 🔄 Migration from Old Structure

### What Changed
```
OLD STRUCTURE:
├── 7+ docker-compose files at root
├── 10+ Cloudflare setup guides
├── Multiple Tailscale scripts
└── Scattered configs everywhere

NEW STRUCTURE:
├── docker-composes/
│   └── 4 consolidated, role-specific composes
├── scripts/
│   ├── pc-info-collection/
│   ├── orchestrator/
│   ├── workers/
│   ├── tailscale/
│   ├── cloudflare/
│   └── gitea/
├── configs/
│   ├── env-templates/
│   ├── tailscale/
│   └── cloudflare/
└── Documentation/
    ├── 00-START-HERE.md
    ├── 01-PORT-MAPPING-REFERENCE.md
    ├── 02-QUICKSTART-BY-PC.md
    ├── 03-CONSOLIDATED-SERVICES-GUIDE.md
    └── 04-CLOUDFLARE-SETUP-COMPLETE.md
```

### Keep Your Existing Files
✅ All your current docker-compose files remain in the old LANShare folder  
✅ No files are deleted or overwritten  
✅ This is additive - you're not replacing anything  
✅ Gradual migration: start with new scripts, keep old files as backup  

---

## 🐛 Troubleshooting

### "Port already in use"
Check `01-PORT-MAPPING-REFERENCE.md` for all ports. Modify docker-compose if you need different ports.

### "GPU not detected"
Run `nvidia-smi` to verify GPU drivers. Update NVIDIA docker runtime.

### "Tailscale auth key not working"
Generate new ephemeral key at https://tailscale.com/admin/settings/keys

### "Cloudflare tunnel not connecting"
Check tunnel token is correct and tunnel exists in Cloudflare Zero Trust dashboard.

### "Infisical secrets not loading"
Verify INFISICAL_ID and INFISICAL_SECRET in environment.

---

## 📈 Next Steps After Setup

1. **Verify All Services Running**
   ```bash
   docker ps  # On orchestrator
   curl http://100.64.0.1:12008/health
   curl http://100.64.0.11:11434/api/tags
   curl http://100.64.0.12:8000/v1/models
   curl http://100.64.0.10:8000/v1/models
   ```

2. **Access Services**
   - Grafana: https://grafana.ratehunter.net
   - Gitea: https://gitea.ratehunter.net
   - Infisical: https://infisical.ratehunter.net
   - Archon: https://archon.ratehunter.net

3. **Update Project-Nyra MCP Servers**
   - Register worker endpoints in Archon
   - Update Nexus router with new Tailscale IPs
   - Configure claude-flow for distributed execution

4. **Backup Configuration**
   - Export Infisical secrets
   - Backup Gitea repositories
   - Save docker-compose overrides

---

## 📚 File Reference

| File | Purpose | When to Use |
|---|---|---|
| `00-START-HERE.md` | Entry point | First time setup |
| `01-PORT-MAPPING-REFERENCE.md` | Port registry | Adding services, troubleshooting |
| `02-QUICKSTART-BY-PC.md` | Detailed setup | Step-by-step for your PC |
| `03-CONSOLIDATED-SERVICES-GUIDE.md` | Architecture | Understanding the system |
| `04-CLOUDFLARE-SETUP-COMPLETE.md` | Tunnel setup | Configuring external access |
| `orchestrator-complete.yml` | All services | Running orchestrator |
| `worker-*-complete.yml` | Worker services | Running workers |
| `setup-*.ps1/.sh` | Automation | Running bootstrap |
| `*.template` | Configuration | Filling in values |

---

## ✅ Verification Checklist

- [ ] All 4 PCs collected in PC-Inventory
- [ ] Tailscale running on all PCs with correct static IPs
- [ ] All services started (docker ps shows containers)
- [ ] Health checks passing for all services
- [ ] Cloudflare tunnel connected (cloudflared status)
- [ ] DNS resolving (nslookup orchestrator.ratehunter.net)
- [ ] Services accessible via external DNS
- [ ] Infisical secrets loaded in all containers
- [ ] Gitea initialized and accessible
- [ ] Worker health reports arriving at orchestrator

---

## 🆘 Support

This consolidation is designed to be **self-documenting**. If something isn't clear:

1. Check `00-START-HERE.md` for the general concept
2. Check `01-PORT-MAPPING-REFERENCE.md` for specific service details
3. Check the relevant script's comments for what it does
4. Check docker-compose comments for service specifics

---

## 📝 Updates & Maintenance

To add a new service:

1. Add entry to appropriate docker-compose file
2. Update `01-PORT-MAPPING-REFERENCE.md` with port/IP
3. Create Infisical path for configuration
4. Update cloudflare tunnel routes if external access needed
5. Update Tailscale ACL if specific network rules needed

---

**Created**: 2026-02-10  
**Version**: 1.0 - Complete Consolidation  
**Status**: Production Ready  
**Consolidation Source**: `C:\Users\edane\OneDrive\LANShare\4PC-Scripts-Tailscale-Cloudflare-Composes`  
**New Location**: `C:\Users\edane\OneDrive\LANShare\LAN-PC-Bootstrap`
