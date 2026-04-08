#!/bin/bash
# Claude Flow V3 Monitoring Script (Bash)
# Displays real-time status of Claude Flow system

REFRESH_INTERVAL=5
COMPACT=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --compact)
            COMPACT=1
            shift
            ;;
        --interval)
            REFRESH_INTERVAL="$2"
            shift 2
            ;;
        *)
            echo "Usage: $0 [--compact] [--interval SECONDS]"
            exit 1
            ;;
    esac
done

# Colors
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

get_status() {
    npx @claude-flow/cli@latest hooks statusline --json 2>/dev/null
}

display_compact() {
    local status=$1

    echo -e "\n${CYAN}=== Claude Flow V3 Status ===${NC}"

    local branch=$(echo "$status" | jq -r '.user.gitBranch')
    local model=$(echo "$status" | jq -r '.user.modelName')
    echo -e "${WHITE}Branch: $branch | Model: $model${NC}"

    local progress=$(echo "$status" | jq -r '.v3Progress.dddProgress')
    local patterns=$(echo "$status" | jq -r '.v3Progress.patternsLearned')
    echo -e "${YELLOW}V3 Progress: $progress% | Patterns: $patterns${NC}"

    local agents=$(echo "$status" | jq -r '.swarm.activeAgents')
    local max_agents=$(echo "$status" | jq -r '.swarm.maxAgents')
    local memory=$(echo "$status" | jq -r '.system.memoryMB')
    echo -e "${GREEN}Agents: $agents/$max_agents | Memory: ${memory}MB${NC}"

    local sec_status=$(echo "$status" | jq -r '.security.status')
    local cves_fixed=$(echo "$status" | jq -r '.security.cvesFixed')
    local total_cves=$(echo "$status" | jq -r '.security.totalCves')

    if [ "$sec_status" = "SECURE" ]; then
        echo -e "${GREEN}Security: $sec_status | CVEs: $cves_fixed/$total_cves${NC}"
    else
        echo -e "${YELLOW}Security: $sec_status | CVEs: $cves_fixed/$total_cves${NC}"
    fi

    echo -e "${CYAN}============================${NC}\n"
}

display_dashboard() {
    clear

    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║          Claude Flow V3 - Real-Time Monitoring                 ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"

    local status=$(get_status)

    if [ -n "$status" ]; then
        echo -e "\n${YELLOW}📊 System Overview${NC}"
        echo -e "   ${WHITE}User: $(echo "$status" | jq -r '.user.name')${NC}"
        echo -e "   ${WHITE}Branch: $(echo "$status" | jq -r '.user.gitBranch')${NC}"
        echo -e "   ${WHITE}Model: $(echo "$status" | jq -r '.user.modelName')${NC}"

        echo -e "\n${YELLOW}🚀 V3 Implementation Progress${NC}"
        local domains_done=$(echo "$status" | jq -r '.v3Progress.domainsCompleted')
        local total_domains=$(echo "$status" | jq -r '.v3Progress.totalDomains')
        local progress=$(echo "$status" | jq -r '.v3Progress.dddProgress')
        echo -e "   ${WHITE}Domains: $domains_done/$total_domains ($progress%)${NC}"
        echo -e "   ${WHITE}Patterns Learned: $(echo "$status" | jq -r '.v3Progress.patternsLearned')${NC}"
        echo -e "   ${WHITE}Sessions: $(echo "$status" | jq -r '.v3Progress.sessionsCompleted')${NC}"

        echo -e "\n${YELLOW}🔐 Security Status${NC}"
        local sec_status=$(echo "$status" | jq -r '.security.status')
        if [ "$sec_status" = "SECURE" ]; then
            echo -e "   ${GREEN}Status: $sec_status${NC}"
        else
            echo -e "   ${YELLOW}Status: $sec_status${NC}"
        fi
        echo -e "   ${WHITE}CVEs Fixed: $(echo "$status" | jq -r '.security.cvesFixed')/$(echo "$status" | jq -r '.security.totalCves')${NC}"

        echo -e "\n${YELLOW}🐝 Swarm Coordination${NC}"
        echo -e "   ${WHITE}Active Agents: $(echo "$status" | jq -r '.swarm.activeAgents')/$(echo "$status" | jq -r '.swarm.maxAgents')${NC}"

        local coord_active=$(echo "$status" | jq -r '.swarm.coordinationActive')
        if [ "$coord_active" = "true" ]; then
            echo -e "   ${GREEN}Coordination: Active${NC}"
        else
            echo -e "   ${GRAY}Coordination: Inactive${NC}"
        fi

        echo -e "\n${YELLOW}💾 System Resources${NC}"
        echo -e "   ${WHITE}Memory: $(echo "$status" | jq -r '.system.memoryMB') MB${NC}"
        echo -e "   ${WHITE}Context: $(echo "$status" | jq -r '.system.contextPct')%${NC}"
        echo -e "   ${WHITE}Intelligence: $(echo "$status" | jq -r '.system.intelligencePct')%${NC}"
        echo -e "   ${WHITE}Sub-Agents: $(echo "$status" | jq -r '.system.subAgents')${NC}"

        echo -e "\n${GRAY}⏰ Last Updated: $(date +%H:%M:%S)${NC}"
    else
        echo -e "\n${RED}❌ Failed to retrieve status${NC}"
    fi

    echo -e "\n─────────────────────────────────────────────────────────────────"
    echo "Press Ctrl+C to exit | Refreshing every $REFRESH_INTERVAL seconds"
}

# Main monitoring loop
trap 'echo -e "\n\nMonitoring stopped."; exit 0' INT

while true; do
    if [ $COMPACT -eq 1 ]; then
        status=$(get_status)
        if [ -n "$status" ]; then
            display_compact "$status"
        fi
    else
        display_dashboard
    fi

    sleep "$REFRESH_INTERVAL"
done
