# Project Nyra - MCP Architecture Configuration (DEFINITIVE)
## Answers to All Your MCP Questions

**Version:** 1.0.0  
**Last Updated:** 2025-01-18  
**Target:** Orchestrator PC Windows 11

---

## Quick Answer Guide

| Your Question | Answer |
|---------------|--------|
| Should Nexus Router be the ONLY MCP? | ❌ NO - Use hybrid (local + Nexus) |
| Claude-Flow in same container as Nexus? | ❌ NO - Separate containers |
| Infisical local AND container? | ✅ YES - Hybrid deployment |
| Claude-Code in WSL or container? | ✅ WSL2 (better dev experience) |
| WSL access to Docker containers? | ✅ FULL ACCESS (via Docker Desktop) |
| Run Docker on Windows or WSL? | ✅ Windows (Docker Desktop + WSL2 backend) |
| Cloudflared + Tailscale containerized? | ✅ YES - Both in Docker |
| Gitea on Windows or container? | ✅ Docker (easier backup) |

---

## Part 1: MCP Architecture - The Definitive Answer

### ❌ **WRONG APPROACH: Nexus-Only**

```
Claude Desktop → Nexus Router (single MCP) → All services
                                    ❌ FAILS:
                                    - Can't access Windows filesystem
                                    - Can't use Desktop Commander
                                    - No Bitwarden integration
                                    - Higher latency
```

### ✅ **CORRECT APPROACH: Hybrid Architecture**

```
Claude Desktop (Windows)
    │
    ├─→ LOCAL MCPs (direct, low latency, Windows APIs)
    │   ├─ Filesystem MCP (C:\Dev access)
    │   ├─ Desktop Commander MCP (PowerShell, Windows automation)
    │   ├─ Bitwarden MCP (credential management)
    │   └─ GitHub MCP (code repository)
    │
    └─→ Nexus Router MCP (aggregates containerized services)
        └─→ Routes to Docker-based service MCPs
            ├─ Claude-Flow MCP (workflow orchestration)
            ├─ Infisical MCP (secrets API)
            ├─ TwentyCRM Tools
            ├─ Quote Engine Tools
            ├─ Campaign Engine Tools
            └─ Dify Tools
```

### Why Hybrid Instead of Nexus-Only?

**Filesystem Access**: Docker containers can only see their own filesystem. If Filesystem MCP runs in a container, it cannot access `C:\Dev\Projects\`.

**Windows APIs**: Desktop Commander needs PowerShell, registry access, Windows services control. These don't exist in Linux containers.

**Performance**: Local MCPs have ~1ms latency. Nexus-routed MCPs add 3-10ms Docker network overhead.

**Simplicity**: Some MCPs (like GitHub, Bitwarden) are simple enough that routing through Nexus adds complexity without benefit.

---

## Part 2: Claude-Flow vs Nexus Router

### Question: "Do I run Claude-Flow in the same Docker container as Nexus Router MCP?"

### Answer: ❌ **NO - They are separate containers that communicate**

**Nexus Router** = Traffic cop (routes LLM requests + aggregates MCP tools)  
**Claude-Flow** = Worker (executes multi-step workflows)

```yaml
# docker-compose.yml
services:
  nexus-router:
    image: grafbase/nexus:latest
    container_name: nexus-router
    ports:
      - "6000:6000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      # Nexus discovers claude-flow via Docker DNS
    networks:
      - mortgage-network

  claude-flow:
    image: anthropic/claude-flow:v3alpha
    container_name: claude-flow
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - MCP_SERVER_PORT=8080
    networks:
      - mortgage-network
    volumes:
      - ./workflows:/app/workflows
      - /var/run/docker.sock:/var/run/docker.sock  # For orchestration
```

**How they communicate:**

```
Claude Desktop → Nexus Router MCP (localhost:6000)
                       ↓
                 Nexus internal routing
                       ↓
                 http://claude-flow:8080 (Docker network)
                       ↓
                 Claude-Flow executes workflow
                       ↓
                 Returns result to Nexus
                       ↓
                 Nexus returns to Claude Desktop
```

### Nexus Configuration for Claude-Flow

Nexus auto-discovers MCP servers on the Docker network. Add to Nexus config:

```json
{
  "mcp_servers": [
    {
      "name": "claude-flow",
      "url": "http://claude-flow:8080",
      "description": "Workflow orchestration and multi-agent coordination"
    },
    {
      "name": "infisical",
      "url": "http://infisical-mcp:3000",
      "description": "Secrets management API"
    }
  ]
}
```

---

## Part 3: Infisical - Hybrid Deployment (CLI + MCP)

### Question: "Should Infisical MCP remain local or be in container? What about Infisical CLI?"

### Answer: ✅ **USE BOTH - They serve different purposes**

### Infisical CLI (Local - Windows + WSL2)

**Purpose:** Docker Compose secret injection

```powershell
# Windows PowerShell
infisical run --env production -- docker compose up -d
```

```bash
# WSL2 bash
infisical run --env development -- docker compose up -d
```

**Installation:**

```powershell
# Windows
winget install infisical

# WSL2
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get install -y infisical

# Login (shared between Windows and WSL2)
infisical login
```

### Infisical MCP (Containerized)

**Purpose:** Claude API access to secrets at runtime

```yaml
# docker-compose.yml
services:
  infisical-mcp:
    image: infisical/mcp-server:latest
    container_name: infisical-mcp
    restart: unless-stopped
    environment:
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
      - INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
      - MCP_PORT=3000
    networks:
      - mortgage-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
```

**Usage Pattern:**

```typescript
// In Claude-Flow workflow
const apiKey = await infisical.getSecret({
  path: '/nyra/production/ANTHROPIC_API_KEY'
});

// Use dynamically fetched secret
const response = await anthropic.messages.create({
  apiKey: apiKey,
  model: 'claude-sonnet-4',
  // ...
});
```

### Why Both?

| Use Case | Use CLI | Use MCP |
|----------|---------|---------|
| Start Docker Compose with secrets | ✅ | ❌ |
| Claude fetches API key at runtime | ❌ | ✅ |
| Rotate secrets without restarting | ❌ | ✅ |
| Bootstrap new PC | ✅ | ❌ |
| Dynamic secret selection in workflow | ❌ | ✅ |

---

## Part 4: Claude-Code vs Claude-Flow

### Question: "Do I want to run Claude-Code in WSL locally or via container?"

### Answer: ✅ **Run Claude-Code in WSL2 (NOT containerized)**

**Claude-Code** = Interactive terminal coding assistant (like GitHub Copilot CLI)  
**Claude-Flow** = Agentic workflow orchestration system

### Installation Strategy

**Claude-Code (WSL2)**:

```bash
# In WSL2 Ubuntu
npm install -g @anthropic/claude-code

# Or via pipx
pipx install claude-code

# Initialize in your project
cd /home/user/projects/Project-Nyra
claude-code init
```

**Claude-Flow (Docker)**:

```yaml
# Already in docker-compose.yml
services:
  claude-flow:
    image: anthropic/claude-flow:v3alpha
    # ...
```

### When to Use Each

| Task | Use Claude-Code | Use Claude-Flow |
|------|----------------|----------------|
| Debug FastAPI endpoint in terminal | ✅ | ❌ |
| Quick code refactor | ✅ | ❌ |
| Build 5-agent quote generation workflow | ❌ | ✅ |
| Orchestrate nightly campaign jobs | ❌ | ✅ |
| Pair programming session | ✅ | ❌ |
| Multi-step mortgage application processing | ❌ | ✅ |

### Example: Claude-Code Terminal Session

```bash
# WSL2 terminal
cd /home/user/projects/Project-Nyra/services/quote-engine

# Start interactive session
claude-code

# Claude can now:
# - Read your files
# - Make edits
# - Run tests
# - Debug errors
# - Explain code
```

### Example: Claude-Flow Workflow

```typescript
// Workflow: Generate mortgage quote with compliance checks
const workflow = {
  name: "mortgage-quote-generation",
  agents: [
    { role: "data-gatherer", model: "claude-sonnet-4" },
    { role: "rate-calculator", model: "claude-haiku-4" },
    { role: "compliance-checker", model: "claude-sonnet-4" },
    { role: "quote-formatter", model: "claude-haiku-4" }
  ],
  steps: [
    { agent: "data-gatherer", task: "Extract applicant data from TwentyCRM" },
    { agent: "rate-calculator", task: "Calculate rates via Quote Engine" },
    { agent: "compliance-checker", task: "Verify TILA/RESPA compliance" },
    { agent: "quote-formatter", task: "Generate PDF and store in S3" }
  ]
};
```

**Trigger via MCP:**

```typescript
// Claude Desktop calls via Nexus → Claude-Flow MCP
await claudeFlow.executeWorkflow({
  workflowId: "mortgage-quote-generation",
  input: { applicantId: "12345" }
});
```

---

## Part 5: WSL + Docker Desktop Integration

### Question: "How much access to Docker containers do I have via WSL if Docker Desktop is running containers?"

### Answer: ✅ **FULL ACCESS - WSL2 connects directly to Docker Desktop's engine**

### How It Works

```
Windows 11
    │
    ├─→ Docker Desktop (Service)
    │      │
    │      └─→ Docker Engine (runs in WSL2 VM)
    │             │
    │             ├─→ All your containers
    │             └─→ All your Docker networks
    │
    └─→ WSL2 Distros (Ubuntu, etc.)
           │
           └─→ docker CLI
                  │
                  └─→ Communicates via /var/run/docker.sock
                         │
                         └─→ SAME Docker Engine as Windows
```

### What You Can Do from WSL2

```bash
# All standard Docker commands work identically
docker ps
docker exec -it twentycrm bash
docker logs nexus-router --follow
docker compose up -d
docker network inspect mortgage-network

# Access containers by name (Docker DNS)
curl http://twentycrm:3000/health
psql -h postgres -U nyra
redis-cli -h redis -a $REDIS_PASSWORD

# Even access host Windows filesystem
ls /mnt/c/Dev/Projects/Repos/Project-Nyra
```

### File System Performance

| Location | Speed | Recommendation |
|----------|-------|----------------|
| WSL2 Native (`/home/user/`) | ⚡ Very Fast | Store code here |
| Windows FS (`/mnt/c/`) | 🐌 SLOW | Avoid for active dev |
| Docker Volumes | ⚡ Fast | Best for container data |

**Best Practice:**

```bash
# Clone repos to WSL2 native filesystem
cd ~
mkdir projects
cd projects
git clone https://github.com/yourusername/Project-Nyra.git

# NOT this (slow):
# cd /mnt/c/Dev/Projects/Repos
# git clone ...
```

### But Your Code is in C:\Dev...

**Solution:** Use bind mounts from Windows to Docker:

```yaml
# docker-compose.yml
services:
  quote-engine:
    build:
      context: C:\Dev\Projects\Repos\Project-Nyra\services\quote-engine
    volumes:
      # Mount Windows code into container
      - C:\Dev\Projects\Repos\Project-Nyra\services\quote-engine:/app
```

From WSL2, access the same files:

```bash
cd /mnt/c/Dev/Projects/Repos/Project-Nyra
# Edit with vim, VS Code, or any editor
# Changes immediately reflected in Docker container
```

---

## Part 6: Complete Claude Desktop Config

### claude_desktop_config.json (Windows)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Dev\\Projects"
      ]
    },
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@desktopcommander/mcp-server"]
    },
    "bitwarden": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@bitwarden/mcp-server",
        "start"
      ],
      "env": {
        "BW_CLIENTID": "${BW_CLIENTID}",
        "BW_CLIENTSECRET": "${BW_CLIENTSECRET}",
        "BW_PASSWORD": "${BW_PASSWORD}"
      }
    },
    "github": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    },
    "nexus-router": {
      "command": "npx",
      "args": ["@grafbase/nexus-mcp"],
      "env": {
        "NEXUS_URL": "http://localhost:6000",
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

**Note:** Infisical is accessed THROUGH Nexus Router, not directly. Claude Desktop → Nexus → Infisical MCP (container).

---

## Part 7: Complete Orchestrator Docker Compose

See `ARCHITECTURE-ORCHESTRATOR.md` for the complete docker-compose.yml with all services.

Key additions for MCP architecture:

```yaml
services:
  nexus-router:
    image: grafbase/nexus:latest
    container_name: nexus-router
    restart: unless-stopped
    ports:
      - "6000:6000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}
    networks:
      - mortgage-network

  claude-flow:
    image: anthropic/claude-flow:v3alpha
    container_name: claude-flow
    restart: unless-stopped
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - MCP_SERVER_PORT=8080
    volumes:
      - ./workflows:/app/workflows
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - mortgage-network

  infisical-mcp:
    image: infisical/mcp-server:latest
    container_name: infisical-mcp
    restart: unless-stopped
    environment:
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
      - INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
      - MCP_PORT=3000
    networks:
      - mortgage-network

  # Cloudflared - see CLOUDFLARE-TUNNEL-INTEGRATION.md
  cloudflared:
    image: cloudflare/cloudflared:2025.1.0
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel --metrics 0.0.0.0:2000 --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - mortgage-network

  # Tailscale - containerized for consistency
  tailscale:
    image: tailscale/tailscale:latest
    container_name: tailscale
    restart: unless-stopped
    environment:
      - TS_AUTHKEY=${TAILSCALE_AUTH_KEY}
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_USERSPACE=true
    volumes:
      - tailscale-state:/var/lib/tailscale
    networks:
      - mortgage-network
    cap_add:
      - NET_ADMIN

  # Gitea - containerized for backup simplicity
  gitea:
    image: gitea/gitea:1.21
    container_name: gitea
    restart: unless-stopped
    environment:
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=postgres:5432
      - GITEA__database__PASSWD=${GITEA_DB_PASSWORD}
    volumes:
      - gitea-data:/data
    ports:
      - "3200:3000"
      - "3222:22"
    networks:
      - mortgage-network
```

---

## Part 8: Bootstrap Integration Checklist

### Files Created for Bootstrap Integration

1. ✅ `ARCHITECTURE-ORCHESTRATOR.md` - Complete architecture guide
2. ✅ `CLOUDFLARE-TUNNEL-INTEGRATION.md` - Tunnel deployment guide
3. ✅ `MCP-ARCHITECTURE.md` (this file) - MCP configuration guide
4. 🔄 TODO: Update `03-GUI-INSTALLER.ps1` to use these guides
5. 🔄 TODO: Create `docker-compose.orchestrator.yml` template
6. 🔄 TODO: Create `docker-compose.worker.yml` template

### GUI Installer Flow Enhancement

```
03-GUI-INSTALLER.ps1
    │
    ├─→ Select PC Role
    │   ├─ Orchestrator → Full stack deployment
    │   │   ├─ Docker Desktop + WSL2
    │   │   ├─ Complete docker-compose.orchestrator.yml
    │   │   ├─ Claude Desktop MCP config (hybrid)
    │   │   ├─ Cloudflare Tunnel setup
    │   │   ├─ Tailscale setup
    │   │   ├─ Infisical CLI (Windows + WSL2)
    │   │   └─ Claude-Code (WSL2)
    │   │
    │   └─ GPU Worker → Minimal compute stack
    │       ├─ Docker Desktop + NVIDIA Toolkit
    │       ├─ LLM inference containers
    │       ├─ Cloudflared (optional, for HA)
    │       └─ Test connectivity to orchestrator
    │
    ├─→ Secret Configuration
    │   ├─ Prompt for API keys
    │   ├─ Store in Infisical
    │   └─ Generate .env file
    │
    ├─→ Deploy Stack
    │   ├─ infisical run -- docker compose up -d
    │   └─ Wait for health checks
    │
    └─→ Verification
        ├─ Test MCP connections
        ├─ Test Cloudflare Tunnel
        ├─ Test LAN connectivity
        └─ Open health dashboard
```

---

## Summary: Your Definitive Architecture

| Component | Placement | Access Method | Rationale |
|-----------|-----------|---------------|-----------|
| **MCPs** |
| Filesystem MCP | Local (Windows) | Direct | Needs C:\ access |
| Desktop Commander | Local (Windows) | Direct | Needs Windows APIs |
| Bitwarden MCP | Local (Windows) | Direct | Credential management |
| GitHub MCP | Local (Windows) | Direct | Simple, no benefit from container |
| Nexus Router MCP | Local (npx) | http://localhost:6000 | Aggregates containerized MCPs |
| Claude-Flow MCP | Docker container | Via Nexus Router | Workflow orchestration |
| Infisical MCP | Docker container | Via Nexus Router | Dynamic secret fetching |
| **Orchestration** |
| Claude-Flow | Docker container | MCP endpoint | Agentic workflows |
| Claude-Code | WSL2 native | Terminal CLI | Interactive coding |
| **Infrastructure** |
| Docker Engine | Windows (WSL2 backend) | docker CLI | Stability + WSL integration |
| Nexus Router | Docker container | Port 6000 | LLM gateway |
| **Networking** |
| Cloudflared | Docker container | Automatic | Direct Docker network access |
| Tailscale | Docker container | VPN tunnel | Device-level networking |
| **Services** |
| All 6 apps | Docker containers | Docker networks | Isolation + portability |
| Gitea | Docker container | Port 3200 | Backup simplicity |
| **Secrets** |
| Infisical CLI | Windows + WSL2 | infisical run | Compose injection |
| Infisical MCP | Docker container | Via Nexus | Runtime secret access |

**This gives you:**
- ✅ Best performance (local MCPs where needed)
- ✅ Full Windows filesystem access
- ✅ Seamless WSL2 integration
- ✅ Unified Docker stack
- ✅ Scalable MCP architecture
- ✅ Production-grade secrets management
- ✅ Remote access via Cloudflare Tunnel
- ✅ Admin VPN via Tailscale

**Next step:** I'll now create the GUI installer integration scripts.
