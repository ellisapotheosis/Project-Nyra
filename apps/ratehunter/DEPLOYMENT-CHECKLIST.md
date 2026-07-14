# 🚀 Cloudflare Pages Deployment Checklist

Use this checklist to ensure your RateHunter landing page is fully configured and ready for production.

## Pre-Deployment

### Code & Configuration

- [ ] All code committed to git
- [ ] `package.json` dependencies up to date
- [ ] `next.config.js` optimized for production
- [ ] Environment variables documented in `.env.example`
- [ ] Security headers configured in `_headers`
- [ ] Redirects configured in `_redirects`
- [ ] Custom error pages (404.html, 500.html) created
- [ ] `robots.txt` configured
- [ ] `sitemap.xml` created and up to date
- [ ] PWA `manifest.json` configured
- [ ] Build succeeds locally: `npm run build:cf`

### Content Review

- [ ] All text reviewed for accuracy
- [ ] Important business links tested
- [ ] Licensing information accurate and accessible
- [ ] Contact information up to date
- [ ] Legal pages (Privacy Policy, Terms of Service) if applicable
- [ ] All images optimized (< 100KB each)
- [ ] Alt text added to all images
- [ ] Links tested (no broken links)

---

## Cloudflare Pages Setup

### Project Configuration

- [ ] Cloudflare Pages project created
- [ ] GitHub repository connected
- [ ] Root directory: `apps/ratehunter`
- [ ] Install command: `npm install`
- [ ] Build command: `npm run build:cf`
- [ ] Output directory: `.open-next`
- [ ] Node version: 20
- [ ] Root directory is **not** `/`

### Environment Variables (Production)

- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_SITE_URL=https://ratehunter.net`
- [ ] `NEXT_PUBLIC_SITE_NAME=RateHunter`
- [ ] `NODE_VERSION=20`
- [ ] `NEXT_TELEMETRY_DISABLED=1`
- [ ] Any API keys or secrets added (encrypted)

### Build Settings

- [ ] Build cache enabled
- [ ] Preview deployments enabled for all branches
- [ ] PR comments enabled (preview URLs in PRs)

---

## Custom Domain & SSL

### Domain Configuration

- [ ] Custom domain added: `ratehunter.net`
- [ ] DNS configured (CNAME or A records)
- [ ] Domain verified and active (green checkmark)
- [ ] WWW redirect configured (www → non-www or vice versa)
- [ ] Domain propagation complete (check DNS: `nslookup ratehunter.net`)

### SSL/TLS

- [ ] SSL certificate active (green padlock in browser)
- [ ] SSL/TLS encryption mode: **Full (strict)**
- [ ] Always Use HTTPS: **Enabled**
- [ ] Automatic HTTPS Rewrites: **Enabled**
- [ ] Minimum TLS Version: **TLS 1.2**
- [ ] TLS 1.3: **Enabled**
- [ ] HSTS enabled with 12-month max-age
- [ ] HSTS preload enabled
- [ ] Test SSL: https://www.ssllabs.com/ssltest/

---

## Security Configuration

### Headers & Policies

- [ ] Security headers active (check with securityheaders.com)
- [ ] Content Security Policy (CSP) configured
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured

### Firewall & Protection

- [ ] Bot Fight Mode enabled (or Super Bot Fight Mode)
- [ ] Firewall rules configured (if needed)
- [ ] Rate limiting configured for forms/APIs (if applicable)
- [ ] DDoS protection active (included by default)

### Access Control (if applicable)

- [ ] Preview environment access control configured
- [ ] Production remains publicly accessible
- [ ] Team members have appropriate access levels

---

## Performance Optimization

### Cloudflare Features

- [ ] Auto Minify enabled (HTML, CSS, JS)
- [ ] Brotli compression enabled
- [ ] Early Hints enabled
- [ ] HTTP/3 (QUIC) enabled
- [ ] 0-RTT Connection Resumption enabled

### Caching

- [ ] Browser cache TTL configured
- [ ] Static assets cached at edge
- [ ] Cache rules created for `/static/*` and `/_next/*`
- [ ] API routes excluded from cache

### Images

- [ ] Next.js Image Optimization configured
- [ ] Images converted to WebP/AVIF
- [ ] Lazy loading implemented
- [ ] Responsive images working

---

## Analytics & Monitoring

### Analytics Setup

- [ ] Cloudflare Web Analytics enabled
- [ ] Google Analytics configured (if using)
- [ ] Analytics tracking tested (check dashboard)
- [ ] Core Web Vitals monitored

### Uptime Monitoring

- [ ] UptimeRobot monitor created (or similar)
- [ ] Check interval: 5 minutes
- [ ] Email alerts configured
- [ ] Status page URL: ********\_********

### Error Tracking (Recommended)

- [ ] Sentry configured (or similar)
- [ ] Error alerts configured
- [ ] Source maps uploaded
- [ ] Test error tracking

---

## Notifications & Alerts

### Email Notifications

- [ ] Email verified in Cloudflare
- [ ] Deployment failed: Email alert enabled
- [ ] Deployment success: Email alert enabled (optional)
- [ ] SSL certificate expiring: Email alert enabled

### Team Notifications (Optional)

- [ ] Slack/Discord webhook configured
- [ ] Deployment notifications to team channel
- [ ] Error notifications to team channel

---

## SEO & Discoverability

### Search Engines

- [ ] `robots.txt` allows crawling
- [ ] `sitemap.xml` submitted to Google Search Console
- [ ] `sitemap.xml` submitted to Bing Webmaster Tools
- [ ] Meta tags complete (title, description, OG tags)
- [ ] Schema.org markup added (if applicable)

### Social Media

- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] Social share preview tested
- [ ] Favicon added (multiple sizes)

---

## Testing

### Functional Testing

- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Forms submit successfully (if applicable)
- [ ] Important business links tested
- [ ] Licensing links accessible
- [ ] Mobile menu works
- [ ] Search functionality works (if applicable)

### Browser Testing

- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Edge (desktop)

### Performance Testing

- [ ] PageSpeed Insights score > 90
- [ ] Lighthouse score > 90
- [ ] GTmetrix grade: A
- [ ] WebPageTest: Grade A
- [ ] Core Web Vitals: All green

### Accessibility Testing

- [ ] WAVE accessibility test passed
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Images have alt text

---

## Post-Deployment

### Verification (First 24 Hours)

- [ ] Site accessible at custom domain
- [ ] HTTPS working (no mixed content warnings)
- [ ] Analytics receiving data
- [ ] No errors in Cloudflare logs
- [ ] No errors in browser console
- [ ] Email notifications working

### Monitoring (First Week)

- [ ] Uptime: 100%
- [ ] Page load time < 2 seconds
- [ ] No deployment failures
- [ ] Analytics showing traffic
- [ ] Error rate < 0.1%

### Documentation

- [ ] Team members know how to deploy
- [ ] Rollback procedure documented
- [ ] Emergency contacts listed
- [ ] Credentials stored securely (password manager)

---

## Emergency Procedures

### If Site Goes Down

1. Check Cloudflare status: https://www.cloudflarestatus.com/
2. Check deployment history in dashboard
3. Rollback to last working deployment (< 1 minute)
4. Contact: ********\_********

### If Build Fails

1. Check build logs in Cloudflare Pages
2. Verify environment variables
3. Test build locally: `npm run build:cf`
4. If needed, revert git commit and push

### If DNS Issues

1. Check DNS propagation: https://dnschecker.org/
2. Verify CNAME/A records at DNS provider
3. Check Cloudflare DNS settings
4. Allow 5-10 minutes for propagation

---

## Sign-Off

**Deployment Date**: ****\_\_\_****
**Deployed By**: ****\_\_\_****
**Production URL**: ****\_\_\_****
**Verified By**: ****\_\_\_****

**Notes**:

---

---

---

---

## Next Review

**Scheduled Review Date**: ****\_\_\_****
**Items to Review**:

- [ ] SSL certificate expiry (auto-renews, but verify)
- [ ] Analytics insights
- [ ] Performance metrics
- [ ] Content updates needed
- [ ] Security updates
