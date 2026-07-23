#!/usr/bin/env bash
set -euo pipefail

# Run on the Oracle Linux host after creating a one-time Gateway enrollment
# token in Infisical Cloud. The gateway makes outbound connections only.
GATEWAY_NAME="${INFISICAL_GATEWAY_NAME:-oracle-vps-dynamic-secrets}"
INFISICAL_DOMAIN="${INFISICAL_GATEWAY_DOMAIN:-https://app.infisical.com}"
: "${INFISICAL_GATEWAY_ENROLL_TOKEN:?Create a one-time Gateway enrollment token in Infisical Cloud first}"

if [[ "$(id -u)" -ne 0 ]]; then
  exec sudo -E "$0" "$@"
fi

if ! command -v infisical >/dev/null 2>&1; then
  case "$(. /etc/os-release && printf '%s' "$ID")" in
    ubuntu|debian)
      apt-get update
      apt-get install -y ca-certificates curl gnupg
      curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | bash
      apt-get update
      apt-get install -y infisical
      ;;
    *)
      printf 'Unsupported host OS. Install the Infisical CLI, then re-run this script.\n' >&2
      exit 2
      ;;
  esac
fi

infisical gateway systemd install "$GATEWAY_NAME" \
  --enroll-method=token \
  --token="$INFISICAL_GATEWAY_ENROLL_TOKEN" \
  --domain="$INFISICAL_DOMAIN"

systemctl enable --now infisical-gateway
systemctl is-active --quiet infisical-gateway
printf 'Infisical Gateway %s is active. Verify it is Healthy in Infisical Cloud before binding dynamic-secret resources.\n' "$GATEWAY_NAME"
