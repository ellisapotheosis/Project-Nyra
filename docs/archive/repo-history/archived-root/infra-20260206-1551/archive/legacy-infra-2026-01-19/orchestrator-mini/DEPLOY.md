# PC1 (Orchestrator Mini) - Deployment Guide

**Role**: Central Orchestrator & Coordination Layer
**Hardware**: Mini PC, 16GB RAM, No GPU
**Operation**: 24/7 Always-On
**Updated**: 2026-01-18

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Hardware Specifications](#hardware-specifications)
3. [Prerequisites](#prerequisites)
4. [Service Architecture](#service-architecture)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [24/7 Operations](#247-operations)
8. [Resource Management](#resource-management)
9. [Backup Procedures](#backup-procedures)
10. [Health Checks](#health-checks)
11. [Troubleshooting](#troubleshooting)
12. [Security Hardening](#security-hardening)

---

## 🎯 Overview

PC1 serves as the **central orchestrator** for Project Nyra's 4-PC distributed architecture:
- **No GPU workloads** - All AI inference routes to GPU workers (PC2, PC3, PC4)
- **Coordination hub** - Runs MCP servers, databases, message queues
- **Always-on** - 24/7 operation with automatic restart on failure
- **Network coordinator** - Manages routing to GPU workers

### Key Responsibilities
- PostgreSQL database (pgvector, multiple DBs)
- Redis caching and message queues
- Vector databases (Qdrant, FalkorDB)
- MCP server coordination (Nexus Router)
- Workflow orchestration (Claude Flow, Archon OS, Letta)
- Monitoring stack (Prometheus, Grafana, Loki, Tempo)
- n8n workflow automation

---

## 🖥️ Hardware Specifications

### Minimum Requirements
| Component | Specification | Notes |
|-----------|---------------|-------|
| **CPU** | 4+ cores | Intel/AMD x86_64 |
| **RAM** | 16GB | 32GB recommended |
| **Storage** | 256GB SSD | 512GB+ for production |
| **Network** | Gigabit Ethernet | 2.5G+ recommended |
| **GPU** | None | Routes to workers |

### Validated Hardware
- **Intel NUC 11/12/13** (Recommended)
- **Beelink Mini PC** (Good value)
- **Minisforum EliteMini** (High-end option)

### Storage Layout
```
/dev/sda1 - OS (Ubuntu 22.04 LTS)           50GB
/dev/sda2 - Docker volumes                  150GB
/dev/sda3 - Backups & logs                  50GB
Swap                                        8GB
```

---

## ✅ Prerequisites

### 1. Operating System
```bash
# Ubuntu 22.04 LTS (Recommended)
cat /etc/os-release

# Update system
sudo apt update && sudo apt upgrade -y
```

### 2. Docker Installation
```bash
# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 3. Network Configuration
```bash
# Set static IP (example: 192.168.1.10)
sudo nano /etc/netplan/00-installer-config.yaml
```

Example static IP configuration:
```yaml
network:
  version: 2
  ethernets:
    enp1s0:
      dhcp4: no
      addresses: [192.168.1.10/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 1.1.1.1]
```

Apply configuration:
```bash
sudo netplan apply
ip addr show
```

### 4. Firewall Configuration
```bash
# Allow required ports
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 5432/tcp    # PostgreSQL
sudo ufw allow 6379/tcp    # Redis
sudo ufw allow 6333/tcp    # Qdrant
sudo ufw allow 8283/tcp    # Letta
sudo ufw allow 5678/tcp    # n8n
sudo ufw allow 3000/tcp    # Grafana
sudo ufw allow 9090/tcp    # Prometheus
sudo ufw enable
```

---

## 🏗️ Service Architecture

### Core Services (Always Running)

#### Database Layer
```
PostgreSQL (port 5432)
  ├── nyra (main database)
  ├── letta_db (memory management)
  ├── twenty_db (CRM)
  ├── dify_db (AI workflows)
  └── n8n_db (automation)

Redis (port 6379)
  ├── Session storage
  ├── Message queues
  ├── Cache layer
  └── Rate limiting
```

#### Vector & Graph Databases
```
Qdrant (port 6333)
  └── Embedding storage (384/768/1536 dimensions)

FalkorDB (port 6380)
  └── Temporal knowledge graphs (Redis-compatible)
```

#### Orchestration Services
```
Claude Flow (port 3200)
  └── Multi-agent workflow orchestration

Archon OS (port 3201)
  └── Agent task management

Nexus Router (port 3300)
  ├── Intelligent LLM routing
  ├── GPU worker coordination
  └── Cloud API fallback

Letta (port 8283)
  └── OS-like agent memory
```

#### Workflow Automation
```
n8n (port 5678)
  └── Visual workflow builder
```

#### Monitoring Stack
```
Grafana (port 3000)
  └── Visualization dashboards

Prometheus (port 9090)
  └── Metrics collection

Loki (port 3100)
  └── Log aggregation

Tempo (port 3200)
  └── Distributed tracing
```

### Resource Allocation (16GB RAM Total)
| Service | RAM Limit | CPU Limit | Priority |
|---------|-----------|-----------|----------|
| PostgreSQL | 2GB | 2.0 | Critical |
| Redis | 1GB | 1.0 | Critical |
| Qdrant | 2GB | 1.0 | High |
| FalkorDB | 1GB | 0.5 | High |
| Claude Flow | 1.5GB | 1.0 | High |
| Nexus Router | 1GB | 1.0 | High |
| Letta | 1.5GB | 1.0 | Medium |
| n8n | 1GB | 0.5 | Medium |
| Prometheus | 1.5GB | 0.5 | Medium |
| Grafana | 512MB | 0.5 | Low |
| Other services | 3.5GB | - | - |

---

## 🚀 Installation

### 1. Clone Repository
```bash
cd /opt
sudo git clone https://github.com/your-org/Project-Nyra.git
cd Project-Nyra/infra/orchestrator-mini
```

### 2. Configure Environment
```bash
# Copy example environment file
cp ../../docker/.env.example .env

# Edit environment variables
nano .env
```

**Critical variables to set**:
```bash
# Database
POSTGRES_USER=nyra_admin
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=nyra

# Redis
REDIS_PASSWORD=<strong-password>

# API Keys (for Nexus Router fallback)
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

# Worker URLs
WORKER_5090_URL=http://192.168.1.13:11434
WORKER_3090_URL=http://192.168.1.14:11434
WORKER_3060_URL=http://192.168.1.12:11434
```

### 3. Create Data Directories
```bash
sudo mkdir -p /opt/nyra-data/{postgres,redis,qdrant,falkordb,letta,n8n,monitoring}
sudo chown -R $USER:$USER /opt/nyra-data
```

### 4. Start Services
```bash
# Start orchestration stack
docker compose -f ../../docker/docker-compose.orchestration.yml up -d

# Start monitoring stack
docker compose -f ../../docker/docker-compose.monitoring.yml up -d

# Verify services
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## ⚙️ Configuration

### PostgreSQL Optimization (16GB RAM)
Create `/opt/nyra-data/postgres/postgresql.conf`:
```conf
# Memory Configuration
shared_buffers = 2GB
effective_cache_size = 4GB
maintenance_work_mem = 512MB
work_mem = 32MB

# Connection Settings
max_connections = 100

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200

# WAL Configuration
wal_buffers = 16MB
checkpoint_completion_target = 0.9
```

### Redis Configuration
Create `/opt/nyra-data/redis/redis.conf`:
```conf
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Nexus Router Configuration
Configure GPU worker endpoints in `.env`:
```bash
# Worker Configuration (edit IPs to match your network)
WORKER_5090_URL=http://192.168.1.13:11434
WORKER_5090_MODELS=llama3.1:70b,mixtral:8x7b,deepseek-coder

WORKER_3090_URL=http://192.168.1.14:11434
WORKER_3090_MODELS=llama3.1:70b,codellama:34b

WORKER_3060_URL=http://192.168.1.12:11434
WORKER_3060_MODELS=llama3.1:8b,mistral:7b,phi3

# Routing Strategy
MODEL_ROUTING_STRATEGY=intelligent
MODEL_ROUTING_PREFER_LOCAL=true
MODEL_ROUTING_FALLBACK_CLOUD=true
MODEL_ROUTING_COST_THRESHOLD=0.10
```

---

## 🔄 24/7 Operations

### Systemd Service Setup

Create `/etc/systemd/system/nyra-orchestrator.service`:
```ini
[Unit]
Description=Project Nyra Orchestrator Stack
After=network-online.target docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/Project-Nyra/infra/docker
ExecStart=/usr/bin/docker compose -f docker-compose.orchestration.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.orchestration.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable nyra-orchestrator.service
sudo systemctl start nyra-orchestrator.service
sudo systemctl status nyra-orchestrator.service
```

### Auto-Restart Configuration

Add restart policies to docker-compose.yml:
```yaml
services:
  postgres:
    restart: unless-stopped
    deploy:
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

### Automatic System Updates
```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades

# Enable automatic security updates only
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Log Rotation
Create `/etc/logrotate.d/nyra`:
```
/opt/nyra-data/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 docker docker
    sharedscripts
    postrotate
        docker kill -s USR1 $(docker ps -q)
    endscript
}
```

---

## 📊 Resource Management

### Monitor Resource Usage
```bash
# Check container resources
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Check disk usage
df -h /opt/nyra-data
du -sh /opt/nyra-data/*

# Check system resources
htop
```

### Set Resource Limits
Add to docker-compose.yml:
```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1.5G
```

### Cleanup Scripts
Create `/opt/Project-Nyra/infra/orchestrator-mini/scripts/cleanup.sh`:
```bash
#!/bin/bash
# Daily cleanup script

# Remove old logs (older than 30 days)
find /opt/nyra-data/logs -type f -mtime +30 -delete

# Clean Docker
docker system prune -af --volumes --filter "until=168h"

# Vacuum PostgreSQL
docker exec nyra-postgres psql -U nyra_admin -d nyra -c "VACUUM ANALYZE;"

echo "Cleanup completed: $(date)"
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /opt/Project-Nyra/infra/orchestrator-mini/scripts/cleanup.sh >> /var/log/nyra-cleanup.log 2>&1
```

---

## 💾 Backup Procedures

### Automated Backup Script
Create `/opt/Project-Nyra/infra/orchestrator-mini/scripts/backup.sh`:
```bash
#!/bin/bash
set -e

BACKUP_DIR="/opt/nyra-data/backups/$(date +%Y-%m-%d)"
mkdir -p $BACKUP_DIR

echo "Starting backup: $(date)"

# PostgreSQL backup (all databases)
docker exec nyra-postgres pg_dumpall -U nyra_admin | gzip > $BACKUP_DIR/postgres-all.sql.gz

# Redis backup
docker exec nyra-redis redis-cli --rdb /data/dump.rdb save
docker cp nyra-redis:/data/dump.rdb $BACKUP_DIR/redis-dump.rdb

# Qdrant backup
docker exec nyra-qdrant curl -X POST http://localhost:6333/collections/*/snapshots
# Copy snapshots (adjust collection names)

# Environment files
cp /opt/Project-Nyra/infra/docker/.env $BACKUP_DIR/env-backup

# Compress backup
tar -czf $BACKUP_DIR.tar.gz -C /opt/nyra-data/backups $(basename $BACKUP_DIR)
rm -rf $BACKUP_DIR

# Remove old backups (keep 30 days)
find /opt/nyra-data/backups -type f -mtime +30 -delete

echo "Backup completed: $(date)"
echo "Backup size: $(du -h $BACKUP_DIR.tar.gz | cut -f1)"
```

Make executable and schedule:
```bash
chmod +x scripts/backup.sh

# Daily at 3 AM
crontab -e
# Add: 0 3 * * * /opt/Project-Nyra/infra/orchestrator-mini/scripts/backup.sh >> /var/log/nyra-backup.log 2>&1
```

### Offsite Backup (Rclone to Cloud)
```bash
# Install rclone
sudo apt install rclone

# Configure remote (interactive)
rclone config

# Sync backups to cloud
rclone sync /opt/nyra-data/backups remote:nyra-backups --progress
```

---

## 🏥 Health Checks

### Health Check Script
Create `/opt/Project-Nyra/infra/orchestrator-mini/scripts/healthcheck.sh`:
```bash
#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "=== Project Nyra PC1 Health Check ==="
echo "Timestamp: $(date)"
echo ""

# Check Docker
if systemctl is-active --quiet docker; then
    echo -e "${GREEN}✓${NC} Docker is running"
else
    echo -e "${RED}✗${NC} Docker is not running"
fi

# Check critical services
SERVICES=("nyra-postgres" "nyra-redis" "nyra-qdrant" "nyra-claude-flow" "nyra-nexus-router")

for service in "${SERVICES[@]}"; do
    if docker ps --filter "name=$service" --filter "status=running" | grep -q $service; then
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $service 2>/dev/null)
        if [ "$HEALTH" == "healthy" ] || [ -z "$HEALTH" ]; then
            echo -e "${GREEN}✓${NC} $service is running"
        else
            echo -e "${RED}✗${NC} $service is unhealthy: $HEALTH"
        fi
    else
        echo -e "${RED}✗${NC} $service is not running"
    fi
done

# Check disk space
DISK_USAGE=$(df -h /opt/nyra-data | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}✓${NC} Disk usage: ${DISK_USAGE}%"
else
    echo -e "${RED}✗${NC} Disk usage critical: ${DISK_USAGE}%"
fi

# Check memory
MEM_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
if [ $MEM_USAGE -lt 90 ]; then
    echo -e "${GREEN}✓${NC} Memory usage: ${MEM_USAGE}%"
else
    echo -e "${RED}✗${NC} Memory usage critical: ${MEM_USAGE}%"
fi

# Check network connectivity to workers
WORKERS=("192.168.1.12" "192.168.1.13" "192.168.1.14")
for worker in "${WORKERS[@]}"; do
    if ping -c 1 -W 2 $worker > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Worker $worker is reachable"
    else
        echo -e "${RED}✗${NC} Worker $worker is unreachable"
    fi
done

echo ""
echo "Health check completed."
```

Run health check:
```bash
chmod +x scripts/healthcheck.sh
./scripts/healthcheck.sh
```

### Prometheus Alerting
Configure alerts in `/opt/Project-Nyra/infra/monitoring/prometheus/alerts/orchestrator.yml`:
```yaml
groups:
  - name: orchestrator_alerts
    interval: 30s
    rules:
      - alert: HighMemoryUsage
        expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) < 0.10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage on PC1"
          description: "Memory usage is above 90%"

      - alert: PostgreSQLDown
        expr: up{job="postgres"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"

      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
```

---

## 🔧 Troubleshooting

### Common Issues

#### PostgreSQL Connection Issues
```bash
# Check PostgreSQL logs
docker logs nyra-postgres --tail 100

# Test connection
docker exec nyra-postgres psql -U nyra_admin -d nyra -c "SELECT version();"

# Check active connections
docker exec nyra-postgres psql -U nyra_admin -d nyra -c "SELECT count(*) FROM pg_stat_activity;"
```

#### Redis Connection Issues
```bash
# Check Redis logs
docker logs nyra-redis --tail 100

# Test connection
docker exec nyra-redis redis-cli -a <password> PING

# Check memory usage
docker exec nyra-redis redis-cli -a <password> INFO MEMORY
```

#### Service Won't Start
```bash
# Check logs
docker compose -f ../../docker/docker-compose.orchestration.yml logs <service-name>

# Check resource constraints
docker stats --no-stream

# Restart service
docker compose -f ../../docker/docker-compose.orchestration.yml restart <service-name>
```

#### Network Connectivity Issues
```bash
# Check Docker network
docker network inspect nyra-network

# Test connectivity between containers
docker exec nyra-nexus-router ping nyra-postgres

# Check firewall
sudo ufw status
```

### Emergency Recovery

#### Full Stack Restart
```bash
cd /opt/Project-Nyra/infra/docker
docker compose -f docker-compose.orchestration.yml down
docker compose -f docker-compose.monitoring.yml down
# Wait 10 seconds
docker compose -f docker-compose.orchestration.yml up -d
docker compose -f docker-compose.monitoring.yml up -d
```

#### Database Recovery from Backup
```bash
# Stop services
docker compose -f docker-compose.orchestration.yml stop

# Restore PostgreSQL
gunzip < /opt/nyra-data/backups/2026-01-18.tar.gz | docker exec -i nyra-postgres psql -U nyra_admin

# Restore Redis
docker cp /opt/nyra-data/backups/redis-dump.rdb nyra-redis:/data/dump.rdb
docker restart nyra-redis

# Start services
docker compose -f docker-compose.orchestration.yml start
```

---

## 🔒 Security Hardening

### 1. Firewall Configuration (UFW)
```bash
# Reset firewall
sudo ufw --force reset

# Default deny
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (limit brute force)
sudo ufw limit 22/tcp

# Allow services only from local network
sudo ufw allow from 192.168.1.0/24 to any port 5432 proto tcp  # PostgreSQL
sudo ufw allow from 192.168.1.0/24 to any port 6379 proto tcp  # Redis
sudo ufw allow from 192.168.1.0/24 to any port 6333 proto tcp  # Qdrant

# Allow monitoring access
sudo ufw allow from 192.168.1.0/24 to any port 3000 proto tcp  # Grafana
sudo ufw allow from 192.168.1.0/24 to any port 9090 proto tcp  # Prometheus

# Enable firewall
sudo ufw enable
sudo ufw status numbered
```

### 2. SSH Hardening
Edit `/etc/ssh/sshd_config`:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

Restart SSH:
```bash
sudo systemctl restart ssh
```

### 3. Fail2Ban Setup
```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Enable services
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Docker Security
Edit `/etc/docker/daemon.json`:
```json
{
  "userns-remap": "default",
  "no-new-privileges": true,
  "live-restore": true,
  "userland-proxy": false
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### 5. Secrets Management
```bash
# Use Docker secrets for sensitive data
echo "my-secret-password" | docker secret create postgres_password -

# Reference in docker-compose.yml
secrets:
  postgres_password:
    external: true
```

### 6. Regular Security Updates
```bash
# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Manual update check
sudo apt update && sudo apt list --upgradable
```

---

## 📈 Monitoring & Dashboards

### Access Grafana
```
URL: http://<PC1-IP>:3000
Default: admin/admin (change on first login)
```

**Pre-built dashboards**:
- **System Overview**: CPU, memory, disk, network
- **Docker Metrics**: Container resources, health
- **PostgreSQL**: Connections, queries, performance
- **Redis**: Memory, commands, latency
- **Nexus Router**: Request routing, worker status

### Prometheus Metrics
```
URL: http://<PC1-IP>:9090
```

**Key metrics to monitor**:
- `node_memory_MemAvailable_bytes`
- `container_cpu_usage_seconds_total`
- `postgres_up`
- `redis_up`
- `docker_container_health_status`

---

## 📝 Maintenance Checklist

### Daily
- [ ] Check health status: `./scripts/healthcheck.sh`
- [ ] Review Grafana dashboards
- [ ] Check disk space: `df -h`

### Weekly
- [ ] Review logs for errors: `docker compose logs --tail=1000`
- [ ] Check Docker resource usage: `docker stats`
- [ ] Verify backups exist and are valid
- [ ] Review Prometheus alerts

### Monthly
- [ ] Update Docker images: `docker compose pull && docker compose up -d`
- [ ] Review and rotate logs
- [ ] Test backup restoration
- [ ] Review and update firewall rules
- [ ] Check for system updates: `sudo apt update && apt list --upgradable`

### Quarterly
- [ ] Full system backup verification
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Update documentation

---

## 📚 Additional Resources

- **Project Nyra Architecture**: `../../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md`
- **Docker Compose Reference**: `../../docker/docker-compose.orchestration.yml`
- **Monitoring Setup**: `../../docs/deployment/MONITORING-SETUP.md`
- **Security Guide**: `../../docs/security/INFRASTRUCTURE-SECURITY-AUDIT.md`

---

**Document Version**: 1.0
**Last Updated**: 2026-01-18
**Maintained By**: Project Nyra Infrastructure Team
