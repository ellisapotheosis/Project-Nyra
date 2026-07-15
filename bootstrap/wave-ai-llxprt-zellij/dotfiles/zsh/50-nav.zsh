# ==============================================================================
# NAVIGATION & KEYBINDINGS
# ==============================================================================

# ==============================================================================
# HISTORY NAVIGATION (History Substring Search Plugin)
# ==============================================================================
bindkey '^[[A' history-substring-search-up
bindkey '^[[B' history-substring-search-down

# ==============================================================================
# FZF-BASED FILE OPEN (Ctrl+P)
# ==============================================================================
fzf_open() {
  local file
  file=$(fzf --height 80% --reverse --preview 'bat --plain --style=numbers --color=always {} 2>/dev/null | head -300') || return 0
  [[ -n "$file" ]] && {
    if command -v nvim >/dev/null 2>&1; then
      nvim "$file"
    else
      "$EDITOR" "$file"
    fi
  }
}
zle -N fzf_open
bindkey '^P' fzf_open

# ==============================================================================
# SYNC NEOVIM LAST DIRECTORY (Ctrl+Y)
# ==============================================================================
sync_nvim_dir() {
  [[ -f ~/.nvim_last_dir ]] && cd "$(cat ~/.nvim_last_dir)"
  zle reset-prompt
}
zle -N sync_nvim_dir
bindkey '^Y' sync_nvim_dir

# ==============================================================================
# DIRECTORY NAVIGATION WIDGETS
# ==============================================================================

# Ctrl+Left: Go up one directory
cd_up_widget() {
  builtin cd ..
  zle reset-prompt
}
zle -N cd_up_widget
bindkey '^[[1;5D' cd_up_widget

# Ctrl+Right: Navigate to child directory (fzf)
cd_child_widget() {
  local d
  d=$(eza -d */ 2>/dev/null | fzf --height 40% --reverse) || return 0
  builtin cd "$d"
  zle reset-prompt
}
zle -N cd_child_widget
bindkey '^[[1;5C' cd_child_widget

# Ctrl+Up: Jump to git root
cd_git_root_widget() {
  local r
  r="$(git rev-parse --show-toplevel 2>/dev/null || true)"
  [[ -n "$r" ]] && builtin cd "$r"
  zle reset-prompt
}
zle -N cd_git_root_widget
bindkey '^[[1;5A' cd_git_root_widget

# Ctrl+Down: Deep directory navigation (all subdirs)
nav_mode() {
  local d
  d=$(eza -d **/*(/) 2>/dev/null | fzf --height 80% --reverse --preview 'eza --icons --group-directories-first --color=always {} | head -200') || return 0
  builtin cd "$d"
  zle reset-prompt
}
zle -N nav_mode
bindkey '^[[1;5B' nav_mode
