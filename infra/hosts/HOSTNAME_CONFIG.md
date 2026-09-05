# Hostname Configuration — Project Nyra Cluster

**Purpose**: Define hostname resolution across the cluster, covering local
`/etc/hosts`, Tailscale mesh DNS, and Cloudflare public ingress.

**Last Updated**: 2026-09-04 (LiteLLM-native control-plane migration)

> **There are exactly TWO GPU workers.** A third (an RTX 3060) was retired and
> sold. It is not a standby, fallback, embedding host or deployment target.
>
> **Internal application traffic MUST use `100.64.0.0/10` Tailnet addresses,
> not the public `*.projectnyra.com` hostnames listed below.** The public names
> do not resolve from the Oracle container network; using them for internal
> traffic produces DNS timeouts. This was a live defect in the pre-migration
> LiteLLM config, which reached both GPU workers by public hostname. The public
> domains are for Cloudflare ingress only.
>
> The 5090 was documented here as 32 GB and elsewhere as 48 GB. `nvidia-smi`
> reports **24463 MiB** (RTX 5090 Laptop GPU). Size everything for 24 GB.

---

## Cluster Hosts

| Host                 | Role                                                                               | Network                     | Tailscale IP   | Public Domain                            |
| -------------------- | ---------------------------------------------------------------------------------- | --------------------------- | -------------- | ---------------------------------------- |
| **orchestrator**     | Control Plane (Windows host)                                                       | Tailscale                   | 100.64.0.10    | orchestrator.projectnyra.com             |
| **orchestrator-wsl** | Control Plane sidecar (WSL Ubuntu)                                                 | Tailscale                   | 100.87.255.119 | orchestrator-wsl.projectnyra.com         |
| **worker-rtx5090**   | GPU Worker — vLLM primary (**24 GB, measured**), LMCache Redis, embedding endpoint | Tailscale                   | 100.64.0.11    | worker-rtx5090.projectnyra.com           |
| **worker-rtx3090ti** | GPU Worker — vLLM secondary (24GB)                                                 | Tailscale                   | 100.64.0.13    | worker-rtx3090ti.projectnyra.com         |
| **oracle-vps**       | Cloud Backend (VPS)                                                                | Tailscale + Public Internet | 100.64.0.3     | app.projectnyra.com, crm.projectnyra.com |

---

## 1. Local Hostname Resolution (`/etc/hosts`)

All machines in the cluster must have entries for all listed hosts in their local `/etc/hosts` file. This ensures reliable DNS resolution even when Tailscale DNS resolvers are unavailable.

### Configuration Steps

#### 1a. On Each Local Machine (orchestrator + both GPU workers)

Edit `/etc/hosts` and add the following block:

```
# Project Nyra Cluster — Tailscale Mesh IPs
100.64.0.10      orchestrator
100.87.255.119   orchestrator-wsl
100.64.0.11      worker-rtx5090
100.64.0.13      worker-rtx3090ti
100.64.0.3       oracle-vps
```

**Verify with:**

```bash
getent hosts orchestrator      # Should return: 100.64.0.10 orchestrator
getent hosts orchestrator-wsl  # Should return: 100.87.255.119 orchestrator-wsl
getent hosts oracle-vps        # Should return: 100.64.0.3 oracle-vps
```

#### 1b. On Oracle VPS (Cloud)

Oracle VPS also needs `/etc/hosts` entries for all machines. However, the Tailscale IPs may differ from the LAN side depending on your Tailscale network configuration. Verify actual IPs with:

```bash
tailscale status  # On each host, shows NAME and IP
```

Add the entries to Oracle's `/etc/hosts`:

```
# Project Nyra Cluster — Tailscale Mesh IPs
100.64.0.10      orchestrator
100.87.255.119   orchestrator-wsl
100.64.0.11      worker-rtx5090
100.64.0.13      worker-rtx3090ti
100.64.0.3       oracle-vps
```

### Verification

After updating `/etc/hosts`, test resolution from each host:

```bash
# From orchestrator:
ssh worker-rtx5090 "hostname"
ping -c 1 oracle-vps
curl -I http://oracle-vps:3000/api/health  # TwentyCRM health

# From worker-rtx5090:
ssh orchestrator "docker ps"
curl -I http://orchestrator:7000/health  # Nexus Router health

# From oracle-vps:
ssh orchestrator "tailscale status"
```

---

## 2. Tailscale Mesh DNS (`.ts.net` domains)

Tailscale automatically registers all mesh nodes with the `.ts.net` domain suffix. This is handled by the Tailscale daemon and doesn't require manual configuration.

### How It Works

- Each machine in the Tailscale network gets an automatic `.ts.net` domain
- Example: `orchestrator.ts.net`, `oracle-vps.ts.net`, `worker-rtx5090.ts.net`
- These domains are resolved via Tailscale's DNS resolver (automatic on all machines once Tailscale is up)

### Verification

```bash
# Check Tailscale status
tailscale status

# Resolve via .ts.net (automatic)
ping orchestrator.ts.net
dig orchestrator.ts.net

# Curl through Tailscale mesh
curl http://orchestrator.ts.net:7000/health   # Nexus Router (via .ts.net)
curl http://worker-rtx5090.ts.net:8000/health  # vLLM (via .ts.net)
```

### Tailscale DNS Configuration

Tailscale DNS is typically enabled by default when you run `sudo tailscale up`. If DNS resolution is broken:

```bash
# Check if Tailscale DNS is active
tailscale set --nameserver +1.1.1.1  # Add Cloudflare as fallback

# For MagicDNS (automatic .ts.net resolution):
tailscale set --operator=$USER  # Ensure you have operator permissions

# Restart Tailscale daemon if needed
sudo systemctl restart tailscaled  # Linux
sudo launchctl restart com.tailscale.ipn.macos.daemon  # macOS
```

---

## 3. Cloudflare Public Ingress (`*.projectnyra.com`)

Project Nyra uses **Cloudflare Tunnel** (cloudflared) to expose public services via the `projectnyra.com` domain. Two tunnels handle this: **oracle** (app, CRM, workflows) and **orchestrator** (control plane, workers). The `ratehunter.net` domain is served by Cloudflare Pages only (not a tunnel).

### Public Service Routes

| Service                | Internal Host | Internal Port | Public Domain                        | Type |
| ---------------------- | ------------- | ------------- | ------------------------------------ | ---- |
| **Public Web Shell**   | oracle-vps    | 3001          | projectnyra.com, www.projectnyra.com | HTTP |
| **Broker Webapp**      | oracle-vps    | 3001          | app.projectnyra.com                  | HTTP |
| **Nexus Router**       | oracle-vps    | 3000          | nexus.projectnyra.com                | HTTP |
| **LiteLLM**            | oracle-vps    | 4000          | litellm.projectnyra.com              | HTTP |
| **TwentyCRM**          | oracle-vps    | 3000          | crm.projectnyra.com                  | HTTP |
| **n8n Automation**     | oracle-vps    | 5678          | n8n.projectnyra.com                  | HTTP |
| **Grafana Dashboards** | oracle-vps    | 3000          | grafana.projectnyra.com              | HTTP |
| **Admin Portal**       | orchestrator  | 3001          | admin.projectnyra.com                | HTTP |
| **Home Assistant**     | ha-green      | 8123          | ha.projectnyra.com (orch. tunnel)    | HTTP |
| **Prometheus Metrics** | oracle-vps    | 9090          | prometheus.projectnyra.com (gated)   | HTTP |

### Cloudflare Tunnel Configuration

The tunnel is managed in `infra/hosts/orchestrator/docker-compose.cloudflared.yml`. To verify it's running:

```bash
# On orchestrator
docker ps | grep cloudflared

# Check tunnel logs
docker logs nyra-cloudflared-orchestrator

# Expected output should show:
# "Your quick tunnel is now live"
# "Registered tunnel <ID>"
# "Ingress rules active"
```

### DNS Records (Cloudflare Dashboard)

The following CNAME records should point to your Cloudflare tunnel.
See the full matrix in `infra/cloudflare/generated-remote/dns-records.desired.json`.

```
projectnyra.com         → <ORACLE_TUNNEL_ID>.cfargotunnel.com
www.projectnyra.com     → <ORACLE_TUNNEL_ID>.cfargotunnel.com
app.projectnyra.com     → <ORACLE_TUNNEL_ID>.cfargotunnel.com
crm.projectnyra.com     → <ORACLE_TUNNEL_ID>.cfargotunnel.com
admin.projectnyra.com   → <ORCHESTRATOR_TUNNEL_ID>.cfargotunnel.com
ha.projectnyra.com      → <ORCHESTRATOR_TUNNEL_ID>.cfargotunnel.com
```

Apply all records atomically via `bash infra/cloudflare/apply-cloudflare-desired-state.sh`.

### Testing Public Ingress

```bash
# Test from anywhere on the internet
curl https://projectnyra.com                  # Public shell (via oracle tunnel)
curl https://app.projectnyra.com              # Broker webapp (via oracle tunnel)
curl https://crm.projectnyra.com/api/health   # TwentyCRM (via oracle tunnel)
curl https://admin.projectnyra.com/health     # Admin portal (via orchestrator tunnel)
curl https://ha.projectnyra.com               # Home Assistant (via orchestrator tunnel)

# From local machine (via Tailscale)
curl http://orchestrator.ts.net:7000/health   # Direct Tailscale access
curl http://oracle-vps.ts.net:3000/api/health # Direct Tailscale access
```

---

## 4. Network Resolution Priority

When connecting to cluster services, use this priority order:

### For Internal Services (LAN workers + Orchestrator)

1. **Local hostname** (e.g., `orchestrator`, `worker-rtx5090`)
   - Fast, always reliable within LAN
   - Uses `/etc/hosts` entries

2. **Tailscale `.ts.net`** (e.g., `orchestrator.ts.net`)
   - Reliable when Tailscale is running
   - Works from anywhere inside the mesh

### For Oracle VPS Services

1. **Local hostname** (e.g., `oracle-vps`)
   - Fastest within Tailscale mesh
   - Uses `/etc/hosts` entries

2. **Tailscale `.ts.net`** (e.g., `oracle-vps.ts.net`)
   - Fallback if local hostname fails

3. **Public domain** (e.g., `app.projectnyra.com`, `crm.projectnyra.com`)
   - For external/public access
   - Goes through Cloudflare Tunnel
   - Slightly higher latency (~50-100ms additional)

---

## 5. Troubleshooting DNS Issues

### "Cannot resolve orchestrator"

```bash
# 1. Check if /etc/hosts has the entry
grep "orchestrator" /etc/hosts

# 2. Verify Tailscale is running
tailscale status

# 3. Clear DNS cache
sudo systemctl restart systemd-resolved  # Linux
sudo dscacheutil -flushcache  # macOS
sudo ipconfig /flushdns  # Windows

# 4. Check which resolver is being used
nslookup orchestrator
dig orchestrator
```

### "Tailscale .ts.net domains not resolving"

```bash
# Check if MagicDNS is enabled
tailscale status | grep -i magic

# Enable if disabled
tailscale set --accept-dns=true

# Verify nameservers
cat /etc/resolv.conf  # Linux
scutil --dns  # macOS

# Should show Tailscale's nameserver (100.100.100.100)
```

### "Public domain (projectnyra.com) not accessible"

```bash
# Check if cloudflared is running
docker logs nyra-cloudflared-orchestrator | grep -i "registered\|ingress"
docker logs nyra-cloudflared-oracle | grep -i "registered\|ingress"

# Verify Cloudflare DNS records
dig app.projectnyra.com CNAME +short     # Should resolve to oracle tunnel CNAME
dig admin.projectnyra.com CNAME +short   # Should resolve to orchestrator tunnel CNAME

# Check tunnel connectivity
curl -v https://app.projectnyra.com/health
```

### "Oracle VPS unreachable from workers"

```bash
# 1. Verify Tailscale status on all machines
ssh orchestrator "tailscale status | grep oracle-vps"

# 2. Check firewall on Oracle VPS
ssh oracle-vps "sudo ufw status"  # If UFW enabled

# 3. Test direct TCP connection
ssh orchestrator "timeout 3 bash -c 'echo > /dev/tcp/oracle-vps/22' && echo OK || echo FAIL"

# 4. Ensure Oracle has entries in /etc/hosts
ssh oracle-vps "grep orchestrator /etc/hosts"
```

---

## 6. Configuration Files Reference

### Paths

| File                     | Location                                                  | Purpose                                              |
| ------------------------ | --------------------------------------------------------- | ---------------------------------------------------- |
| Local hosts              | `/etc/hosts`                                              | Manual hostname entries for all 5 hosts              |
| Tailscale status         | `tailscale status`                                        | View mesh IPs and node status                        |
| Cloudflare tunnel config | `infra/hosts/orchestrator/docker-compose.cloudflared.yml` | Public ingress tunnel definition                     |
| SSH config (recommended) | `~/.ssh/config`                                           | SSH aliases for each host (optional but recommended) |

### SSH Config Example

Create `~/.ssh/config` for convenient SSH:

```
Host orchestrator
    HostName orchestrator.ts.net
    User ellisapotheosis
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no

Host worker-rtx5090
    HostName worker-rtx5090.ts.net
    User ellisapotheosis
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no

Host worker-rtx3090ti
    HostName worker-rtx3090ti.ts.net
    User ellisapotheosis
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no

Host
 HostName
    User ellisapotheosis
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no

Host oracle-vps
    HostName oracle-vps.ts.net
    User ellisapotheosis
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no
```

Then use: `ssh orchestrator`, `ssh oracle-vps`, etc.

---

## 7. Validation Checklist

Use this checklist to verify hostname configuration is complete:

- [ ] All 5 hosts have `/etc/hosts` entries for all 5 machines (verify with `getent hosts`)
- [ ] Tailscale is running on all machines (`tailscale status` works)
- [ ] `.ts.net` domains resolve (`ping orchestrator.ts.net` succeeds)
- [ ] Internal services respond on local hostnames (`curl http://orchestrator:7000/health`)
- [ ] Cloudflare tunnel is running (`docker logs nyra-cloudflared-orchestrator` shows "registered")
- [ ] Public domains resolve (`dig app.projectnyra.com` returns Cloudflare IP)
- [ ] Public ingress works (`curl https://app.projectnyra.com/health`)
- [ ] Oracle VPS is reachable from all workers (`ssh orchestrator ssh oracle-vps hostname`)

---

## 8. Deployment Workflow

### During Infrastructure Setup (README_SETUP.md, Step 8)

1. Each team member adds `/etc/hosts` entries on their local development machine
2. Ensures Tailscale is running (`sudo tailscale up`)
3. Tests local hostname resolution (`ping orchestrator`)
4. Tests Tailscale mesh (`ping orchestrator.ts.net`)
5. Verifies public ingress (once Cloudflare tunnel is confirmed running)

### During Daily Development

1. Verify Tailscale is running: `tailscale status`
2. Use local hostnames for internal services: `curl http://orchestrator:7000/health`
3. Use `.ts.net` domains when needed: `ssh orchestrator docker ps`
4. Use public domains for external access: `curl https://app.projectnyra.com/health`

---

## See Also

- `README_SETUP.md` — Step 8 (Hostname & Local DNS Configuration)
- `NETWORK_TOPOLOGY.md` — Network discovery and service endpoint mapping
- `INFRASTRUCTURE_REFERENCE.md` — Cluster topology and service inventory
- `infra/hosts/orchestrator/docker-compose.cloudflared.yml` — Cloudflare tunnel configuration

---

**Questions?** Refer to README_SETUP.md troubleshooting or contact the infrastructure team.
