[[ $- != *i* ]] && return

if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

export NYRA_SAFE_MODE="${NYRA_SAFE_MODE:-0}"
export ZSH="${ZSH:-$HOME/.oh-my-zsh}"

for f in "$HOME"/.zsh/*.zsh(N); do
  if [[ -L "$f" && ! -e "$f" ]]; then
    print -u2 -- "Skipping broken zsh symlink: $f -> $(readlink "$f" 2>/dev/null)"
    continue
  fi
  [[ -r "$f" ]] && source "$f"
done
unset f
