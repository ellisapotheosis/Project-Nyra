# 05 - Cloudflare Pages Landing Deploy

## Agent handoff summary
- **Agent B (Cloudflare Pages + Cloudflared + DNS)** analyzed `apps/landing/ratehunter-landing` deployment docs/scripts.

## Project
- Landing app path: `apps/landing/ratehunter-landing`.
- This app is intentionally **not** in Docker Compose and should deploy on Cloudflare Pages.

## Recommended Cloudflare Pages settings
- Framework preset: `Next.js`.
- Root directory: `apps/landing/ratehunter-landing`.
- Install command: `pnpm install`.
- Build command: `pnpm run build`.
- Build output directory: `.next` (Git integration path) or `.open-next` if using Wrangler deployment flow.
- Node version: `20.x`.

## Reality check (repo mismatch to fix)
- `CLOUDFLARE-DEPLOY.md` references `wrangler.toml`, but `wrangler.toml` is currently missing from this folder.
- Default script `build` is `next build`; `build:cf` exists for OpenNext, but deployment docs should match one path consistently.

## Default chosen path
1. Use Cloudflare Pages Git integration with `next build` for now (fastest reproducible baseline).
2. Add `wrangler.toml` later only if Workers-style direct deploy is required.

## Commands
```bash
cd apps/landing/ratehunter-landing
pnpm install
pnpm run lint
pnpm run test:ci
pnpm run build
```

## Secrets
- Put runtime secrets into Cloudflare Pages Environment Variables (Preview + Production).
- Do not commit `.env.local`; keep `.env.example` as template only.
