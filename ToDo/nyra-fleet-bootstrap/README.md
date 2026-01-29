# Nyra Fleet Bootstrap (orchestrator-mini + WOL workers)

Targets:
- **orchestrator-mini** (Ubuntu) runs 24/7 and can Wake-on-LAN (WOL) your workers.
- **worker-rtx3060**, **worker-rtx5090**, **worker-rtx3090ti** (Windows) can come/go.

What this kit does
1) Collects a **detailed inventory** (host/user/specs/network/MACs/public IP) and writes it to a shared folder:
   - Windows: your OneDrive folder (auto-detected)
   - Linux: local inventory folder; optionally upload to OneDrive via `rclone`

2) Bootstraps:
   - Git clone of `github.com/ellisapotheosis/project-nyra.git`
   - Tailscale install + optional auto-join via auth key
   - cloudflared install + optional “token-run as a service” unit

3) Adds WOL tooling on the orchestrator to wake your workers.

---

## 0) Secrets / values you must set (recommended)

### Tailscale
- `TAILSCALE_AUTHKEY` (optional): pre-auth key used by `tailscale up --auth-key=...` citeturn0search9
  - Prefer ephemeral / pre-approved keys for automation; treat keys like secrets. citeturn0search2

### Cloudflare Tunnel
- `CLOUDFLARED_TUNNEL_TOKEN` (optional): token from Cloudflare Zero Trust dashboard install flow.

---

## 1) Windows (each worker laptop/desktop)

Open PowerShell **as Admin**, then run from this folder:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\windows\run_all.ps1 -Role worker -RepoUrl "https://github.com/ellisapotheosis/project-nyra.git"
```

Optional automation:
```powershell
$env:TAILSCALE_AUTHKEY="tskey-CHANGE_ME"
$env:CLOUDFLARED_TUNNEL_TOKEN="CHANGE_ME"
.\windows\run_all.ps1 -Role worker
```

Outputs:
- OneDrive\NyraFleet\inventory\machines\<COMPUTERNAME>.json
- OneDrive\NyraFleet\inventory\index.json

---

## 2) Ubuntu (orchestrator-mini)

```bash
chmod +x linux/*.sh
sudo -E ./linux/run_all.sh --role orchestrator --repo-url https://github.com/ellisapotheosis/project-nyra.git
```

Optional automation:
```bash
export TAILSCALE_AUTHKEY="tskey-CHANGE_ME"
export CLOUDFLARED_TUNNEL_TOKEN="CHANGE_ME"
sudo -E ./linux/run_all.sh --role orchestrator
```

Inventory location (Linux):
- `/srv/nyra/fleet/inventory/machines/<hostname>.json`

---

## 3) Waking your workers (run on orchestrator-mini)

1) Enable WOL in BIOS/NIC on each worker.
2) After you have inventories collected, copy MACs into `config/workers.json` (example provided).
3) Wake all:

```bash
python3 shared/wol.py --config config/workers.json --wake-all
```

---

## 4) Cloudflared + Tailscale: how they fit

- **Tailscale** = private access plane (you + teammates, ACLs, SSH, admin)
- **Cloudflare Tunnel** = browser-access plane (share later with Cloudflare Access policies)

Cloudflared “run as a service” is recommended by Cloudflare for availability. citeturn0search11turn0search0

---

## Optional: internal Git mirror (Gitea)

If you want LAN-fast clones and resilience:
- Run Gitea on orchestrator-mini using `orchestrator/gitea/docker-compose.yml` (optional).
- Keep GitHub as source-of-truth; mirror to Gitea.
