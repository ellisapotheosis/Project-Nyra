# Stack Gateway and Worker Topology Audit - 2026-05-31

## Scope

Reviewed the local/cloud orchestration path for Letta, Grafbase Nexus, LiteLLM, LLXPRT, and the three GPU workers. The implementation changes in this pass are intentionally scoped to:

- Oracle VPS LiteLLM OpenRouter fallback routing in `infra/configs/litellm/config.yaml`.
- Oracle VPS environment pass-through for `OPENROUTER_API_KEY` in `infra/hosts/oracle-vps/docker-compose.yml`.
- Worker RTX 3060 primary compose co-location for embeddings and PicoClaw in `infra/hosts/worker-rtx3060/docker-compose.yml`.

## Communication Path Validation

| Layer             | Current evidence                                                                                                                                                                                                                                                                                        | Status                                                                                                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Letta             | `services/letta-agents/orchestrator-agent.json` routes orchestration through subscription Claude first, local GPU fallback second, and embeds via `worker-rtx3060.trex-fiordland.ts.net:11434`. `infra/hosts/oracle-vps/docker-compose.letta-mcp.yml` exposes the Letta MCP bridge on Oracle localhost. | Partially integrated. Letta agent definitions point at the intended control and memory endpoints, but Nexus aggregation of Letta MCP is intentionally disabled in `infra/hosts/oracle-vps/nexus.toml` due SSE/HTTP bridge compatibility notes. |
| Grafbase Nexus    | `infra/hosts/oracle-vps/nexus.toml` declares Nexus as the `/v1` LLM and `/mcp` endpoint and forwards LLM calls to `http://litellm:4000/v1`. Oracle compose exposes Nexus on `127.0.0.1:6000:3000`.                                                                                                      | Integrated as the singular local agent/MCP gateway, with conservative MCP downstreams only.                                                                                                                                                    |
| LiteLLM           | Oracle compose already runs `litellm` on localhost port 4000 and mounts `infra/configs/litellm/config.yaml`. This pass adds OpenRouter free/fallback models and fallback chains to that mounted config.                                                                                                 | Integrated and expanded.                                                                                                                                                                                                                       |
| LLXPRT            | `infra/hosts/orchestrator/docker-compose.llxprt.yml` defines `llxprt-bridge`; Oracle compose provides `llxprt-bridge-proxy` on `host.docker.internal:8091`; LiteLLM maps subscription Codex/Gemini/Claude models to that proxy.                                                                         | Integrated for Codex, Gemini, and Claude subscription/native CLI lanes. Kimi and Qwen are not currently exposed in `services/llxprt-bridge/server.mjs`.                                                                                        |
| Worker RTX 3060   | Main compose provides Ollama, LiteLLM, model-switcher, exporters, and now a dedicated embedding API plus PicoClaw standby.                                                                                                                                                                              | Updated.                                                                                                                                                                                                                                       |
| Worker RTX 3090Ti | Main compose runs Redis, vLLM with LMCache env, LiteLLM, and model switcher. `docker-compose.nerve.yml` provides OpenClaw on a separate agent gateway port.                                                                                                                                             | Topology exists. The direct vLLM endpoint is `:8000`, LiteLLM is `:4000`, and OpenClaw gateway overlay is `:8002`.                                                                                                                             |
| Worker RTX 5090   | Main compose runs Redis, vLLM with LMCache env, LiteLLM, exporters, and health monitor.                                                                                                                                                                                                                 | Topology exists. This is the correct highest-priority local reasoning candidate, but central LiteLLM aliases should be kept aligned with the actual loaded 5090 model.                                                                         |

## Oracle VPS OpenRouter Gateway Snippet

The production source is `infra/configs/litellm/config.yaml`, mounted by `infra/hosts/oracle-vps/docker-compose.yml`.

```yaml
model_list:
  - model_name: openrouter/deepseek-r1-free
    litellm_params:
      model: openrouter/deepseek/deepseek-r1:free
      api_key: os.environ/OPENROUTER_API_KEY
      timeout: 180

  - model_name: openrouter/deepseek-v3-free
    litellm_params:
      model: openrouter/deepseek/deepseek-chat:free
      api_key: os.environ/OPENROUTER_API_KEY
      timeout: 180

  - model_name: openrouter/nemotron-4-340b
    litellm_params:
      model: openrouter/nvidia/nemotron-4-340b-instruct
      api_key: os.environ/OPENROUTER_API_KEY
      timeout: 180

  - model_name: openrouter/phi-3-medium-128k-free
    litellm_params:
      model: openrouter/microsoft/phi-3-medium-128k-instruct:free
      api_key: os.environ/OPENROUTER_API_KEY
      timeout: 180

litellm_settings:
  fallbacks:
    - local/gemma-4:
        - openrouter/deepseek-r1-free
        - openrouter/deepseek-v3-free
        - openrouter/llama-3-3-70b-free
        - openrouter/free
```

Notes:

- OpenRouter free-model availability changes frequently. As of this audit, OpenRouter documents `deepseek/deepseek-r1:free`, `deepseek/deepseek-chat:free`, `meta-llama/llama-3.3-70b-instruct:free`, and `microsoft/phi-3-medium-128k-instruct:free`.
- `nvidia/nemotron-4-340b-instruct` is documented as an OpenRouter model but not as a free variant.
- The requested `deepseek/deepseek-v3:free` is represented by the currently documented DeepSeek V3 free chat route, `deepseek/deepseek-chat:free`.
- Client configs should point to Nexus or LiteLLM and should not carry `OPENROUTER_API_KEY`; that key belongs in Oracle VPS Infisical pathing such as `/router/litellm-proxy-server`.

## Worker RTX 3060 Main Compose Stanzas

The primary stack now co-locates:

- `ollama`: local lightweight model host, including `nomic-embed-text`.
- `embedding-service`: dedicated HTTP embedding API on `${WORKER_3060_BIND_IP:-127.0.0.1}:${EMBEDDING_SERVICE_PORT:-8080}`.
- `picoclaw`: low-memory standby OpenClaw-derived backup agent on `${WORKER_3060_BIND_IP:-127.0.0.1}:${PICOCLAW_PORT:-8003}`.

This keeps the existing Ollama embedding endpoint available for Letta/mem0 while adding an explicit dedicated embedding API for services that expect `/embed`, `/similarity`, `/model`, and `/metrics`.

## Remaining Gaps

- Nexus intentionally does not aggregate Letta MCP yet. The repo documents bridge incompatibilities in `infra/hosts/oracle-vps/nexus.toml`; fix the SSE/HTTP bridge before enabling it as a Nexus downstream.
- LLXPRT bridge currently exposes `llxprt-codex`, `llxprt-gemini`, and `llxprt-claude`. Kimi and Qwen native CLI lanes need explicit `modelMap` entries plus container auth/cache mounts before they are real upstream targets.
- Worker RTX 3090Ti OpenClaw is in a separate overlay, not the main compose. That matches the existing repo layout but does not fully satisfy "production alongside" unless the deployment command always includes `docker-compose.nerve.yml` or it is folded into the main stack in a later pass.
- Some public/requested OpenRouter free model IDs are stale or ambiguous. Keep `openrouter/free` as the terminal fallback to avoid brittle single-model assumptions.

## Smoke Checks

Run these after deploying to the target hosts:

```bash
docker compose -f infra/hosts/oracle-vps/docker-compose.yml config
docker compose -f infra/hosts/worker-rtx3060/docker-compose.yml config
curl -fsS http://oracle-vps.trex-fiordland.ts.net:6000/health
curl -fsS http://oracle-vps.trex-fiordland.ts.net:4000/health/readiness
curl -fsS http://worker-rtx3060.trex-fiordland.ts.net:11434/api/version
curl -fsS http://worker-rtx3060.trex-fiordland.ts.net:8080/health
curl -fsS http://worker-rtx3060.trex-fiordland.ts.net:8003/health
```
