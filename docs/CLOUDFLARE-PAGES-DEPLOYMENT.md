# Cloudflare Pages Deployment Guide

**Status:** Deployment automation ready. Two apps configured: `projectnyra` (public) + `projectnyra-nexus` (admin).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (Free)                        │
├─────────────────────────────────────────────────────────────┤
│  📄 projectnyra.com              (Next.js → CF Pages)       │
│  🔐 nexus.projectnyra.com        (Next.js + CF Access)      │
│  🌐 CF Tunnel to oracle-vps      (API + Supabase gateway)   │
└─────────────────────────────────────────────────────────────┘
                            ↓ (Tunnel)
┌─────────────────────────────────────────────────────────────┐
│                   ORACLE-VPS (Private)                      │
├─────────────────────────────────────────────────────────────┤
│  🗄️  Supabase (DB + Auth)                                    │
│  🧾 TwentyCRM service                                        │
│  🔄 Nexus Router                                             │
│  📡 API endpoints                                            │
└─────────────────────────────────────────────────────────────┘
```

## Cost Breakdown

| Component                        | Cost      | Reason                            |
| -------------------------------- | --------- | --------------------------------- |
| CF Pages (projectnyra.com)       | **Free**  | Unlimited builds, 500 deploys/day |
| CF Pages (nexus.projectnyra.com) | **Free**  | Same tier                         |
| CF Tunnel (to oracle-vps)        | **Free**  | Up to 1 tunnel free               |
| CF Access (auth for Nexus UI)    | **Free**  | Up to 5 team members              |
| **Total**                        | **$0/mo** | ✅ 100% free tier                 |

## Deployment Steps

### Step 1: Set Cloudflare Credentials

```bash
export CLOUDFLARE_API_TOKEN='your-scoped-api-token'
export CLOUDFLARE_ACCOUNT_ID='your-account-id'
export CLOUDFLARE_ZONE_ID='your-zone-id'
export SUPABASE_ANON_KEY='your-public-anon-jwt-from-supabase'
```

**Where to get these:**

- **API Token**: [Cloudflare Dashboard](https://dash.cloudflare.com) → Account → API Tokens
  - Scopes: `Account.Pages`, `Account.Account Memberships`, `Zone.Zone`
- **Account ID**: [Cloudflare Dashboard](https://dash.cloudflare.com) → Overview → Account ID
- **Zone ID**: [Cloudflare Dashboard](https://dash.cloudflare.com) → Domain → Overview → Zone ID
- **Supabase Anon Key**: Supabase Studio → Settings → API → `anon` key. Never use
  `JWT_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` in browser or Pages variables.

### Step 2: Authenticate GitHub (One-time)

Cloudflare Pages uses GitHub OAuth to enable auto-deploy on push.

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages**
2. Click **Create application** → Select **GitHub**
3. Follow OAuth flow to authorize `ellisapotheosis/Project-Nyra`
4. Done! Cloudflare will now auto-build on every push to `main`

### Step 3: Run Deployment Script

```bash
cd ~/repos/project-nyra

# Option 1: Run with credentials in environment
node scripts/deploy-cloudflare-pages.js

# Option 2: Source from secrets file
source ~/.zsh/99-secrets.zsh
node scripts/deploy-cloudflare-pages.js
```

**What it does:**

- ✅ Creates 2 CF Pages projects (projectnyra, projectnyra-nexus)
- ✅ Configures GitHub auto-deploy integration
- ✅ Sets environment variables for each app
- ✅ Routes domains (projectnyra.com, nexus.projectnyra.com)
- ✅ Prints tunnel setup instructions

### Step 4: Authenticate with Cloudflare Tunnel (oracle-vps)

Run on `oracle-vps`:

```bash
ssh ubuntu@oracle-vps

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
    service: http://supabase-kong:8000
  - service: http_status:404
EOF

# Start tunnel
cloudflared tunnel run project-nyra-api
```

### Step 5: Configure Cloudflare Tunnel Routing

In [Cloudflare Dashboard](https://dash.cloudflare.com):

1. Go to **Tunnels** → **project-nyra-api**
2. Click **Public Hostname**
3. Add routes:
   - `api.projectnyra.com` → `http://supabase-kong:8000`
4. Save

### Step 6: Set Up NexusUI Authentication

NexusUI is your admin console — protect it with Cloudflare Access:

1. Go to **Cloudflare Dashboard** → **Zero Trust** → **Access** → **Applications**
2. Create new application:
   - **Domain**: `nexus.projectnyra.com`
   - **Application type**: Self-hosted
3. Add authentication policy:
   - **Require**: Email address = `edaneandersen@gmail.com`
4. Save and test

Now only approved Access users can reach `nexus.projectnyra.com`.

### Step 7: Deploy

Push to GitHub main branch → Cloudflare auto-builds:

```bash
git add .
git commit -m "Deploy to Cloudflare Pages"
git push origin main

# Monitor progress: Cloudflare Dashboard → Pages → projectnyra → Deployments
```

## Environment Variables

Each app needs env vars for backend connectivity:

**projectnyra (.env.production):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://api.projectnyra.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<JWT_SECRET>
NEXT_PUBLIC_API_URL=https://api.projectnyra.com
```

**projectnyra-nexus (.env.production):**

```env
NEXT_PUBLIC_NEXUS_BASE_URL=https://nexus.projectnyra.com
NEXT_PUBLIC_API_URL=https://api.projectnyra.com
```

Set in **Cloudflare Dashboard** → **Pages** → **[app]** → **Settings** → **Environment variables**

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

| Problem                      | Solution                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Build fails                  | Check `pnpm --filter projectnyra run build` locally first                                                       |
| Environment vars not loading | Verify they're set in CF Pages settings (not `.env.local`)                                                      |
| Tunnel connection fails      | Ensure `cloudflared` is running on oracle-vps                                                                   |
| NexusUI access blocked       | Check CF Access policies (Zero Trust → Access → Applications)                                                   |
| Domain not resolving         | Verify DNS is pointing to CF (check CNAME records)                                                              |
| App can't reach Supabase     | Test tunnel: `curl https://api.projectnyra.com/auth/v1/health` (should return 200 or 401, not connection error) |

## References

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [Next.js on CF Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
