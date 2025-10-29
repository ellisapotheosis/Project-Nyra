# Project Nyra — Warp & Gemini Bootstrap (v2)

This overlay gives you **instant Gemini CLI + (optional) Gemini Flow**, multi-provider routing (LiteLLM → Vertex Gemini + Anthropic + OpenAI + Ollama), MCP servers (Serena, Codanna, Playwright, Filesystem), MCPO bridge, and VS Code/Claude Code config. OpenHands is no more—**Warp 2.0 Agents** or your terminal will drive.

## TL;DR
- mac/linux: `./scripts/run-all.sh`
- windows: `.\scripts\run-all.ps1`
Then run `gemini` and log in.

## What’s inside
- **Gemini CLI** autoconfigured with **MCP** (`~/.gemini/settings.json`).
- **Gemini Flow** installed globally (community port of claude-flow).
- **LiteLLM** proxy on `http://localhost:4000` with Vertex aliasing (two projects).
- **Env modes**: `cheap-gemini` (default), `balanced-mix`, `offline-ollama`.
- **VS Code** tasks & MCP config; **Claude Code** extension compatibility.
- **MCPO** running on `http://localhost:8001` if you want Open WebUI.

## Authenticate Gemini CLI
Pick one (see GitHub README for details):
1. **Login with Google (OAuth)** — just run `gemini` and choose Login with Google.
2. **Vertex** — `export GOOGLE_API_KEY=... && export GOOGLE_GENAI_USE_VERTEXAI=true && gemini`
3. **AI Studio** — `export GEMINI_API_KEY=... && gemini`

## Quick sanity checks
```bash
gemini --version
gemini -p "Say hello from Project Nyra."
npx @clduab11/gemini-flow --help
curl -H "Authorization: Bearer nyra-dev" http://localhost:4000/v1/models | jq . | head -n 20
```
