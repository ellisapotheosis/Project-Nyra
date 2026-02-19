#!/bin/bash

# NYRA Environment Setup Script (Bun Edition)
# Installs Claude tools, configures WSL, and installs project-nyra
# in BOTH Windows (C:\Dev\Repos) and native WSL (~/projects)

set -e

WSL_USER="ellisapotheosis"
WIN_REPO_BASE="/mnt/c/Dev/Repos"
WSL_REPO_BASE="/home/$WSL_USER/projects"
REPO_NAME="project-nyra"
REPO_URL="https://github.com/ellisapotheosis/project-nyra.git"

echo "🚀 Starting NYRA Environment Setup (Bun, Dual Install)"
echo ""

# ============================================================================
# 1. Install Bun (if missing)
# ============================================================================

if ! command -v bun >/dev/null 2>&1; then
    echo "📦 Bun not found — installing..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
else
    echo "✅ Bun already installed: $(bun --version)"
fi

echo ""

# ============================================================================
# 2. Install Claude Packages (Bun Global)
# ============================================================================

echo "📦 Installing Claude CLI tools..."

bun add -g @anthropic-ai/claude-code
bun add -g claude-flow || echo "  ⚠️  claude-flow not found in registry"

echo "✅ Claude tools installed"
echo ""

# ============================================================================
# 3. Configure Claude Permissions
# ============================================================================

echo "🔐 Configuring Claude permissions..."

mkdir -p ~/.config/claude

cat > ~/.config/claude/config.json << 'EOF'
{
  "permissions": {
    "filesystem": { "read": true, "write": true },
    "network": { "enabled": true },
    "shell": { "enabled": true },
    "bypassAll": true
  },
  "features": {
    "autoApprove": true,
    "dangerMode": true
  }
}
EOF

echo "✅ Claude permissions configured"
echo ""

# ============================================================================
# 4. Ensure Base Directories Exist
# ============================================================================

echo "📂 Preparing base directories..."

mkdir -p "$WIN_REPO_BASE"
mkdir -p "$WSL_REPO_BASE"

echo "  ✅ Windows repo base: $WIN_REPO_BASE"
echo "  ✅ WSL repo base:     $WSL_REPO_BASE"
echo ""

# ============================================================================
# 5. Clone / Update project-nyra (Windows Filesystem)
# ============================================================================

echo "🪟 Setting up project-nyra (Windows filesystem)..."

WIN_TARGET="$WIN_REPO_BASE/$REPO_NAME"

if [ -d "$WIN_TARGET/.git" ]; then
    echo "  ⚠️  Existing repo found — pulling latest changes"
    git -C "$WIN_TARGET" pull
else
    echo "  → Cloning into $WIN_TARGET"
    git clone "$REPO_URL" "$WIN_TARGET"
fi

echo "  ✅ Windows install ready"
echo ""

# ============================================================================
# 6. Clone / Update project-nyra (Native WSL Filesystem)
# ============================================================================

echo "🐧 Setting up project-nyra (WSL filesystem)..."

WSL_TARGET="$WSL_REPO_BASE/$REPO_NAME"

if [ -d "$WSL_TARGET/.git" ]; then
    echo "  ⚠️  Existing repo found — pulling latest changes"
    git -C "$WSL_TARGET" pull
else
    echo "  → Cloning into $WSL_TARGET"
    git clone "$REPO_URL" "$WSL_TARGET"
fi

echo "  ✅ WSL install ready"
echo ""

# ============================================================================
# 7. Summary
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 NYRA Environment Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Installed Repositories:"
echo "  🪟 Windows: $WIN_TARGET"
echo "  🐧 WSL:     $WSL_TARGET"
echo ""
echo "🔧 Next Steps (recommended):"
echo ""
echo "  # Native WSL (fastest, preferred)"
echo "  cd ~/projects/project-nyra"
echo "  bun install"
echo ""
echo "  # Windows filesystem (interop / editors)"
echo "  cd /mnt/c/Dev/Repos/project-nyra"
echo "  bun install"
echo ""
echo "💡 Notes:"
echo "  - Keep node_modules separate (intentional)"
echo "  - Prefer WSL path for dev + performance"
echo "  - Windows path is ideal for IDEs / tooling"
echo ""
