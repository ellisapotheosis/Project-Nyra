# Implementation Guide (Windows 11)

Prereqs
- Docker Desktop (WSL2)
- Copy `.env.example` → `.env` (fill OPENAI_API_KEY, NEO4J_PASSWORD, etc.)

Start
- Double-click `RUN_ME.bat` or:
  powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1

Verify
- Qdrant: http://localhost:6333
- Neo4j: http://localhost:7474
- Graphiti MCP (SSE): http://localhost:7459/sse
- OpenMemory UI/API: http://localhost:3000 / http://localhost:8765/docs
- MetaMCP UI: http://localhost:12008

Clients
- Use clients/claude_desktop_config.json / clients/cursor_mcp.json
- Endpoint: http://localhost:12008/metamcp/nyra-core/sse
- API key: nyra-local-key (deployment/metamcp/.env)
