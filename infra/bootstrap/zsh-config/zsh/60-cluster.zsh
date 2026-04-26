alias orch='ssh orchestrator-win'
alias orchip='ssh orchestrator-ip'
alias w5090='ssh worker-rtx5090-win'
alias w3060='ssh worker-rtx3060-win'
alias w3090='ssh worker-rtx3090ti-win'
alias w3090ti='ssh worker-rtx3090ti-win'
alias w3090ti-wsl='ssh worker-rtx3090ti-wsl'

alias dco='docker --context orchestrator'
alias dcoip='docker --context orchestrator-ip'
alias dc5090='docker --context worker-rtx5090'
alias dc3060='docker --context worker-rtx3060'
alias dc3090='docker --context worker-rtx3090ti'
alias dc3090ti='docker --context worker-rtx3090ti'

alias orchps='docker --context orchestrator ps'
alias w5090ps='docker --context worker-rtx5090 ps'
alias w3060ps='docker --context worker-rtx3060 ps'
alias w3090ps='docker --context worker-rtx3090ti ps'
alias w3090tips='docker --context worker-rtx3090ti ps'

orchwsl() {
  ssh orchestrator-win "powershell -NoProfile -Command \"wsl -d Ubuntu-24.04 -u ellisapotheosis -- bash -lc '$*'\""
}
orchipwsl() {
  ssh orchestrator-ip "powershell -NoProfile -Command \"wsl -d Ubuntu-24.04 -u ellisapotheosis -- bash -lc '$*'\""
}
w5090wsl() {
  ssh worker-rtx5090-win "powershell -NoProfile -Command \"wsl -d Ubuntu-24.04 -u ellisapotheosis -- bash -lc '$*'\""
}
w3060wsl() {
  ssh worker-rtx3060-win "powershell -NoProfile -Command \"wsl -d Ubuntu-24.04 -u ellisapotheosis -- bash -lc '$*'\""
}
w3090wsl() {
  ssh worker-rtx3090ti-win "powershell -NoProfile -Command \"wsl -d Ubuntu-24.04 -u ellisapotheosis -- bash -lc '$*'\""
}
w3090tiwsl() {
  ssh worker-rtx3090ti-win "powershell -NoProfile -Command \"wsl -d Ubuntu-24.04 -u ellisapotheosis -- bash -lc '$*'\""
}

nyra-health() {
  echo "=== RTX5090 vLLM (100.64.0.11:8000) ==="
  curl -sf --connect-timeout 3 http://100.64.0.11:8000/health && echo "OK" || echo "UNREACHABLE"
  echo "=== RTX3060 Ollama (100.64.0.12:11434) ==="
  curl -sf --connect-timeout 3 http://100.64.0.12:11434/api/version | jq -r '.version // "OK"' 2>/dev/null || echo "UNREACHABLE"
  echo "=== RTX3090Ti vLLM (100.64.0.13:8000) ==="
  curl -sf --connect-timeout 3 http://100.64.0.13:8000/health && echo "OK" || echo "UNREACHABLE"
  echo "=== Portainer (localhost:9443) ==="
  curl -sk --connect-timeout 3 https://localhost:9443/api/system/status | jq -r '.Version' 2>/dev/null || echo "UNREACHABLE"
  echo "=== LiteLLM models ==="
  curl -sf --connect-timeout 3 http://localhost:4000/v1/models | jq -r '.data[].id' 2>/dev/null || echo "UNREACHABLE"
}
