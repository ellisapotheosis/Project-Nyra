#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
INFRA_DIR="${REPO_ROOT}/infra"
ENV_FILE="${INFRA_DIR}/env/nyra.env"

OPENCLAW_DIR="${INFRA_DIR}/vendor/openclaw"
OPENCLAW_IMG="openclaw:nyra"
OPENCLAW_CONFIG_DIR="${INFRA_DIR}/data/openclaw/config"
OPENCLAW_WORKSPACE_DIR="${INFRA_DIR}/data/openclaw/workspace"

OPENCLAW_DOCKER_APT_PACKAGES=${OPENCLAW_DOCKER_APT_PACKAGES:-"git curl jq ca-certificates openssl python3 python3-pip ffmpeg build-essential"}

mkdir -p "${INFRA_DIR}/vendor" "${OPENCLAW_CONFIG_DIR}" "${OPENCLAW_WORKSPACE_DIR}"

if [[ ! -d "${OPENCLAW_DIR}/.git" ]]; then
  echo "→ Cloning OpenClaw into ${OPENCLAW_DIR}"
  git clone https://github.com/openclaw/openclaw.git "${OPENCLAW_DIR}"
else
  echo "→ Updating OpenClaw repo"
  git -C "${OPENCLAW_DIR}" pull --ff-only
fi

OPENROUTER_API_KEY="$(grep -E '^OPENROUTER_API_KEY=' "${ENV_FILE}" | head -n1 | cut -d= -f2-)"
if [[ -z "${OPENROUTER_API_KEY}" || "${OPENROUTER_API_KEY}" == "replace_me" ]]; then
  echo "❌ OPENROUTER_API_KEY not set in ${ENV_FILE}"
  exit 1
fi

# Generate gateway token if missing
if ! grep -q "^OPENCLAW_GATEWAY_TOKEN=" "${ENV_FILE}"; then
  TOKEN="oc_$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(32))
PY
)"
  printf "\nOPENCLAW_GATEWAY_TOKEN=%s\n" "${TOKEN}" >> "${ENV_FILE}"
fi
OPENCLAW_GATEWAY_TOKEN="$(grep -E '^OPENCLAW_GATEWAY_TOKEN=' "${ENV_FILE}" | tail -n1 | cut -d= -f2-)"

OPENCLAW_COMPOSE="${INFRA_DIR}/compose/openclaw.compose.yaml"
cat > "${OPENCLAW_COMPOSE}" <<YAML
services:
  openclaw-gateway:
    image: ${OPENCLAW_IMG}
    restart: unless-stopped
    init: true
    environment:
      HOME: /home/node
      TERM: xterm-256color
      OPENCLAW_GATEWAY_TOKEN: ${OPENCLAW_GATEWAY_TOKEN}
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
    volumes:
      - ${OPENCLAW_CONFIG_DIR}:/home/node/.openclaw
      - ${OPENCLAW_WORKSPACE_DIR}:/home/node/.openclaw/workspace
    ports:
      - "127.0.0.1:18789:18789"
      - "127.0.0.1:18790:18790"
    command: ["node","dist/index.js","gateway","--bind","lan","--port","18789"]

  openclaw-cli:
    image: ${OPENCLAW_IMG}
    init: true
    stdin_open: true
    tty: true
    environment:
      HOME: /home/node
      TERM: xterm-256color
      OPENCLAW_GATEWAY_TOKEN: ${OPENCLAW_GATEWAY_TOKEN}
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
      BROWSER: echo
    volumes:
      - ${OPENCLAW_CONFIG_DIR}:/home/node/.openclaw
      - ${OPENCLAW_WORKSPACE_DIR}:/home/node/.openclaw/workspace
    entrypoint: ["node","dist/index.js"]
YAML

echo "→ Building OpenClaw image (${OPENCLAW_IMG})"
docker build   -t "${OPENCLAW_IMG}"   --build-arg "OPENCLAW_DOCKER_APT_PACKAGES=${OPENCLAW_DOCKER_APT_PACKAGES}"   --build-arg "OPENCLAW_INSTALL_BROWSER=1"   "${OPENCLAW_DIR}"

echo "→ Onboarding (non-interactive; OpenRouter key via env; secrets as refs)"
docker compose -f "${OPENCLAW_COMPOSE}" run --rm openclaw-cli onboard --non-interactive   --flow quickstart   --auth-choice openrouter-api-key   --secret-input-mode ref   --accept-risk   --skip-channels

echo "→ Starting gateway"
docker compose -f "${OPENCLAW_COMPOSE}" up -d openclaw-gateway

echo "✅ OpenClaw up. Gateway: http://localhost:18789"
