# 🚀 Quick Start - Deploy to Cloudflare Pages in 15 Minutes

This guide gets your RateHunter landing page live on Cloudflare Pages as fast as possible.

## ⏱️ Time Required
- **5 minutes**: Cloudflare setup
- **5 minutes**: First deployment
- **5 minutes**: Custom domain (optional)

---

## Step 1: Push Code to GitHub (if not already done)

```bash
git add -A
git commit -m "feat: Production-ready Cloudflare Pages configuration"
git push origin main
```

---

## Step 2: Create Cloudflare Pages Project

### 2.1 Sign In
1. Go to https://dash.cloudflare.com/
2. Sign in or create a free account

### 2.2 Create Project
1. Click **Workers & Pages** (left sidebar)
2. Click **Create application**
3. Click **Pages** tab
4. Click **Connect to Git**

### 2.3 Connect GitHub
1. Click **GitHub**
2. Authorize Cloudflare (if first time)
3. Select repository: **Project-Nyra**
4. Click **Begin setup**

### 2.4 Configure Build

**Project name**: `ratehunter-landing`

**Production branch**: `main`

**Build settings**:
- Framework preset: **Next.js**
- Root directory: **apps/landing/ratehunter-landing**
- Install command: `npm install`
- Build command: `npm run build:cf`
- Build output directory: `.open-next/assets`

**Environment variables** (click "Add variable"):
```
NODE_VERSION = 20
NODE_ENV = production
NEXT_TELEMETRY_DISABLED = 1
NEXT_PUBLIC_SITE_URL = https://ratehunter-landing.pages.dev
NEXT_PUBLIC_SITE_NAME = RateHunter
```

Do not leave the root directory as `/` in this repository. That makes Cloudflare install the whole monorepo instead of just the landing app.

### 2.5 Deploy
1. Click **Save and Deploy**
2. Wait 3-5 minutes for build to complete
3. You'll see a URL like: `https://ratehunter-landing.pages.dev`

🎉 **Your site is live!**

---

## Step 3: Custom Domain (Optional - 5 minutes)

### If Your Domain is on Cloudflare:
1. Go to your Pages project > **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `ratehunter.com` (or `www.ratehunter.com`)
4. Click **Activate domain**
5. Done! (DNS configured automatically)

### If Your Domain is External:
1. In Cloudflare Pages, click **Set up a custom domain**
2. Enter: `ratehunter.com`
3. Copy the CNAME record shown:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: ratehunter-landing.pages.dev
   ```
4. Add this to your DNS provider (GoDaddy, Namecheap, etc.)
5. Return to Cloudflare and click **Activate domain**
6. Wait 5-10 minutes for DNS propagation
7. Done!

---

## Step 4: Verify Everything Works

### Check Your Site
- [ ] Visit your custom domain (or .pages.dev URL)
- [ ] Homepage loads correctly
- [ ] Images display properly
- [ ] Links work
- [ ] Mobile view looks good
- [ ] HTTPS is active (green padlock)

### Check Cloudflare Dashboard
- [ ] Deployment status: **Success**
- [ ] Custom domain status: **Active**
- [ ] SSL certificate: **Active**

---

## Step 5: Enable Recommended Features (2 minutes each)

### Enable HTTPS Redirect
1. Go to **SSL/TLS** > **Edge Certificates**
2. Turn on **Always Use HTTPS**
3. Turn on **Automatic HTTPS Rewrites**

### Enable Performance Features
1. Go to **Speed** > **Optimization**
2. Enable **Auto Minify** (HTML, CSS, JavaScript)
3. Enable **Brotli compression**
4. Enable **HTTP/3 (with QUIC)**

### Enable Bot Protection
1. Go to **Security** > **Bots**
2. Enable **Bot Fight Mode** (Free)

### Set Up Uptime Monitoring
1. Go to https://uptimerobot.com (free account)
2. Add monitor for your domain
3. Set check interval: 5 minutes
4. Add your email for alerts

---

## What You Get (Free Tier)

✅ **Unlimited bandwidth**
✅ **Unlimited requests**
✅ **300+ CDN locations worldwide**
✅ **Automatic SSL certificates**
✅ **DDoS protection**
✅ **Preview deployments for PRs**
✅ **Instant rollbacks**
✅ **Web Analytics**
✅ **99.99% uptime SLA**

---

## Next Deployments (Automatic)

Every time you push to GitHub:
```bash
git add -A
git commit -m "Update content"
git push origin main
```

Cloudflare automatically:
1. Builds your site
2. Deploys to production
3. Sends you an email notification
4. Takes ~2-3 minutes total

---

## Need Help?

### Common Issues

**Build failing?**
- Check build logs in Cloudflare dashboard
- Verify environment variables
- Test locally: `cd apps/landing/ratehunter-landing && npm install && npm run build:cf`

**Domain not working?**
- Wait 5-10 minutes for DNS propagation
- Check DNS: https://dnschecker.org/
- Verify CNAME record at your DNS provider

**Site looks broken?**
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors (F12)
- Verify _headers and _redirects files deployed

### Support Resources
- Cloudflare Community: https://community.cloudflare.com/
- Full setup guide: See `CLOUDFLARE-SETUP.md`
- Deployment checklist: See `DEPLOYMENT-CHECKLIST.md`

---

## Production Checklist

Before announcing your site:
- [ ] Custom domain working
- [ ] SSL/HTTPS active
- [ ] All content reviewed
- [ ] Business links tested
- [ ] Mobile experience tested
- [ ] Page load time < 3 seconds
- [ ] Analytics working
- [ ] Uptime monitoring active

---

## Upgrading Later (Optional)

**When should you upgrade to Cloudflare Pro ($20/mo)?**
- Need advanced analytics
- Want access logs
- Need priority support
- Traffic > 10,000 visitors/month

**You can run on Free tier indefinitely!**

---

## Emergency Rollback

If something breaks:
1. Go to Cloudflare dashboard
2. Click **Deployments** tab
3. Find last working deployment
4. Click **⋯** > **Rollback to this deployment**
5. Takes 30 seconds to restore

---

**Deployment Time**: 15 minutes ✅
**Monthly Cost**: $0 💰
**Next Step**: Add content and promote your site! 🎉
