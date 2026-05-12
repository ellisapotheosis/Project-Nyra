# OpenClaw + Mem0 Cloud + Kyutai Unmute (MVP overlays)

This is an additive cloud MVP with split overlays for core, voice, UI proxy, and ops runtime.

## Components

- Core: `infra/compose/openclaw.compose.yml`
- Voice: `infra/compose/openclaw.voice.compose.yml`
- UI proxy: `infra/compose/openclaw.ui.compose.yml`
- Ops runtime: `infra/compose/openclaw.ops.compose.yml`

## Config and env files

- OpenClaw config: `infra/openclaw/openclaw.json`
- Core env: `infra/env/openclaw.env.example`
- Voice env: `infra/env/openclaw.voice.env.example`
- UI env: `infra/env/openclaw.ui.env.example`

## Quick start (recommended)

```bash
cp infra/env/openclaw.env.example infra/env/openclaw.env
cp infra/env/openclaw.voice.env.example infra/env/openclaw.voice.env
cp infra/env/openclaw.ui.env.example infra/env/openclaw.ui.env

# Optional toggles for startup helper:
# BOOT_OPENCLAW_VOICE=true
# BOOT_OPENCLAW_UI_PROXY=true

bash infra/openclaw/scripts/up.sh
```

`up.sh` will:

- validate required env values,
- auto-create data directories,
- auto-build OpenClaw image if missing,
- start core overlay (+ optional voice/UI).

## Manual startup (explicit overlays)

```bash
set -a; source infra/env/openclaw.env; set +a

docker build -f infra/openclaw/Dockerfile -t nyra/openclaw-mvp:local .

docker compose \
  -f infra/docker-compose.yml \
  -f infra/compose/openclaw.compose.yml \
  --profile openclaw up -d openclaw-mvp
```

Voice overlay (optional):

```bash
set -a; source infra/env/openclaw.voice.env; set +a

docker compose \
  -f infra/docker-compose.yml \
  -f infra/compose/openclaw.voice.compose.yml \
  --profile voice up -d kyutai-unmute-cloud
```

UI proxy overlay (optional):

```bash
set -a; source infra/env/openclaw.ui.env; set +a

docker compose \
  -f infra/docker-compose.yml \
  -f infra/compose/openclaw.compose.yml \
  -f infra/compose/openclaw.ui.compose.yml \
  --profile openclaw --profile openclaw-ui up -d openclaw-mvp openclaw-ui-proxy
```

## Operational commands

```bash
bash infra/openclaw/scripts/doctor.sh
bash infra/openclaw/scripts/status.sh
bash infra/openclaw/scripts/down.sh
```

## Future migration to local inference

When ready to move from direct cloud provider to LiteLLM:

1. Set `OPENCLAW_OPENAI_BASE_URL=http://litellm:4000/v1` in `infra/env/openclaw.env`.
2. Keep provider compatible (`OPENCLAW_PROVIDER=openai`).
3. Route model provider credentials only through LiteLLM.
4. Keep overlay topology unchanged to minimize migration risk.

## Chat UI integration strategy

Two options:

1. Reverse proxy route `/tools/openclaw/` (already included as baseline).
2. Preferred long-term: internal admin chat panel calling backend proxy endpoint with existing auth context.
