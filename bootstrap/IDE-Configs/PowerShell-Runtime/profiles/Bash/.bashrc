#### ───────────────────────
#### Ellis .bashrc — UV / NVM4W / PNPM only
#### ───────────────────────

if command -v starship >/dev/null 2>&1; then eval "$(starship init bash)"; fi

# ----- PATH hygiene (Windows Git Bash uses /c/... style) -----
# nvm-windows standard dirs (adjust if you chose different roots)
export NVM_HOME="/c/nvm"
export NVM_SYMLINK="/c/nvm4w/nodejs"   # active Node symlink (bin lives here)

# Put active Node and nvm itself early on PATH
pathmunge() { case ":$PATH:" in *":$1:"*) ;; *) PATH="$1:$PATH" ;; esac; }
pathstrip() { PATH="$(printf '%s' "$PATH" | awk -v RS=: -v ORS=: '!seen[$0]++' | sed 's/:$//')"; }

# Remove stale Program Files nodejs (pre-nvm) if present
PATH="$(printf '%s' "$PATH" | sed -e 's#/c/Program Files/nodejs:##g' -e 's#/c/Program Files/nodejs##g')"

pathmunge "$NVM_SYMLINK"
pathmunge "$NVM_HOME"

# pnpm global bin on Windows (Corepack-managed pnpm still drops shims here)
# %LOCALAPPDATA%\pnpm => /c/Users/<you>/AppData/Local/pnpm
export PNPM_GLOBAL_BIN="$HOME/AppData/Local/pnpm"
pathmunge "/c/Users/$USERNAME/AppData/Local/pnpm"

pathstrip
export PATH

# ----- prompt (starship if installed; otherwise simple bash PS1) -----
if command -v starship >/dev/null 2>&1; then
  eval "$(starship init bash)"
else
  PS1='\u@\h:\w$ '
fi

# ----- uv (Astral) -----
# Completions (uv supports `uv generate-shell-completion`)
if command -v uv >/dev/null 2>&1; then
  # cache completion script
  _UVCOMP="$HOME/.cache/uv/bash-completion.sh"
  if [ ! -f "$_UVCOMP" ]; then uv generate-shell-completion bash >"$_UVCOMP" 2>/dev/null || true; fi
  [ -f "$_UVCOMP" ] && source "$_UVCOMP"
fi
# quick helpers
alias py="uv run python"              # run Python via uv
alias venv="uv venv --python 3.12"    # make project venv fast
alias pexec='uv run'                  # run tool via uvx/uv

# ----- Node / pnpm -----
# Ensure pnpm is available (Corepack is the official way)
if ! command -v pnpm >/dev/null 2>&1; then
  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
    corepack prepare pnpm@latest --activate >/dev/null 2>&1 || true
  fi
fi

# nvm-windows convenience
alias node-use-latest='nvm install latest && nvm use latest'
alias node-use-lts='nvm install lts && nvm use lts'
alias npv='node -v && npm -v && pnpm -v && nvm version'

# ----- .env loader (no base Python required) -----
# Usage: dotenv .env   (exports KEY=VALUE lines in current shell)
dotenv() {
  local file="${1:-.env}"
  [ -f "$file" ] || { echo "No $file"; return 1; }
  # ignore comments and blank lines; support KEY="quoted with spaces"
  # shellcheck disable=SC2046
  export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$file" | sed -e 's/^export //' -e 's/#.*$//')
}

# ----- quality-of-life -----
alias ls='ls --color=auto'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline --graph --decorate'
alias reload='source ~/.bashrc'

# fzf/rg integration (if installed)
[ -f "$HOME/.fzf.bash" ] && source "$HOME/.fzf.bash"
export FZF_DEFAULT_COMMAND='rg --files --hidden --glob "!.git/*"'

# editor
export EDITOR='nvim'
export VISUAL='nvim'

# vibes
echo -e "\033[1;36mback in the cockpit, Apotheosis. collapse the wavefunction.\033[0m"
