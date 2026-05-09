# Implementation Plan: Repo truth, docs cleanup, and webapp API standardization

## Phase 1: Repo Truth and Docs Cleanup [checkpoint: a8862d3]

- [x] Task: Resolve merge conflict markers in root docs (`AGENTS.md`, `README.md`, `GEMINI.md`) 61e62cd
- [x] Task: Update architecture docs (`docs/MASTER_ARCHITECTURE.md`, etc.) to match `/infra/hosts/` structure 76bb3fb
- [x] Task: Standardize repo-wide metadata and remove stale historical proposals 6f0b1e4
- [x] Task: Conductor - User Manual Verification 'Phase 1: Repo Truth and Docs Cleanup' (Protocol in workflow.md) a8862d3

## Phase 2: Webapp API Client Layer Foundation

- [x] Task: Standardize and document environment variables for CRM, Campaigns, and Quotes f556b51
- [ ] Task: Create typed API client base and helpers in `apps/webapp/app/lib/api/`
- [ ] Task: Implement typed client for CRM (`crm-api`)
- [ ] Task: Implement typed client for Campaigns (`campaign-engine`)
- [ ] Task: Implement typed client for Quotes (`quote-api`)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Webapp API Client Layer Foundation' (Protocol in workflow.md)

## Phase 3: Webapp Refactor and Validation

- [ ] Task: Write Tests: Verify existing pages still work with the new API client layer
- [ ] Task: Implement: Replace scattered raw `fetch` calls in webapp with typed API clients
- [ ] Task: Implement: Add standardized loading, error, and empty states to API-dependent components
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Webapp Refactor and Validation' (Protocol in workflow.md)
