# 05 Cloudflare Pages Landing

Landing app: `apps/landing/ratehunter-landing`.

## Build settings
- Framework: Next.js
- Root directory: `apps/landing/ratehunter-landing`
- Install command: `pnpm install`
- Build command: `pnpm run build`
- Output directory: `.next` (Git integration) / `.open-next` if using OpenNext flow
- Node version: 20.x

## Environment placeholders
- `CF_PAGES_PROJECT`
- `NYRA_DOMAIN_ROOT`
- Any public app vars in `apps/landing/ratehunter-landing/.env.example`

## How to verify
```bash
cd apps/landing/ratehunter-landing
pnpm install
pnpm run lint
pnpm run test:ci
pnpm run build
```
