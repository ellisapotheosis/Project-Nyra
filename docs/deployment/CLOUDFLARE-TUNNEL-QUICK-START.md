# Cloudflare Tunnel Quick Start Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-15

---

## Overview

This guide provides a quick-start reference for setting up Cloudflare tunnels on your 4-PC distributed environment.

**Full Documentation:** [Cloudflare Tunnel Architecture](../architecture/cloudflare-tunnel-architecture.md)

---

## Prerequisites

- Cloudflare account with domain configured
- Cloudflare Teams plan ($7/user/month) or Free plan for testing
- All PCs connected to network (10.0.0.1-4)
- Docker services running on orchestrator

---

## Quick Setup (30 Minutes)

### Step 1: Orchestrator Setup (10.0.0.1)

**In WSL2 Ubuntu:**

```bash
# 1. Download and run setup script
cd /opt/nyra/project-nyra
sudo chmod +x scripts/cloudflared/setup-orchestrator-tunnel.sh

# 2. Edit domain name (IMPORTANT!)
sudo nano scripts/cloudflared/setup-orchestrator-tunnel.sh
# Change: DOMAIN="nyra.yourdomain.com"  # Replace with your actual domain

# 3. Run setup
sudo ./scripts/cloudflared/setup-orchestrator-tunnel.sh

# 4. Follow prompts to authenticate with Cloudflare
```

**What this does:**
- Installs cloudflared
- Creates tunnel: `nyra-prod-orchestrator`
- Configures 16 production services
- Creates systemd service for auto-start
- Routes DNS for all services

**Services Exposed:**
- `api.nyra.yourdomain.com` - API Gateway (port 3000)
- `grafana.nyra.yourdomain.com` - Grafana (port 3003)
- `secrets.nyra.yourdomain.com` - Infisical (port 8080)
- `prometheus.nyra.yourdomain.com` - Prometheus (port 9090)
- `admin.nyra.yourdomain.com` - Admin Dashboard (port 3002)
- `crm.nyra.yourdomain.com` - CRM Dashboard (port 3004)
- ... and 10 more services (see full list in architecture doc)

### Step 2: Worker Setup - RTX5090 (10.0.0.2)

**In WSL2 Ubuntu:**

```bash
# 1. Download setup script
cd ~/nyra/project-nyra
sudo chmod +x scripts/cloudflared/setup-worker-tunnel.sh

# 2. Edit domain name
sudo nano scripts/cloudflared/setup-worker-tunnel.sh
# Change: DOMAIN="nyra.yourdomain.com"

# 3. Run setup for RTX5090
sudo ./scripts/cloudflared/setup-worker-tunnel.sh rtx5090
```

**Services Exposed:**
- `jupyter-rtx5090.nyra.yourdomain.com` - Jupyter Lab
- `ollama-rtx5090.nyra.yourdomain.com` - Ollama UI
- `textgen-rtx5090.nyra.yourdomain.com` - Text Gen WebUI
- `code-rtx5090.nyra.yourdomain.com` - VS Code Server

### Step 3: Worker Setup - RTX3060 (10.0.0.3)

**Repeat same process:**

```bash
sudo ./scripts/cloudflared/setup-worker-tunnel.sh rtx3060
```

**Services Exposed:**
- `jupyter-rtx3060.nyra.yourdomain.com`
- `ollama-rtx3060.nyra.yourdomain.com`
- `textgen-rtx3060.nyra.yourdomain.com`
- `code-rtx3060.nyra.yourdomain.com`

### Step 4: Worker Setup - RTX3090Ti (10.0.0.4) - Optional

**For on-demand compute:**

```bash
sudo ./scripts/cloudflared/setup-worker-tunnel.sh rtx3090ti
```

**Note:** Tunnel is configured but not auto-started. Start manually when needed:

```bash
sudo systemctl start cloudflared-rtx3090ti
```

---

## Step 5: Configure Cloudflare Access (Security)

### 5.1 Public Services (No Auth)

**Navigate to:** Cloudflare Dashboard → Zero Trust → Access → Applications

1. **Create Application:**
   - Name: `Nyra Public Services`
   - Domain: `ratehunter.nyra.yourdomain.com`
   - Policy: `Allow Everyone`
   - Rate Limit: 100 req/min per IP

### 5.2 Team Services (Email Auth)

2. **Create Application:**
   - Name: `Nyra Team Services`
   - Domain:
     - `grafana.nyra.yourdomain.com`
     - `crm.nyra.yourdomain.com`
     - `archon-os.nyra.yourdomain.com`
     - `nexus.nyra.yourdomain.com`
     - `jupyter-rtx5090.nyra.yourdomain.com`
     - `jupyter-rtx3060.nyra.yourdomain.com`
     - `ollama-rtx5090.nyra.yourdomain.com`
     - `ollama-rtx3060.nyra.yourdomain.com`
     - `textgen-rtx5090.nyra.yourdomain.com`
     - `textgen-rtx3060.nyra.yourdomain.com`
     - `code-rtx5090.nyra.yourdomain.com`
     - `code-rtx3060.nyra.yourdomain.com`
   - Policy:
     - Action: `Allow`
     - Include: `Email domain: @yourcompany.com`
   - Session Duration: `24 hours`
   - MFA: `Optional`

### 5.3 Admin Services (MFA Required)

3. **Create Application:**
   - Name: `Nyra Admin Services`
   - Domain:
     - `secrets.nyra.yourdomain.com`
     - `admin-api.nyra.yourdomain.com`
     - `admin.nyra.yourdomain.com`
     - `pgadmin.nyra.yourdomain.com`
     - `prometheus.nyra.yourdomain.com`
     - `redis.nyra.yourdomain.com`
   - Policy:
     - Action: `Allow`
     - Include:
       - `Email: admin1@yourcompany.com`
       - `Email: admin2@yourcompany.com`
   - Session Duration: `8 hours`
   - MFA: **Required** (TOTP)

### 5.4 Internal Services (Service Auth)

4. **Create Application:**
   - Name: `Nyra Internal Services`
   - Domain: `mcp.nyra.yourdomain.com`
   - Policy:
     - Action: `Service Auth`
     - Include: `Service Token` (create one)

---

## Verification

### Check Tunnel Status

```bash
# Orchestrator
sudo systemctl status cloudflared-orchestrator

# Worker RTX5090
sudo systemctl status cloudflared-rtx5090

# Worker RTX3060
sudo systemctl status cloudflared-rtx3060
```

### Test Service Access

```bash
# Public API (no auth)
curl https://api.nyra.yourdomain.com/health

# Team service (requires browser + auth)
# Open in browser: https://grafana.nyra.yourdomain.com

# Admin service (requires browser + auth + MFA)
# Open in browser: https://secrets.nyra.yourdomain.com
```

### View Tunnel Logs

```bash
# Orchestrator
journalctl -u cloudflared-orchestrator -f

# Worker
journalctl -u cloudflared-rtx5090 -f
```

### View Tunnel Metrics

```bash
# Prometheus metrics (on each PC)
curl http://localhost:2000/metrics
```

---

## Monitoring Setup

### Add to Prometheus

**Edit `infra/prometheus/prometheus.yml`:**

```yaml
scrape_configs:
  # Existing configs...

  # Cloudflare Tunnels
  - job_name: 'cloudflared-orchestrator'
    static_configs:
      - targets: ['localhost:2000']
        labels:
          tunnel: 'orchestrator'
          pc: '10.0.0.1'

  - job_name: 'cloudflared-rtx5090'
    static_configs:
      - targets: ['10.0.0.2:2000']
        labels:
          tunnel: 'worker-rtx5090'
          pc: '10.0.0.2'

  - job_name: 'cloudflared-rtx3060'
    static_configs:
      - targets: ['10.0.0.3:2000']
        labels:
          tunnel: 'worker-rtx3060'
          pc: '10.0.0.3'
```

**Restart Prometheus:**

```bash
cd /opt/nyra/project-nyra/infra
docker compose restart prometheus
```

### Grafana Dashboard

1. **Navigate to:** Grafana → Dashboards → Import
2. **Import Dashboard ID:** `15011` (Cloudflare Tunnel Metrics)
3. **Select Data Source:** Prometheus
4. **Import**

---

## Troubleshooting

### Tunnel Not Starting

```bash
# Check logs
journalctl -u cloudflared-orchestrator -n 50

# Common issues:
# 1. Missing credentials
sudo ls -la /etc/cloudflared/
sudo cat /etc/cloudflared/config.yml

# 2. Docker not running
docker ps

# 3. Port conflict
sudo netstat -tulpn | grep 2000
```

### Service Not Accessible

```bash
# 1. Check tunnel status
sudo systemctl status cloudflared-orchestrator

# 2. Check DNS
dig api.nyra.yourdomain.com

# 3. Check Docker service
docker ps | grep <service-name>
curl http://localhost:<port>/health

# 4. Check Cloudflare Access policy
# Navigate to: Cloudflare Dashboard → Zero Trust → Access → Applications
```

### High Latency

```bash
# 1. Check tunnel metrics
curl http://localhost:2000/metrics | grep latency

# 2. Check Docker resource usage
docker stats

# 3. Restart tunnel
sudo systemctl restart cloudflared-orchestrator
```

---

## Daily Operations

### Check Tunnel Health

```bash
# Quick health check
sudo systemctl is-active cloudflared-orchestrator && echo "✅ Orchestrator tunnel is running"
sudo systemctl is-active cloudflared-rtx5090 && echo "✅ RTX5090 tunnel is running"
sudo systemctl is-active cloudflared-rtx3060 && echo "✅ RTX3060 tunnel is running"
```

### Restart Tunnel

```bash
# Orchestrator
sudo systemctl restart cloudflared-orchestrator

# Worker
sudo systemctl restart cloudflared-rtx5090
```

### View Real-Time Metrics

```bash
# Watch tunnel status
watch -n 5 'curl -s http://localhost:2000/metrics | grep cloudflared_tunnel_up'

# Or use Grafana dashboard
# https://grafana.nyra.yourdomain.com/d/cloudflare-tunnels
```

---

## Adding New Services

### Example: Add n8n Workflow Engine

1. **Add to Docker Compose** (already done)

2. **Update Cloudflared Config:**

```bash
sudo nano /etc/cloudflared/config.yml
```

Add before the catch-all rule:

```yaml
  - hostname: n8n.nyra.yourdomain.com
    service: http://localhost:5678
```

3. **Route DNS:**

```bash
cloudflared tunnel route dns nyra-prod-orchestrator n8n.nyra.yourdomain.com
```

4. **Add Cloudflare Access Policy** (if needed)

5. **Restart Tunnel:**

```bash
sudo systemctl restart cloudflared-orchestrator
```

6. **Test:**

```bash
curl https://n8n.nyra.yourdomain.com
```

---

## High Availability (Optional)

### Setup Backup Tunnel

```bash
# Create backup tunnel
cloudflared tunnel create nyra-prod-orchestrator-backup

# Copy and modify config
sudo cp /etc/cloudflared/config.yml /etc/cloudflared/config-backup.yml
# Update tunnel ID in config-backup.yml

# Create systemd service
sudo nano /etc/systemd/system/cloudflared-orchestrator-backup.service
# Same as primary, but use config-backup.yml

# Enable and start
sudo systemctl enable cloudflared-orchestrator-backup
sudo systemctl start cloudflared-orchestrator-backup
```

**Configure Load Balancer in Cloudflare:**
- Navigate to: Traffic → Load Balancing
- Create load balancer for critical services
- Add primary and backup origins
- Set failover rules

---

## Cost Estimate

### Cloudflare Teams Plan

| Item | Cost |
|------|------|
| Teams Plan (5 users) | $35/month |
| Load Balancer (optional) | $15/month |
| **Total** | **~$50/month** |

### Savings vs Traditional Setup

| Traditional | Cloudflare |
|-------------|------------|
| VPN Server: $20/month | **Included** |
| Static IP: $10/month | **Included** |
| VPN Licenses: $75/month | **$35/month** |
| **Total: $105/month** | **$50/month** |

**Net Savings:** ~$55/month (~$660/year)

---

## Next Steps

1. ✅ Complete tunnel setup (orchestrator + workers)
2. ✅ Configure Cloudflare Access policies
3. ⏳ Add Prometheus monitoring
4. ⏳ Create Grafana dashboard
5. ⏳ Setup backup tunnel for HA
6. ⏳ Configure rate limiting rules
7. ⏳ Enable WAF rules for security

---

## Resources

- **Full Architecture:** [docs/architecture/cloudflare-tunnel-architecture.md](../architecture/cloudflare-tunnel-architecture.md)
- **Cloudflare Tunnel Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Cloudflare Access Docs:** https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/
- **Setup Scripts:**
  - Orchestrator: `scripts/cloudflared/setup-orchestrator-tunnel.sh`
  - Worker: `scripts/cloudflared/setup-worker-tunnel.sh`

---

**Questions?** See [troubleshooting section](#troubleshooting) or check tunnel logs.
