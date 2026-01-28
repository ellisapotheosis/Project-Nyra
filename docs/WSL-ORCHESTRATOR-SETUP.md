# WSL Orchestrator Setup Guide - Project Nyra

**Purpose**: Complete guide for setting up Windows 11 + WSL 2 as an AI development orchestrator with Docker, Tailscale, and Cloudflare tunneling.

**Last Updated**: 2026-01-25

---

## 🎯 Overview

This PC is configured as the **orchestrator/host** for Project Nyra's distributed AI infrastructure:

- **Role**: Central coordination node for 4-PC LAN setup
- **Services**: MCP servers, LLM routing (Nexus), Docker containers
- **Networking**: Tailscale mesh network + Cloudflare tunnels
- **Development**: AI/LLM development with Claude Code

---

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Windows 11 Host PC                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    WSL 2 (Ubuntu)                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ Docker       │  │ Tailscale    │  │ Cloudflared  │ │ │
│  │  │ Containers   │  │ Daemon       │  │ Tunnel       │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  MCP Servers (Nexus, LiteLLM, Mem0, etc.)         │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Development Environment (Claude Code, Node, pnpm) │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
    ┌───────────┐        ┌───────────┐        ┌───────────┐
    │  PC 2     │        │  PC 3     │        │  PC 4     │
    │ (Tailscale│        │ (Tailscale│        │ (Tailscale│
    │  Worker)  │        │  Worker)  │        │  Worker)  │
    └───────────┘        └───────────┘        └───────────┘
```

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Apply WSL Configuration

```bash
# Copy optimized WSL config
sudo cp ~/projects/project-nyra/scripts/wsl-config-orchestrator.conf /etc/wsl.conf

# Verify it was copied
cat /etc/wsl.conf
```

Then from **PowerShell (Windows)**:
```powershell
# Shutdown WSL to apply changes
wsl --shutdown

# Wait 10 seconds, then restart WSL
# (Just open Ubuntu again - it will auto-start)
```

### Step 2: Apply Windows Resource Limits

Create/edit `C:\Users\YourUsername\.wslconfig` on Windows with:

```ini
[wsl2]
memory=16GB
processors=12
swap=8GB
localhostForwarding=true
nestedVirtualization=true
pageReporting=true
guiApplications=true
dnsTunneling=true
```

Then from **PowerShell**:
```powershell
wsl --shutdown
# Restart WSL
```

### Step 3: Validate Configuration

```bash
# Run comprehensive validation
~/projects/project-nyra/scripts/validate-wsl-config.sh
```

---

## 📝 Configuration Files

### Files Created

1. **`scripts/wsl-config-orchestrator.conf`**
   - Optimized `/etc/wsl.conf` configuration
   - Enables systemd, metadata, optimal file permissions

2. **`scripts/validate-wsl-config.sh`**
   - Comprehensive validation script
   - Checks 10 categories of configuration

3. **`scripts/.wslconfig-recommended.txt`**
   - Template for Windows `.wslconfig` file
   - Resource allocation and performance tuning

4. **`docs/WSL-ORCHESTRATOR-SETUP.md`**
   - This guide

### File Locations

| File | Location | Purpose |
|------|----------|---------|
| `wsl.conf` | `/etc/wsl.conf` (in WSL) | WSL behavior configuration |
| `.wslconfig` | `C:\Users\YourUsername\.wslconfig` (Windows) | Resource allocation |
| `resolv.conf` | `/etc/resolv.conf` (in WSL) | DNS configuration |

---

## 🔧 Manual Configuration Steps

### 1. Enable Systemd

**Already done** if you applied `wsl-config-orchestrator.conf`, but to verify:

```bash
# Check if systemd is running
systemctl status

# If not, add to /etc/wsl.conf:
sudo nano /etc/wsl.conf
# Add under [boot]:
# systemd=true
```

### 2. Configure Docker Desktop Integration

1. Open **Docker Desktop** on Windows
2. Go to **Settings → Resources → WSL Integration**
3. **Enable integration** with your Ubuntu distribution
4. Click **Apply & Restart**

Verify in WSL:
```bash
docker ps
# Should show running containers or empty list (not an error)
```

### 3. Setup Tailscale (4-PC Mesh Network)

```bash
# Install Tailscale (if not already)
curl -fsSL https://tailscale.com/install.sh | sh

# Connect and advertise this PC as orchestrator
sudo tailscale up \
  --accept-routes \
  --advertise-routes=192.168.1.0/24 \
  --hostname=nyra-orchestrator

# Check status
tailscale status
tailscale ip -4
```

**On other 3 PCs**: Install Tailscale and run `tailscale up --accept-routes`

### 4. Setup Cloudflare Tunnel

```bash
# Install cloudflared (if not already)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create nyra-orchestrator

# Configure tunnel (example for Nexus Router on port 6000)
cloudflared tunnel route dns nyra-orchestrator nexus.yourdomain.com

# Install as service
sudo cloudflared service install

# Start service
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### 5. Verify MCP Server Ports

```bash
# Check which ports are listening
sudo netstat -tulpn | grep LISTEN

# Expected services:
# 3000 - TwentyCRM
# 4000 - LiteLLM
# 6000 - Nexus Router
# 8000 - Backend API
# 8001 - Quote Engine
# 8002 - Campaign Engine
# 8081 - OpenMemory MCP
```

---

## 🧪 Validation & Troubleshooting

### Run Full Validation

```bash
cd ~/projects/project-nyra
./scripts/validate-wsl-config.sh
```

The script checks:
1. ✓ WSL configuration file
2. ✓ Systemd status
3. ✓ Docker integration
4. ✓ Tailscale connection
5. ✓ Cloudflare tunnel
6. ✓ MCP server ports
7. ✓ File system performance
8. ✓ Network configuration
9. ✓ AI/LLM tools
10. ✓ Resource allocation

### Common Issues

#### Issue: "Systemd is NOT running"
**Solution**:
```bash
# Add to /etc/wsl.conf
sudo nano /etc/wsl.conf
# Add:
[boot]
systemd=true

# Restart WSL from PowerShell:
wsl --shutdown
```

#### Issue: "Docker daemon is NOT accessible"
**Solution**:
1. Open Docker Desktop
2. Settings → Resources → WSL Integration
3. Enable for Ubuntu distro
4. Restart Docker Desktop

#### Issue: "DNS resolution is NOT working"
**Solution**:
```bash
# Check /etc/resolv.conf
cat /etc/resolv.conf

# If empty or wrong, regenerate:
sudo nano /etc/wsl.conf
# Set under [network]:
generateResolvConf=true

# Restart WSL from PowerShell:
wsl --shutdown
```

#### Issue: "File permissions not working"
**Solution**:
```bash
# Ensure metadata is enabled in /etc/wsl.conf
sudo nano /etc/wsl.conf
# Add to [automount]:
options="metadata,umask=22,fmask=11"

# Restart WSL from PowerShell:
wsl --shutdown
```

#### Issue: "Tailscale not connecting"
**Solution**:
```bash
# Check if tailscaled service is running
sudo systemctl status tailscaled

# If not, start it:
sudo systemctl start tailscaled
sudo systemctl enable tailscaled

# Then connect:
sudo tailscale up --accept-routes
```

---

## 🎯 Performance Optimization

### 1. File System Performance

**Best Practice**: Store code in WSL native filesystem (`/home`), not Windows drives (`/mnt/c`)

```bash
# ✅ FAST - WSL native filesystem
/home/ellisapotheosis/projects/project-nyra

# ❌ SLOW - Windows filesystem accessed from WSL
/mnt/c/Users/YourName/projects/project-nyra
```

**Why?**
- WSL native: ext4 filesystem, direct access
- Windows NTFS: File system translation layer, slower I/O

### 2. Memory Allocation

Edit `C:\Users\YourUsername\.wslconfig`:

```ini
[wsl2]
# For LLM inference, allocate 50-60% of total RAM
memory=16GB  # Adjust based on your RAM (32GB → 16GB)

# For parallel processing, allocate 70-80% of CPU cores
processors=12  # Adjust based on your CPUs (16 cores → 12)

# Swap space for large models
swap=8GB
```

### 3. Docker Performance

```bash
# Use WSL native filesystem for Docker volumes
docker volume create --driver local --opt type=none \
  --opt device=/home/ellisapotheosis/docker-data \
  --opt o=bind nyra-data

# Move node_modules to WSL native filesystem
# (Automatic when project is in /home)
```

### 4. Network Performance

For Tailscale + Cloudflare:

```bash
# Check network mode in .wslconfig
# Try 'mirrored' for better networking:
# networkingMode=mirrored
```

### 5. Windows Defender Exclusions

**Critical for I/O performance** - Add to Windows Defender exclusions:

1. Open **Windows Security** → **Virus & threat protection**
2. Scroll to **Exclusions** → **Add or remove exclusions**
3. Add these folders:
   - `C:\Users\YourUsername\AppData\Local\Docker`
   - `C:\Users\YourUsername\AppData\Local\Packages\CanonicalGroupLimited.*`
4. Add these processes:
   - `C:\Windows\System32\wsl.exe`
   - `C:\Windows\System32\vmcompute.exe`

---

## 🚀 Starting Services

### All Services at Once (Orchestrator Mode)

```bash
# From project root
cd ~/projects/project-nyra

# Start all services via Docker Compose
docker compose -f infra/docker/docker-compose.yml up -d

# Verify services are running
docker ps

# Check logs
docker compose -f infra/docker/docker-compose.yml logs -f
```

### Individual Services

```bash
# Nexus Router (LLM routing)
docker compose -f infra/docker/docker-compose.yml up -d nexus-router

# LiteLLM (proxy)
docker compose -f infra/docker/docker-compose.yml up -d litellm

# TwentyCRM
docker compose -f infra/docker/docker-compose.yml up -d twentycrm
```

### Tailscale (Always On)

```bash
# Should start automatically with systemd
sudo systemctl status tailscaled

# If not running:
sudo systemctl start tailscaled
sudo tailscale up --accept-routes
```

### Cloudflare Tunnel (Always On)

```bash
# Should start automatically with systemd
sudo systemctl status cloudflared

# If not running:
sudo systemctl start cloudflared
```

---

## 📊 Monitoring

### Resource Usage

```bash
# Memory usage
free -h

# CPU usage
htop

# Disk usage
df -h

# Docker stats
docker stats

# WSL resource usage (from Windows PowerShell)
wsl --list --verbose
```

### Service Health

```bash
# Check all listening ports
sudo netstat -tulpn | grep LISTEN

# Check Docker containers
docker ps -a

# Check systemd services
systemctl status docker tailscaled cloudflared
```

### Logs

```bash
# Docker logs
docker compose -f infra/docker/docker-compose.yml logs -f [service-name]

# Systemd logs
sudo journalctl -u docker -f
sudo journalctl -u tailscaled -f
sudo journalctl -u cloudflared -f
```

---

## 🔐 Security Best Practices

### 1. Firewall Configuration

```bash
# Check UFW status
sudo ufw status

# If not enabled, enable with Tailscale exception:
sudo ufw allow in on tailscale0
sudo ufw enable
```

### 2. SSH Hardening (if SSH is enabled)

```bash
# Disable password auth, use keys only
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### 3. Secrets Management

All secrets via Infisical:
```bash
# Export secrets before starting services
./scripts/infisical-export.sh dev /shared .env

# Never commit .env files
# Already in .gitignore
```

---

## 🎓 Learning Resources

### WSL 2
- [Official WSL Documentation](https://learn.microsoft.com/en-us/windows/wsl/)
- [Advanced WSL Settings](https://learn.microsoft.com/en-us/windows/wsl/wsl-config)

### Docker on WSL 2
- [Docker Desktop WSL 2 Backend](https://docs.docker.com/desktop/wsl/)
- [Best Practices](https://docs.docker.com/desktop/wsl/best-practices/)

### Tailscale
- [Tailscale on WSL](https://tailscale.com/kb/1230/install-wsl)
- [Exit Nodes](https://tailscale.com/kb/1103/exit-nodes)

### Cloudflare Tunnels
- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Tunnel Configuration](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/)

---

## 🆘 Getting Help

### Run Diagnostics

```bash
# Comprehensive validation
~/projects/project-nyra/scripts/validate-wsl-config.sh

# WSL system info
wsl --status

# Docker diagnostics
docker info
docker system df
```

### Common Commands

```bash
# Restart all services
docker compose -f infra/docker/docker-compose.yml restart

# Restart WSL (from Windows PowerShell)
wsl --shutdown

# Check WSL version
wsl --version

# List WSL distributions
wsl --list --verbose
```

---

## 📝 Changelog

- **2026-01-25**: Initial orchestrator setup guide created
- **2026-01-25**: Added WSL config validation script
- **2026-01-25**: Added .wslconfig recommendations

---

**For questions or issues, check the validation script output and troubleshooting section above.**
