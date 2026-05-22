#!/bin/bash
# Project Nyra Network Topology Mapper
# Discovers and maps DNS resolution, IP addresses, Tailscale mesh routes, and service endpoints
# Exit code: 0 = all hosts discoverable, >0 = discovery failures

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
DISCOVERED=0
FAILED=0
WARNINGS=0

# Utility functions
log_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((DISCOVERED++))
}

log_fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARNINGS++))
}

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_section() {
  echo -e "${MAGENTA}► $1${NC}"
}

separator() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Check if running from correct location
if [[ ! -d "infra/hosts" ]]; then
  echo "Error: Run from project root with infra/hosts directory"
  exit 1
fi

echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  Project Nyra Network Topology Mapper                    ║${NC}"
echo -e "${CYAN}║  $(date '+%Y-%m-%d %H:%M:%S')                                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo

# ============================================================================
# 1. HOST DISCOVERY VIA DNS
# ============================================================================
separator
log_info "Host Discovery via DNS"
separator

# Host inventory
declare -A HOSTS=(
  [orchestrator]="22"
  [worker-rtx5090]="22"
  [worker-rtx3090ti]="22"
  [worker-rtx3060]="22"
  [oracle-vps]="22"
)

declare -A HOST_IPS
declare -A HOST_RESOLVED

log_section "Testing DNS Resolution"
for host in "${!HOSTS[@]}"; do
  if getent hosts "$host" &> /dev/null; then
    ip=$(getent hosts "$host" | awk '{print $1}')
    HOST_IPS[$host]=$ip
    HOST_RESOLVED[$host]="yes"
    log_pass "DNS: $host → $ip"
  else
    HOST_RESOLVED[$host]="no"
    log_fail "DNS: $host not resolvable"
  fi
done

# ============================================================================
# 2. TAILSCALE NETWORK MAPPING
# ============================================================================
separator
log_info "Tailscale Mesh Network"
separator

if ! command -v tailscale &> /dev/null; then
  log_warn "Tailscale CLI not installed - skipping mesh topology"
else
  if tailscale status &> /dev/null; then
    log_section "Tailscale Status"
    TAILSCALE_STATUS=$(tailscale status 2>&1 | head -1)
    if echo "$TAILSCALE_STATUS" | grep -q "logged in"; then
      log_pass "Tailscale logged in"
    else
      log_warn "Tailscale status: $TAILSCALE_STATUS"
    fi

    log_section "Tailscale Nodes"
    # Parse Tailscale nodes
    tailscale status 2>&1 | tail -n +2 | while read -r line; do
      if [[ -n "$line" ]]; then
        # Extract IP and hostname
        node_ip=$(echo "$line" | awk '{print $1}')
        node_host=$(echo "$line" | awk '{print $2}')

        # Check if this is one of our hosts
        for host in "${!HOSTS[@]}"; do
          if [[ "$node_host" == "$host"* ]]; then
            log_info "  Tailscale: $node_host ($node_ip)"
          fi
        done
      fi
    done
  else
    log_warn "Tailscale daemon not running"
  fi

  log_section "Tailscale Routes"
  if ip route show | grep -q "100.64.0.0"; then
    log_pass "Tailscale routes active (100.64.0.0/10)"
  else
    log_fail "Tailscale routes not present"
  fi
fi

# ============================================================================
# 3. SSH CONNECTIVITY CHECK
# ============================================================================
separator
log_info "Host Connectivity via SSH"
separator

log_section "Testing SSH Access"
for host in "${!HOSTS[@]}"; do
  port=${HOSTS[$host]}

  if timeout 3 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
    log_pass "SSH: $host:$port accessible"

    # Try to get hostname details remotely
    if timeout 3 ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no "$host" "uname -n" &> /dev/null; then
      log_info "  → Remote hostname verified"
    else
      log_warn "  → Could not verify remote hostname (may need SSH keys)"
    fi
  else
    log_fail "SSH: $host:$port not accessible"
  fi
done

# ============================================================================
# 4. SERVICE ENDPOINT DISCOVERY
# ============================================================================
separator
log_info "Service Endpoint Discovery"
separator

# Service definitions: service_name:host:port:protocol
declare -a SERVICES=(
  "Nexus Router:orchestrator:7000:http"
  "LiteLLM:orchestrator:8000:http"
  "Prometheus:orchestrator:9090:http"
  "Grafana:orchestrator:3000:http"
  "n8n:orchestrator:5678:http"
  "Portainer:orchestrator:9000:http"
  "TwentyCRM:oracle-vps:3000:http"
  "vLLM (5090):worker-rtx5090:8000:http"
  "vLLM (3090ti):worker-rtx3090ti:8000:http"
  "Ollama:worker-rtx3060:11434:http"
)

log_section "Testing Service Endpoints"
for service_spec in "${SERVICES[@]}"; do
  IFS=':' read -r service host port protocol <<< "$service_spec"

  # Determine endpoint URL
  case "$protocol" in
    http)
      endpoint="http://$host:$port"
      health_path="/health"
      ;;
    https)
      endpoint="https://$host:$port"
      health_path="/health"
      ;;
    *)
      endpoint="$host:$port"
      ;;
  esac

  # Try local connection first (if on orchestrator or same host)
  if [[ "$host" == "localhost" || "$host" == "127.0.0.1" ]]; then
    if timeout 2 curl -s -f "$endpoint$health_path" &> /dev/null; then
      log_pass "Service: $service (local) responding"
    else
      log_warn "Service: $service (local) not responding"
    fi
  else
    # Test via SSH or direct connection
    if timeout 3 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
      log_pass "Service: $service ($host:$port) port open"

      # Try health check if on our network
      if timeout 3 curl -s -f "$endpoint$health_path" &> /dev/null 2>&1; then
        log_pass "  → Health check passed"
      else
        log_warn "  → Health endpoint not responding (service may need startup)"
      fi
    else
      log_fail "Service: $service ($host:$port) port closed"
    fi
  fi
done

# ============================================================================
# 5. CLOUDFLARE TUNNEL INGRESS
# ============================================================================
separator
log_info "Cloudflare Tunnel & Public Ingress"
separator

log_section "Checking Cloudflare Configuration"
if [[ -f "infra/hosts/orchestrator/docker-compose.yml" ]]; then
  if grep -q "cloudflared\|cloudflare" "infra/hosts/orchestrator/docker-compose.yml"; then
    log_pass "Cloudflared service configured"

    # Check if running
    if docker ps 2>/dev/null | grep -q "cloudflared"; then
      log_pass "Cloudflared container running"

      # Try to get tunnel status
      if docker logs nyra-cloudflared-orchestrator 2>&1 | grep -q "Registered tunnel\|Your quick tunnel"; then
        log_pass "Tunnel registration confirmed"
      else
        log_warn "Tunnel registration status unclear (check logs)"
      fi
    else
      log_warn "Cloudflared container not running"
    fi
  else
    log_warn "Cloudflared not found in docker-compose.yml"
  fi
else
  log_fail "Orchestrator docker-compose.yml not found"
fi

# Check for DNS/domain configuration
log_section "DNS Configuration"
if grep -r "ratehunter.net\|cloudflare" infra/configs/ 2>/dev/null; then
  log_pass "Cloudflare domains configured in configs"
else
  log_warn "Cloudflare domain configuration not found"
fi

# ============================================================================
# 6. NETWORK DIAGNOSTICS
# ============================================================================
separator
log_info "Network Diagnostics"
separator

log_section "Local Network Interfaces"
if command -v ip &> /dev/null; then
  ip addr show | grep "inet " | grep -v "127.0.0.1" | while read -r line; do
    ip_addr=$(echo "$line" | awk '{print $2}')
    interface=$(ip addr show to "$ip_addr" 2>/dev/null | grep -oP '^\d+: \K[^:]+')
    log_info "  $interface: $ip_addr"
  done
else
  log_warn "ip command not available"
fi

log_section "Routing Table"
if command -v ip &> /dev/null; then
  # Show key routes
  ip route show | grep -E "100.64|default|docker" | head -5 | while read -r line; do
    log_info "  Route: $line"
  done
else
  log_warn "ip command not available"
fi

# ============================================================================
# 7. DOCKER NETWORK CHECK
# ============================================================================
separator
log_info "Docker Network Configuration"
separator

log_section "Docker Networks"
if command -v docker &> /dev/null; then
  docker network ls --format "table {{.Name}}\t{{.Driver}}" 2>/dev/null | tail -n +2 | while read -r line; do
    if [[ -n "$line" ]]; then
      network_name=$(echo "$line" | awk '{print $1}')
      network_driver=$(echo "$line" | awk '{print $2}')

      if [[ "$network_name" == "nyra"* ]] || [[ "$network_name" == "bridge" ]]; then
        log_info "  Network: $network_name ($network_driver)"
      fi
    fi
  done
else
  log_warn "Docker not available"
fi

# ============================================================================
# SUMMARY
# ============================================================================
separator
echo
echo -e "${GREEN}Discovered:${NC} $DISCOVERED"
echo -e "${RED}Failed:${NC}     $FAILED"
echo -e "${YELLOW}Warnings:${NC}  $WARNINGS"
echo

if [[ $FAILED -eq 0 ]]; then
  echo -e "${GREEN}✓ All hosts discoverable and network healthy${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠ Some hosts or services unreachable (see above for details)${NC}"
  exit 1
fi
