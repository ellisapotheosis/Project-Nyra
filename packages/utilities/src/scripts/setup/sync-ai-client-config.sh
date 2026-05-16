#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd -P)"
USER_HOME="${SNAP_REAL_HOME:-$HOME}"

CODEX_CONFIG_PATH="${CODEX_CONFIG_PATH:-$USER_HOME/.codex/config.toml}"
GEMINI_SETTINGS_PATH="${GEMINI_SETTINGS_PATH:-$USER_HOME/.gemini/settings.json}"
GEMINI_TRUSTED_FOLDERS_PATH="${GEMINI_TRUSTED_FOLDERS_PATH:-$USER_HOME/.gemini/trustedFolders.json}"
GEMINI_GLOBAL_CONFIG_PATH="${GEMINI_GLOBAL_CONFIG_PATH:-$USER_HOME/.gemini/config.yaml}"
REPO_GEMINI_CONFIG_PATH="${REPO_GEMINI_CONFIG_PATH:-$REPO_ROOT/.gemini/config.yaml}"

SYNC_CODEX=1
SYNC_GEMINI=1

info() {
  printf '[ai-client-sync] %s\n' "$1"
}

usage() {
  cat <<'EOF'
Project Nyra - Sync Codex/Gemini Client Config

Usage:
  scripts/setup/sync-ai-client-config.sh [options]

Options:
  --codex-only      Sync only Codex CLI/Desktop config
  --gemini-only     Sync only Gemini CLI config
  -h, --help        Show help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --codex-only)
      SYNC_GEMINI=0
      shift
      ;;
    --gemini-only)
      SYNC_CODEX=0
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      usage
      exit 1
      ;;
  esac
done

ensure_dir() {
  mkdir -p "$1"
}

sync_codex_config() {
  ensure_dir "$(dirname "$CODEX_CONFIG_PATH")"
  touch "$CODEX_CONFIG_PATH"

  if ! grep -Fq "[projects.\"$REPO_ROOT\"]" "$CODEX_CONFIG_PATH"; then
    cat >>"$CODEX_CONFIG_PATH" <<EOF

[projects."$REPO_ROOT"]
trust_level = "trusted"
EOF
    info "Added Codex trust entry for $REPO_ROOT"
  else
    info "Codex trust entry already present for $REPO_ROOT"
  fi

  local plugin
  for plugin in gmail box github google-drive; do
    if ! grep -Fq "[plugins.\"${plugin}@openai-curated\"]" "$CODEX_CONFIG_PATH"; then
      cat >>"$CODEX_CONFIG_PATH" <<EOF

[plugins."${plugin}@openai-curated"]
enabled = true
EOF
      info "Enabled Codex plugin ${plugin}@openai-curated"
    fi
  done
}

sync_gemini_settings() {
  ensure_dir "$(dirname "$GEMINI_SETTINGS_PATH")"
  ensure_dir "$(dirname "$GEMINI_TRUSTED_FOLDERS_PATH")"

  python3 - "$GEMINI_SETTINGS_PATH" <<'PY'
import json
import os
import sys

path = sys.argv[1]
data = {}
if os.path.exists(path):
    with open(path, "r", encoding="utf-8") as handle:
        try:
            data = json.load(handle)
        except json.JSONDecodeError:
            data = {}

security = data.setdefault("security", {})
auth = security.setdefault("auth", {})
auth.setdefault("selectedType", "oauth-personal")

with open(path, "w", encoding="utf-8") as handle:
    json.dump(data, handle, indent=2, sort_keys=True)
    handle.write("\n")
PY
  info "Synced Gemini settings.json"

  python3 - "$GEMINI_TRUSTED_FOLDERS_PATH" "$REPO_ROOT" "$USER_HOME" <<'PY'
import json
import os
import sys

path, repo_root, user_home = sys.argv[1], sys.argv[2], sys.argv[3]
data = {}
if os.path.exists(path):
    with open(path, "r", encoding="utf-8") as handle:
        try:
            data = json.load(handle)
        except json.JSONDecodeError:
            data = {}

data[repo_root] = "TRUST_FOLDER"
data[user_home] = "TRUST_FOLDER"

with open(path, "w", encoding="utf-8") as handle:
    json.dump(data, handle, indent=2, sort_keys=True)
    handle.write("\n")
PY
  info "Synced Gemini trustedFolders.json"

  if [[ -f "$REPO_GEMINI_CONFIG_PATH" ]]; then
    cp "$REPO_GEMINI_CONFIG_PATH" "$GEMINI_GLOBAL_CONFIG_PATH"
    chmod 600 "$GEMINI_GLOBAL_CONFIG_PATH" || true
    info "Copied repo Gemini config to $GEMINI_GLOBAL_CONFIG_PATH"
  else
    info "Repo Gemini config not found at $REPO_GEMINI_CONFIG_PATH; skipping global config sync"
  fi
}

main() {
  if [[ "$SYNC_CODEX" -eq 1 ]]; then
    sync_codex_config
  fi

  if [[ "$SYNC_GEMINI" -eq 1 ]]; then
    sync_gemini_settings
  fi
}

main "$@"
