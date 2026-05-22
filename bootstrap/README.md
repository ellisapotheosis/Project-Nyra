# Bootstrap

This folder contains the machine bootstrap assets for the Nyra shell and local operator workstation setup.

## Scope

- install or refresh `oh-my-zsh`
- install `powerlevel10k`
- sync `~/.zshrc` and `~/.p10k.zsh`
- provide a repeatable path for bringing another WSL host into the same shell baseline

## Files

- `shell/bootstrap-shell.sh` - install `oh-my-zsh`, `powerlevel10k`, and common plugins
- `shell/sync-dotfiles.sh` - copy repo-managed dotfiles into `$HOME`
- `shell/export-dotfiles.sh` - capture the current local dotfiles back into this repo
- `dotfiles/.zshrc` - repo copy of the active shell config
- `dotfiles/.p10k.zsh` - repo copy of the active Powerlevel10k config
- `wave-ai-llxprt-zellij/` - copy-based WaveTerm/Wave AI, Zellij, LLxprt Code, LLxprt Jefe, Letta, and zsh helper bootstrap package

## Typical usage

On a fresh machine:

```bash
cd ~/repos/project-nyra
bash bootstrap/shell/bootstrap-shell.sh
bash bootstrap/shell/sync-dotfiles.sh
exec zsh
```

To refresh the repo copy from the current machine:

```bash
bash bootstrap/shell/export-dotfiles.sh
```

To install the Wave AI / Zellij / LLxprt operator package:

```bash
bash bootstrap/wave-ai-llxprt-zellij/install.sh
```

To validate that package without changing local files:

```bash
bash bootstrap/wave-ai-llxprt-zellij/install.sh --check
```

See `bootstrap/wave-ai-llxprt-zellij/README.md` for the cross-PC prerequisites,
provider auth steps, and launch commands.
