# Project Nyra Prompting Plan

Use these four final lanes instead of spawning new prompt packs:

1. `03-FINAL-MEGA-UI-UX-WEBAPP-LANDING-OPERATOR-SURFACES-PROMPT.md`
2. `04-FINAL-MEGA-PRODUCT-BUILD-SERVICES-BUSINESS-LOGIC-PROMPT.md`
3. `05-FINAL-MEGA-INFRA-OPS-SECURITY-RELEASE-PROMPT.md`
4. `06-FINAL-MEGA-REPO-TRUTH-CONDUCTOR-HANDOFF-ARCHIVAL-PROMPT.md`

## Top 25 Worth Integrating, In Order

1. Lead intake to Twenty CRM write path with dedupe and audit logging.
2. Compliance service enforcing STOP/unsubscribe/reply pause/quiet hours.
3. Campaign service canonical state machine and send eligibility.
4. Deterministic three-option quote service with tests and quote history.
5. Project Nyra live lead detail workspace fed by CRM/service APIs.
6. Supabase Auth hardening, service-role health, and redirect/callback tests.
7. CRM API adapter package boundaries and typed Twenty contracts.
8. Communication service callbacks for SMS/email/voice events.
9. Event/audit ledger package shared by services and UI.
10. Campaign builder UI wired to campaign/compliance contracts.
11. Quote review UI wired to quote-service outputs.
12. OpenClaw assistant service contract that refuses direct CRM/database mutation.
13. Nexus/OpenClaw/Twenty safe launcher surfaces inside Project Nyra.
14. Mobile navigation and route smoke screenshots for the internal app.
15. TweakCN/shadCN token cleanup for stale hardcoded colors.
16. Infisical env coverage report for app/services/infra.
17. Oracle VPS Supabase/Kong/Auth smoke script and docs.
18. Cloudflare Access policy matrix for protected surfaces.
19. MCP startup health runbook for Nexus Router, Infisical, and Playwright CLI.
20. Live Radar/WebSocket event stream for operational activity.
21. LendingPad milestone sync contract and provider owner-action checklist.
22. Soft-pull credit service contract and compliance guardrails.
23. Document intake/OCR/DTI extraction pipeline behind audited service boundaries.
24. Prototype archival report for `apps/admin/app` and `apps/mortgage-crm`.
25. Final release handoff checklist with screenshots, smoke checks, and open risks.

## Immediate Final Cut

Ship items 1-7 before advanced provider integrations. Items 8-15 should follow once the lead-to-CRM, campaign/compliance, and quote paths are demonstrably working. Items 16-25 are release hardening and advanced expansion work.

## Implementation Status - 2026-05-20

Implemented in this cycle:

1. Lead intake now returns a typed `CrmWritePlan` for Twenty lead upsert, campaign enrollment, and audit ledger events.
2. Compliance domain/service now detects STOP/unsubscribe, pauses on borrower replies, blocks quiet hours, and applies do-not-contact state.
3. Campaign domain/service now owns uppercase canonical states, valid transitions, send eligibility, HITL approval checks, and step advancement.
4. Quote domain/service now produces deterministic three-option quotes with versioned quote history.
5. Project Nyra lead detail API now annotates lead responses with a live workspace contract for CRM, compliance, campaign, and quote status.
6. Supabase/Auth hardening remains active through the existing callback, safe redirect, session, signout, and health routes; no new auth bypass was introduced.
7. CRM adapter contracts are expanded in `@nyra/crm-types` for leads, campaign enrollments, communication logs, quotes, and audit ledger entries.
8. Communication callbacks now normalize provider events into borrower-communication or compliance-critical ledger entries.
9. Assistant tool access now blocks direct CRM/database mutation unless approval and audit evidence are present.
10. Project Nyra campaign and quote API routes now expose service-owned contracts/fallbacks instead of silent mock-only behavior.

Remaining final-cut work should continue from item 14 onward after provider credentials are available:

- mobile route smoke screenshots
- hardcoded color/token cleanup
- Infisical env coverage report
- Oracle/Supabase/Kong/Auth smoke script
- Cloudflare Access matrix re-apply after `projectnyra.com` zone activation
- MCP startup runbook validation
- Live Radar/WebSocket integration
- LendingPad, soft-pull provider approvals, document OCR/DTI, prototype archival, and final release checklist
