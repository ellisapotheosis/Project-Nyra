# ==============================================================================
# SSH AGENT INITIALIZATION
# ==============================================================================

# Vim-style keybindings
bindkey -e
export KEYTIMEOUT=1

# SSH Agent init with automatic startup if needed
_nyra_ssh_agent_init() {
  local _env="$HOME/.ssh/agent.env"
  [[ -f "$_env" ]] && source "$_env" >/dev/null
  local _state
  ssh-add -l &>/dev/null; _state=$?

  if [[ $_state -eq 2 ]]; then
    umask 077
    ssh-agent -s > "$_env"
    source "$_env" >/dev/null
    _state=1
  fi

  if [[ $_state -eq 1 ]]; then
    for _k in ~/.ssh/id_ed25519 ~/.ssh/id_rsa; do
      [[ -f "$_k" ]] && ssh-add "$_k" 2>/dev/null || true
    done
    unset _k
  fi
}

_nyra_ssh_agent_init
unset -f _nyra_ssh_agent_init
