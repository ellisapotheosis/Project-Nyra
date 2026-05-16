# Agent Prompt: Nyra Nexus UI

You are working in `apps/nexusUI`, the Project Nyra operator console for Nexus Router and LiteLLM configuration.

## Mission

Build and maintain a production-quality admin UI that lets Nyra operators manage desired control-plane settings:

- fuzzy MCP tool find
- individual tool activation
- tool groups and category-level activation
- downstream MCP server visibility
- smart model routing intent for Nexus Router
- LiteLLM integration settings
- runtime environment variables and secret references
- generated config previews for Nexus TOML and LiteLLM YAML

## Architecture Rules

- This app is a separate admin surface and should be deployed to the Access-gated subdomain `nexus.projectnyra.com`. The raw Nexus Router API/MCP endpoint is `nexus-router.ratehunter.net`.
- Link to it from `apps/webapp`, but do not embed it inside the broker/customer webapp.
- Current runtime placement is Oracle VPS: Grafbase Nexus and LiteLLM are in `infra/hosts/oracle-vps/docker-compose.yml`.
- Do not use `infra/deploy/*`, `infra/compose/*`, `infra/stacks/*`, or `infra/workers/*` as live Compose sources. Host compose stacks live only under `infra/hosts/<host-name>/`.
- Treat `config/nexus-ui.settings.json` as desired state, not guaranteed live state.
- Do not write live Nexus or LiteLLM config unless a reviewed apply adapter exists and `NEXUS_CONFIG_APPLY_ENABLED=true`.
- Never store secret values in app state or JSON. Store only secret references like `GITHUB_TOKEN`.
- Never expose worker inference endpoints, datastores, or raw unauthenticated MCP internals publicly.
- Nexus MCP endpoint is `/mcp` for the deployed Grafbase Nexus generation unless official docs for the pinned version say otherwise.
- If Nexus upstream config changes, update the generator only after checking official docs for the deployed version.

## Product Requirements

The UI must support:

- Enable/disable fuzzy tool search.
- Configure fuzzy search result count and ranking mode.
- Enable/disable groups of tools.
- Enable/disable individual tools.
- Show risk level and read-only/mutating status for tools.
- Configure smart routing enablement, strategy, default model, fallback model, privacy mode, token forwarding, and explicit allowlist behavior.
- Configure LiteLLM endpoint, virtual key mode, budget alerts, cache, retries, fallbacks, guardrails, and model groups.
- Show status for Nexus and LiteLLM.
- Generate config previews with clear comments for UI-only desired policy.

## Frontend Rules

- Use Next.js App Router, TypeScript, Tailwind v4, shadcn-style local components, and lucide icons.
- Use the supplied TweakCN theme in `app/globals.css`.
- Use semantic tokens such as `bg-background`, `text-muted-foreground`, `border-border`, `bg-card`.
- Keep cards and control surfaces at `rounded-[8px]` unless the project design system changes.
- Use icons in action buttons where helpful.
- Keep the first screen as a usable operator dashboard, not a landing page.
- Avoid secret-looking placeholder strings in screenshots, docs, and examples.

## Validation

Before handing off changes:

```bash
pnpm --filter @nyra/nexus-ui typecheck
pnpm --filter @nyra/nexus-ui build
```

If build fails because Google font fetching is unavailable, document that explicitly and still run typecheck.

## Files To Know

- `app/page.tsx`: renders the console.
- `components/nexus-console.tsx`: main client UI.
- `lib/settings.ts`: schemas, defaults, and config generators.
- `lib/settings-store.ts`: JSON persistence.
- `app/api/settings/route.ts`: settings GET/PUT API.
- `app/api/status/route.ts`: Nexus and LiteLLM health probes.
- `docs/SPEC.md`: expected behavior and future apply-adapter contract.
- `docs/BUILD_GUIDE.md`: runbook for local dev, deployment, and Cloudflared.
