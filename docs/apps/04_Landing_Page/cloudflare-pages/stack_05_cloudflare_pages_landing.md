# 05 - Cloudflare Pages Landing Deploy

## Agent handoff summary
- **Agent B (Cloudflare Pages + Cloudflared + DNS)** analyzed `apps/landing/ratehunter-landing` deployment docs/scripts.

## Project
- Landing app path: `apps/landing/ratehunter-landing`.
- This app is intentionally **not** in Docker Compose and should deploy on Cloudflare Pages.

## Recommended Cloudflare Pages settings
- Framework preset: `Next.js`.
- Root directory: `apps/landing/ratehunter-landing`.
- Install command: `npm install`.
- Build command: `npm run build:cf`.
- Build output directory: `.open-next/assets`.
- Node version: `20.x`.
- Environment variables:
  - `NODE_VERSION=20`
  - `NODE_ENV=production`
  - `NEXT_TELEMETRY_DISABLED=1`
  - `NEXT_PUBLIC_SITE_URL=https://<your-domain>`
  - `NEXT_PUBLIC_SITE_NAME=RateHunter`

## Why this root matters
- Do **not** use `/` as the Cloudflare root directory for this repo.
- A repo-root install pulls the whole monorepo and can fail on unrelated workspaces before the landing app build runs.
- Using the app directory as root matches the tested local command: `cd apps/landing/ratehunter-landing && npm install && npm run build:cf`.

## Current repo truth
- `wrangler.toml` already exists in the app root.
- `wrangler.toml` points `main` at `.open-next/worker.js`.
- `wrangler.toml` points `assets.directory` at `.open-next/assets`.
- `npm run build:cf` successfully produces the expected OpenNext output.

## Commands
```bash
cd apps/landing/ratehunter-landing
npm install
npm run lint
npm run test:ci
npm run build:cf
```

## Secrets
- Put runtime secrets into Cloudflare Pages Environment Variables (Preview + Production).
- Do not commit `.env.local`; keep `.env.example` as template only.
