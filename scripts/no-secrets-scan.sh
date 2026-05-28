#!/usr/bin/env bash
set -euo pipefail

patterns='(sk-(proj|live|test|or-v1)-[A-Za-z0-9]{16,}|sk-[A-Za-z0-9]{32,}|xox[baprs]-[A-Za-z0-9-]{20,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY)'

if rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!docs/archive/**' --glob '!docs/public-readiness/**' "$patterns" .; then
  echo "Potential secret pattern found." >&2
  exit 1
fi

echo "No high-signal secret patterns found."
