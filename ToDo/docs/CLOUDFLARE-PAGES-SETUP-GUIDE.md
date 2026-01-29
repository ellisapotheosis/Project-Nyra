# Cloudflare Pages Deployment Guide
**Domain**: ratehunter.net
**Date**: 2026-01-18
**Automated Deployment**: GitHub Actions → Cloudflare Pages

---

## Overview

This guide will help you set up automated deployment of your RateHunter.net landing page to Cloudflare Pages using GitHub Actions. Every push to the `main` branch will automatically deploy your site.

**What You'll Get**:
- ✅ Automatic deployments on every push
- ✅ Preview deployments for pull requests
- ✅ Global CDN with instant cache invalidation
- ✅ Free SSL/TLS certificates
- ✅ Lighthouse performance audits
- ✅ Unlimited bandwidth

---

## Prerequisites

1. **Cloudflare Account** - [Sign up](https://dash.cloudflare.com/sign-up) (free)
2. **Domain in Cloudflare** - ratehunter.net should be managed by Cloudflare DNS
3. **GitHub Repository** - This repository (Project-Nyra)
4. **Landing page files** - Next.js app in `apps/ratehunter-landing/` directory

---

## Step 1: Organize Your Landing Page

### Landing Page Directory Structure

```
Project-Nyra/
├── apps/
│   ├── ratehunter-landing/     # Next.js landing page for ratehunter.net
│   │   ├── src/
│   │   │   ├── app/
│   │   │   └── components/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── tailwind.config.ts
│   └── ...
```

**Note**: The `apps/ratehunter-landing` directory already exists with a Next.js setup.

### Your Existing Next.js Setup

The `apps/ratehunter-landing` directory is already configured with:
- ✅ Next.js 14.2.18
- ✅ React 18
- ✅ Tailwind CSS
- ✅ TypeScript
- ✅ Testing setup (Jest + Testing Library)

**Build scripts already configured**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

No additional setup needed - the workflow will automatically build and deploy your Next.js app.

---

## Step 2: Get Cloudflare API Credentials

### A. Create API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click your profile icon → **API Tokens**
3. Click **Create Token**
4. Use the **Edit Cloudflare Workers** template
5. Configure permissions:
   - **Account** → Cloudflare Pages → Edit
   - **Zone** → DNS → Edit (optional, for custom domains)
6. Click **Continue to summary** → **Create Token**
7. **Copy the token** (you'll only see it once!)

### B. Get Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Scroll down on the right sidebar
4. Copy your **Account ID**

---

## Step 3: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `CLOUDFLARE_API_TOKEN` | Your API token from Step 2A | Used to deploy to Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | Your Account ID from Step 2B | Your Cloudflare account identifier |

**Optional but recommended**:
| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GH_PAT_WORKFLOWS` | GitHub Personal Access Token | For PR comments (already configured) |

---

## Step 4: Create Cloudflare Pages Project

### Option A: Through Cloudflare Dashboard (Recommended for first time)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Workers & Pages** in the sidebar
3. Click **Create application** → **Pages** → **Connect to Git**
4. Select your repository: **NYRA-AIO-Bootstrap**
5. Configure build settings:
   - **Project name**: `ratehunter-landing`
   - **Production branch**: `main`
   - **Build command**: (leave empty for static, or `npm run build` if using frameworks)
   - **Build output directory**: (`.` for static, `dist` for Vite, `out` for Next.js)
6. Click **Save and Deploy**

### Option B: Let GitHub Actions Create It (Automatic)

The workflow will automatically create the project on first deployment if it doesn't exist.

---

## Step 5: Configure Custom Domain (ratehunter.net)

1. In Cloudflare Pages project settings
2. Go to **Custom domains**
3. Click **Set up a custom domain**
4. Enter: `ratehunter.net`
5. Click **Continue** → **Activate domain**

Cloudflare will automatically:
- ✅ Configure DNS records
- ✅ Issue SSL certificate
- ✅ Set up automatic HTTPS redirects

**Optional**: Add `www.ratehunter.net` subdomain
1. Click **Set up a custom domain** again
2. Enter: `www.ratehunter.net`
3. Configure redirect from www to apex domain

---

## Step 6: Test the Deployment

### Manual Workflow Test

1. Go to GitHub repository → **Actions**
2. Select **Deploy to Cloudflare Pages**
3. Click **Run workflow**
4. Select branch: `main`
5. Choose environment: `production`
6. Click **Run workflow**

### Automatic Deployment Test

1. Make a change to `landing-page/index.html`
2. Commit and push to `main`:
   ```bash
   git add landing-page/
   git commit -m "feat(landing): update homepage content"
   git push origin main
   ```
3. Watch the deployment in GitHub Actions
4. Visit `https://ratehunter.net` to see your changes

---

## How It Works

### Deployment Flow

```
┌──────────────┐
│ Push to main │
└──────┬───────┘
       │
       ▼
┌─────────────────┐
│ GitHub Actions  │
│ Workflow starts │
└──────┬──────────┘
       │
       ├─► Validate secrets
       ├─► Install dependencies
       ├─► Build landing page
       │
       ▼
┌──────────────────────┐
│ Deploy to Cloudflare │
│ Pages (Production)   │
└──────┬───────────────┘
       │
       ▼
┌────────────────────┐
│ ratehunter.net     │
│ Updated instantly! │
└────────────────────┘
```

### Preview Deployments (Pull Requests)

When you create a PR:
1. Workflow creates a **preview deployment**
2. Bot comments on PR with preview URL
3. Test changes before merging
4. Preview deleted when PR is closed/merged

---

## Directory Structure Examples

### Static HTML Site

```
landing-page/
├── index.html
├── about.html
├── contact.html
├── css/
│   ├── styles.css
│   └── responsive.css
├── js/
│   ├── main.js
│   └── analytics.js
└── images/
    ├── hero.jpg
    └── logo.png
```

**Cloudflare Configuration**:
- Build command: (empty)
- Build output: `landing-page`

---

### React + Vite Site

```
landing-page/
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── components/
│       ├── Header.jsx
│       └── Hero.jsx
└── public/
    └── images/
```

**package.json**:
```json
{
  "name": "ratehunter-landing",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.11"
  }
}
```

**Cloudflare Configuration**:
- Build command: `npm run build`
- Build output: `landing-page/dist`

---

### Next.js Site

```
landing-page/
├── package.json
├── next.config.js
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── about/
│       └── page.tsx
├── public/
│   └── images/
└── components/
    └── Header.tsx
```

**next.config.js**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Required for static export
  images: {
    unoptimized: true  // Required for static export
  }
}

module.exports = nextConfig
```

**package.json**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

**Cloudflare Configuration**:
- Build command: `npm run build`
- Build output: `landing-page/out`

---

## Workflow Configuration

The workflow is located at: `.github/workflows/deploy-cloudflare-pages.yml`

### Triggers

- **Push to main**: Automatic production deployment
- **Pull request**: Creates preview deployment
- **Manual dispatch**: Deploy on demand via GitHub Actions UI

### Environments

- **Production**: `https://ratehunter.net`
- **Preview**: `https://<branch>-ratehunter-landing.pages.dev`

---

## Monitoring & Analytics

### Cloudflare Analytics

1. Go to **Workers & Pages** → **ratehunter-landing**
2. Click **Analytics** tab
3. View:
   - Page views
   - Unique visitors
   - Bandwidth usage
   - Top pages
   - Geographic distribution

### Performance Monitoring

The workflow includes automatic Lighthouse audits on PR deployments:
- Performance score
- Accessibility
- Best practices
- SEO

View reports in GitHub Actions artifacts.

---

## Troubleshooting

### Deployment Fails: Missing Secrets

**Error**: `Missing required secrets: CLOUDFLARE_API_TOKEN`

**Solution**: Add the secrets to GitHub repository settings (Step 3)

---

### Deployment Fails: Invalid API Token

**Error**: `Authentication error`

**Solution**:
1. Check API token has correct permissions
2. Regenerate token if expired
3. Update `CLOUDFLARE_API_TOKEN` secret

---

### Build Fails: Command Not Found

**Error**: `npm: command not found`

**Solution**: Ensure `package.json` exists in `landing-page/` directory

---

### Site Not Updating

**Problem**: Changes not appearing on ratehunter.net

**Solutions**:
1. Check GitHub Actions → verify deployment succeeded
2. Clear browser cache (Ctrl+Shift+R)
3. Check Cloudflare Pages deployment logs
4. Purge Cloudflare cache manually:
   - Go to Cloudflare Dashboard → **Caching**
   - Click **Purge Cache** → **Purge Everything**

---

### Custom Domain Not Working

**Problem**: ratehunter.net shows 522 error or doesn't resolve

**Solutions**:
1. Verify DNS records in Cloudflare DNS settings
2. Ensure SSL/TLS mode is set to "Full" or "Full (strict)"
3. Wait 5-10 minutes for DNS propagation
4. Check domain status in Cloudflare Pages custom domains

---

## Advanced Configuration

### Environment Variables

Add environment variables to Cloudflare Pages:

1. Go to **Workers & Pages** → **ratehunter-landing** → **Settings**
2. Click **Environment variables**
3. Add variables for production/preview

**Common variables**:
- `NODE_ENV`: `production`
- `API_URL`: Your backend API URL
- `ANALYTICS_ID`: Google Analytics ID

---

### Branch Deployments

Deploy specific branches:

1. Edit workflow file
2. Add branch to `on.push.branches`:
   ```yaml
   on:
     push:
       branches:
         - main
         - staging  # Add staging branch
   ```

---

### Custom Build Settings

For complex builds, customize in workflow:

```yaml
- name: Build landing page
  working-directory: ./landing-page
  env:
    NODE_ENV: production
    API_URL: ${{ secrets.API_URL }}
  run: |
    npm run build
    npm run optimize  # Custom optimization script
```

---

## Scripts for Common Tasks

### Deploy Specific Branch

```bash
gh workflow run deploy-cloudflare-pages.yml \
  --ref your-branch-name \
  -f environment=preview
```

### Check Deployment Status

```bash
gh run list --workflow=deploy-cloudflare-pages.yml --limit 5
```

### View Deployment Logs

```bash
gh run view --log
```

---

## Security Best Practices

1. ✅ **Never commit** `CLOUDFLARE_API_TOKEN` to repository
2. ✅ Use **API tokens** instead of Global API Key
3. ✅ Set **minimal permissions** on API tokens
4. ✅ Rotate tokens periodically
5. ✅ Use **branch protection** rules for main branch
6. ✅ Enable **2FA** on Cloudflare account

---

## Cost & Limits

Cloudflare Pages **Free Tier**:
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds/month
- ✅ 1 build at a time
- ✅ 20,000 files per deployment
- ✅ 25 MiB file size limit

**Need more?** Upgrade to Pages Pro ($20/month):
- 5,000 builds/month
- 5 concurrent builds
- Increased build timeout

---

## Next Steps

1. **Setup complete!** - Landing page deployed to ratehunter.net
2. **Add content** - Update your landing page content
3. **Enable analytics** - Set up Google Analytics or Cloudflare Web Analytics
4. **Optimize SEO** - Add meta tags, sitemap, robots.txt
5. **Set up monitoring** - Use Cloudflare's analytics and alerts

---

## Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Cloudflare Pages GitHub Action](https://github.com/cloudflare/pages-action)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## Support

**Issues with deployment?**
1. Check GitHub Actions logs
2. Review Cloudflare Pages deployment logs
3. Check this repository's Issues tab
4. Contact Cloudflare Support (for platform issues)

---

**Setup Date**: 2026-01-18
**Created By**: Claude Code
**Workflow**: `.github/workflows/deploy-cloudflare-pages.yml`
**Domain**: ratehunter.net
