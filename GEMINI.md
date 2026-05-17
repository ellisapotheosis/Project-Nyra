# GEMINI.md

Gemini CLI rules for Project Nyra.

Gemini must read `AGENTS.md` before making changes.

## Preferred use cases

Use Gemini primarily for:

- UI generation and refactors
- Next.js layout work
- Tailwind/shadcn composition
- landing page polish
- fast alternative implementation passes

## Canonical Workspace Paths

- `apps/projectnyra` → (projectnyra.com) Primary logic scaffold and command center.
- `apps/ratehunter` → (ratehunter.net) Public broker landing page (Isolated).
- `packages/ui` → Shared design system and premium effects.
- `packages/assets` → Shared media and documentation assets.

## Cluster Architecture

- **Orchestrator (LAN)**: Control Plane, Nexus Router, LiteLLM, OpenClaw, Monitoring.
- **Oracle-VPS (Cloud)**: Twenty CRM, Gitea, DBs, Campaign Engine, Public Ingress.
- **Workers (GPU)**: vLLM (5090, 3090 Ti), Ollama (3060).
- **Syncthing**: Synchronizes `~/` across the 4 local nodes (orchestrator + 3 workers).

## Rules

- Follow `AGENTS.md` as the global project contract.
- **Visual Identity (High Fidelity)**: Strictly adhere to the **Dark Mode / Indigo / Seafoam** palette.
  - Primary: Indigo/Purple (Indigo-500/600).
  - Secondary: Seafoam/Turquoise (Turquoise-400/500).
  - Alerts: Neon Pink (Pink-400/500).
  - Component Pattern: High professional density, ShadCN tokens, oklch colors. No light mode.
- TypeScript only for apps and services unless there is a strong reason otherwise (e.g., Python for `quote-api`).
- Do not place business logic in UI components.
- Use the shared tweakcn/shadcn/Magic UI design language.
- Ensure all infrastructure changes are reflected in `/infra/hosts/`.
- **Infrastructure Source of Truth**: Only Docker Compose files under `/infra/hosts/<host-name>/` are active.

## Workflow Integration

- Work in small, verifiable slices.
- Resolve stale documentation when encountered.
- Follow the Conductor spec-driven development framework where applicable.
