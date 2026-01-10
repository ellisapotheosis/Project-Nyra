# WSL Installation Guide - orchestrator-mini PC

Complete step-by-step installation guide for Project-Nyra WSL environment.

## Prerequisites

- Windows 10 version 1903+ or Windows 11
- Administrator access
- 32GB+ RAM (recommended)
- 8+ CPU cores (recommended)
- 100GB+ free disk space
- Internet connection

## Installation Overview

1. **Windows Setup** (10 minutes)
   - Enable WSL features
   - Install Ubuntu 22.04
   - Configure WSL settings

2. **Ubuntu Setup** (15-30 minutes)
   - Install development tools
   - Configure databases
   - Setup services

3. **Project-Nyra Setup** (10-20 minutes)
   - Clone repositories
   - Install dependencies
   - Initialize services

**Total Time:** ~45-60 minutes

## Step 1: Windows Setup

### Open PowerShell as Administrator

Right-click PowerShell and select "Run as Administrator"

### Navigate to WSL directory

```powershell
cd C:\Users\<your-username>\bootstrap\orchestrator-mini\wsl
```

### Run installation script

```powershell
.\install-wsl.ps1
```

### What happens during installation:

1. **Prerequisites Check**
   - Verifies Windows version
   - Checks administrator privileges

2. **Enable Windows Features** (requires reboot)
   - Windows Subsystem for Linux
   - Virtual Machine Platform

   **If prompted to reboot:**
   - Save all work
   - Reboot computer
   - Run `.\install-wsl.ps1` again after reboot

3. **WSL Kernel Update**
   - Downloads and installs latest WSL 2 kernel
   - Sets WSL 2 as default version

4. **Ubuntu Installation**
   - Downloads Ubuntu 22.04 LTS from Microsoft Store
   - Creates WSL instance
   - May open Ubuntu window for initial setup

5. **User Creation**
   - Creates default user: `nyra`
   - You'll be prompted to set a password
   - **Remember this password!**

6. **Configuration**
   - Copies `.wslconfig` to user profile
   - Enables systemd
   - Sets resource limits (16GB RAM, 8 cores)
   - Restarts WSL

7. **Ubuntu Setup** (automatic)
   - Updates system packages
   - Installs development tools (see below)
   - Configures services
   - **This takes 15-30 minutes**

### Troubleshooting Windows Setup

**Error: "This operation returned because the timeout period expired"**
- Internet connection may be slow
- Run script again, it will resume

**Error: "WSL 2 requires an update to its kernel component"**
- Download manually: https://aka.ms/wsl2kernel
- Install the update
- Run script again

**Error: "The requested operation requires elevation"**
- PowerShell must be run as Administrator
- Right-click PowerShell → "Run as Administrator"

## Step 2: Ubuntu Setup (Automatic)

The `setup-ubuntu.sh` script runs automatically and installs:

### Development Tools

**Docker & Containers:**
- Docker Engine (latest)
- Docker Compose V2
- Docker Buildx

**Node.js Ecosystem:**
- Node.js 20 (via nvm)
- npm, yarn, pnpm
- PM2 process manager
- TypeScript, ts-node
- NestJS CLI
- Prisma ORM

**Python Ecosystem:**
- Python 3.11 (via pyenv)
- pip, poetry, pipenv
- pytest, black, flake8
- IPython, Jupyter

**Databases:**
- PostgreSQL 16 (with contrib extensions)
- Redis 7

**Version Control:**
- Git (latest)
- GitHub CLI (gh)

**Cloud & Secrets:**
- Claude CLI
- Infisical CLI

**Networking:**
- Tailscale VPN
- Nginx web server

**Monitoring:**
- Prometheus Node Exporter

**Utilities:**
- curl, wget, jq, yq
- vim, nano
- htop, tree
- tmux, zsh
- fzf, ripgrep, fd, bat
- Oh My Zsh with plugins

### Configuration Changes

**Systemd enabled:**
```ini
# /etc/wsl.conf
[boot]
systemd=true
```

**PostgreSQL configured:**
- Listening on all interfaces
- Password authentication enabled
- Default user: postgres / postgres

**Redis configured:**
- Listening on all interfaces
- Password: redis123

**Docker configured:**
- User added to docker group
- BuildKit enabled

### Verification

After Ubuntu setup completes, verify installation:

```bash
# Check Docker
docker --version
docker compose version

# Check Node.js
node --version
npm --version

# Check Python
python3 --version
pip --version

# Check databases
psql --version
redis-cli --version

# Check other tools
git --version
gh --version
infisical --version
```

## Step 3: Project-Nyra Installation

### Open WSL terminal

```powershell
# From Windows
wsl -d Ubuntu-22.04
```

Or use Windows Terminal and select Ubuntu.

### Navigate to installation directory

```bash
cd /mnt/c/Users/<your-username>/bootstrap/orchestrator-mini/wsl
```

### Run Project-Nyra installation

```bash
./install-nyra.sh
```

### What happens:

1. **Directory Structure**
   ```
   /opt/nyra/
   ├── repos/      # Git repositories
   ├── data/       # Application data
   ├── logs/       # Log files
   ├── backups/    # Backup storage
   └── scripts/    # Utility scripts
   ```

2. **Database Setup**
   - Creates databases: nyra_main, nyra_auth, nyra_agents, nyra_memory, gitea
   - Grants privileges to postgres user

3. **Repository Cloning**
   - Clones Project-Nyra repositories
   - **Update repository URLs in script first!**

4. **Dependency Installation**
   - Runs `npm ci` or `yarn install` for all Node.js projects
   - Installs Python dependencies if present

5. **Application Build**
   - Builds all applications with `npm run build`
   - Compiles TypeScript to JavaScript

6. **Database Migrations**
   - Runs Prisma migrations
   - Runs TypeORM migrations
   - Seeds initial data (if configured)

7. **Gitea Setup**
   - Starts Gitea Docker container
   - Accessible at http://localhost:3020

8. **Monitoring Setup**
   - Starts Prometheus and Grafana containers
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001

## Step 4: Service Configuration

### Authenticate with services

**GitHub:**
```bash
gh auth login
```

**Infisical:**
```bash
infisical login
```

**Tailscale:**
```bash
sudo tailscale up
```

### Start all services

```bash
start-all.sh
```

This starts:
- PostgreSQL
- Redis
- Docker
- Nginx
- Tailscale
- Node Exporter
- Gitea
- Monitoring stack
- Application containers

### Check service status

```bash
status.sh
```

Expected output:
```
System Services:
✓ PostgreSQL is running
✓ Redis is running
✓ Docker is running
✓ Nginx is running
✓ Tailscale is running
✓ Node Exporter is running

Database Connectivity:
✓ PostgreSQL is accepting connections
✓ Redis is responding

Docker Status:
✓ Docker is running
   Containers: 5 running, 5 total
```

## Step 5: Post-Installation Configuration

### Configure Gitea

1. Open http://localhost:3020 in browser
2. Complete installation wizard:
   - Database Type: PostgreSQL
   - Host: host.docker.internal:5432
   - Database: gitea
   - Username: postgres
   - Password: postgres
3. Create administrator account
4. Configure SSH keys (optional)

### Configure Grafana

1. Open http://localhost:3001
2. Login: admin / admin
3. Change password
4. Add Prometheus datasource (already configured)
5. Import dashboards from `/opt/nyra/monitoring/grafana/dashboards/`

### Setup local DNS

```bash
sudo ./networking/setup-dns.sh
```

Adds local domains:
- http://nyra.local:3000
- http://gitea.local:3020
- http://prometheus.local:9090
- http://grafana.local:3001

### Configure port forwarding (Windows)

```powershell
# From Windows PowerShell as Administrator
.\networking\port-forward.ps1
```

Makes services accessible from Windows network.

### Setup Tailscale VPN (optional)

```bash
./networking/setup-tailscale.sh
```

Enables remote access to orchestrator-mini.

## Step 6: Verification

### Run comprehensive checks

```bash
# Service status
status.sh

# View logs
logs.sh -f

# Test database connections
psql -U postgres -c "SELECT version();"
redis-cli ping

# Test Docker
docker ps

# Test application
curl http://localhost:3000
```

### Access web interfaces

Open in browser:
- Main App: http://localhost:3000
- Gitea: http://localhost:3020
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

## Step 7: Backup Configuration

### Create initial backup

```powershell
# From Windows PowerShell as Administrator
.\backup\backup-wsl.ps1 -BackupPath "D:\Backups"
```

### Schedule automated backups

Create Windows scheduled task:

```powershell
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-File C:\Users\<username>\bootstrap\orchestrator-mini\wsl\backup\backup-wsl.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -TaskName "WSL-Nyra-Backup" `
    -Action $action -Trigger $trigger -RunLevel Highest
```

## Common Issues & Solutions

### Issue: WSL won't start

**Solution:**
```powershell
wsl --shutdown
wsl
```

### Issue: Services won't start

**Solution:**
```bash
# Check logs
sudo journalctl -u <service-name>

# Restart service
sudo systemctl restart <service-name>
```

### Issue: Out of memory

**Solution:**
Edit `C:\Users\<username>\.wslconfig`:
```ini
[wsl2]
memory=8GB  # Reduce from 16GB
```

Then:
```powershell
wsl --shutdown
```

### Issue: Port already in use

**Solution:**
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use alias
killport 3000
```

### Issue: Docker permission denied

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
exit
wsl
```

### Issue: PostgreSQL won't start

**Solution:**
```bash
# Check status
sudo systemctl status postgresql

# Check logs
sudo journalctl -u postgresql -n 50

# Reset and restart
sudo systemctl restart postgresql
```

## Next Steps

1. **Development:**
   - Clone your projects to `/opt/nyra/repos/`
   - Setup IDE (VS Code with Remote-WSL extension)
   - Configure environment variables

2. **Team Setup:**
   - Create Gitea users and organizations
   - Setup CI/CD pipelines
   - Configure webhooks

3. **Monitoring:**
   - Import Grafana dashboards
   - Setup alerts
   - Configure log aggregation

4. **Security:**
   - Change default passwords
   - Setup SSH keys
   - Configure firewall rules

## Quick Reference

### Essential Commands

```bash
# Service management
start-all.sh           # Start all services
stop-all.sh            # Stop all services
status.sh              # Check status
logs.sh -f             # View logs

# Navigation
nyra                   # cd /opt/nyra
repos                  # cd /opt/nyra/repos
logs                   # cd /opt/nyra/logs

# Docker
dc up -d               # Start containers
dc down                # Stop containers
dclogs                 # View logs

# Database
psql -U postgres       # PostgreSQL CLI
redis-cli              # Redis CLI
```

### File Locations

| Component | Location |
|-----------|----------|
| WSL Config | `C:\Users\<user>\.wslconfig` |
| Ubuntu Files | `\\wsl$\Ubuntu-22.04` |
| Nyra Home | `/opt/nyra` |
| Logs | `/opt/nyra/logs` |
| Scripts | `/opt/nyra/scripts` |

### Service Ports

| Service | Port | URL |
|---------|------|-----|
| Main App | 3000 | http://localhost:3000 |
| Grafana | 3001 | http://localhost:3001 |
| Gitea | 3020 | http://localhost:3020 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Nginx | 8080 | http://localhost:8080 |
| Prometheus | 9090 | http://localhost:9090 |
| Node Exporter | 9100 | http://localhost:9100/metrics |

## Support

For issues:
1. Check logs: `logs.sh -f`
2. Check status: `status.sh`
3. Review README.md
4. Check service-specific logs

---

**Installation Guide Version:** 1.0.0
**Last Updated:** 2024-01-15
**For:** Project-Nyra orchestrator-mini PC
