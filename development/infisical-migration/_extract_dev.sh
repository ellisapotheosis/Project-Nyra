#!/usr/bin/env bash
set -u
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/1000/bus"
source ~/.zsh/99-secrets.zsh 2>/dev/null
CID="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID"
CSEC="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET"
infisical login --method=universal-auth --client-id="$CID" --client-secret="$CSEC" >/dev/null 2>&1
PROJ=8374cea9-e5e8-4050-bda4-b91f25ab30ef
ENV=dev
MIRROR=/home/ellisapotheosis/repos/project-nyra/development/infisical-secrets
OUT=/home/ellisapotheosis/repos/project-nyra/development/infisical-migration
LOG=$OUT/extract-dev.log
: > "$LOG"

# TRUE providers that STAY in /llm-providers
TRUE_PROV="anthropic openai google openrouter omniroute llxprt cerebras cohere mistral morph nvidia ollama groq huggingface sambanova fal qwen kimi xai"

classify() {
  local f="$1"
  case "$f" in
    litellm) echo "/router/litellm/server" ;;
    nexus) echo "/router/nexus" ;;
    grafana|langfuse|logfire) echo "/observability/$f" ;;
    cloudflare|tailscale|virustotal) echo "/security/$f" ;;
    minio) echo "/databases/minio" ;;
    metamcp) echo "/router/metamcp" ;;
    n8n-mcp|n8n-mcp_com) echo "/router/mcp/n8n" ;;
    hermes|letta|picoclaw|openclaw) echo "/external/$f" ;;
    claude-code) echo "/infra/ai-profiles/claude-code" ;;
    open-webui|owui) echo "/external/open-webui" ;;
    twenty) echo "/domains/twenty-crm" ;;
    agentdb|agentmemory|anythingllm|apify|archon|atlassian|axiom|braintrust|browserless|calendly|chatbox|circleci|codecov|composio|confident-ai|copilot-kit|credit-bureau|desktopcommander|discord|docker|elevenlabs|exa|figma|firecrawl|freerateupdate|galileo|gastown|gitea|github|gitkraken|gitlab|gravatar|greptile|jigsawstack|leadmailbox|lendingtree|llamaindex|lobechat|mem0|memos|mempalace|memrader|memzero|mos-embedder|mqtt|n8n|npm|open-webui|paperclip|playwright|plugged-in|portainer|pypi|renovate|searxng|sendgrid|sentry|serena|slack|smithery|stitch|superset|syncthing|tavily|turborepo|twentyfirst|twilio|ubuntu-pro|unmute|vercel|voicemod|warp) echo "/external/$f" ;;
    *) echo "/external/$f" ;;  # default: third-party -> external
  esac
}

# get live /llm-providers subfolders
folders=$(infisical secrets folders get --path="/llm-providers" --env="$ENV" 2>/dev/null | grep -oE '│ [a-z0-9-]+ +│' | sed 's/│//g' | tr -d ' ' | grep -v '^$')

for f in $folders; do
  # skip true providers (already canonical)
  if echo " $TRUE_PROV " | grep -q " $f "; then
    echo "KEEP /llm-providers/$f (true provider)" | tee -a "$LOG"
    continue
  fi
  tgt=$(classify "$f")
  # source value: prefer mirror providers/ if exists else export live
  src="$MIRROR/dev/providers/$f/.env"
  tmp="/tmp/src_$f.env"
  if [ -f "$src" ]; then
    cp "$src" "$tmp"
  else
    # export directly from live source
    infisical export --env="$ENV" --projectId="$PROJ" --path="/llm-providers/$f" --format=dotenv 2>/dev/null > "$tmp"
  fi
  cnt=$(grep -c '=' "$tmp")
  if [ "$cnt" -eq 0 ]; then echo "SKIP empty $f" | tee -a "$LOG"; continue; fi
  # create target folder chain
  IFS='/' read -ra parts <<< "$tgt"
  path=""
  for ((i=1;i<${#parts[@]};i++)); do
    name="${parts[$i]}"; [ -z "$name" ] && continue
    if [ -z "$path" ]; then path="/$name"; else path="$path/$name"; fi
    if [ "$path" != "/" ]; then infisical secrets folders create --name "$name" --path "${path%/$name}" --env="$ENV" >/dev/null 2>&1 || true; fi
  done
  infisical secrets set --file="$tmp" --path="$tgt" --env="$ENV" --projectId="$PROJ" --type shared >/dev/null 2>&1
  got=$(infisical export --env="$ENV" --projectId="$PROJ" --path="$tgt" --format=json 2>/dev/null | grep -oE '"key":"[^"]+"' | wc -l)
  echo "COPY /llm-providers/$f -> $tgt | src=$cnt verify=$got" | tee -a "$LOG"
  rm -f "$tmp"
done
echo "=== EXTRACT_DEV_DONE ===" | tee -a "$LOG"
