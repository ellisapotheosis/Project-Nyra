# Nyra Distributed GPU Compute Infrastructure

## 🌐 Overview

This repository contains the complete cloudflared tunneling architecture for Project Nyra's distributed GPU compute cluster. The infrastructure connects 4 PCs across a LAN with ratehunter.net domain management, providing secure, scalable, and high-performance GPU compute capabilities.

## 🏗️ Architecture

### Network Topology

```
                            🌐 Internet (Cloudflare)
                                       │
                            ┌──────────▼──────────┐
                            │   ratehunter.net    │
                            │   DNS & Tunnels     │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │   Orchestrator      │
                            │   (Minisforum)      │
                            │   192.168.1.100     │
                            └─────────┬┬┬─────────┘
                                     │││
                    ┌────────────────┘│└────────────────┐
                    │                 │                 │
            ┌───────▼─────────┐ ┌─────▼─────────┐ ┌─────▼─────────┐
            │    Worker 1     │ │   Worker 2    │ │   Worker 3    │
            │  Alienware M15  │ │ Alienware A51 │ │  Desktop PC   │
            │   RTX 3060      │ │   RTX 5090    │ │  RTX 3090Ti   │
            │ 192.168.1.101   │ │ 192.168.1.102 │ │ 192.168.1.103 │
            └─────────────────┘ └───────────────┘ └───────────────┘
```

### Compute Nodes

| Node | Hardware | Role | GPU | Subdomain |
|------|----------|------|-----|-----------|
| **Orchestrator** | Minisforum UH680<br>Ryzen 7 6800H, 16GB DDR5 | Coordination, Task Distribution | None | orchestrator.ratehunter.net |
| **Worker 1** | Alienware M15R7 | GPU Compute (Mid-tier) | RTX 3060 (12GB) | worker1.ratehunter.net |
| **Worker 2** | Alienware Area-51 | GPU Compute (High-perf) | RTX 5090 (32GB) | worker2.ratehunter.net |
| **Worker 3** | Desktop PC | GPU Compute (High-perf) | RTX 3090Ti (24GB) | worker3.ratehunter.net |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ with Volta package manager
- Docker Desktop
- Cloudflare account with API access
- Infisical CLI for secrets management

### 1. Clone and Setup

```bash
git clone <repository>
cd project-nyra

# Run complete setup (Windows)
.\scripts\setup\complete-setup.ps1

# Or run individual components (Linux/macOS)
./scripts/setup/setup-orchestrator.sh    # For orchestrator node
./scripts/setup/setup-worker.sh worker1  # For worker nodes
```

### 2. Configure Secrets

```bash
# Install and setup Infisical
./scripts/setup/infisical-setup.sh

# Set required Cloudflare credentials
infisical secrets set CLOUDFLARE_API_KEY="your_api_key"
infisical secrets set CLOUDFLARE_EMAIL="your_email"
infisical secrets set CLOUDFLARE_ZONE_ID="your_zone_id"
infisical secrets set CLOUDFLARE_ACCOUNT_ID="your_account_id"
```

### 3. Setup Cloudflare Infrastructure

```bash
# Setup tunnels and DNS
./scripts/setup/cloudflare-setup.sh

# Configure load balancing
node src/infrastructure/cloudflared/load-balancer.js setup
```

### 4. Test Infrastructure

```bash
# Run comprehensive tests
./scripts/setup/test-infrastructure.sh

# Quick validation
./scripts/setup/test-infrastructure.sh --quick
```

## 📁 Directory Structure

```
project-nyra/
├── src/infrastructure/cloudflared/
│   ├── dns-manager.js          # Cloudflare DNS management
│   ├── service-discovery.js    # Service registration & health
│   ├── security-manager.js     # Zero-trust security
│   └── load-balancer.js        # Load balancing & failover
├── config/
│   ├── tunnels/                # Cloudflared configurations
│   ├── access-policies.json    # Security policies
│   └── secrets/                # Secret templates
├── scripts/
│   ├── setup/                  # Installation scripts
│   └── monitoring/             # Health check scripts
└── docs/network/
    └── network-topology.md     # Detailed architecture docs
```

## 🔐 Security Architecture

### Zero Trust Principles

- **API Authentication**: JWT tokens + API keys
- **Network Segmentation**: Internal/external access policies
- **Rate Limiting**: Per-service and per-endpoint limits
- **Audit Logging**: Complete security event tracking
- **Secret Management**: Infisical for secure credential storage

### Access Policies

Each node has specific permissions and rate limits:

- **Orchestrator**: Full admin access, coordination permissions
- **Workers**: Compute-only access, GPU status reporting
- **External**: Read-only health and status endpoints
- **Monitoring**: Health check and metrics access

## 🌐 Service Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| **Main Interface** | https://nyra.ratehunter.net | Primary Nyra dashboard |
| **API Gateway** | https://api.ratehunter.net | Load-balanced GPU compute API |
| **Health Dashboard** | https://health.ratehunter.net | System monitoring |
| **Orchestrator** | https://orchestrator.ratehunter.net | Coordination API |
| **Worker 1** | https://worker1.ratehunter.net | RTX 3060 compute |
| **Worker 2** | https://worker2.ratehunter.net | RTX 5090 compute |
| **Worker 3** | https://worker3.ratehunter.net | RTX 3090Ti compute |

## 🔧 Configuration

### Environment Variables

Required variables (managed via Infisical):

```bash
# Cloudflare Configuration
CLOUDFLARE_API_KEY=your_api_key
CLOUDFLARE_EMAIL=your_email
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Network Configuration
INTERNAL_NETWORK=192.168.1.0/24
ORCHESTRATOR_IP=192.168.1.100
WORKER1_IP=192.168.1.101
WORKER2_IP=192.168.1.102
WORKER3_IP=192.168.1.103

# Tunnel Configuration
NYRA_ORCHESTRATOR_TUNNEL_ID=auto_generated_on_setup
```

### Service Ports

| Service | Orchestrator | Worker 1 | Worker 2 | Worker 3 |
|---------|-------------|----------|----------|----------|
| **Main Service** | 3000 | 8082 | 8084 | 8086 |
| **Health Check** | 9090 | 8083 | 8085 | 8087 |
| **Metrics** | 8081 | 8889 | 8890 | 8891 |
| **API Gateway** | 8080 | - | - | - |

## 🔍 Monitoring & Health Checks

### Automated Monitoring

- **Health Checks**: Every 5 minutes via cron/Task Scheduler
- **Service Discovery**: Automatic worker registration
- **GPU Monitoring**: Real-time GPU utilization and temperature
- **Tunnel Health**: Cloudflared connection status
- **Load Balancer**: Origin pool health monitoring

### Manual Monitoring Commands

```bash
# Check overall system health
./scripts/monitoring/health-check.sh

# Service discovery status
node src/infrastructure/cloudflared/service-discovery.js status

# Test tunnel connectivity
./scripts/monitoring/tunnel-health.sh

# GPU monitoring (worker nodes)
python3 scripts/monitoring/gpu-monitor.py
```

## 🚀 Deployment

### For Each Node Type

#### Orchestrator Node Setup
```bash
# Install dependencies and configure services
./scripts/setup/setup-orchestrator.sh

# Setup Cloudflare tunnel
cloudflared tunnel login
cloudflared tunnel create nyra-orchestrator
./scripts/setup/cloudflare-setup.sh

# Start services
sudo systemctl start nyra-orchestrator
sudo systemctl start cloudflared
```

#### Worker Node Setup
```bash
# Setup worker (replace with worker1, worker2, or worker3)
./scripts/setup/setup-worker.sh worker1 192.168.1.101 "RTX 3060"

# Copy tunnel credentials from orchestrator
# Start services
sudo systemctl start nyra-worker1
```

### Verification

```bash
# Test complete infrastructure
./scripts/setup/test-infrastructure.sh

# Verify specific components
node src/infrastructure/cloudflared/dns-manager.js validate
node src/infrastructure/cloudflared/load-balancer.js test
```

## 🔄 Operations

### Starting Services

```bash
# Orchestrator
npm run start:orchestrator
# or with secrets
infisical run --env=production -- npm run start:orchestrator

# Workers
npm run start:worker
# or with secrets
infisical run --env=production -- npm run start:worker
```

### Scaling Operations

- **Add Worker**: Run worker setup script on new hardware
- **Remove Worker**: Stop services, update DNS, remove from load balancer
- **Update Configuration**: Modify configs, restart affected services

### Maintenance

```bash
# Update tunnel configuration
envsubst < config/tunnels/orchestrator.yml > /etc/cloudflared/config.yml
sudo systemctl restart cloudflared

# Rotate API keys
node src/infrastructure/cloudflared/security-manager.js generate-key worker1

# Update DNS records
node src/infrastructure/cloudflared/dns-manager.js setup
```

## 🐛 Troubleshooting

### Common Issues

1. **Tunnel Connection Failed**
   ```bash
   sudo systemctl status cloudflared
   cloudflared tunnel --config /etc/cloudflared/config.yml validate
   ```

2. **DNS Resolution Issues**
   ```bash
   node src/infrastructure/cloudflared/dns-manager.js validate
   dig +short nyra.ratehunter.net
   ```

3. **Service Discovery Problems**
   ```bash
   node src/infrastructure/cloudflared/service-discovery.js discover
   ./scripts/monitoring/health-check.sh
   ```

4. **GPU Not Detected**
   ```bash
   nvidia-smi
   docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
   ```

### Logs and Diagnostics

```bash
# System logs
sudo journalctl -u nyra-orchestrator -f
sudo journalctl -u cloudflared -f

# Application logs
tail -f /var/log/nyra-*.log
tail -f /var/log/cloudflared/*.log

# Health check logs
tail -f /var/log/nyra-health.log
```

## 📊 Performance Metrics

### Expected Performance

- **Tunnel Latency**: < 10ms additional overhead
- **GPU Utilization**: 95%+ during compute tasks
- **Network Throughput**: Gigabit LAN speeds
- **Failover Time**: < 30 seconds automatic
- **Health Check Response**: < 2 seconds

### Load Balancing Weights

Based on GPU performance scores:
- **Worker 2 (RTX 5090)**: Weight 1.0 (100% - highest performance)
- **Worker 3 (RTX 3090Ti)**: Weight 0.9 (90% - high performance)
- **Worker 1 (RTX 3060)**: Weight 0.7 (70% - mid-tier performance)

## 🔗 Integration

### With Claude-Flow

```javascript
// Integrate with existing Claude-Flow swarm
const ServiceDiscovery = require('./src/infrastructure/cloudflared/service-discovery');
const discovery = new ServiceDiscovery();

// Get available GPU workers
const workers = discovery.getHealthyServices('compute-worker');
// Use workers for Claude-Flow task distribution
```

### With MCP Servers

The infrastructure integrates with:
- **claude-flow**: Task coordination and distribution
- **ruv-swarm**: Enhanced agent coordination
- **infisical**: Secret management
- **bitwarden**: Credential storage

## 📚 Additional Documentation

- [Network Topology Details](docs/network/network-topology.md)
- [Security Architecture](config/access-policies.json)
- [Service Discovery API](src/infrastructure/cloudflared/service-discovery.js)
- [Load Balancing Configuration](src/infrastructure/cloudflared/load-balancer.js)

## 🤝 Contributing

1. Test all changes with `./scripts/setup/test-infrastructure.sh`
2. Update documentation for any architectural changes
3. Follow security best practices for credential management
4. Validate performance impact on GPU compute workloads

## 📝 License

This infrastructure configuration is part of Project Nyra and follows the project's licensing terms.

---

**🎯 Ready to deploy distributed GPU compute with enterprise-grade security and monitoring!**