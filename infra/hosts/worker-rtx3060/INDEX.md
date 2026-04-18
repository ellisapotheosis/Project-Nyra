# Worker-3060 Setup Package - File Index

Complete setup package for RTX 3060 GPU Worker in Project Nyra infrastructure.

## 📁 Directory Structure

```
worker-3060/
├── README.md                          # Comprehensive documentation
├── QUICKSTART.md                      # Quick setup guide (30 min)
├── TROUBLESHOOTING.md                 # Common issues and solutions
├── INDEX.md                           # This file - complete file listing
│
├── setup-worker-3060.ps1              # Main setup script (PowerShell)
├── start.ps1                          # Start all services
├── stop.ps1                           # Stop all services
├── health-check.ps1                   # Health monitoring script
├── test.ps1                           # Integration test suite
│
├── docker-compose.worker-3060.yml     # Docker Compose configuration
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
│
├── cloudflared-config.yml             # Cloudflare tunnel configuration
├── grafana-dashboard.json             # Grafana monitoring dashboard
│
├── embedding-service/                 # Xenova/transformers embedding service
│   ├── Dockerfile                     # Embedding service container
│   ├── package.json                   # Node.js dependencies
│   ├── requirements.txt               # Python dependencies
│   └── server.js                      # Embedding API server
│
└── health-monitor/                    # Service health monitoring
    ├── Dockerfile                     # Health monitor container
    ├── package.json                   # Node.js dependencies
    └── monitor.js                     # Health monitoring API
```

## 📄 File Descriptions

### Core Setup Files

#### `setup-worker-3060.ps1` (Main Setup Script)
- **Purpose**: Automated installation of all dependencies
- **Runtime**: 20-45 minutes
- **Installs**:
  - Chocolatey package manager
  - NVIDIA drivers and CUDA 12.4
  - Docker Desktop with GPU support
  - Ollama with 3 models (CodeLlama 34B, Qwen 2 32B, Gemma 2 27B)
  - Infisical CLI for secrets management
  - Tailscale VPN
  - Cloudflared tunnel
  - Node.js and Python
- **Validation**: Built-in health checks and system validation
- **Logs**: Creates `setup.log` with detailed progress

#### `docker-compose.worker-3060.yml` (Service Orchestration)
- **Purpose**: Defines all Docker services and their configuration
- **Services**:
  1. **ollama**: Primary LLM service (port 11434)
  2. **embedding-service**: Xenova/transformers embeddings (port 8080)
  3. **health-monitor**: Service monitoring (port 9090)
  4. **redis**: Inference caching (port 6379)
  5. **node-exporter**: System metrics (port 9100)
  7. **gpu-exporter**: GPU metrics (port 9445)
- **Networks**: Isolated `worker-network` (172.30.0.0/24)
- **Volumes**: Persistent storage for models, cache, and data

#### `.env.example` (Configuration Template)
- **Purpose**: Environment variable template
- **Sections**:
  - Worker identity and GPU specs
  - Ollama configuration
  - CUDA settings
  - Network endpoints (Tailscale, Nexus Router)
  - Infisical secrets management
  - Cloudflare tunnel credentials
  - Performance tuning parameters
  - Security settings
  - Feature flags
- **Usage**: Copy to `.env` and fill in your values

### Documentation

#### `README.md` (Complete Documentation)
- **Sections**:
  - Overview and hardware specs
  - Quick start guide
  - Architecture diagram
  - Service details and API endpoints
  - Model information and performance benchmarks
  - Networking setup (Tailscale, Cloudflare)
  - Monitoring with Prometheus/Grafana
  - Maintenance procedures
  - Integration with Project Nyra
  - Performance benchmarks
- **Length**: ~15 pages of comprehensive documentation

#### `QUICKSTART.md` (Fast Setup Guide)
- **Purpose**: Get running in under 30 minutes
- **Steps**:
  1. Run setup script (20-45 min)
  2. Restart computer
  3. Authenticate services (Infisical, Tailscale)
  4. Start services
  5. Verify health
  6. Test endpoints
- **Includes**: Quick commands cheat sheet and troubleshooting

#### `TROUBLESHOOTING.md` (Problem Solving Guide)
- **Categories**:
  - Installation issues
  - Docker problems
  - GPU errors
  - Ollama failures
  - Network connectivity
  - Performance optimization
  - Service crashes
- **Format**: Problem → Solution with PowerShell commands
- **Length**: ~20 common issues with detailed solutions

### Operational Scripts

#### `start.ps1` (Service Starter)
- **Purpose**: Start all services with health checks
- **Actions**:
  1. Verify Docker is running
  2. Start Ollama service
  3. Check Tailscale connection
  4. Start Docker Compose services
  5. Wait for services to be healthy (30s)
  6. Run health check
  7. Display access URLs

#### `stop.ps1` (Service Stopper)
- **Purpose**: Gracefully stop all services
- **Actions**:
  1. Stop Docker Compose services
  2. Optionally stop Ollama
  3. Preserve data and state

#### `health-check.ps1` (Health Monitor)
- **Purpose**: Comprehensive system health report
- **Checks**:
  - GPU status (temperature, utilization, VRAM)
  - Docker service status
  - Ollama model availability
  - Network connectivity (Tailscale, Internet, Cloudflare)
  - System resources (CPU, RAM, disk)
  - Container statistics
  - Recent error logs
- **Output**: Colored status report with recommendations

#### `test.ps1` (Integration Tests)
- **Purpose**: Automated testing of all endpoints
- **Tests**:
  - GPU detection via nvidia-smi
  - Ollama API (version, models, generation)
  - Embedding service (health, generation, similarity)
  - Health monitor endpoints
  - Redis (ping, set/get)
  - Network (Tailscale, Internet)
  - Docker containers
- **Output**: Pass/fail report with detailed results
- **Saves**: `test-results.json` for analysis

### Service Configurations

#### `cloudflared-config.yml` (Cloudflare Tunnel)
- **Purpose**: Expose services via Cloudflare tunnel
- **Ingress Rules**:
  - `ollama-worker-3060.yourdomain.com` → Ollama (port 11434)
  - `embeddings-worker-3060.yourdomain.com` → Embeddings (port 8080)
  - `health-worker-3060.yourdomain.com` → Health Monitor (port 9090)
  - `metrics-worker-3060.yourdomain.com` → Prometheus (port 9090)
- **Features**: QUIC protocol, HTTP/2, automatic TLS, DDoS protection

#### `grafana-dashboard.json` (Monitoring Dashboard)
- **Purpose**: Grafana dashboard for real-time monitoring
- **Panels** (12 total):
  1. GPU Utilization (%)
  2. GPU Memory Usage (%)
  3. GPU Temperature (°C)
  4. Ollama Requests Rate
  5. Service Health Status
  6. Service Latency
  7. Embedding Batch Size Distribution
  8. Embedding Latency (p95)
  9. Redis Cache Hit Rate
  10. Container Status
  11. Node CPU Usage
  12. Node Memory Usage
- **Refresh**: 10 seconds
- **Data Source**: Prometheus metrics

### Embedding Service

#### `embedding-service/Dockerfile`
- **Base**: node:20-slim
- **Installs**: Python 3, Node.js, transformers, torch
- **Exposes**: Port 8080
- **Health Check**: /health endpoint every 30s

#### `embedding-service/package.json`
- **Dependencies**:
  - express (REST API)
  - @xenova/transformers (embeddings)
  - prom-client (Prometheus metrics)
  - redis (caching)

#### `embedding-service/requirements.txt`
- **Python Packages**:
  - transformers>=4.40.0
  - torch>=2.2.0 (CUDA 12.4)
  - sentencepiece>=0.2.0

#### `embedding-service/server.js`
- **API Endpoints**:
  - `POST /embed` - Generate embeddings (batch)
  - `POST /embed/batch` - Batch processing
  - `POST /similarity` - Similarity search
  - `GET /health` - Health check
  - `GET /metrics` - Prometheus metrics
  - `GET /model` - Model information
- **Features**:
  - Redis caching (1 hour TTL)
  - Batch processing (configurable size)
  - Prometheus metrics
  - GPU acceleration via CUDA

### Health Monitor

#### `health-monitor/Dockerfile`
- **Base**: node:20-slim
- **Exposes**: Port 9090
- **Health Check**: /health endpoint every 30s

#### `health-monitor/package.json`
- **Dependencies**:
  - express (REST API)
  - prom-client (Prometheus metrics)
  - axios (HTTP client)
  - dockerode (Docker API)

#### `health-monitor/monitor.js`
- **API Endpoints**:
  - `GET /health` - Overall health status
  - `GET /services` - Service availability
  - `GET /containers` - Container status
  - `GET /ollama/models` - Installed models
  - `GET /gpu` - GPU information
  - `GET /system` - System information
  - `GET /metrics` - Prometheus metrics
  - `GET /ready` - Kubernetes readiness
  - `GET /live` - Kubernetes liveness
  - `POST /check` - Force health check
- **Features**:
  - Background health checks (60s interval)
  - Prometheus metric export
  - Docker container monitoring
  - Service latency tracking

## 🚀 Quick Start

### 1. Run Setup
```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\workers\worker-3060
.\setup-worker-3060.ps1
```

### 2. Authenticate
```powershell
infisical login
tailscale up
```

### 3. Start Services
```powershell
.\start.ps1
```

### 4. Verify Health
```powershell
.\health-check.ps1
.\test.ps1
```

## 📊 Service Endpoints

| Service | Local | Tailscale | Public (Cloudflare) |
|---------|-------|-----------|---------------------|
| Ollama | :11434 | worker-3060.tail-net.ts.net:11434 | ollama-worker-3060.yourdomain.com |
| Embeddings | :8080 | worker-3060.tail-net.ts.net:8080 | embeddings-worker-3060.yourdomain.com |
| Health | :9090 | worker-3060.tail-net.ts.net:9090 | health-worker-3060.yourdomain.com |
| Redis | :6379 | worker-3060.tail-net.ts.net:6379 | (internal only) |
| Node Exporter | :9100 | worker-3060.tail-net.ts.net:9100 | (metrics) |
| GPU Exporter | :9445 | worker-3060.tail-net.ts.net:9445 | (metrics) |

## 🔧 Configuration

### Primary Models
- **CodeLlama 34B** - Code analysis, document parsing (Primary)
- **Qwen 2 32B** - Document processing, classification (Secondary)
- **Gemma 2 27B** - Lightweight inference, embeddings (Tertiary)

### GPU Configuration
- **Model**: NVIDIA RTX 3060
- **VRAM**: 12GB GDDR6
- **CUDA**: 12.4
- **Driver**: Latest (installed by setup)

### Performance Targets
- **Inference Speed**: 15-20 tokens/sec
- **Batch Size**: 1-2 concurrent requests
- **Memory Usage**: ~10-11GB VRAM per model
- **Latency**: <3s (p95)

## 📈 Monitoring

### Prometheus Metrics
- **Worker Health**: `worker_service_health{service="ollama|embedding"}`
- **Latency**: `worker_service_latency_ms{service="..."}`
- **GPU**: `nvidia_gpu_*` (utilization, memory, temperature)
- **Ollama**: `worker_ollama_requests_total{model="...",status="..."}`
- **Embeddings**: `embedding_latency_seconds`, `embedding_batch_size`

### Grafana Dashboard
- Import `grafana-dashboard.json`
- 12 panels with real-time metrics
- Auto-refresh every 10 seconds

## 🔒 Security

### Secrets Management
- **Infisical**: All secrets stored in Infisical
- **Project ID**: 8374cea9-e5e8-4050-bda4-b91f25ab30ef
- **Environment**: dev
- **Path**: /worker-3060

### Network Security
- **Tailscale VPN**: Private mesh network
- **Cloudflare Tunnel**: Zero Trust access
- **Firewall**: Restricted ports via Windows Firewall
- **No Public IPs**: All access via VPN or tunnel

## 📦 Dependencies

### System Requirements
- Windows 10/11 Pro
- RTX 3060 GPU
- 16GB+ RAM
- 150GB+ disk space
- Administrator access

### Software Installed
- Chocolatey (package manager)
- NVIDIA drivers (latest)
- CUDA 12.4
- Docker Desktop
- Ollama
- Infisical CLI
- Tailscale
- Cloudflared
- Node.js 20 LTS
- Python 3.11

## 🆘 Support

- **Documentation**: README.md (comprehensive)
- **Quick Start**: QUICKSTART.md (30 min)
- **Troubleshooting**: TROUBLESHOOTING.md (20+ issues)
- **Setup Log**: setup.log (detailed progress)
- **Test Results**: test-results.json (validation)
- **Health Check**: health-check.ps1 (system status)

## 📝 File Sizes (Estimated)

| File | Size | Type |
|------|------|------|
| setup-worker-3060.ps1 | ~25 KB | Script |
| docker-compose.worker-3060.yml | ~8 KB | Config |
| README.md | ~45 KB | Docs |
| QUICKSTART.md | ~8 KB | Docs |
| TROUBLESHOOTING.md | ~35 KB | Docs |
| health-check.ps1 | ~10 KB | Script |
| test.ps1 | ~15 KB | Script |
| embedding-service/server.js | ~12 KB | Code |
| health-monitor/monitor.js | ~10 KB | Code |
| **Total** | **~170 KB** | (excluding models) |

### Model Downloads (via Ollama)
- CodeLlama 34B: ~19 GB
- Qwen 2 32B: ~18 GB
- Gemma 2 27B: ~16 GB
- **Total Models**: ~53 GB

## ✅ Checklist

Before starting production:

- [ ] Run `setup-worker-3060.ps1` successfully
- [ ] NVIDIA driver installed (`nvidia-smi` works)
- [ ] Docker Desktop with GPU support
- [ ] All 3 models pulled (check with `ollama list`)
- [ ] Tailscale connected
- [ ] Infisical authenticated
- [ ] Services healthy (`.\health-check.ps1`)
- [ ] Tests passing (`.\test.ps1`)
- [ ] Cloudflare tunnel configured (optional)
- [ ] Grafana dashboard imported (optional)
- [ ] Firewall rules configured
- [ ] Monitoring setup (Prometheus/Grafana)
- [ ] Backup strategy defined

## 📅 Maintenance Schedule

### Daily
- Monitor GPU temperature
- Check service health (`.\health-check.ps1`)
- Review error logs

### Weekly
- Run integration tests (`.\test.ps1`)
- Check disk space
- Review Grafana dashboards

### Monthly
- Update Ollama models
- Update Docker images
- System updates (Windows, drivers)
- Backup model data

## 🔗 Related Documentation

- **Project Nyra**: `../../../CLAUDE.md`
- **Whitepaper**: `../../../ToDo/whitepaper-workflow/`
- **Worker-5090**: `../worker-5090/` (RTX 5090 setup)
- **Worker-3090**: `../worker-3090/` (RTX 3090 setup)
- **Nexus Router**: `../../../services/nexus-router/`

---

**Package Version**: 1.0.0
**Last Updated**: 2026-01-22
**Author**: Project Nyra DevOps Team
**License**: Proprietary - Internal Use Only
