# ~/.bashrc: executed by bash(1) for non-login shells.
# Project-Nyra development environment configuration

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# History configuration
HISTCONTROL=ignoreboth
HISTSIZE=10000
HISTFILESIZE=20000
shopt -s histappend
shopt -s checkwinsize

# Prompt
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

case "$TERM" in
    xterm-color|*-256color) color_prompt=yes;;
esac

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@orchestrator-mini\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@orchestrator-mini:\w\$ '
fi
unset color_prompt

# Enable color support
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# Colored GCC warnings and errors
export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'

# Aliases
if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# Enable programmable completion
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi

# Project-Nyra Environment Variables
export NYRA_HOME="/opt/nyra"
export NYRA_REPOS="$NYRA_HOME/repos"
export NYRA_DATA="$NYRA_HOME/data"
export NYRA_LOGS="$NYRA_HOME/logs"
export NYRA_BACKUPS="$NYRA_HOME/backups"

# Development paths
export PATH="$NYRA_REPOS/scripts:$PATH"

# Node.js (nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Python (pyenv)
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
if command -v pyenv 1>/dev/null 2>&1; then
  eval "$(pyenv init -)"
fi

# Docker
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# PostgreSQL
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGDATABASE=postgres

# Redis
export REDIS_HOST=localhost
export REDIS_PORT=6379

# Editor
export EDITOR=vim
export VISUAL=vim

# Less
export LESS='-R -F -X'

# fzf configuration
[ -f ~/.fzf.bash ] && source ~/.fzf.bash
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border'

# Auto-start services on WSL startup (optional)
# Uncomment if you want services to start automatically
# if ! pgrep -x "postgres" > /dev/null; then
#     sudo systemctl start postgresql
# fi
# if ! pgrep -x "redis-server" > /dev/null; then
#     sudo systemctl start redis-server
# fi

# Claude Flow shortcuts
alias cf='npx claude-flow@alpha'
alias cfs='npx claude-flow@alpha swarm'
alias cfm='npx claude-flow@alpha memory'
alias cfsparc='npx claude-flow@alpha sparc'

# Welcome message
if [ -f ~/.bash_welcome ]; then
    cat ~/.bash_welcome
fi

# SSH agent
if [ -z "$SSH_AUTH_SOCK" ]; then
   eval `ssh-agent -s` > /dev/null 2>&1
fi
