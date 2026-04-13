#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

SSH_KEY_PATH="${SSH_KEY_PATH:-$HOME/.ssh/id_ed25519.pub}"

if [[ -f "${PROJECT_DIR}/terraform.tfvars" ]]; then
  tfvars_key_path="$(awk -F'=' '/^\s*private_key_path\s*=/{gsub(/"| /,"",$2); print $2; exit}' "${PROJECT_DIR}/terraform.tfvars" || true)"
  if [[ -n "${tfvars_key_path}" ]]; then
    if [[ "${tfvars_key_path}" == ~* ]]; then
      PRIVATE_KEY_PATH="${HOME}${tfvars_key_path#\~}"
    else
      PRIVATE_KEY_PATH="${tfvars_key_path}"
    fi
  else
    PRIVATE_KEY_PATH="${PRIVATE_KEY_PATH:-$HOME/.oci/oci_api_key.pem}"
  fi
else
  PRIVATE_KEY_PATH="${PRIVATE_KEY_PATH:-$HOME/.oci/oci_api_key.pem}"
fi

missing=0

check_cmd() {
  local cmd="$1"
  local install_hint="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "[ERROR] ${cmd} is not installed or not in PATH"
    echo "        Install hint: ${install_hint}"
    missing=1
    return 1
  fi
  return 0
}

if check_cmd terraform "https://developer.hashicorp.com/terraform/install"; then
  echo "[OK] terraform: $(terraform version -json | sed -n 's/.*"terraform_version":"\([^"]*\)".*/\1/p')"
fi

if check_cmd oci "https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"; then
  echo "[OK] oci CLI: $(oci --version)"
fi

if check_cmd docker "https://docs.docker.com/engine/install/ubuntu/"; then
  if docker compose version >/dev/null 2>&1; then
    echo "[OK] docker compose: $(docker compose version | head -n1)"
  else
    echo "[ERROR] docker compose plugin missing"
    echo "        Install hint: https://docs.docker.com/compose/install/linux/"
    missing=1
  fi
fi

if [[ ! -f "${SSH_KEY_PATH}" ]]; then
  echo "[ERROR] SSH public key not found at ${SSH_KEY_PATH}"
  echo "        Generate one: ssh-keygen -t ed25519 -C \"nyra@oracle\""
  missing=1
else
  echo "[OK] SSH public key found: ${SSH_KEY_PATH}"
fi

if [[ ! -f "${PRIVATE_KEY_PATH}" ]]; then
  echo "[ERROR] OCI API private key not found at ${PRIVATE_KEY_PATH}"
  echo "        Set PRIVATE_KEY_PATH or update private_key_path in terraform.tfvars"
  missing=1
else
  echo "[OK] OCI API private key found: ${PRIVATE_KEY_PATH}"
fi

if [[ ${missing} -ne 0 ]]; then
  printf '\nPrerequisite check failed. Resolve the errors above before apply/compose up.\n'
  exit 1
fi

printf '\nAll prerequisite checks passed.\n'
