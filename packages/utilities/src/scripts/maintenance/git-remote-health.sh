#!/usr/bin/env bash
set -euo pipefail

git rev-parse --git-dir >/dev/null 2>&1 || {
  echo "ERROR: Not a git repository." >&2
  exit 1
}

remotes_count=$(git remote | wc -l | tr -d ' ')
local_branch_count=$(git for-each-ref --count=100 refs/heads | wc -l | tr -d ' ')
remote_branch_count=$(git for-each-ref --count=200 refs/remotes | wc -l | tr -d ' ')

if [[ "$remotes_count" -eq 0 ]]; then
  echo "ERROR: No git remotes are configured."
  echo "Fix: git remote add origin <REPLACE_ME_GIT_REMOTE_URL>"
  exit 1
fi

if [[ "$local_branch_count" -lt 2 ]]; then
  echo "ERROR: Fewer than two local branches are available."
  echo "Hint: git fetch --all --prune && git branch -a"
  exit 1
else
  echo "OK: Found $local_branch_count local branches."
fi

echo "OK: git remotes configured ($remotes_count)."
echo "OK: Found $remote_branch_count remote-tracking branches."
