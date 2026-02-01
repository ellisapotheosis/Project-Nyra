# Cloudflare Pages Deployment - `@nyra/nexus-dashboard`

This app is a **Next.js 15** project (`apps/nexus-dashboard`). You can deploy it to Cloudflare Pages via **Git integration**.

## 1. Git-based Cloudflare Pages project

1. Push your repo to GitHub/GitLab.
2. In Cloudflare, create a new **Pages** project:
   - **Source**: GitHub → `ellisapotheosis/project-nyra`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Root directory**: `apps/nexus-dashboard`
   - **Build command**: `pnpm --filter @nyra/nexus-dashboard run build`
   - **Output directory**: leave blank (auto-detected)
3. Set environment variables:
   - `NODE_VERSION = 20.18.0`
   - `PNPM_VERSION = 10.27.0`
   - Any runtime env vars required by the dashboard.
4. Trigger a build by pushing to `main`.
