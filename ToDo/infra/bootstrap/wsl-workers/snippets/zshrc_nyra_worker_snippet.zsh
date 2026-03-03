# Nyra Worker Zsh Snippet (NO theme)
# Source from ~/.zshrc:
#   source ~/nyra-workers/snippets/zshrc_nyra_worker_snippet.zsh

export CLAUDE_CODE_AUTO_APPROVE=true
export CLAUDE_CODE_ALLOW_ALL_TOOLS=true
export GEMINI_CLI_AUTONOMY=100

command -v fnm >/dev/null 2>&1 && eval "$(fnm env)"
command -v zoxide >/dev/null 2>&1 && eval "$(zoxide init zsh)"
[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"

alias ls='eza --icons --group-directories-first --git 2>/dev/null || ls --color=auto'
alias ll='eza -lah --icons --group-directories-first --git 2>/dev/null || ls -lah'
alias tree='eza --tree --level=2 --icons 2>/dev/null || tree -L 2'
alias cat='batcat 2>/dev/null || bat 2>/dev/null || cat'
alias grep='rg 2>/dev/null || grep'
alias find='fd 2>/dev/null || fdfind 2>/dev/null || find'
alias nyra='cd ~/repos/project-nyra 2>/dev/null || cd ~/repos || true'
alias cx='chmod +x'
alias c755='chmod 755'

alias g='git'
alias gs='git status'
alias gp='git push'
alias gpl='git pull'
alias lz='lazygit'
alias lzd='lazydocker'
alias d='docker'
alias dcp='docker compose'

alias infis='infisical run --projectId="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}" --env="${INFISICAL_ENV:-dev}" --path="${INFISICAL_PATH:-/shared}" -- '

alias warp='warp.exe "$(wslpath -w .)"'
alias agy='antigravity.exe "$(wslpath -w .)"'
alias antigravity='antigravity.exe "$(wslpath -w .)"'
alias subl='subl.exe "$(wslpath -w .)"'

function fzf_cd_visual() {
  local dir
  if command -v fd >/dev/null 2>&1; then
    dir=$(fd --type d --hidden --exclude .git 2>/dev/null | fzf --height 60% --layout=reverse --border \
      --preview 'eza --tree --level=2 --icons --color=always {} 2>/dev/null || ls -la {}' --preview-window=right:60%)
  else
    dir=$(find . -type d -not -path '*/\.git/*' 2>/dev/null | fzf --height 60% --layout=reverse --border \
      --preview 'eza --tree --level=2 --icons --color=always {} 2>/dev/null || ls -la {}' --preview-window=right:60%)
  fi
  [[ -n "$dir" ]] && cd "$dir" && zle reset-prompt
}
zle -N fzf_cd_visual
bindkey '^[[1;5C' fzf_cd_visual
function quick_cd_up() { cd ..; zle reset-prompt; }
zle -N quick_cd_up
bindkey '^[[1;5D' quick_cd_up
function preview_here() { echo; eza --tree --level=2 --icons 2>/dev/null || ls -la; zle reset-prompt; }
zle -N preview_here
bindkey '^[[1;5A' preview_here

# Run claude-flow under Infisical
alias cf='infis claude-flow'
