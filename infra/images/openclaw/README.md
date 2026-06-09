# OpenClaw Cloud MVP for Project Nyra

This directory is the canonical OpenClaw integration path for the current Nyra rollout:

- cloud-backed OpenClaw core,
- Mem0 cloud plugin,
- optional Kyutai Unmute voice overlay,
- optional UI reverse-proxy overlay,
- future routing hooks for LiteLLM, Nexus, MCP, and Tailscale workers.

The repo also contains an older OpenClaw gateway/CLI path. Do not treat that path as the default for this rollout unless you are explicitly doing a later routing migration.

## Canonical files

- `infra/compose/openclaw.compose.yml`
- `infra/compose/openclaw.voice.compose.yml`
- `infra/compose/openclaw.ui.compose.yml`
- `infra/compose/openclaw.ops.compose.yml`
- `infra/env/openclaw.env.example`
- `infra/env/openclaw.voice.env.example`
- `infra/env/openclaw.ui.env.example`
- `infra/openclaw/openclaw.json`
- `infra/openclaw/Dockerfile`
- `infra/openclaw/scripts/*.sh`

## What this overlay does

- Runs OpenClaw as a profile-gated internal tool under `openclaw`.
- Persists OpenClaw state under `OPENCLAW_DATA_DIR`.
- Loads OpenClaw config from `OPENCLAW_CONFIG_PATH`.
- Enables the `@mem0/openclaw-mem0` plugin in Mem0 cloud/platform mode.
- Keeps provider credentials in env vars instead of repo files.
- Leaves voice and UI exposure disabled unless their profiles are enabled.

## Required env vars

Core MVP:

```dotenv
OPENAI_API_KEY=
MEM0_API_KEY=
OPENCLAW_GATEWAY_TOKEN=
OPENCLAW_PORT=3401
OPENCLAW_CONFIG_PATH=./openclaw/openclaw.json
OPENCLAW_DATA_DIR=./data/openclaw
```

Optional now, useful later:

```dotenv
OPENROUTER_API_KEY=
LITELLM_MASTER_KEY=
OPENCLAW_PUBLIC_BASE_URL=
NYRA_CHAT_INTERNAL_API_BASE_URL=
NEXUS_MCP_URL=
UNMUTE_PUBLIC_BASE_URL=
TELEGRAM_BOT_TOKEN=
DISCORD_BOT_TOKEN=
TWENTY_API_KEY=
N8N_API_KEY=
ACTIVEPIECES_API_KEY=
INFI_CLIENT_ID=
INFI_CLIENT_SECRET=
INFI_PROJECT_ID=
```

## Start OpenClaw

Recommended:

```bash
cp infra/env/openclaw.env.example infra/env/openclaw.env
bash infra/openclaw/scripts/doctor.sh
bash infra/openclaw/scripts/up.sh
```

Core overlay only:

```bash
docker compose \
  -f infra/docker-compose.yml \
  -f infra/compose/openclaw.compose.yml \
  --profile openclaw up -d openclaw-mvp
```

With optional voice:

```bash
bash infra/openclaw/scripts/up.sh --with-voice
```

With optional reverse proxy:

```bash
bash infra/openclaw/scripts/up.sh --with-ui
```

## Mem0 cloud mode

`infra/openclaw/openclaw.json` enables the Mem0 plugin in platform mode:

- `enabled: true`
- `mode: "platform"`
- `apiKey: "${MEM0_API_KEY}"`

No local vector database is required for this path.

## Security defaults

- Sandbox enabled by default.
- Deny-by-default tool policy.
- Internal-only host port binding (`127.0.0.1`).
- Secrets supplied through env files or secret injection tooling, never hardcoded in config.
- Optional UI and voice overlays remain disabled unless explicitly started.

## Future upgrades

This MVP can later be extended to:

- LiteLLM or OpenRouter as the main routing layer,
- Nexus/MCP tool calling,
- Tailscale-connected local GPU workers,
- an internal admin chat route and operator console,
- channel automation through Telegram, Discord, WhatsApp, n8n, and Activepieces.

See:

- `infra/docs/OPENCLAW_INTEGRATION_PLAN.md`
- `infra/docs/OPENCLAW_OPERATIONS.md`
- `infra/docs/OPENCLAW_CHAT_UI_PLAN.md`
- `infra/docs/OPENCLAW_FUTURE_ROUTING.md`
