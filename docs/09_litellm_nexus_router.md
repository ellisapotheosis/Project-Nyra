# 09 LiteLLM + Nexus Router

## Current wiring
- LiteLLM runs on `:4000` with config mounted from `infra/configs/litellm/config.yaml`.
- Nexus Router runs on `:7000` and MCP on `:8080` with config `infra/configs/nexus/nexus.toml`.
- Nexus references LiteLLM via `LITELLM_BASE_URL=http://litellm:4000` in compose.

## Worker routing defaults
- `WORKER1_LLM_BASE_URL` -> 5090 endpoint
- `WORKER2_LLM_BASE_URL` -> 3090ti endpoint
- `WORKER3_LLM_BASE_URL` -> 3060 endpoint
- Public fallback -> OpenRouter via `OPENROUTER_API_KEY`

## Smoke tests
```bash
curl -fsS http://localhost:7000/health
curl -fsS http://localhost:4000/health
curl -fsS http://localhost:8080/health
```

## How to verify
```bash
rg -n 'LITELLM_BASE_URL|NEXUS_MCP_PORT|NEXUS_ROUTER_PORT' infra/docker-compose.yml
sed -n '1,160p' infra/configs/nexus/nexus.toml
```
