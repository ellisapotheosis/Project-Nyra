# ORCHESTRATION_STRATEGY.md

## Overview
Project Nyra operates as a distributed multi-agent system. This document defines the hierarchy and execution policies for the AI cluster.

## 1. The Orchestration Hierarchy

### Tier 1: The Brain (Letta)
- **Role**: Long-term state and context management.
- **Responsibility**: Ensuring that an agent on the 5090 knows what an agent on the 3060 did. Letta manages the "Person-Centric" memory via **mem0**.

### Tier 2: The Controllers (ClawTeam & Paperclip)
- **ClawTeam**: Multi-agent coordination. If a task requires parallel execution (e.g., "Analyze these 3 quotes"), ClawTeam splits and assigns.
- **Paperclip**: Goal alignment. Ensures agents stay within the boundaries of mortgage compliance and broker intent.

### Tier 3: The Ingress (Nexus Router)
- **Role**: The singular API entry point.
- **Responsibility**: Mapping high-level agent intents to specific MCP tools or local model endpoints.

### Tier 4: High-Fidelity Reasoning (LLXPRT Bridge)
- **Tools**: `@vybestack/llxprt-jefe` and `llxprt-code`.
- **Role**: Utilizing subscription-based CLI usage (Gemini CLI, Codex CLI, Claude Code) for complex coding, refactoring, and deep mortgage analysis tasks.

### Tier 5: The Execution (Workers)
- **5090**: High-reasoning (Llama-3-70B, Claude-Code).
- **3090 Ti**: Operation monitoring and steady-state inference.
- **3060**: Lightweight classification, summarization, and PicoClaw tests.

## 2. Task Routing Policy
1. **Risk Evaluation**: Every task is assigned an `AgentActionRisk` (READ_ONLY to COMPLIANCE_CRITICAL).
2. **Model Selection**:
    - Critical tasks -> 5090 or LLXPRT Subscription Bridge (Codex/Claude).
    - Utility tasks -> 3060 (Ollama).
3. **Audit Requirement**: Any Tier 2 or Tier 3 action MUST be logged via the `AuditLogger`.

## 3. Memory Sync Loop
- **Ingestion**: `LeadIngestionPipeline` -> Sync to Letta.
- **Agent Interaction**: `OpenClaw Session` -> Read from Letta -> Perform Action -> Write back to mem0.
- **Manual Override**: Brokers can manually update Letta's "Working Memory" via the WebApp settings.
