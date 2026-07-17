# 🌊 Ultimate Orchestrator: WaveTerm Multi-CLI Cockpit Setup

## Overview

A maximalist local development environment combining:
- **3 Autonomous CLI Agents**: Claude Code, Gemini CLI, Codex CLI
- **2 GPU Workers**: RTX 5090 (DeepSeek), RTX 3090 Ti (Llama)
- **Ghost Layer (llxprt)**: Hijacks Claude Pro/ChatGPT subscriptions
- **Letta-MCP Bridge**: Persistent memory across all agents
- **Composio Integration**: 100+ SaaS tools (Gmail, Slack, GitHub, etc.)
- **Unified Cockpit UI**: WaveTerm with cyberpunk mission control theme

## Files Deployed

```
infra/zellij/
  nyra-orchestrator-mcp.kdl        # Ultimate Zellij layout (4 tabs: daemon + cockpit + monitor + logs)

infra/waveterm/
  settings.orchestrator.json        # WaveTerm settings (opacity, theme, animations)
  theme-orchestrator-cyberpunk.json # Cyberpunk neon color scheme
  keybindings.orchestrator.json     # Chord keybindings (Cmd+Shift+* shortcuts)
  presets.orchestrator.json         # 5 multi-pane presets (cockpit, daemon, monitor, logs, shell)
  waveai-orchestrator.json          # Letta-MCP bridge + 4 AI providers
  widgets.orchestrator.json         # System monitors (CPU, mem, GPU, daemon health)

Makefile (appended)
  orchestrator-setup                # [1/4] Pull secrets + verify paths
  orchestrator-compile-letta        # [2/4] Build Rust Letta-MCP
  orchestrator-daemon-health        # [3/4] Pre-flight checks
  orchestrator-full                 # [FINAL] One-command full bootstrap
  orchestrator-daemon-logs          # Watch daemon tail (tmux)
  orchestrator-down                 # Shutdown cleanly
  orchestrator-status               # Live cluster health
```

## Quick Start

### 1️⃣ One-Command Bootstrap

```bash
cd ~/repos/project-nyra
make orchestrator-full
```

This automatically:
1. Pulls Infisical secrets → `~/.nyra/.env.orchestrator`
2. Compiles Rust Letta-MCP binary (if needed)
3. Runs daemon health checks
4. Spawns detached Zellij with hidden daemon layer
5. Launches WaveTerm cockpit

### 2️⃣ Manual Setup (Step by Step)

```bash
# Step 1: Setup secrets + verify
make orchestrator-setup

# Step 2: Compile Letta-MCP
make orchestrator-compile-letta

# Step 3: Health checks
make orchestrator-daemon-health

# Step 4: Launch
make orchestrator-full
```

## WaveTerm Configuration

### Import Orchestrator Config

```bash
# Copy settings to WaveTerm config dir
cp infra/waveterm/settings.orchestrator.json ~/.config/waveterm/settings.json
cp infra/waveterm/theme-orchestrator-cyberpunk.json ~/.config/waveterm/themes/
cp infra/waveterm/keybindings.orchestrator.json ~/.config/waveterm/keybindings.json
cp infra/waveterm/presets.orchestrator.json ~/.config/waveterm/presets.json
cp infra/waveterm/waveai-orchestrator.json ~/.config/waveterm/waveai.json
cp infra/waveterm/widgets.orchestrator.json ~/.config/waveterm/widgets.json
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Cmd+Shift+D** | Toggle Daemon (Ghost Layer) Dashboard |
| **Cmd+Shift+C** | Launch Multi-CLI Cockpit (3 CLIs + 2 Workers) |
| **Cmd+Shift+M** | Cluster Health Monitor |
| **Cmd+Shift+L** | Daemon Logs (live tail) |
| **Cmd+Shift+E** | Toggle Wave AI Sidebar (Letta Memory) |
| **Cmd+Shift+F** | Toggle Fullscreen |
| **Cmd+Shift+W** | Close Pane |
| **Cmd+Shift+Z** | Zoom Pane |
| **Cmd+1/2/3/4** | Jump to Tab 1/2/3/4 |

## Zellij Layout Structure

### Tab 0: DAEMON (Hidden)
- **llxprt-jefe**: Subscription hijack daemon
- **llxprt-code**: OpenAI-compatible proxy on localhost:8080
- **letta-mcp-server**: Rust stdio bridge to Letta memory

**Restart behavior**: All 3 daemons auto-restart on crash with 2s backoff.

### Tab 1: COCKPIT_SWARM (Visible)
Upper section (65%):
- Pane 1: **Claude Code** (ANTHROPIC_BASE_URL injected to localhost:8080)
- Pane 2: **Gemini CLI** (GEMINI_API_BASE injected to localhost:8080)
- Pane 3: **Codex CLI** (OPENAI_BASE_URL injected to localhost:8080)

Lower section (35%):
- Pane 4: **RTX-5090 SSH** (GPU monitoring + vLLM logs)
- Pane 5: **RTX-3090Ti SSH** (GPU monitoring + vLLM logs)

### Tab 2: MONITORING
Real-time cluster state:
- Orchestrator Docker services
- Oracle-VPS remote services
- GPU worker mesh status
- Nexus Router health check

### Tab 3: LOGS
Aggregated daemon logs:
- jefe.log tail
- code-proxy.log tail
- letta-mcp.log tail

## MCP Configuration

### Letta-MCP (stdio)
Path: `./target/release/letta-mcp-server`

Injected into all 3 CLI agents via `MCP_STDIO_SERVERS` env var:
```bash
export MCP_STDIO_SERVERS='letta:~/.nyra/letta-mcp.sock|composio:~/.nyra/composio-mcp.sock'
```

### Composio-MCP (SaaS Integration)
100+ tools available: Gmail, Slack, GitHub, Jira, Notion, Google Drive, etc.

Set environment variables:
```bash
export COMPOSIO_API_KEY=your_composio_key
export COMPOSIO_BASE_URL=https://backend.composio.dev
```

## Daemon Monitoring

### Live Logs
```bash
make orchestrator-daemon-logs
```

Opens tmux with 3 panes tailing:
- ~/.nyra/jefe.log
- ~/.nyra/code-proxy.log
- ~/.nyra/letta-mcp.log

### Health Status
```bash
make orchestrator-status
```

Shows:
- Zellij session state
- Process PIDs (jefe, code-proxy, letta-mcp)
- GPU worker container counts
- Oracle VPS service count

## Troubleshooting

### Daemon Won't Start
```bash
# Check for stale processes
pkill -f llxprt-jefe; pkill -f llxprt-code; pkill -f letta-mcp-server

# Rebuild Letta-MCP
make orchestrator-compile-letta

# Check logs
make orchestrator-daemon-logs
```

### MCP Connection Refused
```bash
# Verify daemon is running
ps aux | grep letta-mcp-server
ps aux | grep llxprt-code

# Check stdio socket
ls -la ~/.nyra/letta-mcp.sock

# Verify Letta API is accessible
curl http://localhost:7123/health || echo "Letta API offline"
```

### Workers Not Connecting
```bash
# Check SSH keys
ssh-keyscan worker-rtx5090 >> ~/.ssh/known_hosts
ssh-keyscan worker-rtx3090ti >> ~/.ssh/known_hosts

# Test connectivity
ssh worker-rtx5090 "nvidia-smi" | head -10
ssh worker-rtx3090ti "nvidia-smi" | head -10
```

## Advanced Configuration

### Change Theme
Edit `infra/waveterm/theme-orchestrator-cyberpunk.json` and run:
```bash
cp infra/waveterm/theme-orchestrator-cyberpunk.json ~/.config/waveterm/themes/
# Restart WaveTerm
```

### Add Custom Widget
Edit `infra/waveterm/widgets.orchestrator.json` and add to `widgets` array.

### Modify Zellij Layout
Edit `infra/zellij/nyra-orchestrator-mcp.kdl` and restart:
```bash
make orchestrator-down
make orchestrator-full
```

## Performance Notes

- **Orchestrator RAM**: ~3-4GB (daemons + WaveTerm + 3 CLIs)
- **Latency (local)**: <50ms (llxprt proxy + Letta-MCP stdio)
- **Latency (GPU workers)**: 50-200ms (SSH + Docker logs)
- **Refresh rates**: CPU/Memory every 2s, GPU every 2s, disk every 5s

## Next Steps

1. ✅ Run `make orchestrator-full`
2. 🖥️  In WaveTerm: Press `Cmd+Shift+C` to load the Multi-CLI Cockpit preset
3. 🧠 Use Letta memory via Wave AI sidebar (Cmd+Shift+E)
4. 📊 Monitor workers via `Cmd+Shift+M` preset
5. 📜 Check daemon health via `make orchestrator-daemon-logs`

---

**Status**: Production-ready. All daemons auto-restart. Letta-MCP memory is persistent across sessions.
