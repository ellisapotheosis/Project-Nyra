#!/usr/bin/env bash
set -u
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/1000/bus"
source ~/.zsh/99-secrets.zsh 2>/dev/null
CID="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID"
CSEC="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET"
infisical login --method=universal-auth --client-id="$CID" --client-secret="$CSEC" >/dev/null 2>&1
PROJ=8374cea9-e5e8-4050-bda4-b91f25ab30ef
ENV=dev

declare -A TGT=(
  [braintrust]="/external/braintrust"
  [claude-code]="/infra/ai-profiles/claude-code"
  [cloudflare]="/security/cloudflare"
  [credit-bureau]="/external/credit-bureau"
  [gitea]="/external/gitea"
)

for f in "${!TGT[@]}"; do
  s="/llm-providers/$f"; t="${TGT[$f]}"
  # get all keys at source
  keys=$(infisical secrets get --recursive --path="$s" --env="$ENV" --projectId="$PROJ" --output json 2>/dev/null | grep -oE '"key":"[^"]+"' | sed 's/"key":"//;s/"$//')
  n=0
  for k in $keys; do
    # fetch raw value (json-escaped, preserves multiline)
    val=$(infisical secrets get "$k" --path="$s" --env="$ENV" --projectId="$PROJ" --output json 2>/dev/null | grep -oE '"value":"(\\.|[^"\\])*"' | sed 's/"value":"//;s/"$//' | sed 's/\\n/\n/g; s/\\t/\t/g; s/\\"/"/g; s/\\\\/\\/g')
    if [ -z "$val" ]; then
      echo "  WARN $f/$k empty, skip"
      continue
    fi
    # set per-key (handles multiline)
    infisical secrets set "$k=$val" --path="$t" --env="$ENV" --projectId="$PROJ" --type shared >/dev/null 2>&1 && n=$((n+1)) || echo "  FAIL $f/$k"
  done
  got=$(infisical export --env="$ENV" --projectId="$PROJ" --path="$t" --format=json 2>/dev/null | grep -oE '"key":"[^"]+"' | wc -l)
  echo "REMIT $f -> $t | set=$n verify=$got"
done
echo "REMIT_DONE"
