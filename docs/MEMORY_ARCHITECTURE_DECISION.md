# Memory Architecture Decision

**Decision Date**: 2026-05-30
**Status**: Active
**Canonical Nexus config**: `infra/hosts/oracle-vps/nexus.toml`

## Decision

Project Nyra will use a Nexus-first memory stack:

- **Nexus Router** is the only supported agent entrypoint for memory tools.
- **Letta** is the stack orchestrator and agent/session memory manager.
- **mem0** is the primary persistent memory API.
- **FalkorDB** is the graph backend for mem0 relationship memory.
- **Qdrant** is the vector backend for mem0 semantic retrieval.
- **OpenMemory MCP** provides memory inspection, visual management, and standard MCP access.
- **memOS/MemoryTensor** remains as a focused experimental memory lane exposed through its API and MCP server. The deployed package supports Neo4j/PolarDB/Postgres graph backends, not FalkorDB, so Project Nyra keeps graph ownership in mem0/FalkorDB. Do not treat memOS as a second graph owner unless the package is patched or replaced with a FalkorDB-capable backend.

MemPalace is removed from the runtime architecture. It overlaps with OpenMemory and memOS responsibilities, adds another memory source of truth, and the deployed container was idle rather than serving a usable HTTP/MCP endpoint.

## Rationale

The stack needs one routing surface, one primary persistent memory API, and explicit specialized lanes. Adding another knowledge-organization service makes memory provenance harder to reason about and increases the chance agents write to the wrong place.

Nexus keeps tool access centralized. Letta owns agent state. mem0 owns durable memory writes and retrieval. Qdrant and FalkorDB provide the storage capabilities mem0 needs. OpenMemory gives the human-visible management surface the stack was missing. memOS/MemoryTensor is useful as a research lane, but it should be exposed through Nexus rather than used as an uncontrolled second source of truth or a second graph database owner.

## Runtime Contract

| Layer               | Owner              | Contract                                                                |
| ------------------- | ------------------ | ----------------------------------------------------------------------- |
| Entry point         | Nexus Router       | Agents call Nexus MCP endpoints, not direct service URLs by default.    |
| Agent orchestration | Letta              | Agent/session state, context management, and curated Letta tool access. |
| Persistent memory   | mem0               | Primary memory create/search/update endpoint.                           |
| Vector backend      | Qdrant             | Semantic memory storage and retrieval.                                  |
| Graph backend       | FalkorDB           | Relationship memory and graph queries.                                  |
| Visual management   | OpenMemory MCP     | Human-visible memory management and MCP access.                         |
| Experimental lane   | memOS/MemoryTensor | Tensor memory experiments exposed via API/MCP.                          |

## Operational Notes

- Direct public MCP exposure should stay service-token protected; Nexus is the preferred external entrypoint.
- Twenty CRM remains the system of record for lead and loan state. Memory services may summarize or retrieve context but must not become the source of truth for mortgage state.
- Compliance decisions and quote terms must be stored in explicit business systems and audit logs, not only in memory.
- Secrets belong in Infisical or ignored `.env` files. Nexus config must not contain hardcoded API tokens.

## Verification

Minimum runtime checks:

```bash
docker --context oracle ps --filter name=nyra-memory
curl -fsS http://oracle-vps.trex-fiordland.ts.net:8765/docs
curl -fsS http://oracle-vps.trex-fiordland.ts.net:8001/health
curl -fsS --max-time 2 http://oracle-vps.trex-fiordland.ts.net:8085/sse
curl -fsS --max-time 2 http://oracle-vps.trex-fiordland.ts.net:8284/sse
```

The canonical repository config is `infra/hosts/oracle-vps/nexus.toml`; obsolete copies under `infra/configs/nexus/` should not be recreated.
