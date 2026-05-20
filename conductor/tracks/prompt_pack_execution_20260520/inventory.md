# Prompt Pack Inventory

## Imported Prompt Surfaces

- `conductor/prompts/nyra-prompt-pack/`: full Z-drive prompt pack import from `/mnt/z/PromptMax/nyra-prompt-pack`.
- `conductor/prompts/5090dlsprompts/`: direct 5090 DLS prompt snapshot imported from the original prompt folder.

## Prompt Counts

- Full prompt pack Markdown files: 86.
- Finish-line executable prompts: 23.
- 5090 DLS prompt files: 30.

## Repo Shape Observed

- Root package manager: pnpm via `packageManager: pnpm@10.27.0`.
- Workspace globs: `apps/*`, `apps/*/*`, `services/*`, `services/*/*`, `packages/*`.
- Canonical current app roots observed:
  - `apps/projectnyra`: internal product surface package.
  - `apps/ratehunter`: public RateHunter landing package.
- Legacy/source-material app roots observed:
  - `apps/admin`
  - `apps/mortgage-crm`
  - `apps/guidance`
  - `apps/nexusUI`
- Protected app root observed:
  - `apps/twenty`

## Active Business Service Roots Observed

- `services/crm-api`
- `services/lead-ingestion`
- `services/campaign-service`
- `services/compliance-service`
- `services/communication-service`
- `services/quote-service`
- `services/assistant-service`
- `services/webhook-service`

## Shared Package Roots Observed

- `packages/domain-models`
- `packages/integration-adapters`
- `packages/crm-client`
- `packages/crm-types`
- `packages/campaign-domain`
- `packages/compliance-domain`
- `packages/quote-domain`
- `packages/shared`
- `packages/ui`

## Infra Roots Observed

- Canonical host compose roots exist under `infra/hosts/`.
- Legacy or archive infra roots also exist under `infra/cleanup_archive/`, `infra/apps/`, and `infra/services/`; these require care during scans so old material is not treated as active runtime source.

## Prompt/Repo Mismatch Notes

- Prompt pack references older target paths such as `apps/webapp/app` and `apps/landing/ratehunter-landing`.
- Current AGENTS.md and observed packages route canonical apps to `apps/projectnyra` and `apps/ratehunter`.
- Prompt pack references `nyra.ratehunter.net`; current architecture routes platform surfaces under `projectnyra.com` and keeps `ratehunter.net` isolated for the public broker landing page.
- Prompt pack includes stale memory language around Graphiti in 5090 prompt files. Current repo contract explicitly forbids Graphiti and RuVector in the active architecture.

## Initial Dirty Worktree Boundary

The worktree already had unrelated modifications before this prompt-pack execution began, including service/package changes and existing conductor track edits. This track treats those changes as pre-existing and avoids reverting them.
