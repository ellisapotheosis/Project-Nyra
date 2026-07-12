#!/usr/bin/env bash
set -euo pipefail

SECRET_NAME="${1:-}"
SECRET_SCOPE="${2:-/shared}"

if [[ -z "$SECRET_NAME" ]]; then
  echo "Usage: $0 SECRET_NAME [INFISICAL_SCOPE]" >&2
  echo "Example: $0 OPENAI_API_KEY /clients/assistant" >&2
  exit 2
fi

cat <<EOF
Secret incident checklist for: ${SECRET_NAME}
Scope: ${SECRET_SCOPE}

1. Remove the value from tracked files and commit only the sanitized change.
2. Rotate the credential at the upstream provider or identity system.
3. Store the replacement in Infisical under scope: ${SECRET_SCOPE}.
4. Refresh the affected runtime or service token cache.
5. Re-run:
   - scripts/security/nyra-secret-scan.sh --staged
   - scripts/security/audit-env-files.sh
6. If the secret was committed, evaluate whether scoped history cleanup is required.
7. If the secret was exposed in logs or a public bind, close exposure first, then rotate.

Do not paste the real value into chat, docs, or tracked files.
EOF
