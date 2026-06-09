# Templates

This folder is the repo-local review vault for reusable UI templates recovered from Project Nyra's Vercel-style `v0/*` branches.

## Purpose

Use this area to inspect older Vercel-derived UI work without merging those branches directly into the active apps. Each template pack is designed for agent review and selective component mining.

## Structure

- [vercel-v0](./vercel-v0/README.md) — curated packs extracted from live `v0/*` branches
- [vercel-uploads](./vercel-uploads/README.md) — packs imported from the supplied Vercel template zip files

Each template pack contains:

- `source/` — extracted UI files
- `preview/` — local runnable preview app
- `screenshots/` — static image review artifacts
- `template-meta.json` — branch, commit, path, and notes
- `README.md` — pack-specific guidance

## Current Packs

### Branch-derived packs

- [Vercel v0 Interface](./vercel-v0/v0-interface/README.md) — source `v0/ellisapotheosis-680b2db9`, preview port `4310`
- [Nyra Admin Dashboard](./vercel-v0/nyra-admin-dashboard/README.md) — source `v0/ellisapotheosis-f394f4ed`, preview port `4311`
- [RateHunter Landing Legacy](./vercel-v0/ratehunter-landing-legacy/README.md) — source `v0/ellisapotheosis-f394f4ed`, preview port `4312`
- [Mortgage CRM Dashboard](./vercel-v0/mortgage-crm-dashboard/README.md) — source `v0/ellisapotheosis-f394f4ed`, preview port `4313`
- [Nexus UI Console](./vercel-v0/nexus-ui-console/README.md) — source `v0/ellisapotheosis-f394f4ed`, preview port `4314`
- [Mortgage Assistant Webapp](./vercel-v0/mortgage-assistant-webapp/README.md) — source `v0/ellisapotheosis-f394f4ed`, preview port `4315`

### Uploaded zip packs

- [Frosted Authentication Page](./vercel-uploads/frosted-authentication-page/README.md) — source `frosted-authentication-page.zip`, preview port `4320`
- [Frosted Glass CRM Dashboard](./vercel-uploads/frosted-glass-ui-crm-dashboard/README.md) — source `frosted-glass-ui-crm-dashboard-ui-design.zip`, preview port `4321`
- [Mail Template Builder](./vercel-uploads/mail-template-builder/README.md) — source `mail-template-builder-1.0.0.zip`, preview port `4322`
- [Sales Ops Dashboard](./vercel-uploads/sales-ops-dashboard/README.md) — source `sales-ops-dashboard.zip`, preview port `4323`
- [v0 Sales CRM Design](./vercel-uploads/v0-sales-crm-design/README.md) — source `v0-sales-crm-design-main.zip`, preview port `4324`

## Current Review Status

| Template | Screenshot | Preview | Notes |
| --- | --- | --- | --- |
| `v0-interface` | ready | ready | Clean standalone v0 app. |
| `ratehunter-landing-legacy` | ready | ready | Good for landing-page sections and brochure patterns. |
| `mortgage-assistant-webapp` | ready | ready | Richest broker-facing app shell and component source. |
| `nyra-admin-dashboard` | not captured | blocked | Missing `@/lib/utils` from `src/components/layout/Sidebar.tsx`. |
| `mortgage-crm-dashboard` | not captured | blocked | Missing `class-variance-authority` from `src/components/ui/badge.tsx`. |
| `nexus-ui-console` | not captured | blocked | Missing `@/lib/settings` from `components/nexus-console.tsx`. |
| `frosted-authentication-page` | ready | ready | Uploaded zip pack. |
| `frosted-glass-ui-crm-dashboard` | ready | ready | Uploaded zip pack. |
| `mail-template-builder` | ready | ready | Uploaded zip pack. |
| `sales-ops-dashboard` | ready | ready | Uploaded zip pack. |
| `v0-sales-crm-design` | not captured | blocked | Missing `react-is` from `recharts`, imported through `components/overview.tsx`. |

## How To View

### 1. Quick visual scan

Browse the `screenshots/` directory inside each pack first. This is the fastest way to compare layouts without installing anything.

The quickest starting set is:

- [v0-interface screenshot](./vercel-v0/v0-interface/screenshots/home.png)
- [ratehunter-landing-legacy screenshot](./vercel-v0/ratehunter-landing-legacy/screenshots/home.png)
- [mortgage-assistant-webapp screenshot](./vercel-v0/mortgage-assistant-webapp/screenshots/home.png)
- [frosted-authentication-page screenshot](./vercel-uploads/frosted-authentication-page/screenshots/home.png)
- [frosted-glass-ui-crm-dashboard screenshot](./vercel-uploads/frosted-glass-ui-crm-dashboard/screenshots/home.png)
- [mail-template-builder screenshot](./vercel-uploads/mail-template-builder/screenshots/home.png)
- [sales-ops-dashboard screenshot](./vercel-uploads/sales-ops-dashboard/screenshots/home.png)

### 2. Open a local preview

```bash
cd templates/vercel-v0/<template-id>/preview
npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps
npm exec next dev -- -p <port-from-template-meta>
```

Then open `http://localhost:<port>`.

If a preview does not render, check that pack's `template-meta.json` first. I recorded the current known blockers there so you can distinguish runtime breakage from extraction issues.

### 3. Review provenance before mining code

Open each pack's `template-meta.json` and `README.md` to confirm:

- which branch it came from
- which path was extracted
- whether there were related duplicate branches
- what caveats apply to the preview

## Recommended Workflow

1. Start in [vercel-v0/index.json](./vercel-v0/index.json) or [vercel-v0/README.md](./vercel-v0/README.md)
2. Compare screenshots across candidate packs
3. Launch the preview for the most promising pack
4. Mine reusable components from `source/`, not from the original branch
5. Prioritize `mortgage-assistant-webapp`, `ratehunter-landing-legacy`, and `v0-interface` first because they already have screenshots and working previews
6. Port useful patterns into real apps selectively instead of wholesale copying

## What This Vault Intentionally Omits

- full monorepo snapshots
- backend services and infra
- CI and deployment scaffolding that is irrelevant to UI review
- any claim that these previews are production-authoritative app sources

## Refresh / Rebuild

Regenerate the vault from Git:

```bash
bash scripts/templates/extract-vercel-v0.sh
```

Regenerate the uploaded zip packs after staging the zips locally:

```bash
VERCEL_TEMPLATE_ZIP_DIR=.tmp/vercel-template-zips node scripts/templates/import-vercel-upload-zips.mjs
```

Attempt screenshot capture:

```bash
node scripts/templates/capture-vercel-v0-screenshots.mjs
node scripts/templates/capture-vercel-upload-screenshots.mjs
```
