# Nyra Stack Decisions (Authoritative)

This file **overrides** older bootstrap notes. If you see conflicts, follow THIS document.

## Non-negotiables
- **MCP gateway / tool router:** Grafbase **Nexus**
- **Model routing:** **LiteLLM** + **OpenRouter**
- **Workflow automation:** **n8n** + **Activepieces**
- **Borrower chat UI:** **Dify** (embedded into the Nyra admin UI + optional borrower portal)
- **CRM backend:** **TwentyCRM**
- **Memory system (from day 1):**
  - **GraphRAG:** Graphiti MCP + FalkorDB
  - **Stateful manager:** Letta (Archivist agent)
  - **Episodic/preferences:** Mem0 (cloud) or local fallback bridge (this repo)
- **Observability:** Prometheus + Loki + Grafana + Alertmanager (compose included)

## Legacy removals
See `docs/_deprecated/REMOVED_STACK.md`.

## Why Dify + Activepieces + n8n?
- Dify: borrower-safe, embeddable, app management
- Activepieces: tool ecosystem + MCP + side effects behind gates
- n8n: scheduling/state machines for campaigns
