# Nyra Distributed GPU Compute Network Topology

## Overview
This document outlines the cloudflared tunneling architecture for connecting 4 PCs across the LAN with ratehunter.net domain management for Project Nyra's distributed GPU compute cluster.

## Network Architecture

### Compute Nodes

#### 1. Orchestrator Node (Main Coordinator)
- **Hardware**: Minisforum UH680 (Ryzen 7 6800H, 16GB DDR5, 1TB SSD)
- **Role**: Primary orchestrator, coordination logic, tunnel host
- **Subdomain**: `orchestrator.ratehunter.net`
- **Internal Services**:
  - Claude-Flow coordination (port 3000)
  - Task distribution API (port 8080)
  - Health monitoring dashboard (port 9090)
  - GPU metrics collector (port 8081)

#### 2. Worker Node 1 (RTX 3060)
- **Hardware**: Alienware M15R7 (RTX 3060)
- **Role**: GPU compute worker, mid-tier performance
- **Subdomain**: `worker1.ratehunter.net`
- **Internal Services**:
  - GPU compute API (port 8082)
  - Health endpoint (port 8083)

#### 3. Worker Node 2 (RTX 5090)
- **Hardware**: Alienware Area-51 (RTX 5090)
- **Role**: High-performance GPU compute node
- **Subdomain**: `worker2.ratehunter.net`
- **Internal Services**:
  - GPU compute API (port 8084)
  - Health endpoint (port 8085)

#### 4. Worker Node 3 (RTX 3090Ti)
- **Hardware**: Desktop PC (RTX 3090Ti)
- **Role**: GPU compute worker, high performance
- **Subdomain**: `worker3.ratehunter.net`
- **Internal Services**:
  - GPU compute API (port 8086)
  - Health endpoint (port 8087)

## Cloudflare Tunnel Architecture

### Tunnel Strategy
- **Primary Tunnel**: Orchestrator hosts main tunnel with ingress rules
- **Hybrid Approach**: Workers connect via local network + cloudflared for external access
- **Load Balancing**: Cloudflare Load Balancer for worker distribution
- **Failover**: Automatic failover to available workers

### Subdomain Routing
```
ratehunter.net (main domain)
├── orchestrator.ratehunter.net → Orchestrator Node
├── worker1.ratehunter.net → Worker Node 1 (RTX 3060)
├── worker2.ratehunter.net → Worker Node 2 (RTX 5090)
├── worker3.ratehunter.net → Worker Node 3 (RTX 3090Ti)
├── api.ratehunter.net → Load Balanced API Gateway
├── health.ratehunter.net → Health Monitoring Dashboard
└── nyra.ratehunter.net → Main Nyra Interface
```

## Service Discovery

### Registration Process
1. Each node registers with orchestrator on startup
2. Periodic health checks maintain service registry
3. GPU capabilities and availability reported
4. Dynamic load balancing based on GPU utilization

### Communication Flow
```
External Request → Cloudflare → Tunnel → Orchestrator → Worker Selection → GPU Execution → Response
```

## Security Architecture

### Zero Trust Principles
- All communication through encrypted tunnels
- API key authentication for all endpoints
- Network segmentation via cloudflared
- Access logging and monitoring

### Secret Management
- Cloudflare API tokens via Infisical
- Tunnel credentials stored securely
- Environment-specific configurations
- Automatic credential rotation

## Wake-on-LAN Integration
- Magic packet support for worker activation
- Energy-efficient cluster management
- On-demand scaling based on workload
- Graceful worker shutdown protocols