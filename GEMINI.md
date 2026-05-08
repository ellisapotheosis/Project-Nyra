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

## Cluster Architecture

- **Orchestrator (LAN)**: Control Plane, Nexus Router, LiteLLM, OpenClaw, Monitoring.
- **Oracle-VPS (Cloud)**: Twenty CRM, Gitea, DBs, Campaign Engine, Public Ingress.
- **Workers (GPU)**: vLLM (5090, 3090 Ti), Ollama (3060).
- **Syncthing**: Synchronizes `~/` across the 4 local nodes (orchestrator + 3 workers).

## Rules

- Follow `AGENTS.md` as the global project contract.
- TypeScript only for apps and services unless there is a strong reason otherwise (e.g., Python for `quote-api`).
- Do not place business logic in UI components.
- Use the shared tweakcn/shadcn/Magic UI design language.
- Ensure all infrastructure changes are reflected in `/infra/hosts/`.
- **Infrastructure Source of Truth**: Only Docker Compose files under `/infra/hosts/<host-name>/` are active.

## Workflow Integration

- Work in small, verifiable slices.
- Resolve stale documentation when encountered.
- Follow the Conductor spec-driven development framework where applicable.
