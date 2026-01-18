# Post-Consolidation Manual Setup Guide

**Version**: 2.0.0
**Last Updated**: 2026-01-17
**Status**: Production Ready
**Difficulty**: Beginner-Friendly ⭐⭐☆☆☆

> **What's New in v2.0**: Added specific per-PC setup instructions for orchestrator-mini, worker-rtx3060, worker-rtx3090ti, and worker-rtx5090. Enhanced troubleshooting for dead symlinks and Turborepo validation.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start Checklist](#quick-start-checklist)
4. [MCP Server Authentication](#mcp-server-authentication)
5. [Environment Variable Configuration](#environment-variable-configuration)
6. [Docker Registry Setup](#docker-registry-setup)
7. [Database Initialization](#database-initialization)
8. [Verification Steps](#verification-steps)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)
11. [Advanced Configuration](#advanced-configuration)
12. [Support Resources](#support-resources)

---

## 🎯 Overview

This guide walks you through all manual setup steps required after Project Nyra's consolidation. These tasks cannot be automated because they require:
- External service authentication (Infisical, Bitwarden, Cloudflare)
- Secure credential generation
- User-specific API keys
- Manual security verification

**Estimated Time**: 30-60 minutes (first-time setup)

**What You'll Accomplish**:
- ✅ Configure all MCP servers with proper authentication
- ✅ Set up environment variables for all services
- ✅ Authenticate with Docker registries
- ✅ Initialize databases with proper credentials
- ✅ Verify complete system functionality

---

## 🔧 Prerequisites

### Required Software

```bash
# Check if you have these installed:
node --version    # Should be 20.x or higher
npm --version     # Should be 9.x or higher
docker --version  # Should be 24.x or higher
git --version     # Should be 2.x or higher
```

**If missing, install:**
- **Node.js**: https://nodejs.org/en/download/
- **Docker Desktop**: https://www.docker.com/products/docker-desktop
- **Git**: https://git-scm.com/downloads

### Required Accounts

Create free accounts for these services:

| Service | Purpose | Sign Up Link |
|---------|---------|--------------|
| **Infisical** | Secrets management | https://infisical.com/signup |
| **Anthropic** | Claude API access | https://console.anthropic.com |
| **Google AI** | Gemini API (optional) | https://aistudio.google.com |
| **Cloudflare** | Tunnel networking (optional) | https://dash.cloudflare.com/sign-up |
| **Bitwarden** | Password vault (optional) | https://vault.bitwarden.com/#/register |

### File Access

Ensure you have:
- ✅ Read/write access to the project directory
- ✅ Administrator/sudo privileges for Docker commands
- ✅ Internet connection for downloading dependencies

---

## ✅ Quick Start Checklist

Print this out or keep it open in a separate window:

### Phase 1: Authentication Setup (15 min)
- [ ] Infisical login and project initialization
- [ ] Anthropic API key obtained
- [ ] Environment template copied

### Phase 2: Configuration (20 min)
- [ ] All secrets generated
- [ ] Environment variables configured
- [ ] Docker credentials set up

### Phase 3: Verification (10 min)
- [ ] Services started successfully
- [ ] Health checks passing
- [ ] Test API calls working

### Phase 4: Validation (5 min)
- [ ] Run validation script
- [ ] Review logs for errors
- [ ] Document any issues

---

## 🔐 MCP Server Authentication

### 1. Infisical MCP Setup

**Purpose**: Secure secrets management for all services

#### Step 1.1: Install Infisical CLI

**Windows (PowerShell as Administrator):**
```powershell
# Using Scoop (recommended)
scoop install infisical

# Or using npm
npm install -g @infisical/cli
```

**macOS:**
```bash
brew install infisical/infisical/infisical
```

**Linux:**
```bash
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical
```

#### Step 1.2: Login to Infisical

```bash
# Interactive login (opens browser)
infisical login --interactive

# OR using service token (for CI/CD)
# Get service token from: https://app.infisical.com/org/[org-id]/project/[project-id]/settings/service-tokens
export INFISICAL_TOKEN="st.xxxx.yyyy.zzzz"
```

**Expected Output:**
```
✓ Logged in successfully!
User: your-email@example.com
Organization: Your Organization
```

#### Step 1.3: Initialize Project

```bash
cd C:\Dev\Projects\Repos\Project-Nyra  # Windows
cd ~/Projects/Project-Nyra              # macOS/Linux

# Initialize Infisical project
infisical init

# When prompted:
# - Select your organization
# - Choose "Create new project" → Name it "Nyra"
# - Select "production" environment
```

**Save these values:**
```bash
# You'll need these later
INFISICAL_PROJECT_ID="<your-project-id>"      # Example: 65f4e2b8c1234567890abcde
INFISICAL_TOKEN="<your-service-token>"        # Example: st.prod.a1b2c3d4e5f6...
```

#### Step 1.4: Create Environment Paths

```bash
# Create secret paths for each PC role
infisical secrets set --env production --path "/nyra/orchestrator" \
  POSTGRES_PASSWORD="$(openssl rand -hex 32)"

infisical secrets set --env production --path "/nyra/worker-1" \
  NYRA_WORKER_ID="1"

infisical secrets set --env production --path "/nyra/worker-2" \
  NYRA_WORKER_ID="2"

infisical secrets set --env production --path "/nyra/worker-3" \
  NYRA_WORKER_ID="3"

infisical secrets set --env production --path "/nyra/shared" \
  SHARED_SECRET="$(openssl rand -hex 32)"
```

**Verify Setup:**
```bash
# Test secret retrieval
infisical secrets get POSTGRES_PASSWORD --env production --path /nyra/orchestrator
```

---

### 2. Bitwarden MCP Setup (Optional)

**Purpose**: Password management and secure credential storage

#### Step 2.1: Install Bitwarden CLI

**All Platforms:**
```bash
npm install -g @bitwarden/cli
```

#### Step 2.2: Login to Bitwarden

```bash
# Login with email/password
bw login your-email@example.com

# You'll be prompted for password and 2FA (if enabled)
# Save the session key that's returned
export BW_SESSION="<your-session-key>"
```

#### Step 2.3: Create Nyra Organization Vault

```bash
# Unlock vault
bw unlock

# Create folder for Nyra secrets
bw create folder --name "Project Nyra"

# Store credentials
bw create item \
  --name "Nyra PostgreSQL" \
  --username "postgres" \
  --password "$(openssl rand -hex 32)" \
  --folder "Project Nyra" \
  --type login
```

#### Step 2.4: Configure MCP Server

Create: `C:\Dev\Projects\Repos\Project-Nyra\config\mcp\bitwarden.json`

```json
{
  "mcpServers": {
    "bitwarden": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-bitwarden"
      ],
      "env": {
        "BITWARDEN_CLIENT_ID": "your-client-id",
        "BITWARDEN_CLIENT_SECRET": "your-client-secret",
        "BITWARDEN_PASSWORD": "your-master-password"
      }
    }
  }
}
```

**Get API Credentials:**
1. Go to: https://vault.bitwarden.com/#/settings/security/security-keys
2. Click "View API Key"
3. Copy `client_id` and `client_secret`

---

### 3. Claude Flow MCP Setup

**Purpose**: Multi-agent orchestration and coordination

#### Step 3.1: Initialize Claude Flow

```bash
# Navigate to project root
cd C:\Dev\Projects\Repos\Project-Nyra

# Initialize with wizard
npx @claude-flow/cli@latest init --wizard
```

**Wizard Prompts & Answers:**

1. **Project name?** → `Nyra`
2. **Project type?** → `Multi-service`
3. **Enable hooks?** → `Yes`
4. **Enable V3 features?** → `Yes`
5. **Memory backend?** → `hybrid`
6. **Default topology?** → `hierarchical-mesh`
7. **Max agents?** → `15`

#### Step 3.2: Configure MCP Server

The MCP server is already configured in `.mcp.json`. Verify it:

```bash
# Check configuration
cat .mcp.json

# Should show:
# {
#   "mcpServers": {
#     "claude-flow": {
#       "command": "docker",
#       "args": ["exec", "-i", "nyra-claude-flow-mcp", ...],
#       ...
#     }
#   }
# }
```

#### Step 3.3: Test MCP Connection

```bash
# Start Claude Flow MCP container (if not running)
docker-compose -f docker-compose.infisical.yml up -d claude-flow-mcp

# Test connection
docker exec -it nyra-claude-flow-mcp npx @claude-flow/cli@latest status
```

**Expected Output:**
```
✓ Claude Flow v3 Status
  Mode: v3
  Hooks: enabled
  Topology: hierarchical-mesh
  Max Agents: 15
  Memory: hybrid
```

---

## 🌐 Environment Variable Configuration

### 1. Copy Environment Template

```bash
# Copy the template
cp .env.example .env

# Make it read-only (security best practice)
chmod 400 .env  # Linux/macOS
```

**Windows:**
```powershell
Copy-Item .env.example .env
# Right-click .env → Properties → Security → Edit → Set to Read-only
```

---

### 2. Generate Secrets (CRITICAL STEP)

**NEVER use default passwords or simple strings!**

#### 2.1: Generate All Secrets at Once

**Linux/macOS/Git Bash:**
```bash
# Generate 15 secrets (one per line)
for i in {1..15}; do openssl rand -hex 32; done
```

**Windows PowerShell:**
```powershell
# Generate 15 secrets
1..15 | ForEach-Object {
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    [Convert]::ToHexString($bytes).ToLower()
}
```

**Copy and save these somewhere temporarily!** You'll use them in the next step.

#### 2.2: Fill in .env File

Open `.env` in your favorite text editor and fill in:

```bash
# ============================================
# CORE API KEYS (REQUIRED)
# ============================================

# Anthropic Claude API
# Get from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Google Gemini API (optional, for cost optimization)
# Get from: https://aistudio.google.com/apikey
GOOGLE_API_KEY=AIzaSyxxxxx

# ============================================
# DATABASE SECRETS (USE GENERATED SECRETS)
# ============================================

# PostgreSQL (paste secret #1)
POSTGRES_PASSWORD=<secret-1-from-generation>

# Redis (paste secret #2)
REDIS_PASSWORD=<secret-2-from-generation>

# FalkorDB (paste secret #3)
FALKORDB_PASSWORD=<secret-3-from-generation>

# ============================================
# NEXUS ROUTER (USE GENERATED SECRETS)
# ============================================

# JWT Secret (paste secret #4)
NEXUS_JWT_SECRET=<secret-4-from-generation>

# Admin Token (paste secret #5)
NEXUS_ADMIN_TOKEN=<secret-5-from-generation>

# ============================================
# N8N WORKFLOW AUTOMATION
# ============================================

# Admin Password (use a strong password, not a generated secret)
N8N_BASIC_AUTH_PASSWORD=<your-strong-password-16-chars-min>

# Encryption Key (paste secret #6)
N8N_ENCRYPTION_KEY=<secret-6-from-generation>

# ============================================
# DIFY AI PLATFORM
# ============================================

# Secret Key (paste secret #7)
DIFY_SECRET_KEY=<secret-7-from-generation>

# Encryption Key (paste secret #8)
DIFY_ENCRYPTION_KEY=<secret-8-from-generation>

# ============================================
# TWENTYCRM SECRETS
# ============================================

TWENTY_ACCESS_TOKEN_SECRET=<secret-9-from-generation>
TWENTY_LOGIN_TOKEN_SECRET=<secret-10-from-generation>
TWENTY_REFRESH_TOKEN_SECRET=<secret-11-from-generation>
TWENTY_FILE_TOKEN_SECRET=<secret-12-from-generation>

# ============================================
# LETTA MEMORY SERVER
# ============================================

LETTA_API_KEY=<secret-13-from-generation>
LETTA_SERVER_PASS=<your-strong-password-16-chars-min>

# ============================================
# ACTIVEPIECES AUTOMATION
# ============================================

ACTIVEPIECES_API_KEY=<secret-14-from-generation>
AP_ENCRYPTION_KEY=<secret-15-from-generation>
AP_JWT_SECRET=<secret-16-from-generation>  # Generate one more!

# ============================================
# MONITORING (GRAFANA)
# ============================================

GRAFANA_ADMIN_PASSWORD=<your-strong-password-16-chars-min>

# ============================================
# COMMUNICATION SERVICES (OPTIONAL)
# ============================================

# Twilio (if using SMS/Voice features)
# Get from: https://console.twilio.com
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+15551234567

# Email SMTP (for notifications)
# Gmail example: https://support.google.com/mail/answer/185833
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<your-app-specific-password>
SMTP_FROM_EMAIL=your-email@gmail.com

# ============================================
# INFISICAL INTEGRATION
# ============================================

# From earlier Infisical setup
INFISICAL_TOKEN=<your-infisical-service-token>
INFISICAL_PROJECT_ID=<your-infisical-project-id>

# ============================================
# PC IDENTIFICATION
# ============================================

# Set this based on your PC role:
# - orchestrator (main coordination PC)
# - worker-1 (RTX 3060)
# - worker-2 (RTX 5090)
# - worker-3 (RTX 3090Ti)
NYRA_PC_ID=orchestrator

# Environment: development, staging, or production
NYRA_ENVIRONMENT=development
```

#### 2.3: Validate .env File

```bash
# Run validation script
./scripts/validate-env.sh

# Expected output:
# ✓ All required variables are set
# ✓ Secrets meet minimum length requirements
# ✓ No port conflicts detected
# ✓ URLs are properly formatted
```

---

### 3. Sync Secrets to Infisical (RECOMMENDED)

For production deployments, store secrets in Infisical:

```bash
# Install the sync script
npm install -g dotenv-cli

# Sync .env to Infisical
infisical secrets set --env production --path /nyra/orchestrator \
  --from-file .env

# Verify sync
infisical secrets list --env production --path /nyra/orchestrator
```

**Security Note**: After syncing to Infisical, you can delete the local `.env` file and use:
```bash
# Run commands with Infisical-injected secrets
infisical run --env production --path /nyra/orchestrator -- docker-compose up
```

---

## 💻 Per-PC Setup Instructions

This section provides **specific setup instructions** for each PC in your distributed architecture. Complete these steps **in order** to ensure proper cluster formation.

### Setup Order (CRITICAL)

1. **Orchestrator-Mini (10.0.0.1)** - Setup FIRST (control plane)
2. **Worker-RTX3060 (10.0.0.2)** - Setup SECOND (Ruvector leader)
3. **Worker-RTX5090 & Worker-RTX3090Ti (10.0.0.3, 10.0.0.4)** - Setup in PARALLEL (followers)

---

### PC1: Orchestrator-Mini (10.0.0.1)

**Role**: Control plane - runs Nexus Router, Claude Flow, Archon OS, MetaMCP Gateway, Prometheus, Grafana

**Hardware Profile**:
- CPU: Intel Mini PC (8 cores minimum)
- RAM: 16GB
- Storage: 256GB NVMe SSD
- GPU: None (CPU-only orchestration)
- OS: Windows 11 Pro + WSL2 (Ubuntu 24.04)

#### Step 1.1: Verify WSL2 Configuration

```powershell
# Check WSL version
wsl --list --verbose

# Should show: Ubuntu (Default) Running 2

# If WSL2 not enabled:
wsl --set-default-version 2
wsl --install -d Ubuntu-24.04
```

#### Step 1.2: Configure Static IP

```powershell
# PowerShell as Administrator
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress "10.0.0.1" -PrefixLength 24 -DefaultGateway "10.0.0.254"
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses "8.8.8.8","8.8.4.4"

# Verify
Test-NetConnection -ComputerName 8.8.8.8
```

#### Step 1.3: Clone Repository

```powershell
# Create project directory
New-Item -ItemType Directory -Force -Path "C:\Dev\Projects\Repos"
cd C:\Dev\Projects\Repos

# Clone repository (adjust URL)
git clone https://github.com/mhenry3164/Project-Nyra.git
cd Project-Nyra
```

#### Step 1.4: Create Environment File

```powershell
# Copy environment template
Copy-Item .env.example .env

# Edit with your credentials
notepad .env
```

**Update these values:**
```bash
# PC Identification
NYRA_PC_ID=orchestrator-mini
NYRA_ROLE=orchestrator
NYRA_ENVIRONMENT=development

# API Keys
ANTHROPIC_API_KEY=sk-ant-your_key_here
GOOGLE_API_KEY=your_google_key_here

# Infisical Configuration
INFISICAL_TOKEN=st_your_token_here
INFISICAL_PROJECT_ID=your_project_id_here
INFISICAL_ENVIRONMENT=development

# Bitwarden (optional)
BWS_ACCESS_TOKEN=your_bws_token_here

# Network Configuration
ORCHESTRATOR_URL=http://localhost:8000
```

#### Step 1.5: Install Dependencies

```powershell
# Install pnpm workspace dependencies
pnpm install

# This may take 5-10 minutes on first run
# If dead symlinks appear, see Troubleshooting section
```

#### Step 1.6: Generate Database Credentials

```powershell
# Generate secure passwords for all services
$secrets = 1..16 | ForEach-Object {
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    [Convert]::ToHexString($bytes).ToLower()
}

# Save secrets to file for reference
$secrets | Out-File -FilePath ".\secrets_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"

Write-Host "Secrets generated and saved. Add these to your .env file."
```

#### Step 1.7: Start Orchestrator Services

```powershell
# Start infrastructure services (PostgreSQL, Redis, RabbitMQ)
pnpm start:infra

# Wait 30 seconds for databases to initialize
Start-Sleep -Seconds 30

# Verify infrastructure is running
docker ps --filter "health=healthy"

# Start orchestrator-specific services
pnpm start:orchestrator

# Verify orchestrator services
docker ps --filter "name=nyra-orchestrator"
```

#### Step 1.8: Verify Health

```powershell
# Run health check
pnpm health:infra

# Expected output:
# ✓ PostgreSQL: Healthy (port 5432)
# ✓ Redis: Healthy (port 6379)
# ✓ RabbitMQ: Healthy (port 5672)
# ✓ Claude Flow MCP: Healthy (port 8003)
# ✓ Infisical MCP: Healthy (port 8006)
```

#### Step 1.9: Register MCP Servers

```bash
# Register Claude Flow MCP
claude mcp add claude-flow -- docker exec -i nyra-claude-flow-mcp npx @claude-flow/cli@latest mcp start

# Register Infisical MCP
claude mcp add infisical-mcp -- docker exec -i nyra-infisical-mcp node src/index.js

# Register Bitwarden MCP (if using)
claude mcp add bitwarden -- docker exec -i nyra-bitwarden-mcp node /app/src/index.js

# Register Docker MCP
claude mcp add docker-mcp -- docker exec -i nyra-docker-mcp node dist/index.js

# Verify registration
claude mcp list
```

---

### PC2: Worker-RTX3060 (10.0.0.2)

**Role**: GPU Worker 1 - Runs Ollama, Ruvector Leader, Letta, Mem0, Dify

**Hardware Profile**:
- CPU: Intel i9 or AMD Ryzen 9 (12+ cores)
- RAM: 64GB
- Storage: 1TB NVMe SSD
- GPU: NVIDIA RTX 3060 (12GB VRAM)
- OS: Windows 11 Pro or Ubuntu 22.04

#### Step 2.1: Verify GPU Access

```bash
# Check NVIDIA drivers
nvidia-smi

# Expected: GPU info, driver version 535+, CUDA 12.0+

# Test Docker GPU access
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi

# Should show GPU info inside container
```

#### Step 2.2: Configure Static IP

```powershell
# Windows (PowerShell as Administrator)
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress "10.0.0.2" -PrefixLength 24 -DefaultGateway "10.0.0.254"
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses "8.8.8.8","8.8.4.4"
```

```bash
# Linux (Ubuntu)
sudo nano /etc/netplan/01-netcfg.yaml

# Add:
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [10.0.0.2/24]
      gateway4: 10.0.0.254
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]

# Apply
sudo netplan apply
```

#### Step 2.3: Verify Orchestrator Connectivity

```bash
# Test connection to orchestrator
ping -c 4 10.0.0.1

# Test HTTP connection
curl http://10.0.0.1:8000/health

# Should return: {"status":"healthy"}
```

#### Step 2.4: Clone Repository

```bash
# Clone to same path for consistency
mkdir -p ~/Projects
cd ~/Projects
git clone https://github.com/mhenry3164/Project-Nyra.git
cd Project-Nyra
```

#### Step 2.5: Create Environment File

```bash
# Copy template
cp .env.example .env

# Edit with your credentials
nano .env
```

**Update these values:**
```bash
# PC Identification
NYRA_PC_ID=worker-rtx3060
NYRA_ROLE=worker
NYRA_WORKER_ID=1
NYRA_GPU_TYPE=rtx_3060
NYRA_ENVIRONMENT=development

# Orchestrator Connection
ORCHESTRATOR_URL=http://10.0.0.1:8000

# Infisical Configuration (same as orchestrator)
INFISICAL_TOKEN=st_your_token_here
INFISICAL_PROJECT_ID=your_project_id_here
INFISICAL_ENVIRONMENT=development

# Ruvector Configuration
RUVECTOR_ROLE=leader
RUVECTOR_NODE_ID=1
RUVECTOR_PEERS=10.0.0.2:6370,10.0.0.3:6370,10.0.0.4:6370
```

#### Step 2.6: Install Dependencies

```bash
# Install pnpm workspace dependencies
pnpm install
```

#### Step 2.7: Start Worker Services

```bash
# Start worker services
pnpm start:worker

# Verify services are running
docker ps
```

#### Step 2.8: Pull Ollama Models (30-60 minutes)

```bash
# Pull Llama 3.1 70B model (this will take time!)
docker exec nyra-ollama ollama pull llama3.1:70b

# Monitor progress
docker logs -f nyra-ollama

# Verify model is available
docker exec nyra-ollama ollama list
```

#### Step 2.9: Verify Ruvector Leader

```bash
# Check Ruvector leader health
curl http://10.0.0.2:6370/health

# Expected output:
# {"status":"healthy","role":"leader","cluster_size":1}
```

---

### PC3: Worker-RTX5090 (10.0.0.3)

**Role**: GPU Worker 2 - Runs Ruvector Follower 1, PostgreSQL, TwentyCRM, Neo4j, FalkorDB, Qdrant

**Hardware Profile**:
- CPU: Intel i9 or AMD Ryzen 9 (12+ cores)
- RAM: 64GB
- Storage: 2TB NVMe SSD (databases need space)
- GPU: NVIDIA RTX 5090 (24GB VRAM)
- OS: Windows 11 Pro or Ubuntu 22.04

#### Step 3.1: Verify GPU and Connectivity

```bash
# Check GPU
nvidia-smi

# Test orchestrator connectivity
ping -c 4 10.0.0.1

# Test worker-1 connectivity
ping -c 4 10.0.0.2

# Test Ruvector leader reachability
curl http://10.0.0.2:6370/health
```

#### Step 3.2: Configure Static IP

Same as Worker-RTX3060, but use IP **10.0.0.3**

#### Step 3.3: Clone Repository

```bash
mkdir -p ~/Projects
cd ~/Projects
git clone https://github.com/mhenry3164/Project-Nyra.git
cd Project-Nyra
```

#### Step 3.4: Create Environment File

```bash
cp .env.example .env
nano .env
```

**Update these values:**
```bash
# PC Identification
NYRA_PC_ID=worker-rtx5090
NYRA_ROLE=worker
NYRA_WORKER_ID=2
NYRA_GPU_TYPE=rtx_5090
NYRA_ENVIRONMENT=development

# Orchestrator Connection
ORCHESTRATOR_URL=http://10.0.0.1:8000

# Ruvector Configuration
RUVECTOR_ROLE=follower
RUVECTOR_NODE_ID=2
RUVECTOR_LEADER_URL=http://10.0.0.2:6370
RUVECTOR_PEERS=10.0.0.2:6370,10.0.0.3:6370,10.0.0.4:6370

# Database Credentials (use generated secrets)
POSTGRES_PASSWORD=your_generated_secret_here
```

#### Step 3.5: Install Dependencies and Start Services

```bash
pnpm install
pnpm start:worker
```

#### Step 3.6: Verify Ruvector Follower

```bash
# Check Ruvector follower health
curl http://10.0.0.3:6370/health

# Expected output:
# {"status":"healthy","role":"follower","leader":"10.0.0.2:6370"}
```

---

### PC4: Worker-RTX3090Ti (10.0.0.4)

**Role**: GPU Worker 3 - Runs Ruvector Follower 2, n8n, Activepieces, Quote Engine, Campaign Engine

**Hardware Profile**:
- CPU: Intel i9 or AMD Ryzen 9 (12+ cores)
- RAM: 32GB
- Storage: 512GB NVMe SSD
- GPU: NVIDIA RTX 3090Ti (24GB VRAM)
- OS: Windows 11 Pro or Ubuntu 22.04

#### Step 4.1: Same as Worker-RTX5090

Follow the same steps as Worker-RTX5090, but use:
- IP: **10.0.0.4**
- NYRA_PC_ID: **worker-rtx3090ti**
- NYRA_WORKER_ID: **3**
- NYRA_GPU_TYPE: **rtx_3090ti**
- RUVECTOR_NODE_ID: **3**

#### Step 4.2: Verify Ruvector Cluster Formation

After all 3 workers are up, verify the Ruvector cluster:

```bash
# From any PC, check cluster status
curl http://10.0.0.2:6370/cluster/status | jq

# Expected output:
{
  "cluster_id": "nyra-cluster",
  "leader": "10.0.0.2:6370",
  "members": [
    {"id": "leader", "ip": "10.0.0.2", "role": "leader"},
    {"id": "follower1", "ip": "10.0.0.3", "role": "follower"},
    {"id": "follower2", "ip": "10.0.0.4", "role": "follower"}
  ],
  "status": "healthy",
  "consensus": "raft"
}
```

---

## 🐳 Docker Registry Setup

### 1. Public Docker Hub (Free Tier)

#### Step 1.1: Create Docker Hub Account

Visit: https://hub.docker.com/signup

#### Step 1.2: Login to Docker

```bash
# Login interactively
docker login

# Username: <your-dockerhub-username>
# Password: <your-dockerhub-password>

# Expected output:
# Login Succeeded
```

#### Step 1.3: Test Authentication

```bash
# Try pulling a test image
docker pull hello-world

# Expected: Image downloads successfully
```

---

### 2. GitHub Container Registry (Recommended for Private Images)

#### Step 2.1: Create Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `read:packages` (download images)
   - ✅ `write:packages` (upload images)
   - ✅ `delete:packages` (cleanup old images)
4. Click "Generate token"
5. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

#### Step 2.2: Login to GHCR

```bash
# Set your GitHub username
export GITHUB_USERNAME="your-github-username"

# Login using token (paste when prompted for password)
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Expected output:
# Login Succeeded
```

#### Step 2.3: Add to Environment

```bash
# Add to .env file
echo "GITHUB_TOKEN=ghp_xxxxxxxxxxxx" >> .env
echo "GITHUB_USERNAME=your-username" >> .env
```

---

### 3. Private Registry Setup (Advanced)

If you want to host your own private registry:

#### Step 3.1: Start Registry Container

```bash
# Create registry with authentication
docker run -d \
  -p 5000:5000 \
  --restart=always \
  --name registry \
  -v registry-data:/var/lib/registry \
  -e REGISTRY_AUTH=htpasswd \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
  registry:2
```

#### Step 3.2: Create Registry User

```bash
# Install htpasswd (if needed)
sudo apt-get install apache2-utils  # Linux
brew install httpd                   # macOS

# Create password file
docker run --rm --entrypoint htpasswd httpd:2 \
  -Bbn myuser mypassword > htpasswd

# Copy to container
docker cp htpasswd registry:/auth/htpasswd
```

#### Step 3.3: Test Private Registry

```bash
# Login
docker login localhost:5000 -u myuser -p mypassword

# Tag and push test image
docker tag hello-world localhost:5000/hello-world
docker push localhost:5000/hello-world
```

---

## 🗄️ Database Initialization

### 1. PostgreSQL Setup

#### Step 1.1: Start PostgreSQL Container

```bash
# Start just PostgreSQL for initialization
docker-compose -f docker-compose.infisical.yml up -d postgres

# Wait for health check
docker-compose -f docker-compose.infisical.yml ps postgres
# Should show: Up (healthy)
```

#### Step 1.2: Create Databases

```bash
# Connect to PostgreSQL
docker exec -it nyra-postgres psql -U postgres

# Or using password from .env:
docker exec -it nyra-postgres psql -U postgres -d postgres
```

**Run these SQL commands:**

```sql
-- Create all application databases
CREATE DATABASE dify;
CREATE DATABASE twenty;
CREATE DATABASE letta;
CREATE DATABASE n8n;
CREATE DATABASE litellm;
CREATE DATABASE nyra;
CREATE DATABASE activepieces;

-- Create application users with proper permissions
CREATE USER dify_user WITH PASSWORD 'generated_password_1';
GRANT ALL PRIVILEGES ON DATABASE dify TO dify_user;

CREATE USER twenty_user WITH PASSWORD 'generated_password_2';
GRANT ALL PRIVILEGES ON DATABASE twenty TO twenty_user;

CREATE USER letta_user WITH PASSWORD 'generated_password_3';
GRANT ALL PRIVILEGES ON DATABASE letta TO letta_user;

CREATE USER n8n_user WITH PASSWORD 'generated_password_4';
GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n_user;

CREATE USER nyra_user WITH PASSWORD 'generated_password_5';
GRANT ALL PRIVILEGES ON DATABASE nyra TO nyra_user;

CREATE USER activepieces_user WITH PASSWORD 'generated_password_6';
GRANT ALL PRIVILEGES ON DATABASE activepieces TO activepieces_user;

-- Verify databases
\l

-- Exit
\q
```

#### Step 1.3: Run Migrations

```bash
# Initialize Nyra database schema
docker exec -it nyra-postgres psql -U nyra_user -d nyra -f /docker-entrypoint-initdb.d/init.sql

# Check tables were created
docker exec -it nyra-postgres psql -U nyra_user -d nyra -c "\dt"
```

---

### 2. Redis Setup

#### Step 2.1: Start Redis Container

```bash
# Start Redis
docker-compose -f docker-compose.infisical.yml up -d redis

# Wait for health check
docker-compose -f docker-compose.infisical.yml ps redis
```

#### Step 2.2: Test Redis Connection

```bash
# Connect to Redis with password
docker exec -it nyra-redis redis-cli -a "$REDIS_PASSWORD"

# Test commands:
PING        # Should return: PONG
SET test "Hello"
GET test    # Should return: "Hello"
DEL test
QUIT
```

---

### 3. FalkorDB Setup (Graph Database)

#### Step 3.1: Start FalkorDB Container

```bash
# Start FalkorDB
docker-compose -f docker-compose.infisical.yml up -d falkordb

# Check status
docker-compose -f docker-compose.infisical.yml ps falkordb
```

#### Step 3.2: Initialize Graph

```bash
# Connect to FalkorDB (uses Redis protocol)
docker exec -it nyra-falkordb redis-cli -a "$FALKORDB_PASSWORD"

# Create a test graph
GRAPH.QUERY demo "CREATE (:Person {name: 'Test', age: 30})"

# Query the graph
GRAPH.QUERY demo "MATCH (p:Person) RETURN p.name, p.age"

# Delete test data
GRAPH.DELETE demo

QUIT
```

---

### 4. ChromaDB Setup (Vector Database)

#### Step 4.1: Start ChromaDB Container

```bash
# Start ChromaDB
docker-compose -f docker-compose.infisical.yml up -d chromadb

# Check health
curl http://localhost:8001/api/v1/heartbeat
# Should return: {"nanosecond heartbeat": <timestamp>}
```

#### Step 4.2: Create Test Collection

```bash
# Install ChromaDB Python client (for testing)
pip install chromadb-client

# Create test script: test_chroma.py
cat > test_chroma.py << 'EOF'
import chromadb

client = chromadb.HttpClient(host='localhost', port=8001)
collection = client.create_collection(name="test_collection")

# Add some documents
collection.add(
    documents=["This is a test document"],
    ids=["test_1"]
)

# Query
results = collection.query(
    query_texts=["test"],
    n_results=1
)

print("ChromaDB test successful!")
print(results)

# Cleanup
client.delete_collection(name="test_collection")
EOF

# Run test
python test_chroma.py

# Cleanup
rm test_chroma.py
```

---

## ✅ Verification Steps

### 1. Service Health Checks

Run the comprehensive health check script:

```bash
# Make script executable
chmod +x ./scripts/health-check.sh

# Run health checks
./scripts/health-check.sh

# Expected output:
# ✓ PostgreSQL: healthy (port 5432)
# ✓ Redis: healthy (port 6380)
# ✓ FalkorDB: healthy (port 6379)
# ✓ ChromaDB: healthy (port 8001)
# ✓ Infisical MCP: healthy (port 8006)
# ✓ Claude Flow MCP: healthy (port 8003)
# ✓ MetaMCP Gateway: healthy (port 8005)
#
# Overall Status: ALL SYSTEMS OPERATIONAL ✓
```

---

### 2. Test API Endpoints

#### Test Quote Engine:

```bash
# Health check
curl http://localhost:8001/health

# Test quote generation
curl -X POST http://localhost:8001/quote \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 300000,
    "property_value": 400000,
    "credit_score": 750,
    "loan_term": 30
  }'

# Expected: JSON response with quote details
```

#### Test Nexus Router:

```bash
# Health check
curl http://localhost:7000/health

# List available tools
curl http://localhost:7000/tools

# Expected: JSON array of MCP tools
```

---

### 3. Test MCP Server Integration

```bash
# Test Infisical MCP
curl http://localhost:8006/health

# Test Claude Flow MCP
curl http://localhost:8003/health

# Test MetaMCP Gateway
curl http://localhost:8005/mcp/tools
```

---

### 4. Database Connectivity Tests

```bash
# PostgreSQL
docker exec nyra-postgres pg_isready -U postgres
# Expected: postgres:5432 - accepting connections

# Redis
docker exec nyra-redis redis-cli -a "$REDIS_PASSWORD" ping
# Expected: PONG

# FalkorDB
docker exec nyra-falkordb redis-cli -a "$FALKORDB_PASSWORD" ping
# Expected: PONG

# ChromaDB
curl http://localhost:8001/api/v1/heartbeat
# Expected: {"nanosecond heartbeat": <number>}
```

---

### 5. End-to-End Test

Run the complete integration test:

```bash
# Run integration tests
npm run test:integration

# Or manually:
./scripts/test-integration.sh

# Expected:
# Running integration tests...
# ✓ Database connectivity
# ✓ MCP server communication
# ✓ API endpoints responding
# ✓ Secret management working
# ✓ Docker networking functional
#
# All tests passed! (12/12)
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Infisical Authentication Failed

**Symptoms:**
```
ERROR: Failed to authenticate with Infisical
401 Unauthorized
```

**Solutions:**

1. **Check Token Validity:**
   ```bash
   # Re-authenticate
   infisical logout
   infisical login --interactive
   ```

2. **Verify Token Permissions:**
   - Go to Infisical Dashboard
   - Project Settings → Service Tokens
   - Ensure token has `read` and `write` permissions
   - Check environment is correct (`production`, not `dev`)

3. **Test Connection:**
   ```bash
   # Manual test
   infisical secrets get --help

   # If this fails, token is invalid
   ```

---

#### Issue 2: Docker Container Won't Start

**Symptoms:**
```
ERROR: Container nyra-postgres is unhealthy
```

**Solutions:**

1. **Check Logs:**
   ```bash
   docker logs nyra-postgres --tail 50
   ```

2. **Common Causes:**
   - **Port already in use:**
     ```bash
     # Find what's using the port
     netstat -ano | findstr :5432  # Windows
     lsof -i :5432                 # Mac/Linux

     # Kill the process or change port in docker-compose.yml
     ```

   - **Insufficient resources:**
     ```bash
     # Check Docker resources
     docker info | grep -i memory

     # Increase in Docker Desktop settings:
     # Settings → Resources → Memory (increase to 8GB+)
     ```

   - **Volume permissions:**
     ```bash
     # Fix volume permissions (Linux)
     sudo chown -R 1000:1000 ./volumes/postgres
     ```

3. **Hard Reset:**
   ```bash
   # Stop all containers
   docker-compose -f docker-compose.infisical.yml down -v

   # Remove volumes (WARNING: DELETES DATA)
   docker volume prune -f

   # Start fresh
   docker-compose -f docker-compose.infisical.yml up -d
   ```

---

#### Issue 3: Environment Variables Not Loading

**Symptoms:**
```
ERROR: Missing required environment variable: ANTHROPIC_API_KEY
```

**Solutions:**

1. **Verify .env File:**
   ```bash
   # Check file exists
   ls -la .env

   # Check contents (without revealing secrets)
   grep "ANTHROPIC_API_KEY" .env | wc -l
   # Should return: 1
   ```

2. **Check .env Format:**
   ```bash
   # Common issues:
   # - Spaces around = sign (should be KEY=value, not KEY = value)
   # - Quotes incorrectly used (KEY=value, not KEY="value" unless value has spaces)
   # - Comments on same line as value

   # Validate format:
   cat .env | grep -E "^\s*[A-Z_]+\s*=\s*.+" | wc -l
   # Should match number of variables you set
   ```

3. **Test Variable Loading:**
   ```bash
   # Load and check
   set -a; source .env; set +a
   echo $ANTHROPIC_API_KEY
   # Should print your API key
   ```

4. **Infisical Override:**
   ```bash
   # If using Infisical, check precedence
   infisical run --env production --path /nyra/orchestrator -- env | grep ANTHROPIC

   # Infisical secrets override .env file
   ```

---

#### Issue 4: Database Connection Refused

**Symptoms:**
```
ERROR: Connection refused - could not connect to PostgreSQL
```

**Solutions:**

1. **Check Container is Running:**
   ```bash
   docker ps | grep postgres
   # Should show: Up (healthy)
   ```

2. **Check Port Mapping:**
   ```bash
   docker port nyra-postgres
   # Should show: 5432/tcp -> 0.0.0.0:5432
   ```

3. **Test Connection:**
   ```bash
   # From host machine
   psql -h localhost -p 5432 -U postgres -d postgres

   # If this fails but container is running, check:
   docker exec -it nyra-postgres psql -U postgres -c "SELECT version();"
   # If this succeeds, network issue. If fails, database issue.
   ```

4. **Check Firewall:**
   ```bash
   # Windows: Allow Docker through firewall
   # Settings → Firewall → Allow an app → Docker Desktop

   # Linux: Check iptables
   sudo iptables -L -n | grep 5432
   ```

---

#### Issue 5: MCP Server Not Responding

**Symptoms:**
```
ERROR: MCP server at localhost:8006 not responding
```

**Solutions:**

1. **Check Container Status:**
   ```bash
   docker-compose -f docker-compose.infisical.yml ps infisical-mcp
   ```

2. **View Logs:**
   ```bash
   docker logs nyra-infisical-mcp --tail 100
   ```

3. **Test Health Endpoint:**
   ```bash
   curl -v http://localhost:8006/health

   # If connection refused:
   # - Container not running
   # - Wrong port mapping
   # - Health endpoint not implemented
   ```

4. **Check Network Connectivity:**
   ```bash
   # Ping container from host
   docker exec nyra-infisical-mcp ping -c 3 host.docker.internal

   # Check network
   docker network inspect nyra-infisical-network
   ```

5. **Restart MCP Server:**
   ```bash
   docker-compose -f docker-compose.infisical.yml restart infisical-mcp
   docker logs -f nyra-infisical-mcp
   ```

---

#### Issue 6: API Key Invalid or Expired

**Symptoms:**
```
ERROR: Anthropic API authentication failed - 401 Unauthorized
```

**Solutions:**

1. **Verify API Key Format:**
   ```bash
   # Anthropic keys start with: sk-ant-api03-
   echo $ANTHROPIC_API_KEY | grep -E "^sk-ant-api03-"

   # If no match, key format is wrong
   ```

2. **Check Key Status:**
   - Go to https://console.anthropic.com/settings/keys
   - Verify key is still active
   - Check usage limits haven't been exceeded

3. **Regenerate Key:**
   - Delete old key in Anthropic Console
   - Create new key
   - Update .env file
   - Restart services:
     ```bash
     docker-compose -f docker-compose.infisical.yml restart
     ```

---

#### Issue 7: Dead Symlinks (pnpm workspace)

**Symptoms:**
```
ERROR: ENOENT: no such file or directory, lstat 'C:\Dev\Projects\Repos\Project-Nyra\node_modules\.pnpm\...'
```

**Cause**: Workspace symlinks pointing to non-existent packages

**Solutions:**

1. **Nuclear Option (Recommended for first fix)**:
   ```bash
   # Stop all running services
   docker compose down

   # Delete everything pnpm-related
   rm -rf node_modules
   rm -rf pnpm-lock.yaml
   rm -rf .pnpm-store
   rm -rf ~/.pnpm-store  # Global store

   # Clear pnpm cache
   pnpm store prune

   # Reinstall from scratch
   pnpm install

   # Expected: Clean installation with no symlink errors
   ```

2. **Targeted Fix (if you know the problematic package)**:
   ```bash
   # Remove specific workspace package symlinks
   pnpm unlink --filter @nyra/problematic-package

   # Remove package from node_modules
   rm -rf node_modules/@nyra/problematic-package

   # Reinstall specific workspace
   pnpm install --filter @nyra/problematic-package

   # Recreate symlinks
   pnpm link --filter @nyra/problematic-package
   ```

3. **Check pnpm-workspace.yaml**:
   ```bash
   # Verify workspace configuration
   cat pnpm-workspace.yaml

   # Should look like:
   # packages:
   #   - 'apps/*'
   #   - 'services/*'
   #   - 'packages/*'

   # Verify all workspace packages exist
   ls -d apps/* services/* packages/*
   ```

4. **Fix WSL2 Symlink Issues (Windows)**:
   ```powershell
   # In WSL2, enable metadata support
   sudo nano /etc/wsl.conf

   # Add:
   [automount]
   enabled = true
   options = "metadata"

   # Restart WSL
   wsl --shutdown
   wsl

   # Reinstall
   cd /mnt/c/Dev/Projects/Repos/Project-Nyra
   pnpm install
   ```

5. **Verify Symlink Integrity**:
   ```bash
   # Check for broken symlinks
   find node_modules -type l ! -exec test -e {} \; -print

   # Should return: nothing (no broken links)
   ```

---

#### Issue 8: Turborepo Build Failures

**Symptoms:**
```
ERROR: turbo run build failed
```

**Solutions:**

1. **Check Turborepo Configuration**:
   ```bash
   # Verify turbo.json exists
   cat turbo.json

   # Should have build pipeline configured
   ```

2. **Clear Turborepo Cache**:
   ```bash
   # Remove Turborepo cache
   rm -rf .turbo
   rm -rf node_modules/.cache/turbo

   # Clear individual workspace caches
   turbo run clean

   # Rebuild
   turbo run build --force
   ```

3. **Build Specific Workspace**:
   ```bash
   # Test individual workspace builds
   turbo run build --filter=@nyra/utils
   turbo run build --filter=ratehunter

   # If a specific workspace fails, fix that first
   ```

4. **Check Dependencies**:
   ```bash
   # Verify all workspace dependencies are installed
   pnpm list -r --depth=0

   # Should show all @nyra/* packages
   ```

5. **Rebuild with Verbose Output**:
   ```bash
   # Get detailed error information
   turbo run build --verbosity=2

   # Or for maximum detail
   turbo run build --verbosity=3
   ```

---

#### Issue 9: Scripts Executable on Correct PCs

**Symptoms:**
```
ERROR: Script failed - permission denied or not found
```

**Solutions:**

1. **Windows: Execution Policy**:
   ```powershell
   # Check current policy
   Get-ExecutionPolicy

   # Allow scripts (Administrator)
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

   # Or for single script
   Unblock-File -Path .\scripts\deploy-orchestrator.ps1
   ```

2. **Linux: File Permissions**:
   ```bash
   # Make all scripts executable
   chmod +x scripts/**/*.sh

   # Or specific script
   chmod +x scripts/health-check.sh
   ```

3. **Verify Script Location**:
   ```bash
   # Check script exists
   ls -la scripts/

   # Run script with explicit path
   bash ./scripts/health-check.sh

   # Or from root
   cd C:\Dev\Projects\Repos\Project-Nyra
   .\scripts\deploy-orchestrator.ps1
   ```

4. **PC-Specific Scripts**:
   ```bash
   # Orchestrator scripts (run on PC1 only)
   scripts/deploy-orchestrator.sh

   # Worker scripts (run on PC2, PC3, PC4)
   scripts/deploy-worker.sh

   # Verify NYRA_PC_ID environment variable
   echo $NYRA_PC_ID

   # Should match PC role
   ```

---

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Set log level to debug
export LOG_LEVEL=debug

# Or in .env:
echo "LOG_LEVEL=debug" >> .env

# Restart services with debug logging
docker-compose -f docker-compose.infisical.yml down
docker-compose -f docker-compose.infisical.yml up -d

# View debug logs
docker-compose -f docker-compose.infisical.yml logs -f
```

---

## 🔄 Rollback Procedures

If something goes wrong, follow these steps to safely rollback.

### Level 1: Restart Services (Non-Destructive)

```bash
# Stop all services
docker-compose -f docker-compose.infisical.yml down

# Restart
docker-compose -f docker-compose.infisical.yml up -d

# Check status
docker-compose -f docker-compose.infisical.yml ps
```

**Impact**: None - data preserved

---

### Level 2: Reset Configuration (Preserves Data)

```bash
# Stop services
docker-compose -f docker-compose.infisical.yml down

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d-%H%M%S)

# Restore from template
cp .env.example .env

# Edit .env with correct values
nano .env  # or your preferred editor

# Restart
docker-compose -f docker-compose.infisical.yml up -d
```

**Impact**: Configuration reset, data preserved

---

### Level 3: Database Rollback (Destructive)

```bash
# BACKUP FIRST!
./scripts/backup-databases.sh

# Stop services
docker-compose -f docker-compose.infisical.yml down

# Remove database volumes
docker volume rm nyra_postgres_data
docker volume rm nyra_falkordb_data
docker volume rm nyra_chromadb_data

# Restart (will reinitialize databases)
docker-compose -f docker-compose.infisical.yml up -d postgres falkordb chromadb

# Restore from backup
./scripts/restore-databases.sh backup-20260116-120000
```

**Impact**: ⚠️ ALL DATABASE DATA LOST (unless restored from backup)

---

### Level 4: Complete Reset (Nuclear Option)

```bash
# BACKUP EVERYTHING!
./scripts/backup-all.sh

# Stop all services
docker-compose -f docker-compose.infisical.yml down -v

# Remove ALL volumes
docker volume prune -f

# Remove ALL containers
docker container prune -f

# Remove ALL images
docker image prune -a -f

# Reset configuration
rm .env
cp .env.example .env

# Start from scratch
# (Follow this guide from the beginning)
```

**Impact**: ⚠️⚠️⚠️ COMPLETE SYSTEM RESET - ALL DATA LOST

---

### Backup Strategy

**Create Backup Script:** `scripts/backup-all.sh`

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="./backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Creating backup: $BACKUP_DIR"

# Backup .env
cp .env "$BACKUP_DIR/.env"

# Backup databases
docker exec nyra-postgres pg_dumpall -U postgres > "$BACKUP_DIR/postgres.sql"
docker exec nyra-redis redis-cli -a "$REDIS_PASSWORD" --rdb "$BACKUP_DIR/redis.rdb"

# Backup volumes
docker run --rm \
  -v nyra_postgres_data:/source \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf /backup/postgres_data.tar.gz -C /source .

echo "Backup complete: $BACKUP_DIR"
echo "To restore: ./scripts/restore-all.sh $BACKUP_DIR"
```

**Make executable:**
```bash
chmod +x scripts/backup-all.sh
chmod +x scripts/restore-all.sh
```

---

## 🚀 Advanced Configuration

### 1. Multi-PC Distributed Setup

For distributed GPU compute across multiple PCs:

#### Step 1: Configure Cloudflare Tunnels

**On Orchestrator PC:**
```bash
# Install Cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create nyra-orchestrator

# Save the tunnel credentials
# File location: ~/.cloudflared/<tunnel-id>.json
```

**Configure tunnel:** `config/cloudflared/config.yml`

```yaml
tunnel: <tunnel-id>
credentials-file: /home/user/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: nyra.ratehunter.net
    service: http://localhost:8000
  - hostname: api.ratehunter.net
    service: http://localhost:7000
  - hostname: mcp.ratehunter.net
    service: http://localhost:8005
  - service: http_status:404
```

**Start tunnel:**
```bash
cloudflared tunnel run nyra-orchestrator
```

**Repeat for each worker PC with different hostnames.**

---

### 2. High Availability Setup

#### PostgreSQL Replication:

**Primary:** `docker-compose.ha.yml`

```yaml
services:
  postgres-primary:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: ${POSTGRES_REPLICATION_PASSWORD}
    command: |
      postgres
      -c wal_level=replica
      -c max_wal_senders=10
      -c max_replication_slots=10
      -c hot_standby=on
    volumes:
      - postgres_primary:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  postgres-replica:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/replica
    command: |
      postgres
      -c hot_standby=on
    depends_on:
      - postgres-primary
    volumes:
      - postgres_replica:/var/lib/postgresql/data
```

**Setup replication:**
```bash
# On primary:
docker exec -it postgres-primary psql -U postgres -c \
  "CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD '${POSTGRES_REPLICATION_PASSWORD}';"

# On replica:
docker exec -it postgres-replica pg_basebackup -h postgres-primary -D /var/lib/postgresql/data/replica -U replicator -P -R
```

---

### 3. Security Hardening

#### Enable TLS for All Services:

**Generate certificates:**
```bash
# Install mkcert
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-*-linux-amd64
sudo mv mkcert-*-linux-amd64 /usr/local/bin/mkcert

# Install CA
mkcert -install

# Generate certificates
cd config/certs
mkcert -cert-file cert.pem -key-file key.pem \
  localhost 127.0.0.1 \
  nyra.ratehunter.net \
  "*.ratehunter.net"
```

**Configure Nginx reverse proxy:** `infra/nginx/nginx.conf`

```nginx
server {
    listen 443 ssl http2;
    server_name nyra.ratehunter.net;

    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://nyra-orchestrator:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 4. Performance Optimization

#### Enable Redis Caching:

```bash
# Configure Redis for LRU cache
docker exec -it nyra-redis redis-cli -a "$REDIS_PASSWORD" CONFIG SET maxmemory 2gb
docker exec -it nyra-redis redis-cli -a "$REDIS_PASSWORD" CONFIG SET maxmemory-policy allkeys-lru

# Enable persistence
docker exec -it nyra-redis redis-cli -a "$REDIS_PASSWORD" CONFIG SET save "900 1 300 10 60 10000"
```

#### PostgreSQL Tuning:

```sql
-- Connect to postgres
docker exec -it nyra-postgres psql -U postgres

-- Optimize for your hardware
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '10MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Restart PostgreSQL
\q
docker-compose -f docker-compose.infisical.yml restart postgres
```

---

## 📚 Support Resources

### Official Documentation

- **Project Nyra Docs**: `docs/README.md`
- **Architecture Guide**: `docs/architecture/system-architecture.md`
- **API Reference**: `docs/api/README.md`
- **Deployment Guide**: `docs/deployment/PRODUCTION-DEPLOYMENT-GUIDE.md`

---

### Quick Reference Links

| Resource | URL |
|----------|-----|
| **Infisical Docs** | https://infisical.com/docs |
| **Docker Docs** | https://docs.docker.com |
| **Claude API** | https://docs.anthropic.com |
| **PostgreSQL** | https://www.postgresql.org/docs/ |
| **Redis** | https://redis.io/documentation |
| **FalkorDB** | https://www.falkordb.com/docs |

---

### Community Support

- **GitHub Issues**: https://github.com/mhenry3164/Project-Nyra/issues
- **GitHub Discussions**: https://github.com/mhenry3164/Project-Nyra/discussions
- **Discord** (if available): [Add link]

---

### Getting Help

**Before asking for help:**
1. ✅ Check this troubleshooting section
2. ✅ Search existing GitHub issues
3. ✅ Run `./scripts/health-check.sh`
4. ✅ Collect relevant log files

**When requesting support, include:**
- Operating system and version
- Docker version (`docker --version`)
- Relevant log snippets (sanitize secrets!)
- Steps to reproduce the issue
- What you've already tried

**Example support request:**
```markdown
## Issue Description
PostgreSQL container fails to start with "invalid memory allocation" error

## Environment
- OS: Windows 11 Pro 22H2
- Docker: 24.0.6
- Project Nyra: v1.0.0

## Steps to Reproduce
1. Run: docker-compose -f docker-compose.infisical.yml up -d postgres
2. Container starts then immediately exits

## Logs
```
2026-01-16 12:34:56 [ERROR] invalid memory allocation request
2026-01-16 12:34:56 [FATAL] database system initialization failed
```

## Already Tried
- Increased Docker memory to 8GB
- Removed volume and started fresh
- Checked port 5432 is available
```

---

## ✅ Completion Checklist

Before marking setup as complete, verify:

### Authentication ✓
- [ ] Infisical CLI installed and authenticated
- [ ] Anthropic API key configured and tested
- [ ] Bitwarden CLI setup (if using)
- [ ] Docker registries authenticated

### Configuration ✓
- [ ] .env file created from template
- [ ] All secrets generated (16 unique values)
- [ ] API keys from external services obtained
- [ ] Environment variables validated
- [ ] Secrets synced to Infisical (production)

### Databases ✓
- [ ] PostgreSQL running and healthy
- [ ] All application databases created
- [ ] Redis operational
- [ ] FalkorDB initialized
- [ ] ChromaDB responding

### Services ✓
- [ ] All Docker containers running
- [ ] Health checks passing
- [ ] MCP servers responding
- [ ] API endpoints accessible

### Testing ✓
- [ ] Health check script passed
- [ ] Integration tests successful
- [ ] End-to-end test completed
- [ ] Manual smoke test performed

### Documentation ✓
- [ ] Credentials stored securely
- [ ] Backup created
- [ ] Rollback procedure tested
- [ ] Team members notified (if applicable)

---

## 🎉 Success!

If you've completed all steps, **congratulations!** Your Project Nyra installation is fully configured and operational.

**Next Steps:**
1. Review the [User Guide](../guides/USER-GUIDE.md) for usage instructions
2. Explore the [API Documentation](../api/README.md) to integrate with services
3. Set up monitoring dashboards (see [Observability Setup](../observability-setup.md))
4. Configure automated backups (see [Backup Guide](../operations/BACKUP-GUIDE.md))

---

**Questions or Issues?**
Open an issue on GitHub or check the troubleshooting section above.

**Document Version**: 1.0.0
**Last Updated**: 2026-01-16
**Maintained By**: Project Nyra Team
