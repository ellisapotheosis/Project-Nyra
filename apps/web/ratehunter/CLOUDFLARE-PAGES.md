# Cloudflare Pages Deployment - `@nyra/ratehunter`

This app is a **Next.js 15** project (`apps/web/ratehunter`). You can deploy it to Cloudflare Pages using Git integration.

## 1. Git-based Cloudflare Pages project

1. Make sure your repo is mirrored to GitHub:
   ```bash
   cd ~/project-nyra
   git remote add github git@github.com:ellisapotheosis/project-nyra.git  # if not already
   git push github main
   ```
2. In the Cloudflare dashboard, create a new **Pages** project:
   - **Source**: GitHub → `ellisapotheosis/project-nyra`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Root directory**: `apps/web/ratehunter`
   - **Build command**: `pnpm --filter @nyra/ratehunter run build`
   - **Output directory**: leave blank (Cloudflare auto-detects for Next.js 15)
3. Set environment variables in the Pages project:
   - `NODE_VERSION = 20.18.0`
   - `PNPM_VERSION = 10.27.0`
   - Any app-specific env vars from `apps/web/ratehunter/.env` (API endpoints, etc.).
4. Save and trigger the initial build by pushing to `main`.

## 2. Optional: Wrangler-based deploy from CI

If you use Gitea Actions or other CI, you can:

1. Add a deploy script (example) to `apps/web/ratehunter/package.json`:
   ```jsonc
   {
     "scripts": {
       "build:cf": "next build",
       "deploy:cf": "pnpm run build:cf && npx wrangler pages deploy .next --project-name=nyra-ratehunter --branch=main"
     }
   }
   ```
2. In CI, run:
   ```bash
   pnpm --filter @nyra/ratehunter install
   pnpm --filter @nyra/ratehunter run deploy:cf
   ```
3. Store these secrets in CI / Cloudflare (you must do this manually):
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

> This repo only provides scripts/docs. You must create Cloudflare projects and API tokens yourself in the Cloudflare dashboard.