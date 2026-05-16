# Nyra Nexus UI

Operator UI for the Project Nyra control plane. This app manages desired Nexus Router settings, MCP tool visibility, tool groups, fuzzy tool discovery, smart routing intent, and LiteLLM integration from a dedicated Next.js surface.

This belongs in `apps/nexusUI`, not inside `apps/webapp`, because it is an admin/control-plane console. The current Cloudflare desired/applied state exposes the UI at the Access-gated subdomain `nexus.projectnyra.com`, then links to it from the broker webapp. The raw Nexus Router API/MCP endpoint is `nexus-router.ratehunter.net`.

Current runtime placement: Grafbase Nexus and LiteLLM live on `oracle-vps` in `infra/hosts/oracle-vps/docker-compose.yml`. The orchestrator may run a CPU BitNet test service, but it should not become the canonical Nexus/LiteLLM host unless the architecture docs and host compose ownership are deliberately changed.

## What It Controls

- Fuzzy tool find: enable/disable fuzzy MCP tool lookup behavior and result limits.
- Tool activation: turn individual tools on/off.
- Tool groups: organize tools by category and disable whole groups.
- MCP servers: represent downstream Nexus MCP servers such as GitHub, Serena, OpenMemory, CRM, and workflow tooling.
- Smart routing: define desired model routing policy, fallback model, privacy mode, token forwarding, and allowlist behavior.
- LiteLLM integration: manage LiteLLM endpoint settings, virtual key mode, cache/retry/fallback switches, and model group intent.
- Environment toggles: track runtime variables and secret references without storing secret values.
- Config previews: generate Nexus TOML and LiteLLM YAML previews for deployment automation.

## Current Safety Boundary

The UI saves desired state to `config/nexus-ui.settings.json`. It does not directly restart Docker containers, write live Nexus config, or mutate LiteLLM in production unless a future apply adapter is explicitly added and `NEXUS_CONFIG_APPLY_ENABLED=true`.

That boundary is intentional. Nexus and LiteLLM config schemas change by version, and Project Nyra must not expose raw MCP internals or worker inference endpoints publicly.

## Local Development

```bash
pnpm install
pnpm --filter @nyra/nexus-ui dev
```

Default local URL:

```text
http://localhost:3016
```

Run validation:

```bash
pnpm --filter @nyra/nexus-ui typecheck
pnpm --filter @nyra/nexus-ui build
```

## Theme

This app uses the supplied TweakCN + shadcn theme in `app/globals.css` and the supplied Google font layout in `app/layout.tsx`.

To reapply the registry theme later:

```bash
pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/cmoo1mm4i000004l2amov6o38
```

Review generated files after running shadcn. Keep the UI on semantic tokens and avoid storing one-off colors in components.

## Environment

Copy `.env.example` if running outside the monorepo defaults.

```bash
cp .env.example .env.local
```

Important variables:

- `NEXUS_UI_SETTINGS_PATH`: JSON settings file written by the app.
- `NEXUS_BASE_URL`: Nexus Router base URL for status checks. Default: `http://oracle.trex-fiordland.ts.net:6000`.
- `LITELLM_BASE_URL`: LiteLLM proxy URL for status checks. Default: `http://oracle.trex-fiordland.ts.net:4000`.
- `LITELLM_MASTER_KEY`: optional secret used only for authenticated LiteLLM health/model calls.
- `NEXUS_CONFIG_APPLY_ENABLED`: must remain `false` until a reviewed deployment adapter exists.
- `NEXT_PUBLIC_WEBAPP_URL`: link target back to the broker webapp.

Never store actual provider tokens in `config/nexus-ui.settings.json`. Use secret references such as `GITHUB_TOKEN`, `LITELLM_MASTER_KEY`, `OPENAI_API_KEY`, and `ANTHROPIC_API_KEY`.

## Deployment Shape

Recommended:

1. Run this app as a standalone Next.js service on `oracle-vps` or another explicitly chosen admin host.
2. Point `NEXUS_BASE_URL` and `LITELLM_BASE_URL` at Oracle-local Nexus/LiteLLM.
3. Expose the UI through a Cloudflared tunnel as `nexus.projectnyra.com`.
4. Put Cloudflare Access in front of the hostname.
5. Link from `apps/webapp` with `NEXT_PUBLIC_NEXUS_UI_URL=https://nexus.projectnyra.com`.

Do not expose worker vLLM, Ollama, Postgres, Redis, FalkorDB, or raw unauthenticated MCP internals.

## Related Docs

- `docs/SPEC.md`: product and technical specification.
- `docs/BUILD_GUIDE.md`: implementation and deployment guide.
- `PROMPT.md`: handoff prompt for a future agent opening this folder with no context.
