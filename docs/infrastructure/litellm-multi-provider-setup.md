# LiteLLM Multi-Provider Gateway — Setup & Operations

This document describes the LiteLLM multi-provider routing configuration on oracle-vps, with 5-tier fallback chains:
Claude API → Codex CLI → OmniRoute → Local Workers → OpenRouter

## Quick Start

### 1. Prepare Secrets

Copy the environment template and populate with Infisical values:

```bash
cp infra/hosts/oracle-vps/.env.litellm.example infra/hosts/oracle-vps/.env.litellm
```

Then fill in each secret from Infisical:

- `CLAUDE_API_KEY` — Anthropic API key
- `CODEX_API_KEY` — Claude Code subscription key
- `OMNIROUTE_API_KEY` — OmniRoute endpoint key
- `OPENROUTER_API_KEY` — OpenRouter free tier key
- `LITELLM_MASTER_KEY` — Generate: `python3 -c "import secrets; print('sk-' + secrets.token_hex(24))"`

### 2. Deploy LiteLLM

```bash
# From oracle-vps host
cd /path/to/project-nyra
docker --context oracle-vps compose \
  -f infra/hosts/oracle-vps/docker-compose.yml \
  -f infra/hosts/oracle-vps/docker-compose.litellm.yml \
  --env-file infra/hosts/oracle-vps/.env.litellm \
  up -d litellm litellm-redis

# Verify health
curl -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  http://oracle-vps.projectnyra.com:4000/health/readiness
```

### 3. Test All Providers

```bash
# Set up environment
export LITELLM_MASTER_KEY=$(grep LITELLM_MASTER_KEY infra/hosts/oracle-vps/.env.litellm | cut -d= -f2)
export LITELLM_URL="http://oracle-vps.projectnyra.com:4000"

# Run comprehensive test suite
bash infra/scripts/test-litellm-routing.sh
```

## Architecture

### Provider Tiers (By Priority)

```
┌────────────────────────────────────────────────────────┐
│ TIER 1: CLAUDE API (Anthropic Native)                  │
│  ✓ claude/3-5-sonnet      (8k context)                 │
│  ✓ claude/3-5-haiku       (4k context, fast)           │
│  ✓ claude/3-opus          (16k context, reasoning)     │
│  Cost: $3-15 per 1M input tokens                        │
└────────────────────────────────────────────────────────┘
                            ↓ (if fails)
┌────────────────────────────────────────────────────────┐
│ TIER 2: CODEX CLI SUBSCRIPTION                         │
│  ✓ codex/api              (llxprt-bridge proxy)        │
│  ✓ codex/subscription     (desktop app via bridge)     │
│  Cost: Subscription model (all-you-can-use)            │
└────────────────────────────────────────────────────────┘
                            ↓ (if fails)
┌────────────────────────────────────────────────────────┐
│ TIER 3: OMNIROUTE (Free Models on Oracle)              │
│  ✓ omniroute/auto         (general purpose)            │
│  ✓ omniroute/fast         (< 90s latency)              │
│  ✓ omniroute/coding       (code-specialized)           │
│  ✓ omniroute/reasoning    (complex tasks)              │
│  Cost: Free                                             │
│  Location: localhost:20128 (docker network)            │
└────────────────────────────────────────────────────────┘
                            ↓ (if fails)
┌────────────────────────────────────────────────────────┐
│ TIER 4: LOCAL GPU WORKERS (Tailscale)                  │
│  RTX 5090 (32GB vLLM):                                 │
│    ✓ local/deepseek-r1                                 │
│    ✓ local/qwen-3.1-72b                                │
│    ✓ local/llama-3.3-70b                               │
│  RTX 3090 Ti (24GB vLLM):                              │
│    ✓ local/qwen-coder-32b                              │
│    ✓ local/gemma-4-24b                                 │
│  RTX 3060 (12GB Ollama):                               │
│    ✓ local/qwen-2.5-7b                                 │
│    ✓ local/llama3.2-8b                                 │
│    ✓ local/embeddings                                  │
│  Cost: Free (operational energy only)                  │
│  Location: Tailscale DNS (*.projectnyra.com)           │
└────────────────────────────────────────────────────────┘
                            ↓ (if fails)
┌────────────────────────────────────────────────────────┐
│ TIER 5: OPENROUTER FALLBACK (Cloud Free Tier)          │
│  ✓ openrouter/deepseek-r1:free      ($0 - rate limited)
│  ✓ openrouter/qwen:free             ($0 - rate limited) │
│  ✓ openrouter/nemotron:free         ($0 - rate limited) │
│  Cost: Free (with daily rate limit)                     │
│  Location: https://openrouter.ai/v1                    │
└────────────────────────────────────────────────────────┘
```

### Routing Strategy

**Cost-Optimized (Default)**

- Prefer local workers (no external API costs)
- Fall back to subscriptions (fixed cost, unlimited use)
- Avoid external APIs unless necessary
- Block requests exceeding cost threshold

**Load Balancing**

- `least-busy` algorithm across healthy providers
- Health checks every 60 seconds
- Automatic failover on timeout (30s default)
- Retry up to 3 times before moving to fallback

### Model Aliases

```yaml
default: → claude/3-5-sonnet      (primary routing)
fast: → claude/3-5-haiku       (speed priority)
reasoning: → claude/3-opus          (complex tasks)
coding: → codex/subscription     (code generation)
```

## Configuration Files

### Main Config

- **Location**: `infra/hosts/oracle-vps/litellm/config.yaml`
- **Contains**: Model definitions, fallback chains, routing rules, budgets
- **Format**: YAML with environment variable substitution
- **Size**: ~800 lines

### Docker Compose

- **Location**: `infra/hosts/oracle-vps/docker-compose.litellm.yml`
- **Services**: `litellm` (gateway), `litellm-redis` (cache)
- **Network**: `nyra-network` (shared with oracle-vps stack)
- **Storage**: Redis volume for session cache

### Environment Template

- **Location**: `infra/hosts/oracle-vps/.env.litellm.example`
- **Purpose**: Reference for required secrets
- **Format**: KEY=VALUE (standard dotenv)
- **Note**: Copy to `.env.litellm` and populate from Infisical

## Integration with Letta Agents

Letta agents route through LiteLLM using the `default` model alias, which automatically cascades through the provider chain:

```yaml
# In Letta agent configuration
model: "default" # Routes to claude → codex → omniroute → local → openrouter
```

### Letta Models Configuration

```python
# Example: Configure Letta to use LiteLLM
from letta import LLMClient

client = LLMClient(
    model_name="default",
    api_base="http://litellm:4000/v1",
    api_key="sk-<LETTA_AGENTS_API_KEY>"
)
```

### Tenant Configuration

Each service/team gets a dedicated API key with rate limits and model access restrictions:

| Tenant       | API Key                | Allowed Models           | Budget     | Rate Limit  |
| ------------ | ---------------------- | ------------------------ | ---------- | ----------- |
| letta-agents | `LETTA_AGENTS_API_KEY` | All models               | $100/mo    | 100 req/min |
| openclaw     | `OPENCLAW_API_KEY`     | Claude, local, omniroute | Dev budget | 50 req/min  |
| production   | `PRODUCTION_API_KEY`   | fast models only         | $50/mo     | 200 req/min |

## Cost Tracking

### Database Setup (Optional)

For production cost tracking, connect to PostgreSQL:

```bash
# Set in .env.litellm
LITELLM_DATABASE_URL=postgresql://user:password@db:5432/litellm

# LiteLLM will create necessary tables automatically
```

### Cost Budgets

```yaml
budgets:
  global: $500/month (all services)
  letta-agents: $100/month (Letta only)
  production: $50/month (prod services - blocks on exceed)
  development: $200/month (dev/testing)
```

### Cost Monitoring

```bash
# View spending (requires DATABASE_URL)
curl -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  http://litellm:4000/v1/spend

# View per-tenant spending
curl -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  http://litellm:4000/v1/spend?tenant_id=letta-agents
```

## Testing & Validation

### Health Checks

```bash
# Service health
curl http://litellm:4000/health/readiness

# Available models
curl -H "Authorization: Bearer $LITELLM_KEY" \
  http://litellm:4000/v1/models

# Provider status
curl -H "Authorization: Bearer $LITELLM_KEY" \
  http://litellm:4000/v1/providers
```

### Manual Testing

**Test single model**

```bash
curl -X POST \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -H "Content-Type: application/json" \
  http://litellm:4000/v1/chat/completions \
  -d '{
    "model": "claude/3-5-sonnet",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 50
  }'
```

**Test streaming**

```bash
curl -X POST \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -H "Content-Type: application/json" \
  http://litellm:4000/v1/chat/completions \
  -d '{
    "model": "default",
    "messages": [{"role": "user", "content": "Count to 3"}],
    "stream": true
  }' | grep -o 'data:.*'
```

### Automated Test Suite

```bash
# Full provider chain test
export LITELLM_MASTER_KEY="sk-..."
export LITELLM_URL="http://oracle-vps:4000"
bash infra/scripts/test-litellm-routing.sh

# Output: Tests each tier, validates fallback chains, verifies Letta integration
```

## Deployment Checklist

- [ ] Infisical secrets populated (`CLAUDE_API_KEY`, `CODEX_API_KEY`, `OMNIROUTE_API_KEY`, `OPENROUTER_API_KEY`)
- [ ] `.env.litellm` created from `.env.litellm.example`
- [ ] `LITELLM_MASTER_KEY` generated and stored securely
- [ ] Docker compose overlay included in deployment command
- [ ] Health checks passing before routing traffic
- [ ] Local workers (5090, 3090ti, 3060) verified healthy
- [ ] OmniRoute service accessible at `localhost:20128`
- [ ] Letta agents configured to use `default` model
- [ ] Cost budgets configured in `litellm/config.yaml`
- [ ] PostgreSQL database created if using cost tracking
- [ ] Test suite runs successfully (`test-litellm-routing.sh`)
- [ ] Logging configured (check `docker logs nyra-litellm`)
- [ ] Redis persistence volume mounted
- [ ] Monitoring alerts configured (optional)

## Troubleshooting

### Provider Not Responding

**Symptom**: Requests time out on specific provider tier

**Diagnosis**:

```bash
# Check if provider is reachable
curl -v http://provider-endpoint:port/health

# Check LiteLLM logs
docker logs nyra-litellm | grep -i "provider-name"

# Verify network connectivity
docker exec nyra-litellm ping worker-rtx5090.projectnyra.com
```

**Solution**:

1. Verify provider is healthy and running
2. Check Tailscale connectivity (for local workers)
3. Verify API keys are correct (Infisical)
4. Check network firewall rules

### High Latency

**Symptom**: Responses are slow (> 10 seconds)

**Diagnosis**:

- Check which provider is responding: `curl -v -H "X-Litellm-Debug: true"`
- Monitor worker CPU/memory: `nvidia-smi` on worker hosts
- Check Redis cache performance: `redis-cli INFO stats`

**Solution**:

1. Adjust fallback thresholds (prefer faster tiers first)
2. Scale worker resources if underutilized
3. Enable Redis caching (default: 1 hour TTL)
4. Consider model size reduction on workers

### Cost Overage

**Symptom**: Spending exceeds budget threshold

**Diagnosis**:

```bash
# View spending
curl -H "Authorization: Bearer $LITELLM_KEY" \
  http://litellm:4000/v1/spend

# View cost per model
curl -H "Authorization: Bearer $LITELLM_KEY" \
  "http://litellm:4000/v1/spend?group_by=model"
```

**Solution**:

1. Route expensive requests to local workers (no API cost)
2. Reduce max_tokens in requests
3. Adjust fallback order to prefer cheaper tiers
4. Set `block_on_exceed: true` for production budgets

### Fallback Not Triggering

**Symptom**: Requests still hit tier 1 even when it's failing

**Diagnosis**:

```bash
# Check fallback configuration
curl -H "Authorization: Bearer $LITELLM_KEY" \
  http://litellm:4000/v1/models | grep -A5 "fallbacks"

# Check health check status
docker logs nyra-litellm | grep -i "health"
```

**Solution**:

1. Verify `enable_health_checks: true` in config
2. Reduce `health_check_interval` for faster detection (default: 60s)
3. Lower `cloud_fallback_threshold` (default: 0.85)
4. Check Redis connectivity (cache of health status)

## Monitoring

### Metrics Exposed

LiteLLM exposes Prometheus metrics on `http://litellm:9090/metrics`:

```
litellm_requests_total{model="...", status="success"}
litellm_request_duration_seconds{model="..."}
litellm_cost_total_tokens{provider="..."}
litellm_provider_errors_total{provider="..."}
litellm_cache_hits_total
litellm_fallback_requests_total
```

### Alerting Rules

Suggested Prometheus alerts:

```yaml
- alert: LiteLLMProviderDown
  expr: rate(litellm_provider_errors_total[5m]) > 0.1

- alert: LiteLLMHighLatency
  expr: litellm_request_duration_seconds_p95 > 10

- alert: LiteLLMCostOverBudget
  expr: litellm_cost_total_tokens > litellm_budget_max
```

## Security

### API Key Rotation

LiteLLM rotates API keys every 90 days (configurable):

```bash
# Rotate provider keys
# 1. Generate new key in Infisical
# 2. Update .env.litellm
# 3. Restart litellm container: docker restart nyra-litellm
```

### Rate Limiting

Per-tenant rate limits prevent abuse:

```yaml
rate_limit:
  requests_per_minute: 60
  requests_per_hour: 1000
  requests_per_day: 10000
```

### Audit Logging

All requests logged with:

- Tenant ID
- Model used
- Tokens consumed
- Cost
- Response time
- Status (success/error)

Enable audit log to file:

```bash
LITELLM_AUDIT_LOG=/var/log/litellm/audit.log
```

## Related Documentation

- [LiteLLM Official Docs](https://docs.litellm.ai/)
- [Infisical Secrets Setup](../docs/infrastructure/infisical-setup.md)
- [Letta Agent Integration](../docs/applications/letta-setup.md)
- [Worker GPU Setup](../docs/infrastructure/gpu-workers.md)
- [OmniRoute Configuration](../docs/applications/omniroute.md)

## Support

For issues or questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review logs: `docker logs nyra-litellm`
3. Run test suite: `bash infra/scripts/test-litellm-routing.sh`
4. File an issue with logs and configuration details
