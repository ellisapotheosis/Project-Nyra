# Phase 1 Deployment Plan — AI Control Plane Initialization

**Status:** Ready to deploy  
**Target Date:** 2026-08-24  
**Branch:** `chore/nyra-infra-harmonization-20260725`

---

## Executive Summary

Phase 1 establishes a zero-subscription, free-tier OpenClaw agent runtime backed by local RTX5090 inference. Core infrastructure is operational; this plan integrates existing components via Infisical secret injection and validates end-to-end connectivity.

**Goal:** Deploy a working OpenClaw Gateway on orchestrator + local vLLM on worker-5090, with LiteLLM as the unified model gateway, routing free requests through OmniRoute/OpenRouter.

---

## Current Infrastructure State

| Component                | Status                  | Location                                                   |
| ------------------------ | ----------------------- | ---------------------------------------------------------- |
| **Infisical (Cloud)**    | ✓ Active                | app.infisical.com                                          |
| **Secrets Populated**    | ✓ 100+ secrets ready    | `/llm-providers/*, /external/*, /databases/*, /security/*` |
| **Docker Compose Files** | ✓ Present               | `/infra/hosts/{host}/docker-compose.*.yml`                 |
| **LiteLLM Config**       | ✓ Model routing defined | `/infra/configs/litellm/config.yaml`                       |
| **vLLM Setup**           | ✓ Redis + LMCache       | `worker-rtx5090/docker-compose.yml`                        |
| **OpenClaw Gateway**     | ✓ Prepared              | `orchestrator/docker-compose.yml` profile=apps             |
| **Portainer Agents**     | ✓ Credentials ready     | All 5 hosts edge keys in Infisical                         |
| **Tailscale Mesh**       | ✓ Auth keys ready       | Private DNS + MagicDNS                                     |

---

## Phase 1 Deployment Sequence

### Step 1: Populate Bootstrap Environment Files

Generate live `.env` files from Infisical for both hosts.

**Orchestrator:**

```bash
cd infra/hosts/orchestrator
infisical secrets --path /llm-providers/litellm --output dotenv > .env.tmp
# Append bootstrap vars...
cat .env.tmp >> .env
chmod 600 .env
```

**Worker-RTX5090:**

```bash
cd infra/hosts/worker-rtx5090
infisical secrets --path /llm-providers/litellm --output dotenv > .env.tmp
# Append bootstrap vars...
cat .env.tmp >> .env
chmod 600 .env
```

### Step 2: Verify Infisical Connectivity

Test each host can fetch secrets:

```bash
# Orchestrator
infisical run --path /hosts/orchestrator -- infisical secrets --path / --output json | jq 'length'

# Worker-5090
infisical run --path /hosts/worker-rtx5090 -- infisical secrets --path / --output json | jq 'length'
```

Expected: >50 secrets resolved per host.

### Step 3: Bring Up Orchestrator Services

Start LiteLLM first (model gateway), then OpenClaw Gateway.

```bash
cd infra/hosts/orchestrator
source .env
docker compose -f docker-compose.yml \
  -f docker-compose.cloudflared.yml \
  up -d litellm openclaw-gateway portainer-edge-agent

# Wait for health
sleep 15
curl -sf http://litellm:4000/v1/models
curl -sf http://localhost:8001/health
```

**Expected State:**

- LiteLLM listening on :4010 (internal) + private DNS
- OpenClaw Gateway listening on :8001
- Portainer edge agent connected to oracle-vps

### Step 4: Bring Up Worker-RTX5090 Inference Stack

Start vLLM + Redis + LiteLLM (worker instance) + health monitoring.

```bash
cd infra/hosts/worker-rtx5090
source .env
docker compose -f docker-compose.yml \
  -f docker-compose.gpu.yml \
  up -d redis vllm litellm portainer-edge-agent

# Monitor vLLM startup (10-60s)
docker logs -f nyra-worker-5090-vllm
```

**Expected State:**

- Redis listening on localhost:6379
- vLLM loading model (Qwen3.8 or fallback)
- vLLM health check green
- LiteLLM forwarding to vLLM on :4000

### Step 5: Configure OpenClaw Gateway for Local Inference

Point OpenClaw to LiteLLM with `nyra/local-heavy` model:

```bash
# Via API or UI
curl -X POST http://localhost:8001/api/config \
  -H "Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_provider": "litellm",
    "model_base_url": "http://litellm.projectnyra.com:4010/v1",
    "default_model": "nyra/local-heavy"
  }'
```

### Step 6: End-to-End Test

**Local Heavy Model (Primary):**

```bash
curl http://litellm.projectnyra.com:4010/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "nyra/local-heavy",
    "messages": [{"role": "user", "content": "What is 2+2?"}]
  }'
```

**Free Fallback (OmniRoute):**

```bash
curl http://litellm.projectnyra.com:4010/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "omniroute/fast",
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
  }'
```

**OpenRouter Free:**

```bash
curl http://litellm.projectnyra.com:4010/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "openrouter/qwen3",
    "messages": [{"role": "user", "content": "Explain photosynthesis."}]
  }'
```

---

## Success Criteria (Phase 1 GREEN)

- [ ] Infisical authentication works from both hosts
- [ ] LiteLLM operational with ≥3 model routes
- [ ] vLLM healthy + model loaded (VRAM utilization 60–80%)
- [ ] OpenClaw Gateway accepting connections
- [ ] OpenClaw → LiteLLM → local model chain works
- [ ] OpenClaw → LiteLLM → free fallback chain works
- [ ] No raw inference endpoints publicly exposed
- [ ] Portainer agents connected to central console
- [ ] All secrets stored in Infisical (zero in git)

---

## Rollback Strategy

If any service fails:

1. **LiteLLM:** `docker restart orchestrator-litellm`
2. **vLLM:** Check VRAM, reduce model context/batch size, restart
3. **OpenClaw:** Check gateway token, validate API base URL
4. **Infisical:** Verify token TTL (expires in 3d), regenerate if needed

Minimal blast radius due to sidecar architecture — restart individual service, no cluster failover required.

---

## Post-Deployment (Phase 1 Handoff)

1. Document actual Tailscale IPs + DNS resolution
2. Create ops runbook (start/stop/logs commands)
3. Set up monitoring alerts (Prometheus + Grafana)
4. Test OmniRoute subscription OAuth (if available)
5. Plan Phase 2: Letta integration, scheduled agent tasks

---

## Notes

- **Qwen Model:** Official Qwen3.8-27B checkpoint; bitsandbytes quantization compatible with RTX5090 24GB VRAM
- **LMCache:** Redis-backed prefix caching; reduces VRAM pressure on repeated requests
- **Subscription Auth:** Claude/Codex OAuth deferred to Phase 2 pending OmniRoute verification
- **Private DNS:** Tailscale MagicDNS + internal `projectnyra.com` split-horizon
- **No Public Exposure:** All services behind Tailscale; public ingress only via Cloudflare tunnel on oracle-vps

---

**Next:** Execute Step 1 (populate .env files) and begin deployment.
