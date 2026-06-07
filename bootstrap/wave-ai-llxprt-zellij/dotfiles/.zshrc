# ==============================================================================
# 🌌 XULBUX .zshrc — MODULAR ZSH CONFIGURATION
# ==============================================================================
# This is the entry point for all zsh configuration.
# All actual configuration is sourced from ~/.zsh/ modules.
# Modular structure allows easy enabling/disabling of features.

# Guard: prevent running if not interactive
[[ $- != *i* ]] && return

# p10k instant prompt: preserve it at the very start
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# ==============================================================================
# CORE SETUP
# ==============================================================================

export NYRA_SAFE_MODE="${NYRA_SAFE_MODE:-0}"
export ZSH="$HOME/.oh-my-zsh"

# ==============================================================================
# SOURCE MODULAR CONFIGURATION FILES
# ==============================================================================
# Files are sourced in numerical order for predictable initialization
# Each file should be idempotent and self-contained

for zsh_module in \
  "$HOME/.zsh/00-env.zsh" \
  "$HOME/.zsh/01-ssh.zsh" \
  "$HOME/.zsh/10-paths.zsh" \
  "$HOME/.zsh/20-plugins.zsh" \
  "$HOME/.zsh/30-p10k.zsh" \
  "$HOME/.zsh/40-aliases.zsh" \
  "$HOME/.zsh/50-nav.zsh" \
  "$HOME/.zsh/60-cluster.zsh" \
  "$HOME/.zsh/70-telemetry.zsh" \
  "$HOME/.zsh/80-doctor.zsh" \
  "$HOME/.zsh/85-wave-llxprt.zsh" \
  "$HOME/.zsh/99-secrets.zsh"
do
  [[ -r "$zsh_module" ]] && source "$zsh_module" || true
done
unset zsh_module

# ==============================================================================
# CONDITIONAL SYMLINKED MODULES
# ==============================================================================
# Optional symlinked pages from ~/repos/project-nyra/bootstrap/dotfiles/
# Source only if symlinked in (useful for project-specific overrides)

for page in nvim tmux direnv git bun nvm cargo python; do
  [[ -L "$HOME/.${page}.zsh" ]] && source "$HOME/.${page}.zsh" || true
done
unset page

# ==============================================================================
# POST-INITIALIZATION HOOKS
# ==============================================================================

# Ensure p10k is loaded at the end
if [[ "${NYRA_SAFE_MODE:-0}" != "1" ]]; then
  [[ -r ~/.p10k.zsh ]] && source ~/.p10k.zsh
  [[ -r ~/.p10k.nyra.zsh ]] && source ~/.p10k.nyra.zsh
fi

# ==============================================================================
# END OF .zshrc
# ==============================================================================

# NYRA Powerlevel10k variant switcher
source ~/repos/nyra-p10k-god-tier-pack/shell/nyra-p10k-aliases.zsh
export PATH="$HOME/.local/bin:$PATH"

# Composio CLI
export COMPOSIO_INSTALL_DIR="/home/ellisapotheosis/.composio"
export PATH="$COMPOSIO_INSTALL_DIR:$PATH"


# >>> codex local npm global bin (managed by Codex) >>>
# Prefer WSL-native Codex/omx/mempalace binaries over Windows npm shims.
case ":$PATH:" in
  *":$HOME/.npm-global/bin:"*) ;;
  *) export PATH="$HOME/.npm-global/bin:$PATH" ;;
esac
case ":$PATH:" in
  *":$HOME/.local/bin:"*) ;;
  *) export PATH="$HOME/.local/bin:$PATH" ;;
esac
# <<< codex local npm global bin (managed by Codex) <<<
