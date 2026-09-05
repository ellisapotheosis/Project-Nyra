# Nyra model plane

LiteLLM is the parent router and the only model gateway. Agents address logical
aliases; they never see providers.

## Agent-facing aliases

The complete, stable set. Anything else is an internal routing target.

| Alias            | Backed by                                                     | Purpose                                   |
| ---------------- | ------------------------------------------------------------- | ----------------------------------------- |
| `nyra-general`   | vLLM on both GPU workers                                      | default lane                              |
| `nyra-fast`      | Ollama `qwen3.5:latest` on `worker-rtx5090`                   | small/fast lane                           |
| `nyra-reasoning` | vLLM on `worker-rtx5090`                                      | long-horizon reasoning, extended timeouts |
| `nyra-coding`    | vLLM on `worker-rtx5090`                                      | code generation                           |
| `nyra-embedding` | llama.cpp `nomic-embed-text-v1.5` on **`orchestrator` (CPU)** | 768-dim embeddings                        |
| `nyra-memory`    | bitnet.cpp `BitNet b1.58 2B-4T` on **`orchestrator` (CPU)**   | memory consolidation / reflection         |

`nyra-fast` replaces the retired `local/qwen3-4b-3060` alias.

`nyra-memory` is also the name of an MCP access group. LiteLLM keeps model
aliases and MCP access groups in separate namespaces, so there is no functional
conflict — read it as the group in an `mcp_access_groups:` list and as this
model alias in a `models:` list.

## Host roles

| Host                               | Role                                                          |
| ---------------------------------- | ------------------------------------------------------------- |
| `oracle-vps` (`100.64.0.3`)        | the only gateway — LiteLLM, MCP aggregation, ingress          |
| `orchestrator` (`100.64.0.10`)     | memory-manager: embeddings + consolidation LLM. **CPU only.** |
| `worker-rtx5090` (`100.64.0.11`)   | pure inference worker                                         |
| `worker-rtx3090ti` (`100.64.0.13`) | pure inference worker                                         |

`orchestrator` is **not** a second control plane. It runs no LiteLLM and no
Nexus; it publishes two Tailnet origins that the Oracle LiteLLM consumes as
ordinary `model_list` entries, exactly like the vLLM workers. The orchestrator
LiteLLM overlay that used to exist has been deleted.

## Routing hierarchy

```
local GPU models
   |  on failure / capacity policy
   v
OmniRoute free/pooled route
   |
   v
OpenRouter approved/free routes
   |
   v
paid API routes  --  NONE are configured or budget-authorized
```

Implemented as `router_settings.fallbacks` (ordered), not by exposing providers
to clients:

```yaml
nyra-general: [omniroute-free, openrouter-gemma]
nyra-reasoning: [omniroute-free, openrouter-minimax]
nyra-coding: [omniroute-coding, openrouter-gemma]
nyra-fast: [omniroute-fast, openrouter-nemotron]
omniroute-*: [openrouter-*]
```

`routing_strategy: usage-based-routing-v2`, `num_retries: 2`,
`allowed_fails: 2`, `cooldown_time: 30`.

## Local inference

### Served-model-name contract

| Host               | `--served-model-name` | LiteLLM `api_base`           |
| ------------------ | --------------------- | ---------------------------- |
| `worker-rtx5090`   | `nyra-primary`        | `http://100.64.0.11:8000/v1` |
| `worker-rtx3090ti` | `nyra-secondary`      | `http://100.64.0.13:8000/v1` |

Both sides of this contract change together or neither changes.

**Tailnet IPs, never public hostnames.** The pre-migration config reached both
workers by `*.projectnyra.com`, which does not resolve from the Oracle container
network — that was a live DNS-timeout defect, not a working configuration.

### Capacity policy

**Measured, not inferred from the model name.** `nvidia-smi` on
`worker-rtx5090` reports an **RTX 5090 Laptop GPU with 24463 MiB**. The
repository claimed 48 GB in `services/nexus-router/src/config.ts` and 32 GB in
`infra/CLAUDE.md`. Both were wrong. Size everything for **24 GB**.

- One primary served model per GPU unless measurement shows room for another
  process without harming latency or reliability.
- `gpu_memory_utilization` defaults to **0.88, not 0.95.** On 24 GB, 0.88 leaves
  ~2.9 GB for CUDA graphs, LMCache CPU-side overhead, the resident embedder and
  fragmentation. 0.95 leaves ~1.2 GB and consumes the final safety margin.
- `max_model_len` has **no default**. It cannot be chosen without measuring KV
  footprint for the selected model at the intended concurrency; guessing it is
  the most common cause of OOM under load.
- Tune with: idle VRAM, warm KV cache, peak prompt length, concurrency, CUDA
  graph overhead, LMCache overhead, OOM history.

### The GPUs no longer host embeddings

The embedding endpoint has moved twice: retired RTX 3060 Ollama →
`worker-rtx5090` Ollama → `orchestrator` llama.cpp (CPU). Both GPU workers are
now **pure inference**.

Why the CPU is the right host: `nomic-embed-text-v1.5` is 137 M parameters
(274 MB at F16). Serving it is memory-bandwidth-bound, not compute-bound, and it
needs no VRAM at all. Keeping it resident on a 24 GB card consumed inference
headroom and put the Ollama runtime on the critical path of semantic tool
filtering, for no throughput benefit.

**The model family and dimension count are invariant across all three moves.**
That is what makes this a pure endpoint change with zero re-embedding:
`MEM0_EMBEDDING_DIMS=768` and every existing Qdrant collection stay valid.

Measured, not assumed — the same prompt through both endpoints:

|               | worker-rtx5090 Ollama   | orchestrator llama.cpp                          |
| ------------- | ----------------------- | ----------------------------------------------- |
| dimensions    | 768                     | 768                                             |
| L2 norm       | 1.0                     | 1.0                                             |
| reported arch | `nomic-bert`, 137M, F16 | `n_embd=768`, `n_params=136727040`, `ftype=F16` |

Cosine similarity between the two vectors: **0.999999581**. Max elementwise
delta: **9.9e-05** — float rounding, not a different model.

The GGUF is `nomic-ai/nomic-embed-text-v1.5-GGUF` /
`nomic-embed-text-v1.5.f16.gguf`, which is the artifact Ollama also ships as
`nomic-embed-text:latest`.

**Do not raise `gpu_memory_utilization` on the strength of this change.** The
freed allowance stays as headroom until it is re-measured under load.

### Memory manager

`nyra-memory` backs the `.agent/` episodic → semantic consolidation lane:
summarisation and reflection over `AGENT_LEARNINGS.jsonl`. That workload is
small-context, latency-tolerant and constant, which is exactly the profile that
should not compete with interactive inference on a GPU.

BitNet b1.58 2B-4T at `i2_s` runs entirely on CPU. `bitnet.cpp` is a fork of
llama.cpp's `llama-server`, so it speaks the OpenAI-compatible
`/v1/chat/completions` surface and LiteLLM reaches it with the `openai/`
provider.

`nyra-memory` is deliberately **absent from every fallback chain, in both
directions**. Spilling background reflection onto a GPU or paid route, or
spilling interactive work onto a 2 B CPU model, would each be wrong.

Consumer configuration: `infra/env/agent-memory.env.example`. It addresses the
LiteLLM alias, never `http://100.64.0.10:8087` directly.

### Independent replicas, not cross-host tensor parallelism

The 3090 Ti is a **separate deployment**. Tensor parallelism across two consumer
GPUs joined only by a WAN Tailnet link is latency-bound at every layer boundary,
and `worker-rtx3090ti` has been offline for 39 days — any topology requiring
both to be simultaneously live is fragile. LiteLLM routing and fallback between
independent replicas is the design.

### Validate the CLI before committing a command

```bash
vllm serve --help
```

Run this on the GPU host against the pinned image before first production start.
The `--kv-transfer-config` syntax in `compose.yaml` has **not** been validated
against a running vLLM.

## LMCache

Two Redis instances with two different responsibilities. Never share them.

| Host             | Service         | Purpose                     | Persistence                           |
| ---------------- | --------------- | --------------------------- | ------------------------------------- |
| `oracle-vps`     | `litellm-redis` | gateway cache / control     | `appendonly yes`, 2 GB, `allkeys-lru` |
| `worker-rtx5090` | `lmcache-redis` | GPU KV-cache remote backend | `appendonly no`, `save ""`            |

KV tensors are high-volume, high-churn and regenerable. Mixing them into the
gateway's control cache evicts spend and routing state and makes both
unreliable.

Both GPU hosts point at `redis://100.64.0.11:6379`, which is what makes
cross-instance KV reuse possible.

```dotenv
LMCACHE_USE_EXPERIMENTAL=True     # must remain an ENVIRONMENT VARIABLE
LMCACHE_CHUNK_SIZE=256
LMCACHE_REMOTE_URL=redis://100.64.0.11:6379
LMCACHE_REMOTE_SERDE=naive
LMCACHE_CONFIG_FILE=/etc/lmcache/lmcache.yaml
LMCACHE_REDIS_MAXMEMORY=          # from MEASURED host RAM - no default
```

`LMCACHE_ENABLE` is **not** used; it is not a documented activation mechanism.

YAML: `infra/configs/lmcache/worker-rtx5090.yaml`,
`infra/configs/lmcache/worker-rtx3090ti.yaml`.

vLLM connector: `LMCacheConnectorV1`, `kv_role=kv_both`.

`LMCACHE_REDIS_MAXMEMORY` must not starve Linux, Docker, vLLM CPU-side work, the
LMCache CPU cache, or the developer applications on that workstation.

### Proving distributed cache works

Warm a deterministic long prefix against the 5090, repeat it, then issue a
compatible request to the 3090 Ti deployment. Measure cold TTFT, warm TTFT,
cache hit, Redis traffic, CPU RAM, Redis RAM, GPU RAM.

**Redis answering `PING` is not evidence that distributed cache works.**

## OmniRoute

```
Nyra agent -> LiteLLM -> OmniRoute -> OmniRoute provider pool
```

OmniRoute keeps its own provider and credential logic internally. It is not the
Nyra front door. It binds loopback on Oracle; **port 20128 is never published
publicly.**

If administrative OmniRoute tooling is ever needed, register its MCP server as a
restricted `nyra-admin` server — do not give every agent direct control over the
router.

## OpenRouter

Another LiteLLM downstream. `OPENROUTER_API_KEY` lives in Infisical and never
appears in YAML, Compose, `.env.example`, agent configuration, ClawTeam prompts
or OpenHarness profiles.

Model ids were **re-verified against the live catalog** during this migration —
`https://openrouter.ai/api/v1/models` currently advertises 426 models of which
18 are `:free`. All three configured ids are still present:

- `google/gemma-4-26b-a4b-it:free`
- `nvidia/nemotron-3.5-lightning:free`
- `minimax/minimax-m3:free`

Do not assume an old `:free` identifier still exists. Re-check on every change.

## Paid providers

None are enabled. `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are deliberately
**absent** from the Oracle environment: declaring a provider that is not
budget-authorized creates a meaningless blank dependency and a credential the
gateway does not need to hold.

To enable one, add the `model_list` entry and the credential in the same change,
and put it at the bottom of the fallback chain.

## Keys

Agents use scoped virtual keys, never `LITELLM_MASTER_KEY`. See
`NYRA_SECRETS_PLANE.md`.

## Acceptance tests

```bash
# from oracle-vps
curl -fsS http://100.64.0.11:8000/v1/models
curl -fsS http://100.64.0.13:8000/v1/models
curl -fsS http://100.64.0.10:8081/health     # embeddings   (orchestrator)
curl -fsS http://100.64.0.10:8087/health     # memory-manager (orchestrator)

# from any internal Tailnet client
curl -fsS http://100.64.0.3:4000/health/readiness
```

The embedding width is a hard contract — a different number means a different
model, and pointing mem0/Qdrant at it corrupts the vector store:

```bash
curl -fsS http://100.64.0.10:8081/v1/embeddings \
  -H 'Content-Type: application/json' \
  -d '{"model":"nomic-embed-text","input":"dimension check"}' |
  python3 -c 'import json,sys; print(len(json.load(sys.stdin)["data"][0]["embedding"]))'
# must print exactly: 768
```

`scripts/deploy/deploy-orchestrator.sh` runs this check and hard-fails on any
other value.

Then, using a **scoped** key (never the master key):

- list permitted models,
- complete a local model request,
- force/simulate primary failure and verify the secondary,
- verify the OmniRoute route,
- verify the OpenRouter route,
- verify an unauthorized model is denied.
