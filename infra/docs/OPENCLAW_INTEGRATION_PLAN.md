# OpenClaw Integration Plan

## Canonical rollout path

Use the cloud-MVP overlay path as the canonical implementation:

- `infra/compose/openclaw.compose.yml`
- `infra/compose/openclaw.voice.compose.yml`
- `infra/compose/openclaw.ui.compose.yml`
- `infra/compose/openclaw.ops.compose.yml`
- `infra/openclaw/openclaw.json`
- `infra/openclaw/Dockerfile`
- `infra/openclaw/scripts/*.sh`

The repo also contains an older `openclaw.profile.yml` and `infra/scripts/openclaw/*` path. Leave that path alone unless you are explicitly migrating to a gateway/CLI-first topology later.

## Architecture goals

- Keep `infra/docker-compose.yml` stable.
- Use additive overlays for controlled rollout.
- Run the MVP cloud-first now.
- Preserve a clean migration path to LiteLLM, Nexus, MCP, and local workers later.

## Overlay strategy

Use multiple overlay compose files, each gated by profiles:

- `openclaw.compose.yml`: core cloud MVP
- `openclaw.voice.compose.yml`: Kyutai Unmute voice overlay
- `openclaw.ui.compose.yml`: internal reverse-proxy/UI bridge
- `openclaw.ops.compose.yml`: ops-oriented runtime/container

This is better than a single compose blob because it:

- matches existing Nyra infra patterns,
- keeps dormant features off by default,
- avoids rewriting core infra,
- keeps review diffs localized.

## Current defaults

- Provider: direct OpenAI-compatible cloud endpoint
- Memory: `@mem0/openclaw-mem0` in Mem0 cloud/platform mode
- Tool route: Nexus MCP via `NEXUS_MCP_URL`
- Persistence root: `OPENCLAW_DATA_DIR`
- Config path: `OPENCLAW_CONFIG_PATH`
- Host exposure: loopback only by default

## Startup flow

Recommended:

```bash
cp infra/env/openclaw.env.example infra/env/openclaw.env
bash infra/openclaw/scripts/doctor.sh
bash infra/openclaw/scripts/up.sh
```

Optional overlays:

```bash
bash infra/openclaw/scripts/up.sh --with-voice
bash infra/openclaw/scripts/up.sh --with-ui
bash infra/openclaw/scripts/up.sh --with-voice --with-ui --force-build
```

## Validation and safety checks

`doctor.sh` validates:

- command availability,
- env file presence,
- required secrets,
- config file existence,
- JSON/YAML parse validity,
- compose merge validity when Docker is available.

`up.sh` enforces:

- required key presence,
- deterministic image build behavior,
- creation of persistence paths,
- running-state wait with timeout.

## Reverse proxy and UI direction

Short term:

- use `infra/compose/openclaw.ui.compose.yml` to expose `/tools/openclaw` safely behind an internal proxy.

Preferred medium term:

- move to a server-side proxied internal chat page inside the admin app,
- keep browser traffic away from raw provider credentials,
- use server-side auth/session context.

## Migration to LiteLLM / OpenRouter

No topology rewrite required.

Set in `infra/env/openclaw.env`:

```dotenv
OPENCLAW_PROVIDER=openai
OPENCLAW_OPENAI_BASE_URL=http://litellm:4000/v1
```

Then manage provider credentials on the LiteLLM side.

## Future switch controls

- `BOOT_OPENCLAW_VOICE=true|false`
- `BOOT_OPENCLAW_UI_PROXY=true|false`
- `OPENCLAW_FORCE_BUILD=true|false`
- `OPENCLAW_COMPOSE_VALIDATE=true|false`
