# PC Information - ALIENAPOTHEOSIS (Orchestrator Mini PC)

**Collected**: 2026-01-24
**Purpose**: Configuration reference for claude-flow Docker deployment

---

## 🖥️ System Information

| Property | Value |
|----------|-------|
| **Computer Name** | ALIENAPOTHEOSIS |
| **Architecture** | 64-bit |
| **RAM** | 34GB (34,029,162,496 bytes) |
| **Windows Version** | 2009 |
| **Role** | Orchestrator Mini PC |

---

## 🌐 Network Configuration

### Wi-Fi Adapter (Active) - Killer Wi-Fi 6E AX1675i

| Property | Value |
|----------|-------|
| **Interface Name** | Wi-Fi |
| **MAC Address** | `C2-B3-B9-2F-4C-D2` |
| **Local IPv4** | `192.168.1.221` |
| **Subnet Mask** | `255.255.255.0` |
| **Default Gateway** | `192.168.1.254` |
| **DNS Suffix** | attlocal.net |
| **Status** | Connected |

### Ethernet Adapter (Disconnected) - Killer E3100G 2.5Gbit

| Property | Value |
|----------|-------|
| **Interface Name** | Ethernet |
| **MAC Address** | `04-BF-1B-29-A3-F3` |
| **Status** | Media disconnected |

### Tailscale VPN (Active)

| Property | Value |
|----------|-------|
| **Tailscale IP** | `100.83.23.49` |
| **Hostname** | tail558973.ts.net |
| **Status** | Up |
| **Suggested Hostname** | `orchestrator-mini.tail-net.ts.net` |

### Public WAN IP

| Property | Value |
|----------|-------|
| **Public IPv4** | `107.142.246.181` |
| **ISP** | AT&T (attlocal.net) |

---

## 📝 Environment Variable Values

### For Orchestrator .env File

```env
# System Information
HOSTNAME=ALIENAPOTHEOSIS
PC_ROLE=orchestrator

# Network Configuration - Local
LOCAL_IP=192.168.1.221
LOCAL_GATEWAY=192.168.1.254
LOCAL_SUBNET=255.255.255.0
MAC_ADDRESS_WIFI=C2:B3:B9:2F:4C:D2
MAC_ADDRESS_ETHERNET=04:BF:1B:29:A3:F3

# Network Configuration - Public
PUBLIC_WAN_IP=107.142.246.181

# Network Configuration - Tailscale
TAILSCALE_IP=100.83.23.49
TAILSCALE_HOSTNAME=orchestrator-mini.tail-net.ts.net
TAILSCALE_DOMAIN=tail558973.ts.net

# Docker Network
DOCKER_NETWORK_SUBNET=172.28.0.0/16
```

---

## 🔧 Cloudflare Tunnel Configuration

### Recommended Tunnel Name
`nyra-mortgage-platform`

### DNS Records to Create

| Subdomain | Service | Local Port |
|-----------|---------|------------|
| ratehunter.net | Landing Page | 3000 |
| app.projectnyra.com | Mortgage Assistant | 8000 |
| crm.projectnyra.com | TwentyCRM | 3001 |
| api.projectnyra.com | Nexus Router | 6000 |
| metrics.ratehunter.net | Grafana | 3005 |
| n8n.projectnyra.com | n8n Workflows | 5678 |
| dify.ratehunter.net | Dify Chat | 3002 |

### Cloudflared Config Path
`C:\Users\edane\.cloudflared\config.yml`

---

## 🐝 Tailscale Mesh Configuration

### Expected Mesh Topology

```
orchestrator-mini.tail-net.ts.net  (100.83.23.49)
    ├── worker-5090.tail-net.ts.net
    ├── worker-3090.tail-net.ts.net
    └── worker-3060.tail-net.ts.net
```

### Worker URLs (for orchestrator config)

```env
WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434
WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434
WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434
```

---

## 🔐 Security Notes

1. **MAC Addresses**: Already collected for both adapters
2. **Static IP**: Consider setting static IP on 192.168.1.221 for stability
3. **Firewall Rules**: Will need to open ports for Docker services
4. **Tailscale**: Already configured and running
5. **SSH Keys**: May need to generate for Git/deployment automation

---

## 📦 Docker Configuration

### Host Paths for Volumes

```yaml
volumes:
  - C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\orchestrator\data\postgres:/var/lib/postgresql/data
  - C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\orchestrator\data\redis:/data
  - C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\orchestrator\data\qdrant:/qdrant/storage
  - C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\orchestrator\logs:/logs
```

### WSL2 Integration

- **WSL Version**: 2 (required for Docker Desktop)
- **Distribution**: Ubuntu (default)
- **Docker Desktop**: Required for GPU passthrough on workers

---

## 🎯 Next Steps

1. ✅ **PC Information Collected**
   - [x] Computer name and specs
   - [x] Wi-Fi MAC address
   - [x] Ethernet MAC address
   - [x] Local IP address (192.168.1.221)
   - [x] Tailscale IP and hostname
   - [x] Public WAN IP

2. ⏭️ **Tailscale Setup**
   - [ ] Set custom hostname: `tailscale set --hostname orchestrator-mini`
   - [ ] Verify mesh connectivity once workers are online

3. ⏭️ **Cloudflare Tunnel Setup**
   - [ ] Run `cloudflared tunnel login`
   - [ ] Create tunnel: `cloudflared tunnel create nyra-mortgage-platform`
   - [ ] Configure DNS records
   - [ ] Start tunnel service

4. ⏭️ **Docker Deployment**
   - [ ] Copy .env.template to .env
   - [ ] Fill in API keys and passwords
   - [ ] Run quick-start script or manual docker-compose up

5. ⏭️ **GUI Installer Integration**
   - [ ] Copy Docker configs to bootstrap installer
   - [ ] Update installer to use Docker deployment path
   - [ ] Test end-to-end installation flow

---

**Status**: Ready for Cloudflare and Tailscale configuration
**Backup Location**: `C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\`
