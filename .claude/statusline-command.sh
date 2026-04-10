#!/bin/bash
# Project Nyra - Claude Code Statusline
# Based on PS1: \[\033[32m\]\u@\h \[\033[35m\]$MSYSTEM \[\033[33m\]\w\[\033[36m\]`__git_ps1`\[\033[0m\]

# Read JSON input from stdin
INPUT=$(cat)
MODEL=$(echo "$INPUT" | jq -r '.model.display_name // "Sonnet 4.5"')
CWD=$(echo "$INPUT" | jq -r '.workspace.current_dir // .cwd')

# Colors matching PS1
GREEN="\033[32m"
MAGENTA="\033[35m"
YELLOW="\033[33m"
CYAN="\033[36m"
BLUE="\033[34m"
RESET="\033[0m"
BOLD="\033[1m"

# Get relative directory (similar to \w in PS1)
get_directory() {
    local dir="$CWD"
    local project_root="/c/Dev/Projects/Repos/Project-Nyra"

    if [[ "$dir" == "$project_root"* ]]; then
        echo "~nyra${dir#$project_root}"
    else
        echo "${dir/#$HOME/~}"
    fi
}

# Get git branch with status (similar to __git_ps1)
get_git_info() {
    if [ -d "$CWD/.git" ]; then
        cd "$CWD" 2>/dev/null
        local branch=$(git branch --show-current 2>/dev/null || echo "detached")
        local status=""

        # Check for changes
        if ! git diff-index --quiet HEAD -- 2>/dev/null; then
            status="*"  # Modified
        fi

        # Check for staged
        if ! git diff-index --cached --quiet HEAD -- 2>/dev/null; then
            status="${status}+"  # Staged
        fi

        # Check for untracked
        if [ -n "$(git ls-files --others --exclude-standard 2>/dev/null)" ]; then
            status="${status}?"  # Untracked
        fi

        echo " (${branch}${status})"
    fi
}

# Get Claude Flow status
get_claude_flow_status() {
    if command -v archon-os &> /dev/null 2>&1; then
        local agents=$(archon-os agent list 2>/dev/null | grep -c "active" || echo "0")
        if [ "$agents" -gt 0 ]; then
            echo " 🐝${agents}"
        fi
    fi
}

# Get cluster indicator
get_cluster_status() {
    if [ -f ~/.archon-os/distributed/cluster-config.json ]; then
        echo " 🖧4PC"
    fi
}

# Build statusline matching PS1 format:
# GREEN: user@host
# MAGENTA: $MSYSTEM
# BLUE: Model
# CYAN: Cluster/Flow status
# YELLOW: directory
# CYAN: git info

USER_HOST="${GREEN}${USER}@${HOSTNAME}${RESET}"
SYSTEM="${MAGENTA}${MSYSTEM:-MINGW64}${RESET}"
MODEL_INFO="${BLUE}${MODEL}${RESET}"
CLUSTER="${CYAN}$(get_cluster_status)$(get_claude_flow_status)${RESET}"
DIR="${YELLOW}$(get_directory)${RESET}"
GIT="${CYAN}$(get_git_info)${RESET}"

# Output: user@host MSYSTEM Model [Cluster] directory (git-branch)
printf "${USER_HOST} ${SYSTEM} ${MODEL_INFO}${CLUSTER} ${DIR}${GIT}"
