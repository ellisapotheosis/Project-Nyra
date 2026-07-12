#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

banned_pattern='\b(ruflo|claude-flow|ruvector|flow-nexus|ruv-swarm|agentic-flow|agentdb|agent booster|epic sdk|sona)\b'

allowed_context_pattern='do not reintroduce|must not be reintroduced|not using|not used|not part of|deprecated|removed|remove wrong terms|archive|archived|historical|replaced|wrong tech stack|cleanup summary|public-readiness|gitignored-inventory|no ruvector|no claude-flow|no ruflo|instances of|referenced|references to|current stack without|outdated|verified correct|qdrant \+ falkordb'

if rg -n -i \
  --glob '!docs/ruvector/**' \
  --glob '!docs/research/**' \
  --glob '!docs/public-readiness/**' \
  --glob '!docs/reports/**' \
  --glob '!docs/CLEANUP_SUMMARY_2026-05-19.md' \
  "$banned_pattern" docs \
  | rg -v -i "$allowed_context_pattern" \
  >/tmp/docs-banned-hits.txt; then
  echo "[FAIL] Deprecated stack references found in docs:"
  cat /tmp/docs-banned-hits.txt
  exit 1
fi

echo "[PASS] No active deprecated stack references found in docs."

if find docs -iname '*n8n*' -type f -o -path '*n8n*' -name '*.json' | sort | rg '\.json$' | rg -v '^docs/workflows/n8n/' >/tmp/n8n-json-outside.txt; then
  echo "[FAIL] n8n workflow JSON files detected outside docs/workflows/n8n/:"
  cat /tmp/n8n-json-outside.txt
  exit 1
fi

echo "[PASS] n8n workflow JSON files are centralized under docs/workflows/n8n/."
