# Project Nyra Constitution

**Version:** 1.1.0  
**Date:** 2026-07-19  
**Status:** Canonical doctrine proposal  
**Audited repository commit:** `9efd1955744416974f3d373762638b855aa3afb9`  
**Current architecture implementation PR reviewed:** `#771`

This directory is the proposed intellectual and architectural center for Project Nyra, RateHunter, and ProjectNyra.com.

It reconciles the current repository with the founder vision, finish-line material, agent-realignment prompts, recent pull requests, LiteLLM/Nexus/OmniRoute/A2A direction, observability requirements, and the active global agent contract.

## Read in this order

1. `PROJECT_NYRA_MASTER_CONSTITUTION_WHITEPAPER.md`
2. `AI_CONTROL_PLANE_AND_PR_RECONCILIATION_2026-07-19.md`
3. `ARCHITECTURE_GOVERNANCE_AND_ROADMAP.md`
4. `REPO_TRUTH_CONFLICT_REGISTER_AND_ADRS.md`
5. `MASTER_AGENT_HANDOFF_PROMPT.md`

The AI control-plane reconciliation is the newest proposed decision. Where it conflicts with older statements about Nexus, LiteLLM, Letta, or global orchestration, record and resolve the conflict through the ADR process rather than blending both models.

## Core identity

- **RateHunter.net** is the borrower acquisition and consent surface.
- **ProjectNyra.com** is the public product identity and authenticated broker command center.
- **Project-Nyra** is the implementation repository and operating body of code, configuration, infrastructure, schemas, workflows, tests, documentation, and agent policy.
- **Twenty CRM** is the mortgage CRM system of record.
- **Nyra services** own business logic and authorized mutations.
- **LiteLLM** is the proposed canonical machine-facing model, MCP, and A2A gateway.
- **Nexus** remains a private MCP aggregator and namespace boundary during measured migration.
- **OmniRoute** is an optional private upstream provider and official-OAuth broker behind LiteLLM.
- **OpenRouter** is an optional external upstream with explicit model and spend policy.
- **Omnigent/Polly, ORCA, and Herdr** are development and operator surfaces, not production mortgage-runtime dependencies.
- **OpenClaw** is the governed channel and remote-interaction boundary.
- **Hermes** is the always-on RTX 3090 Ti product and mortgage assistant exposed through a narrow A2A identity.
- **Letta** owns selected stateful-agent context through a narrow bridge; it is not the universal global scheduler.
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
9. Models, agents, operator tools, and vendors remain replaceable; Nyra owns its domain model, audit trail, institutional memory, aliases, policies, and operator experience.
10. Work is not complete until implementation, tests, exact-head validation, observability, documentation, failure modes, owner actions, and rollback are addressed.
11. LiteLLM owns canonical Nyra routing and spend policy; upstream routers and clients do not create hidden bypass paths.
12. A2A, MCP, channel, and agent identities are scoped, observable, cancelable, and least-privilege.

## Source priority

When documentation conflicts:

1. Active source and active host-specific runtime configuration.
2. Current root agent contracts where consistent with active source.
3. Current package manifests, component specifications, CI, and deployment workflows.
4. Accepted ADRs and this constitution package, with newer dated reconciliation documents taking priority until folded into the main files.
5. Recent evidence-backed operational reports and pull-request metadata.
6. Historical or proposed documentation.
7. Unverified prompts.

Do not merge contradictory sources into a vague compromise. Record the conflict, choose a canonical decision or mark an owner decision, assign an implementation action, and add validation.

## Scope of this PR

Documentation only. It does not alter production configuration or runtime behavior.

The audit identifies P0 follow-up areas including gateway-role drift, Nexus wildcard CORS, broad MCP registrations, automatic paid LiteLLM fallbacks, A2A 0.3-to-1.0 migration, direct Letta recursion risk, OpenClaw and agent permission boundaries, Cloudflare tunnel ambiguity, host-secret path drift, tracked session-state risk, toolchain drift, and older application-path guidance. Those findings are documented but intentionally not patched in the same documentation PR.