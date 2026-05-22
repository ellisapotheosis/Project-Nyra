#!/usr/bin/env bash
set -euo pipefail

pkg_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
repo_root="$(cd "${pkg_dir}/../.." && pwd)"
profile_dir="${1:-${repo_root}/config/agents/llxprt-profiles}"
load_check="${NYRA_PROFILE_MATRIX_LOAD:-0}"

if [[ "${1:-}" == "--load" ]]; then
  load_check="1"
  profile_dir="${2:-${repo_root}/config/agents/llxprt-profiles}"
fi

if [[ ! -d "$profile_dir" ]]; then
  printf 'missing profile directory: %s\n' "$profile_dir" >&2
  exit 1
fi

printf '| Profile | Type | Provider | Model | Auth | Purpose | Load |\n'
printf '| --- | --- | --- | --- | --- | --- | --- |\n'

node - "$profile_dir" <<'NODE' | while IFS=$'\t' read -r name type provider model auth purpose; do
const fs = require("fs");
const path = require("path");
const dir = process.argv[2];
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const full = path.join(dir, file);
  const json = JSON.parse(fs.readFileSync(full, "utf8"));
  const name = path.basename(file, ".json");
  const type = json.type || (json.backends ? "loadbalancer" : "provider");
  const provider = json.provider || json.loadBalancer?.provider || json.backendProvider || "";
  const model = json.model || json.loadBalancer?.model || "";
  const auth = json.auth || json.authType || json.authentication || json.oauthProvider || (json.oauth ? "oauth" : "");
  const purpose = json.description || json.purpose || json.name || "";
  console.log([name, type, provider, model, auth, purpose].map((v) => String(v || "-").replace(/\|/g, "/")).join("\t"));
}
NODE
  load_result="skipped"
  if [[ "$load_check" == "1" ]]; then
    if timeout 20s "${repo_root}/scripts/run-llxprt-code.sh" --profile-load "$name" --help >/dev/null 2>&1; then
      load_result="ok"
    else
      load_result="failed"
    fi
  fi
  printf '| `%s` | %s | %s | %s | %s | %s | %s |\n' "$name" "$type" "$provider" "$model" "$auth" "$purpose" "$load_result"
done
