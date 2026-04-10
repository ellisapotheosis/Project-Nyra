# Project Nyra - 4-PC Distributed Setup Scripts

Complete setup scripts for the Project Nyra 4-PC distributed AI development environment.

## 🎯 Overview

These scripts configure:
- **Orchestrator PC**: Gitea server, Cloudflared tunnel, coordination services
- **3 Worker PCs**: GPU-powered Claude Code agents with local LLM support
- **Mesh Network**: Tailscale secure communication
- **Orchestration**: archon-os multi-agent coordination

## 📋 Prerequisites

### All PCs
- [x] Linux OS (Ubuntu 20.04+, Debian 11+, Fedora 36+, or Arch)
- [x] Sudo access
- [x] Internet connection
- [x] Git installed
- [x] Curl installed

### Orchestrator PC
- [x] 8GB+ RAM
- [x] 50GB+ free disk space
- [x] Static IP or DHCP reservation (recommended)

### Worker PCs
- [x] NVIDIA GPU with CUDA support
- [x] 16GB+ RAM recommended
- [x] 100GB+ free disk space
- [x] NVIDIA drivers installed

### Required Accounts
- [ ] Cloudflare account (free tier works)
- [ ] Tailscale account (free tier works)
- [ ] Domain name (for Cloudflared tunnel)

## 🚀 Quick Start (5-Step Setup)

### Step 1: Orchestrator - Install Gitea

```bash
# On orchestrator PC
cd /c/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/distributed-setup
sudo ./01-gitea-setup.sh
```

**What it does:**
- Installs Gitea v1.21.4
- Creates git user and directories
- Sets up systemd service
- Starts Gitea on port 3000

**After completion:**
1. Open http://localhost:3000
2. Complete initial setup wizard
3. Create admin account
4. Test by creating a test repository

**Estimated time:** 5 minutes

---

### Step 2: Orchestrator - Setup Cloudflared Tunnel

```bash
# On orchestrator PC (as regular user, not root)
./02-cloudflared-setup.sh
```

**What it does:**
- Installs cloudflared
- Authenticates with Cloudflare (opens browser)
- Creates tunnel named "nyra-gitea"
- Generates configuration
- Installs systemd service

**Interactive steps:**
1. Browser opens for Cloudflare auth - login and select domain
2. Edit config: Update YOURDOMAIN.com in `~/.cloudflared/config.yml`
3. Run DNS command shown in script output
4. Restart service: `sudo systemctl restart cloudflared`

**After completion:**
- Access Gitea externally: https://gitea.yourdomain.com
- Verify SSL certificate is automatic

**Estimated time:** 10 minutes

---

### Step 3: All PCs - Setup Tailscale Mesh

```bash
# Run on ALL 4 PCs (orchestrator + 3 workers)
./03-tailscale-setup.sh

# Script will ask:
# - PC role: 1 for orchestrator, 2 for worker
# - Worker number (if worker): 1, 2, or 3
# - Orchestrator IP (if worker): Enter from orchestrator
```

**What it does:**
- Installs Tailscale
- Joins PC to mesh network
- Configures hostname (nyra-orchestrator or nyra-worker-N)
- Sets up routes (orchestrator) or Git config (workers)

**On Orchestrator:**
1. Script shows Tailscale IP (e.g., 100.64.x.1)
2. **Save this IP** - workers need it

**On Workers:**
1. Enter orchestrator's Tailscale IP when prompted
2. Tests connectivity
3. Configures Git to use Gitea via Tailscale

**After completion:**
- Test: `ping 100.64.x.1` from workers
- Test: `git clone gitea-local:test/repo.git` from workers

**Estimated time:** 5 minutes per PC (20 minutes total)

---

### Step 4: Orchestrator - Configure archon-os

```bash
# On orchestrator PC only
./04-archon-os-distributed.sh

# Script will ask for worker Tailscale IPs:
# - Worker 1 IP: (e.g., 100.64.x.2)
# - Worker 2 IP: (e.g., 100.64.x.3)
# - Worker 3 IP: (e.g., 100.64.x.4)
```

**What it does:**
- Installs archon-os
- Creates distributed cluster configuration
- Generates orchestration scripts
- Creates worker setup packages

**After completion:**
1. Worker configs created in `/tmp/nyra-worker-N-config/`
2. Copy to workers:
   ```bash
   scp -r /tmp/nyra-worker-1-config/ user@100.64.x.2:~/
   scp -r /tmp/nyra-worker-2-config/ user@100.64.x.3:~/
   scp -r /tmp/nyra-worker-3-config/ user@100.64.x.4:~/
   ```

3. On each worker:
   ```bash
   cd nyra-worker-N-config
   ./setup.sh
   ```

**Estimated time:** 10 minutes

---

### Step 5: Test Distributed System

```bash
# On orchestrator PC
~/.archon-os/distributed/orchestrate.sh "Create a simple REST API"
```

**What happens:**
1. Task decomposed across 3 workers
2. Each worker runs Claude Code with GPU acceleration
3. Code pushed to Gitea automatically
4. Results aggregated on orchestrator

**Monitor:**
```bash
npx @archon-os/cli@latest swarm status
tailscale status
systemctl status gitea cloudflared
```

---

## 📁 What Gets Created

### Orchestrator PC
```
/var/lib/gitea/           # Gitea data
  ├── data/              # Repositories
  ├── log/               # Logs
  └── custom/            # Custom files

/etc/gitea/
  └── app.ini            # Gitea config

~/.cloudflared/
  ├── cert.pem           # Cloudflare auth
  ├── config.yml         # Tunnel config
  └── TUNNEL_ID.json     # Credentials

~/.archon-os/distributed/
  ├── cluster-config.json    # Cluster topology
  └── orchestrate.sh         # Orchestration script

/tmp/nyra-worker-*-config/   # Worker setup packages
```

### Worker PCs
```
~/.config/nyra/
  └── cluster.conf       # Worker configuration

~/nyra-workspace/        # Work directory
```

## 🔧 Configuration Files

### Gitea (`/etc/gitea/app.ini`)
```ini
[server]
HTTP_PORT = 3000
SSH_PORT = 2222

[repository]
DEFAULT_BRANCH = main

[actions]
ENABLED = true
```

### Cloudflared (`~/.cloudflared/config.yml`)
```yaml
tunnel: TUNNEL_ID
credentials-file: /home/user/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: gitea.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

### archon-os (`~/.archon-os/distributed/cluster-config.json`)
```json
{
  "cluster": {
    "orchestrator": {
      "host": "100.64.x.1",
      "services": ["gitea", "orchestration"]
    },
    "workers": [
      {"id": "gpu-worker-1", "host": "100.64.x.2", "gpu": true},
      {"id": "gpu-worker-2", "host": "100.64.x.3", "gpu": true},
      {"id": "gpu-worker-3", "host": "100.64.x.4", "gpu": true}
    ]
  },
  "coordination": {
    "topology": "hierarchical",
    "strategy": "gpu-aware",
    "load_balancing": {"enabled": true}
  }
}
```

## 🛠️ Troubleshooting

### Gitea Not Starting
```bash
# Check logs
sudo journalctl -u gitea -f

# Check permissions
ls -la /var/lib/gitea/
sudo chown -R git:git /var/lib/gitea/

# Restart
sudo systemctl restart gitea
```

### Cloudflared Tunnel Issues
```bash
# Check status
sudo systemctl status cloudflared

# Test tunnel
cloudflared tunnel info nyra-gitea

# Check logs
sudo journalctl -u cloudflared -f

# Manual run (for testing)
cloudflared tunnel run nyra-gitea
```

### Tailscale Connectivity Issues
```bash
# Check status
tailscale status

# Test ping
ping 100.64.x.1

# Re-authenticate
sudo tailscale logout
sudo tailscale up

# Check routes
tailscale status --peers
```

### Worker Can't Reach Gitea
```bash
# Test connectivity
ping 100.64.x.1
curl http://100.64.x.1:3000

# Check Git config
git config --global --list | grep gitea

# Re-run Tailscale setup
./03-tailscale-setup.sh
```

## 📊 System Status Commands

### Check All Services
```bash
# On Orchestrator
systemctl status gitea cloudflared tailscaled

# On Workers
systemctl status tailscaled
tailscale status
```

### Monitor Distributed Tasks
```bash
# archon-os status
npx @archon-os/cli@latest swarm status

# Agent list
npx @archon-os/cli@latest agent list

# Task status
npx @archon-os/cli@latest task list
```

### Network Status
```bash
# Tailscale network
tailscale status

# Cloudflared tunnel
sudo cloudflared tunnel info nyra-gitea

# Gitea health
curl http://localhost:3000/api/healthz
```

## 🔐 Security Best Practices

1. **Gitea**:
   - Enable 2FA for all users
   - Use strong passwords
   - Regular backups: `/var/lib/gitea/data/gitea.db`

2. **Cloudflared**:
   - Zero-trust by default
   - Configure access policies in Cloudflare dashboard
   - Monitor access logs

3. **Tailscale**:
   - Enable MFA in Tailscale admin
   - Use ACLs for access control
   - Regularly review connected devices

4. **Workers**:
   - Keep NVIDIA drivers updated
   - Firewall unnecessary ports
   - Use SSH keys instead of passwords

## 📖 Additional Documentation

- **Architecture**: `../docs/distributed-architecture.md`
- **Gitea Docs**: https://docs.gitea.io
- **Cloudflared Docs**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps
- **Tailscale Docs**: https://tailscale.com/kb
- **archon-os**: https://github.com/ruvnet/archon-os

## 🎯 Usage Examples

### Create a Feature
```bash
# On orchestrator
~/.archon-os/distributed/orchestrate.sh "Build user authentication system with JWT"
```

### Review Code
```bash
npx @archon-os/cli@latest github code-review owner/repo --pr 123
```

### Run Tests
```bash
npx @archon-os/cli@latest task create tester "Run full test suite"
```

## 🤝 Support

**Issues with scripts**: Create issue in Project Nyra repo
**Gitea questions**: https://discourse.gitea.io
**Cloudflare support**: https://community.cloudflare.com
**Tailscale help**: https://tailscale.com/contact

---

**Ready to begin?** Start with Step 1: `sudo ./01-gitea-setup.sh`
