# Implementation Plan: Wiring & Hardening Phase

## Phase 1: Production Infrastructure & Secrets

- [ ] Task: Manually establish TwentyCRM custom objects (`MortgageLead`, `Quote`) via Twenty UI
- [ ] Task: Populate live Infisical secrets for Twilio, SendGrid, and TwentyCRM
- [ ] Task: Update infrastructure environment templates and cloudflared config to projectnyra.com subdomains
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Production Infrastructure & Secrets' (Protocol in workflow.md)

## Phase 2: Logic Wiring & Data Sync

- [x] Task: Write Tests: Verify lead data normalization and ingestion validation [f259733]
- [ ] Task: Implement: Connect `apps/ratehunter` lead wizard to live `capture.projectnyra.com` API
- [ ] Task: Implement: Wire `KanbanBoard` to real GraphQL subscriptions in `apps/projectnyra`
- [ ] Task: Implement: Import campaign sequences into Activepieces automation runtime
- [ ] Task: Implement: Hard-code deterministic rate math in `quote-api` logic
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Logic Wiring & Data Sync' (Protocol in workflow.md)

## Phase 3: AI Orchestration & Memory

- [ ] Task: Implement: Configure `Letta` stack orchestrator powered by `llxprt-jefe/code`
- [ ] Task: Implement: Wire `Letta` task dispatching to 3-PC GPU cluster (openclaw/picoclaw)
- [ ] Task: Implement: Connect `mem0` to `falkordb` (graph) and `Qdrant` (vector) backends
- [ ] Task: Implement: Integrate `openmemory mcp` diagnostic links into the Cockpit UI
- [ ] Task: Conductor - User Manual Verification 'Phase 3: AI Orchestration & Memory' (Protocol in workflow.md)

## Phase 4: Security & Compliance Hardening

- [ ] Task: Implement: Apply Cloudflare Access OAuth gating to internal subdomains
- [ ] Task: Implement: Map Clerk operator roles to application `rbac.ts` logic
- [ ] Task: Write Tests: Verify TCPA Sentinel gating for DNC/STOP keywords
- [ ] Task: Implement: Final Secret Leak Scan across the reorganized monorepo
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Security & Compliance Hardening' (Protocol in workflow.md)

## Phase 5: UX Polish & Certification

- [ ] Task: Implement: Fine-tune `RevealHero` scroll animation performance and timings
- [ ] Task: Implement: Connect Dashboard \"Health Heartbeats\" to real service status endpoints
- [ ] Task: Implement: Persist \"System Audit Trail\" forensics to durable storage
- [ ] Task: Conductor - User Manual Verification 'Phase 5: UX Polish & Certification' (Protocol in workflow.md) — verified with Playwright audit and 30+ production-state screenshots.
