# Mortgage CRM Dashboard

## Summary

Standalone mortgage CRM prototype with Kanban-style UI, lead pages, and shell components.

## Provenance

- Primary branch: `v0/ellisapotheosis-f394f4ed`
- Primary commit: `904128167d3477219d52f6019c70e5c9fc2a3b49`
- Extracted path: `apps/mortgage-crm`
- Template kind: `monorepo-app-extract`

### Related branches

- `v0/ellisapotheosis-b588f19e` @ `853386068f384cb753e2466b337845f0f981966d` — Earlier monorepo snapshot with similar CRM UI surface.
- `v0/ellisapotheosis-ec69b011` @ `853386068f384cb753e2466b337845f0f981966d` — Duplicate branch label pointing at the same earlier monorepo commit.

## Extracted Source Layout

Top-level extracted directories/files:

- `components.json`
- `jest.config.js`
- `next-env.d.ts`
- `package.json`
- `postcss.config.js`
- `prisma`
- `src`
- `tailwind.config.ts`
- `tests`
- `tsconfig.json`

## Local Review

- Screenshots: [screenshots](./screenshots)
- Preview app: [preview](./preview)
- Source files: [source](./source)
- Metadata: [template-meta.json](./template-meta.json)

## Current Status

- Screenshot: not captured yet
- Preview blocker: missing `class-variance-authority` from `src/components/ui/badge.tsx`

## Preview Commands

```bash
cd templates/vercel-v0/mortgage-crm-dashboard/preview
npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps
npm exec next dev -- -p 4313
```

Open: [http://localhost:4313](http://localhost:4313)

## Notes

- Includes UI-adjacent API routes because they sit inside the app package.
- Any backend integration is treated as non-authoritative; the vault is for UI mining.
