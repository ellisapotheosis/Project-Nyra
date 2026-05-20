# UI_DESIGN_MASTER_PROMPT_QUARANTINED

This prompt is intentionally quarantined from the main implementation prompting package because final UI/design decisions are not complete yet.

Use this to consolidate, critique, and finalize visual/design-system direction before sending any UI implementation instructions to Codex or implementation agents.

Do not produce final implementation code unless explicitly asked.

## A. Visual direction ideas from sources

The sources contain strong visual ideas but they are not final:

- “Terminal Maximalism meets Minority Report.”
- “Cyberpunk Void” / “Frosted Obsidian.”
- Deep black backgrounds, glassmorphism, faint grids, data rain, R3F/3D neural/globe visuals.
- Electric violet, seafoam, hot pink, red error states.
- Monaspace Krypton for terminal/log/data surfaces; Inter for UI labels.
- Command Deck / Spatial OS / Neko Command Deck concepts.
- Campaign builder as subway/metro-line timeline.
- Active GPU/service status lights.
- Embedded tool wrappers for Nerve, Activepieces, Letta, Paperclip.
- Landing market/rate ticker and Market Pulse section.
- Borrower chat, profile/QR/contact cards, review links, West Capital Lending resources.

## B. shadcn/ui ideas

Sources mention shadcn as the likely component base. Design agent should decide:

- Which shadcn primitives are used for app shell, cards, drawers, dialogs, tables, toasts, tabs, accordions, forms, timelines, badges, and command palette.
- Which components should be customized vs left standard.
- How to keep broker-facing workflows polished without overbuilding visual noise.

## C. TweakCN ideas

Sources mention TweakCN variant/theme strategy. Decide:

- Whether TweakCN should define the main token system.
- Which theme tokens are final.
- Which variants are allowed for production pages.
- How to preserve accessible contrast.

## D. Magic UI / motion ideas

Potential but not final:

- Animated grid/background.
- Globe/neural network hero.
- Ticker animations.
- Pulsing service status.
- Micro-interactions on lead arrival, campaign pause, errors.

Design agent must separate tasteful motion from distraction.

## E. App shell / dashboard visual ideas

Candidate internal webapp pages:

- Overview command center.
- Leads cockpit.
- Lead detail.
- Campaigns.
- Campaign builder.
- Quote desk.
- Pipeline/Kanban.
- Unified inbox.
- Integrations/tools hub.
- OpenClaw/Nerve console pages.
- Nexus/Hive tool router page.
- Memory page.
- Gitea/Paperclip/observability links.

## F. Component aesthetics

Candidate components:

- Status light / health pill.
- GPU endpoint card.
- Lead queue card.
- Campaign timeline.
- Quote comparison cards.
- Integration embed frame.
- CRM sync health card.
- Kill-switch button.
- Command palette.
- Drawer for editing campaign steps.
- Unified inbox item.

## G. Typography / color / theme ideas

Unfinalized values from sources:

```text
Deep black: #020204 or #050505
Electric violet: #7c3aed
Seafoam: #99f6e4
Hot pink: #db2777
Error red: #ef4444
Data/grid dark blue: #0f172a
```

Fonts:

- Monaspace Krypton for terminal/log/data.
- Inter for labels/general UI.

## H. Motion / animation ideas

- Sidebar active-state pulse for active GPU/service.
- Red flash/border for service error.
- Lead arrival pulse.
- Scrolling market/rate ticker.
- Subtle data rain/grid background.
- Campaign timeline active-node glow.

## I. UX interaction ideas

- Campaign builder: click a step/node to open drawer and edit message/timing/channel.
- Overview: quick actions for create lead, generate quote, pause campaign, view service health.
- Tools hub: embed or link specialist tools with clear auth/degraded states.
- Lead cockpit: show status, source, communication history, quote eligibility, next action.
- Quote desk: generate, compare, send/export, show viewed status.

## J. Visual references / source material

Sources mention current screenshots and repo paths:

```text
/home/ellisapotheosis/repos/project-nyra/screenshots/**
apps/webapp
apps/landing/ratehunter-landing
apps/admin
apps/mortgage-crm
apps/nexusUI
apps/twenty
apps/twenty-crm
apps/shared/assets/**
apps/shared/assets/webapp-v1-source-material/index.html
```

Use these as planning references only until the repo is actually inspected.

## K. Conflicts / undecided design choices

- Raw n8n embed vs custom campaign builder: source default is custom campaign builder for daily use; raw n8n only admin/tool page.
- Tool iframe strategy vs native wrappers: temporary embeds are allowed, final broker workflows should be native wrappers.
- Dense cyberpunk aesthetic vs mortgage-professional trust: final design must not look unserious to borrowers or compliance stakeholders.
- Landing visual baseline: current landing-main is preferred; legacy landing is mined for missing concepts only.
- Webapp command deck can be dramatic internally; public landing must remain professional.

## L. Design questions to resolve

Do not ask the user immediately. First make defaults and produce options:

1. Final theme/token set.
2. Component library choices and overrides.
3. Which tools are embedded vs linked vs rebuilt natively.
4. Landing ticker placement and disclaimer language.
5. Internal webapp density level.
6. Borrower-facing vs broker-only visual split.
7. Accessibility and mobile behavior.

## M. Recommended design-decision workflow

1. Audit screenshots and existing apps.
2. Decide public landing visual baseline.
3. Decide internal command center visual system.
4. Decide component library/theme tokens.
5. Produce route-by-route wireframes.
6. Produce final UI implementation prompt for Codex.
7. Only then allow implementation agents to build visual components.

## N. Final UI-to-Codex handoff skeleton

```text
You are implementing finalized UI/design decisions for Project Nyra.
The visual design has now been approved.
Use the following theme tokens, component choices, route specs, and screenshots.
Do not revisit design direction unless implementation reveals a concrete accessibility or feasibility issue.
Implement incrementally, preserve existing app behavior, keep secrets server-side, and run tests/builds after each route group.
```
