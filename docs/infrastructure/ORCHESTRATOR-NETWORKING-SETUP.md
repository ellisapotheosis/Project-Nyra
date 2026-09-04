# Orchestrator Mini - Networking Setup Guide

**Device**: Minisforum UH680 (Windows 11 + WSL2)
**Role**: Central orchestrator for 4-PC distributed AI infrastructure
**Date**: 2026-01-25

---

## 🎯 Architecture Decision: Where to Install

### **Tailscale** → Install in BOTH Windows AND WSL

**Why BOTH?**
- **Windows Tailscale**: Provides system-wide VPN access, enables all Windows applications to reach workers
- **WSL Tailscale**: Ensures Docker containers can directly access GPU workers via Tailscale mesh network

**Installation Order**:
1. Install Tailscale in Windows (GUI app)
2. Install Tailscale in WSL2 (daemon mode)
3. Configure both to use same account

### **Cloudflared** → Install in WSL ONLY

**Why WSL?**
- Docker containers run in WSL2 backend
- All services (Nexus, Grafana, etc.) are in Docker
- Cloudflared needs to access localhost:port of Docker services
- Simpler systemd management in Linux

**Optional Docker Container**: Can run cloudflared in container for specific services, but WSL systemd is recommended for orchestrator

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] Cloudflare account (https://dash.cloudflare.com/)
- [ ] Tailscale account (https://login.tailscale.com/)
- [ ] Domain name (optional for Cloudflared, can use *.trycloudflare.com for free)
- [ ] WSL2 with Ubuntu 24.04 installed and running
- [ ] Docker Desktop running with WSL2 backend
- [ ] Administrator access on Windows

---

## 🚀 Step-by-Step Setup

### Step 1: Install Tailscale (Windows)

**Option A: Using WinGet (Recommended)**
```powershell
# Run in PowerShell as Administrator
winget install tailscale.tailscale
```

**Option B: Manual Install**
1. Download: https://tailscale.com/download/windows
2. Run installer
3. Sign in with your account
4. Verify: Check system tray for Tailscale icon

**Configure Windows Tailscale**:
1. Click Tailscale system tray icon
2. Click "Settings"
3. Enable "Use Tailscale DNS"
4. Enable "Accept routes" (for accessing worker subnets)
5. Note your Tailscale IP (usually 100.x.x.x)

---

### Step 2: Install Tailscale (WSL)

```bash
# In WSL Ubuntu terminal

# Add Tailscale repository
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/noble.noarmor.gpg | sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/noble.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list

# Install Tailscale
sudo apt-get update
sudo apt-get install -y tailscale

# Start Tailscale and authenticate
sudo tailscale up --accept-routes --advertise-exit-node=false

# Note: This will print a URL - open it in browser to authorize
# Use the SAME account as Windows Tailscale

# Verify installation
tailscale status
tailscale ip -4  # Should show 100.x.x.x IP

# Optional: Set hostname
sudo tailscale set --hostname orchestrator-mini-wsl
```

**Important**: Both Windows and WSL Tailscale will show in your Tailscale admin panel as separate devices initially, but they'll share the same machine identity.

---

### Step 3: Install Cloudflared (WSL)

```bash
# In WSL Ubuntu terminal

# Download and install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Verify installation
cloudflared --version

# Authenticate with Cloudflare (opens browser)
cloudflared tunnel login

# This will open a browser window
# Select your Cloudflare account and authorize
# Credentials will be saved to ~/.cloudflared/cert.pem
```

---

### Step 4: Create Cloudflare Tunnel

```bash
# Create a tunnel for the orchestrator
cloudflared tunnel create nyra-prod-orchestrator

# This will create a tunnel ID and credentials file:
# ~/.cloudflared/<TUNNEL_ID>.json

# Copy credentials to secure location
sudo mkdir -p /etc/cloudflared
sudo cp ~/.cloudflared/*.json /etc/cloudflared/
sudo chmod 600 /etc/cloudflared/*.json

# Note your tunnel ID
TUNNEL_ID=$(ls ~/.cloudflared/*.json | grep -oP '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
echo "Your Tunnel ID: $TUNNEL_ID"
```

---

### Step 5: Configure Cloudflared Ingress Rules

Create `/etc/cloudflared/config.yml`:

```bash
sudo tee /etc/cloudflared/config.yml > /dev/null <<EOF
tunnel: $TUNNEL_ID
credentials-file: /etc/cloudflared/$TUNNEL_ID.json

# Metrics for Prometheus
metrics: 0.0.0.0:2000

# Ingress rules for orchestrator services
ingress:
  # Nexus Router (Primary LLM Gateway)
  - hostname: nexus.nyra.yourdomain.com
    service: http://localhost:6000
    originRequest:
      connectTimeout: 30s
      noTLSVerify: false

  # Grafana (Monitoring Dashboard)
  - hostname: grafana.nyra.yourdomain.com
    service: http://localhost:3005

  # TwentyCRM
  - hostname: crm.nyra.yourdomain.com
    service: http://localhost:3000

  # Dify (AI Workflow Builder)
  - hostname: dify.nyra.yourdomain.com
    service: http://localhost:3001

  # n8n (Workflow Automation)
  - hostname: n8n.nyra.yourdomain.com
    service: http://localhost:5678

  # Prometheus (Metrics)
  - hostname: prometheus.nyra.yourdomain.com
    service: http://localhost:9090

  # Nyra Orchestrator API
  - hostname: api.nyra.yourdomain.com
    service: http://localhost:8000

  # Catch-all (required)
  - service: http_status:404
EOF
```

**Note**: Replace `yourdomain.com` with your actual domain, or use `*.trycloudflare.com` for free temporary subdomains.

---

### Step 6: Create DNS Records

```bash
# Route tunnel to DNS (repeat for each service)
cloudflared tunnel route dns nyra-prod-orchestrator nexus.nyra.yourdomain.com
cloudflared tunnel route dns nyra-prod-orchestrator grafana.nyra.yourdomain.com
cloudflared tunnel route dns nyra-prod-orchestrator crm.nyra.yourdomain.com
cloudflared tunnel route dns nyra-prod-orchestrator dify.nyra.yourdomain.com
cloudflared tunnel route dns nyra-prod-orchestrator n8n.nyra.yourdomain.com
cloudflared tunnel route dns nyra-prod-orchestrator prometheus.nyra.yourdomain.com
cloudflared tunnel route dns nyra-prod-orchestrator api.nyra.yourdomain.com
```

**Alternative**: Use Cloudflare Dashboard to manually create CNAME records pointing to `<TUNNEL_ID>.cfargotunnel.com`

---

### Step 7: Create Systemd Service (Cloudflared)

```bash
sudo tee /etc/systemd/system/cloudflared-orchestrator.service > /dev/null <<'EOF'
[Unit]
Description=Cloudflare Tunnel - Orchestrator Primary
After=network-online.target docker.service
Wants=network-online.target
Requires=docker.service

[Service]
Type=simple
User=ellisapotheosis
Group=ellisapotheosis
ExecStart=/usr/bin/cloudflared tunnel --config /etc/cloudflared/config.yml run nyra-prod-orchestrator
Restart=always
RestartSec=10s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cloudflared

# Resource limits
MemoryLimit=512M
CPUQuota=100%

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable cloudflared-orchestrator.service
```

---

### Step 8: Stand Up Docker Containers

```bash
# Navigate to project
cd ~/projects/project-nyra

# Create Docker network (if not exists)
docker network create nyra-network 2>/dev/null || true

# Copy environment template
cp infra/docker-compose/.env.example infra/docker-compose/.env

# Edit .env file with your credentials
nano infra/docker-compose/.env
# Update:
# - POSTGRES_PASSWORD
# - REDIS_PASSWORD
# - ANTHROPIC_API_KEY
# - OPENAI_API_KEY
# - Any other API keys

# Start all orchestration containers
docker compose -f infra/docker-compose.yml up -d

# Wait for services to start (30-60 seconds)
sleep 60

# Check container status
docker compose -f infra/docker-compose.yml ps
```

---

### Step 9: Start Cloudflared Tunnel

```bash
# Start the tunnel
sudo systemctl start cloudflared-orchestrator.service

# Check status
sudo systemctl status cloudflared-orchestrator.service

# View logs
sudo journalctl -u cloudflared-orchestrator -f

# Verify tunnel is connected
curl https://nexus.nyra.yourdomain.com/health
# Should return 200 OK if Nexus Router is running
```

---

### Step 10: Verify Network Connectivity

```bash
# Check Tailscale connectivity
tailscale status
tailscale ping 100.x.x.x  # Ping another device on your tailnet

# Check Cloudflared tunnel
curl https://nexus.nyra.yourdomain.com/health
curl https://grafana.nyra.yourdomain.com

# Check Docker services
docker compose -f infra/docker-compose.yml ps

# Test from Windows
# Open browser: https://grafana.nyra.yourdomain.com
# Should show Grafana login page
```

---

## 🔧 Configuration for GPU Workers

Once orchestrator is set up, configure each worker PC:

### Worker Setup (Same Steps on Each Worker)

1. **Install Tailscale** (Windows + WSL if applicable)
2. **Install Cloudflared** (for worker-specific services like Jupyter, Ollama UI)
3. **Create worker tunnel**: `cloudflared tunnel create nyra-dev-worker-rtx5090`
4. **Configure ingress rules** for worker services
5. **Start systemd service**

**See**: `bootstrap/worker-rtx5090/setup/distributed-setup/` for worker-specific scripts

---

## 🛡️ Security Best Practices

### Cloudflared Security

✅ **DO**:
- Store credentials in `/etc/cloudflared/` with `600` permissions
- Use systemd for automatic restart
- Enable Cloudflare Access for admin services
- Rotate credentials every 90 days
- Monitor tunnel health via Prometheus

❌ **DON'T**:
- Commit credentials to Git
- Run cloudflared as root
- Disable TLS verification
- Expose admin services without authentication

### Tailscale Security

✅ **DO**:
- Enable MFA on Tailscale account
- Use ACLs to restrict worker access
- Enable key expiry (90 days)
- Use tagged devices for automation
- Monitor access logs

❌ **DON'T**:
- Share auth keys publicly
- Disable device approval
- Use admin keys for workers
- Skip MFA setup

---

## 📊 Monitoring & Health Checks

### Check Tailscale Status

```bash
# In WSL
tailscale status
tailscale netcheck  # Network diagnostics

# List all devices
tailscale status --json | jq '.Peer[] | {HostName, TailscaleIPs}'
```

### Check Cloudflared Status

```bash
# Service status
sudo systemctl status cloudflared-orchestrator

# View logs
sudo journalctl -u cloudflared-orchestrator -n 50 --no-pager

# Check metrics (Prometheus format)
curl http://localhost:2000/metrics
```

### Check Docker Services

```bash
cd ~/projects/project-nyra

# Check all containers
docker compose -f infra/docker-compose.yml ps

# Check specific service logs
docker compose -f infra/docker-compose.yml logs -f nexus-router

# Health check all services
for service in nexus-router postgres redis; do
  echo "Checking $service..."
  docker compose -f infra/docker-compose.yml exec $service echo "OK" || echo "FAILED"
done
```

---

## 🔥 Troubleshooting

### Issue: Tailscale Not Connecting in WSL

**Error**: `tailscale up` hangs or fails

**Fix**:
```bash
# Check if tailscaled daemon is running
sudo systemctl status tailscaled

# If not running, start it
sudo systemctl start tailscaled

# If still failing, check logs
sudo journalctl -u tailscaled -n 50
```

### Issue: Cloudflared Tunnel Shows as Disconnected

**Error**: Dashboard shows tunnel offline

**Fix**:
```bash
# Check service is running
sudo systemctl status cloudflared-orchestrator

# Restart service
sudo systemctl restart cloudflared-orchestrator

# Check logs for errors
sudo journalctl -u cloudflared-orchestrator -n 100

# Verify credentials file exists
ls -la /etc/cloudflared/*.json

# Test tunnel manually
cloudflared tunnel --config /etc/cloudflared/config.yml run nyra-prod-orchestrator
```

### Issue: Docker Containers Not Accessible via Cloudflared

**Error**: 502 Bad Gateway when accessing subdomain

**Fix**:
```bash
# Verify Docker container is running
docker compose -f infra/docker-compose.yml ps nexus-router

# Check if service is listening on expected port
curl http://localhost:6000/health

# Check cloudflared can reach localhost
sudo docker exec -it $(docker ps -q -f name=cloudflared) curl http://host.docker.internal:6000/health

# Verify ingress rules in config
cat /etc/cloudflared/config.yml
```

### Issue: Windows and WSL Tailscale Conflict

**Error**: Two devices showing in Tailscale admin

**Fix**:
This is normal! Windows and WSL are separate network stacks. Both need Tailscale for full connectivity.

**Optimization**: You can disable one if only using Docker:
- Keep WSL Tailscale if only Docker needs access
- Keep Windows Tailscale if Windows apps need access
- Keep both for maximum flexibility (recommended)

---

## 🛰️ Tailscale-Served MCP Services (Split DNS)

Some MCP servers are intentionally NOT exposed via Cloudflare. They get private access
through Tailscale only — both a MagicDNS hostname (`*.trex-fiordland.ts.net`) and a
private Split DNS subdomain (`*.projectnyra.com`, resolved inside the tailnet only).

Currently configured Tailscale-private MCP services:

| Service            | MagicDNS                                | Split DNS                           | Port |
| ------------------ | --------------------------------------- | ----------------------------------- | ---- |
| `spline-mcp`       | `spline-mcp.trex-fiordland.ts.net`      | `spline-mcp.projectnyra.com`        | 8779 |
| `meshy-mcp`        | `meshy-mcp.trex-fiordland.ts.net`       | `meshy-mcp.projectnyra.com`         | 8780 |
| `loki-website-mcp` | `loki-website-mcp.trex-fiordland.ts.net`| `loki-website-mcp.projectnyra.com`  | 8781 |

### Step A: Give Each MCP Its Own MagicDNS Hostname (Tailscale Sidecar Pattern)

Each service needs to register as its own Tailscale device to get a unique `ts.net` hostname.
Add a Tailscale sidecar container to the MCP's Docker Compose service:

```yaml
# docker-compose fragment (repeat per MCP, changing TS_HOSTNAME and port)
services:
  spline-mcp-ts:
    image: tailscale/tailscale:latest
    hostname: spline-mcp
    environment:
      - TS_AUTHKEY=${TS_AUTHKEY_SPLINE_MCP}   # ephemeral key, tag:mcp-server
      - TS_HOSTNAME=spline-mcp
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_SERVE_CONFIG=/config/serve.json     # optional: auto-configure tailscale serve
    volumes:
      - spline-mcp-ts-state:/var/lib/tailscale
    cap_add: [NET_ADMIN, SYS_MODULE]
    network_mode: service:spline-mcp           # shares network namespace with the MCP container

  spline-mcp:
    image: your-spline-mcp-image
    ports:
      - "8779:8779"
```

After starting the sidecar, the device `spline-mcp` appears in the Tailscale admin console
and gets MagicDNS hostname `spline-mcp.trex-fiordland.ts.net` automatically.

### Step B: Expose the Port via `tailscale serve` (Optional — HTTPS on MagicDNS)

From inside the sidecar (or from the orchestrator WSL shell after `tailscale set --hostname spline-mcp`):

```bash
# Expose the MCP's HTTP port as HTTPS on the MagicDNS hostname
tailscale serve --bg https / http://localhost:8779

# Verify:
tailscale serve status
# Output should show: https://spline-mcp.trex-fiordland.ts.net/ -> http://localhost:8779
```

Repeat for meshy-mcp (8780) and loki-website-mcp (8781).

### Step C: Configure Tailscale Split DNS for `projectnyra.com`

Split DNS makes `spline-mcp.projectnyra.com` resolve privately inside the tailnet to the
MCP's Tailscale IP — without touching Cloudflare or public DNS.

**Option 1 — Point Split DNS to MagicDNS resolver (simplest)**

In the Tailscale admin console (login.tailscale.com/admin/dns):
1. Under "Nameservers" → "Add nameserver" → "Custom"
2. Set nameserver IP to `100.100.100.100` (Tailscale's own MagicDNS resolver)
3. Set the restricted domain to `projectnyra.com`
4. Save

Tailscale will now resolve `*.projectnyra.com` queries via MagicDNS inside the tailnet.
This means `spline-mcp.projectnyra.com` resolves to the Tailscale IP of the `spline-mcp`
device (same as `spline-mcp.trex-fiordland.ts.net`).

**Option 2 — Local CoreDNS with explicit A records (more control)**

Run a CoreDNS container on the orchestrator:

```yaml
# infra/docker-compose/coredns.yml fragment
services:
  coredns:
    image: coredns/coredns:latest
    ports:
      - "53:53/udp"
    volumes:
      - ./coredns/Corefile:/Corefile
      - ./coredns/zones:/zones
```

`/zones/projectnyra.com.db`:
```zone
$ORIGIN projectnyra.com.
@ 300 IN SOA ns1 admin 1 3600 900 604800 300
spline-mcp       300 IN A <tailscale-ip-of-spline-mcp>
meshy-mcp        300 IN A <tailscale-ip-of-meshy-mcp>
loki-website-mcp 300 IN A <tailscale-ip-of-loki-website-mcp>
```

Then in Tailscale admin DNS, set Split DNS nameserver for `projectnyra.com` to the
orchestrator's Tailscale IP (e.g., `100.64.0.10`) on port 53.

### Verification

```bash
# From any device on the tailnet:
tailscale status | grep -E "spline|meshy|loki-website"
# Should show the three nodes as connected

# DNS resolution:
dig spline-mcp.trex-fiordland.ts.net        # MagicDNS
dig spline-mcp.projectnyra.com              # Split DNS (private only)

# Reachability:
curl http://spline-mcp.trex-fiordland.ts.net:8779/
curl http://spline-mcp.projectnyra.com:8779/
```

Full setup reference: `docs/network/TAILSCALE-SERVICES.md`

---

## 📝 Next Steps

After completing this setup:

1. **Configure GPU Workers**: Repeat similar steps on Worker-RTX5090, RTX3090Ti
2. **Setup Wake-on-LAN**: Configure RTX3090Ti for on-demand wake (see `QUICK-REFERENCE-WOL.md`)
3. **Configure Cloudflare Access**: Setup authentication for admin services
4. **Setup Monitoring**: Import Grafana dashboards for Tailscale and Cloudflared metrics
5. **Test End-to-End**: Submit a test workload from orchestrator to workers
6. **Deploy MCP Tailscale sidecars**: Follow the Split DNS steps above for spline-mcp, meshy-mcp, loki-website-mcp

---

## 📚 Resources

- **Tailscale Docs**: https://tailscale.com/kb/
- **Cloudflared Docs**: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- **Project Setup Scripts**: `bootstrap/orchestrator-mini/setup/distributed-setup/`
- **Architecture Guide**: `docs/architecture/cloudflare-tunnel-architecture.md`
- **Docker Startup Guide**: `STARTUP-GUIDE.md`

---

**Status**: Ready for execution
**Estimated Setup Time**: 30-45 minutes
**Difficulty**: Intermediate
