# NYRA 5-Node Bootstrap Deployment

Complete one-command deployment of .zsh configuration, SSH setup, docker contexts, and Portainer across all 5 cluster nodes.

## Prerequisites

✓ SSH key: `~/.ssh/id_ed25519` (Ed25519 recommended)
✓ Tailscale VPN active and connected to mesh
✓ Git repository initialized
✓ `rsync` installed locally

## Quick Start

```bash
# From project root
bash infra/bootstrap/DEPLOY-ALL-NODES.sh

# Or skip interactive prompts:
bash infra/bootstrap/DEPLOY-ALL-NODES.sh --confirm
```

## What It Does

Per each node (orchestrator, oracle-vps, worker-rtx5090, worker-rtx3090ti, ):

1. **Deploys .zsh configuration** via rsync
   - Copies entire `zsh-config/` directory to `~/bootstrap-zsh-config/`
   - Runs `BOOTSTRAP.sh` to set up `~/.zsh/` and symlink `.zshrc`
   - Preserves existing `~/.zsh/99-secrets.zsh` if present, otherwise creates it from template

2. **Sets up SSH config** (`~/.ssh/config`)
   - Adds all 5 cluster nodes as Host entries
   - Populates `~/.ssh/known_hosts` with public keys
   - Enables passwordless SSH between nodes

3. **Configures docker contexts** (workers only)
   - Creates `docker context` for each remote node
   - Enables `docker --context worker-rtx5090` syntax

4. **Bootstraps Portainer**
   - **Orchestrator:** Portainer CE Server (port 9443)
   - **Workers:** Portainer Edge Agents (auto-register to server)

## SSH Details

| Node | Tailscale Host | Port | Type |
|------|---|------|------|
| orchestrator | orchestrator.trex-fiordland.ts.net | 22 | Linux |
| oracle-vps | oracle-vps.trex-fiordland.ts.net | 22 | Linux |
| worker-rtx5090 | worker-rtx5090.trex-fiordland.ts.net | 2222 | WSL2 |
| worker-rtx3090ti | worker-rtx3090ti.trex-fiordland.ts.net | 22 | Linux |

SSH user: `edane` on all nodes

## After Deployment

1. **Verify SSH aliases work:**
   ```bash
   ssh orchestrator      # Should SSH into orchestrator
   ssh oracle-vps
   ssh worker-rtx5090
   ssh worker-rtx3090ti
 ssh
   ```

2. **Add secrets to each node:**
   ```bash
   ssh orchestrator
   # Then manually edit ~/.zsh/99-secrets.zsh with actual tokens if it was newly created
   # Source: Your automated rotation system
   ```

3. **Reload shell with new config:**
   ```bash
   exec zsh
   ```

4. **Test cluster health:**
   ```bash
   nyra-health          # Check all workers + LLM services
   nyra-ps              # Show docker containers
   make ps              # Run from orchestrator
   ```

5. **Verify Portainer:**
   ```bash
   # From orchestrator
   curl -k https://localhost:9443
   # Then navigate to: https://orchestrator.trex-fiordland.ts.net:9443
   ```

## Troubleshooting

**SSH connection fails:**
- Ensure Tailscale is active: `tailscale status`
- Test manually: `ssh -p 2222 edane@worker-rtx5090.trex-fiordland.ts.net`
- Check firewall: Port 22 and 2222 must be open on each node

**BOOTSTRAP.sh fails:**
- Ensure oh-my-zsh not already installed: `rm -rf ~/.oh-my-zsh` if needed
- Check permissions: `chmod +x infra/bootstrap/DEPLOY-ALL-NODES.sh`
- Run with verbose: Remove `&>/dev/null` from script lines

**Portainer not accessible:**
- Verify running: `docker ps | grep portainer`
- Check ports: `curl -k https://localhost:9443/api/system/status`
- If edge agents not registering: Wait 30s, then refresh Portainer UI

**Docker contexts not working:**
- Verify context created: `docker context ls`
- Test connection: `docker --context worker-rtx5090 ps`
- Check SSH key forwarding: `ssh -A worker-rtx5090`

## Rollback

Remove bootstrap files from all nodes:
```bash
for node in orchestrator oracle-vps worker-rtx5090 worker-rtx3090ti ; do
  ssh $node "rm -rf ~/bootstrap-zsh-config && rm ~/.zshrc"
done
```

This leaves `~/.zsh/99-secrets.zsh` intact. Restore the rest of `~/.zsh` from the backup path printed by `BOOTSTRAP.sh`, or reinstall your preferred shell config.
