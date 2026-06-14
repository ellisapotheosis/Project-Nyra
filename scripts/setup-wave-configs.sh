#!/usr/bin/env bash
set -Eeuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
wave_config_dir="${WAVE_CONFIG_DIR:-$HOME/.config/waveterm}"
history_dir="${NYRA_ZELLIJ_HISTORY_DIR:-$HOME/.nyra/zellij-history}"

mkdir -p "$wave_config_dir/termthemes" "$wave_config_dir/presets" "$history_dir"

cat >"$wave_config_dir/settings.json" <<'JSON'
{
  "term:theme": "nyra-dark-grid",
  "term:fontsize": 13,
  "term:fontfamily": "JetBrains Mono, Fira Code, monospace",
  "term:lineheight": 1.25,
  "term:scrollback": 100000,
  "app:telemetry": "disabled",
  "waveai:defaultmode": "nyra-llxprt-codex",
  "waveai:sidebaropen": true
}
JSON

cat >"$wave_config_dir/waveai.json" <<'JSON'
{
  "nyra-llxprt-codex": {
    "display:name": "Nyra Codex Subscription via LLxprt",
    "ai:provider": "custom",
    "ai:model": "codex-cli-subscription",
    "ai:endpoint": "http://127.0.0.1:8090/v1/chat/completions",
    "ai:apitype": "openai-chat",
    "ai:apitokensecretname": "LLXPRT_BRIDGE_API_KEY"
  },
  "nyra-llxprt-gemini": {
    "display:name": "Nyra Gemini CLI Subscription via LLxprt",
    "ai:provider": "custom",
    "ai:model": "gemini-cli-subscription",
    "ai:endpoint": "http://127.0.0.1:8090/v1/chat/completions",
    "ai:apitype": "openai-chat",
    "ai:apitokensecretname": "LLXPRT_BRIDGE_API_KEY"
  },
  "nyra-llxprt-claude": {
    "display:name": "Nyra Claude Code Subscription via LLxprt",
    "ai:provider": "custom",
    "ai:model": "claude-code-subscription",
    "ai:endpoint": "http://127.0.0.1:8090/v1/chat/completions",
    "ai:apitype": "openai-chat",
    "ai:apitokensecretname": "LLXPRT_BRIDGE_API_KEY"
  },
  "nyra-nexus": {
    "display:name": "Nyra Nexus Router",
    "ai:provider": "custom",
    "ai:model": "nyra-auto",
    "ai:endpoint": "http://orchestrator.trex-fiordland.ts.net:6000/v1/chat/completions",
    "ai:apitype": "openai-chat",
    "ai:apitokensecretname": "NEXUS_MASTER_KEY"
  },
  "worker-5090": {
    "display:name": "RTX5090 vLLM",
    "ai:provider": "custom",
    "ai:model": "local-5090",
    "ai:endpoint": "http://worker-rtx5090.trex-fiordland.ts.net:8000/v1/chat/completions",
    "ai:apitype": "openai-chat"
  },
  "worker-3090ti": {
    "display:name": "RTX3090Ti vLLM",
    "ai:provider": "custom",
    "ai:model": "local-3090ti",
    "ai:endpoint": "http://worker-rtx3090ti.trex-fiordland.ts.net:8000/v1/chat/completions",
    "ai:apitype": "openai-chat"
  },
  "worker-3060": {
    "display:name": "RTX3060 Ollama",
    "ai:provider": "custom",
    "ai:model": "local-3060",
    "ai:endpoint": "http://worker-rtx3060.trex-fiordland.ts.net:11434/v1/chat/completions",
    "ai:apitype": "openai-chat"
  }
}
JSON

cat >"$wave_config_dir/keybindings.json" <<'JSON'
[
  { "keys": ["Cmd:Shift:N"], "command": "app:newTab", "args": { "preset": "nyra-zellij" }, "info": "Open Nyra Zellij grid" },
  { "keys": ["Cmd:Shift:6"], "command": "app:newTab", "args": { "preset": "nyra-zellij-3060" }, "info": "Open Nyra Zellij grid with RTX3060" },
  { "keys": ["Cmd:B"], "command": "app:toggleSidebar", "info": "Toggle AI sidebar" }
]
JSON

cat >"$wave_config_dir/termthemes/nyra-dark-grid.json" <<'JSON'
{
  "display:name": "Nyra Dark Grid",
  "black": "#050816",
  "red": "#fb4b85",
  "green": "#2dd4bf",
  "yellow": "#fbbf24",
  "blue": "#6366f1",
  "magenta": "#a855f7",
  "cyan": "#22d3ee",
  "white": "#cbd5e1",
  "brightBlack": "#334155",
  "brightRed": "#fb7185",
  "brightGreen": "#5eead4",
  "brightYellow": "#fde68a",
  "brightBlue": "#818cf8",
  "brightMagenta": "#c084fc",
  "brightCyan": "#67e8f9",
  "brightWhite": "#f8fafc",
  "background": "#020617",
  "foreground": "#cbd5e1",
  "selectionBackground": "#312e81",
  "cursor": "#2dd4bf"
}
JSON

cat >"$wave_config_dir/presets/presets.json" <<JSON
{
  "nyra-zellij": {
    "display:name": "Nyra Wave AI + Zellij",
    "tabs": [
      {
        "name": "NYRA",
        "blocks": [
          { "type": "terminal", "cwd": "$repo_root", "cmd": "NYRA_INCLUDE_3060=0 scripts/nyra-wave-zellij.sh" }
        ]
      }
    ]
  },
  "nyra-zellij-3060": {
    "display:name": "Nyra Wave AI + Zellij + RTX3060",
    "tabs": [
      {
        "name": "NYRA-3060",
        "blocks": [
          { "type": "terminal", "cwd": "$repo_root", "cmd": "NYRA_INCLUDE_3060=1 scripts/nyra-wave-zellij.sh" }
        ]
      }
    ]
  },
  "llxprt-bridge-health": {
    "display:name": "LLxprt Bridge Health",
    "tabs": [
      {
        "name": "LLXPRT",
        "blocks": [
          { "type": "terminal", "cmd": "curl -fsS http://127.0.0.1:8090/health || true" }
        ]
      }
    ]
  }
}
JSON

echo "WaveTerm config written to $wave_config_dir"
echo "Zellij transcripts will append under $history_dir"
