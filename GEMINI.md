# GEMINI.md

Gemini CLI projection for Project Nyra.

`AGENTS.md` is the canonical repo-level operating contract. Gemini-specific
instructions in this file must stay thin: they may describe Gemini routing and
UI strengths, but they must not restate or override product architecture,
compliance rules, repo routing, or completion criteria from `AGENTS.md`.

## Preferred use cases

Use Gemini primarily for:

- UI generation and refactors
- Next.js layout work
- Tailwind/shadcn composition
- landing page polish
- fast alternative implementation passes

## Rules

- Read `AGENTS.md` before changing files.
- **Visual Identity (High Fidelity)**: Strictly adhere to the **Dark Mode / Indigo / Seafoam** palette.
  - Primary: Indigo/Purple (Indigo-500/600).
  - Secondary: Seafoam/Turquoise (Turquoise-400/500).
  - Alerts: Neon Pink (Pink-400/500).
  - Component Pattern: High professional density, ShadCN tokens, oklch colors. No light mode.
- TypeScript only for apps and services unless there is a strong reason otherwise (e.g., Python for `quote-api`).
- Do not place business logic in UI components.
- Use the shared tweakcn/shadcn/Magic UI design language.
- Follow the active app, package, infrastructure, and docs paths in `AGENTS.md`.
- Keep prompt-library updates under `conductor/prompts/`; do not copy stale
  prompt-pack files into root prompt surfaces.

## Workflow Integration

- Work in small, verifiable slices.
- Resolve stale documentation when encountered.
- Follow the Conductor spec-driven development framework where applicable.
