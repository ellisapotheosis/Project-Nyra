# Project Nyra Infrastructure Setup Guide

**For**: New team members setting up development environment for Project Nyra  
**Last Updated**: 2026-05-19  
**Estimated Time**: 30-60 minutes (varies by network speed)

---

## Prerequisites

Before starting, ensure you have:

### Hardware Requirements

- **Minimum Local Machine**: Intel i7/Ryzen 7, 16GB RAM, 200GB SSD
- **Network**: Ethernet or stable WiFi (Tailscale mesh requires network connectivity)
- **SSH Client**: OpenSSH (pre-installed on Mac/Linux, Windows 10+ included)
- **Terminal**: bash, zsh, or PowerShell

### Software Requirements

All installations should be completed BEFORE accessing infrastructure:

```bash
# macOS (using Homebrew)
brew install git docker tailscale infisical

# Ubuntu/Debian
sudo apt update && sudo apt install -y git docker.io tailscale
curl https://infisical.com/install.sh | sh

# Windows
# Download from:
# - Git: https://git-scm.com/download/win
# - Docker Desktop: https://www.docker.com/products/docker-desktop
# - Tailscale: https://tailscale.com/download/windows
# - Infisical: https://infisical.com/docs/getting-started/quickstart
```

### Accounts & Access

You need:

- **GitHub Account**: Access to project-nyra repository
- **Tailscale Account**: Invitation to Project Nyra network
- **Infisical Account**: Access to secrets management
- **SSH Key**: For accessing cluster hosts

---

## Step 1: Clone Repository & Initialize

### Clone the Repository

```bash
git clone https://github.com/user/project-nyra.git
cd project-nyra
```

### Initialize Git Submodules

Project Nyra uses 2 submodules for extended functionality:

```bash
# Initialize and fetch submodules
git submodule update --init --recursive

# Verify submodules initialized
git submodule status

# Expected output:
#  <commit-hash> external/claw-code (v1.0.0)
#  <commit-hash> external/llxprt-jefe (main)
```

**Troubleshooting**:

```bash
# If submodule initialization fails:
git submodule sync --recursive
git submodule update --init --recursive

# Check for orphaned gitlinks:
git ls-files --stage | grep "^160000"
```

---

## Step 2: SSH Key Setup

### Generate SSH Key (if you don't have one)

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/id_ed25519

# Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# Display public key (share with infrastructure team)
cat ~/.ssh/id_ed25519.pub
```

### Add SSH Configuration

Create or update `~/.ssh/config`:

```
Host orchestrator
    HostName orchestrator.ts.net
    User ellisapotheosis
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

Host worker-rtx5090
    HostName worker-rtx5090.ts.net
    User ellisapotheosis
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

Host worker-rtx3090ti
    HostName worker-rtx3090ti.ts.net
    User ellisapotheosis
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

Host worker-rtx3060
    HostName worker-rtx3060.ts.net
    User ellisapotheosis
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

Host oracle-vps
    HostName oracle-vps.ts.net
    User ellisapotheosis
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
```

### Test SSH Access

```bash
# Test connection to each host
ssh orchestrator "echo 'SSH access OK'"
ssh worker-rtx5090 "echo 'SSH access OK'"
ssh oracle-vps "echo 'SSH access OK'"
```

---

## Step 3: Tailscale Configuration

### Install & Authenticate

```bash
# Start Tailscale daemon (macOS/Linux)
sudo tailscaled

# In another terminal, authenticate
sudo tailscale up

# Follow the browser prompt to authenticate with your account
# You will be added to Project Nyra's Tailscale network automatically
```

### Verify Mesh Connectivity

```bash
# Check Tailscale status
tailscale status

# Expected output shows all 5 hosts with 100.64.x.x IPs:
# NAME                  IP                  STATUS
# orchestrator          100.64.1.10        active
# worker-rtx5090        100.64.1.11        active
# worker-rtx3090ti      100.64.1.12        active
# worker-rtx3060        100.64.1.13        active
# oracle-vps            100.64.1.31        active

# Test mesh connectivity
ping orchestrator.ts.net
ping worker-rtx5090.ts.net
curl http://orchestrator.ts.net:7000/health  # Nexus Router
```

### Troubleshooting Tailscale

```bash
# If Tailscale won't connect:
sudo systemctl restart tailscaled  # Linux
sudo launchctl stop com.tailscale.ipn.macos.daemon  # macOS

# Check logs
sudo journalctl -u tailscaled -f  # Linux
log stream --predicate 'process contains "tailscaled"'  # macOS

# Reset Tailscale (last resort)
sudo tailscale logout
sudo rm -rf /var/lib/tailscale
sudo tailscale up
```

---

## Step 4: Docker Configuration

### Install Docker

```bash
# macOS: Docker Desktop (GUI)
# Download from: https://www.docker.com/products/docker-desktop

# Ubuntu/Debian
sudo apt install -y docker.io
sudo usermod -aG docker $USER
newgrp docker  # Apply group membership without relogin

# Verify installation
docker --version
docker ps  # Should show running containers
```

### Docker Daemon Verification

```bash
# Check if Docker daemon is running
docker ps

# Expected: Lists containers (even if none are running)

# If you see "Cannot connect to Docker daemon":
# macOS: Open Docker Desktop application
# Linux: sudo systemctl start docker
# Windows: Start Docker Desktop from Start menu

# Verify Docker has access to cluster networks
docker network ls

# Expected output includes:
# NETWORK ID   NAME                       DRIVER
# <id>         bridge                     bridge
# <id>         host                       host
# <id>         none                       null
# <id>         nyra-mcp-network           bridge
```

---

## Step 5: Infisical Secrets Setup

### Authenticate with Infisical

```bash
# Log in to Infisical
infisical login

# This will open a browser for authentication
# Your organization: Project Nyra (or provided by team)
# Workspace: production or development (varies)

# Verify authentication
infisical auth status
```

### Fetch Secrets into Environment

```bash
# Pull secrets for your environment
infisical secrets --env=dev --json > /tmp/secrets.json

# Source secrets into shell
export $(infisical secrets --env=dev --plain | xargs)

# Verify critical secrets loaded
echo $ANTHROPIC_API_KEY  # Should show masked key
echo $OPENROUTER_API_KEY
```

### Store Secrets Safely

⚠️ **NEVER commit secrets to git**

```bash
# Create .env.local (gitignored)
infisical secrets --env=dev > .env.local

# Use in development
source .env.local

# Verify gitignore has .env files
grep -E "^\.env" .gitignore
```

---

## Step 6: Verify Cluster Health

### Run Infrastructure Health Check

```bash
# From project root
./infra/scripts/health-check.sh

# Expected output: ✓ for all checks
# Should see:
# ✓ Docker daemon running
# ✓ Docker Compose available
# ✓ Nexus Router responding
# ✓ Worker nodes SSH accessible
# ✓ Oracle VPS reachable
# ✓ Tailscale active
# ✓ Git repository initialized
```

### Run Network Topology Mapper

```bash
# Discover all hosts and their endpoints
./infra/scripts/network-map.sh

# Expected output:
# ✓ DNS: orchestrator → 100.64.x.x
# ✓ SSH: orchestrator:22 accessible
# ✓ Service: Nexus Router (localhost:7000) responding
# ✓ Service: vLLM (worker-rtx5090:8000) port open
```

### Test Service Endpoints

```bash
# From local machine (via Tailscale)

# Nexus Router
curl http://orchestrator.ts.net:7000/health

# LiteLLM
curl http://orchestrator.ts.net:8000/health

# TwentyCRM
curl http://oracle-vps.ts.net:3000/api/health

# Qdrant (vector database)
curl http://oracle-vps.ts.net:6333/health

# FalkorDB (graph database)
curl http://oracle-vps.ts.net:6363/health
```

---

## Step 7: Git Submodules & Makefile

### Verify Project Structure

```bash
# Check all required directories exist
ls -d infra/hosts/{orchestrator,worker-rtx*,oracle-vps}
ls infra/scripts/health-check.sh
ls infra/scripts/network-map.sh

# Expected: All directories and scripts present
```

### Available Makefile Targets

The project includes a Makefile with helpful targets:

```bash
# Health & diagnostics
make health              # Run infrastructure health check
make network-map        # Discover and map all hosts
make logs               # Aggregate logs from all services
make logs SERVICE=n8n   # View logs for specific service

# Deployment
make deploy             # Deploy services to all hosts
make deploy HOST=orchestrator  # Deploy to specific host

# Cleanup
make clean              # Remove old images and containers
make clean-volumes      # Remove unused Docker volumes

# Testing
make test               # Run infrastructure validation tests
make test-compose       # Validate all docker-compose.yml files
```

**Example**:

```bash
# Check infrastructure health
make health

# View n8n logs
make logs SERVICE=n8n

# Clean up Docker
make clean
```

---

## Step 8: Hostname & Local DNS Configuration

### Add Local Host Entries

Edit `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
# Project Nyra Infrastructure
100.64.1.10   orchestrator
100.64.1.11   worker-rtx5090
100.64.1.12   worker-rtx3090ti
100.64.1.13   worker-rtx3060
100.64.1.31   oracle-vps
```

**Note**: Exact IPs depend on your Tailscale network. Check with:

```bash
tailscale status  # See actual IPs in your network
```

### Verify DNS Resolution

```bash
# Should resolve via Tailscale
nslookup orchestrator
dig orchestrator.ts.net
ping orchestrator

# If resolution fails:
# 1. Check Tailscale is running: tailscale status
# 2. Verify /etc/hosts entries
# 3. Clear DNS cache (varies by OS)
```

---

## Troubleshooting Common Issues

### "Cannot connect to Docker daemon"

**Linux**:

```bash
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
```

**macOS**:

```bash
# Open Docker Desktop from Applications folder
# or run: open /Applications/Docker.app
```

### "SSH: Connection refused"

```bash
# Check Tailscale is connected
tailscale status

# Verify SSH key is correct
ssh -vvv orchestrator  # Verbose output shows key used

# Check SSH agent has key
ssh-add -l | grep id_ed25519
```

### "Tailscale: No route to host"

```bash
# Tailscale may need network restart
sudo tailscale down
sudo tailscale up

# Check firewall isn't blocking Tailscale ports
# Default: UDP 41641
```

### "Docker Compose: command not found"

```bash
# Verify Docker Compose version
docker compose version  # v2.0+
docker-compose version  # v1.x (deprecated)

# Should show: Docker Compose version X.Y.Z
```

### "Secrets not loading"

```bash
# Verify Infisical authentication
infisical auth status

# Try logging in again
infisical login

# Check environment variable
echo $INFISICAL_TOKEN
```

---

## Recommended Development Workflow

### Daily Startup

```bash
# 1. Ensure Tailscale is running
sudo tailscale up

# 2. Source secrets
source .env.local

# 3. Run health check
./infra/scripts/health-check.sh

# 4. Optional: Check logs
make logs
```

### Accessing Cluster Services

```bash
# SSH to any host
ssh orchestrator

# Run commands on workers
ssh worker-rtx5090 docker ps
ssh worker-rtx3090ti nvidia-smi

# Check service health
curl http://orchestrator.ts.net:7000/health
curl http://oracle-vps.ts.net:3000/api/health
```

### Making Changes

```bash
# Always create a feature branch
git checkout -b feature/my-change

# Push to GitHub
git push origin feature/my-change

# Create pull request through GitHub

# Never push directly to main
# Always use feature branches
```

---

## Reference Documentation

- **Infrastructure Reference**: `docs/INFRASTRUCTURE_REFERENCE.md`
- **Network Topology**: `docs/NETWORK_TOPOLOGY.md`
- **Memory Architecture**: `docs/MEMORY_ARCHITECTURE_DECISION.md`
- **Phase 1 Roadmap**: `docs/PHASE_1_IMPLEMENTATION_ROADMAP.md`
- **Makefile Targets**: Run `make help` or check `Makefile`
- **Agent Instructions**: `AGENTS.md` (system-wide architecture)
- **Claude Code Config**: `.claude/CLAUDE.md` (project conventions)

---

## Getting Help

### Health Diagnostics

```bash
# Most complete diagnostic
./infra/scripts/health-check.sh

# Network-specific diagnostics
./infra/scripts/network-map.sh

# View detailed logs
docker logs <container-name>  # Local container
ssh orchestrator docker logs <service>  # Remote container
```

### Debugging Commands

```bash
# Check all connections
tailscale status

# Verify DNS
nslookup orchestrator
dig orchestrator.ts.net @1.1.1.1

# Test service ports
curl -v http://orchestrator.ts.net:7000/health

# Check Docker network
docker network inspect nyra-mcp-network
```

---

## Estimated Setup Timeline

| Step      | Task               | Time          |
| --------- | ------------------ | ------------- |
| 1         | Clone & submodules | 2-5 min       |
| 2         | SSH key setup      | 5-10 min      |
| 3         | Tailscale auth     | 5 min         |
| 4         | Docker install     | 10-20 min     |
| 5         | Infisical setup    | 5 min         |
| 6         | Health checks      | 5-10 min      |
| 7         | Git & Makefile     | 2 min         |
| 8         | Hostname config    | 2 min         |
| **Total** |                    | **30-60 min** |

Times vary based on internet speed and system configuration.

---

## Next Steps After Setup

Once your environment is ready:

1. **Read the architecture**: Review `AGENTS.md` for system-wide contracts
2. **Review Phase 1 roadmap**: Understand infrastructure tasks in `PHASE_1_IMPLEMENTATION_ROADMAP.md`
3. **Explore the cluster**: SSH to each host, run `docker ps` to see running services
4. **Test inference**: Make a request through Nexus Router to verify GPU workers
5. **Review memory stack**: Understand Mem0 + FalkorDB + Qdrant + Letta architecture

---

**Questions?** Refer to troubleshooting section above or contact the infrastructure team.

**Ready to develop?** You're all set! Your local machine is now connected to the Project Nyra cluster via Tailscale mesh.
