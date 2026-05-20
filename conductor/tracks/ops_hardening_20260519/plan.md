# Implementation Plan: Operational Hardening & Observability

## Phase 1: Security and Infra Baseline

- [x] Task: Audit `infra/` for hardcoded secrets and ensure env-driven configuration
- [x] Task: Tighten host-scoped docker-compose files (restart policies, resource limits)
- [x] Task: Review public exposure of private workers and tunnels

## Phase 2: Observability and Health

- [x] Task: Standardize health check endpoints across all services
- [x] Task: Implement basic smoke test suite for core service reachability
- [x] Task: Create operator-visible failure surface (status dashboard or equivalent)

## Phase 3: Workflow and Docs

- [x] Task: Clarify boundary between Nyra logic and external execution (n8n/Activepieces)
- [x] Task: Update handoff documentation for redeployment and rollback procedures
- [x] Task: Conductor - User Manual Verification 'Operational Hardening'

## Deferred Live-Host Work

- Oracle public bind changes require live firewall/Tailscale verification before
  changing production listeners.
- Broad resource-limit tuning remains a live-capacity exercise; this track added
  the local audit and release gate so future changes are visible and reversible.
