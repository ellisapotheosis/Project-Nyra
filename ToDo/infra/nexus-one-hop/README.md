# One-hop Nexus: Claude + Gemini cost tiers, MCP aggregation, tool search

This bundle runs **Nexus** as a single deployment that provides:

- **LLM gateway**: OpenAI-compatible and Anthropic-compatible endpoints
- **MCP proxy/aggregator**: one MCP endpoint that proxies multiple MCP servers
- **Tool search**: Nexus indexes tools and supports fuzzy/natural-language tool discovery

## Prereqs

- Docker + Docker Compose
- API keys:
  - `ANTHROPIC_API_KEY`
  - `GOOGLE_API_KEY`

Optional:
- `GITHUB_TOKEN` if you enable the example GitHub MCP upstream in the config.

## Quick start

1) Copy the env file and fill keys:

- Copy `.env.example` → `.env`
- Edit `.env` and set your keys

2) Start:

```bash
cd nexus-one-hop
docker compose up -d
```

3) Smoke test:

```bash
curl http://localhost:6000/llm/openai/v1/models | jq '.data[].id'
```

## Endpoints

- **OpenAI-compatible**:
  - Base URL: `http://localhost:6000/llm/openai/v1`
  - Models: `GET /models`
  - Chat completions: `POST /chat/completions`

- **Anthropic-compatible**:
  - Base URL: `http://localhost:6000/llm/anthropic`
  - Messages: `POST /v1/messages`

- **MCP aggregator**:
  - URL: `http://localhost:6000/mcp`

- **Prometheus metrics**:
  - URL: `http://localhost:6011/metrics`

## Cost-biased usage pattern (no 2nd hop)

Nexus routes to providers **based on the model name** `{provider_instance}/{model_id}`.
It does not (today) auto-pick “cheapest that works” across providers.

So we create **stable aliases** that you can treat as “tiers”:

### Claude (Anthropic provider instance name: `claude`)
- `claude/economy`  → `claude-fast`
- `claude/standard` → `claude-sonnet`
- `claude/premium`  → `claude-opus`

### Gemini (provider instance name: `google`)
- `google/economy` → `gemini-cheap`
- `google/premium` → `gemini-pro`

Your app/agent chooses the tier. That’s how you get cost control without LiteLLM/OpenRouter.

- `claude/premium`  → `claude-3-opus-20240229`

### Gemini (Google provider instance name: `google`)
- `google/economy` → `gemini-1.5-flash`
- `google/premium` → `gemini-1.5-pro`

### Example: OpenAI-compatible request (Claude economy)

```bash
curl -s http://localhost:6000/llm/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude/economy",
    "messages": [{"role": "user", "content": "Give me 3 bullet points about Kubernetes."}]
  }' | jq
```

### Example: OpenAI-compatible request (Gemini economy)

```bash
curl -s http://localhost:6000/llm/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/economy",
    "messages": [{"role": "user", "content": "Summarize this in 1 sentence"}]
  }' | jq
```

## Hard-disable expensive models

If you want to **prevent** accidental premium usage, remove that model (or its alias) from `config/nexus.toml`.
Unconfigured models 404.

## Running STDIO MCP servers in Docker (optional)

Many MCP servers are `cmd = [...]` STDIO servers (Node/Python). The stock `ghcr.io/grafbase/nexus` image may not include Node/Python.

Two patterns:

1) **Run remote HTTP MCP servers** (best for containers). Point Nexus at their `url = "http://.../mcp"`.
2) **Build an extended Nexus image** that installs Node/Python, then use `cmd = [...]`.

If you want pattern (2), create a Dockerfile like:

```Dockerfile
FROM ghcr.io/grafbase/nexus:stable
# Install node/python here depending on base ...
```

