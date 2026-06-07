#!/usr/bin/env bash

nyra_require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    return 1
  fi
}

nyra_resolve_wrangler_cmd() {
  local app_dir="$1"

  if [[ -x "${app_dir}/node_modules/.bin/wrangler" ]]; then
    printf '%s\n' "${app_dir}/node_modules/.bin/wrangler"
    return 0
  fi

  if command -v wrangler >/dev/null 2>&1; then
    command -v wrangler
    return 0
  fi

  printf 'npx -y wrangler\n'
}

nyra_run_wrangler() {
  local app_dir="$1"
  shift

  if [[ -x "${app_dir}/node_modules/.bin/wrangler" ]]; then
    "${app_dir}/node_modules/.bin/wrangler" "$@"
    return 0
  fi

  if command -v wrangler >/dev/null 2>&1; then
    wrangler "$@"
    return 0
  fi

  npx -y wrangler "$@"
}

nyra_toml_value() {
  local file="$1"
  local key="$2"

  [[ -f "${file}" ]] || return 0
  sed -nE "s/^${key} = \"([^\"]*)\"$/\\1/p" "${file}" | head -n 1
}

nyra_toml_section_value() {
  local file="$1"
  local section="$2"
  local key="$3"

  [[ -f "${file}" ]] || return 0
  awk -v section="${section}" -v key="${key}" '
    $0 == "[" section "]" {
      in_section = 1
      next
    }
    in_section && /^\[/ {
      exit
    }
    in_section {
      prefix = key " = \""
      if (index($0, prefix) == 1) {
        value = substr($0, length(prefix) + 1)
        sub(/"$/, "", value)
        print value
        exit
      }
    }
  ' "${file}"
}

nyra_env_example_value() {
  local file="$1"
  local key="$2"

  [[ -f "${file}" ]] || return 0
  sed -nE "s/^${key}=\"?([^\"]*)\"?$/\\1/p" "${file}" | head -n 1
}

nyra_load_cloudflare_pages_env() {
  local app_dir="$1"
  local project_name="${2:-project-nyra}"
  local tmpdir=""
  local config_file="${app_dir}/wrangler.toml"
  local env_file="${app_dir}/.env.example"

  tmpdir="$(mktemp -d)"
  if (cd "${tmpdir}" && nyra_run_wrangler "${app_dir}" pages download config "${project_name}" --force >/dev/null 2>&1); then
    config_file="${tmpdir}/wrangler.toml"
  fi

  export NYRA_CF_PROJECT_NAME="${NYRA_CF_PROJECT_NAME:-${project_name}}"
  export NYRA_CF_ENVIRONMENT="${NYRA_CF_ENVIRONMENT:-production}"
  export NYRA_CF_COMPATIBILITY_DATE="${NYRA_CF_COMPATIBILITY_DATE:-$(nyra_toml_value "${config_file}" compatibility_date)}"
  export NYRA_CF_COMPATIBILITY_DATE="${NYRA_CF_COMPATIBILITY_DATE:-2026-03-06}"

  export NPM_CONFIG_IGNORE_SCRIPTS="${NPM_CONFIG_IGNORE_SCRIPTS:-$(nyra_toml_section_value "${config_file}" vars NPM_CONFIG_IGNORE_SCRIPTS)}"
  export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED:-$(nyra_toml_section_value "${config_file}" env.production.vars NEXT_TELEMETRY_DISABLED)}"
  export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED:-$(nyra_toml_section_value "${config_file}" vars NEXT_TELEMETRY_DISABLED)}"
  export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED:-$(nyra_env_example_value "${env_file}" NEXT_TELEMETRY_DISABLED)}"
  export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED:-1}"

  export NODE_VERSION="${NODE_VERSION:-$(nyra_toml_section_value "${config_file}" env.production.vars NODE_VERSION)}"
  export NODE_VERSION="${NODE_VERSION:-$(nyra_toml_section_value "${config_file}" vars NODE_VERSION)}"
  export NODE_VERSION="${NODE_VERSION:-$(nyra_env_example_value "${env_file}" NODE_VERSION)}"
  export NODE_VERSION="${NODE_VERSION:-20}"

  export NODE_ENV="${NODE_ENV:-$(nyra_toml_section_value "${config_file}" env.production.vars NODE_ENV)}"
  export NODE_ENV="${NODE_ENV:-production}"

  export NEXT_PUBLIC_SITE_NAME="${NEXT_PUBLIC_SITE_NAME:-$(nyra_toml_section_value "${config_file}" env.production.vars NEXT_PUBLIC_SITE_NAME)}"
  export NEXT_PUBLIC_SITE_NAME="${NEXT_PUBLIC_SITE_NAME:-$(nyra_env_example_value "${env_file}" NEXT_PUBLIC_SITE_NAME)}"
  export NEXT_PUBLIC_SITE_NAME="${NEXT_PUBLIC_SITE_NAME:-RateHunter}"

  export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-$(nyra_toml_section_value "${config_file}" env.production.vars NEXT_PUBLIC_SITE_URL)}"
  export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-$(nyra_env_example_value "${env_file}" NEXT_PUBLIC_SITE_URL)}"
  export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-project-nyra.pages.dev}"

  export CLOUDFLARE_COMPATIBILITY_DATE="${CLOUDFLARE_COMPATIBILITY_DATE:-${NYRA_CF_COMPATIBILITY_DATE}}"
  export CF_PAGES_COMPATIBILITY_DATE="${CF_PAGES_COMPATIBILITY_DATE:-${NYRA_CF_COMPATIBILITY_DATE}}"
}

nyra_resolve_sourcegit_path() {
  if [[ -n "${SOURCEGIT_CMD:-}" ]]; then
    printf '%s\n' "${SOURCEGIT_CMD}"
    return 0
  fi

  if command -v sourcegit >/dev/null 2>&1; then
    command -v sourcegit
    return 0
  fi

  printf '/usr/bin/sourcegit\n'
}

nyra_export_llxprt_env() {
  local app_dir="$1"
  local project_name="${2:-project-nyra}"
  local sourcegit_path

  nyra_load_cloudflare_pages_env "${app_dir}" "${project_name}"
  sourcegit_path="$(nyra_resolve_sourcegit_path)"

  export SOURCEGIT_CMD="${SOURCEGIT_CMD:-${sourcegit_path}}"
  export LLXPRT_SOURCEGIT="${LLXPRT_SOURCEGIT:-${SOURCEGIT_CMD}}"

  export NYRA_NEXUS_BASE_URL="${NYRA_NEXUS_BASE_URL:-https://nexus.trex-fiordland.ts.net/v1}"
  export OPENAI_BASE_URL="${OPENAI_BASE_URL:-${NYRA_NEXUS_BASE_URL}}"
  export OPENAI_API_BASE="${OPENAI_API_BASE:-${NYRA_NEXUS_BASE_URL}}"
  export LLM_BASE_URL="${LLM_BASE_URL:-${NYRA_NEXUS_BASE_URL}}"
  export OPENAI_API_KEY="${OPENAI_API_KEY:-local-key}"

  export NYRA_LOCAL_CLUSTER_MODEL="${NYRA_LOCAL_CLUSTER_MODEL:-local-cluster}"
  export NYRA_REMOTE_OPENAI_MODEL="${NYRA_REMOTE_OPENAI_MODEL:-remote/openai-codex}"
  export NYRA_REMOTE_GEMINI_MODEL="${NYRA_REMOTE_GEMINI_MODEL:-remote/gemini-2.5-pro}"
}

nyra_run_llxprt() {
  local package_name="${NYRA_LLXPRT_PACKAGE:-@vybestack/llxprt-code}"
  local prefix_dir="${NYRA_LLXPRT_NPM_PREFIX:-${HOME}/.cache/nyra-llxprt-code}"
  local provider="${NYRA_LLXPRT_PROVIDER:-openai}"
  local model="${NYRA_LLXPRT_MODEL:-${NYRA_LOCAL_CLUSTER_MODEL:-local-cluster}}"
  local uses_profile=0
  local arg

  mkdir -p "${prefix_dir}"

  for arg in "$@"; do
    case "${arg}" in
      --profile-load|--profile)
        uses_profile=1
        break
        ;;
    esac
  done

  if [[ "${uses_profile}" == "1" ]]; then
    npm exec --yes --prefix "${prefix_dir}" --package "${package_name}" -- llxprt "$@"
    return
  fi

  npm exec --yes --prefix "${prefix_dir}" --package "${package_name}" -- llxprt \
    --provider "${provider}" \
    --baseurl "${NYRA_NEXUS_BASE_URL}" \
    --model "${model}" \
    "$@"
}
