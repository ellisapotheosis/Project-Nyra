#!/usr/bin/env bash
set -euo pipefail

remotes_count=$(git remote | wc -l | tr -d ' ')
branch_count=$(git for-each-ref --count=100 refs/heads | wc -l | tr -d ' ')

if [[ "$remotes_count" -eq 0 ]]; then
  echo "ERROR: No git remotes are configured."
  echo "Fix: git remote add origin <REPLACE_ME_GIT_REMOTE_URL>"
  exit 1
fi

if [[ "$branch_count" -lt 2 ]]; then
  echo "WARN: Only one local branch exists; no local PR-head branches were found."
  echo "Hint: git fetch --all --prune && git branch -a"
else
  echo "OK: Found multiple local branches."
fi

echo "OK: git remotes configured ($remotes_count)."
