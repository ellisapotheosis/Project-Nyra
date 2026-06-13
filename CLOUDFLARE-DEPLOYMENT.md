# Cloudflare Pages Deployment Guide

**Status:** Ready to deploy to Cloudflare Pages with full API automation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (Free)                        │
├─────────────────────────────────────────────────────────────┤
│  📄 projectnyra.com          (Next.js → CF Pages)           │
│  🔐 nexus-ui.projectnyra.com  (Next.js + CF Access auth)    │
│  🌐 CF Tunnel to oracle-vps   (API proxy)                   │
└─────────────────────────────────────────────────────────────┘
                           ↓ (Tunnel)
┌─────────────────────────────────────────────────────────────┐
│                   ORACLE-VPS (Private)                      │
├─────────────────────────────────────────────────────────────┤
│  🗄️  Supabase (DB + Auth)                                   │
│  🧾 TwentyCRM service                                        │
│  🔄 Nexus Router                                             │
│  🔌 API endpoints                                            │
└─────────────────────────────────────────────────────────────┘
```

## Cost Breakdown

| Component                           | Cost      | Reason                            |
| ----------------------------------- | --------- | --------------------------------- |
| CF Pages (projectnyra.com)          | **Free**  | Unlimited builds, 500 deploys/day |
| CF Pages (nexus-ui.projectnyra.com) | **Free**  | Same tier                         |
| CF Tunnel (to oracle-vps)           | **Free**  | Up to 1 tunnel free               |
| CF Access (auth for nexus-ui)       | **Free**  | Up to 5 team members              |
| **Total**                           | **$0/mo** | ✅ 100% free tier                 |

## Deployment Steps

### 1. Run Deployment Script

```bash
cd ~/repos/project-nyra

# Load your Cloudflare credentials
export CLOUDFLARE_API_TOKEN='your_cloudflare_api_token'
export CLOUDFLARE_ACCOUNT_ID='your_cloudflare_account_id'
export CLOUDFLARE_ZONE_ID='your_cloudflare_zone_id'

# Run the deployment automation
node scripts/deploy-cloudflare-pages.js
```

**What it does:**

- ✅ Creates 2 CF Pages projects (projectnyra, nexus-ui)
- ✅ Configures GitHub auto-deploy integration
- ✅ Sets environment variables for each app
- ✅ Routes domains (projectnyra.com, nexus-ui.projectnyra.com)
- ✅ Provides tunnel setup instructions

### 2. Authenticate with GitHub (One-time)

1. Go to **Cloudflare Dashboard** → **Pages**
2. Click **Create application** → Select **GitHub**
3. Follow OAuth flow to authorize ellisapotheosis/Project-Nyra
4. Done! Cloudflare will now auto-build on every push to `main`

### 3. Set Up NexusUI Authentication (Manual)

NexusUI is your admin console — protect it with Cloudflare Access:

1. Go to **Cloudflare Dashboard** → **Zero Trust** → **Access** → **Applications**
2. Create new application:
   - **Domain**: `nexus-ui.projectnyra.com`
   - **Application type**: Self-hosted
3. Add authentication policy:
   - **Require**: Email address = `edaneandersen@gmail.com`
4. Save and test

Now only your email can access `nexus-ui.projectnyra.com` ✅

### 4. Set Up Tunnel (oracle-vps Backend Connectivity)

CF Pages apps need to call your Supabase + API on oracle-vps.

**On oracle-vps:**

```bash
# Install cloudflared
curl -L --output cloudflared.tgz \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.tgz
tar -xzf cloudflared.tgz
sudo mv cloudflared /usr/local/bin/

# Authenticate (opens browser)
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create project-nyra-api

# Create config file
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: project-nyra-api
ingress:
  - hostname: api.projectnyra.com
    service: http://localhost:3100
  - hostname: supabase.api.projectnyra.com
    service: http://localhost:5432
  - hostname: nexus.projectnyra.com
    service: http://localhost:6000
  - service: http_status:404
EOF

# Start tunnel
cloudflared tunnel run project-nyra-api
```

**In Cloudflare Dashboard:**

1. Go to **Cloudflare** → **Tunnels** → **project-nyra-api**
2. Under **Public Hostname**, route each domain to the tunnel:
   - `api.projectnyra.com` → Tunnel
   - `supabase.api.projectnyra.com` → Tunnel
   - `nexus.projectnyra.com` → Tunnel
3. Done!

### 5. Update Environment Variables in Apps

Each app needs env vars to know where the backend is:

**projectnyra:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.api.projectnyra.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_API_URL=https://api.projectnyra.com
```

**nexus-ui:**

```env
NEXT_PUBLIC_NEXUS_BASE_URL=https://nexus.projectnyra.com
NEXT_PUBLIC_API_URL=https://api.projectnyra.com
```

Set these in **Cloudflare Dashboard** → **Pages** → **Settings** → **Environment variables**

### 6. Deploy! 🚀

```bash
# Push to GitHub main
git add .
git commit -m "Deploy to Cloudflare Pages"
git push origin main

# Cloudflare automatically builds and deploys
# Check progress: Cloudflare Dashboard → Pages → projectnyra → Deployments
```

## Rollback

If you need to rollback:

1. Go to **Cloudflare Dashboard** → **Pages** → **projectnyra** → **Deployments**
2. Click on a previous deployment
3. Click **Rollback to this deployment**
4. Done! (Instant, no rebuild)

## Monitoring

**Build logs:**

- Cloudflare Dashboard → Pages → projectnyra → Deployments → Click deployment

**Runtime errors:**

- Cloudflare Dashboard → Pages → projectnyra → Analytics & Logs

**Performance:**

- Cloudflare Dashboard → Analytics → Web Analytics

## Troubleshooting

| Problem                      | Solution                                                      |
| ---------------------------- | ------------------------------------------------------------- |
| Build fails                  | Check `pnpm --filter projectnyra run build` locally first     |
| Environment vars not loading | Verify they're set in CF Pages settings (not `.env.local`)    |
| Tunnel connection fails      | Ensure `cloudflared` is running on oracle-vps                 |
| NexusUI access blocked       | Check CF Access policies (Zero Trust → Access → Applications) |
| Domain not resolving         | Verify DNS is pointing to CF (check CNAME records)            |

## Full Documentation

- **Cloudflare Pages**: https://developers.cloudflare.com/pages/
- **Cloudflare Tunnels**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Cloudflare Access**: https://developers.cloudflare.com/cloudflare-one/policies/access/
- **Next.js on CF Pages**: https://developers.cloudflare.com/pages/framework-guides/nextjs/

---

**Questions?** Run the deployment script again — it will verify your setup and show any issues.
