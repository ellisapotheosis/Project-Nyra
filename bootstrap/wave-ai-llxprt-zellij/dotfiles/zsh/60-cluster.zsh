# ==============================================================================
# GPU CLUSTER MANAGEMENT
# ==============================================================================
# Functions and helpers for managing the 4-node GPU cluster:
#   - Orchestrator (100.64.0.10): LiteLLM, Portainer, Prometheus, etc.
#   - RTX5090 (100.64.0.11): Primary vLLM inference
#   - RTX3090Ti (100.64.0.13): Secondary vLLM inference
#   - RTX3060 (100.64.0.12): Ollama, ingestion helpers

# ==============================================================================
# WSL EXECUTION HELPERS (Windows Host → PowerShell → WSL)
# ==============================================================================
# Use these to run Bash commands in WSL from Windows host over SSH

orchwsl() {
  ssh orchestrator-win "powershell -NoProfile -Command \"wsl -d $DISTRO -u $ORCH_WSL_USER -- bash -lc '$*'\""
}

w5090wsl() {
  ssh worker-rtx5090-win "powershell -NoProfile -Command \"wsl -d $DISTRO -u $ORCH_WSL_USER -- bash -lc '$*'\""
}

w3060wsl() {
  ssh worker-rtx3060-win "powershell -NoProfile -Command \"wsl -d $DISTRO -u $ORCH_WSL_USER -- bash -lc '$*'\""
}

w3090wsl() {
  ssh worker-rtx3090ti-win "powershell -NoProfile -Command \"wsl -d $DISTRO -u $ORCH_WSL_USER -- bash -lc '$*'\""
}

w3090tiwsl() {
  ssh worker-rtx3090ti-win "powershell -NoProfile -Command \"wsl -d $DISTRO -u $ORCH_WSL_USER -- bash -lc '$*'\""
}

# ==============================================================================
# HEALTH CHECK ACROSS CLUSTER
# ==============================================================================
nyra-health() {
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║            NYRA GPU CLUSTER HEALTH CHECK                     ║"
  echo "╚══════════════════════════════════════════════════════════════╝"

  echo ""
  echo "📊 RTX5090 vLLM (Tailscale 100.64.0.11:8000)"
  curl -sf --connect-timeout 3 http://100.64.0.11:8000/health >/dev/null 2>&1 && echo "✅ OK" || echo "❌ UNREACHABLE"

  echo ""
  echo "📊 RTX3060 Ollama (Tailscale 100.64.0.12:11434)"
  curl -sf --connect-timeout 3 http://100.64.0.12:11434/api/version >/dev/null 2>&1 && echo "✅ OK" || echo "❌ UNREACHABLE"

  echo ""
  echo "📊 RTX3090Ti vLLM (Tailscale 100.64.0.13:8000)"
  curl -sf --connect-timeout 3 http://100.64.0.13:8000/health >/dev/null 2>&1 && echo "✅ OK" || echo "❌ UNREACHABLE"

  echo ""
  echo "📊 Portainer (localhost:9443)"
  curl -sk --connect-timeout 3 https://localhost:9443/api/system/status >/dev/null 2>&1 && echo "✅ OK" || echo "❌ UNREACHABLE"

  echo ""
  echo "📊 LiteLLM Router (localhost:4000)"
  curl -sf --connect-timeout 3 http://localhost:4000/v1/models >/dev/null 2>&1 && echo "✅ OK" || echo "❌ UNREACHABLE"

  echo ""
}

# ==============================================================================
# DEPLOY WORKER CONFIG
# ==============================================================================
# Push docker-compose + .env files to a GPU worker
# Usage: nyra-push-worker [5090|3060|3090ti]
nyra-push-worker() {
  local worker="$1"
  local repo="${NYRA_ROOT}"

  if [[ ! -d "$repo" ]]; then
    echo "❌ NYRA_ROOT not found: $repo"
    return 1
  fi

  case "$worker" in
    5090)
      echo "🚀 Pushing RTX5090 config..."
      cat "$repo/infra/workers/worker-rtx5090/docker-compose.gpu.yml" | \
        ssh worker-rtx5090-win "powershell -NoProfile -Command \"wsl -d $DISTRO -u $ORCH_WSL_USER -- bash -c 'cat > ~/docker-compose.gpu.yml'\""
      [[ -f "$repo/.env.worker-rtx5090" ]] && \
        cat "$repo/.env.worker-rtx5090" | \
        ssh worker-rtx5090-win "powershell -NoProfile -Command \"wsl -d $DISTRO -u $ORCH_WSL_USER -- bash -c 'cat > ~/.env'\""
      echo "✅ Pushed to RTX5090"
      ;;
    3060)
      echo "🚀 Pushing RTX3060 config..."
      cat "$repo/infra/workers/worker-rtx3060/docker-compose.gpu.yml" | \
        ssh worker-rtx3060-win "powershell -NoProfile -Command \"wsl -d $DISTRO -u $ORCH_WSL_USER -- bash -c 'cat > ~/docker-compose.gpu.yml'\""
      echo "✅ Pushed to RTX3060"
      ;;
    3090ti|3090)
      echo "🚀 Pushing RTX3090Ti config..."
      cat "$repo/infra/workers/worker-rtx3090ti/docker-compose.gpu.yml" | \
        ssh worker-rtx3090ti-win "powershell -NoProfile -Command \"wsl -d $DISTRO -u $ORCH_WSL_USER -- bash -c 'cat > ~/docker-compose.gpu.yml'\""
      [[ -f "$repo/.env.worker-rtx3090ti" ]] && \
        cat "$repo/.env.worker-rtx3090ti" | \
        ssh worker-rtx3090ti-win "powershell -NoProfile -Command \"wsl -d $DISTRO -u $ORCH_WSL_USER -- bash -c 'cat > ~/.env'\""
      echo "✅ Pushed to RTX3090Ti"
      ;;
    *)
      echo "❌ Usage: nyra-push-worker [5090|3060|3090ti]"
      return 1
      ;;
  esac
}
