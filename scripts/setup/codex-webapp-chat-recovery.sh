#!/usr/bin/env bash
set -euo pipefail

find_repo_root() {
  if git rev-parse --show-toplevel >/dev/null 2>&1; then
    git rev-parse --show-toplevel
    return 0
  fi

  local candidate
  for candidate in \
    "/workspace" \
    "/workspace/Project-Nyra" \
    "/workspace/project-nyra" \
    "$HOME/project-nyra"
  do
    if [[ -d "$candidate/.git" ]] || [[ -f "$candidate/package.json" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

REPO_ROOT="$(find_repo_root || true)"
if [[ -z "$REPO_ROOT" ]]; then
  printf '[codex-recovery] Could not find the repository root.\n' >&2
  printf '[codex-recovery] Run this from inside the repo checkout in the Codex webapp terminal.\n' >&2
  exit 1
fi

cd "$REPO_ROOT"
printf '[codex-recovery] Repo root: %s\n' "$REPO_ROOT"

mkdir -p "$REPO_ROOT/Scripts"
if [[ ! -x "$REPO_ROOT/Scripts/Initialize-CodexEnvironment.sh" && -f "$REPO_ROOT/scripts/setup/Initialize-CodexEnvironment.sh" ]]; then
  cat >"$REPO_ROOT/Scripts/Initialize-CodexEnvironment.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd -P)"
exec "$REPO_ROOT/scripts/setup/Initialize-CodexEnvironment.sh" "$@"
EOF
  chmod +x "$REPO_ROOT/Scripts/Initialize-CodexEnvironment.sh"
  printf '[codex-recovery] Restored Scripts/Initialize-CodexEnvironment.sh compatibility shim.\n'
fi

export HUSKY=0
export NYRA_CODEX_SETUP_MODE="${NYRA_CODEX_SETUP_MODE:-minimal}"
export NYRA_CODEX_INSTALL_DEPS="${NYRA_CODEX_INSTALL_DEPS:-0}"

if [[ -x "$REPO_ROOT/scripts/setup/Initialize-CodexEnvironment.sh" ]]; then
  printf '[codex-recovery] Running repo setup wrapper in %s mode.\n' "$NYRA_CODEX_SETUP_MODE"
  exec "$REPO_ROOT/scripts/setup/Initialize-CodexEnvironment.sh"
fi

if command -v node >/dev/null 2>&1 && command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@10.27.0 --activate >/dev/null 2>&1 || true
fi

if [[ "${NYRA_CODEX_INSTALL_DEPS:-0}" == "1" ]] && command -v pnpm >/dev/null 2>&1; then
  printf '[codex-recovery] Running fallback pnpm install.\n'
  exec pnpm install --no-frozen-lockfile
fi

printf '[codex-recovery] No repo setup script found; shell is now in the repo root.\n'
