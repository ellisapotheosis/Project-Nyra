# nyra-model-mcp

Thin MCP-forwarder service for local model routing tests.

Run:
```bash
docker build -t nyra-model-mcp infra/mcp/nyra_mcp
docker run --rm -p 8081:8081 nyra-model-mcp
```
