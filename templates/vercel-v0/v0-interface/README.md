# Vercel v0 Interface

## Summary

Standalone v0-style Next.js interface app exported from the smallest dedicated Vercel branch.

## Provenance

- Primary branch: `v0/ellisapotheosis-680b2db9`
- Primary commit: `83a6ebe5fa3861f2dda421b7b606cabf1f20d4b7`
- Extracted path: `.`
- Template kind: `standalone-next-app`

### Related branches

- None recorded

## Extracted Source Layout

Top-level extracted directories/files:

- `.gitignore`
- `app`
- `components`
- `components.json`
- `hooks`
- `lib`
- `next.config.mjs`
- `package.json`
- `pnpm-lock.yaml`
- `postcss.config.mjs`
- `public`
- `styles`
- `tsconfig.json`

## Local Review

- Screenshots: [screenshots](./screenshots)
- Preview app: [preview](./preview)
- Source files: [source](./source)
- Metadata: [template-meta.json](./template-meta.json)

## Current Status

- Screenshot: ready at [screenshots/home.png](./screenshots/home.png)
- Preview: working on `http://localhost:4310`

## Preview Commands

```bash
cd templates/vercel-v0/v0-interface/preview
npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps
npm exec next dev -- -p 4310
```

Open: [http://localhost:4310](http://localhost:4310)

## Notes

- This is the only confirmed standalone v0 branch in the repo.
- The branch root already contains the full preview app shape.
