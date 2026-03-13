# 🌙 PROJECT NYRA - OVERNIGHT SETUP GUIDE

**Go to sleep. Wake up to a fully operational AI mortgage automation platform.**

---

## 🎯 What This Does

While you sleep (4-8 hours), this system will:

✅ Install all prerequisites (Docker, Node.js, Python, Git)  
✅ Clone and configure Claude Flow + Archon OS orchestrators  
✅ Build 20+ Docker services (Nexus, Letta, TwentyCRM, n8n, Dify, etc.)  
✅ Implement 4 production business services (Quote Engine, Campaign Engine, Orchestrator, Mem0 API)  
✅ Create 2 frontend applications (RateHunter public site, Nyra Admin dashboard)  
✅ Configure observability (Prometheus, Grafana, Loki, AlertManager)  
✅ Generate complete documentation  
✅ Run health checks and verification tests  

**When you wake up**: Everything is running and ready to process mortgage leads.

---

## ⚡ FASTEST PATH (3 Steps - 5 Minutes Setup)

### Option A: Windows Users

```powershell
# 1. Open PowerShell as Administrator
# 2. Navigate to your project location
cd C:\Dev\Projects\Repos

# 3. Run the autonomous setup script
.\setup-autonomous.ps1
```

**That's it!** The script will:
- Check/install prerequisites
- Create project structure
- Prompt you for API keys (takes 2 minutes)
- Launch autonomous build via Claude Flow
- You can close the window and go to sleep

### Option B: Mac/Linux Users

```bash
# 1. Open Terminal
# 2. Navigate to your project location
cd ~/Dev/Projects

# 3. Run the autonomous setup script
chmod +x setup-autonomous.sh
./setup-autonomous.sh
```

---

## 📋 What You Need (Prepare These Before Running)

### Required API Keys

You'll need these ready when the script prompts you:

1. **Anthropic API Key** (Primary LLM)
   - Get it: https://console.anthropic.com
   - Format: `sk-ant-...`
   - Cost: ~$50/month for heavy development use

2. **OpenRouter API Key** (Cost-efficient fallback)
   - Get it: https://openrouter.ai
   - Format: `sk-or-...`
   - Cost: ~$5-20/month

3. **Google Gemini API Key** (Cheap bulk operations)
   - Get it: https://makersuite.google.com/app/apikey
   - Free tier: 1,500 requests/day
   - Paid: Starts at $0.075/1M tokens

4. **GitHub Personal Access Token** (Repository automation)
   - Get it: https://github.com/settings/tokens
   - Format: `ghp_...`
   - Scopes needed: repo, workflow, write:packages

### Optional but Recommended

5. **Twilio Account** (SMS, Voice, Email)
   - Get it: https://www.twilio.com/try-twilio
   - Need: Account SID + Auth Token
   - Cost: Pay-as-you-go (starts free)

6. **Infisical Account** (Secrets management)
   - Get it: https://infisical.com
   - Free tier available
   - Project ID: `8374cea9-e5e8-4050-bda4-b91f25ab30ef` (already configured)

---

## 🚀 Detailed Setup Process

### Step 1: Prerequisites Installation (Automated)

The script automatically checks and installs:
- ✅ Docker Desktop 
- ✅ Node.js 18+
- ✅ pnpm package manager
- ✅ Python 3.10+
- ✅ Git
- ✅ VS Code (if not present)
- ✅ Claude Code extension

**Manual Installation (If Needed)**:

**Windows** (via Chocolatey):
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

choco install docker-desktop nodejs python git vscode -y
```

**Mac** (via Homebrew):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install docker node python git
brew install --cask visual-studio-code
```

**Linux** (Ubuntu/Debian):
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs python3 python3-pip git
```

### Step 2: API Key Configuration (Manual - 2 minutes)

When the script pauses, it will open `.env` in Notepad/TextEdit. 

**Fill in your API keys:**

```env
# Replace these placeholder values with your actual keys
ANTHROPIC_API_KEY=sk-ant-YOUR_ACTUAL_KEY_HERE
OPENROUTER_API_KEY=sk-or-YOUR_ACTUAL_KEY_HERE
GOOGLE_GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_KEY_HERE
GITHUB_TOKEN=ghp_YOUR_ACTUAL_TOKEN_HERE
```

**Security tip**: Keep these keys secret! Never commit `.env` to version control.

### Step 3: Autonomous Build (Automated - 4-8 hours)

Once you've entered your API keys, the script will:

1. **Initialize Claude Flow** with all advanced features
2. **Open VS Code** with Claude Code extension
3. **Display the command** to paste into Claude Code

**The Magic Command**:
```
Read .claude-flow/MASTER-BUILD-PROMPT.md and execute all phases autonomously. Do not ask for confirmation. Report progress every 30 minutes.
```

**Then**:
- Paste that command into Claude Code
- Press Enter
- Close VS Code (optional - build continues in background)
- Go to sleep! 😴

---

## 📊 What Happens While You Sleep

### Phase 1: Repository Structure (30 min)
Creates 50+ directories, initializes Git, generates base configurations

### Phase 2: Docker Infrastructure (1 hour)
Generates production docker-compose.yml with 20+ services

### Phase 3: Business Services (2 hours)
Builds 4 FastAPI microservices:
- Quote Engine (mortgage calculations)
- Campaign Engine (drip campaigns)
- Nyra Orchestrator (compliance + workflows)
- Mem0 REST API (memory management)

### Phase 4: Frontend Applications (2 hours)
Creates 2 Next.js apps:
- RateHunter (public mortgage rate site)
- Nyra Admin (internal operations dashboard)

### Phase 5: Integration & Testing (1 hour)
Configures Claude Flow, MCP servers, runs health checks

### Phase 6: Documentation (30 min)
Auto-generates API docs, deployment guides, troubleshooting

### Phase 7: Verification (30 min)
Tests all endpoints, checks service connectivity, validates observability

---

## ☕ Morning Verification (When You Wake Up)

### Quick Health Check

Open a browser and check these URLs:

✅ **Nexus Gateway**: http://localhost:6000/health  
✅ **Letta Memory**: http://localhost:8283/v1/agents  
✅ **Quote Engine**: http://localhost:8001/docs  
✅ **Nyra Orchestrator**: http://localhost:8010/health  
✅ **Twenty CRM**: http://localhost:3000  
✅ **n8n Workflows**: http://localhost:5678  
✅ **Dify Chat UI**: http://localhost:3001  
✅ **Grafana Dashboards**: http://localhost:3005 (admin/admin)  
✅ **RateHunter Site**: http://localhost:3100  
✅ **Nyra Admin**: http://localhost:3101  

### Expected Output

**All services healthy? ✅**
```
✓ 20/20 services running
✓ All health checks passing
✓ Grafana showing metrics
✓ Zero errors in logs
```

**Something not working? ⚠️**

Check the logs:
```powershell
# Windows
Get-Content setup-transcript.log -Tail 50

# Mac/Linux  
tail -50 setup-transcript.log
```

Common issues and fixes are in the [Troubleshooting](#troubleshooting) section below.

---

## 🎮 Your First Actions (Morning Coffee Time)

### 1. Test Quote Generation (2 minutes)

```bash
curl -X POST http://localhost:8001/quote \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 400000,
    "property_value": 500000,
    "credit_score": 740,
    "loan_type": "conventional",
    "loan_term": 30,
    "down_payment": 100000,
    "property_state": "CA",
    "property_zip": "92675",
    "borrower_email": "test@example.com"
  }'
```

**Expected**: JSON response with interest rate, monthly payment, APR

### 2. Check Memory Systems (1 minute)

```bash
# Letta conversation memory
curl http://localhost:8283/v1/agents

# Mem0 universal memory
curl http://localhost:4321/memories?user_id=test_user
```

**Expected**: Empty arrays (no data yet, but services responding)

### 3. Open Admin Dashboard (1 minute)

Navigate to http://localhost:3101

**Expected**: Nyra Admin dashboard loads with:
- Leads overview
- Campaign status
- Quote history
- Chat interface

### 4. View Observability (2 minutes)

Navigate to http://localhost:3005 (Grafana)
- Login: admin / admin
- Check "Project Nyra Overview" dashboard
- All metrics should be populating

---

## 🎯 Next Steps After Verification

### Immediate (First Hour)

1. **Configure n8n Workflows**
   - Open http://localhost:5678
   - Login with credentials from `.env`
   - Import pre-built mortgage drip campaign workflow

2. **Set Up TwentyCRM**
   - Open http://localhost:3000
   - Create your first contact (lead)
   - Test CRM integration with Quote Engine

3. **Test Chat Interface**
   - Open http://localhost:3001 (Dify)
   - Start a conversation
   - Verify Nexus routing + Letta memory

### Short Term (First Day)

4. **Connect Real Data Sources**
   - Integrate freerateupdate.com API
   - Connect lendingtree.com lead feed
   - Configure Twilio for SMS/voice

5. **Customize Campaigns**
   - Edit drip campaign templates in `data/campaigns/`
   - Load into n8n
   - Test with a sample lead

6. **Deploy to Production**
   - Review `docs/deployment/PROD-DEPLOYMENT.md`
   - Set up Cloudflare Tunnels
   - Configure Tailscale VPN

---

## 🐛 Troubleshooting

### Issue: Docker containers not starting

**Check**:
```powershell
docker ps -a
docker logs nyra-nexus
```

**Fix**:
```powershell
# Restart Docker Desktop
Restart-Service docker

# Or restart specific service
docker restart nyra-nexus
```

### Issue: Port already in use

**Check what's using the port**:
```powershell
# Windows
netstat -ano | findstr :6000

# Mac/Linux
lsof -i :6000
```

**Fix**: Kill the process or change the port in `docker-compose.yml`

### Issue: API keys not working

**Verify environment**:
```powershell
docker exec nyra-nexus env | grep API_KEY
```

**Fix**: Check `.env` file, restart containers
```powershell
docker-compose restart
```

### Issue: Claude Flow build failed

**Check logs**:
```powershell
Get-Content .claude-flow/build.log -Tail 100
```

**Common causes**:
- API rate limits (wait 1 hour, retry)
- Network issues (check internet connection)
- Invalid API keys (verify in console)

**Fix**: Rerun the build command in Claude Code

### Issue: Services healthy but not responding

**Check network**:
```powershell
docker network inspect nyra
```

**Fix**: Recreate network
```powershell
docker-compose down
docker network prune
docker-compose up -d
```

---

## 📚 Additional Resources

### Documentation
- **Architecture**: `docs/architecture/SYSTEM-OVERVIEW.md`
- **API Reference**: `docs/architecture/API-ENDPOINTS.md`
- **MCP Servers**: `docs/mcp-servers/MCP-REGISTRY.md`
- **Deployment**: `docs/deployment/PROD-DEPLOYMENT.md`

### Quick Reference
- **Daily Commands**: `QUICK-REFERENCE.md`
- **Service URLs**: `docs/architecture/PORT-ALLOCATION.md`
- **Environment Variables**: `configs/env/ENV-VARS-REFERENCE.md`

### Support
- **GitHub Issues**: https://github.com/ellisapotheosis/project-nyra/issues
- **Claude Flow Docs**: https://github.com/ruvnet/claude-flow/wiki
- **Archon OS Docs**: https://github.com/coleam00/Archon

---

## 💡 Pro Tips

### Tip 1: Use Infisical for Team Secrets
Instead of managing `.env` files manually, use Infisical:
```powershell
.\scripts\infisical\export-env.ps1
docker-compose up -d
```

### Tip 2: Monitor Resource Usage
```powershell
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Tip 3: Quick Service Restart
```powershell
# Restart just one service
docker restart nyra-nexus

# Or use compose
docker-compose restart nexus
```

### Tip 4: View Real-Time Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker logs -f nyra-nexus
```

### Tip 5: Backup Your Data
```powershell
# Export all Docker volumes
docker run --rm -v nyra_postgres_data:/data -v ${PWD}:/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

---

## 🎉 Success Criteria

You've successfully deployed Project Nyra when:

✅ All 20+ Docker containers show "healthy" status  
✅ All 10+ service health endpoints return 200 OK  
✅ Grafana dashboards display live metrics  
✅ n8n workflows are loaded and active  
✅ Quote Engine returns accurate calculations  
✅ Dify chat interface responds to messages  
✅ RateHunter public site loads without errors  
✅ Nyra Admin dashboard shows all panels  
✅ MCP servers are connected in Claude Code  
✅ Memory systems (Letta, Mem0) respond to queries  

**Congratulations!** You now have a production-grade AI mortgage automation platform running locally.

---

## 🌟 What's Next?

### Week 1: Local Development
- Test all features thoroughly
- Customize workflows for your specific needs
- Add your branding to frontend applications

### Week 2: Integration
- Connect real lead sources (freerateupdate, lendingtree)
- Integrate Twilio for SMS/voice
- Set up email via SendGrid

### Week 3: Production Prep
- Deploy to your 4-PC GPU cluster
- Configure Cloudflare Tunnels
- Set up monitoring alerts
- Run security audit

### Week 4: Go Live
- Migrate first batch of leads
- Monitor system performance
- Train team on Nyra Admin dashboard
- Celebrate! 🎊

---

## 📞 Getting Help

**Setup Issues**: Check `setup-errors.log` first  
**Runtime Issues**: Check `docker-compose logs`  
**Feature Requests**: GitHub Issues  
**Security Concerns**: Email security@ratehunter.net

---

**Sweet dreams! When you wake up, you'll have a fully operational AI-powered mortgage automation platform.** 🌙✨

---

**Last Updated**: 2026-01-11  
**Version**: 1.0  
**Maintained By**: Project Nyra Team
