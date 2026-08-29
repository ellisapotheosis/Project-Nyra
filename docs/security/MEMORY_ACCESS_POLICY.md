# Memory access policy

General agents receive only curated memory operations: `search`, `get_context`, `add_candidate`, `approve`, `update`, `forget`, `entities`, `graph`, `handoff.get`, `handoff.write`, and `project_context`.

They do not receive raw Redis/FalkorDB commands, Qdrant administration, Postgres access, Mem0 configuration mutation, Letta agent creation, or OpenMemory administrative credentials. Writes are classified for privacy, deduplicated, assigned importance, and attributed to project/user/agent scope before Mem0 persistence.

All services are private-network-only. Public access, if needed, terminates at Cloudflare Access/Portal and uses least-privilege policies. Secrets are references only and follow `/hosts/shared`, `/hosts/<host>`, or `/shared` taxonomy without committing values.
