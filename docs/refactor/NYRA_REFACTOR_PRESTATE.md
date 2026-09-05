# NYRA REFACTOR — PRE-STATE SNAPSHOT

Captured: 2026-09-04
Captured from: `worker-rtx5090` (WSL2 guest, Windows host `AlienApoth51`)
Operator: Principal Systems Architect autonomous execution run

**No secret values appear in this document. Only names, versions, digests,
addresses and bind topology.**

---

## 1. Git state at start of migration

| Item               | Value                                                               |
| ------------------ | ------------------------------------------------------------------- |
| Repository         | `ellisapotheosis/Project-Nyra`                                      |
| Base branch        | `nyra/infisical-agent-vault-convergence-20260830`                   |
| Base commit SHA    | `4f2e24c43` — _feat(infra): move ClawTeam primary to orchestrator_  |
| New working branch | `nyra/litellm-native-mcp-migration-20260904`                        |
| Rollback branch    | `backup/pre-litellm-native-mcp-20260904` (created off the base SHA) |
| Execution checkout | linked git worktree at `.claude/worktrees/agent-ae8e4587ed374037e`  |

`git status --short` on the shared checkout at capture time contained only
`.agent/memory/**`, `.omc/**` and `infra/hosts/**/.omc/state/**` operational
churn (agent memory / OMC session state). No unstaged source changes.

---

## 2. Access path discovery (record so future sessions do not re-derive it)

**Tailscale runs on the Windows side of `worker-rtx5090`, not inside WSL2.**

- To query Tailscale control state you MUST shell out to Windows:

  ```bash
  powershell.exe -Command "& 'C:\Program Files\Tailscale\tailscale.exe' status"
  ```

  Invoking the WSL2-side `tailscale` binary reports "Logged out" — that is a
  false negative, not a real logout.

- **However, WSL2 _does_ have working outbound IP routing to `100.64.0.0/10`
  via the Windows host.** This was tested and confirmed:

  | Test                                       | Result                                          |
  | ------------------------------------------ | ----------------------------------------------- |
  | `ping -c1 100.64.0.3` from WSL2 bash       | 0% loss, ~32.9 ms RTT                           |
  | `ssh oracle-vps 'hostname'` from WSL2 bash | works, key-based, no prompt                     |
  | `ping -c1 100.64.0.13` from WSL2 bash      | 100% loss (host offline, not a routing failure) |

  **Therefore: use plain `ssh oracle-vps` from WSL2 bash. The
  `powershell.exe ssh` detour is NOT required for data-plane work.** Only
  `tailscale` _CLI_ queries need the PowerShell detour.

- SSH identity: `~/.ssh/id_agents_nyra` (Tailnet mesh agent key), configured in
  `~/.ssh/config` for aliases `oracle` / `oracle-vps`, `5090` /
  `worker-rtx5090`, `3090` / `worker-rtx3090ti`.

---

## 3. Live Tailnet state

Source: `tailscale status` executed on the Windows side of this machine.

| Tailnet IP                   | Node                 | OS      | Tags             | State at capture                                                         |
| ---------------------------- | -------------------- | ------- | ---------------- | ------------------------------------------------------------------------ |
| `100.64.0.11`                | `worker-rtx5090`     | windows | _(this machine)_ | **self**                                                                 |
| `100.64.0.3`                 | `oracle-vps`         | linux   | tagged-devices   | **active, direct** `163.192.46.128:41641`                                |
| `100.64.0.13`                | `worker-rtx3090ti`   | windows | tagged-devices   | **idle; offline, last seen 39 days ago**                                 |
| `100.64.0.12`                | `worker-rtx3060`     | windows | tagged-devices   | **RETIRED HOST — still a live tailnet node record, last seen 1 day ago** |
| `100.64.0.10`                | `orchestrator`       | windows | tagged-devices   | offline, last seen 5 h ago                                               |
| `100.64.0.5`                 | `aperture`           | linux   | tagged-devices   | active, direct                                                           |
| `100.64.0.2`                 | `homeassistant`      | linux   | tagged-devices   | offline, last seen 5 h ago                                               |
| `100.64.0.4` / `100.64.0.40` | `iphone` / `iphone2` | iOS     | tagged-devices   | offline                                                                  |

Tailnet domain: `trex-fiordland.ts.net`.

**Discrepancy findings:**

1. The three addresses asserted by the repository (`oracle-vps 100.64.0.3`,
   `worker-rtx5090 100.64.0.11`, `worker-rtx3090ti 100.64.0.13`) **match live
   state exactly.** No IP correction is required.
2. `worker-rtx3060` (`100.64.0.12`) is physically retired and sold, but the
   **tailnet node record still exists and was last seen 1 day ago.** This must
   be removed from the Tailscale admin console and from any ACL grants. That
   action requires Tailscale admin-console access which this run does not have;
   it is recorded as an explicit hand-off item.
3. `worker-rtx3090ti` has been offline for 39 days. No live validation of that
   host was possible in this run.

---

## 4. `worker-rtx5090` (this machine) — local state

| Item                  | Value                                            |
| --------------------- | ------------------------------------------------ |
| Hostname (Windows)    | `AlienApoth51`                                   |
| Hostname (WSL2 guest) | `AlienApoth51`                                   |
| Kernel                | `Linux 6.18.33.2-microsoft-standard-WSL2 x86_64` |
| Docker Server         | `29.7.2`                                         |
| Docker Compose        | `v5.5.0`                                         |
| GPU                   | **NVIDIA GeForce RTX 5090 Laptop GPU**           |
| VRAM                  | **24463 MiB (~23.9 GiB usable)**                 |
| NVIDIA driver         | `616.64`                                         |
| CUDA version          | not determinable from this shell (see note)      |

**GPU note (blocker):** `nvidia-smi` executed _inside this WSL2 sandbox shell_
returns `Failed to initialize NVML: GPU access blocked by the operating system`.
The GPU inventory above was obtained by shelling out to the Windows host
(`powershell.exe -Command "nvidia-smi ..."`). Consequently **this run cannot
start or validate GPU containers from inside WSL2.** vLLM/LMCache deployment on
this host is authored but not executed — see
`NYRA_REFACTOR_VALIDATION.md`.

**Repository VRAM claim corrected:** legacy Nexus code
(`services/nexus-router/src/config.ts:74`) documents the 5090 as _"48GB VRAM"_.
This is **false**. The measured device is a **24 GB Laptop 5090**. The
user-stated operational budget (24 GB on both surviving workers) is confirmed
correct by `nvidia-smi`. All model sizing in this migration uses 24 GB.

### Containers running on `worker-rtx5090` at capture

Notable — host boundaries are currently muddled; containers named for three
different logical hosts are all running on this one machine:

| Name                                        | Image                                 | Bind                           |
| ------------------------------------------- | ------------------------------------- | ------------------------------ |
| `worker-rtx5090-worker-5090-litellm`        | `ghcr.io/berriai/litellm:main-latest` | `4000/tcp` (internal)          |
| `worker-rtx5090-worker-5090-redis`          | `redis:7-alpine`                      | `127.0.0.1:6379`               |
| `worker-rtx5090-worker-5090-model-switcher` | `python:3.11-slim`                    | `0.0.0.0:8099`                 |
| `worker-rtx5090-worker-5090-health`         | `curlimages/curl:latest`              | —                              |
| `worker-rtx5090-worker-grafana`             | `grafana/grafana:latest`              | `0.0.0.0:3005`                 |
| `worker-rtx5090-worker-5090-node-exporter`  | `prom/node-exporter:latest`           | `0.0.0.0:9100`                 |
| `worker-rtx5090-infisical-agent`            | `infisical/cli:latest`                | —                              |
| `worker-rtx5090-infisical-sidecar`          | `alpine:3.20`                         | —                              |
| `worker-rtx5090-syncthing`                  | `syncthing/syncthing:latest`          | —                              |
| `worker-5090-proxy`                         | `python:3.11-slim`                    | `0.0.0.0:80`                   |
| `oracle-vps-agent-vault`                    | `infisical/agent-vault:latest`        | `127.0.0.1:14321-14322`        |
| `oracle-vps-qdrant-memory`                  | `qdrant/qdrant:latest`                | internal                       |
| `oracle-vps-letta`                          | `letta/letta:latest`                  | `127.0.0.1:8283`               |
| `oracle-vps-mem0`                           | `nyra/mem0-rest:local`                | `127.0.0.1:5001`               |
| `oracle-vps-falkordb`                       | `falkordb/falkordb:latest`            | internal                       |
| `orchestrator-openharness`                  | `python:3.11-slim`                    | `0.0.0.0:8002` (**unhealthy**) |
| `orchestrator-openharness-queue`            | `redis:7-alpine`                      | `0.0.0.0:6380`                 |
| `orchestrator-omnigent`                     | `python:3.11-slim`                    | `0.0.0.0:8003`                 |
| `orchestrator-aionui`                       | `projectnyra/aionui:latest`           | `0.0.0.0:3001` (**unhealthy**) |
| `ellisapotheosis-nerve`                     | `projectnyra/nerve:latest`            | `0.0.0.0:7000`                 |
| `ellisapotheosis-nerveui`                   | _(untagged)_                          | `0.0.0.0:5000`                 |
| `ellisapotheosis-openclaw`                  | `projectnyra/openclaw-gateway:latest` | `0.0.0.0:18789`                |
| `nyra-cloudflared-orchestrator`             | `cloudflare/cloudflared:latest`       | —                              |
| `nyra-watchtower-worker-rtx5090`            | `nickfedor/watchtower:latest`         | internal                       |

**Findings from this list, load-bearing for the migration:**

- **No vLLM container exists anywhere.** vLLM is _not currently deployed_ on
  either surviving GPU worker. Deployment steps 7–9 of the directive are
  therefore greenfield deployment, not migration.
- **No LMCache and no LMCache Redis exists anywhere.** Step 6 is greenfield.
- An Ollama listener exists on `127.0.0.1:11434` on this host.
- There is a **second LiteLLM** (`worker-rtx5090-worker-5090-litellm`, floating
  tag `main-latest`) on this worker in addition to the Oracle gateway. This
  violates the "one LiteLLM control plane" invariant and is retired by this
  migration.
- Several containers run on floating `:latest` / `:main-latest` tags. A
  `watchtower` instance is auto-updating them. That is the opposite of pinned
  production state.

---

## 5. `oracle-vps` — live state

| Item            | Value                                                                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailnet IP      | `100.64.0.3` (confirmed by `tailscale ip -4` on the host)                                                                                                                                                        |
| Hostname        | `nyra-oracle-vnic`                                                                                                                                                                                               |
| Architecture    | **`aarch64` (ARM64)**                                                                                                                                                                                            |
| Docker Server   | `29.7.2`                                                                                                                                                                                                         |
| Docker Compose  | `v5.5.0`                                                                                                                                                                                                         |
| Tailscale       | `1.102.3`                                                                                                                                                                                                        |
| RAM             | 23 GiB total / ~10 GiB available at capture                                                                                                                                                                      |
| `cloudflared`   | **not installed as a host binary**; runs as container `oracle-vps-cloudflared`, image `cloudflare/cloudflared:2026.7.1`, cmd `tunnel --no-autoupdate --protocol http2 run` (token-based, no mounted config file) |
| `infisical` CLI | **not installed as a host binary**                                                                                                                                                                               |

> ARM64 matters: every image pinned for the `oracle` profile must publish a
> `linux/arm64` manifest. This was verified for LiteLLM v1.99.1 (see §7).

### Containers running on `oracle-vps` at capture (abridged to the control plane)

| Name                             | Image                                                                                                                                                                | Bind                              |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `nyra-network-nyra-litellm`      | **`ghcr.io/berriai/litellm:v1.92.0`**                                                                                                                                | `127.0.0.1:4010 -> 4000`          |
| `oracle-vps-litellm`             | `ghcr.io/berriai/litellm:main`                                                                                                                                       | **Created (never started)**       |
| `oracle-vps-nexus-router`        | **`projectnyra/nexus-router:arm64`**                                                                                                                                 | **`0.0.0.0:7000`**                |
| `nyra-network-nyra-nexus`        | **`ghcr.io/grafbase/nexus:0.6.0`**                                                                                                                                   | internal, healthy, up 8 d         |
| `nyra-network-nyra-omniroute`    | _(local build `badb560971fd`)_                                                                                                                                       | `127.0.0.1:20128`                 |
| `nyra-network-nyra-redis-cache`  | `redis:7-alpine`                                                                                                                                                     | internal                          |
| `oracle-vps-redis`               | `redis:7-alpine`                                                                                                                                                     | **`0.0.0.0:6379`**                |
| `nyra-network-nyra-postgres`     | `postgres:15`                                                                                                                                                        | internal                          |
| `oracle-vps-cloudflared`         | `cloudflare/cloudflared:2026.7.1`                                                                                                                                    | —                                 |
| `oracle-vps-agent-vault`         | `infisical/agent-vault:latest`                                                                                                                                       | `100.64.0.3:14321-14322`          |
| `nyra-tailscale-caddy`           | `caddy:2-alpine`                                                                                                                                                     | `100.64.0.3:80`, `100.64.0.3:443` |
| `oracle-vps-twenty`              | `twentycrm/twenty:latest`                                                                                                                                            | `127.0.0.1:3000` (**unhealthy**)  |
| `oracle-vps-twenty-mcp`          | `nyra-network-twenty-mcp:latest`                                                                                                                                     | **`0.0.0.0:8400`**                |
| `oracle-vps-crm-api`             | `oracle-vps-crm-api:latest`                                                                                                                                          | **`0.0.0.0:4001`**                |
| `nyra-network-n8n`               | _(local build)_                                                                                                                                                      | **`0.0.0.0:5678`**                |
| `nyra-network-gitingest-mcp`     | `node:20-alpine`                                                                                                                                                     | **`0.0.0.0:8777`**                |
| `nyra-network-playwright-mcp`    | `mcr.microsoft.com/playwright:v1.56.1-noble`                                                                                                                         | **`0.0.0.0:8771`**                |
| `nyra-network-next-devtools-mcp` | `node:20-alpine`                                                                                                                                                     | **`0.0.0.0:8774`**                |
| `nyra-network-openclaw-gateway`  | `ghcr.io/openclaw/openclaw:latest`                                                                                                                                   | **restart-looping**               |
| `oracle-vps-campaign-engine`     | _(local build)_                                                                                                                                                      | **`0.0.0.0:8020`**                |
| memory plane                     | `qdrant/qdrant:latest` ×3, `letta/letta:latest` ×2, `pgvector/pgvector:pg16` ×2, `falkordb/falkordb:latest`, `nyra/mem0-rest:local`, `nyra/memorytensor-memos:local` | mostly loopback                   |
| observability                    | `grafana/grafana:latest` `127.0.0.1:3003`, `prom/prometheus:latest` `127.0.0.1:9090`, `ghcr.io/openlit/openlit:latest` `127.0.0.1:3004`+`4317-4318`                  | loopback                          |

### Current LiteLLM runtime binding on Oracle

- Container `nyra-network-nyra-litellm` binds **`127.0.0.1:4010 -> 4000`**.
- `tailscale serve` (process `tailscaled`) additionally listens on
  **`100.64.0.3:4000`** and fronts it. So `http://100.64.0.3:4000` is the
  tailnet-facing LiteLLM address today, served by Tailscale rather than by a
  Docker port publish.
- Config is bind-mounted read-only from
  `/home/ubuntu/project-nyra/infra/configs/litellm/config.yaml`, i.e. **the
  repository file `infra/configs/litellm/config.yaml` is the live config.**
- Startup command: `--config /app/config/config.yaml --port 4000`.
- `curl http://127.0.0.1:4010/health/readiness` on Oracle → **HTTP 200**.

### Oracle listening-socket exposure at capture (`ss -lnt`)

Bound to **`0.0.0.0` (internet-facing on a public cloud VM)**:

`23 (sshd)`, `111 (rpcbind)`, `5678 (n8n)`, `6379 (redis)`, `7000
(nexus-router)`, `7070`, `8000`, `8020`, `8050`, `8081`, `8085`, `8089`,
`54322`.

Bound to `100.64.0.3` (tailnet-only, correct): `53`, `80`, `443`, `3000`,
`3001`, `3004`, `4000`, `5001`, `6000`, `20128`, `34152`.

Bound to `127.0.0.1` (loopback-only, correct): `8283`, `8284`, `8765`, `8769`,
`9090`.

**Security findings recorded at pre-state (pre-existing, not introduced here):**

- `oracle-vps-redis` publishes **`0.0.0.0:6379`** on a public cloud VM.
- `oracle-vps-nexus-router` publishes **`0.0.0.0:7000`** on a public cloud VM.
- Several MCP servers publish `0.0.0.0` (`8400`, `8777`, `8771`, `8774`,
  `4001`).
- OmniRoute is correctly _not_ public (`100.64.0.3:20128`).

---

## 6. `worker-rtx3090ti` — NOT REACHABLE

`ping 100.64.0.13` → 100% loss. `tailscale status` reports the node **idle,
offline, last seen 39 days ago.**

No live inventory (GPU, driver, CUDA, Docker version, containers, vLLM version)
could be collected for this host. All `worker-rtx3090ti` configuration produced
by this migration is **authored but unvalidated against live hardware**. This is
recorded as residual technical debt, not as a completed step.

Repository-asserted budget for this host — 24 GB VRAM — is used unchanged
because it could not be measured.

---

## 7. Component versions at pre-state

| Component                 | Pre-state version                                                                                    | Source of truth                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| LiteLLM (Oracle, live)    | `ghcr.io/berriai/litellm:v1.92.0`                                                                    | `docker ps` on oracle-vps                      |
| LiteLLM (Oracle, stopped) | `ghcr.io/berriai/litellm:main` (floating)                                                            | `docker ps -a`                                 |
| LiteLLM (5090, live)      | `ghcr.io/berriai/litellm:main-latest` (floating)                                                     | `docker ps` local                              |
| **LiteLLM target**        | **`v1.99.1`**, reported by `importlib.metadata` inside the image as `1.99.1`                         | pulled + introspected                          |
| LiteLLM target digest     | `ghcr.io/berriai/litellm@sha256:a53a7d3ffebede1925bd3ee8a21e4a7b9b63e2e68ec883af136edcccb6eeb82c`    | `docker inspect` after pull on oracle-vps      |
| LiteLLM target platforms  | OCI index publishes `linux/amd64` **and `linux/arm64`** — ARM64 present, so Oracle can run it        | `docker manifest inspect`                      |
| Grafbase Nexus            | `ghcr.io/grafbase/nexus:0.6.0`                                                                       | `docker ps -a`                                 |
| Project-Nyra Nexus Router | `projectnyra/nexus-router:arm64`                                                                     | `docker ps`                                    |
| cloudflared               | `cloudflare/cloudflared:2026.7.1` (Oracle) / `:latest` (5090)                                        | `docker ps`                                    |
| Infisical Agent Vault     | `infisical/agent-vault:latest` (floating)                                                            | `docker ps`                                    |
| Infisical CLI (agent)     | `infisical/cli:latest` (floating)                                                                    | `docker ps`                                    |
| Tailscale                 | `1.102.3` (Oracle)                                                                                   | `tailscale version`                            |
| Docker / Compose          | `29.7.2` / `v5.5.0` on both reachable hosts                                                          | `docker version`                               |
| Redis                     | `redis:7-alpine` everywhere                                                                          | `docker ps`                                    |
| **vLLM**                  | **not deployed**                                                                                     | absent from `docker ps` on all reachable hosts |
| **LMCache**               | **not deployed**                                                                                     | absent from `docker ps` on all reachable hosts |
| OmniRoute                 | local image build `badb560971fd`, no upstream version tag                                            | `docker ps`                                    |
| ClawTeam                  | no running container on any reachable host; repo carries `infra/hosts/*/docker-compose.clawteam.yml` | `docker ps` + repo                             |
| OpenHarness               | `orchestrator-openharness` on `python:3.11-slim`, **unhealthy**                                      | `docker ps` local                              |

---

## 8. LiteLLM v1.99.1 schema facts verified against the pinned image

These were confirmed by introspecting the pulled image, not by reading docs.
They gate several directive requirements.

| Fact                                                       | Evidence                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `litellm` package version is `1.99.1`                      | `importlib.metadata.version("litellm")` inside the image                                                                                                                                                                      |
| `mcp_tool_search_enabled` **is** a real permission field   | `litellm/types/object_permission.py:25`, inside `ObjectPermissionDict`                                                                                                                                                        |
| Full `ObjectPermissionDict` fields                         | `mcp_servers`, `mcp_access_groups`, `mcp_tool_permissions`, `mcp_toolsets`, `blocked_tools`, `vector_stores`, `agents`, `agent_access_groups`, `models`, `search_tools`, `mcp_tool_search_enabled`                            |
| `mcp_semantic_tool_filter` **is** the current config block | present in the image's own `litellm/proxy/proxy_config.yaml` with keys `enabled`, `embedding_model`, `top_k`, `similarity_threshold` (shipped example uses `text-embedding-3-small`, `top_k: 5`, `similarity_threshold: 0.3`) |
| Semantic filter is implemented as a pre-call hook          | `litellm/proxy/hooks/mcp_semantic_filter/hook.py` (`SemanticToolFilterHook`)                                                                                                                                                  |
| `enable_semantic_tool_filtering`                           | **does not exist** anywhere in the image. Correctly rejected.                                                                                                                                                                 |
| `LITELLM_MCP_TOOL_SEARCH_ENABLED` env                      | **does not exist** anywhere in the image. Correctly rejected.                                                                                                                                                                 |
| `LITELLM_USE_KEYCHAIN`                                     | **does not exist** anywhere in the image. Correctly rejected.                                                                                                                                                                 |
| `agent_search`                                             | **does not exist** in v1.99.1. The directive's conditional ("where the installed release also exposes `agent_search`") is therefore **not met**; no `agent_search` config is written.                                         |
| A2A surface **does** exist                                 | `/v1/agents`, `/v1/agents/{agent_id}`, `/a2a/{agent_id}`, `/a2a/{agent_id}/.well-known/agent-card.json`, `/a2a/{agent_id}/message/send`, `/v1/a2a/{agent_id}/message/send`                                                    |

The full verified endpoint inventory is recorded separately in
`docs/refactor/LITELLM_ENDPOINTS.md`.

---

## 9. Active Project-Nyra Docker Compose files at pre-state

`git ls-files` matches **87** compose files. Non-archive actives:

- `infra/hosts/oracle-vps/` — 24 compose files including `docker-compose.yml`,
  `.litellm.yml`, `.omniroute.yml`, `.cloudflared.yml`, `.agent-vault.yml`,
  `.clawteam.yml`, `.control-plane.yml`, `.mcp-servers.yml`,
  **`.nexus-router-mcp.yml`**, plus 11 files under `migrated-compose/`.
- `infra/hosts/orchestrator/` — 18 compose files including `.litellm.yml`,
  `.clawteam.yml`, `.openharness.yml`, `.hermes-gateway.yml`,
  `.ai-gateway-faststart.yml`.
- **`infra/hosts/worker-rtx3060/`** — `docker-compose.clawteam.yml`,
  `docker-compose.gpu.yml`, `docker-compose.llxprt.yml` — **retired host, to be
  deleted.**
- `infra/hosts/worker-rtx3090ti/`, `infra/hosts/worker-rtx5090/`
- `infra/hosts/_templates/` — 4 reference/template compose files.

There is **no root `compose.yaml`** at pre-state. Host boundaries are expressed
only by directory convention, and (as §4 shows) the running containers do not
respect those boundaries.

---

## 10. Repository archaeology counts at pre-state

Executed on the working tree, whole repo, all tracked files.

```
git grep -lEi 'worker[-_]?rtx3060|worker3060|rtx[-_]?3060|100\.64\.0\.12'
  -> 218 files, 1302 matching lines
```

Distribution by top-level directory:
`infra` 77, `docs` 58, `bootstrap` 23, `scripts` 19, `development` 13,
`services` 4, `.agent` 4, `apps` 3, plus ~17 single-file hits at repo root
(`README.md`, `Makefile`, `DEPLOYMENT_GUIDE.md`, `PROJECT_ROADMAP.md`,
`IDEA.md`, the `PHASE*` handoff files, `.gitignore`, `.github/`).

```
git grep -lEi 'nexus[-_ ]?router|grafbase|nexus\.projectnyra|NEXUS_'
  -> 444 files
```

Distribution by top-level directory:
`docs` 170, `infra` 106, `apps` 44, `services` 39, `scripts` 22,
`bootstrap` 14, `development` 9, `.gitea` 7, `tests` 5, `.claude` 5,
`.github` 2, `conductor` 2, `archive` 2, plus repo-root files.

`services/nexus-router/` contains **54 tracked files** (13 route/service
modules, 8 in-service docs, 3 tests, 1 `config/config.yml`).

---

## 11. Legacy Nexus configuration captured before deletion

`services/nexus-router/config/config.yml` (whole file, no secrets):

```yaml
server: { port: 7000, log_level: info }
mcp_servers:
  - { id: twenty-crm, endpoint: http://twentycrm:3000 }
  - { id: activepieces, endpoint: http://activepieces:80 }
  - { id: n8n, endpoint: http://n8n:5678 }
routes:
  - { path: /api/quote, target: quote-api, method: [POST] }
  - { path: /api/twenty/*, target: twenty-crm, method: [GET, POST, PATCH] }
worker_lanes:
  worker-3060: { base_url: http://worker-3060-ollama:11434 }
  worker-3090ti: { base_url: http://worker-3090ti-vllm:8000 }
  worker-5090: { base_url: http://worker-5090-vllm:8000 }
```

`services/nexus-router/src/services/mcp-proxy.ts` hard-codes eight default MCP
servers (env-overridable): `github` (`:8813`), `git` (`:8812`), `bitwarden`
(`:8814`), `infisical` (`:8815`), `docker` (`:8811`), `twentycrm` (`:8182`),
`gemini` (`:8085/mcp`), `sequential-thinking` (`:8093/mcp`), plus an optional
JSON `MCP_SERVERS` env override. Tool search is Fuse.js **lexical fuzzy match**,
resynced every 300 s.

Nexus HTTP surface (`src/index.ts`): `/health`, `/v1/chat/completions`,
`/v1/models`, `/mcp/*`, `/api/rate-limits`, `/api/routing`, `/api/providers`,
metrics.

Live Nexus container env (secret values redacted): `PORT=7000`,
`LITELLM_BASE_URL=http://oracle-vps-litellm:4000/v1`, `LITELLM_API_KEY=<set>`.
Note this points at `oracle-vps-litellm`, the container that is in `Created`
state and has never started — so Nexus's LLM path is already dead upstream.

Full capability decomposition is in
`docs/refactor/NEXUS_CAPABILITY_MIGRATION_MATRIX.md`.

---

## 12. Live LiteLLM config at pre-state (`infra/configs/litellm/config.yaml`)

Summary — the file itself is preserved in git history at commit `4f2e24c43`.

- 11 `model_list` entries: `local/qwen3.8-27b` (→ `http://worker-rtx5090:8000/v1`,
  a name that does not resolve), `local/qwen3.8-27b-3090ti` (→
  `worker-rtx3090ti.projectnyra.com:8000` — **public hostname for internal
  traffic, violates the Tailnet-only rule**), **`local/qwen3-4b-3060`** and
  **`local/embeddings`** (both → `worker-rtx3060.projectnyra.com:11434` — **the
  retired host**), 3 OmniRoute aliases, 3 OpenRouter `:free` aliases.
- `router_settings`: `usage-based-routing-v2`, `num_retries: 2`,
  `cooldown_time: 30`, six fallback groups — three of which reference the
  retired 3060.
- `litellm_settings`: `mcp_aliases` for seven Cloudflare MCP endpoints. **No
  `default_key_generate_params`, no `object_permission`, no
  `mcp_semantic_tool_filter`, no cache config.**
- `mcp_servers`: seven **Cloudflare-hosted** MCP servers
  (`mcp.cloudflare.com`, `docs.`, `bindings.`, `builds.`, `observability.`,
  `ai-gateway.`), every one of them `allow_all_keys: true`. **No Nyra
  first-party MCP server is registered in LiteLLM at all** — they are all still
  behind Nexus.
- `general_settings`: `master_key`, `database_url` from env,
  `store_model_in_db: false`.

**The critical pre-state gap:** LiteLLM currently aggregates only Cloudflare's
own MCP servers, grants them to _every_ key, and holds _zero_ Nyra MCP servers.
All Nyra MCP traffic still traverses Nexus.
