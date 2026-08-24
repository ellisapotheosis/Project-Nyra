# Cloudflare UI DNS Walkthrough

This walkthrough covers the UI hostnames for the current `infra/hosts/orchestrator` and `infra/hosts/oracle-vps` compose stacks.

Cloudflare references:

- Cloudflared config files use ordered `ingress` rules and must end with a catch-all rule such as `http_status:404`.
- Cloudflared supports HTTP, HTTPS, SSH, TCP, Unix sockets, `hello_world`, and HTTP status services.
- Use `cloudflared tunnel ingress validate` and `cloudflared tunnel ingress rule https://hostname.example.com` to validate local configs.

Source docs: https://developers.cloudflare.com/tunnel/advanced/local-management/configuration-file/

## Important Findings

- `infra/hosts/oracle-vps/resolved_config.yml` contains expanded secrets and should be treated as sensitive. Do not commit or share generated resolved compose output.
- `infra/hosts/oracle-vps/config.yml` is a generated Docker Compose config, not a Cloudflared tunnel config. The Cloudflared backup config added for Oracle is `infra/hosts/oracle-vps/cloudflared-config.yml`.
- Activepieces, OpenMemory MCP, Qdrant, Mem0, FalkorDB, Letta, ClaudeMem, and MemoryTensor/MemOS are allowed infrastructure when explicitly deployed. Raw memory/MCP endpoints should remain private unless an owner intentionally adds a protected route.
- Datastores and raw model or MCP endpoints should not get public DNS records. Keep Postgres, Redis, FalkorDB, Qdrant, Loki, worker inference, and raw MCP servers private.

## Tunnel Split

Use two Cloudflare tunnels:

| Tunnel              | Connector host  | Purpose                                            |
| ------------------- | --------------- | -------------------------------------------------- |
| `nyra-orchestrator` | orchestrator PC | Local control-plane UIs and operator tooling       |
| `nyra-oracle-vps`   | Oracle VPS      | Public landing page plus durable/private cloud UIs |

The compose files currently run Cloudflared with tunnel tokens, which means the Zero Trust dashboard owns the live Public Hostname config. The YAML files in this repo are still useful as backups and as a manual entry checklist. If you switch to locally managed tunnels, replace the placeholder tunnel IDs and mount the config at `/etc/cloudflared/config.yml`.

## Public Hostnames

These should be reachable without Cloudflare Access:

| Hostname             | Tunnel     | Origin service             | Compose source          | Notes                      |
| -------------------- | ---------- | -------------------------- | ----------------------- | -------------------------- |
| `ratehunter.net`     | Oracle VPS | `http://nyra-landing:3003` | generated Oracle config | Public landing page        |
| `www.ratehunter.net` | Oracle VPS | `http://nyra-landing:3003` | generated Oracle config | Redirect or mirror to apex |

Keep the broker/customer webapp private for now:

| Hostname              | Tunnel     | Origin service            | Access policy           |
| --------------------- | ---------- | ------------------------- | ----------------------- |
| `app.projectnyra.com` | Oracle VPS | `http://nyra-webapp:3001` | OIDC or email allowlist |

## Private UI Hostnames

Protect every hostname in this table with Cloudflare Access. Recommended baseline: require your identity provider login plus an email allowlist. For highly sensitive admin tools, also add IP restrictions or require WARP device posture.

| Hostname                           | Tunnel       | Origin service                      | Host port found | Protection                       |
| ---------------------------------- | ------------ | ----------------------------------- | --------------- | -------------------------------- |
| `admin.projectnyra.com`            | Oracle VPS   | `http://nyra-admin:3002`            | `3002`          | Access OIDC                      |
| `twenty.projectnyra.com`           | Oracle VPS   | `http://nyra-twenty:3000`           | `3000`          | Access OIDC                      |
| `n8n.projectnyra.com`              | Oracle VPS   | `http://nyra-n8n:5678`              | `5678`          | Access OIDC plus n8n auth        |
| `git.projectnyra.com`              | Oracle VPS   | `http://forgejo:3000`               | `3101 -> 3000`  | Access OIDC plus Forgejo auth    |
| `grafana.projectnyra.com`          | Oracle VPS   | `http://nyra-grafana:3000`          | `3003 -> 3000`  | Access OIDC plus Grafana auth    |
| `prometheus.projectnyra.com`       | Oracle VPS   | `http://nyra-prometheus:9090`       | `9090`          | Access OIDC                      |
| `cadvisor.projectnyra.com`         | Oracle VPS   | `http://nyra-cadvisor:8080`         | `8081 -> 8080`  | Access OIDC                      |
| `openwebui.projectnyra.com`        | Oracle VPS   | `http://nyra-openwebui:8080`        | `8088 -> 8080`  | Access OIDC                      |
| `openclaw.projectnyra.com`         | Oracle VPS   | `http://nyra-openclaw:18790`        | `18790`         | Access OIDC                      |
| `clawteam.projectnyra.com`         | Oracle VPS   | `http://nyra-clawteam:8080`         | `8090 -> 8080`  | Access OIDC                      |
| `paperclip.projectnyra.com`        | Oracle VPS   | `http://nyra-paperclip:3100`        | `3111 -> 3100`  | Access OIDC                      |
| `portainer-oracle.projectnyra.com` | Oracle VPS   | `https://nyra-portainer:9443`       | `9443`          | Access OIDC, no public Portainer |
| `litellm.projectnyra.com`          | Orchestrator | `http://nyra-litellm-router:4000`   | `4000`          | Access OIDC                      |
| `nexus.projectnyra.com`            | Orchestrator | `http://nyra-nexus:3000`            | `6000 -> 3000`  | Access OIDC                      |
| `openclaw-gateway.projectnyra.com` | Orchestrator | `http://nyra-openclaw-gateway:8001` | `8001`          | Access OIDC                      |
| `portainer.projectnyra.com`        | Orchestrator | `https://nyra-portainer:9443`       | `9443`          | Access OIDC, no public Portainer |

Optional SSH route:

| Hostname                  | Tunnel     | Origin service       | Notes                                               |
| ------------------------- | ---------- | -------------------- | --------------------------------------------------- |
| `git-ssh.projectnyra.com` | Oracle VPS | `ssh://forgejo:2222` | Requires `cloudflared access ssh`; not a browser UI |

## No Public DNS

Do not create Cloudflare Public Hostnames for these:

| Service                                                                                                | Reason                                                                                                         |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `postgres`, `twenty-db`, `forgejo-db`                                                                  | Datastores stay private                                                                                        |
| `redis`, `redis-cache`                                                                                 | Datastores stay private                                                                                        |
| `falkordb`, `qdrant`, `loki`                                                                           | Data/observability backends stay private                                                                       |
| `mem0-rest`, `openmemory-mcp`, `infisical-mcp`, `paperclip-mcp`, `twentycrm-mcp`, `docker-mcp-toolkit` | Raw API/MCP endpoints should not be browser-exposed                                                            |
| `activepieces`                                                                                         | Internal automation surface; expose only behind Cloudflare Access if an owner intentionally enables a UI route |
| `letta`                                                                                                | Memory-manager agent; add a protected route only when a focused host service is deployed                       |
| worker vLLM/Ollama endpoints                                                                           | Worker inference stays private over Tailscale                                                                  |

For AgentMemory, the compose file already binds to the Tailscale IP by default:

| Service       | Tailscale-only ports                                    |
| ------------- | ------------------------------------------------------- |
| `agentmemory` | `100.64.0.3:3111`, `100.64.0.3:3112`, `100.64.0.3:3113` |

Keep that as MagicDNS/Tailscale-only unless you add a formal Access application and service-token policy.

## Dashboard Setup Steps

1. In Cloudflare, make sure `ratehunter.net` is active in the account.
2. Go to `Zero Trust` -> `Networks` -> `Tunnels`.
3. Create or open the `nyra-orchestrator` tunnel.
4. Confirm the connector is running on the orchestrator PC with the token from `ORCHESTRATOR_TUNNEL_TOKEN`.
5. Open `Public Hostname` -> `Add a public hostname`.
6. For each orchestrator row above, enter:
   - Subdomain: the left side, for example `litellm`
   - Domain: `ratehunter.net`
   - Type: `HTTP` or `HTTPS`
   - URL: the service host and port, for example `nyra-litellm-router:4000`
7. For Portainer HTTPS origins, enable the equivalent of `No TLS Verify` because the origin certificate is self-signed.
8. Create Access applications for every private hostname before sharing the URL.
9. Repeat the process for the `nyra-oracle-vps` tunnel and all Oracle VPS rows.
10. For the public landing page hostnames, do not enable Access.
11. For private UIs, enable Access and use one policy per sensitivity group:
    - `Nyra Admin`: admin, Twenty, n8n, Portainer, Forgejo
    - `Nyra Observability`: Grafana, Prometheus, cAdvisor
    - `Nyra Assistant Workbench`: Open WebUI, OpenClaw, Clawteam, LiteLLM, Nexus, Paperclip
12. Verify DNS records were created by the tunnel UI. They should be proxied CNAME records pointing at the tunnel target.
13. Test each route from a browser in a clean profile.

## Local Config Validation

If you install `cloudflared` locally and replace the placeholder tunnel IDs:

```bash
cloudflared tunnel ingress validate --config infra/hosts/orchestrator/cloudflared-config.yml
cloudflared tunnel ingress validate --config infra/hosts/oracle-vps/cloudflared-config.yml
cloudflared tunnel ingress rule --config infra/hosts/oracle-vps/cloudflared-config.yml https://ratehunter.net
cloudflared tunnel ingress rule --config infra/hosts/oracle-vps/cloudflared-config.yml https://n8n.projectnyra.com
```

## Compose Checks Before Go-Live

Run these before wiring traffic:

```bash
docker compose -f infra/hosts/orchestrator/docker-compose.yml config
docker compose -f infra/hosts/oracle-vps/docker-compose.yml config
python3 infra/scripts/check-port-collisions.py
```

If you run the generated Oracle `config.yml` stack, manually resolve these before go-live:

| Potential conflict                                                      | Why it matters                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `landing` and `grafana` both using host port `3003` in generated config | Both cannot bind the same host port at once                         |
| `webapp` default `3001` and other host-bound services                   | Host ports must remain unique                                       |
| `mem0-rest`, `quote_engine`, and some quote APIs using `5000`           | Pick one host binding per host, or route by Docker service DNS only |

Using Cloudflared on the same Docker network avoids many host-port conflicts because the tunnel can target container DNS names directly.
