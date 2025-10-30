<div align="center">

# 🏠 NYRA
**AI-Powered Mortgage Assistant & Self-Building Dev Stack**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![UV](https://img.shields.io/badge/UV-Package%20Manager-green.svg)](https://github.com/astral-sh/uv)
[![GitHub Actions](https://github.com/ellisapotheosis/Project-Nyra/workflows/CI/badge.svg)](https://github.com/ellisapotheosis/Project-Nyra/actions)
[![License](https://img.shields.io/badge/License-Private-red.svg)](LICENSE)
[![Xulbux Purple](https://img.shields.io/badge/Brand-Xulbux%20Purple-purple.svg)](#)

*Automating the entire mortgage broker pipeline while a multi-agent team continuously improves the product*

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🏗️ Architecture](#️-architecture) • [🤝 Contributing](#-contributing)

</div>

---

## 🎯 Mission

NYRA is an **end-to-end, AI-powered mortgage assistant** that automates the complete broker pipeline from intake to post-close, while a sophisticated multi-agent development team continuously improves the product.

### Core Pipeline Automation
- **📋 Intake & Pre-qualification** - Smart form processing and document collection
- **💰 Pricing & Rate Shopping** - Real-time lender comparison and optimization  
- **📄 Documentation & LOS** - Automated document generation and loan origination
- **🔍 Underwriting & Appraisal** - AI-assisted review and condition management
- **🔐 Rate Locks & CTC** - Clear-to-close automation and timeline management
- **✅ Post-Close Services** - Quality assurance and customer follow-up

## 🏗️ Architecture

### Split-Orchestrator Design
- **Primary Orchestrator** - Tool/MCP routing, policy enforcement, inter-agent communications
- **TaskGen Orchestrator** - Goal→task DAGs, acceptance tests, convergence validation

### Multi-Agent Ecosystem
```
🤖 Lead Coder       │ Primary development and architecture decisions
🔄 Morph/DSPy       │ Minimal-diff refactors and code transformations  
🐛 Debug/Aider      │ Issue resolution and debugging workflows
🛠️ Small-Code       │ Focused feature implementations
👥 External Reviewer│ Code quality and security assessments
🌐 Browser/PC Agent │ UI testing and system automation
💾 Memory Manager   │ Context and knowledge management
🗣️ Voice Interface  │ Natural language interactions
```

### Technology Stack

**🧠 AI/ML Frameworks**
- **LangGraph** - Stateful agent graph orchestration
- **AutoGen2** - Multi-agent conversation frameworks  
- **OpenEvolve/CodeLion + PraisonAI** - Orchestration layers
- **Letta** - Workload-aware deployment management

**🎨 User Interface**
- **Open-WebUI + Loab.Chat** - Primary interface (Dify planned)
- **Voicemod + Kyutai Unmute** - Voice interaction capabilities
- **Brand**: Xulbux Purple theme with clean, modern design

**🧠 Memory & Knowledge**
- **memOS (MemoryTensor) + Graphiti + FalkorDB** - Long-term memory
- **ChromaDB** - Hot local vector storage
- **KAG-first retrieval** - Knowledge-augmented generation with seq2seq distillation

**💾 Data Layer**
- **Supabase/Postgres** - Primary application database (optional pgvector)
- **Notion + GitHub** - Source of truth for documentation and code
- **LlamaIndex** - Document processing and ingestion pipeline

**🔧 Infrastructure**
- **Hybrid Local+Cloud** - Local GPUs (RTX 5090/3090/3060) + cloud scaling
- **Cloudflare Tunnel** - Secure access under ratehunter.net domain
- **Koyeb/VPS** - Additional cloud resources as needed
- **Bitwarden/Infisical** - Secrets management (1Password integration)

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- [UV Package Manager](https://github.com/astral-sh/uv)
- Git
- PowerShell 7+ (Windows)

### Installation

```bash
# Clone the repository
git clone https://github.com/ellisapotheosis/Project-Nyra.git
cd Project-Nyra

# Install dependencies with UV
uv sync

# Copy environment template
cp .env.example .env.development
# Edit .env.development with your API keys (see Environment Setup below)

# Install pre-commit hooks
uv run pre-commit install

# Run tests
uv run pytest

# Start development server
uv run python -m nyra.main
```

### Environment Setup

1. **Copy the environment template**:
   ```bash
   cp .env.example .env.development
   ```

2. **Configure secrets** (see [Security](#-security) section):
   - Set up Infisical for centralized secret management
   - Or manually configure API keys in `.env.development`

3. **Quick secret rotation** (if needed):
   ```powershell
   .\scripts\rotate-secrets.ps1  # Interactive rotation helper
   ```

## 📦 Repository Structure

```
Project-Nyra/
├── 📁 src/nyra/           # Core application code
│   ├── agents/           # Multi-agent implementations
│   ├── orchestration/    # Task and agent coordination
│   ├── mortgage/         # Domain-specific business logic
│   └── infrastructure/   # System components
├── 📁 tests/             # Comprehensive test suite
├── 📁 docs/              # Documentation and guides
├── 📁 scripts/           # Automation and utility scripts
├── 📁 .github/           # CI/CD workflows and templates
├── 🔧 pyproject.toml     # Python project configuration
├── 🔒 uv.lock           # Dependency lock file
└── 📋 README.md          # This file
```

## 🧪 Development Workflow

### "Hot-Potato" Development Loop
Each agent handoff includes:
- **Diffs** - Exact code changes made
- **Tests** - Validation of changes
- **Rationale** - Explanation of decisions

### Code Quality
- **Pre-commit hooks** - Automated linting and formatting
- **Minimal-diff principle** - Prefer small, focused changes
- **ADRs** - Architecture Decision Records for major decisions  
- **Runbooks** - Operational procedures and troubleshooting

### Testing Strategy
```bash
# Run the full test suite
uv run pytest

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Run specific test categories
uv run pytest tests/unit/
uv run pytest tests/integration/
uv run pytest tests/e2e/
```

## 🔐 Security

### Secret Management
- **Never commit secrets** - All `.env*` files (except `.env.example`) are gitignored
- **Infisical Integration** - Centralized secret management with environment separation
- **Rotation Tools** - Automated helpers for API key rotation

### Emergency Procedures
- See `SECURITY_ROTATION_PLAN.md` for secret rotation procedures
- Use `scripts/rotate-secrets.ps1` for guided rotation process
- GitHub secret scanning provides automatic breach detection

## 🔧 MCP Integration

**Mortgage Ops MCP** wraps:
- **Pricing Engines** - Rate comparison and optimization
- **LOS/CRM Integration** - Loan origination system connectivity
- **OCR/Extraction** - Document processing capabilities
- **Communications** - Email/SMS automation
- **Compliance Logging** - Audit trail and regulatory compliance

## 🤝 Contributing

### Development Principles
1. **Minimal-diff first** - Prefer small, focused changes
2. **Test-driven** - Write tests before implementation
3. **Document decisions** - Use ADRs for architectural choices
4. **Human-in-the-loop** - AI assists, humans decide

### Getting Involved
1. Check existing issues and ADRs
2. Follow the hot-potato workflow for changes
3. Ensure all tests pass and pre-commit hooks succeed
4. Update documentation for user-facing changes

## 📊 Monitoring & Observability

- **Sentry** - Error tracking and performance monitoring
- **Custom metrics** - Business logic and pipeline performance
- **Agent telemetry** - Multi-agent system health and efficiency
- **Compliance logging** - Audit trails for mortgage operations

## 🎯 Goals

- **Trustworthy** - Explainable AI decisions with human oversight
- **Fast** - Reduce mortgage processing cycle time significantly  
- **Accurate** - Minimize errors through automated validation
- **Learning** - Continuous improvement from every processed case
- **Compliant** - Full regulatory compliance and audit capabilities

---

<div align="center">

**Built with ❤️ using AI-first development principles**

*"Every prompt that touches NYRA assumes this context by default"*

[🏠 Home](https://github.com/ellisapotheosis/Project-Nyra) • [📧 Contact](mailto:your-email@domain.com) • [🐛 Issues](https://github.com/ellisapotheosis/Project-Nyra/issues)

</div>

