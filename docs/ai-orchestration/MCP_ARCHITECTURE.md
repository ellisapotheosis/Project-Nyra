# Project Nyra MCP architecture

## Selected topology

```text
Human MCP client ── Managed OAuth ──► Cloudflare MCP Portal
Agent ── Access service token ──────► Cloudflare MCP Portal
                                      │ optional Gateway DLP/logging
                                      ▼
                               private Nexus Router
                                      ▼
                         private/internal MCP servers
```

Cloudflare owns public ingress, identity, service-token policy, upstream credential storage, and edge audit. Nexus owns private aggregation, namespace normalization, narrow discovery, tool policy, and internal routing. Nexus and every raw memory/database endpoint remain private.

The Portal → Nexus mapping uses exactly one upstream credential: live server object `nyra-bearer`, configured as Cloudflare bearer auth with custom headers for the Nexus bearer and the protected Nexus Access service token. Human OAuth grants are not passed to agents. The portal's upstream credential is not exposed to clients.

The forbidden Mempalace service has been removed from the active Nexus registration and Oracle compose service. Phase 2 must not add Mempalace, MCPlex, Grafbase Router/API Router, Graphiti, or RuVector.

## Current state

Cloudflare control-plane inventory shows `nyra-bearer` synchronized with `status=ready`, `authentication_status=connected`, and both Portal mappings set `on_behalf=false`. Direct Nexus MCP initialize/search and Portal MCP initialize succeed with service-token headers. A Portal session still exposes no connected upstream server, so the Portal tool-call path is not proven. Oracle live inventory confirms `nyra-network-nyra-nexus` running `ghcr.io/grafbase/nexus:0.6.0`, healthy, mounted from the canonical Oracle `nexus.toml`, and bound only to `127.0.0.1:6000→3000`.
