# HOST_TOPOLOGY

Last updated: 2026-05-24

All hosts are connected via Tailscale mesh. Compose stacks live under
`infra/hosts/<hostname>/`. Persistent services (Portainer + Syncthing) are defined
exclusively in `docker-compose.persistent.yml` on each host and must never be stopped
by routine application stack operations.

Prompt-pack note: references to `oracle` mean the canonical repo folder
`infra/hosts/oracle-vps`; do not create a duplicate active `infra/hosts/oracle`
tree unless performing an intentional host migration.

---

## Host Table

| Hostname            | Role                                                                       | Tailscale IP    | MAC     | OS                    |
| ------------------- | -------------------------------------------------------------------------- | --------------- | ------- | --------------------- |
| oracle-vps          | Primary cloud services, data layer, routing, observability, public ingress | 100.64.0.3      | — (VPS) | Oracle Linux / ARM64  |
| orchestrator        | Agent mesh control plane, OpenClaw gateway, llxprt subscription agents     | 100.64.0.2      | —       | Ubuntu 22.04 / x86_64 |
| worker-rtx5090      | Primary vLLM inference (RTX 5090; verify VRAM at runtime)                  | 100.64.0.7      | —       | Ubuntu 22.04 / x86_64 |
| worker-rtx3090ti    | Secondary vLLM / TTS voice node (RTX 3090 Ti; verify VRAM at runtime)      | 100.64.0.6      | —       | Ubuntu 22.04 / x86_64 |
| worker-rtx3060      | Ollama utility lane / STT voice node (RTX 3060; verify VRAM at runtime)    | 100.64.0.5      | —       | Ubuntu 22.04 / x86_64 |
| homeassistant-green | Home Assistant Green; Vaultwarden; Linkwarden                              | LAN + Tailscale | —       | HA OS                 |

---

## Per-Host Compose Profiles & Key Services

### oracle-vps (100.64.0.3)

Primary compose files:

- `docker-compose.yml` — core network stack (Postgres, Redis, TwentyCRM, Activepieces, n8n,
  quote services, cloudflared, Prometheus, Loki, Grafana, cAdvisor, OpenLIT, Open WebUI,
  MCP servers)
- `docker-compose.memory.yml` — Letta, mem0, FalkorDB, Qdrant, letta-postgres
- `docker-compose.gastown.yml` — Gastown workspace manager
- `docker-compose.gitea.yml` — Gitea source control
- `docker-compose.activepieces-mcp.yml` — Activepieces MCP bridge
- `docker-compose.letta-mcp.yml` — Letta MCP bridge
- `docker-compose.memory-extra.yml` — supplemental memory services
- `docker-compose.clawteam.yml` — Clawteam agent support
- `docker-compose.apps.yml` — broker web app services
- `docker-compose.persistent.yml` — **Portainer CE + Syncthing (NEVER stop)**

Key services: TwentyCRM :3000, Nexus Router :6000, Gastown :8080, LiteLLM :4000,
Prometheus :9090, Grafana :3001, Loki :3100, Gitea :3000 (gitea profile).

Cloudflare tunnel ID: `ae0bd53a-f22e-4414-8593-5b765dcd044b` (ORACLE_TUNNEL_TOKEN).

### orchestrator (100.64.0.2)

Primary compose files:

- `docker-compose.yml` — OpenClaw gateway :8080, docker-toolkit, postgres-client
- `docker-compose.voice.yml` — PocketTTS fallback :5002
- `docker-compose.persistent.yml` — **Portainer Agent + Syncthing (NEVER stop)**

Cloudflare tunnel: ORCHESTRATOR_TUNNEL_TOKEN (separate from oracle).
Bootstrap env vars in `.zshrc`: INFISICAL_TOKEN required for secrets-init.
llxprt-bridge runs on port 8091 (npm CLI, not a container).

### worker-rtx5090 (100.64.0.7)

Primary compose files:

- `docker-compose.yml` — vLLM :8000, LiteLLM :4000, Redis :6379, promtail,
  node-exporter :9100, gpu-exporter :9835, cAdvisor :8088, health-monitor
- `docker-compose.persistent.yml` — **Portainer Agent + Syncthing (NEVER stop)**

Bootstrap env vars in `.zshrc`: INFISICAL_TOKEN required.
Primary inference host; model-switcher sidecar manages active model.

### worker-rtx3090ti (100.64.0.6)

Primary compose files:

- `docker-compose.yml` — vLLM :8000, LiteLLM :4000, Redis :6379, promtail,
  node-exporter :9100, gpu-exporter :9835, cAdvisor :8088, health-monitor
- `docker-compose.persistent.yml` — **Portainer Agent + Syncthing (NEVER stop)**

Role in distributed voice: TTS node. Secondary inference for steady assistant workloads.

### worker-rtx3060 (100.64.0.5)

Primary compose files:

- `docker-compose.yml` — Ollama :11434, LiteLLM :4000, promtail, node-exporter :9100,
  gpu-exporter :9835, cAdvisor :8088, health-monitor
- `docker-compose.persistent.yml` — **Portainer Agent + Syncthing (NEVER stop)**

Role in distributed voice: STT node. Utility lane for embeddings, extraction, summarization.

### homeassistant-green (LAN + Tailscale)

- Home Assistant Green hardware appliance.
- Runs Vaultwarden (password manager) and Linkwarden (bookmark manager).
- Access: Tailscale only; no public exposure.
- See `infra/hosts/homeassistant-green/README.md` for details.

---

## Persistent Services Rule

`docker-compose.persistent.yml` exists on **every host**.

- Deploy: `make persistent-up` (or `docker compose -f docker-compose.persistent.yml up -d`)
- **Never run**: `make persistent-down` or stop this stack under any circumstances.
- Contains only: Portainer CE (oracle) / Portainer Agent (others) + Syncthing.
