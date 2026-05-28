# NEXUS_HIVE_MIGRATION_NOTES

Last updated: 2026-05-24

## Current State

**Nexus Router is the canonical MCP/LLM aggregation gateway for Project Nyra.**

Nexus Router is a Grafbase instance running on oracle-vps at port 6000. It serves as
the single entry point for MCP tool routing, LLM provider aggregation, and memory
service access. All agent clients and MCP consumers must route through Nexus.

| Service                 | Host       | Port | Public URL                   |
| ----------------------- | ---------- | ---- | ---------------------------- |
| Nexus Router (Grafbase) | oracle-vps | 6000 | nexus-router.projectnyra.com |

---

## What Nexus Routes

- MCP server aggregation (Infisical MCP, Git MCP, TwentyCRM MCP, Letta MCP, etc.)
- LLM provider routing (to LiteLLM on workers via Tailscale)
- Memory service access (Letta, mem0, Qdrant, FalkorDB)
- Tool call federation across agent sessions

---

## Hive Evaluation Status

Hive (GraphQL schema registry and API gateway from The Guild) is **under evaluation**
as a potential successor to Nexus Router for some routing and schema federation concerns.

**Current policy:**

- Nexus Router is canonical. Do not replace or rename it based on this evaluation.
- Hive API integrations must be introduced behind Nexus as gateway contracts, not
  as direct application dependencies.
- Do not rename any service, config key, or compose label to "Hive" until the repo
  and config confirm Hive API is the final adopted name.

---

## Migration Rule (If Hive Adoption is Confirmed)

If a future decision confirms Hive replaces Nexus:

1. Add the Hive route behind Nexus first (Nexus proxies to Hive).
2. Validate health, audit behaviour, and tool call fidelity in staging.
3. Update all agent clients to call the new Hive endpoint.
4. Run both in parallel for minimum 2 weeks before removing Nexus.
5. Update this document and `docs/CURRENT_STACK_TRUTH_V3.md` with the confirmed name.
6. Archive this document to `docs/archive/NEXUS_HIVE_MIGRATION_NOTES_<date>.md`.

---

## Nexus Configuration

Config file: `infra/hosts/oracle-vps/nexus.toml`

Key config fields:

```toml
[gateway]
port = 6000
bind = "0.0.0.0"

[graph]
# Grafbase subgraph definitions
```

Modify nexus.toml for:

- Adding new MCP server subgraphs
- Adjusting LLM routing weights
- Enabling/disabling memory service routes

Redeploy after changes:

```bash
docker --context oracle-vps compose \
  -f docker-compose.yml restart nexus-router
```

---

## Adding a Route to Nexus

1. Edit `infra/hosts/oracle-vps/nexus.toml` — add the new subgraph endpoint.
2. Ensure the target service is reachable from oracle-vps over Tailscale.
3. Restart nexus-router container.
4. Verify the new route is resolvable via `curl http://100.64.0.3:6000/<route>`.
5. Update `docs/CURRENT_STACK_TRUTH_V3.md` service inventory if a new service was added.

---

## Do Not

- Do not bypass Nexus Router by having agent clients call LiteLLM or memory services
  directly in production — all traffic should be auditable through the gateway.
- Do not deploy a second Grafbase/Nexus instance; oracle-vps is the single instance.
- Do not rename `nexus-router` in compose files until Hive adoption is confirmed.
