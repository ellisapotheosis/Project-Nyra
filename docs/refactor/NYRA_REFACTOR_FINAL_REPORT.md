# NYRA REFACTOR — FINAL MIGRATION REPORT

**Date:** 2026-09-04
**Executed from:** `worker-rtx5090` (WSL2, Windows host `AlienApoth51`)
**Base:** `nyra/infisical-agent-vault-convergence-20260830` @ `4f2e24c43`
**Working branch:** `nyra/litellm-native-mcp-migration-20260904`
**Rollback branch:** `backup/pre-litellm-native-mcp-20260904`

No secret values appear in this report.

---

## Executive summary

Project-Nyra's control plane has been migrated from a Nexus-fronted topology to
a **LiteLLM-native** one: LiteLLM v1.99.1 pinned by digest is the single model
gateway and the single MCP aggregation layer, Cloudflare remains the only public
ingress, Tailscale is the only private transport, and Infisical is the only
secret authority.

**Five things this migration found that change the picture:**

1. **The bespoke `nexus-router` was already dead.** It serves only `/health`;
   `/mcp/*`, `/v1/models` and `/v1/chat/completions` all return 404. Its LiteLLM
   upstream container has never started.
2. **There were two different Nexuses.** The Cloudflare portal actually reached
   `ghcr.io/grafbase/nexus:0.6.0`, not the repository's service. Retargeting
   based on the repo alone would have hit the wrong thing.
3. **`http://100.64.0.3:4000` — the documented internal gateway URL — was a dead
   `tailscale serve` forward** pointing at a port nothing listened on.
4. **Every LiteLLM key could administer the Cloudflare account.** All seven
   Cloudflare MCP servers carried `allow_all_keys: true`.
5. **vLLM and LMCache were not deployed anywhere.** Steps 6–9 are greenfield
   deployment, not migration.

**What is done:** repo-side architecture, configuration validated by booting the
real pinned image, the retired GPU worker fully purged, the live Nexus registry
harvested into LiteLLM, MCP clients migrated, a 22-scenario parity gate, and the
full documentation set.

**What is not done:** anything requiring GPU passthrough, a LiteLLM master key,
or Cloudflare dashboard access. **Nexus has NOT been deleted**, because its
parity gate reports 0/22 scenarios exercised and the directive forbids deleting
a subsystem before parity.

Full evidence: `NYRA_REFACTOR_VALIDATION.md`.

---

## Exact live topology

| Host                              | Tailnet IP    | Arch        | OS             | Docker | Compose             |
| --------------------------------- | ------------- | ----------- | -------------- | ------ | ------------------- |
| `oracle-vps` (`nyra-oracle-vnic`) | `100.64.0.3`  | **aarch64** | Linux          | 29.7.2 | v5.5.0              |
| `worker-rtx5090` (`AlienApoth51`) | `100.64.0.11` | x86_64      | WSL2 6.18.33.2 | 29.7.2 | v5.5.0              |
| `worker-rtx3090ti`                | `100.64.0.13` | —           | —              | —      | — (offline 39 days) |

Tailnet `trex-fiordland.ts.net`. Repo-asserted IPs matched live exactly; no
correction required.

| GPU                | Measured                                                         |
| ------------------ | ---------------------------------------------------------------- |
| `worker-rtx5090`   | **NVIDIA GeForce RTX 5090 Laptop GPU, 24463 MiB, driver 616.64** |
| `worker-rtx3090ti` | not measurable — host offline                                    |

The repository claimed 48 GB (`nexus-router/src/config.ts`) and 32 GB
(`infra/CLAUDE.md`). Both were wrong. Everything is sized for **24 GB**.

### Versions

| Component        | Before                           | After                                                   |
| ---------------- | -------------------------------- | ------------------------------------------------------- |
| LiteLLM (Oracle) | `:v1.92.0`                       | `@sha256:a53a7d3f…eeb82c` (**v1.99.1**)                 |
| LiteLLM (5090)   | `:main-latest`                   | **retired** — single gateway                            |
| Redis            | `:7-alpine`                      | `@sha256:ff02b58f…28eadf`                               |
| vLLM             | **not deployed**                 | `lmcache/vllm-openai@sha256:cb0a7630…fb8999` (authored) |
| LMCache          | **not deployed**                 | authored                                                |
| Grafbase Nexus   | `:0.6.0`                         | pending deletion                                        |
| Nexus Router     | `projectnyra/nexus-router:arm64` | pending deletion                                        |
| cloudflared      | `:2026.7.1`                      | unchanged                                               |
| Tailscale        | `1.102.3`                        | unchanged                                               |
| OmniRoute        | local build, no upstream tag     | unchanged, needs a digest                               |

`v1.99.1` was confirmed to publish a `linux/arm64` manifest **before** pinning —
without it the whole upgrade would have been impossible on aarch64 Oracle.

---

## Nexus migration

39-row capability matrix: `NEXUS_CAPABILITY_MIGRATION_MATRIX.md`.
Architectural archive: `../archive/nexus-router-retired.md`.

| Old responsibility                                                     | Replacement                                                                                                                                                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MCP server registration (2 conflicting registries)                     | LiteLLM `mcp_servers` — one declarative registry                                                                                                                                                             |
| `GET /mcp/tools/search` (Fuse.js lexical)                              | LiteLLM Virtual Tool Search + `mcp_semantic_tool_filter` (embedding-based)                                                                                                                                   |
| Tool namespacing                                                       | LiteLLM MCP server-name namespacing + `mcp_tool_permissions`                                                                                                                                                 |
| Server `enabled` / `priority`                                          | `mcp_access_groups`; `priority` removed — it fights relevance ranking                                                                                                                                        |
| `getAuthHeaders` per-server auth                                       | `auth_type`/`auth_value` from Infisical; Agent Proxy where an agent must not hold the credential                                                                                                             |
| `middleware/oauth2.ts` (376 lines)                                     | Cloudflare Access + service tokens + LiteLLM virtual keys                                                                                                                                                    |
| Redis rate limiting                                                    | LiteLLM key `rpm_limit`/`tpm_limit`/`max_budget` + Cloudflare edge                                                                                                                                           |
| helmet/CORS/express hardening                                          | not needed — the origin is no longer publicly exposed                                                                                                                                                        |
| `parseLocalWorkers`, `worker-manager` (771 lines)                      | `model_list` + `router_settings`                                                                                                                                                                             |
| `routing.strategy`/`preferLocal`/`fallbackCloud`                       | ordered `router_settings.fallbacks`                                                                                                                                                                          |
| `provider-manager` (526), `model-discovery`, `cloud-provider-adapters` | **deleted** — re-implemented LiteLLM in front of LiteLLM                                                                                                                                                     |
| `integrations/litellm-client.ts` (273)                                 | **deleted** — the hop is removed                                                                                                                                                                             |
| metrics collector / tracker / request logger                           | LiteLLM native logging + existing Prometheus/Grafana/OpenLIT                                                                                                                                                 |
| `/api/quote`, `/api/twenty/*` routes                                   | **stayed application-side.** LiteLLM is a gateway, not the new monolith. Agent access is via a first-party MCP server with a read/write split, not an unauthenticated path wildcard carrying mutating verbs. |
| Grafbase Nexus MCP aggregation                                         | LiteLLM `mcp_servers` (registry harvested from its live `nexus.toml`)                                                                                                                                        |
| Cloudflare portal → Nexus                                              | portal → LiteLLM `/mcp`; **boundary preserved, origin changed**                                                                                                                                              |

**Deliberately not reproduced:** Bitwarden MCP (Infisical is the secret
authority), Gemini MCP (providers belong in `model_list`), `search-terms` route
(no callers), server `priority`, and the bespoke OAuth2 layer.

**Deletion status: NOT DELETED.** See "Remaining work".

---

## Retired GPU worker purge

Every category the directive lists, removed from active source, deployment,
docs and configuration. **Git history untouched.**

| Category                      | Action                                                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Host directory                | `infra/hosts/worker-rtx3060/` — **54 files deleted** (compose overlays, embedding-service, health-monitor, model-switcher, promtail, PS1 lifecycle scripts) |
| Deployment target             | removed from `deploy-all.sh`, `DEPLOY-ALL-NODES.sh`, `node-up.sh`, `node-down.sh`, `nyra` CLI                                                               |
| Makefile                      | 55 lines: targets, variables, docker contexts, host lists. `make -n` parses clean                                                                           |
| Worker lane / fallback        | removed from LiteLLM `model_list` and every fallback chain                                                                                                  |
| Embedding host                | **workload moved, not dropped** — see below                                                                                                                 |
| Ollama worker                 | removed                                                                                                                                                     |
| Wake-on-LAN                   | removed from `wake-on-lan.ps1`, `power-orchestration/workers.example.json`                                                                                  |
| ClawTeam node                 | removed from oracle + orchestrator ClawTeam compose                                                                                                         |
| Infisical path                | removed from `phase1-infisical-setup.sh`, `upload-worker-secrets.ps1`, secret maps                                                                          |
| CI                            | `.github/workflows/python-lint.yml` lint path removed                                                                                                       |
| Health checks / observability | `health-check.sh`, `nyra-doctor`, `nyra-maintenance`, `validate-agent-infra.sh`, waveterm/zellij dashboards                                                 |
| llxprt profiles               | 7 profile JSONs deleted                                                                                                                                     |
| Docs                          | host matrices, cluster-setup guides, network maps, `infra/CLAUDE.md` inventory                                                                              |
| Env templates                 | `infra/env/.env.worker-rtx3060.example` deleted                                                                                                             |
| Tests                         | `services/mem0/tests/test_config.py` repointed to the 5090                                                                                                  |

**Total: 227 files changed, 13,694 deletions.**

### The embedding workload was moved, not dropped

The retired host was load-bearing. The live Oracle `mem0` container depended on
`MEM0_EMBEDDER_MODEL=local/embeddings` (`nomic-embed-text`, `768` dims) and
`MEM0_LLM_MODEL=local/qwen3-4b-3060`, both pointing at the sold machine.

`nomic-embed-text` (137 M params, 0.27 GB) is **already present** in the 5090's
Ollama. The endpoint moves with the **same model and same dimensions**, so
**no re-embedding is required** and the existing Qdrant collections stay valid.
0.27 GB on a 24 GB GPU does not materially reduce inference availability — which
is the directive's own test for preferring a local endpoint over a hosted one.
`local/qwen3-4b-3060` is replaced by `nyra-fast` (`qwen3.5:latest`, present on
the 5090).

### Still outstanding

**The retired machine is still an active Tailscale node record** (`.12`, last
seen 1 day before migration). Removing it and its ACL grants needs admin-console
access this session did not have. A sold machine holding a tailnet identity is a
genuine residual security item.

---

## LiteLLM

**Version:** v1.99.1
**Digest:** `ghcr.io/berriai/litellm@sha256:a53a7d3ffebede1925bd3ee8a21e4a7b9b63e2e68ec883af136edcccb6eeb82c`
**Platforms:** `linux/amd64`, `linux/arm64` (verified before pinning)

### Model groups and routing

| Alias            | Backing                                                             |
| ---------------- | ------------------------------------------------------------------- |
| `nyra-general`   | vLLM on both workers                                                |
| `nyra-fast`      | Ollama `qwen3.5:latest` (5090)                                      |
| `nyra-reasoning` | vLLM (5090), extended timeouts                                      |
| `nyra-coding`    | vLLM (5090)                                                         |
| `nyra-embedding` | llama.cpp `nomic-embed-text-v1.5` (**orchestrator, CPU**), 768 dims |
| `nyra-memory`    | bitnet.cpp `BitNet b1.58 2B-4T` (**orchestrator, CPU**)             |

```
local GPU -> OmniRoute -> OpenRouter -> paid (NONE enabled)
```

Ordered `router_settings.fallbacks`, `usage-based-routing-v2`,
`num_retries: 2`, `allowed_fails: 2`, `cooldown_time: 30`.

Agents see only aliases. Serving contract: `nyra-primary` (5090),
`nyra-secondary` (3090 Ti), reached at `http://100.64.0.11:8000/v1` and
`http://100.64.0.13:8000/v1` — **Tailnet IPs, never public hostnames.**

OpenRouter `:free` ids were **re-verified against the live catalog** (426 models,
18 free); all three configured ids still exist. No paid provider is declared —
`OPENAI_API_KEY`/`ANTHROPIC_API_KEY` are deliberately absent rather than left as
blank dependencies.

### MCP registrations

| Server                                                     | Group                              | Status                                |
| ---------------------------------------------------------- | ---------------------------------- | ------------------------------------- |
| `nyra_crm`                                                 | `nyra-mortgage`                    | reachable; **upstream handshake bug** |
| `nyra_tailscale`                                           | `nyra-admin`                       | **blocked on host rebind**            |
| `cloudflare_docs`                                          | `nyra-dev`                         | working                               |
| `cloudflare_api` / `_bindings` / `_builds` / `_ai_gateway` | `nyra-admin`                       | working with a token                  |
| `cloudflare_observability`                                 | `nyra-admin`, `nyra-observability` | working with a token                  |

`allow_all_keys: false` everywhere.

Not registered, and why: memory/Letta MCP (loopback-bound), gitingest /
playwright / next-devtools (404 at `/mcp`, `/sse`, `/` — transport unknown and
**not guessed**), `sequential-thinking` (no live listener), Nexus's legacy
github/git/docker/infisical defaults (listeners not running), bitwarden and
gemini (intentionally removed).

### Tool Search permission architecture

Permission-gated **only** via `object_permission.mcp_tool_search_enabled` — the
sole valid mechanism in v1.99.1, confirmed by grepping the pinned image.

Default key generation grants the minimum useful surface: Tool Search on,
`nyra-dev` only, three model aliases. A key created without explicit permissions
**cannot** reach borrower PII or administer Cloudflare.

Access groups: `nyra-dev`, `nyra-admin`, `nyra-mortgage`, `nyra-memory`,
`nyra-automation`, `nyra-observability`.

### Semantic filtering

`mcp_semantic_tool_filter`: `embedding_model: nyra-embedding`, `top_k: 5`,
`similarity_threshold: 0.30`, **`enabled: false`**.

Shipped disabled because the embedding endpoint is loopback-bound. Enabling a
filter against an unreachable embedder breaks every MCP-bearing completion. It is
a one-line flip once `/v1/embeddings` returns a 768-vector.

### A2A and Skills

`agent_search` **does not exist in v1.99.1** — the directive's conditional is
unmet, so no `agent_search` config was written. The A2A endpoints that _do_
exist are documented. No agents registered yet; only stable capabilities with
genuine persistent endpoints should be, never transient ClawTeam subagents.

No Markdown skills were auto-migrated into LiteLLM. OpenHarness skills,
Claude skills, the LiteLLM `/skills` surface and MCP tools stay four separate
things.

### Verified absent from production config

`enable_semantic_tool_filtering`, `LITELLM_MCP_TOOL_SEARCH_ENABLED`,
`LITELLM_USE_KEYCHAIN`, `agent_search`. `EXPERIMENTAL_UI_LOGIN` is not set —
default posture is experimental behaviour off unless required.

---

## Cloudflare

**Boundary preserved; only the origin changes.** The Access application, service
tokens, tunnel and portal are untouched.

Live path today:
`mcp-gateway.projectnyra.com -> caddy -> nexus:3000` (Grafbase Nexus).
Target: the same edge, origin `LiteLLM /mcp`.

**`code_mode = off`. No `?optimize_context=search_and_execute`.**

Why double context optimisation was avoided: LiteLLM is already the
context-collapse layer. Stacking Cloudflare's `search_and_execute` produces
`CF query/execute → LiteLLM search/call → downstream` — two independent
discovery abstractions in series, doubling failure modes and token cost for no
gain. `search_and_execute` may appear only on a non-production
`nyra-mcp-cf-canary` portal for benchmarking.

**No control-plane cycle.** LiteLLM's `mcp_servers` contains Cloudflare's own
product endpoints, never the Nyra portal that fronts LiteLLM.

Canonical credential names reconciled from dominant existing usage:
`CLOUDFLARE_API_TOKEN` (218 uses), `CLOUDFLARE_ACCOUNT_ID` (139),
`CF_ACCESS_CLIENT_ID` (54), `CLOUDFLARE_ZONE_ID` (44),
`CF_ACCESS_CLIENT_SECRET` (27). The tunnel token had **four** competing names;
`CLOUDFLARED_TUNNEL_TOKEN` is canonical, mapped to the container's own
`TUNNEL_TOKEN` at the compose layer so the rename is atomic. Global API Key auth
(`CLOUDFLARE_API_KEY`/`CLOUDFLARE_EMAIL`) is prohibited.

**Not executed:** the origin change itself (no API token / dashboard access).

---

## Infisical

Three things kept separate: **Secrets Manager** (source of truth),
**Agent** (trusted service-side rendering into gitignored
`runtime-secrets/*.runtime.env`), **Agent Proxy** (credential brokering for
agents that must never hold the secret).

Canonical contract: exactly the seven `INFISICAL_*` variables. **No
`AGENT_VAULT_*` variables created.** `oracle-vps-agent-vault` is running and was
**not deleted** — no parity test for its replacement was run, and a working
subsystem is not removed before parity. It is frozen.

Three separate identities: Oracle service, worker service, autonomous agent.
The agent identity has **no broad secret-read permission**; being able to call
the proxy must not confer the ability to read the backing secret.

`NO_PROXY` covers `127.0.0.1`, `localhost`, `100.64.0.0/10`,
`.trex-fiordland.ts.net` and Docker-local names. Local vLLM, LMCache Redis,
Tailscale control traffic and intra-Docker traffic are never proxied.

Six scoped virtual keys defined. `LITELLM_MASTER_KEY` exists only in the Oracle
runtime environment, never in an agent runtime, never in an acceptance test.
Claude Code and Codex keep native authentication; no session token is scraped or
relayed as a fake provider key.

No dynamic secrets were implemented.

---

## Addendum — orchestrator becomes the memory-manager host

Added after the sections below were written; those sections describe the state
immediately after the LiteLLM-native migration, this describes what changed
next.

### Corrected environment fact

All three Windows hosts run WSL2 in **mirrored networking mode**. The Tailscale
interface is visible _inside_ the guest as a real interface — `ip addr show` on
`worker-rtx5090` shows `100.64.0.11/32` on `eth1`, and `ssh`/`curl`/`ping` to
tailnet addresses work natively from WSL2 bash. The claim elsewhere in this
report's lineage that "WSL2 is not itself a tailnet peer" is **wrong**. The only
thing that needs the Windows detour is the `tailscale` CLI binary itself.

Separately: inbound SSH to `orchestrator` lands in a Windows shell, so remote
deployment must be re-entered into the `Ubuntu-24.04` WSL distro.

### Fourth host, four roles

| Host                             | Role                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| `oracle-vps` `100.64.0.3`        | the only gateway                                              |
| `orchestrator` `100.64.0.10`     | memory manager — embeddings + consolidation LLM, **CPU only** |
| `worker-rtx5090` `100.64.0.11`   | pure inference                                                |
| `worker-rtx3090ti` `100.64.0.13` | pure inference (still offline — ping fails)                   |

`orchestrator` measured 2026-09-04: Windows host `MiniApotheosis`, Ryzen 7
6800H, 8C/16T, 15.2 GB RAM, Docker 29.7.2 / Compose v5.5.1 under Docker Desktop
on a WSL2 backend (`Ubuntu-24.04`) whose VM reports 7 GB. No discrete GPU. The
"Exact live topology" table earlier in this report predates this host being in
scope and lists only three machines.

### The memory plane was still pointing at aliases that no longer exist

Found while tracing consumers of the embedding endpoint.
`infra/hosts/oracle-vps/docker-compose.memory.yml` still defaulted
`MEM0_LLM_MODEL=local/qwen3-4b-3060` and
`MEM0_EMBEDDER_MODEL=local/embeddings` — both backed by the retired RTX 3060 and
both absent from the canonical config since the migration. D-06 stated that
`MEM0_LLM_MODEL` was repointed at `nyra-fast`; the file was never actually
changed. It is now `nyra-fast` / `nyra-embedding`.

Two further live defects surfaced in the same trace:

- `mem0`'s `MEM0_EMBEDDER_BASE_URL` defaulted to `http://orchestrator:11435/v1`
  — a host/port that resolves to nothing from that container network, and which
  disagreed with the `letta` service in the same file. Both now use the gateway.
- `services/openclaw/openclaw.json.template` had **`http:///v1`** — an empty
  host — as the default for both `MEM0_EMBEDDER_BASE_URL` and
  `MEM0_LLM_BASE_URL`, left behind by the RTX 3060 purge.

`services/mem0/tests/test_config.py` asserted the canonical route by naming a
host (`http://100.64.0.11:11434/v1`). That encodes the coupling the gateway
exists to remove and would need editing on every host move; it now asserts the
gateway + alias route, keeping 768 as the load-bearing assertion.

`infra/hosts/host-layout.yaml` also listed three compose files that no longer
exist (`cloudflared`, `llxprt`, `bitnet`); it now records orchestrator's role as
`memory-manager` with `root_compose_profile: orchestrator`.

### NEW HIGH-SEVERITY FINDING — a live master key is committed in plaintext

`infra/hosts/oracle-vps/.env` is **tracked in git** and contains a live
`LITELLM_MASTER_KEY=sk-…` in plaintext. This directly violates D-17
("`LITELLM_MASTER_KEY` appears only in the Oracle runtime environment, never in
an agent runtime, never in an acceptance test") and is a separate incident from
the episodic-memory leak already recorded below.

**It was not blanked in this pass.** The live oracle-vps deployment currently
reads that file, so emptying the value would take the gateway down, and
removing it from `HEAD` does not remove it from history — rotation is the only
real remediation and it is a deliberate operator action. A prominent warning
comment was added in place instead, and it is escalated here.

```bash
# 1. mint a replacement and put it in Infisical, not in a file
# 2. restart the oracle profile against the Infisical-rendered runtime env
# 3. confirm nothing still reads the tracked .env
git grep -n 'LITELLM_MASTER_KEY' -- infra/hosts/oracle-vps/
# 4. consider purging the blob from history (coordinate first - it rewrites refs)
gitleaks detect --source . --redact
```

The same file also routed the memory stack at
`http://litellm.projectnyra.com/v1` — a public hostname that does not resolve
from the Oracle container network, the same defect class the migration found in
the pre-migration worker routes. Corrected to `http://litellm:4000/v1`.

### The embedding workload moved again, invariant preserved

Retired RTX 3060 Ollama → `worker-rtx5090` Ollama → `orchestrator` llama.cpp.
Third move, same invariant: **same model family, same 768 dimensions, zero
re-embedding.**

This time it was measured rather than argued. Same input through both endpoints:

|               | worker-rtx5090 Ollama   | orchestrator llama.cpp                          |
| ------------- | ----------------------- | ----------------------------------------------- |
| dimensions    | 768                     | 768                                             |
| L2 norm       | 1.0                     | 1.0                                             |
| self-reported | `nomic-bert`, 137M, F16 | `n_embd=768`, `n_params=136727040`, `ftype=F16` |

Cosine similarity **0.999999581**, max elementwise delta **9.9e-05**. The GGUF
is `nomic-ai/nomic-embed-text-v1.5-GGUF` / `nomic-embed-text-v1.5.f16.gguf`.

Both GPU workers are now pure inference. The freed VRAM allowance stays as
headroom — `gpu_memory_utilization` was **not** raised on the strength of this,
because it has not been re-measured under load.

### Memory manager

`nyra-memory` backs the `.agent/` episodic → semantic consolidation lane.
bitnet.cpp is a fork of llama.cpp's `llama-server`, so LiteLLM reaches it with
the `openai/` provider. It is absent from every fallback chain in both
directions.

**Finding: the dream cycle does not call a model, and should not.**
`.agent/memory/auto_dream.py`, `promote.py` and `cluster.py` are mechanical by
design — clustering, salience thresholds, lifecycle bookkeeping — and their own
docstrings assign subjective validation to the host agent via
`graduate.py`/`reject.py`. `LESSONS.md` is rendered, never model-written. The
genuine model seam is `.agent/harness/llm.py`, used by `conductor.py`, and that
is what was wired: it gained `AGENT_BASE_URL`/`AGENT_API_KEY` so a lane can
target LiteLLM without setting `OPENAI_*` globally (which would break Claude
Code/Codex native auth). Config: `infra/env/agent-memory.env.example`.

### Two stale things reconciled

- **`infra/hosts/orchestrator/bitnet/`** — reused, not duplicated. Fixed: pinned
  the `git clone` to `microsoft/BitNet @ 0b341e58`, pinned weights to
  `microsoft/bitnet-b1.58-2B-4T-gguf @ a1f2f1c7` on the canonical lowercase repo
  id, made the `ggml-bitnet-mad.cpp` patch idempotent, cut `mem_limit` 10g→3g
  and threads 10→6 to fit the measured host, and narrowed the host bind from
  `0.0.0.0` to the tailnet address. `docker-compose.bitnet.yml` was removed as
  superseded by the root profile. The live `orchestrator-bitnet` container has
  been stopped since 2026-06-14 (exit 137, **not** OOM-killed).
- **`infra/hosts/orchestrator/litellm/`** — **deleted**, along with
  `docker-compose.litellm.yml`. It was a second, dead LiteLLM control plane: not
  running, self-described as the "PRIMARY LiteLLM instance", pinned to the
  superseded `:v1.92.0`, binding `0.0.0.0:4010`, routing to the retired RTX 3060
  and the retired llxprt bridge, and addressing workers by `*.projectnyra.com`
  hostnames that do not resolve from container networks. **It also carried a
  hardcoded llxprt bridge API key as a compose default** — add that credential
  to the rotation list below.

### Verified in this pass

| Check                                                            | Result                                                                           |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| llama.cpp CPU embedding vs 5090 Ollama, same input               | **768 dims both, cosine 0.999999581**                                            |
| `--hf-repo`/`--hf-file` auto-download path used by compose       | **works**, cached to the volume, identical vectors                               |
| Pinned LiteLLM v1.99.1 boot against the new config               | **readiness 200, 12 model groups**, no schema errors                             |
| `POST /v1/embeddings {"model":"nyra-embedding"}` through LiteLLM | **200, 768-element vector**                                                      |
| `mcp_semantic_tool_filter.enabled: true` boot                    | **readiness 200**, semantic router indexed against `nyra-embedding`              |
| All five compose profiles render                                 | **PASS** (oracle, orchestrator, worker-5090, worker-3090ti, agent-containerized) |
| No `0.0.0.0` bind in any profile                                 | **PASS**                                                                         |
| Docker on orchestrator publishes on the tailnet IP               | **PASS** — live TCP connect from `100.64.0.11` to `100.64.0.10:8081`             |
| `shellcheck -S warning scripts/deploy/*.sh`                      | **PASS**                                                                         |
| `.agent/harness/llm.py` base-URL routing                         | **PASS** (stubbed SDK — `openai` is not installed here)                          |

### Still blocked, with the exact commands

1. **The `orchestrator` profile is not deployed**, so neither origin answers.
   ```bash
   ssh orchestrator 'wsl -d Ubuntu-24.04 -e bash -lc \
     "cd ~/project-nyra && ./scripts/deploy/deploy-orchestrator.sh"'
   ```
2. **`mcp_semantic_tool_filter` stays `enabled: false`** until that origin
   answers. The blocker is no longer the 5090 Ollama bind — that dependency is
   gone. Flip it after:
   ```bash
   curl -sS http://100.64.0.3:4000/v1/embeddings \
     -H "Authorization: Bearer $NYRA_LITELLM_DEV_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"model":"nyra-embedding","input":"mortgage lead lookup"}'
   ```
3. **`AGENT_API_KEY` for the memory lane does not exist yet** — it needs a
   scoped virtual key including `nyra-memory`, minted with the master key on
   `oracle-vps` and stored in Infisical.
4. **`worker-rtx3090ti` is still unreachable** (`ping 100.64.0.13` fails).
5. **Rotate the llxprt bridge API key** that was hardcoded in the deleted
   `infra/hosts/orchestrator/docker-compose.litellm.yml`.
6. **Rotate `LITELLM_MASTER_KEY`** — committed in plaintext in the tracked
   `infra/hosts/oracle-vps/.env`. See the finding above.

---

## Inference

**vLLM and LMCache were not deployed anywhere before this migration** — this is
greenfield, and nothing is running yet.

Authored: `lmcache/vllm-openai@sha256:cb0a7630…`, one primary served model per
GPU, `gpu_memory_utilization` **0.88 not 0.95** (0.88 leaves ~2.9 GB on 24 GB for
CUDA graphs, LMCache overhead, the resident embedder and fragmentation; 0.95
leaves ~1.2 GB and consumes the safety margin). `max_model_len` and
`VLLM_MODEL_*` have **no defaults** — they cannot be chosen without measurement.

**Independent replicas, not cross-host tensor parallelism.** TP across two
consumer GPUs joined by a WAN Tailnet link is latency-bound at every layer
boundary, and the 3090 Ti has been offline 39 days.

### LMCache

Two Redis instances, never shared:

| Host             | Service         | Purpose                                    | Persistence                           |
| ---------------- | --------------- | ------------------------------------------ | ------------------------------------- |
| `oracle-vps`     | `litellm-redis` | gateway cache/control                      | `appendonly yes`, 2 GB, `allkeys-lru` |
| `worker-rtx5090` | `lmcache-redis` | GPU KV backend, `redis://100.64.0.11:6379` | `appendonly no`, `save ""`            |

`LMCACHE_USE_EXPERIMENTAL=True` remains an environment variable.
`LMCACHE_ENABLE` is not used. `LMCACHE_REDIS_MAXMEMORY` has no default — it must
come from measured host RAM and must not starve Linux, Docker, vLLM CPU-side
work, the LMCache CPU cache, or developer applications.

**Measured GPU/RAM configuration: not obtainable.** No GPU passthrough in this
session; the 3090 Ti is offline.

---

## Tests

| Command                                                                                  | Result                                                      |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `docker compose --profile {oracle,worker-5090,worker-3090ti,agent-containerized} config` | **PASS** (4/4)                                              |
| `./scripts/deploy/validate-compose-profiles.sh`                                          | **PASS** — no unresolved `${VAR:?}`                         |
| `shellcheck -S warning scripts/deploy/*.sh`                                              | **PASS** — clean                                            |
| `make -n help`                                                                           | **PASS** — exit 0                                           |
| YAML/JSON/Python parse, whole repo                                                       | **PASS** — 0 regressions (2 pre-existing failures)          |
| Boot v1.99.1 against the new config                                                      | **PASS** — readiness 200, 12 model groups, no schema errors |
| `pytest tests/integration/mcp`                                                           | 1 passed, 28 skipped                                        |
| **Nexus deletion gate**                                                                  | **0/22 exercised — NOT MET**                                |
| `git grep` retired-worker gate                                                           | **PASS**                                                    |
| `git grep` Nexus gate                                                                    | **not run** — Nexus not deleted                             |

Not run, with reasons in `NYRA_REFACTOR_VALIDATION.md` §8: model-plane
acceptance, MCP-plane acceptance, Cloudflare acceptance, LMCache acceptance,
semantic-filter benchmark, external security probing.

---

## Performance

**No before/after performance numbers are reported, because none were
measured.**

Tool schema tokens, MCP latency, model latency, LMCache TTFT, cache hits and
failed tool selections all require a deployed vLLM/LMCache stack and a scoped
key. Estimating them would be fabrication.

The measurement harness exists and is ready:
`tests/integration/mcp/` records per-scenario status, latency, tool selected and
a tool-schema token estimate to `tests/results/mcp-parity-evidence.json`.

One structural claim is safe without measurement: the pre-migration LiteLLM
exposed **zero** first-party Nyra MCP servers and granted all seven Cloudflare
servers to every key. The post-migration surface is Tool-Search-collapsed and
per-group scoped, so the agent-visible catalogue is smaller and correctly
partitioned by construction.

---

## Security

### Exposure matrix (`ss -lntup` on `oracle-vps`)

| Bind         | Ports                                                                                                                           | Verdict                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `0.0.0.0`    | 6379 (Redis), 7000 (nexus-router), 5678, 8400, 8777, 8771, 8774, 4001, 8000, 8020, 8050, 8081, 8085, 8089, 7070, 54322, 111, 23 | **HIGH — internet-facing on a public cloud VM.** Pre-existing. |
| `100.64.0.3` | 53, 80, 443, 3000, 3001, 3004, 4000, 5001, 6000, 20128                                                                          | correct                                                        |
| `127.0.0.1`  | 3399, 8283, 8284, 8765, 8769, 9090, 4010                                                                                        | correct                                                        |

Services introduced by this migration bind Tailnet-only or loopback-only:
LiteLLM `100.64.0.3:4000`, LMCache Redis `100.64.0.11:6379`, OmniRoute
`127.0.0.1:20128`. **No new `0.0.0.0` bind.**

Pre-existing public binds were reported rather than silently changed: re-binding
a live Redis that unknown services depend on, during a control-plane cutover,
has an unmeasured blast radius.

### Auth matrix

| Actor                      | Ingress                     | Model/tool              | Secrets                            |
| -------------------------- | --------------------------- | ----------------------- | ---------------------------------- |
| Developer agent (internal) | Tailnet                     | scoped LiteLLM key      | Infisical agent identity           |
| Developer agent (external) | Cloudflare human OAuth      | scoped LiteLLM key      | Agent Proxy                        |
| Claude Code / Codex        | native subscription auth    | native                  | native                             |
| Unattended agent           | CF Access **service token** | scoped service key      | agent identity, minimum permission |
| Oracle control plane       | n/a                         | master key (local only) | Oracle service identity            |

### Secret scan

`.gitignore` extended with `*.runtime.env`, `runtime-secrets/`, `secrets/`,
`.infisical-runtime/`, plus negations keeping every `*.env.example` tracked and
re-admitting `infra/env/` which the broad `env/` venv pattern was swallowing.
No secret value was committed. `.gitleaks.toml` is configured; run
`gitleaks detect` in CI.

### Credentials requiring rotation

1. **`TAILSCALE_MCP_AUTH_TOKEN`** — was a plaintext literal in the Oracle host's
   `nexus.toml`.
2. **The llxprt bridge API key** hardcoded as a compose default in the deleted
   `infra/hosts/orchestrator/docker-compose.litellm.yml`. Deleting the file does
   not rotate the credential, and it remains in git history.
3. **Everything in `.agent/memory/episodic/AGENT_LEARNINGS.jsonl`** — verbatim
   tool output captured what appear to be a LiteLLM master key, an Infisical
   service token, an llxprt bridge API key and Grafana admin settings. Project
   policy forbids deleting episodic memory, so these were not removed. Treat all
   as compromised; the memory hook should redact rather than store raw output.

---

## Deleted components

| Path                                                                                           | Files |
| ---------------------------------------------------------------------------------------------- | ----- |
| `infra/hosts/worker-rtx3060/`                                                                  | 54    |
| `infra/env/.env.worker-rtx3060.example`                                                        | 1     |
| `infra/docs/cluster-setup/WORKER-RTX3060-{SETUP,STATUS}.md`, `start-ollama-worker-rtx3060.ps1` | 3     |
| `infra/scripts/workers/setup-worker-3060.ps1`, `scripts/workers/start-rtx3060.sh`              | 2     |
| `infra/configs/zellij/nyra-wave-ai-3060.kdl`                                                   | 1     |
| `development/llxprt/profiles/nyra-{3060-utility,local-3060-utility,worker-3060}.json`          | 3     |
| `bootstrap/**/llxprt-profiles/nyra-worker-3060*.json`, `nyra-wave-ai-3060.kdl`                 | 5     |

**Not deleted, deliberately:** `services/nexus-router/` (parity gate not met),
`infra/hosts/oracle-vps/nexus.toml` and `infra/configs/nexus/nexus.toml` (still
the live config), `.github/workflows/nexus-router-ci.yml`,
`infra/hosts/oracle-vps/docker-compose.nexus-router-mcp.yml`,
`oracle-vps-agent-vault` (no parity test for its replacement).

---

## Remaining technical debt

Genuine residual issues only.

### Blocking production cutover

| #   | Item                                                    | Action                                      |
| --- | ------------------------------------------------------- | ------------------------------------------- |
| 1   | No scoped LiteLLM keys exist                            | mint them; parity gate is 0/22 until then   |
| 2   | Nexus not deleted                                       | delete only when the gate reads `GATE: MET` |
| 3   | Cloudflare portal origin still points at Grafbase Nexus | dashboard action                            |
| 4   | vLLM/LMCache not deployed                               | needs GPU passthrough                       |
| 5   | `vllm serve --help` not validated                       | run on the GPU host before first start      |

### Live defects

| #   | Item                                                                             | Severity                                                                                                                                          |
| --- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | `tailscale serve` forward occupies `100.64.0.3:4000` and points nowhere          | HIGH — will collide with the `oracle` profile; `deploy-oracle.sh` refuses to run                                                                  |
| 7   | `nyra_crm` upstream rejects `notifications/initialized` with 400                 | HIGH — blocks mortgage acceptance                                                                                                                 |
| 8   | `nyra_tailscale` binds `127.0.0.1:3399`                                          | MEDIUM — silently dead behind the portal                                                                                                          |
| 9   | Ollama binds `127.0.0.1:11434`                                                   | MEDIUM — **downgraded.** No longer blocks `nyra-embedding` or semantic filtering (both moved to orchestrator). Still blocks the `nyra-fast` lane. |
| 10  | Memory/Letta MCP binds `127.0.0.1:8284`                                          | MEDIUM — not registerable                                                                                                                         |
| 11  | gitingest/playwright/next-devtools MCP: 404 at `/mcp`, `/sse`, `/`               | LOW — transport unknown, not guessed                                                                                                              |
| 12  | `oracle-vps-redis` on `0.0.0.0:6379`, public VM                                  | **HIGH**                                                                                                                                          |
| 13  | 15+ other `0.0.0.0` binds on the public VM                                       | HIGH                                                                                                                                              |
| 14  | Retired machine still an active tailnet node                                     | HIGH — needs admin console                                                                                                                        |
| 15  | `watchtower` auto-updating floating `:latest` tags                               | MEDIUM — unreviewed production mutation                                                                                                           |
| 16  | `OMNIROUTE_IMAGE` is a local build with no digest                                | MEDIUM — not reproducible                                                                                                                         |
| 17  | `cosign` unavailable; signature unverified                                       | LOW — digest pin holds                                                                                                                            |
| 18  | `worker-rtx3090ti` offline 39 days; config unvalidated                           | MEDIUM                                                                                                                                            |
| 19  | Secrets in episodic memory                                                       | HIGH — rotate                                                                                                                                     |
| 20  | 87 legacy compose files not yet reconciled into the root profiles                | MEDIUM                                                                                                                                            |
| 21  | Host boundaries not enforced at runtime (three hosts' containers on one machine) | MEDIUM — fixed by design, not yet by deployment                                                                                                   |

---

## Final architectural invariants

| Invariant                                             | State                                      |
| ----------------------------------------------------- | ------------------------------------------ |
| Exactly two active GPU workers                        | **TRUE**                                   |
| Retired worker absent from active configuration       | **TRUE** (gate passes)                     |
| Nexus absent from the runtime architecture            | **FALSE — not yet deleted**                |
| No client requires Nexus                              | **TRUE** (repo-side clients migrated)      |
| Cloudflare protects external MCP ingress              | **TRUE**                                   |
| Cloudflare does not redundantly wrap Tool Search      | **TRUE** (`code_mode = off`)               |
| LiteLLM is the canonical model gateway                | **TRUE in config**, pending deploy         |
| LiteLLM is the canonical MCP aggregation layer        | **TRUE in config**, pending deploy         |
| Virtual Tool Search is permission-gated               | **TRUE**                                   |
| Semantic filtering uses `mcp_semantic_tool_filter`    | **TRUE** (shipped disabled)                |
| `enable_semantic_tool_filtering` absent               | **TRUE**                                   |
| `LITELLM_USE_KEYCHAIN` absent                         | **TRUE**                                   |
| Admin credentials absent from agent runtimes          | **TRUE**                                   |
| OmniRoute behind LiteLLM                              | **TRUE**                                   |
| OpenRouter behind LiteLLM                             | **TRUE**                                   |
| Local vLLMs behind LiteLLM                            | **TRUE in config**                         |
| GPU traffic uses Tailscale                            | **TRUE**                                   |
| vLLM not exposed publicly                             | **TRUE**                                   |
| Redis not exposed publicly                            | **FALSE — pre-existing `0.0.0.0:6379`**    |
| LMCache Redis separate from control Redis             | **TRUE**                                   |
| Infisical is the secret source of truth               | **TRUE**                                   |
| Untrusted agents do not receive brokerable secrets    | **TRUE by design**, proxy not yet deployed |
| Subscription credentials not relayed as provider keys | **TRUE**                                   |
| ClawTeam is orchestration, not a gateway              | **TRUE**                                   |
| OpenHarness is a harness, not a gateway               | **TRUE**                                   |
| Root Compose profiles reflect host boundaries         | **TRUE in config**, not yet at runtime     |
| Every production image pinned                         | **TRUE except `OMNIROUTE_IMAGE`**          |
| All tests pass                                        | **static: TRUE. Acceptance: NOT RUN**      |
| Negative searches pass                                | **retired worker: TRUE. Nexus: N/A**       |
| Documentation describes what actually runs            | **TRUE**, including what does not yet run  |

**The migration is repo-complete and deployment-ready. It is not deployed, and
Nexus is not deleted.** Both statements are deliberate: the directive forbids
deleting a subsystem before parity, and parity requires credentials this session
did not have.
