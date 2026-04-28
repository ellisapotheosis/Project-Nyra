#!/bin/bash
# scripts/setup-wave-configs.sh
# 🌊 Project Nyra - Wave AI (Waveterm) Maximalist Setup Script

WAVE_CONFIG_DIR="$HOME/.config/waveterm"
mkdir -p "$WAVE_CONFIG_DIR"
mkdir -p "$WAVE_CONFIG_DIR/termthemes"
mkdir -p "$WAVE_CONFIG_DIR/presets"

echo "🌌 Crafting Over-Engineered Wave AI Configuration..."

# 1. Global Settings: High-Signal, High-Aesthetic
cat <<EOF > "$WAVE_CONFIG_DIR/settings.json"
{
  "term:theme": "nyra-ultra-dark",
  "term:fontsize": 13,
  "term:fontfamily": "'Fira Code', 'JetBrains Mono', monospace",
  "term:lineheight": 1.4,
  "term:cursorstyle": "beam",
  "term:scrollback": 100000,
  "tab:background": "bg@nyra-nexus-void",
  "tab:showicon": true,
  "app:notifications": "enabled",
  "waveai:defaultmode": "nexus-router",
  "waveai:sidebaropen": true,
  "editor:tabsize": 2,
  "editor:wordwrap": "on",
  "app:telemetry": "disabled"
}
EOF

# 2. Wave AI Modes: Nexus / LiteLLM / Grafbase Integration
cat <<EOF > "$WAVE_CONFIG_DIR/waveai.json"
{
  "nexus-router": {
    "display:name": "Nyra Nexus Router",
    "ai:provider": "custom",
    "ai:model": "gpt-4o",
    "ai:endpoint": "http://orchestrator.trex-fiordland.ts.net:6000/v1/chat/completions",
    "ai:apitype": "openai-chat",
    "ai:apitokensecretname": "NEXUS_MASTER_KEY"
  },
  "worker-5090-vllm": {
    "display:name": "RTX 5090 vLLM",
    "ai:provider": "custom",
    "ai:model": "deepseek-v3",
    "ai:endpoint": "http://worker-rtx5090.trex-fiordland.ts.net:8000/v1/chat/completions",
    "ai:apitype": "openai-chat"
  },
  "worker-3090ti-vllm": {
    "display:name": "RTX 3090 Ti vLLM",
    "ai:provider": "custom",
    "ai:model": "llama-3.1-8b",
    "ai:endpoint": "http://worker-rtx3090ti.trex-fiordland.ts.net:8000/v1/chat/completions",
    "ai:apitype": "openai-chat"
  }
}
EOF

# 3. Custom Keybindings: Cluster Warp Drive
cat <<EOF > "$WAVE_CONFIG_DIR/keybindings.json"
[
  { "keys": ["Cmd:Shift:J"], "command": "app:newTab", "args": { "preset": "llxprt-jefe" }, "info": "Jump to Jefe" },
  { "keys": ["Cmd:Shift:C"], "command": "app:newTab", "args": { "preset": "llxprt-code" }, "info": "Jump to Code" },
  { "keys": ["Cmd:Shift:O"], "command": "app:newTab", "args": { "preset": "openclaw-team" }, "info": "Launch ClawTeam" },
  { "keys": ["Cmd:Shift:N"], "command": "app:newTab", "args": { "preset": "nexus-dashboard" }, "info": "Nexus Dash" },
  { "keys": ["Cmd:B"], "command": "app:toggleSidebar", "info": "Toggle AI Sidebar" }
]
EOF

# 4. Absurd Backgrounds (Gradients of the Void)
cat <<EOF > "$WAVE_CONFIG_DIR/backgrounds.json"
{
  "bg@nyra-nexus-void": {
    "display:name": "Nyra Nexus Void",
    "type": "gradient",
    "color": "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
  },
  "bg@worker-glow": {
    "display:name": "Worker Compute Glow",
    "type": "gradient",
    "color": "radial-gradient(circle at center, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)"
  }
}
EOF

# 5. Custom Theme: nyra-ultra-dark
cat <<EOF > "$WAVE_CONFIG_DIR/termthemes/nyra-ultra-dark.json"
{
  "display:name": "Nyra Ultra Dark",
  "black": "#1a1b26",
  "red": "#f7768e",
  "green": "#9ece6a",
  "yellow": "#e0af68",
  "blue": "#7aa2f7",
  "magenta": "#bb9af7",
  "cyan": "#7dcfff",
  "white": "#a9b1d6",
  "brightBlack": "#414868",
  "brightRed": "#f7768e",
  "brightGreen": "#9ece6a",
  "brightYellow": "#e0af68",
  "brightBlue": "#7aa2f7",
  "brightMagenta": "#bb9af7",
  "brightCyan": "#7dcfff",
  "brightWhite": "#c0caf5",
  "background": "#1a1b26",
  "foreground": "#a9b1d6",
  "selectionBackground": "#33467c",
  "cursor": "#c0caf5"
}
EOF

# 6. Presets: Automation of the 6-Pane / Multi-Tab Cluster
# Note: Waveterm presets can define initial blocks/tabs.
# We'll define a few key presets for the user to launch.
cat <<EOF > "$WAVE_CONFIG_DIR/presets/presets.json"
{
  "llxprt-jefe": {
    "display:name": "llxprt-jefe (Subscription Mode)",
    "tabs": [
      {
        "name": "JEFE",
        "blocks": [
          { "type": "terminal", "cwd": "~/repos/project-nyra/external/llxprt-jefe", "cmd": "./jefe" }
        ]
      }
    ]
  },
  "llxprt-code": {
    "display:name": "llxprt-code (Multi-Agent)",
    "tabs": [
      {
        "name": "CODE",
        "blocks": [
          { "type": "terminal", "cwd": "~/repos/project-nyra/external/llxprt-code", "cmd": "./code" }
        ]
      }
    ]
  },
  "openclaw-team": {
    "display:name": "ClawTeam Orchestration",
    "tabs": [
      {
        "name": "RTX3090Ti",
        "blocks": [
          { "type": "terminal", "cmd": "ssh worker-rtx3090ti-win 'docker ps | grep openclaw'" }
        ]
      },
      {
        "name": "RTX5090",
        "blocks": [
          { "type": "terminal", "cmd": "ssh worker-rtx5090-win 'docker ps | grep vllm'" }
        ]
      }
    ]
  }
}
EOF

echo "✅ Wave AI Setup Complete. Run 'make wave-up' to enter the void."
