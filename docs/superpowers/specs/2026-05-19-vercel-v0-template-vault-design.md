# Vercel v0 Template Vault Design

## Goal

Create a reviewable `/templates` surface in the repo root that consolidates the Vercel-style UI templates available in the repo's `v0/*` Git branches. The result should let agents and humans inspect source files, provenance metadata, screenshots, and runnable preview surfaces without copying whole monorepo snapshots into the review area.

## Source Inventory

### Confirmed live `v0/*` branches

- `v0/ellisapotheosis-680b2db9`
- `v0/ellisapotheosis-b588f19e`
- `v0/ellisapotheosis-ec69b011`
- `v0/ellisapotheosis-f394f4ed`

### Observed branch shape

- `v0/ellisapotheosis-680b2db9` is a standalone Next.js v0-style app with top-level `app`, `components`, `hooks`, `lib`, `public`, and `styles`.
- `v0/ellisapotheosis-b588f19e` and `v0/ellisapotheosis-ec69b011` point to the same commit (`853386068f384cb753e2466b337845f0f981966d`) and should be treated as duplicate source labels, not distinct UI payloads.
- `v0/ellisapotheosis-f394f4ed` is a later monorepo snapshot (`904128167d3477219d52f6019c70e5c9fc2a3b49`) containing multiple UI app surfaces under `apps/*`.

## Output Design

### Vault layout

The repo root gets:

```text
templates/
  README.md
  vercel-v0/
    README.md
    index.json
    <template-id>/
      README.md
      template-meta.json
      source/
      preview/
      screenshots/
```

### Template pack contract

Each template pack contains:

- `source/` — extracted UI-facing source files only
- `preview/` — runnable preview surface
- `screenshots/` — static screenshots for quick review
- `template-meta.json` — branch, commit, extracted paths, provenance, and notes
- `README.md` — human summary, preview instructions, and caveats

## Template Selection Rules

Only UI-bearing surfaces are extracted. Infra, services, CI, docs, and unrelated repo scaffolding stay out of the vault.

### Candidate source classes

- Standalone v0 app roots
- Next.js app folders in `apps/*`
- Adjacent component, hook, lib, style, and public asset folders required to render those apps
- Minimal local config needed for preview (`package.json`, `next.config.*`, `postcss.config.*`, `tailwind.config.*`, `tsconfig.json`, `components.json`)

### Excluded classes

- `services/*`
- `infra/*`
- root monorepo config unless needed by a standalone preview
- archive/reference trees already living in the current repo
- backend-only runtime code that is not required to render the template shell

## Preview Strategy

### Static view

Every template gets at least one screenshot so the user can inspect it immediately without running anything.

### Runnable view

Each template also gets a runnable preview folder. There are two preview modes:

- Standalone source: preserve the original lightweight Next.js app shape when possible.
- Monorepo-derived source: build a trimmed local preview wrapper containing only the app-facing files needed to run that surface by itself.

The preview does not need to preserve production integrations; it only needs to render the UI shell reliably enough for visual review.

## Naming Strategy

Template IDs should be stable and descriptive rather than opaque branch IDs. Metadata keeps the exact branch lineage. Duplicate source branches can be recorded in metadata aliases without duplicating extracted content.

Expected initial packs:

- one pack from `v0/ellisapotheosis-680b2db9`
- multiple packs from the later monorepo snapshot for distinct UI surfaces such as admin, landing, nexus UI, mortgage CRM, twenty shell, and webapp if those surfaces can be isolated cleanly

## Tooling

Add a repo-local extraction script so the vault can be regenerated from Git state instead of being hand-maintained. The script should:

1. Read the selected branch/path inventory
2. Export source files from Git directly
3. Write metadata and pack readmes
4. Generate an index for the vault

## Documentation

`/templates/README.md` must explain:

- what the vault contains
- where each template came from
- how to browse screenshots
- how to run a preview
- how to compare packs and mine components safely
- what is intentionally omitted

## Acceptance Criteria

- `/templates` exists and is human-readable
- every template pack has source, metadata, screenshots, and a preview path
- duplicate `v0/*` branches are not copied redundantly
- the root README explains how to use the setup end to end
- previews and screenshots are sufficient for agent review without opening raw branch history first
