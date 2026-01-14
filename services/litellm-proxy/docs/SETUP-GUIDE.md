# LiteLLM Proxy - Complete Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [GPU Worker Setup](#gpu-worker-setup)
5. [OpenRouter Setup](#openrouter-setup)
6. [Deployment](#deployment)
7. [Verification](#verification)
8. [Integration](#integration)
9. [Production Setup](#production-setup)

## Prerequisites

### Required

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **OpenRouter API Key**: For cloud fallback

### Optional

- **GPU Workers**: Running local LLM inference servers
- **PostgreSQL**: For advanced usage tracking (included in stack)
- **Redis**: For response caching (included in stack)

### Check Prerequisites

```bash
# Check Docker
docker --version
# Should output: Docker version 20.10.x or higher

# Check Docker Compose
docker-compose --version
# Should output: Docker Compose version 2.x.x or higher

# Check Docker is running
docker ps
# Should show running containers or empty list
```

## Installation

### Step 1: Navigate to Service Directory

```bash
cd /path/to/Project-Nyra/services/litellm-proxy
```

### Step 2: Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Edit with your preferred editor
nano .env
# or
code .env
```

### Step 3: Configure Environment

Edit `.env` file with your values:

```bash
# ========================================
# REQUIRED: Master Key
# ========================================
LITELLM_MASTER_KEY=sk-nyra-$(openssl rand -hex 32)

# ========================================
# REQUIRED: OpenRouter (Fallback)
# ========================================
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here

# ========================================
# OPTIONAL: GPU Workers
# ========================================
# Worker 1: RTX 5090 (48GB VRAM)
WORKER_5090_URL=http://192.168.1.100:8000/v1
WORKER_5090_API_KEY=sk-worker-5090-key
WORKER_5090_MODELS=llama-3.1-405b,qwen-2.5-72b,deepseek-v3

# Worker 2: RTX 3090 (24GB VRAM)
WORKER_3090_URL=http://192.168.1.101:8000/v1
WORKER_3090_API_KEY=sk-worker-3090-key
WORKER_3090_MODELS=llama-3.1-70b,qwen-2.5-32b,mixtral-8x22b

# Worker 3: RTX 3060 (12GB VRAM)
WORKER_3060_URL=http://192.168.1.102:8000/v1
WORKER_3060_API_KEY=sk-worker-3060-key
WORKER_3060_MODELS=llama-3.1-8b,qwen-2.5-7b,deepseek-coder-6.7b

# ========================================
# OPTIONAL: Database (auto-configured)
# ========================================
POSTGRES_PASSWORD=$(openssl rand -hex 16)

# ========================================
# OPTIONAL: Monitoring
# ========================================
GRAFANA_PASSWORD=admin  # Change in production!
```

### Step 4: Validate Configuration

```bash
# Ensure .env file exists and has required variables
grep -q "LITELLM_MASTER_KEY" .env && echo "✓ Master key configured" || echo "✗ Missing master key"
grep -q "OPENROUTER_API_KEY" .env && echo "✓ OpenRouter configured" || echo "✗ Missing OpenRouter key"
```

## Configuration

### Model Configuration

Edit `config/config.yaml` to customize models:

```yaml
model_list:
  # Add custom models
  - model_name: "my-custom-model"
    litellm_params:
      model: "openai/my-model"
      api_base: "http://my-server:8000/v1"
      api_key: "${MY_CUSTOM_KEY}"
      timeout: 120
    model_info:
      mode: "chat"
      input_cost_per_token: 0.000001
      output_cost_per_token: 0.000004
```

### Routing Strategy

Choose your routing strategy in `config/config.yaml`:

```yaml
router_settings:
  routing_strategy: "cost-optimized"  # Options: cost-optimized, latency-optimized, quality-optimized
  prefer_local_workers: true
  cloud_fallback_threshold: 0.90
```

### Budget Configuration

Set budgets in `config/config.yaml`:

```yaml
budgets:
  - budget_id: "engineering"
    max_budget: 500.0  # USD per month
    time_period: "monthly"
    alert_threshold: 0.80
    block_on_exceed: false
```

## GPU Worker Setup

### Prerequisites for GPU Workers

Each GPU worker needs:
- NVIDIA GPU with CUDA support
- vLLM, Text Generation Inference, or Ollama
- OpenAI-compatible API endpoint

### Example: Setting up vLLM Worker

On GPU machine:

```bash
# Install vLLM
pip install vllm

# Start vLLM server
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-70b-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 2 \
  --max-model-len 32768
```

### Example: Setting up Ollama Worker

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama3.1:70b

# Start with OpenAI compatibility
OLLAMA_HOST=0.0.0.0:8000 ollama serve
```

### Verify Worker Connectivity

From LiteLLM proxy machine:

```bash
# Test connectivity
curl http://192.168.1.100:8000/v1/models

# Test chat completion
curl -X POST http://192.168.1.100:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## OpenRouter Setup

### Step 1: Get API Key

1. Visit https://openrouter.ai
2. Sign up or log in
3. Navigate to "Keys" section
4. Create new API key
5. Copy key (starts with `sk-or-v1-`)

### Step 2: Add Credits

1. Go to "Credits" section
2. Add credits via Stripe
3. Minimum $5 recommended

### Step 3: Test API Key

```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer sk-or-v1-your-key-here"
```

### Step 4: Configure in LiteLLM

Add to `.env`:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

## Deployment

### Development Deployment

For local development and testing:

```bash
# Start dev stack (single instance)
pnpm start:dev

# Or with script
./scripts/deploy.sh start-dev

# Check logs
pnpm logs
```

### Production Deployment

For production with HA and monitoring:

```bash
# Start production stack
pnpm start

# Or with script
./scripts/deploy.sh start

# Check status
pnpm status

# View metrics
pnpm metrics
```

### Services Started

Production deployment starts:

- **nginx**: Load balancer (port 4000)
- **litellm-1/2/3**: Proxy instances (ports 4001-4003)
- **postgres**: Database (port 5432)
- **redis**: Cache (port 6379)
- **prometheus**: Metrics (port 9091)
- **grafana**: Dashboards (port 3001)
- **loki**: Log aggregation (port 3100)
- **promtail**: Log shipper

## Verification

### Step 1: Check Service Health

```bash
# Quick health check
curl http://localhost:4000/health

# Expected response:
# {
#   "status": "healthy",
#   "components": {
#     "redis": "healthy",
#     "postgres": "healthy",
#     "workers": {
#       "healthy": 2,
#       "total": 3
#     }
#   }
# }
```

### Step 2: List Available Models

```bash
curl -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  http://localhost:4000/v1/models | jq .
```

### Step 3: Test Chat Completion

```bash
# Test local model
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b",
    "messages": [{"role": "user", "content": "What is 2+2?"}],
    "max_tokens": 100
  }' | jq .

# Test OpenRouter fallback
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 50
  }' | jq .
```

### Step 4: Test Streaming

```bash
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b",
    "messages": [{"role": "user", "content": "Count to 5"}],
    "stream": true
  }'
```

### Step 5: Check Monitoring

1. **Grafana**: http://localhost:3001
   - Username: `admin`
   - Password: (from `.env`)

2. **Prometheus**: http://localhost:9091
   - Browse metrics
   - Execute queries

## Integration

### Integration with Nexus Router

Update Nexus Router environment:

```bash
# Edit services/nexus-router/.env
LITELLM_BASE_URL=http://litellm-proxy:4000
LITELLM_API_KEY=sk-your-master-key
```

Update Nexus Router code:

```typescript
// services/nexus-router/src/routes/chat.ts
import { litellmClient } from '../integrations/litellm-client';

router.post('/v1/chat/completions', async (req, res) => {
  const response = await litellmClient.chatCompletion(req.body);
  res.json(response);
});
```

### Integration with Applications

**Environment variables**:

```bash
OPENAI_API_BASE=http://localhost:4000/v1
OPENAI_API_KEY=sk-your-master-key
```

**Python example**:

```python
import openai

openai.api_base = "http://localhost:4000/v1"
openai.api_key = "sk-your-master-key"

response = openai.ChatCompletion.create(
    model="llama-3.1-70b",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**Node.js example**:

```javascript
const OpenAI = require('openai');

const client = new OpenAI({
  baseURL: 'http://localhost:4000/v1',
  apiKey: 'sk-your-master-key',
});

const response = await client.chat.completions.create({
  model: 'llama-3.1-70b',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

## Production Setup

### 1. Enable SSL/TLS

Create SSL certificates:

```bash
# Generate self-signed cert (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout config/ssl/key.pem \
  -out config/ssl/cert.pem

# Or use Let's Encrypt (recommended)
certbot certonly --standalone -d litellm.yourdomain.com
```

Update `config/nginx.conf`:

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

### 2. Set Strong Passwords

```bash
# Generate secure passwords
LITELLM_MASTER_KEY=sk-prod-$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 24)
GRAFANA_PASSWORD=$(openssl rand -hex 16)
```

### 3. Configure Firewall

```bash
# Allow only necessary ports
ufw allow 4000/tcp  # LiteLLM Proxy
ufw allow 3001/tcp  # Grafana (internal only)
ufw deny 5432/tcp   # PostgreSQL (block external)
ufw deny 6379/tcp   # Redis (block external)
```

### 4. Enable Backup

Add to crontab:

```bash
# Backup daily at 2 AM
0 2 * * * cd /path/to/litellm-proxy && ./scripts/deploy.sh backup
```

### 5. Configure Monitoring Alerts

Update `config/config.yaml`:

```yaml
monitoring:
  alerts:
    - type: "cost"
      threshold: 0.80
      channels: ["email", "slack"]

    - type: "error_rate"
      threshold: 0.05
      channels: ["pagerduty"]
```

### 6. Set Up Log Rotation

Create `/etc/logrotate.d/litellm`:

```
/path/to/litellm-proxy/monitoring/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 root root
}
```

## Next Steps

1. **Create Tenants**: Use `./scripts/manage-tenants.sh create`
2. **Configure Budgets**: Edit `config/config.yaml`
3. **Set Up Alerts**: Configure Slack/email webhooks
4. **Monitor Usage**: Access Grafana dashboards
5. **Optimize Costs**: Review routing and caching strategies

## Support

- **Documentation**: See `/docs` directory
- **Troubleshooting**: See `TROUBLESHOOTING.md`
- **Health Check**: `curl http://localhost:4000/health`
- **Logs**: `pnpm logs`

## Related Guides

- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Cost Optimization Guide](COST-OPTIMIZATION.md)
- [Multi-Tenancy Guide](MULTI-TENANCY.md)
