#!/usr/bin/env bash
# Deploy the memory-manager plane on orchestrator (100.64.0.10, "MiniApotheosis").
#
# Services: embeddings (llama.cpp, nomic-embed-text-v1.5, 768 dims),
#           memory-manager (bitnet.cpp, BitNet b1.58 2B-4T).
#
# CPU ONLY. This host has no discrete GPU and is deliberately not a second
# LiteLLM/Nexus control plane - it publishes two origins that the canonical
# oracle-vps LiteLLM consumes as ordinary model_list entries.
#
# MUST run on orchestrator. Under WSL2 mirrored networking the tailnet address
# is visible inside the guest as a real interface, so require_host resolves it
# without shelling out to the Windows tailscale CLI.
set -euo pipefail
# shellcheck source=scripts/deploy/_common.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"
cd "${REPO_ROOT}"

require_host "${ORCHESTRATOR_IP}" "orchestrator"

# --build: bitnet.cpp has no upstream registry image, so the memory-manager
# service is built locally from a pinned microsoft/BitNet commit.
compose_up orchestrator --build "$@"

log "waiting for embeddings /health on ${ORCHESTRATOR_IP}:8081"
embeddings_ready=0
for _ in $(seq 1 60); do
  if curl -fsS -m5 "http://${ORCHESTRATOR_IP}:8081/health" >/dev/null 2>&1; then
    embeddings_ready=1
    break
  fi
  sleep 5
done
[ "${embeddings_ready}" = "1" ] ||
  die "embeddings did not become ready. Inspect: docker compose --profile orchestrator logs embeddings"

log "embeddings ready - verifying vector width"
# 768 is a hard contract: MEM0_EMBEDDING_DIMS and every existing Qdrant
# collection were built at this width. A different width means a wrong model,
# and silently accepting it corrupts the vector store.
dims="$(
  curl -fsS -m30 "http://${ORCHESTRATOR_IP}:8081/v1/embeddings" \
    -H 'Content-Type: application/json' \
    -d '{"model":"nomic-embed-text","input":"nyra embedding dimension check"}' |
    python3 -c 'import json,sys; print(len(json.load(sys.stdin)["data"][0]["embedding"]))'
)"
[ "${dims}" = "768" ] ||
  die "embedding width is ${dims}, expected 768. The wrong GGUF is loaded; do NOT point mem0/Qdrant at this endpoint."
log "embedding width OK: ${dims} dimensions"

log "waiting for memory-manager /health on ${ORCHESTRATOR_IP}:8087"
# First start compiles bitnet.cpp and downloads ~1.1 GB of weights, so this
# window is deliberately long.
for _ in $(seq 1 120); do
  if curl -fsS -m5 "http://${ORCHESTRATOR_IP}:8087/health" >/dev/null 2>&1; then
    log "memory-manager ready"
    exit 0
  fi
  sleep 15
done
die "memory-manager did not become ready within 30m. Inspect: docker compose --profile orchestrator logs memory-manager"
