# Nyra Integration Pack (A2A + MCP + Open WebUI + ArchGW + Claude-Flow)

This pack wires **Project-Nyra** with:
- **A2A gateway** (demo server + Agent Card)
- **MCP** via Open WebUI **mcpo** proxy
- **Open WebUI pipelines** samples for **Flowise**, **n8n**, **Dify**
- **ArchGW** sample config (routing/guardrails)
- **Claude-Flow** runbook + prompt

## Quick Start
1) Copy folders into your repo root.
2) `nyra-orchestration/scripts/nyra-up.(sh|ps1)` → Open WebUI, pipelines, mcpo, Qdrant, a2a-demo.
3) `nyra-orchestration/scripts/dev.sh` → A2A gateway + AG2 gRPC host.
4) Feed `nyra-orchestration/prompts/claude_flow_prompt.txt` to Claude-Flow.
