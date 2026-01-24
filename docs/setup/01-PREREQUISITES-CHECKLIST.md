# Project Nyra - Prerequisites Checklist

**Last Updated**: 2026-01-18
**Estimated Setup Time**: 1-2 hours
**Difficulty**: Beginner

---

## 🎯 Overview

This checklist ensures your system has all required tools and configurations before beginning the Project Nyra setup. Complete each section before proceeding to the [Master Setup Guide](./00-MASTER-SETUP-GUIDE.md).

---

## 💻 System Requirements

### Minimum Requirements (Single PC, Development)

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **OS** | Windows 10/11 Pro, Ubuntu 22.04+, macOS 12+ | Pro/Enterprise for Docker Desktop |
| **CPU** | 4 cores | 8+ cores recommended |
| **RAM** | 16 GB | 32 GB recommended |
| **Storage** | 100 GB free | SSD required, NVMe recommended |
| **Network** | 1 Gbps | 10 Gbps for multi-PC setup |
| **GPU** | Optional | RTX 3060+ for local LLM inference |

### Recommended Requirements (Production)

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **OS** | Ubuntu 22.04 LTS Server | Windows Server 2019+ also supported |
| **CPU** | 16+ cores | AMD Ryzen 9 / Intel i9 |
| **RAM** | 64 GB | 128 GB for 4-PC orchestrator |
| **Storage** | 500 GB NVMe SSD | 1 TB+ for production |
| **Network** | 10 Gbps | Required for 4-PC distributed setup |
| **GPU** | RTX 3090 Ti, 5090 | For distributed GPU compute |

### 4-PC Distributed Architecture Requirements

**PC1 - Orchestrator (Mini PC)**:
- **CPU**: 8+ cores (Intel NUC 13 Pro or similar)
- **RAM**: 64 GB DDR5
- **Storage**: 1 TB NVMe SSD
- **Network**: 10GbE (SFP+ or RJ45)
- **Role**: Coordination, databases, web services

**PC2 - RTX 5090 Worker**:
- **GPU**: RTX 5090 (24GB VRAM)
- **CPU**: 16+ cores
- **RAM**: 64 GB DDR5
- **Storage**: 500 GB NVMe
- **Network**: 10GbE
- **Role**: Primary GPU compute

**PC3 - RTX 3090 Ti Worker**:
- **GPU**: RTX 3090 Ti (24GB VRAM)
- **CPU**: 12+ cores
- **RAM**: 32 GB DDR4/DDR5
- **Storage**: 500 GB NVMe
- **Network**: 10GbE
- **Role**: Secondary GPU compute

**PC4 - RTX 3060 Worker**:
- **GPU**: RTX 3060 (12GB VRAM)
- **CPU**: 8+ cores
- **RAM**: 32 GB DDR4
- **Storage**: 250 GB NVMe
- **Network**: 10GbE
- **Role**: Tertiary GPU compute, backup

---

## 🛠️ Required Software

### 1. Docker & Docker Compose

**Purpose**: Container orchestration for all services

#### Windows Installation:
```powershell
# Method 1: Docker Desktop (Recommended)
# Download from: https://www.docker.com/products/docker-desktop/

# Method 2: Chocolatey
choco install docker-desktop -y

# Verify installation
docker --version
docker compose version
```

#### Linux Installation:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

#### macOS Installation:
```bash
# Using Homebrew
brew install --cask docker

# Or download Docker Desktop
# https://www.docker.com/products/docker-desktop/

# Verify
docker --version
docker compose version
```

**Verification Checklist**:
- ☐ Docker version 24.0+
- ☐ Docker Compose v2.20+
- ☐ Docker daemon running
- ☐ Can run: `docker run hello-world`

---

### 2. Node.js & Package Managers

**Purpose**: JavaScript runtime for MCP servers and tools

#### Windows Installation:
```powershell
# Method 1: Official installer
# Download from: https://nodejs.org/ (LTS version)

# Method 2: Chocolatey
choco install nodejs-lts -y

# Method 3: Volta (Recommended)
iwr https://get.volta.sh/volta.ps1 | iex
volta install node@20

# Install pnpm
npm install -g pnpm

# Verify
node --version
npm --version
pnpm --version
```

#### Linux Installation:
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Or using Volta (Recommended)
curl https://get.volta.sh | bash
volta install node@20

# Install pnpm
npm install -g pnpm

# Verify
node --version
npm --version
pnpm --version
```

#### macOS Installation:
```bash
# Using Homebrew
brew install node@20

# Or using Volta (Recommended)
curl https://get.volta.sh | bash
volta install node@20

# Install pnpm
npm install -g pnpm

# Verify
node --version
npm --version
pnpm --version
```

**Verification Checklist**:
- ☐ Node.js version 20.x+
- ☐ npm version 10.x+
- ☐ pnpm version 8.x+

---

### 3. Git Version Control

**Purpose**: Repository management and version control

#### Windows Installation:
```powershell
# Download from: https://git-scm.com/

# Or via Chocolatey
choco install git -y

# Configure
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify
git --version
```

#### Linux Installation:
```bash
# Ubuntu/Debian
sudo apt install git -y

# Configure
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify
git --version
```

#### macOS Installation:
```bash
# Git comes with Xcode Command Line Tools
xcode-select --install

# Or via Homebrew
brew install git

# Configure
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify
git --version
```

**Verification Checklist**:
- ☐ Git version 2.40+
- ☐ Git config set (user.name, user.email)
- ☐ SSH keys configured (optional but recommended)

---

### 4. Python (Optional but Recommended)

**Purpose**: Letta memory system, some MCP servers

#### Windows Installation:
```powershell
# Download from: https://www.python.org/

# Or via Chocolatey
choco install python -y

# Verify
python --version
pip --version
```

#### Linux Installation:
```bash
# Ubuntu/Debian
sudo apt install python3.11 python3-pip -y

# Verify
python3 --version
pip3 --version
```

#### macOS Installation:
```bash
# Using Homebrew
brew install python@3.11

# Verify
python3 --version
pip3 --version
```

**Verification Checklist**:
- ☐ Python 3.11+
- ☐ pip 23.0+

---

### 5. Cloudflared (For External Access)

**Purpose**: Cloudflare tunnel for secure external access

#### Windows Installation:
```powershell
# Download from Cloudflare
iwr https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe -OutFile cloudflared.exe

# Move to PATH location (e.g., C:\Windows\System32)
Move-Item cloudflared.exe C:\Windows\System32\

# Verify
cloudflared --version
```

#### Linux Installation:
```bash
# Debian/Ubuntu
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Verify
cloudflared --version
```

#### macOS Installation:
```bash
# Using Homebrew
brew install cloudflared

# Verify
cloudflared --version
```

**Verification Checklist**:
- ☐ cloudflared installed
- ☐ Cloudflare account created
- ☐ Domain configured in Cloudflare (e.g., ratehunter.net)

---

### 6. Infisical CLI (Secrets Management)

**Purpose**: Secure secret management and injection

#### Windows Installation:
```powershell
# Download from Infisical
iwr https://app.infisical.com/api/download/cli/windows -OutFile infisical.exe

# Verify
.\infisical --version

# Login
.\infisical login
```

#### Linux Installation:
```bash
# Official script
curl -1sLf 'https://dl.infisical.com/scripts/install.sh' | bash

# Verify
infisical --version

# Login
infisical login
```

#### macOS Installation:
```bash
# Using Homebrew
brew install infisical/get-cli/infisical

# Verify
infisical --version

# Login
infisical login
```

**Verification Checklist**:
- ☐ Infisical CLI installed
- ☐ Infisical account created
- ☐ Logged in to Infisical
- ☐ Project created (or access granted)

---

## 🌐 Network Configuration

### Required Ports (Single PC Setup)

| Port | Service | Protocol | Access |
|------|---------|----------|--------|
| 3100 | Claude Flow MCP | HTTP | Internal |
| 3333 | Open WebUI | HTTP | Local + Tunnel |
| 3334 | LobeChat | HTTP | Local |
| 5432 | PostgreSQL | TCP | Internal |
| 6000 | Nexus Router | HTTP | Internal + API |
| 6333 | Qdrant | HTTP | Internal |
| 6334 | Qdrant (gRPC) | TCP | Internal |
| 6379 | Redis | TCP | Internal |
| 6380 | FalkorDB | TCP | Internal |
| 8006 | Infisical MCP | HTTP | Internal |
| 8007 | Bitwarden MCP | HTTP | Internal |
| 8008 | Sequential Thinking MCP | HTTP | Internal |
| 8283 | Letta | HTTP | Internal |

### Firewall Configuration

#### Windows Firewall:
```powershell
# Allow Docker
New-NetFirewallRule -DisplayName "Docker Desktop" -Direction Inbound -Action Allow -Program "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Allow specific ports (if needed for external access)
New-NetFirewallRule -DisplayName "Nexus Router" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 6000
```

#### Linux UFW:
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow Docker
sudo ufw allow 2375/tcp

# Allow specific services (adjust as needed)
sudo ufw allow 6000/tcp  # Nexus Router
sudo ufw allow 3333/tcp  # Open WebUI (if not using Cloudflare tunnel)
```

### Network Requirements (4-PC Setup)

- **10GbE Network Switch** (Managed, with VLAN support recommended)
- **10GbE NICs** in each PC (or 10GBASE-T ports)
- **CAT6A or CAT7 cables** (for 10GBASE-T)
- **Static IP addresses** configured on each PC
- **DNS configuration** (local DNS server or hosts file)

**Example IP Scheme**:
- PC1 (Orchestrator): 10.0.0.1/24
- PC2 (RTX 5090): 10.0.0.2/24
- PC3 (RTX 3090 Ti): 10.0.0.3/24
- PC4 (RTX 3060): 10.0.0.4/24

---

## 🔐 Account Setup

### 1. Cloudflare Account
- **URL**: https://dash.cloudflare.com/sign-up
- **Requirements**:
  - Email verification
  - Domain added (e.g., ratehunter.net)
  - Cloudflare Teams plan (for Access policies)
- **Verification**: ☐ Account created, ☐ Domain verified

### 2. Infisical Account
- **URL**: https://app.infisical.com/signup
- **Requirements**:
  - Email verification
  - Organization created
  - Project created
  - Service token generated
- **Verification**: ☐ Account created, ☐ Token generated

### 3. Bitwarden Account (Optional)
- **URL**: https://vault.bitwarden.com/#/register
- **Requirements**:
  - Email verification
  - Secrets Manager access
  - BWS token generated
- **Verification**: ☐ Account created, ☐ Token generated

### 4. GitHub Account
- **URL**: https://github.com/signup
- **Requirements**:
  - Email verification
  - Personal access token (PAT) for MCP
- **Verification**: ☐ Account created, ☐ PAT generated

### 5. LLM Provider Accounts

#### Anthropic (Claude)
- **URL**: https://console.anthropic.com/
- **Requirements**: API key with sufficient credits
- **Verification**: ☐ API key obtained

#### OpenAI (GPT)
- **URL**: https://platform.openai.com/signup
- **Requirements**: API key with sufficient credits
- **Verification**: ☐ API key obtained

#### OpenRouter (Optional)
- **URL**: https://openrouter.ai/
- **Requirements**: API key with credits
- **Verification**: ☐ API key obtained

---

## 📁 Repository Setup

### Clone Project Nyra Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra

# Initialize submodules
git submodule update --init --recursive

# Verify
ls -la
# Should see: submodules/claude-flow, submodules/archon, etc.
```

**Verification Checklist**:
- ☐ Repository cloned
- ☐ Submodules initialized
- ☐ Directory structure verified

---

## 🔑 Environment Variables Template

Create a `.env` file in the project root with these required variables:

```bash
# Database Configuration
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/nyra

# LLM API Keys
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Secrets Management
INFISICAL_TOKEN=st.xxxxx.xxxxx
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_ENVIRONMENT=dev

# Bitwarden Secrets Manager
BWS_ACCESS_TOKEN=xxxxx

# Session Security
SESSION_SECRET=generate_random_string_here

# Service Ports
NEXUS_ROUTER_PORT=6000
OPEN_WEBUI_PORT=3333
LOBECHAT_PORT=3334

# Optional: GPU Configuration
CUDA_VISIBLE_DEVICES=0  # Adjust based on your GPU setup
```

**Generate Secure Secrets**:
```bash
# PowerShell (Windows)
-join ((65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Bash (Linux/macOS)
openssl rand -base64 32
```

**Verification Checklist**:
- ☐ `.env` file created
- ☐ All required variables set
- ☐ Secure passwords generated
- ☐ API keys configured

---

## ✅ Pre-Flight Verification

Run these commands to verify your prerequisites:

### System Check
```bash
# Check Docker
docker --version && docker compose version && docker ps

# Check Node.js
node --version && npm --version && pnpm --version

# Check Git
git --version

# Check Python (optional)
python --version || python3 --version

# Check Cloudflared
cloudflared --version

# Check Infisical
infisical --version
```

### Network Check
```bash
# Test Docker network creation
docker network create test-network
docker network rm test-network

# Test internet connectivity
ping -c 4 google.com

# Test DNS
nslookup github.com
```

### Repository Check
```bash
# Verify repository
cd Project-Nyra
ls -la

# Verify submodules
git submodule status

# Verify .env file
cat .env | grep -v "^#" | grep "="
```

---

## 📝 Verification Summary

**Complete this checklist before proceeding**:

### System Requirements
- ☐ CPU: 4+ cores (8+ recommended)
- ☐ RAM: 16+ GB (32+ GB recommended)
- ☐ Storage: 100+ GB free (SSD)
- ☐ Network: 1 Gbps+ (10 Gbps for multi-PC)

### Software Installation
- ☐ Docker & Docker Compose installed
- ☐ Node.js 20+ installed
- ☐ pnpm installed
- ☐ Git installed
- ☐ Python 3.11+ installed (optional)
- ☐ cloudflared installed
- ☐ Infisical CLI installed

### Account Setup
- ☐ Cloudflare account with domain
- ☐ Infisical account with project
- ☐ Bitwarden account (optional)
- ☐ GitHub account with PAT
- ☐ Anthropic API key
- ☐ OpenAI API key (optional)

### Repository Setup
- ☐ Repository cloned
- ☐ Submodules initialized
- ☐ `.env` file created
- ☐ Environment variables configured

### Network Configuration
- ☐ Required ports available
- ☐ Firewall configured
- ☐ Docker network tested

---

## 🎯 Next Steps

**All prerequisites met?** Proceed to:
- **[Master Setup Guide](./00-MASTER-SETUP-GUIDE.md)** - Begin infrastructure deployment
- **[Setup Guide Index](./README.md)** - Browse all setup documentation

**Missing prerequisites?** Review the sections above and complete all required installations.

---

## 🔍 Troubleshooting Prerequisites

### Docker Issues

**Docker Desktop won't start (Windows)**:
- Enable WSL2: `wsl --install`
- Enable Hyper-V: Open PowerShell as Admin, run `Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All`
- Restart computer

**Permission denied (Linux)**:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Node.js Issues

**npm permission errors (Linux/macOS)**:
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Network Issues

**Ports already in use**:
```bash
# Windows
netstat -ano | findstr :[PORT]

# Linux/macOS
lsof -i :[PORT]

# Kill process if needed
# Windows: taskkill /PID [PID] /F
# Linux/macOS: kill -9 [PID]
```

---

**Prerequisites Complete?** → [Start Setup](./00-MASTER-SETUP-GUIDE.md)

**Need Help?** → Check [Manual Setup Guide - Troubleshooting](../operations/MANUAL-SETUP-GUIDE.md#troubleshooting)

---

**Last Updated**: 2026-01-18
**Estimated Time**: 1-2 hours
**Difficulty**: Beginner
