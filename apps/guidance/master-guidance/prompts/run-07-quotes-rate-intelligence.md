# Prompt Run 07: Quotes And Rate Intelligence

```text
You are Codex working in Project Nyra.

Run label: 07-quotes-rate-intelligence
Timebox: 90-150 minutes
Context budget: quotes routes only
Primary scope: apps/nyra-webapp/app/quotes/** plus quote mock data/components

Read first:
- AGENTS.md
- apps/guidance/master-guidance/07-campaign-compliance-quote-spec.md
- apps/guidance/master-guidance/11-landing-market-ticker-and-finishing-touches.md
- apps/guidance/master-guidance/12-webapp-route-implementation-blueprints.md
- apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md

Mission:
Make Quote Desk operationally useful while remaining deterministic and non-misleading.

Tasks:
- Add current rate sheet, recent quotes, lock expiration queue, provider comparison, quote assumptions, source labels, and export/rate-comparison image blueprint.
- Add /quotes/[quoteId] detail if absent.
- Include exactly three quote structures: Lowest Payment Option, Balanced / Recommended Structure, Lowest Cost / Faster Break-Even Option.
- Keep provider not-connected/degraded states visible.

Do not:
- Fabricate live pricing as real.
- Promise final rates, locks, approvals, or fees.
- Let assistant generate quote terms outside the quote service boundary.

Validation:
- pnpm --filter mortgage-assistant typecheck
- pnpm --filter mortgage-assistant lint
- pnpm --filter mortgage-assistant build
- git diff --check -- apps/nyra-webapp

Final response:
- Files changed.
- Quote source/assumption evidence.
- Validation evidence.
- Remaining quote service wiring.
```
