# Nexus integration snippets (Grafbase/Nexus)

## Docker Compose service snippet
```yaml
nexus:
  build:
    context: ./nexus
    dockerfile: Dockerfile
  image: nyra/nexus:local
  ports:
    - "${NEXUS_PORT:-6000}:6000"
  environment:
    NEXUS_REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
    LITELLM_MASTER_KEY: ${LITELLM_MASTER_KEY}
    OPENAI_API_KEY: ${OPENAI_API_KEY:-}
    ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:-}
    GITHUB_TOKEN: ${GITHUB_TOKEN:-}
  volumes:
    - ./nexus/nexus.toml:/etc/nexus.toml:ro
    - /var/run/docker.sock:/var/run/docker.sock
    - ${NEXUS_PROJECTS_DIR:-../..}:/projects
```

## Client endpoints
- MCP: `http://orchestrator.tail-net.ts.net:6000/mcp`
- OpenAI-compatible LLM: `http://orchestrator.tail-net.ts.net:6000/llm/openai/v1`
- Anthropic-compatible LLM: `http://orchestrator.tail-net.ts.net:6000/llm/anthropic`

## LiteLLM upstream
Nexus talks to `http://litellm:4000/v1` internally. LiteLLM routes to the workers:
- 5090 vLLM
- 3090 Ti vLLM
- 3060 Ollama
