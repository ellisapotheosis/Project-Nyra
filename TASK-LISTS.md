# Project Nyra Task Lists

**Generated:** January 24, 2026  
**Purpose:** Comprehensive breakdown of tasks that require user action vs tasks AI agents can complete autonomously

---

## 📋 Table of Contents

1. [User Required Tasks](#user-required-tasks-manual-action-needed)
2. [AI Agent Automatable Tasks](#ai-agent-automatable-tasks)
3. [Priority Matrix](#priority-matrix)
4. [Current Status Summary](#current-status-summary)

---

## ⚠️ User Required Tasks (Manual Action Needed)

These tasks **cannot** be completed by AI agents and require your direct involvement due to authentication, external service access, or business decisions.

### 🔐 1. Secrets & Authentication Setup

#### 1.1 Infisical Configuration
**Why User Required:** Requires manual login and secret creation in external service

- [ ] **Review and validate all secrets in Infisical** (Priority: CRITICAL)
  - Current location: `docs/configuration/infisical-secrets-management/`
  - Action: Log into Infisical dashboard and verify each secret
  - Known placeholders that need real values:
    - `ANTHROPIC_API_KEY` - Get from Anthropic Console
    - `OPENAI_API_KEY` - Get from OpenAI Dashboard  
    - `GITHUB_TOKEN` - Generate Personal Access Token (repo scope)
    - `CLOUDFLARE_API_TOKEN` - Get from Cloudflare Dashboard (Account.Access: Read & Edit)
    - `CF_ACCOUNT_ID` - Find in Cloudflare Dashboard URL
    - `CF_ACCESS_APP_ID` - Get from Cloudflare Zero Trust console
    - `SENTRY_API_TOKEN` - Generate from Sentry Settings
    - `CODECOV_TOKEN` - Get from Codecov project settings
    - `POSTGRES_PASSWORD` - Currently set, verify if secure
    - All Twilio credentials (ACCOUNT_SID, AUTH_TOKEN, PHONE_NUMBER)
    - All SendGrid credentials (API_KEY, FROM_EMAIL)
    - LendingTree, Rocket Mortgage, FreeRateUpdate API credentials

#### 1.2 Service Account Setup
**Why User Required:** Requires access to external platforms

- [ ] **Create GitHub OAuth App for Cloudflare Pages** (Priority: HIGH)
  - Navigate to: `https://github.com/settings/developers`
  - Create new OAuth App named "Project Nyra - Cloudflare Integration"
  - Set Homepage URL: `https://ratehunter.net`
  - Set Authorization callback URL: `https://api.ratehunter.net/oauth/github/callback`
  - Save Client ID and Client Secret to Infisical

- [ ] **Configure Cloudflare Access Application** (Priority: HIGH)
  - Log into Cloudflare Zero Trust dashboard
  - Create Access Application for `admin.ratehunter.net`
  - Set authentication method (Google Workspace, GitHub, or Email)
  - Define access policies (only allow your team's emails)
  - Save Application ID to Infisical as `CF_ACCESS_APP_ID`

- [ ] **Setup Google Workspace API Access** (Priority: MEDIUM)
  - Ref: `docs/setup/google-workspace-integration.md`
  - Create project in Google Cloud Console
  - Enable Gmail API and Google Calendar API
  - Create OAuth 2.0 credentials
  - Download credentials JSON and store securely

- [ ] **Configure Twilio Account** (Priority: HIGH)
  - Purchase phone number for SMS/Voice
  - Enable Twilio Verify for 2FA
  - Configure webhook URLs for incoming messages
  - Test SMS delivery to your personal phone

- [ ] **Setup SendGrid/Twilio Email** (Priority: HIGH)
  - Verify sender domain: `ratehunter.net`
  - Complete domain authentication (SPF, DKIM, DMARC)
  - Create API key with full email sending permissions
  - Test email delivery to your personal email

### 🖥️ 2. Physical Infrastructure Setup

#### 2.1 Orchestrator PC (Minisforum UH680)
**Why User Required:** Requires physical access to hardware

- [ ] **Install Ubuntu 22.04 LTS Server** (Priority: CRITICAL)
  - Boot from USB installer
  - Partition: 200GB swap, remainder ext4 root
  - Create user: `nyra-admin`
  - Enable SSH during installation
  - Set hostname: `nyra-orchestrator`

- [ ] **Install base software stack** (Priority: CRITICAL)
  ```bash
  # Run these commands on orchestrator
  sudo apt update && sudo apt upgrade -y
  sudo apt install -y docker.io docker-compose git curl wget build-essential
  sudo usermod -aG docker $USER
  sudo systemctl enable docker
  ```

- [ ] **Configure static IP and DNS** (Priority: HIGH)
  - Set static IP in router: `192.168.1.100` for orchestrator
  - Configure DNS to point `nyra.local` to orchestrator
  - Test connectivity from other PCs on LAN

- [ ] **Setup Wake-on-LAN** (Priority: MEDIUM)
  - Enable WOL in BIOS/UEFI
  - Install `ethtool`: `sudo apt install ethtool`
  - Configure network interface for WOL
  - Test magic packet from worker PC

#### 2.2 GPU Worker PCs Setup
**Why User Required:** Requires physical access to hardware

- [ ] **Worker 1 (RTX 5090 - Alienware Area-51)** (Priority: HIGH)
  - Install Ubuntu 22.04 LTS Desktop
  - Install NVIDIA drivers (version 550+)
  - Install CUDA Toolkit 12.4
  - Test GPU with `nvidia-smi`
  - Set static IP: `192.168.1.111`

- [ ] **Worker 2 (RTX 3090Ti - Desktop PC)** (Priority: HIGH)
  - Install Ubuntu 22.04 LTS Desktop
  - Install NVIDIA drivers (version 550+)
  - Install CUDA Toolkit 12.4
  - Test GPU with `nvidia-smi`
  - Set static IP: `192.168.1.112`

- [ ] **Worker 3 (RTX 3060 - M15R7 Laptop)** (Priority: HIGH)
  - Install Ubuntu 22.04 LTS Desktop
  - Install NVIDIA drivers (version 550+)
  - Install CUDA Toolkit 12.4
  - Test GPU with `nvidia-smi`
  - Set static IP: `192.168.1.113`

### 🌐 3. Networking & External Services

#### 3.1 Tailscale Configuration
**Why User Required:** Requires account login and authorization

- [ ] **Create Tailscale account and configure** (Priority: CRITICAL)
  - Sign up at: `https://login.tailscale.com/`
  - Install on all 4 PCs: `curl -fsSL https://tailscale.com/install.sh | sh`
  - Authenticate each PC: `sudo tailscale up`
  - Configure ACLs in Tailscale admin console:
    ```json
    {
      "acls": [
        {
          "action": "accept",
          "src": ["tag:orchestrator"],
          "dst": ["tag:worker:*"]
        },
        {
          "action": "accept",
          "src": ["tag:worker"],
          "dst": ["tag:orchestrator:8000,6379,5432"]
        }
      ]
    }
    ```
  - Tag machines: orchestrator, worker1, worker2, worker3

#### 3.2 Cloudflare Tunnel Setup
**Why User Required:** Requires Cloudflare account and tunnel authorization

- [ ] **Create Cloudflare Tunnel** (Priority: CRITICAL)
  - Log into Cloudflare Dashboard
  - Navigate to Zero Trust > Access > Tunnels
  - Create tunnel named: `project-nyra`
  - Install `cloudflared` on orchestrator:
    ```bash
    wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared-linux-amd64.deb
    sudo cloudflared tunnel login
    ```
  - Authenticate tunnel: `sudo cloudflared tunnel create project-nyra`
  - Save tunnel credentials to: `/etc/cloudflared/credentials.json`
  - Store credentials in Infisical

- [ ] **Configure DNS records in Cloudflare** (Priority: CRITICAL)
  - Add CNAME: `chat.ratehunter.net` → tunnel
  - Add CNAME: `ratehunter.net` → tunnel  
  - Add CNAME: `admin.ratehunter.net` → tunnel (with Access protection)
  - Add CNAME: `dev.ratehunter.net` → tunnel (with Access protection)
  - Add CNAME: `api.ratehunter.net` → tunnel

- [ ] **Test tunnel connectivity** (Priority: HIGH)
  ```bash
  # Start tunnel
  sudo cloudflared tunnel run project-nyra
  
  # Test each subdomain from external network
  curl https://chat.ratehunter.net
  ```

### 💼 4. Business & Compliance

#### 4.1 NMLS & Licensing
**Why User Required:** Personal regulatory compliance

- [ ] **Verify NMLS license active** (Priority: CRITICAL)
  - Check license status at: `https://www.nmlsconsumeraccess.org/`
  - Update license info in CRM settings
  - Configure license disclosure in quote templates

- [ ] **Review state licensing requirements** (Priority: HIGH)
  - Document states you're licensed in
  - Configure quote engine to only show quotes for licensed states
  - Add state-specific disclosures to quote templates

#### 4.2 Lead Purchase Agreements
**Why User Required:** Legal contracts and payments

- [ ] **Setup LendingTree integration** (Priority: MEDIUM)
  - Sign lead purchase agreement
  - Configure webhook endpoint: `https://api.ratehunter.net/webhooks/lendingtree`
  - Test lead delivery with sample lead

- [ ] **Setup Rocket Mortgage Partner API** (Priority: MEDIUM)
  - Apply for partner program
  - Complete API application form
  - Configure OAuth credentials
  - Test API connection

- [ ] **Setup FreeRateUpdate** (Priority: LOW)
  - Create account or verify existing
  - Configure lead forwarding to your email
  - Test email parsing with sample lead

### 🎨 5. Brand & Content

#### 5.1 Domain & Website
**Why User Required:** Creative/brand decisions

- [ ] **Design landing page for ratehunter.net** (Priority: MEDIUM)
  - Decide on hero messaging
  - Select color scheme/branding
  - Create logo (or use placeholder)
  - Write compelling copy for conversion

- [ ] **Create mortgage application form** (Priority: HIGH)
  - Decide required vs optional fields
  - Write privacy policy and TCPA consent text
  - Design mobile-friendly form layout
  - Add form validation logic

#### 5.2 Campaign Content
**Why User Required:** Brand voice and regulatory review

- [ ] **Write drip campaign email templates** (Priority: HIGH)
  - Speed-to-Lead (Day 0): Welcome + quote delivery
  - Purchase Nurture: Days 3, 7, 14, 21, 30
  - Refinance Nurture: Days 3, 7, 14, 21, 30, 45
  - Review all content for TCPA compliance
  - Ensure all required disclosures present

- [ ] **Record voicemail messages** (Priority: MEDIUM)
  - Speed-to-Lead voicemail (30 seconds)
  - Follow-up voicemail (45 seconds)
  - Re-engagement voicemail (30 seconds)
  - Ensure professional tone and NMLS disclosure

### 🧪 6. Testing & Validation

#### 6.1 End-to-End Testing
**Why User Required:** Human judgment on UX and compliance

- [ ] **Test complete lead-to-quote journey** (Priority: CRITICAL)
  - Submit test lead via website form
  - Verify lead appears in CRM
  - Generate quote for test lead
  - Verify quote email delivered correctly
  - Check quote PDF formatting and disclosures

- [ ] **Test all campaign sequences** (Priority: HIGH)
  - Enroll test lead in each campaign type
  - Verify correct timing of each touchpoint
  - Test opt-out mechanism works
  - Confirm no emails sent after opt-out

- [ ] **Test compliance checks** (Priority: CRITICAL)
  - Submit application with various TRID timeline scenarios
  - Verify LE delivery timing alerts work
  - Test CD 3-day waiting period validation
  - Confirm APR tolerance checks trigger correctly

---

## 🤖 AI Agent Automatable Tasks

These tasks can be completed autonomously by AI agents (Claude Code, Claude Flow, Archon, etc.) with minimal or no user intervention.

### 📦 1. Code & Infrastructure

#### 1.1 Docker Configuration Finalization
**Agent Capability:** Full automation possible

- [ ] **Validate all docker-compose files** (Priority: HIGH)
  - Check for syntax errors in YAML
  - Verify all service names are unique
  - Ensure all referenced environment variables exist
  - Validate volume mounts point to correct paths
  - Check network configurations
  - Files to validate:
    - `infra/pc-orchestrator/docker-compose.yml`
    - `infra/workers/worker-*/docker-compose.yml`
    - `infra/docker-compose/docker-compose.mcp-servers.yml`
    - `infra/docker/base/docker-compose.core.yml`

- [ ] **Create master docker-compose orchestration script** (Priority: HIGH)
  - Create: `infra/scripts/start-all.sh`
  - Include health checks for each service
  - Add retry logic for failed startups
  - Create corresponding `stop-all.sh` and `restart-all.sh`
  - Add logging to `/var/log/nyra/startup.log`

- [ ] **Standardize all Dockerfile best practices** (Priority: MEDIUM)
  - Use multi-stage builds where appropriate
  - Minimize layer count
  - Use `.dockerignore` files
  - Set non-root user for all services
  - Add healthcheck directives
  - Pin all base image versions

#### 1.2 Environment Variable Management
**Agent Capability:** Full automation possible

- [ ] **Generate comprehensive .env.example** (Priority: HIGH)
  - Consolidate all env vars from all services
  - Document each variable with inline comments
  - Group by service/category
  - Specify required vs optional
  - Add validation regex patterns where applicable
  - Location: `infra/.env.example`

- [ ] **Create env variable validation script** (Priority: MEDIUM)
  - Script: `scripts/validate-env.sh`
  - Check all required vars are set
  - Validate format (URLs, ports, tokens)
  - Warn on default/placeholder values
  - Exit with error if critical vars missing

#### 1.3 MCP Server Consolidation
**Agent Capability:** Full automation possible

- [ ] **Verify all MCP servers wired to Nexus Router** (Priority: CRITICAL)
  - Check `configs/nexus/nexus.toml` includes all servers
  - Ensure Docker labels present on all MCP containers:
    ```yaml
    labels:
      - "nyra.mcp.enabled=true"
      - "nyra.mcp.name=server-name"
      - "nyra.mcp.type=memory|integration|tool"
    ```
  - Test Nexus can discover and route to each MCP server
  - Document any servers not yet containerized

- [ ] **Remove all MetaMCP references** (Priority: HIGH)
  - Search codebase for "metamcp" (case-insensitive)
  - Remove from docs, configs, scripts
  - Replace with Nexus Router equivalent
  - Update any diagrams showing MetaMCP
  - Verify no broken imports/references

- [ ] **Document all MCP servers in registry** (Priority: MEDIUM)
  - Create: `docs/api/MCP-SERVER-REGISTRY.md`
  - List each server with:
    - Name and purpose
    - Port number
    - Docker image/Dockerfile location
    - Tools exposed
    - Memory/CPU requirements
    - Dependencies
    - Health check endpoint

#### 1.4 Devcontainer Improvements
**Agent Capability:** Full automation possible

- [ ] **Add devcontainer role detection** (Priority: MEDIUM)
  - Add env var `NYRA_ROLE=orchestrator|worker1|worker2|worker3`
  - Create shell script: `.devcontainer/detect-role.sh`
  - Set role-specific aliases in `.bashrc`
  - Display role banner on container start

- [ ] **Install additional devcontainer extensions** (Priority: LOW)
  - Add to `.devcontainer/devcontainer.json`:
    - `ms-python.python`
    - `ms-python.vscode-pylance`
    - `bradlc.vscode-tailwindcss`
    - `prisma.prisma`
    - `redhat.vscode-yaml`
    - `timonwong.shellcheck`

- [ ] **Create devcontainer helper scripts** (Priority: LOW)
  - `.devcontainer/scripts/connect-orchestrator.sh`
  - `.devcontainer/scripts/check-services.sh`
  - `.devcontainer/scripts/tail-logs.sh`
  - Add aliases in `.devcontainer/postCreateCommand.sh`

### 📚 2. Documentation & Organization

#### 2.1 Documentation Consolidation
**Agent Capability:** Full automation possible

- [ ] **Create PATH-REVIEW-INDEX.md** (Priority: CRITICAL)
  - Location: Repo root
  - Catalog all scripts, configs, docs by type
  - Include brief description of each
  - Mark reviewed vs needs-review status
  - Add "last updated" timestamp
  - Structure:
    ```markdown
    # PATH-REVIEW-INDEX

    ## Bootstrap Scripts
    - `scripts/bootstrap-orchestrator.sh` - Sets up orchestrator PC [REVIEWED]
    - `scripts/bootstrap-worker.sh` - Sets up GPU worker [NEEDS REVIEW]
    
    ## Environment Files
    - `infra/.env.example` - Master env template [REVIEWED]
    - `infra/pc-orchestrator/.env` - Orchestrator secrets [NEEDS REVIEW]
    
    ## Docker Configs
    ...
    ```

- [ ] **Consolidate all README files** (Priority: HIGH)
  - Audit all README.md files in repo
  - Remove duplicate/outdated content
  - Standardize structure across all READMEs
  - Ensure each service has a README with:
    - Purpose
    - Prerequisites  
    - Installation
    - Configuration
    - Usage examples
    - Troubleshooting

- [ ] **Create quick-start guide index** (Priority: HIGH)
  - Location: `docs/QUICK-START-INDEX.md`
  - Link to all setup guides
  - Order by recommended sequence
  - Add estimated time for each guide
  - Include prerequisite chain
  - Mark user-required vs automated steps

#### 2.2 Architecture Documentation
**Agent Capability:** Full automation possible

- [ ] **Update architecture diagrams** (Priority: MEDIUM)
  - Ensure all diagrams reflect current state (no MetaMCP)
  - Add Nexus Router to all relevant diagrams
  - Create missing diagrams:
    - MCP server topology
    - Memory system interactions
    - Campaign execution flow
  - Use Mermaid.js for all diagrams
  - Store in `docs/architecture/diagrams/`

- [ ] **Document all service dependencies** (Priority: MEDIUM)
  - Create dependency matrix showing which services require which
  - Generate startup order based on dependencies
  - Document health check requirements
  - Create: `docs/architecture/SERVICE-DEPENDENCIES.md`

- [ ] **Create troubleshooting decision tree** (Priority: LOW)
  - Common issues and resolution steps
  - Flowchart format using Mermaid
  - Link to relevant logs and health checks
  - Create: `docs/troubleshooting/DECISION-TREE.md`

### 🔧 3. Automation & Scripts

#### 3.1 Bootstrap Script Creation
**Agent Capability:** Full automation possible

- [ ] **Create orchestrator bootstrap script** (Priority: CRITICAL)
  - Script: `scripts/bootstrap-orchestrator.sh`
  - Check prerequisites (Ubuntu 22.04, RAM, disk)
  - Install Docker, docker-compose, Node.js (via Volta)
  - Clone repo to `/opt/repos/project-nyra`
  - Setup directory structure
  - Install systemd services
  - Configure firewall rules
  - Create: `/etc/nyra/orchestrator.conf`
  - Test connectivity to Infisical
  - Pull all required Docker images
  - Provide summary of what was installed

- [ ] **Create worker bootstrap script** (Priority: CRITICAL)
  - Script: `scripts/bootstrap-worker.sh`
  - Accept parameter: `--worker-id=1|2|3`
  - Check GPU availability with `nvidia-smi`
  - Install NVIDIA drivers if missing
  - Install Docker with NVIDIA runtime
  - Clone repo
  - Setup Ollama with worker-specific model
  - Configure Tailscale
  - Register with orchestrator
  - Test GPU inference

- [ ] **Create health check script** (Priority: HIGH)
  - Script: `scripts/health-check.sh`
  - Check all Docker containers running
  - Test database connectivity
  - Verify Redis connection
  - Check disk space (warn if >80%)
  - Test LLM worker availability
  - Ping MCP servers
  - Output: JSON status report
  - Create systemd timer to run every 5 minutes

#### 3.2 Backup & Recovery Scripts
**Agent Capability:** Full automation possible

- [ ] **Create automated backup script** (Priority: HIGH)
  - Script: `scripts/backup-all.sh`
  - Backup PostgreSQL (all databases)
  - Backup Neo4j graph data
  - Backup Redis (RDB snapshot)
  - Backup Docker volumes
  - Backup config files
  - Compress and encrypt backup
  - Upload to S3 (or local NAS)
  - Rotate old backups (keep 30 days local, 90 days cloud)
  - Send notification on success/failure

- [ ] **Create restore script** (Priority: MEDIUM)
  - Script: `scripts/restore-from-backup.sh`
  - Accept parameter: `--backup-date=YYYY-MM-DD`
  - Stop all services
  - Restore databases
  - Restore Docker volumes
  - Restore configs
  - Start services in correct order
  - Verify restoration with health checks

#### 3.3 Deployment Scripts
**Agent Capability:** Full automation possible

- [ ] **Create update deployment script** (Priority: MEDIUM)
  - Script: `scripts/deploy-update.sh`
  - Pull latest code from git
  - Backup current state
  - Rebuild affected Docker images
  - Run database migrations
  - Rolling restart of services (zero-downtime)
  - Verify health after each service restart
  - Rollback on failure

- [ ] **Create service restart script** (Priority: MEDIUM)
  - Script: `scripts/restart-service.sh`
  - Accept parameter: `--service=<name>`
  - Gracefully stop service (with timeout)
  - Clear relevant caches
  - Start service
  - Wait for health check to pass
  - Tail logs for errors

### 🧪 4. Testing & Validation

#### 4.1 Integration Tests
**Agent Capability:** Full automation possible

- [ ] **Write integration tests for MCP routing** (Priority: HIGH)
  - Test Nexus can route to each MCP server
  - Test fallback to cloud when GPU workers down
  - Test load balancing across workers
  - Test health check triggers failover
  - Location: `tests/integration/test_nexus_routing.py`

- [ ] **Write integration tests for campaign engine** (Priority: HIGH)
  - Test lead enrollment triggers campaign
  - Test correct timing of campaign steps
  - Test opt-out prevents further messages
  - Test campaign completion marked correctly
  - Location: `tests/integration/test_campaigns.py`

- [ ] **Write integration tests for quote generation** (Priority: MEDIUM)
  - Test quote API returns valid scenarios
  - Test AI recommendation logic
  - Test quote delivery via email
  - Test quote expiration logic
  - Location: `tests/integration/test_quotes.py`

#### 4.2 Performance Tests
**Agent Capability:** Full automation possible

- [ ] **Create load test for LLM routing** (Priority: MEDIUM)
  - Use k6 or Locust
  - Simulate 100 concurrent LLM requests
  - Verify requests distributed correctly
  - Measure latency (p50, p95, p99)
  - Check for errors or timeouts
  - Location: `tests/performance/llm_load_test.js`

- [ ] **Create load test for API endpoints** (Priority: MEDIUM)
  - Test `/leads` POST endpoint (100 req/s)
  - Test `/quotes` POST endpoint (50 req/s)
  - Verify rate limiting triggers correctly
  - Check database connection pool doesn't exhaust
  - Location: `tests/performance/api_load_test.js`

#### 4.3 Security Tests
**Agent Capability:** Partial automation (some require external tools)

- [ ] **Run OWASP ZAP scan** (Priority: HIGH)
  - Install OWASP ZAP
  - Configure to scan staging environment
  - Run spider + active scan
  - Generate HTML report
  - Create issues for any high/critical findings
  - Location: `tests/security/zap-report.html`

- [ ] **Run npm audit and fix** (Priority: HIGH)
  - Run `npm audit` in all package.json directories
  - Fix auto-fixable vulnerabilities: `npm audit fix`
  - Document remaining vulnerabilities in: `docs/security/NPM-VULNERABILITIES.md`
  - Create GitHub issues for non-fixable critical/high vulns

- [ ] **Scan for secrets in codebase** (Priority: CRITICAL)
  - Install TruffleHog or GitGuardian CLI
  - Scan entire git history: `trufflehog git file://. --only-verified`
  - Remove any found secrets immediately
  - Add to pre-commit hook to prevent future leaks

### 📊 5. Monitoring & Observability

#### 5.1 Logging Infrastructure
**Agent Capability:** Full automation possible

- [ ] **Setup centralized logging** (Priority: HIGH)
  - Install Loki + Promtail
  - Configure all services to log to JSON format
  - Add Loki datasource to Grafana
  - Create log queries for common issues
  - Setup log retention: 30 days

- [ ] **Create log aggregation dashboard** (Priority: MEDIUM)
  - Grafana dashboard showing:
    - Error rate by service (last 24h)
    - Top 10 error messages
    - Request volume by endpoint
    - Slow queries (>1s)
    - Failed login attempts

#### 5.2 Metrics & Alerting
**Agent Capability:** Full automation possible

- [ ] **Configure Prometheus exporters** (Priority: HIGH)
  - Node exporter on all 4 PCs
  - cAdvisor for Docker metrics
  - PostgreSQL exporter
  - Redis exporter
  - Nginx/Caddy exporter (if applicable)
  - Custom exporter for LLM metrics

- [ ] **Create Grafana dashboards** (Priority: MEDIUM)
  - System overview (CPU, RAM, disk, network)
  - Database performance (queries/sec, connections)
  - LLM routing (requests/sec by worker, latency)
  - Campaign metrics (emails sent, opened, clicked)
  - Business metrics (leads/day, quotes/day, conversion rate)

- [ ] **Setup alerting rules** (Priority: HIGH)
  - Disk >85% - warning
  - Disk >95% - critical
  - Any service down >5min - critical
  - Database connections >80% pool - warning
  - Error rate >5% - critical
  - GPU memory >90% - warning
  - Send alerts to: Email + Discord webhook

---

## 🎯 Priority Matrix

### Critical (Must Complete Before Launch)
1. ✅ Push changes to remote repository
2. ⏳ Install Ubuntu on all 4 PCs
3. ⏳ Setup Tailscale mesh network
4. ⏳ Configure Cloudflare Tunnels
5. ⏳ Validate all secrets in Infisical
6. ⏳ Create orchestrator bootstrap script
7. ⏳ Create worker bootstrap scripts
8. ⏳ Validate all docker-compose files
9. ⏳ Test complete lead-to-quote journey
10. ⏳ Verify MCP servers wired to Nexus Router

### High (Should Complete Soon)
1. ⏳ Create PATH-REVIEW-INDEX.md
2. ⏳ Setup GitHub OAuth for Cloudflare
3. ⏳ Configure Twilio account
4. ⏳ Setup SendGrid email
5. ⏳ Write drip campaign templates
6. ⏳ Create master docker-compose orchestration script
7. ⏳ Create automated backup script
8. ⏳ Write integration tests
9. ⏳ Remove all MetaMCP references
10. ⏳ Consolidate all README files

### Medium (Nice to Have)
1. ⏳ Setup LendingTree integration
2. ⏳ Setup Rocket Mortgage Partner API
3. ⏳ Create health check script
4. ⏳ Create restore script
5. ⏳ Create quick-start guide index
6. ⏳ Update architecture diagrams
7. ⏳ Create load tests
8. ⏳ Setup Grafana dashboards
9. ⏳ Create devcontainer helper scripts
10. ⏳ Document all service dependencies

### Low (Future Enhancements)
1. ⏳ Setup FreeRateUpdate
2. ⏳ Record voicemail messages
3. ⏳ Create troubleshooting decision tree
4. ⏳ Install additional devcontainer extensions
5. ⏳ Create log aggregation dashboard

---

## 📈 Current Status Summary

### ✅ Completed
- [x] Consolidated MCP servers and removed MetaMCP references from code
- [x] Created orchestrator PC compose entrypoint (`infra/pc-orchestrator/docker-compose.yml`)
- [x] Updated devcontainer configurations for 4-PC setup
- [x] Consolidated Docker compose files into logical structure
- [x] Added worker PC infrastructure setup files
- [x] Updated documentation and architecture files
- [x] Removed hardcoded secrets from repository
- [x] Pushed all changes to remote GitHub repository

### 🚧 In Progress
- [ ] Physical PC setup and OS installation (Blocked: Requires user hardware access)
- [ ] Secrets management in Infisical (Blocked: Requires user authentication)
- [ ] Network configuration (Tailscale + Cloudflare) (Blocked: Requires user accounts)

### 📅 Next Up
**Immediate Next Steps (This Week):**
1. **User:** Install Ubuntu 22.04 on all 4 PCs
2. **User:** Create Tailscale account and add all PCs to mesh network  
3. **User:** Configure Cloudflare Tunnels for ratehunter.net
4. **Agent:** Create and test bootstrap scripts for orchestrator and workers
5. **Agent:** Generate comprehensive PATH-REVIEW-INDEX.md
6. **User:** Review and validate all secrets in Infisical

**Short-term Goals (Next 2 Weeks):**
1. All Docker services running on orchestrator
2. All GPU workers connected and serving models
3. Basic website live at ratehunter.net
4. Lead ingestion working from test form
5. Quote generation working end-to-end

**Medium-term Goals (Next Month):**
1. Campaign engine fully operational
2. TwentyCRM populated with test data
3. Complete integration tests passing
4. Monitoring dashboards operational
5. Backup system automated

**Long-term Goals (Next Quarter):**
1. Production launch with real leads
2. LendingTree/Rocket Mortgage integrations live
3. AI assistants handling 85% of routine tasks
4. Full compliance automation operational
5. ROI positive on infrastructure investment

---

## 🔄 How to Use This Document

### For You (The User)
1. **Review User Required Tasks** - These need your direct action
2. **Prioritize by Critical/High tasks first**
3. **Check each task off as you complete it** (edit this file)
4. **Update "Next Up" section** as priorities shift

### For AI Agents
1. **Focus on AI Agent Automatable Tasks**
2. **Work through Priority Matrix in order**
3. **Update task status** upon completion
4. **Document any blockers** or dependencies on user tasks
5. **Create detailed completion summaries** for complex tasks

### Status Indicators
- ✅ = Completed
- ⏳ = In Progress
- ⬜ = Not Started
- 🚫 = Blocked (waiting on dependency)

---

**Document Version:** 1.0  
**Last Updated:** January 24, 2026  
**Next Review:** Check weekly, update as tasks complete
