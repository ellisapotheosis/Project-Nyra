# Tailscale Services Review

Last verified: 2026-06-01 on `oracle-vps` and `orchestrator`.

## Current `svc:*` Endpoints

The following 57 Tailscale Services are configured on Oracle VPS. The tailnet has 65 VIP service definitions total, including the pre-existing Portainer/Syncthing services and the 57 Oracle services below.

The repo-backed control files are:

- `infra/tailscale/oracle-services-policy.hujson`: service auto-approval and access grants.
- `scripts/infra/sync-tailscale-vip-services.py`: Tailscale VIP service definitions.
- `infra/hosts/oracle-vps/scripts/configure-tailscale-services.sh`: Oracle host-side service advertisements.
- `.github/workflows/tailscale-policy-sync.yml`: GitHub Actions policy test/apply and VIP service definition sync.

Validation evidence from 2026-06-01:

- Tailscale API reports 65 VIP services.
- Oracle `service-host` capability reports all 57 Oracle `svc:*` services.
- `orchestrator` resolves and reaches samples without explicit ports: `infisical` returns HTTP 200, `openmemory-mcp` returns HTTP 404 from the app, and `nexus` returns HTTP 404 from the app.

| Service                                           | Target                                       |
| ------------------------------------------------- | -------------------------------------------- |
| `activepieces.trex-fiordland.ts.net`              | `http://127.0.0.1:8080`                      |
| `cadvisor.trex-fiordland.ts.net`                  | `http://127.0.0.1:8081`                      |
| `campaign-engine.trex-fiordland.ts.net`           | `http://127.0.0.1:8020`                      |
| `clawteam.trex-fiordland.ts.net`                  | `http://127.0.0.1:8085`                      |
| `codebase-index-mcp.trex-fiordland.ts.net`        | `http://127.0.0.1:8778`                      |
| `crm-api.trex-fiordland.ts.net`                   | `http://127.0.0.1:4001`                      |
| `falkordb.trex-fiordland.ts.net`                  | TCP `127.0.0.1:6381` on service port `6379`  |
| `firecrawl-mcp.trex-fiordland.ts.net`             | `http://127.0.0.1:8772`                      |
| `gastown.trex-fiordland.ts.net`                   | `http://127.0.0.1:8096`                      |
| `git-mcp.trex-fiordland.ts.net`                   | `http://127.0.0.1:8773`                      |
| `gitea.trex-fiordland.ts.net`                     | `http://127.0.0.1:3001`                      |
| `gitea-mcp.trex-fiordland.ts.net`                 | `http://127.0.0.1:3101`                      |
| `gitea-ssh.trex-fiordland.ts.net`                 | TCP `127.0.0.1:2222` on service port `22`    |
| `gitingest-mcp.trex-fiordland.ts.net`             | `http://127.0.0.1:8777`                      |
| `grafana-oracle.trex-fiordland.ts.net`            | `http://127.0.0.1:3003`                      |
| `infisical.trex-fiordland.ts.net`                 | `http://100.64.0.3:8200`                     |
| `infisical-mcp.trex-fiordland.ts.net`             | `http://127.0.0.1:8766`                      |
| `infisical-postgres.trex-fiordland.ts.net`        | TCP `127.0.0.1:5433` on service port `5432`  |
| `infisical-redis.trex-fiordland.ts.net`           | TCP `127.0.0.1:6380` on service port `6379`  |
| `letta.trex-fiordland.ts.net`                     | `http://127.0.0.1:8283`                      |
| `letta-mcp.trex-fiordland.ts.net`                 | `http://127.0.0.1:8284`                      |
| `litellm.trex-fiordland.ts.net`                   | `http://127.0.0.1:4000`                      |
| `loki-oracle.trex-fiordland.ts.net`               | `http://127.0.0.1:3100`                      |
| `magicui-mcp.trex-fiordland.ts.net`               | `http://127.0.0.1:8768`                      |
| `mem0.trex-fiordland.ts.net`                      | `http://127.0.0.1:5001`                      |
| `mem0-rest.trex-fiordland.ts.net`                 | `http://127.0.0.1:5000`                      |
| `memos.trex-fiordland.ts.net`                     | `http://127.0.0.1:8001`                      |
| `memos-mcp.trex-fiordland.ts.net`                 | `http://127.0.0.1:8095`                      |
| `n8n.trex-fiordland.ts.net`                       | `http://127.0.0.1:5678`                      |
| `next-devtools-mcp.trex-fiordland.ts.net`         | `http://127.0.0.1:8774`                      |
| `nexus.trex-fiordland.ts.net`                     | `http://127.0.0.1:6000`                      |
| `nexus-ui.trex-fiordland.ts.net`                  | `http://127.0.0.1:3016`                      |
| `openlit.trex-fiordland.ts.net`                   | `http://127.0.0.1:3004`                      |
| `openlit-clickhouse-http.trex-fiordland.ts.net`   | `http://127.0.0.1:8123`                      |
| `openlit-clickhouse-native.trex-fiordland.ts.net` | TCP `127.0.0.1:19000` on service port `9000` |
| `openlit-otlp-grpc.trex-fiordland.ts.net`         | TCP `127.0.0.1:4317` on service port `4317`  |
| `openlit-otlp-http.trex-fiordland.ts.net`         | TCP `127.0.0.1:4318` on service port `4318`  |
| `openmemory-mcp.trex-fiordland.ts.net`            | `http://127.0.0.1:8765`                      |
| `openwebui.trex-fiordland.ts.net`                 | `http://127.0.0.1:8088`                      |
| `playwright-mcp.trex-fiordland.ts.net`            | `http://127.0.0.1:8771`                      |
| `portainer.trex-fiordland.ts.net`                 | `http://127.0.0.1:9000`                      |
| `portainer-secure.trex-fiordland.ts.net`          | `https://127.0.0.1:9443`                     |
| `portainer-tunnel.trex-fiordland.ts.net`          | `http://127.0.0.1:8050`                      |
| `projectnyra.trex-fiordland.ts.net`               | `http://127.0.0.1:3002`                      |
| `prometheus-oracle.trex-fiordland.ts.net`         | `http://127.0.0.1:9090`                      |
| `quote-api.trex-fiordland.ts.net`                 | `http://127.0.0.1:7070`                      |
| `quote-engine.trex-fiordland.ts.net`              | `http://127.0.0.1:8089`                      |
| `sequential-thinking-mcp.trex-fiordland.ts.net`   | `http://127.0.0.1:8770`                      |
| `shadcn-mcp.trex-fiordland.ts.net`                | `http://127.0.0.1:8769`                      |
| `supabase-db.trex-fiordland.ts.net`               | TCP `127.0.0.1:54322` on service port `5432` |
| `supabase-kong.trex-fiordland.ts.net`             | `http://127.0.0.1:8000`                      |
| `tailscale-mcp.trex-fiordland.ts.net`             | `http://127.0.0.1:8780`                      |
| `tavily-mcp.trex-fiordland.ts.net`                | `http://127.0.0.1:8775`                      |
| `twenty-crm.trex-fiordland.ts.net`                | `http://127.0.0.1:3000`                      |
| `twenty-mcp.trex-fiordland.ts.net`                | `http://127.0.0.1:8400`                      |
| `wcgw-mcp.trex-fiordland.ts.net`                  | `http://127.0.0.1:8776`                      |
| `webapp.trex-fiordland.ts.net`                    | `http://127.0.0.1:3002`                      |

## Remaining Candidates

None from the last review. Nexus MCP verification returned `expected 57`, `actual 57`, `missing none`.
