# Project-Nyra bash aliases
# ~/.bash_aliases

# Navigation
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias ~='cd ~'
alias nyra='cd /opt/nyra'
alias repos='cd /opt/nyra/repos'
alias logs='cd /opt/nyra/logs'

# Enhanced ls
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias lt='ls -lhrt'
alias lS='ls -lhS'

# Better defaults
alias df='df -h'
alias du='du -h'
alias free='free -h'
alias mkdir='mkdir -p'
alias wget='wget -c'

# Git shortcuts
alias g='git'
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git pull'
alias gd='git diff'
alias gco='git checkout'
alias gb='git branch'
alias glog='git log --oneline --graph --decorate'
alias ghpr='gh pr create --web'

# Docker shortcuts
alias d='docker'
alias dc='docker compose'
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias dex='docker exec -it'
alias dlogs='docker logs -f'
alias dclean='docker system prune -af'
alias dstop='docker stop $(docker ps -q)'

# Docker Compose
alias dcup='docker compose up -d'
alias dcdown='docker compose down'
alias dcrestart='docker compose restart'
alias dclogs='docker compose logs -f'
alias dcps='docker compose ps'

# PostgreSQL
alias psql='psql -U postgres'
alias pgstart='sudo systemctl start postgresql'
alias pgstop='sudo systemctl stop postgresql'
alias pgstatus='sudo systemctl status postgresql'
alias pgrestart='sudo systemctl restart postgresql'

# Redis
alias redis='redis-cli'
alias redisstart='sudo systemctl start redis-server'
alias redisstop='sudo systemctl stop redis-server'
alias redisstatus='sudo systemctl status redis-server'

# Node/npm
alias ni='npm install'
alias nid='npm install --save-dev'
alias nr='npm run'
alias nrs='npm run start'
alias nrd='npm run dev'
alias nrb='npm run build'
alias nrt='npm run test'
alias nci='npm ci'
alias nuke='rm -rf node_modules package-lock.json && npm install'

# yarn
alias y='yarn'
alias ya='yarn add'
alias yad='yarn add --dev'
alias yr='yarn run'
alias yt='yarn test'
alias yb='yarn build'

# Python
alias py='python3'
alias pip='pip3'
alias venv='python3 -m venv'
alias activate='source venv/bin/activate'

# PM2
alias pm2list='pm2 list'
alias pm2logs='pm2 logs'
alias pm2restart='pm2 restart all'
alias pm2stop='pm2 stop all'
alias pm2delete='pm2 delete all'

# Project-Nyra services
alias nyra-start='/opt/nyra/scripts/services/start-all.sh'
alias nyra-stop='/opt/nyra/scripts/services/stop-all.sh'
alias nyra-status='/opt/nyra/scripts/services/status.sh'
alias nyra-logs='/opt/nyra/scripts/services/logs.sh'
alias nyra-restart='/opt/nyra/scripts/services/stop-all.sh && /opt/nyra/scripts/services/start-all.sh'

# Tailscale
alias ts='tailscale'
alias tsstatus='tailscale status'
alias tsup='sudo tailscale up'
alias tsdown='sudo tailscale down'

# System monitoring
alias ports='netstat -tulanp'
alias listening='lsof -i -P -n | grep LISTEN'
alias myip='curl -s ifconfig.me'
alias meminfo='free -h && cat /proc/meminfo | grep -i mem'
alias cpuinfo='lscpu && cat /proc/cpuinfo | grep "model name" | uniq'
alias diskusage='df -h && du -sh * 2>/dev/null | sort -h'

# Process management
alias psg='ps aux | grep -v grep | grep -i -e VSZ -e'
alias topcpu='ps aux | sort -nrk 3,3 | head -n 10'
alias topmem='ps aux | sort -nrk 4,4 | head -n 10'

# Infisical
alias infisical-login='infisical login'
alias infisical-run='infisical run --'
alias is='infisical secrets'

# Utilities
alias weather='curl wttr.in'
alias map='telnet mapscii.me'
alias matrix='cmatrix -abs'
alias pipes='pipes.sh'

# Safety aliases
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# Clipboard (if xclip installed)
alias pbcopy='xclip -selection clipboard'
alias pbpaste='xclip -selection clipboard -o'

# Quick editing
alias bashrc='vim ~/.bashrc && source ~/.bashrc'
alias aliases='vim ~/.bash_aliases && source ~/.bash_aliases'
alias hosts='sudo vim /etc/hosts'

# WSL specific
alias winhome='cd /mnt/c/Users/$USER'
alias open='explorer.exe'
alias code='/mnt/c/Program\ Files/Microsoft\ VS\ Code/bin/code'

# Claude Flow
alias cf-init='npx claude-flow@alpha swarm init'
alias cf-spawn='npx claude-flow@alpha agent spawn'
alias cf-task='npx claude-flow@alpha task orchestrate'
alias cf-status='npx claude-flow@alpha swarm status'
alias cf-memory='npx claude-flow@alpha memory'

# SPARC methodology
alias sparc-spec='npx claude-flow@alpha sparc run spec-pseudocode'
alias sparc-arch='npx claude-flow@alpha sparc run architect'
alias sparc-tdd='npx claude-flow@alpha sparc tdd'
alias sparc-integration='npx claude-flow@alpha sparc run integration'

# Quick functions
mkcd() { mkdir -p "$1" && cd "$1"; }
extract() {
    if [ -f "$1" ]; then
        case "$1" in
            *.tar.bz2)   tar xjf "$1"     ;;
            *.tar.gz)    tar xzf "$1"     ;;
            *.bz2)       bunzip2 "$1"     ;;
            *.rar)       unrar x "$1"     ;;
            *.gz)        gunzip "$1"      ;;
            *.tar)       tar xf "$1"      ;;
            *.tbz2)      tar xjf "$1"     ;;
            *.tgz)       tar xzf "$1"     ;;
            *.zip)       unzip "$1"       ;;
            *.Z)         uncompress "$1"  ;;
            *.7z)        7z x "$1"        ;;
            *)           echo "'$1' cannot be extracted via extract()" ;;
        esac
    else
        echo "'$1' is not a valid file"
    fi
}

# Docker cleanup
dcleanup() {
    docker rm $(docker ps -a -q)
    docker rmi $(docker images -q -f dangling=true)
    docker volume rm $(docker volume ls -q -f dangling=true)
}

# Find process on port
port() {
    lsof -i :"$1"
}

# Kill process on port
killport() {
    kill -9 $(lsof -t -i:"$1")
}

# Quick backup
backup() {
    cp "$1" "$1.backup-$(date +%Y%m%d-%H%M%S)"
}

# Git commit with conventional commit message
gcom() {
    local type="${1:-feat}"
    local message="${2:-update}"
    git commit -m "$type: $message"
}

# Create and checkout new git branch
gnb() {
    git checkout -b "$1"
    git push -u origin "$1"
}

# npm audit fix with safety
npm-fix() {
    npm audit fix --dry-run
    read -p "Apply fixes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm audit fix
    fi
}

# Show git branch in prompt (if not using zsh)
parse_git_branch() {
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}
