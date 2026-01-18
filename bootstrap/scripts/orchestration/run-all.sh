#!/usr/bin/env bash
# Project Nyra: Warp & Gemini bootstrap (Linux/macOS). Run from repo root.
set -euo pipefail

echo "==> Checking prerequisites"
command -v docker >/dev/null || { echo "Docker is required. Install Docker Desktop, then retry."; exit 1; }
command -v git >/dev/null || { echo "git is required. Install git, then retry."; exit 1; }

echo "==> Ensuring Node.js >= 20"
if ! command -v node >/dev/null; then
  echo "Installing Node via nvm..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
else
  NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
  if [ "$NODE_MAJOR" -lt 20 ]; then
    echo "Upgrading Node to 20 via nvm..."
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
  fi
fi

echo "==> Installing global CLIs (Gemini CLI, Gemini Flow, Claude Code)"
npm install -g @google/gemini-cli @clduab11/gemini-flow @anthropic-ai/claude-code

echo "==> Python uv (for Serena)"
python3 -m pip install -U uv || true

echo "==> Rust/Cargo check (for Codanna)"
if ! command -v cargo >/dev/null; then
  echo "Rust not found. Installing via rustup (non-interactive)."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  export PATH="$HOME/.cargo/bin:$PATH"
fi
cargo install codanna --locked || true

echo "==> Creating ~/.gemini/settings.json with MCP servers"
mkdir -p "$HOME/.gemini"
cat > "$HOME/.gemini/settings.json" <<'JSON'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y","@modelcontextprotocol/server-filesystem"]
    },
    "serena": {
      "command": "uvx",
      "args": ["--from","git+https://github.com/oraios/serena","serena","start-mcp-server"]
    },
    "codanna": {
      "command": "codanna",
      "args": ["serve","--watch"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y","@microsoft/mcp-server-playwright"]
    }
  },
  "context": {
    "include": ["README.md", "README-SETUP.md", "nyra.flow.yaml"]
  }
}
JSON

echo "==> Setting default MODE and .env"
./scripts/nyra-mode.sh cheap-gemini

echo "==> Starting provider router (LiteLLM) & MCPO"
docker compose -f docker/litellm/docker-compose.yml up -d
docker compose -f docker/mcpo/docker-compose.yml up -d

echo "==> All services started."
echo ""
echo "NEXT STEPS:"
echo "1) Authenticate Gemini CLI (pick ONE):"
echo "   a) OAuth: just run 'gemini' and choose 'Login with Google' in your browser."
echo "   b) Vertex API: export GOOGLE_API_KEY=<key> and GOOGLE_GENAI_USE_VERTEXAI=true then run 'gemini'."
echo "   c) AI Studio API: export GEMINI_API_KEY=<key> then run 'gemini'."
echo "2) Test: gemini -p 'Summarize this repo structure'"
echo "3) Optional: run 'gemini-flow --help' for the orchestration companion."
