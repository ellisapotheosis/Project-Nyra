# Open WebUI Tool Stack (Standalone)

**Purpose**: Run Open WebUI as an independent dev/admin UI, separate from the main Nyra orchestrator.

## Quick Start

```powershell
cd infra/tools/open-webui

# Start Open WebUI + Ollama (optional)
docker-compose up -d

# Stop stack
docker-compose down
```

Services:
- `nyra-open-webui` – Web UI on http://localhost:3002
- `nyra-ollama` – Local model backend on http://localhost:11434

## Nexus Router Integration (Optional)

By default, Open WebUI is configured to talk to Nexus Router via an OpenAI-compatible endpoint:

```env
OPENAI_API_BASE_URL=http://host.docker.internal:6000/llm/openai/v1
OPENAI_API_KEY=dummy-key
```

Start Nexus separately (e.g. `make nexus-start`) and select the OpenAI provider inside Open WebUI.

## Notes

- This stack is **independent** of the orchestration compose files.
- Does **not** require any Nyra-specific containers to run.
- Optional: You can disable Ollama by removing the `ollama` service and `OLLAMA_BASE_URL` env.