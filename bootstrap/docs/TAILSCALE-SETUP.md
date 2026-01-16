# Tailscale Mesh Networking Setup

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tailscale vs Cloudflared](#tailscale-vs-cloudflared)
4. [Prerequisites](#prerequisites)
5. [Setup Instructions](#setup-instructions)
6. [Configuration](#configuration)
7. [Network Topology](#network-topology)
8. [Security](#security)
9. [Troubleshooting](#troubleshooting)
10. [Performance](#performance)
11. [Integration with Infisical](#integration-with-infisical)

---

## Overview

Project Nyra uses **Tailscale** for secure internal mesh networking between the 4 PCs (orchestrator + 3 workers). Tailscale creates a private, encrypted network overlay using WireGuard, enabling seamless PC-to-PC communication without exposing services to the public internet.

### Key Features

- **Zero-configuration mesh networking**: Automatic peer discovery and connection
- **WireGuard-based encryption**: Industry-standard security with minimal overhead
- **MagicDNS**: Automatic name resolution within the mesh
- **Subnet routing**: Access to local network resources (10.0.0.0/24)
- **Exit node capability**: Orchestrator can act as a gateway for worker nodes
- **Cross-platform**: Works on Windows, Linux, macOS

### Project Nyra Mesh Network

```
┌─────────────────────────────────────────────────────────────────┐
│                    Tailscale Mesh Network                       │
│                    (100.64.0.0/10 CGNAT)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐                    │
│  │ Orchestrator │◄───────►│  Gaming PC   │                    │
│  │  (Exit Node) │         │   (Worker)   │                    │
│  │ 100.x.x.1    │         │ 100.x.x.2    │                    │
│  └──────┬───────┘         └──────┬───────┘                    │
│         │                        │                             │
│         │    ┌──────────────┐    │                            │
│         └───►│ Work Laptop  │◄───┘                            │
│              │  (Worker)    │                                  │
│              │ 100.x.x.3    │                                  │
│              └──────┬───────┘                                  │
│                     │                                           │
│              ┌──────▼───────┐                                  │
│              │Media Server  │                                  │
│              │  (Worker)    │                                  │
│              │ 100.x.x.4    │                                  │
│              └──────────────┘                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture

### Node Roles

#### Orchestrator Mini (Primary Control Node)

- **Role**: Exit node + Subnet router
- **Capabilities**:
  - Exit node for worker nodes (internet gateway)
  - Subnet routing for 10.0.0.0/24 (local network access)
  - MagicDNS enabled
  - Full mesh access to all workers
- **Tags**: `tag:orchestrator`, `tag:exit-node`
- **Configuration**: Advertises routes and exit node

#### Worker Nodes (Gaming PC, Work Laptop, Media Server)

- **Role**: Standard mesh nodes
- **Capabilities**:
  - Accept routes from orchestrator
  - MagicDNS enabled
  - Direct peer-to-peer connections to other workers
  - Can use orchestrator as exit node
- **Tags**: `tag:worker`, `tag:[pc-name]`
- **Configuration**: Accept routes and DNS

### Network Topology

```mermaid
graph TD
    A[Orchestrator Mini<br/>Exit Node + Router] --> B[Tailscale Mesh<br/>100.64.0.0/10]
    B --> C[Gaming PC<br/>Worker]
    B --> D[Work Laptop<br/>Worker]
    B --> E[Media Server<br/>Worker]

    A -->|Subnet Routes| F[Local Network<br/>10.0.0.0/24]

    C -.->|Direct P2P| D
    C -.->|Direct P2P| E
    D -.->|Direct P2P| E

    style A fill:#4a90e2,stroke:#2e5c8a,color:#fff
    style C fill:#7cb342,stroke:#558b2f,color:#fff
    style D fill:#7cb342,stroke:#558b2f,color:#fff
    style E fill:#7cb342,stroke:#558b2f,color:#fff
    style F fill:#ffa726,stroke:#f57c00,color:#fff
```

### Communication Patterns

1. **Direct Peer-to-Peer**: Workers communicate directly when possible (NAT traversal)
2. **DERP Relay**: Fallback relay for difficult NAT situations
3. **Subnet Access**: All nodes can access orchestrator's local network (10.0.0.0/24)
4. **Exit Node**: Workers can route internet traffic through orchestrator

---

## Tailscale vs Cloudflared

Both Tailscale and Cloudflared tunnels are used in Project Nyra, but for different purposes:

### Use Tailscale When:

| Scenario | Reason |
|----------|--------|
| **Internal PC-to-PC communication** | Direct, low-latency mesh networking |
| **Service orchestration** | Docker containers need to talk to each other across PCs |
| **File sharing** | Tailscale's built-in file sharing between nodes |
| **SSH access** | Secure SSH between PCs without exposing ports |
| **Local network access** | Need to access orchestrator's local network (10.0.0.0/24) |
| **Exit node routing** | Workers need to route traffic through orchestrator |

### Use Cloudflared When:

| Scenario | Reason |
|----------|--------|
| **External public access** | Expose services to the internet (websites, APIs) |
| **Custom domains** | Need HTTPS with custom domain names |
| **DDoS protection** | Cloudflare's edge network provides DDoS mitigation |
| **Zero-trust access** | Cloudflare Access for authentication |
| **Global CDN** | Need content delivery network features |

### Architecture Decision

```mermaid
graph LR
    A[Internet Users] -->|HTTPS| B[Cloudflare Tunnels]
    B --> C[Public Services<br/>Web, API]

    D[Orchestrator] -.->|Tailscale Mesh| E[Gaming PC]
    D -.->|Tailscale Mesh| F[Work Laptop]
    D -.->|Tailscale Mesh| G[Media Server]

    E -.->|Direct P2P| F
    E -.->|Direct P2P| G
    F -.->|Direct P2P| G

    style B fill:#f68c20,stroke:#d67100,color:#fff
    style D fill:#4a90e2,stroke:#2e5c8a,color:#fff
    style E fill:#7cb342,stroke:#558b2f,color:#fff
    style F fill:#7cb342,stroke:#558b2f,color:#fff
    style G fill:#7cb342,stroke:#558b2f,color:#fff
```

**Best Practice**: Use **both** systems together:
- Cloudflared for external-facing services
- Tailscale for internal infrastructure communication

---

## Prerequisites

### Before You Begin

1. **Tailscale Account**: Create a free account at [tailscale.com](https://tailscale.com)
2. **Auth Keys**: Generate auth keys for each PC (see [Auth Key Generation](#auth-key-generation))
3. **Infisical**: (Optional) For secure credential storage
4. **Firewall Rules**: Ensure UDP port 41641 is allowed

### Auth Key Generation

1. Go to [Tailscale Admin Console - Keys](https://login.tailscale.com/admin/settings/keys)
2. Click **Generate auth key**
3. Configure the key:
   - **Description**: Project Nyra - [PC Name]
   - **Expiration**: 90 days (or as needed)
   - **Reusable**: Yes (recommended for development)
   - **Ephemeral**: No (for persistent nodes)
   - **Tags**:
     - Orchestrator: `tag:orchestrator,tag:exit-node`
     - Workers: `tag:worker,tag:[pc-name]`
   - **Pre-approved**:
     - Orchestrator: Routes + Exit node
     - Workers: Routes
4. Save the auth key (format: `tskey-auth-xxxxxxxxxxxxx`)
5. Store in Infisical or environment variables (NEVER commit to git)

---

## Setup Instructions

### Orchestrator Setup

#### Option 1: Using Setup Script (Recommended)

**Linux/WSL:**
```bash
# Navigate to orchestrator scripts
cd bootstrap/orchestrator-mini/scripts

# Make script executable
chmod +x setup-tailscale.sh

# Run setup (requires sudo)
sudo ./setup-tailscale.sh
```

**Windows (PowerShell as Administrator):**
```powershell
# Navigate to orchestrator scripts
cd bootstrap\orchestrator-mini\scripts

# Run setup
.\setup-tailscale.ps1
```

#### Option 2: Manual Setup

1. **Install Tailscale**:
   - Windows: Download from [pkgs.tailscale.com](https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe)
   - Linux: `curl -fsSL https://tailscale.com/install.sh | sh`

2. **Configure Tailscale**:
   ```bash
   tailscale up \
     --authkey=tskey-auth-xxxxxxxxxxxxx \
     --hostname=orchestrator-mini-tailscale \
     --advertise-exit-node \
     --advertise-routes=10.0.0.0/24 \
     --accept-routes \
     --accept-dns \
     --ssh
   ```

3. **Approve in Admin Console**:
   - Go to [Tailscale Admin - Machines](https://login.tailscale.com/admin/machines)
   - Find `orchestrator-mini-tailscale`
   - Click **Edit route settings**
   - Enable **Use as exit node**
   - Approve **Subnet routes: 10.0.0.0/24**

#### Option 3: Docker Compose

Add to your `docker-compose.yml`:

```yaml
services:
  tailscale:
    image: tailscale/tailscale:latest
    container_name: orchestrator-tailscale
    hostname: orchestrator-mini-tailscale
    restart: unless-stopped
    cap_add:
      - NET_ADMIN
      - NET_RAW
    privileged: true
    network_mode: host
    volumes:
      - ./data/tailscale:/var/lib/tailscale
    environment:
      - TS_AUTHKEY=${TAILSCALE_AUTH_KEY}
      - TS_HOSTNAME=orchestrator-mini-tailscale
      - TS_ADVERTISE_EXIT_NODE=true
      - TS_ROUTES=10.0.0.0/24
      - TS_ACCEPT_DNS=true
      - TS_ACCEPT_ROUTES=true
```

### Worker Node Setup

#### Gaming PC, Work Laptop, Media Server

**Linux/WSL:**
```bash
# Navigate to worker scripts
cd bootstrap/[pc-name]/scripts

# Make script executable
chmod +x setup-tailscale.sh

# Run setup (requires sudo)
sudo ./setup-tailscale.sh
```

**Windows (PowerShell as Administrator):**
```powershell
# Navigate to worker scripts
cd bootstrap\[pc-name]\scripts

# Run setup
.\setup-tailscale.ps1
```

**Docker Compose (Worker):**
```yaml
services:
  tailscale:
    image: tailscale/tailscale:latest
    container_name: ${PC_NAME}-tailscale
    hostname: ${PC_NAME}-tailscale
    restart: unless-stopped
    cap_add:
      - NET_ADMIN
      - NET_RAW
    privileged: true
    network_mode: host
    volumes:
      - ./data/tailscale:/var/lib/tailscale
    environment:
      - TS_AUTHKEY=${TAILSCALE_AUTH_KEY}
      - TS_HOSTNAME=${PC_NAME}-tailscale
      - TS_ACCEPT_DNS=true
      - TS_ACCEPT_ROUTES=true
```

---

## Configuration

### MagicDNS

MagicDNS provides automatic name resolution within the Tailscale network.

**Enabled by default** with `--accept-dns` flag.

**DNS Names:**
- `orchestrator-mini-tailscale`
- `gaming-pc-tailscale`
- `work-laptop-tailscale`
- `media-server-tailscale`

**Usage:**
```bash
# SSH to orchestrator
ssh user@orchestrator-mini-tailscale

# Ping worker
ping gaming-pc-tailscale

# Access service
curl http://work-laptop-tailscale:8080
```

### Subnet Routing

Orchestrator advertises the local network subnet `10.0.0.0/24`.

**Benefits:**
- Workers can access orchestrator's local network devices
- Useful for accessing local services (NAS, printers, etc.)
- Enables hybrid cloud-local architectures

**Configuration:**
```bash
# On orchestrator
tailscale up --advertise-routes=10.0.0.0/24

# On workers
tailscale up --accept-routes
```

### Exit Node

Orchestrator can act as an exit node (internet gateway) for worker nodes.

**Use Cases:**
- Centralized internet access for security
- Route worker traffic through orchestrator's network
- Bypass network restrictions on work laptop

**Enable on orchestrator:**
```bash
tailscale up --advertise-exit-node
```

**Use on workers:**
```bash
# Use orchestrator as exit node
tailscale up --exit-node=orchestrator-mini-tailscale

# Stop using exit node
tailscale up --exit-node=
```

### ACL Configuration

Tailscale uses ACLs (Access Control Lists) for security policies.

**ACL File Location:** `bootstrap/configs/tailscale/tailscale-acls.json`

**Apply ACLs:**
1. Go to [Tailscale Admin - Access Controls](https://login.tailscale.com/admin/acls)
2. Copy the contents of `tailscale-acls.json`
3. Paste into the ACL editor
4. Click **Save**

**Key ACL Rules:**
- Orchestrator has full access to all nodes
- Workers can access orchestrator and other workers on specific ports
- Gaming PC can access media server for streaming
- Work laptop has restricted access for security

---

## Network Topology

### IP Address Allocation

Tailscale uses CGNAT range `100.64.0.0/10` for mesh IPs.

| Node | Tailscale IP | Local IP | Role |
|------|--------------|----------|------|
| Orchestrator Mini | 100.x.x.1 (auto) | 10.0.0.10 | Exit Node + Router |
| Gaming PC | 100.x.x.2 (auto) | 10.0.0.20 | Worker |
| Work Laptop | 100.x.x.3 (auto) | 10.0.0.30 | Worker |
| Media Server | 100.x.x.4 (auto) | 10.0.0.40 | Worker |

**Note:** Actual Tailscale IPs are assigned automatically and may differ.

### Connection Flow

```mermaid
sequenceDiagram
    participant W as Worker Node
    participant C as Tailscale Coordinator
    participant O as Orchestrator
    participant I as Internet

    W->>C: 1. Authenticate with auth key
    C->>W: 2. Assign Tailscale IP (100.x.x.x)
    W->>C: 3. Request peer list
    C->>W: 4. Return peer list + DERP relays
    W->>O: 5. Attempt direct P2P connection (NAT traversal)
    O->>W: 6. Establish WireGuard tunnel
    W->>O: 7. Query MagicDNS for names
    O->>W: 8. Resolve hostnames
    W->>I: 9. (Optional) Route via exit node
```

### Port Requirements

| Port | Protocol | Purpose |
|------|----------|---------|
| 41641 | UDP | Tailscale traffic |
| 3478 | UDP | STUN (NAT traversal) |

**Firewall Rules:**
```bash
# Linux (ufw)
sudo ufw allow 41641/udp comment "Tailscale"

# Windows (PowerShell)
New-NetFirewallRule -DisplayName "Tailscale" -Direction Inbound -Protocol UDP -LocalPort 41641 -Action Allow
```

---

## Security

### Authentication

- **Auth Keys**: Time-limited, pre-approved keys for each node
- **Key Rotation**: Rotate auth keys every 90 days
- **Key Storage**: Store in Infisical or secure secret manager

### Encryption

- **WireGuard**: Modern, audited VPN protocol
- **End-to-End**: Encrypted communication between peers
- **Perfect Forward Secrecy**: Keys rotated regularly

### Access Control

**ACL Best Practices:**
1. **Least Privilege**: Grant minimum required access
2. **Tag-Based**: Use tags for node categorization
3. **Port Restrictions**: Limit access to specific ports
4. **Regular Audits**: Review ACLs quarterly

**Example ACL (Least Privilege):**
```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["tag:orchestrator"],
      "dst": ["*:*"]
    },
    {
      "action": "accept",
      "src": ["tag:worker"],
      "dst": ["tag:orchestrator:22,80,443"]
    }
  ]
}
```

### Security Checklist

- [ ] Auth keys never committed to git
- [ ] Auth keys stored in Infisical with proper access controls
- [ ] ACLs configured with least privilege
- [ ] Firewall rules enabled (UFW/Windows Firewall)
- [ ] Exit node approved only on orchestrator
- [ ] Subnet routes approved in admin console
- [ ] MagicDNS enabled for name resolution
- [ ] SSH enabled only for authorized nodes
- [ ] Regular key rotation (90 days)
- [ ] Monitoring and logging enabled

---

## Troubleshooting

### Common Issues

#### 1. Connection Failed

**Symptoms:** Node can't connect to Tailscale mesh

**Solutions:**
```bash
# Check Tailscale status
tailscale status

# Check if service is running
sudo systemctl status tailscaled  # Linux
Get-Service Tailscale  # Windows

# Restart service
sudo systemctl restart tailscaled  # Linux
Restart-Service Tailscale  # Windows

# Check firewall
sudo ufw status  # Linux
Get-NetFirewallRule -DisplayName "Tailscale"  # Windows
```

#### 2. DNS Resolution Fails

**Symptoms:** Can't resolve node names (e.g., `orchestrator-mini-tailscale`)

**Solutions:**
```bash
# Verify MagicDNS is enabled
tailscale status | grep "MagicDNS"

# Re-enable DNS acceptance
tailscale up --accept-dns

# Test DNS resolution
nslookup orchestrator-mini-tailscale
```

#### 3. Subnet Routes Not Working

**Symptoms:** Can't access orchestrator's local network (10.0.0.0/24)

**Solutions:**
1. **Check Admin Console**: Ensure subnet routes are approved
2. **Verify Advertisement**:
   ```bash
   tailscale status | grep "advertise-routes"
   ```
3. **Enable IP Forwarding** (Linux):
   ```bash
   sudo sysctl -w net.ipv4.ip_forward=1
   sudo sysctl -w net.ipv6.conf.all.forwarding=1
   ```

#### 4. Exit Node Not Available

**Symptoms:** Can't use orchestrator as exit node

**Solutions:**
1. **Check Admin Console**: Ensure exit node is approved
2. **Verify Advertisement**:
   ```bash
   tailscale status | grep "advertise-exit-node"
   ```
3. **Use Exit Node on Worker**:
   ```bash
   tailscale up --exit-node=orchestrator-mini-tailscale
   ```

#### 5. Slow Performance

**Symptoms:** High latency or low throughput

**Solutions:**
```bash
# Check direct vs DERP connection
tailscale status

# Direct connection (good): shows "direct"
# DERP relay (slow): shows "relay:..."

# Verify NAT traversal
tailscale netcheck

# Check for packet loss
ping -c 100 orchestrator-mini-tailscale
```

### Diagnostic Commands

```bash
# Full status
tailscale status --json

# Network check
tailscale netcheck

# List peers
tailscale status --peers

# Show Tailscale IP
tailscale ip -4
tailscale ip -6

# Ping another node
tailscale ping gaming-pc-tailscale

# View logs
journalctl -u tailscaled -f  # Linux
Get-EventLog -LogName Application -Source Tailscale  # Windows
```

---

## Performance

### Benchmarks

| Metric | Value |
|--------|-------|
| Latency (Direct P2P) | ~1-5 ms |
| Latency (DERP Relay) | ~20-50 ms |
| Throughput | ~500-1000 Mbps (LAN), ~100-200 Mbps (Internet) |
| CPU Overhead | ~1-2% per connection |
| Memory Usage | ~50-100 MB per node |

### Optimization

1. **Direct Connections**: Tailscale attempts direct P2P whenever possible
2. **DERP Fallback**: Uses relay servers when direct connection fails
3. **UDP**: Prefer UDP over TCP for better performance
4. **MTU**: Adjust MTU if experiencing fragmentation

**Check Connection Type:**
```bash
tailscale status

# Look for:
# "direct" = Fast, direct P2P connection
# "relay:..." = Slower, DERP relay
```

### Performance Tuning

```bash
# Increase UDP buffer sizes (Linux)
sudo sysctl -w net.core.rmem_max=2500000
sudo sysctl -w net.core.wmem_max=2500000

# Disable offload features if experiencing issues
sudo ethtool -K eth0 tso off gso off
```

---

## Integration with Infisical

### Storing Auth Keys

**Store auth keys securely in Infisical:**

```bash
# Set orchestrator auth key
infisical secrets set TAILSCALE_AUTH_KEY_ORCHESTRATOR tskey-auth-xxxxx \
  --env prod \
  --path /project-nyra/tailscale

# Set worker auth keys
infisical secrets set TAILSCALE_AUTH_KEY_GAMING_PC tskey-auth-xxxxx \
  --env prod \
  --path /project-nyra/tailscale

infisical secrets set TAILSCALE_AUTH_KEY_WORK_LAPTOP tskey-auth-xxxxx \
  --env prod \
  --path /project-nyra/tailscale

infisical secrets set TAILSCALE_AUTH_KEY_MEDIA_SERVER tskey-auth-xxxxx \
  --env prod \
  --path /project-nyra/tailscale
```

### Retrieving Auth Keys

**Setup scripts automatically retrieve from Infisical:**

```bash
# Retrieve in script
AUTH_KEY=$(infisical secrets get TAILSCALE_AUTH_KEY_ORCHESTRATOR \
  --env prod \
  --path /project-nyra/tailscale \
  --silent)

# Use auth key
tailscale up --authkey="$AUTH_KEY" ...
```

### Storing Node Information

**Scripts automatically store node info:**

```bash
# Node info stored after setup
TAILSCALE_NODE_ORCHESTRATOR_IP=100.x.x.1
TAILSCALE_NODE_ORCHESTRATOR_MAC=aa:bb:cc:dd:ee:ff
TAILSCALE_NODE_ORCHESTRATOR_NAME=orchestrator-mini-tailscale
```

---

## Next Steps

1. **Configure ACLs**: Apply ACL configuration from `tailscale-acls.json`
2. **Test Connectivity**: Ping all nodes to verify mesh
3. **Enable Services**: Configure services to use Tailscale IPs
4. **Monitor**: Set up monitoring for Tailscale connections
5. **Document**: Record Tailscale IPs and hostnames for reference

---

## Resources

- **Tailscale Documentation**: https://tailscale.com/kb
- **Admin Console**: https://login.tailscale.com/admin
- **ACL Editor**: https://login.tailscale.com/admin/acls
- **Auth Keys**: https://login.tailscale.com/admin/settings/keys
- **Support**: https://tailscale.com/contact/support

---

## Summary

Tailscale provides secure, zero-configuration mesh networking for Project Nyra's distributed 4PC architecture. Combined with Cloudflare tunnels for external access, it creates a robust, secure infrastructure for internal communication and orchestration.

**Key Takeaways:**
- Use Tailscale for internal PC-to-PC communication
- Use Cloudflared for external public access
- Orchestrator acts as exit node and subnet router
- MagicDNS simplifies name resolution
- ACLs enforce security policies
- Regular key rotation maintains security

---

**Last Updated**: 2026-01-15
**Version**: 1.0.0
