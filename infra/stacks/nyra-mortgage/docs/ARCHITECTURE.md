# Nyra Architecture (opinionated)

## Core idea
Treat **Twenty CRM** as the system of record, then layer memory + agents on top:
- **Graph memory (FalkorDB + letta):** relationships and long-term facts
- **Universal memory (Mem0):** preferences, conversational breadcrumbs
- **Letta:** stateful "manager agent" (decides what to store + what to escalate)
- **Nexus:** one front door for both LLM routing + MCP tools (Claude Code compatible)

## Data plane
1) Lead arrives (email/API/webform) -> Nyra Orchestrator
2) Orchestrator upserts Person + MortgageLead into Twenty
3) Orchestrator writes graph edges:
   Person -APPLIED_FOR-> Loan
   Loan -SECURED_BY-> Property
   Loan -HAS_STAGE-> PipelineStage
4) Orchestrator stores conversational preferences in Mem0
5) Borrower messaging is handled through a **Logistics-only** policy wall

## Guardrails
- Default policy: **logistics-only**. Anything about rates/terms/approval triggers escalation.
- Consent ledger is required before any outbound SMS/voice.
- Full audit trail: every message + prompt + tool call + operator identity.

