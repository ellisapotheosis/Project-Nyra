# NYRA — Executive Overview (≤2k chars)

NYRA is your mortgage assistant webapp + public site, built by a multi-agent dev stack.
The ground rules: **spawnable task clones**, **evolutionary code loops**, **temporal knowledge graph**,
and **voice-first operator control**.

**Mission**
- Automate intake → pricing → docs → LOS → disclosures → underwriting → CTC → post-close.
- Expose self-serve calculators and rate tools publicly.
- Orchestrate agents that scaffold, refactor, test, and ship reliably.

**Pillars**
- **Orchestration:** Claude-Flow (by ruvnet) along side Archon OS (MCP)(task clones at the very least, we would need to determine which tasks each of these are best suited for to set up this dual orchestrator system. Maybe one as main brain and the other as the task manager/task breakdown?). OpenEvolve (evolution optimizer) 
- **Codebase Analysis**- Serena MCP (likely the best and confirmed at the very least for now) then the potential to simultaneously add and utilize the following or potentially even replace Serena with: Codanna MCP and/or Smart-Tree MCP. 
- **Coding:**HKUDS/DeepCode (one-shot builder) + SWE-Agent/OpenHands (scaffold→test→fix).--potential for these last two but unconfirmed, maybe SWE-Agent for debugging? Then Pocketflow + Smolagent utilized for spawnable + despawnable LettaAI + OpenEvolve workflow for evolving task based agents.      Potential for HKUDS/AutoAgent to utilize for workflow creation as well. 
- **Memory:** Letta (agent LTM), Graphiti on Neo4j/FalkorDB (temporal KG, GraphRAG? Maybe even hook this up to my CRM database for agents to query and input inffo for each borrower based on uploaded documents, lead, conversations, etc.?), Qdrant Local (and maybe Qdrant CLoud, free plan also available for testing) (not sure what to use either type for, maybe local qdrant for hot vectors? RAG?), (potential usecases for @memorytensors/memOS for R&D and testing). Other potentials include Zep / Zep MCP, i think this one would be a great fit. And lastly, im trying to weight out potential for mem0 and the mcp server by the same creators of mem0 called OpenMemory MCP, it sounds like it can query, store, and edit all types of memory types and systems. mem0 itseld might also be a good implementation but unsure what itd be best used for and if it would be best to use it to replace something else or add ontop of everything else? Then LMCache is confirmed for our local GPU LLMs.
- **Ops:** Prompt evaluation (promptfoo), CI gates, reproducible MCP servers.
- **Interface:** PandaAGI chat, AgentZero voice/computer/browser-use; optional SuperAGI voice hub.  (these are only potential agents with UI, our actual confirmed UI right now is Open-Webui + Lobechat + Metamcp Integration (UI) + Dify + Flowise/n8n















Agentic Jujutsu is not a replacement for Git hosting (like GitHub or Gitea) but rather a Git-compatible client and methodology specifically designed for AI agents.   

Think of it this way:

Git is like a single-lane road where if two cars (agents) try to merge at once, they crash (merge conflict) and traffic stops until a human clears the wreck.

Agentic Jujutsu (wrapping the jj VCS) is a multi-lane highway where cars can overlap, and the "crash" is just recorded as a temporary state that another agent can fix later, without stopping traffic.

Here is how to utilize it for Nyra development on your LAN setup:

1. What is "Agentic Jujutsu"?
It is a Node.js wrapper around Jujutsu (jj), a version control system from Google that is fully compatible with Git repos. Ruvnet’s version adds "AI-specific" features:   

Non-Blocking Conflicts: If Agent A and Agent B edit the same file, it doesn't throw an error and stop. It saves the conflict as a "state" that a third "Resolver Agent" can fix later.   

ReasoningBank (Learning): It logs every operation (not just commits). If an agent tries a fix and fails, agentic-jujutsu records that "Trajectory" so the agent learns "Don't do that again" (stored in AgentDB).   

Concurrency: It allows multiple agents to work on the repo simultaneously without locking files.   

2. How to Utilize it for Nyra (The Hybrid Workflow)
You do not need to choose between Gitea and Agentic Jujutsu. You use them together.

The Architecture:

Hosting (The "Cloud"): Gitea running on one of your 4 LAN PCs. This acts as the central "remote" storage.

The Client (The Agents): Your 4 PCs run claude-flow / ruv-swarm. Instead of giving the agents standard git commands, you give them the agentic-jujutsu tool.

Step-by-Step Implementation:

Host Gitea Locally:

Set up Gitea on your main LAN PC.

Create the nyra repository there.

Why? This gives you a fast, zero-latency "Remote" for your agents to sync with, free of GitHub's API rate limits.

Install the Tool in Your Project: Inside your Nyra workspace (or the agent's environment), install the package:

Bash

npm install agentic-jujutsu
Configure Claude-Flow / Swarm: You need to tell your agents to use jj instead of git.

If using claude-flow: Look for the scm (Source Control Management) tool configuration. You essentially want to replace the standard "Git Commit" tool with an "Agentic JJ" tool.

Tool Prompt Example:

"You are an agent using Agentic Jujutsu. Do not fail on merge conflicts. If a conflict occurs, commit it as a 'Conflict State' and spawn a 'Resolver Agent' to fix it. Use jj.newCommit() instead of git commit."   

The "Jujutsu" Workflow for Agents:

Agent A starts a task: jj.startTrajectory('Refactor Database').

Agent A makes edits.

Agent A "commits" (in jj, every save is technically a commit, making it impossible to lose work).

Agent A pushes to your local Gitea: jj git push.   

Result: The history in Gitea looks like normal Git commits, but the process was fluid and non-blocking for the agents.

Summary: The Verdict
Stick with Gitea on LAN: It is the perfect backend for this.

Use agentic-jujutsu as the "Driver": It prevents your multi-agent swarm from getting stuck in "Merge Hell."

Why this is better for Nyra: If you have 4 PCs running agents, you have a distributed swarm. Standard Git will fail constantly with that many concurrent writers. Agentic Jujutsu handles that concurrency natively.












 Is @ruvector/postgres-cli better than regular Postgres?
For AI applications: Yes.

Why: It is a "drop-in replacement" for the standard pgvector extension but adds significant AI capabilities:

Graph Neural Networks (GNN): It learns from your data relationships automatically.   

ReasoningBank: It has built-in memory for AI agents.   

Speed: It claims 96x-164x faster vector search than standard setups.   

Recommendation: If you are building an AI app that needs to remember things (vectors/embeddings), use this. If you just need a standard SQL database for user logins, regular Postgres is fine (but this will still work).

4. The Master Workflow: How to handle your "Mass Documentation" task
You want to ingest many docs and output a Whitepaper, Specs, Workflow Guide, Config Guide, and ENV list simultaneously. Here is the best tool chain for that specific workflow:

Step 1: Deep Research & Analysis
Tool: research-swarm (or goalie)

Why: You mentioned "mass compilation of docs."

goalie: Use this if you need to cross-reference your local docs with live web research (it connects to Perplexity API).

research-swarm: Use this if you strictly want to analyze your local directory of .md files. It uses "GOAP" (Goal Oriented Action Planning) to break down the massive reading task into smaller chunks.

Step 2: The "Master" Orchestrator
Tool: claude-flow

Why: This is the manager that controls the other tools. You should use claude-flow to spin up a "Hive Mind" or "Swarm" that assigns different agents to write your different outputs in parallel.   

Command Idea:

Bash

# Concept command
npx claude-flow swarm "Read ./docs/*.md and generate: 1. Whitepaper, 2. Master Workflow, 3. Config Guide" --strategy analysis
Step 3: Memory & Storage
Tool: agentdb

Why: When your swarm reads 50+ documents, it will "forget" the beginning by the time it reaches the end. agentdb acts as the long-term memory so the swarm can recall details from File A while writing File Z.

Summary Recommendation
Website Building: Use standard tools (React, Vue, etc.) or a coding agent in claude-flow, not lean-agentic.

Database: Use @ruvector/postgres-cli.

The "Mega-Doc" Task: Run claude-flow (the orchestrator) combined with agentdb (the memory). Use the research-swarm module inside it to process the text.













# Zapier Alternatives 2025 - Complete Analysis

## 📊 Complete Tool Comparison Table

| Tool | License | Self-host | No-code builder | Best for | Constraints | Primary source(s) |
|------|---------|-----------|-----------------|----------|-------------|-------------------|
| **n8n** | Sustainable Use (fair-code) | Yes | Yes | General-purpose automations; technical teams needing extensibility | Not OSI-open source; some commercial restrictions; advanced features require license in self-hosted Business/Enterprise | https://github.com/n8n-io/n8n \| https://docs.n8n.io/sustainable-use-license/ |
| **Activepieces** | MIT | Yes | Yes | Beginner-friendly no-code automations; permissive licensing | Smaller ecosystem than Zapier; community-driven connectors | https://github.com/activepieces/activepieces |
| **Automatisch** | AGPL-3.0 | Yes | Yes | Self-hosted Zapier-like UI; privacy-focused | AGPL obligations; smaller connector catalog | https://github.com/automatisch/automatisch \| https://automatisch.io/ |
| **Huginn** | MIT | Yes | JSON/agent graph (low-code) | Highly customizable agent-based workflows; power users | Steeper learning curve; older UI | https://github.com/huginn/huginn |
| **Node-RED** | Apache-2.0 | Yes | Yes (flow-based) | Event/IoT and API wiring; edge and on-prem | Geared to technical users; business app connectors not as many as Zapier | https://nodered.org \| https://github.com/node-red/node-red |
| **Windmill** | AGPL-3.0 (open core) | Yes | Low-code + code | Developer-first workflows and jobs; high throughput | Some enterprise features gated; open-core model | https://github.com/windmill-labs/windmill \| https://www.windmill.dev/ |
| **Trigger.dev** | Apache-2.0 / MIT (packages) | Yes | Code-first (TypeScript) | Background jobs and AI workflows in code; GitOps | Not no-code; dev-centric | https://github.com/triggerdotdev/trigger.dev |
| **Zoho Flow** | Proprietary | No (Cloud SaaS) | Yes | Affordable Zapier alternative; strong with Zoho suite | Free tier limits; smaller third-party ecosystem than Zapier | https://www.zoho.com/flow/pricing.html |
| **HubSpot Workflows** | Proprietary | No (Cloud SaaS) | Yes | CRM-native automation across Marketing/Sales/Service | Advanced automation behind paid hubs; costs scale fast | https://www.techradar.com/reviews/hubspot-crm-review |
| **GoHighLevel** | Proprietary | No (Cloud SaaS) | Yes | Agency-focused all-in-one (CRM, funnels, SMS, email) | Pricier entry; opinionated stack | https://ghl-services-playbooks-automation-crm-marketing.ghost.io/gohighlevel-pricing-plans-explained-features-value-cost-comparison-2025/ |
| **Twenty CRM** | AGPL-3.0 (check repo) | Yes | Yes | Modern OSS CRM with workflows | Young project; evolving docs | https://github.com/twentyhq/twenty |

---

## 🎯 Project NYRA Strategic Analysis

### **Tier 1: Self-Hosted Enterprise (Full Control)**

#### n8n
- **License**: Sustainable Use (fair-code)
- **Self-host**: ✅ Yes
- **No-code**: ✅ Yes
- **Best for**: General-purpose automations; technical teams needing extensibility
- **Constraints**: Not OSI-open source; some commercial restrictions; advanced features require license in self-hosted Business/Enterprise
- **Links**: https://github.com/n8n-io/n8n | https://docs.n8n.io/sustainable-use-license/

#### Activepieces
- **License**: MIT ⭐ Most Permissive
- **Self-host**: ✅ Yes
- **No-code**: ✅ Yes
- **Best for**: Beginner-friendly no-code automations; permissive licensing
- **Constraints**: Smaller ecosystem than Zapier; community-driven connectors
- **Links**: https://github.com/activepieces/activepieces

#### Automatisch
- **License**: AGPL-3.0
- **Self-host**: ✅ Yes
- **No-code**: ✅ Yes
- **Best for**: Self-hosted Zapier-like UI; privacy-focused
- **Constraints**: AGPL obligations; smaller connector catalog
- **Links**: https://github.com/automatisch/automatisch | https://automatisch.io/

#### Node-RED
- **License**: Apache-2.0
- **Self-host**: ✅ Yes
- **No-code**: ✅ Yes (flow-based)
- **Best for**: Event/IoT and API wiring; edge and on-prem
- **Constraints**: Geared to technical users; business app connectors not as many as Zapier
- **Links**: https://nodered.org | https://github.com/node-red/node-red

#### Windmill
- **License**: AGPL-3.0 (open core)
- **Self-host**: ✅ Yes
- **No-code**: Low-code + code
- **Best for**: Developer-first workflows and jobs; high throughput
- **Constraints**: Some enterprise features gated; open-core model
- **Links**: https://github.com/windmill-labs/windmill | https://www.windmill.dev/

---

### **Tier 2: Developer-Focused Solutions**

#### Huginn
- **License**: MIT
- **Self-host**: ✅ Yes
- **No-code**: JSON/agent graph (low-code)
- **Best for**: Highly customizable agent-based workflows; power users
- **Constraints**: Steeper learning curve; older UI
- **Links**: https://github.com/huginn/huginn

#### Trigger.dev
- **License**: Apache-2.0 / MIT (packages)
- **Self-host**: ✅ Yes
- **No-code**: ❌ Code-first (TypeScript)
- **Best for**: Background jobs and AI workflows in code; GitOps
- **Constraints**: Not no-code; dev-centric
- **Links**: https://github.com/triggerdotdev/trigger.dev

---

### **Tier 3: Cloud SaaS Alternatives**

#### Zoho Flow
- **License**: Proprietary
- **Self-host**: ❌ No (Cloud SaaS)
- **No-code**: ✅ Yes
- **Best for**: Affordable Zapier alternative; strong with Zoho suite
- **Constraints**: Free tier limits; smaller third-party ecosystem than Zapier
- **Links**: https://www.zoho.com/flow/pricing.html

#### HubSpot Workflows
- **License**: Proprietary
- **Self-host**: ❌ No (Cloud SaaS)
- **No-code**: ✅ Yes
- **Best for**: CRM-native automation across Marketing/Sales/Service
- **Constraints**: Advanced automation behind paid hubs; costs scale fast
- **Links**: https://www.techradar.com/reviews/hubspot-crm-review

#### GoHighLevel
- **License**: Proprietary
- **Self-host**: ❌ No (Cloud SaaS)
- **No-code**: ✅ Yes
- **Best for**: Agency-focused all-in-one (CRM, funnels, SMS, email)
- **Constraints**: Pricier entry; opinionated stack
- **Links**: https://ghl-services-playbooks-automation-crm-marketing.ghost.io/gohighlevel-pricing-plans-explained-features-value-cost-comparison-2025/

---

### **Tier 4: Emerging Solutions**

#### Twenty CRM
- **License**: AGPL-3.0 (check repo)
- **Self-host**: ✅ Yes
- **No-code**: ✅ Yes
- **Best for**: Modern OSS CRM with workflows
- **Constraints**: Young project; evolving docs
- **Links**: https://github.com/twentyhq/twenty

---

## 🏆 RateHunter Recommendations

### **Primary Stack Recommendation**

**Option A: Maximum Licensing Freedom**
1. **Activepieces** (MIT) - Core automation platform
   - True open source, most permissive license
   - Beginner-friendly for team adoption
   - No commercial restrictions

2. **Node-RED** (Apache-2.0) - Rate data & API flows
   - Perfect for real-time broker rate feeds
   - Battle-tested in production environments
   - Strong IoT/API integration capabilities

**Option B: Enterprise Features**
1. **n8n** (Fair-code) - Core automation platform
   - Most mature feature set
   - Extensive connector ecosystem
   - ⚠️ May require commercial license for advanced self-hosted features

2. **Node-RED** (Apache-2.0) - Supplement for specialized flows

---

### **License Comparison for RateHunter**

| License Type | Tools | Commercial Use | Modification | Distribution |
|--------------|-------|----------------|--------------|--------------|
| **MIT** | Activepieces, Huginn | ✅ Unrestricted | ✅ Yes | ✅ Any license |
| **Apache-2.0** | Node-RED, Trigger.dev | ✅ Unrestricted | ✅ Yes | ✅ Patent grant |
| **AGPL-3.0** | Automatisch, Windmill, Twenty | ✅ Yes | ✅ Yes | ⚠️ Must share source if network-accessed |
| **Fair-code** | n8n | ⚠️ Some restrictions | ✅ Yes | ⚠️ Commercial limits |
| **Proprietary** | Zoho, HubSpot, GoHighLevel | 💰 Subscription | ❌ No | ❌ No |

---

### **RateHunter-Specific Benefits**

**Self-Hosted Advantages:**
- ✅ Rate data sovereignty (compliance-friendly)
- ✅ No per-operation costs as volume scales
- ✅ Custom broker API connectors
- ✅ Financial data regulation compliance
- ✅ No vendor lock-in

**Cost Projections:**
- **SaaS (Zapier/Make)**: $500-2000/month at scale
- **Self-hosted**: $50-200/month (infrastructure only)
- **ROI Timeline**: 3-6 months break-even

---

## ✅ Implementation Checklist

### Phase 1: Evaluation (Week 1-2)
- [ ] Set up Activepieces development environment
- [ ] Set up Node-RED development environment
- [ ] Test n8n fair-code license implications
- [ ] Document top 5 broker automation workflows needed
- [ ] Research broker API documentation (Optimal Blue, Encompass, etc.)

### Phase 2: Prototype (Week 3-4)
- [ ] Build first workflow: Rate sheet ingestion
- [ ] Build second workflow: Client notification automation
- [ ] Build third workflow: CRM data sync
- [ ] Test Node-RED for real-time rate feed processing
- [ ] Document performance metrics

### Phase 3: Production Prep (Week 5-6)
- [ ] Security hardening (authentication, encryption)
- [ ] Backup/disaster recovery setup
- [ ] Monitoring and alerting configuration
- [ ] Team training documentation
- [ ] Migration plan from current tools

### Phase 4: Deployment (Week 7-8)
- [ ] Production deployment
- [ ] Parallel run with existing systems
- [ ] Performance validation
- [ ] Cost tracking implementation
- [ ] Feedback collection from team

---

## 🔗 Quick Reference Links

### Self-Hosted Champions
- **Activepieces**: https://github.com/activepieces/activepieces
- **Node-RED**: https://nodered.org | https://github.com/node-red/node-red
- **n8n**: https://github.com/n8n-io/n8n
- **Automatisch**: https://github.com/automatisch/automatisch

### Documentation
- **n8n License**: https://docs.n8n.io/sustainable-use-license/
- **Automatisch Docs**: https://automatisch.io/
- **Windmill Docs**: https://www.windmill.dev/
- **Trigger.dev Docs**: https://github.com/triggerdotdev/trigger.dev

### SaaS Alternatives
- **Zoho Flow Pricing**: https://www.zoho.com/flow/pricing.html
- **HubSpot Review**: https://www.techradar.com/reviews/hubspot-crm-review
- **GoHighLevel Pricing**: https://ghl-services-playbooks-automation-crm-marketing.ghost.io/gohighlevel-pricing-plans-explained-features-value-cost-comparison-2025/

### Emerging Tools
- **Twenty CRM**: https://github.com/twentyhq/twenty

---

## 📝 Decision Matrix

| Criteria | Activepieces | n8n | Node-RED | Automatisch |
|----------|--------------|-----|----------|-------------|
| **License Freedom** | ⭐⭐⭐⭐⭐ MIT | ⭐⭐⭐ Fair-code | ⭐⭐⭐⭐⭐ Apache | ⭐⭐⭐⭐ AGPL |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Connector Ecosystem** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Community Size** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **API/IoT Focus** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Enterprise Ready** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cost (Self-host)** | Free | Free* | Free | Free |

*n8n advanced features may require commercial license in self-hosted environments

---

## 🎯 Final Recommendation for Project NYRA

**Recommended Stack:**
1. **Primary**: Activepieces (MIT) - Maximum freedom, beginner-friendly
2. **Specialized**: Node-RED (Apache-2.0) - Real-time rate data flows
3. **Backup/Evaluate**: n8n - If enterprise features outweigh licensing concerns

**Timeline**: 8-week implementation | 3-6 month ROI | $150-300/month infrastructure cost

**Next Action**: Set up Activepieces and Node-RED dev environments this week
