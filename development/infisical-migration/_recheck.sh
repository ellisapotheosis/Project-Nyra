#!/usr/bin/env bash
set -u
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/1000/bus"
source ~/.zsh/99-secrets.zsh 2>/dev/null
CID="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID"
CSEC="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET"
infisical login --method=universal-auth --client-id="$CID" --client-secret="$CSEC" >/dev/null 2>&1
PROJ=8374cea9-e5e8-4050-bda4-b91f25ab30ef
ENV=dev

# re-verify the 5 questionable targets
declare -A TGT=(
  [braintrust]="/external/braintrust"
  [claude-code]="/infra/ai-profiles/claude-code"
  [cloudflare]="/security/cloudflare"
  [credit-bureau]="/external/credit-bureau"
  [gitea]="/external/gitea"
)
for f in "${!TGT[@]}"; do
  t="${TGT[$f]}"
  got=$(infisical export --env="$ENV" --projectId="$PROJ" --path="$t" --format=json 2>/dev/null | grep -oE '"key":"[^"]+"' | wc -l)
  echo "RECHECK $f -> $t | verify=$got"
  # if still 0, try to re-export source and re-set
  if [ "$got" -eq 0 ]; then
    tmp="/tmp/re_$f.env"
    infisical export --env="$ENV" --projectId="$PROJ" --path="/llm-providers/$f" --format=dotenv 2>/dev/null > "$tmp"
    c=$(grep -c '=' "$tmp")
    echo "  source /llm-providers/$f has $c keys; re-setting..."
    infisical secrets set --file="$tmp" --path="$t" --env="$ENV" --projectId="$PROJ" --type shared 2>&1 | tail -3
    got2=$(infisical export --env="$ENV" --projectId="$PROJ" --path="$t" --format=json 2>/dev/null | grep -oE '"key":"[^"]+"' | wc -l)
    echo "  AFTER RESET verify=$got2"
    rm -f "$tmp"
  fi
done
echo "RECHECK_DONE"
