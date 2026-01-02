$ErrorActionPreference = "Stop"
$env:ANTHROPIC_BASE_URL="http://localhost:4000"
$env:ANTHROPIC_AUTH_TOKEN="local-noauth"

# Requires Node.js + npx
npx claude-flow@latest mcp start
