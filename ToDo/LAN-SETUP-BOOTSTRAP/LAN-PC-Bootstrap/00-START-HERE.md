# 🚀 Project Nyra: LAN PC Bootstrap - START HERE

Welcome! This consolidated bootstrap kit provides everything needed to set up your 4-PC distributed infrastructure with orchestrator + 3 GPU workers.

## 📋 What This Kit Provides

- **Consolidated Docker Composes**: Optimized for each PC role (Orchestrator, RTX 3060, RTX 3090 Ti, RTX 5090)
- **Automated PC Info Collection**: Single script that inventories all PC specs, IPs, MACs, and GPUs
- **Tailscale Integration**: Private mesh network with pre-configured static IPs
- **Cloudflare Tunnels**: Secure access to your services via ratehunter.net
- **Gitea Setup**: Internal Git mirror for LAN-fast clones
- **Nexus Router (Grafbase)**: Unified MCP + LLM gateway for distributed AI workloads
- **Complete Port Reference**: All services mapped to ports, Tailscale IPs, and Cloudflare routes

## 🎯 Quick Decision: Which PC Are You Setting Up?

Choose your PC role to get the right quickstart:

### 1️⃣ Orchestrator (Minisforum UH680 - Ryzen 7 6800H)
Runs the central control plane: MetaMCP, Archon, Infisical, Gitea, Memory stack, monitoring
```powershell
# Windows setup
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\orchestrator\setup-orchestrator.ps1
```

### 2️⃣ Worker-RTX3060 (Alienware M15R7 Laptop)
GPU worker for embeddings and smaller models: Ollama with 3-4 quantized models
```powershell
# Windows setup
.\scripts\workers\setup-worker-rtx3060.ps1
```

### 3️⃣ Worker-RTX3090 Ti (Desktop, i7-12700)
GPU worker for medium-large models: VLLM + LMCache with 24GB VRAM
```powershell
# Windows setup
.\scripts\workers\setup-worker-rtx3090ti.ps1
```

### 4️⃣ Worker-RTX5090 (Alienware Area-51 Laptop)
GPU worker for heavy inference: VLLM + LMCache optimized for 32GB VRAM
```powershell
# Windows setup
.\scripts\workers\setup-worker-rtx5090.ps1
```

## 📁 Folder Structure

```
LAN-PC-Bootstrap/
├── 00-START-HERE.md (this file)
├── 01-PORT-MAPPING-REFERENCE.md ← Check this for all service ports
├── 02-QUICKSTART-BY-PC.md ← Detailed setup for each PC
├── 03-CONSOLIDATED-SERVICES-GUIDE.md ← What runs where
├── 04-CLOUDFLARE-SETUP-COMPLETE.md ← Tunnel and DNS setup
│
├── docker-composes/
│   ├── orchestrator-complete.yml
│   ├── worker-rtx3060-complete.yml (Ollama optimized)
│   ├── worker-rtx3090ti-complete.yml (VLLM + LMCache)
│   ├── worker-rtx5090-complete.yml (VLLM + LMCache heavy)
│   └── shared-services.yml (Infisical, Memory, monitoring)
│
├── scripts/
│   ├── pc-info-collection/
│   │   ├── collect-all-pcs.ps1 (Windows master script)
│   │   ├── collect-all-pcs.sh (Linux master script)
│   │   └── format-inventory.py
│   │
│   ├── orchestrator/
│   │   ├── setup-orchestrator.ps1
│   │   ├── setup-orchestrator.sh
│   │   └── docker-compose-stack.sh
│   │
│   ├── workers/
│   │   ├── setup-worker-rtx3060.ps1
│   │   ├── setup-worker-rtx3090ti.ps1
│   │   ├── setup-worker-rtx5090.ps1
│   │   └── setup-worker-*.sh (Linux variants)
│   │
│   ├── tailscale/
│   │   ├── setup-tailscale.ps1
│   │   ├── setup-tailscale.sh
│   │   ├── acl-policy.hujson
│   │   └── static-ip-assignment.json
│   │
│   ├── cloudflare/
│   │   ├── setup-cloudflare-tunnel.ps1
│   │   ├── setup-cloudflare-tunnel.sh
│   │   ├── tunnel-config-orchestrator.json
│   │   ├── tunnel-config-workers.json
│   │   └── dns-setup-checklist.md
│   │
│   └── gitea/
│       ├── setup-gitea.sh
│       ├── gitea-config.ini.template
│       └── mirror-github.sh
│
└── configs/
    ├── env-templates/
    │   ├── .env.master-template
    │   ├── .env.orchestrator-template
    │   ├── .env.worker-3060-template
    │   ├── .env.worker-3090ti-template
    │   └── .env.worker-5090-template
    │
    ├── tailscale/
    │   ├── ACL-policy.hujson
    │   └── IP-assignments.json
    │
    └── cloudflare/
        ├── tunnel-tokens.template
        ├── routes-and-services.yml
        └── dns-records.yml
```

## ⚡ 5-Minute Quick Start (If You Know What You're Doing)

### Step 1: Collect PC Information
```powershell
# On each PC, run this first to inventory
.\scripts\pc-info-collection\collect-all-pcs.ps1
# Output: C:\Users\{user}\OneDrive\LANShare\PC-Inventory\machines\{COMPUTERNAME}.json
```

### Step 2: Setup Tailscale (All PCs)
```powershell
# Sets up private mesh network
$env:TAILSCALE_AUTHKEY="tskey-xxxxx" # Get from tailscale.com/admin/settings/keys
.\scripts\tailscale\setup-tailscale.ps1
```

### Step 3: Start Services (Role-Specific)
```powershell
# Choose based on your PC:
.\scripts\orchestrator\setup-orchestrator.ps1       # Orchestrator
.\scripts\workers\setup-worker-rtx3060.ps1         # Worker-3060
.\scripts\workers\setup-worker-rtx3090ti.ps1       # Worker-3090ti
.\scripts\workers\setup-worker-rtx5090.ps1         # Worker-5090
```

### Step 4: Setup Cloudflare Tunnels
```powershell
# After services are running
.\scripts\cloudflare\setup-cloudflare-tunnel.ps1 `
  -PCRole orchestrator `
  -TunnelToken "eyJhIjoixxxxx"
```

### Step 5: Verify Connection
```powershell
# Check services are responding
ping orchestrator-mini.tailsca1e.ts.net
curl http://100.64.0.1:12008/health  # MetaMCP health check
```

## 📋 Checklist Before You Start

- [ ] You have Windows 11 with Docker Desktop installed on all PCs
- [ ] Each PC has NVIDIA GPU drivers installed and working (`nvidia-smi` shows your GPU)
- [ ] You have a Tailscale account (free at tailscale.com)
- [ ] You have a Cloudflare account with your ratehunter.net domain
- [ ] You have Infisical project created with basic secrets
- [ ] You've generated Tailscale auth key for automated setup
- [ ] You have Cloudflare tunnel tokens ready (or will create them)

## 🔑 Environment Variables You'll Need

Before running scripts, gather these values (store securely):

```
TAILSCALE_AUTHKEY=tskey-xxxxx          # From Tailscale admin
HF_TOKEN=hf_xxxxx                      # Hugging Face (for LLM downloads)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx   # Anthropic
INFISICAL_ID=client-id                 # From Infisical
INFISICAL_SECRET=client-secret         # From Infisical
CLOUDFLARE_ACCOUNT_ID=xxxxx            # From Cloudflare
CF_TUNNEL_TOKEN_ORCHESTRATOR=eyJ...    # Generated per tunnel
CF_TUNNEL_TOKEN_3060=eyJ...
CF_TUNNEL_TOKEN_3090=eyJ...
CF_TUNNEL_TOKEN_5090=eyJ...
```

## 📖 Next: Choose Your Path

| You Want To... | Read This First |
|---|---|
| Set up the Orchestrator PC | [`02-QUICKSTART-BY-PC.md`](#) → Orchestrator Section |
| Set up Worker-3060 (Ollama) | [`02-QUICKSTART-BY-PC.md`](#) → Worker-3060 Section |
| Understand port mappings | [`01-PORT-MAPPING-REFERENCE.md`](#) |
| Set up Cloudflare tunnels | [`04-CLOUDFLARE-SETUP-COMPLETE.md`](#) |
| See what runs on which PC | [`03-CONSOLIDATED-SERVICES-GUIDE.md`](#) |
| Understand the full architecture | [`docs/ARCHITECTURE.md`](#) |

## 🆘 Troubleshooting

**"docker-compose not found"**: Install Docker Desktop for Windows
**"nvidia-smi not found"**: Install NVIDIA GPU drivers
**"Tailscale auth key not working"**: Generate new key at tailscale.com/admin/settings/keys
**"Cloudflare tunnel failing"**: Check tunnel token in [`01-PORT-MAPPING-REFERENCE.md`](#)

## 📝 What Happens When You Run Setup Scripts

1. ✅ Collects PC information (IP, MAC, GPU specs)
2. ✅ Installs Docker Desktop (if needed)
3. ✅ Installs Tailscale VPN
4. ✅ Sets up static IP in Tailscale mesh
5. ✅ Clones Project-Nyra repository
6. ✅ Starts appropriate docker-compose for your PC role
7. ✅ Configures Cloudflare tunnel (with your token)
8. ✅ Registers worker with orchestrator (on worker PCs)

## 🎓 Learning Path

**First-timers**: Read [`02-QUICKSTART-BY-PC.md`](#) for your PC role
**Advanced**: Jump to specific sections in individual setup scripts
**Integration**: Check [`04-CLOUDFLARE-SETUP-COMPLETE.md`](#) for external routing

## 💡 Pro Tips

1. **Run PC info collection first**: This creates the inventory index that other scripts use
2. **Tailscale before Docker**: VPN should be up before services connect to each other
3. **Test Tailscale connection**: `ping orchestrator-mini.tail scale.ts.net` before troubleshooting Docker
4. **Port conflicts**: Check [`01-PORT-MAPPING-REFERENCE.md`](#) if you modify services
5. **Secrets in Infisical**: All sensitive values should be stored there, not in .env files

## 🚀 You're Ready!

1. Pick your PC role above
2. Open the corresponding setup script in `scripts/{role}/`
3. Review the script before running (always good practice)
4. Open PowerShell as Administrator
5. Run the setup script
6. Grab a coffee ☕ while it deploys!

---

**Last Updated**: 2026-02-10
**Version**: 1.0 (Complete Consolidation)
**Status**: Production-Ready
