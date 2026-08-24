# Infrastructure Harmonization Audit — 2026-07-26

## Result

This was a read-only audit with no service restarts, no Tailscale daemon changes, no Cloudflare mutations, and no secret values accessed. Harmonization is **blocked on live control-plane access**: this WSL Tailscale client is logged out, the Home Assistant host is unreachable, and the current shell has no authenticated Cloudflare CLI/API session.

The most important confirmed defect is:

```text
homeassistant.projectnyra.com -> CNAME 46vhtxjc23tl5l4mvdnbj4pmbzfdpa4x.ui.nabu.casa
```

That legacy Nabu Casa record explains why the requested private route is not reaching `100.64.0.2:8123`. The checked-in DNS snapshot also contains a separate `ha.projectnyra.com` tunnel record, but the live private DNS path could not be verified from this session.

## Scope and safety boundary

- Canonical source inspected: `infra/hosts/<hostname>/`.
- All compose-like YAML files under `infra/hosts/` were parsed for declared services, container names, `ports`, and `expose` fields.
- The four active host families were inspected: `oracle-vps`, `orchestrator`, `worker-rtx3060`, `worker-rtx3090ti` and `worker-rtx5090`.
- `worker-rtx5090` Tailscale was not restarted or reconfigured.
- Existing unrelated worktree changes were preserved; this report is the only task artifact added.

## Canonical compose inventory

These are **declared service-entry counts**, not proof that every entry is running. Compose files include optional overlays and historical migrated stacks, so runtime status must be derived from each host's Docker daemon.

| Host               |      Compose-like files | Declared service entries | Runtime evidence                                                          |
| ------------------ | ----------------------: | -----------------------: | ------------------------------------------------------------------------- |
| `oracle-vps`       |                      28 |                      120 | Docker context `oracle` reachable; active stack observed                  |
| `orchestrator`     |                      14 |                       34 | Docker SSH handshake timed out                                            |
| `worker-rtx3060`   |                      10 |                       31 | Docker SSH handshake timed out                                            |
| `worker-rtx3090ti` |                      10 |                       41 | Docker SSH handshake timed out                                            |
| `worker-rtx5090`   |                      10 |                       40 | Docker Desktop context available in agent lane; no Tailscale changes made |
| `homeassistant`    | 0 runtime compose files |                        0 | Only `.env.homeassistant-stack.example`; no canonical stack present       |

The source-of-truth check passed:

```text
OK: all compose source files are under infra/hosts/*
```

### Observed Oracle runtime

The reachable `oracle` Docker context reported active services including:

| Container                   | Published endpoint(s)  | Intended private/public route evidence                                             |
| --------------------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `nyra-tailscale-caddy`      | `0.0.0.0:80->80`       | Tailscale/private reverse-proxy entry point                                        |
| `oracle-vps-cloudflared`    | none                   | Cloudflare tunnel connector                                                        |
| `oracle-vps-webapp`         | `3002->3001`           | `app.projectnyra.com` / public shell in Caddy and tunnel config                    |
| `nyra-network-nyra-nexus`   | `127.0.0.1:6000->3000` | `nexus.trex-fiordland.ts.net`; public `nexus-router`/MCP route drift exists        |
| `nyra-network-nyra-litellm` | `127.0.0.1:4010->4000` | `litellm.trex-fiordland.ts.net`; public `litellm.projectnyra.com` in desired state |
| `oracle-vps-twenty`         | `127.0.0.1:3000->3000` | `twenty.projectnyra.com`, `crm.projectnyra.com`                                    |
| `oracle-vps-activepieces`   | `127.0.0.1:8080->80`   | `activepieces.projectnyra.com`                                                     |
| `oracle-vps-n8n`            | `127.0.0.1:5678->5678` | `n8n.projectnyra.com`, `hooks.projectnyra.com`                                     |
| `oracle-vps-grafana`        | `127.0.0.1:3003->3000` | `grafana.projectnyra.com`                                                          |
| `oracle-vps-prometheus`     | `127.0.0.1:9090->9090` | `prometheus.projectnyra.com`                                                       |
| `oracle-vps-cadvisor`       | `0.0.0.0:8081->8080`   | `cadvisor.projectnyra.com`                                                         |
| `oracle-vps-openwebui`      | `0.0.0.0:8088->8080`   | `openwebui.projectnyra.com`                                                        |
| `oracle-vps-supabase-kong`  | `0.0.0.0:8000->8000`   | `api.projectnyra.com`                                                              |
| `oracle-vps-portainer-ce`   | `0.0.0.0:9000,9443`    | `portainer-oracle.projectnyra.com`                                                 |
| `oracle-vps-ha-mcp`         | internal only          | Home Assistant integration, not HA frontend                                        |

The full declared service/port extraction was performed with `yq` over every compose-like file. Since overlays can define duplicate service names and optional stacks, these records must be normalized against each host's active compose invocation before assigning a unique hostname to every container.

## Private reverse-proxy mesh findings

`infra/hosts/oracle-vps/Caddyfile` is not yet the requested `*.projectnyra.com` private mesh. It primarily serves `*.trex-fiordland.ts.net` for private services and only defines a small public `projectnyra.com` set. It has no `homeassistant.projectnyra.com` site block and no wildcard `*.projectnyra.com` site block.

The Cloudflare desired-state matrix describes private split DNS as a future Tailscale-admin/CoreDNS or dnsmasq configuration. No locally verifiable AdGuard wildcard or CoreDNS configuration was found in this checkout. Therefore no claim is made that private wildcard resolution exists.

Certificate coverage for `*.projectnyra.com` was not provable. The Caddy comments describe automatic ACME, but the active certificate store and DNS-01 credentials were not inspected.

## Home Assistant and AdGuard findings

- `tailscale status` in this shell: `Logged out.`
- `tailscale exit-node list`: no exit nodes found from this client.
- Direct probes to `100.64.0.2:8123`, `:3000`, and `:3007` were unreachable.
- No `configuration.yaml` or active Home Assistant compose stack is present under the canonical repo tree.
- `infra/hosts/homeassistant/.env.homeassistant-stack.example` exists and contains stale/inconsistent example addressing (`100.64.0.20` in places where current docs identify `100.64.0.2`).
- No live AdGuard listener or upstream configuration could be inspected.
- The local machine's port 53 listeners are loopback/system resolver surfaces, not evidence of AdGuard on Home Assistant.

The requested Home Assistant proxy settings (`use_x_forwarded_for`, trusted `100.64.0.0/10`, Oracle proxy `100.64.0.3`, and Docker subnets) remain an owner-side change until the actual Home Assistant configuration path is identified and backed up.

## Cloudflare and DNS audit

Live Cloudflare API/Zero Trust state was not queried. The repository's saved snapshot and desired state show material drift:

| Surface              | Evidence                                                                                                                                                      | Assessment                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| HA hostname          | Saved DNS snapshot has Nabu Casa CNAME for `homeassistant.projectnyra.com`; current resolver returned `129.212.197.16` through that target                    | Confirmed legacy/orphaned target; remove only after live replacement is verified |
| `ha.projectnyra.com` | Saved snapshot points to the orchestrator tunnel ID `ae0bd53a...`                                                                                             | Separate alias; target and Access policy need live verification                  |
| Apex/www             | Matrix says Pages; Oracle tunnel config still includes `projectnyra.com` and `www.projectnyra.com`; saved snapshot points both to Oracle tunnel `02fa18b6...` | Conflicting sources of truth; do not apply blindly                               |
| `mcp-gateway`        | Matrix says Oracle tunnel; generated DNS and orchestrator payload point to orchestrator                                                                       | Unresolved tunnel ownership drift                                                |
| `ratehunter.net`     | Matrix and tunnel comments say Pages-only                                                                                                                     | Intent is stable, but live DNS/Pages state was not verified                      |
| Access               | Desired Access JSON exists; live policies were not queried                                                                                                    | Unverified                                                                       |

The available shell exposed Cloudflare account/zone identifier names but no usable API/tunnel token values. `~/.cloudflared` and `~/.wrangler` auth directories were absent in the audit lane. Provider mutation was therefore not attempted.

## Runtime verification

Successful bounded checks:

- `docker --context oracle` server responded (`Docker Engine 29.5.0`, Linux ARM64).
- `http://100.64.0.3:80/` returned `HTTP/1.1 200 OK` from Caddy.
- `https://projectnyra.com` returned `HTTP/2 200`.
- `https://links.projectnyra.com` returned `HTTP/2 302` to Cloudflare Access.

Failed or incomplete checks:

- `homeassistant.projectnyra.com` resolved to the Nabu Casa endpoint, not the private proxy.
- `https://ha.projectnyra.com` did not resolve in the runtime lane.
- `https://portainer.projectnyra.com` timed out in the bounded probe.
- Oracle cloudflared logs include DNS refresh errors: `lookup region1.v2.argotunnel.com: i/o timeout`.
- Orchestrator and GPU-worker SSH Docker contexts did not complete within the bounded timeout.
- No internal `curl` sweep of `*.projectnyra.com` is valid until private DNS and Tailscale authentication are restored.

## Required next actions, in order

1. Restore/verify the owner-controlled Tailscale session or run the audit from an authenticated tailnet node. Do not restart `worker-rtx5090` Tailscale while it is the exit node.
2. From Home Assistant, identify the actual add-on configuration path and verify AdGuard bind address, DoH upstreams, rewrites, and HA `trusted_proxies` settings. Back up before editing.
3. Choose one authoritative public model for apex/www and `mcp-gateway`; update the generated artifacts and host tunnel configs together.
4. Through an authenticated Cloudflare API session, diff both zones, enumerate active tunnels/routes, enumerate Access applications/policies, and only then remove the Nabu Casa HA record and any other orphaned legacy records.
5. Add/verify explicit private Caddy routes for each supported HTTP service, including `homeassistant.projectnyra.com`, and confirm wildcard certificate coverage.
6. Re-run the per-host runtime inventory and endpoint sweep from the authenticated tailnet, recording HTTP status, redirect/auth behavior, WebSocket upgrade behavior, and DNS answer source.

## Stop condition

This audit is complete at the evidence boundary above. No further harmonization should be claimed until Tailscale authentication, Home Assistant/AdGuard access, and Cloudflare API authorization are restored and the live-vs-desired diff is captured.
