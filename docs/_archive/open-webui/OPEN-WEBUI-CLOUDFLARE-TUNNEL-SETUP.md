# Open WebUI Deployment via Cloudflare Tunnel - RateHunter.net

**Last Updated**: 2026-01-18
**Domain**: ratehunter.net
**Subdomain**: `chat.ratehunter.net` (recommended) or `openwebui.ratehunter.net`

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Prerequisites](#-prerequisites)
3. [Architecture Overview](#-architecture-overview)
4. [Step-by-Step Deployment](#-step-by-step-deployment)
5. [Cloudflare Configuration](#-cloudflare-configuration)
6. [Verification](#-verification)
7. [Troubleshooting](#-troubleshooting)
8. [Security Considerations](#-security-considerations)
9. [Maintenance](#-maintenance)

---

## 🚀 Quick Start

**For the impatient**: Run these commands on your orchestrator PC (10.0.0.1):

```bash
# 1. Start Open WebUI
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
.\start-ui.ps1

# 2. Add Cloudflare tunnel ingress rule (see Step 4 below)
# 3. Route DNS (see Step 5 below)
# 4. Configure Cloudflare Access (see Step 6 below)
# 5. Access at https://chat.ratehunter.net
```

---

## ✅ Prerequisites

### Required:
- ✅ **Cloudflare Account** with ratehunter.net domain configured
- ✅ **Cloudflare Teams Plan** (for Cloudflare Access policies)
- ✅ **Cloudflared Installed** on orchestrator PC (10.0.0.1)
- ✅ **Cloudflare Tunnel Created** (`nyra-orchestrator` tunnel)
- ✅ **Docker Desktop/Engine** running on orchestrator PC
- ✅ **Infisical Configured** with required secrets
- ✅ **PostgreSQL Database** running (for Open WebUI data)
- ✅ **Nexus Router** running (for LLM API routing)

### Verify Prerequisites:

```powershell
# Check Docker is running
docker ps

# Check cloudflared is installed
cloudflared --version

# Check existing tunnel
cloudflared tunnel list

# Check Infisical authentication
infisical login status

# Check PostgreSQL is running
docker ps | grep postgres

# Check Nexus Router is running
docker ps | grep nexus-router
```

---

## 🏗️ Architecture Overview

```
User Browser
    ↓ HTTPS
Cloudflare Edge (chat.ratehunter.net)
    ↓ Cloudflare Tunnel (TLS encrypted)
Orchestrator PC (10.0.0.1)
    ↓ Docker Network (nyra-network)
┌─────────────────────────────────────────┐
│ Open WebUI Container                    │
│ - Port: 3333:8080                       │
│ - Auth: Cloudflare Access               │
│ ├─→ Nexus Router (LLM API routing)     │
│ ├─→ PostgreSQL (data persistence)       │
│ └─→ Infisical (secrets management)      │
└─────────────────────────────────────────┘
```

### Network Flow:
1. **External Access**: `https://chat.ratehunter.net`
2. **Cloudflare Tunnel**: Encrypts traffic to `http://nyra-open-webui:3333`
3. **Docker Internal**: Container name resolution via `nyra-network`
4. **Nexus Router**: LLM API calls routed through `http://nexus-router:6000/v1`
5. **Database**: PostgreSQL for user data, conversations, settings

---

## 📝 Step-by-Step Deployment

### Step 1: Start Open WebUI Container

Navigate to the Docker directory and run the startup script:

```powershell
# Navigate to docker directory
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker

# Start Open WebUI with Infisical secret injection
.\start-ui.ps1

# Verify container is running
docker ps | grep nyra-open-webui

# Check logs
docker logs nyra-open-webui --tail=50

# Test local access (should return HTML)
curl http://localhost:3333
```

**Expected Output**:
```
✅ UI services started successfully!

📊 Services:
   • Open-WebUI:    http://localhost:3333
   • LobeChat:      http://localhost:3334
```

**Container Details**:
- **Image**: `ghcr.io/open-webui/open-webui:main`
- **Container Name**: `nyra-open-webui`
- **Internal Port**: 8080
- **External Port**: 3333
- **Network**: `nyra-network`
- **Health Check**: `http://localhost:3333/health`

---

### Step 2: Update Cloudflared Configuration

You have two options for updating the cloudflared configuration:

#### Option A: Edit Existing Tunnel Config (Recommended)

Edit the orchestrator tunnel configuration file:

**Location**: `bootstrap/orchestrator-mini/docker/configs/cloudflared/config.yml`

Add the Open WebUI ingress rule **before the catch-all rule** (`- service: http_status:404`):

```yaml
ingress:
  # ... existing rules ...

  # Open WebUI - AI Interface
  - hostname: chat.ratehunter.net
    service: http://nyra-open-webui:3333
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s
      keepAliveTimeout: 90s
      httpHostHeader: chat.ratehunter.net

  # Catch-all rule (MUST be last)
  - service: http_status:404
```

#### Option B: Use Centralized Config File

Edit the centralized tunnel configuration:

**Location**: `configs/cloudflared/tunnel-configs.yml`

Update the orchestrator section:

```yaml
orchestrator:
  tunnel_name: "nyra-orchestrator"
  credentials_file: "/app/secrets/cloudflared-orchestrator.json"
  ingress:
    # Main orchestrator API
    - hostname: "nyra-orchestrator.ratehunter.net"
      service: "http://nyra-orchestrator:8000"
      originRequest:
        noTLSVerify: true
        connectTimeout: 30s

    # Open WebUI - AI Chat Interface
    - hostname: "chat.ratehunter.net"
      service: "http://nyra-open-webui:3333"
      originRequest:
        noTLSVerify: true
        connectTimeout: 30s
        keepAliveTimeout: 90s
        httpHostHeader: chat.ratehunter.net

    # Web UI (existing)
    - hostname: "nyra.ratehunter.net"
      service: "http://nyra-webui:3000"
      originRequest:
        noTLSVerify: true
        connectTimeout: 30s

    # ... other services ...

    # Catch-all (MUST be last)
    - service: "http_status:404"
```

**Important Configuration Options**:
- `noTLSVerify: true` - Required for Docker internal communication
- `connectTimeout: 30s` - Timeout for establishing connection
- `keepAliveTimeout: 90s` - Keep connections alive for performance
- `httpHostHeader` - Ensures Open WebUI receives correct host header

---

### Step 3: Restart Cloudflared Service

After updating the configuration, restart the cloudflared service:

```powershell
# If running as Docker container
docker restart cloudflared-orchestrator

# If running as systemd service (Linux)
sudo systemctl restart cloudflared-orchestrator

# Verify tunnel is running
cloudflared tunnel info nyra-orchestrator

# Check tunnel logs
docker logs cloudflared-orchestrator --tail=50

# OR for systemd
sudo journalctl -u cloudflared-orchestrator -n 50 -f
```

**Verify the ingress rule was loaded**:
Look for log entries showing the new hostname:
```
Registered tunnel connection
connIndex=0 connection=<UUID> ip=198.41.200.13 location=ORD
Registered route: chat.ratehunter.net -> http://nyra-open-webui:3333
```

---

### Step 4: Configure DNS Routing

Route the subdomain to your Cloudflare tunnel:

```bash
# Route DNS for Open WebUI
cloudflared tunnel route dns nyra-orchestrator chat.ratehunter.net

# Verify DNS routing
cloudflared tunnel route ip show nyra-orchestrator
```

**Expected Output**:
```
Successfully routed DNS record for chat.ratehunter.net to tunnel nyra-orchestrator
```

**Verify DNS Propagation**:
```bash
# Check DNS resolution (may take 1-5 minutes)
nslookup chat.ratehunter.net

# Should return Cloudflare IPs (e.g., 104.21.x.x or 172.67.x.x)
```

---

### Step 5: Configure Cloudflare Access Policy

**IMPORTANT**: Configure Cloudflare Access to control who can access Open WebUI.

#### Recommended Policy: Team Services (Email Auth)

Navigate to Cloudflare Zero Trust Dashboard:
1. Go to https://one.dash.cloudflare.com/
2. Select your account → **Access** → **Applications**
3. Click **Add an application** → **Self-hosted**

**Application Configuration**:
```yaml
Application Name: Open WebUI - AI Chat
Session Duration: 24 hours
Application Domain: chat.ratehunter.net
Identity Providers: [Your email provider, e.g., Google Workspace]

Access Policy:
  Name: Allow Team Members
  Action: Allow
  Include:
    - Emails ending in: @yourdomain.com
  Require:
    - Email verification

  Session Settings:
    - Duration: 24 hours
    - Idle Timeout: 8 hours
```

#### Alternative Policy Options:

**Option 1: Public Access (Not Recommended for Production)**
```yaml
Access Policy:
  Name: Allow All (Public)
  Action: Allow
  Include:
    - Everyone

Rate Limiting:
  - 100 requests per minute per IP
```

**Option 2: Admin Access (MFA Required)**
```yaml
Access Policy:
  Name: Admin Only
  Action: Allow
  Include:
    - Emails: [admin@yourdomain.com, ...]
  Require:
    - Email verification
    - MFA (TOTP)

  Session Settings:
    - Duration: 8 hours
    - Idle Timeout: 2 hours
```

**Apply the policy**:
1. Click **Add policy**
2. Configure as shown above
3. Click **Save application**

---

### Step 6: Verification

#### Test Internal Access (from orchestrator PC):
```bash
# Test container is responding
curl http://localhost:3333/health

# Expected: {"status":"healthy"}

# Test via container name (from another container)
docker run --rm --network nyra-network curlimages/curl:latest \
  curl -v http://nyra-open-webui:3333/health
```

#### Test External Access (from any device):

1. **Navigate to**: https://chat.ratehunter.net
2. **Authenticate** via Cloudflare Access (if configured)
3. **Create Account** (first user becomes admin)
4. **Test Chat**:
   - Send a message to verify LLM integration
   - Check response from Nexus Router

**Expected Flow**:
```
1. Browser → https://chat.ratehunter.net
2. Cloudflare Access → Email verification prompt
3. After auth → Open WebUI interface
4. Send message → Routes through Nexus Router → Claude/OpenAI
5. Receive response → Displayed in chat
```

#### Verify LLM Integration:

```bash
# Check Open WebUI logs for API calls
docker logs nyra-open-webui --tail=100 | grep "API request"

# Check Nexus Router logs
docker logs nexus-router --tail=100 | grep "open-webui"

# Test API endpoint directly
curl -X POST http://localhost:3333/api/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 🔍 Troubleshooting

### Issue 1: Cannot Access chat.ratehunter.net

**Symptoms**:
- Browser shows "This site can't be reached" or "ERR_NAME_NOT_RESOLVED"

**Diagnosis**:
```bash
# Check DNS resolution
nslookup chat.ratehunter.net

# Check tunnel status
cloudflared tunnel info nyra-orchestrator

# Check ingress rules
cloudflared tunnel route ip show nyra-orchestrator
```

**Solutions**:
1. **DNS not propagated**: Wait 5-10 minutes, clear DNS cache
   ```bash
   # Windows
   ipconfig /flushdns

   # macOS/Linux
   sudo killall -HUP mDNSResponder
   ```

2. **DNS not routed**: Re-run DNS routing command
   ```bash
   cloudflared tunnel route dns nyra-orchestrator chat.ratehunter.net
   ```

3. **Tunnel not running**: Restart cloudflared
   ```bash
   docker restart cloudflared-orchestrator
   ```

---

### Issue 2: 502 Bad Gateway Error

**Symptoms**:
- Cloudflare loads but shows "502 Bad Gateway"

**Diagnosis**:
```bash
# Check Open WebUI is running
docker ps | grep nyra-open-webui

# Check container health
docker inspect nyra-open-webui | grep Health -A 10

# Check logs for errors
docker logs nyra-open-webui --tail=50
```

**Solutions**:
1. **Container not running**: Start Open WebUI
   ```bash
   cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
   .\start-ui.ps1
   ```

2. **Container unhealthy**: Check dependencies
   ```bash
   # Verify PostgreSQL is running
   docker ps | grep postgres

   # Verify Nexus Router is running
   docker ps | grep nexus-router

   # Restart Open WebUI
   docker restart nyra-open-webui
   ```

3. **Wrong service URL in config**: Verify ingress rule
   - Should be: `http://nyra-open-webui:3333` (container name + port)
   - NOT: `http://localhost:3333` or `http://127.0.0.1:3333`

---

### Issue 3: Cloudflare Access Loop

**Symptoms**:
- Redirects back to access page after authentication
- "Access Denied" message

**Solutions**:
1. **Session cookie issues**: Clear browser cookies for ratehunter.net
2. **Email not in policy**: Add your email to the Access policy
3. **Policy not applied**: Wait 2-3 minutes for policy propagation
4. **Wrong domain in policy**: Ensure policy domain matches `chat.ratehunter.net`

---

### Issue 4: LLM API Errors

**Symptoms**:
- Can access Open WebUI but get "API Error" when sending messages

**Diagnosis**:
```bash
# Check Nexus Router logs
docker logs nexus-router --tail=100

# Check Open WebUI environment variables
docker inspect nyra-open-webui | grep -A 20 "Env"

# Verify API endpoint configuration
curl http://localhost:3333/api/config
```

**Solutions**:
1. **Nexus Router not running**:
   ```bash
   docker ps | grep nexus-router
   # If not running, start it
   docker start nexus-router
   ```

2. **Wrong API endpoint**: Verify environment variable in docker-compose.ui.yml:
   ```yaml
   OPENAI_API_BASE_URL: http://nexus-router:${NEXUS_ROUTER_PORT}/v1
   ```
   Should resolve to: `http://nexus-router:6000/v1`

3. **API key missing**: Check Infisical has `ANTHROPIC_API_KEY` configured
   ```bash
   infisical secrets list --env=dev --path=/shared
   ```

---

## 🔐 Security Considerations

### 1. Authentication & Authorization

**Recommended Setup**:
- ✅ **Enable Cloudflare Access** with email verification
- ✅ **Disable self-registration** in Open WebUI (`ENABLE_SIGNUP: "false"`)
- ✅ **First user becomes admin** - create admin account immediately
- ✅ **Use team email domain** restriction (@yourdomain.com)
- ⚠️ **Consider MFA** for production environments

**Open WebUI Settings**:
```yaml
environment:
  ENABLE_SIGNUP: "false"           # Disable public registration
  WEBUI_SECRET_KEY: ${SESSION_SECRET}  # Secure session key from Infisical
```

---

### 2. Network Security

**Docker Network Isolation**:
```bash
# Open WebUI only accessible via:
# 1. Cloudflare tunnel (external)
# 2. Docker internal network (nyra-network)
# 3. Host port 3333 (localhost only)

# Verify network configuration
docker network inspect nyra-network
```

**Firewall Rules**:
```powershell
# Block external access to port 3333
# Only allow Cloudflare tunnel and localhost

# Windows Firewall
netsh advfirewall firewall add rule name="Block Open WebUI External" dir=in action=block protocol=TCP localport=3333 remoteip=any

netsh advfirewall firewall add rule name="Allow Open WebUI Localhost" dir=in action=allow protocol=TCP localport=3333 remoteip=127.0.0.1
```

---

### 3. Secrets Management

**Using Infisical**:
- ✅ All API keys stored in Infisical
- ✅ Secrets injected at runtime via `infisical run`
- ✅ No secrets in docker-compose files
- ✅ Secrets rotated regularly (90-day cycle)

**Required Secrets**:
```bash
# Check Infisical configuration
infisical secrets list --env=dev --path=/shared

# Required keys:
# - DATABASE_URL
# - ANTHROPIC_API_KEY
# - OPENROUTER_API_KEY (optional)
# - SESSION_SECRET
# - NEXUS_ROUTER_PORT
# - OPEN_WEBUI_PORT
```

---

### 4. TLS/SSL Configuration

**Cloudflare Tunnel Security**:
- ✅ End-to-end encryption via Cloudflare tunnel
- ✅ TLS 1.3 from client to Cloudflare
- ✅ Encrypted tunnel from Cloudflare to origin
- ✅ No exposed ports on public internet
- ✅ Automatic certificate management

**Internal Communication**:
```yaml
originRequest:
  noTLSVerify: true  # OK for Docker internal network
  # External traffic is TLS-encrypted via Cloudflare
```

---

### 5. Rate Limiting

**Cloudflare Rate Limiting** (recommended):
```yaml
Rate Limiting Rules:
  - Path: /api/*
    Limit: 100 requests per minute per IP
    Action: Challenge (CAPTCHA)

  - Path: /login
    Limit: 5 requests per minute per IP
    Action: Block
```

**Configure in Cloudflare Dashboard**:
1. Go to **Security** → **WAF** → **Rate limiting rules**
2. Create rule for `chat.ratehunter.net`
3. Set appropriate limits based on expected usage

---

### 6. Audit Logging

**Enable Cloudflare Access Logs**:
```yaml
Cloudflare Zero Trust → Logs → Access Requests
  - Enable: Authentication logs
  - Retention: 30 days
  - Export to: [SIEM/S3/logging service]
```

**Open WebUI Logs**:
```bash
# Container logs
docker logs nyra-open-webui -f

# Save logs to file
docker logs nyra-open-webui > open-webui-logs-$(date +%Y%m%d).log
```

---

## 🔧 Maintenance

### Regular Tasks

#### Daily:
```bash
# Check service health
docker ps | grep nyra-open-webui
curl http://localhost:3333/health
```

#### Weekly:
```bash
# Update Open WebUI image
docker pull ghcr.io/open-webui/open-webui:main
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
.\start-ui.ps1 -Down
.\start-ui.ps1

# Check logs for errors
docker logs nyra-open-webui --tail=100 | grep ERROR
```

#### Monthly:
```bash
# Backup Open WebUI data
docker exec nyra-open-webui tar czf /tmp/backup.tar.gz /app/backend/data
docker cp nyra-open-webui:/tmp/backup.tar.gz ./backups/

# Review Cloudflare Access logs
# Check for suspicious authentication attempts

# Rotate API keys (via Infisical)
# Update DATABASE_URL, ANTHROPIC_API_KEY, etc.
```

---

### Backup and Recovery

#### Backup Strategy:

**1. Database Backup** (PostgreSQL):
```bash
# Backup PostgreSQL database
docker exec nyra-postgres pg_dump -U postgres -d openwebui > open-webui-db-backup-$(date +%Y%m%d).sql

# Restore
docker exec -i nyra-postgres psql -U postgres -d openwebui < open-webui-db-backup-20260118.sql
```

**2. Container Data Backup**:
```bash
# Backup Open WebUI volume
docker run --rm -v open_webui_data:/data -v $(pwd):/backup ubuntu tar czf /backup/open-webui-data-$(date +%Y%m%d).tar.gz /data

# Restore
docker run --rm -v open_webui_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/open-webui-data-20260118.tar.gz -C /
```

**3. Configuration Backup**:
```bash
# Backup configurations
cp -r bootstrap/orchestrator-mini/docker/configs/cloudflared backups/cloudflared-$(date +%Y%m%d)/
cp infra/docker/docker-compose.ui.yml backups/docker-compose-ui-$(date +%Y%m%d).yml
```

---

### Disaster Recovery

#### Recovery Steps:

**1. Container Failure**:
```bash
# Stop and remove failed container
docker stop nyra-open-webui
docker rm nyra-open-webui

# Restart with clean state
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
.\start-ui.ps1
```

**2. Database Corruption**:
```bash
# Stop Open WebUI
docker stop nyra-open-webui

# Restore database from backup
docker exec -i nyra-postgres psql -U postgres -d openwebui < backups/open-webui-db-backup-latest.sql

# Restart Open WebUI
docker start nyra-open-webui
```

**3. Complete System Failure**:
```bash
# 1. Reinstall Docker
# 2. Restore cloudflared configuration
cp backups/cloudflared-latest/* bootstrap/orchestrator-mini/docker/configs/cloudflared/

# 3. Restore database
# 4. Restore Open WebUI data volume
# 5. Restart services
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
.\start-ui.ps1
```

---

## 📊 Monitoring

### Health Checks

**Docker Health Check**:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

**External Monitoring**:
```bash
# Uptime monitoring (e.g., UptimeRobot)
# Monitor: https://chat.ratehunter.net/health
# Alert if: Down for > 5 minutes
```

---

### Metrics Collection

**Cloudflare Analytics**:
- Navigate to: **Cloudflare Dashboard** → **Analytics**
- Monitor:
  - Request volume
  - Response times
  - Error rates (4xx, 5xx)
  - Bandwidth usage

**Prometheus Metrics** (optional):
```yaml
# Add Prometheus exporter to Open WebUI
# Monitor:
# - API request latency
# - LLM token usage
# - User session duration
# - Error rates
```

---

## 🎯 Next Steps

After successful deployment:

1. **✅ Create Admin Account**: First user becomes admin
2. **✅ Configure Models**: Add Claude, GPT-4, etc. via Nexus Router
3. **✅ Set Up RAG**: Enable document upload and embedding search
4. **✅ Customize Interface**: Branding, themes, settings
5. **✅ Train Users**: Share access, create user guides
6. **✅ Monitor Usage**: Set up alerts, review logs regularly
7. **✅ Plan Backups**: Automate daily database backups

---

## 📚 Related Documentation

- [Open WebUI Deployment Plan](./OPEN-WEBUI-DEPLOYMENT-PLAN.md) - Comprehensive deployment guide
- [Cloudflare Tunnel Quick Start](./CLOUDFLARE-TUNNEL-QUICK-START.md) - General tunnel setup
- [Backend Infrastructure Audit](./BACKEND-INFRASTRUCTURE-AUDIT-2026-01-18.md) - Infrastructure overview
- [Manual Setup Guide](../operations/MANUAL-SETUP-GUIDE.md) - Complete system setup

---

## 🔗 External Resources

- [Open WebUI Documentation](https://docs.openwebui.com/)
- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare Access Policies](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [Docker Networking](https://docs.docker.com/network/)
- [Infisical Documentation](https://infisical.com/docs)

---

## 📝 Changelog

- **2026-01-18**: Initial guide created for ratehunter.net deployment
- **Future**: Will add monitoring dashboards, advanced RAG configuration, multi-model support

---

**Deployment Status**: ✅ Ready for production use

**Recommended Subdomain**: `chat.ratehunter.net` (user-friendly, memorable)

**Estimated Setup Time**: 30-45 minutes (first time), 10 minutes (subsequent deployments)

**Support**: For issues, see [Troubleshooting](#-troubleshooting) section or check Docker logs
