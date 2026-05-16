# Prompt Run 02: Theme Identity And Apotheosis Safe Slice

```text
You are Codex working in Project Nyra.

Run label: 02-theme-apotheosis-safe-slice
Timebox: 60-90 minutes
Context budget: theme files only
Primary scope: locked theme identities, Apotheosis landing tokens, safe webapp theme defaults

Read first:
- AGENTS.md
- apps/guidance/master-guidance/15-theme-system-and-ui-acceptance.md
- apps/guidance/master-guidance/16-context-window-prompt-runbook.md
- apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md

Mission:
Complete the theme identity layer without broad visual rewrites.

Locked themes:
- midnight: Midnight, conservative dark SaaS/admin-safe fallback.
- mint-midnight: Mint Midnight, authenticated broker webapp default.
- mint-midnight-glow: Mint Midnight Glow, Labs/demo/investor/sizzle mode.
- apotheosis: Apotheosis, public landing default and premium brand theme.

Tasks:
- Confirm current webapp theme registry/provider/switcher files.
- Confirm landing root has data-nyra-theme="apotheosis".
- Confirm webapp root defaults to mint-midnight.
- Apply the user-provided Apotheosis index.css tokens only where compatible with the landing app’s Tailwind setup.
- If token source mismatch exists, create named theme CSS files and document what remains instead of forcing a broken Tailwind v4 file into a Tailwind v3 app.
- Keep landing public and do not add a public theme switcher.
- Keep Mint Midnight as webapp default; do not switch to Apotheosis to hide token contrast bugs.

Do not:
- Install Magic UI or Aceternity in this run.
- Rewrite route layouts.
- Expose internal endpoints.

Validation:
- pnpm --filter ratehunter-landing-legacy typecheck || true
- pnpm --filter ratehunter-landing-legacy build:cf || true
- pnpm --filter mortgage-assistant typecheck || true
- pnpm --filter mortgage-assistant lint || true
- pnpm --filter mortgage-assistant build || true
- git diff --check

Final response:
- Files changed.
- Whether Apotheosis tokens are fully applied or staged.
- Validation evidence.
- Remaining theme work.
```
