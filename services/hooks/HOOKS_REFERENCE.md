# Nyra Hooks Reference

Hook scripts for Claude Code, with integration points for the multi-node GPU cluster.

## Directory layout

```
services/hooks/
  claude-code/
    pre-tool-use.sh       PreToolUse hook
    post-tool-use.sh      PostToolUse hook
    session-start.sh      SessionStart hook (also suitable for UserPromptSubmit)
  HOOKS_REFERENCE.md      This file
```

## Hook scripts

### `pre-tool-use.sh`

**Event**: `PreToolUse`  
**Target**: `"matcher": ""` (all tools)  
**Timeout**: 3 s hard cap, non-blocking (always exits 0)

Reads `CLAUDE_TOOL_NAME` and `CLAUDE_TOOL_INPUT_JSON` injected by Claude Code.

| Trigger | Action |
|---------|--------|
| Tool input contains `worker-rtx3090ti`, `openclaw`, or `worker-3090` | Fires async POST to WoL manager: `orchestrator.trex-fiordland.ts.net:8095/hook/worker-needed` |
| Tool is `Bash` and command contains `docker context use worker-rtx5090` | Probes `100.64.0.11:8000`; emits stderr warning + fires WoL if offline |

**WoL endpoint**: `POST http://orchestrator.trex-fiordland.ts.net:8095/hook/worker-needed`  
Body: `{"worker":"<name>","reason":"<string>"}`

All network calls run as background subprocesses so Claude Code is never blocked even if the orchestrator is unreachable.

---

### `post-tool-use.sh`

**Event**: `PostToolUse`  
**Target**: `"matcher": ""` (all tools)  
**Timeout**: 3 s per request, fire-and-forget

Reads `CLAUDE_TOOL_NAME`, `CLAUDE_TOOL_INPUT_JSON`, `CLAUDE_SESSION_ID`.

| Trigger | Action |
|---------|--------|
| `Bash` command contains `docker context use <ctx>` | Saves new context to `~/.nyra/current-docker-context` |

State file: `~/.nyra/current-docker-context` — persists last known docker context across sessions.

---

### `session-start.sh`

**Event**: `SessionStart` (or `UserPromptSubmit` first message)  
**Timeout**: 3 s per probe, all probes run in parallel

Probes all five cluster nodes via HTTP and prints a color-coded status table to stderr:

| Node | Probe target |
|------|-------------|
| oracle-vps | `100.64.0.3:8283` (Letta) |
| orchestrator | `100.64.0.10:8095` (WoL manager) |
| worker-rtx3060 | `100.64.0.12:11434` (Ollama) |
| worker-rtx3090ti | `100.64.0.13:8000` (vLLM) |
| worker-rtx5090 | `100.64.0.11:8000` (vLLM) |

Also reports WoL manager reachability separately (since `pre-tool-use.sh` depends on it) and restores the last saved docker context from `~/.nyra/current-docker-context`.

Output goes to stderr only — Claude Code displays it as a status message, not in the conversation.

---

## Wiring into `.claude/settings.json`

Add the following entries to the `hooks` block:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "services/hooks/claude-code/pre-tool-use.sh",
            "timeout": 4
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "services/hooks/claude-code/post-tool-use.sh",
            "timeout": 5
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "services/hooks/claude-code/session-start.sh",
            "statusMessage": "Checking cluster status...",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**Important**: scripts must be executable. Run once:
```bash
chmod +x services/hooks/claude-code/*.sh
```

---

## Environment variables consumed

| Variable | Set by | Used in |
|----------|--------|---------|
| `CLAUDE_TOOL_NAME` | Claude Code | pre-tool-use, post-tool-use |
| `CLAUDE_TOOL_INPUT_JSON` | Claude Code | pre-tool-use, post-tool-use |
| `CLAUDE_TOOL_OUTPUT_JSON` | Claude Code | post-tool-use |
| `CLAUDE_SESSION_ID` | Claude Code | post-tool-use |
| `HOME` | Shell | all scripts (state file path) |

---

## WoL integration points

The WoL manager runs on `orchestrator.trex-fiordland.ts.net:8095`.

### Endpoints called by hooks

| Path | Method | Purpose |
|------|--------|---------|
| `/hook/worker-needed` | POST | Request wake-up for a named worker |
| `/health` | GET | Reachability check (session-start.sh) |

### Worker names (as passed to WoL manager)

| Name | IP | Primary service |
|------|----|----------------|
| `worker-rtx5090` | 100.64.0.11 | vLLM :8000 |
| `worker-rtx3090ti` | 100.64.0.13 | vLLM :8000 |
| `worker-rtx3060` | 100.64.0.12 | Ollama :11434 |

---

## Adding new hooks

1. Create `services/hooks/claude-code/<name>.sh` with `#!/usr/bin/env bash` and `set -euo pipefail`.
2. Always exit 0 — hooks must not block Claude Code on failure.
3. Cap all network calls at 3 s with `curl --max-time 3`.
4. Run async operations as background jobs (`command &`) when possible.
5. Add the hook to `.claude/settings.json` under the appropriate event key.
6. Mark the script executable: `chmod +x services/hooks/claude-code/<name>.sh`.
7. Document it in this file.

### Supported Claude Code hook events

| Event | When fired |
|-------|-----------|
| `PreToolUse` | Before every tool call |
| `PostToolUse` | After every tool call |
| `SessionStart` | Once when a new session starts |
| `UserPromptSubmit` | Each time the user submits a message |
| `Stop` | When Claude Code finishes a response |
| `SubagentStop` | When a sub-agent finishes |
| `SessionEnd` | When the session closes |
| `Notification` | On permission prompts and alerts |

### `matcher` field

The `matcher` string is matched against the tool name for `PreToolUse`/`PostToolUse`, or against the notification type for `Notification`. An empty string `""` matches all events.
