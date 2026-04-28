# Owner Manual Actions

## Cloudflare Tunnel Public Hostnames

Manual owner action is required because Cloudflare dashboard login, DNS ownership, and Zero Trust Access policy changes require account access.

Use `docs/CLOUDFLARE_UI_DNS_WALKTHROUGH.md` and these backup configs:

- `infra/hosts/orchestrator/cloudflared-config.yml`
- `infra/hosts/oracle-vps/cloudflared-config.yml`

Create the two tunnels, add the public hostname mappings, and apply Access policies to every private UI before use.
