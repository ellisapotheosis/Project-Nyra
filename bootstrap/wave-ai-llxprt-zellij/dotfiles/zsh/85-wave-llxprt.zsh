# ==============================================================================
# Project Nyra Wave AI / Zellij / LLxprt helpers
# ==============================================================================
# Non-secret operator shortcuts for the WaveTerm-first Nyra agent cockpit.

export NYRA_REPO="${NYRA_REPO:-$HOME/repos/project-nyra}"
export NYRA_WAVE_BOOTSTRAP_DIR="${NYRA_WAVE_BOOTSTRAP_DIR:-$NYRA_REPO/bootstrap/wave-ai-llxprt-zellij}"
export WAVE_CONFIG_DIR="${WAVE_CONFIG_DIR:-$HOME/.config/waveterm}"
export LLXPRT_USER_DIR="${LLXPRT_USER_DIR:-$HOME/.llxprt}"
export LLXPRT_PROFILE_DIR="${LLXPRT_PROFILE_DIR:-$LLXPRT_USER_DIR/profiles}"
export NYRA_ZELLIJ_HISTORY_DIR="${NYRA_ZELLIJ_HISTORY_DIR:-$HOME/.nyra/zellij-history}"
export NYRA_LLXPRT_PACKAGE="${NYRA_LLXPRT_PACKAGE:-@vybestack/llxprt-code}"
export NYRA_LLXPRT_NPM_PREFIX="${NYRA_LLXPRT_NPM_PREFIX:-$HOME/.cache/nyra-llxprt-code}"
export NYRA_LLXPRT_JEFE_DIR="${NYRA_LLXPRT_JEFE_DIR:-$NYRA_REPO/external/llxprt-jefe}"

nyra_repo() {
  cd "$NYRA_REPO"
}

nyra_wave_bootstrap() {
  (cd "$NYRA_REPO" && bash scripts/setup-wave-llxprt-bootstrap.sh "$@")
}

nyra_wave_install() {
  (cd "$NYRA_REPO" && bash scripts/setup-wave-configs.sh "$@")
}

nyra_wave() {
  (cd "$NYRA_REPO" && bash scripts/nyra-wave-zellij.sh "$@")
}

nyra_wave_3060() {
  (cd "$NYRA_REPO" && NYRA_INCLUDE_3060=1 bash scripts/nyra-wave-zellij.sh "$@")
}

nyra_llxprt() {
  (cd "$NYRA_REPO" && bash scripts/run-llxprt-code.sh "$@")
}

nyra_llxprt_ha() {
  nyra_llxprt --profile-load nyra-subscription-ha "$@"
}

nyra_llxprt_spread() {
  nyra_llxprt --profile-load nyra-subscription-spread "$@"
}

nyra_llxprt_triad() {
  nyra_llxprt --profile-load nyra-cli-triad-ha "$@"
}

nyra_llxprt_openrouter() {
  nyra_llxprt --profile-load nyra-openrouter-free "$@"
}

nyra_llxprt_codex() {
  nyra_llxprt --profile-load nyra-codex-oauth "$@"
}

nyra_llxprt_gemini() {
  nyra_llxprt --profile-load nyra-gemini-oauth "$@"
}

nyra_llxprt_claude() {
  nyra_llxprt --profile-load nyra-claude-oauth "$@"
}

nyra_jefe() {
  (cd "$NYRA_REPO" && bash scripts/run-llxprt-jefe.sh "$@")
}

nyra_wave_health() {
  (cd "$NYRA_REPO" && {
    bash -n scripts/setup-wave-configs.sh scripts/setup-wave-llxprt-bootstrap.sh scripts/llxprt-common.sh scripts/run-llxprt-code.sh scripts/run-llxprt-jefe.sh
    node -e 'for (const f of process.argv.slice(1)) JSON.parse(require("fs").readFileSync(f, "utf8"))' \
      config/agents/llxprt-settings.project-nyra.json \
      config/agents/llxprt-profiles.json \
      config/agents/llxprt-profiles/*.json \
      infra/configs/waveterm/*.json
    zellij setup --check >/dev/null 2>&1 || true
  })
}

nyra_wave_control() {
  (cd "$NYRA_REPO" && bash bootstrap/wave-ai-llxprt-zellij/bin/nyra-wave-control.sh "$@")
}

alias nyra-wave='nyra_wave'
alias nyra-wave3060='nyra_wave_3060'
alias nyra-wave-install='nyra_wave_install'
alias nyra-wave-bootstrap='nyra_wave_bootstrap'
alias nyra-wave-health='nyra_wave_health'
alias nyra-wave-control='nyra_wave_control'
alias nyra-wave-doctor='nyra_wave_control doctor'
alias nyra-wave-snapshot='nyra_wave_control snapshot'
alias nyra-wave-blackbox='nyra_wave_control blackbox'
alias nyra-wave-profiles='nyra_wave_control profiles'
alias llxprt-ha='nyra_llxprt_ha'
alias llxprt-spread='nyra_llxprt_spread'
alias llxprt-triad='nyra_llxprt_triad'
alias llxprt-openrouter='nyra_llxprt_openrouter'
alias llxprt-codex='nyra_llxprt_codex'
alias llxprt-gemini='nyra_llxprt_gemini'
alias llxprt-claude='nyra_llxprt_claude'
alias jefe='nyra_jefe'
