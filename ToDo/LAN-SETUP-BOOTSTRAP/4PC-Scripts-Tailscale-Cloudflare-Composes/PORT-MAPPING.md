# Project Nyra - Port Mapping Reference

## Services Configuration

### Public Websites (No Auth Required)
| Subdomain | Port | Service | Auth | Notes |
|-----------|------|---------|------|-------|
| ratehunter.net | 3001 | Landing page | ❌ No | Public marketing site |

### Public Portals (Auth Required)
| Subdomain | Port | Service | Auth | Access |
|-----------|------|---------|------|--------|
| nyra.ratehunter.net | 3002 | Broker Portal | ⏳ TBD | Other mortgage brokers |
| admin.ratehunter.net | 4000 | Admin Dashboard | ⏳ TBD | Your team |
| flow.ratehunter.net | 3100 | Claude-Flow UI | ⏳ TBD | Flow builder |

### Internal Team Tools (Team Access Only)
| Subdomain | Port | Service | Auth | Notes |
|-----------|------|---------|------|-------|
| crm.ratehunter.net | 3020 | Twenty CRM | ⏳ TBD | Sales team |
| n8n.ratehunter.net | 5678 | n8n Workflows | ⏳ TBD | Automation |
| flows.ratehunter.net | 5000 | Activepieces | ⏳ TBD | Automation |
| grafana.ratehunter.net | 3000 | Grafana | ⏳ TBD | Monitoring |

### Backend Services (Internal via Tailscale)
| Port | Service | Accessed Via | Notes |
|------|---------|-------------|-------|
| 6000 | Nexus Router | localhost:6000 | API Gateway (internal) |
| 8000 | Orchestrator | 100.87.235.78:8000 (Tailscale) | Job coordination |
| 8010 | Lead Capture API | nexus.ratehunter.net/api/leads | Via Nexus |
| 8020 | Quote API | nexus.ratehunter.net/api/quotes | Via Nexus |
| 8030 | Rate Comparison | nexus.ratehunter.net/api/rates | Via Nexus |
| 8040 | Document API | nexus.ratehunter.net/api/documents | Via Nexus |
| 8050 | Campaign Engine | nexus.ratehunter.net/api/campaigns | Via Nexus |

---

## How To Start Services

### Quick Test - Check if ports are in use
```powershell
# Check what's running on these ports
netstat -ano | findstr "3001 3002 3333 4000 3020 5678 5000 3000 6000 8000 9000"
```

### Start Individual Services (from WSL)

**Landing Page:**
```bash
cd ~/projects/project-nyra/apps/landing/ratehunter-landing
npm run dev -- -p 3001
```

**Main Webapp:**
```bash
cd ~/projects/project-nyra/apps/web/webapp
npm run dev -- -p 3002
```

**Nexus Router:**
```bash
cd ~/projects/project-nyra/services/nexus-router
npm start  # Should start on port 6000
```

**Orchestrator:**
```bash
cd ~/projects/project-nyra/services/nyra-orchestrator
npm start  # Should start on port 8000
```

**Dify (Docker):**
```bash
cd ~/projects/project-nyra/services/dify
docker-compose up -d
# Should expose port 3333
```

**Twenty CRM (Docker):**
```bash
cd ~/projects/project-nyra/services/twentycrm-integration
docker-compose up -d
# Should expose port 3020
```

**n8n (Docker):**
```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Activepieces (Docker):**
```bash
docker run -d \
  --name activepieces \
  -p 5000:3000 \
  activepieces/activepieces
```

**Grafana (Docker):**
```bash
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana
```

**Archon OS:**
```bash
cd ~/projects/project-nyra/services/archon-os
npm run dev -- -p 4000
```

---

## Testing Subdomains After Setup

Once the tunnel is running and services are started, test each subdomain:

```bash
# Test from command line
curl https://ratehunter.net
curl https://app.ratehunter.net
curl https://chat.ratehunter.net
curl https://admin.ratehunter.net
curl https://crm.ratehunter.net
curl https://n8n.ratehunter.net
curl https://flows.ratehunter.net
curl https://grafana.ratehunter.net
curl https://nexus.ratehunter.net/health
curl https://orchestrator.ratehunter.net/health
curl https://ws.ratehunter.net/health
```

Or open in browser:
- https://ratehunter.net
- https://app.ratehunter.net
- https://admin.ratehunter.net

---

## Troubleshooting

**Subdomain returns 502 Bad Gateway:**
- Service is not running on the expected port
- Check with: `netstat -ano | findstr "PORT_NUMBER"`
- Start the service

**Subdomain returns 404:**
- Tunnel is working but route not configured
- Re-run: `C:\Users\edane\cloudflared-configs\setup-essential-dns.ps1`

**Subdomain doesn't resolve:**
- DNS not propagated yet (wait 1-5 minutes)
- Check: `nslookup app.ratehunter.net`
- Verify tunnel is running: `cloudflared service status`

**Tunnel won't start:**
- Check credentials file exists: `dir C:\Users\edane\.cloudflared\64fe03f2-9859-44ca-b0ab-e499d8464104.json`
- Check config syntax: `cloudflared tunnel --config C:\Users\edane\cloudflared-configs\orchestrator-essential.yml ingress validate`

---

## Port Conflict Resolution

If you get "port already in use" errors:

**Find what's using the port:**
```powershell
netstat -ano | findstr "3000"
```

**Kill the process:**
```powershell
taskkill /PID <process_id> /F
```

**Common conflicts:**
- Port 3000: Used by Grafana, Activepieces, some Next.js apps
  - Solution: Assign different ports in config
- Port 5000: Used by Windows or Activepieces
  - Solution: Change Activepieces to 5001 if needed

---

## Next Steps

1. ✅ Run DNS setup script
2. ✅ Start tunnel
3. ⚠️ Deploy services one by one
4. ⚠️ Test each subdomain
5. ⚠️ Configure Nexus Router path routing for APIs

See: `C:\Users\edane\project-nyra-implementation-plan.md` for detailed deployment steps.
