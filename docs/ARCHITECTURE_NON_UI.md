# Non-UI Architecture

Non-UI work is organized around service contracts, infrastructure, observability, compliance, and agent orchestration. UI/theme/component changes are explicitly quarantined until a dedicated UI pass.

Core lanes:

- Control plane: orchestrator plus Oracle VPS.
- Durable services: Oracle VPS for Twenty, Gitea, Qdrant, FalkorDB, mem0, Letta, CRM/campaign/quote services, and public tunnel endpoints.
- Compute plane: `worker-rtx5090`, `worker-rtx3090ti`, and `worker-rtx3060`.
- Memory: Nexus Router as the gateway to Letta, mem0/Qdrant, OpenMemory, Mempalace, and related memory tools.
- Business services: CRM API, campaign engine, quote/rate engines, lead ingestion, communication providers.

All mutations with business impact must pass through Nyra services and create audit events.
