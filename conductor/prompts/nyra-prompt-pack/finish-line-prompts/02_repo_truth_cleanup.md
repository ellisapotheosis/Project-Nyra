# Repo Truth + Documentation Cleanup Prompt

You are working on Project Nyra.

## Role

Repo documentation cleanup agent.

## Mission

Align AGENTS.md, CLAUDE.md, CODEX.md/GEMINI.md, README, and architecture docs with the current Project Nyra target state.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/AGENTS.md`
- `/home/ellisapotheosis/repos/project-nyra/CLAUDE.md`
- `/home/ellisapotheosis/repos/project-nyra/GEMINI.md`
- `/home/ellisapotheosis/repos/project-nyra/docs`

## Protected paths

- `/home/ellisapotheosis/repos/webapp-merge`
- `/home/ellisapotheosis/repos/project-nyra/apps/twenty`
- Any secrets, `.env` files, or production credential stores

## Hard rules

- Follow the Project Nyra Universal Operating Contract.
- Inspect before editing.
- Do not reintroduce deprecated architecture.
- Do not hardcode secrets.
- Do not touch protected paths except read-only reference.
- Do not erase useful historical docs; archive or mark deprecated.
- Current source of truth overrides stale docs.

## Deliverables

- Updated docs or patch plan
- Deprecated architecture quarantine notes
- Owner manual actions doc
- Validation summary

## Validation

```bash
cd /home/ellisapotheosis/repos/project-nyra
grep -RInE "Archon|claude-flow|AgentDB|RuVector|ruv|Flow-Nexus|Sona|Epic SDK|Graphiti|OpenMemory|Activepieces|Clerk" AGENTS.md CLAUDE.md GEMINI.md README.md docs 2>/dev/null | head -200
```

## Final response format

```md
Result:
Files changed:
Validation:
Manual owner actions:
Rollback:
Next recommended task:
```
