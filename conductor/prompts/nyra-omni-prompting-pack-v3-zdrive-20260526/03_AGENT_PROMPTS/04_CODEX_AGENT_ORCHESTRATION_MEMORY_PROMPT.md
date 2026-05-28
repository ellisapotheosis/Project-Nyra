# Prompt 04 — Letta, OpenClaw, NerveUI, Memory, Voice Orchestration

```text
You are Codex CLI operating inside the Project Nyra repository.

MISSION:
Create/update non-UI orchestration contracts and docs for Letta, OpenClaw, NerveUI, memory systems, Gastown, Clawteam, Composio, cron jobs, and voice mesh. Do not touch UI/theme/components.

ARCHITECTURE TRUTH:
- Letta is the memory manager agent and orchestrator for OpenClaw agents.
- Each worker PC has OpenClaw and NerveUI.
- Orchestrator runs primary OpenClaw Gateway.
- RTX4060 backup gateway is optional if present.
- Gastown and Clawteam assist OpenClaw orchestration.
- Composio is available for external tools.
- OpenClaw cron jobs are preferred before falling back to n8n for automation.
- NerveUI provides worker session/fleet/workspace control; it is not the main broker app.
- Kyutai Unmute runs on each PC and a mesh stack splits voice jobs across GPU workers.

REQUIRED ACTIONS:
1. Define AgentRole, AgentRuntime, WorkerAssignment, OrchestrationTask, VoiceJob, MemoryWrite, ToolCall, HumanApprovalRequest contracts.
2. Define OpenClaw session lifecycle: create, attach lead context, route to worker, call tools, request approval, write audit, write memory, close/fail/retry.
3. Define Letta orchestration lifecycle: receive task, select agent/worker/tool, coordinate memory read/write, enforce approval gate, return summary.
4. Define NerveUI mapping: each worker Nerve instance exposes sessions, workspace browser, logs, and voice control.
5. Define Gastown/Clawteam adapter contracts as orchestration helpers; mock if not configured.
6. Define Composio adapter as external tool connector; mock if not configured.
7. Define OpenClaw cron job contracts for campaign monitoring, reply polling, health checks, memory compaction, quote follow-up, and missed-call pings.
8. Define memory router priorities: Letta memory, mem0/Qdrant, OpenMemory MCP, Mempalace, ClaudeMem, memorytensor/memOS, extra memory MCP.
9. Define conflict handling: never write conflicting borrower facts silently; flag stale/conflicting memories.
10. Define voice mesh: local capture, worker assignment, transcription, TTS, latency metrics, failover.
11. Add tests/mocks for routing, approval gates, memory writes, worker assignment, voice failover.
12. Add docs:
   - docs/agents/LETTA_ORCHESTRATION.md
   - docs/agents/OPENCLAW_NERVE_WORKER_MODEL.md
   - docs/agents/GASTOWN_CLAWTEAM_COMPOSIO.md
   - docs/agents/OPENCLAW_CRON_JOBS.md
   - docs/memory/MEMORY_STACK_ROUTING.md
   - docs/voice/KYUTAI_UNMUTE_MESH.md

FINAL RESPONSE:
Files changed, mocks vs real adapters, tests, and handoff.
```
