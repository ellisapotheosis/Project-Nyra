# ==============================================================================
# POWERLEVEL10K THEME CONFIGURATION
# ==============================================================================
# Note: Color variables are already defined in 00-env.zsh

# Syntax highlighting styles (neon text on black)
typeset -g ZSH_HIGHLIGHT_STYLES=(
  'default:fg='${X_TURQUOISE}
  'command:fg='${X_SEAFOAM}
  'builtin:fg='${X_SEAFOAM}
  'function:fg='${X_VIOLET}
  'alias:fg='${X_TURQUOISE}
  'reserved-word:fg='${X_DARK_BLUE}
  'string:fg='${X_NEON_PINK}
  'unknown-token:fg='${X_NEON_PINK}
  'path:fg='${X_TURQUOISE}
  'comment:fg='${X_VIOLET}
)

# Source powerlevel10k configuration files (in order of precedence)
[[ -r ~/.p10k.zsh ]] && source ~/.p10k.zsh
[[ -r ~/.p10k.nyra.zsh ]] && source ~/.p10k.nyra.zsh
