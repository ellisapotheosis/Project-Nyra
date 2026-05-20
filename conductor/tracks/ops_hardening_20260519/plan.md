# Implementation Plan: Operational Hardening & Observability

## Phase 1: Security and Infra Baseline

- [~] Task: Audit `infra/` for hardcoded secrets and ensure env-driven configuration
- [ ] Task: Tighten host-scoped docker-compose files (restart policies, resource limits)
- [ ] Task: Review public exposure of private workers and tunnels

## Phase 2: Observability and Health

- [ ] Task: Standardize health check endpoints across all services
- [ ] Task: Implement basic smoke test suite for core service reachability
- [ ] Task: Create operator-visible failure surface (status dashboard or equivalent)

## Phase 3: Workflow and Docs

- [ ] Task: Clarify boundary between Nyra logic and external execution (n8n/Activepieces)
- [ ] Task: Update handoff documentation for redeployment and rollback procedures
- [ ] Task: Conductor - User Manual Verification 'Operational Hardening'
