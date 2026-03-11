# Infisical injection patterns (Nyra)

## Pattern A (recommended for Windows): export → compose
1. Export env vars to a generated dotenv file:
   `powershell -ExecutionPolicy Bypass -File scripts/infisical/export_env_from_infisical.ps1 -EnvName dev`

2. Start docker compose with that env file:
   `powershell -ExecutionPolicy Bypass -File scripts/infisical/compose_up_with_infisical.ps1 -EnvName dev -ComposeFile infra\docker\docker-compose.dev.yml`

## Pattern B: run → command injection
`infisical run -- docker compose -f infra/docker/docker-compose.dev.yml up -d`

Use Pattern B for single-process apps. Pattern A is better when multiple tools need the same env snapshot.

References:
- Infisical CLI export docs
- Infisical CLI run docs
