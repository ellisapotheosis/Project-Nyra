# Nyra memory stack — pick a “boring” spine, then add weirdness

You listed:

- AgentDB + RuVector (Claude-Flow options)
- Redis
- Postgres
- Qdrant
- Graphiti + FalkorDB/Neo4j
- Letta
- OpenMemory MCP
- mem0
- memOS (memorytensors)
- Zep (+ MCP)

## Recommendation (start here)

### Tier 0 — Durable truth

**RuVector Postgres as the primary database**.

Why: you get relational tables + vector search + hybrid search + graph-ish ops in one place (and it’s designed to be used from Claude-Flow). This keeps your stack *smaller* while giving you headroom.

### Tier 1 — Fast ephemeral state

**Redis** for:

- workflow queues (n8n/Activepieces)
- rate limiting
- session tokens
- job status

### Tier 2 — Human-auditable memory UX (optional)

Pick **one**:

- **Zep** if you want a more opinionated conversational memory store + UI
- **OpenMemory MCP** if you mainly want “memory as a tool” available to agents

Key rule: these are **views / assistants**, not your truth source. Your truth stays in RuVector Postgres.

## When to add other stuff

### Add Qdrant only if…

- you need extreme vector throughput across multiple pods
- you want vector storage separated from your transactional DB

Otherwise, RuVector Postgres keeps ops simpler.

### Add Neo4j/FalkorDB only if…

- you’re doing heavy relationship queries that outgrow Postgres patterns
- you need a graph UI / tooling your team loves

But note: RuVector Postgres is advertising Cypher/graph operations, so you may not need a separate graph DB until much later.

### Letta / mem0 / memOS

These are great *agent-memory frameworks*, but if Claude-Flow already provides memory + routing + learning hooks, you’ll usually create **duplicate, conflicting “truth”** by adding them too early.

My advice:

- Don’t add them until you can answer: “What capability do I lack that I can’t build on top of RuVector + Claude-Flow memory tools?”

## Practical Nyra memory layout

### Namespaces

- `nyra:product` — product decisions, architecture, constraints
- `nyra:compliance` — scripts + disclaimers + audit notes
- `nyra:leads:<lead_id>` — RAG docs, convo summaries, intents
- `nyra:workflows` — playbooks for drip campaigns, followups
- `nyra:codebase` — important patterns, recurring fixes

### Data model backbone

- `leads` table (PII + consent flags)
- `events` table (what happened + when)
- `messages` table (chat logs)
- `documents` table (normalized doc store)
- `embeddings` table (ruvector type)

Keep “agent memory” as *derived* data from these.
