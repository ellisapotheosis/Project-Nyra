# Cloudflare Pages Setup - RateHunter.net Landing Page

## Overview

Deploy your Next.js RateHunter landing page to **Cloudflare Pages** for:

- ✅ **FREE hosting** (unlimited bandwidth)
- ✅ Global CDN (300+ edge locations)
- ✅ Automatic HTTPS
- ✅ Instant cache purge
- ✅ Preview deployments
- ✅ Custom domain support

**Cost**: $0/month (Free Plan supports unlimited sites)

---

## Prerequisites

- GitHub repository with Next.js app: `apps/ratehunter/`
- Cloudflare account (already have)
- Domain `ratehunter.net` managed by Cloudflare (✅ done)

---

## Step 1: Prepare Next.js for Static Export (5 minutes)

### Configure next.config.js

Edit `apps/ratehunter/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enable static export
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Better for static hosting
  // Optional: Add base path if hosting on subdirectory
  // basePath: '',
};

module.exports = nextConfig;
```

### Update package.json Build Script

Edit `apps/ratehunter/package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "build:static": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Test Static Build Locally

```bash
cd apps/ratehunter
npm run build

# Verify 'out' directory is created with static files
ls out/
```

### Commit Changes

```bash
git add apps/ratehunter/next.config.js
git commit -m "feat: Configure Next.js for Cloudflare Pages static export"
git push origin main
```

---

## Step 2: Connect GitHub to Cloudflare Pages (10 minutes)

### Create New Pages Project

1. Log into Cloudflare Dashboard: https://dash.cloudflare.com
2. Click **Workers & Pages** in left sidebar
3. Click **Create application** → **Pages** tab
4. Click **Connect to Git**

### Authorize GitHub

1. Click **Connect GitHub**
2. Authorize Cloudflare Pages app
3. Select **All repositories** or **Only select repositories**
4. If selecting specific repos, choose `Project-Nyra`

### Configure Build Settings

| Setting                    | Value                                                |
| -------------------------- | ---------------------------------------------------- |
| **Project name**           | `ratehunter`                                         |
| **Production branch**      | `main`                                               |
| **Framework preset**       | Next.js                                              |
| **Build command**          | `cd apps/ratehunter && npm install && npm run build` |
| **Build output directory** | `apps/ratehunter/out`                                |
| **Root directory**         | `/` (leave blank - monorepo)                         |

### Environment Variables

Click **Add variable** for each:

| Variable               | Value                    |
| ---------------------- | ------------------------ |
| `NODE_VERSION`         | `20`                     |
| `NPM_VERSION`          | `10`                     |
| `NEXT_PUBLIC_SITE_URL` | `https://ratehunter.net` |

### Advanced Settings

1. Click **Advanced settings** (optional)
2. **Node.js version**: 20
3. **Build cache**: Enabled (faster builds)

### Deploy

1. Click **Save and Deploy**
2. Wait 2-5 minutes for build
3. You'll get a temporary URL: `ratehunter.pages.dev`

---

## Step 3: Configure Custom Domain (5 minutes)

### Add Custom Domain

1. In your Pages project, go to **Custom domains** tab
2. Click **Set up a custom domain**
3. Enter: `ratehunter.net`
4. Click **Continue**

### DNS Configuration (Automatic)

Cloudflare will automatically add DNS records:

- **Type**: CNAME
- **Name**: @ (root)
- **Target**: `ratehunter.pages.dev`
- **Proxy status**: Proxied (orange cloud) ✅

Or manually in DNS:

```
CNAME @ ratehunter.pages.dev (Proxied)
```

### Add www Subdomain (Optional)

1. Click **Set up a custom domain** again
2. Enter: `www.ratehunter.net`
3. Cloudflare adds:
   ```
   CNAME www ratehunter.pages.dev (Proxied)
   ```

### SSL/TLS Settings

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode: **Full (strict)**
3. Go to **Edge Certificates**
4. Enable:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ TLS 1.3
   - ✅ HTTP/3 (QUIC)

### Wait for Activation (5-10 minutes)

1. DNS propagation: 2-5 minutes
2. SSL certificate issuance: 5-10 minutes
3. Test: https://ratehunter.net

---

## Step 4: Configure Deployment Settings (5 minutes)

### Branch Deployments

1. Go to **Settings** → **Builds & deployments**
2. **Production branch**: `main`
3. **Preview deployments**: `All branches` (recommended)

Every branch push creates a preview URL:

```
feature-branch.ratehunter.pages.dev
```

### Build Notifications

1. Go to **Settings** → **Notifications**
2. Enable:
   - ✅ Build success/failure
   - ✅ Deployment success/failure
3. Add email: your Google Workspace email

### Deployment Protection

1. Go to **Settings** → **General**
2. Enable:
   - ✅ Deployment protection (require approval for production)
   - ✅ Preview protection (password-protect previews)

---

## Step 5: Optimize Performance (10 minutes)

### Enable Speed Features

Go to **Speed** → **Optimization** in Cloudflare Dashboard:

1. ✅ **Auto Minify**: HTML, CSS, JS
2. ✅ **Brotli compression**
3. ✅ **Rocket Loader** (async JS loading)
4. ✅ **Mirage** (image optimization)
5. ✅ **Polish** (WebP conversion)

### Configure Caching

Go to **Caching** → **Configuration**:

1. **Browser Cache TTL**: 4 hours (for static assets)
2. **Caching Level**: Standard
3. **Always Online**: Enabled

### Create Page Rules (Optional)

Go to **Rules** → **Page Rules** → **Create Page Rule**:

**Rule 1: Cache static assets**

- **URL**: `ratehunter.net/*.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)`
- **Settings**:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 week

**Rule 2: Always Online for HTML**

- **URL**: `ratehunter.net/*`
- **Settings**:
  - Always Online: ON

---

## Step 6: Monitoring & Analytics (5 minutes)

### Enable Web Analytics

1. Go to **Analytics & Logs** → **Web Analytics**
2. Click **Add a site**
3. Enter: `ratehunter.net`
4. Copy JavaScript snippet
5. Add to `apps/ratehunter/app/layout.tsx`:

```typescript
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Monitor Performance

Dashboard shows:

- 📊 Page views
- 📊 Unique visitors
- 📊 Core Web Vitals (LCP, FID, CLS)
- 📊 Geographic distribution
- 📊 Top pages
- 📊 Referrers

---

## Step 7: Continuous Deployment Workflow

### Automatic Deployments

Every `git push` to `main` triggers:

1. ✅ Build on Cloudflare Pages
2. ✅ Run tests (if configured)
3. ✅ Deploy to production
4. ✅ Purge CDN cache
5. ✅ Email notification

### Manual Deployments

If you need to redeploy without code changes:

1. Go to **Deployments** tab
2. Click **⋮** on latest deployment
3. Click **Retry deployment**

### Rollback

If deployment breaks:

1. Go to **Deployments** tab
2. Find last working deployment
3. Click **⋮** → **Rollback to this deployment**

---

## Troubleshooting

### Build Fails: "Module not found"

**Fix**: Update build command to install dependencies first:

```bash
cd apps/ratehunter && npm ci && npm run build
```

### Build Fails: "next export is deprecated"

**Fix**: Use `output: 'export'` in next.config.js (already done in Step 1)

### 404 on Dynamic Routes

**Problem**: Next.js `output: 'export'` doesn't support dynamic routes (`[id].tsx`)

**Solutions**:

1. Use static generation: Add `generateStaticParams()`
2. Move dynamic routes to API (not supported in static export)
3. Use Cloudflare Workers for dynamic content (advanced)

### Images Not Loading

**Fix**: Set `images.unoptimized: true` in next.config.js (already done)

### Slow First Load

**Fix**:

1. Enable **HTTP/3** in SSL/TLS settings
2. Enable **Early Hints** in Speed → Optimization
3. Use `next/image` with `priority` for above-fold images

### Custom Domain Not Working

**Checklist**:

1. ✅ DNS CNAME record exists and is proxied (orange cloud)
2. ✅ SSL certificate is active (check SSL/TLS → Edge Certificates)
3. ✅ Wait 10-15 minutes for DNS propagation
4. ✅ Clear browser cache and try incognito mode

---

## Advanced: Preview Deployments

### Test Before Production

Every PR/branch gets a preview URL:

```
pr-123.ratehunter.pages.dev
feature-contact-form.ratehunter.pages.dev
```

### Share Preview Links

1. Copy preview URL from GitHub PR comment (auto-posted by Cloudflare)
2. Share with stakeholders for review
3. Merge PR to deploy to production

---

## Cost Breakdown

| Feature                 | Free Plan    | Paid Plan    |
| ----------------------- | ------------ | ------------ |
| **Builds per month**    | 500          | Unlimited    |
| **Bandwidth**           | Unlimited    | Unlimited    |
| **Sites**               | Unlimited    | Unlimited    |
| **Concurrent builds**   | 1            | 5            |
| **Build time**          | 20 min/build | 30 min/build |
| **Preview deployments** | ✅           | ✅           |
| **Custom domains**      | ✅           | ✅           |
| **CDN**                 | ✅           | ✅           |
| **Cost**                | **$0/month** | $20/month    |

**Recommendation**: Start with FREE plan. Upgrade to paid only if you need:

- More than 500 builds/month
- Concurrent builds (multiple PRs deploying simultaneously)

---

## Comparison: Cloudflare Pages vs Alternatives

| Service              | Cost       | Bandwidth   | Build Time      | CDN            |
| -------------------- | ---------- | ----------- | --------------- | -------------- |
| **Cloudflare Pages** | FREE       | Unlimited   | 500/month       | 300+ locations |
| Vercel (Free)        | FREE       | 100GB/month | 6,000 min/month | Global         |
| Netlify (Free)       | FREE       | 100GB/month | 300 min/month   | Global         |
| AWS Amplify          | ~$15/month | 15GB free   | Pay per build   | CloudFront     |

**Winner**: Cloudflare Pages (unlimited bandwidth, domain already on Cloudflare)

---

## Security Best Practices

### 1. Enable Bot Protection

Go to **Security** → **Bots**:

- ✅ Enable **Bot Fight Mode** (Free)
- Blocks known bad bots
- Protects forms from spam

### 2. Configure Firewall Rules

Go to **Security** → **WAF** → **Create firewall rule**:

**Rule 1: Block suspicious traffic**

```
(cf.threat_score > 30) then Block
```

**Rule 2: Rate limiting (form submissions)**

```
(http.request.uri.path eq "/api/contact" and rate > 5 req/min) then Challenge
```

### 3. Enable DDoS Protection

Go to **Security** → **DDoS**:

- ✅ Automatic (always on for Free plan)

---

## Next Steps

1. ✅ Configure next.config.js for static export
2. ✅ Test build locally
3. ✅ Connect GitHub to Cloudflare Pages
4. ✅ Configure custom domain (ratehunter.net)
5. ✅ Enable SSL/TLS settings
6. ✅ Add Web Analytics
7. ✅ Test deployment: https://ratehunter.net
8. ✅ Monitor performance in Analytics dashboard

**Estimated Setup Time**: 30-40 minutes

**Result**: FREE, fast, globally distributed landing page with automatic deployments!
