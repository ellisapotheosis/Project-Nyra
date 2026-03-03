# Services Folder Build Prompt

Use this folder for deployable backend services and MCP servers.

## Rules
- Service logic belongs here; orchestration belongs in `infra/`.
- Every service should expose `/health`.
- MCP servers should live in `services/*-mcp` and be registered in Nexus config.

## Required per service
- `README.md` (ports, env vars, dependencies)
- `Dockerfile`
- startup command and healthcheck guidance
