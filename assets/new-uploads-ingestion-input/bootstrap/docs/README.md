# Project-Nyra Bootstrap Package

Complete bootstrap solution for deploying a 4-PC AI development cluster with production-ready infrastructure.

## Overview

Project-Nyra is a distributed AI development environment consisting of:

- **Orchestrator-Mini** (i9-14900K) - Central management, Gitea, monitoring
- **Worker-RTX3090Ti** - Primary AI workload processing
- **Worker-RTX3060** - Additional processing (disconnectable)
- **Worker-RTX5090** - Future expansion (disconnectable)

## Quick Start

### Prerequisites

- Windows 11 Pro on all PCs
- Admin privileges
- Docker Desktop installed
- WSL2 enabled
- Network connectivity between all PCs

### Installation

1. **Clone or download** this bootstrap package to each PC

2. **Run master bootstrap script** on Orchestrator-Mini:
   ```powershell
   cd bootstrap\scripts
   .\bootstrap-all.ps1
   ```

3. **Follow GUI installer** prompts for configuration

4. **Validate deployment**:
   ```powershell
   .\validate-bootstrap.ps1 -DetailedReport
   ```

## Architecture

```
Project-Nyra Cluster
│
├── Orchestrator-Mini (192.168.1.10)
│   ├── Gitea (port 3000)
│   ├── Grafana (port 3001)
│   ├── Prometheus (port 9090)
│   ├── Traefik (port 80/443/8080)
│   └── Portainer (port 9000)
│
├── Worker-RTX3090Ti (192.168.1.11)
│   ├── Ollama (port 11434)
│   ├── n8n (port 5678)
│   ├── SwarmUI (port 7801)
│   ├── ComfyUI (port 8188)
│   └── Open WebUI (port 3002)
│
├── Worker-RTX3060 (192.168.1.12) [Disconnectable]
│   └── Ollama (port 11434)
│
└── Worker-RTX5090 (192.168.1.13) [Disconnectable]
    └── Ollama (port 11434)
```

## Directory Structure

```
bootstrap/
├── scripts/                    # Master orchestration scripts
│   ├── bootstrap-all.ps1      # Main deployment script
│   ├── update-bootstrap.ps1   # Update and migration script
│   └── validate-bootstrap.ps1 # Validation suite
│
├── orchestrator-mini/         # Orchestrator PC configuration
│   ├── docker/                # Docker Compose files
│   ├── wsl/                   # WSL setup scripts
│   ├── gitea/                 # Gitea installation
│   ├── monitoring/            # Prometheus/Grafana configs
│   └── scripts/               # PC-specific scripts
│
├── worker-rtx3090ti/          # Primary worker configuration
│   ├── docker/                # Docker Compose files
│   └── scripts/               # PC-specific scripts
│
├── worker-rtx3060/            # Secondary worker (disconnectable)
│   ├── docker/                # Docker Compose files
│   └── scripts/               # PC-specific scripts
│
├── worker-rtx5090/            # Future worker (disconnectable)
│   ├── docker/                # Docker Compose files
│   └── scripts/               # PC-specific scripts
│
├── shared/                    # Shared resources
│   ├── docker/                # Common Docker configs
│   ├── scripts/               # Utility scripts
│   ├── configs/               # Shared configurations
│   └── templates/             # Configuration templates
│
├── config/                    # Global configurations
├── tests/                     # Automated tests
└── docs/                      # Documentation
```

## Core Services

### Orchestrator Services

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| Gitea | 3000 | Git repository management | http://orchestrator-mini:3000 |
| Grafana | 3001 | Metrics visualization | http://orchestrator-mini:3001 |
| Prometheus | 9090 | Metrics collection | http://orchestrator-mini:9090 |
| Traefik | 8080 | Reverse proxy dashboard | http://orchestrator-mini:8080 |
| Portainer | 9000 | Container management | http://orchestrator-mini:9000 |

### Worker Services (RTX3090Ti)

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| Ollama | 11434 | LLM inference engine | http://worker-rtx3090ti:11434 |
| n8n | 5678 | Workflow automation | http://worker-rtx3090ti:5678 |
| SwarmUI | 7801 | Stable Diffusion interface | http://worker-rtx3090ti:7801 |
| ComfyUI | 8188 | Advanced SD workflows | http://worker-rtx3090ti:8188 |
| Open WebUI | 3002 | Ollama frontend | http://worker-rtx3090ti:3002 |

## Management Commands

### Bootstrap Operations

```powershell
# Full bootstrap deployment
.\scripts\bootstrap-all.ps1

# Update bootstrap package from GitHub
.\scripts\update-bootstrap.ps1 -Source github

# Validate deployment
.\scripts\validate-bootstrap.ps1 -DetailedReport

# Network configuration only
.\scripts\bootstrap-all.ps1 -Stage network

# Skip GUI installer
.\scripts\bootstrap-all.ps1 -SkipGUI
```

### Service Management

```powershell
# Start all services (Orchestrator)
cd orchestrator-mini\docker
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart gitea

# Check service status
docker-compose ps
```

### Backup and Recovery

```powershell
# Full backup
.\shared\scripts\backup-system.ps1 -BackupType full

# Incremental backup
.\shared\scripts\backup-system.ps1 -BackupType incremental

# Configuration only
.\shared\scripts\backup-system.ps1 -BackupType config-only

# With remote sync
.\shared\scripts\backup-system.ps1 -RemoteBackupPath "\\nas\backups"
```

### Health Monitoring

```powershell
# One-time health check
.\shared\scripts\health-check.ps1

# Continuous monitoring
.\shared\scripts\health-check.ps1 -Continuous -IntervalSeconds 60

# With detailed report
.\shared\scripts\health-check.ps1 -DetailedReport

# With webhook alerts
.\shared\scripts\health-check.ps1 -SendAlerts -WebhookUrl "https://hooks.slack.com/..."
```

## Configuration

### Network Configuration

All PCs must be on the same network with static IPs or DHCP reservations:

- Orchestrator-Mini: 192.168.1.10
- Worker-RTX3090Ti: 192.168.1.11
- Worker-RTX3060: 192.168.1.12
- Worker-RTX5090: 192.168.1.13

DNS entries are automatically added to the hosts file during bootstrap.

### WSL Configuration

WSL2 is configured with:
- Memory: 16GB (configurable)
- Processors: 8 cores (configurable)
- Networking: Mirrored mode
- Docker integration enabled

Configuration file: `%USERPROFILE%\.wslconfig`

### Docker Configuration

Docker networks:
- `nyra-network` - Bridge network for all services
- Subnet: 172.20.0.0/16

GPU support:
- NVIDIA Docker runtime
- GPU capabilities: compute, utility
- Device exposure for ML workloads

## Monitoring and Alerting

### Prometheus Metrics

- **Node Exporter**: System metrics (CPU, memory, disk, network)
- **cAdvisor**: Container metrics
- **NVIDIA GPU Exporter**: GPU metrics (temperature, memory, utilization)
- **Service Metrics**: Application-specific metrics

### Grafana Dashboards

Pre-configured dashboards:
- Cluster Overview
- Per-PC System Metrics
- GPU Performance
- Container Resources
- Service Health

Access: http://orchestrator-mini:3001
Default credentials: admin / admin

### Alert Rules

Alerts are configured for:
- PC down (critical)
- High CPU usage (>85%)
- High memory usage (>90%)
- Disk space low (<15%)
- GPU temperature high (>85°C)
- Service down
- Container restarting

## Security

### SSL/TLS

- Self-signed certificates generated during bootstrap
- Traefik handles SSL termination
- Certificate location: `orchestrator-mini/config/certs`

### Authentication

- Gitea: Local authentication, OAuth2 support
- Grafana: Admin credentials configurable
- Traefik: Dashboard protected by IP whitelist
- Portainer: Local authentication

### Firewall

Windows Firewall rules are automatically configured for:
- Docker services
- WSL2 networking
- Inter-PC communication

### Secrets Management

Secrets stored in:
- Docker secrets (for swarm mode)
- Environment variables (for compose mode)
- Gitea secrets (for CI/CD)

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed troubleshooting guide.

### Common Issues

#### PC Not Reachable
```powershell
# Check network connectivity
Test-Connection -ComputerName 192.168.1.11

# Verify hosts file
Get-Content C:\Windows\System32\drivers\etc\hosts

# Restart networking
Restart-Service -Name "Dhcp"
```

#### Docker Service Won't Start
```powershell
# Check Docker status
docker ps

# Restart Docker Desktop
Restart-Service com.docker.service

# Check WSL status
wsl --status
wsl --shutdown
```

#### WSL Issues
```powershell
# Check WSL status
wsl --list --verbose

# Restart WSL
wsl --shutdown

# Reinstall distribution
wsl --unregister Ubuntu-24.04
.\orchestrator-mini\wsl\setup-wsl.ps1
```

## Maintenance

### Regular Tasks

**Daily:**
- Monitor Grafana dashboards
- Check service health
- Review logs for errors

**Weekly:**
- Run health check validation
- Review backup status
- Update Docker images

**Monthly:**
- Full system backup
- Security updates
- Review and rotate logs

### Updates

```powershell
# Update bootstrap package
.\scripts\update-bootstrap.ps1

# Update Docker images
docker-compose pull
docker-compose up -d

# Update WSL distribution
wsl --update
```

## Support

- **Documentation**: See `docs/` directory
- **Issues**: Create tickets in Gitea
- **Logs**: Check `logs/` directory on each PC

## License

Internal use only - Project-Nyra

## Version

Bootstrap Package: v1.0.0
Last Updated: 2024-12-31
