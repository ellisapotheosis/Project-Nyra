# WSL Setup for Project-Nyra orchestrator-mini

Complete WSL development environment for Project-Nyra with all tools, services, and infrastructure.

## Quick Start

### One-Command Installation

```powershell
# Run as Administrator in PowerShell
.\install-wsl.ps1
```

This will:
- ✅ Enable WSL and Virtual Machine Platform
- ✅ Install Ubuntu 22.04 LTS
- ✅ Configure systemd and resource limits
- ✅ Install all development tools
- ✅ Setup databases (PostgreSQL, Redis)
- ✅ Configure monitoring and networking

**Time Required:** 30-45 minutes for complete setup

## Installation Steps (Detailed)

### 1. WSL Installation (Windows)

```powershell
# Must run as Administrator
cd bootstrap/orchestrator-mini/wsl
.\install-wsl.ps1
```

**What this does:**
- Checks Windows version compatibility
- Enables required Windows features
- Downloads and installs Ubuntu 22.04
- Configures memory (16GB) and CPU (8 cores)
- Creates default user and enables systemd
- Runs Ubuntu setup script automatically

**After installation:** Reboot if prompted

### 2. Ubuntu Environment Setup (Automatic)

Runs automatically during WSL installation. Installs:

**Development Tools:**
- Docker + Docker Compose
- Node.js 20 (via nvm)
- Python 3.11 (via pyenv)
- Git + GitHub CLI
- Claude CLI
- Infisical CLI

**Databases:**
- PostgreSQL 16
- Redis 7

**Services:**
- Nginx web server
- Tailscale VPN
- Prometheus Node Exporter

**Utilities:**
- htop, jq, yq, fzf, ripgrep
- tmux, zsh, Oh My Zsh
- Essential build tools

### 3. Project-Nyra Installation

```bash
# Inside WSL
cd /mnt/c/Users/<username>/bootstrap/orchestrator-mini/wsl
./install-nyra.sh
```

**What this does:**
- Creates directory structure (`/opt/nyra`)
- Sets up PostgreSQL databases
- Clones Project-Nyra repositories
- Installs Node.js dependencies
- Builds applications
- Runs database migrations
- Starts Gitea and monitoring services

### 4. Service Management

```bash
# Start all services
start-all.sh

# Check status
status.sh

# View logs
logs.sh -f

# Stop all services
stop-all.sh
```

## Configuration

### WSL Configuration (`.wslconfig`)

Located at: `C:\Users\<username>\.wslconfig`

```ini
[wsl2]
memory=16GB          # Adjust based on system RAM
processors=8         # Adjust based on CPU cores
swap=8GB
localhostForwarding=true

[experimental]
networkingMode=mirrored
dnsTunneling=true
autoMemoryReclaim=gradual
```

**To apply changes:**
```powershell
wsl --shutdown
```

### Resource Recommendations

| System RAM | WSL Memory | Processors |
|-----------|------------|------------|
| 16GB      | 8GB        | 4          |
| 32GB      | 16GB       | 8          |
| 64GB      | 32GB       | 12         |

### Environment Variables

Located in `~/.bashrc`:

```bash
export NYRA_HOME="/opt/nyra"
export NYRA_REPOS="$NYRA_HOME/repos"
export NYRA_DATA="$NYRA_HOME/data"
export NYRA_LOGS="$NYRA_HOME/logs"
```

## Networking

### Port Forwarding (Windows to WSL)

```powershell
# Run as Administrator
.\networking\port-forward.ps1
```

**Forwarded Ports:**
- 3000 - Main application
- 3001 - Grafana
- 3020 - Gitea
- 5432 - PostgreSQL
- 6379 - Redis
- 8080 - Nginx
- 9090 - Prometheus
- 9100 - Node Exporter

### Tailscale VPN Setup

```bash
# Inside WSL
./networking/setup-tailscale.sh
```

Enables secure remote access to orchestrator-mini from anywhere.

### Local DNS Configuration

```bash
# Inside WSL
sudo ./networking/setup-dns.sh
```

**Local domains:**
- http://nyra.local:3000
- http://gitea.local:3020
- http://prometheus.local:9090
- http://grafana.local:3001

## Services

### Service Status Overview

```bash
status.sh
```

**Output includes:**
- System service status (PostgreSQL, Redis, Docker, etc.)
- Database connectivity
- Docker container status
- Network ports
- Resource usage

### Starting Individual Services

```bash
# PostgreSQL
sudo systemctl start postgresql

# Redis
sudo systemctl start redis-server

# Docker
sudo systemctl start docker

# Nginx
sudo systemctl start nginx

# Tailscale
sudo systemctl start tailscaled
```

### Service Logs

```bash
# All logs
logs.sh -f

# Specific service
logs.sh -s postgres
logs.sh -s redis
logs.sh -s app

# Last 100 lines
logs.sh -n 100
```

## Development Environment

### Shell Configuration

**Bash:** `~/.bashrc` with custom configurations
**Zsh:** Oh My Zsh with plugins
**Aliases:** `~/.bash_aliases` with 100+ shortcuts

**Key Aliases:**
```bash
# Navigation
nyra          # cd /opt/nyra
repos         # cd /opt/nyra/repos

# Docker
dc up -d      # Start containers
dclogs        # Follow logs
dclean        # Clean up

# Git
gs            # git status
glog          # Pretty git log
ghpr          # Create PR

# Services
nyra-start    # Start all
nyra-status   # Check status
nyra-logs     # View logs
```

### IDE Integration

**VS Code:**
```bash
# Open from Windows
code /path/in/wsl
```

**Remote Development:**
1. Install "Remote - WSL" extension
2. Open WSL folder in VS Code
3. All tools available automatically

## Monitoring

### Prometheus Metrics

**Access:** http://localhost:9090

**Exporters:**
- Node Exporter (system metrics): :9100
- PostgreSQL Exporter: :9187
- Redis Exporter: :9121
- cAdvisor (Docker): :8080

### Grafana Dashboards

**Access:** http://localhost:3001
**Login:** admin / admin

**Pre-configured:**
- System overview dashboard
- Database metrics
- Container monitoring
- Application metrics

### Setup Monitoring

```bash
# Install exporters
sudo ./monitoring/setup-exporters.sh

# Start monitoring stack
cd /opt/nyra/monitoring
docker compose up -d
```

## Gitea Self-Hosted Git

### Initial Setup

```bash
./gitea/setup-gitea.sh
```

**Access:** http://localhost:3020

**Configuration:**
1. Complete installation wizard
2. Create admin account
3. Configure SSH keys
4. Create organizations and repositories

### Gitea Commands

```bash
# Start
cd /opt/nyra/gitea && docker compose up -d

# Stop
cd /opt/nyra/gitea && docker compose down

# Logs
cd /opt/nyra/gitea && docker compose logs -f

# Backup
docker exec gitea gitea dump -c /data/gitea/conf/app.ini
```

## Backup & Restore

### Full WSL Backup

```powershell
# From Windows PowerShell as Administrator
.\backup\backup-wsl.ps1 -BackupPath "D:\Backups"
```

**Includes:**
- Entire WSL distribution
- All databases (PostgreSQL, Redis)
- Application code and configurations
- Docker images and volumes

**Time Required:** 10-30 minutes
**Size:** ~10-50GB (compressed)

### Restore from Backup

```powershell
.\backup\restore-wsl.ps1 -BackupFile "path\to\backup.tar"
```

### Automated Backups

Create scheduled task in Windows:

```powershell
# Daily backup at 2 AM
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-File C:\path\to\backup-wsl.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -TaskName "WSL-Nyra-Backup" `
    -Action $action -Trigger $trigger -RunLevel Highest
```

## Troubleshooting

### WSL Won't Start

```powershell
# Restart WSL
wsl --shutdown
wsl

# Check status
wsl --status

# Update WSL
wsl --update
```

### Services Won't Start

```bash
# Check service logs
sudo journalctl -u postgresql
sudo journalctl -u redis-server
sudo journalctl -u docker

# Restart services
sudo systemctl restart postgresql
sudo systemctl restart redis-server
```

### Docker Issues

```bash
# Restart Docker
sudo systemctl restart docker

# Check Docker logs
sudo journalctl -u docker -n 50

# Reset Docker
sudo systemctl stop docker
sudo rm -rf /var/lib/docker
sudo systemctl start docker
```

### Memory Issues

Reduce memory allocation in `.wslconfig`:

```ini
[wsl2]
memory=8GB  # Reduce from 16GB
```

Then restart:
```powershell
wsl --shutdown
```

### Network Issues

```bash
# Reset network
wsl --shutdown
# Then start WSL again

# Check connectivity
ping 8.8.8.8
curl https://www.google.com

# DNS issues
sudo systemctl restart systemd-resolved
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use killport alias
killport 3000
```

## Advanced Configuration

### Custom PostgreSQL Configuration

Edit: `/etc/postgresql/16/main/postgresql.conf`

```bash
# Increase connections
max_connections = 200

# Increase shared buffers
shared_buffers = 4GB

# Restart
sudo systemctl restart postgresql
```

### Custom Redis Configuration

Edit: `/etc/redis/redis.conf`

```bash
# Increase max memory
maxmemory 4gb
maxmemory-policy allkeys-lru

# Restart
sudo systemctl restart redis-server
```

### Docker Configuration

Edit: `/etc/docker/daemon.json`

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-address-pools": [
    {
      "base": "172.80.0.0/16",
      "size": 24
    }
  ]
}
```

## Directory Structure

```
/opt/nyra/
├── repos/              # Git repositories
│   └── project-nyra/   # Main application
├── data/               # Application data
│   ├── postgres/       # PostgreSQL data
│   ├── redis/          # Redis data
│   └── gitea/          # Gitea data
├── logs/               # Application logs
├── backups/            # Local backups
├── scripts/            # Utility scripts
│   └── services/       # Service management
├── monitoring/         # Prometheus & Grafana
└── gitea/             # Gitea configuration
```

## File Locations

| Component | Location |
|-----------|----------|
| WSL Config | `C:\Users\<user>\.wslconfig` |
| Ubuntu Root | `\\wsl$\Ubuntu-22.04` |
| Nyra Home | `/opt/nyra` |
| PostgreSQL Data | `/var/lib/postgresql/16/main` |
| Redis Data | `/var/lib/redis` |
| Docker Data | `/var/lib/docker` |
| Logs | `/opt/nyra/logs` |

## Performance Optimization

### Enable Sparse VHD

In `.wslconfig`:
```ini
[experimental]
sparseVhd=true
```

### Compact VHDX

```powershell
# Stop WSL
wsl --shutdown

# Compact VHDX
Optimize-VHD -Path $env:LOCALAPPDATA\Packages\CanonicalGroupLimited.Ubuntu22.04LTS_*\LocalState\ext4.vhdx -Mode Full
```

### Disable Unused Services

```bash
# List all services
systemctl list-unit-files --state=enabled

# Disable service
sudo systemctl disable <service-name>
```

## Security

### Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow specific ports
sudo ufw allow 3000/tcp
sudo ufw allow 3020/tcp

# Check status
sudo ufw status
```

### Update System

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Update Node.js
nvm install node --latest-npm

# Update Docker images
docker compose pull
docker compose up -d
```

## Additional Resources

- **WSL Documentation:** https://learn.microsoft.com/en-us/windows/wsl/
- **Docker Documentation:** https://docs.docker.com/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Prometheus Documentation:** https://prometheus.io/docs/
- **Gitea Documentation:** https://docs.gitea.com/

## Support

For issues or questions:
1. Check logs: `logs.sh -f`
2. Check service status: `status.sh`
3. Review error messages
4. Consult documentation above

## License

Project-Nyra - All Rights Reserved

---

**Last Updated:** 2024-01-15
**Version:** 1.0.0
**Maintainer:** Project-Nyra Team
