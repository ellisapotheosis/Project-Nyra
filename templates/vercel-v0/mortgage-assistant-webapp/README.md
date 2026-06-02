# Mortgage Assistant Webapp

## Summary

Broker-facing command-center UI with campaigns, leads, assistant, quotes, and pipeline review surfaces.

## Provenance

- Primary branch: `v0/ellisapotheosis-f394f4ed`
- Primary commit: `904128167d3477219d52f6019c70e5c9fc2a3b49`
- Extracted path: `apps/webapp/app`
- Template kind: `monorepo-app-extract`

### Related branches

- `v0/ellisapotheosis-b588f19e` @ `853386068f384cb753e2466b337845f0f981966d` — Earlier monorepo snapshot with similar broker webapp surface.
- `v0/ellisapotheosis-ec69b011` @ `853386068f384cb753e2466b337845f0f981966d` — Duplicate branch label pointing at the same earlier monorepo commit.

## Extracted Source Layout

Top-level extracted directories/files:

- `.env.example`
- `.gitignore`
- `.omc`
- `CLOUDFLARE-PAGES.md`
- `app`
- `components`
- `components.json`
- `jest.config.js`
- `jest.setup.js`
- `lib`
- `middleware.ts`
- `next-env.d.ts`
- `next.config.js`
- `package.json`
- `postcss.config.js`
- `tailwind.config.js`
- `tsconfig.json`
- `types`

## Local Review

- Screenshots: [screenshots](./screenshots)
- Preview app: [preview](./preview)
- Source files: [source](./source)
- Metadata: [template-meta.json](./template-meta.json)

## Current Status

- Screenshot: ready at [screenshots/home.png](./screenshots/home.png)
- Preview: working on `http://localhost:4315`

## Preview Commands

```bash
cd templates/vercel-v0/mortgage-assistant-webapp/preview
npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps
npm exec next dev -- -p 4315
```

Open: [http://localhost:4315](http://localhost:4315)

## Notes

- This is the richest reusable component source among the monorepo-derived templates.
- The preview is intentionally self-contained and may rely on mock/local app data rather than live services.
