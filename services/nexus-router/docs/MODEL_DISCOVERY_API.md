# Model Discovery & Catalog API

The Nexus Router Model Discovery service provides comprehensive model information with automatic discovery, capability tracking, and real-time availability monitoring.

## Features

- **Automatic Discovery**: Initial discovery at startup + background refresh every 5 minutes
- **Capability Matrix**: Tracks VRAM requirements, context length, streaming support, tool calling, vision
- **Cost Tracking**: Per-1K token pricing for cloud models
- **Lock-Free Lookups**: Watch channel pattern inspired by Grafbase Nexus for zero-contention reads
- **Multi-Provider**: Discovers models from local GPU workers, Anthropic, and OpenRouter
- **Alias Support**: Find models by ID or alias (e.g., "opus-4" → "claude-opus-4")

## Endpoints

### List All Models

```http
GET /v1/models
```

Returns all discovered models with full capability information.

**Query Parameters:**
- `provider` (string): Filter by provider (local-gpu, anthropic, openrouter)
- `availability` (string): Filter by availability (available, unavailable, degraded)
- `supportsToolCalling` (boolean): Filter models with function calling
- `supportsVision` (boolean): Filter models with vision capabilities
- `minContextLength` (number): Minimum context window size
- `maxVramRequirements` (number): Maximum VRAM in GB

**Example Request:**
```bash
curl http://localhost:8000/v1/models?supportsToolCalling=true&minContextLength=100000
```

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "claude-opus-4",
      "object": "model",
      "created": 1737200000,
      "owned_by": "anthropic",
      "available": true,
      "provider": "anthropic",
      "capabilities": {
        "maxContextLength": 200000,
        "vramRequirements": null,
        "supportsStreaming": true,
        "supportsToolCalling": true,
        "supportsVision": true,
        "parameterSize": null,
        "quantization": null,
        "architecture": "claude"
      },
      "pricing": {
        "costPer1kInputTokens": 0.015,
        "costPer1kOutputTokens": 0.075,
        "currency": "USD"
      },
      "metadata": {
        "aliases": ["claude-opus-4", "opus-4"],
        "lastChecked": "2026-01-18T12:00:00.000Z"
      }
    },
    {
      "id": "deepseek-r1-70b-q4",
      "object": "model",
      "created": 1737200000,
      "owned_by": "local-gpu",
      "available": true,
      "provider": "local-gpu",
      "capabilities": {
        "maxContextLength": 64000,
        "vramRequirements": 24,
        "supportsStreaming": true,
        "supportsToolCalling": true,
        "supportsVision": false,
        "parameterSize": "671B",
        "quantization": "Q4_K_M",
        "architecture": "deepseek"
      },
      "pricing": {
        "costPer1kInputTokens": null,
        "costPer1kOutputTokens": null,
        "currency": "USD"
      },
      "runtime": {
        "workerUrl": "http://192.168.1.100:8001",
        "workerId": "5090-001",
        "responseTime": 145
      },
      "metadata": {
        "aliases": ["deepseek-r1-70b-q4", "deepseek-r1"],
        "lastChecked": "2026-01-18T12:00:00.000Z"
      }
    }
  ],
  "metadata": {
    "totalModels": 15,
    "byProvider": {
      "local-gpu": 8,
      "anthropic": 3,
      "openrouter": 4
    },
    "availableModels": 15,
    "unavailableModels": 0,
    "lastDiscovery": "2026-01-18T12:00:00.000Z",
    "nextDiscovery": "2026-01-18T12:05:00.000Z",
    "cacheVersion": 42
  }
}
```

### Get Model Details

```http
GET /v1/models/:id
```

Get comprehensive details for a specific model by ID or alias.

**Example Request:**
```bash
curl http://localhost:8000/v1/models/opus-4
# Also works with: claude-opus-4, claude-sonnet-4-20250514, etc.
```

**Response:**
```json
{
  "id": "claude-opus-4",
  "name": "Claude Opus 4",
  "object": "model",
  "created": 1737200000,
  "owned_by": "anthropic",
  "available": true,
  "provider": "anthropic",
  "capabilities": {
    "maxContextLength": 200000,
    "vramRequirements": null,
    "supportsStreaming": true,
    "supportsToolCalling": true,
    "supportsVision": true,
    "parameterSize": null,
    "quantization": null,
    "architecture": "claude"
  },
  "pricing": {
    "costPer1kInputTokens": 0.015,
    "costPer1kOutputTokens": 0.075,
    "currency": "USD",
    "estimatedCostPer1MTokens": {
      "input": 15.0,
      "output": 75.0
    }
  },
  "runtime": {
    "location": "cloud",
    "endpoint": "https://api.anthropic.com/v1/messages"
  },
  "metadata": {
    "aliases": ["claude-opus-4", "opus-4"],
    "lastChecked": "2026-01-18T12:00:00.000Z",
    "availability": "available"
  },
  "recommendedFor": [
    "function-calling",
    "agentic-workflows",
    "image-analysis",
    "visual-qa",
    "long-context",
    "document-analysis",
    "code-generation",
    "analysis",
    "writing"
  ]
}
```

### Trigger Discovery Refresh

```http
POST /v1/models/discovery/refresh
```

Manually trigger a model discovery refresh (non-blocking).

**Example Request:**
```bash
curl -X POST http://localhost:8000/v1/models/discovery/refresh
```

**Response:**
```json
{
  "success": true,
  "message": "Model discovery refresh triggered",
  "timestamp": "2026-01-18T12:00:00.000Z"
}
```

### Get Discovery Status

```http
GET /v1/models/discovery/status
```

Get current discovery service status and health.

**Example Request:**
```bash
curl http://localhost:8000/v1/models/discovery/status
```

**Response:**
```json
{
  "status": "operational",
  "discovery": {
    "lastDiscovery": "2026-01-18T12:00:00.000Z",
    "nextDiscovery": "2026-01-18T12:05:00.000Z",
    "discovering": false,
    "refreshInterval": "5 minutes",
    "refreshIntervalMs": 300000
  },
  "models": {
    "total": 15,
    "available": 15,
    "unavailable": 0
  },
  "errors": [],
  "cacheVersion": 42,
  "timestamp": "2026-01-18T12:00:00.000Z"
}
```

## Model Capability Matrix

Each model includes the following capability information:

| Field | Type | Description |
|-------|------|-------------|
| `maxContextLength` | number | Maximum input context window (tokens) |
| `vramRequirements` | number? | GPU VRAM required in GB (local models only) |
| `supportsStreaming` | boolean | Supports streaming responses |
| `supportsToolCalling` | boolean | Supports function/tool calling |
| `supportsVision` | boolean | Supports image input |
| `parameterSize` | string? | Model size (e.g., "70B", "671B") |
| `quantization` | string? | Quantization method (e.g., "Q4_K_M", "FP16") |
| `architecture` | string? | Model architecture (e.g., "claude", "llama", "deepseek") |

## Recommended Use Cases

Models are automatically tagged with recommended use cases based on their capabilities:

- **function-calling**: Models with tool calling support
- **agentic-workflows**: Models suitable for agent frameworks
- **image-analysis**: Models with vision capabilities
- **visual-qa**: Models for visual question answering
- **long-context**: Models with 100K+ context windows
- **document-analysis**: Large context models for document processing
- **edge-deployment**: Low VRAM models (≤12GB)
- **local-inference**: Models suitable for local deployment
- **high-volume**: Low-cost models for high-volume use
- **cost-sensitive**: Models with < $0.001 per 1K tokens
- **reasoning**: Large models (70B+) for complex reasoning
- **complex-tasks**: Models designed for advanced tasks
- **fast-inference**: Smaller models (7B-13B) optimized for speed
- **chat**: General-purpose conversational models
- **code-generation**: Models optimized for coding
- **coding**: Models specialized in code understanding
- **analysis**: Models for analytical tasks
- **writing**: Models optimized for content generation

## Discovery Process

The discovery service runs a 4-phase process:

1. **Local Worker Discovery**
   - Queries each local GPU worker's `/v1/models` endpoint
   - Falls back to config-based models if endpoint unavailable
   - Infers capabilities from model names and patterns

2. **Cloud Provider Discovery**
   - Anthropic: Static model definitions with known capabilities
   - OpenRouter: Fetches live model list from OpenRouter API
   - Updates pricing and availability information

3. **Capability Inference**
   - Analyzes model names for architecture (llama, mistral, deepseek, etc.)
   - Detects parameter sizes (7B, 70B, 671B, etc.)
   - Identifies quantization levels (Q4, Q5, Q8, FP16)
   - Estimates VRAM requirements based on size and quantization

4. **Cache Update**
   - Atomic cache swap with versioning
   - Indexes by both ID and aliases
   - Emits events for subscribers
   - Zero downtime updates

## Architecture: Watch Channel Pattern

The discovery service uses a lock-free watch channel pattern inspired by Grafbase Nexus:

- **Read Path**: Zero-contention lookups from immutable cache
- **Write Path**: Background refresh with atomic cache swap
- **Versioning**: Cache version tracking for optimistic locking
- **Event System**: EventEmitter for subscribers (webhooks, metrics, logging)

```typescript
// Example: Subscribe to discovery events
const discovery = ModelDiscoveryService.getInstance();

discovery.on('discovery-complete', (stats) => {
  console.log(`Discovered ${stats.totalModels} models in ${stats.duration}ms`);
});

discovery.on('discovery-error', (error) => {
  console.error('Discovery failed:', error);
});
```

## Performance

- **Startup Discovery**: ~2-5 seconds (depends on worker count)
- **Background Refresh**: Every 5 minutes (configurable)
- **Lookup Time**: <1ms (lock-free cache reads)
- **Memory Overhead**: ~50KB per model entry

## Error Handling

Discovery errors are collected but non-fatal. The service continues with partial results:

- **Worker Unreachable**: Skips worker, logs error
- **OpenRouter API Down**: Falls back to static model list
- **Partial Failures**: Returns available models, reports errors in status endpoint

Check `/v1/models/discovery/status` for error details.

## Best Practices

1. **Query Filtering**: Use query parameters to reduce response size
2. **Cache Version**: Track `cacheVersion` for efficient polling
3. **Error Monitoring**: Monitor `/v1/models/discovery/status` for failures
4. **Cost Awareness**: Use `pricing` data for cost-optimal routing
5. **Capability Matching**: Filter by capabilities to find suitable models

## Example: Find Best Model for Task

```bash
# Find models for function calling with long context
curl "http://localhost:8000/v1/models?supportsToolCalling=true&minContextLength=100000"

# Find cost-effective local models
curl "http://localhost:8000/v1/models?provider=local-gpu&maxVramRequirements=24"

# Find cloud models with vision
curl "http://localhost:8000/v1/models?supportsVision=true&provider=anthropic"
```

## Integration with Routing

The discovery service integrates with the router's model selection:

1. Router checks model availability via discovery cache
2. Filters models by capability requirements (streaming, tools, etc.)
3. Ranks by cost, latency, and availability
4. Falls back to cloud if local models unavailable

## Future Enhancements

- [ ] Model performance benchmarking (tokens/sec, latency)
- [ ] Dynamic capability testing (probe models with test requests)
- [ ] Model health scoring based on success rate
- [ ] Webhook notifications for model availability changes
- [ ] Model recommendation engine based on task type
- [ ] Cost optimization suggestions
- [ ] A/B testing support for model comparison

## Related Documentation

- [Routing API](./ROUTING_API.md) - Intelligent request routing
- [MCP Proxy](./MCP_PROXY.md) - MCP server aggregation
- [Worker Configuration](./WORKER_CONFIG.md) - Local GPU worker setup
