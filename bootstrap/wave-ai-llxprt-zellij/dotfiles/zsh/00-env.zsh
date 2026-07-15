# ==============================================================================
# CORE ENVIRONMENT SETUP
# ==============================================================================
# Basic initialization. SSH setup moved to 01-ssh.zsh, paths to 10-paths.zsh

# Socat tunnel for VSCode Remote debugging (Windows host)
WIN_IP=$(ip route show | grep -i default | awk '{ print $3}' 2>/dev/null)
if [[ -n "$WIN_IP" ]] && ! pgrep -f "socat TCP-LISTEN:9222" > /dev/null 2>&1; then
  socat TCP-LISTEN:9222,fork,reuseaddr TCP:$WIN_IP:9222 &> /dev/null &
fi

# Color scheme variables for terminal theming (ANSI 256-color)
# Using custom Windows Terminal color palette
typeset -g X_TURQUOISE='44'       # Turquoise (ANSI 256)
typeset -g X_SEAFOAM='42'         # Seafoam (ANSI 256)
typeset -g X_VIOLET='57'          # Purple (ANSI 256)
typeset -g X_DARK_BLUE='27'       # Blue (ANSI 256)
typeset -g X_BG='0'               # Black background

# FZF color scheme (ANSI colors on black)
export FZF_DEFAULT_OPTS="--height=70% --reverse --border --color=fg:${X_TURQUOISE},bg:${X_BG},hl:${X_NEON_PINK},fg+:${X_SEAFOAM},bg+:${X_BG},hl+:${X_NEON_PINK},info:${X_VIOLET},prompt:${X_DARK_BLUE},pointer:${X_SEAFOAM},marker:${X_NEON_PINK},spinner:${X_VIOLET},header:${X_TURQUOISE}"

# Custom file listing colors (neon on black)
unset LS_COLORS
export LS_COLORS="di=38;2;0;217;255:fi=38;2;255;20;147:ln=38;2;32;245;160:ex=38;2;123;104;238"
export EZA_COLORS="di=38;2;0;217;255:fi=38;2;255;20;147:ln=38;2;32;245;160:ex=38;2;123;104;238"

