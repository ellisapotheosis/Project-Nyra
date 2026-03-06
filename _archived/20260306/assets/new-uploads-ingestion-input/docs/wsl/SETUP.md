# Gitea WSL Setup Guide

Complete guide for setting up Gitea as a local Git server in WSL for orchestrator-mini.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [GitHub Synchronization](#github-synchronization)
6. [Usage](#usage)
7. [Maintenance](#maintenance)
8. [Advanced Configuration](#advanced-configuration)

## Overview

This setup provides:

- **Local Git Server**: Gitea running in WSL Docker
- **PostgreSQL Database**: Persistent data storage
- **Redis Cache**: High-performance caching
- **GitHub Sync**: Bi-directional synchronization
- **SSH Access**: Git operations over SSH
- **Auto-Start**: Systemd service integration
- **Port Forwarding**: Windows network access

## Prerequisites

### System Requirements

- **Windows**: 10 version 1903+ or Windows 11
- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 20GB free space
- **CPU**: 2+ cores recommended
- **Virtualization**: Hyper-V or WSL2 support

### Required Software

- WSL2 with Ubuntu 22.04
- Docker and Docker Compose
- Git
- OpenSSL
- curl/wget

## Installation

### Step 1: Install WSL2 and Ubuntu

```powershell
# Run as Administrator in PowerShell
cd C:\Users\edane\bootstrap\wsl
.\install-wsl.ps1
```

This script:
- Enables WSL2 and Virtual Machine Platform
- Installs Ubuntu 22.04 LTS
- Configures WSL settings
- Sets up systemd support

**Action Required**: Restart Windows if prompted.

### Step 2: Setup Ubuntu Environment

```bash
# In WSL Ubuntu terminal
cd /mnt/c/Users/edane/bootstrap/wsl
chmod +x setup-ubuntu.sh
./setup-ubuntu.sh
```

This installs:
- Docker & Docker Compose
- Node.js 20 (via nvm)
- Python 3.11 (via pyenv)
- PostgreSQL 16
- Redis 7
- GitHub CLI, Claude CLI, Infisical CLI
- Tailscale

**Time Required**: 10-15 minutes

### Step 3: Install Gitea

```bash
# Restart WSL for systemd
exit
# From Windows: wsl --shutdown
# Then launch WSL again: wsl

cd /mnt/c/Users/edane/bootstrap/wsl/gitea
chmod +x setup-gitea.sh
./setup-gitea.sh
```

This script:
1. Creates `.env` from template
2. Generates secure tokens
3. Starts Docker containers
4. Creates admin user
5. Configures SSH
6. Sets up systemd service
7. Initializes GitHub sync

**Time Required**: 5-10 minutes

## Configuration

### Environment Variables

Edit `C:\Users\edane\bootstrap\wsl\gitea\.env`:

```bash
# Admin credentials
GITEA_ADMIN_USERNAME=admin
GITEA_ADMIN_PASSWORD=your_secure_password
GITEA_ADMIN_EMAIL=admin@localhost

# Database
POSTGRES_PASSWORD=your_database_password
REDIS_PASSWORD=your_redis_password

# Security tokens (auto-generated)
SECRET_KEY=your_secret_key
INTERNAL_TOKEN=your_internal_token

# GitHub sync
GITHUB_TOKEN=ghp_your_github_token
GITHUB_USERNAME=your_github_username
GITHUB_REPO=orchestrator-mini
GITHUB_OWNER=your_github_org

# Sync settings
SYNC_INTERVAL=300  # 5 minutes
CONFLICT_STRATEGY=latest_wins
```

### Generating Secure Passwords

```bash
# Generate random passwords
openssl rand -base64 32

# Generate UUID
uuidgen
```

### Port Configuration

Default ports:
- **HTTP**: 3000
- **SSH**: 2222

To change ports, edit `.env`:

```bash
GITEA_HTTP_PORT=3000
GITEA_SSH_PORT=2222
```

## GitHub Synchronization

### Setup Sync

1. **Create GitHub Personal Access Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `workflow`
   - Copy token to `.env` as `GITHUB_TOKEN`

2. **Configure Sync Settings**:

```bash
# Edit .env
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_USERNAME=your_username
GITHUB_REPO=orchestrator-mini
GITHUB_OWNER=your_org
SYNC_ENABLED=true
SYNC_BIDIRECTIONAL=true
SYNC_INTERVAL=300
```

3. **Initialize Sync**:

```bash
cd /mnt/c/Users/edane/bootstrap/wsl/gitea
./sync-github.sh --setup
```

### Sync Modes

#### One-Time Sync

```bash
./sync-github.sh --once
```

#### Daemon Mode (Continuous)

```bash
./sync-github.sh --daemon
```

#### Directional Sync

```bash
# GitHub → Gitea
./sync-github.sh --github-to-gitea

# Gitea → GitHub
./sync-github.sh --gitea-to-github
```

### Conflict Resolution Strategies

Set in `.env`:

- **`latest_wins`**: Most recent commit wins (default)
- **`github_wins`**: Always prefer GitHub
- **`gitea_wins`**: Always prefer Gitea
- **`manual`**: Stop and require manual resolution

### Monitoring Sync

```bash
# Check sync service status
systemctl status gitea-sync.timer

# View sync logs
journalctl -u gitea-sync.service -f

# Manual sync
./sync-github.sh --once
```

## Usage

### Web Interface

1. Open browser: http://localhost:3000
2. Login with admin credentials
3. Create repositories, manage users, etc.

### SSH Access

#### Add SSH Key

```bash
# Generate key (if not exists)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/gitea_rsa

# Display public key
cat ~/.ssh/gitea_rsa.pub
```

Add to Gitea:
1. Login to Gitea web interface
2. Go to Settings → SSH / GPG Keys
3. Click "Add Key"
4. Paste public key
5. Save

#### Clone Repository

```bash
# Using SSH
git clone git@gitea-local:admin/my-repo.git

# Using HTTPS
git clone http://localhost:3000/admin/my-repo.git
```

### Docker Commands

```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop all
docker compose down

# Start all
docker compose up -d

# Check status
docker compose ps
```

### Systemd Commands

```bash
# Service status
systemctl status gitea.service

# Start service
sudo systemctl start gitea.service

# Stop service
sudo systemctl stop gitea.service

# Restart service
sudo systemctl restart gitea.service

# Enable auto-start
sudo systemctl enable gitea.service
```

## Maintenance

### Backups

#### Manual Backup

```bash
# Stop Gitea
docker compose down

# Backup volumes
docker run --rm -v gitea-data:/data -v $(pwd):/backup ubuntu tar czf /backup/gitea-backup-$(date +%Y%m%d).tar.gz /data

# Restart Gitea
docker compose up -d
```

#### Automated Backup Script

Create `C:\Users\edane\bootstrap\wsl\gitea\backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/mnt/c/Users/edane/backups/gitea"
mkdir -p "$BACKUP_DIR"

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/gitea-backup-$DATE.tar.gz"

docker run --rm \
  -v gitea-data:/data \
  -v gitea-db-data:/db \
  -v "$BACKUP_DIR":/backup \
  ubuntu tar czf "/backup/gitea-backup-$DATE.tar.gz" /data /db

echo "Backup created: $BACKUP_FILE"
```

Add to crontab:

```bash
crontab -e
# Add: 0 2 * * * /mnt/c/Users/edane/bootstrap/wsl/gitea/backup.sh
```

### Updates

#### Update Gitea

```bash
cd /mnt/c/Users/edane/bootstrap/wsl/gitea

# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d

# Check version
docker compose exec gitea gitea --version
```

#### Update System

```bash
# Update Ubuntu packages
sudo apt update && sudo apt upgrade -y

# Update Docker
sudo apt install --only-upgrade docker-ce docker-ce-cli containerd.io
```

### Monitoring

#### Health Checks

```bash
# Check Gitea health
curl http://localhost:3000/api/healthz

# Check Docker status
docker compose ps

# Check disk usage
docker system df
```

#### Performance Monitoring

```bash
# Container stats
docker stats

# Database size
docker compose exec gitea-db psql -U gitea -c "SELECT pg_size_pretty(pg_database_size('gitea'));"

# Redis stats
docker compose exec gitea-redis redis-cli --raw INFO stats
```

## Advanced Configuration

### Port Forwarding for Network Access

Allow access from other machines on your network:

```powershell
# Run as Administrator
C:\Users\edane\bootstrap\wsl\port-forward.ps1
```

Access from network:
- HTTP: `http://YOUR_COMPUTER_NAME:3000`
- SSH: `git@YOUR_COMPUTER_NAME:2222`

### Custom Domain

1. Edit `.env`:

```bash
GITEA_DOMAIN=gitea.local
GITEA_ROOT_URL=http://gitea.local:3000/
```

2. Add to Windows hosts file (`C:\Windows\System32\drivers\etc\hosts`):

```
127.0.0.1 gitea.local
```

3. Restart Gitea:

```bash
docker compose restart
```

### HTTPS with Self-Signed Certificate

```bash
# Generate certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout gitea.key -out gitea.crt \
  -subj "/CN=localhost"

# Update docker-compose.yml to mount certificates
# Add to gitea service volumes:
#   - ./gitea.crt:/etc/gitea/cert.pem:ro
#   - ./gitea.key:/etc/gitea/key.pem:ro

# Update .env
GITEA_ROOT_URL=https://localhost:3000/
```

### Database Tuning

Edit PostgreSQL settings in `docker-compose.yml`:

```yaml
gitea-db:
  environment:
    # Add performance settings
    POSTGRES_SHARED_BUFFERS: 256MB
    POSTGRES_EFFECTIVE_CACHE_SIZE: 1GB
    POSTGRES_MAX_CONNECTIONS: 100
```

### Redis Tuning

Add to `docker-compose.yml`:

```yaml
gitea-redis:
  command: >
    redis-server
    --maxmemory 512mb
    --maxmemory-policy allkeys-lru
    --save 900 1
    --save 300 10
```

### Act Runner for CI/CD

Enable GitHub Actions compatible CI/CD:

```bash
# Start with runner profile
docker compose --profile runner up -d

# Register runner
docker compose exec gitea-runner \
  act_runner register \
  --instance http://gitea:3000 \
  --token YOUR_RUNNER_TOKEN
```

## Next Steps

- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [API Documentation](https://docs.gitea.io/en-us/api-usage/)
- [GitHub Integration](./GITHUB-SYNC.md)

## Support

For issues or questions:
1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review Gitea logs: `docker compose logs -f gitea`
3. Check systemd status: `systemctl status gitea.service`
4. Consult Gitea documentation: https://docs.gitea.io/
