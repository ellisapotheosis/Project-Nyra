#!/usr/bin/env bash
set -Eeuo pipefail

if [ "$#" -lt 2 ]; then
  echo "usage: $0 <pane-name> <command>" >&2
  exit 2
fi

pane_name="$1"
shift
pane_command="$*"

history_dir="${NYRA_ZELLIJ_HISTORY_DIR:-$HOME/.nyra/zellij-history}"
mkdir -p "$history_dir"

safe_name="$(printf '%s' "$pane_name" | tr -c 'A-Za-z0-9._-' '_')"
typescript_log="$history_dir/${safe_name}.typescript"
command_log="$history_dir/${safe_name}.commands.log"

{
  printf '\n[%s] %s\n' "$(date -Is)" "$pane_command"
} >> "$command_log"

if command -v script >/dev/null 2>&1; then
  printf -v quoted_command '%q' "$pane_command"
  exec script -q -f -a "$typescript_log" -c "bash -lc $quoted_command"
fi

exec bash -lc "$pane_command"
