# 🏠🤖 NYRA - End-to-End AI Mortgage Assistant

**Mission**: Automate the complete broker pipeline from intake to post-close while a multi-agent team continuously improves the product.

## 🧭 Infra Bundle (v6.2)

This repository now includes a complete infra bundle under `nyra-infra/nyra-stack-v6_2/`:
- Orchestrator (MetaMCP, Open WebUI, Caddy, cloudflared, Postgres, Redis, Infisical MCP, optional LiteLLM)
- Worker (Ollama)
- DevContainer, WSL helpers, Infisical secret flow, auto-discovered integrations
- CI to publish a zipped artifact of the infra folder

Start here: `nyra-infra/nyra-stack-v6_2/docs/MASTER_STEPS_6_2.md`

## 🎯 Core Architecture

### Split-Orchestrator Design
- **Primary Orchestrator**: Tool/MCP routing, policy, inter-agent communications
- **TaskGen Orchestrator**: Goal→task DAGs, acceptance tests, convergence

### Multi-Agent Team
- **Lead Coder**: Primary development and architecture
- **Morph/DSPy**: Minimal-diff refactors and optimization
- **Debug/Aider**: Issue resolution and testing
- **Small-Code**: Specialized small code tasks
- **External Reviewer**: Code review and quality assurance
- **Browser/PC**: Web automation and PC interactions
- **Voice Agent**: Speech recognition and voice UI

## 🏗️ Project Structure

\\\
Project-Nyra/
├── nyra-core/           # Core orchestration and agents
├── nyra-webapp/         # UI (Open-WebUI + Loab.Chat)
├── nyra-memory/         # Memory systems (memOS + Graphiti + FalkorDB)
├── nyra-infra/          # Infrastructure and deployment
└── nyra-prompts/        # Mortgage-specific prompts and workflows
\\\

## 🚀 Quick Start

1. **Start Development Environment**:
   \\\ash
   docker-compose up -d
   \\\

2. **Access Services**:
   - NYRA Orchestrator: http://localhost:8000
   - Web UI: http://localhost:3000
   - FalkorDB: localhost:6379
   - ChromaDB: http://localhost:8001

3. **Initialize Agents**:
   \\\ash
   python scripts/initialize-agents.py
   \\\

## 🤖 Mortgage Workflow Pipeline

1. **Intake** → Customer information capture
2. **Pre-Qualification** → Initial assessment
3. **Pricing** → Rate and product selection
4. **Documentation** → Document collection and processing
5. **LOS Integration** → Loan origination system
6. **Disclosures** → Regulatory compliance
7. **UW/Appraisal** → Underwriting and property valuation
8. **Conditions** → Condition management
9. **Rate Locks** → Interest rate securing
10. **Clear to Close** → Final approval
11. **Post-Close** → Loan servicing handoff

## 💾 Memory Systems

- **memOS (MemoryTensor)**: Primary memory orchestration
- **Graphiti**: Relationship and knowledge mapping
- **FalkorDB**: Graph database for complex relationships
- **ChromaDB**: Vector storage for semantic search
- **KAG-first retrieval**: Knowledge-augmented generation

## 🎨 UI Framework

- **Open-WebUI**: Primary interface
- **Loab.Chat**: Specialized chat interface
- **Xulbux Purple Theme**: Consistent branding
- **Dify Integration**: Planned future enhancement

## 🔧 Development

- **Framework**: LangGraph + AutoGen2 + OpenEvolve + PraisonAI
- **Deployment**: Letta for workload-aware deployment
- **Observability**: Comprehensive monitoring stack
- **Memory**: Persistent across sessions with learning

## 📊 Infrastructure

- **Local**: RTX 5090/3090/3060 GPUs
- **Cloud**: Koyeb + VPS as needed
- **Tunnel**: Cloudflare Tunnel (ratehunter.net)
- **Secrets**: Bitwarden → Infisical migration planned

## 🛡️ Security & Compliance

- Mortgage industry compliance built-in
- Audit logging for all operations
- Secure secret management
- Data encryption in transit and at rest

---

**Brand**: Xulbux Purple  
**Mission**: Trustworthy, fast, explainable mortgage copilot that learns from every case  
**Philosophy**: Minimal-diff first, ADRs for decisions, humans in the loop
