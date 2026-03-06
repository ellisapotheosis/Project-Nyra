# OpenClaw Operator Plane for Project Nyra

OpenClaw is integrated as a **controlled ops bot** for mortgage CRM workflows.

## Security Defaults

- Sandbox is enabled by default (`OPENCLAW_SANDBOX_ENABLED=true`).
- Outbound HTTP is restricted by `OPENCLAW_OUTBOUND_HTTP_ALLOWLIST`.
- Skills are treated as untrusted code; run `skills_scan.sh` before installs.
- No provider API keys are stored in OpenClaw config; use env refs (`env:...`).
- Only curated skills are installed from `infra/openclaw/skills-curated.txt`.

## Runtime Topology

- OpenClaw model requests -> LiteLLM (`http://litellm:4000/v1`)
- OpenClaw tools -> Nexus MCP (`http://nexus-router:8080/mcp`)
- Nexus routes to Nyra MCP (`http://nyra-mcp:3333/mcp`)

## Files

- `infra/compose/openclaw.profile.yml`: OpenClaw gateway + CLI services.
- `infra/openclaw/Dockerfile`: reproducible fallback image strategy with browser + apt packages.
- `infra/openclaw/skills-curated.txt`: approved skill slugs only.
- `infra/scripts/openclaw/*.sh`: onboarding, channels, scan/install/update, backups.
- `infra/openclaw/scan-report.txt`: output from latest skills scan.

## Start OpenClaw

```bash
docker compose -f infra/compose/nyra.compose.yaml --profile openclaw up -d openclaw-gateway openclaw-cli
```

## Onboarding (secret-ref mode)

```bash
bash infra/scripts/openclaw/onboard.sh
```

This writes `infra/data/openclaw/config/config.json` with:
- LiteLLM endpoint
- `apiKeyRef: env:LITELLM_MASTER_KEY`
- gateway token reference (`env:OPENCLAW_GATEWAY_TOKEN`)
- Nexus + Nyra MCP endpoints

## Channel setup

```bash
bash infra/scripts/openclaw/channels.sh telegram
bash infra/scripts/openclaw/channels.sh discord
bash infra/scripts/openclaw/channels.sh whatsapp
```

WhatsApp flow is QR-based and avoids committing token material.

## Curated skills workflow

1. Scan first:
   ```bash
   bash infra/scripts/openclaw/skills_scan.sh
   ```
2. Install curated list only:
   ```bash
   bash infra/scripts/openclaw/skills_install_curated.sh
   ```
3. Update installed curated skills:
   ```bash
   bash infra/scripts/openclaw/skills_update.sh
   ```

If a slug mismatch is found, the installer resolves via `clawhub search` and writes `skills-curated-resolved.txt`. If unresolved, installation aborts.

## Operator patterns

### 1) STOP/Reply Kill Switch

- Import `infra/n8n-workflows/stop-reply-kill-switch.json` into n8n.
- Expose webhook `/webhook/campaign/stop-reply`.
- Input payload (minimum):
  - `contactId`
  - `replyText`
- For STOP-like replies, workflow patches Twenty contact with `campaignPaused=true`.

### 2) Lead Ingestion

- OpenClaw channel receives inbound lead.
- OpenClaw calls Nexus MCP tool endpoint.
- Nyra MCP triggers n8n workflow (`mortgage-lead-intake`) to parse, enrich, and upsert in Twenty.

### 3) Observability

- Route OpenClaw container logs with Docker default logging; Loki already tails docker logs in stack observability profile.
- If OpenClaw adds `/metrics`, add it to `infra/configs/prometheus/prometheus.yml` scrape targets.

### 4) Backups (restic)

```bash
RESTIC_REPOSITORY=... RESTIC_PASSWORD=... bash infra/scripts/openclaw/backup_restic.sh
```

Script performs:
- postgres logical dump (`pg_dump`)
- backs up OpenClaw config + workspace
- retention policy (`7 daily / 4 weekly / 6 monthly`)

### 5) Infisical plan

Recommended secret injection pattern:
- keep `infra/env/nyra.env` non-secret where possible
- inject `LITELLM_MASTER_KEY`, `OPENCLAW_GATEWAY_TOKEN`, channel tokens at runtime via Infisical CLI/agent
- use `env:SECRET_NAME` refs in OpenClaw config, not plaintext values
