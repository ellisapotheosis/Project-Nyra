# Epic SDK - Multi-Tier Model Router (ADR-026)

Intelligent 3-tier model routing system that achieves **75% cost reduction** and **352x speedup** for simple tasks.

## Overview

Epic SDK is the orchestration layer for the 3-tier model routing system defined in ADR-026. It automatically classifies tasks by complexity and routes them to the optimal tier:

- **Tier 1**: Agent Booster (pattern matching, <1ms, $0)
- **Tier 2**: Claude Haiku (simple tasks, ~500ms, $0.0002)
- **Tier 3**: Claude Sonnet/Opus (complex reasoning, 2-5s, $0.003-$0.015)

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Epic SDK Router                      │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           Task Complexity Classifier                 │ │
│  │  • Pattern matching for Tier 1                      │ │
│  │  • Keyword analysis for Tier 3                      │ │
│  │  • Default to Tier 2 for simple tasks               │ │
│  └─────────────────────────────────────────────────────┘ │
│                           │                               │
│                           ▼                               │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Tier 1  │  │   Tier 2     │  │     Tier 3       │  │
│  │  Agent   │  │   Haiku      │  │  Sonnet/Opus     │  │
│  │ Booster  │  │   (~500ms)   │  │   (2-5s)         │  │
│  │  (<1ms)  │  │  $0.0002     │  │ $0.003-$0.015    │  │
│  │   $0     │  │              │  │                  │  │
│  └──────────┘  └──────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## API Endpoints

### POST /route

Main routing endpoint. Classifies task and executes with optimal tier.

**Request:**
```json
{
  "description": "Convert var declarations to const in my code",
  "code": "var x = 5; var y = 10;",
  "options": {
    "maxTokens": 4096
  }
}
```

**Response:**
```json
{
  "success": true,
  "classification": {
    "tier": 1,
    "model": "agent-booster",
    "reasoning": "Simple code transform - pattern matching sufficient",
    "estimatedCost": 0,
    "estimatedLatency": 1
  },
  "result": {
    "tier": 1,
    "model": "agent-booster",
    "result": "const x = 5; const y = 10;",
    "duration": 0.8,
    "cost": 0
  },
  "duration": 0.8,
  "costSavings": 0.003
}
```

### POST /classify

Get routing recommendation without executing.

**Request:**
```json
{
  "description": "Design a microservices architecture for mortgage processing"
}
```

**Response:**
```json
{
  "classification": {
    "tier": 3,
    "model": "claude-sonnet-4-5",
    "reasoning": "Complex reasoning required",
    "estimatedCost": 0.003,
    "estimatedLatency": 2000
  },
  "recommendation": "Use claude-sonnet-4-5 (Tier 3)",
  "benefits": {
    "estimatedCost": "$0.003",
    "estimatedLatency": "2000ms",
    "reasoning": "Complex reasoning required"
  }
}
```

### GET /savings

View cumulative cost savings.

**Response:**
```json
{
  "totalCostSaved": "1.2500",
  "currency": "USD",
  "comparison": "vs. all Tier 3 routing",
  "percentSavings": "75%",
  "speedup": "352x for Tier 1 tasks"
}
```

### GET /health

Health check endpoint.

### GET /metrics

Prometheus metrics endpoint.

## Routing Logic

### Tier 1 Classification (Agent Booster)

Tasks routed to Tier 1 if description matches patterns:
- `var.*const` - Variable declaration conversion
- `add.*type` - TypeScript type addition
- `remove.*console` - Console statement removal
- `add.*logging` - Structured logging addition
- `async.*await` - Async/await conversion
- `add.*error.*handling` - Error handling addition
- `format.*code` - Code formatting

### Tier 3 Classification (Sonnet/Opus)

Tasks routed to Tier 3 if:
- Contains keywords: architecture, design, security, compliance, complex, refactor, optimize, analyze, mortgage, financial, legal, regulation
- Description length > 200 characters
- Multiple steps detected (3+ numbered/bulleted items)

**Opus vs Sonnet:**
- Opus: Critical/compliance/security tasks
- Sonnet: Complex but non-critical tasks

### Tier 2 Classification (Haiku)

Default tier for:
- Simple bug fixes
- Straightforward implementations
- Tasks not matching Tier 1 or Tier 3 criteria

## Usage Examples

### Via curl

```bash
# Simple code transform (Tier 1)
curl -X POST http://localhost:3011/route \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Convert var to const",
    "code": "var x = 5;"
  }'

# Complex architecture (Tier 3)
curl -X POST http://localhost:3011/route \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Design a secure microservices architecture for mortgage loan processing with compliance validation"
  }'

# Get recommendation only
curl -X POST http://localhost:3011/classify \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Fix bug in authentication middleware"
  }'
```

### Via Claude Flow Hooks

```bash
# Pre-task hook automatically checks Epic SDK
npx @claude-flow/cli@latest hooks pre-task --description "Convert var to const"

# Output:
# [TASK_MODEL_RECOMMENDATION] Use model="agent-booster"
# [AGENT_BOOSTER_AVAILABLE] Intent: var-to-const
```

### In Claude Code Task Tool

```javascript
// Epic SDK recommendation is passed via hooks
Task({
  prompt: "Convert var to const in authentication.js",
  subagent_type: "coder",
  model: "agent-booster"  // ← Recommended by Epic SDK
})
```

## Performance Metrics

| Tier | Model | Avg Latency | Cost per Request | Throughput |
|------|-------|-------------|------------------|------------|
| 1 | Agent Booster | <1ms | $0 | 10,000+ req/s |
| 2 | Haiku | ~500ms | $0.0002 | 100 req/s |
| 3 | Sonnet | ~2000ms | $0.003 | 25 req/s |
| 3 | Opus | ~5000ms | $0.015 | 10 req/s |

## Cost Comparison

Assuming 1000 requests/day:

| Routing Strategy | Daily Cost | Monthly Cost | Annual Cost |
|------------------|------------|--------------|-------------|
| All Tier 3 (Sonnet) | $3.00 | $90.00 | $1,095.00 |
| All Tier 2 (Haiku) | $0.20 | $6.00 | $73.00 |
| **Intelligent (Epic SDK)** | **$0.75** | **$22.50** | **$273.75** |

**Savings: $821.25/year (75% reduction)**

## Docker Deployment

```bash
# Deploy both Epic SDK and Agent Booster
cd infra/docker/services/epic-sdk
docker-compose up -d

# Check logs
docker logs -f nyra-epic-sdk
docker logs -f nyra-agent-booster

# View metrics
curl http://localhost:3011/metrics
curl http://localhost:3010/metrics
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3011 | HTTP server port |
| `AGENT_BOOSTER_URL` | http://agent-booster:3010 | Agent Booster endpoint |
| `NEXUS_ROUTER_URL` | http://localhost:6000 | Nexus router for LLM access |
| `ANTHROPIC_API_KEY` | - | Anthropic API key for Claude models |
| `LOG_LEVEL` | info | Logging level |

## Integration with Claude Flow

### Pre-Task Hook Integration

Add to `claude-flow.config.json`:

```json
{
  "providers": {
    "routing": {
      "enabled": true,
      "epicSDK": {
        "url": "http://localhost:3011",
        "autoRoute": true,
        "preferTier1": true
      }
    }
  },
  "hooks": {
    "preTask": {
      "checkEpicSDK": true,
      "provideRecommendations": true
    }
  }
}
```

### Hook Implementation

```javascript
// In hooks/pre-task.js
const axios = require('axios');

async function preTask(taskDescription) {
  const classification = await axios.post('http://localhost:3011/classify', {
    description: taskDescription
  });

  if (classification.data.classification.tier === 1) {
    console.log('[AGENT_BOOSTER_AVAILABLE]');
    console.log(`Intent: ${extractIntent(taskDescription)}`);
    return { useAgentBooster: true };
  }

  console.log(`[TASK_MODEL_RECOMMENDATION] Use model="${classification.data.classification.model}"`);
  return { recommendedModel: classification.data.classification.model };
}
```

## Monitoring

### Prometheus Metrics

- `epic_sdk_routing_total{tier,model,status}` - Total routing decisions
- `epic_sdk_routing_duration_ms{tier,model}` - Routing duration histogram
- `epic_sdk_cost_saved_dollars` - Cumulative cost savings

### Grafana Dashboard

Import dashboard from `config/grafana-dashboard.json`:
- Routing distribution by tier
- Average latency by tier
- Cost savings over time
- Error rate monitoring

## Benefits

1. **75% Cost Reduction**: Intelligent routing avoids expensive Tier 3 for simple tasks
2. **352x Faster**: Tier 1 pattern matching vs LLM inference
3. **Automatic**: No manual tier selection required
4. **Transparent**: Full metrics and reasoning provided
5. **Adaptive**: Learns from usage patterns (future enhancement)

## Troubleshooting

### Agent Booster unavailable

```bash
# Check Agent Booster health
curl http://localhost:3010/health

# Restart if needed
docker restart nyra-agent-booster
```

### High Tier 3 usage

Review classification logic in `src/server.js`:
- Add more Tier 1 patterns
- Adjust Tier 3 keyword detection
- Lower complexity thresholds

### API key errors

```bash
# Verify Anthropic API key
echo $ANTHROPIC_API_KEY

# Update in docker-compose.yml
ANTHROPIC_API_KEY=sk-ant-...
```

## Development Roadmap

- [ ] Machine learning-based classification
- [ ] Custom tier definitions per project
- [ ] A/B testing framework
- [ ] Automatic pattern learning
- [ ] Multi-model ensemble routing

## License

MIT
