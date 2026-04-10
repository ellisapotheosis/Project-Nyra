# Project Nyra - Orchestrator PC Architecture Configuration
## Windows 11 + Docker Desktop + WSL2 Integration

**Version:** 1.0.0  
**Last Updated:** 2025-01-18  
**Target:** Orchestrator PC (UH680 Ryzen 7 6800H, 16GB RAM)

---

## Executive Summary: Your Optimal Architecture

After analyzing your 4-PC Project Nyra mortgage platform requirements, here's the **recommended architecture** for your orchestrator PC:

### Core Platform
- **Docker Runtime**: Docker Desktop on Windows 11 (NOT WSL)
- **WSL2**: Ubuntu 22.04 for Linux dev tools (Claude-Code, git)
- **MCP Strategy**: Hybrid (local + containerized)

### Service Placement
| Component | Location | Rationale |
|-----------|----------|-----------|
| Docker Engine | Windows 11 | Better stability, WSL2 integration |
| Cloudflared | Docker Container | Direct Docker network access |
| Tailscale | Windows Native | Device-level networking |
| Gitea | Docker Container | Backup/restore, stack consistency |
| Infisical | Hybrid (CLI local + MCP container) | Secrets + API integration |
| Claude-Flow | Docker Container via MCP | Workflow orchestration |
| Claude-Code | WSL2 | Terminal dev experience |
| Nexus Router | Docker Container | LLM gateway + MCP aggregator |

---

## Part 1: MCP Architecture - Local vs Containerized

### The Hybrid Strategy (Recommended)

**DO NOT make Nexus Router your only MCP entry point.** Use a hybrid approach:

```
Claude Desktop (Windows)
    │
    ├─→ LOCAL MCPs (direct connections)
    │   ├─ Filesystem MCP (needs Windows filesystem)
    │   ├─ Desktop Commander MCP (needs Windows APIs)
    │   ├─ Bitwarden MCP (credential management)
    │   └─ GitHub MCP (code management)
    │
    ├─→ Nexus Router MCP (aggregator)
    │   └─→ Routes to containerized service MCPs
    │       ├─ Claude-Flow MCP (workflow orchestration)
    │       ├─ Infisical MCP (secrets API)
    │       ├─ TwentyCRM Tools
    │       ├─ Quote Engine Tools
    │       └─ Campaign Engine Tools
    │
    └─→ HYBRID: Infisical
        ├─ Infisical CLI (local, for docker-compose secret injection)
        └─ Infisical MCP (containerized, for Claude API access)
```

### Why Hybrid Instead of Nexus-Only?

**Filesystem Access Problem**: MCPs running in Docker containers cannot access your Windows filesystem directly. If you route Filesystem MCP through Nexus in a container, it can only see the container's filesystem, not `C:\Dev\Projects\`.

**Desktop Commander Problem**: Requires Windows-specific APIs (PowerShell, registry, Windows services). Cannot run in Linux container.

**Performance**: Local MCPs have zero network overhead. Containerized MCPs add Docker network latency (~1-5ms per call).

### Claude Desktop MCP Configuration (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\Dev"]
    },
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@desktopcommander/mcp-server"]
    },
    "bitwarden": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@bitwarden/mcp-server", "start"],
      "env": {
        "BW_CLIENTID": "${BW_CLIENTID}",
        "BW_CLIENTSECRET": "${BW_CLIENTSECRET}",
        "BW_PASSWORD": "${BW_PASSWORD}"
      }
    },
    "github": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-github"],
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
    },
    "infisical-local": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@infisical/mcp"],
      "env": {
        "INFISICAL_UNIVERSAL_AUTH_CLIENT_ID": "${INFISICAL_CLIENT_ID}",
        "INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET": "${INFISICAL_CLIENT_SECRET}",
        "INFISICAL_PROJECT_ID": "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
      }
    }
  }
}
```

---

## Part 2: Docker Desktop on Windows vs WSL

### Run Docker Desktop on Windows 11 ✅

**DO NOT run Docker directly in WSL.** Use Docker Desktop for Windows with WSL2 backend.

**Why?**

1. **WSL2 Integration**: Docker Desktop automatically makes Docker available in ALL WSL2 distros
2. **Stability**: Microsoft-tested integration, handles network routing automatically
3. **GUI**: Docker Desktop provides system tray, dashboard, and easy management
4. **Updates**: Automatic updates via Windows Update integration
5. **GPU Support**: NVIDIA Container Toolkit integrates cleanly

### How WSL2 Accesses Your Docker Containers

When you install Docker Desktop on Windows with WSL2 backend enabled:

```
Windows 11
    │
    ├─→ Docker Desktop (Service)
    │      │
    │      └─→ Docker Engine (WSL2 VM)
    │             │
    │             ├─→ All your containers
    │             └─→ Docker networks
    │
    └─→ WSL2 Instances (Ubuntu, Debian, etc.)
           │
           └─→ docker CLI → communicates with Docker Engine
                            │
                            └─→ FULL ACCESS to all containers
```

**From WSL2, you can:**
```bash
# All these work identically in WSL2
docker ps
docker exec -it twentycrm bash
docker compose up -d
docker network inspect mortgage-platform

# Access containers by name
curl http://twentycrm:3000/health
psql -h postgres -U twentycrm
```

**The Magic**: Docker Desktop mounts the Docker socket into WSL2 at `/var/run/docker.sock`. WSL2's `docker` CLI connects to the Windows-hosted Docker Engine transparently.

### Windows vs WSL File Performance

| Operation | Windows | WSL2 Native | WSL2 → Windows FS |
|-----------|---------|-------------|-------------------|
| Git clone | Fast | Very Fast | SLOW (⚠️ avoid) |
| npm install | Fast | Very Fast | SLOW (⚠️ avoid) |
| Docker build | Fast | Fast | Fast |
| File watching | Good | Excellent | Poor |

**Best Practice**: Keep your code in WSL2's native filesystem (`/home/user/projects`), NOT in `/mnt/c/`. Access Docker from WSL2 seamlessly.

---

## Part 3: Claude-Flow vs Claude-Code

### They're Complementary - Use Both! ✅

**Claude-Flow**: Workflow orchestration system (agentic, multi-step tasks)
- **Run in**: Docker container
- **Access via**: MCP server (through Nexus Router)
- **Purpose**: Complex workflows, campaign automation, multi-agent coordination

**Claude-Code**: Terminal-based coding assistant (interactive development)
- **Run in**: WSL2 Ubuntu
- **Access via**: Command line (`claude-code`)
- **Purpose**: Live coding sessions, debugging, quick scripts

### Installation Strategy

**Claude-Flow (Containerized)**:
```yaml
# docker-compose.yml
services:
  claude-flow:
    image: anthropic/claude-flow:v3alpha
    container_name: claude-flow
    restart: unless-stopped
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    networks:
      - mortgage-network
    volumes:
      - ./workflows:/app/workflows
      - /var/run/docker.sock:/var/run/docker.sock  # For container orchestration
```

**Claude-Code (WSL2)**:
```bash
# In WSL2 Ubuntu
npm install -g @anthropic/claude-code
claude-code init

# Or via pipx
pipx install claude-code
```

### When to Use Each

| Scenario | Use Claude-Flow | Use Claude-Code |
|----------|----------------|-----------------|
| Build multi-step mortgage quote workflow | ✅ | ❌ |
| Debug Python FastAPI endpoint in terminal | ❌ | ✅ |
| Orchestrate 5 agents for campaign generation | ✅ | ❌ |
| Quick code refactor in current directory | ❌ | ✅ |
| Schedule nightly data enrichment jobs | ✅ | ❌ |
| Pair programming session | ❌ | ✅ |

---

## Part 4: Infisical - Hybrid Deployment

### Use Both Local CLI + Containerized MCP ✅

**Infisical CLI (Windows + WSL2)**:
```powershell
# Windows installation
winget install infisical

# WSL2 installation
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical

# Login (shared between Windows and WSL2)
infisical login
```

**Infisical MCP (Containerized)**:
```yaml
services:
  infisical-mcp:
    image: infisical/mcp-server:latest
    container_name: infisical-mcp
    restart: unless-stopped
    environment:
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
      - INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
    networks:
      - mortgage-network
```

### Why Hybrid?

**CLI for**: Docker Compose secret injection
```yaml
# Run docker-compose with Infisical secrets
infisical run --env=production -- docker compose up -d
```

**MCP for**: Claude API access to secrets
```typescript
// Claude can fetch secrets at runtime via MCP
const apiKey = await infisical.getSecret('/nyra/prod/ANTHROPIC_API_KEY');
```

---

## Part 5: Cloudflared & Tailscale Placement

### Cloudflared: Docker Container ✅

**Rationale**: Direct access to Docker service network, no need to expose ports on Windows host.

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:2025.1.0
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel --metrics 0.0.0.0:2000 --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - mortgage-network
    # No ports exposed - communicates outbound to Cloudflare Edge
```

**Benefits**:
- References services by container name: `http://twentycrm:3000`
- No Windows firewall configuration needed
- Starts/stops with docker-compose
- Prometheus metrics available at :2000/metrics

### Tailscale: Windows Native Service ✅

**Rationale**: Device-level VPN, needs OS integration for DNS and routing.

**Installation**:
```powershell
# Download from tailscale.com/download/windows
# OR via winget
winget install tailscale.tailscale
```

**Why Native?**:
- Integrates with Windows network stack
- Provides Magic DNS automatically
- Handles subnet routing
- System tray control
- Survives Docker restarts

**Use Cases**:
- Remote admin access to orchestrator PC
- VPN between 4 PCs for inter-cluster communication
- Secure access to internal services without Cloudflare Tunnel

---

## Part 6: Gitea Placement

### Gitea: Docker Container ✅

**Rationale**: Easier backup/restore, consistent with stack architecture, no Windows service management.

```yaml
services:
  gitea:
    image: gitea/gitea:1.21
    container_name: gitea
    restart: unless-stopped
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=postgres:5432
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=${GITEA_DB_PASSWORD}
    volumes:
      - gitea-data:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3200:3000"  # Web UI
      - "3222:22"    # Git SSH
    networks:
      - mortgage-network
    depends_on:
      - postgres

volumes:
  gitea-data:
```

**Benefits**:
- Backup = `docker volume export gitea-data`
- Restore = `docker volume import gitea-data`
- Integrated with PostgreSQL in same network
- SSH on port 3222 (no conflict with Windows OpenSSH)
- Accessible via Cloudflare Tunnel for remote access

**Repository Storage**: `/var/lib/docker/volumes/gitea-data/_data/git/repositories`

---

## Part 7: Complete Docker Compose for Orchestrator PC

This is your master `docker-compose.orchestrator.yml`:

```yaml
version: '3.8'

networks:
  mortgage-network:
    name: mortgage-platform
    driver: bridge

volumes:
  postgres-data:
  gitea-data:
  n8n-data:
  twentycrm-data:
  redis-data:
  grafana-data:
  prometheus-data:
  loki-data:

services:
  # ============================================================================
  # INFRASTRUCTURE LAYER
  # ============================================================================
  
  postgres:
    image: postgres:16-alpine
    container_name: postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - mortgage-network
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 2gb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    networks:
      - mortgage-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================================================
  # ROUTING & GATEWAY LAYER
  # ============================================================================

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
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:6000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  cloudflared:
    image: cloudflare/cloudflared:2025.1.0
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel --metrics 0.0.0.0:2000 --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - mortgage-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:2000/ready"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ============================================================================
  # APPLICATION LAYER
  # ============================================================================

  twentycrm:
    image: twentycrm/twenty:latest
    container_name: twentycrm
    restart: unless-stopped
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_DB=twentycrm
      - POSTGRES_USER=twentycrm
      - POSTGRES_PASSWORD=${TWENTYCRM_DB_PASSWORD}
      - SECRET_KEY=${TWENTYCRM_SECRET_KEY}
    volumes:
      - twentycrm-data:/app/data
    networks:
      - mortgage-network
    depends_on:
      - postgres
      - redis

  dify:
    image: langgenius/dify-api:latest
    container_name: dify
    restart: unless-stopped
    environment:
      - SECRET_KEY=${DIFY_SECRET_KEY}
      - DB_USERNAME=dify
      - DB_PASSWORD=${DIFY_DB_PASSWORD}
      - REDIS_HOST=redis
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    networks:
      - mortgage-network
    depends_on:
      - postgres
      - redis

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${N8N_DB_PASSWORD}
    volumes:
      - n8n-data:/home/node/.n8n
    networks:
      - mortgage-network
    depends_on:
      - postgres

  gitea:
    image: gitea/gitea:1.21
    container_name: gitea
    restart: unless-stopped
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=postgres:5432
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=${GITEA_DB_PASSWORD}
    volumes:
      - gitea-data:/data
    ports:
      - "3200:3000"
      - "3222:22"
    networks:
      - mortgage-network
    depends_on:
      - postgres

  # ============================================================================
  # ORCHESTRATION LAYER
  # ============================================================================

  claude-flow:
    image: anthropic/claude-flow:v3alpha
    container_name: claude-flow
    restart: unless-stopped
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
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
    networks:
      - mortgage-network

  # ============================================================================
  # OBSERVABILITY LAYER
  # ============================================================================

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=90d'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - mortgage-network

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_SERVER_ROOT_URL=https://grafana.yourdomain.com
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3005:3000"
    networks:
      - mortgage-network
    depends_on:
      - prometheus

  loki:
    image: grafana/loki:latest
    container_name: loki
    restart: unless-stopped
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - loki-data:/loki
    ports:
      - "3100:3100"
    networks:
      - mortgage-network
```

---

## Part 8: Bootstrap Integration Strategy

### GUI Installer Configuration

Your `03-GUI-INSTALLER.ps1` should present these options when bootstrapping the **Orchestrator PC**:

**Core Components (Always Installed)**:
- ✅ Docker Desktop for Windows
- ✅ WSL2 Ubuntu 22.04
- ✅ Infisical CLI (Windows + WSL2)
- ✅ Tailscale (Windows Service)

**Containerized Stack**:
- ✅ PostgreSQL + Redis
- ✅ Nexus Router (port 6000)
- ✅ Cloudflared Tunnel
- ✅ TwentyCRM
- ✅ Dify
- ✅ n8n
- ✅ Gitea
- ✅ Claude-Flow
- ✅ Infisical MCP
- ✅ Prometheus + Grafana + Loki

**Dev Tools (Optional)**:
- 🔲 Claude-Code (WSL2)
- 🔲 Docker Compose standalone

### Bootstrap Execution Flow

```
1. Pre-Flight Check
   ├─ Docker Desktop installed?
   ├─ WSL2 enabled?
   ├─ Disk space (100GB+)?
   └─ Network connectivity?

2. Core Installation
   ├─ Install Docker Desktop
   ├─ Enable WSL2 integration
   ├─ Install WSL2 Ubuntu
   ├─ Install Infisical CLI (both)
   └─ Install Tailscale

3. Secret Configuration
   ├─ Prompt for API keys
   ├─ Store in Infisical
   └─ Generate .env file

4. Docker Stack Deployment
   ├─ Copy docker-compose.orchestrator.yml
   ├─ Pull all images
   ├─ Create networks
   ├─ Create volumes
   └─ Start services

5. MCP Configuration
   ├─ Generate claude_desktop_config.json
   ├─ Configure local MCPs
   ├─ Add Nexus Router
   └─ Restart Claude Desktop

6. Verification
   ├─ Health check all services
   ├─ Test Cloudflare Tunnel
   ├─ Verify MCP connections
   └─ Open health dashboard
```

---

## Summary: Your Complete Orchestrator Architecture

| Component | Placement | Access Method |
|-----------|-----------|---------------|
| **Runtime** |
| Docker Engine | Windows 11 (WSL2 backend) | docker CLI |
| WSL2 Ubuntu | Hyper-V VM | wsl |
| **Networking** |
| Cloudflared | Docker container | Automatic via Tunnel |
| Tailscale | Windows service | System tray |
| **Development** |
| Claude-Flow | Docker container | MCP via Nexus |
| Claude-Code | WSL2 | Terminal CLI |
| Gitea | Docker container | https://localhost:3200 |
| **Secrets** |
| Infisical CLI | Windows + WSL2 | infisical run |
| Infisical MCP | Docker container | MCP via Nexus |
| **Services** |
| All 6 apps | Docker containers | Docker networks |
| Nexus Router | Docker container | http://localhost:6000 |
| **Observability** |
| Prometheus/Grafana/Loki | Docker containers | http://localhost:3005 |

---

**This configuration gives you**:
- ✅ Unified Docker management on Windows
- ✅ Full WSL2 access to Docker
- ✅ Optimal MCP architecture (hybrid local + container)
- ✅ Proper service isolation
- ✅ Production-grade observability
- ✅ Clean separation of concerns
- ✅ Easy backup/restore (Docker volumes)

**Next Step**: Integrate this into your `03-GUI-INSTALLER.ps1` to automate the entire setup. I'll create the integration now.
