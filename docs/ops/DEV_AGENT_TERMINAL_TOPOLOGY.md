# DEV_AGENT_TERMINAL_TOPOLOGY

Last updated: 2026-05-24

## Overview

The operator cockpit runs on `orchestrator` (100.64.0.2) using WaveTerm or zellij as
the terminal multiplexer. Three subscription coding agents run via llxprt-jefe and
llxprt-code, coordinated through llxprt-bridge on port 8091.

---

## Terminal Layout (WaveTerm / zellij)

```
┌─────────────────────────────────────────────────────────────────┐
│  Tab 1: Subscription Agents (llxprt)                            │
│  ┌───────────────┬───────────────┬───────────────┐              │
│  │ Pane A        │ Pane B        │ Pane C        │              │
│  │ claude-code   │ gemini-cli    │ codex-cli     │              │
│  │ (Anthropic)   │ (Google)      │ (OpenAI)      │              │
│  │ via llxprt    │ via llxprt    │ via llxprt    │              │
│  └───────────────┴───────────────┴───────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  Tab 2: Letta Orchestrator                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Letta session (oracle-vps :8283)                        │    │
│  │ Primary orchestration agent; manages memory, tasks,     │    │
│  │ GPU power via power API (orchestrator:8765 pending)     │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│  Tab 3: OpenClaw Worker Sessions                                │
│  ┌───────────────┬───────────────┬───────────────┐              │
│  │ OpenClaw 5090 │ OpenClaw 3090 │ OpenClaw 3060 │              │
│  │ vLLM primary  │ vLLM second.  │ Ollama util   │              │
│  └───────────────┴───────────────┴───────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  Tab 4: Infra / Git                                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ git / tea / Docker context ops                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## llxprt-jefe + llxprt-code

| Component     | Type            | Host         | Port | Role                                               |
| ------------- | --------------- | ------------ | ---- | -------------------------------------------------- |
| llxprt-jefe   | Rust binary     | orchestrator | —    | Session supervisor; manages agent lifecycle        |
| llxprt-code   | npm CLI         | orchestrator | —    | Invokes subscription LLM APIs                      |
| llxprt-bridge | npm CLI / proxy | orchestrator | 8091 | Routes subscription agent calls; credential broker |

### Subscription Agents

| Agent       | Backend              | Access via llxprt   | Notes                       |
| ----------- | -------------------- | ------------------- | --------------------------- |
| claude-code | Anthropic Claude API | llxprt-bridge :8091 | Primary coding agent        |
| gemini-cli  | Google Gemini API    | llxprt-bridge :8091 | Secondary coding / research |
| codex-cli   | OpenAI API           | llxprt-bridge :8091 | Legacy tasks; code review   |

llxprt-bridge acts as the credential broker — subscription API keys are loaded from
Infisical at startup and never exposed in shell history or prompts.

---

## Which Machines Run What

| Capability                                | Host                   | Notes                                    |
| ----------------------------------------- | ---------------------- | ---------------------------------------- |
| llxprt-jefe / llxprt-code / llxprt-bridge | orchestrator           | All subscription agent coordination here |
| Letta orchestrator (API)                  | oracle-vps :8283       | Agent memory, task ledger, orchestration |
| OpenClaw gateway                          | orchestrator :8080     | Routes to worker OpenClaw sessions       |
| vLLM primary                              | worker-rtx5090 :8000   | Large model inference                    |
| vLLM secondary                            | worker-rtx3090ti :8000 | Steady assistant / TTS voice             |
| Ollama                                    | worker-rtx3060 :11434  | Utility models, embeddings, STT voice    |
| PocketTTS                                 | orchestrator :5002     | TTS fallback when voice workers are busy |

---

## Operational Rules

- Use one pane/session per bounded task; avoid mixing agent contexts.
- Keep Conductor plans as the shared task ledger visible in all sessions.
- Route live host operations through Docker contexts from orchestrator or worker-rtx5090.
- Never paste secrets, API keys, or Infisical tokens into shared agent prompts.
- Each OpenClaw session maps to one worker; do not cross-route without intent.
- llxprt-bridge must be running before subscription agent sessions start.
