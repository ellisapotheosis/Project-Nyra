# Project Nyra - 4-PC Distributed Architecture

## 🏗️ Architecture Overview

A distributed AI development environment leveraging 4 PCs: 1 orchestrator + 3 GPU workers.

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR PC (Mini PC)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Gitea Server (Port 3000)                              │ │
│  │  - Private Git repositories                            │ │
│  │  - Webhook integration                                 │ │
│  │  - CI/CD runners                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Cloudflared Tunnel                                    │ │
│  │  - Public access: gitea.yourdomain.com                 │ │
│  │  - Zero-trust security                                 │ │
│  │  - No port forwarding needed                           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tailscale Mesh (100.x.x.1)                            │ │
│  │  - Secure LAN communication                            │ │
│  │  - Zero-config VPN                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Claude-Flow Orchestration                             │ │
│  │  - Multi-agent coordination                            │ │
│  │  - Task distribution                                   │ │
│  │  - Swarm management                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼─────────┐
│   GPU PC #1    │  │   GPU PC #2    │  │   GPU PC #3    │
│  (Worker Node) │  │  (Worker Node) │  │  (Worker Node) │
├────────────────┤  ├────────────────┤  ├────────────────┤
│ Tailscale IP:  │  │ Tailscale IP:  │  │ Tailscale IP:  │
│ 100.x.x.2      │  │ 100.x.x.3      │  │ 100.x.x.4      │
│                │  │                │  │                │
│ - Claude Code  │  │ - Claude Code  │  │ - Claude Code  │
│ - Git client   │  │ - Git client   │  │ - Git client   │
│ - Local LLM    │  │ - Local LLM    │  │ - Local LLM    │
│ - GPU compute  │  │ - GPU compute  │  │ - GPU compute  │
│ - Agent runner │  │ - Agent runner │  │ - Agent runner │
└────────────────┘  └────────────────┘  └────────────────┘
```

## 🎯 Design Philosophy

### Local-First with Cloud Backup
- **Primary**: Local Gitea on orchestrator PC
- **Secondary**: GitHub mirror for backup/CI
- **Benefit**: Fast local dev, cloud safety net

### Zero-Trust Security
- **Cloudflared**: Public access without exposing infrastructure
- **Tailscale**: Encrypted mesh network for internal communication
- **No Port Forwarding**: All traffic tunneled securely

### Distributed Intelligence
- **Orchestrator**: Task planning, coordination, Git hosting
- **Workers**: GPU-accelerated AI inference and code execution
- **Claude-Flow**: Multi-agent swarm coordination across all nodes

## 🚀 Component Details

### 1. Gitea Server (Orchestrator)

**Purpose**: Self-hosted Git service for complete control

**Configuration**:
```yaml
Services:
  - Web UI: http://localhost:3000
  - SSH: Port 22 (internal)
  - Database: SQLite/PostgreSQL
  - Storage: /var/lib/gitea

Features:
  - Private repositories (unlimited)
  - Webhook integration
  - Built-in CI/CD (Gitea Actions)
  - Issue tracking
  - Wiki
  - Pull requests
  - Code review
```

**Why Gitea vs GitHub**:
| Feature | Gitea (Local) | GitHub (Cloud) |
|---------|---------------|----------------|
| Speed | ⚡ LAN speed (1Gbps+) | 🌐 Internet speed |
| Cost | 💰 Free (hardware only) | 💵 $4/user/month for private |
| Privacy | 🔒 Fully private | ☁️ Data in cloud |
| Repos | ♾️ Unlimited | 💎 Limited on free tier |
| API Limits | 🚀 No limits | ⏱️ 5000 requests/hour |
| Offline | ✅ Works without internet | ❌ Requires connection |
| CI/CD | ✅ Gitea Actions | ✅ GitHub Actions (better) |
| Ecosystem | ❌ Limited integrations | ✅ Huge ecosystem |

**Best Choice for You**: Gitea + GitHub Mirror

### 2. Cloudflared Tunnel

**Purpose**: Secure public access without port forwarding

**Configuration**:
```bash
# Install
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create nyra-gitea

# Configure
# Edit ~/.cloudflared/config.yml
tunnel: <TUNNEL_ID>
credentials-file: /home/user/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: gitea.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

**Benefits**:
- ✅ No port forwarding
- ✅ DDoS protection
- ✅ SSL/TLS automatic
- ✅ Access from anywhere
- ✅ Zero-trust security

### 3. Tailscale Mesh Network

**Purpose**: Secure internal communication between all 4 PCs

**Configuration**:
```bash
# Install on all 4 PCs
curl -fsSL https://tailscale.com/install.sh | sh

# Start and authenticate
sudo tailscale up

# Optional: Enable MagicDNS and subnet routing
sudo tailscale up --accept-dns --advertise-routes=192.168.1.0/24
```

**IP Assignment**:
```
Orchestrator: 100.64.x.1 (orchestrator.tail-net.ts.net)
GPU Worker 1: 100.64.x.2 (gpu-1.tail-net.ts.net)
GPU Worker 2: 100.64.x.3 (gpu-2.tail-net.ts.net)
GPU Worker 3: 100.64.x.4 (gpu-3.tail-net.ts.net)
```

**Worker Git Config**:
```bash
# On each worker PC
git config --global url."http://100.64.x.1:3000/".insteadOf "https://gitea.local/"
git clone http://100.64.x.1:3000/username/project.git
```

### 4. Claude-Flow Distributed Orchestration

**Purpose**: Multi-agent coordination across the 4-PC cluster

**Architecture**:
```
Orchestrator (Claude-Flow Master):
├── Task decomposition
├── Agent spawning
├── Work distribution
└── Result aggregation

Workers (Claude Code Agents):
├── Agent execution
├── GPU-accelerated inference
├── Code generation
└── Test execution
```

**Configuration** (on orchestrator):
```json
{
  "cluster": {
    "orchestrator": {
      "host": "100.64.x.1",
      "role": "master",
      "services": ["gitea", "orchestration", "coordination"]
    },
    "workers": [
      {
        "id": "gpu-1",
        "host": "100.64.x.2",
        "gpu": true,
        "capabilities": ["inference", "training", "code-generation"]
      },
      {
        "id": "gpu-2",
        "host": "100.64.x.3",
        "gpu": true,
        "capabilities": ["inference", "training", "code-generation"]
      },
      {
        "id": "gpu-3",
        "host": "100.64.x.4",
        "gpu": true,
        "capabilities": ["inference", "training", "code-generation"]
      }
    ]
  },
  "coordination": {
    "topology": "hierarchical",
    "strategy": "gpu-aware",
    "load_balancing": true,
    "failover": true
  }
}
```

## 🔄 Workflow Example

### Scenario: Full-Stack Feature Development

```
1. User Request (on Orchestrator):
   > "Build a REST API with authentication and React frontend"

2. Claude-Flow Orchestration (Orchestrator):
   ├── Task decomposition:
   │   ├── Backend API (FastAPI)
   │   ├── Database schema (PostgreSQL)
   │   ├── Frontend UI (React)
   │   └── Tests (Jest + Pytest)
   │
   ├── Agent assignment:
   │   ├── GPU-1: Backend dev + database
   │   ├── GPU-2: Frontend dev + styling
   │   ├── GPU-3: Testing + documentation
   │   └── Orchestrator: Code review + integration
   │
   └── Repository setup:
       └── Create feature branch in Gitea

3. Parallel Execution (All Workers):
   ├── GPU-1 (via Tailscale):
   │   ├── git clone http://100.64.x.1:3000/project.git
   │   ├── Claude Code generates backend code
   │   ├── Local LLM assists with decisions
   │   └── git push to feature branch
   │
   ├── GPU-2 (via Tailscale):
   │   ├── git pull from Gitea
   │   ├── Claude Code generates React components
   │   ├── Hot reload via local dev server
   │   └── git push changes
   │
   └── GPU-3 (via Tailscale):
       ├── git pull latest changes
       ├── Claude Code writes tests
       ├── Runs test suite locally
       └── Creates PR in Gitea

4. Integration (Orchestrator):
   ├── Webhook triggers from Gitea
   ├── Claude-Flow runs integration tests
   ├── Merge feature branch to main
   └── (Optional) Mirror to GitHub for backup

5. Access (External):
   └── View code via: https://gitea.yourdomain.com
       (Cloudflared tunnel)
```

## 🆚 Comparison: Gitea vs GitHub vs Flow-Nexus

### For Your 4-PC Setup:

| Aspect | Gitea (Local) | GitHub | Flow-Nexus |
|--------|---------------|--------|------------|
| **Use Case** | Primary development | Backup + CI/CD | Cloud execution (different purpose) |
| **Speed** | ⚡⚡⚡ LAN (1Gbps+) | 🌐 Internet dependent | ☁️ Cloud-based |
| **Privacy** | 🔒 100% private | ☁️ Data in cloud | ☁️ Cloud platform |
| **Cost** | 💰 Free | 💵 $4+/month | 💰 Credit-based |
| **GPU Access** | ✅ Your local GPUs | ❌ No GPU access | ✅ Cloud GPUs (paid) |
| **Offline** | ✅ Fully functional | ❌ Requires internet | ❌ Cloud-only |
| **Multi-Agent** | ✅ Via Claude-Flow | ⚠️ Via GitHub Actions | ✅ Built-in |
| **Real-Time Streams** | ⚠️ Custom setup | ❌ No | ✅ Native support |

### What is Flow-Nexus?

**Flow-Nexus is NOT a Git hosting alternative**. It's a **cloud-based AI orchestration platform** with:
- E2B sandboxes (cloud code execution)
- Neural network training in cloud
- Real-time execution monitoring
- 70+ MCP tools for cloud orchestration

**When to use Flow-Nexus**:
- Need cloud execution (no local setup)
- Training large models (cloud GPUs)
- Temporary workloads
- Remote team collaboration

**Your Setup (Gitea + Local GPUs) is better because**:
- ✅ You have local GPU hardware
- ✅ Faster than cloud for your LAN
- ✅ Free (no cloud costs)
- ✅ Full control and privacy
- ✅ Works offline

## 🎯 Recommended Architecture: **Hybrid Model**

```
┌─────────────────────────────────────────────┐
│            PRIMARY (Your LAN)                │
│                                              │
│  Orchestrator + 3 GPU Workers                │
│  ├── Gitea (primary Git server)             │
│  ├── Tailscale (secure mesh)                │
│  ├── Claude-Flow (orchestration)            │
│  └── Local LLMs (GPU-accelerated)           │
│                                              │
│  Speed: ⚡⚡⚡ LAN speed                      │
│  Cost: 💰 Hardware only                     │
│  Privacy: 🔒 Fully private                  │
└──────────────┬──────────────────────────────┘
               │
               │ (Auto-mirror)
               │
┌──────────────▼──────────────────────────────┐
│           BACKUP (Cloud)                     │
│                                              │
│  GitHub (secondary)                          │
│  ├── Automatic mirror from Gitea            │
│  ├── GitHub Actions (CI/CD)                 │
│  ├── Public repos / collaboration           │
│  └── Offsite backup                          │
│                                              │
│  Speed: 🌐 Internet                         │
│  Cost: 💵 $4-20/month                       │
│  Benefit: ✅ Industry standard + backup     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│        OPTIONAL (Cloud Bursting)             │
│                                              │
│  Flow-Nexus                                  │
│  ├── Cloud GPU for large models             │
│  ├── E2B sandboxes for CI/CD                │
│  ├── Neural training when local busy        │
│  └── Remote team access                      │
│                                              │
│  Speed: ☁️ Cloud                            │
│  Cost: 💰 Pay-per-use                       │
│  Use: ⚡ Burst workloads only               │
└─────────────────────────────────────────────┘
```

## 📋 Setup Checklist

### Phase 1: Core Infrastructure
- [ ] Install Gitea on orchestrator PC
- [ ] Configure Gitea (users, repos, webhooks)
- [ ] Install PostgreSQL/SQLite for Gitea
- [ ] Test Gitea locally (http://localhost:3000)

### Phase 2: Secure Access
- [ ] Install Cloudflared on orchestrator
- [ ] Create Cloudflared tunnel
- [ ] Configure DNS (gitea.yourdomain.com)
- [ ] Test external access via HTTPS

### Phase 3: Mesh Network
- [ ] Install Tailscale on all 4 PCs
- [ ] Authenticate all nodes
- [ ] Verify mesh connectivity
- [ ] Configure MagicDNS hostnames

### Phase 4: Worker Setup
- [ ] Install Git on all 3 worker PCs
- [ ] Configure Git to use Tailscale IP
- [ ] Install Claude Code on workers
- [ ] Test git clone/push from workers

### Phase 5: Claude-Flow Integration
- [ ] Install Claude-Flow on orchestrator
- [ ] Configure cluster topology
- [ ] Set up distributed agents
- [ ] Test multi-PC task execution

### Phase 6: GitHub Mirror (Optional)
- [ ] Create GitHub organization/repos
- [ ] Set up Gitea → GitHub mirror
- [ ] Configure GitHub Actions
- [ ] Test automatic mirroring

## 🔐 Security Considerations

1. **Gitea Access Control**:
   - Use strong passwords
   - Enable 2FA for all users
   - Restrict admin access
   - Regular backups

2. **Cloudflared**:
   - Zero-trust by default
   - No exposed ports
   - Cloudflare DDoS protection
   - Access policies via Cloudflare dashboard

3. **Tailscale**:
   - End-to-end encrypted
   - ACL policies for access control
   - MFA enforcement
   - Device authorization

4. **Environment Variables**:
   - Use Infisical for secrets management
   - Never commit API keys
   - Rotate credentials regularly

## 🚀 Next Steps

Choose your starting point:
1. **Quick Start**: Set up Gitea locally first
2. **Secure First**: Configure Tailscale mesh
3. **External Access**: Set up Cloudflared tunnel
4. **Full Stack**: Complete all phases in order

Would you like me to generate setup scripts for any of these components?
