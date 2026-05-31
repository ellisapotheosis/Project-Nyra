# Vercel v0 Template Vault

This vault consolidates the Vercel-style UI template material currently recoverable from the repo's live `v0/*` Git branches.

## What is included

- curated source extracts for each UI surface
- provenance metadata for branch and commit lineage
- local preview app folders
- screenshot output folders for quick visual review

## Template Packs

| ID | Display Name | Primary Branch | Guide | Preview | Screenshots |
| --- | --- | --- | --- | --- | --- |
| `v0-interface` | Vercel v0 Interface | `v0/ellisapotheosis-680b2db9` | [README](./v0-interface/README.md) | [Preview](./v0-interface/preview) | [Screenshots](./v0-interface/screenshots) |
| `nyra-admin-dashboard` | Nyra Admin Dashboard | `v0/ellisapotheosis-f394f4ed` | [README](./nyra-admin-dashboard/README.md) | [Preview](./nyra-admin-dashboard/preview) | [Screenshots](./nyra-admin-dashboard/screenshots) |
| `ratehunter-landing-legacy` | RateHunter Landing Legacy | `v0/ellisapotheosis-f394f4ed` | [README](./ratehunter-landing-legacy/README.md) | [Preview](./ratehunter-landing-legacy/preview) | [Screenshots](./ratehunter-landing-legacy/screenshots) |
| `mortgage-crm-dashboard` | Mortgage CRM Dashboard | `v0/ellisapotheosis-f394f4ed` | [README](./mortgage-crm-dashboard/README.md) | [Preview](./mortgage-crm-dashboard/preview) | [Screenshots](./mortgage-crm-dashboard/screenshots) |
| `nexus-ui-console` | Nexus UI Console | `v0/ellisapotheosis-f394f4ed` | [README](./nexus-ui-console/README.md) | [Preview](./nexus-ui-console/preview) | [Screenshots](./nexus-ui-console/screenshots) |
| `mortgage-assistant-webapp` | Mortgage Assistant Webapp | `v0/ellisapotheosis-f394f4ed` | [README](./mortgage-assistant-webapp/README.md) | [Preview](./mortgage-assistant-webapp/preview) | [Screenshots](./mortgage-assistant-webapp/screenshots) |

## Runtime Status

| ID | Screenshot | Preview | Current blocker |
| --- | --- | --- | --- |
| `v0-interface` | ready | ready | none |
| `ratehunter-landing-legacy` | ready | ready | none |
| `mortgage-assistant-webapp` | ready | ready | none |
| `nyra-admin-dashboard` | pending | blocked | missing `@/lib/utils` |
| `mortgage-crm-dashboard` | pending | blocked | missing `class-variance-authority` |
| `nexus-ui-console` | pending | blocked | missing `@/lib/settings` |

## Regeneration

```bash
bash scripts/templates/extract-vercel-v0.sh
```

## Screenshot Capture

```bash
node scripts/templates/capture-vercel-v0-screenshots.mjs
```
