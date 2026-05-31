# RateHunter Landing Legacy

## Summary

Marketing landing page shell with brochure sections, lead capture form, and Cloudflare Pages-oriented assets.

## Provenance

- Primary branch: `v0/ellisapotheosis-f394f4ed`
- Primary commit: `904128167d3477219d52f6019c70e5c9fc2a3b49`
- Extracted path: `apps/landing/app`
- Template kind: `monorepo-app-extract`

### Related branches

- `v0/ellisapotheosis-b588f19e` @ `853386068f384cb753e2466b337845f0f981966d` — Earlier monorepo snapshot with similar landing surface.
- `v0/ellisapotheosis-ec69b011` @ `853386068f384cb753e2466b337845f0f981966d` — Duplicate branch label pointing at the same earlier monorepo commit.

## Extracted Source Layout

Top-level extracted directories/files:

- `.cfignore`
- `.env.example`
- `.eslintrc.json`
- `.gitignore`
- `CLOUDFLARE-DEPLOY.md`
- `CLOUDFLARE-SETUP.md`
- `DEPLOYMENT-CHECKLIST.md`
- `QUICK-START.md`
- `README.md`
- `SECRETS-TROUBLESHOOTING.md`
- `jest.config.js`
- `jest.setup.js`
- `next-env.d.ts`
- `next.config.js`
- `open-next.config.ts`
- `package.json`
- `postcss.config.mjs`
- `public`
- `src`
- `tailwind.config.ts`
- `tsconfig.json`
- `wrangler.toml`

## Local Review

- Screenshots: [screenshots](./screenshots)
- Preview app: [preview](./preview)
- Source files: [source](./source)
- Metadata: [template-meta.json](./template-meta.json)

## Current Status

- Screenshot: ready at [screenshots/home.png](./screenshots/home.png)
- Preview: working on `http://localhost:4312`

## Preview Commands

```bash
cd templates/vercel-v0/ratehunter-landing-legacy/preview
npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps
npm exec next dev -- -p 4312
```

Open: [http://localhost:4312](http://localhost:4312)

## Notes

- Includes legacy landing page deployment files because they directly influence local rendering.
- This is preserved as a review artifact and not proposed as the current production app source.
