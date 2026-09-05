# NYRA REFACTOR — VALIDATION RECORD

Every check run during the 2026-09-04 migration, its actual result, and every
blocker with the exact reason. **No result in this document is projected or
assumed.** Where a step could not be executed, it says so and says why.

No secret values appear here.

---

## 1. Static validation — ALL PASS

| Check                                 | Command                                               | Result                                                                                 |
| ------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Compose profile `oracle`              | `docker compose --profile oracle config`              | **PASS** — `litellm-redis`, `litellm`, `omniroute`                                     |
| Compose profile `worker-5090`         | `docker compose --profile worker-5090 config`         | **PASS** — `lmcache-redis`, `vllm-5090`                                                |
| Compose profile `worker-3090ti`       | `docker compose --profile worker-3090ti config`       | **PASS** — `vllm-3090ti`                                                               |
| Compose profile `agent-containerized` | `docker compose --profile agent-containerized config` | **PASS** — `clawteam`, `openharness`                                                   |
| Unresolved `${VAR:?}`                 | `scripts/deploy/validate-compose-profiles.sh`         | **PASS** — none                                                                        |
| Port bindings                         | rendered compose                                      | **PASS** — `100.64.0.3:4000`, `100.64.0.11:6379`, `127.0.0.1:20128`. **No `0.0.0.0`.** |
| shellcheck                            | `shellcheck -S warning scripts/deploy/*.sh`           | **PASS** — clean                                                                       |
| Makefile parses                       | `make -n help`                                        | **PASS** — exit 0 after removing 55 lines of retired-worker targets                    |
| Python syntax                         | `ast.parse` over all repo `.py`                       | **PASS**                                                                               |
| YAML parse                            | `yaml.safe_load_all` over all repo `.yaml`/`.yml`     | **PASS** — 0 regressions                                                               |
| JSON parse                            | `json.loads` over all repo `.json`                    | **PASS** — 0 regressions                                                               |
| Parity suite collects                 | `pytest tests/integration/mcp -q`                     | **PASS** — 1 passed, 28 skipped                                                        |

**Parse-regression method.** Every file that failed to parse after the purge was
re-parsed at `HEAD` to distinguish pre-existing breakage from breakage I caused.
16 files broken by the first mechanical pass were **reverted and hand-edited**
(4 code files) or re-purged with a structure-aware JSON walker (12 files). Final
count: **2 total parse failures repo-wide, both pre-existing, 0 regressions.**

---

## 2. LiteLLM v1.99.1 — validated by BOOTING the pinned image

Not by reading documentation.

| Check                                                  | Result                                                                                                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `v1.99.1` tag exists                                   | **PASS**                                                                                                                                  |
| Publishes `linux/arm64` (required — Oracle is aarch64) | **PASS** — OCI index has amd64 + arm64                                                                                                    |
| Digest resolved                                        | `sha256:a53a7d3ffebede1925bd3ee8a21e4a7b9b63e2e68ec883af136edcccb6eeb82c`                                                                 |
| Reported package version inside the image              | `1.99.1`                                                                                                                                  |
| Boots against the new config                           | **PASS** — `/health/readiness` → **200**                                                                                                  |
| Model groups loaded                                    | **PASS** — all 12: `nyra-general` ×2, `nyra-reasoning`, `nyra-coding`, `nyra-fast`, `nyra-embedding`, `omniroute-*` ×3, `openrouter-*` ×3 |
| Schema/validation errors                               | **NONE**                                                                                                                                  |
| Degrades gracefully around dead upstreams              | **PASS** — one warning per failing MCP server, proxy stays ready                                                                          |

### Config-key verification (grepped inside the pinned image)

| Symbol                            | Verdict                                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `mcp_tool_search_enabled`         | **EXISTS** — `litellm/types/object_permission.py:25`, only as an `ObjectPermissionDict` field                              |
| `mcp_semantic_tool_filter`        | **EXISTS** — in the image's own `proxy_config.yaml`; hook at `proxy/hooks/mcp_semantic_filter/hook.py`                     |
| `enable_semantic_tool_filtering`  | **ABSENT** — correctly rejected                                                                                            |
| `LITELLM_MCP_TOOL_SEARCH_ENABLED` | **ABSENT** — correctly rejected                                                                                            |
| `LITELLM_USE_KEYCHAIN`            | **ABSENT** — correctly rejected                                                                                            |
| `agent_search`                    | **ABSENT in v1.99.1** — the directive's conditional is unmet; no `agent_search` config written                             |
| A2A endpoints                     | **EXIST** — `/v1/agents`, `/a2a/{agent_id}`, `/a2a/{agent_id}/.well-known/agent-card.json`, `/a2a/{agent_id}/message/send` |

### `DATABASE_URL` finding

Booting with an empty `DATABASE_URL` fails:

> `LiteLLM Proxy: DATABASE_URL uses unsupported scheme '<missing scheme>'. …
require PostgreSQL; use a 'postgresql://' connection string.`

Config validation was therefore performed with `database_url` removed. **A real
deployment requires a PostgreSQL URL** — `sqlite://` and other engines are not
supported for virtual keys, `store_model_in_db` or spend tracking.

---

## 3. Live topology — verified

| Check                                     | Result                                                               |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `tailscale status` (via the Windows host) | **PASS** — repo-asserted IPs match live exactly                      |
| `oracle-vps` = `100.64.0.3`               | **CONFIRMED** by `tailscale ip -4` on the host                       |
| `worker-rtx5090` = `100.64.0.11`          | **CONFIRMED**                                                        |
| `worker-rtx3090ti` = `100.64.0.13`        | **CONFIRMED** (node record; host offline)                            |
| `ping 100.64.0.3` from WSL2               | **PASS** — 0% loss, 32.9 ms                                          |
| `ssh oracle-vps` from WSL2                | **PASS** — key auth, no prompt                                       |
| `ping 100.64.0.13`                        | **FAIL** — 100% loss; host offline 39 days                           |
| GPU inventory                             | **PASS** via Windows — RTX 5090 Laptop, **24463 MiB**, driver 616.64 |
| OpenRouter `:free` model ids              | **PASS** — all 3 still present in the live 18-entry free catalog     |

**No IP discrepancy.** No repository IP correction was required.

---

## 4. BLOCKERS — could not be executed, with exact reasons

Each blocker stopped one step. The rest of the migration proceeded.

### B-1. GPU containers cannot be started from this session

`nvidia-smi` inside this WSL2 sandbox shell returns
`Failed to initialize NVML: GPU access blocked by the operating system`. The GPU
inventory was obtained by shelling out to Windows, but Docker GPU passthrough is
unavailable to this shell.

**Blocks:** steps 6–9 (deploy `lmcache-redis`, migrate 5090 vLLM, migrate 3090 Ti
vLLM, verify `/v1/models`), and the entire LMCache acceptance suite.
**Unblocked by:** running `./scripts/deploy/deploy-worker-5090.sh` from a shell
with GPU passthrough. The script refuses to run otherwise, by design.

### B-2. `worker-rtx3090ti` is unreachable

Offline 39 days. No `nvidia-smi`, driver, CUDA version, Docker version, or
container inventory could be collected. Its configuration is **authored but
unvalidated against live hardware**.

### B-3. No `LITELLM_MASTER_KEY` in this session

Scoped virtual keys cannot be minted.
**Blocks:** step 16 (generate scoped keys), and therefore steps 14, 15, 17
verification and 19 (parity), all of which need a scoped key.
**Consequence:** the parity gate reports **0/22 scenarios exercised**.

### B-4. No Cloudflare API token / dashboard access

**Blocks:** step 18 (retarget the MCP Portal origin) and step 20 (cut production
traffic). The repo-side and origin-side preparation is complete; the Cloudflare
change itself is a dashboard action.

### B-5. `nyra_crm` upstream handshake is broken

`oracle-vps-twenty-mcp` answers `initialize` (protocolVersion `2025-06-18`,
`serverInfo {"name":"twenty-mcp-server","version":"1.0.0"}`) and issues an
`mcp-session-id`, then **rejects `notifications/initialized` with HTTP 400** and
never leaves the uninitialized state. `tools/list` returns
`{"code":-32000,"message":"Bad Request: Server not initialized"}`.

Pre-existing, not introduced here — the legacy Nexus default pointed at `:8182`,
which is not even the right port.
**Blocks:** the mortgage-domain acceptance tests.

### B-6. `nyra_tailscale` is loopback-bound

`ss -lntp` shows `LISTEN 127.0.0.1:3399 (node)`. No container can reach it.
`host.docker.internal:host-gateway` was tested and **also failed**
(`All connection attempts failed`) because the target binds loopback.

The legacy Grafbase Nexus entry used a bare `127.0.0.1` URL that resolved to the
Nexus container's own loopback — **this MCP server has been silently dead behind
the portal.**
**Unblocked by:** rebinding the process to `100.64.0.3:3399`.

### B-7. Embedding endpoint is loopback-bound

Ollama on `worker-rtx5090` listens on `127.0.0.1:11434`. Oracle cannot reach it,
so `nyra-embedding` has no origin.
**Consequence:** `mcp_semantic_tool_filter` ships `enabled: false`. Enabling it
against an unreachable embedder would break every MCP-bearing completion.
**Unblocked by:** `OLLAMA_HOST=100.64.0.11:11434` + restart.

### B-8. `cosign` is not installed on `oracle-vps`

Upstream signature verification could not be performed. The image is pinned by
**digest**, which prevents tag mutation, but attestation is unverified.

```bash
cosign verify ghcr.io/berriai/litellm@sha256:a53a7d3ffebede1925bd3ee8a21e4a7b9b63e2e68ec883af136edcccb6eeb82c \
  --certificate-identity-regexp 'https://github.com/BerriAI/litellm/.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### B-9. `vllm serve --help` not validated

`lmcache/vllm-openai@sha256:cb0a7630…` is an amd64 CUDA image; Oracle is
aarch64 with no GPU, and the local WSL2 shell has no GPU access. The
`--kv-transfer-config '{"kv_connector":"LMCacheConnectorV1","kv_role":"kv_both"}'`
syntax in `compose.yaml` is therefore **unvalidated against a running vLLM.**
**Unblocked by:** running `vllm serve --help` on the GPU host before first start.

### B-10. Tailscale admin console access

The retired GPU worker (`.12`) is **still an active tailnet node record**, last
seen 1 day before the migration. Removing it and its ACL grants requires
admin-console access this session does not have.

---

## 5. Live findings — defects discovered, not created

### F-1. The documented internal LiteLLM URL was a dead forward — HIGH

`tailscale serve` maps `100.64.0.3:4000` → `localhost:4000` on Oracle. **Nothing
listens on `localhost:4000`** — the container publishes `127.0.0.1:4010`. A
Tailscale Service `https://litellm.trex-fiordland.ts.net` proxies to
`http://127.0.0.1:4000`, also dead.

Every document and config citing `http://100.64.0.3:4000` has been describing a
non-functional endpoint. Confirmed from Oracle itself:
`curl http://100.64.0.3:4000/health/readiness` → `000`.

**Also a deployment conflict:** the `oracle` profile binds `100.64.0.3:4000`
directly and will collide with that forward. `deploy-oracle.sh` now refuses to
run while it exists, and prints the removal command.

### F-2. Every LiteLLM key could administer Cloudflare — CRITICAL

All seven Cloudflare MCP servers carried `allow_all_keys: true`. Any key in the
fleet could drive zone, DNS, Access, bindings and build administration using the
account API token. A mortgage agent could modify DNS.
**Fixed** in `infra/configs/litellm/config.yaml`: `allow_all_keys` removed
everywhere; the six token-bearing servers are `nyra-admin` only.

### F-3. Bespoke Nexus served only `/health` — HIGH

`oracle-vps-nexus-router` (`projectnyra/nexus-router:arm64`, published
`0.0.0.0:7000` on a public cloud VM) returns `404 Cannot GET` for `/mcp/*`,
`/v1/models` and `/v1/chat/completions`. The deployed image is not a build of
`services/nexus-router/src`. Its LiteLLM upstream (`oracle-vps-litellm`) is in
`Created` state and has **never started**.

It has zero live MCP or model responsibilities.

### F-4. The real gateway was a _different_ Nexus — HIGH

Caddy routes `mcp-gateway.projectnyra.com` (the URL in `.mcp.json`) to
`nexus:3000` = `ghcr.io/grafbase/nexus:0.6.0`, healthy for 8 days. Its
`nexus.toml` is the genuine registration surface. Anyone reasoning from the
repository alone would have retargeted the wrong service.

### F-5. Plaintext MCP bearer token on the host — HIGH

`[mcp.servers.tailscale] auth.token` was a hard-coded literal in
`infra/hosts/oracle-vps/nexus.toml` on the Oracle host. It is **not** committed
to git (the host file had diverged). Now `os.environ/TAILSCALE_MCP_AUTH_TOKEN`.
**The token must be rotated.**

### F-6. Secrets captured in agent episodic memory — HIGH

`.agent/memory/episodic/AGENT_LEARNINGS.jsonl` contains verbatim tool output
including what appear to be a LiteLLM master key, an Infisical service token, an
llxprt bridge API key and Grafana admin settings. Project policy forbids
deleting episodic memory, so these were **not removed**.

Every credential recorded there must be treated as compromised and rotated, and
the memory-capture hook should redact rather than store tool output verbatim.

### F-7. Public `0.0.0.0` binds on a public cloud VM — HIGH

Pre-existing, not changed by this migration (re-binding a live Redis during a
control-plane cutover has an unmeasured blast radius).

| Port                                                                   | Service                                                               |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `6379`                                                                 | `oracle-vps-redis` — **unauthenticated Redis on the public internet** |
| `7000`                                                                 | `oracle-vps-nexus-router`                                             |
| `5678`                                                                 | n8n                                                                   |
| `8400`                                                                 | twenty-mcp                                                            |
| `8777` / `8771` / `8774`                                               | gitingest / playwright / next-devtools MCP                            |
| `4001`                                                                 | crm-api                                                               |
| `8000`, `8020`, `8050`, `8081`, `8085`, `8089`, `7070`, `54322`, `111` | assorted                                                              |

Correct binds (unchanged): OmniRoute `100.64.0.3:20128`, Grafana/Prometheus/
OpenLIT/Letta on loopback.

### F-8. Two LiteLLM instances and floating tags — MEDIUM

`worker-rtx5090-worker-5090-litellm` ran `ghcr.io/berriai/litellm:main-latest`
alongside the Oracle gateway, violating the single-gateway invariant. A
`watchtower` container auto-updates floating `:latest` tags across the fleet —
unreviewed production mutation.

### F-9. Host boundaries were not enforced — MEDIUM

Containers named `oracle-vps-*`, `orchestrator-*`, `worker-rtx5090-*` and
`ellisapotheosis-*` were **all running on `worker-rtx5090`**. Naming was the only
boundary and nothing enforced it. This is what the root `compose.yaml` host
profiles plus host-checking deploy scripts fix.

### F-10. Internal traffic used public hostnames — MEDIUM

The pre-migration LiteLLM config reached both GPU workers via
`worker-rtx*.projectnyra.com`, which does not resolve from the Oracle container
network. Its own comment acknowledged this for the 5090 while doing it anyway
for the 3090 Ti and the retired worker. **Fixed** — all internal `api_base`
values are Tailnet IPs.

### F-11. Documented VRAM was wrong twice — MEDIUM

`services/nexus-router/src/config.ts:74` said 48 GB; `infra/CLAUDE.md` said
32 GB. `nvidia-smi` says **24463 MiB**. Model sizing from either figure would
OOM. **Fixed** in both places.

### F-12. `infra/env/` was gitignored — LOW

The broad `env/` pattern (aimed at Python virtualenvs) matched `infra/env/`,
hiding the per-host templates. **Fixed** with an explicit negation.

---

## 6. Negative-search gates

### Retired GPU worker — **PASS**

```bash
git grep -nEi 'worker[-_]?rtx3060|worker3060|rtx[-_]?3060|100\.64\.0\.12' -- ':!docs/archive/**'
```

Returns nothing outside three explicitly classified exceptions:

| Path                                         | Classification                                                                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.agent/memory/**`                           | agent episodic/semantic memory. Project policy: _"Never delete episodic or semantic memory entries — archive them."_ Historical record, not active configuration. |
| `.omc/`, `.playwright-mcp/`                  | ignored operational session artifacts, not configuration                                                                                                          |
| `docs/refactor/**`                           | the migration record itself, which must name what it removed                                                                                                      |
| `docs/operations/NYRA_DEPLOYMENT_RUNBOOK.md` | contains the gate command, which necessarily contains its own pattern                                                                                             |

`infra/hosts/worker-rtx3060/` (54 files) deleted. Git history untouched.

### Nexus — **NOT YET RUN**

```bash
git grep -nEi 'services/nexus-router|nexus-router:|NEXUS_MCP_URL|NEXUS_ROUTER_URL' -- ':!docs/archive/**'
```

**Still returns hits, correctly.** Nexus has not been deleted, because the
deletion gate is not met (B-3, B-4). Step 13 (register) precedes step 21
(delete); inverting them is prohibited.

Note that plain `nexus` must be searched separately — legitimate unrelated
terminology exists (`docs/applications/apps/01_Webapp_Nexus/`, the `flow-nexus`
Claude skill).

---

## 7. Nexus deletion gate — 0/22 EXERCISED

```
$ pytest tests/integration/mcp -v -s
1 passed, 28 skipped

========================================================================
NEXUS DELETION GATE
========================================================================
exercised : 0/22
failed    : 0
GATE: NOT MET - do NOT delete services/nexus-router
========================================================================
```

Every scenario skipped for want of a scoped LiteLLM key (B-3) or Cloudflare
service token (B-4). **This is the honest result.** `services/nexus-router/`
therefore remains in the tree.

Countervailing evidence, recorded for the human making the deletion call: the
bespoke service serves only `/health` (F-3), so its parity surface is
empty. That is a strong argument for deletion — but it is a judgement call about
a destructive action, not something to infer from an unrun test suite.

---

## 8. Acceptance tests NOT run, and why

| Suite                                                                  | Status      | Blocker                                                               |
| ---------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------- |
| Model plane — `/v1/models` on both workers                             | **not run** | B-1, B-2 — no vLLM deployed anywhere                                  |
| Model plane — scoped-key model list, completion, fallback, denial      | **not run** | B-3                                                                   |
| MCP plane — all 14 scenarios                                           | **not run** | B-3                                                                   |
| Cloudflare — Access denial, human OAuth, service token, portal surface | **not run** | B-4                                                                   |
| LMCache — cold/warm TTFT, cache hit, Redis traffic, RAM                | **not run** | B-1                                                                   |
| Semantic filter benchmark — recall@k, false positives, token reduction | **not run** | B-7                                                                   |
| Security — full exposure matrix from outside the tailnet               | **partial** | `ss -lntup` collected on Oracle (F-7); external probing not performed |

Nothing in this table is projected. A migration report that estimated these
numbers would be worse than one that admits they were not measured.

---

## 9. Sign-off status

| Gate                                        | State                           |
| ------------------------------------------- | ------------------------------- |
| Static validation                           | **PASS**                        |
| Config validated against the pinned release | **PASS**                        |
| Live topology confirmed                     | **PASS**                        |
| Retired-worker negative search              | **PASS**                        |
| Nexus negative search                       | **NOT RUN** — deletion deferred |
| Parity gate                                 | **NOT MET** — 0/22 exercised    |
| Production cutover                          | **NOT PERFORMED**               |

**This migration is repo-complete and deployment-ready, not deployed.** The
control plane is authored, validated against the real release, and safe to roll
out. Steps 6–9 and 14–21 require GPU access, a master key, and Cloudflare
access.

---

## 10. Addendum — orchestrator memory-manager plane (2026-09-04)

Evidence for the changes described in the final report's addendum and in
D-22 … D-25. Everything below was executed; nothing is inferred.

### 10.1 Environment facts, re-measured

| Claim                                             | Method                                                                      | Result                                                                            |
| ------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| WSL2 is a real tailnet peer (mirrored networking) | `ip addr show` in WSL2 on `worker-rtx5090`                                  | `eth1  inet 100.64.0.11/32` — **the earlier "not a tailnet peer" claim is wrong** |
| orchestrator tailnet IP                           | `ip addr show` inside its `Ubuntu-24.04` WSL                                | `eth1  inet 100.64.0.10/32`                                                       |
| orchestrator reachable from WSL2                  | `ping -c1 100.64.0.10`                                                      | 1 received, 1.311 ms                                                              |
| `worker-rtx3090ti` reachable                      | `ping -c1 100.64.0.13`                                                      | **0 received — still offline**                                                    |
| orchestrator identity                             | `ssh orch hostname`                                                         | `MiniApotheosis`                                                                  |
| orchestrator SSH shell                            | `ssh orch 'hostname -s'`                                                    | `hostname -s is not supported` — **Windows shell, not POSIX**                     |
| orchestrator CPU/RAM                              | `Win32_Processor` / `Win32_ComputerSystem`                                  | Ryzen 7 6800H, 8C/16T, **15.2 GB**                                                |
| orchestrator WSL VM RAM                           | `free -g` in `Ubuntu-24.04`                                                 | **7 GB** — the real container ceiling                                             |
| orchestrator Docker                               | `docker version` / `docker compose version`                                 | 29.7.2 / v5.5.1                                                                   |
| Tailnet-IP port publishing works there            | `docker run -p 100.64.0.10:8081:5432 …` then TCP connect from `100.64.0.11` | **`100.64.0.10:8081->5432/tcp`, connect OK**                                      |
| prior bitnet container state                      | `docker inspect orchestrator-bitnet`                                        | `OOMKilled=false ExitCode=137 FinishedAt=2026-06-14`, `Memory=10737418240`        |
| orchestrator LiteLLM container                    | `docker ps -a`                                                              | **absent** — the second control plane is not running                              |

### 10.2 Upstream artifacts — verified to exist before being referenced

| Artifact                                   | Method                   | Result                                                                                                                                                                                    |
| ------------------------------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ghcr.io/ggml-org/llama.cpp:server` digest | registry manifest `HEAD` | `sha256:fcca4dac…68468e31`, OCI index with `linux/amd64` **and** `linux/arm64`                                                                                                            |
| that image's build                         | `llama-server --version` | `0.3.0-dev (build 10795, commit 6703d7894)`                                                                                                                                               |
| required flags exist                       | `llama-server --help`    | `--embeddings`, `--pooling`, `--alias`, `--hf-repo`, `--hf-file`, `--embd-normalize` all present                                                                                          |
| `nomic-ai/nomic-embed-text-v1.5-GGUF`      | HF API                   | exists; ships `nomic-embed-text-v1.5.f16.gguf`                                                                                                                                            |
| `microsoft/BitNet` pin                     | GitHub API               | `0b341e582afbf9e1011f24744b554c96a3477eb5` (2026-07-27)                                                                                                                                   |
| `run_inference_server.py` at that pin      | GitHub API               | present; execs `build/bin/llama-server`, so the OpenAI-compatible surface is real                                                                                                         |
| `src/ggml-bitnet-mad.cpp` at that pin      | GitHub API               | present — the entrypoint patch target is valid                                                                                                                                            |
| BitNet weights                             | HF API                   | `microsoft/bitnet-b1.58-2B-4T-gguf` @ `a1f2f1c765812aa8af3f6eda4a313707064bba15`, ungated, contains exactly `ggml-model-i2_s.gguf`. **The capitalised id used previously 307-redirects.** |

### 10.3 Embedding equivalence — the load-bearing measurement

Both endpoints, input `"mortgage lead lookup"`:

```
llama.cpp  dims 768  l2norm 1.0  first5 [0.06201, 0.04203, -0.18452, -0.02088, 0.03274]
ollama     dims 768  l2norm 1.0  first5 [0.06198, 0.04204, -0.18453, -0.02083, 0.03271]

cosine similarity      0.999999581
max abs elementwise    9.874e-05
```

llama.cpp `/v1/models` self-report: `n_embd=768`, `n_params=136727040`,
`ftype=F16`, `n_ctx_train=2048`. `ollama show nomic-embed-text`:
`architecture=nomic-bert`, `parameter_size=137M`, `quantization_level=F16`,
`nomic-bert.embedding_length=768`.

**Conclusion: the same artifact. No re-embedding is required.**

The `--hf-repo`/`--hf-file` auto-download path that `compose.yaml` actually uses
was exercised separately, into a clean volume with `LLAMA_CACHE=/models`: it
fetched 261.6 MB to
`/models/models--nomic-ai--nomic-embed-text-v1.5-GGUF/` and produced the
identical vector (cosine `0.999999581`).

### 10.4 LiteLLM — booted against the real pinned image

`ghcr.io/berriai/litellm@sha256:a53a7d3f…eeb82c` (v1.99.1), the updated
`infra/configs/litellm/config.yaml`, `nyra-embedding` repointed at a live
llama.cpp origin:

| Check                                            | Result                                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `/health/readiness`                              | **200** `{"status":"healthy","db":"Not connected"}`                                                              |
| `/v1/models`                                     | **12 groups**, including `nyra-embedding` and `nyra-memory`                                                      |
| Schema errors                                    | **none**                                                                                                         |
| `POST /v1/embeddings {"model":"nyra-embedding"}` | **200, 768-element vector**, cosine `0.999999581` vs the old endpoint                                            |
| `mcp_semantic_tool_filter.enabled: true` boot    | **readiness 200**; `semantic_router … Using default LocalIndex`; router selected the `nyra-embedding` deployment |

All error lines in the log are environmental, not configuration: no
`litellm-redis` container in the sandbox, the pre-existing `nyra_crm`
`notifications/initialized` 400, and `nyra_tailscale` unreachable. All three are
already-recorded findings.

**The committed config still ships `mcp_semantic_tool_filter.enabled: false`.**
The `enabled: true` run above proves the flip is safe once the origin is live;
it is not flipped in the repo because the `orchestrator` profile is not
deployed, and enabling a filter against an origin that does not answer breaks
every MCP-bearing completion.

### 10.5 Repo-side static checks

| Command                                         | Result                                                                                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `./scripts/deploy/validate-compose-profiles.sh` | **PASS 5/5** — `oracle`, `orchestrator`, `worker-5090`, `worker-3090ti`, `agent-containerized`                                                                     |
| port bindings across all profiles               | `100.64.0.10:8081`, `100.64.0.10:8087`, `100.64.0.3:4000`, `100.64.0.11:6379`, `127.0.0.1:20128` — **no `0.0.0.0`**                                                |
| `shellcheck -S warning scripts/deploy/*.sh`     | **PASS**                                                                                                                                                           |
| `bash -n scripts/deploy/deploy-all.sh`          | **PASS**                                                                                                                                                           |
| `.agent/harness/llm.py` routing                 | **PASS** — `AGENT_BASE_URL`/`AGENT_API_KEY` reach the client constructor, `AGENT_MODEL` reaches the request, no global `OPENAI_*` needed; anthropic path unchanged |
| repo smoke suite (pre-commit)                   | **PASS** 8 files / 86 tests                                                                                                                                        |

### 10.6 NOT verified from this shell

| Item                                        | Why                                                                    | Exact command                                                                                                                                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The `orchestrator` profile actually running | not deployed; requires acting on another host                          | `ssh orchestrator 'wsl -d Ubuntu-24.04 -e bash -lc "cd ~/project-nyra && ./scripts/deploy/deploy-orchestrator.sh"'`                                                                             |
| bitnet.cpp compiling and serving            | needs the ~30 min first-start build on that host                       | as above, then `curl -fsS http://100.64.0.10:8087/health`                                                                                                                                       |
| `nyra-memory` answering a completion        | no BitNet origin is live anywhere                                      | `curl -sS http://100.64.0.3:4000/v1/chat/completions -H "Authorization: Bearer $NYRA_LITELLM_MEMORY_KEY" -d '{"model":"nyra-memory","messages":[{"role":"user","content":"summarise: test"}]}'` |
| `.agent` lane end-to-end                    | `openai` package absent (PEP 668 managed python); no scoped key exists | `uv pip install openai` in a venv, then `set -a; . ./infra/env/agent-memory.env; set +a; python3 .agent/harness/conductor.py "..."`                                                             |
| `worker-rtx3090ti`                          | host offline — `ping 100.64.0.13` fails                                | —                                                                                                                                                                                               |
| llama.cpp image signature                   | `cosign` unavailable, unchanged from D-01                              | `cosign verify ghcr.io/ggml-org/llama.cpp@sha256:fcca4dac…`                                                                                                                                     |
