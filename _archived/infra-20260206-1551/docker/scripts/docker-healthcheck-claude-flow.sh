#!/bin/bash
# Health check for claude-flow container
# Checks multiple endpoints to ensure service is healthy

set -e

# Function to check if a port is listening
check_port() {
  local host=$1
  local port=$2
  timeout 2 bash -c "cat < /dev/null > /dev/tcp/$host/$port" 2>/dev/null
  return $?
}

# Check if MCP server is responding
MCP_PORT=${MCP_PORT:-3000}

# Method 1: Try claude-flow status command
if npx @claude-flow/cli@latest status --format json 2>/dev/null | jq -e '.healthy == true' >/dev/null 2>&1; then
  echo "Health check passed: CLI status healthy"
  exit 0
fi

# Method 2: Check if MCP port is listening
if check_port localhost "$MCP_PORT"; then
  # Try to hit health endpoint if available
  if curl -f -s "http://localhost:${MCP_PORT}/health" >/dev/null 2>&1; then
    echo "Health check passed: HTTP health endpoint responding"
    exit 0
  elif curl -f -s "http://localhost:${MCP_PORT}/" >/dev/null 2>&1; then
    echo "Health check passed: MCP server responding"
    exit 0
  else
    echo "Health check passed: Port listening"
    exit 0
  fi
fi

# Method 3: Check if process is running
if pgrep -f "claude-flow.*mcp.*start" >/dev/null 2>&1; then
  echo "Health check passed: Process running"
  exit 0
fi

# All checks failed
echo "Health check FAILED: Service not responding"
exit 1
