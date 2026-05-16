#!/bin/bash
set -e

PROJECT_ROOT="$HOME/projects/project-nyra"
LOG_FILE="/tmp/nyra-deploy.log"

echo "🚀 Project Nyra - Deployment Script" | tee -a $LOG_FILE
echo "================================" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

start_service() {
    local name=$1
    local path=$2
    local port=$3
    local cmd=$4

    echo "📦 Starting: $name (port $port)..." | tee -a $LOG_FILE

    if [ ! -d "$path" ]; then
        echo "  ❌ Directory not found: $path" | tee -a $LOG_FILE
        return 1
    fi

    cd "$path"
    if [ ! -d "node_modules" ]; then
        echo "  📥 Installing dependencies..." | tee -a $LOG_FILE
        npm install >> $LOG_FILE 2>&1
    fi

    tmux new-session -d -s "nyra-$name" -c "$path" "$cmd"
    echo "  ✅ Started in tmux session: nyra-$name" | tee -a $LOG_FILE
    echo "" | tee -a $LOG_FILE
}

echo ">>> CORE SERVICES" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

start_service "landing" "$PROJECT_ROOT/apps/ratehunter/landing" "3001" "npm run dev -- -p 3001"
start_service "webapp" "$PROJECT_ROOT/apps/web/webapp" "3002" "npm run dev -- -p 3002"
start_service "nexus-router" "$PROJECT_ROOT/services/nexus-router" "6000" "npm start"
start_service "orchestrator" "$PROJECT_ROOT/services/nyra-orchestrator" "8000" "npm start"
echo ">>> BACKEND APIs" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

start_service "lead-capture-api" "$PROJECT_ROOT/services/lead-capture-api" "8010" "npm start"
start_service "quote-api" "$PROJECT_ROOT/services/quote-api" "8020" "npm start"
start_service "rate-comparison" "$PROJECT_ROOT/services/rate-comparison-engine" "8030" "npm start"
start_service "campaign-engine" "$PROJECT_ROOT/services/campaign-engine" "8050" "npm start"
start_service "auth-service" "$PROJECT_ROOT/services/auth-service" "8080" "npm start"
start_service "security-service" "$PROJECT_ROOT/services/security-service" "8090" "npm start"

echo ">>> WORKFLOW SERVICES" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

start_service "n8n-workflows" "$PROJECT_ROOT/services/n8n-workflows" "5678" "npm start"
start_service "activepieces" "$PROJECT_ROOT/services/activepieces-flows" "5000" "npm start"

echo "" | tee -a $LOG_FILE
echo "================================" | tee -a $LOG_FILE
echo "✅ Deployment Complete!" | tee -a $LOG_FILE
echo "================================" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "View services: tmux list-sessions" | tee -a $LOG_FILE
echo "View logs: tail -f $LOG_FILE" | tee -a $LOG_FILE
