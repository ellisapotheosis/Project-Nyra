# Final-Cut Product Integration Backlog

## Purpose

Turn the merged final-cut contracts into live, audited product behavior for Project Nyra.

## Priority Order

1. Lead intake to live Twenty CRM write path with dedupe and audit persistence.
2. Shared audit/event ledger persistence for every mutation and communication.
3. Project Nyra live lead detail workspace consuming real CRM/service records.
4. Quote UI and API wired to deterministic quote-service outputs and quote history.
5. Communication send/callback flows for Twilio/SendGrid with compliance preflight before send.
6. Campaign execution persistence and scheduler behavior behind campaign-service.
7. Supabase Auth hosted smoke tests for callback, redirects, roles, and service-role health.
8. Live Radar UI using websocket product event stream.
9. Mobile/responsive screenshots for Project Nyra and RateHunter.
10. TweakCN/shadCN token cleanup for stale hardcoded colors.
11. Infisical env coverage report for apps, services, and infra.
12. Oracle VPS Supabase/Kong/Auth smoke script.
13. Cloudflare Access policy verification after `projectnyra.com` zone activation.
14. MCP startup runbook validation for Nexus Router, Infisical, and Playwright CLI.
15. Prototype archival report for `apps/admin/app` and `apps/mortgage-crm`.
16. Keep `apps/twenty` protected and avoid visual merges.
17. Decide and document whether `apps/nexusUI` remains standalone or also receives a Project Nyra wrapper route.
18. LendingPad milestone sync contract and owner-action checklist.
19. Real soft-pull provider integration after provider approval and credentials.
20. Document intake/OCR/DTI extraction behind audited service boundaries.
21. Final release checklist with screenshots, smoke checks, owner actions, and known risks.
22. Dependency/security backlog review for default-branch GitHub alerts.
23. Husky hook executable-state repair if local automation should run.
24. Vercel/Cloudflare deployment failure triage.
25. Final repo-truth sweep for stale docs/prompts after the next feature wave.

## Non-Negotiables

- Twenty CRM remains the system of record.
- Every CRM write, campaign mutation, quote mutation, and borrower communication must produce an audit event.
- Assistant surfaces may request actions only through audited service boundaries.
- RateHunter remains public landing only.
- Project Nyra owns internal broker/product surfaces.
