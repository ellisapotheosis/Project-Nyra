# Implementation Plan: Repo truth, docs cleanup, and webapp API standardization

## Phase 1: Repo Truth and Docs Cleanup [checkpoint: a8862d3]

- [x] Task: Resolve merge conflict markers in root docs (`AGENTS.md`, `README.md`, `GEMINI.md`) 61e62cd
- [x] Task: Update architecture docs (`docs/MASTER_ARCHITECTURE.md`, etc.) to match `/infra/hosts/` structure 76bb3fb
- [x] Task: Standardize repo-wide metadata and remove stale historical proposals 6f0b1e4
- [x] Task: Conductor - User Manual Verification 'Phase 1: Repo Truth and Docs Cleanup' (Protocol in workflow.md) a8862d3

## Phase 2: Webapp API Client Layer Foundation [checkpoint: 6b039d2]

- [x] Task: Standardize and document environment variables for CRM, Campaigns, and Quotes f556b51
- [x] Task: Create typed API client base and helpers in `apps/webapp/app/lib/api/` 4a615b1
- [x] Task: Implement typed client for CRM (`crm-api`) 6ca9827
- [x] Task: Implement typed client for Campaigns (`campaign-engine`) 51e872a
- [x] Task: Implement typed client for Quotes (`quote-api`) 4d4f9bd
- [x] Task: Conductor - User Manual Verification 'Phase 2: Webapp API Client Layer Foundation' (Protocol in workflow.md) 6b039d2

## Phase 3: Webapp Refactor and Validation [checkpoint: 558fffc]

- [x] Task: Write Tests: Verify existing pages still work with the new API client layer 5f17418
- [x] Task: Implement: Replace scattered raw `fetch` calls in webapp with typed API clients 5f17418
- [x] Task: Implement: Add standardized loading, error, and empty states to API-dependent components 5f17418
- [x] Task: Conductor - User Manual Verification 'Phase 3: Webapp Refactor and Validation' (Protocol in workflow.md) 558fffc
