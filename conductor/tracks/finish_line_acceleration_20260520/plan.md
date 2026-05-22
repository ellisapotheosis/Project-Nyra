# Implementation Plan: Finish Line Acceleration

## Phase 1: Foundations (Error & Notifications)

- [ ] Task: Implement global `ApiError` class and Next.js Error Boundaries
- [ ] Task: Set up a global Toast Notification system (using Shadcn)

## Phase 2: Security & Types (The Backend Sweep)

- [ ] Task: Add Zod validation to `lead-ingestion` and `quote-api` boundaries
- [ ] Task: Audit and sanitize all `console.log` and logger outputs for PII
- [ ] Task: Replace `any` types in `apps/projectnyra/src/lib/api/`

## Phase 3: UI/UX Deepening

- [ ] Task: Refactor `LeadProfilePage` into modular components
- [ ] Task: Add Skeleton Loaders to all dashboard views
- [ ] Task: Apply mobile-responsive polish to the Command Deck

## Phase 4: Final Hardening & Validation

- [ ] Task: Implement Rate Limiting middleware for internal API routes
- [ ] Task: Write and execute the full Playwright E2E "Happy Path" smoke test
- [ ] Task: Conductor - User Manual Verification 'Acceleration Sprint'
