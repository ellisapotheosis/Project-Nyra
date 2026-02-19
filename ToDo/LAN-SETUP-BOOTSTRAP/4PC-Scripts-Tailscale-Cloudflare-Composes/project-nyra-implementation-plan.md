# Project Nyra - Implementation Action Plan

## Current Status
✅ Cloudflared installed and authenticated
✅ Tailscale running on 2 machines (minisapotheosis, alienapotheosis)
✅ Network connectivity fixed (DHCP restored)
✅ Config files created

## Phase 1: MVP Setup (Weeks 1-8)

### Week 1-2: Infrastructure Setup

**Day 1-3: Cloudflared Tunnels**
1. Create tunnels:
   ```powershell
   cloudflared tunnel create orchestrator
   cloudflared tunnel create worker-m15r7  # Already exists
   cloudflared tunnel create worker-area51
   cloudflared tunnel create worker-rtx3090ti
   ```

2. Configure DNS routes for MVP services:
   ```powershell
   cloudflared tunnel route dns orchestrator ratehunter.net
   cloudflared tunnel route dns orchestrator app.ratehunter.net
   cloudflared tunnel route dns orchestrator chat.ratehunter.net
   cloudflared tunnel route dns orchestrator crm.ratehunter.net
   cloudflared tunnel route dns orchestrator nexus.ratehunter.net
   cloudflared tunnel route dns orchestrator orchestrator.ratehunter.net
   cloudflared tunnel route dns orchestrator grafana.ratehunter.net
   cloudflared tunnel route dns orchestrator admin.ratehunter.net
   ```

3. Deploy tunnel service on orchestrator:
   ```powershell
   cloudflared service install C:\Users\edane\cloudflared-configs\orchestrator-mvp-config.yml
   cloudflared service start
   ```

**Day 4-5: Tailscale Setup**
1. On each machine, enable IP forwarding:
   ```powershell
   Set-NetIPInterface -Forwarding Enabled
   ```

2. Configure subnet advertising (on orchestrator):
   ```powershell
   tailscale up --advertise-routes=192.168.1.0/24
   ```

3. Accept routes (on workers):
   ```powershell
   tailscale up --accept-routes
   ```

4. Test connectivity:
   ```powershell
   ping 100.87.235.78  # minisapotheosis
   ping 100.126.61.37  # alienapotheosis
   ```

**Day 6-7: Docker Setup**
1. Ensure Docker Desktop is installed on all machines
2. Clone Project-Nyra repository from GitHub:
   ```bash
   cd C:\Users\edane\Projects
   git clone <your-github-repo-url> Project-Nyra
   ```

3. Review docker-compose.yml files in Project-Nyra repo

---

### Week 3-4: Deploy Core Services

**Deploy Dify (Chat UI)**
1. Navigate to Dify config:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\services\dify
   ```

2. Configure environment variables:
   - API keys for OpenAI/Anthropic
   - Database connection (Postgres)
   - Redis for caching

3. Start Dify:
   ```bash
   docker-compose up -d
   ```

4. Access at: http://localhost:3333
5. Verify at: https://chat.ratehunter.net

**Deploy Twenty CRM**
1. Navigate to Twenty CRM config:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\services\twenty-crm
   ```

2. Configure:
   - Database connection
   - SMTP for emails
   - OAuth providers (optional)

3. Start Twenty CRM:
   ```bash
   docker-compose up -d
   ```

4. Access at: http://localhost:3020
5. Verify at: https://crm.ratehunter.net

**Deploy Grafana Monitoring**
1. Navigate to monitoring config:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\services\monitoring
   ```

2. Start Grafana + Prometheus:
   ```bash
   docker-compose up -d
   ```

3. Access at: http://localhost:3000
4. Verify at: https://grafana.ratehunter.net

---

### Week 5-6: Build Landing Page & Webapp

**Landing Page (ratehunter.net)**
1. Choose tech stack:
   - Recommended: Next.js with Tailwind CSS
   - Alternative: Static site with HTML/CSS/JS

2. Create landing page:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\frontend\landing
   npx create-next-app@latest landing-page
   ```

3. Develop pages:
   - Hero section with CTA
   - Mortgage calculator
   - Features section
   - Lead capture form
   - Footer with links

4. Configure to run on port 3001:
   ```json
   // package.json
   "scripts": {
     "dev": "next dev -p 3001"
   }
   ```

5. Deploy:
   ```bash
   npm run build
   npm run start
   ```

**Main Webapp (app.ratehunter.net)**
1. Create mortgage application webapp:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\frontend\webapp
   npx create-next-app@latest mortgage-app
   ```

2. Develop features:
   - User authentication
   - Multi-step application form
   - Document upload interface
   - Application status dashboard
   - Integration with Dify chat (embedded iframe)

3. Configure to run on port 3002

4. Connect to APIs:
   - Nexus router (https://nexus.ratehunter.net)
   - CRM (https://crm.ratehunter.net)

---

### Week 7: Backend Services

**Nexus API Gateway**
1. Navigate to:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\services\nexus
   ```

2. Configure routes:
   - /api/leads → CRM
   - /api/chat → Dify
   - /api/documents → File storage
   - /api/orchestrator → Orchestrator

3. Start Nexus:
   ```bash
   docker-compose up -d
   # OR
   npm start
   ```

**Orchestrator Service**
1. Navigate to:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\services\orchestrator
   ```

2. Configure:
   - Worker connections (Tailscale IPs)
   - Job queue (Redis)
   - Database connection

3. Start orchestrator:
   ```bash
   docker-compose up -d
   ```

---

### Week 8: Testing & Launch

**Testing Checklist:**
- [ ] Landing page loads: https://ratehunter.net
- [ ] Webapp loads: https://app.ratehunter.net
- [ ] Chat works: https://chat.ratehunter.net
- [ ] CRM accessible: https://crm.ratehunter.net
- [ ] API gateway responds: https://nexus.ratehunter.net/health
- [ ] Monitoring shows metrics: https://grafana.ratehunter.net
- [ ] Tailscale connectivity between all machines
- [ ] Lead flow: Landing → Webapp → Chat → CRM

**Load Testing:**
- Use k6 or Artillery to test load
- Target: 100 concurrent users
- Monitor Grafana for performance issues

**Security Checklist:**
- [ ] HTTPS enforced on all subdomains
- [ ] API authentication configured
- [ ] Database credentials in Infisical (not hardcoded)
- [ ] CORS configured properly
- [ ] Rate limiting on public endpoints

---

## Phase 2: Intelligence Layer (Weeks 9-16)

### Week 9-10: Add Claude-Flow

**Setup:**
1. Navigate to:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\services\claude-flow
   ```

2. Configure workflow definitions for:
   - Lead qualification flow
   - Document verification flow
   - Approval workflow

3. Deploy:
   ```bash
   docker-compose up -d
   ```

4. Create DNS route:
   ```powershell
   cloudflared tunnel route dns orchestrator flow.ratehunter.net
   ```

5. Update orchestrator-mvp-config.yml to include:
   ```yaml
   - hostname: flow.ratehunter.net
     service: http://localhost:5000
   ```

### Week 11-12: Add RuVector (Vector Database)

**Setup:**
1. Deploy Postgres with pgvector extension:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\services\ruvector
   docker-compose up -d
   ```

2. Load mortgage document embeddings:
   - FHA guidelines
   - Conventional loan docs
   - Common Q&A pairs

3. Connect to Dify for RAG:
   - Configure vector store in Dify
   - Point to RuVector API

### Week 13-14: Add Archon OS Admin Panel

**Setup:**
1. Deploy Archon OS:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\services\archon-os
   docker-compose up -d
   ```

2. Configure:
   - Connect to all services (Nexus, CRM, Grafana)
   - User roles and permissions
   - Custom dashboards

3. Access at: https://admin.ratehunter.net

### Week 15-16: Integration Testing

**Test complex workflows:**
1. Lead enters via landing page
2. Fills application on webapp
3. Asks questions in Dify chat
4. Dify queries RuVector for relevant docs
5. Claude-Flow orchestrates multi-step approval
6. Lead tracked in Twenty CRM
7. Admin monitors via Archon OS

---

## Phase 3: Advanced Features (Weeks 17-24)

### Week 17-18: Graphiti + FalkorDB

**Setup:**
1. Deploy FalkorDB:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\services/graph
   docker-compose up -d falkordb
   ```

2. Deploy Graphiti API:
   ```bash
   docker-compose up -d graphiti
   ```

3. Integrate with orchestrator:
   - Store lead interactions as graph nodes
   - Query for temporal context

4. Create DNS route:
   ```powershell
   cloudflared tunnel route dns orchestrator graph.ratehunter.net
   ```

### Week 19-20: AgentDB

**Setup:**
1. Deploy AgentDB:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\services/agentdb
   docker-compose up -d
   ```

2. Migrate workflow states from simple DB to AgentDB

3. Update Claude-Flow to use AgentDB for state management

4. Create DNS route:
   ```powershell
   cloudflared tunnel route dns orchestrator agentdb.ratehunter.net
   ```

### Week 21-22: Agentic Jujutsu (Optional)

**Evaluation:**
1. Assess if concurrent agent conflicts are occurring
2. If yes, proceed with Jujutsu setup
3. If no, defer to later

**Setup (if needed):**
1. Deploy Agentic Jujutsu:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\services/jujutsu
   docker-compose up -d
   ```

2. Wrap database writes through Jujutsu middleware

3. Configure conflict resolution UI

### Week 23-24: Worker GPU Integration

**Setup GPU workers:**
1. On RTX 3060 machine (worker-m15r7):
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\workers\rtx3060
   docker-compose up -d
   ```

2. On RTX 5090 machine (worker-area51):
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\workers\rtx5090
   docker-compose up -d
   ```

3. On RTX 3090Ti machine:
   ```bash
   cd C:\Users\edane\Projects\Project-Nyra\workers\rtx3090ti
   docker-compose up -d
   ```

**Use cases for GPU workers:**
- Fine-tune models on mortgage data
- Batch document processing
- Advanced NLP for lead scoring
- Custom embeddings generation

---

## Ongoing Maintenance

**Daily:**
- Monitor Grafana dashboards
- Check error logs in Archon OS
- Review lead pipeline in CRM

**Weekly:**
- Review workflow performance in Claude-Flow
- Optimize slow queries
- Update mortgage document embeddings

**Monthly:**
- Security updates for all services
- Backup databases
- Review and optimize costs
- A/B test landing page variations

---

## Key Decisions Still Needed

1. **Which machine is the orchestrator?**
   - Current guess: minisapotheosis (this machine)
   - Confirm this is where you want to run core services

2. **Do you have the Project-Nyra repo on GitHub?**
   - If yes: Share the repo URL
   - If no: We need to create the repo structure

3. **Do you already have Dify, Twenty CRM, etc. configured?**
   - If yes: We just need to wire up the tunnels
   - If no: We need to deploy them first

4. **What's your tech stack preference for landing/webapp?**
   - Next.js (recommended for React)
   - Vue/Nuxt
   - Svelte/SvelteKit
   - Plain HTML/CSS/JS

---

## Quick Start Commands

**Create all tunnels:**
```powershell
cloudflared tunnel create orchestrator
cloudflared tunnel create worker-area51
cloudflared tunnel create worker-rtx3090ti
```

**Configure all DNS routes:**
```powershell
$services = @("ratehunter.net", "app", "chat", "crm", "nexus", "orchestrator", "grafana", "admin")
foreach ($service in $services) {
    if ($service -eq "ratehunter.net") {
        cloudflared tunnel route dns orchestrator ratehunter.net
    } else {
        cloudflared tunnel route dns orchestrator "$service.ratehunter.net"
    }
}
```

**Start tunnel service:**
```powershell
cloudflared service install C:\Users\edane\cloudflared-configs\orchestrator-mvp-config.yml
cloudflared service start
```

**Check tunnel status:**
```powershell
cloudflared service status
cloudflared tunnel info orchestrator
```

---

## Resources & Documentation

**Cloudflared:**
- https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

**Tailscale:**
- https://tailscale.com/kb/

**Dify:**
- https://docs.dify.ai/

**Twenty CRM:**
- https://docs.twenty.com/

**Claude-Flow:**
- https://github.com/ruvnet/claude-flow

**Graphiti:**
- https://docs.getzep.com/graphiti/

Let me know when you're ready to start Phase 1, and I'll guide you through each step!
