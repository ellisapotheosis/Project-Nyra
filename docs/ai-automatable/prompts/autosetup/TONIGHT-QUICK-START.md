# 🚀 TONIGHT'S SETUP - ULTRA QUICK START

## For Windows Users (5 Minutes of Your Time)

**Step 1**: Download these files to `C:\Dev\Projects\Repos\`
- START-AUTONOMOUS-SETUP.bat
- setup-autonomous.ps1
- archon-os-MASTER-BUILD-PROMPT.md

**Step 2**: Double-click `START-AUTONOMOUS-SETUP.bat`

**Step 3**: When prompted, enter your API keys:
- Anthropic: https://console.anthropic.com (get your sk-ant-... key)
- OpenRouter: https://openrouter.ai (get your sk-or-... key)  
- Gemini: https://makersuite.google.com/app/apikey (free tier works)

**Step 4**: When VS Code opens, paste this into Claude Code:

```
Read .archon-os/MASTER-BUILD-PROMPT.md and execute all phases autonomously. Do not ask for confirmation. Report progress every 30 minutes.
```

**Step 5**: Press Enter, close everything, go to sleep.

---

## For Mac/Linux Users (5 Minutes of Your Time)

**Step 1**: Download the setup script:
```bash
curl -O https://raw.githubusercontent.com/your-repo/setup-autonomous.sh
chmod +x setup-autonomous.sh
```

**Step 2**: Run it:
```bash
./setup-autonomous.sh
```

**Step 3-5**: Same as Windows above.

---

## What Happens Overnight

Hour 1: Creates folder structure, installs prerequisites  
Hour 2: Builds Docker infrastructure (20+ services)  
Hour 3-4: Implements business logic (Quote Engine, Campaign Engine, Orchestrator, Mem0)  
Hour 5-6: Creates frontend apps (RateHunter public site, Nyra Admin dashboard)  
Hour 7: Testing, verification, documentation  
Hour 8: Final health checks  

---

## Morning Verification (1 Minute)

Open browser, check these:
- http://localhost:6000/health (Nexus Gateway)
- http://localhost:8001/docs (Quote Engine API)
- http://localhost:3000 (Twenty CRM)
- http://localhost:3100 (RateHunter Site)
- http://localhost:3005 (Grafana Dashboards - admin/admin)

All responding? ✅ You're done!

Something not working? Check `setup-transcript.log` in your project folder.

---

## What You Have When You Wake Up

A complete mortgage automation platform with:
- Intelligent quote generation based on credit score and loan type
- Automated drip campaigns via n8n
- Multi-LLM routing (Claude for complex, Gemini for cheap bulk operations)
- Complete observability with Prometheus, Grafana, Loki
- Two frontend applications ready to customize
- Full API documentation auto-generated
- All services dockerized and health-monitored

**Total Cost**: ~$50/month in API usage for moderate development  
**Hardware Requirements**: 16GB RAM, Docker Desktop  
**Time Investment**: 5 minutes tonight, 100% automated overnight  

---

## If Something Goes Wrong

**Check the logs**:
```bash
# Windows PowerShell
Get-Content setup-transcript.log -Tail 50

# Mac/Linux
tail -50 setup-transcript.log
```

**Most common issue**: Missing API keys  
**Fix**: Edit `.env` file, add keys, restart: `docker-compose restart`

**Second most common**: Docker not running  
**Fix**: Start Docker Desktop, wait 30 seconds, run `docker ps`

**Third most common**: Port conflicts  
**Fix**: Check what's using ports with `netstat -ano | findstr :6000` (Windows) or `lsof -i :6000` (Mac/Linux), kill the process

---

That's it. Five minutes tonight, complete system tomorrow morning.

Sweet dreams! 🌙
