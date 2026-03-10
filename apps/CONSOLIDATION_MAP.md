# Apps Consolidation Map

This map tracks app/UI material that was previously isolated in archived or ingest upload locations and is now integrated into active `apps/` paths.

## Canonical Paths

- `apps/landing/ratehunter-landing` is restored as the canonical Cloudflare Pages path.
- `apps/admin` is promoted from ingestion scaffold content (`nyra-admin`).
- `apps/webapp/modules/*` now contains recovered mortgage/UI modules.
- `apps/nyra-voice` contains recovered voice integration assets and scripts.

## Source to Target Migrations

| Source | Target | Status | Notes |
|---|---|---|---|
| `apps/landing/app/*` | `apps/landing/ratehunter-landing/*` | complete | Restores Cloudflare Pages build path expected by existing deployment config. |
| `apps/shared/assets/uploads/ingest/nyra-admin/*` | `apps/admin/*` | complete | Replaced admin stub with fuller Next.js scaffold and route pages. |
| `apps/shared/assets/uploads/ingest/nyra-webapp/nyra-front-end/mortgage-services/*` | `apps/webapp/modules/mortgage-services/*` | complete | Recovered service-focused UI module. |
| `apps/shared/assets/uploads/ingest/nyra-webapp/nyra-front-end/mortgage-ui/*` | `apps/webapp/modules/mortgage-ui/*` | complete | Recovered UI-focused mortgage frontend module. |
| `apps/shared/assets/uploads/ingest/nyra-webapp/nyra-front-end/UI-draft/*` | `apps/webapp/modules/ui-draft/*` | complete | Preserved draft UI artifacts for active integration. |
| `apps/shared/assets/uploads/ingest/nyra-webapp/Dyad/*.txt` + `intake-form.html` | `apps/webapp/modules/legacy-prompts/*` | complete | Preserved prompt and intake assets for refinement. |
| `apps/shared/assets/uploads/ingest/apps/nyra-voice/*` | `apps/nyra-voice/*` | complete | Integrated voice app payload into active app tree. |
| `apps/shared/assets/uploads/ingest/apps/mortgage-crm/CLAUDE.md` | `apps/mortgage-crm/CLAUDE.md` | complete | Scaffold seed imported; implementation pending. |
| `apps/shared/assets/uploads/ingest/apps/nyra-assistant/CLAUDE.md` | `apps/nyra-assistant/CLAUDE.md` | complete | Scaffold seed imported; implementation pending. |

## Remaining Manual Merge Backlog

- Deep-merge recovered webapp modules into the primary runtime app entry points under `apps/webapp/app`.
- Normalize duplicated docs between `apps/landing/app` and `apps/landing/ratehunter-landing`.
- Curate large media assets (especially under voice and ingest paths) for storage cost and deployment footprint.
