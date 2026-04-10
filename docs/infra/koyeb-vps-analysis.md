# Koyeb VPS Analysis for Project Nyra (2026)

## 1. KOYEB PRICING TIERS

### Starter Plan (FREE)
- **Cost**: $0/month + pay-as-you-go compute
- **Includes**: 1 free web service, 1 free Postgres database, 1 user, 5 custom domains
- **Requires**: Credit card
- **Best for**: Testing, personal projects, low-traffic apps

### Pro Plan
- **Cost**: $29/month + compute
- **Includes**: $10 compute credits, 10 users, 100 services, email/chat support
- **Best for**: Small teams, production apps

### Scale Plan
- **Cost**: $299/month + compute
- **Includes**: $100 compute credits, 50 users, 1000 services, 99.9% uptime SLA
- **Best for**: Growing businesses, high-availability needs

### Enterprise Plan
- **Cost**: $1000+/month (custom)
- **Features**: Unlimited users, custom CPU/RAM/GPU, compliance features
- **Best for**: Large enterprises

### Eco Instances
- **Ultra-cheap compute**: Starting at $1.61/month in select regions
- **Note**: Lower performance, suitable for background jobs/non-critical services

## 2. KOYEB FEATURES

### Auto-Scaling
- Dynamic instance adjustment based on traffic/resources
- Scale-to-zero capability (minimum 0 replicas)
- Automatic resource optimization
- Pay-per-second billing

### Docker & Containers
- Native Docker container support
- Seamless Git deployment with CI/CD
- Wide language/framework support
- Functions and containers in one platform

### Database Hosting
- Fully managed serverless Postgres
- High availability design
- Scale-to-zero for databases
- Up to 88% cost savings vs traditional databases
- 1 free Postgres database on Starter plan

### Other Features
- Global deployment (multiple regions)
- Built-in SSL/TLS
- Custom domains
- GitHub/GitLab integration
- WebSockets support

## 3. COMPETITOR COMPARISON

### Railway
- **Pricing**: $5/month (Hobby), $20/month (Pro)
- **Free tier**: 30-day trial with $5 credits (NO permanent free tier)
- **Best for**: Flexible billing, fast deploys, developer experience
- **Database**: Postgres, MySQL, Redis included
- **Trade-off**: No free tier after trial, simpler than Koyeb

### Render
- **Pricing**: Starting at $7-19/month per service
- **Free tier**: Available for static sites, web services (limited)
- **Best for**: Predictable pricing, built-in background workers
- **Database**: Postgres available ($7+/month)
- **Trade-off**: Less flexible than Koyeb, better for structured workflows

### Fly.io
- **Pricing**: Usage-based, ~$2/month per VM minimum
- **Free tier**: REMOVED for new users (legacy users grandfathered)
- **Best for**: Global reach, low-latency edge deployment
- **Database**: Managed Postgres $38-1922/month
- **Trade-off**: Most expensive for databases, best for global apps

### Hetzner (Best Budget Option)
**VPS Cloud**:
- CX23: 2 vCPU, 4GB RAM, 40GB SSD - ~$5-7/month
- CCX11: 2 vCPU (dedicated), 8GB RAM, 80GB SSD - $14.50/month
- Traffic: 20TB included (EU), 1TB (US)
- Locations: EU (Germany), US, Singapore

**Dedicated Server**:
- AX162-S: 48-Core, $221/month ($2652/year)
- Much cheaper than cloud for 24/7 workloads

**Trade-off**: Manual setup, no auto-scaling, requires more DevOps knowledge

## 4. DATABASE STRATEGY

### Supabase Free Tier
- 2 projects, 500MB database, 2GB egress
- 50,000 monthly active users (auth)
- Includes pgvector for AI embeddings
- Unlimited API requests
- ⚠️ **WARNING**: Paused after 7 days inactivity (not for production)
- **Pro**: $25/month (8GB database, no pause)

### Recommendation
- **Development**: Supabase free tier
- **Production**: Supabase Pro ($25/month) OR Koyeb managed Postgres

## 5. WHAT TO HOST WHERE

### 🌐 HOST ON KOYEB (Cloud)
**Priority 1** - Public-facing services:
- ✅ **n8n workflows** (mortgage lead campaigns) - Needs 24/7 uptime
- ✅ **ActivePieces workflows**
- ✅ **RateHunter webapp** (Next.js frontend)
- ✅ **Quote API** (Python FastAPI) - Customer-facing
- ✅ **PostgreSQL database** (use Koyeb free database)

**Priority 2** - If budget allows:
- Redis cache (for session/rate limiting)
- Admin dashboard

**Benefits**: 24/7 uptime, auto-scaling, global CDN, no home internet dependency

### 💻 KEEP ON ORCHESTRATOR PC (Local)
**Core development/AI infrastructure**:
- ✅ **Claude Flow** (requires local Claude Code access)
- ✅ **Archon MCP servers**
- ✅ **ruvector, Qdrant** (vector databases)
- ✅ **Neo4j/FalkorDB** (knowledge graphs)
- ✅ **Gitea** (local git hosting)
- ✅ **Development environment**
- ✅ **Ollama** (if not using GPU workers)

**Benefits**: No cloud costs, full control, low-latency for dev work

### 🎮 GPU WORKERS (Wake-on-Demand)
**AI inference workloads**:
- Ollama LLM inference
- GPU-intensive AI tasks
- Wake up when needed via orchestrator

## 6. COST-BENEFIT ANALYSIS

### Scenario A: All Local (Orchestrator 24/7)
- **Electricity**: ~$15-30/month (Ryzen 7 6800H ~65W TDP, 24/7)
- **Internet reliability**: Home ISP risk
- **Pros**: Full control, no cloud costs
- **Cons**: Single point of failure, home IP changes, no auto-scaling

### Scenario B: Hybrid (Koyeb Free + Local Orchestrator)
- **Koyeb**: $0/month (1 web service + 1 database on Starter)
- **Supabase**: $0/month (free tier, development)
- **Electricity**: ~$15-30/month (same, but orchestrator only for dev)
- **Pros**: Production reliability, minimal cost
- **Cons**: Limited to 1 service, need to optimize

### Scenario C: Hybrid (Koyeb Pro + Local) ⭐ RECOMMENDED
- **Koyeb Pro**: $29/month + compute (~$10-20/month = $39-49 total)
- **Supabase Pro**: $25/month (production database)
- **Total cloud**: ~$64-74/month
- **Local electricity savings**: Can run orchestrator only when developing
- **Pros**: Full production setup, professional reliability
- **Cons**: $60-70/month recurring cost

### Scenario D: Hetzner VPS (Budget Alternative)
- **Hetzner CCX11**: $14.50/month (2 vCPU dedicated, 8GB RAM)
- **Supabase free or Pro**: $0-25/month
- **Total**: $14.50-39.50/month
- **Pros**: Dedicated resources, much cheaper than Koyeb for 24/7
- **Cons**: Manual DevOps, no auto-scaling, setup complexity

### 💡 RECOMMENDATION: Start with Scenario B, upgrade to C when profitable

## 7. HYBRID ARCHITECTURE (Recommended)

### Phase 1: Free Tier (Validate Product-Market Fit)
**CLOUD (Koyeb Starter - FREE)**:
- n8n workflow engine (mortgage campaigns)
- Quote API (FastAPI)
- PostgreSQL database (Koyeb free DB)

**CLOUD (Supabase Free)**:
- Backup database option
- pgvector for AI embeddings

**LOCAL (Orchestrator PC)**:
- Claude Flow development
- Archon MCP
- ruvector/Qdrant
- Development environment

**COST**: $0 cloud + $20/month electricity = **$20/month total**

### Phase 2: Production (Revenue Generated) ⭐
**CLOUD (Koyeb Pro - $29/month)**:
- n8n + ActivePieces (lead campaigns)
- Quote API (FastAPI with auto-scaling)
- RateHunter webapp (Next.js)
- Admin dashboard
- Koyeb Postgres (production)

**CLOUD (Supabase Pro - $25/month)**:
- Primary database with pgvector
- Auth system
- Real-time subscriptions

**LOCAL (Orchestrator - Dev Only)**:
- Claude Flow development
- MCP servers
- Local testing environment
- Run only when developing (save electricity)

**GPU WORKERS (On-Demand)**:
- Wake up for AI inference
- Sleep when not needed

**COST**: $54/month cloud + $10/month electricity (part-time) = **$64/month total**

### Phase 3: Scale (High Traffic)
**Consider**:
- Koyeb Scale ($299/month) for SLA + compute credits
- OR Hetzner dedicated server ($221/month) + Coolify self-hosted PaaS
- Keep Supabase Pro for managed database
- Multiple GPU workers for AI workload

## 8. IMMEDIATE ACTION PLAN

### Week 1: Free Tier Validation
1. Deploy n8n to Koyeb Starter (use free web service)
2. Deploy Quote API to Koyeb (or use Render free tier as 2nd service)
3. Use Koyeb free Postgres for production data
4. Keep Claude Flow local for development
5. Test mortgage campaign workflows

### Week 2-4: Monitor & Optimize
- Track Koyeb usage/costs (should be $0 on free tier)
- Monitor n8n campaign performance
- Optimize lead conversion rates
- If successful, consider upgrading to Pro

### Decision Point (End of Month 1)
- **If generating revenue**: Upgrade to Koyeb Pro + Supabase Pro ($54/month)
- **If not profitable yet**: Stay on free tier, optimize campaigns
- **If high compute needs**: Consider Hetzner CCX11 ($14.50/month) instead

## 9. KEY RECOMMENDATIONS

1. ✅ **START FREE**: Use Koyeb Starter + Supabase free tier ($0/month)
2. ✅ **DEPLOY PUBLIC SERVICES**: Move n8n, Quote API, RateHunter to cloud
3. ✅ **KEEP DEV LOCAL**: Claude Flow, MCP servers on orchestrator
4. ✅ **MONITOR COSTS**: Koyeb bills by the second, watch compute usage
5. ✅ **UPGRADE WHEN PROFITABLE**: Move to Pro tier when revenue justifies it
6. ✅ **CONSIDER HETZNER**: If 24/7 workload needs dedicated resources (more cost-effective)

## 10. ALTERNATIVE: COOLIFY ON HETZNER

If you want more control and lower costs:
- Deploy Coolify (open-source PaaS) on Hetzner CCX11 ($14.50/month)
- Get Heroku-like experience with full control
- Host unlimited services on one VPS
- Total cost: $14.50/month vs $54+/month for Koyeb Pro + Supabase

**Trade-off**: More DevOps work, but maximum value for money

---

**Sources**:
- [Koyeb Pricing](https://www.koyeb.com/pricing)
- [Koyeb Autoscaling](https://www.koyeb.com/docs/run-and-scale/autoscaling)
- [Railway vs Render vs Fly.io Comparison](https://medium.com/ai-disruption/railway-vs-fly-io-vs-render-which-cloud-gives-you-the-best-roi-2e3305399e5b)
- [Hetzner Cloud VPS Pricing Calculator (Jan 2026)](https://costgoat.com/pricing/hetzner)
- [Supabase Pricing 2026 Complete Breakdown](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
- [Top PostgreSQL Database Free Tiers in 2026](https://www.koyeb.com/blog/top-postgresql-database-free-tiers-in-2026)
