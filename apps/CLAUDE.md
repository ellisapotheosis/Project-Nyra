# Apps Folder Build Prompt

Use this folder for user-facing applications only.

## Rules
- Each app must have its own README and run/build scripts.
- App API calls must go through Nexus Router unless explicitly documented.
- Chat UI integrations (Moltbot/OpenWebUI) belong here, not in `infra/`.

## Required per app
- `README.md` (setup, env vars, health endpoint)
- `Dockerfile` (if deployable)
- route map and dependency list
