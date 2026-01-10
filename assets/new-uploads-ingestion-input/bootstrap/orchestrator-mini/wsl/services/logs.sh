#!/bin/bash
set -euo pipefail

# View aggregated logs from all Project-Nyra services

NYRA_HOME="/opt/nyra"
LOG_DIR="$NYRA_HOME/logs"

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

show_help() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS] [SERVICE]

View logs from Project-Nyra services

OPTIONS:
    -f, --follow        Follow log output (like tail -f)
    -n, --lines NUM     Show last NUM lines (default: 50)
    -s, --service NAME  Show logs for specific service
    -a, --all           Show all logs (default)
    -h, --help          Show this help message

SERVICES:
    postgres    PostgreSQL database logs
    redis       Redis cache logs
    nginx       Nginx web server logs
    docker      Docker daemon logs
    gitea       Gitea service logs
    app         Main application logs
    pm2         PM2 process manager logs
    system      System logs (syslog)

EXAMPLES:
    $(basename "$0") -f              # Follow all logs
    $(basename "$0") -s postgres     # Show PostgreSQL logs
    $(basename "$0") -f -n 100 app   # Follow last 100 lines of app logs
    $(basename "$0") -a -n 20        # Show last 20 lines from all logs

EOF
}

# Default options
FOLLOW=0
LINES=50
SERVICE="all"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=1
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -a|--all)
            SERVICE="all"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            SERVICE="$1"
            shift
            ;;
    esac
done

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to show logs with colors
show_log() {
    local service=$1
    local logfile=$2
    local color=$3

    if [[ ! -f "$logfile" ]] && [[ ! "$logfile" =~ ^journal: ]]; then
        return
    fi

    echo -e "${color}========== $service ==========${NC}"

    if [[ "$logfile" =~ ^journal: ]]; then
        # Systemd journal logs
        local unit="${logfile#journal:}"
        if [[ $FOLLOW -eq 1 ]]; then
            sudo journalctl -u "$unit" -n "$LINES" -f
        else
            sudo journalctl -u "$unit" -n "$LINES" --no-pager
        fi
    elif [[ $FOLLOW -eq 1 ]]; then
        tail -n "$LINES" -f "$logfile"
    else
        tail -n "$LINES" "$logfile"
    fi

    echo ""
}

# Service-specific log locations
case "$SERVICE" in
    postgres|postgresql)
        show_log "PostgreSQL" "journal:postgresql" "$BLUE"
        ;;
    redis)
        show_log "Redis" "journal:redis-server" "$RED"
        ;;
    nginx)
        show_log "Nginx Access" "/var/log/nginx/access.log" "$GREEN"
        show_log "Nginx Error" "/var/log/nginx/error.log" "$RED"
        ;;
    docker)
        show_log "Docker" "journal:docker" "$CYAN"
        ;;
    gitea)
        GITEA_LOG="$NYRA_HOME/gitea/data/gitea/log/gitea.log"
        if [[ -f "$GITEA_LOG" ]]; then
            show_log "Gitea" "$GITEA_LOG" "$YELLOW"
        else
            echo -e "${YELLOW}Gitea logs not found${NC}"
        fi
        ;;
    app|application)
        show_log "Application Startup" "$LOG_DIR/app-startup.log" "$BLUE"
        # Check for Docker Compose logs
        MAIN_APP="$NYRA_HOME/repos/project-nyra"
        if [[ -f "$MAIN_APP/docker-compose.yml" ]]; then
            echo -e "${BLUE}========== Docker Compose Logs ==========${NC}"
            cd "$MAIN_APP"
            if [[ $FOLLOW -eq 1 ]]; then
                docker compose logs -f --tail="$LINES"
            else
                docker compose logs --tail="$LINES"
            fi
        fi
        ;;
    pm2)
        if command -v pm2 >/dev/null 2>&1; then
            echo -e "${GREEN}========== PM2 Logs ==========${NC}"
            pm2 logs --lines "$LINES"
        else
            echo -e "${YELLOW}PM2 not installed${NC}"
        fi
        ;;
    system|syslog)
        show_log "System Log" "journal:syslog" "$CYAN"
        ;;
    all|*)
        # Show all logs
        echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║  Project-Nyra Aggregated Logs        ║${NC}"
        echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
        echo ""

        # PostgreSQL
        if systemctl is-active --quiet postgresql 2>/dev/null; then
            show_log "PostgreSQL" "journal:postgresql" "$BLUE"
        fi

        # Redis
        if systemctl is-active --quiet redis-server 2>/dev/null; then
            show_log "Redis" "journal:redis-server" "$RED"
        fi

        # Nginx
        if systemctl is-active --quiet nginx 2>/dev/null; then
            show_log "Nginx Error" "/var/log/nginx/error.log" "$RED"
        fi

        # Application logs
        if [[ -f "$LOG_DIR/app-startup.log" ]]; then
            show_log "Application" "$LOG_DIR/app-startup.log" "$GREEN"
        fi

        # Gitea
        GITEA_LOG="$NYRA_HOME/gitea/data/gitea/log/gitea.log"
        if [[ -f "$GITEA_LOG" ]]; then
            show_log "Gitea" "$GITEA_LOG" "$YELLOW"
        fi

        # Docker Compose (if following)
        if [[ $FOLLOW -eq 1 ]]; then
            MAIN_APP="$NYRA_HOME/repos/project-nyra"
            if [[ -f "$MAIN_APP/docker-compose.yml" ]]; then
                echo -e "${CYAN}========== Docker Compose (following) ==========${NC}"
                cd "$MAIN_APP"
                docker compose logs -f --tail="$LINES"
            fi
        fi

        # PM2
        if command -v pm2 >/dev/null 2>&1 && pm2 list 2>/dev/null | grep -q "online"; then
            echo -e "${GREEN}========== PM2 Applications ==========${NC}"
            pm2 logs --lines "$LINES" --nostream
        fi

        if [[ $FOLLOW -eq 0 ]]; then
            echo ""
            echo -e "${CYAN}Tip: Use -f to follow logs in real-time${NC}"
            echo -e "${CYAN}     Use -s <service> to filter specific service${NC}"
        fi
        ;;
esac
