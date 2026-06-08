# Security And Compliance Guardrails

- Never commit secrets. Use Infisical, gitignored `.env` files, or Docker secrets.
- Internal databases, workers, model servers, Qdrant, FalkorDB, Redis, and raw MCP endpoints stay private.
- STOP, unsubscribe, remove-me, DNC, wrong-number, quiet-hour, and consent checks are hard blocks before outbound communication.
- Inbound replies pause automation until broker review or an explicit service action resumes it.
- Borrower-facing assistant actions require human approval and audit logging.
- Quote/rate outputs require deterministic services and approval gates.
- Agents must call service APIs instead of mutating CRM or databases directly.
