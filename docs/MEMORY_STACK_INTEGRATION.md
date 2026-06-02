# Project Nyra Memory Stack Integration Guide

**Last Updated**: 2026-05-30  
**Status**: Runtime target  
**Canonical Nexus config**: `infra/hosts/oracle-vps/nexus.toml`

Project Nyra uses Nexus Router as the single memory entrypoint for agents. Letta manages agent/session orchestration, mem0 is the primary long-term memory API, OpenMemory MCP provides visual and protocol-level memory management, and memOS/MemoryTensor provides the experimental tensor memory lane.

The current memOS package does not expose FalkorDB as a native graph backend. Project Nyra therefore keeps graph memory in mem0/FalkorDB and treats memOS as an experimental lane, not as a second source of truth for graph relationships.

MemPalace has been removed from the runtime stack. It was a duplicative organization layer and the deployed service was not serving a usable HTTP/MCP endpoint.

## Runtime Topology

```text
Agents and tools
  |
  v
Nexus Router
  |-- OpenMemory MCP: visual memory management and MCP access
  |-- Letta MCP: reduced Letta orchestration tool surface
  |-- memOS MCP: MemoryTensor/memOS memory lane
  |
  v
mem0 API
  |-- Qdrant: vector backend
  |-- FalkorDB: graph backend
  |-- worker-rtx3060/Ollama-compatible embeddings when configured
```

## Components

| Component | Role | Compose file |
| --- | --- | --- |
| Nexus Router | Singular agent entrypoint and routing policy | `infra/hosts/oracle-vps/docker-compose.yml` |
| Letta | Agent/session orchestrator and memory manager | `infra/hosts/oracle-vps/docker-compose.memory.yml` |
| Letta MCP | Curated MCP surface for Letta tools | `infra/hosts/oracle-vps/docker-compose.letta-mcp.yml` |
| mem0 | Primary persistent memory API | `infra/hosts/oracle-vps/docker-compose.memory.yml` |
| OpenMemory MCP | Visual/protocol memory management | `infra/hosts/oracle-vps/docker-compose.memory.yml` |
| memOS API/MCP | MemoryTensor lane | `infra/hosts/oracle-vps/docker-compose.memory-extra.yml` |
| Qdrant | Vector storage | `infra/hosts/oracle-vps/docker-compose.memory.yml` |
| FalkorDB | Graph storage | `infra/hosts/oracle-vps/docker-compose.memory.yml` |
| Grafbase Gateway pilot | App/API GraphQL facade only; not an MCP or memory router | `infra/hosts/oracle-vps/docker-compose.grafbase.yml` |

## Grafbase Gateway Pilot

Grafbase Gateway is available only as a pilot API facade for Project Nyra app
and business APIs. It does not replace Nexus Router, and it must not be used as
the canonical agent entrypoint. Nexus remains the only approved MCP and agent
routing control plane.

The pilot runs in Grafbase air-gapped mode with local schema and config files:

- `infra/hosts/oracle-vps/grafbase/grafbase.toml`
- `infra/hosts/oracle-vps/grafbase/schema.graphql`
- `infra/hosts/oracle-vps/docker-compose.grafbase.yml`

The compose overlay binds the gateway and its health endpoint to
`${ORACLE_TAILSCALE_IP:-127.0.0.1}` only. Keep it behind Tailscale or loopback
until a specific app API needs it and Cloudflare Access rules are in place.

MCP is explicitly disabled in `grafbase.toml`. Do not enable Grafbase MCP until
there is a reviewed allowlist for exposed GraphQL operations and OAuth
protected-resource metadata for the MCP endpoint.

Verify the compose overlay before deployment:

```bash
docker compose -f infra/hosts/oracle-vps/docker-compose.grafbase.yml config
```

Start the pilot separately from the memory stack:

```bash
docker --context oracle compose \
  -f infra/hosts/oracle-vps/docker-compose.grafbase.yml \
  up -d
```

## Deployment

Use the oracle memory compose overlays:

```bash
docker --context oracle compose \
  -f infra/hosts/oracle-vps/docker-compose.memory.yml \
  -f infra/hosts/oracle-vps/docker-compose.letta-mcp.yml \
  -f infra/hosts/oracle-vps/docker-compose.memory-extra.yml \
  up -d --build
```

Nexus mounts its canonical config from the oracle host path:

```text
/home/ubuntu/project-nyra/infra/hosts/oracle-vps/nexus.toml
```

Keep the repository copy at `infra/hosts/oracle-vps/nexus.toml` in sync with that host file before restarting Nexus.

## Smoke Checks

```bash
curl -fsS http://oracle-vps.trex-fiordland.ts.net:8765/docs
curl -fsS http://oracle-vps.trex-fiordland.ts.net:8001/health
curl -fsS --max-time 2 http://oracle-vps.trex-fiordland.ts.net:8085/sse
curl -fsS --max-time 2 http://oracle-vps.trex-fiordland.ts.net:8284/sse
curl -fsS http://oracle-vps.trex-fiordland.ts.net:6333/collections
```

The SSE checks are healthy when the connection opens and returns HTTP 200, even if the command times out while waiting for events.
