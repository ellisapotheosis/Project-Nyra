# Docker Infrastructure Documentation

Complete Docker infrastructure for a distributed AI orchestration system with 4 PCs: 1 orchestrator and 3 GPU workers.

## Architecture Overview

### Orchestrator-Mini (1 PC)
Central management and UI services:
- PostgreSQL 16 (database)
- Redis 7 (cache)
- MinIO (S3-compatible storage)
- Open-WebUI (port 3000)
- LobeChat (port 3210)
- Nginx (reverse proxy)
- Prometheus + Grafana (monitoring)
- Infisical (secrets management)

### GPU Workers (3 PCs)
LLM inference and processing:
- Ollama (port 11434) with GPU passthrough
- vLLM (optional, port 8000)
- NVIDIA GPU monitoring
- Local Prometheus + Grafana
- Redis cache

### WSL (Separate)
Development and version control:
- Gitea (Git service)
- Gitea Actions Runner

## Quick Start

### Prerequisites

1. **Install Docker Desktop** (Windows with WSL2)
   ```powershell
   # Download from https://www.docker.com/products/docker-desktop
   ```

2. **Install NVIDIA Container Toolkit** (for GPU workers)
   ```bash
   # In WSL2
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
   curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
   sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
   sudo systemctl restart docker
   ```

3. **Verify GPU Access**
   ```bash
   docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi
   ```

### Directory Structure

```
docker/
├── orchestrator/           # Orchestrator services
│   ├── docker-compose.yml
│   ├── .env.example
│   └── configs/
├── worker/                 # GPU worker services
│   ├── docker-compose.yml
│   ├── .env.example
│   └── configs/
├── dev/                    # Development environment
│   └── docker-compose.dev.yml
├── prod/                   # Production environment
│   └── docker-compose.prod.yml
├── wsl/                    # WSL services (Gitea)
│   └── docker-compose.gitea.yml
├── dockerfiles/            # Custom Dockerfiles
│   ├── Dockerfile.prod
│   ├── Dockerfile.dev
│   └── Dockerfile.backup
├── configs/                # Service configurations
│   ├── postgres/
│   ├── redis/
│   ├── nginx/
│   ├── prometheus/
│   ├── grafana/
│   └── ollama/
└── scripts/                # Management scripts
    ├── start-orchestrator.ps1
    ├── start-worker.ps1
    ├── health-check.ps1
    └── backup-volumes.ps1
```

## Deployment

### 1. Setup Orchestrator

```powershell
# Navigate to orchestrator directory
cd C:\Users\edane\docker\orchestrator

# Copy environment template
Copy-Item .env.example .env

# Edit .env with your configuration
notepad .env

# Start services
..\scripts\start-orchestrator.ps1
```

### 2. Setup GPU Workers

```powershell
# On each worker PC
cd C:\Users\edane\docker\worker

# Copy environment template
Copy-Item .env.example .env

# Edit .env (set WORKER_ID=1, 2, or 3)
notepad .env

# Start services
..\scripts\start-worker.ps1 -WorkerID 1
```

### 3. Setup Gitea (WSL)

```bash
# In WSL
cd /mnt/c/Users/edane/docker/wsl

# Copy environment template
cp .env.example .env

# Edit .env
nano .env

# Start Gitea
docker-compose -f docker-compose.gitea.yml up -d
```

## Management Scripts

### Start Orchestrator
```powershell
.\scripts\start-orchestrator.ps1 [-Force] [-Build] [-Logs]
```

Options:
- `-Force` - Stop existing services before starting
- `-Build` - Rebuild images before starting
- `-Logs` - Show logs after starting

### Start Worker
```powershell
.\scripts\start-worker.ps1 [-WorkerID <1-3>] [-EnableVLLM] [-Force] [-Build] [-Logs]
```

Options:
- `-WorkerID` - Worker identifier (1, 2, or 3)
- `-EnableVLLM` - Start vLLM service
- `-Force` - Stop existing services before starting
- `-Build` - Rebuild images before starting
- `-Logs` - Show logs after starting

### Health Check
```powershell
.\scripts\health-check.ps1 [-Orchestrator] [-Worker] [-All] [-Json] [-Verbose]
```

Options:
- `-Orchestrator` - Check orchestrator services only
- `-Worker` - Check worker services only
- `-All` - Check all services
- `-Json` - Output in JSON format
- `-Verbose` - Show detailed information

### Backup Volumes
```powershell
.\scripts\backup-volumes.ps1 [-BackupDir <path>] [-Orchestrator] [-Worker] [-All] [-RetentionDays <days>]
```

Options:
- `-BackupDir` - Backup directory (default: C:\Backups\docker)
- `-Orchestrator` - Backup orchestrator volumes only
- `-Worker` - Backup worker volumes only
- `-All` - Backup all volumes
- `-RetentionDays` - Number of days to keep backups (default: 30)

## Service Access

### Orchestrator Services
- **Open-WebUI**: http://localhost:3000
- **LobeChat**: http://localhost:3210
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **MinIO Console**: http://localhost:9001
- **Infisical**: http://localhost:8080
- **Nginx**: http://localhost

### Worker Services
- **Ollama API**: http://localhost:11434
- **vLLM API**: http://localhost:8000 (if enabled)
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **NVIDIA Metrics**: http://localhost:9835/metrics

### Gitea (WSL)
- **Web UI**: http://localhost:3000
- **SSH**: ssh://localhost:2222

## Configuration Files

### PostgreSQL
- `configs/postgres/init.sql` - Database initialization
- `configs/postgres/postgresql.conf` - PostgreSQL settings

### Redis
- `configs/redis/redis.conf` - Redis configuration

### Nginx
- `configs/nginx/nginx.conf` - Main configuration
- `configs/nginx/conf.d/` - Site configurations

### Prometheus
- `configs/prometheus/prometheus.yml` - Orchestrator monitoring
- `configs/prometheus/prometheus-worker.yml` - Worker monitoring

### Ollama
- `configs/ollama/config.json` - LLM runtime settings

## Resource Limits

### Orchestrator Services
| Service | CPU | Memory | Notes |
|---------|-----|--------|-------|
| PostgreSQL | 2 cores | 4 GB | Can increase for heavy loads |
| Redis | 1 core | 2 GB | Cache size configurable |
| MinIO | 2 cores | 4 GB | Storage service |
| Open-WebUI | 2 cores | 4 GB | Main UI |
| Grafana | 1 core | 2 GB | Monitoring |
| Prometheus | 2 cores | 4 GB | Metrics storage |

### Worker Services
| Service | CPU | Memory | GPU | Notes |
|---------|-----|--------|-----|-------|
| Ollama | 8 cores | 32 GB | All | Main LLM runtime |
| vLLM | 12 cores | 48 GB | All | High-performance inference |
| Prometheus | 2 cores | 4 GB | - | Local metrics |

## Troubleshooting

### Container won't start
```powershell
# Check logs
docker-compose logs <service-name>

# Check container status
docker ps -a

# Restart service
docker-compose restart <service-name>
```

### GPU not detected in Ollama
```powershell
# Verify NVIDIA drivers
nvidia-smi

# Check Docker GPU access
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi

# Restart Docker Desktop
```

### Port conflicts
```powershell
# Find process using port
netstat -ano | findstr :<port>

# Kill process
taskkill /PID <process_id> /F
```

### Out of memory
```powershell
# Check Docker resources
docker system df

# Clean up unused resources
docker system prune -a

# Increase Docker Desktop memory limit
# Settings > Resources > Advanced > Memory
```

## Maintenance

### Update Images
```powershell
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f <service-name>

# Last 100 lines
docker-compose logs --tail=100
```

### Cleanup
```powershell
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Clean up Docker
docker system prune -a --volumes
```

## Backup and Restore

### Manual Backup
```powershell
# Backup all volumes
.\scripts\backup-volumes.ps1 -All

# Backup orchestrator only
.\scripts\backup-volumes.ps1 -Orchestrator

# Backup to custom location
.\scripts\backup-volumes.ps1 -BackupDir "D:\Backups"
```

### Restore from Backup
```bash
# Stop services
docker-compose down

# Restore volume
docker run --rm -v <volume_name>:/target -v <backup_path>:/backup alpine sh -c "cd /target && tar xzf /backup/<backup_file>.tar.gz"

# Start services
docker-compose up -d
```

## Security Considerations

1. **Change Default Passwords**
   - Update all passwords in `.env` files
   - Use strong, unique passwords
   - Store credentials securely (use Infisical)

2. **Enable SSL/TLS**
   - Configure SSL certificates in Nginx
   - Update `nginx.conf` to enable HTTPS
   - Use Let's Encrypt for free certificates

3. **Network Security**
   - Configure firewall rules
   - Use Docker networks for isolation
   - Restrict external access

4. **Regular Updates**
   - Keep Docker images updated
   - Apply security patches
   - Monitor CVE databases

## Performance Tuning

### PostgreSQL
- Adjust `shared_buffers` based on available RAM
- Tune `work_mem` for complex queries
- Configure connection pooling

### Redis
- Set appropriate `maxmemory` limit
- Choose eviction policy (e.g., `allkeys-lru`)
- Enable persistence if needed

### Ollama
- Adjust `OLLAMA_NUM_PARALLEL` for concurrent requests
- Set `OLLAMA_MAX_LOADED_MODELS` based on GPU memory
- Enable `OLLAMA_FLASH_ATTENTION` for better performance

## Support

For issues and questions:
1. Check logs: `docker-compose logs <service>`
2. Run health check: `.\scripts\health-check.ps1 -Verbose`
3. Review service documentation
4. Check Docker Desktop status

## License

This infrastructure configuration is provided as-is for the distributed AI orchestration system.
