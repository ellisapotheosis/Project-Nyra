#!/usr/bin/env bash
# Nyra WSL shell setup helper
# - Installs zsh + git
# - Installs oh-my-zsh for user nyra (if present)
# - Sets zsh as default shell for nyra
# - Appends Volta/Claude-Flow aliases to .zshrc

set -e

USER_NAME="nyra"

if ! id "$USER_NAME" >/dev/null 2>&1; then
  echo "[nyra-shell-setup] User '$USER_NAME' not found, skipping shell setup."
  exit 0
fi

echo "[nyra-shell-setup] Updating apt package index..."
sudo apt-get update -y >/dev/null 2>&1 || true

echo "[nyra-shell-setup] Installing zsh and git if needed..."
sudo apt-get install -y zsh git >/dev/null 2>&1 || true

# Install oh-my-zsh non-interactively for nyra
if [ ! -d "/home/$USER_NAME/.oh-my-zsh" ]; then
  echo "[nyra-shell-setup] Installing oh-my-zsh for $USER_NAME..."
  sudo -u "$USER_NAME" bash -c '
    export RUNZSH=no
    export CHSH=no
    export KEEP_ZSHRC=yes
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" || true
  '
else
  echo "[nyra-shell-setup] oh-my-zsh already present for $USER_NAME."
fi

# Set default shell to zsh for nyra
if command -v chsh >/dev/null 2>&1; then
  echo "[nyra-shell-setup] Setting default shell to zsh for $USER_NAME..."
  sudo chsh -s /usr/bin/zsh "$USER_NAME" || true
fi

ZSHRC="/home/$USER_NAME/.zshrc"
if [ ! -f "$ZSHRC" ]; then
  sudo -u "$USER_NAME" touch "$ZSHRC"
fi

# Append Nyra-specific configuration if not already present
grep -q "# Nyra WSL Zsh configuration" "$ZSHRC" 2>/dev/null || sudo bash -c "cat >> '$ZSHRC' <<'EOF'

# Nyra WSL Zsh configuration
export VOLTA_HOME="\$HOME/.volta"
export PATH="\$VOLTA_HOME/bin:\$PATH"

# Helpful aliases for Claude-Flow in WSL
alias cf-init='npx claude-flow@alpha init --sparc'
alias cf-swarm='npx claude-flow@alpha swarm'

EOF"

sudo chown "$USER_NAME:$USER_NAME" "$ZSHRC"

echo "[nyra-shell-setup] Shell setup for $USER_NAME complete."
