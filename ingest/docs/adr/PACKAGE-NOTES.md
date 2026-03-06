# Package Notes — master_nyra_package_maximalist_plus

This build extends the base maximalist package with:
- Modular orchestrator compose stack
- Docker Desktop + WSL2-focused worker deployments
- RTX 5090 source-build vLLM+LMCache worker
- RTX 3090 Ti vLLM+LMCache worker
- RTX 3060 Ollama worker
- Nexus single-entrypoint LLM+MCP proxy configs
- LiteLLM routing to worker endpoints from ports.txt Tailscale IPs
- Archon split-container placeholders (6 services)
- Claude Flow maximal module docker setup
- OpenClaw/ClawHub/MoltBot wrappers + MCP adapter placeholder
- Raw upload ingest copies for audit

## First start
1. Edit env files under `infra/configs/env/`
2. Start workers
3. Start orchestrator (`cd infra/orchestrator && make up`)
4. Point your agents/apps to Nexus (`:6000`)
