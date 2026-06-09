#!/bin/bash
# Project Nyra Infrastructure Health Check
# Validates orchestrator, workers, and Oracle VPS connectivity, services, and configurations
# Exit code: 0 = all systems operational, >0 = failures detected

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Utility functions
log_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
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

separator() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Check if running from correct location
if [[ ! -d "infra/hosts" ]]; then
  echo "Error: Run from project root with infra/hosts directory"
  exit 1
fi

# Use orchestrator compose file as primary health reference
COMPOSE_FILE="infra/hosts/orchestrator/docker-compose.yml"
if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Error: Orchestrator docker-compose.yml not found at $COMPOSE_FILE"
  exit 1
fi

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Project Nyra Infrastructure Health Check                ║${NC}"
echo -e "${BLUE}║  $(date '+%Y-%m-%d %H:%M:%S')                                 ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo

# ============================================================================
# 1. LOCAL ORCHESTRATOR CHECKS
# ============================================================================
separator
log_info "Checking Local Orchestrator (LAN)"
separator

# Docker daemon
if command -v docker &> /dev/null; then
  if docker ps &> /dev/null; then
    log_pass "Docker daemon running"
    DOCKER_COUNT=$(docker ps --format "{{.Names}}" | wc -l)
    log_info "  $DOCKER_COUNT containers active"
  else
    log_fail "Docker daemon not accessible"
  fi
else
  log_fail "Docker not installed"
fi

# Docker Compose
if docker compose version &> /dev/null; then
  log_pass "Docker Compose available"

  # Validate compose file syntax
  if docker compose -f "$COMPOSE_FILE" config > /dev/null 2>&1; then
    log_pass "Compose file syntax valid"
  else
    log_fail "Compose file syntax invalid: $COMPOSE_FILE"
  fi
else
  log_fail "Docker Compose not available"
fi

# Check for required services in compose
REQUIRED_SERVICES=(
  "nexus-router"
  "litelllm"
  "prometheus"
  "grafana"
  "portainer"
  "n8n"
  "nyra-cloudflared-orchestrator"
)

for service in "${REQUIRED_SERVICES[@]}"; do
  if grep -q "\"$service\"\|$service:" "$COMPOSE_FILE"; then
    log_pass "Service '$service' defined in compose"
  else
    log_warn "Service '$service' not found in compose file"
  fi
done

# Check service health
log_info "Checking service health status..."
if docker ps --format "{{.Names}}" | grep -q "nexus-router"; then
  # Try to reach Nexus Router
  if timeout 2 curl -s -f http://localhost:7000/health &> /dev/null; then
    log_pass "Nexus Router responding (port 7000)"
  else
    log_warn "Nexus Router not responding on port 7000"
  fi
else
  log_warn "Nexus Router container not running"
fi

# Check Prometheus
if docker ps --format "{{.Names}}" | grep -q "prometheus"; then
  if timeout 2 curl -s -f http://localhost:9090/-/healthy &> /dev/null; then
    log_pass "Prometheus responding (port 9090)"
  else
    log_warn "Prometheus not responding on port 9090"
  fi
else
  log_warn "Prometheus container not running"
fi

# Check Grafana
if docker ps --format "{{.Names}}" | grep -q "grafana"; then
  if timeout 2 curl -s -f http://localhost:3000 &> /dev/null; then
    log_pass "Grafana responding (port 3000)"
  else
    log_warn "Grafana not responding on port 3000"
  fi
else
  log_warn "Grafana container not running"
fi

# Check for Cloudflared tunnel
if docker ps --format "{{.Names}}" | grep -q "cloudflared"; then
  if docker logs nyra-cloudflared-orchestrator 2>&1 | grep -q "Registered tunnel"; then
    log_pass "Cloudflared tunnel registered"
  else
    log_warn "Cloudflared tunnel status unclear (check logs)"
  fi
else
  log_warn "Cloudflared container not running"
fi

# ============================================================================
# 2. GPU WORKER NODES CHECK
# ============================================================================
separator
log_info "Checking GPU Worker Nodes"
separator

WORKERS=(
  "worker-rtx5090:22"
  "worker-rtx3090ti:22"
  "worker-rtx3060:22"
)

for worker in "${WORKERS[@]}"; do
  host="${worker%:*}"
  port="${worker##*:}"

  if timeout 2 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
    log_pass "Worker $host SSH accessible (port $port)"

    # Check if worker has vLLM/Ollama running (basic check)
    if timeout 3 ssh -o ConnectTimeout=2 "$host" "curl -s http://localhost:8000/health &> /dev/null" 2>/dev/null; then
      log_pass "  → vLLM endpoint healthy"
    else
      log_warn "  → vLLM endpoint not responding (may be stopped)"
    fi
  else
    log_fail "Worker $host SSH not accessible"
  fi
done

# ============================================================================
# 3. ORACLE VPS (CLOUD) CHECK
# ============================================================================
separator
log_info "Checking Oracle VPS (Cloud)"
separator

# Check DNS resolution
if getent hosts oracle-vps &> /dev/null; then
  ORACLE_IP=$(getent hosts oracle-vps | awk '{print $1}')
  log_pass "oracle-vps resolves to $ORACLE_IP"
else
  log_warn "oracle-vps hostname not resolvable (check /etc/hosts or DNS)"
fi

# Check SSH connectivity
if timeout 2 bash -c "echo > /dev/tcp/oracle-vps/22" 2>/dev/null; then
  log_pass "Oracle VPS SSH accessible (port 22)"

  # Check key services
  if timeout 3 ssh -o ConnectTimeout=2 oracle-vps "docker ps --format '{{.Names}}' 2>/dev/null | grep twenty-crm" &> /dev/null; then
    log_pass "  → TwentyCRM container running"
  else
    log_warn "  → TwentyCRM container not found"
  fi

  if timeout 3 ssh -o ConnectTimeout=2 oracle-vps "curl -s http://localhost:3000 &> /dev/null" 2>/dev/null; then
    log_pass "  → TwentyCRM API responding (port 3000)"
  else
    log_warn "  → TwentyCRM API not responding"
  fi
else
  log_fail "Oracle VPS SSH not accessible"
fi

# ============================================================================
# 4. NETWORK & TAILSCALE CHECK
# ============================================================================
separator
log_info "Checking Network Connectivity"
separator

# Check Tailscale status
if command -v tailscale &> /dev/null; then
  if tailscale status &> /dev/null; then
    TAILSCALE_STATUS=$(tailscale status 2>&1 | head -1)
    if echo "$TAILSCALE_STATUS" | grep -q "logged in"; then
      log_pass "Tailscale active"
      TAILSCALE_NODES=$(tailscale status 2>&1 | tail -n +2 | wc -l)
      log_info "  $TAILSCALE_NODES nodes in network"
    else
      log_warn "Tailscale not logged in"
    fi
  else
    log_warn "Tailscale daemon not running"
  fi
else
  log_warn "Tailscale not installed"
fi

# Check internal network routing
if ip route show | grep -q "100.64.0.0"; then
  log_pass "Tailscale routes present (100.64.0.0/10)"
else
  log_warn "Tailscale routes not detected"
fi

# ============================================================================
# 5. SECRETS & CONFIGURATION CHECK
# ============================================================================
separator
log_info "Checking Secrets and Configuration"
separator

# Check Infisical connection
if command -v infisical &> /dev/null; then
  if infisical auth status 2>&1 | grep -q "logged in"; then
    log_pass "Infisical authenticated"
  else
    log_warn "Infisical not authenticated (run: infisical login)"
  fi
else
  log_warn "Infisical CLI not installed"
fi

# Check for .env files (should be gitignored)
if [[ -f ".env.local" ]] || [[ -f ".env" ]]; then
  log_warn "Unencrypted .env file found (should use Infisical instead)"
fi

# Check for critical environment variables
REQUIRED_VARS=(
  "ANTHROPIC_API_KEY"
  "OPENROUTER_API_KEY"
  "TWILIO_ACCOUNT_SID"
  "SENDGRID_API_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [[ -n "${!var:-}" ]]; then
    log_pass "Environment variable $var set"
  else
    log_warn "Environment variable $var not set (may be needed for some operations)"
  fi
done

# ============================================================================
# 6. GIT & SUBMODULES CHECK
# ============================================================================
separator
log_info "Checking Git Configuration"
separator

if git rev-parse --git-dir > /dev/null 2>&1; then
  log_pass "Git repository initialized"

  # Check submodules
  SUBMODULE_COUNT=$(git config --file .gitmodules --name-only --get-regexp '^submodule\.' 2>/dev/null | wc -l)
  if [[ $SUBMODULE_COUNT -gt 0 ]]; then
    log_pass "Submodules configured ($SUBMODULE_COUNT found)"

    # Check each submodule
    git config --file .gitmodules --name-only --get-regexp '^submodule\.' | sed 's/\.path//' | sort -u | while read -r submodule; do
      PATH=$(git config --file .gitmodules --get "$submodule.path")
      if [[ -d "$PATH/.git" ]] || [[ -f "$PATH/.git" ]]; then
        log_pass "  → Submodule $submodule initialized"
      else
        log_warn "  → Submodule $submodule not initialized (run: git submodule update --init)"
      fi
    done
  fi

  # Check branch status
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  log_info "Current branch: $CURRENT_BRANCH"

  # Check for uncommitted changes
  if [[ -z $(git status --porcelain) ]]; then
    log_pass "Working tree clean"
  else
    log_warn "Uncommitted changes present ($(git status --porcelain | wc -l) files)"
  fi
else
  log_fail "Not a git repository"
fi

# ============================================================================
# 7. DOCKER IMAGE CHECK
# ============================================================================
separator
log_info "Checking Docker Images"
separator

REQUIRED_IMAGES=(
  "nexus-router"
  "litelllm"
  "prometheus"
  "grafana"
  "portainer"
)

for image in "${REQUIRED_IMAGES[@]}"; do
  if docker images --format "{{.Repository}}" | grep -q "$image"; then
    log_pass "Image '$image' available locally"
  else
    log_warn "Image '$image' not found locally (may download on startup)"
  fi
done

# Check image age (warn if >30 days old)
IMAGES=$(docker images --format "{{.Repository}}:{{.CreatedAt}}")
if command -v date &> /dev/null; then
  THIRTY_DAYS_AGO=$(date -d "30 days ago" +%s 2>/dev/null || echo 0)
  if [[ $THIRTY_DAYS_AGO -gt 0 ]]; then
    echo "$IMAGES" | while read -r line; do
      if [[ -n "$line" ]]; then
        IMAGE=$(echo "$line" | cut -d: -f1)
        CREATED=$(echo "$line" | cut -d: -f2- | tr -d ' ')
        IMAGE_TIMESTAMP=$(date -d "$CREATED" +%s 2>/dev/null || echo 0)
        if [[ $IMAGE_TIMESTAMP -lt $THIRTY_DAYS_AGO ]]; then
          log_warn "  Image '$IMAGE' is older than 30 days (consider rebuilding)"
        fi
      fi
    done
  fi
fi

# ============================================================================
# 8. DISK SPACE & RESOURCES
# ============================================================================
separator
log_info "Checking System Resources"
separator

# Disk space
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $DISK_USAGE -lt 80 ]]; then
  log_pass "Disk usage acceptable ($DISK_USAGE%)"
else
  log_fail "Disk usage critical ($DISK_USAGE% - clean up old images/containers)"
fi

# Docker disk usage
if command -v docker &> /dev/null; then
  DOCKER_SIZE=$(docker system df --format "{{.Size}}" 2>/dev/null | tail -1)
  log_info "Docker system size: $DOCKER_SIZE"
fi

# Memory check
if command -v free &> /dev/null; then
  MEM_AVAILABLE=$(free -h | grep Mem | awk '{print $7}')
  log_info "Memory available: $MEM_AVAILABLE"
fi

# ============================================================================
# SUMMARY
# ============================================================================
separator
echo
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo

if [[ $FAILED -eq 0 ]]; then
  echo -e "${GREEN}✓ All critical systems operational${NC}"
  exit 0
else
  echo -e "${RED}✗ $FAILED critical issues detected - see above for details${NC}"
  exit 1
fi
