# Cloudflare Tunnel Setup - Orchestrator

**Last Updated**: 2026-01-15
**Setup Time**: ~20-30 minutes
**Difficulty**: Easy

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Cloudflare Account Setup](#-cloudflare-account-setup)
3. [Install cloudflared](#-install-cloudflared)
4. [Create Tunnel](#-create-tunnel)
5. [Configure Services](#-configure-services)
6. [DNS Configuration](#-dns-configuration)
7. [Access Policies](#-access-policies)
8. [Auto-Start Configuration](#-auto-start-configuration)
9. [Verification](#-verification)

---

## ✅ Prerequisites

Before starting:

- [ ] Cloudflare account (free) - [Sign up](https://dash.cloudflare.com/sign-up)
- [ ] Domain name added to Cloudflare
- [ ] Orchestrator PC running with Docker services
- [ ] SSH access to orchestrator (10.0.0.1)
- [ ] Services you want to expose are running

### Services to Expose (Example)

| Service | Port | Purpose | Access Level |
|---------|------|---------|--------------|
| Nexus Router | 3000 | API Gateway | Restricted |
| Grafana | 3003 | Monitoring | Admin Only |
| n8n | 5678 | Workflow Automation | Admin Only |
| Infisical | 8080 | Secrets Management | Admin Only |
| Quote API | 8001 | Public API | Public + Rate Limited |

---

## 🌐 Cloudflare Account Setup

### Step 1: Add Your Domain

1. **Log in to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Sign in or create account

2. **Add Site**
   ```
   Dashboard → Add Site
   Enter your domain: example.com
   Select Free Plan → Continue
   ```

3. **Update Nameservers**
   - Cloudflare provides nameservers (e.g., `violet.ns.cloudflare.com`)
   - Go to your domain registrar
   - Update nameservers to Cloudflare's
   - Wait for propagation (5-60 minutes)

4. **Verify Domain**
   ```bash
   # Check nameservers
   nslookup -type=ns example.com

   # Should show Cloudflare nameservers
   ```

### Step 2: Configure SSL/TLS

```
Dashboard → SSL/TLS
Mode: Full (strict)  # Recommended for production
```

**SSL/TLS Mode Options**:
- **Flexible** - Cloudflare ↔ Client: HTTPS, Cloudflare ↔ Origin: HTTP
- **Full** - End-to-end HTTPS with self-signed origin cert
- **Full (strict)** - End-to-end HTTPS with valid origin cert (recommended)

---

## 🔧 Install cloudflared

### On Orchestrator (WSL2 Ubuntu)

**SSH into orchestrator**:
```bash
ssh nyra@10.0.0.1
```

**Install cloudflared**:
```bash
# Download latest cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Install
sudo dpkg -i cloudflared.deb

# Verify installation
cloudflared --version
# Should show: cloudflared version 2024.x.x
```

**Authenticate with Cloudflare**:
```bash
cloudflared tunnel login
```

This will:
1. Open browser for authentication
2. Ask you to select your domain
3. Save credentials to `~/.cloudflared/cert.pem`

**Troubleshooting**: If browser doesn't open automatically:
```bash
# Copy the URL shown in terminal
# Open manually in browser
# Complete authentication
```

---

## 🚇 Create Tunnel

### Step 1: Create Named Tunnel

```bash
# Create tunnel
cloudflared tunnel create nyra-orchestrator

# Output:
# Tunnel credentials written to /home/nyra/.cloudflared/<UUID>.json
# Created tunnel nyra-orchestrator with id <UUID>
```

**Save the Tunnel ID** - you'll need it!

### Step 2: List Tunnels

```bash
# Verify tunnel creation
cloudflared tunnel list

# Output:
# ID                                   NAME               CREATED              CONNECTIONS
# <UUID>                               nyra-orchestrator  2026-01-15T10:00:00Z 0
```

---

## ⚙️ Configure Services

### Step 1: Create Configuration File

```bash
# Create config directory
sudo mkdir -p /etc/cloudflared
sudo chown nyra:nyra /etc/cloudflared

# Create config file
nano ~/.cloudflared/config.yml
```

### Step 2: Configuration Examples

#### Basic Configuration (Single Service)

```yaml
# ~/.cloudflared/config.yml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: /home/nyra/.cloudflared/<YOUR-TUNNEL-ID>.json

ingress:
  # Grafana
  - hostname: grafana.example.com
    service: http://localhost:3003

  # Catch-all rule (required)
  - service: http_status:404
```

#### Advanced Configuration (Multiple Services)

```yaml
# ~/.cloudflared/config.yml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: /home/nyra/.cloudflared/<YOUR-TUNNEL-ID>.json

# Performance tuning
protocol: quic  # Use QUIC for better performance
no-autoupdate: false  # Allow automatic updates

# Logging
loglevel: info
logfile: /var/log/cloudflared.log

# Metrics
metrics: localhost:9090

# Service routing
ingress:
  # API Gateway (Nexus Router)
  - hostname: api.example.com
    service: http://localhost:3000
    originRequest:
      connectTimeout: 30s
      noTLSVerify: false

  # Grafana Dashboard
  - hostname: grafana.example.com
    service: http://localhost:3003
    originRequest:
      connectTimeout: 10s

  # n8n Workflows
  - hostname: n8n.example.com
    service: http://localhost:5678
    originRequest:
      connectTimeout: 60s

  # Infisical Secrets
  - hostname: secrets.example.com
    service: http://localhost:8080

  # Quote API (Public)
  - hostname: quotes.example.com
    service: http://localhost:8001
    originRequest:
      connectTimeout: 5s

  # Catch-all rule (required - always last)
  - service: http_status:404
```

#### Path-Based Routing (Alternative)

```yaml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: /home/nyra/.cloudflared/<YOUR-TUNNEL-ID>.json

ingress:
  # Single domain, multiple paths
  - hostname: nyra.example.com
    path: /api/*
    service: http://localhost:3000

  - hostname: nyra.example.com
    path: /grafana/*
    service: http://localhost:3003

  - hostname: nyra.example.com
    path: /n8n/*
    service: http://localhost:5678

  # Default for nyra.example.com
  - hostname: nyra.example.com
    service: http://localhost:8080

  # Catch-all
  - service: http_status:404
```

### Step 3: Validate Configuration

```bash
# Check syntax
cloudflared tunnel ingress validate

# Test ingress rules
cloudflared tunnel ingress rule https://grafana.example.com
# Should show: http://localhost:3003
```

---

## 🌐 DNS Configuration

### Automatic DNS (Recommended)

```bash
# Create DNS records for all ingress rules
cloudflared tunnel route dns nyra-orchestrator grafana.example.com
cloudflared tunnel route dns nyra-orchestrator n8n.example.com
cloudflared tunnel route dns nyra-orchestrator secrets.example.com
cloudflared tunnel route dns nyra-orchestrator quotes.example.com
cloudflared tunnel route dns nyra-orchestrator api.example.com

# Verify DNS creation
cloudflared tunnel route list
```

### Manual DNS (Cloudflare Dashboard)

1. **Navigate to DNS**
   ```
   Dashboard → Your Domain → DNS → Records
   ```

2. **Add CNAME Records**

   For each service:
   ```
   Type: CNAME
   Name: grafana (or subdomain)
   Target: <TUNNEL-ID>.cfargotunnel.com
   Proxy: Proxied (orange cloud)
   TTL: Auto
   ```

3. **Example Records**

   | Type | Name | Target | Proxy |
   |------|------|--------|-------|
   | CNAME | grafana | <TUNNEL-ID>.cfargotunnel.com | ✅ |
   | CNAME | n8n | <TUNNEL-ID>.cfargotunnel.com | ✅ |
   | CNAME | secrets | <TUNNEL-ID>.cfargotunnel.com | ✅ |
   | CNAME | quotes | <TUNNEL-ID>.cfargotunnel.com | ✅ |
   | CNAME | api | <TUNNEL-ID>.cfargotunnel.com | ✅ |

### Verify DNS Propagation

```bash
# Check DNS records
dig grafana.example.com

# Or use Cloudflare's DNS checker
nslookup grafana.example.com 1.1.1.1
```

---

## 🔐 Access Policies

### Step 1: Enable Cloudflare Access

1. **Navigate to Zero Trust**
   ```
   Dashboard → Zero Trust → Access → Applications
   ```

2. **Create Application**
   ```
   Add an Application → Self-hosted
   ```

### Step 2: Configure Admin Application

**Application Configuration**:
```
Name: Nyra Admin Services
Subdomain: grafana, n8n, secrets
Domain: example.com

Application Type: Self-hosted

Session Duration: 24 hours
```

**Access Policies**:

#### Policy 1: Allow Admin Email
```yaml
Rule name: Admin Users
Action: Allow
Include:
  - Emails: admin@example.com, developer@example.com
Exclude: (none)
Require: (none)
```

#### Policy 2: Block Countries
```yaml
Rule name: Block High-Risk Countries
Action: Block
Include:
  - Everyone
Exclude:
  - Countries: United States, Canada, United Kingdom
```

#### Policy 3: IP Allowlist (Optional)
```yaml
Rule name: Office Network
Action: Allow
Include:
  - IP ranges: 203.0.113.0/24
```

### Step 3: Configure Public API Application

**Application Configuration**:
```
Name: Quote API (Public)
Subdomain: quotes
Domain: example.com

Application Type: Self-hosted
Session Duration: 1 hour
```

**Access Policies**:
```yaml
Rule name: Public Access
Action: Allow
Include:
  - Everyone
Require:
  - Rate limiting: 1000 requests per hour
```

### Step 4: Service Tokens (CI/CD Access)

**Create Service Token**:
```
Zero Trust → Access → Service Auth → Service Tokens
→ Create Service Token

Name: GitHub Actions CI
Duration: 1 year
```

**Save the token** (shown only once):
```
Client ID: abc123...
Client Secret: def456...
```

**Use in GitHub Actions**:
```yaml
- name: Access Nyra API
  env:
    CF_ACCESS_CLIENT_ID: ${{ secrets.CF_CLIENT_ID }}
    CF_ACCESS_CLIENT_SECRET: ${{ secrets.CF_CLIENT_SECRET }}
  run: |
    curl -H "CF-Access-Client-Id: $CF_ACCESS_CLIENT_ID" \
         -H "CF-Access-Client-Secret: $CF_ACCESS_CLIENT_SECRET" \
         https://api.example.com/health
```

---

## 🚀 Auto-Start Configuration

### Step 1: Create systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/cloudflared.service
```

**Service configuration**:
```ini
[Unit]
Description=Cloudflare Tunnel
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=nyra
Group=nyra
ExecStart=/usr/local/bin/cloudflared --config /home/nyra/.cloudflared/config.yml tunnel run
Restart=always
RestartSec=10s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cloudflared

# Security hardening
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### Step 2: Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable cloudflared

# Start service
sudo systemctl start cloudflared

# Check status
sudo systemctl status cloudflared

# Expected output:
# ● cloudflared.service - Cloudflare Tunnel
#    Loaded: loaded (/etc/systemd/system/cloudflared.service; enabled)
#    Active: active (running) since...
```

### Step 3: View Logs

```bash
# Real-time logs
sudo journalctl -u cloudflared -f

# Last 100 lines
sudo journalctl -u cloudflared -n 100

# Filter by date
sudo journalctl -u cloudflared --since "1 hour ago"
```

**Expected log output**:
```
INFO Registered tunnel connection
INFO Each HA connection's tunnel IDs: map[0:UUID 1:UUID 2:UUID 3:UUID]
INFO Tunnel is now connected
```

---

## ✅ Verification

### Step 1: Check Tunnel Status

```bash
# Via CLI
cloudflared tunnel info nyra-orchestrator

# Should show:
# - Tunnel ID
# - Created date
# - Connections: 4 (expected)
```

**In Cloudflare Dashboard**:
```
Zero Trust → Networks → Tunnels
→ nyra-orchestrator should show "Healthy" with 4 connections
```

### Step 2: Test Service Access

#### From External Browser

```bash
# Test each service
https://grafana.example.com
https://n8n.example.com
https://secrets.example.com
https://quotes.example.com
```

**Expected**:
- ✅ HTTPS padlock (SSL working)
- ✅ Cloudflare Access login page (for protected services)
- ✅ Service loads correctly after authentication

#### From Command Line

```bash
# Test DNS
dig grafana.example.com +short
# Should show Cloudflare IPs

# Test HTTPS
curl -I https://grafana.example.com
# Should show HTTP/2 200 (or 302 redirect to Access)

# Test API endpoint
curl https://quotes.example.com/health
# Should show: {"status":"ok"}
```

### Step 3: Performance Testing

```bash
# Install hey (HTTP load testing)
sudo apt install hey

# Test throughput
hey -n 1000 -c 10 https://quotes.example.com/health

# Expected:
# - 200 OK responses
# - < 100ms latency (with Cloudflare cache)
# - No errors
```

### Step 4: Monitor Tunnel Health

**Cloudflare Dashboard**:
```
Zero Trust → Networks → Tunnels → nyra-orchestrator
→ View metrics:
  - Requests per second
  - Bytes transferred
  - Connection status
  - Error rate
```

**Tunnel Metrics Endpoint** (if enabled):
```bash
curl http://localhost:9090/metrics

# Look for:
# cloudflared_tunnel_total_requests
# cloudflared_tunnel_response_by_code
# cloudflared_tunnel_user_bytes_sent
```

---

## 🔍 Troubleshooting

### Tunnel Not Connecting

```bash
# Check service status
sudo systemctl status cloudflared

# Check logs
sudo journalctl -u cloudflared -n 50

# Common issues:
# - Credentials file path incorrect
# - Network connectivity issues
# - Firewall blocking outbound QUIC (UDP 7844)
```

**Solution**:
```bash
# Test connection manually
cloudflared tunnel run nyra-orchestrator

# Should show connection success
# If not, check credentials and network
```

### DNS Not Resolving

```bash
# Check DNS records
cloudflared tunnel route list

# Verify propagation
dig grafana.example.com @1.1.1.1

# Clear DNS cache (local)
sudo systemd-resolve --flush-caches
```

### Service Not Accessible

```bash
# Test service locally first
curl http://localhost:3003  # Grafana

# Test ingress rules
cloudflared tunnel ingress rule https://grafana.example.com

# Check service is running
docker ps | grep grafana

# Check port binding
sudo netstat -tlnp | grep 3003
```

### Access Policy Issues

1. **Check Application Settings**
   - Verify subdomain matches
   - Check session duration
   - Review policy order (first match wins)

2. **Test Without Access**
   ```
   Dashboard → Application → Settings
   → Temporarily disable Access
   → Test direct access
   ```

3. **Check Access Logs**
   ```
   Zero Trust → Logs → Access
   → Filter by application
   → Look for blocked requests
   ```

---

## 📊 Monitoring Setup

### Enable Advanced Monitoring

**In config.yml**:
```yaml
# Add metrics endpoint
metrics: localhost:9090

# Add structured logging
loglevel: info
```

### Prometheus Integration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'cloudflared'
    static_configs:
      - targets: ['localhost:9090']
```

### Grafana Dashboard

```
Import Dashboard ID: 17798
Source: Cloudflare Tunnel Metrics
```

**Key Metrics to Monitor**:
- Tunnel connection status
- Requests per second
- Error rate
- Latency percentiles (p50, p95, p99)
- Bytes transferred

---

## 🎯 Next Steps

1. **[Setup Workers](./CLOUDFLARE-SETUP-WORKERS.md)** - Configure laptop access
2. **[Troubleshooting Guide](./CLOUDFLARE-TROUBLESHOOTING.md)** - Common issues
3. **Configure Monitoring** - Set up Grafana dashboards
4. **Implement Rate Limiting** - Protect public APIs
5. **Setup Alerting** - Monitor tunnel health

---

## 📚 Related Documentation

- **[Overview](./CLOUDFLARE-TUNNELS.md)** - Architecture and benefits
- **[Worker Setup](./CLOUDFLARE-SETUP-WORKERS.md)** - Worker configuration
- **[Troubleshooting](./CLOUDFLARE-TROUBLESHOOTING.md)** - Common issues

---

**Congratulations!** Your orchestrator is now securely accessible via Cloudflare Tunnel. 🎉
