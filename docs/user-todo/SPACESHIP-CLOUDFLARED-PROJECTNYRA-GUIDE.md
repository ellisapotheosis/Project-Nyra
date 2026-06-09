# Spaceship And Cloudflared Project Nyra Setup Guide

Last updated: 2026-05-22

This guide lists the owner-only actions needed in Spaceship and Cloudflare so an
agent can finish the `projectnyra.com` routing, Access, tunnel, and smoke-test
work from the repo.

Do not paste secrets, tunnel tokens, API tokens, cookies, or one-time login
codes into this file.

## Current State

- `projectnyra.com` is the platform/product domain.
- `ratehunter.net` is the public landing domain only.
- No APIs, MCP servers, admin UIs, workers, or tunnels should use
  `*.ratehunter.net`.
- Cloudflare API apply already pushed the Project Nyra tunnel ingress configs.
- Cloudflare API apply already upserted 22 proxied `projectnyra.com` DNS CNAMEs.
- The last recorded Cloudflare state for `projectnyra.com` was `pending`.
- Cloudflare assigned nameservers for `projectnyra.com`:
  `mcgrory.ns.cloudflare.com` and `zita.ns.cloudflare.com`.
- Cloudflare Access app creation failed while the zone was pending with:
  `domain does not belong to zone`.
- This WSL/Codex environment will not have local `cloudflared` or Tailscale.
  Tunnels are containerized in host compose files.
- The active Codex process may still inherit an expired `INFISICAL_TOKEN`.
  If that happens, unset `INFISICAL_TOKEN` or refresh the export in
  `~/.zsh/99-secrets.zsh` so the logged-in Infisical session is not overridden.

## Goal

After you finish these actions, an agent should be able to:

1. Confirm `projectnyra.com` is active in Cloudflare.
2. Re-run Cloudflare Access app apply.
3. Verify tunnel/DNS state through the Cloudflare API.
4. Restart or validate containerized tunnel connectors if needed.
5. Smoke-test protected Project Nyra hostnames.

## Part 1 - Spaceship: Point `projectnyra.com` At Cloudflare

Do this in Spaceship for `projectnyra.com`.

1. Log in to Spaceship.
2. Open the domain manager for `projectnyra.com`.
3. Find DNSSEC settings.
4. If DNSSEC is enabled, disable it before changing nameservers.
5. Open the nameserver settings.
6. Choose custom nameservers.
7. In Cloudflare, open the `projectnyra.com` zone and confirm the assigned
   nameservers are:

   ```text
   mcgrory.ns.cloudflare.com
   zita.ns.cloudflare.com
   ```

8. Paste those two Cloudflare nameservers into Spaceship.
9. Remove all non-Cloudflare authoritative nameservers for `projectnyra.com`.
10. Save the nameserver change.
11. Wait for Spaceship to show the update as saved.

Completion evidence to record:

```text
projectnyra.com nameservers changed at Spaceship on YYYY-MM-DD HH:MM PT.
DNSSEC was disabled before the change: yes/no.
Cloudflare zone status after change: pending/active.
```

## Part 2 - Spaceship: Keep `ratehunter.net` Landing-Only

Do this in Spaceship for `ratehunter.net`.

1. Confirm `ratehunter.net` remains owned and renewable.
2. Confirm DNSSEC is either disabled or correctly configured for Cloudflare if
   Cloudflare is authoritative.
3. Confirm `ratehunter.net` points at the Cloudflare zone or Pages setup that
   serves only the landing site.
4. Do not create Spaceship DNS records for `api.ratehunter.net`,
   `n8n.ratehunter.net`, `crm.ratehunter.net`, `nexus.ratehunter.net`, worker
   hostnames, MCP hostnames, or admin hostnames.
5. Do not use RateHunter subdomains as temporary Project Nyra service routes.

Allowed RateHunter public surface:

```text
ratehunter.net
```

Disallowed RateHunter platform surfaces:

```text
*.ratehunter.net
```

## Part 3 - Cloudflare: Confirm The `projectnyra.com` Zone Is Active

Do this in Cloudflare after Spaceship nameservers are saved.

1. Open Cloudflare Dashboard.
2. Open the `projectnyra.com` zone.
3. Confirm Cloudflare shows the zone as `Active`.
4. If the zone is still `Pending`, use Cloudflare's nameserver re-check button.
5. Confirm Cloudflare lists the same nameservers you entered in Spaceship.
6. Do not proceed to Access app setup until the zone is active.

Completion evidence to record:

```text
projectnyra.com Cloudflare zone status: Active
Checked on: YYYY-MM-DD HH:MM PT
```

## Part 4 - Cloudflare DNS: Expected Project Nyra Records

The repo script has already attempted to create these as proxied CNAME records
to the correct Cloudflare Tunnel IDs.

Confirm these DNS records exist under the `projectnyra.com` Cloudflare zone:

```text
activepieces.projectnyra.com
api.projectnyra.com
app.projectnyra.com
cadvisor.projectnyra.com
clawteam.projectnyra.com
crm.projectnyra.com
git-ssh.projectnyra.com
gitea.projectnyra.com
grafana.projectnyra.com
hooks.projectnyra.com
links.projectnyra.com
linkwarden.projectnyra.com
litellm.projectnyra.com
n8n.projectnyra.com
nexus-router.projectnyra.com
nexus.projectnyra.com
openclaw-gateway.projectnyra.com
openwebui.projectnyra.com
gastown.projectnyra.com
portainer-oracle.projectnyra.com
prometheus.projectnyra.com
twenty.projectnyra.com
```

Expected DNS shape:

```text
Type: CNAME
Proxy status: Proxied
Target: <tunnel-id>.cfargotunnel.com
```

Do not manually point these records at public IPs.

## Part 5 - Cloudflare Zero Trust: Tunnels

Open Cloudflare Zero Trust and confirm the tunnel objects exist.

Expected tunnels:

```text
orchestrator
oracle / oracle-vps
```

The exact display names may differ, but the repo expects:

- Orchestrator tunnel ID stored as `ORCHESTRATOR_TUNNEL_ID`
- Oracle tunnel ID stored as `ORACLE_TUNNEL_ID`
- Orchestrator tunnel token stored as `ORCHESTRATOR_TUNNEL_TOKEN`
- Oracle tunnel token stored as `ORACLE_TUNNEL_TOKEN`

Expected tunnel connector model:

- Connectors run from Docker/Compose on the target hosts.
- Do not install or expect local `cloudflared` in WSL.
- Do not expose raw worker inference endpoints through tunnel hostnames.

If a tunnel is missing:

1. Create it in Cloudflare Zero Trust.
2. Choose Cloudflared connector.
3. Copy the tunnel ID and token.
4. Store them in Infisical under the existing machine path.
5. Do not paste the token into repo docs or chat.

## Part 6 - Infisical: Make Agent Access Usable Again

Before asking an agent to finish the Cloudflare apply:

1. Renew or refresh the Infisical token/session used by this workspace.
2. Confirm the agent shell can read `/shared` Cloudflare credentials.
3. Confirm these secrets exist in the existing paths, without creating new
   folders:

```text
/shared/CLOUDFLARE_ACCOUNT_ID
/shared/CLOUDFLARE_EMAIL
/shared/CLOUDFLARE_API_KEY
/shared/CLOUDFLARE_API_TOKEN
/shared/CLOUDFLARE_ZONE_ID
/shared/ORCHESTRATOR_TUNNEL_ID
/shared/ORCHESTRATOR_TUNNEL_TOKEN
/shared/ORACLE_TUNNEL_ID
/shared/ORACLE_TUNNEL_TOKEN
```

If there are machine-specific copies under `/machines/orchestrator` or
`/machines/oracle-vps`, keep those too. Do not create new folders for this.

Tell the agent only:

```text
Infisical access is refreshed. Re-check Cloudflare secrets from Infisical.
```

Do not send secret values.

## Part 7 - Cloudflare Access: Required After Zone Activation

Once `projectnyra.com` is active, ask the agent to rerun:

```bash
bash infra/cloudflare/apply-access-apps.sh
```

Access should protect these browser/admin surfaces:

```text
twenty.projectnyra.com
crm.projectnyra.com
n8n.projectnyra.com
gitea.projectnyra.com
activepieces.projectnyra.com
grafana.projectnyra.com
prometheus.projectnyra.com
cadvisor.projectnyra.com
openwebui.projectnyra.com
nexus.projectnyra.com
litellm.projectnyra.com
gastown.projectnyra.com
clawteam.projectnyra.com
portainer-oracle.projectnyra.com
links.projectnyra.com
linkwarden.projectnyra.com
openclaw-gateway.projectnyra.com
```

Machine/API surfaces should use service-token or signed-request controls:

```text
nexus-router.projectnyra.com
hooks.projectnyra.com
```

Public app/API surfaces need separate product-auth review:

```text
app.projectnyra.com
api.projectnyra.com
```

Do not leave admin surfaces public without Access.

## Part 8 - Containerized Cloudflared: What To Check On Hosts

Because tunnels are containerized, confirm containers rather than local CLI
state.

On orchestrator:

```bash
docker ps --filter name=cloudflared
docker compose -f infra/hosts/orchestrator/docker-compose.cloudflared.yml ps
```

On oracle-vps:

```bash
docker ps --filter name=cloudflared
docker compose -f infra/hosts/oracle-vps/docker-compose.yml ps cloudflared
```

Healthy outcome:

- Cloudflared connector container is running.
- It is using the correct tunnel token.
- It can reach its Docker network origins.
- Cloudflare Zero Trust shows active connector connections.

If the tunnel container is down:

1. Confirm the tunnel token exists in Infisical.
2. Confirm the compose-launch environment can read Infisical.
3. Restart the host-specific compose service.
4. Re-check Cloudflare Zero Trust connector status.

## Part 9 - What To Tell The Agent When Done

Send a short status update like this:

```text
projectnyra.com is active in Cloudflare.
Spaceship nameservers are set to Cloudflare.
Infisical access is refreshed.
Orchestrator and Oracle cloudflared containers are running.
Please rerun Cloudflare Access apply and smoke checks.
```

If something is not done, say exactly which item is blocked:

```text
Blocked: projectnyra.com still shows Pending in Cloudflare.
Blocked: Oracle tunnel connector is offline in Cloudflare.
Blocked: Infisical token still errors.
```

## Part 10 - Agent Follow-Up Commands

After you complete the owner-only actions, the agent should run:

```bash
cd /home/ellisapotheosis/repos/project-nyra

bash infra/cloudflare/apply-cloudflare-desired-state.sh
bash infra/cloudflare/apply-access-apps.sh

jq -s '{dns_total:length,dns_successes:map(select(.success==true))|length,dns_failures:map(select(.success!=true))|length}' \
  infra/cloudflare/apply-results/dns-upsert.ndjson

jq -s '{access_total:length,access_successes:map(select(.success==true))|length,access_failures:map(select(.success!=true))|length}' \
  infra/cloudflare/apply-results/access-upsert.ndjson
```

Then smoke-test:

```bash
curl -I https://app.projectnyra.com
curl -I https://api.projectnyra.com/auth/v1/health
curl -I https://n8n.projectnyra.com
curl -I https://nexus.projectnyra.com
curl -I https://nexus-router.projectnyra.com
curl -I https://grafana.projectnyra.com
```

Expected broad results:

- Admin/browser surfaces should return a Cloudflare Access challenge or an
  authenticated app response.
- `api.projectnyra.com` should reach the intended API/Auth gateway.
- Raw databases, queues, vector stores, worker model ports, and Docker sockets
  should not be publicly reachable.

## Stop Condition

This owner task is done when:

- Spaceship uses Cloudflare nameservers for `projectnyra.com`.
- Cloudflare shows `projectnyra.com` as active.
- Cloudflare DNS contains the expected Project Nyra tunnel CNAME records.
- Cloudflare Access exists for protected admin/internal hostnames.
- Orchestrator and Oracle cloudflared containers show active connectors.
- The agent can run API verification and smoke checks without dashboard login.
