# NYRA Project System Map

# Project NYRA: System Mapping Overview

This document outlines the **three main system categories** for Project NYRA and organizes all known tools, frameworks, agents, repositories, and research notes submitted thus far. Everything is tagged, categorized, and linked for further use in Notion, memOS, or downstream agent ingestion.

---

## 1. 🛠️ NYRA Dev Team Setup (#NYRA #Dev #Agent #Memory #MCP)

### 🔧 Agent Frameworks + Orchestration

- **CrewAI** — Modular, team-based agents
- **Autogen** — Microsoft’s flexible orchestrator
- **LangGraph** — State-machine graph for agent memory & control
- **LettaAI** — Agent deployment & monitoring engine (w/ ADE GUI)
- **OpenEvolve / CodeLion** — Evolutionary code refinement loop (central orchestrator candidate)
- **Agno** — Lightweight, fast, Python-based DSL for agent orchestration
- **12-Factor Agents Framework**: [Repo](https://github.com/humanlayer/12-factor-agents)

### 🧠 Memory + Prompting

- **memOS + MemoryCubes** — Structured recursive memory engine
- **Letta + MemGPT** — Long-term adaptive memory for deployed agents
- **Langmem** — Agent learning and conversation extraction
- **ChromaDB / Weaviate** — Vector store for contextual retrieval
- **DSPy / BAML** — Prompt engineering frameworks

### 💻 IDE / Editors / Dev Agents

- Aider, Continue.dev, RooCode, Refact.ai, Tabnine, Claude Code, Cline (Qwen3.5 + Cerebras)

### 📁 Repo Scaffolding + Deployment

- ManusAI (file control + agent ops) - search underway
- GitHub integrations
- Supabase (Postgres-based DB and table editor)
- Langchain, AskTheCode (prompt framework), Cursor IDE

---

## 2. 🏦 NYRA Mortgage Assistant Systems (#NYRA #Mortgage #Assistant)

### 🧰 Automation + Tools

- **Voicemod API / 11 Labs** — Voice modulation for assistant interface
- **Supabase or Firebase** — Live database
- **Puppeteer/Selenium** — Web scraping + mortgage rate comparison
- **RapidAPI, Postman AI** — Mortgage tool integrations
- **Mintlify / Codiga / DocGPT** — Mortgage doc generation + API explanation

### 🖼 UI/UX Builders

- **Locofy.ai / UIzard.io** — Sketch-to-React tools
- **Framer / Webflow AI** — No-code front-end
- **Flowise / Langflow / N8N** — Visual AI node editors

### 🔗 Features Considered for Release

- Borrower call summarization
- Lead-to-close automation
- Pre-fill 1003 form generation via voice
- Intelligent follow-up and reminder agents

---

## 3. 🔮 NYRA Future / Experimental Stack (#NYRA #Experimental #AGI)

### 🌌 Evolution + AGI Loops

- **OpenEvolve + CodeLion** — Recursive loop with checkpoints, LLM ensembles
- **LetMeDoIt AI 3.0** — Autonomous code + agent controller
- **GraphFlow / Cogentic / PraisonAI** (CrewAI and AG2 integration?)— Low-code multi-agent orchestrators
- **Map-Think-Do** — Recursive planning framework
- **AutoAgents / AutoPR / Codechain** — Knowledge base building + versioned improvement

### 📚 Memory + Modular Systems

- memOS as primary spine
- LangGraph, LettaAI, MemGPT, AgentFile
- SQLite, MySQL, Pinecone, LlamaIndex RAG

### 🧪 Research & Structure References

- [Together Agent Cookbook](https://www.together.ai/cookbooks)
- [12-Factor Agent Template](https://github.com/humanlayer/12-factor-agents/tree/main/packages/create-12-factor-agent/template)
- [Agent Routing + Feedback](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/graph-flow.html)

---

## 🧭 Suggested Setup Flow

1. Set up memOS with Chroma or LangMem
2. Use LettaAI for modular task deployment
3. Route long-term tasks to OpenEvolve for code evolution
4. Set up Notion workspace (Option C: API sync)
5. Select ManusAI-style local system for autonomous agent control

---

## 🔗 Additional Links & References

- [Letta AI](https://github.com/letta-ai)
- [LangMem](https://github.com/langchain-ai/langmem)
- [CrewAI](https://github.com/crewAIInc)
- [OpenEvolve](https://github.com/codelionai/openevolve)
- [LetMeDoIt 3.0](https://github.com/eliranwong/letmedoit)
- [Map-Think-Do](https://github.com/geeknik/map-think-do)
- [Autogen Docs](https://microsoft.github.io/autogen/0.2/docs/notebooks/agentchats_sequential_chats/)

[https://github.com/langgenius/dify](https://github.com/langgenius/dify)

[https://github.com/lobehub/lobe-chat](https://github.com/lobehub/lobe-chat)