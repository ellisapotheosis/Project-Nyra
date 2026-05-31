# Cloudflared Validation & Rollback Plan

Updated: 2026-05-28 (Prompt 07 deliverable)

---

## Step 1 — DNS Propagation Check

```bash
# Verify Cloudflare NS is authoritative for projectnyra.com
dig projectnyra.com NS +short
# Expected: mcgrory.ns.cloudflare.com., zita.ns.cloudflare.com.

# Trace the full delegation path
dig projectnyra.com NS +trace | tail -20

# Spot-check critical subdomains resolve to their tunnel CNAME
for sub in app api crm admin chat ha status uptime oracle; do
  echo -n "$sub.projectnyra.com → "
  dig "${sub}.projectnyra.com" CNAME +short
done

# Worker subdomains (orchestrator tunnel)
for sub in nerve-5090 claw-5090 nerve-3090 claw-3090 nerve-3060 picoclaw-3060; do
  echo -n "$sub.projectnyra.com → "
  dig "${sub}.projectnyra.com" CNAME +short
done

# Verify ratehunter.net is still Pages (CNAME to pages.dev)
dig ratehunter.net CNAME +short
dig www.ratehunter.net CNAME +short
```

---

## Step 2 — Config Validation (Local-Managed YAML)

After replacing `ORCHESTRATOR_TUNNEL_ID` / `ORACLE_TUNNEL_ID` placeholders:

```bash
cloudflared tunnel ingress validate infra/hosts/orchestrator/cloudflared-config.yml
cloudflared tunnel ingress validate infra/hosts/oracle-vps/cloudflared-config.yml
```

Check route selection matches expected service:

```bash
# Oracle tunnel routes
cloudflared tunnel ingress rule https://app.projectnyra.com
cloudflared tunnel ingress rule https://crm.projectnyra.com
cloudflared tunnel ingress rule https://n8n.projectnyra.com
cloudflared tunnel ingress rule https://uptime.projectnyra.com
cloudflared tunnel ingress rule https://oracle.projectnyra.com

# Orchestrator tunnel routes
cloudflared tunnel ingress rule https://admin.projectnyra.com
cloudflared tunnel ingress rule https://ha.projectnyra.com
cloudflared tunnel ingress rule https://nerve-5090.projectnyra.com
cloudflared tunnel ingress rule https://picoclaw-3060.projectnyra.com
```

---

## Step 3 — Service Reachability (from tunnel host)

### Oracle VPS — internal health checks

```bash
curl -sf http://webapp:3001    && echo "app OK"       || echo "app FAIL"
curl -sf http://twenty:3000    && echo "crm OK"       || echo "crm FAIL"
curl -sf http://n8n:5678       && echo "n8n OK"       || echo "n8n FAIL"
curl -sf http://grafana:3000   && echo "grafana OK"   || echo "grafana FAIL"
curl -sf http://paperclip:3100 && echo "paperclip OK" || echo "paperclip FAIL"
curl -sf http://nexus:3000     && echo "nexus OK"     || echo "nexus FAIL"
curl -sf http://openlit:3000   && echo "openlit OK"   || echo "openlit FAIL"
```

### Orchestrator — Tailscale reachability

```bash
tailscale ping oracle.trex-fiordland.ts.net
tailscale ping worker-rtx5090.trex-fiordland.ts.net   # May time out — that's OK
tailscale ping worker-rtx3090ti.trex-fiordland.ts.net
tailscale ping worker-rtx3060.trex-fiordland.ts.net

# Home Assistant
curl -sf --max-time 5 http://homeassistant.trex-fiordland.ts.net:8123 && echo "HA OK" || echo "HA unreachable"
```

---

## Step 4 — Browser Smoke Tests

Visit each critical URL and confirm it loads:

| URL | Expected result |
|-----|----------------|
| https://ratehunter.net | Mortgage landing page (Cloudflare Pages) |
| https://www.ratehunter.net | Redirects to ratehunter.net |
| https://app.projectnyra.com | Broker webapp login / dashboard |
| https://crm.projectnyra.com | Twenty CRM UI |
| https://admin.projectnyra.com | Admin portal |
| https://chat.projectnyra.com | Chat UI |
| https://ha.projectnyra.com | Home Assistant dashboard |
| https://status.projectnyra.com | Status / uptime dashboard |
| https://oracle.projectnyra.com | Oracle gateway (Caddy) |
| https://public-status.projectnyra.com | Public uptime page |
| https://grafana.projectnyra.com | Grafana (CF Access prompt) |
| https://portainer.projectnyra.com | Portainer (CF Access prompt) |

---

## Step 5 — Cloudflared Log Inspection

On each tunnel host, confirm no `no tunnel connection` or `no such host` errors:

```bash
# systemd-managed
sudo journalctl -u cloudflared --since "1 hour ago" | grep -E "(error|ERR|WARN)" | tail -30

# Docker-managed
docker logs nyra-cloudflared --since 1h 2>&1 | grep -E "(error|ERR|WARN)" | tail -30
```

---

## Step 6 — Home Assistant Command Deck

Open `https://ha.projectnyra.com` → Nyra Command Deck dashboard:

- [ ] Overview cards display correctly
- [ ] "App Portal" button opens https://app.projectnyra.com
- [ ] "CRM (Twenty)" button opens https://crm.projectnyra.com
- [ ] Worker section shows nerve-*/claw-* links
- [ ] Tunnels & DNS section is readable

---

## Drift Prevention Checks

Verify no private services (DB, Redis, vLLM) are exposed:

```bash
# Should return no active hostnames for these services
rg -n "postgres|redis|falkordb|qdrant|vllm|ollama|:9835|:9100|:11434|:6379|:5432|:6333" \
  infra/hosts/orchestrator/cloudflared-config.yml \
  infra/hosts/oracle-vps/cloudflared-config.yml
```

---

## Rollback Plan

### Rollback Tier 1 — Config revert (no DNS change needed)

If a tunnel config breaks services but DNS is correct:

```bash
# Restore from API backup taken by apply script
jq '.' infra/cloudflare/backups/orchestrator-current-config.json
jq '.' infra/cloudflare/backups/oracle-current-config.json

# Re-apply old configs via API
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... \
  curl -X PUT "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel/${ORCHESTRATOR_TUNNEL_ID}/configurations" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @infra/cloudflare/backups/orchestrator-current-config.json
```

### Rollback Tier 2 — DNS revert (full rollback)

If DNS is broken and services are unreachable:

```bash
# Restore DNS records from API backup
jq '.' infra/cloudflare/backups/dns-records-current.json
# Re-create records manually via Cloudflare dashboard or API
```

### Rollback Tier 3 — ratehunter.net emergency

If ratehunter.net stops serving the Pages site:

1. Navigate to Cloudflare Dashboard → Pages → ratehunter-landing → Custom Domains
2. Verify `ratehunter.net` is listed and the Pages project has a recent deployment
3. If CNAME is missing, re-add via Pages custom domain UI (not DNS tab)

---

## Post-Validation — Merge & Close

Once all checks above are green:

1. Merge PR from Prompt 04 (domain replacements) to `main`
2. Close the migration branch
3. Update `docs/DOMAIN_INVENTORY.md` with any final corrections
4. Create follow-up tickets for:
   - Wildcard cert review (if needed for `*.projectnyra.com`)
   - CSP headers on the webapp
   - Cloudflare Access policies for all `Required` hostnames in `hostname-matrix.md`
