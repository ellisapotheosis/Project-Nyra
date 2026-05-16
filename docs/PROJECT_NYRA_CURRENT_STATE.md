# Project Nyra Current State

Last refreshed: 2026-05-12.

This document records the current source-of-truth state after reconciling the finish-line prompt against active repo files. Active source and host compose files outrank older docs when conflicts appear.

## Active Architecture

- `apps/nyra-webapp` is the broker command-center webapp. Older prompt references to `apps/webapp/app` are stale after the app consolidation/rename.
- `apps/ratehunter-landing` is the public RateHunter lead capture surface. Older prompt references to `apps/landing/app` are stale after consolidation.
- `apps/nyra-admin` is retained as an admin/operator app surface, but the broker cockpit and ops routes are consolidated into `apps/nyra-webapp`.
- `apps/nexus-console` is the Nexus UI surface.
- Twenty CRM is the system of record.
- `services/crm-api` is the app-facing CRM boundary.
- `services/lead-ingestion` owns raw lead normalization and ingestion handoff.
- `services/quote-api` is Python/FastAPI and owns deterministic mortgage quote generation.
- `services/campaign-engine` owns campaign templates, executions, and enrollment state transitions.
- `services/compliance-service` owns outbound preflight rules, STOP/unsubscribe detection, DNC, consent, and quiet-hours decisions.
- `services/communication-service` owns send/callback normalization boundaries and must call compliance before outbound borrower communication.
- `services/assistant-service` owns agent proposed-action risk classification and approval gating.
- `packages/domain-models` contains canonical Zod/TypeScript contracts.
- `packages/integration-adapters` contains provider/integration adapters and local mocks for deterministic tests.

## Verified Implemented

- Canonical domain contracts exist for the backend/service lane.
- Contract docs exist for CRM API, lead ingestion, campaign engine, quote API, compliance service, communication service, and assistant service.
- Quote API has `POST /api/quotes/generate` with a canonical three-option response.
- Campaign engine has STOP terminal handling and reply-pause tests.
- Webapp route groups exist for broker, ops, and tools surfaces.
- Webapp has an initial typed API client layer under `apps/nyra-webapp/lib/api`.
- Webapp API route fallbacks are gated by `NYRA_ENABLE_MOCKS=true` for the hardened service routes.
- `/admin/integrations` provides a read-only health/configuration dashboard.
- `/admin`, `/crm/settings`, `/campaigns/[id]`, and `/quotes/[id]` now exist as private app detail/configuration routes.
- Tool gateway pages exist for OpenClaw, Nexus, Activepieces, n8n, OpenMemory, and Paperclip.
- Landing lead capture posts to a server-side `/api/leads/ingest` proxy with explicit consent capture and source attribution, keeping CRM/API keys out of the browser.

## Known Runtime Limits

- Live Twenty, Twilio, SendGrid, Activepieces, n8n, OpenClaw, Nexus, and memory-provider checks require credentials and running services.
- Provider dashboard/MFA/domain-verification tasks are manual-owner tasks and should be tracked in `docs/OWNER_MANUAL_ACTIONS.md`.
- Worker inference endpoints must remain private behind Tailscale/gateway routing.

## Current Validation Targets

- `pnpm test:contracts`
- `pnpm -C services/lead-ingestion test && pnpm -C services/lead-ingestion typecheck`
- `pnpm -C services/compliance-service test && pnpm -C services/compliance-service typecheck`
- `pnpm -C services/communication-service test && pnpm -C services/communication-service typecheck`
- `pnpm -C services/assistant-service test && pnpm -C services/assistant-service typecheck`
- `pnpm -C services/crm-api build`
- `pnpm --filter mortgage-assistant typecheck`
- `pnpm --filter mortgage-assistant build`
- `pnpm --filter ratehunter-landing-legacy typecheck`
- `pnpm --filter ratehunter-landing-legacy build:cf`
- `PYTHONPATH=services/quote-api services/quote-api/.venv/bin/python -m pytest services/quote-api/tests/test_canonical_quote.py -q`
