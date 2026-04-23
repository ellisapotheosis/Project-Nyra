# RateHunter Landing Page - Cloudflare Pages Deployment Guide

## Overview

This landing page is configured for deployment to Cloudflare Pages using `@opennextjs/cloudflare` adapter for optimal Next.js support with Node.js runtime.

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Wrangler CLI >= 3.99.0
- Cloudflare account with Pages enabled

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Application

```bash
npm run build:cf
```

This produces the `.open-next` output consumed by the Cloudflare deployment flow in this repo.

### 4. Preview Locally

```bash
npm run preview
```

This starts a local Cloudflare Pages development server at `http://localhost:8788`

### 5. Deploy

```bash
# Deploy to preview environment
npm run deploy:preview

# Deploy to production
npm run deploy:production

# Or use the combined command
npm run cf:deploy
```

## Deployment Methods

### Option 1: Cloudflare Pages Git Integration

Use the landing app as the Cloudflare project root so Pages only installs and builds this app:

- **Framework preset**: `Next.js`
- **Root directory**: `apps/landing/ratehunter-landing`
- **Install command**: `npm install`
- **Build command**: `npm run build:cf`
- **Build output directory**: `.open-next/assets`
- **Node version**: `20`

Do not use `/` as the project root in this monorepo. A repo-root install can fail on unrelated workspace packages before the landing app build starts.

#### If your Cloudflare project keeps using repo root (v2 root directory strategy)

If the Cloudflare UI is currently configured with an empty root directory and a `cd ...` build command, use this exact fallback. **Note:** This is a legacy fallback for existing projects that cannot be easily migrated. New Cloudflare Pages projects should always prefer the explicit `apps/landing/ratehunter-landing` root configuration (Option 1) to avoid monorepo isolation issues.

- **Root directory**: *(leave blank)*
- **Install command**: `cd apps/landing/ratehunter-landing && npm install`
- **Build command**: `cd apps/landing/ratehunter-landing && npm run build:cf`
- **Build output directory**: `apps/landing/ratehunter-landing/.open-next/assets`

This avoids `pnpm install` running at monorepo root and prevents frozen-lockfile failures caused by unrelated workspace packages.

### Option 2: Direct Upload / Workers Deploy (Manual or CI)

For manual deployments from your local machine:

```bash
# Build and deploy in one command
npm run build:cf
npm run deploy

# Or step by step
npm run build:cf
npm run deploy
```

## Configuration

### wrangler.toml

The `wrangler.toml` file contains all Cloudflare-specific configuration:

- **name**: `ratehunter-landing`
- **compatibility_date**: `2026-01-20`
- **compatibility_flags**: `["nodejs_compat"]` (enables Node.js APIs)
- **main**: `.open-next/worker.js` (entry point)
- **assets**: `.open-next/assets` (static assets)

### Environment Variables

#### Development (.dev.vars)

Create a `.dev.vars` file for local development:

```bash
# .dev.vars
DATABASE_URL=your_database_url
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Production (Cloudflare Dashboard)

Set production environment variables in the Cloudflare dashboard:

1. Go to Workers & Pages > ratehunter-landing > Settings > Environment Variables
2. Add variables for production and preview environments

Recommended values (**Required for Build/Runtime**):

```bash
NODE_ENV=production
NODE_VERSION=20
NEXT_TELEMETRY_DISABLED=1
```

Optional Project Branding (**Customizable**):

```bash
NEXT_PUBLIC_SITE_NAME=RateHunter
NEXT_PUBLIC_SITE_URL=project-nyra.pages.dev
```

Or use Wrangler CLI:

```bash
npx wrangler pages secret put VARIABLE_NAME
```

## Build Output Structure

After running `npm run build:cf`, the `.open-next` directory contains:

```
.open-next/
├── worker.js          # Cloudflare Worker entry point
├── assets/            # Static assets (CSS, JS, images)
├── cache/             # Build cache
└── server/            # Server-side code
```

## Troubleshooting

### Build Failures

If the build fails, check:

1. **Root directory**: Confirm the Cloudflare project root is `apps/landing/ratehunter-landing`, not `/`

2. **Dependencies**: Ensure app dependencies are installed
   ```bash
   cd apps/landing/ratehunter-landing
   npm install
   ```

3. **Node version**: Check you're using Node.js >= 20
   ```bash
   node --version
   ```

### Deployment Failures

1. **Authentication**: Ensure you're logged in to Cloudflare
   ```bash
   npx wrangler whoami
   ```

2. **Permissions**: Check your Cloudflare account has Pages enabled

3. **Build output**: Verify `.open-next` directory exists after build
   ```bash
   ls -la .open-next
   ```

## Performance Optimizations

This deployment uses:

- **@opennextjs/cloudflare**: Full Next.js support with Node.js runtime
- **Edge caching**: Static assets cached at Cloudflare's edge
- **Automatic optimization**: Images, fonts, and assets optimized automatically
- **Global CDN**: Deployed to 300+ Cloudflare data centers worldwide

## Custom Domain Setup

After deploying, set up a custom domain:

1. In Cloudflare dashboard: Workers & Pages > ratehunter-landing > Custom domains
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `ratehunter.net` or `www.ratehunter.net`)
4. Follow DNS setup instructions

Update `wrangler.toml` to add routes:

```toml
[[routes]]
pattern = "ratehunter.net"
custom_domain = true
```

## Monitoring & Analytics

Enable observability in the Cloudflare dashboard:

- **Analytics**: Real-time traffic and performance metrics
- **Logs**: Real-time tail logs with `npx wrangler tail`
- **Alerts**: Set up alerts for errors and performance issues

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Standard Next.js build |
| `npm run build:cf` | Build OpenNext output for Cloudflare |
| `npm run preview` | Preview Cloudflare build locally |
| `npm run deploy` | Deploy to Cloudflare Pages/Workers |
| `npm run deploy:production` | Deploy to production (main branch) |
| `npm run deploy:preview` | Deploy to preview environment |
| `npm run cf:login` | Login to Cloudflare |
| `npm run cf:deploy` | Standard build plus deploy |

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [@opennextjs/cloudflare](https://opennext.js.org/cloudflare)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## Support

For issues or questions:
- Cloudflare Community: https://community.cloudflare.com/
- Project Issues: Create an issue in the repository
