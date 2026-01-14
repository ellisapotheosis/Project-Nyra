# 🌊 Claude-Flow v2.0.0 Alpha Wiki

<div align="center">

[![🌟 Star on GitHub](https://img.shields.io/github/stars/ruvnet/claude-flow?style=for-the-badge&logo=github&color=gold)](https://github.com/ruvnet/claude-flow)
[![📦 Alpha Release](https://img.shields.io/npm/v/claude-flow/alpha?style=for-the-badge&logo=npm&color=orange&label=v2.0.0-alpha.89)](https://www.npmjs.com/package/claude-flow/v/alpha)
[![⚡ Claude Code](https://img.shields.io/badge/Claude%20Code-Optimized-green?style=for-the-badge&logo=anthropic)](https://github.com/ruvnet/claude-flow)
[![🏛️ Agentics Foundation](https://img.shields.io/badge/Agentics-Foundation-crimson?style=for-the-badge&logo=openai)](https://discord.agentics.org)

</div>

---

## 🌟 **Welcome to Claude-Flow**

**Claude-Flow v2 Alpha** is an enterprise-grade AI orchestration platform that revolutionizes how developers build with AI. By combining **hive-mind swarm intelligence**, **neural pattern recognition**, and **87 advanced MCP tools**, Claude-Flow enables unprecedented AI-powered development workflows.

### 🎯 **Key Features**

- **🔍 NEW: Truth Verification System**: Mandatory verification with 0.95 accuracy threshold
- **👥 NEW: Pair Programming Mode**: Real-time collaborative development with continuous validation
- **🧠 NEW: Training Pipeline**: Machine learning system that improves agent performance over time
- **🤖 64 Specialized AI Agents**: Complete agent ecosystem across 16 categories
- **🐝 Hive-Mind Intelligence**: Queen-led AI coordination with specialized worker agents
- **✨ NEW: Intelligent Automation**: MLE-STAR workflow engine with smart agent spawning
- **🔗 NEW: Stream-JSON Chaining**: Real-time agent-to-agent output piping for seamless coordination
- **🧠 Neural Networks**: 27+ cognitive models with WASM SIMD acceleration
- **🔧 87 MCP Tools**: Comprehensive toolkit for swarm orchestration, memory, and automation
- **🔄 Dynamic Agent Architecture (DAA)**: Self-organizing agents with fault tolerance
- **💾 SQLite Memory System**: Persistent `.swarm/memory.db` with 12 specialized tables
- **🪝 Advanced Hooks System**: Automated workflows with pre/post operation hooks
- **📊 GitHub Integration**: 13 specialized agents for repository management
- **🎉 NEW: GitHub-Enhanced Init**: Automatic GitHub releases for all checkpoints
- **📈 NEW: Benchmark System**: Comprehensive performance testing with swarm-bench CLI
- **⚡ Performance**: 84.8% SWE-Bench solve rate, 2.8-4.4x speed improvement

## 🧠 **NEW: Neural & Goal Modules (v2.0.0-alpha.109)**

### **Advanced AI Capabilities Now Available via NPX**

Initialize powerful AI modules with a single command:

```bash
# Initialize SAFLA Neural Module - Self-learning AI systems
npx claude-flow@alpha neural init
npx claude-flow@alpha neural init --force  # Overwrite existing

# Initialize GOAP Goal Module - Intelligent planning systems  
npx claude-flow@alpha goal init
npx claude-flow@alpha goal init --force    # Overwrite existing
```

#### **What You Get:**
- **[[Neural Module]]**: SAFLA self-aware systems with 4-tier memory, 172K+ ops/sec
- **[[Goal Module]]**: GOAP planning with A* pathfinding and adaptive replanning
- Ready-to-use agents for Claude Code (`@agent-safla-neural`, `@agent-goal-planner`)
- Complete configuration and documentation

## 🔍 **Truth Verification & Pair Programming**

### **Verification-First Development**
Claude-Flow now enforces **"truth is enforced, not assumed"** with mandatory verification:

```bash
# Initialize project with verification
npx claude-flow@alpha init --verify  # Truth verification mode
npx claude-flow@alpha init --pair    # Pair programming mode
npx claude-flow@alpha init --verify --pair  # Combined mode

# Run verification system
npx claude-flow@alpha verify init strict     # 0.95 threshold, auto-rollback
npx claude-flow@alpha verify status          # Check system status

# Run verification
npx claude-flow@alpha verify verify task-123 --agent coder
npx claude-flow@alpha truth                  # View truth scores

# Pair programming with real-time verification
npx claude-flow@alpha pair --start           # Start collaborative session
```

**Key Verification Features:**
- ✅ **0.95 Truth Threshold**: 95% accuracy required for production
- 🔄 **Auto-Rollback**: Automatic recovery from verification failures
- 🔒 **Byzantine Fault Tolerance**: Protection against incorrect agents
- 📊 **Real-time Monitoring**: Continuous validation and feedback
- 🤝 **Pair Programming**: Human + AI collaborative development

📚 **[Truth Verification System Documentation →](Truth-Verification-System)**
📚 **[Pair Programming System Documentation →](Pair-Programming-System)**

## 🤖 **Complete Agent System (64 Specialized Agents)**

Claude-Flow Alpha.88 includes a comprehensive agent system with **64 specialized AI agents** across **16 categories**, providing unparalleled development capabilities:

### 📚 **Agent Documentation**
- **[Agent System Overview](Agent-System-Overview)** - Complete catalog of all 64 agents with descriptions
- **[Agent Usage Guide](Agent-Usage-Guide)** - Practical examples and concurrent usage patterns
- **[Agent Categories](Agent-Categories)** - Detailed breakdown of all 16 categories

### 🎯 **Featured Agent Categories**
- **Core Development** (5): coder, planner, researcher, reviewer, tester
- **Swarm Coordination** (3): hierarchical, mesh, adaptive coordinators
- **Consensus Systems** (7): Byzantine, Raft, Gossip, CRDT protocols
- **GitHub Integration** (13): PR management, code review, release automation
- **Performance Optimization** (6): monitoring, load balancing, topology optimization
- **[View All 16 Categories →](Agent-System-Overview)**

### ⚡ **Quick Agent Examples**
```bash
# Initialize with complete agent system
npx claude-flow@alpha init

# Deploy multi-agent swarm
claude-flow swarm "Build REST API with authentication" --agents 8

# Concurrent agent deployment
Task("System architecture", "...", "system-architect")
Task("Backend development", "...", "backend-dev")
Task("Test creation", "...", "tester")
```

## 📋 **CLAUDE.md Configuration Templates**

Claude-Flow provides specialized **CLAUDE.md** templates for different project types and development patterns. These templates optimize AI coordination for specific use cases:

| 🏷️ **Category** | 📊 **Templates** | 🎯 **Use Cases** |
|-----------------|-----------------|-----------------|
| **🚀 Project Types** | [Web Dev](CLAUDE-MD-Web-Development), [Mobile](CLAUDE-MD-Mobile-Development), [API](CLAUDE-MD-API-Development), [AI/ML](CLAUDE-MD-AI-ML-Projects) | Full-stack apps, mobile apps, APIs, ML projects |
| **🧪 Methodologies** | [TDD](CLAUDE-MD-TDD), [Agile](CLAUDE-MD-Agile), [DDD](CLAUDE-MD-DDD), [CI/CD](CLAUDE-MD-CICD) | Test-driven, sprint-based, domain-focused development |
| **🏗️ Architecture** | [Microservices](CLAUDE-MD-Microservices), [Serverless](CLAUDE-MD-Serverless), [Monolithic](CLAUDE-MD-Monolithic) | Distributed systems, cloud-native, traditional apps |
| **🔧 Languages** | [JavaScript](CLAUDE-MD-JavaScript), [Python](CLAUDE-MD-Python), [TypeScript](CLAUDE-MD-TypeScript), [Java](CLAUDE-MD-Java) | Language-specific patterns and best practices |
| **🏢 Team Size** | [Solo](CLAUDE-MD-Solo), [Small Team](CLAUDE-MD-Small-Team), [Enterprise](CLAUDE-MD-Enterprise) | Individual, startup, corporate development |

> **💡 Quick Start**: `claude-flow templates apply web-development --output CLAUDE.md`

**➡️ [Browse All Templates](CLAUDE-MD-Templates)** - Complete collection with usage guides

## 📚 **Documentation Navigation**

### 🤖 AI Modules
- **[[Neural Module]]** - SAFLA self-learning systems with persistent memory
- **[[Goal Module]]** - GOAP intelligent planning with A* pathfinding

### 🚀 Getting Started
- **[Installation Guide](Installation-Guide)** - Complete setup instructions
- **[Quick Start](Quick-Start)** - Get up and running in minutes
- **[Init Commands](Init-Commands)** - Project initialization options and configurations
- **[Windows Installation](Windows-Installation)** - Windows-specific setup
- **[Non-Interactive Mode](Non-Interactive-Mode)** - CI/CD and automation guide
- **[GitHub Actions Integration](GitHub-Actions-Tutorial)** - Automated workflows
- **[WebSocket Server Guide](WebSocket-Server-Tutorial)** - Headless WebSocket deployment

### 🧠 Core Concepts
- **[Hive-Mind Intelligence](Hive-Mind-Intelligence)** - Understanding AI coordination
- **[Agent System Overview](Agent-System-Overview)** - Complete 64-agent system reference
- **[Agent Usage Guide](Agent-Usage-Guide)** - Practical usage patterns and examples
- **[Memory System](Memory-System)** - SQLite-based persistent memory
- **[Hooks System](Hooks-System)** - Automated workflow orchestration

### ⚡ Advanced Features
- **[Truth Verification System](Truth-Verification-System)** 🔍 - Mandatory verification with 0.95 truth threshold
- **[Pair Programming System](Pair-Programming-System)** 👥 - Real-time collaborative development with AI
- **[Training Pipeline (NEW!)](Training-Pipeline)** 🧠 - Machine learning system for continuous agent improvement
- **[Verification-Training Integration](Verification-Training-Integration)** 🔄 - How verification feeds training for better predictions
- **[Neural Networks](Neural-Networks)** - AI pattern recognition and learning
- **[MCP Tools](MCP-Tools)** - Complete tool reference (87 tools)
- **[GitHub Integration](GitHub-Integration)** - Repository management automation
- **[GitHub Hooks (NEW!)](GitHub-Hooks)** - Automatic checkpoint releases & team collaboration
- **[Workflow Orchestration](Workflow-Orchestration)** - Complex task coordination
- **[Automation Commands (NEW!)](Automation-Commands)** - Intelligent workflow automation with MLE-STAR
- **[Stream Chaining (NEW!)](Stream-Chaining)** - Real-time agent output piping and coordination with technical implementation details
- **[MLE-STAR Workflow (NEW!)](MLE-STAR-Workflow)** - Machine Learning Engineering via Search and Targeted Refinement

### 📊 Performance & Benchmarking
- **[Benchmark System](Benchmark-System)** - Complete benchmarking framework with swarm-bench CLI
- **[SWE-bench Evaluation (NEW!)](SWE-Bench-Evaluation)** - Official software engineering benchmark integration
- **[Performance Benchmarking (NEW!)](Performance-Benchmarking)** - Advanced performance testing and optimization

### 🛠️ Development
- **[SPARC Methodology](SPARC-Methodology)** - Test-driven development patterns
- **[Development Patterns](Development-Patterns)** - Best practices and examples
- **[API Reference](API-Reference)** - Complete API documentation
- **[Troubleshooting](Troubleshooting)** - Common issues and solutions

### 📋 Configuration Templates
- **[CLAUDE.md Templates](CLAUDE-MD-Templates)** - Project-specific configuration templates
- **[Web Development](CLAUDE-MD-Web-Development)** - Full-stack web application template
- **[TDD Template](CLAUDE-MD-TDD)** - Test-driven development configuration
- **[API Development](CLAUDE-MD-API-Development)** - RESTful API project template
- **[Mobile Development](CLAUDE-MD-Mobile-Development)** - Native and hybrid mobile apps

### 🤝 Community
- **[Contributing](Contributing)** - How to contribute to Claude-Flow
- **[Examples](Examples)** - Real-world usage examples
- **[FAQ](FAQ)** - Frequently asked questions

---

## 🚀 **Quick Commands**

```bash
# Install Claude-Flow Alpha
npm install -g claude-flow@alpha

# Standard Init (Local Git checkpoints)
claude-flow init

# GitHub-Enhanced Init (NEW! GitHub releases for checkpoints)
claude-flow github init

# Initialize Hive-Mind Swarm
claude-flow hive init --topology mesh --agents 5

# Run SPARC Development Mode
claude-flow sparc run dev "build user authentication"

# Execute with full orchestration
claude-flow orchestrate "create REST API with tests" --agents 8 --parallel

# NEW! Intelligent Automation Commands
claude-flow automation mle-star --dataset data.csv --target label --claude
claude-flow automation auto-agent --task-complexity enterprise
claude-flow automation run-workflow workflow.json --claude --non-interactive

# NEW! Stream Chaining (Agent-to-Agent Piping)
claude-flow automation mle-star --dataset data.csv --target price --claude --output-format stream-json

# NEW! Training Pipeline Commands
claude-flow train-pipeline run --complexity medium --iterations 3
claude-flow train-pipeline status    # View agent performance profiles
claude-flow train-pipeline validate  # Check current performance metrics
claude-flow verify-train feed        # Feed verification data to training
claude-flow verify-train predict default coder  # Predict task outcomes

# NEW! Benchmarking Commands
swarm-bench run "Build REST API" --strategy development --max-agents 6
swarm-bench swarm "Create auth system" --mode hierarchical --parallel
swarm-bench sparc coder "Implement feature" --timeout 60

# NEW! SWE-bench Integration (Official software engineering benchmark)
swarm-bench swe-bench official --limit 10    # Test with 10 instances
swarm-bench swe-bench multi-mode --instances 5  # Compare all modes
swarm-bench swe-bench official --lite        # Full evaluation (300 instances)
```

---

> 🔥 **Revolutionary AI Coordination**: Build faster, smarter, and more efficiently with AI-powered development orchestration

**Latest Version**: v2.0.0-alpha.88 | **License**: MIT | **Node.js**: 18+ Required