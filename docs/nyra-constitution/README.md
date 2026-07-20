# Project Nyra Constitution

**Version:** 1.0.0  
**Date:** 2026-07-19  
**Status:** Canonical doctrine proposal  
**Audited repository commit:** `9efd1955744416974f3d373762638b855aa3afb9`

This directory is the proposed intellectual and architectural center for Project Nyra, RateHunter, and ProjectNyra.com.

It reconciles the current repository with the founder vision, uploaded finish-line material, agent-realignment prompts, Nexus/observability requirements, and the active global agent contract.

## Read in this order

1. `PROJECT_NYRA_MASTER_CONSTITUTION_WHITEPAPER.md`
2. `ARCHITECTURE_GOVERNANCE_AND_ROADMAP.md`
3. `REPO_TRUTH_CONFLICT_REGISTER_AND_ADRS.md`
4. `MASTER_AGENT_HANDOFF_PROMPT.md`

## Core identity

- **RateHunter.net** is the borrower acquisition and consent surface.
- **ProjectNyra.com** is the public product identity and authenticated broker command center.
- **Project-Nyra** is the implementation repository and operating body of code, configuration, infrastructure, schemas, workflows, tests, documentation, and agent policy.
- **Twenty CRM** is the mortgage CRM system of record.
- **Nyra services** own business logic and authorized mutations.
- **Nexus** is the governed MCP and LLM ingress boundary.
- **LiteLLM** routes models behind Nexus.
- **Letta** is the canonical stateful orchestrator and must not become a recursive unrestricted MCP authority.
- **n8n and Activepieces** are replaceable execution adapters, not the product brain.
- **Memory systems** preserve derived context but do not silently become transactional truth.

## Non-negotiable laws

1. Agents do not directly mutate CRM, databases, communications providers, secrets, or production infrastructure.
2. Consequential actions pass through typed Nyra services with validation, authorization, idempotency, audit, and approval where required.
3. Compliance is explicit code with tests. STOP, unsubscribe, DNC, reply pause, quiet hours, sender identity, consent, and suppression are enforced before outreach.
4. Mortgage terms are deterministic and broker-reviewed. Agents never invent rates, APR, fees, eligibility, or underwriting outcomes.
5. Raw workers, databases, caches, observability backends, MCP servers, Docker sockets, and model endpoints remain private.
6. Paid model spend is never enabled through an undocumented automatic fallback.
7. Every material mutation and communication produces an attributable, PII-minimized audit event.
8. Product state labels are honest: live, cached, mock, degraded, unavailable, pending approval, or unverified.
9. Models and vendors remain replaceable; Nyra owns its domain model, audit trail, institutional memory, and operator experience.
10. Work is not complete until implementation, tests, validation, observability, documentation, failure modes, owner actions, and rollback are addressed.

## Source priority

When documentation conflicts:

1. Active source and active host-specific runtime configuration.
2. Current root agent contracts where consistent with active source.
3. Current package manifests, component specifications, CI, and deployment workflows.
4. Accepted ADRs and this constitution package.
5. Recent evidence-backed operational reports.
6. Historical/proposed documentation.
7. Unverified prompts.

Do not merge contradictory sources into a vague compromise. Record the conflict, choose a canonical decision or mark an owner decision, assign an implementation action, and add validation.

## Scope of this PR

Documentation only. It does not alter production configuration or runtime behavior.

The audit identified P0 follow-up areas—including wildcard Nexus CORS, broad MCP registrations, automatic paid LiteLLM fallbacks, a direct Letta MCP recursion risk, Cloudflare tunnel ambiguity, toolchain drift, and older application-path guidance. Those findings are documented but intentionally not patched in the same documentation PR.
