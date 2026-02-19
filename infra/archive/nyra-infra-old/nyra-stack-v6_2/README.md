# NYRA Stack — v6.2 (AGENTHUB + Infisical)

- Orchestrator: MetaMCP, Open WebUI, Postgres, Redis, Caddy, Cloudflared, Infisical MCP, optional LiteLLM
- Workers: GPU (Ollama)
- Secrets: Infisical CLI push + compose-time injection; Infisical MCP
- DX: DevContainer, WSL helpers, Windows/Bash scripts
- Profiles: orchestration, ui, secrets, edge, memory, observability, llm
- Integrations auto-start: drop `docker-compose*.yml` in `integrations/` (+ auto-extract `.7z` if 7z exists)
- CI: zip artifact workflow

See `docs/MASTER_STEPS_6_2.md`.
