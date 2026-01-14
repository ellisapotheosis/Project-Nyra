#!/bin/bash
# Project Nyra - Unix Quick Launcher
# One-click deployment launcher for Linux/Mac

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Check root privileges
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}ERROR: This script requires root privileges.${NC}"
    echo "Please run with sudo"
    exit 1
fi

show_menu() {
    clear
    echo -e "${CYAN}===================================="
    echo "  Project Nyra Quick Launcher"
    echo -e "====================================${NC}"
    echo ""
    echo "  [1] Launch Bootstrap GUI"
    echo "  [2] Deploy PC1 - Orchestrator"
    echo "  [3] Deploy PC2 - Worker 2 (RTX 3060)"
    echo "  [4] Deploy PC3 - Worker 3 (RTX 5090)"
    echo "  [5] Deploy PC4 - Worker 4 (RTX 3090 Ti)"
    echo "  [6] Run Health Check"
    echo "  [7] Run Daily Backup"
    echo "  [8] Configure Static IP"
    echo "  [9] View Documentation"
    echo "  [0] Exit"
    echo ""
    read -p "Select option: " CHOICE
}

launch_gui() {
    clear
    echo -e "${CYAN}Launching Bootstrap GUI...${NC}"
    echo ""
    cd "$PROJECT_ROOT/bootstrap-gui"

    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi

    echo ""
    echo "Starting GUI..."
    npm run dev &
    echo ""
    echo -e "${GREEN}Bootstrap GUI launched!${NC}"
    echo "Press Enter to return to menu..."
    read
}

deploy_pc1() {
    clear
    echo -e "${CYAN}Deploying PC1 - Orchestrator (Mac Mini)...${NC}"
    echo ""
    echo "This will:"
    echo "  - Configure static IP 10.0.0.1"
    echo "  - Install Docker"
    echo "  - Deploy 8 orchestrator services"
    echo "  - Validate health"
    echo ""
    read -p "Continue? (y/n): " CONFIRM

    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
        return
    fi

    echo ""
    echo "Running bootstrap script..."
    "$PROJECT_ROOT/scripts/bootstrap-orchestrator.sh"

    echo ""
    echo -e "${GREEN}Deployment complete!${NC}"
    echo "Press Enter to continue..."
    read
}

deploy_worker() {
    local worker_role=$1
    local gpu_model=$2

    clear
    echo -e "${CYAN}Deploying $worker_role ($gpu_model)...${NC}"
    echo ""

    case $worker_role in
        worker-2)
            echo "This will:"
            echo "  - Configure static IP 10.0.0.2"
            echo "  - Install Docker + NVIDIA Container Toolkit"
            echo "  - Deploy TwentyCRM, n8n, Dify"
            echo "  - Validate health"
            ;;
        worker-3)
            echo "This will:"
            echo "  - Configure static IP 10.0.0.3"
            echo "  - Install Docker + NVIDIA Container Toolkit"
            echo "  - Deploy Ollama, Neo4j, FalkorDB"
            echo "  - Pull Ollama models (10-15 minutes)"
            echo "  - Validate health"
            echo ""
            echo "NOTE: First-time deployment takes 15-20 minutes (model downloads)"
            ;;
        worker-4)
            echo "This will:"
            echo "  - Configure static IP 10.0.0.4"
            echo "  - Install Docker + NVIDIA Container Toolkit"
            echo "  - Deploy Prometheus, Grafana, Loki"
            echo "  - Validate health"
            ;;
    esac

    echo ""
    read -p "Continue? (y/n): " CONFIRM

    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
        return
    fi

    echo ""
    echo "Running bootstrap script..."
    "$PROJECT_ROOT/scripts/bootstrap-worker.sh" "$worker_role"

    echo ""
    echo -e "${GREEN}Deployment complete!${NC}"
    echo "Press Enter to continue..."
    read
}

health_check() {
    clear
    echo -e "${CYAN}Running comprehensive health check...${NC}"
    echo "Testing all 22 services across 4 PCs..."
    echo ""
    "$PROJECT_ROOT/scripts/health-check-all.sh"

    echo ""
    echo "Press Enter to continue..."
    read
}

backup() {
    clear
    echo -e "${CYAN}Running daily backup...${NC}"
    echo ""
    echo "This will backup:"
    echo "  - PostgreSQL databases (TwentyCRM, n8n, Dify)"
    echo "  - Redis data"
    echo "  - AgentDB vector database"
    echo "  - Environment configuration"
    echo "  - n8n workflows"
    echo "  - Docker volumes"
    echo ""
    read -p "Continue? (y/n): " CONFIRM

    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
        return
    fi

    echo ""
    "$PROJECT_ROOT/scripts/backup-daily.sh"

    echo ""
    echo -e "${GREEN}Backup complete!${NC}"
    echo "Press Enter to continue..."
    read
}

configure_ip() {
    clear
    echo -e "${CYAN}Configure Static IP${NC}"
    echo ""
    echo "Select PC role:"
    echo "  [1] PC1 - Orchestrator (10.0.0.1)"
    echo "  [2] PC2 - Worker 2 (10.0.0.2)"
    echo "  [3] PC3 - Worker 3 (10.0.0.3)"
    echo "  [4] PC4 - Worker 4 (10.0.0.4)"
    echo "  [0] Back"
    echo ""
    read -p "Select PC: " PC_CHOICE

    case $PC_CHOICE in
        1) PC_ROLE="PC1" ;;
        2) PC_ROLE="PC2" ;;
        3) PC_ROLE="PC3" ;;
        4) PC_ROLE="PC4" ;;
        0) return ;;
        *)
            echo -e "${RED}Invalid selection!${NC}"
            sleep 2
            configure_ip
            return
            ;;
    esac

    echo ""
    echo "Configuring $PC_ROLE..."
    "$PROJECT_ROOT/scripts/configure-static-ip.sh" "$PC_ROLE"

    echo ""
    echo "Press Enter to continue..."
    read
}

view_docs() {
    clear
    echo -e "${CYAN}Opening documentation...${NC}"
    echo ""
    echo "Available documentation:"
    echo "  [1] Complete Setup Guide"
    echo "  [2] Master Troubleshooting"
    echo "  [3] Claude Flow Workflows"
    echo "  [4] Version Comparison"
    echo "  [5] Quick Start"
    echo "  [0] Back"
    echo ""
    read -p "Select document: " DOC_CHOICE

    case $DOC_CHOICE in
        1) open "$PROJECT_ROOT/docs/COMPLETE-SETUP-GUIDE.md" || xdg-open "$PROJECT_ROOT/docs/COMPLETE-SETUP-GUIDE.md" ;;
        2) open "$PROJECT_ROOT/docs/MASTER-TROUBLESHOOTING.md" || xdg-open "$PROJECT_ROOT/docs/MASTER-TROUBLESHOOTING.md" ;;
        3) open "$PROJECT_ROOT/docs/workflows/TOP-15-CLAUDE-FLOW-WORKFLOWS.md" || xdg-open "$PROJECT_ROOT/docs/workflows/TOP-15-CLAUDE-FLOW-WORKFLOWS.md" ;;
        4) open "$PROJECT_ROOT/docs/CLAUDE-FLOW-VERSION-COMPARISON.md" || xdg-open "$PROJECT_ROOT/docs/CLAUDE-FLOW-VERSION-COMPARISON.md" ;;
        5) open "$PROJECT_ROOT/NYRA-AIO-Bootstrap/QUICK-START.md" || xdg-open "$PROJECT_ROOT/NYRA-AIO-Bootstrap/QUICK-START.md" ;;
        0) return ;;
        *)
            echo -e "${RED}Invalid selection!${NC}"
            sleep 2
            return
            ;;
    esac

    echo ""
    echo "Document opened in default editor."
    sleep 2
}

# Main loop
while true; do
    show_menu

    case $CHOICE in
        1) launch_gui ;;
        2) deploy_pc1 ;;
        3) deploy_worker "worker-2" "RTX 3060" ;;
        4) deploy_worker "worker-3" "RTX 5090" ;;
        5) deploy_worker "worker-4" "RTX 3090 Ti" ;;
        6) health_check ;;
        7) backup ;;
        8) configure_ip ;;
        9) view_docs ;;
        0)
            clear
            echo -e "${GREEN}Thank you for using Project Nyra Quick Launcher!${NC}"
            echo ""
            echo "For support: support@ratehunter.net"
            echo "GitHub: https://github.com/yourusername/Project-Nyra"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid selection!${NC}"
            sleep 2
            ;;
    esac
done
