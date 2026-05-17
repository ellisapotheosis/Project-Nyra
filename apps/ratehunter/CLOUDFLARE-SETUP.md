# Complete Cloudflare Pages Setup Guide - RateHunter Landing

## 📋 Overview

This guide walks you through setting up a production-ready Cloudflare Pages deployment with all recommended features, security, and monitoring.

**Estimated Time**: 30-45 minutes
**Prerequisites**: Cloudflare account, GitHub repository access

---

## ✅ Step 1: Create Cloudflare Pages Project

### 1.1 Connect to GitHub

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **Create application** > **Pages**
3. Click **Connect to Git**
4. Select **GitHub** and authorize Cloudflare
5. Select your repository: `Project-Nyra`

### 1.2 Configure Build Settings

**Project name**: `ratehunter-landing`

**Production branch**: `main`

**Build settings**:

```
Framework preset: Next.js
Root directory: apps/ratehunter/landing
Build command: npm run build:cf
Build output directory: .open-next
Install command: npm install
Node version: 20
```

**Required file in repo**:

- `apps/ratehunter/landing/wrangler.toml` (prevents interactive OpenNext/Wrangler prompts in CI)

**Important**:

- Do not set the root directory to `/`.
- This repository is a monorepo, and repo-root installs can fail on unrelated workspace packages before Cloudflare ever reaches the landing app build.

**Environment variables** (add these now):

```
NODE_VERSION=20
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_SITE_URL=https://ratehunter.net
NEXT_PUBLIC_SITE_NAME=RateHunter
```

### 1.3 Deploy

Click **Save and Deploy**

The first deployment will take 3-5 minutes. Monitor the build log for any errors.

---

## 🌐 Step 2: Custom Domain Setup

### Option A: Using Cloudflare-managed domain

If your domain DNS is managed by Cloudflare:

1. Go to **Workers & Pages** > **ratehunter-landing** > **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `ratehunter.net`)
4. Click **Activate domain**
5. DNS records are automatically created ✅

### Option B: External DNS (domain managed elsewhere)

1. In Cloudflare Pages, click **Set up a custom domain**
2. Enter your domain: `ratehunter.net`
3. You'll get a CNAME record to add to your DNS provider:
   ```
   CNAME @ ratehunter-landing.pages.dev
   ```
   Or for www subdomain:
   ```
   CNAME www ratehunter-landing.pages.dev
   ```
4. Add this record at your DNS provider (GoDaddy, Namecheap, etc.)
5. Return to Cloudflare and click **Activate domain**
6. Wait 5-10 minutes for DNS propagation

### SSL/TLS Configuration

1. Go to **SSL/TLS** > **Overview**
2. Set encryption mode to: **Full (strict)** ✅
3. Go to **SSL/TLS** > **Edge Certificates**
4. Enable:
   - ✅ **Always Use HTTPS**
   - ✅ **Automatic HTTPS Rewrites**
   - ✅ **Minimum TLS Version**: TLS 1.2
   - ✅ **TLS 1.3**: Enabled
   - ✅ **HTTP Strict Transport Security (HSTS)**: Enable with these settings:
     - Max Age: 12 months
     - ✅ Apply HSTS to subdomains
     - ✅ Preload

---

## 🔐 Step 3: Security Configuration

### 3.1 Security Headers

Go to **Workers & Pages** > **ratehunter-landing** > **Settings** > **Functions**

Create a `_headers` file in your project:

```bash
# File: apps/ratehunter/landing/public/_headers

/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'
```

### 3.2 Access Control (Optional)

For staging/preview environments:

1. Go to **Access** > **Applications** > **Add an application**
2. Select **Self-hosted**
3. Configure authentication (email, Google, GitHub, etc.)
4. Apply to preview deployments only (keep production public)

### 3.3 Bot Protection

1. Go to **Security** > **Bots**
2. Enable **Bot Fight Mode** (Free)
3. Or upgrade to **Super Bot Fight Mode** ($20/mo) for advanced protection

### 3.4 Firewall Rules (Recommended)

Go to **Security** > **WAF** > **Firewall rules**

**Example rule - Block bad bots**:

```
(cf.bot_management.score lt 30) and not (cf.bot_management.verified_bot)
```

Action: **Block**

**Example rule - Rate limiting**:

```
(http.request.uri.path eq "/api/contact")
```

Then rate limit: **10 requests per minute**

---

## 📊 Step 4: Analytics & Monitoring

### 4.1 Web Analytics (Free)

1. Go to **Analytics** > **Web Analytics**
2. Click **Enable Web Analytics**
3. Add the provided script to your site (or use automatic injection)

**Alternative**: Use Cloudflare's built-in analytics (no tracking script needed)

1. Go to **Workers & Pages** > **ratehunter-landing** > **Analytics**
2. View real-time traffic, requests, bandwidth

### 4.2 Real User Monitoring (RUM)

Already enabled automatically! View in **Analytics** tab:

- Page load times
- Core Web Vitals
- Geographic distribution
- Device types

### 4.3 External Monitoring (Recommended)

**Option 1: UptimeRobot (Free)**

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add monitor for `https://ratehunter.net`
3. Set check interval: 5 minutes
4. Add email alerts

**Option 2: Cloudflare Health Checks (Pro - $20/mo)**

1. Go to **Traffic** > **Health Checks**
2. Create health check for your domain
3. Configure email/webhook notifications

### 4.4 Error Tracking (Recommended)

Add Sentry for error monitoring:

```bash
cd apps/ratehunter/landing
pnpm add @sentry/nextjs
```

Then configure in `next.config.js` (I can help with this)

---

## ⚙️ Step 5: Environment Variables & Secrets

### Production Variables

Go to **Workers & Pages** > **ratehunter-landing** > **Settings** > **Environment variables**

**Add these for production**:

```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://ratehunter.net
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX (if using Google Analytics)
```

**For secrets** (API keys, etc.):

```
# Use "Encrypt" option for sensitive values
DATABASE_URL=encrypted
API_SECRET_KEY=encrypted
```

### Preview Variables

Switch to **Preview** tab and add different values for testing:

```
NODE_ENV=preview
NEXT_PUBLIC_SITE_URL=https://preview.ratehunter-landing.pages.dev
```

---

## 🚀 Step 6: Deployment Configuration

### 6.1 Branch Deployments

Go to **Settings** > **Builds & deployments** > **Branch deployments**

**Configure**:

- ✅ **Enable automatic preview deployments** for all branches
- ✅ **Enable comments on pull requests** (shows preview URL in PR)
- Preview deployment subdomain: `<branch>.<project>.pages.dev`

### 6.2 Build Settings Optimization

**Build cache**: ✅ Enabled (speeds up builds)
**Concurrent builds**: 1 (Free tier) or 5 (Pro tier)

**Add to your wrangler.toml**:

```toml
[build]
command = "npm run build:cf"
cwd = ""
watch_dir = "."
```

### 6.3 Deploy Hooks

Create a deploy hook for manual/API deployments:

1. Go to **Settings** > **Builds & deployments** > **Deploy hooks**
2. Click **Create deploy hook**
3. Name: `manual-deploy`
4. Branch: `main`
5. Copy the webhook URL

**To deploy via API**:

```bash
curl -X POST "YOUR_DEPLOY_HOOK_URL"
```

---

## 🔔 Step 7: Notifications

### 7.1 Email Notifications

Go to **Notifications** > **Destinations** > **Email**

1. Add your email address
2. Verify email

Go to **Notifications** > **Notification policies**

**Create policies for**:

- ✅ **Pages deployment failed** → Email you
- ✅ **Pages deployment successful** → Email you (optional)
- ✅ **Health check failed** → Email you (Pro tier)
- ✅ **SSL certificate expiring** → Email you

### 7.2 Webhook Notifications (Optional)

For Slack/Discord/Teams integration:

1. Create webhook in Slack/Discord
2. Add to **Notifications** > **Destinations** > **Webhooks**
3. Create notification policies to send to webhook

**Example Slack payload**:

```json
{
  "text": "🚀 ratehunter-landing deployed successfully to production!"
}
```

---

## 🛠️ Step 8: Custom Error Pages

Create custom error pages for better user experience:

### Create Error Pages

**File: `apps/ratehunter/landing/public/404.html`**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Page Not Found - RateHunter</title>
    <style>
      body {
        font-family:
          system-ui,
          -apple-system,
          sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
      }
      .container {
        max-width: 600px;
        padding: 2rem;
      }
      h1 {
        font-size: 6rem;
        margin: 0;
      }
      p {
        font-size: 1.5rem;
        opacity: 0.9;
      }
      a {
        color: white;
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>404</h1>
      <p>Sorry, we couldn't find that page.</p>
      <p><a href="/">← Back to Home</a></p>
    </div>
  </body>
</html>
```

**File: `apps/ratehunter/landing/public/500.html`**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Server Error - RateHunter</title>
    <style>
      body {
        font-family:
          system-ui,
          -apple-system,
          sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        text-align: center;
      }
      .container {
        max-width: 600px;
        padding: 2rem;
      }
      h1 {
        font-size: 6rem;
        margin: 0;
      }
      p {
        font-size: 1.5rem;
        opacity: 0.9;
      }
      a {
        color: white;
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>500</h1>
      <p>Something went wrong on our end.</p>
      <p>We've been notified and are working on it.</p>
      <p><a href="/">← Back to Home</a></p>
    </div>
  </body>
</html>
```

---

## 🔄 Step 9: Redirects & URL Rules

Create a `_redirects` file for URL management:

**File: `apps/ratehunter/landing/public/_redirects`**

```
# Redirect old URLs to new ones
/old-page /new-page 301
/pricing /plans 301

# Redirect specific paths
/contact https://forms.projectnyra.com/contact 302

# SPA fallback (if needed)
/* /index.html 200
```

---

## 📈 Step 10: Performance Optimization

### 10.1 Enable Cloudflare Features

Go to **Speed** > **Optimization**

Enable:

- ✅ **Auto Minify**: HTML, CSS, JavaScript
- ✅ **Brotli compression**
- ✅ **Early Hints** (improved page load times)
- ✅ **HTTP/3 (with QUIC)**
- ✅ **0-RTT Connection Resumption**

### 10.2 Caching Rules

Go to **Caching** > **Configuration**

**Browser Cache TTL**: 4 hours (or "Respect Existing Headers")

**Create Page Rule** (Pro tier):

```
URL: *ratehunter.net/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 month
```

### 10.3 Image Optimization

Cloudflare Images (optional, $5/mo):

- Automatic WebP/AVIF conversion
- Responsive images
- CDN delivery

Or use Next.js Image Optimization (included):

- Already configured in `next.config.js`
- Automatic format detection
- Lazy loading

---

## 🔐 Step 11: Backup & Recovery

### 11.1 Deployment History

Cloudflare keeps **all previous deployments** indefinitely (Free tier).

**To rollback**:

1. Go to **Deployments** tab
2. Find the working deployment
3. Click **⋯** > **Rollback to this deployment**
4. Confirm (takes ~30 seconds)

### 11.2 Git as Backup

Your git repository is your source of truth:

- Every commit is a backup
- Can deploy from any commit
- Can revert changes instantly

**Emergency recovery**:

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard COMMIT_HASH
git push origin main --force
```

---

## 📱 Step 12: Mobile & PWA (Optional)

### Progressive Web App

Add PWA support for mobile users:

**File: `apps/ratehunter/landing/public/manifest.json`**

```json
{
  "name": "RateHunter",
  "short_name": "RateHunter",
  "description": "Find the Best Mortgage Rates",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `layout.tsx`:

```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#667eea" />
```

---

## 📊 Step 13: Advanced Analytics (Optional)

### Google Analytics 4

Add GA4 to track visitors:

```bash
cd apps/ratehunter/landing
pnpm add @next/third-parties
```

Update environment variables:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Cloudflare Analytics Engine (Workers)

For custom analytics (Pro tier):

- Track custom events
- Real-time dashboards
- No client-side tracking (privacy-friendly)

---

## ✅ Final Checklist

Before going live, verify:

### Domain & SSL

- [ ] Custom domain configured and active
- [ ] SSL certificate active (green padlock in browser)
- [ ] HTTPS redirect enabled
- [ ] HSTS enabled

### Security

- [ ] Security headers configured
- [ ] Bot protection enabled
- [ ] Firewall rules configured
- [ ] Content Security Policy set

### Performance

- [ ] Auto minify enabled
- [ ] Brotli compression enabled
- [ ] HTTP/3 enabled
- [ ] Caching configured

### Monitoring

- [ ] Email notifications configured
- [ ] Analytics enabled
- [ ] Uptime monitoring set up (UptimeRobot or similar)
- [ ] Error tracking configured (Sentry)

### Deployment

- [ ] Build succeeds on Cloudflare Pages
- [ ] Preview deployments working
- [ ] Production deployment successful
- [ ] Rollback procedure tested

### Content

- [ ] Custom 404 page created
- [ ] Custom 500 page created
- [ ] Redirects configured
- [ ] All links working

### Business Critical

- [ ] Important business links tested
- [ ] Licensing information accessible
- [ ] Contact forms working (if applicable)
- [ ] Mobile responsiveness verified

---

## 🆘 Emergency Procedures

### Site Down

1. Check [Cloudflare Status](https://www.cloudflarestatus.com/)
2. Check deployment history in dashboard
3. Rollback to last working deployment
4. Estimated recovery time: 30-60 seconds

### Build Failing

1. Check build logs in Cloudflare dashboard
2. Common fixes:
   - Clear build cache
   - Verify environment variables
   - Check Node.js version
3. If persistent, deploy from working commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

### Need to Migrate

1. All code in GitHub (no lock-in)
2. Next.js works on any platform
3. Export: Download from git
4. Import: Deploy to new platform
5. Update DNS to point to new host

---

## 📞 Support Resources

- **Cloudflare Community**: https://community.cloudflare.com/
- **Cloudflare Status**: https://www.cloudflarestatus.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Project Documentation**: See `CLOUDFLARE-DEPLOY.md`

---

## 🎯 Next Steps After Setup

1. **Test everything** - Click through all pages and links
2. **Monitor for 48 hours** - Watch analytics and error logs
3. **Set up backups** - Configure automated git backups
4. **Document procedures** - Share with your team
5. **Plan updates** - Schedule regular content updates

**Estimated total setup time**: 30-45 minutes
**Monthly cost**: $0 (Free tier) or $20 (Pro tier recommended)

---

**Setup Date**: \***\*\_\_\_\*\***
**Completed By**: \***\*\_\_\_\*\***
**Custom Domain**: \***\*\_\_\_\*\***
**Production URL**: \***\*\_\_\_\*\***
