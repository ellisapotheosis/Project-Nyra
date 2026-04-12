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

## Rules
- Follow `AGENTS.md` as the global project contract.
- TypeScript only for apps and services unless there is a strong reason otherwise.
- Do not place business logic in UI components.
- Use the shared tweakcn/shadcn/Magic UI design language.

## Shared Serena context
If Serena is used alongside Claude Code in the same repo:
- Global Serena config: `~/.serena/serena_config.yml`
- Project Serena config: `<repo>/.serena/project.yml`
