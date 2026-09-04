# llxprt/jefe Integration Guide

**Last Updated**: 2026-04-19  
**Status**: ✅ Fully Integrated with Docker Orchestration  
**Version**: 1.0.0

---

## 🎯 Overview

Your Vybestack AI CLI ecosystem (llxprt-code + llxprt-jefe) is now fully integrated into the Project Nyra infrastructure Makefile. This enables seamless switching between:

- **Docker services** (Oracle VPS, Orchestrator, GPU Workers)
- **AI profiles** (Claude/Anthropic, OpenAI Codex, Google Gemini, Local GPU Grid)
- **Persistent tmux sessions** (multi-pane monitoring & development)

**Key Innovation**: Unified orchestration where you can spin up Docker services on one terminal while simultaneously running AI coding sessions in others—all from a single Makefile.

---

## 📋 What's Integrated

### Configuration Already in Place ✅

From your setup at `AlienApotheosis51`:

```
~/.llxprt/profiles/
├── claude.json        (Anthropic subscription)
├── codex.json         (OpenAI subscription)
├── gemini.json        (Google Gemini subscription)
└── local-grid.json    (Local GPU cluster routing)

~/.local/bin/
└── jefe-bootstrap.sh  (Persistent tmux orchestrator)

external/llxprt-jefe/target/release/
└── jefe               (Compiled Rust binary)
```

### New Makefile Targets (20+ additions)

**AI Orchestration**:
- `make orch` - Launch Jefe Orchestrator UI (SSH to AlienApotheosis51)
- `make orch-attach` - Attach to existing jefe-orch session
- `make llxprt-{claude|grid|gemini|codex}` - Launch with specific profile
- `make llxprt-status` - Show active sessions
- `make llxprt-check` - Verify configuration ✅

**Tmux Sessions**:
- `make tmux-cluster` - Full cluster layout (Orch + 3 AI profiles)
- `make tmux-grid` - 5-pane SSH mesh (monitor all 4 worker hosts)
- `make tmux-ai-grid` - 4-pane AI CLI grid (concurrent profile sessions)

---

## 🚀 Quick Start

### 1. Verify Configuration
```bash
cd infra
make llxprt-check
```

Output shows:
- ✓ Profiles directory exists
- ✓ Jefe binary found
- ✓ Orchestrator in SSH config
- ✓ llxprt CLI available
- All 4 profiles loaded

### 2. Start Docker Stack
```bash
make bootstrap      # Start Oracle VPS, Orchestrator, Workers
make worker-up      # Or just start GPU workers
make oracle-up      # Or just Oracle VPS
```

### 3. Launch AI Orchestrator UI
**Terminal 1**: Jefe Orchestrator (persistent across disconnects)
```bash
make orch
```

Connects to `AlienApotheosis51` and launches jefe-orch tmux session.

### 4. Launch Concurrent AI Sessions
**Terminal 2**: Claude/Anthropic
```bash
make llxprt-claude
```

**Terminal 3**: Local GPU Grid (vLLM on 5090/3090ti, Ollama on 3060)
```bash
make llxprt-grid
```

**Terminal 4**: OpenAI Codex
```bash
make llxprt-codex
```

### 5. Full Cluster Layout (All at Once)
```bash
make tmux-cluster
```

Creates 4-window tmux session:
- Window 1: Jefe Orchestrator UI
- Window 2: Claude (Anthropic)
- Window 3: GPU Grid (Local Inference)
- Window 4: Codex (OpenAI)

---

## 🎯 Common Workflows

### Workflow 1: Quick Coding Session

```bash
# Terminal 1: Start Docker services
cd infra
make bootstrap

# Terminal 2: Launch Claude coding
make llxprt-claude

# Terminal 3: Monitor cluster
make tmux-grid
```

### Workflow 2: Full AI Grid Development

```bash
# One command to start everything:
cd infra
make tmux-cluster

# Now in tmux with 4 windows:
# - Navigate between windows with: Ctrl+B, then 1/2/3/4
# - Kill window with: Ctrl+B, then X
# - Detach with: Ctrl+B, then D
# - Re-attach with: tmux attach-session -t cluster-control
```

### Workflow 3: Multi-Host Mesh Monitoring

```bash
# Monitor all 4 worker machines + orchestrator
make tmux-grid

# Shows:
# ┌─────────────────┬──────────────────┬──────────────────┐
# │   Orchestrator  │  RTX 5090 Worker │ RTX 3090 Ti      │
# │ AlienApotheosis │  (vLLM + Redis)  │ (vLLM + LMCache) │
# ├─────────────────┼──────────────────┼──────────────────┤
# │  RTX 3060       │  Local Machine   │                  │
# │  (Ollama)       │  (host shell)    │                  │
# └─────────────────┴──────────────────┴──────────────────┘
```

### Workflow 4: Selective Service Startup + AI

```bash
# Just start Oracle VPS (not workers)
make oracle-up

# Start Claude coding
make llxprt-claude

# Start Gemini in another terminal
make llxprt-gemini

# Later: check status
make llxprt-status
```

---

## 📖 Target Reference

### AI Orchestration Targets

#### `make orch`
Launch Jefe Orchestrator UI via SSH to AlienApotheosis51.

```bash
$ make orch
Launching Jefe Orchestrator UI on AlienApotheosis51...
[Connected to AlienApotheosis51]
[Attaching to jefe-orch tmux session...]
```

**What it does**:
1. SSH to `AlienApotheosis51`
2. Runs `~/.local/bin/jefe-bootstrap.sh`
3. Attaches to persistent `jefe-orch` tmux session
4. If disconnected, you can `make orch` again from any machine to re-attach

#### `make orch-attach`
Attach to existing jefe-orch session without SSH.

```bash
$ make orch-attach
Attaching to existing Jefe Orchestrator session...
```

Requires existing jefe-orch session on AlienApotheosis51.

#### `make llxprt-claude`
Launch llxprt with Anthropic (Claude) profile.

```bash
$ make llxprt-claude
Launching llxprt with Anthropic (Claude) profile...
[Claude Sonnet ready]
> _
```

**Uses profile**: `~/.llxprt/profiles/claude.json`  
**API Key**: ANTHROPIC_API_KEY from profile  
**Model**: Claude 3.5 Sonnet

#### `make llxprt-grid`
Launch llxprt with Local GPU Grid profile.

```bash
$ make llxprt-grid
Launching llxprt with Local GPU Grid profile...
[Local Grid routing active]
[5090: vLLM ready] [3090ti: vLLM+LMCache] [3060: Ollama]
> _
```

**Uses profile**: `~/.llxprt/profiles/local-grid.json`  
**Routing**: Redis + vLLM + LMCache for distributed inference  
**Workers**: RTX 5090 (primary), 3090 Ti (secondary), 3060 (lightweight)

#### `make llxprt-gemini`
Launch llxprt with Google Gemini profile.

```bash
$ make llxprt-gemini
Launching llxprt with Google Gemini profile...
[Gemini API connected]
> _
```

**Uses profile**: `~/.llxprt/profiles/gemini.json`

#### `make llxprt-codex`
Launch llxprt with OpenAI Codex profile.

```bash
$ make llxprt-codex
Launching llxprt with OpenAI Codex profile...
[OpenAI Codex API ready]
> _
```

**Uses profile**: `~/.llxprt/profiles/codex.json`

#### `make llxprt-status`
Show all active llxprt and jefe tmux sessions.

```bash
$ make llxprt-status
Active llxprt sessions:
  llxprt-claude: 1 window
  llxprt-grid: 1 window
  llxprt-codex: 1 window

Active jefe sessions:
  jefe-orch: 4 windows
```

#### `make llxprt-check`
Verify llxprt/jefe configuration.

```bash
$ make llxprt-check
Checking llxprt/jefe configuration...

Orchestrator Host: AlienApotheosis51
Jefe Bootstrap:    ~/.local/bin/jefe-bootstrap.sh
Jefe Binary:       /home/.../external/llxprt-jefe/target/release/jefe
Profiles Path:     /home/ellisapotheosis/.llxprt/profiles

✓ Profiles directory exists
✓ Jefe binary found
✓ Orchestrator in SSH config
✓ llxprt CLI available

Profiles available:
  - claude.json
  - codex.json
  - gemini.json
  - local-grid.json
```

### Tmux Session Targets

#### `make tmux-cluster`
Launch full cluster tmux session with 4 windows.

```bash
$ make tmux-cluster
Launching full cluster tmux layout...
This will create a tmux session with:
  - Orchestrator (jefe-orch)
  - Claude profile (llxprt-claude)
  - GPU Grid profile (llxprt-grid)
  - Codex profile (llxprt-codex)

[Attached to cluster-control session]
```

**Windows created**:
1. `orch` - Jefe Orchestrator UI (SSH to AlienApotheosis51)
2. `claude` - llxprt with Claude profile
3. `grid` - llxprt with Local GPU Grid
4. `codex` - llxprt with Codex profile

**Navigation**:
- Switch windows: `Ctrl+B` then `1/2/3/4`
- Kill window: `Ctrl+B` then `X`
- Detach: `Ctrl+B` then `D`
- Re-attach: `tmux attach-session -t cluster-control`

#### `make tmux-grid`
Launch 5-pane SSH mesh monitor (all worker nodes + local).

```bash
$ make tmux-grid
Launching 5-pane SSH mesh monitor...
Monitoring:
  - Orchestrator (AlienApotheosis51)
  - GPU 5090 Worker
  - GPU 3090 Ti Worker
  - GPU 3060 Worker
  - Local Node

[Attached to mesh-grid session]
```

**Panes**:
```
┌──────────────────┬──────────────┬──────────────┐
│  Orchestrator    │   5090       │  3090 Ti     │
│ (SSH ready)      │  (SSH ready) │ (SSH ready)  │
├──────────────────┼──────────────┼──────────────┤
│   3060 Worker    │   Local      │              │
│   (SSH ready)    │  (shell)     │              │
└──────────────────┴──────────────┴──────────────┘
```

**Navigation**:
- Switch panes: `Ctrl+B` then arrow keys
- Resize panes: `Ctrl+B` then `Meta+arrow keys`
- Zoom pane: `Ctrl+B` then `Z`
- Detach: `Ctrl+B` then `D`

#### `make tmux-ai-grid`
Launch 4-pane AI CLI grid (concurrent profiles).

```bash
$ make tmux-ai-grid
Launching AI CLI grid (Claude/Codex/Gemini/Workers)...
[Attached to ai-grid session]
```

**Panes**:
```
┌──────────────────┬──────────────┬──────────────┐
│  Claude          │   Codex      │   Gemini     │
│  (Anthropic)     │  (OpenAI)    │   (Google)   │
├──────────────────┼──────────────┼──────────────┤
│  Local GPU Grid  │              │              │
│  (Workers)       │              │              │
└──────────────────┴──────────────┴──────────────┘
```

**Use case**: Run 4 AI conversations simultaneously on different providers.

---

## 🔧 Configuration Details

### Makefile Variables

All customizable via environment or direct modification:

```bash
# SSH Host for Jefe Orchestrator
ORCHESTRATOR_HOST ?= AlienApotheosis51

# Bootstrap script location
JEFE_BOOTSTRAP ?= ~/.local/bin/jefe-bootstrap.sh

# Compiled jefe binary
JEFE_BIN ?= $(HOME)/repos/project-nyra/external/llxprt-jefe/target/release/jefe

# llxprt profiles directory
LLXPRT_PROFILES ?= $(HOME)/.llxprt/profiles
```

### Profile Configuration Format

Each profile in `~/.llxprt/profiles/` is a JSON file:

**claude.json** (Example structure):
```json
{
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "apiKey": "${ANTHROPIC_API_KEY}",
  "settings": {
    "temperature": 0.7,
    "maxTokens": 4096
  }
}
```

**local-grid.json** (Example):
```json
{
  "provider": "local-grid",
  "routing": "redis",
  "cache": "lmcache",
  "workers": [
    {
      "host": "worker-rtx5090",
      "model": "deepseek-r1",
      "backend": "vllm",
      "maxConcurrent": 4
    },
    {
      "host": "worker-rtx3090ti",
      "model": "llama-3.1-70b",
      "backend": "vllm+lmcache",
      "maxConcurrent": 3
    },
    {
 "host":,
      "model": "mistral-7b",
      "backend": "ollama",
      "maxConcurrent": 2
    }
  ]
}
```

---

## 🔌 Integration Points

### Docker + llxprt Workflows

**Scenario 1: New Feature Development**
```bash
# Terminal 1: Start infrastructure
make bootstrap          # Docker services ready

# Terminal 2: AI coding session
make llxprt-claude     # Start Claude coding

# Terminal 3: Monitor workers
make tmux-grid        # Real-time worker status
```

**Scenario 2: Local Model Testing**
```bash
# Terminal 1: Start Docker core
make up               # Just core stack

# Terminal 2: Test local models
make llxprt-grid      # Use local GPU cluster
# Test code generation on RTX 5090

# Terminal 3: Compare with cloud
make llxprt-claude    # Compare with Claude Sonnet
```

**Scenario 3: Multi-Model Benchmarking**
```bash
# Terminal 1: Docker services (if needed)
make oracle-up

# Terminal 2-5: Four AI models in parallel
make llxprt-claude    # Term 2
make llxprt-codex     # Term 3
make llxprt-gemini    # Term 4
make llxprt-grid      # Term 5

# Run same prompt on all 4 backends simultaneously
```

---

## 🎯 Usage Patterns

### Pattern 1: Interactive Development
```bash
# Start everything
make tmux-cluster

# In tmux window "claude":
# > Build a React component
# > [Claude generates code]
# > npm install dependencies
# > npm start

# In window "grid":
# > Test inference on local models
# > Measure latency/tokens

# In window "codex":
# > Generate alternative implementations
# > Compare code quality
```

### Pattern 2: Overnight Training Runs
```bash
# Start GPU workers with monitoring
make worker-up
make tmux-grid        # Keep mesh monitor open

# In another terminal:
make llxprt-grid      # Submit long-running training
# > Train model on RTX 5090
# > [Runs while you close laptop]

# Later: Re-attach from different machine
ssh your-laptop
cd project-nyra/infra
make tmux-grid        # Re-attach mesh monitor
```

### Pattern 3: Production Orchestration
```bash
# Full production stack
make bootstrap        # All Docker services
make orch             # Connect to production orchestrator

# Monitor everything
tmux attach-session -t cluster-control  # If using tmux-cluster

# Scale workers as needed
make worker-up        # Add workers
make worker-down      # Remove workers
```

---

## 🚨 Troubleshooting

### Issue: "SSH connection refused"
```bash
# Ensure orchestrator is in SSH config
grep AlienApotheosis51 ~/.ssh/config

# If missing, add:
# Host AlienApotheosis51
#   HostName <ip-or-hostname>
#   User <username>
#   IdentityFile ~/.ssh/id_rsa
```

### Issue: "jefe binary not found"
```bash
# Compile jefe binary
cd external/llxprt-jefe
cargo build --release

# Verify
make llxprt-check
```

### Issue: "llxprt command not found"
```bash
# Install llxprt CLI
npm install -g @vybestack/llxprt-code

# Verify
which llxprt
```

### Issue: "Profile not found"
```bash
# Check profiles directory
ls -la ~/.llxprt/profiles/

# Should show:
# -rw-r--r-- claude.json
# -rw-r--r-- codex.json
# -rw-r--r-- gemini.json
# -rw-r--r-- local-grid.json
```

---

## 📊 Performance Notes

### GPU Grid Routing
- **RTX 5090**: vLLM backend, max 4 concurrent (primary inference)
- **RTX 3090 Ti**: vLLM + LMCache (caching layer), max 3 concurrent
- **RTX 3060**: Ollama backend (lightweight), max 2 concurrent

### Latency Expectations
- Local GPU Grid: 50-200ms (inference)
- Claude (cloud): 200-500ms (API + network)
- Codex (cloud): 150-400ms (API + network)

### Concurrent Session Limits
- Docker services: Unlimited (separate containers)
- llxprt sessions: 1 per profile (shared resource)
- tmux: Unlimited panes (just terminal windows)

---

## 🔐 Security Notes

### SSH Configuration
Ensure SSH keys are properly configured:
```bash
# Generate key if needed
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519

# Add to orchestrator authorized_keys
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@AlienApotheosis51
```

### API Keys in Profiles
Store securely in profile JSON:
```bash
# Set environment variables
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
export GOOGLE_API_KEY="..."

# Profiles reference via ${VAR_NAME}
```

Never commit actual keys to git.

---

## 📚 Related Documentation

- **Makefile Guide**: `/infra/MAKEFILE-GUIDE.md`
- **Infrastructure Consolidation**: `/infra/CONSOLIDATION.md`
- **llxprt Documentation**: https://github.com/vybestack/llxprt-code
- **jefe Documentation**: https://github.com/vybestack/llxprt-jefe
- **tmux Cheatsheet**: https://tmuxcheatsheet.com/

---

## ✨ Summary

You now have:

✅ **Unified Orchestration**: Single Makefile controls Docker + AI profiles  
✅ **Persistent Sessions**: tmux-based persistence across disconnects  
✅ **Multi-Provider Support**: Claude, Gemini, Codex + Local GPU Grid  
✅ **Mesh Monitoring**: Real-time view of all 4 worker nodes  
✅ **Concurrent Development**: Run 4 AI backends simultaneously  
✅ **Full Documentation**: Complete integration guide  

**Ready to build, code, and orchestrate at scale!** 🚀

---

**Version**: 1.0.0  
**Date**: 2026-04-19  
**Status**: ✅ PRODUCTION READY  
**Tested**: All targets functional
