# 06 Final Mega Repo Truth Conductor Handoff Archival Prompt

Use this lane for repo truth, conductor coordination, handoff, stale prompt cleanup, prompt-pack replacement, app archival decisions, source-of-truth clarification, PR review guidance, and final release sequencing.

Do not use this prompt for normal UI implementation, backend product services, or infra changes unless the task is to coordinate/sequence them and prevent drift.

## Mission

Keep agents from duplicating completed work, resurrecting dead architecture, editing protected apps, or confusing prototypes with active products.

Every conductor assignment must state:

- what was inspected
- what is active/protected/deprecated
- what was archived or marked superseded
- owner actions
- next lane assignments
- validation output
- what could not be changed

## Active App Decision Matrix

| Path                          | Status                          | Action                                                           |
| ----------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| `apps/ratehunter`             | Active public landing           | Keep, finish, no internal routes                                 |
| `apps/projectnyra`            | Active internal webapp          | Keep, deepen, connect                                            |
| `apps/admin/app`              | Prototype/source material       | Archive after verifying widgets/stats/quote value migrated       |
| `apps/mortgage-crm`           | Prototype/source material       | Archive after verifying lead/application/pipeline value migrated |
| `apps/nexusUI`                | Specialist standalone tool      | Keep or wrap through `/tools/nexus`                              |
| `apps/twenty`                 | Protected CRM shell             | Do not edit except explicit owner-approved maintenance           |
| `apps/twenty-crm`             | CRM integration/config material | Keep as reference/integration anchor                             |
| `apps/guidance/references/**` | Frozen reference archive        | Read-only unless deliberate archival cleanup                     |

## Completed Work Recognition

Do not assign agents to redo:

- backup/inventory unless missing or stale
- initial route tree creation for `apps/projectnyra`
- adding `/settings` if it already exists
- removing stale internal `/admin` route if already removed
- importing TweakCN/shadCN tokens if already present
- copying the same webapp-merge snapshot again

Assign agents to remaining deltas:

- UI polish and mobile nav
- CRM live data and lead detail workspace
- campaign service completion
- quote service completion
- auth cleanup
- tests and validation
- advanced services only after the core path works

## Prompt Routing

- Prompt 03: UI, UX, landing, webapp, dashboards, lead detail, campaign-builder UI, quote UI, tool wrappers, Live Radar UI.
- Prompt 04: Product services, CRM adapters, lead ingestion, campaign/compliance engine, quote engine, soft-pull credit, LendingPad, documents, workflow IR, assistant service contracts.
- Prompt 05: Infra, hosts, Compose, Cloudflare/Tailscale, Infisical, workers, model routing, MCP runtime, memory runtime, observability, smoke/release.
- Prompt 06: Repo truth, handoff, app archival, stale docs, conductor sequencing, owner actions, PR/branch coordination.

If a task spans lanes, split it and leave explicit ownership.

## Finish-Line Sequence

1. Repo truth and prompt cleanup.
2. UI smoke pass: internal route tree, mobile nav, stale colors, landing audit.
3. CRM/domain contract audit: lead, consent, campaign, quote, application, event ledger.
4. Lead intake to CRM write path.
5. Campaign/compliance send gating.
6. Quote service and quote UI review path.
7. Auth/platform cleanup.
8. WebSocket/Live Radar events.
9. LendingPad milestone sync.
10. Soft-pull credit service.
11. Voice/voicemail, asset verification, OCR/DTI, market hooks, analytics.
12. Release smoke, owner actions, and handoff.

## Archival Rule

Do not delete prototypes until useful functionality is confirmed migrated or intentionally rejected. Move/archive with a report, not a blind deletion. Update route maps and docs after archival.

## Validation

```bash
find apps/guidance -type f | sort
rg -n "^<<<<<<<|^=======|^>>>>>>>" apps/guidance
rg -n "claude-flow|ruvector" apps/guidance docs infra services packages --glob '!**/node_modules/**'
rg -n "03-FINAL|04-FINAL|05-FINAL|06-FINAL" apps/guidance
```
