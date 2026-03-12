# Cloudflare Pages Deployment - `@nyra/admin`

This app is a **Vite + React** SPA (`apps/web/nyra-admin`). Cloudflare Pages has a built-in Vite preset.

## 1. Git-based Cloudflare Pages project

1. Push your repo to GitHub/GitLab.
2. In Cloudflare, create a new **Pages** project:
   - **Source**: GitHub → `ellisapotheosis/project-nyra`
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Root directory**: `apps/web/nyra-admin`
   - **Build command**: `pnpm --filter @nyra/admin run build`
   - **Build output directory**: `dist`
3. Set environment variables:
   - `NODE_VERSION = 20.18.0`
   - `PNPM_VERSION = 10.27.0`
   - Any app-specific env vars from `apps/web/nyra-admin/.env`.
4. Trigger a build by pushing to `main`.
