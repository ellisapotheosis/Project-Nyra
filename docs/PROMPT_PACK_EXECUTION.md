# Prompt Pack Execution Notes

Imported on 2026-05-20 from `/mnt/z/PromptMax/nyra-prompt-pack`.

## Location

- Conductor prompt library: `conductor/prompts/nyra-prompt-pack/`
- Direct 5090 DLS snapshot: `conductor/prompts/5090dlsprompts/`
- Execution track: `conductor/tracks/prompt_pack_execution_20260520/`

## Current Path Mapping

The prompt pack was generated against an older target layout. Use the current repo mapping below when executing it:

| Prompt-Pack Path                                | Current Path                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| `apps/webapp/app`                               | `apps/projectnyra`                                                    |
| `apps/landing/ratehunter-landing`               | `apps/ratehunter`                                                     |
| `nyra.ratehunter.net`                           | `app.projectnyra.com` or another approved `projectnyra.com` subdomain |
| `ratehunter.net` for internal platform surfaces | Not allowed                                                           |

## Execution Rule

The imported prompt files are preserved as historical/source prompts. They are executable only after reconciling them with the current operating contract:

- Twenty CRM is the system of record.
- Compliance and approval gates are explicit service logic.
- n8n and Activepieces are internal execution glue, not business brains.
- OpenClaw is a supervised assistant surface.
- `apps/twenty` is protected.
- RuVector and Graphiti must not be reintroduced.

## Current Queue

The finish-line queue lives in `conductor/prompts/nyra-prompt-pack/finish-line-prompts/` and is tracked in `conductor/tracks/prompt_pack_execution_20260520/plan.md`.
