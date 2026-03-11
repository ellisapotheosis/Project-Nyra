# OpenClaw Integration Plan (Additive)

## Architecture goals

- Keep main stack stable (`infra/docker-compose.yml` unchanged).
- Use additive overlays for controlled rollout.
- Enable cloud-first MVP now, LiteLLM migration later via env flips.

## Overlay layout

- `infra/compose/openclaw.compose.yml` (core)
- `infra/compose/openclaw.voice.compose.yml` (voice)
- `infra/compose/openclaw.ui.compose.yml` (UI proxy)
- `infra/compose/openclaw.ops.compose.yml` (ops runtime)

## Current defaults

- OpenClaw provider: OpenAI-compatible cloud endpoint.
- Memory plugin: `@mem0/openclaw-mem0` in platform mode.
- MCP route: Nexus endpoint (`NEXUS_MCP_URL`).
- Session persistence:
  - `/home/node/.openclaw`
  - `/home/node/.openclaw/sessions`

## Startup flow

### One-command lifecycle (recommended)

```bash
bash infra/openclaw/scripts/doctor.sh
bash infra/openclaw/scripts/up.sh
```

Optional flags:

```bash
bash infra/openclaw/scripts/up.sh --with-voice --with-ui
bash infra/openclaw/scripts/up.sh --core-only --force-build
```

### Explicit overlay startup

```bash
set -a; source infra/env/openclaw.env; set +a

docker compose -f infra/docker-compose.yml -f infra/compose/openclaw.compose.yml --profile openclaw up -d
```

## Validation and safety checks

- `doctor.sh` validates:
  - required command availability,
  - env file presence,
  - required non-placeholder keys,
  - JSON/YAML parse validity,
  - compose merge validation when docker is available.

- `up.sh` enforces:
  - required key presence,
  - deterministic image build behavior,
  - running-state wait with timeout.

## Migration to LiteLLM / OpenRouter

No topology change required.

Set in `infra/env/openclaw.env`:

```dotenv
OPENCLAW_PROVIDER=openai
OPENCLAW_OPENAI_BASE_URL=http://litellm:4000/v1
```

Then configure provider-specific keys on LiteLLM side.

## Future switch controls

Use env toggles only:

- `BOOT_OPENCLAW_VOICE=true|false`
- `BOOT_OPENCLAW_UI_PROXY=true|false`
- `OPENCLAW_FORCE_BUILD=true|false`
- `OPENCLAW_COMPOSE_VALIDATE=true|false`
