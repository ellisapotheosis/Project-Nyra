# Nyra control plane

**Status:** current architecture as of 2026-09-04.
Supersedes every Nexus-era description of Nyra routing.

## Canonical vocabulary

Use these words for these things. Nothing else.

| Term            | Role                                 |
| --------------- | ------------------------------------ |
| **Cloudflare**  | edge trust and governance            |
| **LiteLLM**     | AI model / tool / A2A gateway        |
| **Tailscale**   | private transport                    |
| **Infisical**   | secret authority                     |
| **vLLM**        | local inference                      |
| **LMCache**     | KV reuse                             |
| **OmniRoute**   | downstream provider aggregator       |
| **ClawTeam**    | multi-agent coordination             |
| **OpenHarness** | agent harness / evaluation / runtime |
| **Nexus**       | **retired**                          |

## Topology

```
Remote users / remote autonomous agents
               |
               v
    Cloudflare Access / Zero Trust
               |
               v
    Cloudflare MCP Server Portal          code_mode = off
               |                          no ?optimize_context=search_and_execute
               v
      cloudflared -> Oracle VPS
               |
               v
         LiteLLM Gateway  (100.64.0.3:4000, Tailnet-only bind)
       /        |         \
      /         |          \
Model Plane  MCP Plane    A2A Plane
   |            |             |
   |     Virtual Tool         |
   |        Search            |
   |            |             |
   v            v             v
OmniRoute   downstream       Nyra
OpenRouter  MCP servers     agents
local vLLM
```

## Hosts

| Host               | Tailnet IP    | Arch        | Role                                                                                                                   |
| ------------------ | ------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `oracle-vps`       | `100.64.0.3`  | **aarch64** | LiteLLM gateway, litellm-redis, PostgreSQL data plane, OmniRoute, Infisical integration, cloudflared                   |
| `worker-rtx5090`   | `100.64.0.11` | x86_64      | primary dev + inference node: vLLM, LMCache, **LMCache Redis**, embedding endpoint, Claude Code, ClawTeam, OpenHarness |
| `worker-rtx3090ti` | `100.64.0.13` | x86_64      | secondary inference: vLLM, LMCache                                                                                     |

Tailnet: `*.trex-fiordland.ts.net`.

**There are exactly two GPU workers.** A third (an RTX 3060) was retired and
sold; it is not a standby, fallback, embedding host, WOL target or deployment
target.

Public web (Cloudflare Pages): RateHunter.net and other public/landing apps.

## Network rules

1. **All private cross-node application traffic uses `100.64.0.0/10` Tailnet
   addresses.** Internal traffic must not depend on public
   `projectnyra.com` hostnames — those do not resolve from the Oracle container
   network and turn into DNS timeouts. This was a live defect: the pre-migration
   LiteLLM config reached both GPU workers by public hostname.
2. **Cloudflare is the only public ingress.** LiteLLM binds
   `100.64.0.3:4000`, never `0.0.0.0`. `oracle-vps` is a public cloud VM.
3. **OmniRoute is never public.** Port `20128` binds loopback; only LiteLLM
   consumes it.
4. **vLLM `:8000` and both Redis instances are never public.**

## The single-gateway rule

LiteLLM is the only Nyra model gateway and the only MCP aggregation layer.

Agents must not independently know about:

- individual vLLM servers,
- OpenRouter,
- OmniRoute,
- commercial providers,
- provider fallback order.

They get **logical model aliases** and **scoped virtual keys**. Nothing else.

Corollaries, each of which was violated somewhere before this migration:

- No second LiteLLM. A `ghcr.io/berriai/litellm:main-latest` instance was
  running on `worker-rtx5090` in addition to the Oracle gateway; it is retired.
- No gateway in front of the gateway. Nexus proxied `/v1/chat/completions`
  through to LiteLLM and re-implemented provider management on top of it.
- ClawTeam is an orchestration layer, not another gateway.
- OpenHarness is a harness/runtime, not another gateway.

## Deployment model

Compose cannot orchestrate across three machines. The canonical root
`compose.yaml` declares **host profiles**, and the deploy scripts run the right
profile on the right host:

| Profile               | Host               | Services                                    |
| --------------------- | ------------------ | ------------------------------------------- |
| `oracle`              | `oracle-vps`       | `litellm-redis`, `litellm`, `omniroute`     |
| `worker-5090`         | `worker-rtx5090`   | `lmcache-redis`, `vllm-5090`                |
| `worker-3090ti`       | `worker-rtx3090ti` | `vllm-3090ti`                               |
| `agent-containerized` | either worker      | `clawteam`, `openharness` — CI/sandbox only |

```bash
# on the host itself
./scripts/deploy/deploy-oracle.sh
./scripts/deploy/deploy-worker-5090.sh
./scripts/deploy/deploy-worker-3090ti.sh

# from anywhere, over SSH/Tailscale
./scripts/deploy/deploy-all.sh
```

Each script refuses to run on the wrong machine. `deploy-all.sh` uses SSH; it
never pretends a local compose call starts a remote host's GPU container.

**Interactive ClawTeam and OpenHarness use their host-native installation.** The
containerized profile exists for reproducible CI. Do not force Claude Code's
OS/browser/keychain authentication into a container for architectural purity.

Every production image is pinned by digest. See `.env.example`.

## Why Nexus is gone

Full analysis: `docs/refactor/NEXUS_CAPABILITY_MIGRATION_MATRIX.md` and
`docs/archive/nexus-router-retired.md`.

Short version: Nexus re-implemented LiteLLM in front of LiteLLM. It carried its
own provider manager, model discovery, worker manager, router, rate limiter and
OAuth2 middleware — every one of which LiteLLM already provides, and provides
with permission gating that Nexus lacked. Its only genuinely distinct capability
was Fuse.js lexical tool search, which LiteLLM's Virtual Tool Search and
embedding-based semantic filter supersede.

## Related

| Topic              | Document                                   |
| ------------------ | ------------------------------------------ |
| MCP plane          | `NYRA_MCP_ARCHITECTURE.md`                 |
| Model plane        | `NYRA_MODEL_PLANE.md`                      |
| Secrets            | `NYRA_SECRETS_PLANE.md`                    |
| Deployment         | `../operations/NYRA_DEPLOYMENT_RUNBOOK.md` |
| Rollback           | `../operations/NYRA_ROLLBACK_RUNBOOK.md`   |
| MCP operations     | `../operations/NYRA_MCP_RUNBOOK.md`        |
| Verified endpoints | `../refactor/LITELLM_ENDPOINTS.md`         |
