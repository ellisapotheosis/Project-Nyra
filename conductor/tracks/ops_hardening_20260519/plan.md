# Implementation Plan: Operational Hardening & Observability

## Phase 1: Security and Infra Baseline [checkpoint: 67a2f1c]

- [x] Task: Audit `infra/` for hardcoded secrets and ensure env-driven configuration 139d30a
- [x] Task: Tighten host-scoped docker-compose files (restart policies, resource limits) ecfe3ea
- [x] Task: Review public exposure of private workers and tunnels 67a2f1c

## Phase 2: Observability and Health [checkpoint: 5a8e1b2]

- [x] Task: Standardize health check endpoints across all services 5a8e1b2
- [x] Task: Implement basic smoke test suite for core service reachability 5a8e1b2
- [x] Task: Create operator-visible failure surface (status dashboard or equivalent) 5a8e1b2

## Phase 3: Workflow and Docs [checkpoint: 9c7d3f4]

- [x] Task: Clarify boundary between Nyra logic and external execution (n8n/Activepieces) 9c7d3f4
- [x] Task: Update handoff documentation for redeployment and rollback procedures 9c7d3f4
- [x] Task: Conductor - User Manual Verification 'Operational Hardening' 9c7d3f4
