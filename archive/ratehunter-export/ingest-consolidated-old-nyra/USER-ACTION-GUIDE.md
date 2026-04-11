# USER ACTION GUIDE - Project Nyra 4-PC Setup

**Complete Manual Setup Checklist**

**Last Updated**: 2026-01-16
**Version**: 1.0.0
**Target**: 4-PC Distributed Architecture (1 Orchestrator + 3 Workers)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Part 1: Create Online Accounts](#part-1-create-online-accounts)
4. [Part 2: Orchestrator PC Setup](#part-2-orchestrator-pc-setup)
5. [Part 3: Worker PC Setup](#part-3-worker-pc-setup)
6. [Part 4: Environment Variables](#part-4-environment-variables)
7. [Part 5: Infisical Configuration](#part-5-infisical-configuration)
8. [Part 6: Tailscale VPN Setup](#part-6-tailscale-vpn-setup)
9. [Part 7: Cloudflared Tunnels](#part-7-cloudflared-tunnels)
10. [Part 8: Wake-on-LAN Configuration](#part-8-wake-on-lan-configuration)
11. [Part 9: PC-Specific Configuration](#part-9-pc-specific-configuration)
12. [Part 10: Database Initialization](#part-10-database-initialization)
13. [Troubleshooting](#troubleshooting)

---

## Overview

This guide contains **ALL** manual setup steps required for the Project Nyra 4-PC distributed AI infrastructure. Each step requires user action and cannot be fully automated.

### 4-PC Architecture

| PC | Hardware | Role | Components |
|----|----------|------|------------|
| **PC1 - Orchestrator** | Minisforum UH680 (Ryzen 7, 16GB) | Control & Data | Docker, WSL2, Gitea, PostgreSQL, Redis, Qdrant, Claude |
| **PC2 - Worker RTX 3060** | Alienware M15R7 (RTX 3060, 32GB) | GPU Worker | Docker, WSL2, NVIDIA, Claude, Ollama |
| **PC3 - Worker RTX 5090** | Alienware Area-51 (RTX 5090, 32GB) | GPU Worker | Docker, WSL2, NVIDIA, Claude, Ollama |
| **PC4 - Worker RTX 3090Ti** | Custom PC (RTX 3090Ti, 32GB) | GPU Worker | Docker, WSL2, NVIDIA, Claude, Ollama |

### Estimated Time

- **Initial Setup**: 4-6 hours (account creation + orchestrator)
- **Each Worker**: 2-3 hours
- **Total**: 10-15 hours

---

## Prerequisites

### Required Knowledge
- Basic Windows administration
- Command line operations (PowerShell/Bash)
- Network configuration basics
- Understanding of environment variables

### Required Hardware
- [ ] All 4 PCs powered on and accessible
- [ ] Ethernet cables connected to all PCs
- [ ] Router with static IP capability
- [ ] Keyboard, mouse, monitor for setup

### Required Software (Install First)
- [ ] Windows 11 Pro on all PCs (build 22000+)
- [ ] Git for Windows
- [ ] VS Code (optional, recommended)
- [ ] Browser (Chrome/Edge/Firefox)

---

## Part 1: Create Online Accounts

These accounts are required before starting setup. Create them all first.

### 1.1 Anthropic (Claude API)

**Required For**: AI model access (primary LLM)

1. Go to: https://console.anthropic.com
2. Click **Sign Up** or **Sign In**
3. Complete account registration
4. Navigate to **Settings** → **API Keys**
5. Click **Create Key**
6. Copy your API key: `sk-ant-api03-...`
7. **Save securely** (you'll need this later)

**Cost**: Pay-as-you-go (expect $20-50/month for development)

### 1.2 Google AI Studio (Gemini API)

**Required For**: Cost-efficient AI tasks, fallback LLM

1. Go to: https://aistudio.google.com/apikey
2. Sign in with Google account
3. Click **Get API key** or **Create API key**
4. Copy your API key
5. **Save securely**

**Cost**: Free tier available (60 requests/minute)

### 1.3 Infisical (Secrets Management)

**Required For**: Secure environment variable storage across PCs

1. Go to: https://app.infisical.com/signup
2. Create account (email + password)
3. Verify email
4. Create new project: **"Project Nyra"**
5. Copy Project ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
6. Navigate to **Settings** → **Tokens**
7. Create **Service Token** with read/write permissions
8. Copy token: `st.xxxxx.xxxxx.xxxxx`
9. **Save securely**

**Cost**: Free for up to 5 users

### 1.4 Tailscale (VPN)

**Required For**: Secure networking between PCs

1. Go to: https://login.tailscale.com/start
2. Sign up (use Google/GitHub/Microsoft)
3. Navigate to **Settings** → **Keys**
4. Click **Generate auth key**
5. Configure:
   - **Description**: Project Nyra - PC1 Orchestrator
   - **Expiration**: 90 days
   - **Reusable**: Yes
   - **Ephemeral**: No
   - **Tags**: `tag:orchestrator,tag:exit-node`
   - **Pre-approved**: Routes + Exit node
6. Copy auth key: `tskey-auth-xxxxxxxxxxxxx`
7. Repeat for each worker PC with appropriate tags
8. **Save all keys securely**

**Cost**: Free for up to 100 devices

### 1.5 Cloudflare (Tunnels)

**Required For**: Secure external access to services

1. Go to: https://dash.cloudflare.com/sign-up
2. Create account
3. Add domain (if you have one) or use Cloudflare's free domain
4. Navigate to **Zero Trust** → **Access** → **Tunnels**
5. Click **Create a tunnel**
6. Name: "nyra-orchestrator"
7. Copy tunnel token
8. **Save securely**

**Cost**: Free for tunnels

### 1.6 Twilio (Optional - SMS/Voice)

**Required For**: Campaign engine SMS/voice features

1. Go to: https://www.twilio.com/try-twilio
2. Sign up for trial account
3. Verify phone number
4. Navigate to **Console**
5. Note:
   - Account SID: `ACxxxxxxxxxxxxxxxxxxxxx`
   - Auth Token: `xxxxxxxxxxxxxxxxxxxxx`
6. Go to **Phone Numbers** → **Buy a number**
7. Purchase a phone number (trial gives $15 credit)
8. Note your Twilio number: `+1555xxxxxxx`
9. **Save all values securely**

**Cost**: $15/month + usage (optional)

### 1.7 GitHub (Optional - Repository Management)

**Required For**: GitHub integrations, MCP GitHub server

1. Go to: https://github.com/settings/tokens
2. Click **Generate new token** → **Classic**
3. Configure:
   - **Note**: Project Nyra - PC1
   - **Expiration**: 90 days
   - **Scopes**: `repo`, `workflow`, `read:org`
4. Generate and copy token: `ghp_xxxxxxxxxxxxxxxxxxxxx`
5. **Save securely**

**Cost**: Free for public repos

### 1.8 OpenRouter (Optional - Alternative LLM)

**Required For**: Fallback LLM provider, model diversity

1. Go to: https://openrouter.ai/keys
2. Sign in (Google/GitHub)
3. Click **Create API Key**
4. Copy key
5. **Save securely**

**Cost**: Pay-as-you-go

### ✅ Part 1 Checklist

Before proceeding, ensure you have:
- [ ] Anthropic API key (`sk-ant-...`)
- [ ] Google API key
- [ ] Infisical project ID and service token
- [ ] 4x Tailscale auth keys (1 orchestrator + 3 workers)
- [ ] Cloudflare tunnel token
- [ ] Twilio credentials (if using SMS/voice)
- [ ] GitHub personal access token (if using GitHub features)
- [ ] OpenRouter API key (optional)

**IMPORTANT**: Store all these values in a secure password manager. You will need them multiple times during setup.

---

## Part 2: Orchestrator PC Setup

**Target PC**: Minisforum UH680 (PC1)
**Time**: 2-3 hours

### 2.1 Windows Configuration

1. **Install Windows Updates**
   ```powershell
   # Open Windows Update
   # Install all pending updates
   # Restart if required
   ```

2. **Set PC Name**
   ```powershell
   # Settings → System → About → Rename this PC
   # Set name: "NYRA-ORCHESTRATOR"
   # Restart when prompted
   ```

3. **Enable Required Windows Features**
   ```powershell
   # Open PowerShell as Administrator
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

   # Restart PC
   shutdown /r /t 0
   ```

### 2.2 Install WSL 2

```powershell
# Open PowerShell as Administrator
wsl --install -d Ubuntu-24.04

# Wait for installation (10-15 minutes)
# When prompted, create WSL user:
#   Username: nyra
#   Password: <create strong password>
```

**Save WSL Password**: You'll need this for future operations

### 2.3 Install Core Software

```powershell
# Git for Windows
winget install Git.Git

# Node.js 20 LTS
winget install OpenJS.NodeJS.LTS

# Python 3.11
winget install Python.Python.3.11

# Docker Desktop
winget install Docker.DockerDesktop

# After Docker installation, open Docker Desktop
# - Accept license
# - Use WSL 2 backend (default)
# - Start Docker
```

### 2.4 Network Configuration - Static IP

**Manual Method (Recommended)**:

1. Open **Settings** → **Network & Internet** → **Ethernet**
2. Click your network adapter
3. Click **Edit** next to IP assignment
4. Select **Manual** and enable **IPv4**
5. Enter:
   ```
   IP address:     192.168.1.101
   Subnet mask:    255.255.255.0
   Gateway:        192.168.1.1
   Preferred DNS:  8.8.8.8
   Alternate DNS:  8.8.4.4
   ```
6. Click **Save**

**PowerShell Method** (if preferred):

```powershell
# Find your adapter name
Get-NetAdapter

# Set static IP (replace "Ethernet" with your adapter name)
New-NetIPAddress -InterfaceAlias "Ethernet" `
  -IPAddress 192.168.1.101 `
  -PrefixLength 24 `
  -DefaultGateway 192.168.1.1

# Set DNS servers
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
  -ServerAddresses ("8.8.8.8","8.8.4.4")

# Verify
Get-NetIPAddress -InterfaceAlias "Ethernet"
```

### 2.5 Get MAC Address

You'll need this for Wake-on-LAN configuration.

```powershell
# Get MAC address
(Get-NetAdapter -Name "Ethernet").MacAddress

# Example output: AA-BB-CC-DD-EE-FF
# Save this value for later
```

**Save**: MAC address in format `AA:BB:CC:DD:EE:FF`

### 2.6 Firewall Configuration

```powershell
# Open PowerShell as Administrator

# Allow Docker
New-NetFirewallRule -DisplayName "Docker Desktop" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 2375,2376 `
    -Action Allow

# Allow PostgreSQL
New-NetFirewallRule -DisplayName "PostgreSQL" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 5432 `
    -Action Allow

# Allow Redis
New-NetFirewallRule -DisplayName "Redis" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 6379 `
    -Action Allow

# Allow Qdrant
New-NetFirewallRule -DisplayName "Qdrant" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 6333,6334 `
    -Action Allow

# Allow Grafana
New-NetFirewallRule -DisplayName "Grafana" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 3000 `
    -Action Allow

# Allow Prometheus
New-NetFirewallRule -DisplayName "Prometheus" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 9090 `
    -Action Allow

# Allow Tailscale
New-NetFirewallRule -DisplayName "Tailscale" `
    -Direction Inbound `
    -Protocol UDP `
    -LocalPort 41641 `
    -Action Allow
```

### 2.7 Clone Repository

```powershell
# Create project directory
mkdir C:\Dev\Projects\Repos
cd C:\Dev\Projects\Repos

# Clone repository
git clone https://github.com/your-org/Project-Nyra.git
cd Project-Nyra

# Verify
dir bootstrap
```

### ✅ Part 2 Checklist

Orchestrator setup complete when you have:
- [ ] Windows 11 Pro installed and updated
- [ ] PC named "NYRA-ORCHESTRATOR"
- [ ] WSL 2 installed with Ubuntu
- [ ] Git, Node.js, Python, Docker installed
- [ ] Static IP configured: 192.168.1.101
- [ ] MAC address recorded
- [ ] Firewall rules created
- [ ] Repository cloned to C:\Dev\Projects\Repos\Project-Nyra

---

## Part 3: Worker PC Setup

Repeat these steps for **each worker PC** (PC2, PC3, PC4).

### 3.1 PC-Specific Configuration

| PC | Name | Static IP | GPU |
|----|------|-----------|-----|
| **PC2** | NYRA-WORKER-RTX3060 | 192.168.1.102 | RTX 3060 |
| **PC3** | NYRA-WORKER-RTX5090 | 192.168.1.103 | RTX 5090 |
| **PC4** | NYRA-WORKER-RTX3090Ti | 192.168.1.104 | RTX 3090 Ti |

### 3.2 Windows Setup (Same as Orchestrator)

1. Install Windows 11 Pro
2. Set PC name (see table above)
3. Enable WSL features
4. Restart

### 3.3 Install Software

```powershell
# WSL 2
wsl --install -d Ubuntu-24.04

# Git, Node.js, Python
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install Python.Python.3.11

# Docker Desktop
winget install Docker.DockerDesktop
```

### 3.4 Configure Static IP

Use appropriate IP from table above (192.168.1.102/103/104)

Follow same steps as orchestrator (Section 2.4)

### 3.5 Get MAC Address

```powershell
(Get-NetAdapter -Name "Ethernet").MacAddress
```

**Save** for each PC:
- PC2 MAC: `XX:XX:XX:XX:XX:XX`
- PC3 MAC: `YY:YY:YY:YY:YY:YY`
- PC4 MAC: `ZZ:ZZ:ZZ:ZZ:ZZ:ZZ`

### 3.6 NVIDIA Driver Installation

**For RTX 3060, RTX 5090, RTX 3090 Ti only**

1. Go to: https://www.nvidia.com/download/index.aspx
2. Select your GPU model
3. Download latest **Game Ready Driver**
4. Install driver
5. Restart when prompted
6. Verify installation:
   ```powershell
   nvidia-smi
   ```

**Expected output**: GPU details with driver version

### 3.7 Firewall Configuration (Workers)

```powershell
# Allow Ollama
New-NetFirewallRule -DisplayName "Ollama" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 11434 `
    -Action Allow

# Allow Tailscale
New-NetFirewallRule -DisplayName "Tailscale" `
    -Direction Inbound `
    -Protocol UDP `
    -LocalPort 41641 `
    -Action Allow
```

### 3.8 Clone Repository

```powershell
mkdir C:\Dev\Projects\Repos
cd C:\Dev\Projects\Repos
git clone https://github.com/your-org/Project-Nyra.git
```

### ✅ Part 3 Checklist (Per Worker)

Complete when:
- [ ] Windows 11 Pro installed
- [ ] PC renamed appropriately
- [ ] WSL 2 + Ubuntu installed
- [ ] Git, Node.js, Python, Docker installed
- [ ] NVIDIA driver installed and verified (nvidia-smi works)
- [ ] Static IP configured
- [ ] MAC address recorded
- [ ] Firewall rules created
- [ ] Repository cloned

---

## Part 4: Environment Variables

Create `.env` file at repository root with ALL required values.

### 4.1 Create .env File

```bash
cd C:\Dev\Projects\Repos\Project-Nyra
copy .env.example .env
notepad .env
```

### 4.2 Required API Keys (from Part 1)

```bash
# AI Model APIs (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
GOOGLE_API_KEY=YOUR_GOOGLE_KEY_HERE

# Alternative/Fallback LLM (OPTIONAL)
OPENROUTER_API_KEY=sk-or-YOUR_KEY_HERE

# GitHub Integration (OPTIONAL)
GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE
```

### 4.3 Database Passwords (Generate Secure)

Generate strong passwords (32+ characters):

```powershell
# PowerShell - Generate secure passwords
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Run this command **7 times** to generate 7 passwords:

```bash
# Database Credentials
POSTGRES_PASSWORD=YOUR_32_CHAR_PASSWORD_HERE
REDIS_PASSWORD=YOUR_32_CHAR_PASSWORD_HERE
FALKORDB_PASSWORD=YOUR_32_CHAR_PASSWORD_HERE
QDRANT_API_KEY=YOUR_32_CHAR_PASSWORD_HERE

# Service Secrets
NEXUS_JWT_SECRET=YOUR_32_CHAR_SECRET_HERE
NEXUS_ADMIN_TOKEN=YOUR_32_CHAR_SECRET_HERE
LETTA_API_KEY=YOUR_32_CHAR_SECRET_HERE
```

### 4.4 Communication Services (Optional)

```bash
# Twilio (if using SMS/Voice)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567

# Email (if using SMTP)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM_EMAIL=noreply@ratehunter.net
```

### 4.5 Network Configuration

```bash
# PC Configuration
PC_ID=pc1
PC_ROLE=orchestrator
PC_IP=192.168.1.101

# Tailscale (will be configured in Part 6)
TAILSCALE_AUTH_KEY=tskey-auth-YOUR_KEY_HERE

# Cloudflare (will be configured in Part 7)
CLOUDFLARE_TUNNEL_TOKEN=YOUR_TUNNEL_TOKEN_HERE
```

### 4.6 Service Ports (Default Values)

```bash
# Core Services
POSTGRES_PORT=5432
REDIS_PORT=6379
QDRANT_PORT=6333

# Monitoring
GRAFANA_PORT=3000
PROMETHEUS_PORT=9090

# LLM Services
NEXUS_ROUTER_PORT=7000
LITELLM_PORT=4000

# Business Services
QUOTE_ENGINE_PORT=8001
CAMPAIGN_ENGINE_PORT=8002
ORCHESTRATOR_PORT=8003
```

### ✅ Part 4 Checklist

.env file complete when it contains:
- [ ] Anthropic API key
- [ ] Google API key
- [ ] 7 generated secure passwords (32+ chars)
- [ ] Twilio credentials (if using)
- [ ] Email credentials (if using)
- [ ] PC configuration (ID, role, IP)
- [ ] Tailscale auth key
- [ ] Cloudflare tunnel token

---

## Part 5: Infisical Configuration

Store all secrets securely in Infisical for multi-PC access.

### 5.1 Install Infisical CLI

```powershell
# Install CLI
npm install -g @infisical/cli

# Verify installation
infisical --version
```

### 5.2 Login to Infisical

```bash
infisical login

# Browser will open
# Login with your Infisical account
# Return to terminal when done
```

### 5.3 Set Project

```bash
# Set your project ID (from Part 1.3)
$env:INFISICAL_PROJECT_ID="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
```

### 5.4 Store All Secrets

**Option 1: Interactive Script** (Recommended)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\infisical
.\set-all-secrets.ps1 -Environment dev
```

The script will prompt for each secret.

**Option 2: Manual Commands**

```bash
# Database secrets
infisical secrets set POSTGRES_PASSWORD=<your_password> --env=dev --path=/shared
infisical secrets set REDIS_PASSWORD=<your_password> --env=dev --path=/shared
infisical secrets set FALKORDB_PASSWORD=<your_password> --env=dev --path=/shared

# API keys
infisical secrets set ANTHROPIC_API_KEY=<your_key> --env=dev --path=/shared
infisical secrets set GOOGLE_API_KEY=<your_key> --env=dev --path=/shared

# Service secrets
infisical secrets set NEXUS_JWT_SECRET=<your_secret> --env=dev --path=/shared
infisical secrets set NEXUS_ADMIN_TOKEN=<your_secret> --env=dev --path=/shared
infisical secrets set LETTA_API_KEY=<your_secret> --env=dev --path=/shared
```

### 5.5 Verify Secrets

```bash
# List all secrets
infisical secrets get --env=dev --path=/shared

# Check specific secret
infisical secrets get POSTGRES_PASSWORD --env=dev --path=/shared
```

### ✅ Part 5 Checklist

Infisical configured when:
- [ ] Infisical CLI installed
- [ ] Logged in to Infisical
- [ ] All secrets stored in `/shared` path
- [ ] Secrets verified (list command shows all)

---

## Part 6: Tailscale VPN Setup

Configure secure networking between all 4 PCs.

### 6.1 Install Tailscale (All PCs)

```powershell
# Install Tailscale
winget install Tailscale.Tailscale
```

### 6.2 Configure Orchestrator

```powershell
# On PC1 (Orchestrator)
tailscale up `
  --authkey=tskey-auth-YOUR_ORCHESTRATOR_KEY `
  --hostname=nyra-orchestrator `
  --advertise-exit-node `
  --advertise-routes=192.168.1.0/24 `
  --accept-routes `
  --accept-dns `
  --ssh
```

**Important**: Use the orchestrator auth key from Part 1.4

### 6.3 Approve Routes (Web UI)

1. Go to: https://login.tailscale.com/admin/machines
2. Find **nyra-orchestrator**
3. Click **Edit route settings**
4. Enable:
   - ☑ **Use as exit node**
   - ☑ **Subnet routes: 192.168.1.0/24**
5. Click **Save**

### 6.4 Configure Workers

**On each worker PC**, run:

```powershell
# PC2 (Worker RTX 3060)
tailscale up `
  --authkey=tskey-auth-YOUR_WORKER_KEY `
  --hostname=nyra-worker-rtx3060 `
  --accept-routes `
  --accept-dns `
  --ssh

# PC3 (Worker RTX 5090)
tailscale up `
  --authkey=tskey-auth-YOUR_WORKER_KEY `
  --hostname=nyra-worker-rtx5090 `
  --accept-routes `
  --accept-dns `
  --ssh

# PC4 (Worker RTX 3090 Ti)
tailscale up `
  --authkey=tskey-auth-YOUR_WORKER_KEY `
  --hostname=nyra-worker-rtx3090ti `
  --accept-routes `
  --accept-dns `
  --ssh
```

### 6.5 Verify Connectivity

**On any PC**:

```powershell
# Check Tailscale status
tailscale status

# Ping orchestrator
ping nyra-orchestrator

# Ping workers
ping nyra-worker-rtx3060
ping nyra-worker-rtx5090
ping nyra-worker-rtx3090ti
```

**Expected**: All pings should succeed

### ✅ Part 6 Checklist

Tailscale configured when:
- [ ] Tailscale installed on all 4 PCs
- [ ] Orchestrator configured with exit node + routes
- [ ] Routes approved in Tailscale admin console
- [ ] All 3 workers configured
- [ ] All PCs can ping each other by hostname
- [ ] `tailscale status` shows all 4 nodes connected

---

## Part 7: Cloudflared Tunnels

Configure secure external access (orchestrator only).

### 7.1 Install Cloudflared (Orchestrator)

```powershell
# On PC1 (Orchestrator)
# Download from: https://github.com/cloudflare/cloudflared/releases
# Or use winget
winget install Cloudflare.cloudflared
```

### 7.2 Authenticate

```powershell
cloudflared tunnel login
# Browser will open for authentication
# Select your domain/account
```

### 7.3 Create Tunnel

```powershell
# Create tunnel named "nyra-orchestrator"
cloudflared tunnel create nyra-orchestrator

# Copy the tunnel ID shown in output
# Save the credentials file location
```

### 7.4 Configure Tunnel

Create config file:

```powershell
# Create config directory
mkdir "$env:USERPROFILE\.cloudflared"

# Create config file
notepad "$env:USERPROFILE\.cloudflared\config.yml"
```

Add this content:

```yaml
tunnel: nyra-orchestrator
credentials-file: C:\Users\<YourUser>\.cloudflared\<tunnel-id>.json

ingress:
  # Grafana monitoring
  - hostname: grafana.yourdomain.com
    service: http://localhost:3000

  # Nexus router
  - hostname: nexus.yourdomain.com
    service: http://localhost:7000

  # n8n workflows
  - hostname: n8n.yourdomain.com
    service: http://localhost:5678

  # Catch-all rule
  - service: http_status:404
```

### 7.5 Route DNS

```powershell
# For each hostname, create DNS record
cloudflared tunnel route dns nyra-orchestrator grafana.yourdomain.com
cloudflared tunnel route dns nyra-orchestrator nexus.yourdomain.com
cloudflared tunnel route dns nyra-orchestrator n8n.yourdomain.com
```

### 7.6 Start Tunnel

```powershell
# Test tunnel
cloudflared tunnel run nyra-orchestrator

# If works, install as service
cloudflared service install
```

### 7.7 Verify Access

Open browser and test:
- https://grafana.yourdomain.com
- https://nexus.yourdomain.com

### ✅ Part 7 Checklist

Cloudflared configured when:
- [ ] Cloudflared installed on orchestrator
- [ ] Tunnel created and authenticated
- [ ] Config file created with ingress rules
- [ ] DNS routes configured
- [ ] Tunnel running as Windows service
- [ ] External URLs accessible in browser

---

## Part 8: Wake-on-LAN Configuration

Enable remote power-on for worker PCs.

### 8.1 BIOS/UEFI Settings (Each Worker)

**Restart PC and enter BIOS** (usually Del or F2 key):

1. Navigate to **Power Management** or **Advanced** section
2. Enable these settings:
   - ☑ **Wake on LAN**
   - ☑ **Wake on PCI-E Device**
   - ☑ **Network Boot** (optional)
   - ☑ **Resume by PCI-E Device**
3. **Disable** (if present):
   - ☐ Fast Boot
   - ☐ Deep Sleep
4. Save and exit BIOS

### 8.2 Windows Network Adapter Settings

**On each worker PC**:

1. Open **Device Manager**
2. Expand **Network adapters**
3. Right-click your Ethernet adapter
4. Select **Properties**
5. **Power Management** tab:
   - ☑ Allow this device to wake the computer
   - ☑ Only allow a magic packet to wake the computer
6. **Advanced** tab:
   - Find **Wake on Magic Packet**: Set to **Enabled**
   - Find **Wake on pattern match**: Set to **Enabled**
7. Click **OK**

### 8.3 Disable Fast Startup

```powershell
# On each worker PC
# Open PowerShell as Administrator
powercfg /h off
```

Or via Control Panel:
1. **Control Panel** → **Power Options**
2. **Choose what the power buttons do**
3. **Change settings that are currently unavailable**
4. ☐ Uncheck **Turn on fast startup**
5. **Save changes**

### 8.4 Configure Hardware Detection

Edit `bootstrap/configs/hardware-detection.json`:

```json
{
  "workers": {
    "worker-rtx3060": {
      "hostname": "nyra-worker-rtx3060",
      "ip": "192.168.1.102",
      "mac": "XX:XX:XX:XX:XX:XX",  // <-- YOUR MAC HERE
      "wol_enabled": true,
      "always_on": false
    },
    "worker-rtx5090": {
      "hostname": "nyra-worker-rtx5090",
      "ip": "192.168.1.103",
      "mac": "YY:YY:YY:YY:YY:YY",  // <-- YOUR MAC HERE
      "wol_enabled": true,
      "always_on": false
    },
    "worker-rtx3090ti": {
      "hostname": "nyra-worker-rtx3090ti",
      "ip": "192.168.1.104",
      "mac": "ZZ:ZZ:ZZ:ZZ:ZZ:ZZ",  // <-- YOUR MAC HERE
      "wol_enabled": false,
      "always_on": true  // Always-on PC
    }
  }
}
```

### 8.5 Test Wake-on-LAN

**From orchestrator**:

```bash
# Test wake command
./bootstrap/orchestrator-mini/scripts/wake-gpu-worker.sh worker-rtx5090

# Or wake all
./bootstrap/orchestrator-mini/scripts/wake-all-workers.sh
```

### ✅ Part 8 Checklist

Wake-on-LAN configured when:
- [ ] BIOS settings enabled on all workers
- [ ] Windows adapter settings configured
- [ ] Fast Startup disabled
- [ ] MAC addresses added to hardware-detection.json
- [ ] Test wake commands succeed

---

## Part 9: PC-Specific Configuration

Record all PC-specific values for documentation.

### 9.1 Network Information

| PC | Hostname | Static IP | MAC Address | Tailscale IP |
|----|----------|-----------|-------------|--------------|
| **PC1** | NYRA-ORCHESTRATOR | 192.168.1.101 | AA:BB:CC:DD:EE:FF | 100.x.x.1 |
| **PC2** | NYRA-WORKER-RTX3060 | 192.168.1.102 | XX:XX:XX:XX:XX:XX | 100.x.x.2 |
| **PC3** | NYRA-WORKER-RTX5090 | 192.168.1.103 | YY:YY:YY:YY:YY:YY | 100.x.x.3 |
| **PC4** | NYRA-WORKER-RTX3090Ti | 192.168.1.104 | ZZ:ZZ:ZZ:ZZ:ZZ:ZZ | 100.x.x.4 |

**Action**: Fill in your actual values above

### 9.2 Hardware Information

| PC | CPU | RAM | GPU | VRAM | Storage |
|----|-----|-----|-----|------|---------|
| **PC1** | Ryzen 7 6800H | 16GB | None | N/A | 1TB NVMe |
| **PC2** | i7-12700 | 32GB | RTX 3060 | 12GB | 1TB NVMe |
| **PC3** | High-end CPU | 32GB | RTX 5090 | 32GB | 2TB NVMe |
| **PC4** | High-end CPU | 32GB | RTX 3090 Ti | 24GB | 2TB NVMe |

### 9.3 Service Endpoints

**Orchestrator Services**:
- Grafana: http://192.168.1.101:3000
- Prometheus: http://192.168.1.101:9090
- PostgreSQL: postgresql://192.168.1.101:5432
- Redis: redis://192.168.1.101:6379
- Qdrant: http://192.168.1.101:6333

**Worker Services**:
- PC2 Ollama: http://192.168.1.102:11434
- PC3 Ollama: http://192.168.1.103:11434
- PC4 Ollama: http://192.168.1.104:11434

### 9.4 Update .env Files

Create PC-specific .env files:

**PC1 (Orchestrator)**:
```bash
# .env.pc1
PC_ID=pc1
PC_ROLE=orchestrator
PC_IP=192.168.1.101
PC_MAC=AA:BB:CC:DD:EE:FF
```

**PC2 (Worker)**:
```bash
# .env.pc2
PC_ID=pc2
PC_ROLE=worker
PC_IP=192.168.1.102
PC_MAC=XX:XX:XX:XX:XX:XX
GPU_MODEL=RTX_3060
GPU_VRAM=12GB
```

**PC3 (Worker)**:
```bash
# .env.pc3
PC_ID=pc3
PC_ROLE=worker
PC_IP=192.168.1.103
PC_MAC=YY:YY:YY:YY:YY:YY
GPU_MODEL=RTX_5090
GPU_VRAM=32GB
```

**PC4 (Worker)**:
```bash
# .env.pc4
PC_ID=pc4
PC_ROLE=worker
PC_IP=192.168.1.104
PC_MAC=ZZ:ZZ:ZZ:ZZ:ZZ:ZZ
GPU_MODEL=RTX_3090_Ti
GPU_VRAM=24GB
```

### ✅ Part 9 Checklist

PC-specific configuration complete when:
- [ ] All network values documented
- [ ] All hardware specs documented
- [ ] Service endpoints documented
- [ ] PC-specific .env files created
- [ ] Values match your actual hardware

---

## Part 10: Database Initialization

Initialize databases on orchestrator (PC1 only).

### 10.1 Start Docker Services

```powershell
# On PC1 (Orchestrator)
cd C:\Dev\Projects\Repos\Project-Nyra\docker\orchestrator
docker-compose up -d
```

### 10.2 Verify Services

```powershell
# Check all containers are running
docker ps

# Expected: All services showing "healthy" status
```

### 10.3 Initialize PostgreSQL

```powershell
# Connect to PostgreSQL
docker exec -it nyra-postgres psql -U postgres

# Create extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

# Verify
\dx

# Exit
\q
```

### 10.4 Test Qdrant

```powershell
# Check Qdrant health
curl http://localhost:6333/health

# Create test collection
curl -X PUT http://localhost:6333/collections/test `
  -H "Content-Type: application/json" `
  -d '{"vectors":{"size":384,"distance":"Cosine"}}'
```

### 10.5 Test Redis

```powershell
# Test Redis connection
docker exec nyra-redis redis-cli -a "$env:REDIS_PASSWORD" ping

# Expected: PONG
```

### ✅ Part 10 Checklist

Database initialization complete when:
- [ ] All Docker services running (docker ps shows healthy)
- [ ] PostgreSQL extensions created
- [ ] Qdrant test collection created
- [ ] Redis ping successful
- [ ] All health checks passing

---

## Troubleshooting

### Issue: Static IP Not Working

**Symptoms**: Can't reach PC by IP, loses connection

**Solutions**:
1. Check adapter name in PowerShell commands
2. Verify gateway IP matches your router
3. Check DNS servers are correct (8.8.8.8, 8.8.4.4)
4. Restart network adapter:
   ```powershell
   Restart-NetAdapter -Name "Ethernet"
   ```

### Issue: Tailscale Not Connecting

**Symptoms**: Nodes don't appear in Tailscale admin, can't ping

**Solutions**:
1. Check firewall allows UDP port 41641
2. Verify auth key hasn't expired
3. Check Tailscale service is running:
   ```powershell
   Get-Service Tailscale
   ```
4. Restart Tailscale:
   ```powershell
   Restart-Service Tailscale
   ```

### Issue: Wake-on-LAN Not Working

**Symptoms**: Worker PC doesn't wake from magic packet

**Solutions**:
1. Verify BIOS settings (most common issue)
2. Check Windows adapter power settings
3. Disable Fast Startup
4. Test from same subnet first
5. Check MAC address is correct
6. Ensure PC is in sleep/hibernate (not full shutdown)

### Issue: Docker Containers Won't Start

**Symptoms**: Container exits immediately, health check fails

**Solutions**:
1. Check Docker Desktop is running
2. Check WSL 2 is active:
   ```powershell
   wsl --list --verbose
   ```
3. View container logs:
   ```powershell
   docker logs <container-name>
   ```
4. Check port conflicts:
   ```powershell
   Get-NetTCPConnection | Where-Object {$_.LocalPort -eq 5432}
   ```

### Issue: Infisical Secrets Not Loading

**Symptoms**: Environment variables empty, services fail to start

**Solutions**:
1. Verify login:
   ```bash
   infisical login
   ```
2. Check project ID is correct
3. Verify secrets exist:
   ```bash
   infisical secrets get --env=dev --path=/shared
   ```
4. Check service token permissions

### Getting Help

If you encounter issues not covered here:

1. **Check logs**:
   - Windows Event Viewer
   - Docker logs: `docker logs <container>`
   - Service logs in `logs/` directory

2. **Verify prerequisites**:
   - Windows version (build 22000+)
   - All software installed
   - Network connectivity

3. **Documentation**:
   - See specific guides in `bootstrap/docs/`
   - Check `docs/architecture/` for diagrams

4. **GitHub Issues**:
   - Search existing issues
   - Create new issue with:
     - Error messages
     - Steps to reproduce
     - System information

---

## Summary

You have now completed all manual setup steps for Project Nyra 4-PC distributed architecture.

### Final Checklist

**Accounts Created** (Part 1):
- [ ] Anthropic Claude API
- [ ] Google Gemini API
- [ ] Infisical account with project
- [ ] Tailscale account with auth keys
- [ ] Cloudflare account with tunnel
- [ ] Twilio account (optional)
- [ ] GitHub token (optional)

**Orchestrator Setup** (Part 2):
- [ ] Windows 11 Pro configured
- [ ] WSL 2 + Ubuntu installed
- [ ] Software installed (Git, Node, Python, Docker)
- [ ] Static IP: 192.168.1.101
- [ ] MAC address recorded
- [ ] Firewall configured
- [ ] Repository cloned

**Worker Setup** (Part 3):
- [ ] All 3 workers configured same as orchestrator
- [ ] Static IPs: .102, .103, .104
- [ ] NVIDIA drivers installed
- [ ] MAC addresses recorded

**Configuration** (Parts 4-9):
- [ ] .env file created with all secrets
- [ ] Secrets stored in Infisical
- [ ] Tailscale VPN configured
- [ ] Cloudflared tunnels configured
- [ ] Wake-on-LAN enabled
- [ ] PC-specific configs documented

**Services** (Part 10):
- [ ] Docker services running
- [ ] Databases initialized
- [ ] Health checks passing

### Next Steps

1. **Start Services**:
   ```bash
   cd docker/orchestrator
   docker-compose up -d
   ```

2. **Verify Health**:
   ```bash
   curl http://localhost:3000  # Grafana
   curl http://localhost:9090  # Prometheus
   ```

3. **Deploy First Workload**:
   ```bash
   npx @claude-flow/cli@latest swarm init --topology hierarchical
   ```

**Congratulations!** Your 4-PC distributed AI infrastructure is ready.

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-16
**Maintainer**: Project Nyra Team
