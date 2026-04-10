# Cloudflare Tunnel Architecture for 4-PC Distributed Setup

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Author:** System Architecture Team

---

## Executive Summary

This document defines the Cloudflare tunnel integration strategy for Project Nyra's 4-PC distributed development environment, providing secure external access to production services on the orchestrator (10.0.0.1) and development UIs on worker machines (10.0.0.2-4).

**Key Benefits:**
- ✅ Secure zero-trust network access (no open firewall ports)
- ✅ TLS encryption for all traffic
- ✅ Granular access control per service
- ✅ High availability with tunnel redundancy
- ✅ Automatic failover and health monitoring
- ✅ Subdomain-based service routing

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Global Network                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  nyra.yourdomain.com (DNS Zone)                        │    │
│  │  ├── orchestrator.nyra.yourdomain.com                 │    │
│  │  ├── grafana.nyra.yourdomain.com                      │    │
│  │  ├── api.nyra.yourdomain.com                          │    │
│  │  ├── dev-rtx5090.nyra.yourdomain.com                  │    │
│  │  └── dev-rtx3060.nyra.yourdomain.com                  │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ Cloudflared Tunnels
                          │ (Encrypted QUIC/HTTP2)
                          │
    ┌─────────────────────┴─────────────────────┐
    │                     │                     │
┌───▼──────────────┐  ┌──▼──────────────┐  ┌──▼──────────────┐
│ Orchestrator     │  │ Worker-RTX5090  │  │ Worker-RTX3060  │
│ 10.0.0.1         │  │ 10.0.0.2        │  │ 10.0.0.3        │
│ ┌──────────────┐ │  │ ┌──────────────┐│  │ ┌──────────────┐│
│ │cloudflared   │ │  │ │cloudflared   ││  │ │cloudflared   ││
│ │  (Primary)   │ │  │ │  (Dev UI)    ││  │ │  (Dev UI)    ││
│ └──────────────┘ │  │ └──────────────┘│  │ └──────────────┘│
│                  │  │                  │  │                  │
│ Production       │  │ Dev Tools        │  │ Dev Tools        │
│ Services (40+)   │  │ - Jupyter       │  │ - Jupyter       │
│ - API Gateway    │  │ - Local LLM     │  │ - Local LLM     │
│ - Grafana        │  │ - Monitoring    │  │ - Monitoring    │
│ - Infisical      │  └──────────────────┘  └──────────────────┘
│ - Nexus Router   │
│ - PostgreSQL     │
│ - Redis          │
└──────────────────┘
```

---

## 1. Service Exposure Matrix

### 1.1 Orchestrator Services (10.0.0.1)

**All production services exposed with authentication**

| Service | Internal Port | Subdomain | Access Level | Authentication |
|---------|---------------|-----------|--------------|----------------|
| **Core APIs** | | | | |
| API Gateway | 3000 | api.nyra.yourdomain.com | Public (rate-limited) | API Key + JWT |
| Quote API | 8001 | quote-api.nyra.yourdomain.com | Authenticated | API Key |
| Admin API | 8002 | admin-api.nyra.yourdomain.com | Admin Only | JWT + MFA |
| **Observability** | | | | |
| Grafana | 3003 | grafana.nyra.yourdomain.com | Team | Grafana Auth |
| Prometheus | 9090 | prometheus.nyra.yourdomain.com | Admin Only | Cloudflare Access |
| Loki | 3100 | loki.nyra.yourdomain.com | Admin Only | Cloudflare Access |
| Jaeger | 16686 | jaeger.nyra.yourdomain.com | Team | Cloudflare Access |
| **Infrastructure** | | | | |
| Infisical | 8080 | secrets.nyra.yourdomain.com | Admin Only | Infisical Auth + MFA |
| Nexus Router | 8888 | nexus.nyra.yourdomain.com | Team | API Key |
| Claude Flow Dashboard | 8081 | archon-os.nyra.yourdomain.com | Team | Cloudflare Access |
| **Databases (Admin)** | | | | |
| pgAdmin | 5050 | pgadmin.nyra.yourdomain.com | Admin Only | pgAdmin Auth |
| Redis Commander | 8082 | redis.nyra.yourdomain.com | Admin Only | Cloudflare Access |
| **Applications** | | | | |
| RateHunter Landing | 3001 | ratehunter.nyra.yourdomain.com | Public | None (Marketing) |
| Nyra Admin | 3002 | admin.nyra.yourdomain.com | Admin Only | JWT + MFA |
| CRM Dashboard | 3004 | crm.nyra.yourdomain.com | Team | JWT |
| **MCP Servers** | | | | |
| MCP Gateway | 8090 | mcp.nyra.yourdomain.com | Internal Only | API Key |

### 1.2 Worker Services

**Development UIs only, restricted to team access**

#### Worker-RTX5090 (10.0.0.2)

| Service | Internal Port | Subdomain | Access Level |
|---------|---------------|-----------|--------------|
| Jupyter Lab | 8888 | jupyter-rtx5090.nyra.yourdomain.com | Team |
| Ollama UI | 11434 | ollama-rtx5090.nyra.yourdomain.com | Team |
| Text Gen WebUI | 7860 | textgen-rtx5090.nyra.yourdomain.com | Team |
| VS Code Server | 8443 | code-rtx5090.nyra.yourdomain.com | Team |

#### Worker-RTX3060 (10.0.0.3)

| Service | Internal Port | Subdomain | Access Level |
|---------|---------------|-----------|--------------|
| Jupyter Lab | 8888 | jupyter-rtx3060.nyra.yourdomain.com | Team |
| Ollama UI | 11434 | ollama-rtx3060.nyra.yourdomain.com | Team |
| Text Gen WebUI | 7860 | textgen-rtx3060.nyra.yourdomain.com | Team |
| VS Code Server | 8443 | code-rtx3060.nyra.yourdomain.com | Team |

#### Worker-RTX3090Ti (10.0.0.4)

**Note:** On-demand only (Wake-on-LAN). Tunnels auto-connect when PC wakes.

| Service | Internal Port | Subdomain | Access Level |
|---------|---------------|-----------|--------------|
| Training Dashboard | 6006 | tensorboard-rtx3090ti.nyra.yourdomain.com | Team |
| Compute Monitor | 8889 | compute-rtx3090ti.nyra.yourdomain.com | Team |

---

## 2. Tunnel Naming Scheme

### 2.1 Naming Convention

**Format:** `nyra-{environment}-{pc-identifier}`

```
nyra-prod-orchestrator          # Primary production tunnel
nyra-prod-orchestrator-backup   # Backup tunnel (HA)
nyra-dev-worker-rtx5090         # Development worker 1
nyra-dev-worker-rtx3060         # Development worker 2
nyra-compute-rtx3090ti          # On-demand compute worker
```

### 2.2 Tunnel Configuration

Each tunnel is a **unique Cloudflare Tunnel UUID** with:
- Dedicated credentials file
- Independent routing rules
- Separate health monitoring
- Individual access policies

---

## 3. Security Model

### 3.1 Authentication Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Cloudflare Access (Identity Provider)             │
│  - SSO via Google Workspace / GitHub / Okta                │
│  - Email-based OTP for admin                               │
│  - Device posture checks                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Application Authentication                         │
│  - JWT tokens for APIs                                      │
│  - Grafana built-in auth                                    │
│  - Infisical auth + MFA                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Rate Limiting & WAF                                │
│  - Per-IP rate limits (Cloudflare WAF)                     │
│  - DDoS protection (Cloudflare)                            │
│  - Bot detection                                            │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Access Policies

#### Public Services (Marketing)
- **Subdomain:** `ratehunter.nyra.yourdomain.com`
- **Access:** Open (rate-limited)
- **WAF:** Enabled (OWASP rules)
- **Rate Limit:** 100 req/min per IP

#### Team Services (Development)
- **Subdomains:** `grafana.nyra.yourdomain.com`, `crm.nyra.yourdomain.com`, etc.
- **Access:** Cloudflare Access + Email domain (@yourcompany.com)
- **MFA:** Optional (recommended)
- **Session:** 24 hours
- **Rate Limit:** 1000 req/min per user

#### Admin Services (Infrastructure)
- **Subdomains:** `secrets.nyra.yourdomain.com`, `admin-api.nyra.yourdomain.com`, etc.
- **Access:** Cloudflare Access + Explicit email list
- **MFA:** **Required**
- **Session:** 8 hours
- **Rate Limit:** 500 req/min per user
- **Audit Logging:** All access logged

#### Internal Services (MCP, Databases)
- **Subdomains:** `mcp.nyra.yourdomain.com`
- **Access:** Private (no external access)
- **API Key:** Required
- **IP Whitelist:** Orchestrator + worker IPs only

### 3.3 Network Security

```yaml
Zero Trust Network Access (ZTNA):
  - No open firewall ports on any PC
  - All traffic via Cloudflare Tunnel (encrypted QUIC/HTTP2)
  - Mutual TLS (mTLS) between cloudflared and Cloudflare
  - Origin certificate validation

Traffic Encryption:
  - TLS 1.3 (Cloudflare → Client)
  - QUIC/HTTP2 (Cloudflare → cloudflared)
  - End-to-end encryption

DDoS Protection:
  - Cloudflare's global network absorbs attacks
  - Automatic mitigation
  - Rate limiting per service
```

---

## 4. DNS Configuration

### 4.1 DNS Zone Structure

**Root Domain:** `nyra.yourdomain.com`

```
nyra.yourdomain.com                    A/AAAA   → Cloudflare proxy
├── api.nyra.yourdomain.com            CNAME    → <tunnel-id>.cfargotunnel.com
├── grafana.nyra.yourdomain.com        CNAME    → <tunnel-id>.cfargotunnel.com
├── admin.nyra.yourdomain.com          CNAME    → <tunnel-id>.cfargotunnel.com
├── secrets.nyra.yourdomain.com        CNAME    → <tunnel-id>.cfargotunnel.com
├── nexus.nyra.yourdomain.com          CNAME    → <tunnel-id>.cfargotunnel.com
├── prometheus.nyra.yourdomain.com     CNAME    → <tunnel-id>.cfargotunnel.com
├── jaeger.nyra.yourdomain.com         CNAME    → <tunnel-id>.cfargotunnel.com
├── pgadmin.nyra.yourdomain.com        CNAME    → <tunnel-id>.cfargotunnel.com
├── ratehunter.nyra.yourdomain.com     CNAME    → <tunnel-id>.cfargotunnel.com
├── crm.nyra.yourdomain.com            CNAME    → <tunnel-id>.cfargotunnel.com
├── archon-os.nyra.yourdomain.com    CNAME    → <tunnel-id>.cfargotunnel.com
├── jupyter-rtx5090.nyra.yourdomain.com CNAME   → <dev-tunnel-id>.cfargotunnel.com
├── jupyter-rtx3060.nyra.yourdomain.com CNAME   → <dev-tunnel-id>.cfargotunnel.com
├── ollama-rtx5090.nyra.yourdomain.com  CNAME   → <dev-tunnel-id>.cfargotunnel.com
└── textgen-rtx5090.nyra.yourdomain.com CNAME   → <dev-tunnel-id>.cfargotunnel.com
```

### 4.2 DNS Automation

**Using Cloudflare API to auto-create DNS records:**

```bash
# Create DNS record for each service
cloudflare-cli dns create \
  --type CNAME \
  --name api.nyra \
  --content <tunnel-id>.cfargotunnel.com \
  --proxied true \
  --zone nyra.yourdomain.com
```

---

## 5. High Availability Strategy

### 5.1 Tunnel Redundancy

**Primary-Backup Architecture:**

```yaml
Orchestrator (10.0.0.1):
  Primary Tunnel:
    - Name: nyra-prod-orchestrator
    - Replica: 2 cloudflared processes
    - Health Check: Every 10s
    - Auto-restart: systemd

  Backup Tunnel:
    - Name: nyra-prod-orchestrator-backup
    - Replica: 2 cloudflared processes
    - Standby mode (active if primary fails)
    - Health Check: Every 30s
```

**Traffic Flow:**
1. Primary tunnel serves all traffic
2. Cloudflare monitors tunnel health (heartbeat)
3. If primary tunnel fails → automatic failover to backup (< 5s)
4. Alert sent to ops team
5. Manual investigation and recovery

### 5.2 Tunnel Health Monitoring

**Health Check Endpoints:**

```yaml
Health Checks:
  - Endpoint: http://localhost:3000/health
  - Interval: 10 seconds
  - Timeout: 5 seconds
  - Unhealthy Threshold: 3 consecutive failures
  - Healthy Threshold: 2 consecutive successes

Metrics Exposed:
  - Tunnel uptime
  - Active connections
  - Request rate
  - Error rate
  - Latency (p50, p95, p99)
```

**Monitoring Integration:**

```
cloudflared metrics → Prometheus → Grafana Dashboard
                    → AlertManager → PagerDuty/Slack
```

### 5.3 Failover Scenarios

| Scenario | Detection | Mitigation | RTO |
|----------|-----------|------------|-----|
| Primary tunnel down | Health check failure | Automatic failover to backup tunnel | < 5s |
| Orchestrator PC offline | Connection timeout | Alert ops team, manual recovery | 5-15 min |
| Network partition | Cloudflare edge detection | Reroute traffic via alternate PoP | < 1s |
| DDoS attack | Cloudflare WAF | Automatic rate limiting + blocking | < 1s |
| SSL certificate expiry | Monitoring alert | Auto-renewal via Cloudflare API | N/A (automated) |

### 5.4 Disaster Recovery

**Orchestrator Backup Plan:**

1. **Daily Database Backups:**
   - PostgreSQL → S3 (automated)
   - Redis → RDB snapshots
   - Infisical → encrypted export

2. **Configuration Backup:**
   - Tunnel credentials → Infisical + S3
   - Docker Compose files → Git
   - Environment variables → Infisical

3. **Recovery Procedure:**
   ```bash
   # 1. Restore orchestrator from backup
   # 2. Re-install cloudflared
   # 3. Restore tunnel credentials
   # 4. Restart Docker services
   # 5. Verify tunnel connectivity
   # Total time: ~30 minutes
   ```

---

## 6. Implementation Plan

### 6.1 Phase 1: Orchestrator Setup (Week 1)

#### Step 1.1: Install Cloudflared on Orchestrator

**In WSL2 (Ubuntu):**

```bash
# Install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Authenticate with Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create nyra-prod-orchestrator

# Copy tunnel credentials to secure location
sudo mkdir -p /etc/cloudflared
sudo cp ~/.cloudflared/<tunnel-id>.json /etc/cloudflared/
sudo chmod 600 /etc/cloudflared/<tunnel-id>.json
```

#### Step 1.2: Configure Tunnel Routing

**Create `/etc/cloudflared/config.yml`:**

```yaml
tunnel: <tunnel-id>
credentials-file: /etc/cloudflared/<tunnel-id>.json

# Ingress rules for orchestrator services
ingress:
  # API Gateway
  - hostname: api.nyra.yourdomain.com
    service: http://localhost:3000
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s

  # Grafana
  - hostname: grafana.nyra.yourdomain.com
    service: http://localhost:3003

  # Infisical (Secrets)
  - hostname: secrets.nyra.yourdomain.com
    service: http://localhost:8080

  # Nexus Router
  - hostname: nexus.nyra.yourdomain.com
    service: http://localhost:8888

  # Prometheus
  - hostname: prometheus.nyra.yourdomain.com
    service: http://localhost:9090

  # Jaeger
  - hostname: jaeger.nyra.yourdomain.com
    service: http://localhost:16686

  # pgAdmin
  - hostname: pgadmin.nyra.yourdomain.com
    service: http://localhost:5050

  # RateHunter Landing
  - hostname: ratehunter.nyra.yourdomain.com
    service: http://localhost:3001

  # Admin Dashboard
  - hostname: admin.nyra.yourdomain.com
    service: http://localhost:3002

  # CRM Dashboard
  - hostname: crm.nyra.yourdomain.com
    service: http://localhost:3004

  # Claude Flow Dashboard
  - hostname: archon-os.nyra.yourdomain.com
    service: http://localhost:8081

  # Redis Commander
  - hostname: redis.nyra.yourdomain.com
    service: http://localhost:8082

  # Catch-all rule (required)
  - service: http_status:404
```

#### Step 1.3: Create Systemd Service

**Create `/etc/systemd/system/cloudflared-orchestrator.service`:**

```ini
[Unit]
Description=Cloudflare Tunnel - Orchestrator Primary
After=network-online.target docker.service
Wants=network-online.target
Requires=docker.service

[Service]
Type=simple
User=nyra
Group=nyra
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
```

**Enable and start:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudflared-orchestrator.service
sudo systemctl start cloudflared-orchestrator.service
sudo systemctl status cloudflared-orchestrator.service
```

#### Step 1.4: Create DNS Records

```bash
# Route tunnel to DNS
cloudflared tunnel route dns nyra-prod-orchestrator api.nyra.yourdomain.com
cloudflared tunnel route dns nyra-prod-orchestrator grafana.nyra.yourdomain.com
cloudflared tunnel route dns nyra-prod-orchestrator secrets.nyra.yourdomain.com
# ... (repeat for all subdomains)
```

### 6.2 Phase 2: Worker Tunnel Setup (Week 1-2)

#### Step 2.1: Worker-RTX5090 (10.0.0.2)

**Install and configure cloudflared (same as orchestrator):**

**Create `/etc/cloudflared/config-rtx5090.yml`:**

```yaml
tunnel: <dev-tunnel-id-5090>
credentials-file: /etc/cloudflared/<dev-tunnel-id-5090>.json

ingress:
  - hostname: jupyter-rtx5090.nyra.yourdomain.com
    service: http://localhost:8888

  - hostname: ollama-rtx5090.nyra.yourdomain.com
    service: http://localhost:11434

  - hostname: textgen-rtx5090.nyra.yourdomain.com
    service: http://localhost:7860

  - hostname: code-rtx5090.nyra.yourdomain.com
    service: http://localhost:8443

  - service: http_status:404
```

**Create systemd service:**

```bash
sudo nano /etc/systemd/system/cloudflared-rtx5090.service
# (same structure as orchestrator, different config file)

sudo systemctl enable cloudflared-rtx5090.service
sudo systemctl start cloudflared-rtx5090.service
```

#### Step 2.2: Worker-RTX3060 (10.0.0.3)

**Repeat same process with:**
- Tunnel: `nyra-dev-worker-rtx3060`
- Config: `/etc/cloudflared/config-rtx3060.yml`
- Subdomains: `jupyter-rtx3060.nyra.yourdomain.com`, etc.

#### Step 2.3: Worker-RTX3090Ti (10.0.0.4) - On-Demand

**Special configuration for wake-on-LAN:**

```yaml
# Only start cloudflared when PC is awake
# Use systemd timer instead of always-on service

[Unit]
Description=Cloudflare Tunnel - RTX3090Ti (On-Demand)
After=network-online.target

[Service]
Type=simple
ExecStart=/usr/bin/cloudflared tunnel --config /etc/cloudflared/config-rtx3090ti.yml run nyra-compute-rtx3090ti
Restart=no  # Don't auto-restart (on-demand only)
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Auto-start on wake:**

```bash
# Add to wake-gpu-worker.sh script
echo "Starting cloudflared tunnel..." >> "$LOG_FILE"
ssh nyra@10.0.0.4 "sudo systemctl start cloudflared-rtx3090ti.service"
```

### 6.3 Phase 3: Security & Access Policies (Week 2)

#### Step 3.1: Configure Cloudflare Access

**Navigate to Cloudflare Zero Trust dashboard:**

1. **Create Access Application for Team Services:**

```yaml
Name: Nyra Team Services
Domain: *.nyra.yourdomain.com (wildcard)
Exclude:
  - ratehunter.nyra.yourdomain.com  # Public
  - api.nyra.yourdomain.com         # Public API

Policy:
  Name: Team Members
  Action: Allow
  Include:
    - Email domain: @yourcompany.com
  Session Duration: 24 hours
  MFA: Optional
```

2. **Create Access Application for Admin Services:**

```yaml
Name: Nyra Admin Services
Domain:
  - secrets.nyra.yourdomain.com
  - admin-api.nyra.yourdomain.com
  - pgadmin.nyra.yourdomain.com
  - prometheus.nyra.yourdomain.com

Policy:
  Name: Admins Only
  Action: Allow
  Include:
    - Email: admin1@yourcompany.com
    - Email: admin2@yourcompany.com
  Session Duration: 8 hours
  MFA: Required (TOTP)
  Device Posture: Require corporate device
```

3. **Create Access Application for Internal Services:**

```yaml
Name: Nyra Internal Services
Domain: mcp.nyra.yourdomain.com

Policy:
  Name: Service-to-Service
  Action: Service Auth
  Include:
    - Service Token: <create service token>
  MFA: N/A (API-based)
```

#### Step 3.2: Configure WAF Rules

**Cloudflare Firewall Rules:**

```yaml
# Rule 1: Rate Limit Public API
Rule Name: Rate Limit API
Expression: (http.host eq "api.nyra.yourdomain.com")
Action: Rate Limit
Rate: 100 requests per 1 minute per IP

# Rule 2: Block Known Bad Bots
Rule Name: Block Bad Bots
Expression: (cf.bot_management.score lt 30)
Action: Block

# Rule 3: OWASP Core Rule Set
Rule Name: OWASP Protection
Managed Ruleset: Cloudflare OWASP Core Ruleset
Action: Block
```

### 6.4 Phase 4: Monitoring & Alerting (Week 3)

#### Step 4.1: Prometheus Metrics

**Expose cloudflared metrics:**

```yaml
# Add to /etc/cloudflared/config.yml
metrics: 0.0.0.0:2000  # Prometheus metrics endpoint
```

**Scrape in Prometheus:**

```yaml
# Add to prometheus.yml
scrape_configs:
  - job_name: 'cloudflared-orchestrator'
    static_configs:
      - targets: ['localhost:2000']
        labels:
          tunnel: 'orchestrator'

  - job_name: 'cloudflared-rtx5090'
    static_configs:
      - targets: ['10.0.0.2:2000']
        labels:
          tunnel: 'worker-rtx5090'
```

#### Step 4.2: Grafana Dashboard

**Import Cloudflare Tunnel Dashboard:**

```json
{
  "dashboard": {
    "title": "Cloudflare Tunnels - Project Nyra",
    "panels": [
      {
        "title": "Tunnel Status",
        "type": "stat",
        "targets": [
          {
            "expr": "cloudflared_tunnel_up",
            "legendFormat": "{{tunnel}}"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(cloudflared_tunnel_request_total[5m])",
            "legendFormat": "{{tunnel}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(cloudflared_tunnel_request_errors_total[5m])",
            "legendFormat": "{{tunnel}}"
          }
        ]
      }
    ]
  }
}
```

#### Step 4.3: AlertManager Rules

**Create `/etc/prometheus/alerts/cloudflare-tunnels.yml`:**

```yaml
groups:
  - name: cloudflare_tunnels
    interval: 30s
    rules:
      - alert: TunnelDown
        expr: cloudflared_tunnel_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Cloudflare Tunnel {{ $labels.tunnel }} is down"
          description: "Tunnel has been down for more than 1 minute"

      - alert: HighErrorRate
        expr: rate(cloudflared_tunnel_request_errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate on tunnel {{ $labels.tunnel }}"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(cloudflared_tunnel_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High latency on tunnel {{ $labels.tunnel }}"
          description: "P95 latency is {{ $value | humanizeDuration }}"
```

### 6.5 Phase 5: Backup Tunnel & HA (Week 3)

#### Step 5.1: Create Backup Tunnel

```bash
# Create backup tunnel
cloudflared tunnel create nyra-prod-orchestrator-backup

# Configure with same ingress rules
sudo cp /etc/cloudflared/config.yml /etc/cloudflared/config-backup.yml
# Update tunnel ID in config-backup.yml

# Create systemd service
sudo nano /etc/systemd/system/cloudflared-orchestrator-backup.service
# (same as primary, different config file)

sudo systemctl enable cloudflared-orchestrator-backup.service
sudo systemctl start cloudflared-orchestrator-backup.service
```

#### Step 5.2: Configure Load Balancing

**In Cloudflare Dashboard:**

1. Navigate to Traffic → Load Balancing
2. Create Load Balancer:

```yaml
Name: nyra-api-lb
Hostname: api.nyra.yourdomain.com
Pools:
  - Primary:
      Origin: <primary-tunnel-id>.cfargotunnel.com
      Weight: 1
      Monitor: /health (every 10s)
  - Backup:
      Origin: <backup-tunnel-id>.cfargotunnel.com
      Weight: 0 (standby)
      Monitor: /health (every 30s)

Failover: Automatic (primary fails → activate backup)
```

3. Repeat for all critical services (grafana, nexus, admin, etc.)

---

## 7. Operations & Maintenance

### 7.1 Daily Operations

**Monitoring Checklist:**
- [ ] Check tunnel status in Grafana dashboard
- [ ] Review error logs: `journalctl -u cloudflared-orchestrator -f`
- [ ] Verify DNS resolution: `dig api.nyra.yourdomain.com`
- [ ] Check Cloudflare Analytics for traffic patterns

### 7.2 Troubleshooting

**Common Issues:**

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Tunnel disconnected | 502/504 errors | Restart cloudflared: `sudo systemctl restart cloudflared-orchestrator` |
| DNS not resolving | `NXDOMAIN` | Verify DNS records in Cloudflare dashboard |
| High latency | Slow response times | Check origin health, restart Docker services |
| Authentication failures | Cloudflare Access blocks | Verify user email in Access policy |
| SSL errors | Certificate warnings | Regenerate origin certificate |

### 7.3 Backup & Recovery

**Weekly Backup:**
```bash
# Backup tunnel credentials
sudo cp /etc/cloudflared/*.json /opt/nyra/backups/cloudflared/

# Backup configuration
sudo cp /etc/cloudflared/*.yml /opt/nyra/backups/cloudflared/

# Upload to S3 (encrypted)
aws s3 sync /opt/nyra/backups/cloudflared/ s3://nyra-backups/cloudflared/ --sse AES256
```

**Recovery Procedure:**
```bash
# 1. Restore credentials
sudo cp /opt/nyra/backups/cloudflared/*.json /etc/cloudflared/

# 2. Restore configuration
sudo cp /opt/nyra/backups/cloudflared/*.yml /etc/cloudflared/

# 3. Restart tunnels
sudo systemctl restart cloudflared-orchestrator

# 4. Verify connectivity
curl https://api.nyra.yourdomain.com/health
```

---

## 8. Cost Analysis

**Cloudflare Tunnel Pricing (as of 2026):**

| Plan | Price | Features | Recommended For |
|------|-------|----------|-----------------|
| Free | $0/month | Unlimited tunnels, 50GB traffic/month | Development |
| Teams | $7/user/month | Unlimited traffic, Cloudflare Access, Audit logs | **Recommended** |
| Enterprise | Custom | Advanced DDoS, WAF, Bot Management | Large scale |

**Estimated Monthly Cost:**
- Teams Plan: $7 × 5 users = **$35/month**
- Load Balancer (optional): $5/month per LB × 3 = $15/month
- **Total: ~$50/month**

**Savings vs Traditional Setup:**
- No VPN server ($20/month)
- No static IP ($10/month)
- No VPN licenses ($15/user/month)
- **Net Savings: ~$60/month**

---

## 9. Security Best Practices

### 9.1 Tunnel Security

✅ **DO:**
- Store tunnel credentials in `/etc/cloudflared/` with `600` permissions
- Use systemd for automatic tunnel restart
- Enable metrics for monitoring
- Rotate tunnel credentials every 90 days
- Use service tokens for API-to-API communication

❌ **DON'T:**
- Commit tunnel credentials to Git
- Run cloudflared as root
- Disable TLS verification
- Use wildcard domains without Access policies
- Expose admin services without MFA

### 9.2 Access Policy Best Practices

✅ **DO:**
- Require MFA for admin services
- Use email domain authentication for team services
- Implement session timeout (8-24 hours)
- Enable device posture checks
- Audit access logs weekly

❌ **DON'T:**
- Use public access for sensitive services
- Share service tokens across environments
- Disable audit logging
- Allow passwordless authentication for admin
- Use overly broad wildcard policies

---

## 10. Future Enhancements

### Phase 6: Advanced Features (Q2 2026)

1. **Geo-Routing:**
   - Route US traffic to US edge
   - Route EU traffic to EU edge
   - Reduce latency by 30-50ms

2. **Advanced Load Balancing:**
   - Geographic steering
   - Custom origin health checks
   - Traffic steering based on response time

3. **Zero Trust Device Posture:**
   - Require corporate device enrollment
   - Check for OS updates
   - Verify antivirus status

4. **API Rate Limiting:**
   - Per-API-key rate limits
   - Tiered rate limits (free/pro/enterprise)
   - Quota management

5. **Advanced Analytics:**
   - User behavior analytics
   - Traffic pattern analysis
   - Security threat detection

---

## 11. Documentation & Training

### 11.1 Team Training

**Training Topics:**
1. Cloudflare Tunnel basics
2. DNS configuration
3. Access policy management
4. Troubleshooting common issues
5. Security best practices

**Training Materials:**
- [ ] Video walkthrough (30 min)
- [ ] Written documentation (this file)
- [ ] Hands-on lab environment
- [ ] Troubleshooting playbook

### 11.2 Runbooks

**Runbook: Tunnel Disconnected**
```markdown
1. Check tunnel status: `systemctl status cloudflared-orchestrator`
2. Check logs: `journalctl -u cloudflared-orchestrator -n 50`
3. Verify Docker services: `docker ps`
4. Restart tunnel: `systemctl restart cloudflared-orchestrator`
5. If still failing, activate backup tunnel
6. Notify team in Slack #ops channel
```

**Runbook: Adding New Service**
```markdown
1. Add service to Docker Compose
2. Update `/etc/cloudflared/config.yml` with new ingress rule
3. Create DNS record: `cloudflared tunnel route dns <tunnel> <subdomain>`
4. Add Cloudflare Access policy (if needed)
5. Restart cloudflared: `systemctl restart cloudflared-orchestrator`
6. Test: `curl https://<subdomain>/health`
7. Update documentation
```

---

## 12. Appendix

### A. Configuration Files

**See:**
- `infra/cloudflared/orchestrator/config.yml`
- `infra/cloudflared/worker-rtx5090/config.yml`
- `infra/cloudflared/worker-rtx3060/config.yml`
- `scripts/cloudflared/setup-tunnel.sh`
- `scripts/cloudflared/rotate-credentials.sh`

### B. Monitoring Dashboards

**Grafana Dashboards:**
- Cloudflare Tunnel Health (ID: 15011)
- Cloudflare Analytics (ID: 15012)
- Access Logs Dashboard (ID: 15013)

### C. API References

**Cloudflare Tunnel API:**
- [Tunnel API Docs](https://developers.cloudflare.com/api/operations/cloudflare-tunnel-list-tunnels)
- [DNS API Docs](https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records)
- [Access API Docs](https://developers.cloudflare.com/api/operations/access-applications-list-access-applications)

### D. Support Contacts

| Role | Name | Contact | Responsibilities |
|------|------|---------|------------------|
| DevOps Lead | TBD | devops@yourcompany.com | Infrastructure, tunnels |
| Security | TBD | security@yourcompany.com | Access policies, compliance |
| On-Call | Rotation | oncall@yourcompany.com | 24/7 incident response |

---

**Document Status:** ✅ Ready for Implementation
**Approval:** Pending
**Next Review:** 2026-04-15
