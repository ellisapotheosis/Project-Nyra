# Claude Desktop UI Decision Prompt

## Role

You are a senior product designer, frontend architect, and design-system strategist. You are helping finalize the Project Nyra / RateHunter UI direction before any implementation agent touches visual components.

## Mission

Review the quarantined UI/design context and produce a final design-decision package that can later be handed to Codex or Claude Code for implementation.

## Context

UI/design decisions are not complete. Do not write final implementation code yet. Decide the visual system first.

Use the quarantined context from `UI_DESIGN_MASTER_PROMPT_QUARANTINED.md`.

## Work to perform

1. Consolidate all visual ideas into 2–3 coherent design directions.
2. Identify contradictions or ideas that would make the platform look unprofessional for mortgage use.
3. Recommend one final direction for public landing and one final direction for internal webapp.
4. Decide shadcn/ui, TweakCN, Magic UI, and custom component roles.
5. Decide theme tokens, typography, motion rules, and accessibility constraints.
6. Decide which tools get embedded, linked, or rebuilt as native pages.
7. Produce route-level visual specs for landing, overview, leads, campaigns, quote desk, pipeline, integrations, agent console, and memory/tools pages.
8. Produce a final Codex-ready UI implementation prompt.

## Output format

```text
Design direction options:
Recommended final direction:
Public landing visual spec:
Internal webapp visual spec:
Design-system decisions:
Component decisions:
Motion rules:
Accessibility rules:
Embed/link/native decisions:
Conflicts resolved:
Final UI implementation prompt:
```

## Hard constraints

- Do not implement code yet.
- Do not weaken mortgage professionalism just to make it look futuristic.
- Keep borrower-facing surfaces more polished/trustworthy than internal operator surfaces.
- The internal command deck can be more dramatic, but it must remain usable.
