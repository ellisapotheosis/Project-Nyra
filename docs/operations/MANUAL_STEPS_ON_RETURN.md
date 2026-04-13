# Manual login steps only (Cloudflare dashboard / auth required)

1. Log in to Cloudflare Zero Trust dashboard for `ratehunter.net`.
2. Create/confirm two named tunnels:
   - `nyra-orchestrator`
   - `nyra-oracle`
3. Download tunnel credential JSON for each tunnel and place them on orchestrator repo path:
   - `infra/cloudflared/credentials/orchestrator.json`
   - `infra/cloudflared/credentials/oracle.json`
4. Update `infra/cloudflared/.env.cloudflared` with real tunnel UUIDs and credentials paths.
5. Create proxied CNAME routes for required hostnames (see `CLOUDFLARED_DNS_RECORDS.md`).
6. Create/attach Cloudflare Access applications + policies for:
   - `gitea.ratehunter.net`
   - `twenty.ratehunter.net`
   - `activepieces.ratehunter.net`
   - `n8n.ratehunter.net`
   - `grafana.ratehunter.net`
   - `archon.ratehunter.net`
   - `bot.ratehunter.net`
7. Confirm `ratehunter.net` apex remains bound to Cloudflare Pages and not tunnelled.
