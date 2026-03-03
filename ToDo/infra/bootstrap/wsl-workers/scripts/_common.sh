#!/usr/bin/env bash
set -euo pipefail
say(){ printf "\n\033[1;36m%s\033[0m\n" "$*"; }
warn(){ printf "\n\033[1;33m%s\033[0m\n" "$*"; }
die(){ printf "\n\033[0;31m%s\033[0m\n" "$*"; exit 1; }

[[ "$(id -u)" == "0" ]] && die "Run as your normal WSL user (not root)."
command -v apt-get >/dev/null 2>&1 || die "apt-get not found (Ubuntu/Debian expected)."

say "Purge broken Antigravity apt lists"
sudo rm -f /etc/apt/sources.list.d/antigravity*.list || true

say "Install core tools"
sudo apt-get update -qq || true
sudo apt-get install -y -qq zsh git curl wget build-essential unzip jq pkg-config libssl-dev fontconfig fd-find ncdu tldr fzf ripgrep zoxide bat || true

command -v batcat >/dev/null 2>&1 && ! command -v bat >/dev/null 2>&1 && sudo ln -sf "$(command -v batcat)" /usr/local/bin/bat || true
command -v fdfind >/dev/null 2>&1 && ! command -v fd >/dev/null 2>&1 && sudo ln -sf "$(command -v fdfind)" /usr/local/bin/fd || true

say "Install eza (best-effort)"
sudo mkdir -p /etc/apt/keyrings
wget -qO /tmp/eza.asc https://raw.githubusercontent.com/eza-community/eza/main/deb.asc || true
if [[ -s /tmp/eza.asc ]]; then
  cat /tmp/eza.asc | sudo gpg --dearmor -o /etc/apt/keyrings/gierens.gpg --yes || true
  echo "deb [signed-by=/etc/apt/keyrings/gierens.gpg] http://deb.gierens.de stable main" | sudo tee /etc/apt/sources.list.d/gierens.list >/dev/null || true
  sudo chmod 644 /etc/apt/keyrings/gierens.gpg /etc/apt/sources.list.d/gierens.list || true
  sudo apt-get update -qq || true
  sudo apt-get install -y -qq eza || true
fi

say "Runtimes: uv, bun, fnm(Node) + pnpm"
curl -LsSf https://astral.sh/uv/install.sh | sh || true
curl -fsSL https://bun.sh/install | bash || true
curl -fsSL https://fnm.vercel.app/install | bash || true
export PATH="$HOME/.local/share/fnm:$PATH"
command -v fnm >/dev/null 2>&1 && eval "$(fnm env)" && fnm use --install-if-missing 22 || true
command -v npm >/dev/null 2>&1 && npm install -g pnpm npm@latest || true
command -v npm >/dev/null 2>&1 && npm install -g claude-flow@alpha @bitwarden/cli gemini-cli || true

say "GH CLI + Infisical"
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg >/dev/null || true
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg || true
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null || true
sudo apt-get update -qq || true
sudo apt-get install -y -qq gh || true
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash || true
sudo apt-get install -y -qq infisical || true

say "SourceGit + lazygit + lazydocker"
wget -qO /tmp/sourcegit.tar.gz https://github.com/sourcegit-scm/sourcegit/releases/latest/download/sourcegit_linux_x64.tar.gz || true
if [[ -s /tmp/sourcegit.tar.gz ]]; then
  sudo mkdir -p /opt/sourcegit
  sudo tar -xzf /tmp/sourcegit.tar.gz -C /opt/sourcegit || true
  sudo ln -sf /opt/sourcegit/sourcegit /usr/local/bin/sourcegit || true
  rm -f /tmp/sourcegit.tar.gz
fi
LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | grep -Po '"tag_name": "v\K[^"]*' || true)
if [[ -n "${LAZYGIT_VERSION:-}" ]]; then
  curl -Lo /tmp/lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz" || true
  [[ -s /tmp/lazygit.tar.gz ]] && tar xf /tmp/lazygit.tar.gz -C /tmp lazygit && sudo install /tmp/lazygit /usr/local/bin/lazygit && rm -f /tmp/lazygit /tmp/lazygit.tar.gz || true
fi
curl -s https://raw.githubusercontent.com/jesseduffield/lazydocker/master/scripts/install_update_linux.sh | bash || true

say "Rust toolchain + Rust CLIs (zellij, bottom, delta, xh, dust, procs) (best-effort)"
if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y || true
  # shellcheck disable=SC1090
  [ -f "$HOME/.cargo/env" ] && source "$HOME/.cargo/env" || true
fi
if command -v cargo >/dev/null 2>&1; then
  cargo install zellij bottom git-delta xh du-dust procs --quiet || true
else
  warn "cargo not available; skipping Rust CLIs."
fi

say "Oh-My-Zsh + plugins (NO theme)"
[[ -d "$HOME/.oh-my-zsh" ]] || sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended || true
PLUGINS_DIR="$HOME/.oh-my-zsh/custom/plugins"
mkdir -p "$PLUGINS_DIR"
clone(){ [[ -d "$PLUGINS_DIR/$1" ]] || git clone --quiet "$2" "$PLUGINS_DIR/$1" 2>/dev/null || true; }
clone zsh-autosuggestions https://github.com/zsh-users/zsh-autosuggestions.git
clone zsh-syntax-highlighting https://github.com/zsh-users/zsh-syntax-highlighting.git
clone fzf-tab https://github.com/Aloxaf/fzf-tab.git
clone zsh-completions https://github.com/zsh-users/zsh-completions.git
clone you-should-use https://github.com/MichaelAquilina/zsh-you-should-use.git
clone zsh-history-substring-search https://github.com/zsh-users/zsh-history-substring-search.git
clone fast-syntax-highlighting https://github.com/zdharma-continuum/fast-syntax-highlighting.git
clone zsh-nix-shell https://github.com/chisui/zsh-nix-shell.git
clone zsh-autopair https://github.com/hlissner/zsh-autopair.git
clone zsh-bat https://github.com/fdellutri/zsh-bat.git
clone git-open https://github.com/paulirish/git-open.git

mkdir -p "$HOME/nyra-workers/snippets" "$HOME/repos"
sudo chown -R "$USER:$USER" "$HOME/repos" 2>/dev/null || true

install -m 0644 "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/snippets/zshrc_nyra_worker_snippet.zsh" "$HOME/nyra-workers/snippets/zshrc_nyra_worker_snippet.zsh" || true

say "Common tooling done."
warn "Optional: add to ~/.zshrc -> source ~/nyra-workers/snippets/zshrc_nyra_worker_snippet.zsh"
