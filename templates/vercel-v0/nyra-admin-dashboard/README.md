# Nyra Admin Dashboard

## Summary

Authentication-ready admin dashboard with broker operations shell, lead pages, and quote desk UI.

## Provenance

- Primary branch: `v0/ellisapotheosis-f394f4ed`
- Primary commit: `904128167d3477219d52f6019c70e5c9fc2a3b49`
- Extracted path: `apps/admin/app`
- Template kind: `monorepo-app-extract`

### Related branches

- `v0/ellisapotheosis-b588f19e` @ `853386068f384cb753e2466b337845f0f981966d` — Earlier monorepo snapshot with similar UI surface.
- `v0/ellisapotheosis-ec69b011` @ `853386068f384cb753e2466b337845f0f981966d` — Duplicate branch label pointing at the same earlier monorepo commit.

## Extracted Source Layout

Top-level extracted directories/files:

- `README.md`
- `layout.tsx`
- `next-env.d.ts`
- `next.config.mjs`
- `package.json`
- `page.tsx`
- `src`
- `tailwind.config.ts`
- `tsconfig.json`

## Local Review

- Screenshots: [screenshots](./screenshots)
- Preview app: [preview](./preview)
- Source files: [source](./source)
- Metadata: [template-meta.json](./template-meta.json)

## Current Status

- Screenshot: not captured yet
- Preview blocker: missing `@/lib/utils` from `src/components/layout/Sidebar.tsx`

## Preview Commands

```bash
cd templates/vercel-v0/nyra-admin-dashboard/preview
npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps
npm exec next dev -- -p 4311
```

Open: [http://localhost:4311](http://localhost:4311)

## Notes

- Trimmed from the later monorepo snapshot to keep only the view layer and local app config.
- Contains auth API routes in the extracted preview but is intended for UI review rather than live auth integration.
