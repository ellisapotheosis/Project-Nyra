unalias docker 2>/dev/null || true
unset -f docker 2>/dev/null || true

ZSH_THEME="powerlevel10k/powerlevel10k"

for _w in ranked_jump ws predict_jump fzf_open nav_mode sync_nvim_dir tree_pane_toggle; do
  if ! zle -l 2>/dev/null | command grep -qx "$_w"; then
    eval "$_w() { :; }"
    zle -N "$_w" "$_w"
  fi
done 2>/dev/null || true

plugins=(
  git
  sudo
  extract
  command-not-found
  colored-man-pages
  copypath
  copyfile
  web-search
  jsontools
  docker-compose
  zsh-autosuggestions
  zsh-history-substring-search
  zsh-completions
  fzf-tab
  forgit
  ssh
  ssh-agent
  fast-syntax-highlighting
  you-should-use
  zsh-nix-shell
  zsh-autopair
  zsh-bat
  git-open
  common-aliases
)

if [[ "${NYRA_USE_CLASSIC_ZSH_HIGHLIGHTING:-0}" == "1" ]]; then
  plugins+=(zsh-syntax-highlighting)
fi

ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE=15
ZSH_AUTOSUGGEST_USE_ASYNC=1
zstyle :omz:plugins:ssh-agent agent-forwarding on
zstyle :omz:plugins:ssh-agent identities id_ed25519 id_rsa
zstyle :omz:plugins:ssh-agent lifetime 8h

if [[ "${NYRA_SAFE_MODE:-0}" != "1" ]]; then
  source "$ZSH/oh-my-zsh.sh"
fi
