# Stack Hardening Report - 2026-05-30

## Summary

This pass added repo-side guardrails for the next hardening lane:

- Infisical-backed compose execution that refuses placeholder secrets.
- Name-only Infisical secret inventory generation.
- Memory stack smoke checks for mem0, Qdrant, FalkorDB, OpenMemory, and memOS.
- Nexus MCP downstream smoke checks for the canonical `nexus.toml`.
- shadcn/tweakcn MCP wiring through local agent configs and a loopback oracle
  sidecar. Nexus aggregation was tested and intentionally left disabled because
  the current stdio-to-SSE bridge is not Nexus-safe.
- Nexus health was restored by keeping OpenMemory, memOS, Letta, and shadcn as
  direct MCP services until their bridges pass Nexus startup and initialize
  checks.

## Infisical Mirror Status

Current evidence confirms a cloud-only Infisical path. The retired local
Infisical instance is not part of the active setup.

Observed status:

- `https://app.infisical.com/api/status` returned HTTP 200.
- The local self-hosted endpoint has been retired and is no longer part of the
  active setup.
- Local Tailscale state is `NeedsLogin`, so MagicDNS-dependent private hostnames
  cannot be trusted from this workstation until Tailscale auth is restored.
- Oracle runtime now uses cloud-only Infisical auth paths.
- Oracle `/run/nyra-secrets/runtime.env` is currently zero bytes.
- `scripts/infisical/sync-cloud.sh status` reports the cloud-only state.

Conclusion: the repo contains a manual bidirectional sync script, but the
runtime is currently a broken Cloud pull path, not a verified Cloud/local mirror.

## Required Operator Actions

1. Rotate the exposed/expired Infisical token currently referenced by the local
   shell secret file and the oracle Infisical agent.
2. Restore Tailscale login on the workstation and verify MagicDNS resolution for
   `infisical.trex-fiordland.ts.net`.
3. Keep the cloud-only auth path in place and do not recreate the retired
   self-hosted Infisical stack.
4. Export fresh Cloud sync credentials as `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID`,
   `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET`, and `INFISICAL_PROJECT_ID`.
5. Run `make infisical-cloud-status`, then `make infisical-cloud-dry-run`,
   then the desired cloud action.

## Added Commands

```bash
make infisical-missing-secrets
make memory-stack-smoke
make nexus-mcp-smoke
scripts/infra/compose-with-infisical.sh --path /machines/oracle-vps -- compose -f infra/hosts/oracle-vps/docker-compose.yml config
```

## shadcn MCP Status

The requested `shadcn@canary registry:mcp` command is not accepted by the
currently resolved `shadcn@canary` package; `shadcn --help` shows the supported
MCP command as `mcp`. The direct MCP entries were therefore corrected to:

```json
["-y", "shadcn@canary", "mcp"]
```

`REGISTRY_URL=https://tweakcn.com/r/themes/registry.json` is still set.

The oracle sidecar runs on `127.0.0.1:8769`, but it is not listed in
`nexus.toml` because the `supergateway` bridge crashes on multiple SSE
connections with the shadcn stdio server. Keep it direct until a bridge with
clean multi-client behavior is available.

## Nexus MCP Status

Nexus 0.6.0 is healthy with the MCP endpoint enabled, but active downstream
aggregation is intentionally empty right now. OpenMemory and memOS are healthy
as direct services, yet their current SSE behavior can block Nexus startup
after a restart. Letta MCP has the same class of transport issue documented in
`nexus.toml`.

The next implementation step is a Nexus-compatible adapter for each memory MCP:

- Accept initialize and initialized without non-JSON SSE preambles.
- Return no response body for initialized notifications when required by the
  protocol.
- Support more than one client/session or serialize Nexus access explicitly.
- Pass `scripts/infra/smoke-nexus-mcp.sh` with `MCP_INITIALIZE=true` before the
  downstream is re-enabled in `nexus.toml`.

## Secret Inventory

The generated name-only inventory lives at:

- `docs/reports/INFISICAL_MISSING_SECRETS.md`

The report currently lists required secret/config-like key names from repo
references. Full missing-key comparison against Infisical requires valid Cloud
and local machine identity credentials.

## Highest-Rated Next Changes

1. Make Nexus the enforced MCP entrypoint with a CI check against direct MCP
   exposure drift.
2. Use the new Infisical compose wrapper for post-bootstrap deploys so dummy
   env values never reach Docker.
3. Add the new memory and Nexus MCP smoke scripts to release validation.
4. Pin critical images away from `latest`, starting with Infisical, Nexus,
   Grafbase Gateway, Qdrant, FalkorDB, Letta, Twenty, and observability agents.
5. Add JSON-RPC initialize tests for each Nexus MCP downstream before enabling
   it in `nexus.toml`.
6. Formalize oracle deployment as either git-managed, rsync artifact, or release
   bundle; current compose projects show mixed local and remote config paths.
7. Bind direct service ports to loopback or Tailscale addresses unless
   Cloudflare Tunnel explicitly owns ingress.
8. Expand the ProjectNyra `/memory` page into an operational console with
   provider counts, last write status, and alerts.
9. Finish the Grafbase Gateway pilot with auth policy and a real allowlisted
   API route before expanding usage.
10. Add Playwright route smoke coverage for `/memory`, compliance controls,
    quote flow, and command hub navigation.
