# Nexus Router + LiteLLM + OpenRouter

## Goal
One stable endpoint for:
- MCP tools (OpenMemory, Graphiti, Serena, etc)
- LLM calls (OpenAI-compatible + Anthropic-compatible)

## Where it is configured
- `nyra-stack/configs/nexus/nexus.toml` — tool + llm gateway
- `nyra-stack/configs/litellm/config.yaml` — model routing + providers

## Typical call paths
- MCP: `http://nexus:6000/mcp`
- OpenAI-compatible models: `http://nexus:6000/llm/openai/v1`
- Anthropic: `http://nexus:6000/llm/anthropic`

## Adding a new MCP server
1) Add service to docker-compose (or run elsewhere)
2) Add to `nexus.toml`:
```toml
[mcp.servers.serena]
url = "http://serena_mcp:8000/mcp"
```
3) Restart nexus:
```bash
docker compose restart nexus
```
