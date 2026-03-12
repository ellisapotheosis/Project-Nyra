# OpenClaw Operations

## Canonical operational path

Use the files under `infra/openclaw/` and `infra/compose/openclaw*.compose.yml` as the primary operational path for the current rollout.

Do not mix that path with the older `infra/scripts/openclaw/*` and `infra/compose/openclaw.profile.yml` path unless you are intentionally doing a later gateway/CLI migration.

## Operational lifecycle scripts

- Start: `bash infra/openclaw/scripts/up.sh`
- Stop: `bash infra/openclaw/scripts/down.sh`
- Status: `bash infra/openclaw/scripts/status.sh`
- Preflight doctor: `bash infra/openclaw/scripts/doctor.sh`

`up.sh` safety behavior:
- Ensures env files exist (copies examples if missing).
- Validates required keys (`OPENAI_API_KEY`, `MEM0_API_KEY`).
- Creates persistence paths:
  - `OPENCLAW_DATA_DIR`
  - `OPENCLAW_DATA_DIR/sessions`
- Auto-builds image when missing or when `OPENCLAW_FORCE_BUILD=true`.
- Supports optional overlays:
  - `BOOT_OPENCLAW_VOICE=true`
  - `BOOT_OPENCLAW_UI_PROXY=true`

## Webhook ingress pattern (future channels)

- Inbound webhook target: `${OPENCLAW_WEBHOOK_INGRESS_PATH}`.
- Recommended ingress path in app/router layer: `/webhooks/openclaw/inbound`.
- Flow:
  1. Channel provider sends webhook to n8n/Activepieces.
  2. Workflow verifies signature and normalizes payload.
  3. Workflow forwards to OpenClaw internal API route.
- Normalized payload fields:
  - `channel`
  - `sender_id`
  - `thread_id`
  - `message`
  - `metadata`

## Memory split policy

Use Mem0 namespaces to avoid cross-contamination:

- Conversational memory (`nyra-conversation`)
  - short-lived dialogue context.
- Operational memory (`nyra-ops`)
  - runbooks, execution outcomes, troubleshooting signals.
- CRM/customer memory (`nyra-crm`)
  - lead/customer state references and CRM-safe derived facts.

## MCP routing policy

- Default MCP route: `${NEXUS_MCP_URL}`.
- Keep direct tool access disabled by default.
- Recommended control pattern:
  - OpenClaw -> Nexus MCP -> Nyra MCP/tools.
  - Enforce authorization and auditability at Nexus layer.

## Troubleshooting matrix

1. **OpenClaw container fails to start**
   - Run `bash infra/openclaw/scripts/doctor.sh`.
   - Confirm required env values are present.
   - Force rebuild image:
     ```bash
     OPENCLAW_FORCE_BUILD=true bash infra/openclaw/scripts/up.sh --force-build
     ```

2. **UI proxy loads but upstream fails**
   - Check core service status:
     ```bash
     bash infra/openclaw/scripts/status.sh
     ```
   - Verify proxy path and upstream (`/tools/openclaw/` -> `openclaw-mvp:3400`).

3. **Voice overlay does not start**
   - Verify `UNMUTE_OPENAI_API_KEY` in `infra/env/openclaw.voice.env`.
   - Start with explicit voice flag:
     ```bash
     bash infra/openclaw/scripts/up.sh --with-voice
     ```

4. **Config path or persistence path drift**
   - Verify:
     - `OPENCLAW_CONFIG_PATH`
     - `OPENCLAW_DATA_DIR`
     - `OPENCLAW_PORT`
   - Re-run:
     ```bash
     bash infra/openclaw/scripts/doctor.sh
     ```

## Observability notes

- Current overlays use Docker logging and restart policies.
- Keep OpenClaw loopback-bound unless a reverse proxy or internal ingress layer is explicitly in front of it.
- If a stable metrics endpoint appears later, add it to Prometheus rather than exposing raw service ports broadly.

## Backup guidance

- Back up the directory referenced by `OPENCLAW_DATA_DIR`.
- Back up env files out of band; do not commit filled secrets.
- If enabling channel workflows later, back up the related webhook and workflow configs alongside OpenClaw state.
