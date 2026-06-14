# Memory Stack Prompt

You are working on Project Nyra.

## Role

Memory and context architecture agent.

## Mission

Implement or document the approved memory/context hierarchy so CRM and event logs remain source of truth while Mem0/FalkorDB/Redis provide retrieval and relationship context.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/services/assistant-service`
- `/home/ellisapotheosis/repos/project-nyra/infra`
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
- CRM/event ledger outrank memory stores.
- Do not reintroduce deprecated memory components as target architecture.
- Memory cannot silently become the business database.

## Deliverables

- Memory hierarchy spec
- Context retrieval API contract
- PII retention rules
- Cache invalidation notes
- Audit/logging plan

## Validation

```bash
cd /home/ellisapotheosis/repos/project-nyra
grep -RInE "Mem0|FalkorDB|Redis|OpenMemory|Letta|Graphiti|RuVector" docs services infra 2>/dev/null | head -200
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
