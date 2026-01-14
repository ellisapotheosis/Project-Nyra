# LiteLLM Proxy - Quick Start (5 Minutes)

Get LiteLLM Proxy running in under 5 minutes!

## Prerequisites

- Docker & Docker Compose installed
- OpenRouter API key (get free at https://openrouter.ai)

## Steps

### 1. Navigate to Directory

```bash
cd services/litellm-proxy
```

### 2. Create Environment File

```bash
# Copy example
cp .env.example .env

# Set required values
nano .env
```

**Minimum required**:
```bash
LITELLM_MASTER_KEY=sk-test-12345
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 3. Start Services

```bash
# Development mode (single instance)
pnpm start:dev

# Wait 30 seconds for startup...
```

### 4. Test It Works

```bash
# Health check
curl http://localhost:4000/health

# List models
curl -H "Authorization: Bearer sk-test-12345" \
  http://localhost:4000/v1/models

# Chat completion
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-test-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 50
  }'
```

## Success!

You now have:
- ✅ LiteLLM Proxy running on http://localhost:4000
- ✅ OpenRouter fallback configured
- ✅ OpenAI-compatible API endpoint

## Next Steps

### Add GPU Workers (Optional)

Edit `.env`:
```bash
WORKER_5090_URL=http://192.168.1.100:8000/v1
WORKER_5090_API_KEY=your-worker-key
```

Restart:
```bash
pnpm restart
```

### Create Tenants

```bash
./scripts/manage-tenants.sh create engineering 500 "llama-3.1-70b"
```

### Production Mode

```bash
# Stop dev
pnpm stop

# Start production (3 instances + monitoring)
pnpm start
```

Access monitoring:
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9091

## Common Issues

**Cannot connect?**
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs
```

**401 Unauthorized?**
```bash
# Verify master key
echo $LITELLM_MASTER_KEY
grep LITELLM_MASTER_KEY .env
```

**Still having issues?**
- See full [Setup Guide](docs/SETUP-GUIDE.md)
- See [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

## Integration Example

Use with any OpenAI-compatible client:

**Python**:
```python
import openai
openai.api_base = "http://localhost:4000/v1"
openai.api_key = "sk-test-12345"
```

**Node.js**:
```javascript
const client = new OpenAI({
  baseURL: 'http://localhost:4000/v1',
  apiKey: 'sk-test-12345'
});
```

**Environment Variables**:
```bash
export OPENAI_API_BASE=http://localhost:4000/v1
export OPENAI_API_KEY=sk-test-12345
```

## Stop Services

```bash
pnpm stop
```

## Documentation

- [Full README](README.md)
- [Setup Guide](docs/SETUP-GUIDE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

Happy routing! 🚀
