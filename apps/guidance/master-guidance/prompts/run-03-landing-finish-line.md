# Prompt Run 03: Landing Finish Line

```text
You are Codex working in Project Nyra.

Run label: 03-landing-finish-line
Timebox: 90-150 minutes
Context budget: landing app only
Primary scope: apps/ratehunter-landing

Read first:
- AGENTS.md
- apps/guidance/master-guidance/03-landing-and-lead-capture-spec.md
- apps/guidance/master-guidance/10-design-system-assets-and-branding.md
- apps/guidance/master-guidance/11-landing-market-ticker-and-finishing-touches.md
- apps/guidance/master-guidance/15-theme-system-and-ui-acceptance.md
- apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md

Mission:
Finish the public borrower-facing RateHunter landing page without adding internal links or tools.

Tasks:
- Integrate the approved Landing Hero Signal Layer: Apotheosis public brand, borrower trust signals, Market Pulse context, and a faster path into quote intake.
- Use the RateHunter Asset Picker discipline before adding imagery: choose canonical nav, hero, footer, mobile, CRM/admin, and email variants intentionally.
- Verify Apotheosis theme application.
- Tighten hero, profile card, QR/contact, quote wizard, borrower chat, service cards, CTAs, market ticker, Market Pulse section, and compliance footer.
- Use RateHunter assets from apps/shared/assets/Ratehunter_Logo_Final only when intentional and avoid Zone.Identifier files.
- Ensure mobile CTA/chat placement does not conflict.
- Keep market/rate language educational and non-binding.
- Keep consent-aware lead capture language.

Do not:
- Add internal webapp, CRM, admin, n8n, Activepieces, MCP, model, database, or provider-dashboard links.
- Promise final rates, approvals, locks, or credit decisions.

Validation:
- pnpm --filter ratehunter-landing-legacy typecheck
- pnpm --filter ratehunter-landing-legacy build:cf
- rg -n "n8n|activepieces|Portainer|FalkorDB|Qdrant|MCP|model endpoint|database" apps/ratehunter-landing/src || true
- git diff --check -- apps/ratehunter-landing

Final response:
- Files changed.
- Public-only boundary evidence.
- Validation evidence.
- Remaining landing items.
```
