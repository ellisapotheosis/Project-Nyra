# Nexus UI Specification

## Purpose

Nyra Nexus UI is an operator console for the Project Nyra agent control plane. It gives humans and future automation a single structured place to manage desired Nexus Router, MCP server, MCP tool, model routing, and LiteLLM settings.

## Non-Goals

- It is not the broker/customer webapp.
- It is not a public product landing page.
- It does not replace LiteLLM, Nexus Router, or Cloudflare Access.
- It does not directly mutate live infrastructure until an apply adapter is reviewed and explicitly enabled.
- It does not store real secret values.

## Primary Users

- Project owner/operator managing the homelab and Oracle VPS control plane.
- Coding agents that need a clear source of desired Nexus/LiteLLM state.
- Future deployment agents that need to generate version-specific config from a typed settings model.

## Core Concepts

### Desired State

The app persists a typed JSON model to `config/nexus-ui.settings.json`. This is the operator-approved desired state.

The live Nexus/LiteLLM services currently live on Oracle VPS in `infra/hosts/oracle-vps/docker-compose.yml`. Compose files outside `infra/hosts/<host-name>/` are not runtime sources.

### Live State

Live state is probed from `NEXUS_BASE_URL` and `LITELLM_BASE_URL`. The app currently checks health only.

### Apply Adapter

A future adapter may translate desired state into live Nexus TOML, LiteLLM YAML, Docker Compose updates, systemd reloads, or host-owned commands. It must be disabled by default and guarded by `NEXUS_CONFIG_APPLY_ENABLED=true`.

## Functional Requirements

### Overview

- Show Nexus and LiteLLM reachability.
- Show active group count, active tool count, and enabled model provider count.
- Provide save and refresh actions.
- Link back to the broker webapp.

### Fuzzy Tool Find

- Toggle fuzzy matching.
- Toggle tool search behavior as a whole.
- Set max result count.
- Select ranking mode: `exact-first`, `semantic`, or `hybrid`.

### Tool Groups

- Create a visible operator model for tool categories.
- Enable/disable each group.
- Treat a disabled group as disabling every tool within that group.

### Tools

- Enable/disable each tool.
- Display tool ID, group, server, read-only/mutating status, and risk level.
- Keep mutating/high-risk tools visible and explicit.

### MCP Servers

- Represent downstream servers by ID, transport, endpoint, auth mode, secret reference, timeout, rate limit, and TLS behavior.
- Support `streamable-http`, `sse`, and `stdio` as modeled transports.
- Do not assume every modeled setting maps exactly to every Nexus release.

### Smart Routing

- Toggle routing policy.
- Configure strategy: `balanced`, `latency`, `cost`, `privacy`, or `fallback`.
- Configure default and fallback model aliases.
- Toggle privacy mode, token forwarding, and explicit model allowlist.
- Generate a policy preview for the Nexus/LiteLLM integration layer.

### LiteLLM

- Toggle LiteLLM integration.
- Configure base URL.
- Toggle virtual keys, budget alerts, cache, retries, fallbacks, and guardrails intent.
- Define model groups.
- Generate YAML preview for LiteLLM config review.

### Environment

- Track known Nexus, LiteLLM, and provider environment variables.
- Store literal non-secret values only where appropriate.
- Store secret references instead of secret values.

## Security Requirements

- Cloudflare Access must protect the deployed UI.
- No raw worker inference endpoints should be exposed publicly.
- No Postgres, Redis, FalkorDB, Qdrant, or raw MCP internals should be exposed publicly.
- Settings persistence must avoid real token values.
- Apply automation must be opt-in, auditable, and version-aware.

## Suggested Subdomain

Use:

```text
nexus.ratehunter.net
```

Add a webapp link through:

```text
NEXT_PUBLIC_NEXUS_UI_URL=https://nexus.ratehunter.net
```

## Acceptance Criteria

- `pnpm --filter @nyra/nexus-ui typecheck` passes.
- `pnpm --filter @nyra/nexus-ui build` passes.
- The UI loads at `http://localhost:3016`.
- Saving writes valid settings JSON.
- Status probes do not leak secrets.
- Generated Nexus TOML and LiteLLM YAML do not contain secret values.
- Webapp navigation includes a Nexus link.
