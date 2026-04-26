nyra-doctor() {
  echo "shell: $SHELL"
  echo "argv0: $0"
  echo "docker: $(command -v docker || echo missing)"
  echo "zsh: $(zsh --version 2>/dev/null || echo missing)"
  echo "gh: $(command -v gh || echo missing)"
  echo "infisical: $(command -v infisical || echo missing)"
  echo "bun: $(command -v bun || echo missing)"
  echo "fnm: $(command -v fnm || echo missing)"
  echo "uv: $(command -v uv || echo missing)"
  echo "zoxide: $(command -v zoxide || echo missing)"
  echo "direnv: $(command -v direnv || echo missing)"
  zsh -n ~/.zshrc && echo ".zshrc syntax: OK" || echo ".zshrc syntax: BAD"
}

nyra-reload-prompt() {
  [[ -r ~/.p10k.zsh ]] && source ~/.p10k.zsh
  [[ -r ~/.p10k.nyra.zsh ]] && source ~/.p10k.nyra.zsh
  (( $+functions[p10k] )) && p10k reload
}
