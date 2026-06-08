# QA + Smoke + Release Prompt

You are working on Project Nyra.

## Role

Final validation and release agent.

## Mission

Build a release-quality smoke test suite and release checklist for the landing app, internal webapp, CRM API, campaign service, quote service, assistant service, and infra endpoints.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/scripts`
- `/home/ellisapotheosis/repos/project-nyra/docs/deployment`
- `/home/ellisapotheosis/repos/project-nyra/apps`
- `/home/ellisapotheosis/repos/project-nyra/services`

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
- Do not mark release-ready if core builds fail.
- Document failures honestly with smallest next fix.

## Deliverables

- Smoke scripts
- Release checklist
- Rollback checklist
- Known blocker list
- Validation matrix

## Validation

```bash
cd /home/ellisapotheosis/repos/project-nyra
pnpm -w lint
pnpm -w test
pnpm -w build
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
