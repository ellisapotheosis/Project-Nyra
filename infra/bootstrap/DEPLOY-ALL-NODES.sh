#!/usr/bin/env bash
# ████████████████████████████████████████████████████████████████████████████
# NYRA 5-Node Bootstrap Deployment
# ████████████████████████████████████████████████████████████████████████████
#
# Deploys .zsh configuration, docker contexts, SSH config, and Portainer to:
# - orchestrator (Portainer CE server)
# - oracle-vps (Linux, port 22)
# - worker-rtx5090 (WSL2, port 2222)
# - worker-rtx3090ti (Linux, port 22)
# - worker-rtx3060 (WSL2, port 2222)
#
# Usage:
#   bash infra/bootstrap/DEPLOY-ALL-NODES.sh [--confirm]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BOOTSTRAP_ZSH_CONFIG="$SCRIPT_DIR/zsh-config"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

declare -A NODES=(
  [orchestrator]="orchestrator.trex-fiordland.ts.net:22"
  [oracle-vps]="oracle-vps.trex-fiordland.ts.net:22"
  [worker-rtx5090]="worker-rtx5090.trex-fiordland.ts.net:2222"
  [worker-rtx3090ti]="worker-rtx3090ti.trex-fiordland.ts.net:22"
  [worker-rtx3060]="worker-rtx3060.trex-fiordland.ts.net:2222"
)

CONFIRM_FLAG="${1:-}"

log_info() { echo -e "${BLUE}ℹ${NC} $*"; }
log_success() { echo -e "${GREEN}✓${NC} $*"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $*"; }
log_error() { echo -e "${RED}✗${NC} $*"; }

check_ssh_key() {
  if [ ! -f "$HOME/.ssh/id_ed25519" ]; then
    log_error "SSH key not found: $HOME/.ssh/id_ed25519"
    return 1
  fi
  log_success "SSH key found"
  return 0
}

check_git_repo() {
  if [ ! -d "$PROJECT_ROOT/.git" ]; then
    log_error "Not in a git repository: $PROJECT_ROOT"
    return 1
  fi
  log_success "Git repository detected"
  return 0
}

test_ssh_connection() {
  local node_name=$1
  local host_port=$2
  local host="${host_port%:*}"
  local port="${host_port#*:}"

  log_info "Testing SSH to $node_name ($host:$port)..."
  if timeout 5 ssh -p "$port" -o ConnectTimeout=3 -o StrictHostKeyChecking=no edane@"$host" "echo OK" &>/dev/null; then
    log_success "SSH to $node_name works"
    return 0
  else
    log_warn "SSH to $node_name failed (may not be reachable)"
    return 1
  fi
}

deploy_zsh_config() {
  local node_name=$1
  local host_port=$2
  local host="${host_port%:*}"
  local port="${host_port#*:}"

  log_info "Deploying .zsh config to $node_name..."
  rsync -avz --delete -e "ssh -p $port" "$BOOTSTRAP_ZSH_CONFIG/" \
    "edane@$host:~/bootstrap-zsh-config/" &>/dev/null || return 1
  
  ssh -p "$port" "edane@$host" bash ~/bootstrap-zsh-config/BOOTSTRAP.sh &>/dev/null || return 1
  log_success "$node_name: .zsh config deployed"
  return 0
}

setup_ssh_config() {
  local node_name=$1
  local host_port=$2
  local host="${host_port%:*}"
  local port="${host_port#*:}"

  log_info "Setting up SSH config on $node_name..."
  ssh -p "$port" "edane@$host" "mkdir -p ~/.ssh && chmod 700 ~/.ssh" &>/dev/null || return 1

  for n_name in "${!NODES[@]}"; do
    local n_host_port="${NODES[$n_name]}"
    local n_host="${n_host_port%:*}"
    local n_port="${n_host_port#*:}"
    ssh -p "$port" "edane@$host" "ssh-keyscan -p $n_port -H $n_host >> ~/.ssh/known_hosts 2>/dev/null" &>/dev/null || true
  done

  local ssh_config_entries=""
  for n_name in "${!NODES[@]}"; do
    local n_host_port="${NODES[$n_name]}"
    local n_host="${n_host_port%:*}"
    local n_port="${n_host_port#*:}"
    ssh_config_entries+="
Host $n_name
  HostName $n_host
  User edane
  Port $n_port
  StrictHostKeyChecking no
  UserKnownHostsFile ~/.ssh/known_hosts
"
  done

  ssh -p "$port" "edane@$host" "cat >> ~/.ssh/config << 'SSHCFG_EOF'
$ssh_config_entries
SSHCFG_EOF
  chmod 600 ~/.ssh/config" &>/dev/null || return 1

  log_success "$node_name: SSH config setup complete"
  return 0
}

setup_docker_contexts() {
  local node_name=$1
  local host_port=$2
  local host="${host_port%:*}"
  local port="${host_port#*:}"

  log_info "Setting up docker contexts on $node_name..."

  for ctx_name in "${!NODES[@]}"; do
    [ "$ctx_name" = "$node_name" ] && continue
    local ctx_host_port="${NODES[$ctx_name]}"
    local ctx_host="${ctx_host_port%:*}"
    local ctx_port="${ctx_host_port#*:}"
    ssh -p "$port" "edane@$host" "docker context create $ctx_name --docker \"host=ssh://edane@$ctx_host:$ctx_port\" 2>/dev/null || true" &>/dev/null || true
  done

  log_success "$node_name: Docker contexts configured"
  return 0
}

setup_portainer() {
  local node_name=$1
  local host_port=$2
  local host="${host_port%:*}"
  local port="${host_port#*:}"
  local is_server=$3

  log_info "Setting up Portainer on $node_name..."

  if [ "$is_server" = "true" ]; then
    ssh -p "$port" "edane@$host" "
      docker run -d --name portainer --restart always \
        -p 8000:8000 -p 9443:9443 \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v portainer_data:/data \
        portainer/portainer-ce:latest 2>/dev/null || true
    " &>/dev/null || true
    log_success "$node_name: Portainer CE server deployed"
  else
    ssh -p "$port" "edane@$host" "
      docker run -d --name portainer_edge_agent --restart always \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v /var/lib/docker/volumes:/var/lib/docker/volumes \
        -e EDGE_ID=\$(hostname) \
        -e EDGE_INSECURE_POLL=1 \
        portainer/agent:latest 2>/dev/null || true
    " &>/dev/null || true
    log_success "$node_name: Portainer edge agent configured"
  fi
  return 0
}

main() {
  echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  NYRA 5-Node Bootstrap Deployment${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
  echo

  log_info "Running pre-flight checks..."
  check_git_repo || exit 1
  check_ssh_key || exit 1
  [ ! -d "$BOOTSTRAP_ZSH_CONFIG" ] && log_error "Bootstrap directory not found" && exit 1
  log_success "Pre-flight checks passed"
  echo

  log_info "Testing SSH connections..."
  local all_reachable=true
  for node_name in "${!NODES[@]}"; do
    test_ssh_connection "$node_name" "${NODES[$node_name]}" || all_reachable=false
  done

  if [ "$all_reachable" = "false" ] && [ "$CONFIRM_FLAG" != "--confirm" ]; then
    log_warn "Some nodes unreachable. Ensure Tailscale is active."
    read -p "Continue anyway? (y/n) " -n 1 -r; echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
  fi
  echo

  for node_name in orchestrator oracle-vps worker-rtx5090 worker-rtx3090ti worker-rtx3060; do
    echo
    log_info "╔═══════════════════════════════════════════════════════════════╗"
    log_info "║  Deploying to: $node_name"
    log_info "╚═══════════════════════════════════════════════════════════════╝"

    deploy_zsh_config "$node_name" "${NODES[$node_name]}" || continue
    setup_ssh_config "$node_name" "${NODES[$node_name]}" || log_warn "$node_name: SSH config had issues"
    [ "$node_name" != "orchestrator" ] && setup_docker_contexts "$node_name" "${NODES[$node_name]}"
    [ "$node_name" = "orchestrator" ] && setup_portainer "$node_name" "${NODES[$node_name]}" "true" || setup_portainer "$node_name" "${NODES[$node_name]}" "false"

    log_success "✓ $node_name deployment complete"
  done

  echo
  echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
  log_success "All 5 nodes deployed!"
  echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
  echo
  echo "Next steps:"
  echo "  1. ssh orchestrator              # Verify SSH aliases work"
  echo "  2. curl https://localhost:9443   # Verify Portainer server"
  echo "  3. exec zsh                      # Reload shell with new aliases"
  echo "  4. nyra-health                   # Check all workers"
  echo "  5. make ps                       # Show cluster status"
  echo
}

main "$@"
