# NYRA REFACTOR — DECISION LOG

Every decision below is grounded in evidence captured in
`NYRA_REFACTOR_PRESTATE.md`. Where live state contradicted repository
documentation, **live state won**. Where old Project-Nyra documentation
contradicted the pinned upstream release, **the pinned release won**.

---

## D-01 — Pin LiteLLM to `v1.99.1` by digest; verify ARM64 first

**Decision.** Production LiteLLM is
`ghcr.io/berriai/litellm@sha256:a53a7d3ffebede1925bd3ee8a21e4a7b9b63e2e68ec883af136edcccb6eeb82c`.

**Why.** Oracle is **`aarch64`**. Before pinning anything, the v1.99.1 OCI
index was inspected: it publishes `linux/amd64` **and** `linux/arm64`. Had it
been amd64-only the whole upgrade would have been impossible on this host and
the plan would have had to change. The digest was resolved by pulling on the
target host and reading `RepoDigests`, then the running package version was
confirmed as `1.99.1` from inside the image.

**Rejected.** `:latest`, `:main`, `:main-latest`. All three are currently in
use somewhere in the fleet, and a `watchtower` container is actively
auto-updating floating tags. That is unreviewed production mutation.

**Signature verification — blocked.** `cosign` is not installed on `oracle-vps`
and no keyless-verification tooling is present. The digest pin is in place;
signature attestation is recorded as an open item in
`NYRA_REFACTOR_VALIDATION.md` with the exact command to run.

---

## D-02 — `mcp_tool_search_enabled` is a per-key permission, never a global flag

**Decision.** Tool Search is enabled only via
`litellm_settings.default_key_generate_params.object_permission.mcp_tool_search_enabled`
and per-key `object_permission` on `/key/generate` and `/key/update`.

**Why.** Grepping the pinned image proves it: `mcp_tool_search_enabled` appears
**only** in `litellm/types/object_permission.py:25`, inside
`ObjectPermissionDict`. There is no top-level `litellm_settings` key and no
`LITELLM_MCP_TOOL_SEARCH_ENABLED` environment variable anywhere in v1.99.1.

**Consequence.** Any key created without an explicit `object_permission` does
not get Tool Search. That is the desired default-deny posture.

---

## D-03 — `mcp_semantic_tool_filter` is the only valid semantic-filter block

**Decision.** Use `litellm_settings.mcp_semantic_tool_filter` with keys
`enabled`, `embedding_model`, `top_k`, `similarity_threshold`.

**Why.** The pinned image ships this exact block in its own
`litellm/proxy/proxy_config.yaml` (with `top_k: 5`,
`similarity_threshold: 0.3`), and implements it at
`litellm/proxy/hooks/mcp_semantic_filter/hook.py`. `enable_semantic_tool_filtering`
does not exist in the image at all.

---

## D-04 — No `agent_search`, no `LITELLM_USE_KEYCHAIN`

**Decision.** Neither symbol appears in production config.

**Why.** Both were grepped for in the pinned image's site-packages and **found
absent**. The directive's `agent_search` instruction was explicitly
conditional on the installed release exposing it; the condition is unmet. A2A
discovery therefore uses the endpoints that _do_ exist
(`/a2a/{agent_id}/.well-known/agent-card.json`).

---

## D-05 — `EXPERIMENTAL_UI_LOGIN` stays disabled

**Decision.** Not set. Not present in any `.env.example`.

**Why.** Default posture is "experimental behaviour off unless its exact
behaviour is required". Nothing in the migration requires it. Enabling an
experimental auth path on the single control plane for no stated need is
unjustified risk.

---

## D-06 — Embedding workload moves 3060 → `worker-rtx5090` Ollama, same model, same dimensions

**This is the decision that unblocks retiring the 3060.**

**Evidence.** The retired 3060 is load-bearing today:

- `infra/configs/litellm/config.yaml` defines `local/embeddings` →
  `ollama/nomic-embed-text` at `http://worker-rtx3060.projectnyra.com:11434`.
- The live Oracle `mem0` container depends on it:
  `MEM0_EMBEDDER_MODEL=local/embeddings`,
  `MEM0_EMBEDDER_BASE_URL=http://litellm:4000/v1`,
  `MEM0_EMBEDDING_DIMS=768`.
- It also defines `local/qwen3-4b-3060` → `ollama/qwen3:4b` on the same dead
  host, consumed as `MEM0_LLM_MODEL`.

**Decision.** `worker-rtx5090` hosts the embedding endpoint.
`nomic-embed-text:latest` is **already present** in the 5090's Ollama
(confirmed via `/api/tags`: 137 M params, 0.27 GB). Serving it costs a
negligible fraction of a 24 GB GPU and does not materially reduce primary
inference availability — which is the directive's stated test for preferring a
local endpoint.

**Why the same model, not a "better" one.** `MEM0_EMBEDDING_DIMS=768` and the
existing Qdrant collections were built with `nomic-embed-text`. Swapping the
embedding model silently invalidates every stored vector. Keeping
`nomic-embed-text` makes this a pure endpoint move with **zero re-embedding**.

**`local/qwen3-4b-3060` replacement.** `qwen3:4b` is not present on the 5090.
The alias is retired and `MEM0_LLM_MODEL` is repointed at the logical alias
`nyra-fast`. `qwen3.5:latest` (9.7 B, 6.59 GB) is present on the 5090 and backs
that alias.

**Blocker, recorded not fabricated.** The 5090's Ollama currently listens on
**`127.0.0.1:11434` only**, so Oracle cannot reach it. It must be rebound to
the Tailnet address. The exact command is in the final report's hand-off
section. Until that is done, `local/embeddings` has no reachable origin and
`mcp_semantic_tool_filter` is authored with `enabled: false` (see D-07).

**Rejected.** Keeping any 3060 abstraction alive purely to preserve embeddings.
Rejected also: a hosted embedding provider — unnecessary, since a suitable
local endpoint exists at negligible cost. The hosted fallback remains the
documented contingency if local embedding is later measured to harm inference.

---

## D-07 — Semantic filter ships `enabled: false` until the embedding endpoint answers `/v1/embeddings`

**Decision.** `mcp_semantic_tool_filter.enabled: false` in the committed
config, with `embedding_model: nyra-embedding`, `top_k: 5`,
`similarity_threshold: 0.30` pre-populated.

**Why.** The directive requires, in order: verify LiteLLM can call the alias
via `/v1/embeddings`, run a real semantic-filter test, **then** write it into
production YAML. Steps 4–5 cannot be executed while the embedding origin is
unreachable (D-06). Shipping `enabled: true` against an unreachable embedder
would break every MCP-bearing completion.

Enabling it is a **one-line flip** once the endpoint is live, with the
verification command recorded. This is deliberately not deferred into vagueness:
the config, the alias, and the tuning parameters are all committed.

**Rejected.** Guessing a hosted embedding alias and enabling it — that would be
inventing a model identifier and a provider dependency.

---

## D-08 — GPU sizing from `nvidia-smi`, not from the repository

**Decision.** Both surviving workers are sized as **24 GB**.

**Why.** `services/nexus-router/src/config.ts:74` comments the 5090 as
_"48GB VRAM"_. Measurement says **24463 MiB** — an RTX 5090 **Laptop** GPU.
The repository was wrong; the user-stated 24 GB budget is right.

**`gpu_memory_utilization`.** Default `0.88`, **not** `0.95`. On 24 GB, 0.88
leaves ~2.9 GB for CUDA graphs, LMCache CPU-side overhead, the resident
`nomic-embed-text` embedder, and fragmentation headroom. `0.95` leaves ~1.2 GB
and would consume the final safety margin, which the directive forbids.

**`max_model_len` is deliberately left as a required variable with no default.**
It cannot be chosen without measuring KV-cache footprint on the actual
deployment, and guessing it is the single most common cause of OOM at load.

---

## D-09 — LMCache Redis is a separate instance on `worker-rtx5090`

**Decision.** Two Redis responsibilities, never shared:

| Host             | Service         | Purpose                                                   | Persistence                                             |
| ---------------- | --------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| `oracle-vps`     | `litellm-redis` | gateway cache / control                                   | `appendonly yes`, 2 GB, `allkeys-lru`                   |
| `worker-rtx5090` | `lmcache-redis` | GPU KV-cache remote backend at `redis://100.64.0.11:6379` | `appendonly no`, `save ""` (KV tensors are regenerable) |

**Why.** KV-tensor traffic is high-volume, high-churn and worthless after a
restart. Mixing it into the gateway's control cache evicts spend/routing state
and makes both unreliable.

**Port conflict, recorded.** `worker-rtx5090-worker-5090-redis` already binds
`127.0.0.1:6379` on this host. The new `lmcache-redis` binds
`100.64.0.11:6379` — a different interface, so no bind collision, but the
existing container's role must be reconciled during deployment.

**`LMCACHE_REDIS_MAXMEMORY` has no default.** It must be set from measured host
RAM. `worker-rtx5090`'s RAM was not measurable from the sandboxed WSL2 shell,
so a value is not invented.

**`LMCACHE_USE_EXPERIMENTAL=True` stays an environment variable**, not a YAML
key. `LMCACHE_ENABLE` is not used — it is undocumented as an activation
mechanism.

---

## D-10 — Independent vLLM replicas, not cross-host tensor parallelism

**Decision.** `worker-rtx5090` and `worker-rtx3090ti` each serve one model
independently; LiteLLM routes and fails over between them.

**Why.** Tensor parallelism across two consumer GPUs joined only by a WAN
Tailnet link is latency-bound on every layer boundary. The directive's own
guidance prefers independent replicas + gateway routing. The 3090 Ti has also
been offline 39 days, so any topology depending on both being simultaneously
live is fragile.

---

## D-11 — Root `compose.yaml` with host profiles; deploy scripts run on the correct host

**Decision.** One canonical root `compose.yaml` with profiles `oracle`,
`worker-5090`, `worker-3090ti`, `agent-containerized`, `observability`, plus
`scripts/deploy/deploy-{oracle,worker-5090,worker-3090ti,all}.sh`.
`deploy-all.sh` uses SSH to invoke each host's local profile.

**Why.** Compose cannot orchestrate across three machines. The pre-state proves
the cost of pretending otherwise: containers named `oracle-vps-*`,
`orchestrator-*` and `worker-rtx5090-*` are **all running on `worker-rtx5090`**,
because the naming convention was the only boundary and nothing enforced it.

**Existing overlays are not deleted in this pass.** 87 compose files exist. The
root file is introduced as canonical and the host overlays are reconciled
incrementally; deleting unique mounts before diffing them is explicitly
forbidden.

---

## D-12 — OmniRoute and OpenRouter sit _behind_ LiteLLM; OmniRoute stays off the public internet

**Decision.** Agent → LiteLLM → OmniRoute → provider pool. OmniRoute keeps its
own internal provider/credential logic.

**Why.** Live state already binds OmniRoute to `100.64.0.3:20128` (Tailnet
only, **not** `0.0.0.0`) — correct, and preserved. Port 20128 is never
published publicly.

**OmniRoute admin MCP.** If administrative OmniRoute tooling is needed it is
registered as a restricted `nyra-admin` MCP server, not handed to every agent.

---

## D-13 — Cloudflare boundary preserved; origin retargeted; `code_mode = off`

**Decision.** The Cloudflare Access application, service-token policies, tunnel
and MCP Server Portal are **kept**. Only the upstream origin changes from Nexus
to LiteLLM `/mcp`. `code_mode = off`, and **no**
`?optimize_context=search_and_execute` on the production upstream.

**Why.** LiteLLM's Virtual Tool Search is already the context-collapse layer.
Stacking Cloudflare's `search_and_execute` on top produces
`CF query/execute → LiteLLM search/call → downstream`: two independent
discovery abstractions in series, doubling failure modes and token cost for no
gain. A separate `nyra-mcp-cf-canary` portal is the only place
`search_and_execute` may appear, and it is non-production.

**Control-plane cycle prohibition.** LiteLLM's `mcp_servers` must never contain
the Cloudflare portal that fronts LiteLLM. The registered Cloudflare MCP
servers are Cloudflare's _own_ product endpoints (`mcp.cloudflare.com`,
`docs.`, `bindings.`, …), which are not the Nyra portal — verified against the
live config.

---

## D-14 — Cloudflare MCP servers get scoped; `allow_all_keys: true` is removed

**Decision.** All seven `allow_all_keys: true` entries lose that flag.
`cloudflare_docs` (unauthenticated docs) → `nyra-dev`. The six token-bearing
servers (`cloudflare`, `cloudflare_api`, `cloudflare_bindings`,
`cloudflare_builds`, `cloudflare_observability`, `cloudflare_ai_gateway`) →
**`nyra-admin` only**.

**Why.** This is the single largest live authorization defect found. Today
_every_ LiteLLM key can drive Cloudflare zone/bindings/builds administration
using the account's API token. A mortgage agent must not be able to modify DNS.

---

## D-15 — Infisical Agent Proxy over resurrecting Agent Vault

**Decision.** Canonical Infisical variables are exactly the seven in the
directive's contract. No `AGENT_VAULT_*` variables are created.

**Why.** `oracle-vps-agent-vault` (`infisical/agent-vault:latest`) is running
on both reachable hosts. It is **not deleted by this migration** — no parity
test for its replacement has been run, and the directive forbids deleting a
working subsystem before its replacement passes parity. It is instead frozen:
no new dependencies are added to it, and Agent Proxy is the forward path.

**Identity separation.** The Oracle service identity and the autonomous-agent
identity are distinct. An agent that can call the proxy must not be able to read
the backing secret.

**`NO_PROXY`.** Must contain `127.0.0.1`, `localhost`, `100.64.0.0/10`,
`.trex-fiordland.ts.net` and Docker-local service names. Local vLLM, LMCache
Redis, Tailscale control traffic and intra-Docker traffic are never proxied.

---

## D-16 — Subscription credentials are never relayed as provider API keys

**Decision.** Claude Code and Codex keep their native authentication.
`OPENAI_BASE_URL`/`OPENAI_API_KEY` pointing at LiteLLM are set **per-profile**,
never globally.

**Why.** Setting them globally breaks native subscription auth. Scraping
browser/session tokens into Infisical or relaying them as fake provider keys is
prohibited outright.

---

## D-17 — Master key never leaves the gateway

**Decision.** Six scoped virtual keys, none of them the master key:
`NYRA_LITELLM_DEV_KEY`, `NYRA_LITELLM_AGENT_KEY`,
`NYRA_LITELLM_AUTOMATION_KEY`, `NYRA_LITELLM_MORTGAGE_KEY`,
`NYRA_LITELLM_ADMIN_KEY`, `NYRA_LITELLM_OBSERVABILITY_KEY`.

Access groups: `nyra-dev`, `nyra-admin`, `nyra-mortgage`, `nyra-memory`,
`nyra-automation`, `nyra-observability`.

`LITELLM_MASTER_KEY` appears only in the Oracle runtime environment. It is never
placed in ClawTeam, OpenHarness, Claude Code or any agent env, and is not used
for acceptance tests.

---

## D-18 — Mortgage/CRM domain isolation is enforced at four layers

**Decision.** Least privilege at Cloudflare, at the LiteLLM key, at the MCP
server grant, and at the downstream service credential. A system prompt is
**never** the authorization mechanism.

Concretely: a `nyra-dev` key cannot reach `nyra_crm`; a `nyra-mortgage` key
cannot reach `nyra_docker`, `nyra_secrets`, or any Cloudflare admin MCP server.
Read/write split inside `nyra_crm` uses `mcp_tool_permissions`.

---

## D-19 — Delete order is fixed: register (13) before delete (21)

**Decision.** MCP registrations are migrated to LiteLLM, parity is proven, the
Cloudflare origin is cut over, and **only then** is Nexus removed. Steps 13 and
21 are never inverted.

`services/nexus-router/` is preserved in git history. Its architectural
rationale is archived to `docs/archive/nexus-router-retired.md` under a
`RETIRED — NOT OPERATIONAL CONFIGURATION` header, with copy-paste deploy
commands stripped.

---

## D-20 — The 3060 tailnet node record is a hand-off, not a repo change

**Decision.** All 3060 references are purged from active source, config, docs
and deployment targets, and `infra/hosts/worker-rtx3060/` is deleted. Git
history is untouched.

**Not executable here.** `worker-rtx3060` (`100.64.0.12`) is **still an active
tailnet node record**, last seen 1 day ago. Removing it requires Tailscale
admin-console access, which this run does not have. It is escalated in the
final report with the exact action, and remains a genuine residual security
item: a retired, sold machine still holds a tailnet identity.

---

## D-21 — Public `0.0.0.0` binds on a public cloud VM are recorded, not silently changed

**Decision.** The exposure matrix is documented in
`NYRA_REFACTOR_VALIDATION.md`. The **new** services introduced by this
migration bind Tailnet-only or loopback-only. Pre-existing public binds
(`oracle-vps-redis` on `0.0.0.0:6379`, several MCP servers on `0.0.0.0`) are
reported as findings with remediation commands.

**Why not fixed inline.** Re-binding a live Redis that unknown services depend
on, in the same pass as a control-plane migration, risks an outage whose blast
radius was not measured. It is raised as a high-severity finding with an exact
fix, not bundled into an unrelated cutover.

---

## D-22 — The embedding endpoint moves to orchestrator CPU (llama.cpp), not a GPU

**Supersedes D-06's host choice. The invariant D-06 established is preserved.**

**Decision.** `nyra-embedding` is served by `llama.cpp` on `orchestrator`
(`100.64.0.10:8081`), from
`nomic-ai/nomic-embed-text-v1.5-GGUF/nomic-embed-text-v1.5.f16.gguf`.

**Why the CPU.** `nomic-embed-text-v1.5` is 137 M parameters, 274 MB at F16.
Serving it is memory-bandwidth-bound, not compute-bound, and it needs no VRAM.
Keeping it resident on a 24 GB card consumed inference headroom and put the 5090
Ollama runtime on the critical path of semantic tool filtering for no throughput
benefit. D-06 correctly judged 0.27 GB to be affordable; it is still strictly
better to spend zero.

**Why the same model — verified, not asserted.** D-06 argued from model names.
This decision measured. Same input through both endpoints:

|               | worker-rtx5090 Ollama   | orchestrator llama.cpp                          |
| ------------- | ----------------------- | ----------------------------------------------- |
| dimensions    | 768                     | 768                                             |
| L2 norm       | 1.0                     | 1.0                                             |
| self-reported | `nomic-bert`, 137M, F16 | `n_embd=768`, `n_params=136727040`, `ftype=F16` |

Cosine similarity **0.999999581**, max elementwise delta **9.9e-05** — float
rounding. `MEM0_EMBEDDING_DIMS=768` and the existing Qdrant collections stay
valid; **nothing is re-embedded**, for the third host move in a row.

**Rejected.** Ollama on orchestrator — the user asked for llama.cpp
specifically, and a bare `llama-server --embeddings` is a smaller surface than a
model-management daemon for a single fixed model. Also rejected: a hosted
embedding provider, unchanged from D-06.

**Consequence for D-08.** `gpu_memory_utilization` stays at **0.88**. The freed
embedder allowance becomes headroom. Raising it requires re-measurement under
load, which this pass did not do.

---

## D-23 — orchestrator hosts a BitNet memory manager; it does not become a gateway

**Decision.** `orchestrator` runs `bitnet.cpp` serving BitNet b1.58 2B-4T
(`i2_s`) at `100.64.0.10:8087`, registered on the canonical oracle-vps LiteLLM
as the `nyra-memory` alias.

**Why.** The `.agent/` consolidation lane is small-context, latency-tolerant and
constant — the exact profile that should not compete with interactive inference
on a GPU. A 1-bit 2 B model on 16 CPU threads is adequate for summarisation and
costs no VRAM. bitnet.cpp is a fork of llama.cpp's `llama-server`, so it speaks
OpenAI-compatible `/v1/chat/completions` and needs no bespoke adapter.

**Not a second control plane.** `infra/COMPOSE_SOURCE_OF_TRUTH.md`'s constraint
holds: orchestrator runs no LiteLLM and no Nexus. Both services are
unauthenticated Tailnet-only origins consumed as ordinary `model_list` entries,
exactly like the vLLM workers. Consumers address the alias through the gateway,
never `100.64.0.10:8087` directly, so routing, budget and key scoping still
apply.

**No fallbacks, in either direction.** Spilling background reflection onto a GPU
or paid route wastes capacity; spilling interactive work onto a 2 B CPU model
silently destroys answer quality. Both are wrong, so `nyra-memory` appears in no
fallback chain.

**Reused, not rebuilt.** `infra/hosts/orchestrator/bitnet/` already existed and
is the build context. It was corrected rather than duplicated: unpinned
`git clone` → pinned commit, unpinned weights → pinned revision on the canonical
lowercase repo id, non-idempotent source patch → idempotent, `mem_limit: 10g` on
a 7 GB WSL2 VM → 3g, `0.0.0.0` host bind → tailnet bind.
`docker-compose.bitnet.yml` was removed as superseded by the root profile —
two deployment surfaces for one service is the defect
`COMPOSE_SOURCE_OF_TRUTH.md` exists to prevent.

---

## D-24 — Delete the orchestrator LiteLLM overlay; it fails no parity test because it runs nothing

**Decision.** `infra/hosts/orchestrator/docker-compose.litellm.yml` and
`infra/hosts/orchestrator/litellm/config.yaml` are deleted.

**Why this is not a D-19/D-15 violation.** Those decisions forbid deleting a
_working_ subsystem before its replacement passes parity. This one is not
working: `docker ps -a` on orchestrator shows no litellm container, and the last
recorded run predates the llxprt retirement. There is no live behaviour to reach
parity with.

**Why it had to go rather than sit there.** It declared itself the "PRIMARY
LiteLLM instance", in direct contradiction of the single-gateway invariant this
migration exists to establish. Leaving a file that says that is an active hazard
for the next agent. It was also stale in every other dimension: pinned to the
superseded `:v1.92.0`, binding `0.0.0.0:4010` in violation of the Tailnet-only
rule, routing to the retired RTX 3060 and the retired llxprt bridge, and
addressing workers by `*.projectnyra.com` hostnames the migration proved do not
resolve from container networks.

**Security finding.** It carried a **hardcoded llxprt bridge API key** as a
compose default (`${LLXPRT_BRIDGE_API_KEY:-llxprt_...}`). Deleting the file does
not rotate the credential and it remains in git history. Added to the rotation
list in the final report.

**Nothing depended on it** except its own `Makefile` targets, which are replaced
by `memory-{up,down,health}` pointing at the root compose `orchestrator`
profile.

---

## D-25 — The dream cycle is not wired to a model, deliberately

**Decision.** `nyra-memory` is wired into `.agent/harness/llm.py` (used by
`conductor.py`) via `AGENT_BASE_URL`/`AGENT_API_KEY`, and configured by
`infra/env/agent-memory.env.example`. It is **not** wired into
`memory/auto_dream.py`.

**Why not.** The consolidation pipeline is mechanical by design — similarity
clustering, salience thresholds, lifecycle bookkeeping — and `auto_dream.py`'s
own docstring lists "subjective validation" and "promotion to LESSONS.md" under
**Never**. Promotion is `graduate.py`, driven by the host agent, and the project
rule is "never hand-edit `LESSONS.md`". Injecting a model there would let a
model promote its own lessons with no review. That is a worse system, not a more
automated one.

**Why `AGENT_BASE_URL` rather than `OPENAI_BASE_URL`.** D-16 prohibits setting
`OPENAI_BASE_URL`/`OPENAI_API_KEY` globally because it breaks native
subscription auth for Claude Code and Codex. The previous `openai` branch of
`llm.py` relied on the SDK's own environment lookup, so pointing the harness at
LiteLLM required exactly that global export. The explicit variables make the
lane scopeable.
