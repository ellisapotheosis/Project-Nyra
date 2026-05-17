# RateHunter Landing Page - Cloudflare Pages Deployment Guide

## Overview

This landing page is configured for deployment to Cloudflare Pages using `@opennextjs/cloudflare` adapter for optimal Next.js support with Node.js runtime.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0
- Wrangler CLI >= 3.99.0
- Cloudflare account with Pages enabled

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build the Application

```bash
pnpm run build
```

This runs the standard Next.js build, which is compatible with Cloudflare Pages Git integration.

For advanced Cloudflare Workers builds (requires Linux/WSL):

```bash
pnpm run build:cf
```

### 4. Preview Locally

```bash
pnpm run preview
```

This starts a local Cloudflare Pages development server at `http://localhost:8788`

### 5. Deploy

```bash
# Deploy to preview environment
pnpm run deploy:preview

# Deploy to production
pnpm run deploy:production

# Or use the combined command
pnpm run cf:deploy
```

## Deployment Methods

### Option 1: Git Integration (Recommended for CI/CD)

The repository is already configured with Cloudflare Pages Git integration:

- **Build command**: `pnpm run build`
- **Deploy command**: `npx wrangler versions upload`
- **Root directory**: `/`
- **Build output**: `.open-next`

Every push to the `main` branch will trigger a production deployment.
Pull requests will automatically create preview deployments.

### Option 2: Direct Upload (Manual/Local)

For manual deployments from your local machine:

```bash
# Build and deploy in one command
pnpm run cf:deploy

# Or step by step
pnpm run build
pnpm run deploy
```

## Configuration

### wrangler.toml

The `wrangler.toml` file contains all Cloudflare-specific configuration:

- **name**: `ratehunter-landing`
- **compatibility_date**: `2026-01-16`
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

Or use Wrangler CLI:

```bash
npx wrangler pages secret put VARIABLE_NAME
```

## Build Output Structure

After running `pnpm run build`, the `.open-next` directory contains:

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

1. **Git submodules**: Ensure all git submodules are properly configured or removed

   ```bash
   git submodule status
   ```

2. **Dependencies**: Ensure all dependencies are installed

   ```bash
   pnpm install
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
3. Enter your domain (e.g., `ratehunter.com` or `www.ratehunter.com`)
4. Follow DNS setup instructions

Update `wrangler.toml` to add routes:

```toml
[[routes]]
pattern = "ratehunter.com"
custom_domain = true
```

## Monitoring & Analytics

Enable observability in the Cloudflare dashboard:

- **Analytics**: Real-time traffic and performance metrics
- **Logs**: Real-time tail logs with `npx wrangler tail`
- **Alerts**: Set up alerts for errors and performance issues

## Scripts Reference

| Command                      | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `pnpm run dev`               | Start Next.js development server                  |
| `pnpm run build`             | Build for Cloudflare (uses opennextjs-cloudflare) |
| `pnpm run build:next`        | Standard Next.js build                            |
| `pnpm run preview`           | Preview Cloudflare build locally                  |
| `pnpm run deploy`            | Deploy to Cloudflare Pages                        |
| `pnpm run deploy:production` | Deploy to production (main branch)                |
| `pnpm run deploy:preview`    | Deploy to preview environment                     |
| `pnpm run cf:login`          | Login to Cloudflare                               |
| `pnpm run cf:deploy`         | Build and deploy in one command                   |

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [@opennextjs/cloudflare](https://opennext.js.org/cloudflare)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## Support

For issues or questions:

- Cloudflare Community: https://community.cloudflare.com/
- Project Issues: Create an issue in the repository
