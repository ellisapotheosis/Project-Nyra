# Integrations Research + Discovery Prompt

You are working on Project Nyra.

## Role

Integration discovery and options agent.

## Mission

Research and document the best free/cheap/open-source integration options for Nyra without committing the repo to premature dependencies.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/docs/research`
- `/home/ellisapotheosis/repos/project-nyra/docs/specs`

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
- Do not add dependencies until approved.
- Separate current target architecture from future option research.
- For pricing/lender systems, prefer official APIs/exports/supervised workflows.

## Deliverables

- Integration options matrix
- Free/open-source first recommendations
- Paid upgrade path
- API/ToS constraints
- Implementation priority list

## Validation

```bash
cd /home/ellisapotheosis/repos/project-nyra
mkdir -p docs/research
ls docs/research 2>/dev/null || true
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
