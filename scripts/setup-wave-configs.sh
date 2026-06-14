#!/usr/bin/env bash
set -Eeuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
wave_config_dir="${WAVE_CONFIG_DIR:-$HOME/.config/waveterm}"
history_dir="${NYRA_ZELLIJ_HISTORY_DIR:-$HOME/.nyra/zellij-history}"
llxprt_profile_dir="${LLXPRT_PROFILE_DIR:-$HOME/.llxprt/profiles}"
llxprt_user_dir="${LLXPRT_USER_DIR:-$HOME/.llxprt}"

template_dir="${repo_root}/infra/configs/waveterm"
profile_template_dir="${repo_root}/config/agents/llxprt-profiles"

json_check() {
  local file="$1"

  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' "$file" >/dev/null
}

install_json() {
  local src="$1"
  local dest="$2"

  json_check "$src"
  cp "$src" "$dest"
}

mkdir -p \
  "$wave_config_dir/termthemes" \
  "$wave_config_dir/presets" \
  "$history_dir" \
  "$llxprt_profile_dir" \
  "$llxprt_user_dir"

install_json "${template_dir}/settings.orchestrator.json" "${wave_config_dir}/settings.json"
install_json "${template_dir}/waveai-orchestrator.json" "${wave_config_dir}/waveai.json"
install_json "${template_dir}/keybindings.orchestrator.json" "${wave_config_dir}/keybindings.json"
install_json "${template_dir}/theme-orchestrator-cyberpunk.json" "${wave_config_dir}/termthemes/orchestrator-cyberpunk-neon.json"
install_json "${template_dir}/presets.orchestrator.json" "${wave_config_dir}/presets/presets.json"

for profile in "${profile_template_dir}"/*.json; do
  install_json "$profile" "${llxprt_profile_dir}/$(basename "$profile")"
done

install_json "${repo_root}/config/agents/llxprt-settings.project-nyra.json" "${llxprt_user_dir}/settings.project-nyra.bootstrap.json"

cat >"${llxprt_user_dir}/nyra-auth.todo" <<'EOF'
Run these once inside `scripts/run-llxprt-code.sh` or `llxprt`:

/auth codex enable
/auth anthropic enable
/auth gemini enable
/auth qwen enable
/key save kimi <kimi-api-key>
/key save openrouter <openrouter-api-key>
/key save nyra-nexus <nexus-api-key-or-local-placeholder>
/key save nyra-worker <worker-api-key-or-local-placeholder>

Optional multiple-account bucket pattern:

/auth codex login personal@example.com
/auth anthropic login claude-main@example.com
/auth gemini login gmail-main@example.com
EOF

printf 'WaveTerm config written to %s\n' "$wave_config_dir"
printf 'LLxprt profiles written to %s\n' "$llxprt_profile_dir"
printf 'LLxprt project settings template written to %s\n' "${llxprt_user_dir}/settings.project-nyra.bootstrap.json"
printf 'Zellij transcripts will append under %s\n' "$history_dir"
printf 'Auth checklist written to %s\n' "${llxprt_user_dir}/nyra-auth.todo"
