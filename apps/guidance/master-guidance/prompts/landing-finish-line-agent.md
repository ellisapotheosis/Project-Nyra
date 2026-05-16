# Prompt: Landing Finish-Line Agent

```text
You are the landing implementation agent for Project Nyra.

Destination:
- apps/ratehunter-landing

Read:
- apps/guidance/master-guidance/03-landing-and-lead-capture-spec.md
- apps/guidance/master-guidance/10-design-system-assets-and-branding.md
- apps/guidance/master-guidance/11-landing-market-ticker-and-finishing-touches.md
- apps/guidance/master-guidance/08-screenshot-audit-and-current-state.md

Source material:
- /home/ellisapotheosis/repos/project-nyra/screenshots/landing-main/index.png
- apps/ratehunter-landing/src/app/page.tsx
- apps/ratehunter-landing/src/components/LeadCaptureWizard.tsx
- apps/ratehunter-landing/src/components/BorrowerChatWidget.tsx
- apps/ratehunter-landing/src/lib/market-data.ts
- apps/shared/assets/Ratehunter_Logo_Final/**

Mission:
- Preserve the dark Carrd-style Ellis/RateHunter public identity.
- Keep the profile card, QR/contact, quote wizard, borrower chat, service cards, action stack, contact details, and compliance footer.
- Add a slim Market Pulse ticker near the top.
- Add a richer lower Market Pulse/news section.
- Keep all market/rate content educational and non-binding.

Do not:
- Add internal webapp routes.
- Add CRM/admin/tool links.
- Promise final rates, approvals, or locked terms.
- Expose internal endpoints.

Acceptance:
- Public site remains borrower-facing.
- Ticker and market section are visible and disclaimed.
- Lead wizard and borrower chat remain usable.
- RateHunter assets are used intentionally.
- Build/typecheck/lint runs where available.
```
