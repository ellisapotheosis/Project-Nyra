# ==============================================================================
# DIAGNOSTIC & DEBUGGING UTILITIES
# ==============================================================================

# ==============================================================================
# ENVIRONMENT DOCTOR
# ==============================================================================
nyra-doctor() {
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║              NYRA ENVIRONMENT DIAGNOSTIC                     ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""

  # Shell info
  echo "📋 Shell:"
  echo "  SHELL:    $SHELL"
  echo "  ZSH:      $(zsh --version 2>/dev/null || echo '❌ missing')"
  echo ""

  # Build tools
  echo "🛠️  Build Tools:"
  echo "  Docker:   $(command -v docker >/dev/null && echo '✅' || echo '❌') $(command -v docker || echo missing)"
  echo "  Bun:      $(command -v bun >/dev/null && echo '✅' || echo '❌') $(command -v bun || echo missing)"
  echo "  FNM:      $(command -v fnm >/dev/null && echo '✅' || echo '❌') $(command -v fnm || echo missing)"
  echo "  UV:       $(command -v uv >/dev/null && echo '✅' || echo '❌') $(command -v uv || echo missing)"
  echo ""

  # CLI tools
  echo "🔧 CLI Tools:"
  echo "  gh:       $(command -v gh >/dev/null && echo '✅' || echo '❌') $(command -v gh || echo missing)"
  echo "  Infisical:$(command -v infisical >/dev/null && echo '✅' || echo '❌') $(command -v infisical || echo missing)"
  echo ""

  # Navigation tools
  echo "🚀 Navigation:"
  echo "  Zoxide:   $(command -v zoxide >/dev/null && echo '✅' || echo '❌') $(command -v zoxide || echo missing)"
  echo "  Direnv:   $(command -v direnv >/dev/null && echo '✅' || echo '❌') $(command -v direnv || echo missing)"
  echo ""

  # Syntax check
  echo "✓ Syntax Check:"
  if zsh -n ~/.zshrc 2>&1 | grep -q .; then
    echo "  .zshrc:   ❌ SYNTAX ERROR"
    zsh -n ~/.zshrc
  else
    echo "  .zshrc:   ✅ OK"
  fi
  echo ""

  # Configuration files
  echo "📁 Configuration:"
  echo "  ~/.zshrc:        $(test -f ~/.zshrc && echo '✅' || echo '❌')"
  echo "  ~/.zsh/:         $(test -d ~/.zsh && echo '✅' || echo '❌')"
  echo "  ~/.p10k.zsh:     $(test -f ~/.p10k.zsh && echo '✅' || echo '❌')"
  echo ""
}

# ==============================================================================
# RELOAD PROMPT & THEME
# ==============================================================================
nyra-reload-prompt() {
  echo "🔄 Reloading Powerlevel10k configuration..."
  [[ -r ~/.p10k.zsh ]] && source ~/.p10k.zsh && echo "  ✅ ~/.p10k.zsh"
  [[ -r ~/.p10k.nyra.zsh ]] && source ~/.p10k.nyra.zsh && echo "  ✅ ~/.p10k.nyra.zsh"
  if (( $+functions[p10k] )); then
    p10k reload
    echo "  ✅ Prompt reloaded"
  else
    echo "  ⚠️  p10k not loaded (run: exec zsh)"
  fi
}

# ==============================================================================
# RELOAD ZSH CONFIGURATION
# ==============================================================================
nyra-reload-zsh() {
  echo "🔄 Reloading .zshrc..."
  exec zsh
}
