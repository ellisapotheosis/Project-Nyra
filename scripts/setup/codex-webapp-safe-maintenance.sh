#!/usr/bin/env bash
set -euo pipefail

find_repo_root() {
  local candidate=""
  for candidate in \
    "$PWD" \
    "/workspace/Project-Nyra" \
    "/workspace/project-nyra" \
    "/workspaces/Project-Nyra" \
    "/workspaces/project-nyra" \
    "$HOME/project-nyra" \
    "/home/ellisapotheosis/repos/project-nyra"
  do
    candidate="$(cd "$candidate" 2>/dev/null && pwd -P || true)"
    if [[ -n "$candidate" ]] && ([[ -d "$candidate/.git" ]] || [[ -f "$candidate/package.json" ]]); then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

REPO_ROOT="$(find_repo_root || true)"
if [[ -z "$REPO_ROOT" ]]; then
  echo "Could not locate project-nyra checkout under \$PWD, /workspace, /workspaces, or \$HOME." >&2
  exit 1
fi

cd "$REPO_ROOT"
exec bash "$REPO_ROOT/scripts/setup/codex-webapp-manual-maintenance.sh" --webapp-safe "$@"
