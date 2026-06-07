# ==============================================================================
# OH-MY-ZSH PLUGINS & CONFIGURATION
# ==============================================================================

# Disable Docker function if aliased (avoid conflicts)
unalias docker 2>/dev/null || true
unset -f docker 2>/dev/null || true

# Set theme to Powerlevel10k
export ZSH_THEME="powerlevel10k/powerlevel10k"

# Register custom keybind functions (these are initialized in 50-nav.zsh)
for _zle_func in ranked_jump ws predict_jump fzf_open nav_mode sync_nvim_dir tree_pane_toggle; do
  if ! zle -l 2>/dev/null | command grep -qx "$_zle_func"; then
    eval "$_zle_func() { :; }"
    zle -N "$_zle_func" "$_zle_func"
  fi
done 2>/dev/null || true
unset _zle_func

# ==============================================================================
# PLUGIN LIST
# ==============================================================================
plugins=(
  # Core git integration
  git
  git-open
  forgit

  # Utilities & file handling
  sudo
  extract
  copypath
  copyfile
  command-not-found
  colored-man-pages
  common-aliases

  # Completion & search
  zsh-completions
  zsh-autosuggestions
  zsh-history-substring-search
  fzf-tab
  you-should-use

  # Development tools
  docker-compose
  jsontools
  web-search
  zsh-bat

  # SSH & auth
  ssh
  ssh-agent

  # Optional: Syntax highlighting (can be swapped for fast-syntax-highlighting)
  fast-syntax-highlighting
  zsh-autopair
  zsh-nix-shell
)

# Add classic syntax highlighting if enabled (slower but more compatible)
if [[ "${NYRA_USE_CLASSIC_ZSH_HIGHLIGHTING:-0}" == "1" ]]; then
  plugins+=(zsh-syntax-highlighting)
fi

# ==============================================================================
# PLUGIN CONFIGURATION
# ==============================================================================

# Autosuggestions: async mode with smaller buffer
export ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE=15
export ZSH_AUTOSUGGEST_USE_ASYNC=1

# SSH Agent: forward agent to remote hosts, track identities, 8h lifetime
zstyle :omz:plugins:ssh-agent agent-forwarding on
zstyle :omz:plugins:ssh-agent identities id_ed25519 id_rsa
zstyle :omz:plugins:ssh-agent lifetime 8h

# Load oh-my-zsh (skip in safe mode for testing)
if [[ "${NYRA_SAFE_MODE:-0}" != "1" ]]; then
  source "$ZSH/oh-my-zsh.sh"
fi
