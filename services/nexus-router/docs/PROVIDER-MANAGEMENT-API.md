# Provider Management API

Complete REST API for managing LLM provider configurations in Nexus Router.

## Features

- CRUD operations for provider configurations
- Support for 7 major providers (Anthropic, OpenAI, Google Gemini, AWS Bedrock, OpenRouter, Meta Llama, Cohere)
- Automatic provider discovery from environment variables
- Health monitoring and connection testing
- Per-provider API key management
- Token forwarding configuration
- Provider priority and timeout settings
- Persistent storage in Redis

## Endpoints

### List All Providers
```http
GET /api/providers
```

**Response:**
```json
{
  "providers": [
    {
      "id": "uuid",
      "name": "Anthropic (Auto-discovered)",
      "type": "anthropic",
      "enabled": true,
      "apiKey": "***-1234",
      "baseUrl": "https://api.anthropic.com/v1",
      "models": ["claude-opus-4", "claude-sonnet-4"],
      "tokenForwarding": false,
      "maxTokens": 4096,
      "timeout": 120000,
      "priority": 50,
      "createdAt": "2025-01-18T...",
      "updatedAt": "2025-01-18T..."
    }
  ],
  "metadata": {
    "total": 3,
    "enabled": 2,
    "disabled": 1,
    "byType": {
      "anthropic": 1,
      "openai": 1,
      "google-gemini": 1
    }
  }
}
```

### Create a New Provider
```http
POST /api/providers
Content-Type: application/json

{
  "name": "My OpenAI Provider",
  "type": "openai",
  "apiKey": "sk-...",
  "enabled": true,
  "tokenForwarding": false,
  "maxTokens": 4096,
  "timeout": 120000,
  "priority": 50,
  "models": ["gpt-4o", "gpt-4-turbo"],
  "metadata": {
    "department": "engineering",
    "costCenter": "ai-ops"
  }
}
```

**Validation:**
- `name` - required, min length 1
- `type` - required, one of: `anthropic`, `aws-bedrock`, `google-gemini`, `openai`, `openrouter`, `meta-llama`, `cohere`
- `apiKey` - optional string
- `baseUrl` - optional valid URL (defaults to provider's standard endpoint)
- `models` - optional array of strings (defaults to provider's standard models)
- `enabled` - optional boolean (default: true)
- `tokenForwarding` - optional boolean (default: false)
- `maxTokens` - optional positive integer
- `timeout` - optional positive integer (default: 120000ms)
- `priority` - optional integer 1-100 (default: 50)
- `metadata` - optional object with any additional fields

**Response:** `201 Created` with provider object

### Get a Specific Provider
```http
GET /api/providers/:id
```

**Response:** Provider object or `404 Not Found`

### Update a Provider
```http
PATCH /api/providers/:id
Content-Type: application/json

{
  "enabled": false,
  "priority": 75,
  "maxTokens": 8192
}
```

All fields are optional. Only provided fields will be updated.

**Response:** Updated provider object or `404 Not Found`

### Delete a Provider
```http
DELETE /api/providers/:id
```

**Response:** `204 No Content` or `404 Not Found`

### Check Provider Health
```http
GET /api/providers/:id/health
```

**Response:** `200 OK` (healthy) or `503 Service Unavailable` (unhealthy)
```json
{
  "providerId": "uuid",
  "healthy": true,
  "responseTime": 145,
  "lastCheck": "2025-01-18T...",
  "details": {
    "modelsAvailable": 4
  }
}
```

### Test Provider Connection
```http
POST /api/providers/:id/test
```

Performs a comprehensive connection test including model discovery.

**Response:** `200 OK` (success) or `400 Bad Request` (failure)
```json
{
  "providerId": "uuid",
  "success": true,
  "responseTime": 234,
  "details": {
    "modelsDiscovered": ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
    "apiVersion": "v1",
    "capabilities": ["chat", "streaming", "function-calling"]
  }
}
```

## Supported Providers

### Anthropic
- **Type:** `anthropic`
- **Base URL:** `https://api.anthropic.com/v1`
- **Default Models:** claude-opus-4, claude-sonnet-4, claude-sonnet-3.5, claude-haiku-3.5
- **Environment Variable:** `ANTHROPIC_API_KEY`

### AWS Bedrock
- **Type:** `aws-bedrock`
- **Base URL:** `https://bedrock-runtime.{region}.amazonaws.com`
- **Default Models:** anthropic.claude-3-opus, anthropic.claude-3-sonnet, amazon.titan-text-express
- **Note:** Full implementation requires AWS SDK (currently placeholder)

### Google Gemini
- **Type:** `google-gemini`
- **Base URL:** `https://generativelanguage.googleapis.com/v1`
- **Default Models:** gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash
- **Environment Variables:** `GOOGLE_API_KEY` or `GEMINI_API_KEY`

### OpenAI
- **Type:** `openai`
- **Base URL:** `https://api.openai.com/v1`
- **Default Models:** gpt-4o, gpt-4-turbo, gpt-4, gpt-3.5-turbo
- **Environment Variable:** `OPENAI_API_KEY`

### OpenRouter
- **Type:** `openrouter`
- **Base URL:** `https://openrouter.ai/api/v1`
- **Default Models:** deepseek/deepseek-r1, anthropic/claude-3.5-sonnet, google/gemini-2.0-flash-exp
- **Environment Variable:** `OPENROUTER_API_KEY`

### Meta Llama (via Together.ai)
- **Type:** `meta-llama`
- **Base URL:** `https://api.together.xyz/v1`
- **Default Models:** meta-llama/llama-3.3-70b-instruct, meta-llama/llama-3.1-405b-instruct
- **Environment Variable:** `TOGETHER_API_KEY`

### Cohere
- **Type:** `cohere`
- **Base URL:** `https://api.cohere.ai/v1`
- **Default Models:** command-r-plus, command-r, command
- **Environment Variable:** `COHERE_API_KEY`

## Auto-Discovery

The Provider Manager automatically discovers providers from environment variables on startup:

```bash
# Example: Auto-discover Anthropic and OpenAI providers
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...
```

When the service starts, it will automatically create provider configurations for any detected API keys.

## Security

- API keys are **sanitized** in API responses (only last 4 characters shown)
- Full API keys are stored securely in Redis
- API keys are never logged
- All provider requests use HTTPS

## Token Forwarding

When `tokenForwarding` is enabled, the provider will pass through request-specific tokens from the client. This is useful for:
- Cost tracking per user/department
- Usage attribution
- Multi-tenant scenarios

**Default:** `false` (disabled for security)

## Priority System

Providers have a priority value (1-100):
- **1-33:** Low priority (fallback only)
- **34-66:** Normal priority (default: 50)
- **67-100:** High priority (preferred)

Higher priority providers are selected first when routing requests.

## Storage

All provider configurations are persisted to Redis with the key prefix `nexus:providers:all`. The service works with or without Redis:

- **With Redis:** Providers persist across restarts
- **Without Redis:** Providers are auto-discovered on each startup from environment variables

## Example Usage

### Create a Production OpenAI Provider
```bash
curl -X POST http://localhost:8000/api/providers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production OpenAI",
    "type": "openai",
    "apiKey": "sk-proj-...",
    "enabled": true,
    "priority": 80,
    "maxTokens": 8192,
    "timeout": 180000,
    "models": ["gpt-4o", "gpt-4-turbo"],
    "metadata": {
      "environment": "production",
      "tier": "enterprise"
    }
  }'
```

### Test All Providers
```bash
# Get all providers
PROVIDERS=$(curl -s http://localhost:8000/api/providers | jq -r '.providers[].id')

# Test each one
for provider_id in $PROVIDERS; do
  echo "Testing provider: $provider_id"
  curl -X POST "http://localhost:8000/api/providers/$provider_id/test"
  echo ""
done
```

### Disable a Provider
```bash
curl -X PATCH http://localhost:8000/api/providers/{provider-id} \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": {
    "message": "Error description",
    "type": "validation_error|not_found|server_error",
    "details": [...]
  }
}
```

**HTTP Status Codes:**
- `200 OK` - Success
- `201 Created` - Provider created
- `204 No Content` - Provider deleted
- `400 Bad Request` - Validation error
- `404 Not Found` - Provider not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Provider unhealthy

## Integration with Nexus Router

The Provider Management API integrates with the Nexus Router's request routing system:

1. Providers are checked for availability during request routing
2. Healthy, enabled providers are prioritized by their priority value
3. Token forwarding settings are respected for each provider
4. Provider-specific timeouts and max token limits are enforced

## Development

### Run Tests
```bash
npm test
```

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
```

## Files Created

- `services/nexus-router/src/types/providers.ts` - TypeScript types and interfaces
- `services/nexus-router/src/services/provider-manager.ts` - Core service logic
- `services/nexus-router/src/routes/providers.ts` - Express route handlers
- `services/nexus-router/src/index.ts` - Updated with provider routes

## Future Enhancements

- [ ] Provider usage analytics and metrics
- [ ] Cost tracking per provider
- [ ] Automatic failover configuration
- [ ] Provider load balancing strategies
- [ ] Webhook notifications for provider health changes
- [ ] AWS Bedrock full implementation with AWS SDK
- [ ] Provider credential rotation
- [ ] Multi-region provider support
