# TAILSCALE_CLOUDFLARE_RUNBOOK.md

## 1. Tailscale (Private Mesh)
Tailscale is the primary networking layer for internal service communication.

### Node Management
- **Orchestrator**: `orchestrator.trex-fiordland.ts.net`
- **5090 Worker**: `worker-rtx5090.trex-fiordland.ts.net`
- **3090 Ti Worker**: `worker-rtx3090ti.trex-fiordland.ts.net`
- **3060 Worker**: `worker-rtx3060.trex-fiordland.ts.net`

### Setup New Node
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --authkey=TS_AUTH_KEY --hostname=HOST_NAME
```

### Verification
```bash
tailscale status
tailscale ping orchestrator
```

## 2. Cloudflare Tunnel (Public Ingress)
Cloudflared runs on the Orchestrator to expose specific services.

### Configuration
The configuration is managed in `infra/hosts/orchestrator/docker-compose.cloudflared.yml`.

### Adding a Service
1. Add the CNAME in the Cloudflare Dashboard.
2. Update the `config.yaml` in the Cloudflared container.
3. Restart the container: `docker compose restart cloudflared`.

### Cloudflare Access
All `*.ratehunter.net` protected routes must have an Access Policy requiring:
- Corporate Email Login
- GitHub/Google SSO
- (Optional) Warp Client requirement
