# Nexus UI Build Guide

## 1. Install Dependencies

From the repository root:

```bash
pnpm install
```

## 2. Configure Local Environment

From `apps/nexusUI`:

```bash
cp .env.example .env.local
```

Defaults assume local tunnels or local services:

```text
NEXUS_BASE_URL=http://127.0.0.1:6000
LITELLM_BASE_URL=http://127.0.0.1:4000
```

Leave `NEXUS_CONFIG_APPLY_ENABLED=false` unless an apply adapter has been implemented and reviewed.

## 3. Run Locally

From the repository root:

```bash
pnpm --filter @nyra/nexus-ui dev
```

Open:

```text
http://localhost:3016
```

## 4. Validate

```bash
pnpm --filter @nyra/nexus-ui typecheck
pnpm --filter @nyra/nexus-ui build
```

## 5. Deploy On Orchestrator

Recommended Docker/service shape:

```bash
pnpm --filter @nyra/nexus-ui build
pnpm --filter @nyra/nexus-ui start
```

Bind the service privately on the orchestrator, then expose it through Cloudflared with Cloudflare Access.

Suggested hostname:

```text
nexus.ratehunter.net
```

## 6. Cloudflared Ingress

Add an ingress rule on the orchestrator tunnel that points to the UI service port:

```yaml
- hostname: nexus.ratehunter.net
  service: http://localhost:3016
```

Keep Cloudflare Access required for this hostname. This is an admin surface.

## 7. Link From Webapp

Set this in the webapp deployment environment:

```text
NEXT_PUBLIC_NEXUS_UI_URL=https://nexus.ratehunter.net
```

The webapp header reads this variable and renders the Nexus navigation link.

## 8. Future Apply Adapter

The next implementation step is an explicit apply adapter:

1. Read `config/nexus-ui.settings.json`.
2. Generate version-specific Nexus TOML and LiteLLM YAML.
3. Write rendered config to a staging path.
4. Validate with the target Nexus/LiteLLM versions.
5. Restart or reload services through orchestrator-owned automation.
6. Record the action in logs.

The adapter must refuse to run unless:

```text
NEXUS_CONFIG_APPLY_ENABLED=true
```

It must never serialize secret values into config previews, logs, or JSON state.
