# Free Model Routing Configuration

**Date:** 2026-08-29  
**Status:** Configured

---

## Overview

Project Nyra routes free & open-source models through LiteLLM to provide cost-free agent execution while maintaining model flexibility.

## Routing Architecture

```
Agent Request
    ↓
LiteLLM (orchestrator:4000)
    ↓
    ├─→ local/* (on-premise GPU workers)
    ├─→ openrouter/* (free tier via OpenRouter API)
    ├─→ omniroute/* (Omnigent policy-aware routing)
    └─→ llxprt/* (bridge to external subscription models)
```

---

## OpenRouter Free Tier Setup

**Required:** `OPENROUTER_API_KEY` in Infisical `/external/openrouter`

### Free Models Available

| Model Name                                          | Provider | Use Case               | Speed     |
| --------------------------------------------------- | -------- | ---------------------- | --------- |
| `openrouter/nvidia/nemotron-3.5-lightning:free`     | NVIDIA   | General fast inference | ⚡ Fast   |
| `openrouter/cohere/north-mini-code:free`            | Cohere   | Code generation        | ⚡ Fast   |
| `openrouter/meta-llama/llama-3.3-70b-instruct:free` | Meta     | Complex reasoning      | 🐢 Medium |

### LiteLLM Configuration

```yaml
# infra/hosts/orchestrator/litellm/config.yaml

- model_name: openrouter/gemini-flash
  litellm_params:
    model: openrouter/nvidia/nemotron-3.5-lightning:free
    api_key: os.environ/OPENROUTER_API_KEY
    timeout: 60

- model_name: openrouter/cohere-code
  litellm_params:
    model: openrouter/cohere/north-mini-code:free
    api_key: os.environ/OPENROUTER_API_KEY
    timeout: 90
```

### Access Pattern

```bash
# Via LiteLLM (from agent)
curl -X POST http://litellm.projectnyra.com:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-<LITELLM_MASTER_KEY>" \
  -d '{
    "model": "openrouter/gemini-flash",
    "messages": [{"role": "user", "content": "..."}],
    "stream": false
  }'
```

---

## OmniRoute (Omnigent Policy Routing)

**Status:** Running on Oracle-VPS (100.64.0.3:20128)

### Purpose

OmniRoute intercepts agent requests and applies policy-aware routing:

- Enforce token budgets per agent
- Route complex tasks to capable models
- Fall back to free models for simple queries
- Enforce safety constraints

### Configuration

```yaml
# infra/hosts/orchestrator/litellm/config.yaml

- model_name: omniroute/auto
  litellm_params:
    model: openai/auto
    api_base: http://100.64.0.3:20128/v1
    api_key: os.environ/OMNIROUTE_API_KEY
    timeout: 180
```

### Routing Logic

1. **Fast queries** (< 100 tokens) → free OpenRouter models
2. **Complex tasks** (> 100 tokens) → local GPU models
3. **Code generation** → Cohere North Mini (free)
4. **Reasoning** → Llama 3.3 70B (free)

---

## Local GPU Models (No API Cost)

Fallback when APIs unavailable or for privacy-critical tasks.

| Model                  | Hardware                | Token Cost |
| ---------------------- | ----------------------- | ---------- |
| `local/qwen3.8-27b`    | worker-rtx5090 (32GB)   | Free       |
| `local/gemma-4`        | worker-rtx5090          | Free       |
| `local/qwen-coder-32b` | worker-rtx3090ti (24GB) | Free       |
| `local/qwen2.5-4b`     | worker-rtx3060 (12GB)   | Free       |
| `local/llama3.2-3b`    | worker-rtx3060          | Free       |

---

## Cost Model

| Route                    | Cost | Latency   | Use Case                          |
| ------------------------ | ---- | --------- | --------------------------------- |
| Local GPU                | $0   | 100-500ms | High-security, repeated queries   |
| OpenRouter Free          | $0   | 1-5s      | General inference, testing        |
| OmniRoute                | $0-$ | 500ms-3s  | Smart routing with fallback       |
| LiteLLM Bridged (llxprt) | $$   | 100-200ms | Production code, mission-critical |

---

## Setup Checklist

- [x] OpenRouter API key in Infisical
- [x] LiteLLM configured with free models
- [x] OmniRoute endpoint accessible (100.64.0.3:20128)
- [x] Local GPU workers healthy (worker-rtx5090, 3090ti, 3060)
- [x] Fallback routing configured

---

## Troubleshooting

### Free model rate-limited

- Check OpenRouter dashboard for usage
- Fallback to local GPU models
- Use `omniroute/fast` for rate-limited scenarios

### OmniRoute policy rejected

- Request exceeded token budget
- Use `openrouter/*` for unrestricted inference
- Or use `local/*` models

### No response from local GPU

- Check worker health: `docker ps | grep litellm`
- Verify Tailscale connectivity: `ping 100.64.0.11`
- Restart worker Docker daemon

---

## Next Steps

1. Monitor free API usage (OpenRouter dashboard)
2. Optimize routing for cost/latency tradeoff
3. Consider premium OmniRoute features if needed
4. Archive logs from free tier for audit

---

**All free models ready. Zero-cost agent execution operational.**
