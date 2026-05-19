# Nexus UI Console

## Summary

Control-plane dashboard for Nexus Router settings, tool groups, and LiteLLM-oriented operations UI.

## Provenance

- Primary branch: `v0/ellisapotheosis-f394f4ed`
- Primary commit: `904128167d3477219d52f6019c70e5c9fc2a3b49`
- Extracted path: `apps/nexusUI`
- Template kind: `monorepo-app-extract`

### Related branches

- `v0/ellisapotheosis-b588f19e` @ `853386068f384cb753e2466b337845f0f981966d` — Earlier monorepo snapshot with similar control-plane UI surface.
- `v0/ellisapotheosis-ec69b011` @ `853386068f384cb753e2466b337845f0f981966d` — Duplicate branch label pointing at the same earlier monorepo commit.

## Extracted Source Layout

Top-level extracted directories/files:

- `.env.example`
- `.gitignore`
- `PROMPT.md`
- `README.md`
- `app`
- `components`
- `components.json`
- `docs`
- `next-env.d.ts`
- `next.config.mjs`
- `package.json`
- `postcss.config.mjs`
- `public`
- `tsconfig.json`

## Local Review

- Screenshots: [screenshots](./screenshots)
- Preview app: [preview](./preview)
- Source files: [source](./source)
- Metadata: [template-meta.json](./template-meta.json)

## Current Status

- Screenshot: not captured yet
- Preview blocker: missing `@/lib/settings` from `components/nexus-console.tsx`

## Preview Commands

```bash
cd templates/vercel-v0/nexus-ui-console/preview
npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps
npm exec next dev -- -p 4314
```

Open: [http://localhost:4314](http://localhost:4314)

## Notes

- This pack is useful as a dashboard/control-console template source.
- The preview is meant for local visual inspection, not production config mutation.
