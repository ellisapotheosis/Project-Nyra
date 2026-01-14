# Sider AI Research Overview

```markdown
# Multi-Agent AI System: Nyra - Mortgage Broker Assistant

## I. Project Overview

- **Goal:** Develop a multi-agent AI system (Nyra) to assist mortgage brokers in managing leads, streamlining workflows, and closing deals.
- **Target Users:** Initially, yourself, then expanding to a team and potentially a larger company.
- **Team Size:** 7-12 AI agents running concurrently, with the possibility of up to 3 agents running locally on GPUs.
- **Key Technologies:**
    - Agent Frameworks: Autogen, CrewAI, LangGraph
    - MCP Servers: MemoryOS, Gravitee.io Agent Mesh
    - Memory: memOS, RAG, MySQL, LlamaDB
    - IDE: Cline, RooCode, Continue.dev, Aider

## II. Agentic AI System Architecture

- **Framework Selection:**
    - **Autogen:** Good for dynamic agent collaboration and iterative feedback.
    - **CrewAI:** Intuitive agent orchestration, task assignment, and teamwork.
    - **LangGraph:** For reliable multi-step workflows and state management.
- **Key Agent Roles:**
    - Orchestrator Agent (AGI-like): Main task producer, Context Engineering is crucial.
    - Developer Agents: Code and implement features.
    - Task Manager Agents: Assign and monitor tasks.
    - Toolset Agents: Provide access to external tools and APIs.
    - Debugging Agents: Identify and resolve code issues.
- **Agent Communication:** Utilize structured languages and predefined protocols (FIPA-ACL, JSON/XML Schemas).
- **Coordination Models:** Centralized, decentralized, or market-based models.
- **Orchestration:** Use GraphFlow within Autogen or integrate LetMeDoIt 3.0 for processes and orchestration.

## III. Memory and Knowledge Management

- **Document Conversion:** Develop a Python script to clean and convert conversation logs (JSON, Markdown, HTML) into a usable format.
- **Memory Systems:**
    - MemOS (Memory Tensors): Primary memory choice for long-term storage.
    - RAG (Retrieval-Augmented Generation): Enhance context retrieval.
    - LlamaGraph/VectorDB/Supabase: Store coding steps and prompts.
    - LangMem/LettaAI: Agents learn/adapt/optimize behavior.
- **Knowledge Bases:** Build knowledge bases from existing documents using AnythingLLM.

## IV. Development Workflow and Tooling

- **12-Factor Agents Principles:** Structure the system to adhere to the 12-factor app methodology.
- **Prompting Frameworks:** BAML or DSPY
- **IDE Selection:**
    - Cline and RooCode (Autonomous coding and orchestration).
    - Continue.dev or Aider (Alternative options).
- **UI Framework:** Python - Streamlit / Autogen Studio.
- **Web Scraping:** Use AutoAgents for custom output types.

## V. Codebase Structure and Repositories

- **Directory Structure:**
    - Move everything from your GitHub folder to a dedicated “DevProjects” folder.
    - Create new repositories for different projects.
- **Repositories:**
    - Consider Codelion/OpenEvolve for evolutionary coding.
    - Utilize a prompting repository and a tokenization saving repository.

## VI. Task Orchestration and Agent Collaboration

- **Task Assignment:** Define who assigns tasks in each team to maintain job consistency.
- **Feedback Loop:**
    - Implement a feedback loop between two “heavy toolset” agents (DevinAI, SuperAGI, babyAGI) using different LLMs (Anthropic and OpenAI).
    - Agents iteratively refine code by passing it back and forth until no improvements are possible.
    - Implement factor 12 from the 12-factor agents principles.
- **Design Patterns for Agentic Workflow:**
    - Planning: Autonomous task decomposition.
    - Tool Use: Agents interact with external services.
    - Reflection: Agents use self-critique to improve outputs.

## VII. Key Technologies Explored

This section summarizes technologies mentioned for potential use in Nyra.

### Agent Frameworks

- **AutoGen:** A framework from Microsoft Research for building conversational AI agents. It enables the creation of multi-agent systemsOkay, I can help you create a structured document summarizing the information from the provided sources, suitable for importing into Notion. Here’s a breakdown, incorporating key elements and formatting for Notion’s import capabilities:

**I. Project Overview: Nyra - Mortgage Brokers Assistant**

- **Goal:** To develop a multi-agent AI system (Nyra) that assists mortgage brokers in their daily tasks, specifically with lead management and closing deals.
- **Agent Team Size:** 7-12 AI Agents, including potential for 3 locally run GPU agents and 1 additional API agent for troubleshooting.
- **Agent Hosting:**
    - Minimum 7-9 agents running via OpenAI or Anthropic API keys.
    - Potential for 1-3 additional local GPU-ran agents (RTX 3060/RTX 5090).
    - Possible additional API agent through IDE (Aider, Continue.dev, Cline, RooCode, DevinAI, etc.) for troubleshooting.
- **Desired Outcome:** A robust, context-aware coding assistant with high automation, efficient resource distribution, and advanced project orchestration.

**II. System Stack and Architecture**

- **Frameworks (Selection & Comparison Needed):**
    - AutoGen (Primary contender due to flexibility & control)
    - CrewAI (Considered for ease of use, potentially hybrid setup)
    - LangGraph (For reliable multi-step workflows)
    - Agno (Potentially, for fast, lightweight agents).
- **IDE/VSCode Agent/Editor (Selection Needed):**
    - Cline (Autonomous coder, good tasking/orchestration, Qwen3.5 Cerebras).
    - RooCode (Autonomous coder, good tasking/orchestration).
    - Continue.dev, Refact.ai, Tabnine, CodyAI, Aider.
- **Memory and Knowledge Base:**
    - MemOS (Primary choice)
    - RAG (Retrieval-Augmented Generation)
    - Pinecone/MySQL/LlamaGraph/VectorDB/Supabase
- **MCP Servers (For improved AI context):**
    - MCP (Model Context Protocol) to standardize LLM integration and connect tools/data
    - Gravitee.io Agent Mesh (Consolidate, secure, manage AI agents)

**III. 12-Factor Agent Principles**

1. **Codebase:** Tracked in Git repositories (GitHub, DevProjects folder).
2. **Dependencies:** Explicitly declared and isolated (containerization with Docker/Kubernetes).
3. **Config:** Store configuration in the environment (API keys, database URLs).
4. **Backing Services:** Treat databases, message queues (Redis, Kafka), and MCP servers as attached resources.
5. **Build, Release, Run:** Implement CI/CD pipelines for automated builds, releases, and deployments.
6. **Processes:** Execute agents as stateless processes.
7. **Port Binding:** Expose services via port binding (Express, FastAPI).
8. **Concurrency:** Scale out via process model (distribute agents across multiple GPUs/machines).
9. **Disposability:** Design agents for fast startup and graceful shutdown.
10. **Dev/Prod Parity:** Maintain consistent environments across development, staging, and production.
11. **Logs:** Treat logs as event streams and pipe them to a central logging system (Elastic Stack, Prometheus, Datadog).
12. **Admin Processes:** Run admin/maintenance tasks as one-off processes.

**IV. Key Tasks and Agent Roles**

- **Task Orchestrator Agent (AGI-like):**
    - Responsible for task creation, planning, and direction of other agents.
    - Candidates: DevinAI, OpenDevin, LetMeDoIt AI 3.0, SuperAGI, BabyAGI, AgentZero.
- **Developer Agents:** Responsible for code generation and implementation.
- **Task Manager Agents:** Manages task allocation and workflow.
- **Context Engineering Agents:** Focus on prompting and tasking other agents, ensuring optimal context.
- **MCP/Toolset Agents:** Agents dedicated to managing and utilizing MCP servers and various tools.
- **Debugging Agents:** Agents focused on identifying and resolving code errors.
- **Feedback Loop:**
    - Implement a dual-agent feedback loop where two agents (potentially using different LLMs - OpenAI & Anthropic) iteratively refine code.
    - One agent generates code/actions, the other validates and suggests improvements.