#!/bin/bash
# scripts/setup-waveterm-cyberpunk.sh
# 🌊 THE COCKPIT: Project Nyra Maximalist Wave AI Setup

WAVE_CONFIG_DIR="$HOME/.config/waveterm"
mkdir -p "$WAVE_CONFIG_DIR/termthemes"
mkdir -p "$WAVE_CONFIG_DIR/presets"

echo "🌌 Initializing Maximalist Cyberpunk Wave AI Configuration..."

# 1. Global Settings: The Cockpit Control Surface
# Undocumented power-user settings: 
# - custom window opacity (if supported via CSS injection, but native JSON handles the primary UX)
# - telemetry completely off, notifications hyper-aggressive.
cat <<EOF > "$WAVE_CONFIG_DIR/settings.json"
{
  "term:theme": "cyberpunk-neon-mission-control",
  "term:fontsize": 12,
  "term:fontfamily": "'Fira Code', 'JetBrains Mono', 'CaskaydiaCove Nerd Font', monospace",
  "term:lineheight": 1.5,
  "term:cursorstyle": "block",
  "term:scrollback": 500000,
  "tab:background": "bg@cyberpunk-grid",
  "tab:showicon": true,
  "app:notifications": "enabled",
  "waveai:defaultmode": "ghost-proxy-llxprt",
  "waveai:sidebaropen": false,
  "editor:tabsize": 2,
  "editor:wordwrap": "on",
  "app:telemetry": "disabled",
  "window:opacity": 0.95,
  "window:blur": true
}
EOF

# 2. Ghost Layer AI Provider Configuration
# We bind WaveTerm's native AI directly into the llxprt-code proxy harness running on localhost:8080.
cat <<EOF > "$WAVE_CONFIG_DIR/waveai.json"
{
  "ghost-proxy-llxprt": {
    "display:name": "Ghost Proxy (llxprt-code)",
    "ai:provider": "custom",
    "ai:model": "claude-3-opus-20240229",
    "ai:endpoint": "http://localhost:8080/v1/chat/completions",
    "ai:apitype": "openai-chat",
    "ai:apitokensecretname": "LLXPRT_DUMMY_KEY"
  },
  "worker-5090-vllm": {
    "display:name": "RTX 5090 (Heavy Metal)",
    "ai:provider": "custom",
    "ai:model": "deepseek-v3",
    "ai:endpoint": "http://worker-rtx5090.trex-fiordland.ts.net:8000/v1/chat/completions",
    "ai:apitype": "openai-chat"
  },
  "worker-3090ti-vllm": {
    "display:name": "RTX 3090 Ti (Heavy Metal)",
    "ai:provider": "custom",
    "ai:model": "llama-3.1-8b",
    "ai:endpoint": "http://worker-rtx3090ti.trex-fiordland.ts.net:8000/v1/chat/completions",
    "ai:apitype": "openai-chat"
  }
}
EOF

# 3. Hyper-Optimized Keybindings
# Deep un-documented tricks: 
# - Mapping arbitrary wsh commands to keys.
# - We'll create bindings for creating tabs, toggling AI, and attaching the swarm.
cat <<EOF > "$WAVE_CONFIG_DIR/keybindings.json"
[
  { "keys": ["Cmd:Shift:S"], "command": "app:newTab", "args": { "preset": "zellij-swarm" }, "info": "Attach Zellij Swarm" },
  { "keys": ["Cmd:Shift:R"], "command": "app:newTab", "args": { "preset": "nyra-grid" }, "info": "Launch NYRA-GRID" },
  { "keys": ["Cmd:Shift:N"], "command": "app:newTab", "args": { "preset": "clawteam-nerve" }, "info": "Launch Nerve UIs" },
  { "keys": ["Cmd:Shift:G"], "command": "app:newTab", "args": { "preset": "ghost-layer-debug" }, "info": "Debug Ghost Layer" },
  { "keys": ["Cmd:Shift:E"], "command": "app:toggleSidebar", "info": "Toggle Wave AI (Ghost Proxy)" },
  { "keys": ["Cmd:Shift:W"], "command": "pane:close", "info": "Close Active Pane" },
  { "keys": ["Cmd:Shift:F"], "command": "app:toggleFullScreen", "info": "Toggle Fullscreen Cockpit" }
]
EOF

# 4. Maximalist Backgrounds (Cyberpunk Mission Control Grid)
cat <<EOF > "$WAVE_CONFIG_DIR/backgrounds.json"
{
  "bg@cyberpunk-grid": {
    "display:name": "Cyberpunk Neon Grid",
    "type": "gradient",
    "color": "linear-gradient(180deg, #09090e 0%, #150a21 50%, #0d0614 100%)"
  },
  "bg@worker-glow-red": {
    "display:name": "Worker Compute Glow (Red)",
    "type": "gradient",
    "color": "radial-gradient(circle at bottom, #2b0404 0%, #0a0000 100%)"
  }
}
EOF

# 5. Custom Theme: cyberpunk-neon-mission-control
cat <<EOF > "$WAVE_CONFIG_DIR/termthemes/cyberpunk-neon-mission-control.json"
{
  "display:name": "Cyberpunk Mission Control",
  "black": "#0d0e15",
  "red": "#ff003c",
  "green": "#00ff66",
  "yellow": "#f3f926",
  "blue": "#00b3ff",
  "magenta": "#cc00ff",
  "cyan": "#00ffff",
  "white": "#e0e0e0",
  "brightBlack": "#1a1c23",
  "brightRed": "#ff3366",
  "brightGreen": "#33ff99",
  "brightYellow": "#fdf85a",
  "brightBlue": "#33ccff",
  "brightMagenta": "#ff33ff",
  "brightCyan": "#66ffff",
  "brightWhite": "#ffffff",
  "background": "transparent",
  "foreground": "#e0e0e0",
  "selectionBackground": "#00ffff44",
  "cursor": "#00ff66"
}
EOF

# 6. WaveTerm Presets: The Swarm & The Grid
cat <<EOF > "$WAVE_CONFIG_DIR/presets/presets.json"
{
  "zellij-swarm": {
    "display:name": "Zellij Swarm (Cockpit)",
    "tabs": [
      {
        "name": "THE COCKPIT",
        "blocks": [
          { "type": "terminal", "cmd": "zellij attach nyra-swarm -c; zellij action go-to-tab 2" }
        ]
      }
    ]
  },
  "nyra-grid": {
    "display:name": "NYRA-GRID Dashboard",
    "tabs": [
      {
        "name": "NYRA-GRID",
        "blocks": [
          { 
            "type": "terminal", 
            "name": "Leader (llxprt-code)",
            "cwd": "~/repos/project-nyra",
            "cmd": "export ANTHROPIC_BASE_URL=http://localhost:6000/v1; export ANTHROPIC_API_KEY=nexus_ghost; export GIT_EDITOR=sourcegit; npx llxprt-code --expert" 
          },
          { 
            "type": "terminal", 
            "name": "Monitor (5090 vLLM)",
            "cmd": "ssh worker-rtx5090 'docker logs -f worker-5090-vllm'" 
          },
          { 
            "type": "terminal", 
            "name": "Grid Stats (GPUs)",
            "cmd": "watch -n 1 \"ssh worker-rtx3090ti 'nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits' && ssh worker-rtx3060 'nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits'\"" 
          },
          { 
            "type": "terminal", 
            "name": "Deployment (CF Tail)",
            "cwd": "~/repos/project-nyra",
            "cmd": "wrangler pages deployment tail --project-name project-nyra --compatibility-date 2024-04-01" 
          }
        ]
      }
    ]
  },
  "ghost-layer-debug": {
    "display:name": "Zellij Swarm (Ghost Layer)",
    "tabs": [
      {
        "name": "GHOST LAYER",
        "blocks": [
          { "type": "terminal", "cmd": "zellij attach nyra-swarm -c; zellij action go-to-tab 1" }
        ]
      }
    ]
  }
}
EOF

# 7. Undocumented Feature: System Resource Widgets & Custom CSS
# WaveTerm supports "widgets" via its block system. 
# To add resource monitoring blocks next to your terminals:
# 1. Right-click any block header -> "Split Block".
# 2. In the new block, type 'wsh view cpu' or 'wsh view gpu'.
# 3. For the 3D aesthetic, use 'wsh view sysinfo'.

# Custom CSS Suggestion (Place in ~/.config/waveterm/custom.css if supported):
# .term-container { border: 1px solid #00ffff33; box-shadow: 0 0 10px #00ffff11; }
# .tab-item.active { background: linear-gradient(90deg, #ff003c 0%, transparent 100%); }

echo "✅ Cyberpunk Maximalist Configuration Deployed."
echo "👉 MISSION CONTROL: Use 'wsh view cpu' inside WaveTerm to spawn resource monitors."
