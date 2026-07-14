# ==============================================================================
# ALIASES & COMMAND SHORTCUTS
# ==============================================================================

# ==============================================================================
# FILE LISTING (EZA)
# ==============================================================================
alias ls='eza --icons --group-directories-first --color=always'
alias ll='eza -lh --icons --group-directories-first --color=always'
alias la='eza -lha --icons --group-directories-first --color=always'
alias laa='eza -lhaa --icons --group-directories-first --color=always'

# ==============================================================================
# DOWNLOADS & FILE OPS
# ==============================================================================
alias dl='aria2c -x16 -s16 -k1M -c'
alias cx='chmod +x'

# ==============================================================================
# PROJECT NYRA
# ==============================================================================
alias nyra='cd ~/repos/project-nyra'
alias cd-nyra='cd "${NYRA_ROOT}"'
alias cd-infra='cd "${NYRA_INFRA}"'
alias infis='infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared" -- '

# ==============================================================================
# CLAUDE CLI (WITH PERMISSION BYPASS)
# ==============================================================================
alias claude-yolo='claude --dangerously-skip-permissions'

# ==============================================================================
# WINDOWS INTEGRATION (Win11/WSL)
# ==============================================================================
export WIN_HOME="/mnt/c/Users/$(cmd.exe /c echo %USERNAME% 2>/dev/null | tr -d $'\r')"
alias winhome='cd "$WIN_HOME"'
alias warp='warp.exe .'
alias agy='antigravity.exe .'
alias antigravity='antigravity.exe .'
alias subl='subl.exe .'
alias sg='sourcegit'

# ==============================================================================
# NETWORK UTILITIES
# ==============================================================================
alias ipconfig='ip a'
alias ifconfig='ip a'

# ==============================================================================
# DOCKER CONTEXT SHORTCUTS
# ==============================================================================
# Orchestrator
alias dco='docker --context orchestrator'
alias d-orch='docker --context orchestrator'
alias orchps='docker --context orchestrator ps'

# GPU Workers
alias dc5090='docker --context worker-rtx5090'
alias d-5090='docker --context worker-rtx5090'
alias dc3090='docker --context worker-rtx3090ti'
alias d-3090='docker --context worker-rtx3090ti'
alias dc3060='docker --context worker-rtx3060'
alias d-3060='docker --context worker-rtx3060'

# Show all containers across all contexts
alias nyra-ps='for c in orchestrator worker-rtx5090 worker-rtx3060 worker-rtx3090ti; do echo "=== Context: $c ==="; docker --context "$c" ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"; done'

# ==============================================================================
# SSH HOST SHORTCUTS
# ==============================================================================
alias orch='ssh orchestrator-win'
alias orchip='ssh orchestrator-ip'
alias w5090='ssh worker-rtx5090-win'
alias w3060='ssh worker-rtx3060-win'
alias w3090='ssh worker-rtx3090ti-win'
alias w3090ti='ssh worker-rtx3090ti-win'
alias w3090ti-wsl='ssh worker-rtx3090ti-wsl'

# ==============================================================================
# THEME SWITCHER (Neon vs Softer Palette)
# ==============================================================================
theme-neon() {
  # Purple (57) accent theme - turquoise paths, seafoam success, purple accents
  export X_TURQUOISE='44'
  export X_SEAFOAM='42'
  export X_VIOLET='57'
  export X_DARK_BLUE='27'
  export FZF_DEFAULT_OPTS="--height=70% --reverse --border --color=fg:${X_TURQUOISE},bg:0,hl:${X_VIOLET},fg+:${X_SEAFOAM},bg+:0,hl+:${X_VIOLET},info:${X_VIOLET},prompt:${X_TURQUOISE},pointer:${X_SEAFOAM},marker:${X_VIOLET},spinner:${X_VIOLET},header:${X_TURQUOISE}"
  echo "✨ Theme active (turquoise paths, seafoam success, purple accents)"
  nyra-reload-prompt
}

theme-v2() {
  # Classic style - lighter set of prompt segments, no docker_host/ram/swap
  export X_TURQUOISE='44'
  export X_SEAFOAM='42'
  export X_VIOLET='57'
  export X_DARK_BLUE='27'
  export FZF_DEFAULT_OPTS="--height=70% --reverse --border --color=fg:${X_TURQUOISE},bg:0,hl:${X_VIOLET},fg+:${X_SEAFOAM},bg+:0,hl+:${X_VIOLET},info:${X_VIOLET},prompt:${X_TURQUOISE},pointer:${X_SEAFOAM},marker:${X_VIOLET},spinner:${X_VIOLET},header:${X_TURQUOISE}"
  source ~/.p10k.classic.zsh
  echo "✨ Theme V2 active (classic style — lighter prompt)"
}

alias theme-bright='theme-neon'

# ==============================================================================
# MCP (MODEL CONTEXT PROTOCOL) ALIASES
# ==============================================================================
# Starts the Docker Desktop MCP Toolkit GitHub profile as a Streamable HTTP
# MCP endpoint for ChatGPT Apps/Connectors. ChatGPT needs an HTTPS tunnel to
# this local URL: http://127.0.0.1:8080/mcp
mcp-github() {
  local profile="${1:-${DOCKER_MCP_GITHUB_PROFILE:-github_write}}"
  local port="${MCP_GITHUB_PORT:-8080}"

  if ! docker info >/dev/null 2>&1; then
    if command -v powershell.exe >/dev/null 2>&1; then
      echo "Docker Desktop is not reachable. Attempting to start Docker Desktop..."
      powershell.exe -NoProfile -Command "Start-Process 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe'" >/dev/null 2>&1 || true
      local waited=0
      while (( waited < 90 )); do
        sleep 3
        if docker info >/dev/null 2>&1; then
          break
        fi
        waited=$((waited + 3))
        echo "Waiting for Docker Desktop... ${waited}s"
      done
    fi

    if ! docker info >/dev/null 2>&1; then
      echo "Docker Desktop is still not reachable. Start it manually, wait for it to finish booting, then rerun: mcp-github"
      return 1
    fi
  fi

  echo "Starting Docker MCP GitHub profile '${profile}' at http://127.0.0.1:${port}/mcp"
  echo "Keep this terminal open while ChatGPT is using the connector."
  docker mcp gateway run --profile "${profile}" --transport streaming --port "${port}"
}

# Opens a public HTTPS tunnel for ChatGPT to reach the local MCP endpoint.
# Paste the printed https://.../mcp URL into ChatGPT's connector/app settings.
mcp-github-tunnel() {
  local port="${MCP_GITHUB_PORT:-8080}"

  if command -v ngrok >/dev/null 2>&1; then
    ngrok http "${port}"
  elif command -v cloudflared >/dev/null 2>&1; then
    cloudflared tunnel --url "http://127.0.0.1:${port}"
  else
    echo "Install ngrok or cloudflared to expose http://127.0.0.1:${port}/mcp as HTTPS for ChatGPT."
    echo "OpenAI's local development docs use: ngrok http ${port}"
    return 1
  fi
}

# Debug the Docker MCP GitHub profile in MCP Inspector.
mcp-github-inspect() {
  local profile="${1:-${DOCKER_MCP_GITHUB_PROFILE:-github_write}}"
  npx -y @modelcontextprotocol/inspector docker mcp gateway run --profile "${profile}"
}

alias mcp-inspect='mcp-github-inspect'

# GitHub API via Nexus Router (port 7000)
# Access GitHub REST API through: http://localhost:7000/github/api/v3
# Requires GITHUB_TOKEN in environment (use infis to inject)
