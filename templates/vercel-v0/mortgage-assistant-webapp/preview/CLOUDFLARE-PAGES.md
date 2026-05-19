# Cloudflare Pages Deployment - `mortgage-assistant`

This app is a **Next.js 14** project (`apps/web/mortgage-assistant`). You can deploy it to Cloudflare Pages either via **Git integration** (recommended) or via **Wrangler CLI**.

## 1. Git-based Cloudflare Pages project (recommended)

1. Push your repo to GitHub (or GitLab):
   ```bash
   cd ~/project-nyra
   git remote add github git@github.com:ellisapotheosis/project-nyra.git  # if not already
   git push github main
   ```
2. In the Cloudflare dashboard, create a new **Pages** project:
   - **Source**: GitHub → `ellisapotheosis/project-nyra`
   - **Production branch**: `main` (or your main branch)
   - **Framework preset**: `Next.js`
   - **Build command**: `pnpm --filter mortgage-assistant run build`
   - **Build output directory**: leave blank (Cloudflare will detect Next.js and use `.next`)
   - **Root directory**: `apps/web/mortgage-assistant`
3. Set environment variables in the Pages project:
   - `NODE_VERSION = 20.18.0` (or your current Node 20.x)
   - `PNPM_VERSION = 10.27.0`
   - Any app-specific env vars (e.g. API URLs, keys) from `apps/web/mortgage-assistant/.env`.
4. Trigger a build by pushing to the selected branch.

## 2. Optional: Deploy via Wrangler CLI

If you prefer to deploy from CI (Gitea Actions) or from WSL, you can use `wrangler pages`:

1. Ensure Wrangler is available (already a dev dependency in the monorepo root or install via pnpm):
   ```bash
   cd ~/project-nyra/apps/web/mortgage-assistant
   pnpm install
   pnpm dlx wrangler@latest --version
   ```
2. Create a Pages project in Cloudflare (one-time, via dashboard or CLI) named e.g. `mortgage-assistant`.
3. Add a deploy script to `package.json` (optional, shown here for reference):
   ```jsonc
   {
     "scripts": {
       "build:cf": "next build",
       "deploy:cf": "pnpm run build:cf && npx wrangler pages deploy .next --project-name=mortgage-assistant --branch=main"
     }
   }
   ```
4. In Cloudflare, create a Pages project with:
   - **Build command**: `npm run build:cf`
   - **Output directory**: `.next` (or use the Pages Next.js preset)

### Required secrets (you must set these manually)

- `CLOUDFLARE_API_TOKEN` with `Cloudflare Pages` / `Workers Scripts` permissions if you use Wrangler from CI.
- `CLOUDFLARE_ACCOUNT_ID` for your account.

> **You will need to create and store these secrets manually in Cloudflare and/or your CI (Gitea Actions). This repo only provides the scripts and configuration; it does not store any credentials.**
