bindkey '^[[A' history-substring-search-up
bindkey '^[[B' history-substring-search-down

fzf_open() {
  local file
  file=$(fzf --height 80% --reverse --preview 'bat --plain --style=numbers --color=always {} 2>/dev/null | head -300') || return 0
  [[ -n "$file" ]] && nvim "$file"
}
zle -N fzf_open
bindkey '^P' fzf_open

sync_nvim_dir() {
  [[ -f ~/.nvim_last_dir ]] && cd "$(cat ~/.nvim_last_dir)"
  zle reset-prompt
}
zle -N sync_nvim_dir
bindkey '^Y' sync_nvim_dir

cd_up_widget() {
  builtin cd ..
  zle reset-prompt
}
cd_child_widget() {
  local d
  d=$(eza -d */ 2>/dev/null | fzf --height 40% --reverse) || return 0
  builtin cd "$d"
  zle reset-prompt
}
cd_git_root_widget() {
  local r
  r="$(git rev-parse --show-toplevel 2>/dev/null || true)"
  [[ -n "$r" ]] && builtin cd "$r"
  zle reset-prompt
}
nav_mode() {
  local d
  d=$(eza -d **/*(/) 2>/dev/null | fzf --height 80% --reverse --preview 'eza --icons --group-directories-first --color=always {} | head -200') || return 0
  builtin cd "$d"
  zle reset-prompt
}
zle -N cd_up_widget
zle -N cd_child_widget
zle -N cd_git_root_widget
zle -N nav_mode
bindkey '^[[1;5D' cd_up_widget
bindkey '^[[1;5C' cd_child_widget
bindkey '^[[1;5A' cd_git_root_widget
bindkey '^[[1;5B' nav_mode
