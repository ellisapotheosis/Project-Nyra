#!/usr/bin/env bash
# =============================================================================
# Project Nyra — Infisical Bidirectional Cloud Sync
# =============================================================================
# Syncs secrets between self-hosted Infisical (infisical.trex-fiordland.ts.net)
# and cloud Infisical (app.infisical.com).
#
# Usage:
#   scripts/infisical/sync-cloud.sh pull          # cloud → self-hosted
#   scripts/infisical/sync-cloud.sh push          # self-hosted → cloud
#   scripts/infisical/sync-cloud.sh sync          # bidirectional (cloud-wins on conflict)
#   scripts/infisical/sync-cloud.sh sync --local-wins  # bidirectional (local-wins on conflict)
#   scripts/infisical/sync-cloud.sh status        # show secret counts on both instances
#
# Required environment variables:
#   INFISICAL_TOKEN_CLOUD       — API token for app.infisical.com
#   INFISICAL_PROJECT_ID_CLOUD  — Project ID on app.infisical.com
#   INFISICAL_TOKEN_LOCAL       — API token for self-hosted instance
#   INFISICAL_PROJECT_ID_LOCAL  — Project ID on self-hosted instance (created post-bootstrap)
#
# Optional:
#   INFISICAL_LOCAL_URL   — defaults to https://infisical.trex-fiordland.ts.net
#   INFISICAL_ENV         — environment to sync (default: prod)
#   SYNC_PATHS            — comma-separated paths to sync (default: all key paths)
#   INFISICAL_CLOUD_BOOTSTRAP_PATH — cloud path holding app.infisical.com operator credentials
#   INFISICAL_LOCAL_BOOTSTRAP_PATH — cloud path holding self-hosted/local credentials
#
# All tokens should be machine identity access tokens, not user tokens.
# =============================================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────

CLOUD_URL="${INFISICAL_CLOUD_URL:-https://app.infisical.com/api}"
LOCAL_URL="${INFISICAL_LOCAL_URL:-https://infisical.trex-fiordland.ts.net/api}"
ENV_NAME="${INFISICAL_ENV:-prod}"
CONFLICT_WINNER="${CONFLICT_WINNER:-cloud}"  # 'cloud' or 'local'
CLOUD_BOOTSTRAP_PATH="${INFISICAL_CLOUD_BOOTSTRAP_PATH:-/security/infisical}"
LOCAL_BOOTSTRAP_PATH="${INFISICAL_LOCAL_BOOTSTRAP_PATH:-/security/infisical/local}"

# Load tokens from local secrets file if not in environment
LOCAL_SECRETS_FILE="${INFISICAL_LOCAL_SECRETS_FILE:-$HOME/.zsh/99-secrets.zsh}"
if [[ -z "${INFISICAL_TOKEN_CLOUD:-}" && -f "$LOCAL_SECRETS_FILE" ]]; then
  set -a; source "$LOCAL_SECRETS_FILE"; set +a
fi

CLOUD_TOKEN="${INFISICAL_TOKEN_CLOUD:-${INFISICAL_TOKEN:-}}"
CLOUD_PROJECT="${INFISICAL_PROJECT_ID_CLOUD:-${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}}"
LOCAL_TOKEN="${INFISICAL_TOKEN_LOCAL:-}"
LOCAL_PROJECT="${INFISICAL_PROJECT_ID_LOCAL:-}"

if [[ -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:-}" && -n "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:-}" ]]; then
  CLOUD_TOKEN="$(
    infisical login \
      --method universal-auth \
      --client-id "$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
      --client-secret "$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" \
      --domain "$CLOUD_URL" \
      --plain \
      --silent 2>/dev/null || true
  )"
fi

# Paths to sync — covers all Nyra secret namespaces
DEFAULT_PATHS=(
  "/machines/orchestrator"
  "/machines/oracle-vps"
  "/machines/worker-rtx5090"
  "/machines/worker-rtx3090ti"
  "/machines/worker-rtx3060"
  "/apps/projectnyra"
  "/apps/ratehunter"
  "/services/crm-api"
  "/services/lead-ingestion"
  "/services/campaign-service"
  "/services/communication-service"
  "/services/quote-service"
  "/services/assistant-service"
  "/providers/cloudflare"
  "/providers/twilio"
  "/providers/sendgrid"
  "/providers/llm"
  "/clients/paperclip"
  "/agent-vault/vaults"
  "/security/infisical/local"
)

if [[ -n "${SYNC_PATHS:-}" ]]; then
  IFS=',' read -r -a ACTIVE_PATHS <<< "$SYNC_PATHS"
else
  ACTIVE_PATHS=("${DEFAULT_PATHS[@]}")
fi

# ── Helpers ───────────────────────────────────────────────────────────────────

log()  { echo "[$(date '+%H:%M:%S')] $*"; }
info() { echo "[$(date '+%H:%M:%S')] ℹ  $*"; }
ok()   { echo "[$(date '+%H:%M:%S')] ✅ $*"; }
warn() { echo "[$(date '+%H:%M:%S')] ⚠️  $*"; }
err()  { echo "[$(date '+%H:%M:%S')] ❌ $*" >&2; }

check_prereqs() {
  command -v infisical >/dev/null || { err "infisical CLI not installed"; exit 1; }
  command -v jq        >/dev/null || { err "jq not installed"; exit 1; }
}

load_bootstrap_secret() {
  local key="$1"
  local path="$2"

  [[ -z "$CLOUD_TOKEN" || -z "$CLOUD_PROJECT" ]] && return 0

  infisical secrets \
    --token="$CLOUD_TOKEN" \
    --projectId="$CLOUD_PROJECT" \
    --domain="$CLOUD_URL" \
    --env="$ENV_NAME" \
    --path="$path" \
    --output=json \
    --silent 2>/dev/null \
  | jq -r --arg key "$key" '.[] | select(.secretKey == $key) | .secretValue' 2>/dev/null \
  | tail -n 1
}

hydrate_split_credentials() {
  if [[ -z "$CLOUD_TOKEN" ]]; then
    CLOUD_TOKEN="$(load_bootstrap_secret INFISICAL_TOKEN_CLOUD "$CLOUD_BOOTSTRAP_PATH" || true)"
  fi
  if [[ -z "$CLOUD_PROJECT" ]]; then
    CLOUD_PROJECT="$(load_bootstrap_secret INFISICAL_PROJECT_ID_CLOUD "$CLOUD_BOOTSTRAP_PATH" || true)"
  fi
  if [[ -z "$LOCAL_TOKEN" ]]; then
    LOCAL_TOKEN="$(load_bootstrap_secret INFISICAL_TOKEN_LOCAL "$LOCAL_BOOTSTRAP_PATH" || true)"
  fi
  if [[ -z "$LOCAL_PROJECT" ]]; then
    LOCAL_PROJECT="$(load_bootstrap_secret INFISICAL_PROJECT_ID_LOCAL "$LOCAL_BOOTSTRAP_PATH" || true)"
  fi
}

check_tokens() {
  local require_cloud="${1:-true}"
  local require_local="${2:-true}"

  hydrate_split_credentials

  if [[ "$require_cloud" == "true" && -z "$CLOUD_TOKEN" ]]; then
    err "INFISICAL_TOKEN_CLOUD is not set."
    err "Export it, set INFISICAL_TOKEN, or add it to $LOCAL_SECRETS_FILE"
    exit 1
  fi

  if [[ "$require_local" == "true" ]]; then
    if [[ -z "$LOCAL_TOKEN" ]]; then
      err "INFISICAL_TOKEN_LOCAL is not set."
      err "After self-hosted Infisical is running, create a machine identity token"
      err "at https://infisical.trex-fiordland.ts.net and export INFISICAL_TOKEN_LOCAL"
      exit 1
    fi
    if [[ -z "$LOCAL_PROJECT" ]]; then
      err "INFISICAL_PROJECT_ID_LOCAL is not set."
      err "Find it in your self-hosted Infisical project settings and export it."
      exit 1
    fi
  fi
}

# Export all secrets from one instance as JSON, for a given path
export_secrets() {
  local token="$1"
  local project="$2"
  local url="$3"
  local path="$4"

  infisical secrets \
    --token="$token" \
    --projectId="$project" \
    --domain="$url" \
    --env="$ENV_NAME" \
    --path="$path" \
    --output=json \
    --silent 2>/dev/null \
  | jq -r '.[] | "\(.secretKey)=\(.secretValue)"' 2>/dev/null || true
}

# Set a single secret on a target instance
set_secret() {
  local token="$1"
  local project="$2"
  local url="$3"
  local path="$4"
  local key="$5"
  local value="$6"

  infisical secrets set "$key=$value" \
    --token="$token" \
    --projectId="$project" \
    --domain="$url" \
    --env="$ENV_NAME" \
    --path="$path" \
    --silent >/dev/null 2>&1
}

ensure_folder_path() {
  local token="$1"
  local project="$2"
  local url="$3"
  local path="$4"

  [[ "$path" == "/" ]] && return 0

  local parent="/"
  local part
  local trimmed="${path#/}"
  trimmed="${trimmed%/}"

  IFS='/' read -r -a parts <<< "$trimmed"
  for part in "${parts[@]}"; do
    [[ -z "$part" ]] && continue
    infisical secrets folders create \
      --name "$part" \
      --path "$parent" \
      --token="$token" \
      --projectId="$project" \
      --domain="$url" \
      --env="$ENV_NAME" \
      --silent >/dev/null 2>&1 || true

    if [[ "$parent" == "/" ]]; then
      parent="/$part"
    else
      parent="$parent/$part"
    fi
  done
}

# Count secrets on an instance for a path
count_secrets() {
  local token="$1"
  local project="$2"
  local url="$3"
  local path="$4"

  infisical secrets \
    --token="$token" \
    --projectId="$project" \
    --domain="$url" \
    --env="$ENV_NAME" \
    --path="$path" \
    --output=json \
    --silent 2>/dev/null \
  | jq 'length' 2>/dev/null || echo "0"
}

# ── Core sync: copy secrets from source → target for a given path ─────────────

sync_path() {
  local src_token="$1"
  local src_project="$2"
  local src_url="$3"
  local dst_token="$4"
  local dst_project="$5"
  local dst_url="$6"
  local path="$7"
  local dry_run="${8:-false}"

  local src_name dst_name
  [[ "$src_url" == *"app.infisical"* ]] && src_name="cloud" || src_name="self-hosted"
  [[ "$dst_url" == *"app.infisical"* ]] && dst_name="cloud" || dst_name="self-hosted"

  local secrets
  secrets=$(export_secrets "$src_token" "$src_project" "$src_url" "$path")

  if [[ -z "$secrets" ]]; then
    info "  $path — no secrets on $src_name, skipping"
    return 0
  fi

  if [[ "$dry_run" != "true" ]]; then
    ensure_folder_path "$dst_token" "$dst_project" "$dst_url" "$path"
  fi

  local count=0
  local failed=0
  while IFS='=' read -r key value; do
    [[ -z "$key" ]] && continue
    if [[ "$dry_run" == "true" ]]; then
      log "  [DRY-RUN] Would set $key → $dst_name$path"
      (( count++ )) || true
    else
      if set_secret "$dst_token" "$dst_project" "$dst_url" "$path" "$key" "$value"; then
        (( count++ )) || true
      else
        warn "  Failed to set $key at $dst_name$path"
        (( failed++ )) || true
      fi
    fi
  done <<< "$secrets"

  if [[ "$failed" -gt 0 ]]; then
    warn "  $path — $count secrets copied, $failed failed → $dst_name"
    return 1
  fi

  ok "  $path — $count secrets → $dst_name"
}

# ── Command implementations ────────────────────────────────────────────────────

cmd_pull() {
  local dry_run="${1:-false}"
  info "PULL: cloud ($CLOUD_URL) → self-hosted ($LOCAL_URL) [env=$ENV_NAME]"
  check_tokens true true
  for path in "${ACTIVE_PATHS[@]}"; do
    sync_path \
      "$CLOUD_TOKEN" "$CLOUD_PROJECT" "$CLOUD_URL" \
      "$LOCAL_TOKEN" "$LOCAL_PROJECT" "$LOCAL_URL" \
      "$path" "$dry_run"
  done
  ok "Pull complete."
}

cmd_push() {
  local dry_run="${1:-false}"
  info "PUSH: self-hosted ($LOCAL_URL) → cloud ($CLOUD_URL) [env=$ENV_NAME]"
  check_tokens true true
  for path in "${ACTIVE_PATHS[@]}"; do
    sync_path \
      "$LOCAL_TOKEN" "$LOCAL_PROJECT" "$LOCAL_URL" \
      "$CLOUD_TOKEN" "$CLOUD_PROJECT" "$CLOUD_URL" \
      "$path" "$dry_run"
  done
  ok "Push complete."
}

cmd_sync() {
  local dry_run="${1:-false}"
  info "SYNC: bidirectional [conflict=$CONFLICT_WINNER wins] [env=$ENV_NAME]"
  check_tokens true true

  if [[ "$CONFLICT_WINNER" == "cloud" ]]; then
    # Push self-hosted → cloud FIRST (so cloud values overwrite on the second pass)
    info "Step 1/2: push self-hosted → cloud (conflicts will be overwritten by cloud)"
    for path in "${ACTIVE_PATHS[@]}"; do
      sync_path \
        "$LOCAL_TOKEN" "$LOCAL_PROJECT" "$LOCAL_URL" \
        "$CLOUD_TOKEN" "$CLOUD_PROJECT" "$CLOUD_URL" \
        "$path" "$dry_run"
    done
    info "Step 2/2: pull cloud → self-hosted (authoritative)"
    for path in "${ACTIVE_PATHS[@]}"; do
      sync_path \
        "$CLOUD_TOKEN" "$CLOUD_PROJECT" "$CLOUD_URL" \
        "$LOCAL_TOKEN" "$LOCAL_PROJECT" "$LOCAL_URL" \
        "$path" "$dry_run"
    done
  else
    # local-wins: pull first so cloud has everything, then push local overrides
    info "Step 1/2: pull cloud → self-hosted"
    for path in "${ACTIVE_PATHS[@]}"; do
      sync_path \
        "$CLOUD_TOKEN" "$CLOUD_PROJECT" "$CLOUD_URL" \
        "$LOCAL_TOKEN" "$LOCAL_PROJECT" "$LOCAL_URL" \
        "$path" "$dry_run"
    done
    info "Step 2/2: push self-hosted → cloud (authoritative)"
    for path in "${ACTIVE_PATHS[@]}"; do
      sync_path \
        "$LOCAL_TOKEN" "$LOCAL_PROJECT" "$LOCAL_URL" \
        "$CLOUD_TOKEN" "$CLOUD_PROJECT" "$CLOUD_URL" \
        "$path" "$dry_run"
    done
  fi

  ok "Bidirectional sync complete."
}

cmd_status() {
  info "Status: secret counts per path per instance [env=$ENV_NAME]"
  echo ""
  printf "%-45s  %8s  %8s\n" "PATH" "CLOUD" "SELF-HOSTED"
  printf "%-45s  %8s  %8s\n" "----" "-----" "-----------"

  local cloud_ok=true local_ok=true
  [[ -z "$CLOUD_TOKEN" ]] && cloud_ok=false
  [[ -z "$LOCAL_TOKEN" || -z "$LOCAL_PROJECT" ]] && local_ok=false

  for path in "${ACTIVE_PATHS[@]}"; do
    local cloud_count="n/a" local_count="n/a"

    if [[ "$cloud_ok" == "true" ]]; then
      cloud_count=$(count_secrets "$CLOUD_TOKEN" "$CLOUD_PROJECT" "$CLOUD_URL" "$path")
    fi
    if [[ "$local_ok" == "true" ]]; then
      local_count=$(count_secrets "$LOCAL_TOKEN" "$LOCAL_PROJECT" "$LOCAL_URL" "$path")
    fi

    printf "%-45s  %8s  %8s\n" "$path" "$cloud_count" "$local_count"
  done
  echo ""
}

# ── Entry point ───────────────────────────────────────────────────────────────

check_prereqs
hydrate_split_credentials

CMD="${1:-help}"
shift || true
DRY_RUN=false
LOCAL_WINS=false

for arg in "$@"; do
  case "$arg" in
    --dry-run)    DRY_RUN=true ;;
    --local-wins) CONFLICT_WINNER=local ;;
  esac
done

case "$CMD" in
  pull)   check_tokens true true;  cmd_pull   "$DRY_RUN" ;;
  push)   check_tokens true true;  cmd_push   "$DRY_RUN" ;;
  sync)   check_tokens true true;  cmd_sync   "$DRY_RUN" ;;
  status) cmd_status ;;
  help|*)
    cat <<'HELP'
Usage: scripts/infisical/sync-cloud.sh <command> [flags]

Commands:
  pull          cloud (app.infisical.com) → self-hosted (infisical.trex-fiordland.ts.net)
  push          self-hosted → cloud
  sync          bidirectional (cloud-wins on conflict by default)
  status        show secret counts on both instances per path

Flags:
  --dry-run     print what would be synced without making changes
  --local-wins  override conflict strategy: self-hosted values take precedence

Required env vars:
  INFISICAL_TOKEN_CLOUD        token for app.infisical.com
  INFISICAL_PROJECT_ID_CLOUD   project ID on cloud (default: 8374cea9-e5e8-4050-bda4-b91f25ab30ef)
  INFISICAL_TOKEN_LOCAL        token for self-hosted Infisical (create after bootstrap)
  INFISICAL_PROJECT_ID_LOCAL   project ID on self-hosted instance

Bootstrap paths:
  INFISICAL_CLOUD_BOOTSTRAP_PATH   default: /security/infisical
  INFISICAL_LOCAL_BOOTSTRAP_PATH   default: /security/infisical/local

Examples:
  make infisical-cloud-sync                          # bidirectional, cloud-wins
  make infisical-cloud-push                          # push local secrets up to cloud
  make infisical-cloud-pull                          # restore from cloud to local
  CONFLICT_WINNER=local make infisical-cloud-sync    # local takes precedence
HELP
    ;;
esac
