# Routing Configuration API

The Nexus Router now includes a comprehensive Routing Configuration API that allows dynamic control over request routing behavior without requiring service restarts.

## Features

- **Dynamic routing configuration** - Change routing strategies on the fly
- **Custom routing rules** - Define pattern-based routing rules with priorities
- **Routing simulation** - Test routing decisions before making changes
- **Redis persistence** - Configuration and rules persist across restarts
- **Multiple routing strategies** - Cost-optimized, latency-optimized, and quality-optimized

## Endpoints

### 1. Get Routing Configuration

Get the current routing configuration and all custom rules.

```bash
GET /api/routing/config
```

**Response:**
```json
{
  "config": {
    "strategy": "cost-optimized",
    "preferLocal": true,
    "fallbackCloud": true,
    "costThreshold": 0.1
  },
  "customRules": [
    {
      "id": "rule_1234567890_abc123",
      "pattern": "gpt-4|opus",
      "targetProvider": "anthropic",
      "targetModel": "claude-sonnet-4",
      "priority": 10,
      "enabled": true,
      "createdAt": "2025-01-18T12:00:00.000Z"
    }
  ],
  "metadata": {
    "totalRules": 1,
    "enabledRules": 1,
    "lastUpdated": "2025-01-18T12:00:00.000Z"
  }
}
```

### 2. Update Routing Configuration

Update the routing configuration. All fields are optional - only provide the fields you want to update.

```bash
PATCH /api/routing/config
Content-Type: application/json

{
  "strategy": "latency-optimized",
  "preferLocal": true,
  "fallbackCloud": true,
  "costThreshold": 0.05
}
```

**Configuration Options:**

- **strategy** (string): Routing strategy
  - `"cost-optimized"` - Prefer local workers to minimize costs
  - `"latency-optimized"` - Route to fastest available worker
  - `"quality-optimized"` - Prefer cloud providers for best quality

- **preferLocal** (boolean): Whether to prefer local GPU workers over cloud
  - `true` - Try local workers first
  - `false` - Go straight to cloud

- **fallbackCloud** (boolean): Whether to fallback to cloud if local workers are unavailable
  - `true` - Fallback to cloud providers
  - `false` - Fail request if no local workers available

- **costThreshold** (number, 0-1): Cost threshold for quality-optimized strategy
  - Requests below this cost estimate use local workers
  - Requests above use cloud for better quality

**Response:**
```json
{
  "success": true,
  "config": {
    "strategy": "latency-optimized",
    "preferLocal": true,
    "fallbackCloud": true,
    "costThreshold": 0.05
  },
  "message": "Routing configuration updated successfully"
}
```

### 3. Add Custom Routing Rule

Create a custom routing rule that takes precedence over the default routing logic.

```bash
POST /api/routing/rules
Content-Type: application/json

{
  "pattern": "gpt-4.*|opus",
  "targetProvider": "anthropic",
  "targetModel": "claude-sonnet-4",
  "priority": 10,
  "enabled": true
}
```

**Rule Fields:**

- **pattern** (string, required): Regex pattern or string match for model names
  - Examples: `"gpt-4.*"`, `"claude|anthropic"`, `"opus|sonnet-4"`

- **targetProvider** (string, required): Where to route matching requests
  - `"local"` - Route to local GPU workers
  - `"anthropic"` - Route to Anthropic API
  - `"openrouter"` - Route to OpenRouter API

- **targetModel** (string, optional): Override the model name for the target provider
  - Useful for translating model names between providers

- **priority** (number, default: 0): Rule priority (higher = evaluated first)
  - Rules are evaluated in descending priority order

- **enabled** (boolean, default: true): Whether the rule is active

**Response:**
```json
{
  "success": true,
  "rule": {
    "id": "rule_1705581234_xyz789",
    "pattern": "gpt-4.*|opus",
    "targetProvider": "anthropic",
    "targetModel": "claude-sonnet-4",
    "priority": 10,
    "enabled": true,
    "createdAt": "2025-01-18T12:00:00.000Z"
  },
  "message": "Custom routing rule created successfully"
}
```

### 4. Delete Custom Routing Rule

Remove a custom routing rule by its ID.

```bash
DELETE /api/routing/rules/:id
```

**Example:**
```bash
DELETE /api/routing/rules/rule_1705581234_xyz789
```

**Response:**
```json
{
  "success": true,
  "deletedRule": {
    "id": "rule_1705581234_xyz789",
    "pattern": "gpt-4.*|opus",
    "targetProvider": "anthropic",
    "targetModel": "claude-sonnet-4",
    "priority": 10,
    "enabled": true,
    "createdAt": "2025-01-18T12:00:00.000Z"
  },
  "message": "Routing rule deleted successfully"
}
```

### 5. Simulate Routing

Test how a request would be routed without actually executing it.

```bash
GET /api/routing/simulate?model=gpt-4&taskType=reasoning
```

**Query Parameters:**

- **model** (string, required): Model name to simulate routing for
- **taskType** (string, optional): Task type hint
  - `"reasoning"` - Complex reasoning tasks
  - `"analysis"` - Data analysis
  - `"coding"` - Code generation
  - `"general"` - General purpose

**Response:**
```json
{
  "decision": {
    "provider": "anthropic",
    "targetModel": "claude-sonnet-4",
    "reason": "Matched custom rule: gpt-4.*|opus",
    "worker": null
  },
  "matchedRule": {
    "id": "rule_1705581234_xyz789",
    "pattern": "gpt-4.*|opus",
    "priority": 10
  },
  "currentConfig": {
    "strategy": "latency-optimized",
    "preferLocal": true,
    "fallbackCloud": true,
    "costThreshold": 0.05
  },
  "timestamp": "2025-01-18T12:00:00.000Z"
}
```

## Routing Strategies

### Cost-Optimized (default)

Minimizes costs by preferring local GPU workers over cloud APIs.

**Behavior:**
1. Check if local workers are preferred (`preferLocal`)
2. Find best available local worker
3. Fallback to cloud if no healthy local workers and `fallbackCloud` is true
4. Fail if no workers available

**Best for:** Production workloads where cost efficiency is critical

### Latency-Optimized

Routes to the fastest available worker based on recent health check response times.

**Behavior:**
1. Filter healthy local workers
2. Select worker with lowest response time
3. Fallback to cloud if no local workers available
4. Prioritizes speed over cost

**Best for:** Interactive applications requiring low latency

### Quality-Optimized

Prioritizes output quality, preferring cloud providers (especially Anthropic) unless cost is below threshold.

**Behavior:**
1. Estimate request cost based on model name
2. If cost < `costThreshold` and `preferLocal`, try local workers
3. Otherwise, route to cloud for best quality
4. Prefers Anthropic over OpenRouter

**Best for:** Critical tasks where output quality is paramount

## Custom Routing Rules

Custom rules provide pattern-based routing that takes precedence over strategy-based routing.

### Rule Evaluation Order

1. Rules are sorted by priority (descending)
2. Rules are evaluated in order until a match is found
3. Pattern matching uses regex (case-insensitive)
4. Only enabled rules are evaluated

### Pattern Examples

```json
{
  "pattern": "gpt-4",
  "targetProvider": "anthropic",
  "targetModel": "claude-sonnet-4"
}
```
Matches: "gpt-4", "gpt-4-turbo", "gpt-4-32k"

```json
{
  "pattern": "^opus$",
  "targetProvider": "local",
  "priority": 20
}
```
Matches: Exactly "opus" (case-insensitive)

```json
{
  "pattern": "deepseek|qwen|mistral",
  "targetProvider": "openrouter"
}
```
Matches: Any model containing "deepseek", "qwen", or "mistral"

## Usage Examples

### Example 1: Switch to Latency-Optimized Routing

```bash
curl -X PATCH http://localhost:8000/api/routing/config \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "latency-optimized"
  }'
```

### Example 2: Route GPT-4 Requests to Claude

```bash
curl -X POST http://localhost:8000/api/routing/rules \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "gpt-4",
    "targetProvider": "anthropic",
    "targetModel": "claude-sonnet-4",
    "priority": 10,
    "enabled": true
  }'
```

### Example 3: Test Routing for a Model

```bash
curl "http://localhost:8000/api/routing/simulate?model=gpt-4&taskType=reasoning"
```

### Example 4: Disable Cloud Fallback

```bash
curl -X PATCH http://localhost:8000/api/routing/config \
  -H "Content-Type: application/json" \
  -d '{
    "fallbackCloud": false
  }'
```

### Example 5: Set Cost Threshold for Quality Mode

```bash
curl -X PATCH http://localhost:8000/api/routing/config \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "quality-optimized",
    "costThreshold": 0.15
  }'
```

## Persistence

- Configuration changes are stored in Redis with a 30-day TTL
- Custom rules are stored individually in Redis
- On service restart, configuration and rules are restored from Redis
- If Redis is unavailable, defaults from environment variables are used

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200** - Success (GET requests)
- **201** - Created (POST requests)
- **400** - Validation error (invalid input)
- **404** - Not found (rule doesn't exist)
- **500** - Server error

Error responses include:
```json
{
  "error": "Validation error",
  "message": "Detailed error message",
  "details": [/* validation errors if applicable */]
}
```

## Integration with Worker Manager

The routing configuration integrates seamlessly with the existing WorkerManager:

1. **getRoutingConfig()** - Get current configuration
2. **updateRoutingConfig()** - Update configuration dynamically
3. **routeRequest()** - Routes requests based on strategy and rules

The WorkerManager now implements three routing strategies with different logic for finding the optimal worker or cloud provider.

## Monitoring

Check the current routing configuration and rules via:

```bash
curl http://localhost:8000/api/routing/config
```

Monitor routing decisions in the logs:
```
[worker-manager] Routing to local worker a1b2c3d4 for model gpt-4 (cost-optimized)
[worker-manager] Routing to cloud for quality optimization (model: claude-opus-4)
[worker-manager] Routing to fastest worker xyz789ab (89ms) for model llama-3
```

## Best Practices

1. **Test with simulation** - Always test routing changes with the `/simulate` endpoint first
2. **Use priorities wisely** - Assign higher priorities to more specific rules
3. **Monitor performance** - Check worker health and response times regularly
4. **Set appropriate thresholds** - Adjust `costThreshold` based on your budget and quality requirements
5. **Keep rules simple** - Use straightforward patterns to avoid unexpected matches
6. **Document rules** - Keep track of why each custom rule was created
7. **Regular cleanup** - Remove unused or outdated rules periodically
