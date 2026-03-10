# 3-Tier Model Routing Setup Guide

Quick setup guide for Epic SDK and Agent Booster services.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- Anthropic API key

## Quick Start (5 minutes)

### 1. Set Environment Variables

```bash
cd infra/docker

# Add to .env file
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env
echo "LOG_LEVEL=info" >> .env
```

### 2. Create Required Networks

```bash
# Create networks if they don't exist
docker network create nyra-core 2>/dev/null || true
docker network create nyra-orchestrator 2>/dev/null || true
```

### 3. Deploy Services

```bash
cd infra/docker/services

# Start both Agent Booster and Epic SDK
docker-compose -f docker-compose.routing.yml up -d

# Check status
docker-compose -f docker-compose.routing.yml ps

# View logs
docker-compose -f docker-compose.routing.yml logs -f
```

### 4. Verify Health

```bash
# Check Agent Booster (Tier 1)
curl http://localhost:3010/health

# Check Epic SDK (Router)
curl http://localhost:3011/health

# List available transforms
curl http://localhost:3010/intents
```

## Test the System

### Test 1: Tier 1 Routing (Pattern Matching)

```bash
curl -X POST http://localhost:3011/route \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Convert var to const in my code",
    "code": "var x = 5; var y = 10;"
  }'

# Expected: <1ms latency, $0 cost, Tier 1 routing
```

### Test 2: Tier 2 Routing (Haiku)

```bash
curl -X POST http://localhost:3011/route \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Fix the bug where user authentication fails on first attempt",
    "messages": [
      {
        "role": "user",
        "content": "The auth middleware is rejecting valid tokens on first request"
      }
    ]
  }'

# Expected: ~500ms latency, $0.0002 cost, Tier 2 routing
```

### Test 3: Tier 3 Routing (Sonnet)

```bash
curl -X POST http://localhost:3011/route \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Design a microservices architecture for mortgage loan processing with TRID compliance, multi-lender integration, and real-time rate updates"
  }'

# Expected: ~2s latency, $0.003 cost, Tier 3 routing (Sonnet)
```

### Test 4: Classification Only

```bash
curl -X POST http://localhost:3011/classify \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Add TypeScript types to the user service"
  }'

# Expected: Tier 1 recommendation with reasoning
```

## View Metrics

```bash
# Prometheus metrics
curl http://localhost:3010/metrics  # Agent Booster
curl http://localhost:3011/metrics  # Epic SDK

# Cost savings
curl http://localhost:3011/savings
```

## Integration with Claude Flow

### 1. Configuration Already Done

The configuration is already updated in:
- `configs/claude-flow/claude-flow.config.json`

Verify routing is enabled:

```bash
grep -A 20 '"routing"' configs/claude-flow/claude-flow.config.json
```

### 2. Test Pre-Task Hook

```bash
# Test routing recommendation
npx @claude-flow/cli@latest hooks pre-task \
  --description "Convert var to const in authentication.js"

# Expected output:
# [AGENT_BOOSTER_AVAILABLE]
# Intent: var-to-const
# Skip LLM - use direct Edit tool
```

### 3. Test with Task Tool

In Claude Code, the Task tool will automatically receive routing recommendations:

```javascript
// Hooks automatically query Epic SDK and set model parameter
Task({
  prompt: "Convert var to const in auth.js",
  subagent_type: "coder",
  model: "agent-booster"  // ← Set by hooks based on Epic SDK recommendation
})
```

## Monitoring

### View Real-Time Logs

```bash
# All services
docker-compose -f docker-compose.routing.yml logs -f

# Specific service
docker logs -f nyra-agent-booster
docker logs -f nyra-epic-sdk
```

### Grafana Dashboards

If you have Grafana running:

1. Import `agent-booster/config/grafana-dashboard.json`
2. Import `epic-sdk/config/grafana-dashboard.json`
3. View metrics at http://localhost:3005

## Troubleshooting

### Services won't start

```bash
# Check networks exist
docker network ls | grep nyra

# Create if missing
docker network create nyra-core
docker network create nyra-orchestrator

# Check ports are free
netstat -an | grep 3010
netstat -an | grep 3011
```

### Agent Booster health check fails

```bash
# Check logs
docker logs nyra-agent-booster

# Restart
docker restart nyra-agent-booster

# Rebuild
cd infra/docker/services
docker-compose -f docker-compose.routing.yml build agent-booster
docker-compose -f docker-compose.routing.yml up -d agent-booster
```

### Epic SDK can't reach Agent Booster

```bash
# Check network connectivity
docker exec nyra-epic-sdk curl http://agent-booster:3010/health

# Check if Agent Booster is running
docker ps | grep agent-booster

# Check DNS resolution
docker exec nyra-epic-sdk nslookup agent-booster
```

### Missing Anthropic API key

```bash
# Verify API key is set
grep ANTHROPIC_API_KEY infra/docker/.env

# Set if missing
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> infra/docker/.env

# Restart Epic SDK
docker-compose -f docker-compose.routing.yml restart epic-sdk
```

## Development Mode

### Run Locally (without Docker)

```bash
# Agent Booster
cd infra/docker/services/agent-booster
npm install
npm run dev

# Epic SDK (in separate terminal)
cd infra/docker/services/epic-sdk
npm install
export ANTHROPIC_API_KEY=sk-ant-your-key-here
export AGENT_BOOSTER_URL=http://localhost:3010
npm run dev
```

### Run Tests

```bash
# Agent Booster tests
cd infra/docker/services/agent-booster
npm test

# Epic SDK tests
cd infra/docker/services/epic-sdk
npm test
```

## Stopping Services

```bash
cd infra/docker/services

# Stop services
docker-compose -f docker-compose.routing.yml stop

# Stop and remove containers
docker-compose -f docker-compose.routing.yml down

# Stop and remove volumes
docker-compose -f docker-compose.routing.yml down -v
```

## Next Steps

1. ✅ Services deployed and healthy
2. ✅ Test endpoints working
3. ✅ Integration with Claude Flow configured
4. 📊 Set up Grafana dashboards (optional)
5. 🔍 Monitor cost savings via `/savings` endpoint
6. 🎯 Customize routing rules in `epic-sdk/config/routing-rules.json`
7. 🚀 Add custom Tier 1 patterns as needed

## Performance Expectations

After setup, you should see:

- **Tier 1 tasks**: <1ms latency, $0 cost
- **Tier 2 tasks**: ~500ms latency, $0.0002 cost
- **Tier 3 tasks**: 2-5s latency, $0.003-$0.015 cost
- **Overall savings**: 75% cost reduction vs all Tier 3
- **Speedup**: 352x for Tier 1 tasks

## Support

- **Documentation**: See `README.md` in each service directory
- **Architecture Decision**: See `docs/adr/ADR-026-3-tier-model-routing.md`
- **Issues**: Check Docker logs and health endpoints
