# Track Specification: Finish-Line Master Alignment

## Goal

Align active repo state, host compose files, app surfaces, docs, and Conductor backlog with the latest Project Nyra finish-line master document.

## Scope

- Treat active code and host compose files as truth.
- Keep Twenty CRM as the system of record.
- Keep n8n and Activepieces as execution engines, not business-state owners.
- Keep raw worker model endpoints private.
- Replace Gastown with Gastown.
- Track unfinished product, infra, domain, and owner-gated tasks explicitly.

## Acceptance Criteria

- Gastown does not appear in active desired-state config except historical apply-result artifacts or archived/reference material.
- Gastown appears in active Oracle compose, docs, service registry, and webapp operator surfaces.
- Worker service baseline is documented and compose-render validated.
- New incomplete work from the master finish-line document is listed in `/conductor`.
- Current-state docs distinguish completed local work from owner-gated domain/secret/provider work.
