# ==============================================================================
# PATH SETUP & ENVIRONMENT VARIABLES
# ==============================================================================

# Prepend user-local bins
export PATH="$HOME/.local/bin:$HOME/bin:$PATH"

# Language & Locale
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export LANGUAGE=en_US:en
export COLORTERM=truecolor

# Node Version Manager (FNM)
export FNM_PATH="$HOME/.local/share/fnm"
if [[ -d "$FNM_PATH" ]]; then
  export PATH="$FNM_PATH:$PATH"
  eval "$(fnm env)" 2>/dev/null || true
fi

# Bun Runtime
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
[[ -s "$HOME/.bun/_bun" ]] && source "$HOME/.bun/_bun"

# Rust & Cargo
export PATH="$HOME/.cargo/bin:$PATH"

# Package managers & tools
export PATH="/snap/bin:$PATH"
export PATH="$PATH:~/vcpkg"

# ROCm GPU support (Intel iGPU / AMD GPUs)
export PATH="$PATH:/opt/rocm/bin"
export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/opt/rocm/lib"
export HSA_OVERRIDE_GFX_VERSION=10.3.0  # Force Intel 680M to act as GFX1030

# Zoxide (fast directory jumping)
command -v zoxide >/dev/null 2>&1 && eval "$(zoxide init zsh)" || true

# Direnv (directory-local environment)
command -v direnv >/dev/null 2>&1 && eval "$(direnv hook zsh)" || true

# Project environment variables
export ORCH_HOST="100.64.0.10"
export ORCH_WIN_USER="edane"
export ORCH_WSL_USER="ellisapotheosis"
export DISTRO="Ubuntu-24.04"
export NO_TMUX=1

# Nyra Project paths
export NYRA_ROOT="${HOME}/repos/project-nyra"
export NYRA_INFRA="${NYRA_ROOT}/infra"

# Claude Code settings
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1

# Rust/Cargo Environment
. "$HOME/.cargo/env"
