# RateHunter Landing Page

Production-ready Next.js landing page optimized for Cloudflare Pages deployment.

## 🚀 Quick Deploy

**5 minutes to live:**

1. Push to GitHub: `git push origin main`
2. Connect repository in [Cloudflare Pages](https://dash.cloudflare.com/)
3. Configure build settings (see QUICK-START.md)
4. Deploy!

**📖 Full guides:**

- **[QUICK-START.md](./QUICK-START.md)** - Deploy in 15 minutes
- **[CLOUDFLARE-SETUP.md](./CLOUDFLARE-SETUP.md)** - Complete setup guide
- **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** - Production checklist

## 📦 What's Included

### Features

- ✅ **Security**: CSP, HSTS, XSS protection, secure headers
- ✅ **Performance**: Edge caching, auto-minify, Brotli, HTTP/3
- ✅ **SEO**: robots.txt, sitemap, meta tags, Open Graph
- ✅ **Security disclosures**: Cloudflare-managed `/.well-known/security.txt` with an R2-hosted PGP key
- ✅ **PWA**: Progressive web app support with manifest
- ✅ **Error Pages**: Custom 404 and 500 pages
- ✅ **Analytics Ready**: Cloudflare Web Analytics integration
- ✅ **Mobile Optimized**: Responsive design, touch-friendly

### Tech Stack

- **Framework**: Next.js 14.2.35
- **Hosting**: Cloudflare Pages (Free tier)
- **Deployment**: Git integration (auto-deploy)
- **CDN**: 300+ global locations
- **SSL**: Automatic HTTPS with free certificates

## 🛠️ Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start
```

## 📁 Project Structure

```
apps/ratehunter/
├── public/
│   ├── _headers              # Security & performance headers
│   ├── _redirects            # URL redirects
│   ├── 404.html              # Custom 404 page
│   ├── 500.html              # Custom 500 page
│   ├── manifest.json         # PWA manifest
│   ├── robots.txt            # SEO crawling rules
│   └── sitemap.xml           # SEO sitemap
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with PWA support
│   │   └── page.tsx          # Homepage
│   └── lib/                  # Utilities
├── .env.example              # Environment variables template
├── next.config.js            # Next.js configuration
├── wrangler.toml             # Cloudflare Workers config
├── open-next.config.ts       # Advanced Cloudflare optimization
└── Documentation             # Setup & deployment guides
```

## 🔧 Configuration Files

| File                  | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `wrangler.toml`       | Cloudflare Pages/Workers configuration   |
| `open-next.config.ts` | Advanced Cloudflare Workers optimization |
| `next.config.js`      | Next.js build & runtime configuration    |
| `_headers`            | Security and caching headers             |
| `_redirects`          | URL redirect rules                       |
| `.env.example`        | Environment variables template           |

Production `security.txt` is managed by Cloudflare Security Center at the zone
layer. The OpenPGP key referenced by `ratehunter.net` is hosted from the R2
bucket `nyra-cdn-assets` through:

```text
https://cdn.projectnyra.com/security/ratehunter-pgp-key.asc
```

The `public/.well-known/` assets ship with the Pages bundle as fallback/static
deploy copies. Keep their `Encryption:` field aligned with the R2 URL above.

## 🌐 Cloudflare Pages Build Settings

```
Framework preset: Next.js
Root directory: apps/ratehunter
Build command: npm run build:cf
Build output: .open-next
Install command: npm install
Node version: 20
```

**Environment variables:**

```
NODE_VERSION=20
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_SITE_URL=https://ratehunter.net
NEXT_PUBLIC_SITE_NAME=RateHunter
```

**Do not use `/` as the root directory in Cloudflare for this repo.**
That makes Pages install the entire monorepo, which can fail on unrelated workspace packages before the landing app even builds.

## 🔐 Security Features

- **HTTPS**: Automatic SSL/TLS with auto-renewal
- **HSTS**: Strict Transport Security with preload
- **CSP**: Content Security Policy configured
- **Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **DDoS**: Cloudflare DDoS protection included
- **Bot Protection**: Bot Fight Mode enabled

## 📊 Performance

- **Global CDN**: 300+ Cloudflare data centers
- **Edge Caching**: Static assets cached at edge
- **Auto Optimization**: Images, CSS, JS optimized
- **Compression**: Brotli and Gzip enabled
- **HTTP/3**: Modern protocol support

**Target metrics:**

- **PageSpeed Score**: >90
- **Load Time**: <2 seconds globally
- **Core Web Vitals**: All green

## 🔄 Deployment

### Automatic (Git Integration)

Every push to `main` triggers automatic deployment:

```bash
git add -A
git commit -m "Update content"
git push origin main
```

### Manual (Wrangler CLI)

```bash
npm run cf:login
npm run build:cf
npm run deploy
```

## 🆘 Emergency Rollback

If something breaks:

1. Go to Cloudflare dashboard
2. Navigate to Deployments tab
3. Find last working deployment
4. Click "Rollback to this deployment"
5. Restore time: ~30 seconds

## 📈 Analytics

**Built-in:**

- Cloudflare Web Analytics (no tracking scripts)
- Real-time traffic metrics
- Core Web Vitals monitoring
- Geographic distribution

**Optional integrations:**

- Google Analytics 4
- Plausible Analytics
- Sentry (error tracking)

## 💰 Cost

**Free Tier (Recommended):**

- ✅ Unlimited bandwidth
- ✅ Unlimited requests
- ✅ Automatic SSL
- ✅ DDoS protection
- ✅ 99.99% uptime SLA

**Pro Tier ($20/month - Optional):**

- Advanced analytics
- Access logs
- Priority support
- Higher limits

## 📞 Support

- **Documentation**: See guides in this directory
- **Cloudflare Community**: https://community.cloudflare.com/
- **Status Page**: https://www.cloudflarestatus.com/
- **Next.js Docs**: https://nextjs.org/docs

## 🔗 Quick Links

- [QUICK-START.md](./QUICK-START.md) - 15-minute deployment
- [CLOUDFLARE-SETUP.md](./CLOUDFLARE-SETUP.md) - Complete setup
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - Production checklist
- [CLOUDFLARE-DEPLOY.md](./CLOUDFLARE-DEPLOY.md) - Deployment guide

## 📝 License

Private business use.

## 🤝 Contributing

This is a business-critical landing page. All changes should:

1. Be tested locally: `npm run build:cf`
2. Pass the deployment checklist
3. Be deployed to preview first
4. Be monitored after production deploy

---

**Ready to deploy?** Start with [QUICK-START.md](./QUICK-START.md)
